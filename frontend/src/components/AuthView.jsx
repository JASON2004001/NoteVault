import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signupUser, loginUser, clearAuthError } from '../store/authSlice';

export default function AuthView() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const switchMode = (newMode) => {
    setMode(newMode);
    dispatch(clearAuthError());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'signup') {
      dispatch(
        signupUser({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        })
      );
    } else {
      dispatch(
        loginUser({
          name: formData.name.trim(),
          password: formData.password,
        })
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#090d16]">
      <div className="w-full max-w-md bg-[#111827] border border-[#1f2937] rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#38bdf8] tracking-wide">
            NoteVault
          </h1>
          <p className="text-xs text-[#94a3b8] mt-1">
            Your unlimited cloud notepad, folders & voice memos
          </p>
        </div>

        {/* Toggle Switch */}
        <div className="grid grid-cols-2 gap-1 bg-[#090d16] p-1 rounded-xl border border-[#1f2937] mb-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`py-2.5 rounded-lg transition cursor-pointer ${
              mode === 'login' ? 'bg-[#38bdf8] text-black font-bold' : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={`py-2.5 rounded-lg transition cursor-pointer ${
              mode === 'signup' ? 'bg-[#38bdf8] text-black font-bold' : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-red-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-[#94a3b8] mb-1">Your Name</label>
            <input
              type="text"
              required
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck="false"
              placeholder="Enter your name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[#090d16] border border-[#1f2937] text-sm text-white focus:outline-none focus:border-[#38bdf8]"
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-xs text-[#94a3b8] mb-1">Email Address</label>
              <input
                type="email"
                required
                autoCorrect="off"
                autoCapitalize="none"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-[#090d16] border border-[#1f2937] text-sm text-white focus:outline-none focus:border-[#38bdf8]"
              />
            </div>
          )}

          <div>
            <label className="block text-xs text-[#94a3b8] mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[#090d16] border border-[#1f2937] text-sm text-white focus:outline-none focus:border-[#38bdf8]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#38bdf8] hover:bg-[#0284c7] text-black font-bold text-sm transition cursor-pointer"
          >
            {loading
              ? 'Please wait...'
              : mode === 'signup'
              ? 'Create Notepad Account'
              : 'Enter Your Notepads'}
          </button>
        </form>
      </div>
    </div>
  );
}