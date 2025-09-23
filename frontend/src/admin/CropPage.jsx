import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom'; // useLocation මෙතනට import කළා
import { api } from '../lib/api';

const CropPage = () => {
    const location = useLocation(); // useLocation hook එක භාවිතා කළා

    const [crops, setCrops] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        const fetchCrops = async () => {
            try {
                setIsLoading(true);
                const response = await api.get('/crops');
                setCrops(Array.isArray(response.data) ? response.data : []);
                setError(null); // සාර්ථක වූ විට පෙර තිබූ දෝෂ ඉවත් කිරීමට
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCrops();
    }, [location]); // <-- මෙන්න මෙතන වෙනස: location dependency එකට එකතු කළා.
                    // EditCrop එකෙන් navigate වූ විට location object එක වෙනස් වන නිසා,
                    // useEffect එක නැවත ක්‍රියාත්මක වී දත්ත re-fetch කරයි.

    const handleDelete = async (cropId, cropName) => {
        if (window.confirm(`Are you sure you want to delete "${cropName}"?`)) {
            try {
                await api.delete(`/crops/${cropId}`);
                // Delete වුනාට පස්සේ අලුතින් fetch කරනවා වෙනුවට state එක filter කරන්න පුළුවන්
                setCrops(currentCrops => currentCrops.filter(crop => crop._id !== cropId));
            } catch (err) {
                alert(`Failed to delete crop: ${err.message}`);
            }
        }
    };

    // Filter crops based on search and status filter
    const filteredCrops = crops.filter(crop => {
        const matchesSearch = crop.cropName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || crop.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // Get unique status values for filter dropdown
    const statusOptions = ['all', ...new Set(crops.map(crop => crop.status))];

    const getStatusBadgeColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'flowering':
                return 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300';
            case 'harvested':
                return 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300';
            case 'seeding': // ඔබගේ EditCrop.jsx හි 'Seeding' ලෙස පවතී
            case 'planted': // පැරණි කේතයේ 'planted' තිබුන නිසා තැබුවා
                return 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300';
            case 'harvest ready': // ඔබගේ EditCrop.jsx හි 'Harvest Ready' ලෙස පවතී
            case 'growing': // පැරණි කේතයේ 'growing' තිබුන නිසා තැබුවා
                return 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border border-emerald-300';
            default:
                return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300';
        }
    };

    const renderCropContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading crop data...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
                        </div>
                        <h3 className="text-red-800 font-semibold mb-2">Error Loading Data</h3>
                        <p className="text-red-600">{error}</p>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            );
        }

        if (filteredCrops.length === 0 && crops.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <i className="fas fa-seedling text-green-600 text-2xl"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No Crops Yet</h3>
                    <p className="text-gray-600 mb-6 text-center max-w-md">
                        Start managing your agricultural operations by adding your first crop field.
                    </p>
                    <Link 
                        to="/admin/crop/add"
                        className="bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        <i className="fas fa-plus mr-2"></i>
                        Add Your First Crop
                    </Link>
                </div>
            );
        }

        if (filteredCrops.length === 0) {
            return (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-search text-gray-400 text-xl"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No matches found</h3>
                    <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
                </div>
            );
        }

        return (
            <div className="overflow-hidden">
                {/* Enhanced Table Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <div className="grid grid-cols-5 gap-6 px-8 py-5">
                        <div className="col-span-1 text-sm font-bold text-gray-700 uppercase tracking-wide">
                            <i className="fas fa-seedling mr-2 text-green-600"></i>
                            Crop Name
                        </div>
                        <div className="col-span-1 text-sm font-bold text-gray-700 uppercase tracking-wide">
                            <i className="fas fa-calendar mr-2 text-blue-600"></i>
                            Planting Date
                        </div>
                        <div className="col-span-1 text-sm font-bold text-gray-700 uppercase tracking-wide">
                            <i className="fas fa-chart-line mr-2 text-purple-600"></i>
                            Status
                        </div>
                        <div className="col-span-1 text-sm font-bold text-gray-700 uppercase tracking-wide">
                            <i className="fas fa-clock mr-2 text-orange-600"></i>
                            Days Since Planting
                        </div>
                        <div className="col-span-1 text-sm font-bold text-gray-700 uppercase tracking-wide text-right">
                            <i className="fas fa-cogs mr-2 text-gray-600"></i>
                            Actions
                        </div>
                    </div>
                </div>

                {/* Enhanced Table Rows */}
                <div className="divide-y divide-gray-100">
                    {filteredCrops.map((crop, index) => {
                        const daysSincePlanting = Math.floor((new Date() - new Date(crop.plantingDate)) / (1000 * 60 * 60 * 24));
                        
                        return (
                            <div 
                                key={crop._id} 
                                className={`grid grid-cols-5 gap-6 px-8 py-6 items-center hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${
                                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                }`}
                            >
                                {/* Crop Name with Icon */}
                                <div className="col-span-1">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                                            <i className="fas fa-leaf text-white"></i>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 text-base">{crop.cropName}</p>
                                            <p className="text-sm text-gray-500">Field #{index + 1}</p> {/* මෙය placeholder එකක් විය හැක */}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Planting Date */}
                                <div className="col-span-1">
                                    <p className="font-medium text-gray-900">
                                        {new Date(crop.plantingDate).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(crop.plantingDate).toLocaleDateString('en-US', { weekday: 'long' })}
                                    </p>
                                </div>
                                
                                {/* Enhanced Status Badge */}
                                <div className="col-span-1">
                                    <span className={`inline-flex items-center px-3 py-1.5 text-sm font-semibold rounded-full shadow-sm ${getStatusBadgeColor(crop.status)}`}>
                                        <span className="w-2 h-2 bg-current rounded-full mr-2 opacity-75"></span>
                                        {crop.status}
                                    </span>
                                </div>

                                {/* Days Since Planting */}
                                <div className="col-span-1">
                                    <p className="font-semibold text-gray-900">{daysSincePlanting} days</p>
                                    <p className="text-sm text-gray-500">
                                        {daysSincePlanting < 30 ? 'Recently planted' : 
                                         daysSincePlanting < 90 ? 'Growing phase' : 
                                         'Mature crop'}
                                    </p>
                                </div>
                                
                                {/* Enhanced Action Buttons */}
                                <div className="col-span-1 text-right">
                                    <div className="flex items-center justify-end space-x-3">
                                        <Link 
                                            to={`/admin/crop/${crop._id}/edit`} 
                                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 rounded-lg hover:bg-indigo-200 hover:text-indigo-800 transition-all duration-200 shadow-sm hover:shadow-md"
                                        >
                                            <i className="fas fa-edit mr-1.5"></i>
                                            Edit
                                        </Link>
                                        <button 
                                            onClick={() => handleDelete(crop._id, crop.cropName)} 
                                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 hover:text-red-800 transition-all duration-200 shadow-sm hover:shadow-md"
                                        >
                                            <i className="fas fa-trash mr-1.5"></i>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
            {/* Enhanced Header Section */}
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                            Crop Management
                        </h1>
                        <p className="text-gray-600 mt-2 text-lg">
                            Monitor and manage your agricultural operations
                        </p>
                        {crops.length > 0 && (
                            <div className="flex items-center mt-3 text-sm text-gray-500">
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                                    {crops.length} Total Crops
                                </span>
                                <span className="mx-2">•</span>
                                <span>{filteredCrops.length} Showing</span>
                            </div>
                        )}
                    </div>
                    <Link 
                        to="/admin/crop/add"
                        className="bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center gap-3 hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <i className="fas fa-plus text-white text-xs"></i>
                        </div>
                        Add New Crop
                    </Link>
                </div>

                {/* Search and Filter Section */}
                {crops.length > 0 && (
                    <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-6 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                    <input
                                        type="text"
                                        placeholder="Search crops by name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                                    />
                                </div>
                            </div>
                            <div className="md:w-48">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                                >
                                    {statusOptions.map(status => (
                                        <option key={status} value={status}>
                                            {status === 'all' ? 'All Status' : status}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Enhanced Main Content Card */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                    <div className="bg-gradient-to-r from-white to-gray-50 px-8 py-6 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                                <i className="fas fa-table mr-3 text-green-600"></i>
                                Crop Fields Overview
                            </h2>
                            {filteredCrops.length > 0 && (
                                <div className="text-sm text-gray-500">
                                    Last updated: {new Date().toLocaleTimeString()}
                                </div>
                            )}
                        </div>
                    </div>
                    {renderCropContent()}
                </div>
            </div>
        </div>
    );
};

export default CropPage;