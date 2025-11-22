export type UserRole = "client" | "distributor";

export type AppUser = {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  sku: string;
  image_url: string;
  category_id: string;
  unit: string;
  description: string;
  min_order_quantity: number;
  specifications: Record<string, any>;
  stock_quantity: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

export type CartItem = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
};

export type Order = {
  id: string;
  order_number: string;
  user_id: string; // client
  distributor_id?: string;
  customer_name: string;
  customer_email: string;
  shipping_address: any;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
};

export type QuoteItem = {
  product_id: string;
  product_name: string;
  quantity: number;
};

export type QuoteRequest = {
  id: string;
  request_number: string;
  user_id: string; // client
  distributor_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  company_name?: string;
  items: QuoteItem[];
  message: string;
  status: string; // pending | quoted | accepted | declined
  created_at: string;
  quoted_price?: number;
};

export type DeclinedQuote = {
  id: string;
  quote_request_id: string;
  request_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  company_name: string;
  items: QuoteItem[];
  message: string;
  declined_reason: string;
  declined_by: string;
  declined_at: string;
};
