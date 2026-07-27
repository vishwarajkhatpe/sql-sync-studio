import React from 'react';

export default function SchemaExplorer({ tables, selectedTable, onSelectTable, onConfigureSync }) {
    if (tables.length === 0) {
        return (
            <div className="border border-dashed border-slate-700 bg-slate-800/20 rounded-xl flex flex-col items-center justify-center p-12 text-center h-full">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
                </div>
                <p className="text-sm font-semibold text-slate-400">No active connection database schema loaded.</p>
                <p className="text-xs text-slate-500 mt-2">Connect a data source to begin interrogating the metadata.</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-xl flex flex-col h-full overflow-hidden">
            <div className="p-5 border-b border-slate-800 bg-slate-900/80">
                <div className="flex justify-between items-center mb-1">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                        Schema Tables
                    </h3>
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-xs font-bold rounded-md border border-slate-700">
                        {tables.length} Detected
                    </span>
                </div>
                <p className="text-xs text-slate-500">
                    Select a table to view live records or configure sync properties.
                </p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {tables.map((tableName, idx) => {
                        const isSelected = selectedTable === tableName;
                        return (
                            <div
                                key={idx}
                                onClick={() => onSelectTable(tableName)}
                                className={`group p-4 border rounded-xl cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                                    isSelected
                                        ? 'bg-blue-900/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/30'
                                        : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600 hover:shadow-md'
                                }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                    </div>
                                    <span className={`text-sm font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                                        {tableName}
                                    </span>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onConfigureSync(tableName); }}
                                    className={`w-full py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                        isSelected 
                                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm' 
                                        : 'bg-slate-700 hover:bg-indigo-600 text-slate-300 hover:text-white opacity-0 group-hover:opacity-100'
                                    }`}
                                >
                                    Configure Sync
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
