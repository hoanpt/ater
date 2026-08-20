/**
 * Master-Worker Swarm Orchestrator
 * Coordinates Main post and delayed Clone comments
 */

const fs = require('fs');
const path = require('path');
const TwitterClient = require('./twitter_client');
const QueueManager = require('./queue');
const Matcher = require('./matcher');

class SwarmOrchestrator {
  constructor(options = {}) {
    this.projectDir = options.projectDir || path.resolve(__dirname, '..');
    this.configFile = path.join(this.projectDir, 'accounts.config.json');
    this.config = this.loadConfig();
    this.queue = new QueueManager(this.projectDir);
    this.isDryRun = options.isDryRun || false;

    this.masterClient = new TwitterClient(this.config.master);
    this.cloneClients = (this.config.clones || []).map(c => ({
      client: new TwitterClient(c),
      config: c
    }));
  }

  loadConfig() {
    if (!fs.existsSync(this.configFile)) {
      const exampleFile = path.join(this.projectDir, 'accounts.config.example.json');
      if (fs.existsSync(exampleFile)) {
        return JSON.parse(fs.readFileSync(exampleFile, 'utf8'));
      }
      throw new Error('Missing accounts.config.json. Please create one based on accounts.config.example.json.');
    }
    return JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
  }

  // Generates randomized delay in milliseconds
  calculateDelay(minMinutes, maxMinutes) {
    const min = minMinutes || 2;
    const max = maxMinutes || 8;
    const minutes = min + Math.random() * (max - min);
    return Math.round(minutes * 60 * 1000);
  }

  async runEngagementSession() {
    const post = this.queue.getNextPost();
    if (!post) {
      console.log('❌ No post available in queue.');
      return;
    }

    console.log('\n======================================================');
    console.log(`🚀 [SWARM SESSION START] ${new Date().toISOString()}`);
    console.log(`📌 Post ID: ${post.id} | Topic: ${post.category.toUpperCase()}`);
    console.log(`📝 Title: ${post.title}`);
    console.log(`🤖 Mode: ${this.isDryRun ? 'DRY-RUN (SIMULATION)' : 'LIVE EXECUTION'}`);
    console.log('======================================================\n');

    // Step 1: Master Account Posts
    console.log(`[1/3] 👑 Master Account [@${this.config.master.name}] posting main tweet...`);
    const masterResult = await this.masterClient.postTweet(post.content, this.isDryRun);

    if (!masterResult.success) {
      console.error(`❌ Master post failed:`, masterResult.error);
      return;
    }

    const tweetId = masterResult.data.id;
    console.log(`✅ Master Tweet published successfully!`);
    console.log(`   Tweet ID: ${tweetId}`);
    console.log(`   Preview: "${post.content.slice(0, 80).replace(/\n/g, ' ')}..."\n`);

    // Step 2: Match comments for each clone
    const cloneCount = this.cloneClients.length;
    console.log(`[2/3] 🔍 Matching contextual comments for ${cloneCount} clone accounts...`);
    const matchedComments = Matcher.getMatchingComments(post, this.queue.getAllComments(), cloneCount);

    const plannedReplies = [];

    // Step 3: Plan timeline for each clone
    console.log('\n📅 [TIMELINE SCHEDULE FOR CLONES]');
    this.cloneClients.forEach((cloneObj, index) => {
      const comment = matchedComments[index] || matchedComments[0];
      const delayMs = this.calculateDelay(cloneObj.config.minDelayMinutes, cloneObj.config.maxDelayMinutes);
      const delayMins = (delayMs / 60000).toFixed(1);

      plannedReplies.push({
        cloneObj,
        comment,
        delayMs,
        delayMins
      });

      console.log(`   🤖 Clone ${index + 1}: [@${cloneObj.config.name}]`);
      console.log(`      ⏱️  Delay: ${delayMins} mins (between ${cloneObj.config.minDelayMinutes}-${cloneObj.config.maxDelayMinutes}m)`);
      console.log(`      💬 Comment: "${comment.content.slice(0, 70).replace(/\n/g, ' ')}..."`);
    });

    console.log('\n[3/3] ⏳ Executing scheduled clone engagement...');

    const sessionHistory = {
      sessionId: 'session_' + Date.now(),
      postId: post.id,
      postTitle: post.title,
      postCategory: post.category,
      tweetId: tweetId,
      timestamp: new Date().toISOString(),
      replies: []
    };

    if (this.isDryRun) {
      // In dry-run, simulate instant execution for testing
      for (const item of plannedReplies) {
        console.log(`\n   [DRY-RUN SIMULATION] ⏳ Fast-forwarding ${item.delayMins} minutes...`);
        console.log(`   🤖 [@${item.cloneObj.config.name}] replies to Tweet #${tweetId}`);
        const replyResult = await item.cloneObj.client.replyTweet(item.comment.content, tweetId, true);
        console.log(`   ✅ Mock Reply ID: ${replyResult.data.id}`);

        sessionHistory.replies.push({
          cloneName: item.cloneObj.config.name,
          commentId: item.comment.id,
          delayMinutes: parseFloat(item.delayMins),
          replyTweetId: replyResult.data.id,
          timestamp: new Date().toISOString()
        });
      }

      this.queue.recordSession(sessionHistory);
      console.log('\n🎉 [SWARM SESSION SIMULATION COMPLETE]');
      console.log(`📊 All ${plannedReplies.length} clones successfully stimulated and recorded to history.json!\n`);
      return sessionHistory;
    } else {
      // In live execution, schedule actual setTimeout timers
      plannedReplies.forEach((item) => {
        setTimeout(async () => {
          console.log(`\n⏰ Timer triggered: [@${item.cloneObj.config.name}] posting scheduled reply...`);
          const replyResult = await item.cloneObj.client.replyTweet(item.comment.content, tweetId, false);
          if (replyResult.success) {
            console.log(`✅ [@${item.cloneObj.config.name}] Reply published! ID: ${replyResult.data.id}`);
          } else {
            console.error(`❌ [@${item.cloneObj.config.name}] Reply failed:`, replyResult.error);
          }
        }, item.delayMs);
      });

      this.queue.recordSession(sessionHistory);
      console.log(`\n🚀 Master tweet live and all ${plannedReplies.length} clone timers active in background!\n`);
      return sessionHistory;
    }
  }
}

module.exports = SwarmOrchestrator;
