import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.03] p-10 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">404</p>
      <h1 className="mt-3 text-4xl font-bold text-white">This page drifted off-chain</h1>
      <p className="mt-4 text-sm leading-7 text-slate-300">The page you requested does not exist. Head back to the main page and continue from there.</p>
      <Link to="/" className="mt-6 inline-flex rounded-full bg-cyan-400 px-5 py-3 font-medium text-slate-950">
        Return home
      </Link>
    </div>
  );
}
