import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../../services/api";
import { AppContext } from "../../context/AppContext";
import { Mail, Lock, Loader2, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { setAuthToken } = useContext(AppContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser(email, password);
      localStorage.setItem("access_token", data.access_token);
      setAuthToken(data.access_token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FBFBFB] animate-in fade-in duration-500">
      <div className="w-full max-w-110 px-6">
        <div className="bg-white p-10 md:p-12 rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          
          {/* Header Section */}
          <div className="flex flex-col items-center mb-10 text-center">
            {/* ICON: Updated to use the Dark Green Background from your Dashboard */}
            <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-green-200">
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
            </div>
            
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-slate-500 mt-2 font-medium italic">
              Continue your nutritional progress
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-slate-300 group-focus-within:text-green-600 transition-colors" />
                </div>
                <input
                  type="email"
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-600/5 focus:border-green-600 focus:bg-white transition-all text-slate-900 font-medium placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Password
                </label>
                <Link to="/forgot-password" line="forgot-password" className="text-xs font-bold text-green-600 hover:text-green-700">
                  Forgot?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-300 group-focus-within:text-green-600 transition-colors" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-600/5 focus:border-green-600 focus:bg-white transition-all text-slate-900 font-medium"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 rounded-2xl border border-red-100 text-red-600 text-[11px] font-black uppercase tracking-wider animate-in fade-in slide-in-from-top-1">
                <ShieldCheck size={14} />
                {error}
              </div>
            )}

            {/* BUTTON: Matches the Dark Green from Dashboard tab buttons */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full bg-green-600 text-white py-4.5 rounded-2xl font-bold text-lg hover:bg-green-700 transition-all active:scale-[0.98] shadow-lg shadow-green-100 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-400 font-bold text-sm">
              New to NutriVision?{" "}
              <Link to="/register" className="text-green-600 hover:underline ml-1">
                Create Account
              </Link>
            </p>
          </div>
        </div>
        
        <p className="text-center mt-8 text-slate-300 text-[10px] font-black uppercase tracking-[0.3em]">
          © 2026 NutriVision, Inc.
        </p>
      </div>
    </div>
  );
};

export default Login;