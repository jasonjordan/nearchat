
import React from 'react';

interface ControlsProps {
    status: string;
    isTalking: boolean;
    handleMouseDown: () => void;
    handleMouseUp: () => void;
    theme: 'dark' | 'light';
}

const Controls: React.FC<ControlsProps> = ({ status, isTalking, handleMouseDown, handleMouseUp, theme }) => {
    
    const isLight = theme === 'light';
    
    // Transmitting Colors (Keep clear feedback state)
    const txGradient = isLight ? 'from-blue-500 to-blue-600' : 'from-indigo-500 to-blue-600';
    const txShadow = isLight 
        ? 'shadow-[inset_0_4px_20px_rgba(255,255,255,0.4),0_0_40px_rgba(37,99,235,0.4)]'
        : 'shadow-[inset_0_4px_20px_rgba(0,0,0,0.4),0_0_40px_rgba(79,70,229,0.5)]';
    const txBorder = isLight ? 'border-blue-400' : 'border-indigo-400/50';

    // Rainbow Gradient Logic
    // Adjusted bottom-[0%] to move rainbow higher up to hug the button
    const rainbowBase = "animate-rainbow cursor-pointer border-0 bg-[length:200%] [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] before:absolute before:bottom-[0%] before:left-1/2 before:z-[0] before:h-[20%] before:w-[60%] before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,hsl(0,100%,63%),hsl(90,100%,63%),hsl(210,100%,63%),hsl(195,100%,63%),hsl(270,100%,63%))] before:[filter:blur(calc(0.8*1rem))]";
    
    const rainbowLight = "bg-[linear-gradient(#fff,#fff),linear-gradient(#fff_50%,rgba(255,255,255,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,hsl(0,100%,63%),hsl(90,100%,63%),hsl(210,100%,63%),hsl(195,100%,63%),hsl(270,100%,63%))]";
    
    const rainbowDark = "bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,hsl(0,100%,63%),hsl(90,100%,63%),hsl(210,100%,63%),hsl(195,100%,63%),hsl(270,100%,63%))]";

    const idleClass = `${rainbowBase} ${isLight ? rainbowLight : rainbowDark}`;

    // Text Color
    const textColor = isTalking ? 'text-white' : (isLight ? 'text-zinc-800' : 'text-white');

    return (
        <div className="w-full px-5 pb-8 pt-0 flex flex-col items-center z-40 shrink-0 border-none bg-transparent">
            <button
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onTouchStart={handleMouseDown}
                onTouchEnd={handleMouseUp}
                disabled={status !== 'connected'}
                // Changed w-[65%] to w-[55%] to make it 10% narrower
                className={`
                    relative w-[55%] h-32 rounded-[2rem] transition-all duration-200 flex items-center justify-center group select-none
                    ${isTalking 
                        ? `bg-gradient-to-b ${txGradient} ${txShadow} scale-[0.98] ${txBorder} border overflow-hidden` 
                        : `${idleClass} hover:scale-[1.02] active:scale-95 shadow-2xl`
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                `}
            >
                <div className="flex flex-col items-center z-10 relative">
                    <span className={`text-sm font-bold tracking-[0.2em] transition-colors ${textColor}`}>
                        {isTalking ? 'TRANSMITTING' : 'PUSH TO TALK'}
                    </span>
                </div>
            </button>
        </div>
    );
};
export default Controls;
