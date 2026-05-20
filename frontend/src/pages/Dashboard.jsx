import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

function Dashboard() {
    const { user, logout } = useAuth();

    // Form State Variables
    const [connectionName, setConnectionName] = useState('');
    const [dbType, setDbType] = useState('mysql');
    const [host, setHost] = useState('127.0.0.1');
    const [port, setPort] = useState(3306);
    const [username, setUsername] = useState('root');
    const [password, setPassword] = useState('');
    const [databaseName, setDatabaseName] = useState('');

    // Status State Variables
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [tables, setTables] = useState([]);

    // Handle Dynamic Port Defaults when user flips database types
    const handleDbTypeChange = (type) => {
        setDbType(type);
        setPort(type === 'mysql' ? 3306 : 5432);
    };

    const handleConnectDatabase = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        setTables([]);

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
            // 1. Submit the connection details to our FastAPI backend endpoint
            const response = await API.post('/databases/connect', payload);
            const savedConfigId = response.data.id;

            setSuccess(`Successfully registered configuration! Accessing metadata...`);

            // 2. Immediately fire a request to fetch the tables using the fresh configuration ID
            const tablesResponse = await API.get(`/databases/${savedConfigId}/tables`);
            setTables(tablesResponse.data);
            setSuccess(`Connected successfully! Fetched ${tablesResponse.data.length} tables.`);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to establish database connection link.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation Header */}
            <nav className="bg-white shadow-xs border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <span className="text-xl font-bold text-blue-600 tracking-tight">SQL Sync Studio</span>
                            <span className="ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Workspace Dashboard
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600 font-medium">{user?.email}</span>
                            <button
                                onClick={logout}
                                className="px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Workspace Splitscreen Layout */}
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Side Column: Connection Panel Form */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 lg:col-span-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Connect Data Source</h3>

                    {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 rounded-md p-3 text-xs">{error}</div>}
                    {success && <div className="mb-4 bg-green-50 border border-green-200 text-green-600 rounded-md p-3 text-xs">{success}</div>}

                    <form onSubmit={handleConnectDatabase} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Connection Workspace Name</label>
                            <input
                                type="text" required placeholder="e.g. Production Replica"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs text-sm focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                                value={connectionName} onChange={(e) => setConnectionName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Engine Architecture</label>
                            <select
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs text-sm focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                                value={dbType} onChange={(e) => handleDbTypeChange(e.target.value)}
                            >
                                <option value="mysql">MySQL Engine</option>
                                <option value="postgresql">PostgreSQL Engine</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Host Address</label>
                                <input
                                    type="text" required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs text-sm"
                                    value={host} onChange={(e) => setHost(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Port</label>
                                <input
                                    type="number" required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs text-sm"
                                    value={port} onChange={(e) => setPort(parseInt(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Username</label>
                                <input
                                    type="text" required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs text-sm"
                                    value={username} onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Target Database</label>
                                <input
                                    type="text" required placeholder="e.g. store_db"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs text-sm"
                                    value={databaseName} onChange={(e) => setDatabaseName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Password</label>
                            <input
                                type="password" required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs text-sm"
                                value={password} onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit" disabled={loading}
                            className="w-full mt-2 py-2 px-4 border border-transparent rounded-md shadow-xs text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50"
                        >
                            {loading ? 'Interrogating Database Engine...' : 'Initialize Secure Connection'}
                        </button>
                    </form>
                </div>

                {/* Right Side Column: Dynamic Metadata Output Terminal */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 lg:col-span-2 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Available Tables Schema Scanner</h3>
                    <p className="text-xs text-gray-500 mb-4">
                        Once a connection finishes initialized parameters, the tables discovered inside the structural schema will parse below.
                    </p>

                    {tables.length === 0 ? (
                        <div className="flex-1 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center p-12 text-center">
                            <p className="text-sm font-medium text-gray-400">No active connection database schema loaded.</p>
                            <p className="text-xs text-gray-400 mt-1">Submit configuration parameters on the left pane to establish connection stream.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[450px] overflow-y-auto pr-2">
                            {tables.map((tableName, idx) => (
                                <div
                                    key={idx}
                                    className="p-3 border border-gray-200 rounded-md bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-all flex items-center justify-between"
                                >
                                    <div className="flex items-center space-x-2.5 truncate">
                                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                                        <span className="text-sm font-medium text-gray-700 truncate">{tableName}</span>
                                    </div>
                                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 py-0.5 bg-white border border-gray-100 rounded">
                                        Table
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}

export default Dashboard;