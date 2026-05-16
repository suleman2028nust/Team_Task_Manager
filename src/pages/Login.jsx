import React, { useState } from 'react';
import { Layout, Lock, User, ArrowRight, Globe } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await api.post('/auth/login', { username, password });
            console.log('Logged in:', res.data.user);
            navigate('/dashboard');
        } catch (err) {
            // show the error message from the server
            const msg = err.response?.data?.message || 'Login failed. Try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 selection:bg-indigo-500/30">
            {/* Background blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-900 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative w-full max-w-[440px]">
                <div className="bg-slate-950 border border-slate-800/60 rounded-3xl shadow-2xl overflow-hidden">
                    <div className="p-10">
                        <div className="flex justify-center mb-8">
                            <div className="bg-indigo-600 p-3 rounded-2xl shadow-xl shadow-indigo-600/20">
                                <Layout size={32} className="text-white" />
                            </div>
                        </div>

                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Welcome Back</h1>
                            <p className="text-slate-500 text-sm">Enter your credentials to access your workspace</p>
                        </div>

                        {/* error box */}
                        {error && (
                            <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Username</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-indigo-500 transition-colors">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-800 rounded-2xl text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 outline-none transition-all"
                                        placeholder="Enter username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2 ml-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-indigo-500 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-800 rounded-2xl text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 outline-none transition-all"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-indigo-600/20 mt-8"
                            >
                                {loading ? 'Signing in...' : (<>Sign In <ArrowRight size={18} /></>)}
                            </button>
                        </form>

                        <div className="relative my-10 text-center">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-800/60"></div>
                            </div>
                            <span className="relative px-4 bg-slate-950 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Or</span>
                        </div>

                        <button className="flex items-center justify-center gap-3 w-full py-3 bg-slate-900 border border-slate-800 rounded-2xl text-white text-sm font-bold hover:bg-slate-800 transition">
                            <Globe size={20} /> Continue with SSO
                        </button>
                    </div>

                    <div className="p-6 bg-slate-900/30 border-t border-slate-800/60 text-center">
                        <p className="text-sm text-slate-500">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-indigo-500 font-bold hover:text-indigo-400 transition">
                                Create one
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
