import api from "../services/api";
import { useEffect, useState } from "react";

export default function Login({ setSession }) {
  const [mode, setMode] = useState("login");
  const [step, setStep] = useState(1);
  const [otpTimer, setOtpTimer] = useState(0);
  const [loading, setLoading] = useState(false);

  const emptyForm = {
    username: "",
    password: "",
    role: "investigator",
    otp: "",
    user_id: null
  };

  const [form, setForm] = useState(emptyForm);

  // OTP COUNTDOWN
  useEffect(() => {
    if (otpTimer <= 0) return;

    const interval = setInterval(() => {
      setOtpTimer(t => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [otpTimer]);

  const switchMode = () => {
    setMode(prev => (prev === "login" ? "signup" : "login"));
    setStep(1);
    setOtpTimer(0);
    setForm(emptyForm);
  };

  // LOGIN
  const login = async () => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", {
        username: form.username,
        password: form.password
      });

      setForm(prev => ({
        ...prev,
        user_id: res.data.user_id
      }));

      setOtpTimer(60);
      setStep(2);
    } catch {
      alert("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  // SIGN UP
  const signup = async () => {
    setLoading(true);
    try {
      await api.post("/auth/signup", {
        username: form.username,
        password: form.password,
        role: form.role
      });

      await login();
    } catch {
      alert("Signup failed. Username may already exist.");
      setLoading(false);
    }
  };

  // VERIFY OTP
  const verifyOtp = async () => {
    setLoading(true);
    try {
      const res = await api.post("/auth/verify-otp", {
        user_id: form.user_id,
        otp: form.otp
      });

      setSession({
        user_id: form.user_id,
        role: res.data.role
      });
    } catch (err) {
      alert(err.response?.data?.error || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  // RESEND OTP
  const resendOtp = async () => {
    setLoading(true);
    try {
      await api.post("/auth/login", {
        username: form.username,
        password: form.password
      });

      setOtpTimer(60);
      alert("New OTP generated");
    } catch {
      alert("Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <div className="logo">
          <div className="logo-icon"></div>
          <h1>Secure Evidence System</h1>
        </div>
        <p className="system-description">
          Digital Evidence Handling & Chain-of-Custody System
        </p>
      </div>

      <div className="login-card">
        <div className="login-card-header">
          <h2>{mode === "login" ? "Secure Login" : "Account Registration"}</h2>
          <div className={`security-indicator ${step === 2 ? 'active' : ''}`}>
            <span className="indicator-step">1</span>
            <div className="indicator-line"></div>
            <span className={`indicator-step ${step === 2 ? 'active' : ''}`}>2</span>
          </div>
        </div>

        {step === 1 && (
          <div className="login-form">
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                placeholder="Enter your username"
                value={form.username}
                onChange={e =>
                  setForm(prev => ({ ...prev, username: e.target.value }))
                }
                className="cyber-input"
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={e =>
                  setForm(prev => ({ ...prev, password: e.target.value }))
                }
                className="cyber-input"
              />
            </div>

            {mode === "signup" && (
              <div className="input-group">
                <label htmlFor="role">Access Role</label>
                <select
                  id="role"
                  value={form.role}
                  onChange={e =>
                    setForm(prev => ({ ...prev, role: e.target.value }))
                  }
                  className="cyber-select"
                >
                  <option value="investigator">Investigator</option>
                  <option value="officer">Forensic Officer</option>
                  <option value="auditor">Auditor</option>
                </select>
                <div className="role-description">
                  {form.role === "investigator" && "Can submit and track evidence"}
                  {form.role === "officer" && "Can analyze and process evidence"}
                  {form.role === "auditor" && "Can review access logs and chain of custody"}
                </div>
              </div>
            )}

            <button 
              onClick={mode === "login" ? login : signup} 
              className="cyber-button"
              disabled={loading}
            >
              {loading ? (
                <span className="loading-spinner"></span>
              ) : (
                mode === "login" ? "Authenticate" : "Create Secure Account"
              )}
            </button>

            <div className="login-footer">
              <p>
                {mode === "login"
                  ? "Need access to the system?"
                  : "Already have an account?"}
                <button className="switch-mode-btn" onClick={switchMode}>
                  {mode === "login" ? "Request Access" : "Secure Login"}
                </button>
              </p>
              <div className="security-notice">
                <span className="security-icon">⚠️</span>
                All activities are logged and encrypted
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="otp-verification">
            <div className="otp-header">
              <div className="otp-icon">🔐</div>
              <h3>Two-Factor Authentication</h3>
              <p className="otp-description">
                Enter the OTP sent to your registered device
              </p>
            </div>

            <div className="input-group">
              <label htmlFor="otp">Verification Code</label>
              <input
                id="otp"
                placeholder="Enter 6-digit OTP"
                value={form.otp}
                onChange={e =>
                  setForm(prev => ({ ...prev, otp: e.target.value }))
                }
                className="cyber-input otp-input"
                maxLength={6}
              />
            </div>

            <div className="otp-timer">
              <div className="timer-display">
                <span className="timer-icon">⏱️</span>
                <span>OTP expires in </span>
                <span className={`timer-count ${otpTimer < 10 ? 'warning' : ''}`}>
                  {otpTimer}s
                </span>
              </div>
              <div className="timer-bar">
                <div 
                  className="timer-progress" 
                  style={{ width: `${(otpTimer / 60) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="otp-actions">
              <button 
                onClick={verifyOtp} 
                className="cyber-button verify-btn"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading-spinner"></span>
                ) : (
                  "Verify & Access System"
                )}
              </button>

              {otpTimer <= 0 && (
                <button 
                  onClick={resendOtp} 
                  className="cyber-button secondary-btn"
                  disabled={loading}
                >
                  Resend OTP
                </button>
              )}
            </div>

            <div className="security-message">
              <div className="encryption-badge">
                <span className="badge-icon">🔒</span>
                <span>End-to-End Encrypted</span>
              </div>
              <p className="chain-of-custody-notice">
                This verification maintains the chain of custody integrity
              </p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          width:100%;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0c0c2e 0%, #1a1a3e 100%);
          padding: 20px;
          font-family: 'Segoe UI', 'Roboto', sans-serif;
          color: #e0e0ff;
          position: relative;
          overflow: hidden;
        }

        .login-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 80%, rgba(41, 196, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(132, 0, 255, 0.1) 0%, transparent 50%);
          z-index: 0;
        }

        .login-header {
          text-align: center;
          margin-bottom: 40px;
          z-index: 1;
          position: relative;
        }

        .logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          margin-bottom: 10px;
        }

        .logo-icon {
          font-size: 2.5rem;
          animation: pulse 2s infinite;
        }

        h1 {
          font-size: 2.2rem;
          background: linear-gradient(90deg, #29c4ff, #8400ff);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          margin: 0;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .system-description {
          font-size: 1rem;
          color: #a0a0ff;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.5;
          border-top: 1px solid rgba(132, 0, 255, 0.3);
          padding-top: 15px;
        }

        .login-card {
          background: rgba(16, 18, 37, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(41, 196, 255, 0.2);
          border-radius: 16px;
          padding: 40px;
          width: 100%;
          max-width: 450px;
          box-shadow: 
            0 10px 30px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(41, 196, 255, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          z-index: 1;
          position: relative;
          overflow: hidden;
        }

        .login-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #29c4ff, #8400ff);
        }

        .login-card-header {
          margin-bottom: 30px;
        }

        .login-card-header h2 {
          font-size: 1.8rem;
          margin: 0 0 20px 0;
          color: #ffffff;
          font-weight: 600;
        }

        .security-indicator {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 20px;
        }

        .indicator-step {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.1);
          color: #a0a0ff;
          font-weight: 600;
          font-size: 0.9rem;
          border: 2px solid rgba(41, 196, 255, 0.3);
        }

        .indicator-step.active {
          background: linear-gradient(135deg, #29c4ff, #8400ff);
          color: white;
          border-color: transparent;
          box-shadow: 0 0 10px rgba(41, 196, 255, 0.5);
        }

        .indicator-line {
          flex: 1;
          height: 2px;
          background: rgba(255, 255, 255, 0.1);
        }

        .login-form, .otp-verification {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        label {
          font-size: 0.9rem;
          color: #a0a0ff;
          font-weight: 500;
        }

        .cyber-input, .cyber-select {
          padding: 14px 16px;
          background: rgba(10, 12, 28, 0.8);
          border: 1px solid rgba(41, 196, 255, 0.3);
          border-radius: 10px;
          color: #ffffff;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .cyber-input:focus, .cyber-select:focus {
          outline: none;
          border-color: #29c4ff;
          box-shadow: 0 0 0 2px rgba(41, 196, 255, 0.2);
        }

        .cyber-input::placeholder {
          color: #666699;
        }

        .cyber-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2329c4ff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 16px center;
          background-size: 16px;
          cursor: pointer;
        }

        .role-description {
          font-size: 0.85rem;
          color: #29c4ff;
          padding: 8px 12px;
          background: rgba(41, 196, 255, 0.1);
          border-radius: 6px;
          margin-top: 5px;
        }

        .cyber-button {
          padding: 16px;
          background: linear-gradient(135deg, #29c4ff 0%, #8400ff 100%);
          border: none;
          border-radius: 10px;
          color: white;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 10px;
        }

        .cyber-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(41, 196, 255, 0.4);
        }

        .cyber-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .secondary-btn {
          background: rgba(41, 196, 255, 0.1);
          border: 1px solid rgba(41, 196, 255, 0.5);
        }

        .secondary-btn:hover:not(:disabled) {
          background: rgba(41, 196, 255, 0.2);
        }

        .login-footer {
          margin-top: 20px;
          text-align: center;
        }

        .login-footer p {
          color: #a0a0ff;
          margin-bottom: 15px;
        }

        .switch-mode-btn {
          background: none;
          border: none;
          color: #29c4ff;
          font-weight: 600;
          cursor: pointer;
          padding: 5px;
          margin-left: 5px;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .switch-mode-btn:hover {
          color: #8400ff;
        }

        .security-notice {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 0.85rem;
          color: #a0a0ff;
          padding: 10px;
          background: rgba(255, 193, 7, 0.1);
          border-radius: 6px;
          border-left: 3px solid #ffc107;
        }

        .security-icon {
          font-size: 1rem;
        }

        /* OTP Verification Styles */
        .otp-verification {
          animation: fadeIn 0.5s ease;
        }

        .otp-header {
          text-align: center;
          margin-bottom: 25px;
        }

        .otp-icon {
          font-size: 3rem;
          margin-bottom: 15px;
          display: block;
        }

        .otp-description {
          color: #a0a0ff;
          font-size: 0.95rem;
          margin-top: 10px;
        }

        .otp-input {
          text-align: center;
          letter-spacing: 10px;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .otp-timer {
          background: rgba(10, 12, 28, 0.8);
          border-radius: 10px;
          padding: 15px;
          margin: 10px 0;
        }

        .timer-display {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 10px;
          font-size: 0.95rem;
        }

        .timer-icon {
          font-size: 1.2rem;
        }

        .timer-count {
          font-weight: 700;
          color: #29c4ff;
        }

        .timer-count.warning {
          color: #ff4757;
          animation: pulse 1s infinite;
        }

        .timer-bar {
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
        }

        .timer-progress {
          height: 100%;
          background: linear-gradient(90deg, #29c4ff, #8400ff);
          border-radius: 2px;
          transition: width 1s linear;
        }

        .otp-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin: 20px 0;
        }

        .verify-btn {
          background: linear-gradient(135deg, #00d68f 0%, #0095ff 100%);
        }

        .security-message {
          text-align: center;
          margin-top: 25px;
          padding-top: 20px;
          border-top: 1px solid rgba(41, 196, 255, 0.2);
        }

        .encryption-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(0, 214, 143, 0.1);
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #00d68f;
          margin-bottom: 10px;
        }

        .badge-icon {
          font-size: 1rem;
        }

        .chain-of-custody-notice {
          font-size: 0.85rem;
          color: #a0a0ff;
          line-height: 1.4;
        }

        /* Loading Spinner */
        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s infinite linear;
        }

        /* Animations */
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Responsive Design */
        @media (max-width: 480px) {
          .login-card {
            padding: 25px;
          }
          
          h1 {
            font-size: 1.8rem;
          }
          
          .logo-icon {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
}