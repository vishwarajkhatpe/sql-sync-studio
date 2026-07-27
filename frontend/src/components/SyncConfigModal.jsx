import React, { useEffect, useState } from 'react';
import API from '../services/api';

export default function SyncConfigModal({ activeConfigId, tableName, isOpen, onClose, onSuccess }) {
    const [syncFrequency, setSyncFrequency] = useState('manual');
    const [syncStrategy, setSyncStrategy] = useState('full_load');
    const [columns, setColumns] = useState([]);
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingCols, setFetchingCols] = useState(false);

    useEffect(() => {
        if (isOpen && tableName) {
            setSyncFrequency('manual');
            setSyncStrategy('full_load');
            fetchColumns();
        }
    }, [isOpen, tableName]);

    const fetchColumns = async () => {
        setFetchingCols(true);
        try {
            const res = await API.get(`/databases/${activeConfigId}/tables/${tableName}/columns`);
            setColumns(res.data);
            setSelectedColumns(res.data);
        } catch (err) { console.error('Failed to fetch columns:', err); }
        finally { setFetchingCols(false); }
    };

    const toggleColumn = (col) => {
        setSelectedColumns(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post(`/sync/${activeConfigId}/rules`, {
                table_name: tableName,
                sync_frequency: syncFrequency,
                sync_strategy: syncStrategy,
                is_active: true,
                selected_columns: selectedColumns.length === columns.length ? null : selectedColumns
            });
            onSuccess();
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to save configuration.');
        } finally { setLoading(false); }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/20 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="glass-strong rounded-3xl shadow-2xl shadow-violet-500/10 max-w-2xl w-full overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-200/40 flex justify-between items-center">
                    <h3 className="text-lg font-black text-gray-800 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-sm">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        </div>
                        <div>
                            Sync Configuration
                            <span className="block text-xs font-medium text-violet-500 mt-0.5">{tableName}</span>
                        </div>
                    </h3>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Sync Frequency</label>
                            <select value={syncFrequency} onChange={(e) => setSyncFrequency(e.target.value)}
                                className="w-full px-4 py-2.5 bg-white/60 border border-gray-200/80 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-300 transition-all appearance-none">
                                <option value="manual">Manual Trigger Only</option>
                                <option value="hourly">Hourly Schedule</option>
                                <option value="daily">Daily Schedule</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Loading Strategy</label>
                            <select value={syncStrategy} onChange={(e) => setSyncStrategy(e.target.value)}
                                className="w-full px-4 py-2.5 bg-white/60 border border-gray-200/80 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-300 transition-all appearance-none">
                                <option value="full_load">Full Overwrite</option>
                                <option value="incremental">Incremental Delta</option>
                            </select>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex justify-between items-center">
                            <span>Column Selection</span>
                            <span className="text-violet-500 normal-case font-bold">{selectedColumns.length}/{columns.length} selected</span>
                        </label>

                        {fetchingCols ? (
                            <div className="h-40 flex items-center justify-center bg-white/30 rounded-xl border border-gray-200/40 border-dashed">
                                <div className="w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-3 bg-white/30 rounded-xl border border-gray-200/40">
                                {columns.map(col => (
                                    <label key={col} className="flex items-center gap-2 p-2 rounded-lg hover:bg-violet-50 cursor-pointer transition-colors group">
                                        <input type="checkbox" checked={selectedColumns.includes(col)} onChange={() => toggleColumn(col)}
                                            className="w-4 h-4 text-violet-500 bg-white border-gray-300 rounded focus:ring-violet-400" />
                                        <span className="text-sm font-mono text-gray-600 group-hover:text-violet-600 truncate">{col}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-5 border-t border-gray-200/40">
                        <button type="button" onClick={onClose}
                            className="px-5 py-2.5 text-sm font-bold rounded-xl text-gray-500 bg-white/60 border border-gray-200/80 hover:bg-gray-50 transition-all">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading || fetchingCols}
                            className="px-6 py-2.5 text-sm font-bold rounded-xl text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-md shadow-violet-500/20 disabled:opacity-50 transition-all">
                            {loading ? 'Saving...' : 'Save Configuration'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
