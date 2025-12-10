
import React, { useState } from 'react';
import { Satellite, Signal, HelpCircle } from 'lucide-react';

interface HeaderProps {
    gpsStatus: { text: string; color: string; dot: string };
    connectionStatus: string;
    onHelpClick: () => void;
    onGpsClick: () => void;
    onNetworkClick: () => void;
    theme: 'dark' | 'light';
    peerCount: number;
}

const Header = ({ 
    gpsStatus, 
    connectionStatus, 
    onHelpClick, 
    onGpsClick, 
    onNetworkClick, 
    theme, 
    peerCount
}: HeaderProps) => {
    
    // Theme Colors
    const isLight = theme === 'light';
    const textColor = isLight ? 'text-zinc-800' : 'text-white/90';
    
    // Semantic Status Colors (Explicitly Green for Success)
    const healthyColor = isLight ? 'text-emerald-600' : 'text-emerald-400';
    const warningColor = 'text-amber-500 animate-pulse';
    const errorColor = 'text-rose-500';

    // Dev Mode Reload Logic
    const [clickCount, setClickCount] = useState(0);

    const handleTitleClick = () => {
        const newCount = clickCount + 1;
        setClickCount(newCount);
        if (newCount === 7) {
            window.location.reload();
        }
    };

    // Helper to get connection icon style
    const getConnectionStyle = () => {
        switch (connectionStatus) {
            case 'connected': return healthyColor;
            case 'connecting': return warningColor;
            case 'error': 
            case 'disconnected': 
            default: return errorColor;
        }
    };

    // Helper to get GPS icon style
    const getGpsStyle = () => {
        if (gpsStatus.text.includes("LOCK")) return healthyColor;
        if (gpsStatus.text.includes("LOST") || gpsStatus.text.includes("denied")) return errorColor;
        return warningColor; 
    };

    return (
        <div className="w-full flex justify-between items-start p-5 z-20 shrink-0 relative">
            <div 
                className="flex items-center gap-2 cursor-pointer select-none"
                onClick={handleTitleClick}
            >
                <div className="w-8 h-8 rounded-xl overflow-hidden p-0.5">
                    <img src="/nearchat-logo.webp?v=3" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <h1 className={`text-xl font-bold tracking-wide drop-shadow-sm font-sans ${textColor}`}>NearChat</h1>
            </div>
            
            <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-0">
                    {/* GPS Icon */}
                    <button 
                        onClick={onGpsClick}
                        className={`p-2 transition-all hover:scale-110 active:scale-95 ${getGpsStyle()}`}
                        title={gpsStatus.text}
                    >
                        <Satellite size={20} strokeWidth={2.5} />
                    </button>

                    {/* Network Icon */}
                    <button 
                        onClick={onNetworkClick}
                        className={`p-2 transition-all hover:scale-110 active:scale-95 ${getConnectionStyle()}`}
                        title={connectionStatus}
                    >
                        <Signal size={20} strokeWidth={2.5} />
                    </button>

                    {/* Help Icon */}
                    <button 
                        onClick={onHelpClick} 
                        className={`p-2 transition-all hover:scale-110 active:scale-95 ${isLight ? 'text-zinc-500 hover:text-zinc-800' : 'text-white/60 hover:text-white'}`}
                    >
                        <HelpCircle size={20} />
                    </button>
                </div>
                
                {/* Peers Count */}
                <div className={`text-[10px] font-bold uppercase tracking-widest px-2 ${isLight ? 'text-zinc-500' : 'text-white/50'}`}>
                    {peerCount} Peer{peerCount !== 1 ? 's' : ''}
                </div>
            </div>
        </div>
    );
};
export default Header;
