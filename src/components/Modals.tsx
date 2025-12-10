
import React, { useRef, useState } from 'react';
import { formatDistance, getUserColor, sanitizeInput, isValidName } from '../utils';
import { OtherUser } from '../types';
import { Lock, Camera, Upload, X } from 'lucide-react';
import { RealtimeService } from '../services/realtimeService';

export const RangeModal = ({ 
    onClose, sliderValue, handleSliderChange, receiveRadius, theme 
}: { 
    onClose: () => void, sliderValue: number, handleSliderChange: (e: React.ChangeEvent<HTMLInputElement>) => void, receiveRadius: number, theme: 'dark' | 'light'
}) => {
    const isLight = theme === 'light';
    const accentColor = isLight ? 'text-blue-600' : 'text-blue-400';
    const bgClass = isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-[#1c1c1e] border-white/10';
    const textBase = isLight ? 'text-zinc-900' : 'text-white';
    const trackColor = isLight ? 'bg-zinc-300' : 'bg-white/10';

    return (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
            <div className={`w-full ${bgClass} sm:rounded-3xl rounded-t-3xl border-t sm:border p-6 pb-10 animate-in slide-in-from-bottom duration-300`} onClick={e => e.stopPropagation()}>
                    <div className={`w-12 h-1.5 rounded-full mx-auto mb-6 ${isLight ? 'bg-zinc-300' : 'bg-white/10'}`}></div>
                    <h3 className={`text-center text-lg font-semibold mb-6 ${textBase}`}>Receive Range</h3>
                    
                    <div className="relative h-12 w-full flex items-center mb-2">
                    <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={sliderValue}
                        onChange={handleSliderChange}
                        className={`w-full h-2 rounded-full appearance-none cursor-pointer outline-none ${trackColor} [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_20px_rgba(0,0,0,0.3)] transition-all`}
                    />
                    </div>
                    
                    <div className={`flex justify-between items-center text-sm font-medium mb-8 px-1 ${isLight ? 'text-zinc-500' : 'text-white/50'}`}>
                    <span>50m</span>
                    <span className={`${accentColor} font-bold text-lg`}>{formatDistance(receiveRadius)}</span>
                    <span>5000km</span>
                    </div>

                    <button onClick={onClose} className={`w-full font-bold py-4 rounded-xl text-sm tracking-wide ${isLight ? 'bg-zinc-900 text-white' : 'bg-white text-black'}`}>
                    DONE
                    </button>
            </div>
        </div>
    );
};

export const UserProfileModal = ({
    user, onClose, aliasInput, setAliasInput, saveAlias, toggleMute, toggleBlock, isMuted, userAliases
}: {
    user: OtherUser, onClose: () => void, aliasInput: string, setAliasInput: (s: string) => void, saveAlias: () => void, toggleMute: () => void, toggleBlock: () => void, isMuted: boolean, userAliases: Map<string, string>
}) => {
    
    const handleAliasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAliasInput(sanitizeInput(e.target.value));
    };

    return (
        <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
                <div className="w-full max-w-[240px] bg-[#1a1a1a] border border-white/20 rounded-2xl p-4 shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="text-center mb-4">
                    <div className={`w-12 h-12 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-2 overflow-hidden ${getUserColor(user.id)}`}>
                        {user.avatar ? (
                            <img src={`data:image/png;base64,${user.avatar}`} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" /></svg>
                        )}
                    </div>
                    <h3 className="text-lg font-bold text-white break-words">{userAliases.get(user.id) || user.callsign}</h3>
                    {userAliases.has(user.id) && <p className="text-xs text-white/40">({user.callsign})</p>}
                </div>

                <div className="space-y-2 mb-4">
                    <div className="flex gap-2 h-9">
                        <input 
                            type="text" 
                            value={aliasInput}
                            onChange={handleAliasChange}
                            placeholder="Rename"
                            className="w-0 flex-grow bg-black/30 border border-white/10 rounded-md px-3 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                            maxLength={20}
                        />
                        <button onClick={saveAlias} className="px-3 bg-white/10 hover:bg-white/20 rounded-md text-xs font-semibold text-white/80">SAVE</button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <button onClick={toggleMute} className={`py-2 rounded-md text-xs font-bold border transition-colors ${isMuted ? 'bg-amber-500/20 border-amber-500/50 text-amber-500' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'}`}>
                        {isMuted ? 'UNMUTE' : 'MUTE'}
                    </button>
                    <button onClick={toggleBlock} className="py-2 rounded-md text-xs font-bold border border-rose-500/20 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors">
                        BLOCK
                    </button>
                </div>
                </div>
        </div>
    );
};

export const SelfEditModal = ({
    onClose, name, setName, save, muteSounds, setMuteSounds, theme, setTheme, isNameLocked, service
}: {
    onClose: () => void, name: string, setName: (s: string) => void, save: () => void,
    muteSounds: boolean, setMuteSounds: (val: boolean) => void,
    theme: 'dark' | 'light', setTheme: (t: 'dark' | 'light') => void,
    isNameLocked?: boolean,
    service: RealtimeService
}) => {
    const isLight = theme === 'light';
    const bgClass = isLight ? 'bg-white' : 'bg-[#1c1c1e]';
    const textBase = isLight ? 'text-zinc-900' : 'text-white';
    const textMuted = isLight ? 'text-zinc-500' : 'text-white/50';
    const inputBg = isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-black/50 border-white/10';
    const cardBg = isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-white/5 border-white/5';
    
    // Camera Logic
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Process Image (Crop to Center Square -> Resize 128x128 -> Circle Mask)
    const processImage = (file: File) => {
        setIsProcessing(true);
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                // 1. Resize & Crop Logic
                const size = 128;
                canvas.width = size;
                canvas.height = size;

                // Determine crop area
                const minSide = Math.min(img.width, img.height);
                const sx = (img.width - minSide) / 2;
                const sy = (img.height - minSide) / 2;
                
                // 2. Circle Mask
                ctx.beginPath();
                ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();

                // 3. Draw Image
                ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);

                // 4. Save
                const base64 = canvas.toDataURL('image/png').split(',')[1]; // Remove prefix
                
                // Use the prop service which is already connected
                if (service && typeof service.updateAvatar === 'function') {
                    service.updateAvatar(base64).then(() => {
                       setIsProcessing(false);
                    }).catch(err => {
                        console.error("Avatar update failed", err);
                        setIsProcessing(false);
                        alert("Failed to upload. Please try again.");
                    });
                } else {
                    console.error("Service not ready or missing updateAvatar method.");
                    setIsProcessing(false);
                    alert("Connection error. Please refresh the page manually.");
                }
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processImage(e.target.files[0]);
        }
    };

    const handleCamera = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'user'; // Attempt to trigger camera on mobile
        input.onchange = (e: any) => {
            if (e.target.files && e.target.files[0]) processImage(e.target.files[0]);
        };
        input.click();
    };

    // Accent Colors
    const accentBg = 'bg-blue-600';
    const accentShadow = 'shadow-blue-500/20';
    const activeRing = 'border-blue-500';

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(sanitizeInput(e.target.value));
    };

    const isValid = isValidName(name);

    return (
        <div className="absolute inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6" onClick={onClose}>
            <div className={`border p-6 rounded-2xl w-full max-w-xs shadow-2xl animate-in zoom-in-95 ${bgClass} ${isLight ? 'border-transparent' : 'border-white/20'}`} onClick={e => e.stopPropagation()}>
                    <h3 className={`text-center font-bold mb-4 ${textBase}`}>Settings</h3>
                    
                    <div className="space-y-4 mb-6">
                        
                        {/* Profile Picture */}
                        <div className={`p-4 rounded-lg border flex flex-col items-center gap-3 ${cardBg}`}>
                            <span className={`text-xs font-bold uppercase tracking-wider block ${textMuted}`}>Profile Picture</span>
                            <div className="flex gap-2 w-full">
                                <button 
                                    onClick={handleCamera}
                                    disabled={isProcessing}
                                    className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-lg border transition-all ${isLight ? 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50' : 'bg-black/30 border-white/10 text-white/80 hover:bg-white/5'}`}
                                >
                                    <Camera size={18} />
                                    <span className="text-[10px] font-bold">CAMERA</span>
                                </button>
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isProcessing}
                                    className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-lg border transition-all ${isLight ? 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50' : 'bg-black/30 border-white/10 text-white/80 hover:bg-white/5'}`}
                                >
                                    <Upload size={18} />
                                    <span className="text-[10px] font-bold">UPLOAD</span>
                                </button>
                            </div>
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            {isProcessing && <span className="text-xs text-blue-500 font-bold animate-pulse">Processing...</span>}
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className={`text-xs font-bold uppercase tracking-wider block ${textMuted}`}>My Callsign</label>
                                {isNameLocked && <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1"><Lock size={10} /> LOCKED BY ADMIN</span>}
                            </div>
                            <div className="relative">
                                <input 
                                    type="text"
                                    value={name}
                                    onChange={handleNameChange}
                                    disabled={isNameLocked}
                                    className={`w-full rounded-lg p-3 text-center font-medium focus:border-opacity-100 outline-none ${inputBg} ${textBase} ${activeRing} ${isNameLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    maxLength={20}
                                    placeholder="Min 2 Chars"
                                />
                                {isNameLocked && <div className="absolute inset-0 z-10" />}
                            </div>
                        </div>

                        {/* Theme Switcher */}
                        <div className={`p-3 rounded-lg border ${cardBg}`}>
                            <span className={`text-xs font-bold uppercase tracking-wider block mb-2 ${textMuted}`}>Display Theme</span>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setTheme('dark')}
                                    className={`flex-1 py-2 rounded-md text-xs font-bold transition-all border ${theme === 'dark' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-black/10 border-transparent text-zinc-500'}`}
                                >
                                    DARK
                                </button>
                                <button 
                                    onClick={() => setTheme('light')}
                                    className={`flex-1 py-2 rounded-md text-xs font-bold transition-all border ${theme === 'light' ? 'bg-blue-100 border-blue-500 text-blue-600' : 'bg-black/10 border-transparent text-zinc-500'}`}
                                >
                                    LIGHT
                                </button>
                            </div>
                        </div>

                        <div className={`flex items-center justify-between p-3 rounded-lg border ${cardBg}`}>
                            <span className={`text-sm ${isLight ? 'text-zinc-700' : 'text-white/80'}`}>UI Sounds</span>
                            <button 
                                onClick={() => setMuteSounds(!muteSounds)}
                                className={`w-10 h-6 rounded-full transition-colors relative ${!muteSounds ? accentBg : 'bg-zinc-300'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${!muteSounds ? 'left-5' : 'left-1'}`}></div>
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={onClose} className={`flex-1 py-3 rounded-lg text-sm font-semibold ${isLight ? 'bg-zinc-100 text-zinc-600' : 'bg-white/10 text-white'}`}>CANCEL</button>
                        <button 
                            onClick={save} 
                            disabled={!isValid || isNameLocked}
                            className={`flex-1 py-3 text-white rounded-lg text-sm font-bold shadow-lg transition-all ${isValid && !isNameLocked ? `${accentBg} ${accentShadow}` : 'bg-zinc-500 cursor-not-allowed'}`}
                        >
                            SAVE
                        </button>
                    </div>
            </div>
        </div>
    );
};
