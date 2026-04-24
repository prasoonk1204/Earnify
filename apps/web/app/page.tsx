"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CampaignCard } from "../components/CampaignCard";

export default function HomePage() {
  const [stats, setStats] = useState({ campaigns: 1240, xlmDistributed: 450000, participants: 15800 });

  useEffect(() => {
    // Optionally fetch from /api/dashboard/stats here
    // fetch("/api/dashboard/stats").then(res => res.json()).then(data => setStats(data));
  }, []);

  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[#e2e8f0] pb-20">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 pt-32 pb-24 text-center lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl mb-8">
            <span className="block">Earn by posting.</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">
              Pay for real reach.
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-8 text-[var(--color-muted)] mb-10">
            Earnify is the premier Web3 platform for authentic social engagement. Founders deposit XLM, you post on X, Instagram, and LinkedIn — the more engagement you get, the more you earn.
          </p>
          <div className="flex items-center justify-center gap-x-6">
            <Link
              href="/dashboard"
              className="rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[#8B5CF6] px-8 py-4 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
            >
              Explore Campaigns
            </Link>
            <Link
              href="/campaign/create"
              className="rounded-full border border-[var(--color-border)] px-8 py-4 text-sm font-semibold text-white hover:bg-[var(--color-surface)] transition-colors"
            >
              Launch a Campaign
            </Link>
          </div>
        </div>
      </section>

      {/* Live Stats Bar */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 mb-32">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/50 backdrop-blur-md p-8 shadow-xl">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-10 text-center lg:grid-cols-3">
            <div className="mx-auto flex max-w-xs flex-col gap-y-4">
              <dt className="text-base leading-7 text-[var(--color-muted)]">Total Campaigns</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">{stats.campaigns.toLocaleString()}</dd>
            </div>
            <div className="mx-auto flex max-w-xs flex-col gap-y-4">
              <dt className="text-base leading-7 text-[var(--color-muted)]">XLM Distributed</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-[var(--color-secondary)] sm:text-5xl">{stats.xlmDistributed.toLocaleString()}</dd>
            </div>
            <div className="mx-auto flex max-w-xs flex-col gap-y-4">
              <dt className="text-base leading-7 text-[var(--color-muted)]">Participants</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">{stats.participants.toLocaleString()}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 mb-32">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">How it works</h2>
          <p className="mt-4 text-lg leading-8 text-[var(--color-muted)]">Transparent, blockchain-powered, no middleman.</p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {[
            { step: '1', title: 'Founder Deposits', desc: 'Campaign creator deposits XLM into a Stellar smart contract to fund the marketing budget.' },
            { step: '2', title: 'You Post', desc: 'Join the campaign and post on X, Instagram, or LinkedIn with the required keywords.' },
            { step: '3', title: 'You Earn', desc: 'Get paid in XLM automatically based on the genuine engagement your post generates.' }
          ].map((item) => (
            <div key={item.step} className="relative p-8 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/50 transition-colors">
              <div className="absolute -top-6 left-8 h-12 w-12 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-xl font-bold text-white shadow-lg">
                {item.step}
              </div>
              <h3 className="mt-6 text-xl font-semibold text-white mb-3">{item.title}</h3>
              <p className="text-[var(--color-muted)]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Featured Campaigns</h2>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* We will mock these for now until API is connected */}
          <CampaignCard 
            campaign={{
              id: "1",
              title: "Launch of Stellar Wallet v2",
              founder: { name: "Stellar Dev", avatar: "" },
              platforms: ["X", "LinkedIn"],
              budgetRemaining: 5000,
              budgetTotal: 10000,
              participants: 142,
              daysLeft: 5
            } as any}
          />
          <CampaignCard 
            campaign={{
              id: "2",
              title: "DeFi Summer 2.0 Kickoff",
              founder: { name: "Yield Farmer", avatar: "" },
              platforms: ["X"],
              budgetRemaining: 1500,
              budgetTotal: 5000,
              participants: 34,
              daysLeft: 2
            } as any}
          />
          <CampaignCard 
            campaign={{
              id: "3",
              title: "Creator Economy Panel NYC",
              founder: { name: "Event DAO", avatar: "" },
              platforms: ["Instagram", "LinkedIn"],
              budgetRemaining: 8000,
              budgetTotal: 8000,
              participants: 12,
              daysLeft: 10
            } as any}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-32 border-t border-[var(--color-border)] py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-2xl font-bold text-white">Earnify</div>
          <div className="flex gap-6 text-sm text-[var(--color-muted)]">
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Docs</Link>
          </div>
          <div className="text-sm text-[var(--color-muted)]">&copy; {new Date().getFullYear()} Earnify. All rights reserved.</div>
        </div>
      </footer>
    </main>
  );
}
