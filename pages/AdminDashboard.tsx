import React, { useState, useMemo } from 'react';
import { Layout } from '../components/Layout';
import { storageService } from '../services/storageService';
import { User, Role } from '../types';
import { Trash2, ShieldAlert, Search, UserPlus, X, ChevronRight, Activity, Users, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('admin-analytics');
  const [users, setUsers] = useState(storageService.getUsers());
  const [history] = useState(storageService.getHistory());
  const [searchQuery, setSearchQuery] = useState('');
  
  // Add User State
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: Role.USER });

  const handleDeleteUser = (id: string) => {
    if (window.confirm("Are you sure? This cannot be undone.")) {
      storageService.deleteUser(id);
      setUsers(storageService.getUsers());
    }
  };

  const handlePromoteUser = (user: User) => {
    const adminCount = users.filter(u => u.role === Role.ADMIN).length;
    if (adminCount >= 2) {
      alert("Max Admin Limit Reached (2)");
      return;
    }
    const updated = { ...user, role: Role.ADMIN };
    storageService.updateUser(updated);
    setUsers(storageService.getUsers());
  };

  const handleAddUser = (e: React.FormEvent) => {
      e.preventDefault();
      const existing = users.find(u => u.email === newUser.email);
      if (existing) {
          alert("User email already exists");
          return;
      }
      
      const userToAdd: User = {
          id: `user-${Date.now()}`,
          name: newUser.name,
          email: newUser.email,
          passwordHash: newUser.password,
          role: newUser.role,
          joinedAt: new Date().toISOString(),
          securityQuestion: 'Admin Created',
          securityAnswer: 'N/A'
      };
      
      storageService.saveUser(userToAdd);
      setUsers(storageService.getUsers());
      setShowAddUser(false);
      setNewUser({ name: '', email: '', password: '', role: Role.USER });
  };

  // Analytics Logic
  const analyticsData = useMemo(() => {
      // 1. Language Usage
      const langCount: Record<string, number> = {};
      history.forEach(h => { langCount[h.language] = (langCount[h.language] || 0) + 1; });
      const langData = Object.keys(langCount).map(k => ({ name: k, value: langCount[k] }));

      // 2. Ratings
      let totalRating = 0;
      let count = 0;
      history.forEach(h => {
          if (h.feedback) {
              totalRating += h.feedback.rating;
              count++;
          }
      });
      const avgRating = count ? (totalRating / count).toFixed(1) : "N/A";

      // 3. Activity by Type
      const typeCount = [
          { name: 'Generation', value: history.filter(h => h.type === 'generation').length },
          { name: 'Explanation', value: history.filter(h => h.type === 'explanation').length },
      ];

      return { langData, avgRating, typeCount };
  }, [history]);

  const COLORS = ['#06b6d4', '#8b5cf6', '#ec4899']; 

  const renderAnalytics = () => (
    <div className="space-y-8 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-lg group hover:border-blue-500/30 transition-all">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Users</h3>
                        <p className="text-4xl font-bold text-white mt-3 group-hover:text-blue-400 transition-colors">{users.length}</p>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400"><Users size={24} /></div>
                </div>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-lg group hover:border-cyan-500/30 transition-all">
                 <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Generations</h3>
                        <p className="text-4xl font-bold text-white mt-3 group-hover:text-cyan-400 transition-colors">{history.length}</p>
                    </div>
                    <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400"><Activity size={24} /></div>
                </div>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-lg group hover:border-yellow-500/30 transition-all">
                 <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Avg User Rating</h3>
                        <p className="text-4xl font-bold text-white mt-3 group-hover:text-yellow-400 transition-colors">{analyticsData.avgRating} <span className="text-lg text-slate-600 font-normal">/ 5</span></p>
                    </div>
                    <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-400"><BarChart3 size={24} /></div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-2xl border border-white/5 shadow-lg h-96">
                <h3 className="text-white font-bold mb-8 flex items-center gap-2">
                    <div className="w-1 h-5 bg-cyan-400 rounded-full"></div>
                    Language Popularity
                </h3>
                <ResponsiveContainer width="100%" height="85%">
                    <BarChart data={analyticsData.langData}>
                        <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                        <Tooltip 
                            contentStyle={{backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff'}} 
                            cursor={{fill: '#1e293b'}}
                        />
                        <Bar dataKey="value" fill="#06b6d4" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-2xl border border-white/5 shadow-lg h-96">
                 <h3 className="text-white font-bold mb-8 flex items-center gap-2">
                    <div className="w-1 h-5 bg-purple-400 rounded-full"></div>
                    Usage Breakdown
                </h3>
                 <ResponsiveContainer width="100%" height="85%">
                    <PieChart>
                        <Pie 
                            data={analyticsData.typeCount} 
                            cx="50%" cy="50%" 
                            innerRadius={70} 
                            outerRadius={100} 
                            paddingAngle={5} 
                            dataKey="value"
                            stroke="none"
                        >
                            {analyticsData.typeCount.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff'}} />
                    </PieChart>
                 </ResponsiveContainer>
            </div>
        </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
             <div>
                 <h2 className="text-xl font-bold text-white">User Management</h2>
                 <p className="text-slate-500 text-sm">Manage access and roles</p>
             </div>
            <button 
                onClick={() => setShowAddUser(true)}
                className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-medium shadow-lg shadow-cyan-900/20 transition-all"
            >
                <UserPlus size={18} /> Add New User
            </button>
        </div>

        {showAddUser && (
            <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 mb-6 animate-in fade-in slide-in-from-top-4">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-white text-lg">New User Details</h3>
                    <button onClick={() => setShowAddUser(false)} className="text-slate-400 hover:text-white bg-slate-700/50 p-2 rounded-lg transition-colors"><X size={18}/></button>
                </div>
                <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                        required placeholder="Full Name" className="bg-slate-950 border border-slate-700 p-3 rounded-xl text-white focus:border-cyan-500 outline-none"
                        value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})}
                    />
                    <input 
                        required type="email" placeholder="Email Address" className="bg-slate-950 border border-slate-700 p-3 rounded-xl text-white focus:border-cyan-500 outline-none"
                        value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})}
                    />
                    <input 
                        required type="password" placeholder="Password" className="bg-slate-950 border border-slate-700 p-3 rounded-xl text-white focus:border-cyan-500 outline-none"
                        value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})}
                    />
                     <select 
                        className="bg-slate-950 border border-slate-700 p-3 rounded-xl text-white focus:border-cyan-500 outline-none"
                        value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as Role})}
                    >
                        <option value={Role.USER}>User</option>
                        <option value={Role.ADMIN}>Admin</option>
                    </select>
                    <button type="submit" className="md:col-span-2 bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-medium shadow-lg shadow-green-900/20">Save User</button>
                </form>
            </div>
        )}

        <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden shadow-xl">
            <table className="w-full text-left">
                <thead className="bg-slate-950/50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <tr>
                        <th className="p-5">User Identity</th>
                        <th className="p-5">Role</th>
                        <th className="p-5">Date Joined</th>
                        <th className="p-5 text-right">Manage</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                    {users.map(u => (
                        <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="p-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 border border-slate-700">
                                        {u.avatarUrl ? (
                                            <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-sm font-bold text-slate-500">
                                                {u.name[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white">{u.name}</p>
                                        <p className="text-sm text-slate-500">{u.email}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="p-5">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${u.role === Role.ADMIN ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-slate-700/30 text-slate-300 border-slate-600/30'}`}>
                                    {u.role.toUpperCase()}
                                </span>
                            </td>
                            <td className="p-5 text-slate-400 text-sm font-mono">
                                {new Date(u.joinedAt).toLocaleDateString()}
                            </td>
                            <td className="p-5 text-right">
                                <div className="flex justify-end gap-2">
                                    {u.role !== Role.ADMIN && (
                                        <button onClick={() => handlePromoteUser(u)} className="text-cyan-400 hover:bg-cyan-500/10 p-2 rounded-lg transition-colors" title="Promote to Admin">
                                            <ShieldAlert size={18} />
                                        </button>
                                    )}
                                    <button onClick={() => handleDeleteUser(u.id)} className="text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-colors" title="Delete User">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );

  const renderGlobalHistory = () => {
      const filteredHistory = history.filter(h => 
          h.input.toLowerCase().includes(searchQuery.toLowerCase()) || 
          h.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
          h.type.includes(searchQuery.toLowerCase())
      );

      return (
          <div className="space-y-6 animate-fade-in">
              <div className="relative group">
                  <Search className="absolute left-4 top-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
                  <input 
                    type="text" 
                    placeholder="Search activity logs, code snippets, languages..." 
                    className="w-full bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 pl-12 pr-4 py-4 rounded-2xl text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all shadow-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
              </div>

              <div className="space-y-4">
                {filteredHistory.length === 0 ? (
                    <div className="text-center py-16 text-slate-500 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
                        <Search size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No matching records found.</p>
                    </div>
                ) : (
                    filteredHistory.map(item => {
                        const user = users.find(u => u.id === item.userId);
                        return (
                            <div key={item.id} className="bg-slate-900/40 backdrop-blur-sm p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
                                            {user?.avatarUrl ? (
                                                <img src={user.avatarUrl} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">{user?.name[0] || '?'}</div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="font-bold text-white text-sm">{user?.name || 'Unknown'}</span>
                                                <span className="text-xs text-slate-500 font-mono">({user?.email})</span>
                                            </div>
                                            <div className="flex gap-2 mt-1">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${item.type === 'generation' ? 'bg-cyan-900/30 text-cyan-300' : 'bg-purple-900/30 text-purple-300'}`}>
                                                    {item.type}
                                                </span>
                                                <span className="text-[10px] text-slate-500">{new Date(item.timestamp).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 font-mono">
                                        {item.language}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5">
                                        <p className="text-[10px] uppercase text-slate-500 font-bold mb-2 flex items-center gap-1"><ChevronRight size={10}/> Input</p>
                                        <div className="text-xs text-slate-300 font-mono h-20 overflow-y-auto">
                                            {item.input}
                                        </div>
                                    </div>
                                    <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5">
                                        <p className="text-[10px] uppercase text-slate-500 font-bold mb-2 flex items-center gap-1"><ChevronRight size={10}/> Output</p>
                                        <div className="text-xs text-slate-300 font-mono h-20 overflow-y-auto">
                                            {item.output}
                                        </div>
                                    </div>
                                </div>
                                {item.feedback && (
                                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-3">
                                        <div className="flex gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <div key={i} className={`w-2 h-2 rounded-full ${i < item.feedback!.rating ? 'bg-yellow-400' : 'bg-slate-700'}`} />
                                            ))}
                                        </div>
                                        {item.feedback.comment && <span className="text-xs text-slate-400 italic">"{item.feedback.comment}"</span>}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
              </div>
          </div>
      );
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="animate-fade-in">
          {activeTab === 'admin-analytics' && renderAnalytics()}
          {activeTab === 'admin-users' && renderUsers()}
          {activeTab === 'admin-history' && renderGlobalHistory()}
      </div>
    </Layout>
  );
};