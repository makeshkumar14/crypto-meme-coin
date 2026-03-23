import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { formatRelativeTime } from '../lib/formatters';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/markets', label: 'Markets' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/detector', label: 'Detector' },
  { to: '/watchlist', label: 'Watchlist' },
  { to: '/alerts', label: 'Alerts' },
];

export function AppShell() {
  const { coins, user, signOut, refresh, lastUpdated, usingMockSocialData, watchlist } = useAppContext();
  const [open, setOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navigate = useNavigate();
  const trackedCount = coins.length;
  const liveTone = useMemo(
    () =>
      usingMockSocialData
        ? 'border-amber-400/20 bg-amber-400/10 text-amber-200'
        : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
    [usingMockSocialData],
  );

  function handleSignOut() {
    signOut();
    setOpen(false);
    navigate('/');
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.05] grid-overlay" />
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-xl text-cyan-200 shadow-neon">
                  ⚡
                </div>
                <div>
                  <p className="text-2xl font-bold tracking-tight text-white">MemeSense <span className="text-cyan-300">AI</span></p>
                  <p className="text-sm text-slate-400">Meme coin intelligence platform</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileNavOpen((value) => !value)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xl text-white lg:hidden"
              >
                {mobileNavOpen ? '×' : '☰'}
              </button>
              <button
                onClick={refresh}
                className="hidden rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-4 py-2 text-sm font-medium text-fuchsia-100 transition hover:bg-fuchsia-500/20 sm:block"
              >
                Refresh
              </button>

              <div className="relative">
                <button
                  onClick={() => setOpen((value) => !value)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-white transition hover:border-cyan-300/40 hover:bg-white/10"
                >
                  {user ? user.initials : '👤'}
                </button>

                {open ? (
                  <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-white/10 bg-slate-900/95 p-3 shadow-2xl backdrop-blur-xl">
                    {user ? (
                      <>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                          <p className="font-semibold text-white">{user.name}</p>
                          <p className="mt-1 text-sm text-slate-400">{user.email}</p>
                        </div>
                        <div className="mt-3 grid gap-2 text-sm">
                          <Link onClick={() => setOpen(false)} to="/profile" className="rounded-xl px-3 py-2 text-slate-200 transition hover:bg-white/5">Profile</Link>
                          <Link onClick={() => setOpen(false)} to="/watchlist" className="rounded-xl px-3 py-2 text-slate-200 transition hover:bg-white/5">Watchlist ({watchlist.length})</Link>
                          <Link onClick={() => setOpen(false)} to="/dashboard" className="rounded-xl px-3 py-2 text-slate-200 transition hover:bg-white/5">Open dashboard</Link>
                          <button onClick={handleSignOut} className="rounded-xl px-3 py-2 text-left text-rose-200 transition hover:bg-rose-500/10">Sign out</button>
                        </div>
                      </>
                    ) : (
                      <div className="grid gap-2 text-sm">
                        <Link onClick={() => setOpen(false)} to="/signin" className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-white transition hover:bg-white/10">Sign in</Link>
                        <Link onClick={() => setOpen(false)} to="/signup" className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-3 text-cyan-200 transition hover:bg-cyan-400/20">Create account</Link>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {mobileNavOpen ? (
            <div className="grid gap-2 rounded-3xl border border-white/10 bg-white/[0.03] p-3 lg:hidden">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileNavOpen(false)}
                  className={({ isActive }) =>
                    `rounded-2xl px-4 py-3 text-sm transition ${
                      isActive ? 'bg-cyan-400 text-slate-950' : 'text-slate-200 hover:bg-white/5'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <nav className="hidden flex-wrap items-center gap-2 lg:flex">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 text-sm transition ${
                      isActive
                        ? 'bg-cyan-400 text-slate-950'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex flex-wrap items-center gap-3">
              <span className={`rounded-full border px-3 py-2 text-sm ${liveTone}`}>
                {usingMockSocialData ? 'Fallback signals active' : 'Live social data active'}
              </span>
              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-200">
                {trackedCount} tokens tracked
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
                Updated {formatRelativeTime(lastUpdated)}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
