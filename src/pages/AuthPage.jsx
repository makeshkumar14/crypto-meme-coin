import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export function AuthPage({ mode }) {
  const navigate = useNavigate();
  const { signIn, signUp } = useAppContext();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isSignUp = mode === 'signup';

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (isSignUp) {
        await signUp(form);
      } else {
        await signIn(form);
      }
      navigate('/dashboard');
    } catch (submitError) {
      setError(submitError.message || 'Unable to continue right now.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="glass-panel rounded-[2rem] p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{isSignUp ? 'Create account' : 'Welcome back'}</p>
        <h1 className="mt-2 text-4xl font-bold text-white">{isSignUp ? 'Sign up for MemeSense AI' : 'Sign in to your account'}</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          Your account now saves watchlists, reminder settings, and theme choice on the backend so your dashboard follows you across sessions.
        </p>

        {error ? (
          <div className="mt-5 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {isSignUp ? (
            <Field label="Name" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} />
          ) : null}
          <Field label="Email" type="email" value={form.email} onChange={(value) => setForm((current) => ({ ...current, email: value }))} />
          <Field label="Password" type="password" value={form.password} onChange={(value) => setForm((current) => ({ ...current, password: value }))} />
          <button
            disabled={submitting}
            type="submit"
            className="w-full rounded-2xl bg-cyan-400 px-4 py-3 font-medium text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-slate-300">{label}</span>
      <input
        required
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none transition focus:border-cyan-300/40"
      />
    </label>
  );
}
