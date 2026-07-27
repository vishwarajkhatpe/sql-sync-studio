import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ConnectionSidebar from '../components/ConnectionSidebar';
import ConnectionForm from '../components/ConnectionForm';
import SchemaExplorer from '../components/SchemaExplorer';
import DataGrid from '../components/DataGrid';
import TelemetryPanel from '../components/TelemetryPanel';
import SyncConfigModal from '../components/SyncConfigModal';
import CustomSQL from '../components/CustomSQL';
import API from '../services/api';

export default function Dashboard() {
    const [activeConfigId, setActiveConfigId] = useState(null);
    const [databases, setDatabases] = useState([]);
    const [showConnectionForm, setShowConnectionForm] = useState(false);
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState('');
    const [extractedData, setExtractedData] = useState([]);
    const [extractionLoading, setExtractionLoading] = useState(false);
    const [pagination, setPagination] = useState(null);
    const [syncLogs, setSyncLogs] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTable, setModalTable] = useState('');
    const [activeTab, setActiveTab] = useState('grid');

    useEffect(() => { loadDatabases(); }, []);

    useEffect(() => {
        if (activeConfigId) {
            setShowConnectionForm(false);
            loadTables(activeConfigId);
            loadTelemetry(activeConfigId);
            setSelectedTable('');
            setExtractedData([]);
            setPagination(null);
        } else {
            setTables([]); setSelectedTable(''); setExtractedData([]);
            setPagination(null); setSyncLogs([]);
        }
    }, [activeConfigId]);

    const loadDatabases = async () => {
        try {
            const res = await API.get('/databases/');
            setDatabases(res.data);
            if (res.data.length > 0 && !activeConfigId) setActiveConfigId(res.data[0].id);
            else if (res.data.length === 0) setShowConnectionForm(true);
        } catch (err) { console.error('Failed to load databases:', err); }
    };

    const loadTables = async (configId) => {
        try { const res = await API.get(`/databases/${configId}/tables`); setTables(res.data); }
        catch (err) { console.error(err); setTables([]); }
    };

    const loadTelemetry = async (configId) => {
        try { const res = await API.get(`/sync/${configId}/logs`); setSyncLogs(res.data); }
        catch (err) { console.error(err); }
    };

    const handleTriggerExtraction = async (tableName, page = 1) => {
        if (!activeConfigId) return;
        setExtractionLoading(true);
        setSelectedTable(tableName);
        try {
            const response = await API.post(`/sync/${activeConfigId}/extract/${tableName}?page=${page}&page_size=100`);
            setExtractedData(response.data.data);
            setPagination({
                page: response.data.page, total_pages: response.data.total_pages,
                total_count: response.data.total_count, activeConfigId
            });
            loadTelemetry(activeConfigId);
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to extract records.');
        } finally { setExtractionLoading(false); }
    };

    const handleDeleteConnection = async (configId) => {
        if (window.confirm("Delete this connection and all associated data?")) {
            try {
                await API.delete(`/databases/${configId}`);
                if (activeConfigId === configId) setActiveConfigId(null);
                loadDatabases();
            } catch (err) { alert(err.response?.data?.detail || 'Failed to delete.'); }
        }
    };

    return (
        <div className="min-h-screen flex flex-col font-sans selection:bg-violet-200/50">
            <Navbar />

            <div className="flex-1 flex overflow-hidden relative">
                {/* Background ambient orbs */}
                <div className="fixed top-32 left-[20%] w-[500px] h-[500px] bg-violet-300/10 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="fixed bottom-0 right-[15%] w-[400px] h-[400px] bg-sky-300/10 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="fixed top-[60%] left-[60%] w-[300px] h-[300px] bg-rose-200/10 rounded-full blur-[100px] pointer-events-none"></div>

                <ConnectionSidebar
                    activeConfigId={activeConfigId}
                    setActiveConfigId={setActiveConfigId}
                    databases={databases}
                    onAddNew={() => { setActiveConfigId(null); setShowConnectionForm(true); }}
                    onDeleteConnection={handleDeleteConnection}
                />

                <main className="flex-1 flex overflow-hidden p-5 gap-5 relative z-10">
                    {showConnectionForm ? (
                        <div className="flex-1 flex items-center justify-center">
                            <ConnectionForm
                                onSuccess={(id) => { loadDatabases(); setActiveConfigId(id); }}
                                onCancel={databases.length > 0 ? () => setShowConnectionForm(false) : null}
                            />
                        </div>
                    ) : (
                        <div className="flex-1 flex gap-5 w-full h-full min-w-0">
                            {/* Left Column: Schema & Telemetry */}
                            <div className="w-[340px] shrink-0 flex flex-col gap-5">
                                <div className="flex-1 min-h-[300px]">
                                    <SchemaExplorer
                                        tables={tables}
                                        selectedTable={selectedTable}
                                        onSelectTable={(t) => handleTriggerExtraction(t, 1)}
                                        onConfigureSync={(t) => { setModalTable(t); setIsModalOpen(true); }}
                                    />
                                </div>
                                <div className="h-[280px]">
                                    <TelemetryPanel logs={syncLogs} activeConfigId={activeConfigId} onRefresh={loadTelemetry} />
                                </div>
                            </div>

                            {/* Right Column: Data + SQL */}
                            <div className="flex-1 min-w-[500px] flex flex-col h-full">
                                {/* Tab Switcher */}
                                <div className="glass rounded-xl p-1 flex gap-1 mb-4 w-fit shadow-sm">
                                    <button
                                        className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                                            activeTab === 'grid'
                                                ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-md shadow-violet-500/20'
                                                : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'
                                        }`}
                                        onClick={() => setActiveTab('grid')}
                                    >
                                        📊 Data Preview
                                    </button>
                                    <button
                                        className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                                            activeTab === 'sql'
                                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/20'
                                                : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'
                                        }`}
                                        onClick={() => setActiveTab('sql')}
                                    >
                                        💻 SQL Console
                                    </button>
                                </div>
                                <div className="flex-1 min-h-0">
                                    {activeTab === 'grid' ? (
                                        <DataGrid
                                            data={extractedData} loading={extractionLoading}
                                            selectedTable={selectedTable} pagination={pagination}
                                            onPageChange={(p) => handleTriggerExtraction(selectedTable, p)}
                                        />
                                    ) : (
                                        <CustomSQL activeConfigId={activeConfigId} />
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            <SyncConfigModal
                activeConfigId={activeConfigId} tableName={modalTable}
                isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
                onSuccess={() => setIsModalOpen(false)}
            />
        </div>
    );
}