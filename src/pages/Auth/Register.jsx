import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User, Loader2, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

const BASE_URL = "http://127.0.0.1:8000";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault(); // Prevents page refresh
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Registration failed. Please try again.");
        return;
      }

      // Instead of an alert, we navigate with a simple success state or just go to login
      navigate("/login", { state: { message: "Account created! Please sign in." } });

    } catch (err) {
      console.error("Register error:", err);
      setError("Server connection failed. Check if backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FBFBFB] animate-in fade-in duration-500">
      <div className="w-full max-w-115 px-6">
        <div className="bg-white p-10 md:p-12 rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          
          {/* Header Section - Same as Login */}
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-green-200">
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
            </div>
            
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Join NutriVision
            </h1>
            <p className="text-slate-500 mt-2 font-medium italic">
              Start your personalized health journey
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            
            {/* Full Name Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                Full Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-slate-300 group-focus-within:text-green-600 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-600/5 focus:border-green-600 focus:bg-white transition-all text-slate-900 font-medium placeholder:text-slate-300"
                />
              </div>
            </div>

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
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-300 group-focus-within:text-green-600 transition-colors" />
                </div>
                <input
                  type="password"
                  placeholder="Create a strong password"
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

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full bg-green-600 text-white py-4.5 rounded-2xl font-bold text-lg hover:bg-green-700 transition-all active:scale-[0.98] shadow-lg shadow-green-100 flex items-center justify-center gap-2 disabled:opacity-70 mt-4"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-400 font-bold text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-green-600 hover:underline ml-1">
                Sign In
              </Link>
            </p>
          </div>
        </div>
        
        
      </div>
    </div>
  );
}

export default Register;