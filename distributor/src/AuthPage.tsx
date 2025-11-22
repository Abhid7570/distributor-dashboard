import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useNavigate } from "react-router-dom";
import "./index.css";

export default function AuthPage() {
  console.log("AUTH PAGE LOADED");

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return alert("Enter email and password");

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      {/* LEFT PANEL WITH ANIMATED MASCOT */}
      <div className="login-left">
        <div className="mascot-wrapper">
          <img
            src="https://cdn3d.iconscout.com/3d/premium/thumb/delivery-boy-3d-illustration-download-in-png-blend-fbx-gltf-file-formats--food-logistics-delivering-pack-of-packages-courier-pack-transportation-illustrations-5932510.png"
            alt="Mascot"
            className="mascot"
          />
        </div>

        <h2 className="login-title">Welcome Back!</h2>
        <p className="login-sub">Distributor Portal Login</p>
      </div>

      {/* RIGHT PANEL FORM */}
      <div className="login-right">
        <div className="form-box">
          <h3 className="form-title">Sign In</h3>

          <label>Email</label>
          <input
            type="text"
            placeholder="distributor@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={handleLogin} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="footer">Authorized distributors only.</p>
        </div>
      </div>
    </div>
  );
}
