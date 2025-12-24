import { createSelectorFunctions } from "auto-zustand-selectors-hook";
import { create } from "zustand";

// Simple types
export interface Recipient {
  firstName: string;
  lastName: string;
  id: string;
  email?: string;
  userId?: number;
  previousBucks?: number;
  newBucks?: number;
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
  qrCode?: string;
  apiResponse?: {
    message: string;
    previousBucks: number;
    newBucks: number;
    amountChanged: number;
  };
}

interface TransactionState {
  currentTransaction: Transaction | null;
  isLoading: boolean;
  error: string | null;

  clearTransaction: () => void;
  startTransaction: (
    recipient: Recipient,
    amount: string | null,
    qrCode?: string
  ) => void;
  updateTransactionAmount: (
    amount: string,
    orderType: Transaction["orderType"]
  ) => void;
  updateTransactionStatus: (status: Transaction["status"]) => void;
  updateTransactionWithAPIResponse: (response: {
    message: string;
    previousBucks: number;
    newBucks: number;
    amountChanged: number;
  }) => void;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTransactionStore = create<TransactionState>()((set, get) => ({
  currentTransaction: null,
  isLoading: false,
  error: null,

  startTransaction: (recipient, amount, qrCode) => {
    const transaction: Transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      recipient,
      amount,
      status: "pending",
      timestamp: new Date(),
      orderType: null,
      qrCode,
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

  updateTransactionWithAPIResponse: (response) => {
    const { currentTransaction } = get();
    if (currentTransaction) {
      set({
        currentTransaction: {
          ...currentTransaction,
          apiResponse: response,
          recipient: {
            ...currentTransaction.recipient,
            previousBucks: response.previousBucks,
            newBucks: response.newBucks,
          },
        },
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
