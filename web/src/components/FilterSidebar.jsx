import React from 'react';
import { ChevronDown, ChevronRight, X } from 'lucide-react';

const FilterSection = ({ title, options, selected, onChange, renderOption }) => {
    const [isOpen, setIsOpen] = React.useState(true);

    return (
        <div className="mb-6 border-b border-slate-700/50 pb-6 last:border-0">
            <button
                className="flex items-center justify-between w-full text-left mb-3 group"
                onClick={() => setIsOpen(!isOpen)}
            >
                <h3 className="font-semibold text-slate-200 group-hover:text-white transition-colors">{title}</h3>
                {isOpen ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
            </button>

            {isOpen && (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {options.map(option => (
                        <label key={option} className="flex items-start gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                className="mt-1 rounded border-slate-600 bg-slate-800 text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-900"
                                checked={selected.includes(option)}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        onChange([...selected, option]);
                                    } else {
                                        onChange(selected.filter(item => item !== option));
                                    }
                                }}
                            />
                            <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors break-all">
                                {renderOption ? renderOption(option) : option}
                            </span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};

const FilterSidebar = ({ options, filters, onFilterChange, onClear }) => {
    return (
        <div className="w-full md:w-64 flex-shrink-0">
            <div className="glass-panel p-4 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-white">Filters</h2>
                    {(filters.categories.length > 0 || filters.usage.length > 0 || filters.licenses !== '' || filters.free) && (
                        <button
                            onClick={onClear}
                            className="text-xs text-sky-400 hover:text-sky-300 flex items-center"
                        >
                            <X size={12} className="mr-1" /> Clear all
                        </button>
                    )}
                </div>

                <div className="mb-6 border-b border-slate-700/50 pb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-200">Software Tier</h3>
                        <a
                            href="https://everse.software/RSQKit/three_tier_view"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-sky-400 hover:text-sky-300 underline"
                        >
                            What is this?
                        </a>
                    </div>
                    <div className="flex flex-col items-center gap-2 relative py-2">
                        {/* Pyramid Background */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10 pointer-events-none">
                            <div className="w-16 h-0 border-l-[32px] border-l-transparent border-r-[32px] border-r-transparent border-b-[48px] border-b-sky-500 mb-1"></div>
                            <div className="w-32 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[48px] border-b-sky-500 mb-1"></div>
                            <div className="w-48 h-12 bg-sky-500"></div>
                        </div>

                        {['ResearchInfrastructureSoftware', 'PrototypeTool', 'AnalysisCode'].map((cat, index) => {
                            const isActive = filters.categories.includes(cat);
                            const widthClass = index === 0 ? 'w-32' : index === 1 ? 'w-40' : 'w-48';

                            return (
                                <button
                                    key={cat}
                                    onClick={() => {
                                        // Toggle logic: if active, remove; if not, add.
                                        // But user asked for a "slider", implying selection. 
                                        // Let's make it toggleable blocks for now as it fits the "pyramid" request better than a linear slider.
                                        const newCats = isActive
                                            ? filters.categories.filter(c => c !== cat)
                                            : [...filters.categories, cat];
                                        onFilterChange('categories', newCats);
                                    }}
                                    className={`
                    ${widthClass} py-2 px-1 text-xs font-medium rounded-md transition-all duration-300
                    border border-slate-600 shadow-sm z-10
                    ${isActive
                                            ? 'bg-sky-600 text-white border-sky-400 shadow-sky-900/50'
                                            : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                                        }
                  `}
                                >
                                    {cat.replace(/([A-Z])/g, ' $1').trim()}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <FilterSection
                    title="How to Use"
                    options={options.usage}
                    selected={filters.usage}
                    onChange={(newVal) => onFilterChange('usage', newVal)}
                />

                <div className="mb-6 border-b border-slate-700/50 pb-6">
                    <label className="flex items-center cursor-pointer group">
                        <input
                            type="checkbox"
                            className="rounded border-slate-600 bg-slate-800 text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-900"
                            checked={filters.free}
                            onChange={(e) => onFilterChange('free', e.target.checked)}
                        />
                        <span className="ml-2 text-slate-200 group-hover:text-white font-semibold text-sm">Only Free Access</span>
                    </label>
                </div>

                <div className="mb-6 last:border-0">
                    <h3 className="font-semibold text-slate-200 mb-3 text-sm">License</h3>
                    <select
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        value={filters.licenses}
                        onChange={(e) => onFilterChange('licenses', e.target.value)}
                    >
                        <option value="">All Licenses</option>
                        {options.licenses.map(license => (
                            <option key={license} value={license}>
                                {license.split('/').pop()}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default FilterSidebar;
