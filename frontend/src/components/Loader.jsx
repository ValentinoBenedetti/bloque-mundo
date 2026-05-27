import React from 'react';

const Loader = ({ text = "Buscando bloques..." }) => {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-fade-in">
            <div className="relative w-20 h-20 mb-6 flex items-center justify-center animate-bounce">
                {/* 2x4 Lego Block SVG for Loader */}
                <svg viewBox="0 0 160 120" className="w-full h-full drop-shadow-[5px_5px_0px_rgba(0,0,0,0.1)]" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Right face */}
                    <path d="M 60 80 L 140 40 L 140 70 L 60 110 Z" fill="#D62828" stroke="#1A1A1A" strokeWidth="4" strokeLinejoin="round"/>
                    {/* Left face */}
                    <path d="M 20 60 L 60 80 L 60 110 L 20 90 Z" fill="#9e1a1a" stroke="#1A1A1A" strokeWidth="4" strokeLinejoin="round"/>
                    {/* Top face */}
                    <path d="M 100 20 L 20 60 L 60 80 L 140 40 Z" fill="#ff4d4d" stroke="#1A1A1A" strokeWidth="4" strokeLinejoin="round"/>

                    {/* Studs */}
                    {[
                        [100, 30], [80, 40], [120, 40], [60, 50],
                        [100, 50], [40, 60], [80, 60], [60, 70]
                    ].map(([cx, cy], i) => (
                        <g key={i}>
                            <path d={`M ${cx-10} ${cy-8} L ${cx-10} ${cy} Q ${cx} ${cy+5} ${cx+10} ${cy} L ${cx+10} ${cy-8} Z`} fill="#ff4d4d" stroke="#1A1A1A" strokeWidth="3" strokeLinejoin="round"/>
                            <ellipse cx={cx} cy={cy-8} rx="10" ry="5" fill="#ff6b6b" stroke="#1A1A1A" strokeWidth="3"/>
                        </g>
                    ))}
                </svg>
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm animate-pulse">
                {text}
            </p>
        </div>
    );
};

export default Loader;
