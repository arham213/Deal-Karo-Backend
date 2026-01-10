import mongoose from 'mongoose';
import dotenv from 'dotenv';
import UserModel from './src/models/user.js';

// Load environment variables
dotenv.config();

async function removeDuplicateTokens() {
    try {
        console.log('🔧 [CLEANUP] Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ [CLEANUP] Connected to database');

        // Find all users with at least one device token
        const users = await UserModel.find({ 'deviceTokens.0': { $exists: true } });
        console.log(`📊 [CLEANUP] Found ${users.length} user(s) with device tokens`);

        let totalDuplicatesRemoved = 0;

        for (const user of users) {
            const originalCount = user.deviceTokens.length;

            // Remove duplicates by keeping only unique tokens
            const uniqueTokens = [];
            const seenTokens = new Set();

            for (const deviceToken of user.deviceTokens) {
                if (!seenTokens.has(deviceToken.token)) {
                    seenTokens.add(deviceToken.token);
                    uniqueTokens.push(deviceToken);
                }
            }

            const duplicatesCount = originalCount - uniqueTokens.length;

            if (duplicatesCount > 0) {
                user.deviceTokens = uniqueTokens;
                await user.save();
                totalDuplicatesRemoved += duplicatesCount;
                console.log(`✅ [CLEANUP] User ${user.name}: Removed ${duplicatesCount} duplicate(s) (${originalCount} → ${uniqueTokens.length})`);
            } else {
                console.log(`✓ [CLEANUP] User ${user.name}: No duplicates found`);
            }
        }

        console.log('\n🎉 [CLEANUP] Cleanup completed successfully!');
        console.log(`📊 [CLEANUP] Total duplicates removed: ${totalDuplicatesRemoved}`);

        await mongoose.connection.close();
        console.log('✅ [CLEANUP] Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ [CLEANUP] Error during cleanup:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

// Run the cleanup
removeDuplicateTokens();
