import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../lib/firebase";

interface DistributorAuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const DistributorAuthContext = createContext<DistributorAuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export function DistributorAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const logout = async () => {
    await import("firebase/auth").then(({ signOut }) => signOut(auth));
  };

  return (
    <DistributorAuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </DistributorAuthContext.Provider>
  );
}

export function useDistributorAuth() {
  return useContext(DistributorAuthContext);
}
