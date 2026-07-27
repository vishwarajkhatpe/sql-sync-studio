import React from 'react';

export default function ConnectionSidebar({
    activeConfigId,
    setActiveConfigId,
    onAddNew,
    databases,
    onDeleteConnection
}) {
    return (
        <div className="w-72 glass-strong border-r border-white/40 flex flex-col h-[calc(100vh-64px)] overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-200/40 flex justify-between items-center">
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Connections</h2>
                <button
                    onClick={onAddNew}
                    className="p-2 bg-violet-50 text-violet-600 hover:bg-violet-100 rounded-lg transition-all cursor-pointer shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
                    title="Add New Connection"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {databases.length === 0 ? (
                    <div className="text-center p-6 animate-fade-in">
                        <div className="w-12 h-12 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"></path></svg>
                        </div>
                        <p className="text-xs text-gray-400 font-medium">No saved connections</p>
                        <p className="text-[10px] text-gray-400 mt-1">Click + to add one</p>
                    </div>
                ) : (
                    databases.map((db, i) => {
                        const isActive = activeConfigId === db.id;
                        return (
                            <div
                                key={db.id}
                                onClick={() => setActiveConfigId(db.id)}
                                className={`group p-3.5 rounded-xl transition-all cursor-pointer flex flex-col gap-2 relative animate-slide-in ${
                                    isActive
                                        ? 'bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200/60 shadow-md shadow-violet-100/50'
                                        : 'bg-white/40 border border-transparent hover:bg-white/70 hover:border-gray-200/60 hover:shadow-sm'
                                }`}
                                style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}
                            >
                                <div className="flex justify-between items-center">
                                    <span className={`font-bold text-sm truncate ${isActive ? 'text-violet-700' : 'text-gray-700'}`}>
                                        {db.connection_name}
                                    </span>
                                    <div className={`w-2.5 h-2.5 rounded-full transition-all ${
                                        isActive
                                            ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                                            : 'bg-gray-300'
                                    }`}></div>
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium">
                                    <span className={`px-2 py-0.5 rounded-md ${isActive ? 'bg-violet-100 text-violet-600' : 'bg-gray-100 text-gray-500'} font-bold uppercase text-[10px]`}>
                                        {db.db_type}
                                    </span>
                                    <span className="truncate max-w-[120px] font-mono text-[10px]">{db.host}:{db.port}</span>
                                </div>

                                <button
                                    onClick={(e) => { e.stopPropagation(); onDeleteConnection(db.id); }}
                                    className="absolute top-2 right-2 p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-50"
                                    title="Delete Connection"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
