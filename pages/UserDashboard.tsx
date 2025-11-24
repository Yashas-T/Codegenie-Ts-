import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { generateCode, explainCode } from '../services/geminiService';
import { Language, ModelType, HistoryItem } from '../types';
import { StarRating } from '../components/StarRating';
import { Play, Clipboard, CheckCircle2, RotateCcw, Upload, Camera } from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('generator');
  const { user, updateProfile } = useAuth();

  // Generator State
  const [genInput, setGenInput] = useState('');
  const [genLanguage, setGenLanguage] = useState(Language.PYTHON);
  const [genModel, setGenModel] = useState(ModelType.GEMINI_FLASH);
  const [genOutput, setGenOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Explainer State
  const [explainInput, setExplainInput] = useState('');
  const [explainLanguage, setExplainLanguage] = useState(Language.PYTHON);
  const [explainOutput, setExplainOutput] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // Profile State
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  useEffect(() => {
    if (user) {
      const allHistory = storageService.getHistory();
      setHistory(allHistory.filter(h => h.userId === user.id));
    }
  }, [user, activeTab]);

  const handleGenerate = async () => {
    if (!genInput.trim() || !user) return;
    setIsGenerating(true);
    try {
      const code = await generateCode(genInput, genLanguage, genModel);
      setGenOutput(code);
      
      const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        userId: user.id,
        type: 'generation',
        timestamp: new Date().toISOString(),
        model: genModel,
        language: genLanguage,
        input: genInput,
        output: code,
      };
      storageService.addHistoryItem(newItem);
      setHistory([newItem, ...history]);
    } catch (e) {
      alert("Error generating code. Please check your API key/connection.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExplain = async () => {
    if (!explainInput.trim() || !user) return;
    setIsExplaining(true);
    try {
      const explanation = await explainCode(explainInput, explainLanguage);
      setExplainOutput(explanation);

      const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        userId: user.id,
        type: 'explanation',
        timestamp: new Date().toISOString(),
        model: ModelType.GEMINI_FLASH,
        language: explainLanguage,
        input: explainInput,
        output: explanation,
      };
      storageService.addHistoryItem(newItem);
      setHistory([newItem, ...history]);
    } catch (e) {
      alert("Error explaining code.");
    } finally {
      setIsExplaining(false);
    }
  };

  const handleFeedback = (item: HistoryItem, rating: number, comment: string) => {
      storageService.addFeedback(item.id, { rating, comment });
      setHistory(prev => prev.map(h => h.id === item.id ? { ...h, feedback: { rating, comment } } : h));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 500 * 1024) {
          alert("Image size too large. Please upload an image smaller than 500KB.");
          return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
          if (user && typeof reader.result === 'string') {
              updateProfile({ ...user, avatarUrl: reader.result });
          }
      };
      reader.readAsDataURL(file);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const renderGenerator = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-8rem)]">
      <div className="flex flex-col gap-4 h-full">
        <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-white/5 flex flex-col gap-6 flex-1 shadow-xl">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg text-cyan-400 tracking-wide">Input Prompt</h3>
            <div className="flex gap-3">
              <select 
                value={genLanguage} 
                onChange={(e) => setGenLanguage(e.target.value as Language)}
                className="bg-slate-800 text-xs font-medium text-slate-300 py-1.5 px-3 rounded-lg border border-slate-700 outline-none focus:border-cyan-500/50 transition-colors"
              >
                {Object.values(Language).map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
              </select>
              <select 
                value={genModel} 
                onChange={(e) => setGenModel(e.target.value as ModelType)}
                className="bg-slate-800 text-xs font-medium text-slate-300 py-1.5 px-3 rounded-lg border border-slate-700 outline-none focus:border-cyan-500/50 transition-colors"
              >
                <option value={ModelType.DEEPSEEK}>DeepSeek Coder</option>
                <option value={ModelType.GEMMA}>Gemma 2B</option>
                <option value={ModelType.CODEBERT}>CodeBert</option>
                <option value={ModelType.GEMINI_FLASH}>Gemini Flash</option>
              </select>
            </div>
          </div>
          <textarea
            className="flex-1 bg-slate-950/50 p-4 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/20 border border-slate-800/50 font-mono text-sm text-slate-300 placeholder:text-slate-600 transition-all"
            placeholder="// Describe the code you want to generate..."
            value={genInput}
            onChange={(e) => setGenInput(e.target.value)}
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-3.5 rounded-xl flex items-center justify-center gap-3 font-semibold shadow-lg shadow-cyan-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? <RotateCcw className="animate-spin" /> : <Play size={20} fill="currentColor" />}
            Generate Code
          </button>
        </div>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-white/5 flex flex-col h-full overflow-hidden shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-emerald-400 tracking-wide">Output Code</h3>
          <button onClick={() => copyToClipboard(genOutput)} className="text-slate-500 hover:text-emerald-400 transition-colors p-2 hover:bg-white/5 rounded-lg" title="Copy">
            <Clipboard size={20} />
          </button>
        </div>
        <div className="flex-1 bg-slate-950 p-6 rounded-xl overflow-auto font-mono text-sm border border-slate-800/50 shadow-inner">
            <pre className="whitespace-pre-wrap text-slate-300 leading-relaxed">{genOutput || <span className="text-slate-600 italic">// Generated code will appear here...</span>}</pre>
        </div>
      </div>
    </div>
  );

  const renderExplainer = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-8rem)]">
      <div className="flex flex-col gap-4 h-full">
        <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-white/5 flex flex-col gap-6 flex-1 shadow-xl">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg text-purple-400 tracking-wide">Source Code</h3>
            <select 
              value={explainLanguage} 
              onChange={(e) => setExplainLanguage(e.target.value as Language)}
              className="bg-slate-800 text-xs font-medium text-slate-300 py-1.5 px-3 rounded-lg border border-slate-700 outline-none focus:border-purple-500/50 transition-colors"
            >
               {Object.values(Language).map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
            </select>
          </div>
          <textarea
            className="flex-1 bg-slate-950/50 p-4 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 border border-slate-800/50 font-mono text-sm text-slate-300 placeholder:text-slate-600 transition-all code-input"
            placeholder="// Paste your code here to explain..."
            value={explainInput}
            onChange={(e) => setExplainInput(e.target.value)}
          />
          <button
            onClick={handleExplain}
            disabled={isExplaining}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-3.5 rounded-xl flex items-center justify-center gap-3 font-semibold shadow-lg shadow-purple-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
             {isExplaining ? <RotateCcw className="animate-spin" /> : <CheckCircle2 size={20} />}
            Explain Logic
          </button>
        </div>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-white/5 flex flex-col h-full overflow-hidden shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-pink-400 tracking-wide">Explanation</h3>
        </div>
        <div className="flex-1 bg-slate-950 p-6 rounded-xl overflow-auto text-sm border border-slate-800/50 leading-relaxed text-slate-300 shadow-inner">
           {explainOutput 
             ? explainOutput.split('\n').map((line, i) => <p key={i} className="min-h-[1.5rem]">{line}</p>) 
             : <span className="text-slate-600 italic">AI analysis will appear here...</span>
           }
        </div>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white tracking-tight">Activity History</h2>
        <span className="text-slate-500 text-sm font-medium bg-slate-900/50 px-3 py-1 rounded-full border border-white/5">Total: {history.length}</span>
      </div>
      
      {history.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
            <p className="text-slate-500">No activity recorded yet.</p>
        </div>
      ) : (
        history.map((item) => (
        <div key={item.id} className="bg-slate-900/40 backdrop-blur-sm p-6 rounded-2xl border border-white/5 shadow-lg hover:border-white/10 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                  item.type === 'generation' 
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' 
                  : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
              }`}>
                {item.type}
              </span>
              <span className="text-xs text-slate-500 font-mono">{new Date(item.timestamp).toLocaleString()}</span>
            </div>
            <div className="text-xs font-medium text-slate-400 bg-slate-950/50 px-3 py-1.5 rounded-lg border border-white/5">
               {item.language} &bull; {item.model}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="group relative">
               <p className="text-xs font-bold text-slate-500 uppercase mb-2 pl-1">Input</p>
               <div className="bg-slate-950/50 p-4 rounded-xl text-xs font-mono text-slate-400 overflow-hidden h-24 border border-white/5 relative">
                   <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                       <button onClick={() => copyToClipboard(item.input)} className="bg-slate-800 p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-700"><Clipboard size={12} /></button>
                   </div>
                   {item.input.slice(0, 300)}{item.input.length > 300 && '...'}
               </div>
            </div>
            <div>
               <p className="text-xs font-bold text-slate-500 uppercase mb-2 pl-1">Output</p>
               <div className="bg-slate-950/50 p-4 rounded-xl text-xs text-slate-400 overflow-hidden h-24 border border-white/5">
                   {item.output.slice(0, 300)}{item.output.length > 300 && '...'}
               </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500 font-medium">Rating:</span>
                  <StarRating 
                    rating={item.feedback?.rating || 0} 
                    onRate={(r) => {
                        if(!item.feedback) {
                           const comment = prompt("Leave a short comment (optional):") || "";
                           handleFeedback(item, r, comment);
                        }
                    }} 
                    disabled={!!item.feedback}
                  />
              </div>
              {item.feedback && (
                  <div className="flex items-center gap-2 text-emerald-400/80 bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10">
                      <CheckCircle2 size={14} />
                      <span className="text-xs font-medium">{item.feedback.comment || "Feedback submitted"}</span>
                  </div>
              )}
          </div>
        </div>
      )))}
    </div>
  );

  const renderProfile = () => (
    <div className="max-w-xl mx-auto mt-10">
        <div className="bg-slate-900/60 backdrop-blur-xl p-10 rounded-3xl border border-white/10 shadow-2xl">
            <div className="flex flex-col items-center mb-10">
                 <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-800 bg-slate-800 shadow-xl">
                        {user?.avatarUrl ? (
                            <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-slate-600 bg-slate-950">
                                {user?.name.charAt(0)}
                            </div>
                        )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-cyan-500 hover:bg-cyan-400 text-white p-2.5 rounded-full cursor-pointer shadow-lg transition-transform hover:scale-110 border-4 border-slate-900">
                        <Camera size={18} />
                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                    </label>
                 </div>
                 <h2 className="text-2xl font-bold mt-4 text-white">{user?.name}</h2>
                 <p className="text-slate-500">{user?.email}</p>
                 <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700">{user?.role}</span>
                    <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700">Joined {new Date(user?.joinedAt || '').toLocaleDateString()}</span>
                 </div>
            </div>
            
            <div className="space-y-6">
                <div className="border-t border-white/10 pt-8">
                    <h3 className="font-bold mb-6 text-cyan-400 flex items-center gap-2">
                        <div className="w-1 h-4 bg-cyan-400 rounded-full"></div>
                        Security Settings
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-slate-400 text-xs font-bold uppercase mb-2 ml-1">New Password</label>
                            <input 
                                type="password" 
                                placeholder="••••••••" 
                                value={newPass}
                                onChange={e => setNewPass(e.target.value)}
                                className="w-full bg-slate-950/50 border border-slate-700 p-3.5 rounded-xl text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all placeholder:text-slate-700" 
                            />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-xs font-bold uppercase mb-2 ml-1">Confirm Password</label>
                            <input 
                                type="password" 
                                placeholder="••••••••" 
                                value={confirmPass}
                                onChange={e => setConfirmPass(e.target.value)}
                                className="w-full bg-slate-950/50 border border-slate-700 p-3.5 rounded-xl text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all placeholder:text-slate-700" 
                            />
                        </div>
                        <button 
                            onClick={() => {
                                if (newPass && newPass === confirmPass) {
                                    const otp = prompt("Simulation: Enter OTP 123456 sent to your email.");
                                    if(otp === '123456') {
                                        if(user) updateProfile({...user, passwordHash: newPass});
                                        alert("Password updated successfully.");
                                        setNewPass(''); setConfirmPass('');
                                    } else { alert("Invalid OTP"); }
                                } else {
                                    alert("Passwords do not match");
                                }
                            }}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3.5 rounded-xl font-medium transition-colors mt-2 border border-slate-700"
                        >
                            Update Password
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="animate-fade-in">
        {activeTab === 'generator' && renderGenerator()}
        {activeTab === 'explainer' && renderExplainer()}
        {activeTab === 'history' && renderHistory()}
        {activeTab === 'profile' && renderProfile()}
      </div>
    </Layout>
  );
};