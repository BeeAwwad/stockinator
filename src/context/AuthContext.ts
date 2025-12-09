import { createContext, type Dispatch, type SetStateAction } from "react";
import type { Session, User } from "@supabase/supabase-js";
import type {
  InviteProps,
  ProductProps,
  ProfileProps,
  TransactionProps,
} from "@/lib/types";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: ProfileProps | null;
  profileLoading: boolean;
  invites: InviteProps[] | [];
  invitesLoading: boolean;
  setInvites: Dispatch<SetStateAction<InviteProps[]>>;
  businessName: string;
  products: ProductProps[] | [];
  setProducts: Dispatch<SetStateAction<ProductProps[]>>;
  productsLoading: boolean;
  setProductsLoading: Dispatch<SetStateAction<TransactionProps[]>>;
  vendors: ProfileProps[] | [];
  vendorsLoading: boolean;
  setVendors: Dispatch<SetStateAction<ProfileProps[]>>;
  transactions: TransactionProps[] | [];
  setTransactions: Dispatch<SetStateAction<TransactionProps[]>>;
  transactionsLoading: boolean;
  setTransactionsLoading: Dispatch<SetStateAction<boolean>>;

  reloadProfile: () => Promise<void>;
  signUpNewUser: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; data?: unknown; error?: string }>;

  signInUser: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; data?: unknown; error?: string }>;
  signOutUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  profileLoading: true,
  invites: [],
  invitesLoading: true,
  setInvites: (() => {}) as Dispatch<SetStateAction<InviteProps[]>>,
  businessName: "",
  products: [],
  setProducts: (() => {}) as Dispatch<SetStateAction<ProductProps[]>>,
  productsLoading: true,
  setProductsLoading: (() => {}) as Dispatch<SetStateAction<ProfileProps[]>>,
  vendors: [],
  vendorsLoading: true,
  setVendors: (() => {}) as Dispatch<SetStateAction<ProfileProps[]>>,
  transactions: [],
  setTransactions: (() => {}) as Dispatch<SetStateAction<TransactionProps[]>>,
  transactionsLoading: true,
  setTransactionsLoading: (() => {}) as Dispatch<SetStateAction<boolean>>,

  reloadProfile: async () => {},

  signUpNewUser: async () => ({ success: false }),
  signInUser: async () => ({ success: false }),
  signOutUser: async () => {},
});
