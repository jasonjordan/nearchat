import { Location } from "./types";

export const sanitizeInput = (str: string): string => {
    // Remove anything that is NOT alphanumeric (a-z, A-Z, 0-9)
    // and truncate to 20 characters maximum.
    if (!str) return "";
    return str.replace(/[^a-zA-Z0-9]/g, "").slice(0, 20);
};

export const isValidName = (str: string): boolean => {
    // Must be at least 2 chars, and alphanumeric
    return /^[a-zA-Z0-9]{2,20}$/.test(str);
};

export const generateRandomCallsign = (): string => {
    const adjectives = [
        "Red",
        "Blue",
        "Green",
        "Black",
        "White",
        "Swift",
        "Silent",
        "Loud",
        "Brave",
        "Calm",
        "Wild",
        "Bright",
        "Dark",
        "Sharp",
        "Rapid",
        "Happy",
        "Lucky",
        "Sunny",
        "Windy",
        "Misty",
        "Frozen",
        "Molten",
        "Steel",
        "Iron",
        "Neon",
        "Solar",
        "Lunar",
        "Cosmic",
        "Digital",
        "Grand",
        "Noble",
        "Ancient",
        "Modern",
        "Fierce",
        "Gentle",
        "Proud",
        "Bold",
        "Eager",
        "Clever",
        "Golden",
        "Silver",
        "Crystal",
        "Jade",
        "Amber",
        "Ruby",
        "Emerald",
        "Sapphire",
        "Crimson",
        "Azure",
        "Violet",
        "Orange",
        "Teal",
        "Mellow",
        "Jolly",
        "Keen",
        "Zesty",
        "Vivid",
        "Prime",
        "Elite",
        "Royal",
        "Regal",
        "Master",
        "Super",
        "Hyper",
        "Mega",
        "Giga",
        "Ultra",
        "Omega",
        "Alpha",
        "Delta",
        "Echo",
        "Bravo",
        "Tango",
        "Sierra",
        "Victor",
        "Zulu",
        "Arctic",
        "Tropical",
        "Urban",
        "Rustic",
        "Savage",
        "Tough",
        "Smart",
        "Wise",
        "Quick",
        "Fast",
        "Slow",
        "Heavy",
        "Light",
        "Hidden",
        "Secret",
        "Mystic",
        "Arcane",
        "Holy",
        "Dark",
        "Lost",
        "Found",
        "New",
        "Old",
        "Dusty",
        "Clean",
        "Dirty",
        "Rough",
        "Smooth",
        "Hard",
        "Soft",
        "Wet",
        "Dry",
        "Cold",
        "Hot",
        "Warm",
        "Cool",
        "Icy",
        "Fiery",
        "Electric",
        "Magnetic",
        "Atomic",
        "Nuclear",
        "Quantum",
        "Stellar",
        "Galactic",
        "Universal",
        "Global",
        "Local",
        "Foreign",
        "Alien",
        "Human",
        "Robot",
        "Cyber",
        "Tech",
        "Bio",
        "Eco",
        "Geo",
        "Aero",
        "Hydro",
        "Pyro"
    ];
    const verbs = [
        "Flying",
        "Running",
        "Jumping",
        "Swimming",
        "Dancing",
        "Singing",
        "Walking",
        "Hiding",
        "Rising",
        "Falling",
        "Soaring",
        "Hunting",
        "Chasing",
        "Watching",
        "Guarding",
        "Seeking",
        "Floating",
        "Drifting",
        "Racing",
        "Charging",
        "Roaming",
        "Wandering",
        "Leaping",
        "Diving",
        "Climbing",
        "Crawling",
        "Sprinting",
        "Gliding",
        "Hovering",
        "Marching",
        "Sailing",
        "Dreaming",
        "Glowing",
        "Shining",
        "Burning",
        "Freezing",
        "Spinning",
        "Turning",
        "Rolling",
        "Skipping",
        "Laughing",
        "Smiling",
        "Thinking",
        "Reading",
        "Writing",
        "Coding",
        "Gaming",
        "Cooking",
        "Eating",
        "Sleeping",
        "Waking",
        "Growing",
        "Learning",
        "Teaching",
        "Leading",
        "Helping",
        "Saving",
        "Fixing",
        "Building",
        "Making",
        "Creating",
        "Painting",
        "Drawing",
        "Talking",
        "Speaking",
        "Listening",
        "Waiting",
        "Wishing",
        "Hoping",
        "Loving",
        "Hating",
        "Fearing",
        "Daring",
        "Trying",
        "Winning"
    ];
    const nouns = [
        "Eagle",
        "Fox",
        "Bear",
        "Wolf",
        "Tiger",
        "Lion",
        "Hawk",
        "Falcon",
        "Shark",
        "Whale",
        "Dolphin",
        "Panda",
        "Koala",
        "Badger",
        "Otter",
        "Owl",
        "Raven",
        "Crow",
        "Snake",
        "Viper",
        "Cobra",
        "Panther",
        "Leopard",
        "Cheetah",
        "Jaguar",
        "Bison",
        "Buffalo",
        "Moose",
        "Deer",
        "Dragon",
        "Phoenix",
        "Griffin",
        "Unicorn",
        "Robot",
        "Cyborg",
        "Ninja",
        "Samurai",
        "Pilot",
        "Ranger",
        "Scout",
        "Hunter",
        "Guardian",
        "Sentinel",
        "Warrior",
        "Knight",
        "Wizard",
        "Ghost",
        "Pirate",
        "Viking",
        "Spartan",
        "Titan",
        "Giant",
        "Dwarf",
        "Elf",
        "Goblin",
        "Orc",
        "Troll",
        "Witch",
        "Sorcerer",
        "Mage",
        "Cleric",
        "Druid",
        "Monk",
        "Bard",
        "Rogue",
        "Paladin",
        "Beast",
        "Mutant",
        "Alien",
        "Astronaut",
        "Cosmonaut",
        "Explorer",
        "Traveler",
        "Nomad",
        "Wanderer",
        "Vagabond",
        "Phantom",
        "Spectre",
        "Spirit",
        "Soul",
        "Shadow",
        "Light",
        "Spark",
        "Flame",
        "Storm",
        "Thunder",
        "Falcon",
        "Kestrel",
        "Osprey",
        "Vulture",
        "Condor",
        "Heron",
        "Stork",
        "Swan",
        "Goose",
        "Duck",
        "Penguin",
        "Seal",
        "Walrus",
        "Manatee",
        "Dugong",
        "Narwhal",
        "Beluga",
        "Orca",
        "Porpoise",
        "Mustang",
        "Bronco",
        "Stallion",
        "Mare",
        "Colt",
        "Filly",
        "Foal",
        "Steed",
        "Charger",
        "Mount",
        "Hound",
        "Dog",
        "Cat",
        "Mouse",
        "Rat",
        "Hamster",
        "Gerbil",
        "Rabbit",
        "Hare",
        "Bunny"
    ];

    const useVerb = Math.random() > 0.5;
    const prefixList = useVerb ? verbs : adjectives;
    const prefix = prefixList[Math.floor(Math.random() * prefixList.length)] || "Unknown";
    const noun = nouns[Math.floor(Math.random() * nouns.length)] || "Entity";
    return `${prefix} ${noun}`;
};

export const getUserColor = (id: string) => {
    const colors = [
        "text-orange-400",
        "text-amber-400",
        "text-yellow-400",
        "text-lime-400",
        "text-green-400",
        "text-emerald-400",
        "text-teal-400",
        "text-cyan-400",
        "text-sky-400",
        "text-blue-400",
        "text-indigo-400",
        "text-violet-400",
        "text-purple-400",
        "text-fuchsia-400",
        "text-pink-400",
        "text-rose-400"
    ];
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

export const getPersistentCallsign = () => {
    try {
        const stored = localStorage.getItem("nearChatCallsign");
        if (stored) return stored;

        const match = document.cookie.match(new RegExp("(^| )nearChatCallsign=([^;]+)"));
        if (match && match[2]) {
            const cookieVal = match[2];
            localStorage.setItem("nearChatCallsign", cookieVal);
            return cookieVal;
        }

        const newCallsign = generateRandomCallsign();
        updatePersistentCallsign(newCallsign);
        return newCallsign;
    } catch (e) {
        return generateRandomCallsign();
    }
};

export const updatePersistentCallsign = (name: string) => {
    try {
        const safeName = sanitizeInput(name);
        localStorage.setItem("nearChatCallsign", safeName);
        document.cookie = `nearChatCallsign=${safeName}; path=/; max-age=31536000; SameSite=Strict`;
    } catch (e) {
        console.error("Failed to save callsign", e);
    }
};

export const calculateDistance = (loc1: Location, loc2: Location): number => {
    const R = 6371e3; // metres
    const φ1 = (loc1.latitude * Math.PI) / 180;
    const φ2 = (loc2.latitude * Math.PI) / 180;
    const Δφ = ((loc2.latitude - loc1.latitude) * Math.PI) / 180;
    const Δλ = ((loc2.longitude - loc1.longitude) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
};

export const pseudoRandomPosition = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const angle = Math.abs(hash % 360);
    const radiusPercent = (Math.abs(hash >> 8) % 40) + 20;
    return { angle, radiusPercent };
};

// Physics-based collision resolution to prevent overlapping blips
export const resolveCollisions = (items: { x: number; y: number; id: string }[], minDistance: number = 8) => {
    // We run a few iterations to push overlapping items apart
    const iterations = 15; // Increased for better stability
    const adjusted = items.map((i) => ({ ...i, ox: i.x, oy: i.y })); // Store original to pull back if needed

    for (let k = 0; k < iterations; k++) {
        for (let i = 0; i < adjusted.length; i++) {
            for (let j = i + 1; j < adjusted.length; j++) {
                const a = adjusted[i];
                const b = adjusted[j];

                const dx = b.x - a.x;
                const dy = b.y - a.y;
                const distSq = dx * dx + dy * dy;
                const minDistSq = minDistance * minDistance;

                if (distSq < minDistSq && distSq > 0.001) {
                    const dist = Math.sqrt(distSq);
                    const overlap = minDistance - dist;
                    const offsetX = (dx / dist) * overlap * 0.5;
                    const offsetY = (dy / dist) * overlap * 0.5;

                    a.x -= offsetX;
                    a.y -= offsetY;
                    b.x += offsetX;
                    b.y += offsetY;
                } else if (distSq <= 0.001) {
                    // Exact overlap, nudge randomly
                    a.x -= 0.5;
                    b.x += 0.5;
                }
            }
        }
    }
    return adjusted;
};

// Returns x, y in 0-100 range for radar
export const calculateRadarPos = (
    targetLoc: Location,
    myLoc: Location,
    scale: number,
    userId?: string
): { x: number; y: number } | null => {
    const d = calculateDistance(myLoc, targetLoc);

    // Initial check: If distance is effectively zero, add jitter immediately
    if (d < 5 && userId) {
        const { angle, radiusPercent } = pseudoRandomPosition(userId);
        const jitterR = 5 + radiusPercent / 5; // Minimum 5% offset
        const angleRad = (angle * Math.PI) / 180;
        return {
            x: 50 + jitterR * Math.cos(angleRad),
            y: 50 + jitterR * Math.sin(angleRad)
        };
    }

    // Great Circle Bearing
    const y =
        Math.sin(((targetLoc.longitude - myLoc.longitude) * Math.PI) / 180) *
        Math.cos((targetLoc.latitude * Math.PI) / 180);
    const x =
        Math.cos((myLoc.latitude * Math.PI) / 180) * Math.sin((targetLoc.latitude * Math.PI) / 180) -
        Math.sin((myLoc.latitude * Math.PI) / 180) *
            Math.cos((targetLoc.latitude * Math.PI) / 180) *
            Math.cos(((targetLoc.longitude - myLoc.longitude) * Math.PI) / 180);
    const bearing = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
    const angleRad = ((bearing - 90) * Math.PI) / 180;

    // Logarithmic / Asymptotic Scaling
    // 0 -> 0%
    // scale -> 80% (Inner Ring)
    // infinity -> 100% (Outer Ring)

    let rPercent = 0;
    const innerBoundary = 80;

    if (d <= scale) {
        // Linear mapping within the radius
        rPercent = (d / scale) * innerBoundary;
    } else {
        // Asymptotic mapping for things outside radius
        const extraDist = d - scale;
        const asymptotic = 18 * (1 - Math.exp(-extraDist / (scale * 2)));
        rPercent = innerBoundary + asymptotic;
    }

    // EXCLUSION ZONE: Ensure points don't plot too close to center (which is "Self")
    // If calculated percentage is less than 12%, bump it out.
    if (rPercent < 12) rPercent = 12;

    // Convert polar to cartesian (50,50 origin)
    const px = 50 + (rPercent / 2) * Math.cos(angleRad);
    const py = 50 + (rPercent / 2) * Math.sin(angleRad);

    return { x: px, y: py };
};

export const playMicClick = (type: "on" | "off") => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === "on") {
            osc.type = "sine";
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        } else {
            osc.type = "triangle";
            osc.frequency.setValueAtTime(300, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.1);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        }
        setTimeout(() => {
            if (ctx.state !== "closed") ctx.close();
        }, 200);
    } catch (e) {
        console.error("Audio FX failed", e);
    }
};

export const playArrivalSound = () => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = "sine";
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);

        osc.start();
        osc.stop(ctx.currentTime + 0.1);
        setTimeout(() => {
            if (ctx.state !== "closed") ctx.close();
        }, 200);
    } catch (e) {}
};

export const playDepartureSound = () => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = "sine";
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.2);

        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);

        osc.start();
        osc.stop(ctx.currentTime + 0.2);
        setTimeout(() => {
            if (ctx.state !== "closed") ctx.close();
        }, 300);
    } catch (e) {}
};

export const sliderToRadius = (val: number) => {
    const min = 50;
    const max = 5000000; // Increased to 5000km to handle '360km away' issue
    return Math.round(min * Math.pow(max / min, val / 100));
};

export const radiusToSlider = (rad: number) => {
    const min = 50;
    const max = 5000000;
    if (rad <= min) return 0;
    if (rad >= max) return 100;
    return (Math.log(rad / min) / Math.log(max / min)) * 100;
};

export const formatDistance = (d: number) => (d < 1000 ? `${Math.round(d)}m` : `${(d / 1000).toFixed(1)}km`);
