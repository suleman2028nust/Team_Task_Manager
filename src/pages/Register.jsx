import React, { useState } from 'react';
import { Layout, Mail, Lock, User, ArrowRight } from 'lucide-react';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Register attempt with:', { username, email, password });
        // dummy logic
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border overflow-hidden">
                <div className="bg-indigo-600 p-8 text-center text-white">
                    <div className="flex justify-center mb-4">
                        <Layout size={48} />
                    </div>
                    <h1 className="text-2xl font-bold">Join TaskFlow</h1>
                    <p className="text-indigo-100 mt-1">Start managing your teams and tasks</p>
                </div>
                
                <form className="p-8" onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <User size={18} />
                            </span>
                            <input 
                                type="text"
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                                placeholder="Your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <Mail size={18} />
                            </span>
                            <input 
                                type="email"
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-8">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <Lock size={18} />
                            </span>
                            <input 
                                type="password"
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 flex items-center justify-center gap-2 transform hover:scale-[1.01] transition-all shadow-lg shadow-indigo-200"
                    >
                        Get Started <ArrowRight size={18} />
                    </button>

                    <div className="mt-8 text-center text-sm text-gray-600">
                        Already have an account? 
                        <button type="button" className="text-indigo-600 font-bold hover:underline ml-1">Sign In</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
