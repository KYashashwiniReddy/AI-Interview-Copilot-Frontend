'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LayoutShell from '../../components/LayoutShell';
import { authApi, api } from '../../lib/api';
import { User, Lock, Trash2, Camera, Shield, Check, X, AlertTriangle, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SettingsPage() {
  const router = useRouter();

  const formatDateTime = (dateInput: any) => {
    if (!dateInput) return 'N/A';
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return 'N/A';
    
    const day = date.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    
    return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
  };

  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Profile forms
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password forms
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Account Deletion forms
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Load current user profile details
    async function loadUser() {
      try {
        const data = await authApi.me();
        if (data.user) {
          setUser(data.user);
          setFullName(data.user.fullName || '');
          setEmail(data.user.email || '');
          setAvatarUrl(data.user.avatarUrl || '');
        }
      } catch (err) {
        console.error('Failed to retrieve user settings context:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();

    // Check for query param tab
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'security') {
        setActiveTab('security');
      } else if (tab === 'profile') {
        setActiveTab('profile');
      }
    }
  }, []);



  // Profile Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    const formData = new FormData();
    formData.append('avatar', file);

    setIsUploading(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const data = await authApi.uploadAvatar(formData);
      setAvatarUrl(data.avatarUrl);
      
      // Update local storage user context with the new avatarURL
      const cached = api.getUser();
      if (cached) {
        cached.avatarUrl = data.avatarUrl;
        api.setUser(cached);
        window.dispatchEvent(new Event('user-profile-updated'));
      }
      setProfileSuccess('Profile picture uploaded successfully! Save profile to confirm.');
    } catch (err: any) {
      setProfileError(err.message || 'Failed to upload image.');
    } finally {
      setIsUploading(false);
    }
  };

  // Submit Profile update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    try {
      const data = await authApi.updateProfile({
        fullName,
        email,
        avatarUrl
      });
      setUser({ ...user, fullName: data.user.fullName, email: data.user.email, avatarUrl: data.user.avatarUrl });
      api.setUser(data.user);
      setProfileSuccess('Profile details updated successfully.');
      
      // Force page reload or trigger navbar context sync
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('user-profile-updated'));
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile settings.');
    }
  };

  // Submit Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError('New password cannot be the same as your current password. Please choose a different password.');
      return;
    }

    try {
      await authApi.changePassword({
        currentPassword,
        newPassword
      });
      setPasswordSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password. Please verify current password.');
    }
  };

  // Submit Account Deletion
  const handleDeleteAccount = async () => {
    setDeleteError('');
    setIsDeleting(true);

    try {
      await authApi.deleteAccount({
        password: deleteConfirmPassword
      });
      
      // Clear token & redirect to landing
      api.clearToken();
      setShowDeleteModal(false);
      router.push('/');
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete account. Please verify confirmation password.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <LayoutShell>
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </LayoutShell>
    );
  }

  return (
    <LayoutShell>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-black text-white mb-1">Account Management Settings</h1>
          <p className="text-slate-400 text-sm">Configure your personal preferences, modify profile, and manage security settings.</p>
        </div>

        {/* TABS SELECTION */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-2xl max-w-sm">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'profile' ? 'bg-purple-600/15 text-purple-400 border border-purple-500/20' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <User size={14} />
            My Profile
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'security' ? 'bg-purple-600/15 text-purple-400 border border-purple-500/20' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Shield size={14} />
            Security & Login
          </button>
        </div>

        {/* PROFILE SETTINGS TAB */}
        {activeTab === 'profile' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-8">
            
            {/* AVATAR PICTURE UPDATE SECTION */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-800">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center font-black text-2xl text-purple-400 overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    fullName ? fullName[0].toUpperCase() : 'U'
                  )}
                </div>
                <label className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-white text-[10px] font-bold">
                  <Camera size={18} className="mb-1" />
                  Upload Picture
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                </label>
              </div>
              
              <div className="text-center sm:text-left space-y-1">
                <h3 className="text-base font-bold text-white">Profile Photo</h3>
                <p className="text-xs text-slate-500">Supports PNG, JPG, or GIF formats. Maximum file size 5MB.</p>
                {isUploading && <p className="text-xs text-purple-400 animate-pulse">Uploading asset image...</p>}
              </div>
            </div>

            {/* ERROR / SUCCESS NOTIFICATIONS */}
            {profileSuccess && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
                <Check size={14} />
                <span>{profileSuccess}</span>
              </div>
            )}
            {profileError && (
              <div className="p-3 bg-rose-950/40 border border-rose-900/50 text-rose-400 text-xs rounded-xl flex items-center gap-2">
                <X size={14} />
                <span>{profileError}</span>
              </div>
            )}

            {/* DETAIL FIELDS FORM */}
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
              </div>

              {/* READ-ONLY ACCOUNT STATISTICS */}
              <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl grid sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="block text-slate-500 mb-1">Account Type</span>
                  <span className="font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full inline-block">
                    {user?.role || 'STUDENT'}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-500 mb-1">Registration Date</span>
                  <span className="font-bold text-slate-300">
                    {formatDateTime(user?.createdAt)}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-500 mb-1">Last Login</span>
                  <span className="font-bold text-slate-300">
                    {formatDateTime(user?.lastLogin)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition duration-300 flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-900/20"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SECURITY SETTINGS TAB */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            
            {/* CHANGE PASSWORD COMPONENT */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <Lock className="text-purple-400" size={18} />
                <h2 className="text-base font-bold text-white">Change Account Password</h2>
              </div>

              {passwordSuccess && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
                  <Check size={14} />
                  <span>{passwordSuccess}</span>
                </div>
              )}
              {passwordError && (
                <div className="p-3 bg-rose-950/40 border border-rose-900/50 text-rose-400 text-xs rounded-xl flex items-center gap-2">
                  <X size={14} />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Current Password</label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-700 focus:outline-none focus:border-purple-500 transition"
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-700 focus:outline-none focus:border-purple-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-700 focus:outline-none focus:border-purple-500 transition"
                      />
                    </div>
                  </div>
                </div>


                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition duration-300 flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-900/20"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>

            {/* DELETE ACCOUNT CONTAINER */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4">
              <div className="flex items-center gap-3 text-rose-500 pb-2 border-b border-slate-800">
                <Trash2 size={18} />
                <h2 className="text-base font-bold">Delete Account</h2>
              </div>
              
              <p className="text-xs text-slate-400 leading-relaxed">
                Deleting your account will permanently erase your profile details, resume scans, ATS match reports, skill roadmaps, and mock interview recordings. This action cannot be reversed.
              </p>

              <div className="flex justify-start pt-2">
                <button
                  onClick={() => { setDeleteError(''); setDeleteConfirmPassword(''); setShowDeleteModal(true); }}
                  className="px-4 py-2 bg-rose-600/10 hover:bg-rose-600/15 border border-rose-500/20 hover:border-rose-500/30 text-rose-400 font-bold text-xs uppercase rounded-xl transition cursor-pointer"
                >
                  Delete My Account
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ACCOUNT DELETION CONFIRMATION DIALOG MODAL */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl space-y-6 text-slate-100 z-10"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl shrink-0">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Permanently Delete Account?</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    This action is permanent and cannot be undone. All ATS scans, skill assessments, roadmaps, and interview session archives will be deleted.
                  </p>
                </div>
              </div>

              {deleteError && (
                <div className="p-3 bg-rose-950/40 border border-rose-900/50 text-rose-400 text-xs rounded-xl">
                  {deleteError}
                </div>
              )}

              {/* Password confirm if local password exists */}
              {user?.hasPassword && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Confirm Your Password</label>
                  <input
                    type="password"
                    required
                    value={deleteConfirmPassword}
                    onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                    placeholder="Enter password to confirm"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-sm text-white placeholder-slate-700 focus:outline-none focus:border-rose-500 transition"
                  />
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-400 text-xs font-bold uppercase rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Trash2 size={12} />
                  {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </LayoutShell>
  );
}
