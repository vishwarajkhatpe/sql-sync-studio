import React from 'react';

export default function SchemaExplorer({ tables, selectedTable, onSelectTable, onConfigureSync }) {
    if (tables.length === 0) {
        return (
            <div className="glass rounded-2xl flex flex-col items-center justify-center p-12 text-center h-full shadow-sm animate-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
                </div>
                <p className="text-sm font-bold text-gray-500">No schema loaded</p>
                <p className="text-xs text-gray-400 mt-1">Connect a data source to start exploring.</p>
            </div>
        );
    }

    return (
        <div className="glass rounded-2xl shadow-sm flex flex-col h-full overflow-hidden">
            <div className="p-5 border-b border-gray-200/40">
                <div className="flex justify-between items-center mb-1">
                    <h3 className="text-base font-black text-gray-800 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-sm">
                            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                        </div>
                        Schema Tables
                    </h3>
                    <span className="px-2.5 py-1 bg-violet-50 text-violet-600 text-[10px] font-bold rounded-lg border border-violet-200/60 uppercase tracking-wider">
                        {tables.length} Found
                    </span>
                </div>
                <p className="text-[11px] text-gray-400 font-medium mt-1">Click a table to preview data, or configure sync rules.</p>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
                <div className="space-y-2">
                    {tables.map((tableName, idx) => {
                        const isSelected = selectedTable === tableName;
                        return (
                            <div
                                key={idx}
                                onClick={() => onSelectTable(tableName)}
                                className={`group p-3.5 rounded-xl cursor-pointer transition-all flex items-center justify-between animate-slide-up ${
                                    isSelected
                                        ? 'bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200/60 shadow-md shadow-violet-100/50'
                                        : 'bg-white/40 border border-transparent hover:bg-white/80 hover:border-gray-200/60 hover:shadow-sm'
                                }`}
                                style={{ animationDelay: `${idx * 0.04}s`, opacity: 0 }}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                                        isSelected ? 'bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-sm' : 'bg-gray-100 text-gray-400 group-hover:bg-violet-100 group-hover:text-violet-500'
                                    }`}>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                    </div>
                                    <span className={`text-sm font-semibold truncate ${isSelected ? 'text-violet-700' : 'text-gray-600'}`}>{tableName}</span>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onConfigureSync(tableName); }}
                                    className={`shrink-0 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                                        isSelected
                                            ? 'bg-violet-500 text-white shadow-sm hover:bg-violet-600'
                                            : 'bg-gray-100 text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-violet-100 hover:text-violet-600'
                                    }`}
                                >
                                    ⚙ Sync
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
