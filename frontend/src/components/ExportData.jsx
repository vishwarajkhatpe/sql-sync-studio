import React, { useState } from 'react';
import API from '../services/api';

export default function ExportData({ activeConfigId, tableName }) {
    const [loading, setLoading] = useState(false);

    const handleExport = async (format) => {
        setLoading(true);
        try {
            const res = await API.get(`/sync/${activeConfigId}/export/${tableName}/${format}`, {
                responseType: 'blob', // Important for downloading files
            });
            
            // Create a download link
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${tableName}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            alert(err.response?.data?.detail || `Failed to export ${format.toUpperCase()}.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={() => handleExport('csv')}
                disabled={loading}
                className="px-3 py-1.5 bg-slate-800 text-blue-400 text-xs font-bold rounded-lg border border-slate-700 hover:bg-slate-700 hover:text-white disabled:opacity-50 transition-colors flex items-center gap-1"
                title="Export as CSV"
            >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                CSV
            </button>
            <button
                onClick={() => handleExport('json')}
                disabled={loading}
                className="px-3 py-1.5 bg-slate-800 text-amber-400 text-xs font-bold rounded-lg border border-slate-700 hover:bg-slate-700 hover:text-white disabled:opacity-50 transition-colors flex items-center gap-1"
                title="Export as JSON"
            >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                JSON
            </button>
        </div>
    );
}
