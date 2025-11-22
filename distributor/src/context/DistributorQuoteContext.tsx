import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useDistributorAuth } from "./DistributorAuthContext";

interface Quote {
  id: string;
  [key: string]: any;
}

interface DistributorQuoteContextType {
  quotes: Quote[];
  declinedQuotes: Quote[];
  loading: boolean;
  fetchQuotes: () => Promise<void>;
}

const DistributorQuoteContext = createContext<DistributorQuoteContextType>({
  quotes: [],
  declinedQuotes: [],
  loading: true,
  fetchQuotes: async () => {},
});

export function DistributorQuoteProvider({ children }: { children: React.ReactNode }) {
  const { user } = useDistributorAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [declinedQuotes, setDeclinedQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuotes = async () => {
    if (!user) return;

    const qAccepted = query(
      collection(db, "quotes"),
      where("distributorId", "==", user.uid),
      where("status", "==", "accepted")
    );

    const qDeclined = query(
      collection(db, "quotes"),
      where("distributorId", "==", user.uid),
      where("status", "==", "declined")
    );

    const snapA = await getDocs(qAccepted);
    const snapD = await getDocs(qDeclined);

    setQuotes(snapA.docs.map((d) => ({ id: d.id, ...d.data() })));
    setDeclinedQuotes(snapD.docs.map((d) => ({ id: d.id, ...d.data() })));

    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchQuotes();
  }, [user]);

  return (
    <DistributorQuoteContext.Provider
      value={{ quotes, declinedQuotes, loading, fetchQuotes }}
    >
      {children}
    </DistributorQuoteContext.Provider>
  );
}

export function useDistributorQuotes() {
  return useContext(DistributorQuoteContext);
}
