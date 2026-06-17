import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, User, Bell, Shield, Palette, Zap, Globe, LogOut,
  Camera, ChevronRight, Check, Moon, Sun, Monitor, Volume2, VolumeX,
  Mail, Smartphone, Key, Trash2, Download, ToggleLeft, ToggleRight,
  AlertCircle,
} from 'lucide-react';

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

// ── Reusable sub-components ──────────────────────────────────────────────────

function SectionHeader({ icon: Icon, label, color = 'indigo' }) {
  const c = {
    indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-400' },
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
    rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400' },
  }[color];

  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className={`w-7 h-7 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center`}>
        <Icon size={14} className={c.text} />
      </div>
      <p className="section-title">{label}</p>
    </div>
  );
}

function Toggle({ value, onChange, id }) {
  return (
    <button
      id={id}
      onClick={() => onChange(!value)}
      className={`relative w-10 h-5.5 rounded-full transition-all duration-300 shrink-0
        ${value ? 'bg-indigo-500' : 'bg-white/[0.08] border border-white/[0.1]'}`}
      style={{ height: '22px' }}
    >
      <motion.div
        animate={{ x: value ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="absolute top-0.5 w-4 h-4 rounded-full bg-white"
        style={{ boxShadow: value ? '0 0 8px rgba(99,102,241,0.6)' : 'none' }}
      />
    </button>
  );
}

function SettingRow({ label, description, children, danger }) {
  return (
    <div className={`flex items-center justify-between py-3.5 border-b last:border-0 transition-colors
      ${danger ? 'border-rose-500/10' : 'border-white/[0.04]'}`}
    >
      <div className="flex-1 min-w-0 pr-4">
        <p className={`text-sm font-medium ${danger ? 'text-rose-400' : 'text-slate-200'}`}>{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</p>}
      </div>
      {children}
    </div>
  );
}

// ── Sidebar navigation ───────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'profile', label: 'Profile', icon: User, color: 'indigo' },
  { id: 'notifications', label: 'Notifications', icon: Bell, color: 'cyan' },
  { id: 'appearance', label: 'Appearance', icon: Palette, color: 'amber' },
  { id: 'privacy', label: 'Privacy', icon: Shield, color: 'emerald' },
  { id: 'account', label: 'Account', icon: Key, color: 'rose' },
];

// ── Main component ───────────────────────────────────────────────────────────

export default function SettingsView() {
  const [activeSection, setActiveSection] = useState('profile');

  // Profile state
  const [profile, setProfile] = useState({
    name: 'vishw',
    email: 'rk@example.com',
    role: 'Staff SWE Candidate',
    bio: 'Aspiring Staff Software Engineer with focus on distributed systems.',
    location: 'Bengaluru, India',
    timezone: 'Asia/Kolkata',
  });
  const [profileSaved, setProfileSaved] = useState(false);

  // Notification settings
  const [notifSettings, setNotifSettings] = useState({
    emailDigest: true,
    pushAlerts: true,
    atsResults: true,
    interviewReminders: true,
    weeklyReport: true,
    milestones: true,
    sound: true,
  });

  // Appearance
  const [theme, setTheme] = useState('dark');
  const [accentColor, setAccentColor] = useState('indigo');
  const [compactMode, setCompactMode] = useState(false);
  const [animations, setAnimations] = useState(true);

  // Privacy
  const [privacySettings, setPrivacySettings] = useState({
    shareProgress: false,
    analyticsOptIn: true,
    dataSaving: true,
  });

  const handleSaveProfile = () => {
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const accentColors = [
    { id: 'indigo', color: '#6366f1', label: 'Indigo' },
    { id: 'cyan', color: '#06b6d4', label: 'Cyan' },
    { id: 'emerald', color: '#10b981', label: 'Emerald' },
    { id: 'violet', color: '#8b5cf6', label: 'Violet' },
    { id: 'rose', color: '#f43f5e', label: 'Rose' },
    { id: 'amber', color: '#f59e0b', label: 'Amber' },
  ];

  const themes = [
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <div className="p-6 pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
          <Settings size={18} className="text-indigo-400" />
        </div>
        <div>
          <p className="section-title mb-0.5">Preferences</p>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
        </div>
      </motion.div>

      <div className="flex gap-5">
        {/* Left nav */}
        <motion.div
          custom={0} variants={cardVariants} initial="hidden" animate="visible"
          className="w-52 shrink-0 glass-card p-2 self-start sticky top-6"
        >
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const isActive = activeSection === s.id;
            return (
              <button
                key={s.id}
                id={`settings-nav-${s.id}`}
                onClick={() => setActiveSection(s.id)}
                className={`sidebar-nav-item w-full ${isActive ? 'active' : ''}`}
              >
                <Icon size={15} className={isActive ? 'text-indigo-400' : 'text-slate-500'} />
                <span className="flex-1 text-left">{s.label}</span>
                {isActive && <ChevronRight size={12} className="text-indigo-400" />}
              </button>
            );
          })}

          <div className="border-t border-white/[0.05] mt-2 pt-2">
            <button className="sidebar-nav-item w-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/5">
              <LogOut size={15} />
              <span>Sign out</span>
            </button>
          </div>
        </motion.div>

        {/* Right content */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* ── PROFILE ── */}
          {activeSection === 'profile' && (
            <motion.div key="profile" custom={1} variants={cardVariants} initial="hidden" animate="visible"
              className="glass-card p-6"
            >
              <SectionHeader icon={User} label="Profile Settings" color="indigo" />

              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6 pb-5 border-b border-white/[0.05]">
                <div className="relative group">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/60 to-cyan-500/40 border border-indigo-500/30 flex items-center justify-center text-xl font-bold text-white">
                    KR
                  </div>
                  <button className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={16} className="text-white" />
                  </button>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">{profile.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{profile.role}</p>
                  <button className="cyber-btn text-xs mt-2 py-1.5">Change Avatar</button>
                </div>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'profile-name', label: 'Full Name', key: 'name', type: 'text' },
                  { id: 'profile-email', label: 'Email', key: 'email', type: 'email' },
                  { id: 'profile-role', label: 'Target Role', key: 'role', type: 'text' },
                  { id: 'profile-location', label: 'Location', key: 'location', type: 'text' },
                ].map(({ id, label, key, type }) => (
                  <div key={key}>
                    <label className="text-xs font-medium text-slate-400 mb-1.5 block">{label}</label>
                    <input
                      id={id}
                      type={type}
                      value={profile[key]}
                      onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-slate-200
                        focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all duration-200"
                    />
                  </div>
                ))}

                <div className="col-span-2">
                  <label className="text-xs font-medium text-slate-400 mb-1.5 block">Bio</label>
                  <textarea
                    id="profile-bio"
                    rows={3}
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-slate-200
                      focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all duration-200 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-5">
                <motion.button
                  id="save-profile"
                  onClick={handleSaveProfile}
                  className="cyber-btn-primary px-6 py-2.5 rounded-xl flex items-center gap-2"
                  whileTap={{ scale: 0.97 }}
                >
                  {profileSaved ? <><Check size={15} /> Saved!</> : 'Save Changes'}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {activeSection === 'notifications' && (
            <motion.div key="notif" custom={1} variants={cardVariants} initial="hidden" animate="visible"
              className="glass-card p-6"
            >
              <SectionHeader icon={Bell} label="Notification Preferences" color="cyan" />

              <div className="space-y-0.5">
                {[
                  { key: 'emailDigest', icon: Mail, label: 'Email digest', description: 'Receive a daily summary email of your activity.' },
                  { key: 'pushAlerts', icon: Smartphone, label: 'Push notifications', description: 'Real-time alerts for important events.' },
                  { key: 'atsResults', icon: Zap, label: 'ATS scan results', description: 'Get notified when your ATS analysis is complete.' },
                  { key: 'interviewReminders', icon: Bell, label: 'Interview reminders', description: 'Reminders before scheduled mock interview sessions.' },
                  { key: 'weeklyReport', icon: Globe, label: 'Weekly progress report', description: 'Summary of your progress every Monday.' },
                  { key: 'milestones', icon: Zap, label: 'Achievement milestones', description: 'Celebrate streaks and key achievements.' },
                  { key: 'sound', icon: Volume2, label: 'Notification sounds', description: 'Play a sound for in-app notifications.' },
                ].map(({ key, icon: Icon, label, description }) => (
                  <SettingRow key={key} label={label} description={description}>
                    <Toggle
                      id={`notif-${key}`}
                      value={notifSettings[key]}
                      onChange={(v) => setNotifSettings({ ...notifSettings, [key]: v })}
                    />
                  </SettingRow>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── APPEARANCE ── */}
          {activeSection === 'appearance' && (
            <motion.div key="appearance" custom={1} variants={cardVariants} initial="hidden" animate="visible"
              className="glass-card p-6 space-y-6"
            >
              <SectionHeader icon={Palette} label="Appearance" color="amber" />

              {/* Theme selector */}
              <div>
                <p className="text-xs font-medium text-slate-400 mb-3">Theme</p>
                <div className="grid grid-cols-3 gap-3">
                  {themes.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      id={`theme-${id}`}
                      onClick={() => setTheme(id)}
                      className={`glass-card p-4 flex flex-col items-center gap-2 border transition-all duration-200
                        ${theme === id ? 'border-indigo-500/50 bg-indigo-500/10' : 'border-white/[0.05] hover:border-white/[0.1]'}`}
                    >
                      <Icon size={18} className={theme === id ? 'text-indigo-400' : 'text-slate-500'} />
                      <span className={`text-xs font-medium ${theme === id ? 'text-indigo-300' : 'text-slate-500'}`}>{label}</span>
                      {theme === id && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent color */}
              <div>
                <p className="text-xs font-medium text-slate-400 mb-3">Accent Color</p>
                <div className="flex gap-3 flex-wrap">
                  {accentColors.map(({ id, color, label }) => (
                    <button
                      key={id}
                      id={`accent-${id}`}
                      onClick={() => setAccentColor(id)}
                      title={label}
                      className="relative w-8 h-8 rounded-full transition-all duration-200"
                      style={{ backgroundColor: color, boxShadow: accentColor === id ? `0 0 12px ${color}80` : 'none' }}
                    >
                      {accentColor === id && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check size={14} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Other options */}
              <div className="border-t border-white/[0.05] pt-5 space-y-0.5">
                <SettingRow label="Compact mode" description="Reduce spacing and padding for a denser layout.">
                  <Toggle id="compact-mode" value={compactMode} onChange={setCompactMode} />
                </SettingRow>
                <SettingRow label="Animations" description="Enable micro-animations and page transitions.">
                  <Toggle id="animations-toggle" value={animations} onChange={setAnimations} />
                </SettingRow>
              </div>
            </motion.div>
          )}

          {/* ── PRIVACY ── */}
          {activeSection === 'privacy' && (
            <motion.div key="privacy" custom={1} variants={cardVariants} initial="hidden" animate="visible"
              className="glass-card p-6"
            >
              <SectionHeader icon={Shield} label="Privacy & Data" color="emerald" />

              <div className="space-y-0.5 mb-6">
                <SettingRow label="Share progress publicly"
                  description="Allow others to see your readiness scores and milestones on leaderboards."
                >
                  <Toggle id="privacy-share"
                    value={privacySettings.shareProgress}
                    onChange={(v) => setPrivacySettings({ ...privacySettings, shareProgress: v })}
                  />
                </SettingRow>
                <SettingRow label="Analytics opt-in"
                  description="Help us improve by sharing anonymous usage analytics."
                >
                  <Toggle id="privacy-analytics"
                    value={privacySettings.analyticsOptIn}
                    onChange={(v) => setPrivacySettings({ ...privacySettings, analyticsOptIn: v })}
                  />
                </SettingRow>
                <SettingRow label="Smart data saving"
                  description="Compress API responses to reduce data usage on slower networks."
                >
                  <Toggle id="privacy-datasaving"
                    value={privacySettings.dataSaving}
                    onChange={(v) => setPrivacySettings({ ...privacySettings, dataSaving: v })}
                  />
                </SettingRow>
              </div>

              {/* Data actions */}
              <div className="border-t border-white/[0.05] pt-5 space-y-3">
                <p className="text-xs font-medium text-slate-400 mb-3">Data Management</p>
                <button id="export-data"
                  className="flex items-center gap-2 cyber-btn w-full py-2.5 justify-start"
                >
                  <Download size={14} /> Export all my data
                </button>
                <button id="delete-data"
                  className="flex items-center gap-2 w-full py-2.5 px-4 rounded-lg text-sm font-medium border transition-all duration-200
                    bg-rose-500/5 border-rose-500/20 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30"
                >
                  <Trash2 size={14} /> Delete all my data
                </button>
              </div>
            </motion.div>
          )}

          {/* ── ACCOUNT ── */}
          {activeSection === 'account' && (
            <motion.div key="account" custom={1} variants={cardVariants} initial="hidden" animate="visible"
              className="space-y-4"
            >
              {/* Security */}
              <div className="glass-card p-6">
                <SectionHeader icon={Key} label="Security" color="rose" />
                <div className="space-y-0.5">
                  <SettingRow label="Two-factor authentication"
                    description="Add an extra layer of security to your account."
                  >
                    <button className="cyber-btn text-xs py-1.5 px-3">Enable 2FA</button>
                  </SettingRow>
                  <SettingRow label="Change password"
                    description="Last changed 90 days ago."
                  >
                    <button className="cyber-btn text-xs py-1.5 px-3">Update</button>
                  </SettingRow>
                  <SettingRow label="Active sessions"
                    description="2 devices currently signed in."
                  >
                    <button className="cyber-btn text-xs py-1.5 px-3">Manage</button>
                  </SettingRow>
                  <SettingRow label="API access token"
                    description="Use your personal token to connect external tools."
                  >
                    <button className="cyber-btn text-xs py-1.5 px-3">Generate</button>
                  </SettingRow>
                </div>
              </div>

              {/* Subscription */}
              <div className="glass-card p-6 border border-indigo-500/20"
                style={{ boxShadow: '0 0 20px rgba(99,102,241,0.06)' }}
              >
                <SectionHeader icon={Zap} label="Subscription" color="indigo" />
                <div className="flex items-center justify-between p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 mb-4">
                  <div>
                    <p className="text-sm font-bold text-white">Pro Plan</p>
                    <p className="text-xs text-slate-400 mt-0.5">Renews Jun 17, 2027 · $19/month</p>
                  </div>
                  <span className="badge-mastered">Active</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button className="cyber-btn py-2.5 text-xs flex items-center justify-center gap-1.5">Manage plan</button>
                  <button className="cyber-btn py-2.5 text-xs flex items-center justify-center gap-1.5">Billing history</button>
                </div>
              </div>

              {/* Danger zone */}
              <div className="glass-card p-6 border border-rose-500/15">
                <div className="flex items-center gap-2.5 mb-4">
                  <AlertCircle size={15} className="text-rose-400" />
                  <p className="section-title text-rose-500">Danger Zone</p>
                </div>
                <SettingRow label="Deactivate account" description="Temporarily disable your account." danger>
                  <button className="cyber-btn text-xs py-1.5 px-3 border-rose-500/30 text-rose-400 bg-rose-500/5 hover:bg-rose-500/10">
                    Deactivate
                  </button>
                </SettingRow>
                <SettingRow label="Delete account permanently"
                  description="This action is irreversible. All your data will be removed."
                  danger
                >
                  <button id="delete-account"
                    className="cyber-btn text-xs py-1.5 px-3 border-rose-500/30 text-rose-400 bg-rose-500/5 hover:bg-rose-500/10"
                  >
                    Delete
                  </button>
                </SettingRow>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
