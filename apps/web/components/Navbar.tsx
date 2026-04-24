"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "./auth/useAuth";
import { ConnectWalletButton } from "./wallet/ConnectWalletButton";

type NavbarProps = {
  onToggleTheme?: () => void;
  isDarkMode?: boolean;
};

export function Navbar({ onToggleTheme, isDarkMode }: NavbarProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--color-border)] bg-[var(--color-background)]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        
        {/* Logo Left */}
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">
              Earnify
            </span>
          </Link>
        </div>

        {/* Nav Links Center */}
        <div className="hidden lg:flex lg:gap-x-8">
          <Link href="/dashboard" className="text-sm font-semibold leading-6 text-[#e2e8f0] hover:text-white transition-colors">
            Dashboard
          </Link>
        </div>

        {/* Auth / Wallet Right */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:gap-4">
          {isAuthenticated && user?.role === "FOUNDER" ? (
            <Link
              href="/campaign/create"
              className="rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
            >
              + Create Campaign
            </Link>
          ) : null}

          {isAuthenticated ? <ConnectWalletButton /> : null}

          {isAuthenticated ? (
            <div className="flex items-center gap-3 ml-2 border-l border-[var(--color-border)] pl-4">
              <span className="text-sm font-medium text-[var(--color-muted)]">
                {user?.name ?? "User"}
              </span>
              <button
                type="button"
                onClick={() => void logout()}
                className="text-sm font-semibold leading-6 text-[#e2e8f0] hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="text-sm font-semibold leading-6 text-[#e2e8f0] hover:text-white">
              Log in <span aria-hidden="true">&rarr;</span>
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-[#e2e8f0]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[var(--color-border)] bg-[var(--color-background)] px-4 py-6 sm:px-6">
          <div className="space-y-4">
            <Link href="/dashboard" className="block text-base font-semibold leading-7 text-[#e2e8f0]">Dashboard</Link>
            
            <div className="pt-4 border-t border-[var(--color-border)]">
              {isAuthenticated && user?.role === "FOUNDER" ? (
                <Link href="/campaign/create" className="block text-base font-semibold leading-7 text-[var(--color-primary)]">
                  + Create Campaign
                </Link>
              ) : null}
              {isAuthenticated ? (
                <div className="mt-4 flex flex-col gap-4">
                  <ConnectWalletButton />
                  <button onClick={() => void logout()} className="text-left text-base font-semibold leading-7 text-[#e2e8f0]">
                    Logout
                  </button>
                </div>
              ) : (
                <Link href="/login" className="block mt-4 text-base font-semibold leading-7 text-[#e2e8f0]">
                  Log in
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
