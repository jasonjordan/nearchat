
import React from 'react';
import { sanitizeInput, isValidName } from '../utils';

interface LandingPageProps {
    joinName: string;
    setJoinName: (name: string) => void;
    agreedToTerms: boolean;
    setAgreedToTerms: (val: boolean) => void;
    handleJoin: () => void;
    isCheckingName: boolean;
    joinError: string | null;
    onTermsClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ 
    joinName, setJoinName, agreedToTerms, setAgreedToTerms, handleJoin, isCheckingName, joinError, onTermsClick
}) => {
    // Sanitize on change
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setJoinName(sanitizeInput(val));
    };

    const isNameValid = isValidName(joinName);
    const isReady = agreedToTerms && isNameValid && !isCheckingName;

    return (
        <div className="h-[100dvh] w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#050505] to-black flex flex-col items-center justify-center font-sans text-white p-6 relative overflow-hidden">
            <div className="w-full max-w-sm flex flex-col items-center gap-8 animate-in fade-in zoom-in-95 duration-500 z-10">
                
                {/* Logo & Title */}
                <div className="flex flex-row items-center justify-center gap-4">
                    <div className="relative w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)] border border-white/10 overflow-hidden shrink-0 transform hover:scale-105 transition-transform duration-500">
                        <img src="/nearchat-logo.webp?v=3" alt="Logo" className="w-full h-full object-cover" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-white via-white to-white/60 bg-clip-text text-transparent drop-shadow-lg">NearChat</h1>
                </div>
                
                <div className="text-center space-y-4 w-full">
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 text-sm text-white/80 leading-relaxed text-left shadow-2xl ring-1 ring-white/5">
                        <p className="mb-3 font-medium text-emerald-100">📡 Localised Voice Network</p>
                        <p className="mb-4 text-white/70">Establish a private voice loop defined by your custom range. You only hear people inside your circle.</p>
                        
                        <div className="space-y-2">
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Great For:</p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-xs text-emerald-200">🚙 Road Trips</span>
                                <span className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded-md text-xs text-blue-200">🎉 Festivals</span>
                                <span className="px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded-md text-xs text-purple-200">🥾 Hiking</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full space-y-5 bg-[#121212]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl ring-1 ring-white/5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Your Callsign</label>
                        <input 
                            type="text" 
                            value={joinName}
                            onChange={handleNameChange}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all text-lg font-bold text-center tracking-wide"
                            placeholder="Alphanumeric Only (Min 2)"
                            maxLength={20}
                        />
                        <p className="text-[10px] text-white/30 text-center">A-Z, 0-9 Only. No spaces or symbols.</p>
                        {joinError && <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-300 text-xs text-center font-medium">{joinError}</div>}
                    </div>

                    <div 
                        className={`flex items-center gap-3 bg-black/30 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${agreedToTerms ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/5 hover:border-white/10'}`} 
                        onClick={() => setAgreedToTerms(!agreedToTerms)}
                    >
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${agreedToTerms ? 'bg-emerald-500 border-emerald-500 shadow-sm' : 'border-white/20 bg-transparent'}`}>
                            {agreedToTerms && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
                        </div>
                        <span className="text-sm text-white/60 select-none">
                            I agree to the <span className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2" onClick={(e) => { e.stopPropagation(); onTermsClick(); }}>Terms of Service</span>
                        </span>
                    </div>

                    <button
                        onClick={handleJoin}
                        disabled={!isReady}
                        className={`
                            items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold tracking-widest transition-transform duration-200 ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group relative cursor-pointer border-0 w-full h-14
                            ${isReady ? 'animate-rainbow bg-[linear-gradient(#fff,#fff),linear-gradient(#fff_50%,rgba(255,255,255,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,hsl(0,100%,63%),hsl(90,100%,63%),hsl(210,100%,63%),hsl(195,100%,63%),hsl(270,100%,63%))] dark:bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,hsl(0,100%,63%),hsl(90,100%,63%),hsl(210,100%,63%),hsl(195,100%,63%),hsl(270,100%,63%))]' : 'bg-white/5 border border-white/5'}
                            bg-[length:200%] text-foreground [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] 
                            before:absolute before:bottom-[-20%] before:left-1/2 before:z-[0] before:h-[20%] before:w-[60%] before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,hsl(0,100%,63%),hsl(90,100%,63%),hsl(210,100%,63%),hsl(195,100%,63%),hsl(270,100%,63%))] before:[filter:blur(calc(0.8*1rem))] 
                            hover:scale-105 active:scale-95 inline-flex
                        `}
                    >
                        <span className={`relative z-10 ${isReady ? 'text-white' : 'text-white/20'}`}>
                            {isCheckingName ? 'CHECKING...' : 'INITIALISE COMMS'}
                        </span>
                    </button>
                </div>
            </div>
            <div className="absolute bottom-4 text-[10px] text-white/50 font-mono tracking-wide">Copyright 2025. All Rights Reserved. Jas.</div>
        </div>
    );
};

export default LandingPage;
