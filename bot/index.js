#!/usr/bin/env node

/**
 * Asteroid Multi-Account Swarm CLI Runner (Supports Standard & X Premium Long-Form)
 */

const SwarmOrchestrator = require('./swarm');
const SwarmScheduler = require('./scheduler');
const QueueManager = require('./queue');

const args = process.argv.slice(2);

function showHelp() {
  console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║         ASTEROID MULTI-ACCOUNT X SWARM BOT (CLI RUNNER)              ║
╚══════════════════════════════════════════════════════════════════════╝

Usage:
  node bot/index.js [command] [options]

Commands:
  --dry-run             Run a full simulation (Master post + Clone replies) without calling X API
  --post-now            Immediately execute 1 live Swarm session (Master post + Clones seeding)
  --schedule [hours]    Start continuous background scheduler (default: 3 hours)
  --status              Display queue progress, remaining posts, and seeding statistics
  --help                Show this help message

Options:
  --premium             Force Master account to post from X Premium Long-Form dataset (unlimited chars)

Configuration:
  Configure your accounts in 'accounts.config.json'
  (Master account + unlimited clone accounts with custom delay bounds)
`);
}

async function main() {
  const isPremium = args.includes('--premium');

  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  if (args.includes('--status')) {
    const queue = new QueueManager();
    const stats = queue.getStats();
    console.log('\n📊 [ASTEROID SWARM STATS]');
    console.log(`--------------------------------------------------------`);
    console.log(`📝 Standard Posts in Library (<= 280) : ${stats.totalPosts}`);
    console.log(`💎 X Premium Long-Form Posts in Library: ${stats.totalPremium}`);
    console.log(`💬 Total Comments in Library          : ${stats.totalComments}`);
    console.log(`✅ Posts Published (Current Cycle)    : ${stats.postedCount}`);
    console.log(`⏳ Total Posts Remaining in Cycle     : ${stats.remainingCount}`);
    console.log(`🚀 Total Swarm Sessions Completed     : ${stats.totalSessions}`);
    console.log(`🤖 Total Seeding Replies Dispatched   : ${stats.totalReplies}`);
    console.log(`📌 Next Standard Post ID              : ${stats.nextStandardPostId || 'None'}`);
    console.log(`📌 Next Premium Post ID               : ${stats.nextPremiumPostId || 'None'}`);
    console.log(`--------------------------------------------------------\n`);
    return;
  }

  if (args.includes('--dry-run')) {
    const orchestrator = new SwarmOrchestrator({ isDryRun: true, isPremium });
    await orchestrator.runEngagementSession();
    return;
  }

  if (args.includes('--post-now')) {
    const orchestrator = new SwarmOrchestrator({ isDryRun: false, isPremium });
    await orchestrator.runEngagementSession();
    return;
  }

  if (args.includes('--schedule')) {
    const hoursIndex = args.indexOf('--schedule') + 1;
    const hours = (hoursIndex < args.length && !args[hoursIndex].startsWith('--')) 
      ? parseFloat(args[hoursIndex]) 
      : 3;
    const isDryRun = args.includes('--dry-run');
    const scheduler = new SwarmScheduler({ intervalHours: hours, isDryRun, isPremium });
    scheduler.start();
    return;
  }

  // Default action: run dry-run
  console.log('No command specified. Running in --dry-run simulation mode...\n');
  const orchestrator = new SwarmOrchestrator({ isDryRun: true, isPremium });
  await orchestrator.runEngagementSession();
}

main().catch(err => {
  console.error('\n❌ Fatal Error:', err.message);
});
