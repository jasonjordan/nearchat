
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { RealtimeService } from './services/realtimeService';
import type { Location, OtherUser, ConnectionStatus, S2C_Message } from './types';
import { 
    getPersistentCallsign, 
    updatePersistentCallsign, 
    calculateDistance, 
    playMicClick, 
    playArrivalSound,
    playDepartureSound,
    sliderToRadius, 
    radiusToSlider, 
    calculateRadarPos,
    resolveCollisions
} from './utils';

import LandingPage from './components/LandingPage';
import ResumePage from './components/ResumePage';
import RadarView, { ProcessedBlip } from './components/RadarView';
import Controls from './components/Controls';
import Header from './components/Header';
import HelpPage from './components/HelpPage';
import TermsPage from './components/TermsPage';
import AdminDashboard from './components/AdminDashboard';
import { RangeModal, UserProfileModal, SelfEditModal } from './components/Modals';

interface UserWithTrail extends OtherUser {
    trail: Location[];
    isLeaving?: boolean;
}

// Silent audio track for keeping background audio active on iOS/Android
// Corrected MIME type to audio/mpeg to prevent NotSupportedError
const SILENT_AUDIO_URI = "data:audio/mpeg;base64,SUQzBAAAAAAAI1RTSSEAAAAAPAAADEVuY29kZWQgd2l0aCBMYW1lMy45OS41AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq";

// Helper to safely parse Maps from local storage to prevent crashes (White Screen of Death)
const safeParseMap = (key: string): Map<string, any> => {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return new Map();
        const parsed = JSON.parse(raw);
        // If it's an array of entries (valid Map format), use it
        if (Array.isArray(parsed)) return new Map(parsed);
        // If it's an object (old format), convert to Map
        if (typeof parsed === 'object' && parsed !== null) return new Map(Object.entries(parsed));
        return new Map();
    } catch (e) {
        console.warn(`Failed to parse ${key}, resetting.`, e);
        return new Map();
    }
};

const safeParseSet = (key: string): Set<string> => {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return new Set();
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return new Set(parsed);
        return new Set();
    } catch {
        return new Set();
    }
};

// Mobile Container Wrapper
const MobileWrapper = ({ children, theme = 'dark' }: { children: React.ReactNode, theme?: 'dark' | 'light' }) => (
    <div className="w-full h-full flex items-center justify-center bg-[#050505]">
        <div className={`w-full h-full max-w-[480px] relative flex flex-col shadow-2xl overflow-hidden ${theme === 'light' ? 'bg-zinc-50' : 'bg-black'}`}>
            {children}
        </div>
    </div>
);

const App: React.FC = () => {
    // --- Admin Routing ---
    const [isAdminMode, setIsAdminMode] = useState(false);
    useEffect(() => {
        const checkHash = () => setIsAdminMode(window.location.hash === '#admin');
        window.addEventListener('hashchange', checkHash);
        checkHash();
        return () => window.removeEventListener('hashchange', checkHash);
    }, []);

    // --- State: Theme ---
    const [theme, setTheme] = useState<'dark' | 'light'>(() => {
        return (localStorage.getItem('nearChatTheme') as 'dark' | 'light') || 'dark';
    });
    useEffect(() => { localStorage.setItem('nearChatTheme', theme); }, [theme]);

    // --- State: Landing/Resume Page ---
    const [hasJoined, setHasJoined] = useState(() => localStorage.getItem('nearChatHasJoined') === 'true');
    const [hasResumed, setHasResumed] = useState(false); 
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [joinName, setJoinName] = useState(() => getPersistentCallsign());
    const [joinError, setJoinError] = useState<string | null>(null);
    const [isCheckingName, setIsCheckingName] = useState(false);
    const [showTerms, setShowTerms] = useState(false);

    // --- State: Connection & Self ---
    const [status, setStatus] = useState<ConnectionStatus>('idle');
    const [callsign, setCallsign] = useState(joinName);
    const [userLocation, setUserLocation] = useState<Location | null>(null);
    const [gpsAccuracy, setGpsAccuracy] = useState<number>(0); 
    const [isNameLocked, setIsNameLocked] = useState(false);
    const [myAvatar, setMyAvatar] = useState<string | undefined>(undefined);

    const [otherUsers, setOtherUsers] = useState<Map<string, UserWithTrail>>(new Map());
    const [isTalking, setIsTalking] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [receiveRadius, setReceiveRadius] = useState<number>(2000); 
    
    const [lastReceivedId, setLastReceivedId] = useState<string | null>(null);
    const [usingLowAccuracy, setUsingLowAccuracy] = useState(false);
    const [muteSounds, setMuteSounds] = useState(() => localStorage.getItem('nearChatMuteSounds') === 'true');
    
    // --- Local User Management (Mute/Block/Alias) ---
    const [mutedUsers, setMutedUsers] = useState<Set<string>>(() => safeParseSet('nearChatMuted'));
    const [blockedUsers, setBlockedUsers] = useState<Set<string>>(() => safeParseSet('nearChatBlocked'));
    const [userAliases, setUserAliases] = useState<Map<string, string>>(() => safeParseMap('nearChatAliases'));

    // --- Services ---
    const realtimeService = useRef(new RealtimeService());

    // --- SELF HEALING: Fix Stale Service Instances during HMR/Updates ---
    // If the class definition updated but useRef held the old object, this swaps it.
    if (!realtimeService.current.updateAvatar || !realtimeService.current.ensureAuth) {
        console.log("Detecting stale RealtimeService instance... Re-instantiating.");
        realtimeService.current = new RealtimeService();
    }

    const silentAudioRef = useRef<HTMLAudioElement>(null);
    const [showHelp, setShowHelp] = useState(false);
    const [selectedUser, setSelectedUser] = useState<OtherUser | null>(null);
    const [isSelfEditOpen, setIsSelfEditOpen] = useState(false);
    const [isRangeModalOpen, setIsRangeModalOpen] = useState(false);
    
    // --- Modal Inputs ---
    const [aliasInput, setAliasInput] = useState("");
    const [editNameInput, setEditNameInput] = useState("");

    // --- Persist Local Data ---
    useEffect(() => { localStorage.setItem('nearChatMuted', JSON.stringify([...mutedUsers])); }, [mutedUsers]);
    useEffect(() => { localStorage.setItem('nearChatBlocked', JSON.stringify([...blockedUsers])); }, [blockedUsers]);
    useEffect(() => { localStorage.setItem('nearChatAliases', JSON.stringify([...userAliases])); }, [userAliases]);
    useEffect(() => { localStorage.setItem('nearChatMuteSounds', String(muteSounds)); }, [muteSounds]);

    // --- Audio Handling ---
    const handleAudioMessage = async (msg: S2C_Message) => {
        if (msg.type !== 'audioMessage') return;
        const senderId = msg.payload.fromId;

        // Ignore if message is from myself
        if (realtimeService.current.userId && senderId === realtimeService.current.userId) return;

        // Ignore if blocked or muted locally
        if (blockedUsers.has(senderId)) return;
        if (mutedUsers.has(senderId)) return;

        // Ignore if muted GLOBALLY by admin
        const sender = otherUsers.get(senderId);
        if (sender?.isMutedGlobal) return;
        
        // Ignore if out of THEIR range or OUR range
        if (!userLocation || !sender) {
            // If we don't know where they are, trust server/app logic but mostly just play it
            realtimeService.current.playAudio(msg.payload.audioBlob, msg.payload.mimeType);
        } else {
             const dist = calculateDistance(userLocation, sender.location);
             if (dist <= receiveRadius) {
                 realtimeService.current.playAudio(msg.payload.audioBlob, msg.payload.mimeType);
                 setLastReceivedId(senderId);
                 setTimeout(() => setLastReceivedId(null), 3000);
             }
        }
    };

    // --- Message Handler ---
    const handleMessage = useCallback((msg: S2C_Message) => {
        switch (msg.type) {
            case 'channelState':
                const newMap = new Map<string, UserWithTrail>();
                msg.payload.users.forEach(u => {
                    if (u.id === realtimeService.current.userId) return;
                    if (blockedUsers.has(u.id)) return;
                    // Safely initialize trail
                    newMap.set(u.id, { ...u, trail: [u.location] });
                });
                setOtherUsers(newMap);
                break;
            case 'userJoined':
                if (msg.payload.callsign === callsign) return; 
                if(!muteSounds) playArrivalSound();
                break;
            case 'userLeft':
                setOtherUsers(prev => {
                    const next = new Map(prev);
                    for(const [key, val] of next.entries()) {
                        if(val.callsign === msg.payload.callsign) {
                            next.delete(key);
                            break;
                        }
                    }
                    return next;
                });
                if(!muteSounds) playDepartureSound();
                break;
            case 'userLocationUpdated':
                setOtherUsers(prev => {
                    const next = new Map(prev);
                    for(const [key, val] of next.entries()) {
                        if(val.callsign === msg.payload.callsign) {
                            // SAFEGUARD: val.trail might be undefined if data was partial
                            const safeTrail = val.trail || [];
                            const updated = { 
                                ...val, 
                                location: msg.payload.location,
                                receiveRadius: msg.payload.receiveRadius,
                                trail: [...safeTrail, msg.payload.location].slice(-20) 
                            };
                            next.set(key, updated);
                            break;
                        }
                    }
                    return next;
                });
                break;
            case 'audioMessage':
                handleAudioMessage(msg);
                break;
        }
    }, [blockedUsers, mutedUsers, callsign, userLocation, receiveRadius, muteSounds]);

    // --- Connection ---
    const connect = () => {
        // Start background audio hack
        if (silentAudioRef.current) {
            silentAudioRef.current.play().catch(e => console.log("Silent audio failed (user interaction needed)", e));
        }

        const callbacks = {
            onMessage: handleMessage,
            onOpen: () => { setStatus('connected'); setHasJoined(true); setHasResumed(true); localStorage.setItem('nearChatHasJoined', 'true'); },
            onClose: () => setStatus('disconnected'),
            onError: (e: any) => setErrorMessage(e.message),
            onCallsignResolved: (name: string) => { 
                setCallsign(name); 
                updatePersistentCallsign(name); 
            },
            onFlagsChanged: (flags: { isBanned?: boolean, nameLocked?: boolean, callsign?: string, avatar?: string }) => {
                if (flags.nameLocked !== undefined) setIsNameLocked(flags.nameLocked);
                if (flags.avatar) setMyAvatar(flags.avatar);
            }
        };

        if (!userLocation) {
             navigator.geolocation.getCurrentPosition(
                 (pos) => {
                     const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
                     setUserLocation(loc);
                     realtimeService.current.connect(callsign, loc, receiveRadius, callbacks);
                 },
                 (err) => setErrorMessage("Location access required.")
             );
        } else {
            realtimeService.current.connect(callsign, userLocation, receiveRadius, callbacks);
        }
    };

    // --- GPS Watcher ---
    useEffect(() => {
        if (!hasJoined) return;
        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
                setUserLocation(loc);
                setGpsAccuracy(pos.coords.accuracy);
                if(pos.coords.accuracy > 50) setUsingLowAccuracy(true);
                else setUsingLowAccuracy(false);
                
                realtimeService.current.updateLocation(loc, receiveRadius);
            },
            (err) => {
                console.warn("GPS Error", err);
                setGpsAccuracy(9999);
            },
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
        );
        return () => navigator.geolocation.clearWatch(watchId);
    }, [hasJoined, receiveRadius]);

    // --- PTT Logic ---
    const handlePTTStart = () => {
        if (status !== 'connected') return;
        setIsTalking(true);
        if(!muteSounds) playMicClick('on');
        realtimeService.current.startRecording();
    };

    const handlePTTEnd = () => {
        if (!isTalking) return;
        setIsTalking(false);
        if(!muteSounds) playMicClick('off');
        realtimeService.current.stopRecordingAndSend();
    };

    // --- Render Helpers ---
    const activeBlips: ProcessedBlip[] = useMemo(() => {
        if (!userLocation) return [];

        // 1. Calculate Initial Positions
        const rawBlips = Array.from(otherUsers.entries()).map(([id, user]) => {
             const dist = calculateDistance(userLocation, user.location);
             // Jitter/randomness handled inside calculateRadarPos now
             const pos = calculateRadarPos(user.location, userLocation, receiveRadius, id);
             
             const isTx = id === lastReceivedId;
             
             // Safeguard trail mapping
             const safeTrail = user.trail || [];
             const trailPoints = safeTrail
                .map(t => calculateRadarPos(t, userLocation, receiveRadius, id)) 
                .filter((p): p is {x: number, y: number} => p !== null)
                .map(p => ({...p, opacity: 0.5}));

             return {
                 id,
                 user,
                 x: pos?.x || 50,
                 y: pos?.y || 50,
                 dist,
                 displayDist: dist,
                 isTransmitting: isTx,
                 trailPoints
             };
        });

        // 2. Resolve Collisions (Force-Directed Layout)
        // Extract coordinate objects for the physics engine
        const coords = rawBlips.map(b => ({ x: b.x, y: b.y, id: b.id }));
        // Increased radius to 20 to provide plenty of space for text labels so they don't overlap
        const adjustedCoords = resolveCollisions(coords, 20);

        // 3. Merge back
        return rawBlips.map((blip, i) => ({
            ...blip,
            x: adjustedCoords[i].x,
            y: adjustedCoords[i].y
        }));
    }, [otherUsers, userLocation, receiveRadius, lastReceivedId]);

    const myActiveBlip = activeBlips.find(b => b.id === selectedUser?.id);

    // --- Main Render ---

    if (isAdminMode) return <AdminDashboard />;

    // Hidden audio for background persistence
    const backgroundAudio = (
        <audio 
            ref={silentAudioRef} 
            src={SILENT_AUDIO_URI} 
            loop 
            playsInline 
            muted={false} // Important for iOS session
            style={{ display: 'none' }} 
        />
    );

    if (!hasJoined) {
        return (
            <MobileWrapper>
                {backgroundAudio}
                <LandingPage 
                    joinName={joinName}
                    setJoinName={setJoinName}
                    agreedToTerms={agreedToTerms}
                    setAgreedToTerms={setAgreedToTerms}
                    handleJoin={connect}
                    isCheckingName={isCheckingName}
                    joinError={joinError}
                    onTermsClick={() => setShowTerms(true)}
                />
            </MobileWrapper>
        );
    }

    if (!hasResumed && status !== 'connected') {
        return (
            <MobileWrapper>
                {backgroundAudio}
                <ResumePage callsign={callsign} onRejoin={connect} />
            </MobileWrapper>
        );
    }

    return (
        <MobileWrapper theme={theme}>
            {backgroundAudio}
            
            <Header 
                gpsStatus={{ 
                    text: gpsAccuracy < 50 ? "GPS LOCKED" : (gpsAccuracy < 200 ? "WEAK GPS" : "NO GPS"), 
                    color: gpsAccuracy < 50 ? "green" : "red", 
                    dot: "" 
                }}
                connectionStatus={status}
                onHelpClick={() => setShowHelp(true)}
                onGpsClick={() => {}}
                onNetworkClick={() => setIsRangeModalOpen(true)}
                theme={theme}
                peerCount={otherUsers.size}
            />

            <RadarView 
                receiveRadius={receiveRadius}
                setReceiveRadius={setReceiveRadius}
                radarScale={receiveRadius}
                blips={activeBlips}
                activeBlip={myActiveBlip}
                userAliases={userAliases}
                mutedUsers={mutedUsers}
                isTalking={isTalking}
                handleSelfIconClick={() => setIsSelfEditOpen(true)}
                handleUserClick={(u) => { setSelectedUser(u); setAliasInput(userAliases.get(u.id) || ""); }}
                setSelectedUser={setSelectedUser}
                theme={theme}
                myAvatar={myAvatar}
            />

            <Controls 
                status={status}
                isTalking={isTalking}
                handleMouseDown={handlePTTStart}
                handleMouseUp={handlePTTEnd}
                theme={theme}
            />

            {/* Modals */}
            {isRangeModalOpen && (
                <RangeModal 
                    onClose={() => setIsRangeModalOpen(false)}
                    sliderValue={radiusToSlider(receiveRadius)}
                    handleSliderChange={(e) => setReceiveRadius(sliderToRadius(Number(e.target.value)))}
                    receiveRadius={receiveRadius}
                    theme={theme}
                />
            )}

            {selectedUser && (
                <UserProfileModal 
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                    aliasInput={aliasInput}
                    setAliasInput={setAliasInput}
                    saveAlias={() => {
                        setUserAliases(prev => new Map(prev).set(selectedUser.id, aliasInput));
                        setSelectedUser(null);
                    }}
                    toggleMute={() => {
                        setMutedUsers(prev => {
                            const next = new Set(prev);
                            if (next.has(selectedUser.id)) next.delete(selectedUser.id);
                            else next.add(selectedUser.id);
                            return next;
                        });
                        setSelectedUser(null);
                    }}
                    toggleBlock={() => {
                        setBlockedUsers(prev => {
                            const next = new Set(prev);
                            next.add(selectedUser.id);
                            return next;
                        });
                        realtimeService.current.incrementBlockCount(selectedUser.id);
                        setSelectedUser(null);
                    }}
                    isMuted={mutedUsers.has(selectedUser.id)}
                    userAliases={userAliases}
                />
            )}

            {isSelfEditOpen && (
                <SelfEditModal 
                    onClose={() => setIsSelfEditOpen(false)}
                    name={editNameInput || callsign}
                    setName={setEditNameInput}
                    save={() => {
                        if (editNameInput && editNameInput !== callsign && !isNameLocked) {
                            setCallsign(editNameInput);
                            updatePersistentCallsign(editNameInput);
                            realtimeService.current.updateCallsign(editNameInput);
                        }
                        setIsSelfEditOpen(false);
                    }}
                    muteSounds={muteSounds}
                    setMuteSounds={setMuteSounds}
                    theme={theme}
                    setTheme={setTheme}
                    isNameLocked={isNameLocked}
                    service={realtimeService.current}
                />
            )}

            {showHelp && <HelpPage onClose={() => setShowHelp(false)} onTermsClick={() => setShowTerms(true)} />}
            {showTerms && <TermsPage onClose={() => setShowTerms(false)} />}
        </MobileWrapper>
    );
};

export default App;
