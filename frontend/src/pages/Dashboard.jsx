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
    // Application State
    const [activeConfigId, setActiveConfigId] = useState(null);
    const [databases, setDatabases] = useState([]);
    
    // UI State
    const [showConnectionForm, setShowConnectionForm] = useState(false);
    
    // Metadata State
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState('');
    
    // Extraction State
    const [extractedData, setExtractedData] = useState([]);
    const [extractionLoading, setExtractionLoading] = useState(false);
    const [pagination, setPagination] = useState(null);
    
    // Telemetry State
    const [syncLogs, setSyncLogs] = useState([]);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTable, setModalTable] = useState('');
    
    // Tab State
    const [activeTab, setActiveTab] = useState('grid'); // 'grid' or 'sql'

    useEffect(() => {
        loadDatabases();
    }, []);

    useEffect(() => {
        if (activeConfigId) {
            setShowConnectionForm(false);
            loadTables(activeConfigId);
            loadTelemetry(activeConfigId);
            setSelectedTable('');
            setExtractedData([]);
            setPagination(null);
        } else {
            setTables([]);
            setSelectedTable('');
            setExtractedData([]);
            setPagination(null);
            setSyncLogs([]);
        }
    }, [activeConfigId]);

    const loadDatabases = async () => {
        try {
            const res = await API.get('/databases/');
            setDatabases(res.data);
            if (res.data.length > 0 && !activeConfigId) {
                setActiveConfigId(res.data[0].id);
            } else if (res.data.length === 0) {
                setShowConnectionForm(true);
            }
        } catch (err) {
            console.error('Failed to load databases:', err);
        }
    };

    const loadTables = async (configId) => {
        try {
            const res = await API.get(`/databases/${configId}/tables`);
            setTables(res.data);
        } catch (err) {
            console.error('Failed to load tables:', err);
            setTables([]);
        }
    };

    const loadTelemetry = async (configId) => {
        try {
            const res = await API.get(`/sync/${configId}/logs`);
            setSyncLogs(res.data);
        } catch (err) {
            console.error('Failed to load telemetry:', err);
        }
    };

    const handleTriggerExtraction = async (tableName, page = 1) => {
        if (!activeConfigId) return;
        setExtractionLoading(true);
        setSelectedTable(tableName);
        
        try {
            const response = await API.post(`/sync/${activeConfigId}/extract/${tableName}?page=${page}&page_size=100`);
            setExtractedData(response.data.data);
            setPagination({
                page: response.data.page,
                total_pages: response.data.total_pages,
                total_count: response.data.total_count,
                activeConfigId: activeConfigId
            });
            // Refresh telemetry after manual extraction
            loadTelemetry(activeConfigId);
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to extract records.');
        } finally {
            setExtractionLoading(false);
        }
    };

    const openSyncModal = (tableName) => {
        setModalTable(tableName);
        setIsModalOpen(true);
    };

    const handleDeleteConnection = async (configId) => {
        if (window.confirm("Are you sure you want to delete this connection and all associated data?")) {
            try {
                await API.delete(`/databases/${configId}`);
                if (activeConfigId === configId) {
                    setActiveConfigId(null);
                }
                loadDatabases();
            } catch (err) {
                alert(err.response?.data?.detail || 'Failed to delete connection.');
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col font-sans selection:bg-blue-500/30">
            <Navbar />
            
            <div className="flex-1 flex overflow-hidden">
                <ConnectionSidebar 
                    activeConfigId={activeConfigId} 
                    setActiveConfigId={setActiveConfigId}
                    databases={databases}
                    onAddNew={() => {
                        setActiveConfigId(null);
                        setShowConnectionForm(true);
                    }}
                    onDeleteConnection={handleDeleteConnection}
                />
                
                <main className="flex-1 flex overflow-hidden p-6 gap-6 relative">
                    {/* Background glow effects */}
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none"></div>

                    {showConnectionForm ? (
                        <div className="flex-1 flex items-center justify-center z-10">
                            <ConnectionForm 
                                onSuccess={(id) => {
                                    loadDatabases();
                                    setActiveConfigId(id);
                                }} 
                                onCancel={databases.length > 0 ? () => setShowConnectionForm(false) : null}
                            />
                        </div>
                    ) : (
                        <div className="flex-1 flex gap-6 z-10 w-full h-full min-w-0">
                            {/* Middle Column: Schema & Telemetry */}
                            <div className="w-1/3 flex flex-col gap-6 min-w-[320px]">
                                <div className="flex-1 min-h-[300px]">
                                    <SchemaExplorer 
                                        tables={tables}
                                        selectedTable={selectedTable}
                                        onSelectTable={(t) => handleTriggerExtraction(t, 1)}
                                        onConfigureSync={openSyncModal}
                                    />
                                </div>
                                <div className="h-1/3 min-h-[250px]">
                                    <TelemetryPanel 
                                        logs={syncLogs} 
                                        activeConfigId={activeConfigId}
                                        onRefresh={loadTelemetry}
                                    />
                                </div>
                            </div>
                            
                            {/* Right Column: Data Grid / Custom SQL */}
                            <div className="flex-1 min-w-[500px] flex flex-col h-full">
                                <div className="flex border-b border-slate-800 mb-4 pb-0 z-20 relative">
                                    <button 
                                        className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'grid' ? 'border-blue-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                                        onClick={() => setActiveTab('grid')}
                                    >
                                        Live Extraction Grid
                                    </button>
                                    <button 
                                        className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'sql' ? 'border-purple-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                                        onClick={() => setActiveTab('sql')}
                                    >
                                        Custom SQL Console
                                    </button>
                                </div>
                                <div className="flex-1 min-h-0 relative z-20">
                                    {activeTab === 'grid' ? (
                                        <DataGrid 
                                            data={extractedData}
                                            loading={extractionLoading}
                                            selectedTable={selectedTable}
                                            pagination={pagination}
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
                activeConfigId={activeConfigId}
                tableName={modalTable}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setIsModalOpen(false);
                    // optionally show a toast
                }}
            />
        </div>
    );
}