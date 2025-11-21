import React from 'react';
import { getQualityDimensions, getAllTools } from '../data/loader';
import { Link } from 'react-router-dom';
import { Tag } from 'lucide-react';

const Dimensions = () => {
    const dimensions = getQualityDimensions();
    const tools = getAllTools();

    const getToolsForDimension = (dim) => {
        return tools.filter(tool => {
            const toolDims = tool.hasQualityDimension
                ? (Array.isArray(tool.hasQualityDimension) ? tool.hasQualityDimension : [tool.hasQualityDimension])
                : [];
            return toolDims.some(d => d['@id'] && d['@id'].includes(dim));
        });
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4 text-white">Quality Dimensions</h1>
                <p className="text-slate-400">
                    Browse tools categorized by software quality dimensions.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {dimensions.map(dim => {
                    const dimTools = getToolsForDimension(dim);
                    return (
                        <div key={dim} className="glass-panel p-6">
                            <div className="flex items-center mb-4">
                                <Tag className="text-sky-400 mr-2" size={24} />
                                <h2 className="text-xl font-bold text-white capitalize">{dim}</h2>
                                <span className="ml-auto bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-full">
                                    {dimTools.length} tools
                                </span>
                            </div>

                            <ul className="space-y-2">
                                {dimTools.slice(0, 5).map(tool => (
                                    <li key={tool._filename}>
                                        <Link
                                            to={`/tool/${tool._filename}`}
                                            className="text-slate-300 hover:text-sky-300 transition-colors block truncate"
                                        >
                                            {tool.name}
                                        </Link>
                                    </li>
                                ))}
                                {dimTools.length > 5 && (
                                    <li className="text-slate-500 text-sm italic pt-1">
                                        + {dimTools.length - 5} more...
                                    </li>
                                )}
                            </ul>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Dimensions;
