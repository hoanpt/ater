# 🚀 Asteroid ($ASTEROID) — 1-Click Shill Hub & Admin Swarm Control

Official media station and automated Multi-Account Swarm Bot for the **$ASTEROID** (Asteroid Shiba Plush) community on **BNB Smart Chain (BSC)**.

![Banner](https://img.shields.io/badge/Chain-BNB%20Smart%20Chain-gold) ![Model](https://img.shields.io/badge/Model-Community%20Takeover%20(CTO)-purple) ![Premium](https://img.shields.io/badge/X%20Premium-Long--Form%20Unlocked-orange) ![Admin](https://img.shields.io/badge/Admin%20Panel-Secured-brightgreen)

---

## 🌟 1. Web Application Features (`index.html`)

- **⚡ 1-Click Instant Copy**: Click any card to copy with visual feedback & toasts.
- **📝 100 X Posts (&le; 280 chars)**: Strictly formatted under 280 characters for standard X accounts.
- **💬 100 KOL Raid Reply Templates (&le; 280 chars)**: Fast, punchy comments for viral raids.
- **💎 X Premium Long-Form Posts (Unlimited chars)**: Deep-dive analyses, complete lore, and mathematical tokenomics for verified X Premium accounts.
- **🔐 Web Admin Control Panel**: Login with passcode (Default: `asteroid2026`) to run live browser simulations, trigger swarm posts, and inspect real-time seeding logs right in the browser!
- **🎲 Random Raid Generator**: Pick and copy a random raid template in 1 click.
- **🔍 Real-Time Search & Category Filters**: SpaceX, Dog Day (Aug 26), $SPCXB Dividends, CTO & SAFU, Buy Guide.

---

## 🤖 2. Multi-Account X Swarm Bot (`bot/`)

Automates a **Master-Worker engagement network**:
1. **Master Account**: Posts tweets sequentially from the 100 Standard or X Premium Long-Form library.
2. **Clone Accounts**: Automatically detect the new post, match relevant comments by topic (e.g. SpaceX, Dog Day, Dividends), and reply with **randomized human-like delays** (e.g., Clone 1 after 3m, Clone 2 after 8m, Clone 3 after 20m) to trigger X's organic velocity algorithm!

### 🛠️ How to Configure Accounts (`accounts.config.json`)

```json
{
  "master": {
    "name": "Main_Official_Asteroid",
    "isPremium": true,
    "appKey": "API_KEY",
    "appSecret": "API_KEY_SECRET",
    "accessToken": "ACCESS_TOKEN",
    "accessSecret": "ACCESS_TOKEN_SECRET"
  },
  "clones": [
    {
      "id": "clone-1",
      "name": "SpaceShibaArmy_1",
      "minDelayMinutes": 2,
      "maxDelayMinutes": 5,
      "appKey": "API_KEY",
      "appSecret": "API_KEY_SECRET",
      "accessToken": "ACCESS_TOKEN",
      "accessSecret": "ACCESS_TOKEN_SECRET"
    },
    {
      "id": "clone-2",
      "name": "BscGemHunter_2",
      "minDelayMinutes": 6,
      "maxDelayMinutes": 12,
      "appKey": "API_KEY",
      "appSecret": "API_KEY_SECRET",
      "accessToken": "ACCESS_TOKEN",
      "accessSecret": "ACCESS_TOKEN_SECRET"
    }
  ]
}
```

### 🚀 Bot CLI Commands

```bash
# 1. Run Standard Simulation (Master <= 280 + Clones)
node bot/index.js --dry-run

# 2. Run X Premium Long-Form Simulation (Master Long-Form + Clones)
node bot/index.js --dry-run --premium

# 3. Immediately execute 1 live Swarm session
node bot/index.js --post-now

# 4. Start continuous background scheduler (posts every 3 hours)
node bot/index.js --schedule 3

# 5. View queue progress & seeding statistics
node bot/index.js --status
```

---

## 📍 Official Project Info

- **Token Name**: Asteroid Shiba Plush ($ASTEROID)
- **Contract Address (CA)**: `0x330990DaE53BCa4C5811C5362B44C33a47db7777`
- **Chain**: BNB Smart Chain (BSC)
- **Official X**: [@atershibaplush](https://x.com/atershibaplush)
- **Official Telegram**: [t.me/AteroidCTO0](https://t.me/AteroidCTO0)
- **Website**: [asteroidshibaplush.com](https://asteroidshibaplush.com)
- **SpaceX Official Shop**: [shop.spacex.com/products/spacex-asteroid-mascot](https://shop.spacex.com/products/spacex-asteroid-mascot)

---

*Receipts, not promises. Space-bound with conviction.* 🚀🌕
