import React, { useState, useRef } from 'react';
import { ShieldCheck, User, Bell, Lock, HelpCircle, Save, Upload, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface ProfileData {
  name: string;
  email: string;
  municipality: string;
  profilePic: string;
}

interface SettingsTabProps {
  profile: ProfileData;
  onProfileChange: (updated: ProfileData) => void;
}

export default function SettingsTab({ profile, onProfileChange }: SettingsTabProps) {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [municipality, setMunicipality] = useState(profile.municipality);
  const [profilePic, setProfilePic] = useState(profile.profilePic);
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [logsAutoExport, setLogsAutoExport] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setProfilePic(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onProfileChange({
      name,
      email,
      municipality,
      profilePic
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  // Pre-configured official agency avatars as fast presets
  const avatarPresets = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCqb4VAAHoINK3W3GVHbfa6yA-nZOfrPE8tPIGvAPkCAV6P5-ZUJtDlPrPBVLfE72vz0WEMPf6mgFrPUSEs66oVJJb3kfG_Wvc6JWHHBZ57rNTIAt4DVTyfe0sTOvGLFrBo8Szg0k9bdpGeNMjXTaURWjPSfpaRopxHxq4TY2eLCLMeNHq_Zl-EaNLBm1Uf0C0MvUMMt4l1btm8nbnipP55c4dTy0b__57RpzOk57ZrVQ1tYFFpa6KfEVufyERDCHEnVbexGUGG7q9H',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150'
  ];

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Account Settings</h2>
        <p className="font-body-md text-body-md text-on-surface-variant font-medium mt-1">Manage credentials, audit trail preferences, and regional municipal profile details.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-outline-variant p-6 md:p-8">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-outline-variant/50">
            <div className="flex items-center gap-4">
              <div className="relative group w-18 h-18 rounded-full overflow-hidden border-2 border-primary/20 shadow-md">
                <img 
                  className="w-full h-full object-cover" 
                  alt="MSWDO Official Portrait"
                  referrerPolicy="no-referrer"
                  src={profilePic} 
                />
                <button
                  type="button"
                  onClick={triggerFileSelect}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white cursor-pointer"
                  title="Upload portrait photo"
                >
                  <Upload className="w-5 h-5" />
                </button>
              </div>
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-secondary-container text-on-secondary-container border border-primary/10 shadow-sm">
                  Verified Official
                </span>
                <h3 className="font-headline-sm text-on-surface font-bold mt-1.5">{name || 'MSWDO Head Administrator'}</h3>
                <p className="text-xs text-on-surface-variant font-medium">MSWDO Administrator Authority Level</p>
              </div>
            </div>

            {/* Custom file uploader button */}
            <div className="space-y-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={triggerFileSelect}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-on-surface-variant border border-outline-variant text-xs font-bold rounded-lg flex items-center gap-1.5 focus:outline-none transition-all cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-primary" />
                  Upload Custom Portrait
                </button>
                <div className="flex items-center gap-1">
                  {avatarPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setProfilePic(preset)}
                      className={`w-7 h-7 rounded-full overflow-hidden border border-slate-300 hover:scale-105 transition-transform focus:outline-none ${profilePic === preset ? 'ring-2 ring-primary border-transparent' : ''}`}
                    >
                      <img src={preset} className="w-full h-full object-cover" alt="preset avatar" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant" htmlFor="adminName">Full Name / Designation</label>
              <input 
                id="adminName"
                className="w-full p-3 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:outline-none bg-surface-bright text-on-surface font-semibold"
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant" htmlFor="adminEmail">Official Email</label>
              <input 
                id="adminEmail"
                className="w-full p-3 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:outline-none bg-surface-bright text-on-surface font-semibold"
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant" htmlFor="adminMuni">Office Branch</label>
              <input 
                id="adminMuni"
                className="w-full p-3 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:outline-none bg-surface-bright text-on-surface font-semibold"
                type="text" 
                value={municipality} 
                onChange={(e) => setMunicipality(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Security Level</label>
              <div className="p-3 bg-surface-container rounded-lg border border-outline-variant/30 text-on-surface text-xs font-bold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-secondary" />
                <span>Level 3 Administrative Access Enabled</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-outline-variant/50 space-y-4">
            <h4 className="font-bold text-sm text-primary">System Preferences</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary accent-primary" 
                />
                <span className="text-sm font-semibold text-on-surface flex items-center gap-1">
                  <Bell className="w-4 h-4 text-outline" /> Enable critical budget alerts
                </span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={logsAutoExport}
                  onChange={(e) => setLogsAutoExport(e.target.checked)}
                  className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary accent-primary" 
                />
                <span className="text-sm font-semibold text-on-surface flex items-center gap-1">
                  <Lock className="w-4 h-4 text-outline" /> Auto-encrypt generated audit log files
                </span>
              </label>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <button 
              type="submit"
              className="px-6 py-3 bg-primary text-on-primary font-bold text-xs rounded-lg shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 focus:outline-none cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
            {isSaved && (
              <span className="text-green-700 font-bold text-xs flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                <ShieldCheck className="w-4 h-4" /> Configuration stored successfully
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
