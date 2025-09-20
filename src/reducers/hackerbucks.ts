import { createSelectorFunctions } from "auto-zustand-selectors-hook";
import { create } from "zustand";

// Simple types
export interface Recipient {
  firstName: string;
  lastName: string;
  id: string;
}

export interface orderType {
  send: "send";
  deduct: "deduct";
  empty: null;
}

export interface Transaction {
  id: string;
  recipient: Recipient;
  amount: string | null;
  status: "pending" | "completed" | "failed";
  timestamp: Date;
  orderType: "send" | "deduct" | null;
}

interface TransactionState {
  currentTransaction: Transaction | null;
  isLoading: boolean;
  error: string | null;

  clearTransaction: () => void;
  startTransaction: (recipient: Recipient, amount: string | null) => void;
  updateTransactionAmount: (
    amount: string,
    orderType: Transaction["orderType"]
  ) => void;
  updateTransactionStatus: (status: Transaction["status"]) => void;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTransactionStore = create<TransactionState>()((set, get) => ({
  currentTransaction: null,
  isLoading: false,
  error: null,

  startTransaction: (recipient, amount) => {
    const transaction: Transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      recipient,
      amount,
      status: "pending",
      timestamp: new Date(),
      orderType: null,
    };
    set({ currentTransaction: transaction, error: null });
  },

  updateTransactionAmount: (amount, orderType) => {
    const { currentTransaction } = get();
    if (currentTransaction) {
      set({
        currentTransaction: { ...currentTransaction, amount, orderType },
      });
    }
  },

  updateTransactionStatus: (status) => {
    const { currentTransaction } = get();
    if (currentTransaction) {
      set({
        currentTransaction: { ...currentTransaction, status },
        ...(status === "completed" || status === "failed"
          ? { isLoading: false }
          : {}),
        ...(status === "failed"
          ? { error: "Transaction failed" }
          : { error: null }),
      });
    }
  },

  clearTransaction: () => {
    set({ currentTransaction: null, error: null });
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));

export const useHackerBucksStore = createSelectorFunctions(useTransactionStore);

// Default export for Expo Router
export default useTransactionStore;
