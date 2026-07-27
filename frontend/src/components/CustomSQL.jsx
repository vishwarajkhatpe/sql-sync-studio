import React, { useState } from 'react';
import API from '../services/api';

export default function CustomSQL({ activeConfigId }) {
    const [query, setQuery] = useState('');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleExecute = async () => {
        if (!query.trim()) return;
        setLoading(true);
        setError('');
        setData(null);
        try {
            const res = await API.post(`/sync/${activeConfigId}/custom-sql`, { query });
            setData(res.data.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Query execution failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass rounded-2xl shadow-sm flex flex-col h-full overflow-hidden">
            <div className="p-5 border-b border-gray-200/40">
                <h3 className="text-base font-black text-gray-800 flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-sm">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                    </div>
                    SQL Console
                </h3>
                <div className="relative">
                    <textarea
                        value={query} onChange={(e) => setQuery(e.target.value)}
                        placeholder="SELECT * FROM table_name WHERE ..."
                        className="w-full h-24 bg-white/40 border border-gray-200/80 rounded-xl p-4 text-sm font-mono text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-300 resize-none transition-all"
                    ></textarea>
                    <button onClick={handleExecute} disabled={loading || !query.trim()}
                        className="absolute bottom-3 right-3 px-4 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-md shadow-purple-500/20 transition-all cursor-pointer active:scale-95">
                        {loading ? (
                            <span className="flex items-center gap-1.5">
                                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                                Running
                            </span>
                        ) : '▶ Execute'}
                    </button>
                </div>
                {error && (
                    <div className="mt-3 p-3 bg-red-50/80 border border-red-200/60 text-red-500 text-xs font-mono rounded-xl animate-slide-up">
                        {error}
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-auto">
                {data ? (
                    data.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200/50 text-left text-sm">
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-gradient-to-r from-gray-50/90 to-purple-50/40 backdrop-blur-md">
                                    {Object.keys(data[0]).map((header) => (
                                        <th key={header} className="px-5 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap border-b border-gray-200/50">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100/60">
                                {data.map((row, rowIdx) => (
                                    <tr key={rowIdx} className="hover:bg-purple-50/30 transition-colors">
                                        {Object.values(row).map((val, cellIdx) => (
                                            <td key={cellIdx} className="px-5 py-2.5 text-gray-600 font-medium whitespace-nowrap max-w-[250px] truncate text-sm">
                                                {val === null ? <span className="text-gray-300 italic text-xs font-bold bg-gray-100 px-2 py-0.5 rounded">NULL</span> : String(val)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-8 text-center text-gray-400 text-sm font-medium">Query returned 0 rows.</div>
                    )
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 opacity-50 animate-fade-in">
                        <svg className="w-10 h-10 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        <p className="text-sm text-gray-400 font-medium">Write a SELECT query and execute it.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
