import React, { useEffect, useState } from 'react';
import API from '../services/api';

export default function SyncConfigModal({ 
    activeConfigId, 
    tableName, 
    isOpen, 
    onClose, 
    onSuccess 
}) {
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
            setSelectedColumns(res.data); // Select all by default
        } catch (err) {
            console.error('Failed to fetch columns:', err);
        } finally {
            setFetchingCols(false);
        }
    };

    const toggleColumn = (col) => {
        if (selectedColumns.includes(col)) {
            setSelectedColumns(selectedColumns.filter(c => c !== col));
        } else {
            setSelectedColumns([...selectedColumns, col]);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            table_name: tableName,
            sync_frequency: syncFrequency,
            sync_strategy: syncStrategy,
            is_active: true,
            selected_columns: selectedColumns.length === columns.length ? null : selectedColumns
        };

        try {
            await API.post(`/sync/${activeConfigId}/rules`, payload);
            onSuccess();
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to save pipeline properties.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 max-w-2xl w-full overflow-hidden transform transition-all">
                <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        Sync Pipeline Configuration: <span className="text-blue-400 font-mono text-base">{tableName}</span>
                    </h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sync Frequency</label>
                            <select
                                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                                value={syncFrequency} onChange={(e) => setSyncFrequency(e.target.value)}
                            >
                                <option value="manual">Manual Trigger Only</option>
                                <option value="hourly">Scheduled Execution (Hourly)</option>
                                <option value="daily">Scheduled Execution (Daily)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Loading Strategy</label>
                            <select
                                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                                value={syncStrategy} onChange={(e) => setSyncStrategy(e.target.value)}
                            >
                                <option value="full_load">Full Overwrite Extract</option>
                                <option value="incremental" disabled>Incremental Delta Sync (Pro)</option>
                            </select>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex justify-between items-center">
                            <span>Select Columns to Extract</span>
                            <span className="text-blue-400 normal-case text-xs">{selectedColumns.length} of {columns.length} selected</span>
                        </label>
                        
                        {fetchingCols ? (
                            <div className="h-40 flex items-center justify-center bg-slate-800/50 rounded-lg border border-slate-700 border-dashed">
                                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-800/30 rounded-lg border border-slate-700">
                                {columns.map(col => (
                                    <label key={col} className="flex items-center space-x-2 p-2 rounded hover:bg-slate-800 cursor-pointer transition-colors group">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedColumns.includes(col)}
                                            onChange={() => toggleColumn(col)}
                                            className="w-4 h-4 text-blue-500 bg-slate-900 border-slate-600 rounded focus:ring-blue-500 focus:ring-offset-slate-900" 
                                        />
                                        <span className="text-sm font-mono text-slate-300 group-hover:text-white truncate">{col}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                        <button
                            type="button" onClick={onClose}
                            className="px-5 py-2.5 border border-slate-700 text-sm font-bold rounded-lg text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit" disabled={loading || fetchingCols}
                            className="px-5 py-2.5 border border-transparent text-sm font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50"
                        >
                            {loading ? 'Saving Configuration...' : 'Save Architecture'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
