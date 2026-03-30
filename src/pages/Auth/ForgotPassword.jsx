import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Loader2, ArrowRight, Sparkles, ChevronLeft, CheckCircle2, AlertCircle } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL;

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setIsError(true);
        setMessage(data.detail || "Error occurred. Please try again.");
        return;
      }

      setIsError(false);
      setMessage("If your email is registered, a reset link has been sent.");
    } catch {
      setIsError(true);
      setMessage("Server error connection failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FBFBFB] animate-in fade-in duration-500">
      <div className="w-full max-w-110 px-6">
        
        {/* Back to Login Link */}
        <Link 
          to="/login" 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-green-600 font-bold text-sm mb-8 transition-colors group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Sign In
        </Link>

        <div className="bg-white p-10 md:p-12 rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          
          {/* Header Section */}
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-green-200">
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
            </div>
            
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Reset Password
            </h1>
            <p className="text-slate-500 mt-2 font-medium italic">
              We'll help you get back into your account
            </p>
          </div>

          {!message || isError ? (
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-600/5 focus:border-green-600 focus:bg-white transition-all text-slate-900 font-medium placeholder:text-slate-300"
                  />
                </div>
              </div>

              {message && isError && (
                <div className="flex items-center gap-2 p-4 bg-red-50 rounded-2xl border border-red-100 text-red-600 text-[11px] font-black uppercase tracking-wider">
                  <AlertCircle size={14} />
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
                    <span>Send Reset Link</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Success State View */
            <div className="text-center py-4 animate-in zoom-in-95 duration-300">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="text-green-600 w-8 h-8" />
              </div>
              <p className="text-slate-700 font-bold mb-6 leading-relaxed">
                {message}
              </p>
              <Link 
                to="/login"
                className="inline-block w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all"
              >
                Return to Login
              </Link>
            </div>
          )}
        </div>
        
        
      </div>
    </div>
  );
}

export default ForgotPassword;