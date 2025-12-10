
import React from 'react';

const TermsPage = ({ onClose }: { onClose: () => void }) => {
    return (
        <div className="absolute inset-0 z-[60] bg-[#050505] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="p-6 pb-20 max-w-lg mx-auto">
                <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#050505]/95 backdrop-blur-xl py-4 z-10">
                    <h2 className="text-xl font-bold">Terms of Service</h2>
                    <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="space-y-6 text-sm text-white/70 leading-relaxed">
                    <section className="bg-white/5 p-5 rounded-xl border border-white/5">
                        <h3 className="text-white font-bold mb-2">1. Acceptance of Terms</h3>
                        <p>By accessing or using NearChat ("the Service"), you agree to be bound by these Terms. If you do not agree, you may not use the Service.</p>
                    </section>

                    <section className="bg-white/5 p-5 rounded-xl border border-white/5">
                        <h3 className="text-white font-bold mb-2">2. Acceptable Use</h3>
                        <p className="mb-2">You agree not to use the Service for any unlawful purpose or any purpose prohibited by these Terms. You specifically agree NOT to:</p>
                        <ul className="list-disc pl-5 space-y-1 opacity-80">
                            <li>Harass, abuse, or threaten others.</li>
                            <li>Transmit hate speech, offensive content, or inappropriate audio.</li>
                            <li>Use the service for illegal coordination or activities.</li>
                            <li>Spam or disrupt the network.</li>
                        </ul>
                    </section>

                    <section className="bg-white/5 p-5 rounded-xl border border-white/5">
                        <h3 className="text-white font-bold mb-2">3. Privacy & Location</h3>
                        <p>NearChat relies on your geolocation. While we add "fuzzing" to obscure your exact standing point on other users' screens, you acknowledge that your approximate location is broadcast to other users within range.</p>
                    </section>

                    <section className="bg-white/5 p-5 rounded-xl border border-white/5">
                        <h3 className="text-white font-bold mb-2">4. Disclaimer of Warranties</h3>
                        <p className="uppercase text-xs font-bold mb-1 opacity-60">THE SERVICE IS PROVIDED "AS IS".</p>
                        <p>We provide no warranties regarding reliability, availability, or suitability for critical communications. This is a hobby project and should not be used for emergency services.</p>
                    </section>

                    <section className="bg-white/5 p-5 rounded-xl border border-white/5">
                        <h3 className="text-white font-bold mb-2">5. Termination</h3>
                        <p>The operator reserves the right to ban or block any user at their sole discretion, without notice or refund (if applicable), for violating these terms or for any other reason.</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
