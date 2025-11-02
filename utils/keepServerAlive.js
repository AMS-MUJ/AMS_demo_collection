import axios from 'axios';
import cron from 'node-cron';

class KeepAliveService {
 constructor(serverUrl, interval = 14) {
  this.serverUrl = serverUrl;
  this.interval = interval; // minutes
  this.isEnabled = process.env.ENABLE_KEEP_ALIVE === 'true';
  this.pingCount = 0;
  this.cronJob = null; // Will store the scheduled cron task
 }

 /**
  * The internal method that performs the HTTP ping.
  */
 async _pingServer() {
  if (!this.isEnabled) {
   console.log("KeepAliveService: Ping skipped (service is disabled).");
   return;
  }

  this.pingCount++;
  console.log(`KeepAliveService: Pinging ${this.serverUrl} (Count: ${this.pingCount})`);

  try {
   const response = await axios.get(this.serverUrl);
   console.log(`KeepAliveService: Ping successful. Status: ${response.status}`);
  } catch (error) {
   console.error(`KeepAliveService: Ping failed for ${this.serverUrl}.`);
   if (error.response) {
    // The request was made and the server responded with a status code
    console.error(`  L Server responded with Status: ${error.response.status}`);
   } else if (error.request) {
    // The request was made but no response was received
    console.error(` L No response received from server. ${error.message}`);
   } else {
    // Something else happened
    console.error(` L Error: ${error.message}`);
   }
  }
 }

 /**
  * Starts the cron job to ping the server at the specified interval.
  */
 start() {
  if (!this.isEnabled) {
   console.log("KeepAliveService: Service is disabled (ENABLE_KEEP_ALIVE is not 'true'). Will not start.");
   return;
  }

  if (this.cronJob) {
   console.log("KeepAliveService: Service is already running.");
   return;
  }

  // This line MUST be here, before the console.log and cron.schedule
  const cronSchedule = `*/${Math.floor(this.interval)} * * * *`;

  console.log(`KeepAliveService: Starting service. Pinging ${this.serverUrl} every ${this.interval} minutes.`);
  
  // We must .bind(this) to ensure the `_pingServer` method
  // has the correct `this` context when called by the scheduler.
  this.cronJob = cron.schedule(cronSchedule, this._pingServer.bind(this), {
   scheduled: true // Start the job immediately
  });
 }

 /**
  * Stops the scheduled cron job.
  */
 stop() {
  if (this.cronJob) {
   this.cronJob.stop();
   this.cronJob = null;
   console.log("KeepAliveService: Service stopped.");
  } else {
   console.log("KeepAliveService: Service is not running.");
  }
 }
}

// Export the class for use in other files
export default KeepAliveService;
