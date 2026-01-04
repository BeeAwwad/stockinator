import type { Dispatch, SetStateAction } from "react";
import { supabase } from "./supabaseClient";
import type {
  AnalyticsRange,
  InviteProps,
  ProductProps,
  ProfileProps,
  TransactionProps,
} from "./types";
import { toast } from "sonner";
import { subHours, subDays, subMonths, subYears } from "date-fns";

export const loadProfile = async ({
  userId,
  setProfile,
}: {
  userId: string;
  setProfile: Dispatch<SetStateAction<ProfileProps | null>>;
}) => {
  try {
    if (!userId) {
      console.warn("loadProfile called with invalid userId:", userId);
      return;
    }
    console.log("loading profile...");
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error loading profile:", error.message);
      return;
    }
    localStorage.setItem("profile", JSON.stringify(data));
    setProfile(data);
  } catch {
    const catched = localStorage.getItem("profile");
    if (catched) setProfile(JSON.parse(catched));
  }
};

export const loadBusinessName = async ({
  profile,
  setBusinessName,
}: {
  profile: ProfileProps | null;
  setBusinessName: Dispatch<SetStateAction<string>>;
}) => {
  if (!profile) return;

  if (profile.business_id) {
    const { data: businessData } = await supabase
      .from("businesses")
      .select("name")
      .eq("id", profile.business_id)
      .single();

    if (businessData) {
      setBusinessName(businessData.name);
    }
  }
};

export const loadInvites = async ({
  isOnline,
  profile,
  setInvites,
  setInvitesLoading,
  invites,
}: {
  isOnline: boolean;
  profile: ProfileProps;
  setInvites: Dispatch<SetStateAction<InviteProps[]>>;
  setInvitesLoading: Dispatch<SetStateAction<boolean>>;
  invites: InviteProps[];
}) => {
  if (!isOnline || !profile?.id) return;

  setInvitesLoading(true);

  let query = supabase
    .from("invites")
    .select(
      "*, inviter:profiles!invites_invited_by_fkey(email), invited:profiles!invites_invited_user_id_fkey(email)"
    )
    .order("created_at", { ascending: false });

  if (profile.role === "owner" && profile.business_id) {
    query = query.eq("business_id", profile.business_id);
  } else {
    query = query.eq("invited_user_id", profile.id);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching invites:", error);
    setInvitesLoading(false);
  } else {
    setInvites(data ?? []);
    console.log("invites reloaded", invites);
  }
  setInvitesLoading(false);
};

export const loadProducts = async ({
  isOnline,
  profile,
  setProducts,
  setProductsLoading,
}: {
  isOnline: boolean;
  profile: ProfileProps;
  setProducts: Dispatch<SetStateAction<ProductProps[]>>;
  setProductsLoading: Dispatch<SetStateAction<boolean>>;
}) => {
  if (!isOnline || !profile?.business_id) return;
  setProductsLoading(true);
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("business_id", profile?.business_id)
    .order("created_at", { ascending: false });
  if (error) {
    console.error(error);
    toast.error("Failed to load products.");
    return;
  }
  setProducts(
    data.sort((a, b) => {
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    })
  );
  setProductsLoading(false);
};

export const loadVendors = async ({
  isOnline,
  profile,
  setVendors,
  setVendorsLoading,
}: {
  isOnline: boolean;
  profile: ProfileProps;
  setVendors: Dispatch<SetStateAction<ProfileProps[]>>;
  setVendorsLoading: Dispatch<SetStateAction<boolean>>;
}) => {
  if (!isOnline || !profile?.id) return;

  const { error, data } = await supabase
    .from("profiles")
    .select("*")
    .eq("business_id", profile?.business_id)
    .eq("role", "vendor");
  setVendors(data || []);
  if (error) {
    console.error(error);
    toast.error("Failed to load vendors");
    setVendorsLoading(false);
  }
  setVendorsLoading(false);
};

export const loadTransactions = async ({
  isOnline,
  profile,
  setTransactions,
  setTransactionsLoading,
}: {
  isOnline: boolean;
  profile: ProfileProps;
  setTransactions: Dispatch<SetStateAction<TransactionProps[]>>;
  setTransactionsLoading: Dispatch<SetStateAction<boolean>>;
}) => {
  if (!isOnline || !profile?.id) return;

  setTransactionsLoading(true);
  const { data, error } = await supabase
    .from("transactions")
    .select(
      "*, created_by_email:profiles!transactions_created_by_fkey(email), items:transaction_items(id, transaction_id, product_id, quantity, unit_price, products(name))"
    )
    .eq("business_id", profile?.business_id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    toast.error("Failed to load transactions");
    return;
  }
  setTransactions(data);
  setTransactionsLoading(false);
};

export const getStartDate = (range: AnalyticsRange): Date => {
  const now = new Date();
  switch (range) {
    case "24h":
      return subHours(now, 24);
    case "7d":
      return subDays(now, 7);
    case "1m":
      return subMonths(now, 1);
    case "3m":
      return subMonths(now, 3);
    case "6m":
      return subMonths(now, 6);
    case "1y":
      return subYears(now, 1);
    default:
      return subHours(now, 24);
  }
};
