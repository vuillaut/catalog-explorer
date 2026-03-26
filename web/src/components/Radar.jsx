import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDimensionColor } from '../data/colors';

const Radar = ({ tools, dimensions, size = 500 }) => {
    const navigate = useNavigate();
    const [hoveredDim, setHoveredDim] = useState(null);

    const dimDescriptions = {
        'compatibility': 'Degree to which a product, system or component can exchange information with other products, systems or components.',
        'flexibility': 'Ease with which a system or component can be modified for use in applications or environments other than those for which it was specifically designed.',
        'reliability': 'Degree to which a system, product or component performs specified functions under specified conditions for a specified period of time.',
        'sustainability': 'Degree to which an application can be maintained and evolved over time without significant degradation in its quality or required excessive effort.',
        'usability': 'Degree to which a product or system can be used by specified users to achieve specified goals with effectiveness, efficiency and satisfaction.',
        'performance': 'Performance relative to the amount of resources used under stated conditions.',
        'maintainability': 'Degree of effectiveness and efficiency with which a product or system can be modified by the intended maintainers.',
        'portability': 'Degree of effectiveness and efficiency with which a system, product or component can be transferred from one environment to another.',
        'security': 'Degree to which a product or system protects information and data.',
        'reusability': 'Degree to which an asset can be used in more than one system, or in building other assets.',
        'testability': 'Degree of effectiveness and efficiency with which test criteria can be established and tests can be performed.',
        'understandability': 'Degree to which the user can recognize whether the software is appropriate for their needs.'
    };

    const center = size / 2;
    const radius = size / 2 - 90; // Padding for labels

    // Tier Configuration
    // Order: Analysis Code (Inner) > Prototype Tools (Middle) > Research Software Infrastructure (Outer)
    // Labels: individuals, research teams, communities
    const tiers = [
        { id: 'rs:AnalysisCode', label: 'individuals', radiusRatio: 0.33 },
        { id: 'rs:PrototypeTool', label: 'research teams', radiusRatio: 0.66 },
        { id: 'rs:ResearchInfrastructureSoftware', label: 'communities', radiusRatio: 1.0 }
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
            const color = getDimensionColor(dim, dimensions);
            return {
                dim: dim.replace(/_/g, ' '),
                startAngle,
                endAngle: (i + 1) * sectorAngle,
                color,
                labelAngle: startAngle + (sectorAngle / 2)
            };
        });
    }, [dimensions]);

    // Calculate points deterministically
    const points = useMemo(() => {
        const pts = [];
        const sectorAngle = 360 / dimensions.length;

        // Group by [tierIndex][dimIndex]
        const grouped = Array(tiers.length).fill(0).map(() => Array(dimensions.length).fill(0).map(() => []));

        tools.forEach(tool => {
            // Determine Tier
            let toolTiers = tool.applicationCategory
                ? (Array.isArray(tool.applicationCategory) ? tool.applicationCategory : [tool.applicationCategory])
                : [];

            let itemTiers = [];
            if (toolTiers.some(t => t['@id'] === 'rs:PrototypeTool')) itemTiers.push(1);
            if (toolTiers.some(t => t['@id'] === 'rs:ResearchInfrastructureSoftware')) itemTiers.push(2);
            if (toolTiers.some(t => t['@id'] === 'rs:AnalysisCode')) itemTiers.push(0);

            if (itemTiers.length === 0) return;

            // Determine Dimension(s)
            const toolDims = tool.hasQualityDimension
                ? (Array.isArray(tool.hasQualityDimension) ? tool.hasQualityDimension : [tool.hasQualityDimension])
                : [];

            itemTiers.forEach(tierIndex => {
                toolDims.forEach(dimObj => {
                    if (!dimObj['@id']) return;
                    const dimName = dimObj['@id'].replace('dim:', '');
                    const dimIndex = dimensions.indexOf(dimName);

                    if (dimIndex !== -1) {
                        grouped[tierIndex][dimIndex].push(tool);
                    }
                });
            });
        });

        // Now place points evenly
        grouped.forEach((tierGroups, tierIndex) => {
            const tier = tiers[tierIndex];
            const prevRadiusRatio = tierIndex === 0 ? 0.15 : tiers[tierIndex - 1].radiusRatio;
            const minR = prevRadiusRatio * radius;
            const maxR = tier.radiusRatio * radius;
            const rPadding = (maxR - minR) * 0.2;
            const availableR = (maxR - minR) - 2 * rPadding;

            tierGroups.forEach((dimTools, dimIndex) => {
                if (dimTools.length === 0) return;

                const startAngle = dimIndex * sectorAngle;
                const anglePadding = sectorAngle * 0.15;
                const availableAngle = sectorAngle - 2 * anglePadding;

                // Sort tools to ensure consistent alphabetical ordering
                dimTools.sort((a, b) => a.name.localeCompare(b.name));

                dimTools.forEach((tool, i) => {
                    const n = dimTools.length;
                    const angleOffset = n > 1 ? (i / (n - 1)) * availableAngle : availableAngle / 2;
                    const pointAngle = startAngle + anglePadding + angleOffset;

                    // Stagger the radius to avoid overlap when angles are close
                    const rOffsetRatio = n > 1 ? (i % 3) / 2 : 0.5;
                    const pointDist = minR + rPadding + rOffsetRatio * availableR;

                    pts.push({
                        x: center + pointDist * Math.cos((pointAngle - 90) * (Math.PI / 180)),
                        y: center + pointDist * Math.sin((pointAngle - 90) * (Math.PI / 180)),
                        tool: tool,
                        tierIndex: tierIndex,
                        color: getDimensionColor(dimensions[dimIndex], dimensions)
                    });
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

                {/* 2. Tier Divider Rings (Grid) */}
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
                        <g key={`label-${i}`}
                           onMouseEnter={() => setHoveredDim({ name: sector.dim, originalData: dimensions[i], x: coord.x, y: coord.y })}
                           onMouseLeave={() => setHoveredDim(null)}
                           style={{ cursor: 'help' }}
                           className="transition-opacity hover:opacity-80 relative z-50 inline-block !pointer-events-auto"
                        >
                            <text
                                x={coord.x}
                                y={coord.y}
                                textAnchor={anchor}
                                dominantBaseline="middle"
                                className="text-[10px] font-bold uppercase tracking-tight"
                                fill={sector.color}
                                style={{
                                    textShadow: '0 1px 2px rgba(255,255,255,0.9)',
                                    pointerEvents: 'auto'
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
                        </g>
                    );
                })}

                {/* 5. Points */}
                {points.map((pt, i) => (
                    <g key={i} className="group cursor-pointer"
                        onClick={() => navigate(`/tool/${pt.tool._filename}`)}
                        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                    >
                        {/* Point */}
                        <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={2.5}
                            fill={pt.color}
                            stroke="white"
                            strokeWidth="1"
                            className="transition-all duration-200 group-hover:r-[5px] group-hover:stroke-[1.5px] drop-shadow-sm"
                        />
                    </g>
                ))}

                {/* 6. Tier Labels */}
                {tiers.map((tier, i) => (
                    <g key={`tier-label-${i}`} className="pointer-events-none">
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

            {/* Dimension Tooltip */}
            {hoveredDim && (
                <div
                    className="absolute z-30 pointer-events-none"
                    style={{
                        left: hoveredDim.x,
                        top: hoveredDim.y,
                        transform: 'translate(-50%, -120%)'
                    }}
                >
                    <div className="bg-slate-900/95 text-white text-xs px-3 py-2 rounded-lg shadow-xl border border-slate-700 backdrop-blur-sm max-w-[200px] text-center w-max animate-in fade-in zoom-in-95 duration-150">
                        <p className="font-bold text-sm mb-1 uppercase">{hoveredDim.name}</p>
                        <p className="text-slate-300 text-[10px] leading-relaxed break-words break-normal normal-case">
                            {dimDescriptions[hoveredDim.originalData] || 'Quality dimension metric.'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Radar;
