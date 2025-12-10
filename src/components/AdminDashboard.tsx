
import React, { useState, useEffect } from 'react';
import { RealtimeService } from '../services/realtimeService';
import { OtherUser, AnalyticsData } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Shield, Map as MapIcon, BarChart3, LogOut, Ban, RefreshCw, Edit, Trash2, MicOff, Lock } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Tooltip as LeafletTooltip } from 'react-leaflet';
import { sanitizeInput } from '../utils';

const AdminDashboard = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'map'>('dashboard');
    const [users, setUsers] = useState<OtherUser[]>([]);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

    // User Edit State
    const [editingUser, setEditingUser] = useState<OtherUser | null>(null);
    const [editName, setEditName] = useState("");

    useEffect(() => {
        if (isAuthenticated) {
            // Instantiate service locally
            const service = new RealtimeService();
            
            // Debugging
            if (typeof service.ensureAuth !== 'function') {
                console.error("Admin: RealtimeService missing ensureAuth.", service);
                return;
            }
            
            service.ensureAuth().then(() => {
                const unsubUsers = service.listenToAllUsers((u) => setUsers(u));
                const unsubAnalytics = service.listenToAnalytics((a) => setAnalytics(a));
                
                return () => { unsubUsers(); unsubAnalytics(); };
            }).catch(e => console.error("Admin listener auth failed", e));
        }
    }, [isAuthenticated]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const msgBuffer = new TextEncoder().encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        if (hashHex === '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9') {
            try {
                const service = new RealtimeService();
                
                // --- DEBUGGING LOGS FOR USER ---
                console.log("RealtimeService Instance:", service);
                console.log("Has ensureAuth?", 'ensureAuth' in service || 'ensureAuth' in Object.getPrototypeOf(service));
                console.log("Type of ensureAuth:", typeof service.ensureAuth);
                
                if (typeof service.ensureAuth !== 'function') {
                    // Alert with specific debug info instead of generic message
                    alert(`System Error: 'ensureAuth' is ${typeof service.ensureAuth}. Please check console.`);
                    return;
                }
                
                await service.ensureAuth();
                setIsAuthenticated(true);
            } catch (e) {
                console.error("Auth failed", e);
                alert("Database Connection Failed: " + (e as Error).message);
            }
        } else {
            alert("Access Denied");
        }
    };

    const handleUpdateUser = async (uid: string, updates: Partial<OtherUser>) => {
        const service = new RealtimeService();
        if (service.ensureAuth) await service.ensureAuth();
        await service.adminUpdateUser(uid, updates);
    };

    const handleDeleteUser = async (uid: string) => {
        if(confirm("Permanently delete this user? This cannot be undone.")) {
            const service = new RealtimeService();
            if (service.ensureAuth) await service.ensureAuth();
            await service.adminDeleteUser(uid);
            setEditingUser(null);
        }
    };

    const handleForceRefresh = async () => {
        if(confirm("Are you sure? This will reload the browser for ALL connected users immediately.")) {
            const service = new RealtimeService();
            if (service.ensureAuth) await service.ensureAuth();
            await service.adminTriggerForceRefresh();
            alert("Refresh command sent.");
        }
    };

    const openEditModal = (u: OtherUser) => {
        setEditingUser(u);
        setEditName(u.callsign);
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <form onSubmit={handleLogin} className="w-full max-w-sm bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
                            <Shield size={32} />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-center text-white mb-6">Restricted Access</h1>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter Admin Key"
                        className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white mb-4 focus:border-red-500 outline-none transition-colors"
                    />
                    <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors">
                        AUTHENTICATE
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white flex">
            {/* Sidebar */}
            <div className="w-64 border-r border-zinc-800 flex flex-col shrink-0">
                <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
                    <Shield className="text-red-500" />
                    <span className="font-bold text-lg">NetOverseer</span>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-900'}`}>
                        <BarChart3 size={20} /> Dashboard
                    </button>
                    <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'users' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-900'}`}>
                        <Users size={20} /> User Management
                    </button>
                    <button onClick={() => setActiveTab('map')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'map' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-900'}`}>
                        <MapIcon size={20} /> Global Map
                    </button>
                </nav>
                <div className="p-4 border-t border-zinc-800 space-y-2">
                    <button onClick={handleForceRefresh} className="w-full flex items-center gap-2 px-4 py-3 bg-red-900/20 text-red-500 hover:bg-red-900/40 rounded-lg transition-colors font-bold text-xs uppercase tracking-wide">
                        <RefreshCw size={14} /> Force System Reload
                    </button>
                    <button onClick={() => window.location.hash = ''} className="w-full flex items-center gap-2 px-4 py-2 text-zinc-500 hover:text-white transition-colors">
                        <LogOut size={16} /> Exit Admin
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 relative">
                {activeTab === 'dashboard' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <h2 className="text-3xl font-bold mb-6">Network Statistics</h2>
                        
                        <div className="grid grid-cols-3 gap-6">
                            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
                                <p className="text-zinc-400 text-sm font-medium uppercase">Active Users</p>
                                <p className="text-4xl font-bold text-emerald-400 mt-2">{analytics?.activeUsers || 0}</p>
                            </div>
                            <div className="grid-cols-2 bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
                                <p className="text-zinc-400 text-sm font-medium uppercase">Total Visits (30d)</p>
                                <p className="text-4xl font-bold text-blue-400 mt-2">
                                    {analytics?.dailyVisits.reduce((a, b) => a + b.count, 0) || 0}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-80">
                            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 flex flex-col">
                                <h3 className="text-lg font-bold mb-4">Traffic Trend</h3>
                                <div className="flex-1">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={analytics?.dailyVisits || []}>
                                            <defs>
                                                <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                            <XAxis dataKey="date" stroke="#666" fontSize={10} />
                                            <YAxis stroke="#666" fontSize={10} />
                                            <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} />
                                            <Area type="monotone" dataKey="count" stroke="#8884d8" fillOpacity={1} fill="url(#colorVisits)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-zinc-950 text-zinc-400 uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Callsign</th>
                                        <th className="px-6 py-4">UID</th>
                                        <th className="px-6 py-4">Flags</th>
                                        <th className="px-6 py-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800">
                                    {users.map(u => (
                                        <tr key={u.id} className="hover:bg-zinc-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    {u.isBanned ? (
                                                        <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-xs font-bold">BANNED</span>
                                                    ) : (
                                                        <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-xs font-bold">ACTIVE</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold flex items-center gap-2">
                                                {u.avatar && (
                                                    <img src={`data:image/png;base64,${u.avatar}`} className="w-6 h-6 rounded-full bg-white/10" alt="avatar" />
                                                )}
                                                {u.callsign}
                                            </td>
                                            <td className="px-6 py-4 text-zinc-500 font-mono text-xs">{u.id.substring(0,8)}...</td>
                                            <td className="px-6 py-4 flex gap-2">
                                                {u.nameLocked && (
                                                    <span title="Name Locked">
                                                        <Lock size={14} className="text-amber-500" />
                                                    </span>
                                                )}
                                                {u.isMutedGlobal && (
                                                    <span title="Globally Muted">
                                                        <MicOff size={14} className="text-red-400" />
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 flex gap-2">
                                                <button onClick={() => openEditModal(u)} className="p-2 rounded hover:bg-white/10 text-blue-400" title="Edit User">
                                                    <Edit size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'map' && (
                    <div className="h-[600px] w-full rounded-2xl overflow-hidden border border-zinc-800 bg-[#050505] relative z-0">
                         <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }} className="z-0">
                            <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                            />
                            {users.map(u => (
                                <CircleMarker 
                                    key={u.id}
                                    center={[u.location.latitude, u.location.longitude]}
                                    pathOptions={{ color: u.isBanned ? 'red' : '#10b981', fillColor: u.isBanned ? 'red' : '#10b981', fillOpacity: 0.8 }}
                                    radius={5}
                                >
                                    <LeafletTooltip>
                                        <div className="text-xs font-bold">{u.callsign}</div>
                                    </LeafletTooltip>
                                </CircleMarker>
                            ))}
                        </MapContainer>
                    </div>
                )}
            </div>

            {/* Admin Edit Modal */}
            {editingUser && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Edit size={20} className="text-blue-400" />
                            Manage User
                        </h3>

                        <div className="space-y-6">
                            {/* Rename Section */}
                            <div>
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Force Rename</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={editName}
                                        onChange={(e) => setEditName(sanitizeInput(e.target.value))}
                                        className="flex-1 bg-black border border-zinc-700 rounded-lg px-4 py-2 focus:border-blue-500 outline-none"
                                    />
                                    <button 
                                        onClick={() => handleUpdateUser(editingUser.id, { callsign: editName })}
                                        className="bg-blue-600 hover:bg-blue-700 px-4 rounded-lg font-bold text-sm transition-colors"
                                    >
                                        SAVE
                                    </button>
                                </div>
                            </div>

                            {/* Toggles */}
                            <div className="space-y-3 bg-black/20 p-4 rounded-xl border border-white/5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Lock size={16} className={editingUser.nameLocked ? 'text-amber-500' : 'text-zinc-500'} />
                                        <span className="text-sm font-medium">Lock Name Change</span>
                                    </div>
                                    <button 
                                        onClick={() => handleUpdateUser(editingUser.id, { nameLocked: !editingUser.nameLocked })}
                                        className={`w-10 h-5 rounded-full relative transition-colors ${editingUser.nameLocked ? 'bg-amber-500' : 'bg-zinc-700'}`}
                                    >
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${editingUser.nameLocked ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <MicOff size={16} className={editingUser.isMutedGlobal ? 'text-red-400' : 'text-zinc-500'} />
                                        <span className="text-sm font-medium">Global Mute</span>
                                    </div>
                                    <button 
                                        onClick={() => handleUpdateUser(editingUser.id, { isMutedGlobal: !editingUser.isMutedGlobal })}
                                        className={`w-10 h-5 rounded-full relative transition-colors ${editingUser.isMutedGlobal ? 'bg-red-500' : 'bg-zinc-700'}`}
                                    >
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${editingUser.isMutedGlobal ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Ban size={16} className={editingUser.isBanned ? 'text-red-600' : 'text-zinc-500'} />
                                        <span className="text-sm font-medium">Ban User</span>
                                    </div>
                                    <button 
                                        onClick={() => handleUpdateUser(editingUser.id, { isBanned: !editingUser.isBanned })}
                                        className={`w-10 h-5 rounded-full relative transition-colors ${editingUser.isBanned ? 'bg-red-600' : 'bg-zinc-700'}`}
                                    >
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${editingUser.isBanned ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="pt-4 border-t border-zinc-800">
                                <button 
                                    onClick={() => handleDeleteUser(editingUser.id)}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-red-900/50 bg-red-900/20 text-red-500 hover:bg-red-900/40 font-bold transition-colors"
                                >
                                    <Trash2 size={16} /> DELETE USER COMPLETELY
                                </button>
                                <p className="text-[10px] text-zinc-500 text-center mt-2">Removes account and frees up callsign.</p>
                            </div>
                        </div>

                        <button 
                            onClick={() => setEditingUser(null)}
                            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full text-zinc-500 hover:text-white"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
