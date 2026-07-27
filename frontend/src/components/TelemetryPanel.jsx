import React from 'react';

export default function TelemetryPanel({ logs, onRefresh, activeConfigId }) {
    return (
        <div className="glass rounded-2xl shadow-sm flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-gray-200/40 flex justify-between items-center">
                <h3 className="text-sm font-black text-gray-800 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </div>
                    Activity Log
                </h3>
                <button
                    onClick={() => { if (activeConfigId) onRefresh(activeConfigId); }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-all"
                    title="Refresh"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
                {logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in py-6">
                        <svg className="w-6 h-6 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                        <p className="text-[11px] font-semibold text-gray-400">No activity yet</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {logs.map((log, i) => (
                            <div key={log.id} className="p-3 bg-white/50 border border-gray-100/60 rounded-xl hover:border-violet-200/60 hover:shadow-sm transition-all animate-slide-up" style={{ animationDelay: `${i * 0.03}s`, opacity: 0 }}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${
                                            log.status === 'success' ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]' :
                                            log.status === 'failed' ? 'bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.6)]' :
                                            'bg-amber-400 animate-pulse'
                                        }`}></div>
                                        <span className="text-xs font-bold text-gray-600">#{log.id}</span>
                                        <span className="px-2 py-0.5 bg-violet-50 text-violet-600 font-mono text-[10px] font-bold rounded-md border border-violet-200/40">
                                            {log.table_name}
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-medium text-gray-400">
                                        {new Date(log.started_at).toLocaleString()}
                                    </span>
                                </div>

                                {log.status === 'failed' && log.error_message ? (
                                    <div className="p-2 bg-red-50/60 border border-red-200/40 rounded-md">
                                        <p className="text-[10px] font-mono text-red-500 truncate">{log.error_message}</p>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between text-[11px] text-gray-400 bg-gray-50/60 px-3 py-1.5 rounded-lg">
                                        <span className="font-medium">Extracted</span>
                                        <span className="font-bold text-gray-600">{log.record_count || 0} records</span>
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
