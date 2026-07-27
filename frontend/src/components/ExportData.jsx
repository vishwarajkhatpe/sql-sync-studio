import React, { useState } from 'react';
import API from '../services/api';

export default function ExportData({ activeConfigId, tableName }) {
    const [loading, setLoading] = useState(false);

    const handleExport = async (format) => {
        setLoading(true);
        try {
            const res = await API.get(`/sync/${activeConfigId}/export/${tableName}/${format}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${tableName}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            alert(err.response?.data?.detail || `Export failed.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex gap-1.5">
            <button onClick={() => handleExport('csv')} disabled={loading}
                className="px-3 py-1.5 bg-white/60 text-emerald-600 text-[11px] font-bold rounded-lg border border-emerald-200/60 hover:bg-emerald-50 hover:border-emerald-300 disabled:opacity-50 transition-all flex items-center gap-1 shadow-sm">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                CSV
            </button>
            <button onClick={() => handleExport('json')} disabled={loading}
                className="px-3 py-1.5 bg-white/60 text-amber-600 text-[11px] font-bold rounded-lg border border-amber-200/60 hover:bg-amber-50 hover:border-amber-300 disabled:opacity-50 transition-all flex items-center gap-1 shadow-sm">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                JSON
            </button>
        </div>
    );
}
