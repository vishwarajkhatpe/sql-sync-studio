import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

function Dashboard() {
    const { user, logout } = useAuth();

    // Connection Form State
    const [connectionName, setConnectionName] = useState('');
    const [dbType, setDbType] = useState('mysql');
    const [host, setHost] = useState('127.0.0.1');
    const [port, setPort] = useState(3306);
    const [username, setUsername] = useState('root');
    const [password, setPassword] = useState('');
    const [databaseName, setDatabaseName] = useState('');

    // Global Workspace Status State
    const [activeConfigId, setActiveConfigId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [tables, setTables] = useState([]);

    // Active Workspace Inspection State
    const [selectedTable, setSelectedTable] = useState('');
    const [extractedData, setExtractedData] = useState([]);
    const [extractionLoading, setExtractionLoading] = useState(false);

    // Phase 7: Telemetry History State
    const [syncHistory, setSyncHistory] = useState([]);

    // Sync Modal Window UI State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [syncFrequency, setSyncFrequency] = useState('manual');
    const [syncStrategy, setSyncStrategy] = useState('full_load');
    const [modalLoading, setModalLoading] = useState(false);
    const [modalSuccess, setModalSuccess] = useState('');

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
        setActiveConfigId(null);
        setSelectedTable('');
        setExtractedData([]);
        setSyncHistory([]);

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
            const savedConfigId = response.data.id;
            setActiveConfigId(savedConfigId);

            setSuccess(`Workspace registered! Accessing metadata layout...`);

            // Fetch Tables
            const tablesResponse = await API.get(`/databases/${savedConfigId}/tables`);
            setTables(tablesResponse.data);

            // Fetch Telemetry History
            const historyResponse = await API.get(`/sync/${savedConfigId}/history`);
            setSyncHistory(historyResponse.data.history);

            setSuccess(`Connected successfully! Fetched ${tablesResponse.data.length} tables.`);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to establish database connection link.');
        } finally {
            setLoading(false);
        }
    };

    // Trigger manual extraction pipeline execution for the active table selection
    const handleTriggerExtraction = async (tableName) => {
        setExtractionLoading(true);
        setSelectedTable(tableName);
        setExtractedData([]);

        try {
            const response = await API.post(`/sync/${activeConfigId}/extract/${tableName}`);
            setExtractedData(response.data.data);

            // Refresh history log after manual extraction
            const historyResponse = await API.get(`/sync/${activeConfigId}/history`);
            setSyncHistory(historyResponse.data.history);
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to extract records from target table.');
        } finally {
            setExtractionLoading(false);
        }
    };

    const openSyncModal = (e, tableName) => {
        e.stopPropagation(); // Stop parent row selection click from triggering
        setSelectedTable(tableName);
        setSyncFrequency('manual');
        setSyncStrategy('full_load');
        setModalSuccess('');
        setIsModalOpen(true);
    };

    const handleSaveSyncRule = async (e) => {
        e.preventDefault();
        setModalLoading(true);
        setModalSuccess('');

        const payload = {
            table_name: selectedTable,
            sync_frequency: syncFrequency,
            sync_strategy: syncStrategy,
            is_active: true
        };

        try {
            await API.post(`/sync/${activeConfigId}/rules`, payload);
            setModalSuccess(`Rule configured successfully for table '${selectedTable}'!`);
            setTimeout(() => {
                setIsModalOpen(false);
            }, 1500);
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to save pipeline orchestration properties.');
        } finally {
            setModalLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 relative">
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
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 lg:col-span-1 lg:h-fit lg:sticky lg:top-8">
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

                {/* Right Side Column: Table Scanner, Data Grid, and Telemetry */}
                <div className="lg:col-span-2 flex flex-col space-y-6">

                    {/* Top Panel: Schema Table Node Selection */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Available Tables Schema Scanner</h3>
                        <p className="text-xs text-gray-500 mb-4">
                            Click on a table block to dynamically interrogate data rows, or open settings to adjust pipeline sync properties.
                        </p>

                        {tables.length === 0 ? (
                            <div className="border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center p-12 text-center">
                                <p className="text-sm font-medium text-gray-400">No active connection database schema loaded.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-2">
                                {tables.map((tableName, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => handleTriggerExtraction(tableName)}
                                        className={`group p-3 border rounded-md cursor-pointer transition-all flex items-center justify-between ${selectedTable === tableName
                                            ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-400'
                                            : 'bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-200'
                                            }`}
                                    >
                                        <div className="flex items-center space-x-2.5 truncate">
                                            <span className={`w-2 h-2 rounded-full shrink-0 ${selectedTable === tableName ? 'bg-blue-600 animate-pulse' : 'bg-blue-500'}`}></span>
                                            <span className="text-sm font-medium text-gray-700 truncate">{tableName}</span>
                                        </div>
                                        <button
                                            onClick={(e) => openSyncModal(e, tableName)}
                                            className="opacity-0 group-hover:opacity-100 px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-100 hover:bg-blue-200 border border-blue-200 rounded transition-all cursor-pointer"
                                        >
                                            Configure Sync
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Middle Panel: Live Extraction Spreadsheet Grid */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 min-h-[300px] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Live Data Extraction Terminal</h3>
                                {selectedTable && (
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Inspecting dynamic runtime contents for table: <span className="font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{selectedTable}</span>
                                    </p>
                                )}
                            </div>
                            {selectedTable && (
                                <span className="text-xs font-semibold bg-gray-100 border border-gray-200 text-gray-700 px-2.5 py-1 rounded-md">
                                    {extractedData.length} Records Found
                                </span>
                            )}
                        </div>

                        {extractionLoading ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-12">
                                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-sm font-medium text-gray-500 mt-3 animate-pulse">Running optimized SELECT stream extraction sequence...</p>
                            </div>
                        ) : extractedData.length > 0 ? (
                            <div className="flex-1 overflow-x-auto border border-gray-200 rounded-lg max-h-[350px]">
                                <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                                    <thead className="bg-gray-50 sticky top-0 font-semibold text-gray-700 border-b border-gray-200">
                                        <tr>
                                            {Object.keys(extractedData[0]).map((header) => (
                                                <th key={header} className="px-4 py-3 font-mono text-xs uppercase tracking-wider bg-gray-50">{header}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200 text-gray-600 font-medium">
                                        {extractedData.map((row, rowIdx) => (
                                            <tr key={rowIdx} className="hover:bg-gray-50/70 transition-colors">
                                                {Object.values(row).map((val, cellIdx) => (
                                                    <th key={cellIdx} className="px-4 py-2.5 font-normal truncate max-w-[200px]">
                                                        {val === null ? <span className="text-gray-300 italic text-xs">NULL</span> : String(val)}
                                                    </th>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex-1 border-2 border-dashed border-gray-100 rounded-lg flex flex-col items-center justify-center p-12 text-center bg-gray-50/40">
                                <p className="text-sm font-medium text-gray-400">No active table stream rendering.</p>
                                <p className="text-xs text-gray-400 mt-1">Select any loaded schema table box node above to trigger immediate extraction preview.</p>
                            </div>
                        )}
                    </div>

                    {/* Bottom Panel: Telemetry Activity Log (NEW!) */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Pipeline Activity Log</h3>
                            <button
                                onClick={async () => {
                                    if (activeConfigId) {
                                        const res = await API.get(`/sync/${activeConfigId}/history`);
                                        setSyncHistory(res.data.history);
                                    }
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer flex items-center gap-1"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                Refresh Log
                            </button>
                        </div>

                        {syncHistory.length === 0 ? (
                            <div className="p-4 bg-gray-50 border border-gray-100 rounded-md text-center">
                                <p className="text-xs text-gray-500 italic">No sync history recorded yet. Run a manual extraction or wait for the automated worker.</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                                {syncHistory.map((log) => (
                                    <div key={log.id} className="flex items-center justify-between text-sm p-3 bg-gray-50 border border-gray-100 rounded-md hover:border-blue-100 transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                            <span className="font-medium text-gray-700">Snapshot #{log.id}</span>
                                            <span className="font-mono text-blue-600 bg-blue-100 px-2 py-0.5 rounded text-xs">{log.table_name}</span>
                                        </div>
                                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                                            <span className="bg-white px-2 py-1 rounded border border-gray-200">{log.record_count} Records</span>
                                            <span className="font-medium">{new Date(log.extracted_at).toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </main>

            {/* INTERACTIVE POPUP MODAL DIALOG OVERLAY */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl border border-gray-200 max-w-md w-full overflow-hidden transition-all transform animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-base font-bold text-gray-900">
                                Sync Settings: <span className="text-blue-600 font-mono text-sm">{selectedTable}</span>
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500 font-bold text-lg cursor-pointer">&times;</button>
                        </div>

                        <form onSubmit={handleSaveSyncRule} className="p-6 space-y-4">
                            {modalSuccess && <div className="bg-green-50 border border-green-200 text-green-600 rounded-md p-3 text-xs">{modalSuccess}</div>}

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Synchronization Frequency</label>
                                <select
                                    className="mt-1.5 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    value={syncFrequency} onChange={(e) => setSyncFrequency(e.target.value)}
                                >
                                    <option value="manual">Manual Trigger Only</option>
                                    <option value="realtime">Real-time Stream Integration</option>
                                    <option value="hourly">Scheduled Execution (Hourly)</option>
                                    <option value="daily">Scheduled Execution (Daily)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Pipeline Loading Strategy</label>
                                <select
                                    className="mt-1.5 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    value={syncStrategy} onChange={(e) => setSyncStrategy(e.target.value)}
                                >
                                    <option value="full_load">Full Overwrite Extract (Truncate & Replace)</option>
                                    <option value="incremental">Incremental Delta Sync (Append Missing Rows Only)</option>
                                </select>
                            </div>

                            <div className="pt-2 flex justify-end space-x-2">
                                <button
                                    type="button" onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit" disabled={modalLoading}
                                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    {modalLoading ? 'Saving Rules...' : 'Save Sync Architecture'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;