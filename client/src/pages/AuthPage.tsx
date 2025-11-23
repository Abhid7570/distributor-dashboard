import { useState } from "react";
import { auth, db } from "../lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function AuthPage({ onLogin }: { onLogin: () => void }) {
   const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  // -----------------------------------------------------
  // 🔥 CLIENT SIGNUP ONLY
  // -----------------------------------------------------
  const handleSignup = async () => {
    if (!email || !password)
      return alert("Please fill all fields");

    setLoading(true);

    try {
      // 1️⃣ Create Firebase Auth account
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = userCred.user.uid;

      // 2️⃣ Create Firestore profile for CLIENT
      await setDoc(doc(db, "users", uid), {
        email,
        role: "client", // fixed role
        created_at: new Date().toISOString(),
      });

      alert("Client account created successfully!");
      onLogin();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------------
  // 🔥 CLIENT LOGIN ONLY
  // -----------------------------------------------------
//   const handleLogin = async () => {
//     if (!email || !password) return alert("Enter email and password");
// console.log("Login button clicked");

//     setLoading(true);

//     try {
//       const userCred = await signInWithEmailAndPassword(auth, email, password);
//       const uid = userCred.user.uid;

//       const userDoc = await getDoc(doc(db, "users", uid));

//       // Block login if role is not "client"
//       if (!userDoc.exists() || userDoc.data().role !== "client") {
//         alert("Only clients can log in here.");
//         return;
//       }

//       onLogin();
//     } catch (err: any) {
//       alert(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };
// put these imports at top of file if not already

const handleLogin = async () => {
  console.log("🔥 Login clicked");

  if (!email || !password) {
    console.log("⛔ Missing fields");
    alert("Enter email and password");
    return;
  }

  setLoading(true);

  try {
    // Log auth object to ensure it's the right instance
    console.log("🔎 auth object:", auth);
    try {
      // show currentUser before sign in
      console.log("🔎 auth.currentUser before signIn:", (auth as any).currentUser);
    } catch (e) {
      console.warn("Could not read currentUser:", e);
    }

    console.log("🔵 Trying signInWithEmailAndPassword...", email);

    const userCred = await signInWithEmailAndPassword(auth, email, password);

    console.log("🟢 Firebase login success:", userCred);
    console.log("🟢 user uid:", userCred.user?.uid);

    // check currentUser after sign-in
    try {
      console.log("🔎 auth.currentUser after signIn:", (auth as any).currentUser);
    } catch (e) {
      console.warn("Could not read currentUser after signIn:", e);
    }

    const uid = userCred.user.uid;

    console.log("🔵 Checking Firestore role for uid:", uid);
    const userDoc = await getDoc(doc(db, "users", uid));
    console.log("📄 Firestore doc exists:", userDoc.exists());
    console.log("📄 Firestore data:", userDoc.data());

    if (!userDoc.exists() || userDoc.data().role !== "client") {
      alert("Only clients can log in here.");
      setLoading(false);
      return;
    }

    console.log("🟢 Running onLogin()");
    try {
      if (!onLogin || typeof onLogin !== "function") {
        console.error("onLogin is not a function!", onLogin);
      } else {
        onLogin();
        console.log("onLogin() called");
      }
    } catch (err) {
      console.error("Error calling onLogin:", err);
    }

    console.log("🟢 Navigating to /");
    try {
      navigate("/");
    } catch (err) {
      console.error("Navigate failed:", err);
    }
  } catch (err: any) {
    console.error("❌ Login error (caught):", err);
    alert(err?.message || JSON.stringify(err));
  } finally {
    setLoading(false);
  }
};

  // -----------------------------------------------------
  // UI
  // -----------------------------------------------------
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-6">
          {mode === "login" ? "Client Login" : "Client Signup"}
        </h1>

        {/* EMAIL */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="text"
            className="w-full p-3 border rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* PASSWORD */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            className="w-full p-3 border rounded-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* BUTTON */}
        <button
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold"
          disabled={loading}
          onClick={mode === "login" ? handleLogin : handleSignup}
        >
          {loading
            ? "Please wait..."
            : mode === "login"
            ? "Login"
            : "Create Client Account"}
        </button>

        {/* SWITCH LOGIN / SIGNUP */}
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
