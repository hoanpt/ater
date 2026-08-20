/**
 * Twitter API v2 Client (Zero-Dependency, Native Node.js)
 * Supports OAuth 1.0a authentication for POST /2/tweets
 */

const crypto = require('crypto');
const https = require('https');

class TwitterClient {
  constructor(accountConfig) {
    this.name = accountConfig.name || 'Account';
    this.appKey = accountConfig.appKey || '';
    this.appSecret = accountConfig.appSecret || '';
    this.accessToken = accountConfig.accessToken || '';
    this.accessSecret = accountConfig.accessSecret || '';
  }

  isMockMode() {
    return !this.appKey || 
           this.appKey.startsWith('YOUR_') || 
           !this.accessToken || 
           this.accessToken.startsWith('YOUR_');
  }

  // Generates OAuth 1.0a authorization header
  generateOAuthHeader(method, url, extraParams = {}) {
    const oauthParams = {
      oauth_consumer_key: this.appKey,
      oauth_nonce: crypto.randomBytes(16).toString('hex'),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_token: this.accessToken,
      oauth_version: '1.0',
      ...extraParams
    };

    // Collect all parameters for signature base
    const sortedKeys = Object.keys(oauthParams).sort();
    const paramString = sortedKeys
      .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(oauthParams[k])}`)
      .join('&');

    const signatureBase = [
      method.toUpperCase(),
      encodeURIComponent(url),
      encodeURIComponent(paramString)
    ].join('&');

    const signingKey = `${encodeURIComponent(this.appSecret)}&${encodeURIComponent(this.accessSecret)}`;
    const signature = crypto
      .createHmac('sha1', signingKey)
      .update(signatureBase)
      .digest('base64');

    oauthParams.oauth_signature = signature;

    const authHeader = 'OAuth ' + Object.keys(oauthParams)
      .sort()
      .map(k => `${encodeURIComponent(k)}="${encodeURIComponent(oauthParams[k])}"`)
      .join(', ');

    return authHeader;
  }

  async postTweet(text, isDryRun = false) {
    if (isDryRun || this.isMockMode()) {
      const mockId = 'mock_tweet_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
      return {
        success: true,
        isMock: true,
        data: { id: mockId, text: text },
        account: this.name
      };
    }

    const url = 'https://api.twitter.com/2/tweets';
    const payload = JSON.stringify({ text: text });
    const authHeader = this.generateOAuthHeader('POST', url);

    return this.sendRequest(url, 'POST', payload, authHeader);
  }

  async replyTweet(text, inReplyToTweetId, isDryRun = false) {
    if (isDryRun || this.isMockMode()) {
      const mockId = 'mock_reply_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
      return {
        success: true,
        isMock: true,
        data: { id: mockId, text: text, in_reply_to_tweet_id: inReplyToTweetId },
        account: this.name
      };
    }

    const url = 'https://api.twitter.com/2/tweets';
    const payload = JSON.stringify({
      text: text,
      reply: { in_reply_to_tweet_id: inReplyToTweetId }
    });
    const authHeader = this.generateOAuthHeader('POST', url);

    return this.sendRequest(url, 'POST', payload, authHeader);
  }

  sendRequest(url, method, payload, authHeader) {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const options = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname,
        method: method,
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          'User-Agent': 'AsteroidBot/1.0'
        }
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({ success: true, isMock: false, data: parsed.data, account: this.name });
            } else {
              resolve({ success: false, error: parsed, statusCode: res.statusCode, account: this.name });
            }
          } catch (e) {
            resolve({ success: false, error: body, statusCode: res.statusCode, account: this.name });
          }
        });
      });

      req.on('error', (err) => {
        resolve({ success: false, error: err.message, account: this.name });
      });

      req.write(payload);
      req.end();
    });
  }
}

module.exports = TwitterClient;
