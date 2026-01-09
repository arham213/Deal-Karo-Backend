// scheduler.js
import cron from 'node-cron';
import { Property } from '../models/index.js';

const startCronJobs = () => {
  // Schedule: 11:59 PM every Saturday
  // Syntax:  Min  Hour  Day(Month)  Month  Day(Week)
  cron.schedule('59 23 * * 6', async () => {
    console.log('⏳ Starting scheduled cleanup: Deleting all properties...');

    try {
      // deleteMany({}) with an empty object deletes ALL documents
      const result = await Property.deleteMany({});
      
      console.log(`✅ Cleanup successful. Deleted ${result.deletedCount} properties.`);
    } catch (error) {
      console.error('❌ Error during property cleanup:', error);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Karachi" // Optional: Set to your preferred timezone
  });
};

export default startCronJobs;