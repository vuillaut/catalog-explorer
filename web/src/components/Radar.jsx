import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Radar = ({ tools, dimensions, size = 500 }) => {
    const navigate = useNavigate();
    const [hoveredTool, setHoveredTool] = useState(null);

    const center = size / 2;
    const radius = size / 2 - 90; // Padding for labels

    // Colorful palette for dimensions
    const palette = [
        '#ef4444', // Red 500
        '#f97316', // Orange 500
        '#f59e0b', // Amber 500
        '#84cc16', // Lime 500
        '#10b981', // Emerald 500
        '#06b6d4', // Cyan 500
        '#3b82f6', // Blue 500
        '#6366f1', // Indigo 500
        '#8b5cf6', // Violet 500
        '#d946ef', // Fuchsia 500
        '#f43f5e', // Rose 500
    ];

    // Tier Configuration
    // Order: Analysis Code (Inner) > Prototype Tools (Middle) > Research Software Infrastructure (Outer)
    // Preserving user adjusted ratios: 0.33, 0.66, 1.0
    const tiers = [
        { id: 'rs:AnalysisCode', label: 'Analysis Code', radiusRatio: 0.33 },
        { id: 'rs:PrototypeTool', label: 'Prototype Tools', radiusRatio: 0.66 },
        { id: 'rs:ResearchInfrastructureSoftware', label: 'Research Infrastructure', radiusRatio: 1.0 }
    ];

    // Helper to get coordinates
    const getCoordinates = (angle, dist) => {
        const rad = (angle - 90) * (Math.PI / 180);
        return {
            x: center + dist * Math.cos(rad),
            y: center + dist * Math.sin(rad)
        };
    };

    // Helper to create a sector path (wedge)
    const createSectorPath = (startAngle, endAngle, innerR, outerR) => {
        const start = getCoordinates(startAngle, outerR);
        const end = getCoordinates(endAngle, outerR);

        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

        return [
            `M ${start.x} ${start.y}`,
            `A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
            `L ${center} ${center}`,
            `Z`
        ].join(" ");
    };

    // Calculate details first to allow usage in render
    const sectorData = useMemo(() => {
        const sectorAngle = 360 / dimensions.length;
        return dimensions.map((dim, i) => {
            const startAngle = i * sectorAngle;
            const endAngle = (i + 1) * sectorAngle;
            const color = palette[i % palette.length];
            return {
                dim: dim.replace(/_/g, ' '),
                startAngle,
                endAngle,
                color,
                labelAngle: startAngle + (sectorAngle / 2)
            };
        });
    }, [dimensions]);

    // Calculate points
    const points = useMemo(() => {
        const pts = [];
        const sectorAngle = 360 / dimensions.length;

        tools.forEach(tool => {
            // Determine Tier
            let toolTiers = tool.applicationCategory
                ? (Array.isArray(tool.applicationCategory) ? tool.applicationCategory : [tool.applicationCategory])
                : [];

            // Priority Logic to handle overlaps:
            // 1. Prototype (Middle)
            // 2. Infrastructure (Outer)
            // 3. Analysis (Inner)
            let tierIndex = -1;

            if (toolTiers.some(t => t['@id'] === 'rs:PrototypeTool')) tierIndex = 1; // Middle
            else if (toolTiers.some(t => t['@id'] === 'rs:ResearchInfrastructureSoftware')) tierIndex = 2; // Outer
            else if (toolTiers.some(t => t['@id'] === 'rs:AnalysisCode')) tierIndex = 0; // Inner

            if (tierIndex === -1) return;

            const tier = tiers[tierIndex];
            // Start slightly offset from center
            const prevRadiusRatio = tierIndex === 0 ? 0.15 : tiers[tierIndex - 1].radiusRatio;

            // Determine Dimension(s)
            const toolDims = tool.hasQualityDimension
                ? (Array.isArray(tool.hasQualityDimension) ? tool.hasQualityDimension : [tool.hasQualityDimension])
                : [];

            toolDims.forEach(dimObj => {
                if (!dimObj['@id']) return;
                const dimName = dimObj['@id'].replace('dim:', '');
                const dimIndex = dimensions.indexOf(dimName);

                if (dimIndex === -1) return;

                // Random position within the sector and tier band
                const startAngle = dimIndex * sectorAngle;
                const anglePadding = sectorAngle * 0.15;
                const randomAngle = startAngle + anglePadding + Math.random() * (sectorAngle - 2 * anglePadding);

                const minR = prevRadiusRatio * radius;
                const maxR = tier.radiusRatio * radius;
                const rPadding = (maxR - minR) * 0.15;
                const randomDist = minR + rPadding + Math.random() * ((maxR - minR) - 2 * rPadding);

                pts.push({
                    x: center + randomDist * Math.cos((randomAngle - 90) * (Math.PI / 180)),
                    y: center + randomDist * Math.sin((randomAngle - 90) * (Math.PI / 180)),
                    tool: tool,
                    tierIndex: tierIndex,
                    color: palette[dimIndex % palette.length]
                });
            });
        });
        return pts;
    }, [tools, dimensions, radius, center, sectorData]);

    return (
        <div className="relative flex justify-center items-center">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="max-w-full h-auto drop-shadow-xl font-sans">

                {/* 1. Sector Backgrounds */}
                {sectorData.map((sector, i) => (
                    <path
                        key={`sector-${i}`}
                        d={createSectorPath(sector.startAngle, sector.endAngle, 0, radius)}
                        fill={sector.color}
                        fillOpacity="0.12"
                        stroke="none"
                        className="transition-opacity duration-300 hover:fill-opacity-25"
                    />
                ))}

                {/* 2. Tier Divider Rings (Grid) ONLY (Labels moved to end) */}
                {tiers.map((tier, i) => (
                    <circle
                        key={tier.id}
                        cx={center}
                        cy={center}
                        r={tier.radiusRatio * radius}
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                        opacity="0.4"
                    />
                ))}

                {/* 3. Dimension Divider Lines */}
                {sectorData.map((sector, i) => {
                    const coord = getCoordinates(sector.startAngle, radius);
                    return (
                        <line
                            key={`div-${i}`}
                            x1={center}
                            y1={center}
                            x2={coord.x}
                            y2={coord.y}
                            stroke="white"
                            strokeWidth="2"
                            strokeOpacity="0.8"
                        />
                    );
                })}

                {/* 4. Labels - Multi-line support */}
                {sectorData.map((sector, i) => {
                    const labelRadius = radius + 22;
                    const coord = getCoordinates(sector.labelAngle, labelRadius);
                    const words = sector.dim.split(' ');

                    let anchor = "middle";
                    const deg = sector.labelAngle % 360;
                    if (deg > 15 && deg < 165) anchor = "start";
                    else if (deg > 195 && deg < 345) anchor = "end";

                    return (
                        <g key={`label-${i}`}>
                            <text
                                x={coord.x}
                                y={coord.y}
                                textAnchor={anchor}
                                dominantBaseline="middle"
                                className="text-[10px] font-bold fill-slate-700 uppercase tracking-tight"
                                style={{
                                    textShadow: '0 1px 2px rgba(255,255,255,0.9)',
                                    pointerEvents: 'none'
                                }}
                            >
                                {words.map((word, idx) => (
                                    <tspan
                                        key={idx}
                                        x={coord.x}
                                        dy={idx === 0 ? (words.length > 1 ? "-0.4em" : "0") : "1.1em"}
                                    >
                                        {word}
                                    </tspan>
                                ))}
                            </text>

                            {/* Color bar indicator */}
                            <rect
                                x={coord.x + (anchor === 'start' ? 0 : anchor === 'end' ? -15 : -7.5)}
                                y={coord.y + (words.length > 1 ? 10 : 8)}
                                width="15"
                                height="3"
                                rx="1.5"
                                fill={sector.color}
                            />
                        </g>
                    );
                })}

                {/* 5. Points */}
                {points.map((pt, i) => (
                    <g key={i} className="group cursor-pointer"
                        onMouseEnter={() => setHoveredTool({ ...pt.tool, x: pt.x, y: pt.y })}
                        onMouseLeave={() => setHoveredTool(null)}
                        onClick={() => navigate(`/tool/${pt.tool._filename}`)}
                        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                    >
                        {/* Hover halo */}
                        <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={10}
                            fill={pt.color}
                            opacity="0"
                            className="transition-opacity duration-200 group-hover:opacity-30"
                        />
                        {/* Point */}
                        <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={4}
                            fill={pt.color}
                            stroke="white"
                            strokeWidth="1.5"
                            className="transition-all duration-200 group-hover:r-[6px] group-hover:stroke-[2px] drop-shadow-sm"
                        />
                    </g>
                ))}

                {/* 6. Tier Labels (Rendered Last to be On Top) */}
                {tiers.map((tier, i) => (
                    <g key={`tier-label-${i}`} className="pointer-events-none">
                        {/* Optional background for readability if needed, but starting with text shadow/fill */}
                        <text
                            x={center}
                            y={center - (tier.radiusRatio * radius) + 12}
                            textAnchor="middle"
                            className="text-[10px] sm:text-[10px] font-extrabold fill-slate-800 uppercase tracking-widest"
                            style={{
                                textShadow: '0 2px 4px rgba(255,255,255,0.9), 0 0 4px rgba(255,255,255,1)',
                            }}
                        >
                            {tier.label}
                        </text>
                    </g>
                ))}

            </svg>

            {/* Tooltip */}
            {hoveredTool && (
                <div
                    className="absolute z-30 pointer-events-none"
                    style={{
                        left: hoveredTool.x,
                        top: hoveredTool.y,
                        transform: 'translate(-50%, -140%)'
                    }}
                >
                    <div className="bg-slate-900/95 text-white text-xs px-3 py-2 rounded-lg shadow-xl border border-slate-700 whitespace-nowrap backdrop-blur-sm animate-in fade-in zoom-in-95 duration-150">
                        <p className="font-bold text-sm mb-0.5">{hoveredTool.name}</p>
                        <p className="text-slate-400 text-[10px] truncate max-w-[200px]">{hoveredTool.description}</p>
                        {hoveredTool.isAccessibleForFree && (
                            <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-green-900/50 text-green-400 border border-green-800 text-[9px]">Free</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Radar;
