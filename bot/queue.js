/**
 * Queue & History Manager (Supports X Premium Long-Form Posts)
 */

const fs = require('fs');
const path = require('path');

class QueueManager {
  constructor(projectDir) {
    this.projectDir = projectDir || path.resolve(__dirname, '..');
    this.historyFile = path.join(this.projectDir, 'history.json');
    this.data = this.loadData();
    this.history = this.loadHistory();
  }

  loadData() {
    const dataPath = path.join(this.projectDir, 'data.js');
    const content = fs.readFileSync(dataPath, 'utf8');
    const sandbox = new Function(content + '; return ASTEROID_DATA;')();
    return sandbox;
  }

  loadHistory() {
    if (fs.existsSync(this.historyFile)) {
      try {
        return JSON.parse(fs.readFileSync(this.historyFile, 'utf8'));
      } catch (e) {
        return { postedPostIds: [], sessions: [] };
      }
    }
    return { postedPostIds: [], sessions: [] };
  }

  saveHistory() {
    fs.writeFileSync(this.historyFile, JSON.stringify(this.history, null, 2), 'utf8');
  }

  getNextPost(isPremium = false) {
    const allPosts = isPremium && this.data.xPremiumPosts && this.data.xPremiumPosts.length > 0 
      ? this.data.xPremiumPosts 
      : this.data.xPosts;
      
    const postedIds = new Set(this.history.postedPostIds || []);

    let nextPost = allPosts.find(p => !postedIds.has(p.id));

    if (!nextPost) {
      console.log('🔄 All posts in current pool have been posted! Resetting queue cycle.');
      this.history.postedPostIds = [];
      this.saveHistory();
      nextPost = allPosts[0];
    }

    return nextPost;
  }

  getAllComments() {
    return this.data.kolComments;
  }

  recordSession(session) {
    if (!this.history.postedPostIds) this.history.postedPostIds = [];
    if (!this.history.sessions) this.history.sessions = [];

    this.history.postedPostIds.push(session.postId);
    this.history.sessions.push(session);
    this.saveHistory();
  }

  getStats() {
    const totalPosts = this.data.xPosts.length;
    const totalComments = this.data.kolComments.length;
    const totalPremium = (this.data.xPremiumPosts || []).length;
    const postedCount = (this.history.postedPostIds || []).length;
    const remainingCount = totalPosts + totalPremium - postedCount;
    const totalSessions = (this.history.sessions || []).length;
    const totalReplies = (this.history.sessions || []).reduce((acc, s) => acc + (s.replies ? s.replies.length : 0), 0);

    return {
      totalPosts,
      totalComments,
      totalPremium,
      postedCount,
      remainingCount,
      totalSessions,
      totalReplies,
      nextStandardPostId: this.getNextPost(false)?.id,
      nextPremiumPostId: this.getNextPost(true)?.id
    };
  }
}

module.exports = QueueManager;
