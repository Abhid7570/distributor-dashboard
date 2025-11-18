import { useState } from "react";
import { auth, db } from "../lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function AuthPage({ onLogin }: { onLogin: () => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [role, setRole] = useState<"client" | "distributor" | "">("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  // -----------------------------------------------------
  // 🔥 HANDLE SIGNUP
  // -----------------------------------------------------
  const handleSignup = async () => {
    if (!email || !password || !role)
      return alert("Please fill all fields and choose a role");

    setLoading(true);

    try {
      // 1️⃣ Create account in Firebase Auth
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = userCred.user.uid;

      // 2️⃣ Create user document in Firestore
      await setDoc(doc(db, "users", uid), {
        email,
        role,
        created_at: new Date().toISOString(),
      });

      alert("Account created successfully!");
      onLogin();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------------
  // 🔥 HANDLE LOGIN
  // -----------------------------------------------------
  const handleLogin = async () => {
    if (!email || !password) return alert("Enter email and password");

    setLoading(true);

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      // Ensure user document exists
      const userDoc = await getDoc(doc(db, "users", uid));

      if (!userDoc.exists()) {
        alert("User role missing. Contact admin.");
        return;
      }

      onLogin(); // Refreshes App.tsx routing
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-6">
          {mode === "login" ? "Login" : "Create Account"}
        </h1>

        {/* ---------------- ROLE SELECTION (Signup only) ---------------- */}
        {mode === "signup" && (
          <div className="mb-6">
            <p className="font-medium mb-2">Select Role</p>

            <div className="flex gap-4">
              <button
                className={`flex-1 py-3 rounded-lg border ${
                  role === "client"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
                onClick={() => setRole("client")}
              >
                Client
              </button>

              <button
                className={`flex-1 py-3 rounded-lg border ${
                  role === "distributor"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
                onClick={() => setRole("distributor")}
              >
                Distributor
              </button>
            </div>
          </div>
        )}

        {/* ---------------- EMAIL ---------------- */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="text"
            className="w-full p-3 border rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* ---------------- PASSWORD ---------------- */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            className="w-full p-3 border rounded-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* ---------------- SUBMIT BUTTON ---------------- */}
        <button
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold"
          disabled={loading}
          onClick={mode === "login" ? handleLogin : handleSignup}
        >
          {loading
            ? "Please wait..."
            : mode === "login"
            ? "Login"
            : "Create Account"}
        </button>

        {/* ---------------- TOGGLE ---------------- */}
        <p className="text-center mt-4">
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <span
                className="text-blue-600 cursor-pointer"
                onClick={() => setMode("signup")}
              >
                Sign up
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span
                className="text-blue-600 cursor-pointer"
                onClick={() => setMode("login")}
              >
                Login
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
