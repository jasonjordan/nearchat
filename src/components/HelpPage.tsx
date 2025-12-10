
import React from 'react';

const HelpPage = ({ onClose, onTermsClick }: { onClose: () => void, onTermsClick: () => void }) => {
    return (
        <div className="absolute inset-0 z-[60] bg-[#050505] overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="p-6 pb-20">
                <div className="flex justify-between items-center mb-8 sticky top-0 bg-[#050505]/90 backdrop-blur-xl py-4 z-10 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">ℹ️</span>
                        <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">User Guide</h2>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="space-y-6">
                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-emerald-400 text-lg">📡</span>
                            <h3 className="text-white font-bold uppercase tracking-wider text-xs">How it Works</h3>
                        </div>
                        <p className="text-white/80 text-sm leading-relaxed bg-white/5 p-4 rounded-xl border border-white/10 shadow-lg">
                            NearChat is a <strong>proximity-based</strong> radio. Think of it like shouting in a field—you can only hear people close to you, and they can only hear you if they are close enough.<br/><br/>
                            You set your own <strong>Receive Radius</strong>. If someone is inside that circle, you hear them. If not, silence. 
                        </p>
                    </section>

                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-emerald-400 text-lg">🎮</span>
                            <h3 className="text-white font-bold uppercase tracking-wider text-xs">Controls</h3>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-4 shadow-lg">
                            <div className="flex gap-4 items-start">
                                <div className="shrink-0 w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-xl border border-emerald-500/20">🤏</div>
                                <div>
                                    <p className="font-bold text-sm text-emerald-100">Pinch to Zoom</p>
                                    <p className="text-xs text-white/60 mt-1">Pinch the radar screen to expand or shrink your listening range instantly.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="shrink-0 w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-xl border border-emerald-500/20">👤</div>
                                <div>
                                    <p className="font-bold text-sm text-emerald-100">Tap Centre Icon</p>
                                    <p className="text-xs text-white/60 mt-1">Tap the white person in the middle to change your own Callsign.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="shrink-0 w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-xl border border-emerald-500/20">👆</div>
                                <div>
                                    <p className="font-bold text-sm text-emerald-100">Tap Other Users</p>
                                    <p className="text-xs text-white/60 mt-1">Tap anyone on the map to <strong>Mute</strong>, <strong>Block</strong>, or <strong>Rename</strong> them.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-emerald-400 text-lg">🗣️</span>
                            <h3 className="text-white font-bold uppercase tracking-wider text-xs">Smart Audio</h3>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10 shadow-lg space-y-2">
                            <p className="text-white/80 text-sm leading-relaxed">
                                <strong>No more talking over each other.</strong><br/>
                                NearChat queues incoming audio. If three people talk at once, you'll hear them one after another in a logical order.
                            </p>
                            <p className="text-white/80 text-sm leading-relaxed border-t border-white/5 pt-2 mt-2">
                                <strong>30 Second Limit:</strong> Transmissions are limited to 30 seconds to keep the channel clear.
                            </p>
                        </div>
                    </section>

                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-emerald-400 text-lg">🛡️</span>
                            <h3 className="text-white font-bold uppercase tracking-wider text-xs">Privacy & Safety</h3>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-3 shadow-lg">
                             <p className="text-white/80 text-sm">
                                <strong>👻 Location Fuzzing</strong><br/>
                                Locations are approximate. We add random "jitter" to the map so nobody knows your exact standing point.
                            </p>
                            <p className="text-white/80 text-sm">
                                <strong>🚫 Blocking</strong><br/>
                                If you block a user, they vanish from your map and you never hear them again.
                            </p>
                        </div>
                    </section>

                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500 pt-4 border-t border-white/10">
                        <div className="text-center">
                            <p className="text-white/50 text-xs mb-3">Please remember you agreed to the Terms of Service when joining.</p>
                            <button 
                                onClick={onTermsClick} 
                                className="text-emerald-400 text-xs font-bold uppercase tracking-widest hover:text-emerald-300 hover:underline underline-offset-4 transition-all"
                            >
                                Read Terms of Service
                            </button>
                        </div>
                    </section>
                </div>
                
                <div className="mt-8 text-center">
                    <p className="text-[10px] text-white/30">Copyright 2025. All Rights Reserved. Jas.</p>
                </div>
            </div>
        </div>
    );
};
export default HelpPage;
