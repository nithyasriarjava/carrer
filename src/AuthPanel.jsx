import React, { useState } from 'react';
import { motion } from 'motion/react';
import * as Lucide from 'lucide-react';

export default function AuthPanel({ handleAuthSubmit, handleGoogleLogin }) {
    const [authMode, setAuthMode] = useState("login"); // "login" | "signup"
    const [emailValue, setEmailValue] = useState("");
    const [passwordValue, setPasswordValue] = useState("");
    const [nameValue, setNameValue] = useState("");

    return (
        <motion.div
            key="auth"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-md mx-auto my-12"
            id="auth_panel"
        >
            <div className="bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl p-8 overflow-hidden relative">
                {/* Visual Accent Decoration */}
                <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

                <div className="text-center mb-8">
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 font-mono">Secure Access Platform</span>
                    <h2 className="text-3xl font-extrabold text-white mt-2 tracking-tight">
                        {authMode === "login" ? "Welcome Back" : "Create Account"}
                    </h2>
                    <p className="text-sm text-slate-400 mt-2">
                        {authMode === "login"
                            ? "Sign in to resume tracking your personalized career goals."
                            : "Register to build custom technical skills maps and roadmap profiles."}
                    </p>
                </div>

                <form
                    onSubmit={(e) => handleAuthSubmit(e, authMode, emailValue, passwordValue, nameValue)}
                    className="space-y-4"
                    id="auth_form"
                >
                    {authMode === "signup" && (
                        <div>
                            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                            <div className="relative">
                                <Lucide.User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <input
                                    type="text"
                                    required
                                    value={nameValue}
                                    onChange={(e) => setNameValue(e.target.value)}
                                    placeholder="Jane Doe"
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                        <div className="relative">
                            <Lucide.Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <input
                                type="email"
                                required
                                value={emailValue}
                                onChange={(e) => setEmailValue(e.target.value)}
                                placeholder="you@university.edu"
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Secret Password</label>
                        <div className="relative">
                            <Lucide.Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <input
                                type="password"
                                required
                                value={passwordValue}
                                onChange={(e) => setPasswordValue(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-600/20 active:translate-y-[1px] transition-all flex items-center justify-center gap-2 mt-2"
                        id="submit_auth_btn"
                    >
                        <span>{authMode === "login" ? "Access Dashboard" : "Register Credentials"}</span>
                        <Lucide.ArrowRight className="h-4 w-4" />
                    </button>
                </form>

                <div className="my-4 flex items-center">
                    <div className="flex-1 h-px bg-slate-800"></div>
                    <span className="px-3 text-xs text-slate-500">OR</span>
                    <div className="flex-1 h-px bg-slate-800"></div>
                </div>

                <button
                    onClick={handleGoogleLogin}
                    type="button"
                    className="w-full bg-white text-black py-3 rounded-xl font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors hover:bg-slate-200"
                >
                    <Lucide.Chrome className="h-5 w-5" />
                    Continue with Google
                </button>

                <div className="mt-6 pt-6 border-t border-slate-800 text-center text-sm">
                    <span className="text-slate-400">
                        {authMode === "login" ? "New to the portal?" : "Already mapped your profile?"}
                    </span>{" "}
                    <button
                        onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
                        className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4 cursor-pointer"
                        id="switch_auth_btn"
                    >
                        {authMode === "login" ? "Create an account" : "Sign in here"}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}