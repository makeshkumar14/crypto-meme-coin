import { Bell, Menu, Moon, Sun, User, X } from 'lucide-react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';

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
  const {
    coins,
    user,
    signOut,
    refresh,
    usingFallbackSocialData,
    watchlist,
    reminders,
    theme,
    toggleTheme,
  } = useAppContext();
  const [open, setOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navigate = useNavigate();
  const trackedCount = coins.length;
  const liveTone = useMemo(
    () =>
      usingFallbackSocialData
        ? 'border-amber-400/20 bg-amber-400/10 text-amber-200'
        : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
    [usingFallbackSocialData],
  );

  async function handleSignOut() {
    await signOut();
    setOpen(false);
    navigate('/');
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.05] grid-overlay" />
      <div className="sticky top-4 z-40 px-4 pb-4 sm:px-6 lg:px-8 pointer-events-none">
        <header className="pointer-events-auto mx-auto flex w-full max-w-[1600px] flex-col gap-4 rounded-[2rem] border border-white/20 bg-gradient-to-br from-cyan-500/10 via-slate-900/95 to-fuchsia-500/10 px-6 py-4 shadow-[0_8px_32px_-8px_rgba(34,211,238,0.2)] backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between lg:rounded-full lg:px-8">
          <div className="flex items-center justify-between gap-4 lg:w-auto">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-xl text-cyan-200 shadow-neon lg:h-11 lg:w-11">
                AI
              </div>
              <div>
                <p className="text-xl font-bold tracking-tight text-white lg:text-2xl">MemeSense <span className="text-cyan-300">AI</span></p>
                <p className="hidden text-xs text-slate-400 sm:block">Meme coin intelligence platform</p>
              </div>
            </Link>

            <div className="flex items-center gap-3 lg:hidden">
              <button
                onClick={toggleTheme}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:border-cyan-300/40 hover:bg-white/10"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <div className="relative">
                <button
                  onClick={() => setOpen((value) => !value)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-white transition hover:border-cyan-300/40 hover:bg-white/10"
                >
                  {user ? user.initials : <User size={18} />}
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
                          <Link onClick={() => setOpen(false)} to="/alerts" className="rounded-xl px-3 py-2 text-slate-200 transition hover:bg-white/5">Alerts ({reminders.length})</Link>
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
              <button
                onClick={() => setMobileNavOpen((value) => !value)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white"
              >
                {mobileNavOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
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

          <nav className="hidden items-center gap-1 lg:flex xl:gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-full px-3 py-2 text-sm transition xl:px-4 ${
                    isActive ? 'bg-cyan-400 text-slate-950' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <button
              onClick={toggleTheme}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:border-cyan-300/40 hover:bg-white/10"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link
              to="/alerts"
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:border-cyan-300/40 hover:bg-white/10"
              aria-label="Open alerts"
            >
              <Bell size={18} />
              {reminders.length ? (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-cyan-400 px-1 text-[10px] font-semibold text-slate-950">
                  {Math.min(reminders.length, 9)}
                </span>
              ) : null}
            </Link>

            <button
              onClick={refresh}
              className="flex h-11 items-center justify-center rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-4 text-sm font-medium text-fuchsia-100 transition hover:bg-fuchsia-500/20 whitespace-nowrap"
            >
              Refresh
            </button>

            <div className="relative">
              <button
                onClick={() => setOpen((value) => !value)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-white transition hover:border-cyan-300/40 hover:bg-white/10"
              >
                {user ? user.initials : <User size={18} />}
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
                        <Link onClick={() => setOpen(false)} to="/alerts" className="rounded-xl px-3 py-2 text-slate-200 transition hover:bg-white/5">Alerts ({reminders.length})</Link>
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
        </header>
      </div>

      <main className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
