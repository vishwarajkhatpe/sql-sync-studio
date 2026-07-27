import React from 'react';
import ExportData from './ExportData';

export default function DataGrid({ 
    data, 
    loading, 
    selectedTable, 
    pagination, 
    onPageChange 
}) {
    return (
        <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-xl flex flex-col h-full overflow-hidden">
            <div className="p-5 border-b border-slate-800 bg-slate-900/80 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path></svg>
                        Live Data Terminal
                    </h3>
                    {selectedTable && (
                        <p className="text-xs text-slate-400 mt-1">
                            Inspecting: <span className="font-mono text-emerald-400 font-bold">{selectedTable}</span>
                        </p>
                    )}
                </div>
                {selectedTable && pagination && (
                    <div className="flex items-center gap-4">
                        <ExportData activeConfigId={pagination.activeConfigId || ''} tableName={selectedTable} />
                        <span className="text-xs font-bold bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-md">
                            Total Records: {pagination.total_count}
                        </span>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 bg-slate-900">
                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-semibold text-indigo-400 mt-4 animate-pulse">Running optimized SELECT extraction stream...</p>
                </div>
            ) : data && data.length > 0 ? (
                <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
                    <div className="flex-1 overflow-auto">
                        <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
                            <thead className="bg-slate-900 sticky top-0 z-10 shadow-sm">
                                <tr>
                                    {Object.keys(data[0]).map((header) => (
                                        <th key={header} className="px-6 py-4 font-mono text-xs font-bold text-slate-300 uppercase tracking-wider whitespace-nowrap bg-slate-900 border-b border-slate-800">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50 text-slate-400">
                                {data.map((row, rowIdx) => (
                                    <tr key={rowIdx} className="hover:bg-slate-800/50 transition-colors">
                                        {Object.values(row).map((val, cellIdx) => (
                                            <td key={cellIdx} className="px-6 py-3 font-normal whitespace-nowrap max-w-[300px] truncate">
                                                {val === null ? <span className="text-slate-600 italic text-xs font-semibold bg-slate-800 px-1.5 py-0.5 rounded">NULL</span> : String(val)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination Controls */}
                    {pagination && pagination.total_pages > 1 && (
                        <div className="bg-slate-900 border-t border-slate-800 p-3 flex justify-between items-center">
                            <span className="text-xs text-slate-400">
                                Page <span className="font-bold text-white">{pagination.page}</span> of <span className="font-bold text-white">{pagination.total_pages}</span>
                            </span>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => onPageChange(pagination.page - 1)}
                                    disabled={pagination.page <= 1}
                                    className="px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg border border-slate-700 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Previous
                                </button>
                                <button 
                                    onClick={() => onPageChange(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.total_pages}
                                    className="px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg border border-slate-700 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-900">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                    </div>
                    <p className="text-sm font-semibold text-slate-400">No data extraction stream active.</p>
                    <p className="text-xs text-slate-500 mt-2">Select a table schema to trigger immediate data extraction preview.</p>
                </div>
            )}
        </div>
    );
}
