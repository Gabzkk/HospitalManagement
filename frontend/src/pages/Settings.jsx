import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Lock, Bell, Save, Check } from 'lucide-react';
import clsx from 'clsx';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'preferences', label: 'Preferences', icon: Bell },
  { id: 'security', label: 'Security', icon: Lock },
];

const Settings = () => {
  const { user, activeRole } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    department: '',
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    darkMode: false,
    language: 'en',
  });

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const renderProfile = () => (
    <form onSubmit={handleSave} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Full Name</label>
          <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Email</label>
          <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            className="w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Phone</label>
          <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            placeholder="e.g. +1 555-0100"
            className="w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Department</label>
          <input value={profile.department} onChange={(e) => setProfile({ ...profile, department: e.target.value })}
            placeholder="e.g. Cardiology"
            className="w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Role</label>
        <div className="h-10 rounded-lg border border-gray-200 bg-gray-100 px-3 flex items-center text-sm text-gray-500 capitalize">
          {activeRole?.toLowerCase()}
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" className="flex items-center gap-2 h-10 bg-primary-950 text-white rounded-lg px-5 text-sm font-semibold hover:bg-primary-900 transition-colors">
          <Save className="h-4 w-4" /> Save Changes
        </button>
      </div>
    </form>
  );

  const renderPreferences = () => (
    <form onSubmit={handleSave} className="space-y-5">
      {[
        { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive email notifications for appointments and updates' },
        { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Receive text messages for urgent alerts' },
        { key: 'darkMode', label: 'Dark Mode', desc: 'Use dark theme across the application' },
      ].map(({ key, label, desc }) => (
        <div key={key} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
          <div>
            <p className="text-sm font-semibold text-gray-900">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
          </div>
          <button type="button" onClick={() => setPreferences({ ...preferences, [key]: !preferences[key] })}
            className={clsx("relative h-6 w-11 rounded-full transition-colors", preferences[key] ? "bg-primary-600" : "bg-gray-200")}>
            <span className={clsx("absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", preferences[key] && "translate-x-5")} />
          </button>
        </div>
      ))}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Language</label>
        <select value={preferences.language} onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
          className="w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="tl">Filipino</option>
        </select>
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" className="flex items-center gap-2 h-10 bg-primary-950 text-white rounded-lg px-5 text-sm font-semibold hover:bg-primary-900 transition-colors">
          <Save className="h-4 w-4" /> Save Preferences
        </button>
      </div>
    </form>
  );

  const renderSecurity = () => (
    <form onSubmit={handleSave} className="space-y-5">
      {[
        { key: 'currentPassword', label: 'Current Password', placeholder: 'Enter current password' },
        { key: 'newPassword', label: 'New Password', placeholder: 'Enter new password' },
        { key: 'confirmPassword', label: 'Confirm New Password', placeholder: 'Confirm new password' },
      ].map(({ key, label, placeholder }) => (
        <div key={key}>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">{label}</label>
          <input type="password" value={security[key]} onChange={(e) => setSecurity({ ...security, [key]: e.target.value })}
            placeholder={placeholder}
            className="w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
      ))}
      <div className="flex justify-end pt-2">
        <button type="submit" className="flex items-center gap-2 h-10 bg-primary-950 text-white rounded-lg px-5 text-sm font-semibold hover:bg-primary-900 transition-colors">
          <Lock className="h-4 w-4" /> Update Password
        </button>
      </div>
    </form>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account settings and preferences.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 justify-center",
              activeTab === tab.id ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
            )}>
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        {saved && (
          <div className="flex items-center gap-2 mb-5 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
            <Check className="h-4 w-4" /> Changes saved successfully!
          </div>
        )}
        {activeTab === 'profile' && renderProfile()}
        {activeTab === 'preferences' && renderPreferences()}
        {activeTab === 'security' && renderSecurity()}
      </div>
    </div>
  );
};

export default Settings;
