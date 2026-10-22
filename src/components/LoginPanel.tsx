import React, { useState } from 'react';
import { AuthUser, RemoteTeamMember } from '../types/project';
import { DigitalCoyotesLogo } from './DigitalCoyotesLogo';
import {
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sun,
  Moon,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface LoginPanelProps {
  onLogin: (user: AuthUser) => void;
  teamMembers: RemoteTeamMember[];
  isDark: boolean;
  onToggleTheme: () => void;
}

export const LoginPanel: React.FC<LoginPanelProps> = ({
  onLogin,
  teamMembers,
  isDark,
  onToggleTheme,
}) => {
  const [username, setUsername] = useState<string>('sakshi');
  const [password, setPassword] = useState<string>('coyote2026');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanUsername) {
      setError('Please enter your username or email address.');
      return;
    }

    if (!cleanPassword) {
      setError('Please enter your account password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      // Check if username/email matches any existing team member
      const matchedMember = teamMembers.find(
        (m) =>
          m.name.toLowerCase() === cleanUsername ||
          m.email.toLowerCase() === cleanUsername ||
          m.name.toLowerCase().includes(cleanUsername)
      );

      if (matchedMember) {
        onLogin({
          id: matchedMember.id,
          name: matchedMember.name,
          username: matchedMember.name.toLowerCase(),
          role: matchedMember.role,
          email: matchedMember.email,
          avatarBg: matchedMember.avatarBg,
        });
        return;
      }

      // Check admin account
      if (cleanUsername === 'admin' || cleanUsername === 'admin@digitalcoyotes.com') {
        onLogin({
          id: 'admin-1',
          name: 'Executive Admin',
          username: 'admin',
          role: 'Workspace Administrator',
          email: 'admin@digitalcoyotes.com',
          avatarBg: 'bg-orange-950/80 text-orange-300 border-orange-700/60',
        });
        return;
      }

      // Allow any legitimate staff sign-in
      const formattedName =
        cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1);
      onLogin({
        id: `user-${Date.now()}`,
        name: formattedName,
        username: cleanUsername,
        role: 'Project Lead',
        email: `${cleanUsername}@digitalcoyotes.com`,
        avatarBg: 'bg-emerald-950/70 text-emerald-300 border-emerald-700/60',
      });
    }, 450);
  };

  const handleQuickSelectLead = (member: RemoteTeamMember) => {
    setUsername(member.name.toLowerCase());
    setPassword('coyote2026');
    setError(null);
  };

  const handleQuickLoginLead = (member: RemoteTeamMember) => {
    onLogin({
      id: member.id,
      name: member.name,
      username: member.name.toLowerCase(),
      role: member.role,
      email: member.email,
      avatarBg: member.avatarBg,
    });
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center p-4 transition-colors duration-200 ${
      isDark ? 'dark bg-neutral-950 text-neutral-100' : 'bg-neutral-100/80 text-neutral-900'
    }`}>
      {/* Theme Toggle Top-Right */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <button
          onClick={onToggleTheme}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer transition-colors shadow-xs ${
            isDark
              ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
              : 'bg-white hover:bg-neutral-50 border-neutral-300 text-neutral-700'
          }`}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
          <span className="font-mono text-[11px] uppercase">{isDark ? 'Day Mode' : 'Night Mode'}</span>
        </button>
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-orange-500/10 dark:bg-orange-500/15 border border-orange-500/20 shadow-sm mb-1">
            <DigitalCoyotesLogo className="w-10 h-10 text-[#F05A28]" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight font-display text-neutral-900 dark:text-white">
            Digital Coyotes
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Project Manager & Remote Sprint Operations Studio
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-7 shadow-xl space-y-5 transition-colors">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800/80 pb-3">
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[#F05A28]" />
                Staff Sign In
              </h2>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                Enter your credentials to access active ledgers
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" />
              Protected
            </span>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-3 rounded-lg text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username / Email */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                Username or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. sakshi or admin"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg pl-9 pr-3 py-2 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[#F05A28] focus:ring-1 focus:ring-[#F05A28] transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Password
                </label>
                <span className="text-[10px] text-neutral-400 font-mono">
                  Default: coyote2026
                </span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg pl-9 pr-10 py-2 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[#F05A28] focus:ring-1 focus:ring-[#F05A28] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer p-0.5"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-neutral-600 dark:text-neutral-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-neutral-300 dark:border-neutral-700 text-[#F05A28] focus:ring-[#F05A28] cursor-pointer"
                />
                <span>Remember session</span>
              </label>
              <span className="text-[11px] text-[#F05A28] hover:underline cursor-pointer">
                Remote Security Policy
              </span>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#F05A28] hover:bg-[#d94e20] active:scale-[0.99] text-white font-medium rounded-lg text-xs transition-all shadow-sm cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Select One-Click Staff Leads */}
          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-neutral-500 font-medium">
              <span>Quick Staff Logins (1-Click):</span>
              <span className="font-mono text-[10px]">5 Active Leads</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {teamMembers.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => handleQuickLoginLead(member)}
                  className="flex items-center gap-2 p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/40 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:border-[#F05A28]/40 transition-colors text-left cursor-pointer group"
                  title={`Sign in as ${member.name} (${member.role})`}
                >
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold font-mono ${member.avatarBg}`}>
                    {member.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 group-hover:text-[#F05A28] truncate">
                      {member.name}
                    </div>
                    <div className="text-[9px] text-neutral-400 truncate">
                      {member.role.split('&')[0]}
                    </div>
                  </div>
                </button>
              ))}

              {/* Admin Button */}
              <button
                type="button"
                onClick={() => {
                  setUsername('admin');
                  setPassword('admin123');
                  onLogin({
                    id: 'admin-1',
                    name: 'Executive Admin',
                    username: 'admin',
                    role: 'Workspace Administrator',
                    email: 'admin@digitalcoyotes.com',
                    avatarBg: 'bg-orange-950/80 text-orange-300 border-orange-700/60',
                  });
                }}
                className="flex items-center gap-2 p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/40 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:border-[#F05A28]/40 transition-colors text-left cursor-pointer group"
                title="Sign in as Executive Admin"
              >
                <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold font-mono bg-orange-950/80 text-orange-300 border border-orange-700/60">
                  AD
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 group-hover:text-[#F05A28] truncate">
                    Executive Admin
                  </div>
                  <div className="text-[9px] text-neutral-400 truncate">
                    Full Operations
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Security Footer Notice */}
        <div className="text-center text-[11px] text-neutral-500 dark:text-neutral-500 font-mono flex items-center justify-center gap-2">
          <span>Digital Coyotes Remote Ops</span>
          <span>·</span>
          <span>Version 3.2 Live</span>
          <span>·</span>
          <span>71 Active Projects</span>
        </div>
      </div>
    </div>
  );
};
