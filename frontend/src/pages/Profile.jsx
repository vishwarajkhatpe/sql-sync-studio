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
            setMessage({ type: 'success', text: 'Password successfully updated' });
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to change password' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center pt-24 font-sans selection:bg-blue-500/30 px-4">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
            
            <div className="w-full max-w-md z-10 relative">
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="mb-6 text-sm font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-2 group"
                >
                    <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back to Dashboard
                </button>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 mb-6 relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                    
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center shadow-inner">
                            <span className="text-2xl font-bold text-slate-300 uppercase">{user?.email?.charAt(0) || 'U'}</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight">User Profile</h2>
                            <p className="text-slate-400 text-sm">{user?.email}</p>
                        </div>
                    </div>

                    <div className="border-t border-slate-800 pt-8">
                        <h3 className="text-lg font-bold text-white mb-6">Security Settings</h3>
                        
                        {message.text && (
                            <div className={`mb-6 p-4 rounded-lg text-sm font-medium border ${
                                message.type === 'error' 
                                ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            }`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Current Password</label>
                                <input
                                    type="password" required
                                    className="block w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
                                <input
                                    type="password" required minLength="8"
                                    className="block w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Confirm New Password</label>
                                <input
                                    type="password" required minLength="8"
                                    className="block w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                            
                            <button
                                type="submit" disabled={loading}
                                className="w-full mt-6 py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/20 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
                            >
                                {loading ? 'Updating Security Credentials...' : 'Change Password'}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="flex justify-center">
                    <button 
                        onClick={() => { logout(); navigate('/login'); }}
                        className="text-sm font-bold text-slate-500 hover:text-red-400 transition-colors px-4 py-2 rounded-lg hover:bg-slate-900"
                    >
                        Sign Out of Device
                    </button>
                </div>
            </div>
        </div>
    );
}
