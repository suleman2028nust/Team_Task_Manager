import React, { useState } from 'react';
import { Layout, Mail, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Register attempt with:', { username, email, password });
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 selection:bg-indigo-500/30">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900 rounded-full blur-[120px]"></div>
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-900 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative w-full max-w-[440px]">
                <div className="bg-slate-950 border border-slate-800/60 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
                    <div className="p-10">
                        <div className="flex justify-center mb-8">
                            <div className="bg-indigo-600 p-3 rounded-2xl shadow-xl shadow-indigo-600/20">
                                <Layout size={32} className="text-white" />
                            </div>
                        </div>
                        
                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Create Account</h1>
                            <p className="text-slate-500 text-sm">Join the elite team management platform</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Username</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-indigo-500 transition-colors">
                                        <User size={18} />
                                    </div>
                                    <input 
                                        type="text"
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-800 rounded-2xl text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 outline-none transition-all"
                                        placeholder="Pick a unique name"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-indigo-500 transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input 
                                        type="email"
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-800 rounded-2xl text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 outline-none transition-all"
                                        placeholder="work@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Secure Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-indigo-500 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input 
                                        type="password"
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-800 rounded-2xl text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 outline-none transition-all"
                                        placeholder="Min. 8 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2 pb-4 ml-1">
                                <ShieldCheck size={14} className="text-emerald-500" />
                                <p className="text-[10px] text-slate-500 font-medium italic">Your data is secured with AES-256 encryption</p>
                            </div>

                            <button 
                                type="submit"
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all shadow-lg shadow-indigo-600/20"
                            >
                                Get Started <ArrowRight size={18} />
                            </button>
                        </form>
                    </div>

                    <div className="p-6 bg-slate-900/30 border-t border-slate-800/60 text-center">
                        <p className="text-sm text-slate-500">
                            Already part of TaskFlow? 
                            <button className="text-indigo-500 font-bold hover:text-indigo-400 ml-1.5 transition">Sign In</button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
