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
                    {(filters.categories.length > 0 || filters.usage.length > 0 || filters.licenses.length > 0 || filters.free.length > 0) && (
                        <button
                            onClick={onClear}
                            className="text-xs text-sky-400 hover:text-sky-300 flex items-center"
                        >
                            <X size={12} className="mr-1" /> Clear all
                        </button>
                    )}
                </div>

                <FilterSection
                    title="Category"
                    options={options.categories}
                    selected={filters.categories}
                    onChange={(newVal) => onFilterChange('categories', newVal)}
                    renderOption={(opt) => opt.charAt(0).toUpperCase() + opt.slice(1)}
                />

                <FilterSection
                    title="How to Use"
                    options={options.usage}
                    selected={filters.usage}
                    onChange={(newVal) => onFilterChange('usage', newVal)}
                />

                <FilterSection
                    title="Free Access"
                    options={['Yes', 'No']}
                    selected={filters.free}
                    onChange={(newVal) => onFilterChange('free', newVal)}
                />

                <FilterSection
                    title="License"
                    options={options.licenses}
                    selected={filters.licenses}
                    onChange={(newVal) => onFilterChange('licenses', newVal)}
                    renderOption={(opt) => opt.split('/').pop()}
                />
            </div>
        </div>
    );
};

export default FilterSidebar;
