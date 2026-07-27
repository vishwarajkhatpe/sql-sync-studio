import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setLoading(true);
        try {
            await register(email, password);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
            {/* Animated background orbs */}
            <div className="absolute top-[-100px] right-[-80px] w-[380px] h-[380px] rounded-full bg-gradient-to-br from-emerald-300/40 to-cyan-300/30 blur-[80px] animate-float pointer-events-none"></div>
            <div className="absolute bottom-[-120px] left-[-60px] w-[350px] h-[350px] rounded-full bg-gradient-to-br from-violet-200/40 to-pink-200/30 blur-[80px] animate-float pointer-events-none" style={{ animationDelay: '2s' }}></div>

            <div className="w-full max-w-md animate-scale-in">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25 mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                    </div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                        Create Account
                    </h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">
                        Already a member?{' '}
                        <Link to="/login" className="text-violet-600 font-semibold hover:text-violet-700">Sign in →</Link>
                    </p>
                </div>

                <div className="glass-strong rounded-3xl shadow-xl shadow-emerald-500/5 p-8">
                    {error && (
                        <div className="mb-5 bg-red-50/80 border border-red-200/60 text-red-600 rounded-xl p-3.5 text-sm font-medium animate-slide-up flex items-center gap-2">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-5 bg-emerald-50/80 border border-emerald-200/60 text-emerald-600 rounded-xl p-3.5 text-sm font-medium animate-slide-up flex items-center gap-2">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Account created! Redirecting to login...
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="animate-slide-up stagger-1" style={{ opacity: 0 }}>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                            <input
                                type="email" required placeholder="you@company.com"
                                className="block w-full px-4 py-3 bg-white/60 border border-gray-200/80 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-300 transition-all shadow-sm"
                                value={email} onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="animate-slide-up stagger-2" style={{ opacity: 0 }}>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
                            <input
                                type="password" required placeholder="Min. 8 characters"
                                className="block w-full px-4 py-3 bg-white/60 border border-gray-200/80 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-300 transition-all shadow-sm"
                                value={password} onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="animate-slide-up stagger-3" style={{ opacity: 0 }}>
                            <button
                                type="submit" disabled={loading}
                                className="w-full mt-2 py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-500/20 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 transition-all cursor-pointer disabled:opacity-50 transform active:scale-[0.98] hover:shadow-xl hover:shadow-emerald-500/25"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                                        Creating account...
                                    </span>
                                ) : 'Create Account'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Register;