import React from 'react';
import API from '../services/api';

export default function TelemetryPanel({ logs, onRefresh, activeConfigId }) {
    return (
        <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-xl flex flex-col h-full overflow-hidden">
            <div className="p-5 border-b border-slate-800 bg-slate-900/80 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    Pipeline Activity Log
                </h3>
                <button
                    onClick={() => { if (activeConfigId) onRefresh(activeConfigId); }}
                    className="p-1.5 rounded-md bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                    title="Refresh Logs"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-slate-950">
                {logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <svg className="w-8 h-8 text-slate-700 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                        <p className="text-xs font-semibold text-slate-500">No telemetry recorded.</p>
                        <p className="text-xs text-slate-600 mt-1">Execute a sync pipeline to generate logs.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {logs.map((log) => (
                            <div key={log.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2.5 h-2.5 rounded-full ${
                                            log.status === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 
                                            log.status === 'failed' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 
                                            'bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]'
                                        }`}></div>
                                        <span className="font-bold text-sm text-slate-300">Run #{log.id}</span>
                                        <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-blue-400 font-mono text-xs rounded-md">
                                            {log.table_name}
                                        </span>
                                    </div>
                                    <span className="text-xs font-medium text-slate-500">
                                        {new Date(log.started_at).toLocaleString()}
                                    </span>
                                </div>
                                
                                {log.status === 'failed' && log.error_message ? (
                                    <div className="mt-1 p-2 bg-red-500/10 border border-red-500/20 rounded-md">
                                        <p className="text-xs font-mono text-red-400 break-words">{log.error_message}</p>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800/50">
                                        <span>Extracted</span>
                                        <span className="font-bold text-slate-300">{log.record_count} Records</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
