import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Lock, Loader2, ArrowRight, Sparkles, CheckCircle2, ShieldAlert } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL;

function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

   if (!token) {
      return (
        <div style={{ padding: "40px", textAlign: "center" }}>
          <h2>Invalid or missing token</h2>
        </div>
      );
    }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const res = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token,
          new_password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setIsError(true);
        setMessage(data.detail || "Something went wrong. Link may be expired.");
        return;
      }

      setIsError(false);
      setMessage("Password reset successful! Redirecting...");

      // Smooth transition back to login
      setTimeout(() => {
        navigate("/login");
      }, 2500);

    } catch (error) {
      console.error("Reset error:", error);
      setIsError(true);
      setMessage("Server error. Please try again later.");
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
            <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-green-200">
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
            </div>
            
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              New Password
            </h1>
            <p className="text-slate-500 mt-2 font-medium italic">
              Set a secure password for your account
            </p>
          </div>

          {!message || isError ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* New Password Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                  New Password
                </label>
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

              {message && isError && (
                <div className="flex items-center gap-2 p-4 bg-red-50 rounded-2xl border border-red-100 text-red-600 text-[11px] font-black uppercase tracking-wider animate-in shake">
                  <ShieldAlert size={14} />
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group w-full bg-green-600 text-white py-4.5 rounded-2xl font-bold text-lg hover:bg-green-700 transition-all active:scale-[0.98] shadow-lg shadow-green-100 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                ) : (
                  <>
                    <span>Reset Password</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Success State View */
            <div className="text-center py-4 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="text-green-600 w-10 h-10" />
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-2">Success!</h2>
              <p className="text-slate-500 font-medium mb-8">
                Your password has been updated. You are being redirected to the login page.
              </p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-green-600 h-full animate-[loading_2.5s_ease-in-out]" style={{ width: '100%' }} />
              </div>
            </div>
          )}
        </div>
        
        
      </div>
    </div>
  );
}

export default ResetPassword;