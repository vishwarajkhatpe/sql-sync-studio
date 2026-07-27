import React, { useState } from 'react';
import API from '../services/api';

export default function ConnectionForm({ onSuccess, onCancel }) {
    const [connectionName, setConnectionName] = useState('');
    const [dbType, setDbType] = useState('mysql');
    const [host, setHost] = useState('127.0.0.1');
    const [port, setPort] = useState(3306);
    const [username, setUsername] = useState('root');
    const [password, setPassword] = useState('');
    const [databaseName, setDatabaseName] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDbTypeChange = (type) => {
        setDbType(type);
        setPort(type === 'mysql' ? 3306 : 5432);
    };

    const handleConnectDatabase = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const payload = {
            connection_name: connectionName,
            db_type: dbType,
            host,
            port: parseInt(port),
            username,
            password,
            database_name: databaseName,
        };

        try {
            const response = await API.post('/databases/connect', payload);
            onSuccess(response.data.id);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to establish database connection link.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-700 p-8 rounded-xl shadow-2xl max-w-lg w-full relative overflow-hidden">
            {/* Background glowing effects */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-white tracking-tight">Connect Data Source</h3>
                    {onCancel && (
                        <button onClick={onCancel} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    )}
                </div>

                {error && <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 text-sm font-medium">{error}</div>}

                <form onSubmit={handleConnectDatabase} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Connection Workspace Name</label>
                        <input
                            type="text" required placeholder="e.g. Production Replica"
                            className="block w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            value={connectionName} onChange={(e) => setConnectionName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Engine Architecture</label>
                        <select
                            className="block w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                            value={dbType} onChange={(e) => handleDbTypeChange(e.target.value)}
                        >
                            <option value="mysql">MySQL Engine</option>
                            <option value="postgresql">PostgreSQL Engine</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Host Address</label>
                            <input
                                type="text" required
                                className="block w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                value={host} onChange={(e) => setHost(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Port</label>
                            <input
                                type="number" required
                                className="block w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                value={port} onChange={(e) => setPort(parseInt(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Username</label>
                            <input
                                type="text" required
                                className="block w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                value={username} onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Target Database</label>
                            <input
                                type="text" required placeholder="e.g. store_db"
                                className="block w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                value={databaseName} onChange={(e) => setDatabaseName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
                        <input
                            type="password" required
                            className="block w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit" disabled={loading}
                        className="w-full mt-4 py-3 px-4 rounded-lg shadow-lg text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
                    >
                        {loading ? 'Interrogating Database Engine...' : 'Initialize Secure Connection'}
                    </button>
                </form>
            </div>
        </div>
    );
}
