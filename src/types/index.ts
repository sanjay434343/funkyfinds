export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'men' | 'women';
  subCategory: string;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  rating: number;
  reviews: number;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  addresses: Address[];
}

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface CartItem {
  productId: string;
  quantity: number;
  size: string;
  color: string;
}