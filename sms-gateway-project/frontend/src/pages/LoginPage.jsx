import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext.jsx';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(username, password); // uses apiService.post('/auth/login', { username, password })
      addToast('Logged in successfully', 'success');
      navigate('/');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Login failed';
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4" dir="ltr">
      <main className="w-full max-w-md">
        {/* Header */}
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Sign in to your account</h1>
          <p className="mt-1 text-sm text-slate-600">Enter your username and password to continue.</p>
        </header>

        {/* Card */}
        <section className="rounded-2xl bg-white/80 backdrop-blur shadow-lg ring-1 ring-black/5">
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5" noValidate>
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="your.username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent"
                required
              />
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-2 text-sm text-slate-600 select-none">
                <input
                  type="checkbox"
                  name="remember"
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-600"
                />
                Remember me
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-slate-900 text-white py-2.5 font-medium shadow hover:shadow-md transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default LoginPage;
