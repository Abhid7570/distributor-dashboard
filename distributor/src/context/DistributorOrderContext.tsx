import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useDistributorAuth } from "./DistributorAuthContext";

interface Order {
  id: string;
  [key: string]: any;
}

interface DistributorOrderContextType {
  orders: Order[];
  loading: boolean;
  fetchOrders: () => Promise<void>;
}

const DistributorOrderContext = createContext<DistributorOrderContextType>({
  orders: [],
  loading: true,
  fetchOrders: async () => {},
});

export function DistributorOrderProvider({ children }: { children: React.ReactNode }) {
  const { user } = useDistributorAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!user) return;

    const q = query(
      collection(db, "orders"),
      where("distributorId", "==", user.uid)
    );

    const snap = await getDocs(q);
    const formatted = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    setOrders(formatted);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  return (
    <DistributorOrderContext.Provider value={{ orders, loading, fetchOrders }}>
      {children}
    </DistributorOrderContext.Provider>
  );
}

export function useDistributorOrders() {
  return useContext(DistributorOrderContext);
}
