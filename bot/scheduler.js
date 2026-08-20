/**
 * Swarm Scheduler Daemon
 * Periodically triggers Swarm sessions with randomized interval jitter
 */

const SwarmOrchestrator = require('./swarm');

class SwarmScheduler {
  constructor(options = {}) {
    this.intervalHours = options.intervalHours || 3;
    this.jitterMinutes = options.jitterMinutes || 15;
    this.isDryRun = options.isDryRun || false;
    this.orchestrator = new SwarmOrchestrator({ isDryRun: this.isDryRun });
    this.timer = null;
    this.isRunning = false;
  }

  getNextIntervalMs() {
    const baseMs = this.intervalHours * 60 * 60 * 1000;
    const jitterMs = (Math.random() * 2 - 1) * this.jitterMinutes * 60 * 1000;
    return Math.max(60000, baseMs + jitterMs); // At least 1 minute
  }

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;

    console.log('\n======================================================');
    console.log('🤖 ASTEROID MULTI-ACCOUNT SWARM SCHEDULER STARTED');
    console.log(`⏰ Base Interval: Every ${this.intervalHours} hours (± ${this.jitterMinutes}m jitter)`);
    console.log(`🛡️ Mode: ${this.isDryRun ? 'DRY-RUN (SIMULATION)' : 'LIVE PRODUCTION'}`);
    console.log('======================================================\n');

    // Run first session immediately
    await this.orchestrator.runEngagementSession();

    // Schedule next
    this.scheduleNext();
  }

  scheduleNext() {
    if (!this.isRunning) return;

    const delayMs = this.getNextIntervalMs();
    const nextTime = new Date(Date.now() + delayMs);
    const delayMins = (delayMs / 60000).toFixed(1);

    console.log(`\n⏳ Next Swarm Session scheduled in ${delayMins} minutes (at ${nextTime.toLocaleTimeString()})...\n`);

    this.timer = setTimeout(async () => {
      await this.orchestrator.runEngagementSession();
      this.scheduleNext();
    }, delayMs);
  }

  stop() {
    if (this.timer) clearTimeout(this.timer);
    this.isRunning = false;
    console.log('🛑 Swarm Scheduler stopped.');
  }
}

module.exports = SwarmScheduler;
