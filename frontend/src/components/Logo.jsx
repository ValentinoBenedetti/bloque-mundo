import React from 'react';
import { useNavigate } from 'react-router-dom';

const Logo = ({ size = "normal", className = "", textOnly = false, animated = true }) => {
    const navigate = useNavigate();
    
    // Classes based on size prop
    const textClasses = size === "large" 
        ? "text-7xl sm:text-8xl md:text-[110px]" 
        : size === "footer"
        ? "text-4xl md:text-5xl"
        : "text-4xl sm:text-5xl md:text-[50px]";
        
    const iconSize = size === "large" 
        ? "w-20 h-16 sm:w-28 sm:h-20" 
        : size === "footer" 
        ? "w-14 h-10" 
        : "w-12 h-8 sm:w-14 sm:h-10 md:w-16 md:h-12";

    // Adjust how far the block moves to the right based on size
    const translateAmount = size === "large" 
        ? "group-hover:translate-x-[200%]" 
        : size === "footer"
        ? "group-hover:translate-x-[150%]"
        : "group-hover:translate-x-[130%]";

    const renderStud = (x, y) => (
        <g key={`${x}-${y}`}>
            <path d={`M ${x-10} ${y-8} L ${x-10} ${y} Q ${x} ${y+5} ${x+10} ${y} L ${x+10} ${y-8} Z`} fill="#FFD500" stroke="#1A1A1A" strokeWidth="2.5" strokeLinejoin="round"/>
            <ellipse cx={x} cy={y-8} rx="10" ry="5" fill="#FFE55C" stroke="#1A1A1A" strokeWidth="2.5"/>
        </g>
    );

    return (
        <div 
            onClick={() => navigate('/')}
            className={`${animated ? 'group' : ''} flex items-center cursor-pointer select-none relative ${className}`}
        >
            {/* The Animated Lego Block (2x4 Classic) */}
            {!textOnly && (
                <div 
                    className={`transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-10 ${iconSize} mr-2 sm:mr-3 flex-shrink-0 ${animated ? translateAmount + ' group-hover:rotate-[360deg] group-hover:scale-[1.6]' : ''}`}
                >
                <svg viewBox="0 0 160 120" className="w-full h-full drop-shadow-[3px_3px_0px_#1A1A1A]" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Right face */}
                    <path d="M 60 80 L 140 40 L 140 70 L 60 110 Z" fill="#E5BE00" stroke="#1A1A1A" strokeWidth="4" strokeLinejoin="round"/>
                    {/* Left face */}
                    <path d="M 20 60 L 60 80 L 60 110 L 20 90 Z" fill="#D4AF37" stroke="#1A1A1A" strokeWidth="4" strokeLinejoin="round"/>
                    {/* Top face */}
                    <path d="M 100 20 L 20 60 L 60 80 L 140 40 Z" fill="#FFD500" stroke="#1A1A1A" strokeWidth="4" strokeLinejoin="round"/>

                    {/* Studs in isometric depth order */}
                    {renderStud(100, 30)}
                    {renderStud(80, 40)}
                    {renderStud(120, 40)}
                    {renderStud(60, 50)}
                    {renderStud(100, 50)}
                    {renderStud(40, 60)}
                    {renderStud(80, 60)}
                    {renderStud(60, 70)}
                </svg>
            </div>
            )}

            {/* The Text */}
            <h1 
                className={`font-logo text-white uppercase whitespace-nowrap ${animated ? 'transition-all duration-500 ease-in-out group-hover:opacity-0 group-hover:blur-md group-hover:translate-x-12' : ''} ${textClasses}`}
                style={{  
                    letterSpacing: '2px',
                    lineHeight: '0.8'
                }}
            >
                BLOQUE MUNDO
            </h1>
        </div>
    );
};

export default Logo;
