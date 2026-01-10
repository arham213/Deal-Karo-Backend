import { Expo } from 'expo-server-sdk';
import UserModel from '../models/user.js';

const expo = new Expo();

export default function formatPrice(num) {
    const toOneDecimal = (n) => parseFloat(n.toFixed(1)).toString();

    if (num >= 1_00_00_000) {
        return toOneDecimal(num / 1_00_00_000) + " Crore";
    }
    if (num >= 1_00_000) {
        return toOneDecimal(num / 1_00_000) + " Lacs";
    }
    if (num >= 1_000) {
        return toOneDecimal(num / 1_000) + " K";
    }
    return toOneDecimal(num);
}

export async function sendNewListingNotifications(listing, creatorId) {
    console.log('📢 [NOTIFICATION] Starting notification process for new listing:', listing._id);

    try {
        // Get all users EXCEPT the creator who have device tokens
        const users = await UserModel.find({
            _id: { $ne: creatorId },
            'deviceTokens.0': { $exists: true }
        });

        console.log(`📢 [NOTIFICATION] Found ${users.length} user(s) with device tokens`);

        const messages = [];
        let validTokenCount = 0;
        let invalidTokenCount = 0;

        for (const user of users) {
            console.log(`📢 [NOTIFICATION] Processing user: ${user.name} (${user._id})`);

            for (const device of user.deviceTokens) {
                // Check if token is valid Expo push token
                if (!Expo.isExpoPushToken(device.token)) {
                    console.log(`❌ [NOTIFICATION] Invalid token for user ${user.name}: ${device.token}`);
                    invalidTokenCount++;
                    continue;
                }

                validTokenCount++;
                console.log(`✅ [NOTIFICATION] Valid token found for user ${user.name} on ${device.platform}`);

                messages.push({
                    to: device.token,
                    sound: 'default',
                    title: 'New Listing Added!',
                    body: `${listing.listingType.charAt(0).toUpperCase() + listing.listingType.slice(1)} ${listing.propertyType.charAt(0).toUpperCase() + listing.propertyType.slice(1)} in ${listing.phase}, ${listing.block} - Rs. ${formatPrice(listing.price)}`,
                    data: {
                        type: 'new_listing',
                        propertyId: listing._id.toString() // For deep linking to property details
                    },
                    channelId: 'new-listings',
                });
            }
        }

        console.log(`📢 [NOTIFICATION] Summary: ${validTokenCount} valid tokens, ${invalidTokenCount} invalid tokens`);
        console.log(`📢 [NOTIFICATION] Preparing to send ${messages.length} notification(s)`);

        if (messages.length === 0) {
            console.log('⚠️ [NOTIFICATION] No valid tokens found. No notifications sent.');
            return;
        }

        // Send in chunks (Expo allows max 100 per request)
        const chunks = expo.chunkPushNotifications(messages);
        console.log(`📢 [NOTIFICATION] Split into ${chunks.length} chunk(s)`);

        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            try {
                console.log(`📢 [NOTIFICATION] Sending chunk ${i + 1}/${chunks.length} with ${chunk.length} notification(s)...`);
                const ticketChunk = await expo.sendPushNotificationsAsync(chunk);

                // Log each ticket result
                ticketChunk.forEach((ticket, index) => {
                    if (ticket.status === 'ok') {
                        successCount++;
                        console.log(`✅ [NOTIFICATION] Ticket ${index + 1}: SUCCESS - ID: ${ticket.id}`);
                    } else if (ticket.status === 'error') {
                        errorCount++;
                        console.error(`❌ [NOTIFICATION] Ticket ${index + 1}: ERROR - ${ticket.message}`);
                        if (ticket.details) {
                            console.error(`   Details:`, ticket.details);
                        }
                    }
                });
            } catch (error) {
                errorCount += chunk.length;
                console.error(`❌ [NOTIFICATION] Failed to send chunk ${i + 1}:`, error.message);
                if (error.stack) {
                    console.error(`   Stack:`, error.stack);
                }
            }
        }

        console.log(`📢 [NOTIFICATION] Final Results: ${successCount} successful, ${errorCount} failed`);

    } catch (error) {
        console.error('❌ [NOTIFICATION] Critical error in sendNewListingNotifications:', error.message);
        if (error.stack) {
            console.error('   Stack:', error.stack);
        }
    }
}
