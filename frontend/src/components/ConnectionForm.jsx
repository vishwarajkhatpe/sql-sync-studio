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
        try {
            const response = await API.post('/databases/connect', {
                connection_name: connectionName, db_type: dbType, host,
                port: parseInt(port), username, password, database_name: databaseName,
            });
            onSuccess(response.data.id);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to establish database connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-strong rounded-3xl shadow-2xl shadow-violet-500/5 p-8 max-w-lg w-full relative overflow-hidden animate-scale-in">
            {/* Background accents */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-violet-300/15 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-sky-300/15 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-black text-gray-800">Connect Data Source</h3>
                        <p className="text-xs text-gray-400 mt-0.5 font-medium">Add a new database connection to your workspace</p>
                    </div>
                    {onCancel && (
                        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1 hover:bg-gray-100 rounded-lg">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    )}
                </div>

                {error && (
                    <div className="mb-5 bg-red-50/80 border border-red-200/60 text-red-600 rounded-xl p-3.5 text-sm font-medium animate-slide-up flex items-center gap-2">
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleConnectDatabase} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Connection Name</label>
                        <input type="text" required placeholder="e.g. Production Replica"
                            className="block w-full px-4 py-2.5 bg-white/60 border border-gray-200/80 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-300 transition-all shadow-sm"
                            value={connectionName} onChange={(e) => setConnectionName(e.target.value)} />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Database Engine</label>
                        <div className="flex gap-3">
                            {['mysql', 'postgresql'].map(type => (
                                <button key={type} type="button" onClick={() => handleDbTypeChange(type)}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                                        dbType === type
                                            ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-md shadow-violet-500/20'
                                            : 'bg-white/60 text-gray-500 border border-gray-200/80 hover:bg-white hover:border-gray-300/80'
                                    }`}>
                                    {type === 'mysql' ? 'MySQL' : 'PostgreSQL'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Host Address</label>
                            <input type="text" required
                                className="block w-full px-4 py-2.5 bg-white/60 border border-gray-200/80 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-300 transition-all shadow-sm"
                                value={host} onChange={(e) => setHost(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Port</label>
                            <input type="number" required
                                className="block w-full px-4 py-2.5 bg-white/60 border border-gray-200/80 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-300 transition-all shadow-sm"
                                value={port} onChange={(e) => setPort(parseInt(e.target.value))} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Username</label>
                            <input type="text" required
                                className="block w-full px-4 py-2.5 bg-white/60 border border-gray-200/80 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-300 transition-all shadow-sm"
                                value={username} onChange={(e) => setUsername(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Database Name</label>
                            <input type="text" required placeholder="e.g. store_db"
                                className="block w-full px-4 py-2.5 bg-white/60 border border-gray-200/80 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-300 transition-all shadow-sm"
                                value={databaseName} onChange={(e) => setDatabaseName(e.target.value)} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
                        <input type="password" required
                            className="block w-full px-4 py-2.5 bg-white/60 border border-gray-200/80 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-300 transition-all shadow-sm"
                            value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full mt-3 py-3.5 px-4 rounded-xl shadow-lg shadow-violet-500/20 text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all cursor-pointer disabled:opacity-50 transform active:scale-[0.98] hover:shadow-xl hover:shadow-violet-500/25">
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                                Connecting...
                            </span>
                        ) : 'Connect Database'}
                    </button>
                </form>
            </div>
        </div>
    );
}
