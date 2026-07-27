import React, { useEffect, useState } from 'react';
import API from '../services/api';

export default function ConnectionSidebar({
    activeConfigId,
    setActiveConfigId,
    onAddNew,
    databases,
    onDeleteConnection
}) {
    return (
        <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Saved Connections</h2>
                <button
                    onClick={onAddNew}
                    className="p-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded-md transition-colors cursor-pointer"
                    title="Add New Connection"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {databases.length === 0 ? (
                    <div className="text-center p-4">
                        <p className="text-xs text-slate-500 italic">No saved connections.</p>
                    </div>
                ) : (
                    databases.map((db) => (
                        <div
                            key={db.id}
                            onClick={() => setActiveConfigId(db.id)}
                            className={`group p-3 rounded-lg border transition-all cursor-pointer flex flex-col gap-1 relative ${
                                activeConfigId === db.id 
                                ? 'bg-blue-900/30 border-blue-500/50 shadow-inner' 
                                : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
                            }`}
                        >
                            <div className="flex justify-between items-center">
                                <span className={`font-semibold text-sm ${activeConfigId === db.id ? 'text-blue-300' : 'text-slate-300'}`}>
                                    {db.connection_name}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${activeConfigId === db.id ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`}></span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-slate-500">
                                <span className="font-mono">{db.db_type.toUpperCase()}</span>
                                <span className="truncate max-w-[120px]">{db.host}:{db.port}</span>
                            </div>
                            
                            <button 
                                onClick={(e) => { e.stopPropagation(); onDeleteConnection(db.id); }}
                                className={`absolute top-2 right-2 p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-slate-800 ${activeConfigId === db.id ? 'opacity-100' : ''}`}
                                title="Delete Connection"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
