import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Navbar() {
    const { user, logout } = useAuth();
    return (
        <nav className="glass-strong sticky top-0 z-50 shadow-sm shadow-violet-100/50">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center space-x-4">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
                            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl shadow-md shadow-violet-500/20 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-violet-500/30 transition-all group-hover:scale-105">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
                            </div>
                            <span className="text-xl font-black bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                SQL Sync Studio
                            </span>
                        </Link>
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-violet-50 text-violet-600 border border-violet-200/60 uppercase tracking-widest">
                            Workspace
                        </span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link to="/profile" className="flex items-center space-x-2.5 glass px-3.5 py-2 rounded-xl hover:shadow-md transition-all cursor-pointer group">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center shadow-sm">
                                <span className="text-white text-xs font-bold uppercase">{user?.email?.charAt(0) || 'U'}</span>
                            </div>
                            <span className="text-sm text-gray-600 font-semibold group-hover:text-gray-800 transition-colors hidden sm:inline">{user?.email}</span>
                        </Link>
                        <button
                            onClick={logout}
                            className="px-4 py-2 text-xs font-bold rounded-xl text-gray-500 bg-white/60 border border-gray-200/60 hover:bg-red-50 hover:text-red-600 hover:border-red-200/60 transition-all cursor-pointer shadow-sm active:scale-95"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
