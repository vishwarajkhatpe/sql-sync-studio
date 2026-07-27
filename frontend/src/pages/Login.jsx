import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
            {/* Animated background orbs */}
            <div className="absolute top-[-120px] left-[-80px] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-violet-300/40 to-indigo-300/30 blur-[80px] animate-float pointer-events-none"></div>
            <div className="absolute bottom-[-100px] right-[-60px] w-[350px] h-[350px] rounded-full bg-gradient-to-br from-rose-200/40 to-amber-200/30 blur-[80px] animate-float pointer-events-none" style={{ animationDelay: '3s' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-sky-200/20 to-emerald-200/20 blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-md animate-scale-in">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/25 mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
                    </div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        SQL Sync Studio
                    </h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Sign in to your workspace</p>
                </div>

                {/* Card */}
                <div className="glass-strong rounded-3xl shadow-xl shadow-violet-500/5 p-8">
                    {error && (
                        <div className="mb-5 bg-red-50/80 border border-red-200/60 text-red-600 rounded-xl p-3.5 text-sm font-medium animate-slide-up flex items-center gap-2">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            {error}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="animate-slide-up stagger-1" style={{ opacity: 0 }}>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                            <input
                                type="email" required placeholder="you@company.com"
                                className="block w-full px-4 py-3 bg-white/60 border border-gray-200/80 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-300 transition-all shadow-sm"
                                value={email} onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="animate-slide-up stagger-2" style={{ opacity: 0 }}>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
                            <input
                                type="password" required placeholder="••••••••"
                                className="block w-full px-4 py-3 bg-white/60 border border-gray-200/80 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-300 transition-all shadow-sm"
                                value={password} onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="animate-slide-up stagger-3" style={{ opacity: 0 }}>
                            <button
                                type="submit" disabled={loading}
                                className="w-full mt-2 py-3.5 px-4 rounded-xl shadow-lg shadow-violet-500/20 text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98] hover:shadow-xl hover:shadow-violet-500/25"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                                        Signing in...
                                    </span>
                                ) : 'Sign In'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center text-sm animate-slide-up stagger-4" style={{ opacity: 0 }}>
                        <span className="text-gray-500">New to the studio?</span>{' '}
                        <Link to="/register" className="font-semibold text-violet-600 hover:text-violet-700 transition-colors">
                            Create an account →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;