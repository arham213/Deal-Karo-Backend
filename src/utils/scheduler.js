// scheduler.js
import cron from 'node-cron';
import { Property, Message, Chat } from '../models/index.js';
import { del } from '@vercel/blob';

/**
 * Delete image/voice from Vercel Blob storage
 * @param {string} url - The blob URL to delete
 */
const deleteFromBlob = async (url) => {
  try {
    if (url && url.includes('blob.vercel-storage.com')) {
      await del(url);
      console.log(`🗑️ Deleted from Blob: ${url}`);
    }
  } catch (error) {
    console.error(`❌ Failed to delete from Blob: ${url}`, error.message);
  }
};

/**
 * Cleanup ALL listings (runs every 15 days)
 * Deletes all property documents and their images from Vercel Blob
 */
const cleanupAllListings = async () => {
  console.log('⏳ Starting scheduled cleanup: Deleting ALL listings...');

  try {
    // Find all properties with images
    const allProperties = await Property.find({});

    console.log(`📋 Found ${allProperties.length} listings to delete`);

    // Delete images from Vercel Blob
    for (const property of allProperties) {
      if (property.imageUrl) {
        await deleteFromBlob(property.imageUrl);
      }
    }

    // Delete all properties from database
    const result = await Property.deleteMany({});

    console.log(`✅ Listings cleanup successful. Deleted ${result.deletedCount} properties.`);
  } catch (error) {
    console.error('❌ Error during listings cleanup:', error);
  }
};

/**
 * Cleanup ALL messages (runs daily at midnight)
 * Deletes all messages and their images/voice files from Vercel Blob
 * Keeps chats but removes all messages
 */
const cleanupAllMessages = async () => {
  console.log('⏳ Starting scheduled cleanup: Deleting ALL messages...');

  try {
    // Find all messages with media
    const allMessages = await Message.find({});

    console.log(`📋 Found ${allMessages.length} messages to delete`);

    // Delete images/voice files from Vercel Blob
    for (const message of allMessages) {
      if (message.type === 'image' || message.type === 'voice') {
        await deleteFromBlob(message.content);
      }
    }

    // Delete all messages from database
    const result = await Message.deleteMany({});

    console.log(`✅ Messages cleanup successful. Deleted ${result.deletedCount} messages.`);

    // Reset lastMessage for all chats
    await Chat.updateMany({}, { lastMessage: null });

    console.log(`✅ Reset lastMessage for all chats.`);
  } catch (error) {
    console.error('❌ Error during messages cleanup:', error);
  }
};

const startCronJobs = () => {
  console.log('🕐 Starting scheduled cleanup jobs...');

  // Listings cleanup: Run every 15 days at midnight
  // Cron: "0 0 1,16 * *" = At 00:00 on day 1 and 16 of every month (approximately every 15 days)
  cron.schedule('0 0 1,16 * *', async () => {
    await cleanupAllListings();
  }, {
    scheduled: true,
    timezone: "Asia/Karachi"
  });
  console.log('📅 Listings cleanup job scheduled: Every 15 days (1st and 16th of each month at midnight)');

  // Messages cleanup: Run daily at 11:59 PM (end of day)
  cron.schedule('59 23 * * *', async () => {
    await cleanupAllMessages();
  }, {
    scheduled: true,
    timezone: "Asia/Karachi"
  });
  console.log('📅 Messages cleanup job scheduled: Daily at 11:59 PM (complete wipe)');
};

export default startCronJobs;