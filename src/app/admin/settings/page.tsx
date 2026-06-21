'use client';

import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../lib/api';
import { useTheme } from '../../../context/ThemeContext';
import {
  Settings,
  UserPlus,
  UserMinus,
  Mail,
  Globe,
  Save,
  ShieldAlert,
  CheckCircle2,
  Trash2
} from 'lucide-react';

export default function AdminSettingsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Branding & Configuration state
  const [platformName, setPlatformName] = useState('NovaHire AI');
  const [brandingLogoUrl, setBrandingLogoUrl] = useState('');

  // SMTP Settings state
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');

  // Email Templates state
  const [emailTemplateRegister, setEmailTemplateRegister] = useState('');
  const [emailTemplateReset, setEmailTemplateReset] = useState('');

  // Administrators list state
  const [admins, setAdmins] = useState<any[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);

  useEffect(() => {
    loadSettingsAndAdmins();
  }, []);

  const loadSettingsAndAdmins = async () => {
    setLoading(true);
    try {
      const [settingsRes, usersRes] = await Promise.all([
        adminApi.getSettings(),
        adminApi.listUsers()
      ]);

      if (settingsRes.settings) {
        setPlatformName(settingsRes.settings.platformName);
        setBrandingLogoUrl(settingsRes.settings.brandingLogoUrl || '');
        setSmtpHost(settingsRes.settings.smtpHost || '');
        setSmtpPort(settingsRes.settings.smtpPort || 587);
        setSmtpUser(settingsRes.settings.smtpUser || '');
        setSmtpPass(settingsRes.settings.smtpPass || '');
        setEmailTemplateRegister(settingsRes.settings.emailTemplateRegister || '');
        setEmailTemplateReset(settingsRes.settings.emailTemplateReset || '');
      }

      // Filter administrators
      const adminUsers = (usersRes.users || []).filter((u: any) => u.role === 'ADMIN');
      setAdmins(adminUsers);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve administrative settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    try {
      const payload = {
        platformName,
        brandingLogoUrl,
        smtpHost,
        smtpPort: parseInt(smtpPort as any) || 587,
        smtpUser,
        smtpPass,
        emailTemplateRegister,
        emailTemplateReset
      };

      await adminApi.updateSettings(payload);
      setSuccess('Branding, SMTP, and template settings saved successfully.');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to save system settings.');
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail) return;
    setAddingAdmin(true);

    try {
      await adminApi.addAdmin({
        email: newAdminEmail,
        password: newAdminPassword,
        fullName: newAdminName
      });

      alert(`Admin role assigned successfully to ${newAdminEmail}.`);
      setNewAdminEmail('');
      setNewAdminPassword('');
      setNewAdminName('');
      
      // Reload admins
      const usersRes = await adminApi.listUsers();
      setAdmins((usersRes.users || []).filter((u: any) => u.role === 'ADMIN'));
    } catch (err: any) {
      alert(`Failed to add admin: ${err.message}`);
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleRemoveAdmin = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to revoke administrator permissions for ${email}?`)) {
      return;
    }

    try {
      await adminApi.removeAdmin(id);
      alert('Administrator permissions revoked.');
      
      // Reload admins
      const usersRes = await adminApi.listUsers();
      setAdmins((usersRes.users || []).filter((u: any) => u.role === 'ADMIN'));
    } catch (err: any) {
      alert(`Failed to revoke admin: ${err.message}`);
    }
  };

  if (loading && admins.length === 0) {
    return (
      <div className="min-h-[450px] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black tracking-tight">System Settings</h1>
        <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Manage platform administrators, branding titles, email notification templates, and SMTP credentials.
        </p>
      </div>

      {success && (
        <div className={`p-4 rounded-2xl border flex items-start gap-3 text-xs font-semibold ${
          isDark ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className={`p-4 rounded-2xl border text-xs font-semibold ${
          isDark ? 'bg-rose-950/20 border-rose-900/30 text-rose-450' : 'bg-rose-50 border-rose-200 text-rose-600'
        }`}>
          <span>{error}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* SETTINGS FORM - Branding & SMTP & Templates */}
        <form onSubmit={handleSaveSettings} className="lg:col-span-2 space-y-6">
          
          {/* BRANDING CONFIGURATION */}
          <div className={`border p-6 rounded-2xl space-y-4 ${
            isDark ? 'bg-[#111111] border-[#2A2A2A]' : 'bg-[#FFFFFF] border-[#E5E7EB] shadow-sm'
          }`}>
            <h3 className="text-xs font-black uppercase tracking-wider text-purple-500 flex items-center gap-2">
              <Globe size={14} />
              <span>Branding & General Settings</span>
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Platform Name</label>
                <input
                  type="text"
                  required
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs outline-none border focus:ring-1 focus:ring-purple-500 ${
                    isDark ? 'bg-slate-950 border-[#2A2A2A]' : 'bg-slate-50 border-[#E5E7EB]'
                  }`}
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Logo URL</label>
                <input
                  type="text"
                  value={brandingLogoUrl}
                  onChange={(e) => setBrandingLogoUrl(e.target.value)}
                  placeholder="e.g. https://domain.com/logo.png"
                  className={`w-full px-4 py-2.5 rounded-xl text-xs outline-none border focus:ring-1 focus:ring-purple-500 ${
                    isDark ? 'bg-slate-950 border-[#2A2A2A]' : 'bg-slate-50 border-[#E5E7EB]'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* SMTP CREDENTIALS */}
          <div className={`border p-6 rounded-2xl space-y-4 ${
            isDark ? 'bg-[#111111] border-[#2A2A2A]' : 'bg-[#FFFFFF] border-[#E5E7EB] shadow-sm'
          }`}>
            <h3 className="text-xs font-black uppercase tracking-wider text-purple-500 flex items-center gap-2">
              <Mail size={14} />
              <span>Configure SMTP credentials</span>
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">SMTP Host</label>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  placeholder="smtp.mailgun.org"
                  className={`w-full px-4 py-2.5 rounded-xl text-xs outline-none border focus:ring-1 focus:ring-purple-500 ${
                    isDark ? 'bg-slate-950 border-[#2A2A2A]' : 'bg-slate-50 border-[#E5E7EB]'
                  }`}
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">SMTP Port</label>
                <input
                  type="number"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(parseInt(e.target.value) || 587)}
                  placeholder="587"
                  className={`w-full px-4 py-2.5 rounded-xl text-xs outline-none border focus:ring-1 focus:ring-purple-500 ${
                    isDark ? 'bg-slate-950 border-[#2A2A2A]' : 'bg-slate-50 border-[#E5E7EB]'
                  }`}
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">SMTP Username</label>
                <input
                  type="text"
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  placeholder="postmaster@yourdomain.com"
                  className={`w-full px-4 py-2.5 rounded-xl text-xs outline-none border focus:ring-1 focus:ring-purple-500 ${
                    isDark ? 'bg-slate-950 border-[#2A2A2A]' : 'bg-slate-50 border-[#E5E7EB]'
                  }`}
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">SMTP Password</label>
                <input
                  type="password"
                  value={smtpPass}
                  onChange={(e) => setSmtpPass(e.target.value)}
                  placeholder="••••••••••••"
                  className={`w-full px-4 py-2.5 rounded-xl text-xs outline-none border focus:ring-1 focus:ring-purple-500 ${
                    isDark ? 'bg-slate-950 border-[#2A2A2A]' : 'bg-slate-50 border-[#E5E7EB]'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* EMAIL TEMPLATES */}
          <div className={`border p-6 rounded-2xl space-y-4 ${
            isDark ? 'bg-[#111111] border-[#2A2A2A]' : 'bg-[#FFFFFF] border-[#E5E7EB] shadow-sm'
          }`}>
            <h3 className="text-xs font-black uppercase tracking-wider text-purple-500 flex items-center gap-2">
              <Mail size={14} />
              <span>Configure Email Notification Templates</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Registration Welcome template</label>
                <textarea
                  value={emailTemplateRegister}
                  onChange={(e) => setEmailTemplateRegister(e.target.value)}
                  placeholder="Welcome to NovaHire AI! Confirm your account registration details below..."
                  rows={3}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs outline-none border focus:ring-1 focus:ring-purple-500 ${
                    isDark ? 'bg-slate-950 border-[#2A2A2A]' : 'bg-slate-50 border-[#E5E7EB]'
                  }`}
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Reset Password template</label>
                <textarea
                  value={emailTemplateReset}
                  onChange={(e) => setEmailTemplateReset(e.target.value)}
                  placeholder="Click the following secure link to reset your password..."
                  rows={3}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs outline-none border focus:ring-1 focus:ring-purple-500 ${
                    isDark ? 'bg-slate-950 border-[#2A2A2A]' : 'bg-slate-50 border-[#E5E7EB]'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* SAVE BUTTON */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-purple-600/25"
            >
              <Save size={13} />
              <span>Save System Config</span>
            </button>
          </div>

        </form>

        {/* SIDE COLUMN - Manage Administrators */}
        <div className="space-y-6">
          
          {/* ADD ADMINISTRATOR FORM */}
          <div className={`border p-6 rounded-2xl space-y-4 ${
            isDark ? 'bg-[#111111] border-[#2A2A2A]' : 'bg-[#FFFFFF] border-[#E5E7EB] shadow-sm'
          }`}>
            <h3 className="text-xs font-black uppercase tracking-wider text-purple-500 flex items-center gap-2">
              <UserPlus size={14} />
              <span>Add Administrator</span>
            </h3>

            <form onSubmit={handleAddAdmin} className="space-y-3.5">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className={`w-full px-3 py-2 rounded-xl text-xs outline-none border focus:ring-1 focus:ring-purple-500 ${
                    isDark ? 'bg-slate-950 border-[#2A2A2A]' : 'bg-slate-50 border-[#E5E7EB]'
                  }`}
                />
              </div>
              
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="e.g. admin@novahire.com"
                  className={`w-full px-3 py-2 rounded-xl text-xs outline-none border focus:ring-1 focus:ring-purple-500 ${
                    isDark ? 'bg-slate-950 border-[#2A2A2A]' : 'bg-slate-50 border-[#E5E7EB]'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="At least 8 characters..."
                  className={`w-full px-3 py-2 rounded-xl text-xs outline-none border focus:ring-1 focus:ring-purple-500 ${
                    isDark ? 'bg-slate-950 border-[#2A2A2A]' : 'bg-slate-50 border-[#E5E7EB]'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={addingAdmin}
                className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 dark:bg-purple-650 dark:hover:bg-purple-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {addingAdmin ? 'Adding...' : 'Register Administrator'}
              </button>
            </form>
          </div>

          {/* ADMINISTRATORS LIST */}
          <div className={`border p-6 rounded-2xl space-y-4 ${
            isDark ? 'bg-[#111111] border-[#2A2A2A]' : 'bg-[#FFFFFF] border-[#E5E7EB] shadow-sm'
          }`}>
            <h3 className="text-xs font-black uppercase tracking-wider text-purple-500 flex items-center gap-2">
              <Settings size={14} />
              <span>Current Administrators</span>
            </h3>

            <div className="divide-y divide-[#E5E7EB] dark:divide-[#2A2A2A] max-h-[300px] overflow-y-auto">
              {admins.map((adm) => (
                <div key={adm.id} className="py-3 flex justify-between items-center gap-2 text-left">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold leading-relaxed">
                      {adm.profile?.fullName || 'System Administrator'}
                    </p>
                    <p className="text-[10px] text-slate-500 font-semibold">{adm.email}</p>
                  </div>
                  
                  <button
                    onClick={() => handleRemoveAdmin(adm.id, adm.email)}
                    className="p-1.5 rounded-lg border hover:bg-rose-950/20 border-[#E5E7EB] dark:border-[#2A2A2A] hover:border-rose-900/30 cursor-pointer"
                    title="Remove Admin Permissions"
                  >
                    <UserMinus size={13} className="text-rose-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
