import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    return (
        <nav className="bg-slate-900 shadow-lg border-b border-slate-800 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg flex items-center justify-center border border-white/10">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
                            </div>
                            <span className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                                SQL Sync Studio
                            </span>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-blue-400 border border-slate-700 shadow-inner">
                            Workspace
                        </span>
                    </div>
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                            <span className="text-sm text-slate-300 font-medium">{user?.email}</span>
                        </div>
                        <button
                            onClick={logout}
                            className="px-4 py-2 border border-slate-700 text-xs font-semibold rounded-lg text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-all duration-200 cursor-pointer shadow-md active:scale-95"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
