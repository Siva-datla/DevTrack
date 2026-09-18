import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Shield,
  Key,
  Download,
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
  Terminal,
  Code2,
  Flame,
  Laptop,
  Cpu,
  Globe,
  Github,
  Linkedin,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Layers,
  Save,
} from 'lucide-react';
import authApi from '../api/auth';
import platformsApi from '../api/platforms';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PlatformIcon } from '../components/common/PlatformIcon';

const avatarPresets = [
  { id: 'avatar-1', label: 'Terminal', bg: 'from-indigo-600 to-violet-600', icon: Terminal },
  { id: 'avatar-2', label: 'Code', bg: 'from-emerald-500 to-teal-600', icon: Code2 },
  { id: 'avatar-3', label: 'Streak', bg: 'from-amber-500 to-rose-600', icon: Flame },
  { id: 'avatar-4', label: 'Laptop', bg: 'from-cyan-500 to-blue-600', icon: Laptop },
  { id: 'avatar-5', label: 'Sparkles', bg: 'from-fuchsia-500 to-purple-600', icon: Sparkles },
  { id: 'avatar-6', label: 'Silicon', bg: 'from-slate-700 to-zinc-900', icon: Cpu },
];

export const SettingsPage = () => {
  const { user, setUser, isAdmin } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security' | 'data'

  // Profile Form State
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('avatar-1');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [website, setWebsite] = useState('');
  const [githubHandle, setGithubHandle] = useState('');
  const [linkedinHandle, setLinkedinHandle] = useState('');
  const [preferredPlatform, setPreferredPlatform] = useState('ALL');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Data Export State
  const [exportingData, setExportingData] = useState(false);
  const [platforms, setPlatforms] = useState([]);
  const [loadingPlatforms, setLoadingPlatforms] = useState(false);

  // Sync user values into form when user changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      if (user.avatar?.startsWith('http')) {
        setAvatar('custom');
        setCustomAvatarUrl(user.avatar);
      } else {
        setAvatar(user.avatar || 'avatar-1');
      }
      setWebsite(user.website || '');
      setGithubHandle(user.githubHandle || '');
      setLinkedinHandle(user.linkedinHandle || '');
      setPreferredPlatform(user.preferredPlatform || 'ALL');
    }
  }, [user]);

  // Load platforms summary for data export tab
  useEffect(() => {
    let isMounted = true;
    setLoadingPlatforms(true);
    platformsApi
      .getPlatforms()
      .then((res) => {
        if (isMounted && res?.success && Array.isArray(res.data)) {
          setPlatforms(res.data);
        }
      })
      .catch((err) => console.warn('[SettingsPage] Error loading platforms:', err))
      .finally(() => {
        if (isMounted) setLoadingPlatforms(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle Save Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileError('');

    if (!name.trim()) {
      setProfileError('Display Name cannot be blank.');
      return;
    }

    if (bio.length > 250) {
      setProfileError('Bio cannot exceed 250 characters.');
      return;
    }

    const resolvedAvatar = avatar === 'custom' ? customAvatarUrl.trim() : avatar;

    setSavingProfile(true);
    try {
      const res = await authApi.updateMe({
        name: name.trim(),
        bio: bio.trim(),
        avatar: resolvedAvatar,
        website: website.trim(),
        githubHandle: githubHandle.trim(),
        linkedinHandle: linkedinHandle.trim(),
        preferredPlatform,
      });

      if (res.success && res.data?.user) {
        setUser(res.data.user);
        toast.success('Developer profile updated successfully!');
      } else {
        setProfileError(res.error?.message || 'Failed to update profile.');
      }
    } catch (err) {
      setProfileError(
        err.response?.data?.error?.message ||
          err.message ||
          'Failed to update profile. Please try again.'
      );
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await authApi.updateMe({
        currentPassword,
        newPassword,
      });

      if (res.success) {
        toast.success('Password updated successfully!');
        setPasswordSuccess('Your password has been changed securely.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(res.error?.message || 'Failed to update password.');
      }
    } catch (err) {
      setPasswordError(
        err.response?.data?.error?.message ||
          err.message ||
          'Failed to update password. Verify your current password.'
      );
    } finally {
      setSavingPassword(false);
    }
  };

  // Handle Export Data
  const handleExportData = async () => {
    setExportingData(true);
    try {
      const res = await authApi.exportData();
      const blob = new Blob([res.data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeName = (user?.name || 'developer').toLowerCase().replace(/[^a-z0-9]/g, '-');
      link.setAttribute('download', `devtrack-export-${safeName}-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Developer data exported successfully!');
    } catch (err) {
      console.error('[SettingsPage] Error exporting data:', err);
      toast.error('Failed to export developer data.');
    } finally {
      setExportingData(false);
    }
  };

  // Helper to render currently selected avatar element
  const renderAvatarPreview = (size = 'w-14 h-14', iconSize = 'w-6 h-6') => {
    if (avatar === 'custom' && customAvatarUrl.trim()) {
      return (
        <img
          src={customAvatarUrl.trim()}
          alt={name || 'Avatar'}
          className={`${size} rounded-2xl object-cover border-2 border-indigo-500 shadow-md`}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '';
          }}
        />
      );
    }

    const preset = avatarPresets.find((p) => p.id === avatar) || avatarPresets[0];
    const Icon = preset.icon;
    return (
      <div
        className={`${size} rounded-2xl bg-gradient-to-tr ${preset.bg} text-white flex items-center justify-center shadow-md shadow-indigo-500/20 border-2 border-white/20`}
      >
        <Icon className={iconSize} />
      </div>
    );
  };

  const memberSinceStr = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : 'Recent';

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Account & Preferences</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Settings & Profile
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Customize your developer identity, security credentials, and data exports.
          </p>
        </div>
      </div>

      {/* Identity Card */}
      <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          {renderAvatarPreview('w-16 h-16', 'w-7 h-7')}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {user?.name || 'Developer'}
              </h3>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isAdmin
                    ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60'
                    : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60'
                }`}
              >
                {isAdmin ? 'ADMINISTRATOR' : 'DEVELOPER'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{user?.email}</p>
            <p className="text-[11px] text-slate-400 mt-1">Member since {memberSinceStr}</p>
          </div>
        </div>

        {/* Quick Platform Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {platforms.map((p) => (
            <div
              key={p.platform}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              title={`@${p.username}`}
            >
              <PlatformIcon platform={p.platform} className="w-3.5 h-3.5" />
              <span className="capitalize">{p.platform.toLowerCase()}</span>
            </div>
          ))}
          {platforms.length === 0 && (
            <Link
              to="/platforms"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 transition-colors"
            >
              <span>Link Platforms</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 flex-wrap">
        {[
          { id: 'profile', label: 'Developer Profile', icon: User },
          { id: 'security', label: 'Password & Security', icon: Key },
          { id: 'data', label: 'Data & Privacy', icon: Download },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: DEVELOPER PROFILE */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          {/* Main Edit Form */}
          <div className="lg:col-span-2 bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Profile Details</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Update your public developer identity across DevTrack
              </p>
            </div>

            {profileError && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Avatar Preset Picker */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                  Developer Avatar Theme
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {avatarPresets.map((preset) => {
                    const Icon = preset.icon;
                    const isSelected = avatar === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setAvatar(preset.id)}
                        className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/50 ring-2 ring-indigo-500/30'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${preset.bg} text-white flex items-center justify-center shadow-sm`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">
                          {preset.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Alex Chen"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Email (Readonly) */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Email address is linked to your authentication credentials and cannot be modified directly.
                </span>
              </div>

              {/* Bio */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Developer Bio / Headline
                  </label>
                  <span
                    className={`text-[10px] ${
                      bio.length > 250 ? 'text-rose-500 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {bio.length} / 250
                  </span>
                </div>
                <textarea
                  rows="3"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="e.g., Full-stack software engineer & algorithm enthusiast. Currently grinding Dynamic Programming and Graph theory."
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Primary Focus Platform */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Primary Coding Focus
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'ALL', label: 'All Platforms', isAll: true },
                    { id: 'LEETCODE', label: 'LeetCode', isAll: false },
                    { id: 'CODEFORCES', label: 'Codeforces', isAll: false },
                    { id: 'HACKERRANK', label: 'HackerRank', isAll: false },
                  ].map((opt) => {
                    const isSelected = preferredPlatform === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setPreferredPlatform(opt.id)}
                        className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 shadow-sm ring-1 ring-indigo-500/30'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        {opt.isAll ? (
                          <Layers className="w-3.5 h-3.5 text-indigo-500" />
                        ) : (
                          <PlatformIcon platform={opt.id} className="w-3.5 h-3.5" />
                        )}
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Social & Portfolio Links */}
              <div className="space-y-3 pt-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Online Presence & Social Handles
                </label>

                {/* GitHub */}
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-slate-400">
                    <Github className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={githubHandle}
                    onChange={(e) => setGithubHandle(e.target.value)}
                    placeholder="GitHub username (e.g. torvalds)"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* LinkedIn */}
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-blue-500">
                    <Linkedin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={linkedinHandle}
                    onChange={(e) => setLinkedinHandle(e.target.value)}
                    placeholder="LinkedIn profile handle or vanity URL"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Website */}
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-indigo-500">
                    <Globe className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="Personal website URL (https://yourdomain.com)"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/25 transition-all disabled:opacity-50"
                >
                  {savingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Live Profile Preview Card */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Live Preview
                </span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800/60">
                  Public Card
                </span>
              </div>

              <div className="flex items-center gap-3.5 mb-3">
                {renderAvatarPreview('w-12 h-12', 'w-5 h-5')}
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {name || 'Your Name'}
                  </h4>
                  <span className="text-[11px] text-slate-400 block truncate">
                    {preferredPlatform === 'ALL'
                      ? 'Multi-Platform Developer'
                      : `${preferredPlatform} Focused`}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic line-clamp-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                {bio || 'No developer bio written yet. Add a short headline to showcase your focus!'}
              </p>

              {/* Social Badges */}
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                {githubHandle && (
                  <a
                    href={`https://github.com/${githubHandle}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                  >
                    <Github className="w-3 h-3" />
                    <span>@{githubHandle}</span>
                  </a>
                )}
                {linkedinHandle && (
                  <a
                    href={`https://linkedin.com/in/${linkedinHandle}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors"
                  >
                    <Linkedin className="w-3 h-3" />
                    <span>LinkedIn</span>
                  </a>
                )}
                {website && (
                  <a
                    href={website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
                  >
                    <Globe className="w-3 h-3" />
                    <span>Portfolio</span>
                  </a>
                )}
              </div>
            </div>

            {/* Quick Tip Box */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-300 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Your profile details update immediately across the platform sidebar, top header, and leaderboards.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PASSWORD & SECURITY */}
      {activeTab === 'security' && (
        <div className="max-w-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Change Password</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ensure your developer account remains secure by using a strong password
            </p>
          </div>

          {passwordError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                New Password (minimum 6 characters)
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
              <button
                type="submit"
                disabled={savingPassword}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/25 transition-all disabled:opacity-50"
              >
                {savingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: DATA & PRIVACY */}
      {activeTab === 'data' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Data Export Card */}
          <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 sm:p-7 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50 mb-3">
                  <Download className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Export Developer Records
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl mt-1 leading-relaxed">
                  Download a complete backup of all your DevTrack metrics in JSON format. This bundle
                  includes your profile credentials, linked platform handles, total solved problem
                  counts, submissions history, test case verdicts, active milestones, and contest
                  rating histories.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportData}
                disabled={exportingData}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/25 transition-all disabled:opacity-50 flex-shrink-0"
              >
                {exportingData ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Exporting JSON...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download Data (.json)</span>
                  </>
                )}
              </button>
            </div>

            {/* Export Contents Breakdown */}
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                  Platform Accounts
                </span>
                <span className="text-slate-400 text-[11px]">
                  LeetCode, Codeforces & HackerRank handles + sync status
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                  Submissions Feed
                </span>
                <span className="text-slate-400 text-[11px]">
                  Code verdicts, language, memory, runtime, and timestamps
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                  Goals & Streaks
                </span>
                <span className="text-slate-400 text-[11px]">
                  Milestone targets, current progress, deadlines, and status
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                  Rating Chronology
                </span>
                <span className="text-slate-400 text-[11px]">
                  Contest rank positions, rating deltas, and official curves
                </span>
              </div>
            </div>
          </div>

          {/* Linked Platform Quick Jumps */}
          <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 sm:p-7 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Connected Platforms Management
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Link, synchronize, or unlink competitive programming handles
                </p>
              </div>

              <Link
                to="/platforms"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 transition-colors"
              >
                <span>Manage Platforms</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {['LEETCODE', 'CODEFORCES', 'HACKERRANK'].map((plat) => {
                const acc = platforms.find((p) => p.platform === plat);
                return (
                  <div
                    key={plat}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <PlatformIcon platform={plat} className="w-4 h-4" />
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block capitalize">
                          {plat.toLowerCase()}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {acc ? `@${acc.username}` : 'Not connected'}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        acc
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {acc ? 'CONNECTED' : 'DISCONNECTED'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
