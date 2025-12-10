
import { initializeApp } from 'firebase/app';
import { 
    getDatabase, 
    ref, 
    set, 
    get,
    onValue, 
    push, 
    onDisconnect, 
    onChildAdded,
    serverTimestamp,
    query,
    limitToLast,
    runTransaction,
    update
} from 'firebase/database';
import type { Database } from 'firebase/database';
import * as firebaseAuth from 'firebase/auth';
import type { Location, S2C_Message, OtherUser, AnalyticsData } from '../types';

// Strict Environment Variable Loading
const getEnv = (key: keyof ImportMetaEnv): string => {
    const val = import.meta.env[key];
    if (!val) {
        throw new Error(`Missing Configuration: ${key}`);
    }
    return val;
};

let firebaseConfig;
try {
    firebaseConfig = {
      apiKey: getEnv('VITE_FIREBASE_API_KEY'),
      authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
      databaseURL: getEnv('VITE_FIREBASE_DATABASE_URL'),
      projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
      storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
      appId: getEnv('VITE_FIREBASE_APP_ID'),
      measurementId: getEnv('VITE_FIREBASE_MEASUREMENT_ID')
    };
} catch (e) {
    console.error("Firebase Config Error:", e);
}

// Singleton Initialization
let app;
let db: Database;
let auth: firebaseAuth.Auth;

if (firebaseConfig) {
    try {
        app = initializeApp(firebaseConfig);
        db = getDatabase(app);
        auth = firebaseAuth.getAuth(app);
    } catch (e) {
        console.error("[RealtimeService] Failed to initialize Firebase SDK:", e);
    }
}

// Utility: Blob/Base64
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  try {
      const byteCharacters = atob(base64);
      const byteArrays = [];
      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      return new Blob(byteArrays, { type: mimeType });
  } catch(e) {
      console.error("base64ToBlob failed", e);
      return new Blob([], { type: mimeType });
  }
}

interface RealtimeServiceCallbacks {
  onMessage: (message: S2C_Message) => void;
  onOpen: () => void;
  onClose: (e: any) => void;
  onError: (e: any) => void;
  onCallsignResolved?: (callsign: string) => void;
}

// Global AudioContext Singleton to prevent exhaustion
let sharedAudioContext: AudioContext | null = null;

export class RealtimeService {
    private mediaRecorder: MediaRecorder | null = null;
    private audioChunks: Blob[] = [];
    private stream: MediaStream | null = null;
    
    public userId: string | null = null;
    private currentCallsign: string | null = null;
    private currentLocation: Location | null = null;
    private currentRadius: number = 2000;
    
    private audioQueue: { base64: string, mimeType?: string }[] = [];
    private isPlayingAudio: boolean = false;

    private intendedDisconnect: boolean = false;
    private retryDelay: number = 1000;
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private callbacks: RealtimeServiceCallbacks | null = null;
    
    private sessionStartTime: number = 0;
    private keepAliveInterval: ReturnType<typeof setInterval> | null = null;
    private usersUnsub: (() => void) | null = null;

    async logVisit() {
        if(!db) return;
        try {
            const today = new Date().toISOString().split('T')[0];
            const visitRef = ref(db, `analytics/daily_visits/${today}`);
            await runTransaction(visitRef, (count) => (count || 0) + 1);
        } catch (e) {
            console.warn("[RealtimeService] Log visit failed:", e);
        }
    }

    async isCallsignTaken(callsign: string): Promise<boolean> {
        if (!db) return false;
        try {
            const profilesRef = ref(db, 'profiles');
            const q = query(profilesRef, limitToLast(100)); 
            const snapshot = await get(q);
            let taken = false;
            snapshot.forEach(child => {
                const data = child.val();
                if (data && data.callsign && data.callsign.toLowerCase() === callsign.toLowerCase()) {
                    taken = true;
                }
            });
            return taken;
        } catch (e) {
            return false;
        }
    }

    async measureLatency(): Promise<number> {
        if (!db || !this.userId) return 0;
        const start = Date.now();
        const pingRef = ref(db, `users/${this.userId}/ping`);
        await set(pingRef, start);
        return Date.now() - start;
    }

    listenToAllUsers(callback: (users: OtherUser[]) => void) {
        if (!db) return () => {};
        const usersRef = ref(db, 'users');
        return onValue(usersRef, (snapshot) => {
            const users: OtherUser[] = [];
            snapshot.forEach(child => {
                users.push({ id: child.key!, ...child.val() });
            });
            callback(users);
        });
    }

    listenToAnalytics(callback: (data: AnalyticsData) => void) {
        if (!db) return () => {};
        const visitsRef = ref(db, 'analytics/daily_visits');
        const usersRef = ref(db, 'users');

        let dailyVisits: {date: string, count: number}[] = [];
        let locations: {lat: number, lng: number}[] = [];
        let activeUsers = 0;

        const unsubVisits = onValue(visitsRef, (snap) => {
            dailyVisits = [];
            snap.forEach((childSnapshot) => {
                dailyVisits.push({ date: childSnapshot.key!, count: childSnapshot.val() });
            });
            trigger();
        });

        const unsubUsers = onValue(usersRef, (snap) => {
            activeUsers = snap.size;
            locations = [];
            snap.forEach((userSnapshot) => {
                const val = userSnapshot.val();
                if(val && val.location) {
                    locations.push({ lat: val.location.latitude, lng: val.location.longitude });
                }
            });
            trigger();
        });

        const trigger = () => callback({ activeUsers, dailyVisits, locations });
        return () => { unsubVisits(); unsubUsers(); };
    }
    
    // --- System Control ---

    listenForForceRefresh(callback: () => void) {
        if (!db) return () => {};
        const refreshRef = ref(db, 'system/forceRefreshTimestamp');
        return onValue(refreshRef, (snapshot) => {
            const timestamp = snapshot.val();
            if (timestamp && timestamp > this.sessionStartTime + 5000) {
                 console.log("Force refresh received");
                 callback();
            }
        });
    }
    
    async adminTriggerForceRefresh() {
        if(!db) return;
        await set(ref(db, 'system/forceRefreshTimestamp'), serverTimestamp());
    }

    async adminUpdateUser(uid: string, updates: Partial<OtherUser>) {
        if (!db) return;
        await update(ref(db, `users/${uid}`), updates);
    }

    async incrementBlockCount(uid: string) {
        if (!db) return;
        const refBlock = ref(db, `users/${uid}/blockCount`);
        await runTransaction(refBlock, (count) => (count || 0) + 1);
    }

    async updateCallsign(newCallsign: string) {
        if (!db || !this.userId) return;
        this.currentCallsign = newCallsign;
        const updates: any = {};
        updates[`users/${this.userId}/callsign`] = newCallsign;
        updates[`profiles/${this.userId}/callsign`] = newCallsign;
        await update(ref(db), updates);
    }

    // --- Audio Logic ---

    async resumeAudio() {
        if (!sharedAudioContext) {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            sharedAudioContext = new AudioContext();
        }
        if (sharedAudioContext.state === 'suspended') {
            await sharedAudioContext.resume();
        }
        // Play silent buffer to force iOS audio session to wake up
        try {
            const buffer = sharedAudioContext.createBuffer(1, 1, 22050);
            const source = sharedAudioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(sharedAudioContext.destination);
            source.start(0);
        } catch(e) {}
        
        this.startKeepAlive();
    }
    
    private startKeepAlive() {
        if (this.keepAliveInterval) clearInterval(this.keepAliveInterval);
        this.keepAliveInterval = setInterval(() => {
            if (sharedAudioContext && sharedAudioContext.state === 'running') {
                 const osc = sharedAudioContext.createOscillator();
                 const gain = sharedAudioContext.createGain();
                 osc.connect(gain);
                 gain.connect(sharedAudioContext.destination);
                 osc.frequency.value = 50;
                 gain.gain.value = 0.0001;
                 osc.start();
                 osc.stop(sharedAudioContext.currentTime + 0.01);
            }
        }, 10000); 
    }

    private async processAudioQueue() {
        if (this.isPlayingAudio || this.audioQueue.length === 0) return;
        this.isPlayingAudio = true;
        const item = this.audioQueue.shift();
        if (item) {
            await this.playAudioInternal(item.base64, item.mimeType);
        }
        this.isPlayingAudio = false;
        if (this.audioQueue.length > 0) this.processAudioQueue();
    }

    async playAudio(audioBase64: string, mimeType?: string): Promise<void> {
        this.audioQueue.push({ base64: audioBase64, mimeType });
        if (!this.isPlayingAudio) this.processAudioQueue();
    }

    private async playAudioInternal(audioBase64: string, mimeType?: string): Promise<void> {
        try {
            await this.resumeAudio();
            if (!sharedAudioContext) return;

            let audioBuffer: AudioBuffer | null = null;
            let arrayBuffer: ArrayBuffer | null = null;

            // BLIND DECODE: Browsers like Safari can often sniff the header bytes (WebM/MP4) 
            // even if the MIME type string is incorrect or missing.
            // We convert Base64 -> ArrayBuffer directly without wrapping in a Blob first to avoid container issues.
            try {
                const binaryString = atob(audioBase64);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                arrayBuffer = bytes.buffer;
                audioBuffer = await sharedAudioContext.decodeAudioData(arrayBuffer.slice(0)); 
            } catch(e) {
                // If blind decode fails, proceed to blob strategies
            }

            // Strategy 1: Use provided mimeType if available (via Blob)
            if (!audioBuffer && mimeType) {
                try {
                    const blob = base64ToBlob(audioBase64, mimeType);
                    arrayBuffer = await blob.arrayBuffer();
                    audioBuffer = await sharedAudioContext.decodeAudioData(arrayBuffer!);
                } catch(e) {}
            }

            // Strategy 2: Fallback to WebM (Chrome Default)
            if (!audioBuffer) {
                try {
                    const blob = base64ToBlob(audioBase64, 'audio/webm');
                    arrayBuffer = await blob.arrayBuffer();
                    audioBuffer = await sharedAudioContext.decodeAudioData(arrayBuffer!);
                } catch(e) {}
            }

            // Strategy 3: Fallback to MP4 (iOS Default)
            if (!audioBuffer) {
                try {
                    const blob = base64ToBlob(audioBase64, 'audio/mp4');
                    arrayBuffer = await blob.arrayBuffer();
                    audioBuffer = await sharedAudioContext.decodeAudioData(arrayBuffer!);
                } catch(e) {}
            }
            
            if (!audioBuffer) {
                console.error("[RealtimeService] Fatal: Could not decode audio data in any format.");
                return;
            }

            const source = sharedAudioContext.createBufferSource();
            source.buffer = audioBuffer;

            // Audio Processing Chain (Compressor -> Gain)
            const compressor = sharedAudioContext.createDynamicsCompressor();
            compressor.threshold.setValueAtTime(-24, sharedAudioContext.currentTime);
            compressor.knee.setValueAtTime(30, sharedAudioContext.currentTime);
            compressor.ratio.setValueAtTime(12, sharedAudioContext.currentTime);
            compressor.attack.setValueAtTime(0.003, sharedAudioContext.currentTime);
            compressor.release.setValueAtTime(0.25, sharedAudioContext.currentTime);

            const gainNode = sharedAudioContext.createGain();
            gainNode.gain.value = 2.5; 

            source.connect(compressor);
            compressor.connect(gainNode);
            gainNode.connect(sharedAudioContext.destination);

            return new Promise((resolve) => {
                source.onended = () => resolve();
                source.start();
            });
        } catch (e) {
            console.error("[RealtimeService] Playback Exception:", e);
        }
    }

    startRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') return;
        this.resumeAudio();

        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            this.stream = stream;
            
            // Prefer native formats without strict codec parameters for max compatibility
            let options: MediaRecorderOptions | undefined = undefined;
            if (MediaRecorder.isTypeSupported('audio/webm')) {
                 options = { mimeType: 'audio/webm' };
            } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
                 options = { mimeType: 'audio/mp4' };
            }

            try {
                this.mediaRecorder = new MediaRecorder(stream, options);
            } catch (e) {
                this.mediaRecorder = new MediaRecorder(stream);
            }

            this.audioChunks = [];
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) this.audioChunks.push(event.data);
            };
            this.mediaRecorder.start();
        }).catch(e => console.error("Mic error:", e));
    }

    async stopRecordingAndSend() {
        if (!this.mediaRecorder || this.mediaRecorder.state !== 'recording') return;
        
        this.mediaRecorder.onstop = async () => {
            const mimeType = this.mediaRecorder?.mimeType || 'audio/webm'; // Capture actual type
            const audioBlob = new Blob(this.audioChunks, { type: mimeType });
            const base64 = await blobToBase64(audioBlob);
            
            if (this.stream) this.stream.getTracks().forEach(track => track.stop());
            
            if (db && this.userId) {
                const messageRef = push(ref(db, 'messages'));
                const message: S2C_Message = {
                    type: 'audioMessage',
                    payload: {
                        from: this.currentCallsign || 'Unknown',
                        fromId: this.userId,
                        location: this.currentLocation!,
                        senderRadius: this.currentRadius,
                        audioBlob: base64,
                        timestamp: Date.now(),
                        mimeType: mimeType
                    }
                };
                await set(messageRef, message);
            }
        };
        this.mediaRecorder.stop();
    }

    updateLocation(location: Location, radius: number) {
        this.currentLocation = location;
        this.currentRadius = radius;
        if (db && this.userId) {
            update(ref(db, `users/${this.userId}`), {
                location,
                receiveRadius: radius,
                lastActive: serverTimestamp()
            });
        }
    }

    async connect(
        callsign: string, 
        initialLocation: Location, 
        initialRadius: number,
        callbacks: RealtimeServiceCallbacks
    ) {
        if (!db || !auth) {
            callbacks.onError(new Error("Firebase SDK failed to load."));
            return;
        }

        this.intendedDisconnect = false;
        this.currentCallsign = callsign;
        this.currentLocation = initialLocation;
        this.currentRadius = initialRadius;
        this.callbacks = callbacks;
        this.sessionStartTime = Date.now(); // SET START TIME HERE
        
        this.listenForForceRefresh(() => { window.location.reload(); });
        this.attemptConnection();
    }

    private async attemptConnection() {
        if (!this.callbacks || this.intendedDisconnect) return;

        try {
            const userCredential = await firebaseAuth.signInAnonymously(auth);
            this.userId = userCredential.user.uid;
            
            const profileRef = ref(db, `profiles/${this.userId}`);
            const profileSnap = await get(profileRef);
            
            if (profileSnap.exists()) {
                const savedName = profileSnap.val().callsign;
                if (savedName && this.callbacks.onCallsignResolved) {
                    this.callbacks.onCallsignResolved(savedName);
                    this.currentCallsign = savedName;
                }
            } else {
                await set(profileRef, { 
                    callsign: this.currentCallsign,
                    createdAt: serverTimestamp()
                });
            }
            
            const bannedRef = ref(db, `users/${this.userId}/isBanned`);
            const bannedSnap = await get(bannedRef);
            if (bannedSnap.exists() && bannedSnap.val() === true) {
                throw new Error("Account banned.");
            }

            const userRef = ref(db, `users/${this.userId}`);
            onDisconnect(userRef).remove();
            
            await set(userRef, {
                callsign: this.currentCallsign,
                location: this.currentLocation,
                receiveRadius: this.currentRadius,
                lastActive: serverTimestamp(),
                joinedAt: serverTimestamp()
            });

            // AUDIO LISTENER
            const messagesRef = query(ref(db, 'messages'), limitToLast(10));
            onChildAdded(messagesRef, (snapshot) => {
                const msg = snapshot.val() as S2C_Message;
                // CRITICAL FIX: Stale Audio Filtering
                if (msg.type === 'audioMessage') {
                    // 1. Must have a timestamp
                    if (!msg.payload.timestamp) return;
                    // 2. Timestamp must be AFTER session start
                    if (msg.payload.timestamp <= this.sessionStartTime) return;
                }
                this.callbacks?.onMessage(msg);
            });
            
            // USER PRESENCE LISTENER
            const usersRef = ref(db, 'users');
            this.usersUnsub = onValue(usersRef, (snapshot) => {
                const users: { callsign: string; location: Location; receiveRadius: number; id: string; blockCount?: number }[] = [];
                snapshot.forEach(child => {
                    users.push({ id: child.key!, ...child.val() });
                });
                this.callbacks?.onMessage({
                    type: 'channelState',
                    payload: { users }
                });
            });

            onValue(bannedRef, (snapshot) => {
                if (snapshot.val() === true) {
                    this.disconnect();
                    this.callbacks?.onError(new Error("You have been banned."));
                }
            });

            this.callbacks.onOpen();
            this.reconnectTimer = null;

        } catch (error: any) {
            console.error("[RealtimeService] Connection failed:", error);
            if (error.code === 'auth/configuration-not-found' || error.code === 'auth/api-key-not-valid') {
                this.callbacks.onError(new Error("Configuration Error. Check Firebase Console."));
                return;
            }
            if (this.callbacks && !this.intendedDisconnect) {
                this.retryDelay = Math.min(this.retryDelay * 2, 10000);
                this.reconnectTimer = setTimeout(() => this.attemptConnection(), this.retryDelay);
            }
        }
    }

    disconnect() {
        this.intendedDisconnect = true;
        if(this.keepAliveInterval) clearInterval(this.keepAliveInterval);
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
        if (this.usersUnsub) this.usersUnsub();
        
        if (db && this.userId) {
            const userRef = ref(db, `users/${this.userId}`);
            set(userRef, null).catch(() => {}); 
        }
        
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        this.callbacks = null;
    }
}
