import { useRef, useState } from 'react';

interface PatternLockProps {
    // Grid size fits into this width/height
    width?: number;
    // Size of the dots
    pointSize?: number;
    // Size of active dots
    pointActiveSize?: number;
    // Thickness of connector lines
    connectorThickness?: number;
    // Controlled path state: array of indices (0-8)
    path: number[];
    // Called when path changes during drag
    onChange: (path: number[]) => void;
    // Called when drag ends
    onFinish: () => void;
    // Styling
    error?: boolean;
    success?: boolean;
    disabled?: boolean;
}

export const PatternLock = ({
    width = 300,
    pointSize = 15,
    pointActiveSize = 20,
    connectorThickness = 5,
    path,
    onChange,
    onFinish,
    error = false,
    success = false,
    disabled = false,
}: PatternLockProps) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(null);

    // 3x3 Grid logic
    // Indices:
    // 0 1 2
    // 3 4 5
    // 6 7 8
    const gridSize = 3;
    const padding = 30;
    const availableWidth = width - padding * 2;
    const gap = availableWidth / (gridSize - 1);

    const getPointPosition = (index: number) => {
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;
        return {
            x: padding + col * gap,
            y: padding + row * gap,
        };
    };

    const getPointIndexAt = (x: number, y: number) => {
        // Check if point is close enough (hitbox)
        const hitboxRadius = 30;

        for (let i = 0; i < gridSize * gridSize; i++) {
            const pos = getPointPosition(i);
            const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
            if (distance < hitboxRadius) {
                return i;
            }
        }
        return -1;
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        if (disabled) return;

        // Prevent scrolling on touch
        e.preventDefault();
        // Capture pointer so we keep tracking even if we leave the SVG bounds visually
        (e.target as Element).setPointerCapture(e.pointerId);

        setIsDragging(true);

        const svg = svgRef.current;
        if (!svg) return;

        const rect = svg.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setCurrentPos({ x, y });

        const index = getPointIndexAt(x, y);
        if (index !== -1) {
            onChange([index]);
        } else {
            onChange([]);
        }
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging || disabled) return;
        e.preventDefault();

        const svg = svgRef.current;
        if (!svg) return;

        const rect = svg.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setCurrentPos({ x, y });

        const index = getPointIndexAt(x, y);
        if (index !== -1) {
            // Add to path if not already the LAST point (allow backtracking? usually no for pattern lock)
            // Usually: Add if not in path at all, OR handle re-visiting logic.
            // Standard Android pattern: Cannot use same node twice.
            if (!path.includes(index)) {
                // Optional: Handle "intermediates" (e.g. 0 -> 2 should verify passing 1).
                // Keeping it simple for now (direct connections allowed if desired, or we can add logic later).
                onChange([...path, index]);
            }
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        setIsDragging(false);
        setCurrentPos(null);
        onFinish();
    };

    // Colors
    const getColors = () => {
        if (error) return { line: '#ff5861', dot: '#ff5861', activeDot: '#ff5861' };
        if (success) return { line: '#00d26a', dot: '#00d26a', activeDot: '#00d26a' };
        return { line: '#fbbf24', dot: '#d1d5db', activeDot: '#fbbf24' }; // Warning/Primary colors
    };

    const colors = getColors();

    return (
        <svg
            ref={svgRef}
            width={width}
            height={width}
            className="touch-none select-none" // Essential for preventing scroll/selection
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp} // Safety
        >
            {/* Connector Lines */}
            <polyline
                points={path.map(i => {
                    const pos = getPointPosition(i);
                    return `${pos.x},${pos.y}`;
                }).concat(currentPos && isDragging && path.length > 0 ? [`${currentPos.x},${currentPos.y}`] : []).join(' ')}
                fill="none"
                stroke={colors.line}
                strokeWidth={connectorThickness}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-colors duration-200"
            />

            {/* Dots */}
            {Array.from({ length: 9 }).map((_, i) => {
                const { x, y } = getPointPosition(i);
                const isActive = path.includes(i);

                return (
                    <g key={i}>
                        {/* Hitbox (invisible larger area) */}
                        <circle cx={x} cy={y} r={30} fill="transparent" />

                        {/* Visual Dot */}
                        <circle
                            cx={x}
                            cy={y}
                            r={isActive ? pointActiveSize / 2 : pointSize / 2}
                            fill={isActive ? colors.activeDot : colors.dot}
                            className="transition-all duration-200"
                        />
                        {/* Inner white dot for active state style similar to android */}
                        {isActive && (
                            <circle cx={x} cy={y} r={pointSize / 3} fill="#fff" />
                        )}
                    </g>
                );
            })}
        </svg>
    );
};
