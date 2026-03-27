import { useEffect, useState } from "react";
import {
  getProfile,
  getHealth,
  updateName,
  updateEmail,
  changePassword
} from "../../services/api";
import { 
  User, 
  Mail, 
  Lock, 
  Activity, 
  ChevronRight, 
  CheckCircle2, 
  RefreshCw,
  Settings
} from 'lucide-react';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");

  // 🔐 Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileData = await getProfile();
        const healthData = await getHealth();

        setProfile(profileData);
        setHealth(healthData);

        setNewName(profileData.name);
        setNewEmail(profileData.email);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleUpdateName = async () => {
    try {
      await updateName(newName);
      const updatedProfile = await getProfile();
      setProfile(updatedProfile);
      alert("Name updated successfully");
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update name");
    }
  };

  const handleUpdateEmail = async () => {
    try {
      await updateEmail(newEmail);
      const updatedProfile = await getProfile();
      setProfile(updatedProfile);
      alert("Email updated successfully");
    } catch (error) {
      console.error("Update failed:", error);
      alert(error.message);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword
      });
      alert("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] flex-col gap-3">
        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER */}
      <div className="text-center md:text-left space-y-1">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center justify-center md:justify-start gap-3">
          <Settings className="text-blue-600" size={28} /> Account Settings
        </h1>
        <p className="text-slate-500 font-medium">Manage your personal information and security</p>
      </div>

      <div className="flex flex-wrap gap-8">
        {/* ================= PROFILE CARD ================= */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex-1 min-w-[320px] space-y-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <User size={20} />
            </div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider">Personal Profile</h2>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-bold uppercase">Current Name</span>
              <span className="text-slate-900 font-bold">{profile?.name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-bold uppercase">Current Email</span>
              <span className="text-slate-900 font-bold">{profile?.email}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-black text-slate-400 ml-1">Update Name</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white px-4 py-2.5 rounded-xl outline-none transition-all font-bold text-slate-700"
                />
                <button
                  onClick={handleUpdateName}
                  className="bg-blue-600 text-white px-5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100 active:scale-95"
                >
                  Save
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-black text-slate-400 ml-1">Update Email</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-green-500 focus:bg-white px-4 py-2.5 rounded-xl outline-none transition-all font-bold text-slate-700"
                />
                <button
                  onClick={handleUpdateEmail}
                  className="bg-green-500 text-white px-5 rounded-xl font-bold hover:bg-green-600 transition shadow-lg shadow-green-100 active:scale-95"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= HEALTH CARD ================= */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 w-full lg:w-80 space-y-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
              <Activity size={20} />
            </div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider">Health Info</h2>
          </div>

          <div className="space-y-4">
            {[
              { label: "Age", value: health?.age, unit: "yrs" },
              { label: "Gender", value: health?.gender, unit: "" },
              { label: "Height", value: health?.height_cm, unit: "cm" },
              { label: "Weight", value: health?.weight_kg, unit: "kg" },
            ].map((stat, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl group hover:bg-slate-100 transition-colors">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                <span className="text-sm font-black text-slate-800">
                  {stat.value || "—"} <span className="text-[10px] text-slate-400 ml-0.5">{stat.unit}</span>
                </span>
              </div>
            ))}
          </div>

          <div className="p-4 bg-orange-50/50 rounded-2xl border border-dashed border-orange-200">
            <p className="text-[10px] text-orange-600 font-bold text-center uppercase tracking-tighter">
              Metrics are synced from your latest body assessment
            </p>
          </div>
        </div>

        {/* ================= PASSWORD CARD ================= */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex-1 min-w-[320px] space-y-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
            <div className="p-2 bg-red-50 text-red-600 rounded-xl">
              <Lock size={20} />
            </div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider">Security</h2>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-black text-slate-400 ml-1">Current Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-red-500 focus:bg-white px-4 py-3 rounded-xl outline-none transition-all font-bold"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-400 ml-1">New Password</label>
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-red-500 focus:bg-white px-4 py-3 rounded-xl outline-none transition-all font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-400 ml-1">Confirm New</label>
                <input
                  type="password"
                  placeholder="Confirm New"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-red-500 focus:bg-white px-4 py-3 rounded-xl outline-none transition-all font-bold"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleChangePassword}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-xl shadow-slate-200 hover:bg-red-600 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            Update Password <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;