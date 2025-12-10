
import React from 'react';

interface ResumePageProps {
    callsign: string;
    onRejoin: () => void;
}

const ResumePage: React.FC<ResumePageProps> = ({ callsign, onRejoin }) => {
    return (
        <div className="h-[100dvh] w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#050505] to-black flex flex-col items-center justify-center font-sans text-white p-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
            
            <div className="z-10 flex flex-col items-center gap-8 animate-in zoom-in-95 duration-500 w-full max-w-xs">
                <div className="relative w-20 h-20 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.4)] border border-white/10">
                    <img src="/nearchat-logo.webp?v=3" alt="Logo" className="w-full h-full object-cover rounded-2xl" />
                </div>

                <div className="text-center space-y-2">
                    <h2 className="text-xl text-white/60 font-medium">Welcome back,</h2>
                    <h1 className="text-4xl font-bold text-white tracking-wide drop-shadow-lg">{callsign}</h1>
                </div>

                <button
                    onClick={onRejoin}
                    className="
                        items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold tracking-widest transition-transform duration-200 ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 group relative animate-rainbow cursor-pointer border-0 w-full h-14
                        bg-[linear-gradient(#fff,#fff),linear-gradient(#fff_50%,rgba(255,255,255,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,hsl(0,100%,63%),hsl(90,100%,63%),hsl(210,100%,63%),hsl(195,100%,63%),hsl(270,100%,63%))] 
                        dark:bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,hsl(0,100%,63%),hsl(90,100%,63%),hsl(210,100%,63%),hsl(195,100%,63%),hsl(270,100%,63%))] 
                        bg-[length:200%] text-foreground [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] 
                        before:absolute before:bottom-[-20%] before:left-1/2 before:z-[0] before:h-[20%] before:w-[60%] before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,hsl(0,100%,63%),hsl(90,100%,63%),hsl(210,100%,63%),hsl(195,100%,63%),hsl(270,100%,63%))] before:[filter:blur(calc(0.8*1rem))] 
                        hover:scale-105 active:scale-95 inline-flex shadow-2xl
                    "
                >
                    <span className="relative z-10 text-white flex items-center gap-2">
                        RESUME COMMS
                    </span>
                </button>
            </div>

            <div className="absolute bottom-8 text-center space-y-2">
                <p className="text-[10px] text-white/30 uppercase tracking-widest">Connection Ready</p>
            </div>
        </div>
    );
};

export default ResumePage;
