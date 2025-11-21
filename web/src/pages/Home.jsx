import React, { useState, useMemo } from 'react';
import { getAllTools, getQualityDimensions, getFilterOptions } from '../data/loader';
import { Link } from 'react-router-dom';
import { Search, Filter, Menu, X } from 'lucide-react';
import FilterSidebar from '../components/FilterSidebar';

const Home = () => {
    const tools = getAllTools();
    const dimensions = getQualityDimensions();
    const filterOptions = useMemo(() => getFilterOptions(), []);

    const [search, setSearch] = useState('');
    const [selectedDim, setSelectedDim] = useState('');
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const [filters, setFilters] = useState({
        categories: [],
        usage: [],
        licenses: [],
        free: []
    });

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            categories: [],
            usage: [],
            licenses: [],
            free: []
        });
        setSelectedDim('');
        setSearch('');
    };

    const filteredTools = useMemo(() => {
        return tools.filter(tool => {
            // Search
            const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase()) ||
                (tool.description && tool.description.toLowerCase().includes(search.toLowerCase()));
            if (!matchesSearch) return false;

            // Dimension
            const toolDims = tool.hasQualityDimension
                ? (Array.isArray(tool.hasQualityDimension) ? tool.hasQualityDimension : [tool.hasQualityDimension])
                : [];
            const matchesDim = selectedDim === '' || toolDims.some(d => d['@id'] && d['@id'].includes(selectedDim));
            if (!matchesDim) return false;

            // Categories
            if (filters.categories.length > 0) {
                const toolCats = tool.applicationCategory
                    ? (Array.isArray(tool.applicationCategory) ? tool.applicationCategory : [tool.applicationCategory])
                    : [];
                const hasCategory = toolCats.some(c => c['@id'] && filters.categories.includes(c['@id'].replace('rs:', '')));
                if (!hasCategory) return false;
            }

            // Usage
            if (filters.usage.length > 0) {
                const toolUsage = tool.howToUse ? (Array.isArray(tool.howToUse) ? tool.howToUse : [tool.howToUse]) : [];
                const hasUsage = toolUsage.some(u => filters.usage.includes(u));
                if (!hasUsage) return false;
            }

            // License
            if (filters.licenses.length > 0) {
                if (!filters.licenses.includes(tool.license)) return false;
            }

            // Free
            if (filters.free.length > 0) {
                const isFree = tool.isAccessibleForFree === true;
                const wantsFree = filters.free.includes('Yes');
                const wantsPaid = filters.free.includes('No');

                if (wantsFree && !wantsPaid && !isFree) return false;
                if (!wantsFree && wantsPaid && isFree) return false;
            }

            return true;
        });
    }, [tools, search, selectedDim, filters]);

    return (
        <div>
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-400">
                    Research Software Tools
                </h1>
                <p className="text-slate-400 max-w-2xl mx-auto">
                    Explore a curated catalog of tools designed to improve the quality and sustainability of research software.
                </p>
            </div>

            <div className="glass-panel p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
                <button
                    className="md:hidden p-2 text-slate-400 hover:text-white"
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                >
                    <Menu size={24} />
                </button>

                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search tools..."
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="relative min-w-[200px] w-full md:w-auto hidden md:block">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <select
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none cursor-pointer transition-all"
                        value={selectedDim}
                        onChange={(e) => setSelectedDim(e.target.value)}
                    >
                        <option value="">All Dimensions</option>
                        {dimensions.map(dim => (
                            <option key={dim} value={dim}>{dim.charAt(0).toUpperCase() + dim.slice(1)}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Mobile Sidebar Overlay */}
                <div className={`md:hidden fixed inset-0 z-40 bg-slate-900/90 transition-opacity ${showMobileFilters ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <div className="p-4 h-full overflow-y-auto">
                        <div className="flex justify-end mb-4">
                            <button onClick={() => setShowMobileFilters(false)} className="text-white">
                                <X size={24} />
                            </button>
                        </div>
                        <FilterSidebar
                            options={filterOptions}
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            onClear={clearFilters}
                        />
                    </div>
                </div>

                {/* Desktop Sidebar */}
                <div className="hidden md:block sticky top-24">
                    <FilterSidebar
                        options={filterOptions}
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onClear={clearFilters}
                    />
                </div>

                <div className="flex-1 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredTools.map(tool => (
                            <Link
                                key={tool._filename}
                                to={`/tool/${tool._filename}`}
                                className="glass-panel p-6 hover:bg-slate-800/50 transition-all duration-300 hover:-translate-y-1 group flex flex-col"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-semibold text-sky-300 group-hover:text-sky-200 line-clamp-1" title={tool.name}>{tool.name}</h3>
                                    {tool.isAccessibleForFree && (
                                        <span className="flex-shrink-0 ml-2 px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                                            Free
                                        </span>
                                    )}
                                </div>
                                <p className="text-slate-400 text-sm line-clamp-3 mb-4 flex-1">
                                    {tool.description}
                                </p>
                                <div className="flex flex-wrap gap-2 mt-auto">
                                    {tool.hasQualityDimension && (
                                        (Array.isArray(tool.hasQualityDimension) ? tool.hasQualityDimension : [tool.hasQualityDimension])
                                            .slice(0, 3)
                                            .map((dim, i) => (
                                                <span key={i} className="text-xs px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                                    {dim['@id'].replace('dim:', '')}
                                                </span>
                                            ))
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>

                    {filteredTools.length === 0 && (
                        <div className="text-center py-12 text-slate-500 glass-panel">
                            <p className="text-lg mb-2">No tools found matching your criteria.</p>
                            <button
                                onClick={clearFilters}
                                className="text-sky-400 hover:text-sky-300 underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;
