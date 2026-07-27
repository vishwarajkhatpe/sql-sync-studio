import React from 'react';
import ExportData from './ExportData';

export default function DataGrid({ data, loading, selectedTable, pagination, onPageChange }) {
    return (
        <div className="glass rounded-2xl shadow-sm flex flex-col h-full overflow-hidden">
            <div className="p-5 border-b border-gray-200/40 flex justify-between items-center">
                <div>
                    <h3 className="text-base font-black text-gray-800 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-sm">
                            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path></svg>
                        </div>
                        Data Preview
                    </h3>
                    {selectedTable && (
                        <p className="text-[11px] text-gray-400 mt-1 font-medium">
                            Viewing: <span className="font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">{selectedTable}</span>
                        </p>
                    )}
                </div>
                {selectedTable && pagination && (
                    <div className="flex items-center gap-3">
                        <ExportData activeConfigId={pagination.activeConfigId || ''} tableName={selectedTable} />
                        <span className="text-[11px] font-bold bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg">
                            {pagination.total_count.toLocaleString()} rows
                        </span>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12">
                    <div className="w-10 h-10 border-[3px] border-violet-300 border-t-violet-600 rounded-full animate-spin"></div>
                    <p className="text-sm font-semibold text-gray-400 mt-4 animate-pulse-soft">Extracting records...</p>
                </div>
            ) : data && data.length > 0 ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-auto">
                        <table className="min-w-full divide-y divide-gray-200/50 text-left text-sm">
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-gradient-to-r from-gray-50/90 to-violet-50/40 backdrop-blur-md">
                                    {Object.keys(data[0]).map((header) => (
                                        <th key={header} className="px-5 py-3.5 text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap border-b border-gray-200/50">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100/60">
                                {data.map((row, rowIdx) => (
                                    <tr key={rowIdx} className="hover:bg-violet-50/30 transition-colors group">
                                        {Object.values(row).map((val, cellIdx) => (
                                            <td key={cellIdx} className="px-5 py-3 text-gray-600 font-medium whitespace-nowrap max-w-[280px] truncate text-sm">
                                                {val === null
                                                    ? <span className="text-gray-300 italic text-xs font-bold bg-gray-100 px-2 py-0.5 rounded">NULL</span>
                                                    : String(val)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.total_pages > 1 && (
                        <div className="border-t border-gray-200/40 p-3 flex justify-between items-center bg-white/40 backdrop-blur-sm">
                            <span className="text-xs text-gray-400 font-medium">
                                Page <span className="font-bold text-gray-700">{pagination.page}</span> of <span className="font-bold text-gray-700">{pagination.total_pages}</span>
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onPageChange(pagination.page - 1)}
                                    disabled={pagination.page <= 1}
                                    className="px-4 py-1.5 bg-white text-gray-600 text-xs font-bold rounded-lg border border-gray-200/80 hover:bg-violet-50 hover:border-violet-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm">
                                    ← Prev
                                </button>
                                <button
                                    onClick={() => onPageChange(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.total_pages}
                                    className="px-4 py-1.5 bg-white text-gray-600 text-xs font-bold rounded-lg border border-gray-200/80 hover:bg-violet-50 hover:border-violet-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm">
                                    Next →
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-fade-in">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-violet-50 flex items-center justify-center mb-4">
                        <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path></svg>
                    </div>
                    <p className="text-sm font-bold text-gray-400">No data to display</p>
                    <p className="text-xs text-gray-400 mt-1">Select a table to preview its records.</p>
                </div>
            )}
        </div>
    );
}
