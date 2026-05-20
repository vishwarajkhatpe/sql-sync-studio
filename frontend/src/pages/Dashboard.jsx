import React from 'react';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Top Navbar */}
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <span className="text-xl font-bold text-blue-600 tracking-tight">
                                SQL Sync Studio
                            </span>
                            <span className="ml-4 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Sandbox Environment
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600 font-medium">
                                {user?.email}
                            </span>
                            <button
                                onClick={logout}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content Workspace */}
            <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Welcome to your SQL Analytics Workspace
                        </h2>
                        <p className="text-gray-600 mb-6">
                            This sandbox is connected to your isolated MySQL workspace. You can safely run complex analytics, modify dataset rows, and simulate schema alterations here without affecting your production databases.
                        </p>

                        {/* Empty State placeholder for Phase 2 */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 2.21 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                                />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No external databases connected</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by connecting an external MySQL or PostgreSQL instance.</p>
                            <div className="mt-6">
                                <button
                                    type="button"
                                    disabled
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 opacity-60 cursor-not-allowed"
                                >
                                    Connect Database (Phase 2)
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}

export default Dashboard;