import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
    const { user, changePassword, logout } = useAuth();
    const navigate = useNavigate();

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }
        if (newPassword.length < 8) {
            setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
            return;
        }
        setLoading(true);
        try {
            await changePassword(oldPassword, newPassword);
            setMessage({ type: 'success', text: 'Password updated successfully!' });
            setOldPassword(''); setNewPassword(''); setConfirmPassword('');
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to change password' });
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen flex flex-col items-center pt-20 px-4 relative overflow-hidden">
            {/* Background orbs */}
            <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] bg-violet-300/15 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-sky-300/15 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-md z-10 animate-scale-in">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="mb-6 text-sm font-semibold text-gray-400 hover:text-violet-600 transition-colors flex items-center gap-2 group"
                >
                    <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back to Dashboard
                </button>

                <div className="glass-strong rounded-3xl shadow-xl shadow-violet-500/5 p-8 mb-6 relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500"></div>

                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                            <span className="text-2xl font-black text-white uppercase">{user?.email?.charAt(0) || 'U'}</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-800">Profile</h2>
                            <p className="text-gray-400 text-sm font-medium">{user?.email}</p>
                        </div>
                    </div>

                    <div className="border-t border-gray-200/40 pt-8">
                        <h3 className="text-base font-black text-gray-700 mb-6">Change Password</h3>

                        {message.text && (
                            <div className={`mb-5 p-3.5 rounded-xl text-sm font-medium border animate-slide-up flex items-center gap-2 ${
                                message.type === 'error'
                                    ? 'bg-red-50/80 border-red-200/60 text-red-600'
                                    : 'bg-emerald-50/80 border-emerald-200/60 text-emerald-600'
                            }`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Current Password</label>
                                <input type="password" required
                                    className="block w-full px-4 py-3 bg-white/60 border border-gray-200/80 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-300 transition-all shadow-sm"
                                    value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">New Password</label>
                                <input type="password" required minLength="8"
                                    className="block w-full px-4 py-3 bg-white/60 border border-gray-200/80 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-300 transition-all shadow-sm"
                                    value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Confirm Password</label>
                                <input type="password" required minLength="8"
                                    className="block w-full px-4 py-3 bg-white/60 border border-gray-200/80 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-300 transition-all shadow-sm"
                                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                            </div>

                            <button type="submit" disabled={loading}
                                className="w-full mt-4 py-3.5 px-4 rounded-xl shadow-lg shadow-violet-500/20 text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all cursor-pointer disabled:opacity-50 transform active:scale-[0.98]">
                                {loading ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={() => { logout(); navigate('/login'); }}
                        className="text-sm font-bold text-gray-400 hover:text-red-500 transition-colors px-4 py-2 rounded-lg hover:bg-red-50"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
