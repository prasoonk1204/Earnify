# Earnify

## 1) What is Earnify
Earnify is a creator marketing platform where founders launch campaigns and creators compete for budget based on verified social performance. Every verified post is scored using engagement plus authenticity signals, and the leaderboard updates live across connected clients. Once a campaign wraps, payouts can be triggered on Stellar testnet with visible transaction links for demo transparency.

## 2) Architecture diagram
```text
┌───────────────────────────────────────────────┐
│                 Next.js Web App              │
│  - Login, dashboard, campaign, leaderboard   │
└───────────────────┬───────────────────────────┘
                    │ HTTP + WebSocket
┌───────────────────▼───────────────────────────┐
│                Express API Server             │
│  - Auth, campaigns, posts, admin, payouts    │
│  - Verification + scoring + cron refresh     │
└──────────────┬───────────────────┬────────────┘
               │                   │
     ┌─────────▼─────────┐   ┌────▼─────────────┐
     │   PostgreSQL      │   │      Redis        │
     │ - Users/Campaigns │   │ - Live leaderboard│
     │ - Posts/Scores    │   │ - Rank snapshots  │
     │ - Payout records  │   └───────────────────┘
     └─────────┬─────────┘
               │
     ┌─────────▼─────────┐
     │  Stellar Testnet  │
     │ - Payout tx flow  │
     └───────────────────┘
```

## 3) Quick start
```bash
./scripts/setup.sh
```

Open [http://localhost:3000](http://localhost:3000)

## 4) Demo walkthrough steps
1. Login as Alice (FOUNDER) → create a campaign, note wallet address
2. Open 3 browser tabs, login as Bob, Priya, Jae-won
3. All 3 submit different post URLs to the campaign
4. Watch verification spinner → posts go VERIFIED
5. Hit POST /api/admin/trigger-engagement-refresh
6. Watch the leaderboard update live in all tabs simultaneously
7. As Alice, click "Trigger Payout" → watch tx cards appear
8. Show Stellar testnet explorer link for any tx

Every step above can still be demonstrated using seeded campaigns, seeded verified posts, seeded engagement snapshots, and a pre-populated leaderboard.

## 5) Theme customization
Edit apps/web/styles/theme.ts to change the entire UI

## 6) Tech stack
- Next.js 16 + React 19 (frontend)
- Express 5 + Socket.IO (API + realtime)
- PostgreSQL + Prisma ORM (primary data)
- Redis (leaderboard state)
- Stellar testnet SDK (payout simulation)
- pnpm workspaces + TypeScript (monorepo/tooling)
