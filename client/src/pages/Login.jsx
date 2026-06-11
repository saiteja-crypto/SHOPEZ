import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";
import { Eye, EyeOff, ShoppingBag, ArrowLeft, Mail, KeyRound, Lock } from "lucide-react";

// ── Login Form ────────────────────────────────────────────
const LoginForm = ({ onForgot }) => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const [form, setForm]         = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  if (user) { navigate("/"); return null; }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <>
      <div className="auth-logo"><ShoppingBag size={28}/><span>Shop<em>EZ</em></span></div>
      <h1 className="auth-title">Welcome back</h1>
      <p className="auth-sub">Sign in to continue shopping</p>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label className="form-label">Email</label>
          <input type="email" className="form-input" placeholder="you@example.com"
            value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <div className="input-pw-wrap">
            <input type={showPass ? "text" : "password"} className="form-input" placeholder="••••••••"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
            <button type="button" className="pw-toggle" onClick={() => setShowPass(!showPass)}>
              {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
            </button>
          </div>
        </div>
        <div style={{ textAlign: "right", marginTop: -8 }}>
          <button type="button" className="forgot-link" onClick={onForgot}>Forgot password?</button>
        </div>
        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
      <p className="auth-switch">Don't have an account? <Link to="/register">Sign up</Link></p>
    </>
  );
};

// ── Forgot Step ───────────────────────────────────────────
const ForgotStep = ({ onNext, onBack }) => {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/auth/forgot-password", { email });
      toast.success("OTP sent to your email!");
      onNext(email);
    } catch (err) {
      toast.error(err.response?.data?.message || "Email not found");
    } finally { setLoading(false); }
  };

  return (
    <>
      <button className="auth-back-btn" onClick={onBack}><ArrowLeft size={16}/> Back to login</button>
      <div className="auth-logo"><Mail size={28}/><span>Reset <em>Password</em></span></div>
      <h1 className="auth-title">Forgot password?</h1>
      <p className="auth-sub">Enter your email and we'll send you a 6-digit OTP</p>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input type="email" className="form-input" placeholder="you@example.com"
            value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>
      </form>
    </>
  );
};

// ── Reset Step with Timer ─────────────────────────────────
const ResetStep = ({ email, onBack }) => {
  const navigate = useNavigate();
  const [form, setForm]         = useState({ otp: "", newPassword: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [timer, setTimer]       = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) { setCanResend(true); return; }
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) { toast.error("Passwords don't match"); return; }
    if (form.newPassword.length < 6) { toast.error("Minimum 6 characters"); return; }
    if (form.otp.length !== 6) { toast.error("Enter the 6-digit OTP"); return; }
    setLoading(true);
    try {
      await API.post("/auth/reset-password", {
        email, otp: form.otp, newPassword: form.newPassword,
      });
      toast.success("Password reset! Please login.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or expired OTP");
    } finally { setLoading(false); }
  };

  const resendOTP = async () => {
    try {
      await API.post("/auth/forgot-password", { email });
      toast.success("New OTP sent!");
      setTimer(60);
      setCanResend(false);
      setForm(f => ({ ...f, otp: "" }));
    } catch { toast.error("Failed to resend OTP"); }
  };

  return (
    <>
      <button className="auth-back-btn" onClick={onBack}><ArrowLeft size={16}/> Change email</button>
      <div className="auth-logo"><KeyRound size={28}/><span>Enter <em>OTP</em></span></div>
      <h1 className="auth-title">Check your email</h1>
      <p className="auth-sub">
        We sent a 6-digit OTP to <strong style={{color:"var(--text)"}}>{email}</strong>
      </p>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label className="form-label">6-Digit OTP</label>
          <input type="text" className="form-input otp-input"
            placeholder="000000" maxLength={6}
            value={form.otp}
            onChange={e => setForm({...form, otp: e.target.value.replace(/\D/g, "")})}
            required />
          {/* Timer */}
          <div className="otp-timer">
            {canResend ? (
              <span style={{color:"var(--text-2)"}}>OTP expired</span>
            ) : (
              <span>
                OTP expires in{" "}
                <strong style={{
                  color: timer <= 10 ? "var(--error)" : "var(--accent)"
                }}>
                  {String(Math.floor(timer/60)).padStart(2,"0")}:{String(timer%60).padStart(2,"0")}
                </strong>
              </span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">New Password</label>
          <div className="input-pw-wrap">
            <input type={showPass ? "text" : "password"} className="form-input"
              placeholder="Min. 6 characters"
              value={form.newPassword}
              onChange={e => setForm({...form, newPassword: e.target.value})} required />
            <button type="button" className="pw-toggle" onClick={() => setShowPass(!showPass)}>
              {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Confirm Password</label>
          <input type="password" className="form-input" placeholder="Repeat password"
            value={form.confirm}
            onChange={e => setForm({...form, confirm: e.target.value})} required />
        </div>

        <button type="submit" className="btn btn-primary btn-full" disabled={loading || canResend}>
          <Lock size={15}/> {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      <p className="auth-switch">
        Didn't receive OTP?{" "}
        <button className="forgot-link" onClick={resendOTP} disabled={!canResend}>
          {canResend ? "Resend OTP" : `Resend in ${timer}s`}
        </button>
      </p>
    </>
  );
};

// ── Main ──────────────────────────────────────────────────
const Login = () => {
  const [step, setStep]   = useState("login");
  const [email, setEmail] = useState("");

  return (
    <div className="auth-page">
      <div className="auth-card">
        {step === "login"  && <LoginForm onForgot={() => setStep("forgot")} />}
        {step === "forgot" && <ForgotStep onNext={(e) => { setEmail(e); setStep("reset"); }} onBack={() => setStep("login")} />}
        {step === "reset"  && <ResetStep email={email} onBack={() => setStep("forgot")} />}
      </div>
    </div>
  );
};

export default Login;