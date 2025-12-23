"use client";

import * as React from "react";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { useAppState } from "@/lib/hooks/use-app-state";
import { deriveMasterKey } from "@/lib/storage";

export const Auth = () => {
  const { setVaultKey } = useAppState() as any;
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [isSignUp, setIsSignUp] = React.useState(false);
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        // 1. Sign Up
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { 
            data: { username: email.split('@')[0] },
            emailRedirectTo: window.location.origin 
          }
        });
        if (error) throw error;
        
        if (data.user) {
          // Generate a salt for the vault
          const vaultSalt = crypto.getRandomValues(new Uint8Array(16));
          const vaultSaltBase64 = btoa(String.fromCharCode(...vaultSalt));
          
          await supabase.from('profiles').upsert({
            id: data.user.id,
            vault_salt: vaultSaltBase64
          });

          // Derive and set key
          const key = await deriveMasterKey(password, vaultSalt);
          setVaultKey(key);

          await supabase.from('audit_logs').insert({
            user_id: data.user.id,
            event_type: 'signup_attempt',
            metadata: { email, role: 'USER' }
          });
        }

        if (!data?.session) {
          alert("A verification link has been sent to your email. Please confirm to activate your account.");
        }
      } else {
        // 1. Sign In
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // 2. Fetch vault salt and derive key
        const { data: profile } = await supabase
          .from('profiles')
          .select('vault_salt')
          .eq('id', data.user.id)
          .single();

        if (profile?.vault_salt) {
          const salt = Uint8Array.from(atob(profile.vault_salt), (c) => c.charCodeAt(0));
          const key = await deriveMasterKey(password, salt);
          setVaultKey(key);
        } else {
          // Fallback if salt is missing (should not happen in zero-trust flow)
          console.warn("Vault salt missing for user. Initializing new salt.");
          const vaultSalt = crypto.getRandomValues(new Uint8Array(16));
          const vaultSaltBase64 = btoa(String.fromCharCode(...vaultSalt));
          await supabase.from('profiles').update({ vault_salt: vaultSaltBase64 }).eq('id', data.user.id);
          const key = await deriveMasterKey(password, vaultSalt);
          setVaultKey(key);
        }

        await supabase.from('audit_logs').insert({
          user_id: data.user?.id,
          event_type: 'login_success',
          metadata: { method: 'password', role: data.user?.app_metadata?.role || 'pending' }
        });
      }
    } catch (error: any) {
      await supabase.from('audit_logs').insert({
        event_type: 'login_failure',
        metadata: { email, error: error.message }
      });
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md bg-white p-10 rounded-[3rem] border border-black/[0.02] shadow-[0_20px_60px_rgba(0,0,0,0.03)] space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-[#0F172A] tracking-tight">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-[#64748B] text-sm font-medium">
            {isSignUp ? "Start your decentralized journey" : "Log in to access your files"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={20} />
              <input 
                type="email" 
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-black/[0.03] rounded-2xl py-5 pl-14 pr-6 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={20} />
              <input 
                type="password" 
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-black/[0.03] rounded-2xl py-5 pl-14 pr-6 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-[#3B82F6] text-white rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            {loading ? "Please wait..." : (isSignUp ? "Sign Up" : "Sign In")}
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>

        <p className="text-center text-sm font-bold text-[#64748B]">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="ml-2 text-blue-600 hover:underline"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
};
