import { useState, useEffect, useRef } from "react";

interface AuthUser {
  name: string;
  email: string;
  role: string;
}

interface LoginPageProps {
  onLogin: (user: AuthUser) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [sliding, setSliding] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({ name: "", email: "", password: "" });

  // 3D tilt state
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);

  // Floating animation
  const [floatY, setFloatY] = useState(0);
  const floatRef = useRef<number>(0);
  const animRef = useRef<number>();

  useEffect(() => {
    setTimeout(() => setMounted(true), 100);

    // Continuous float loop
    const animate = () => {
      floatRef.current += 0.02;
      setFloatY(Math.sin(floatRef.current) * 12);
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const maxTilt = 18;
    setTilt({
      x: -(dy / (rect.height / 2)) * maxTilt,
      y:  (dx / (rect.width  / 2)) * maxTilt,
    });
    // Glow follows mouse
    const px = ((e.clientX - rect.left) / rect.width)  * 100;
    const py = ((e.clientY - rect.top)  / rect.height) * 100;
    setGlowPos({ x: px, y: py });
  };

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => {
    setIsHovering(false);
    setTilt({ x: 0, y: 0 });
    setGlowPos({ x: 50, y: 50 });
  };

  const validate = () => {
    const errs = { name: "", email: "", password: "" };
    let valid = true;
    if (isRegister && form.name.trim().length < 2) { errs.name = "Full name must be at least 2 letters"; valid = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { errs.email = "Valid email required (example@gmail.com)"; valid = false; }
    if (form.password.length < 6) { errs.password = "Password must be at least 6 characters"; valid = false; }
    setFieldErrors(errs);
    return valid;
  };

  const handleSubmit = async () => {
    setError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const BASE = import.meta.env.VITE_API_URL || "/api";
const url = isRegister ? `${BASE}/auth/register` : `${BASE}/auth/login`;
      const body = isRegister
        ? { name: form.name.trim(), email: form.email, password: form.password }
        : { email: form.email, password: form.password };
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Something went wrong"); return; }
      if (data.token) {
        localStorage.setItem("wo_token", data.token);
        localStorage.setItem("wo_user", JSON.stringify({ name: data.name, email: data.email, role: data.role }));
      }
      onLogin({ name: data.name ?? data.email, email: data.email, role: data.role?.toLowerCase() === "admin" ? "Admin" : "User" });
    } catch {
      setError("Cannot connect to server. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const toggle = () => {
    setSliding(true);
    setTimeout(() => {
      setIsRegister(p => !p);
      setForm({ name: "", email: "", password: "" });
      setFieldErrors({ name: "", email: "", password: "" });
      setError("");
      setSliding(false);
    }, 380);
  };

  const inp: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "12px",
    padding: "12px 16px",
    color: "#F1F5F9",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "all 0.25s",
  };

  const lbl: React.CSSProperties = {
    display: "block",
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    color: "rgba(255,255,255,0.35)",
    marginBottom: "8px",
  };

  // Card 3D transform
  const cardTransform = isHovering
    ? `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(${floatY}px) scale(1.03)`
    : `perspective(900px) rotateX(0deg) rotateY(0deg) translateY(${floatY}px) scale(1)`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }

        .lr { min-height:100vh; display:flex; align-items:center; justify-content:center;
              font-family:'Inter',sans-serif; overflow:hidden; position:relative;
              background:#030712; }

        /* ── 3D Grid floor ── */
        .grid3d {
          position:absolute; inset:-60%;
          background-image:
            linear-gradient(rgba(99,102,241,0.18) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.18) 1px, transparent 1px);
          background-size:70px 70px;
          transform: rotateX(60deg) rotateZ(-8deg) scale(3);
          animation: gridScroll 6s linear infinite;
        }
        @keyframes gridScroll {
          0%   { background-position:0 0; }
          100% { background-position:70px 70px; }
        }

        /* ── Orbs ── */
        .orb { position:absolute; border-radius:50%; filter:blur(90px); pointer-events:none; animation:orbPulse 7s ease-in-out infinite alternate; }
        .o1 { width:500px;height:500px; background:radial-gradient(circle,rgba(99,102,241,0.4),transparent 70%); top:-180px;left:-180px; animation-delay:0s; }
        .o2 { width:420px;height:420px; background:radial-gradient(circle,rgba(168,85,247,0.35),transparent 70%); bottom:-120px;right:-120px; animation-delay:-3s; }
        .o3 { width:280px;height:280px; background:radial-gradient(circle,rgba(236,72,153,0.25),transparent 70%); top:45%;left:55%; animation-delay:-5s; }
        @keyframes orbPulse {
          0%   { transform:translate(0,0) scale(1); }
          100% { transform:translate(25px,-35px) scale(1.12); }
        }

        /* ── Particles ── */
        .pt { position:absolute; border-radius:50%; background:rgba(139,92,246,0.7); pointer-events:none; animation:rise linear infinite; }
        @keyframes rise {
          0%   { transform:translateY(110vh) translateX(0) scale(0); opacity:0; }
          8%   { opacity:1; }
          92%  { opacity:0.8; }
          100% { transform:translateY(-80px) translateX(var(--d)) scale(2); opacity:0; }
        }

        /* ── Card wrapper ── */
        .card-wrap {
          position:relative; z-index:10; width:100%; max-width:440px; padding:16px;
          transition: transform 0.7s cubic-bezier(0.22,1,0.36,1), opacity 0.7s ease;
        }
        .card-wrap.hidden { transform:translateY(70px); opacity:0; }
        .card-wrap.show   { opacity:1; }

        /* ── Glass card ── */
        .glass {
          background: rgba(10,15,30,0.72);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border-radius: 24px;
          padding: 40px;
          position: relative;
          overflow: hidden;
          transition: transform 0.12s ease, box-shadow 0.12s ease;
          will-change: transform;
          cursor: default;
        }

        /* Dynamic border glow */
        .glass::before {
          content:'';
          position:absolute; inset:0;
          border-radius:24px;
          padding:1px;
          background: linear-gradient(
            135deg,
            rgba(139,92,246,0.6),
            rgba(99,102,241,0.3),
            rgba(236,72,153,0.3),
            rgba(139,92,246,0.6)
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: borderRotate 4s linear infinite;
          background-size: 300% 300%;
        }
        @keyframes borderRotate {
          0%   { background-position:0% 0%; }
          50%  { background-position:100% 100%; }
          100% { background-position:0% 0%; }
        }

        /* Mouse-follow inner glow */
        .glass-glow {
          position:absolute; inset:0; border-radius:24px; pointer-events:none;
          transition: opacity 0.3s ease;
        }

        /* Shiny top line */
        .glass::after {
          content:'';
          position:absolute; top:0; left:15%; right:15%; height:1px;
          background:linear-gradient(90deg,transparent,rgba(139,92,246,0.9),transparent);
        }

        /* ── Logo ── */
        .logo {
          display:inline-flex; align-items:center; justify-content:center;
          width:58px; height:58px; border-radius:18px;
          background:linear-gradient(135deg,#7C3AED,#4F46E5);
          margin-bottom:18px;
          box-shadow: 0 8px 32px rgba(124,58,237,0.55), 0 0 0 1px rgba(124,58,237,0.3);
          animation: logoPulse 3s ease-in-out infinite;
        }
        @keyframes logoPulse {
          0%,100% { box-shadow:0 8px 32px rgba(124,58,237,0.55),0 0 0 1px rgba(124,58,237,0.3); }
          50%      { box-shadow:0 8px 52px rgba(124,58,237,0.85),0 0 0 5px rgba(124,58,237,0.15); }
        }

        /* ── Form slide ── */
        .fi { transition:transform 0.38s cubic-bezier(0.4,0,0.2,1), opacity 0.38s ease; }
        .fi.out { transform:translateX(-50px) scale(0.96); opacity:0; }
        .fi.in  { transform:translateX(0)     scale(1);    opacity:1; }

        /* ── Input ── */
        .inp-f:focus { border-color:rgba(139,92,246,0.85)!important; box-shadow:0 0 0 3px rgba(139,92,246,0.2); }

        /* ── Button ── */
        .sbtn {
          width:100%; padding:13px; border-radius:12px; border:none;
          background:linear-gradient(135deg,#7C3AED,#4F46E5);
          color:#fff; font-size:14px; font-weight:700; cursor:pointer;
          font-family:inherit; position:relative; overflow:hidden;
          transition:all 0.25s;
          box-shadow:0 4px 24px rgba(124,58,237,0.45);
        }
        .sbtn::after {
          content:''; position:absolute;
          top:-50%;left:-60%; width:35%;height:200%;
          background:rgba(255,255,255,0.18);
          transform:skewX(-20deg);
          transition:left 0.55s ease;
        }
        .sbtn:hover::after { left:130%; }
        .sbtn:hover { transform:translateY(-2px); box-shadow:0 10px 36px rgba(124,58,237,0.65); }
        .sbtn:active { transform:translateY(0); }
        .sbtn:disabled { opacity:0.6; cursor:not-allowed; transform:none!important; }

        .tgl { background:none;border:none;cursor:pointer;color:#A78BFA;font-weight:700;
               font-size:13px;font-family:inherit;transition:color 0.2s;
               text-decoration:underline;text-decoration-color:transparent;text-underline-offset:3px; }
        .tgl:hover { color:#C4B5FD;text-decoration-color:#C4B5FD; }

        .eyeb { position:absolute;right:14px;top:50%;transform:translateY(-50%);
                background:none;border:none;cursor:pointer;
                color:rgba(255,255,255,0.3);padding:4px;transition:color 0.2s; }
        .eyeb:hover { color:rgba(255,255,255,0.7); }

        .errb { background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);
                border-radius:10px;padding:12px 16px;color:#FCA5A5;font-size:13px;font-weight:500; }

        .bdg { display:inline-block;padding:2px 10px;border-radius:20px;
               background:rgba(139,92,246,0.2);border:1px solid rgba(139,92,246,0.3);
               color:#A78BFA;font-size:11px;font-weight:600;letter-spacing:0.05em; }
      `}</style>

      <div className="lr">
        {/* 3D Grid */}
        <div className="grid3d" />

        {/* Orbs */}
        <div className="orb o1" /><div className="orb o2" /><div className="orb o3" />

        {/* Particles */}
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="pt" style={{
            left: `${Math.random() * 100}%`,
            width: `${2 + Math.random() * 3}px`,
            height: `${2 + Math.random() * 3}px`,
            animationDuration: `${7 + Math.random() * 9}s`,
            animationDelay: `${Math.random() * 10}s`,
            ['--d' as string]: `${(Math.random() - 0.5) * 120}px`,
          }} />
        ))}

        {/* Card wrap */}
        <div className={`card-wrap ${mounted ? "show" : "hidden"}`}>

          {/* Brand */}
          <div style={{ textAlign:"center", marginBottom:"28px" }}>
            <div className="logo" style={{ margin:"0 auto 14px" }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="1"/>
                <path d="M9 12h6M9 16h4"/>
              </svg>
            </div>
            <div style={{ color:"rgba(255,255,255,0.22)", fontSize:"11px", fontWeight:600, letterSpacing:"0.22em", textTransform:"uppercase" }}>
              FM · Work Order Dashboard
            </div>
          </div>

          {/* 3D Tilt Card */}
          <div
            ref={cardRef}
            className="glass"
            style={{ transform: cardTransform, boxShadow: isHovering
              ? "0 40px 100px rgba(0,0,0,0.7), 0 0 60px rgba(124,58,237,0.25)"
              : "0 24px 70px rgba(0,0,0,0.55), 0 0 30px rgba(124,58,237,0.1)" }}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Mouse-follow glow */}
            <div
              className="glass-glow"
              style={{
                background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, rgba(139,92,246,0.18) 0%, transparent 65%)`,
                opacity: isHovering ? 1 : 0,
              }}
            />

            {/* Sliding form content */}
            <div className={`fi ${sliding ? "out" : "in"}`}>

              {/* Header */}
              <div style={{ marginBottom:"28px" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"6px" }}>
                  <h1 style={{ color:"#F8FAFC", fontSize:"22px", fontWeight:800, letterSpacing:"-0.02em" }}>
                    {isRegister ? "Create Account" : "Welcome back"}
                  </h1>
                  <span className="bdg">{isRegister ? "New" : "Login"}</span>
                </div>
                <p style={{ color:"rgba(255,255,255,0.32)", fontSize:"13px" }}>
                  {isRegister ? "Register to access the dashboard" : "Sign in to your account"}
                </p>
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>

                {error && <div className="errb">⚠ {error}</div>}

                {/* Name */}
                {isRegister && (
                  <div>
                    <label style={lbl}>Full Name</label>
                    <input className="inp-f" type="text" value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Enter your full name" style={inp} />
                    {fieldErrors.name && <p style={{ color:"#F472B6", fontSize:"12px", marginTop:"6px" }}>⚠ {fieldErrors.name}</p>}
                  </div>
                )}

                {/* Email */}
                <div>
                  <label style={lbl}>Email</label>
                  <input className="inp-f" type="email" value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="example@gmail.com" autoComplete="off" style={inp} />
                  {fieldErrors.email && <p style={{ color:"#F472B6", fontSize:"12px", marginTop:"6px" }}>⚠ {fieldErrors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <label style={lbl}>Password</label>
                  <div style={{ position:"relative" }}>
                    <input className="inp-f"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      placeholder="Min 6 characters" autoComplete="new-password"
                      style={{ ...inp, paddingRight:"48px" }}
                      onKeyDown={e => { if (e.key === "Enter") handleSubmit(); }} />
                    <button type="button" className="eyeb" onClick={() => setShowPassword(p => !p)}>
                      {showPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  {fieldErrors.password && <p style={{ color:"#F472B6", fontSize:"12px", marginTop:"6px" }}>⚠ {fieldErrors.password}</p>}
                </div>

                {/* Submit */}
                <button type="button" className="sbtn" onClick={handleSubmit} disabled={loading}>
                  {loading ? "⏳ Please wait..." : isRegister ? "Create Account →" : "Sign In →"}
                </button>

                {/* Toggle */}
                <p style={{ textAlign:"center", color:"rgba(255,255,255,0.28)", fontSize:"13px" }}>
                  {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
                  <button type="button" className="tgl" onClick={toggle}>
                    {isRegister ? "Sign In" : "Register"}
                  </button>
                </p>

              </div>
            </div>
          </div>

          <p style={{ textAlign:"center", color:"rgba(255,255,255,0.08)", fontSize:"11px", marginTop:"20px" }}>
            © 2026 FM Dashboard · Secure Login
          </p>
        </div>
      </div>
    </>
  );
}