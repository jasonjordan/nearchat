
import React, { memo, useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Text, Billboard, Line, Circle } from '@react-three/drei';
import * as THREE from 'three';
import { formatDistance, getUserColor, radiusToSlider, sliderToRadius } from '../utils';
import { OtherUser } from '../types';

// Fix for IntrinsicElements errors in TypeScript when using @react-three/fiber
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
        group: any;
        mesh: any;
        capsuleGeometry: any;
        meshStandardMaterial: any;
        sphereGeometry: any;
        ringGeometry: any;
        meshBasicMaterial: any;
        planeGeometry: any;
        cylinderGeometry: any;
        ambientLight: any;
        pointLight: any;
        polarGridHelper: any;
        circleGeometry: any;
    }
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
        group: any;
        mesh: any;
        capsuleGeometry: any;
        meshStandardMaterial: any;
        sphereGeometry: any;
        ringGeometry: any;
        meshBasicMaterial: any;
        planeGeometry: any;
        cylinderGeometry: any;
        ambientLight: any;
        pointLight: any;
        polarGridHelper: any;
        circleGeometry: any;
    }
  }
}

export interface ProcessedBlip {
    id: string;
    user: OtherUser;
    x: number; // 0-100 scale from utils (we need to convert to 3D units)
    y: number;
    dist: number;
    displayDist: number;
    isTransmitting: boolean;
    trailPoints: { x: number; y: number; opacity: number }[];
}

interface RadarViewProps {
    receiveRadius: number;
    setReceiveRadius: (r: number) => void;
    radarScale: number;
    activeBlip: ProcessedBlip | undefined;
    blips: ProcessedBlip[];
    userAliases: Map<string, string>;
    mutedUsers: Set<string>;
    isTalking: boolean;
    handleSelfIconClick: (e: any) => void;
    handleUserClick: (user: OtherUser) => void;
    setSelectedUser: (user: OtherUser | null) => void;
    theme: 'dark' | 'light';
    myAvatar?: string;
}

// --- 3D Components ---

const UserAvatar = ({ 
    blip, 
    displayName, 
    color, 
    isLight, 
    isTransmitting,
    isMuted,
    isClown,
    isInRange,
    onClick
}: { 
    blip: ProcessedBlip, displayName: string, color: string, isLight: boolean, 
    isTransmitting: boolean, isMuted: boolean, isClown: boolean, isInRange: boolean,
    onClick: (e: any) => void
}) => {
    // Convert 2D percentages (0-100) to 3D world coords (centered at 0,0)
    // 50,50 is center. Range is roughly -50 to 50.
    const x = (blip.x - 50) * 0.2; // Scale down for scene
    const z = (blip.y - 50) * 0.2; // Map Y to Z in 3D space
    
    // Parse Tailwind color class to Hex for Three.js
    const getColorHex = (c: string) => {
        if (c.includes('emerald')) return 0x10b981;
        if (c.includes('blue')) return 0x3b82f6;
        if (c.includes('red')) return 0xef4444;
        if (c.includes('amber')) return 0xf59e0b;
        if (c.includes('rose')) return 0xf43f5e;
        if (c.includes('purple')) return 0xa855f7;
        return 0xffffff;
    };
    
    // Color Logic: Use Grey if out of range, otherwise use assigned color. Mute overrides all.
    const baseHex = getColorHex(color);
    // If isLight (Day mode), grey is darker. If Dark mode, grey is lighter.
    const greyColor = isLight ? 0x9ca3af : 0x4b5563; 
    const finalColor = isInRange ? baseHex : greyColor;
    const hexColor = isMuted ? 0xef4444 : finalColor;
    const scale = isTransmitting ? 1.5 : (isInRange ? 1 : 0.8);
    // Increased opacity for out-of-range users slightly so they are visible but greyscale
    const opacity = isInRange ? 1 : 0.6; 
    
    // Load Texture if avatar exists
    const texture = useMemo(() => {
        if (blip.user.avatar) {
            const loader = new THREE.TextureLoader();
            return loader.load(`data:image/png;base64,${blip.user.avatar}`);
        }
        return null;
    }, [blip.user.avatar]);

    return (
        <group position={[x, 0, z]} onClick={(e: any) => { e.stopPropagation(); onClick(e); }}>
            {/* Trail */}
            {blip.trailPoints.length > 1 && (
                <Line 
                    points={blip.trailPoints.map(p => [(p.x - 50) * 0.2, 0.05, (p.y - 50) * 0.2])}
                    color={isLight ? "black" : "white"}
                    lineWidth={1}
                    transparent
                    opacity={0.3}
                />
            )}

            {/* The 3D Figure (Capsule for body, Sphere for head) */}
            <group scale={scale}>
                {/* Body */}
                <mesh position={[0, 0.75, 0]} castShadow>
                    <capsuleGeometry args={[0.25, 0.5, 4, 8]} />
                    <meshStandardMaterial 
                        color={hexColor} 
                        emissive={isTransmitting ? baseHex : 0x000000}
                        emissiveIntensity={isTransmitting ? 2 : 0}
                        transparent 
                        opacity={opacity} 
                        roughness={0.2}
                        metalness={0.8}
                    />
                </mesh>
                
                {/* Head (Clown or Normal) */}
                <mesh position={[0, 1.4, 0]} rotation={[0, Math.PI, 0]}>
                    <sphereGeometry args={[0.2, 16, 16]} />
                    {texture ? (
                        <meshStandardMaterial map={texture} />
                    ) : (
                        <meshStandardMaterial color={isClown ? 0xff0000 : (isInRange ? 0xffccaa : greyColor)} />
                    )}
                </mesh>

                {/* Transmitting Rings */}
                {isTransmitting && (
                    <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[0.5, 0.6, 32]} />
                        <meshBasicMaterial color={baseHex} transparent opacity={0.5} side={THREE.DoubleSide} />
                    </mesh>
                )}
            </group>

            {/* Floating Label */}
            <Billboard position={[0, 2.5, 0]}>
                <Text 
                    fontSize={0.4} 
                    color={isLight ? (isInRange ? "black" : "#666") : (isInRange ? "white" : "#aaa")} 
                    anchorX="center" 
                    anchorY="middle"
                    outlineWidth={0.02}
                    outlineColor={isLight ? "white" : "black"}
                >
                    {displayName}
                </Text>
                {/* Hide distance text if closer than 100m to reduce clutter */}
                {blip.dist >= 100 && (
                    <Text 
                        position={[0, -0.5, 0]} 
                        fontSize={0.25} 
                        color={isLight ? "#888" : "#888"} 
                        anchorX="center" 
                        anchorY="middle"
                    >
                        {formatDistance(blip.displayDist)}
                    </Text>
                )}
            </Billboard>
        </group>
    );
};

const SelfAvatar = ({ isLight, onClick, avatar }: { isLight: boolean, onClick: (e: any) => void, avatar?: string }) => {
    const texture = useMemo(() => {
        if (avatar) {
            return new THREE.TextureLoader().load(`data:image/png;base64,${avatar}`);
        }
        return null;
    }, [avatar]);

    return (
        <group onClick={onClick}>
            <mesh position={[0, 0.75, 0]}>
                <capsuleGeometry args={[0.3, 0.6, 4, 8]} />
                <meshStandardMaterial color={isLight ? 0xffffff : 0x222222} emissive={0xffffff} emissiveIntensity={0.2} />
            </mesh>
            <mesh position={[0, 1.5, 0]} rotation={[0, Math.PI, 0]}>
                <sphereGeometry args={[0.25, 16, 16]} />
                {texture ? (
                     <meshStandardMaterial map={texture} />
                ) : (
                     <meshStandardMaterial color="#ffffff" />
                )}
            </mesh>
            <Billboard position={[0, 2.5, 0]}>
                <Text fontSize={0.3} color={isLight ? "black" : "white"}>YOU</Text>
            </Billboard>
        </group>
    );
};

const RadiusBoundary = ({ radius, scale, isLight }: { radius: number, scale: number, isLight: boolean }) => {
    const worldRadius = (radius / scale) * 8; 
    
    return (
        <group>
            {/* Floor Circle */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
                <ringGeometry args={[worldRadius - 0.05, worldRadius, 64]} />
                <meshBasicMaterial color={isLight ? 0x2563eb : 0x10b981} transparent opacity={0.5} side={THREE.DoubleSide} />
            </mesh>
            {/* Vertical Wall (Cylinder) to give it 3D volume */}
            <mesh position={[0, 1, 0]}>
                <cylinderGeometry args={[worldRadius, worldRadius, 2, 64, 1, true]} />
                <meshStandardMaterial 
                    color={isLight ? 0x2563eb : 0x10b981} 
                    transparent 
                    opacity={0.05} 
                    side={THREE.DoubleSide} 
                    depthWrite={false}
                />
            </mesh>
        </group>
    );
};

const GridFloor = ({ isLight }: { isLight: boolean }) => {
    return (
        <group>
            {/* Polar Grid Helper - Ensures it sits flat on XZ plane */}
            <polarGridHelper args={[20, 8, 8, 64]} position={[0, 0.01, 0]} />
            
            {/* Background Floor Circle - Rotated to lie flat on XZ */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <circleGeometry args={[20, 64]} />
                <meshStandardMaterial 
                    color={isLight ? 0xf4f4f5 : 0x050505} 
                    transparent 
                    opacity={0.8}
                />
            </mesh>
        </group>
    );
};

const Scene = ({ props }: { props: RadarViewProps }) => {
    const isLight = props.theme === 'light';
    
    return (
        <>
            <ambientLight intensity={isLight ? 1 : 0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} castShadow />
            <GridFloor isLight={isLight} />
            
            <RadiusBoundary radius={props.receiveRadius} scale={props.radarScale} isLight={isLight} />
            
            {/* Connection Lines when Talking */}
            {props.isTalking && props.blips.map(blip => {
                // Only draw lines to users within receiving range
                if (blip.dist > props.receiveRadius) return null;
                
                const x = (blip.x - 50) * 0.2;
                const z = (blip.y - 50) * 0.2;
                
                return (
                    <Line 
                        key={`line-${blip.id}`}
                        points={[[0, 0.75, 0], [x, 0.75, z]]} 
                        color={isLight ? "#2563eb" : "#34d399"}
                        lineWidth={2}
                        dashed={true}
                        dashScale={5}
                        dashSize={0.5}
                        gapSize={0.5}
                        transparent
                        opacity={0.6}
                    />
                );
            })}

            <SelfAvatar isLight={isLight} onClick={props.handleSelfIconClick} avatar={props.myAvatar} />
            
            {props.blips.map(blip => (
                <UserAvatar 
                    key={blip.id}
                    blip={blip}
                    // SAFEGUARD: Use optional chaining in case map is malformed
                    displayName={props.userAliases?.get(blip.id) || blip.user.callsign}
                    color={getUserColor(blip.id)}
                    isLight={isLight}
                    isTransmitting={blip.isTransmitting}
                    isMuted={props.mutedUsers?.has(blip.id)}
                    isClown={(blip.user.blockCount || 0) > 5}
                    isInRange={blip.dist <= props.receiveRadius}
                    onClick={() => props.handleUserClick(blip.user)}
                />
            ))}

            <OrbitControls 
                enablePan={true} 
                minPolarAngle={0} 
                maxPolarAngle={Math.PI / 2.2} // Prevent going below ground
                minDistance={5}
                maxDistance={30}
                // Target set to [0, 0, 4] shifts the visual center of rotation 'down' the board (closer to camera Z),
                // which pushes the actual Radar Center (0,0,0) 'up' the screen by ~5-10%.
                target={[0, 0, 4]} 
            />
        </>
    );
};

const RadarView: React.FC<RadarViewProps> = memo((props) => {
    const isLight = props.theme === 'light';
    const sliderVal = radiusToSlider(props.receiveRadius);

    const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value);
        props.setReceiveRadius(sliderToRadius(val));
    };

    return (
        <div className="flex-1 w-full h-full relative">
            <Canvas shadows camera={{ position: [0, 10, 15], fov: 45 }}>
                <Scene props={props} />
            </Canvas>

            {/* Logarithmic Slider Overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[80%] max-w-xs z-50">
                <div className={`backdrop-blur-xl border rounded-2xl p-4 shadow-2xl ${isLight ? 'bg-white/80 border-white/50' : 'bg-black/60 border-white/10'}`}>
                    <div className="flex justify-between items-center mb-2">
                        <span className={`text-[10px] font-bold tracking-widest uppercase ${isLight ? 'text-zinc-500' : 'text-white/50'}`}>Receive Radius</span>
                        <span className={`text-sm font-mono font-bold ${isLight ? 'text-blue-600' : 'text-emerald-400'}`}>
                            {formatDistance(props.receiveRadius)}
                        </span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={sliderVal} 
                        onChange={handleSlider}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-emerald-500"
                    />
                </div>
            </div>
        </div>
    );
});

export default RadarView;
