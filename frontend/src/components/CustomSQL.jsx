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
        <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-xl flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-900/80">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                    Custom SQL Console
                </h3>
                <div className="relative">
                    <textarea
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="SELECT * FROM table_name WHERE condition..."
                        className="w-full h-24 bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm font-mono text-emerald-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    ></textarea>
                    <button
                        onClick={handleExecute}
                        disabled={loading || !query.trim()}
                        className="absolute bottom-3 right-3 px-4 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold rounded-md shadow-lg transition-colors cursor-pointer"
                    >
                        {loading ? 'Running...' : 'Execute'}
                    </button>
                </div>
                {error && (
                    <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono rounded">
                        {error}
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-auto bg-slate-950">
                {data ? (
                    data.length > 0 ? (
                        <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
                            <thead className="bg-slate-900 sticky top-0 z-10">
                                <tr>
                                    {Object.keys(data[0]).map((header) => (
                                        <th key={header} className="px-4 py-3 font-mono text-xs font-bold text-slate-400 uppercase bg-slate-900 border-b border-slate-800 whitespace-nowrap">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50 text-slate-300">
                                {data.map((row, rowIdx) => (
                                    <tr key={rowIdx} className="hover:bg-slate-800/30">
                                        {Object.values(row).map((val, cellIdx) => (
                                            <td key={cellIdx} className="px-4 py-2 font-normal whitespace-nowrap max-w-[250px] truncate">
                                                {val === null ? <span className="text-slate-600 italic">NULL</span> : String(val)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-8 text-center text-slate-500 text-sm">Query returned 0 rows.</div>
                    )
                ) : (
                    <div className="p-8 text-center flex flex-col items-center opacity-50">
                        <svg className="w-12 h-12 text-slate-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        <span className="text-sm">Enter a SELECT query above and execute.</span>
                    </div>
                )}
            </div>
        </div>
    );
}
