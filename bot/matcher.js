/**
 * Contextual Comment Matcher
 * Matches Master Post topic with relevant KOL comments for Clones
 */

class Matcher {
  static getMatchingComments(post, allComments, cloneCount) {
    const postCategory = post.category || 'spacex';

    // 1. Filter comments by matching style/category first
    let primaryPool = allComments.filter(c => c.style === postCategory);

    // 2. Fallback secondary pool
    let fallbackPool = allComments.filter(c => c.style !== postCategory);

    // Shuffle both pools
    const shuffledPrimary = [...primaryPool].sort(() => 0.5 - Math.random());
    const shuffledFallback = [...fallbackPool].sort(() => 0.5 - Math.random());

    const combinedPool = [...shuffledPrimary, ...shuffledFallback];

    // Pick unique comments up to cloneCount
    const selectedComments = combinedPool.slice(0, cloneCount);

    return selectedComments;
  }
}

module.exports = Matcher;
