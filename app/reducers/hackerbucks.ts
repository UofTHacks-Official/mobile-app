import { createSelectorFunctions } from "auto-zustand-selectors-hook";
import { create } from 'zustand';

// Simple types
export interface Recipient {
  firstName: string;
  lastName: string;
  id: string;
}

export interface Transaction {
  id: string;
  recipient: Recipient;
  amount: string | null;
  status: 'pending' | 'confirmed' | 'completed' | 'failed';
  timestamp: Date;
}

// Simplified state
interface TransactionState {
  currentTransaction: Transaction | null;
  isLoading: boolean;
  error: string | null;
  
  // Simplified actions

  clearTransaction: () => void;
  
  startTransaction: (recipient: Recipient, amount: string | null) => void;
  updateTransactionAmount: (amount: string) => void;
  updateTransactionStatus: (status: Transaction['status']) => void;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTransactionStore = create<TransactionState>()(
  (set, get) => ({
    currentTransaction: null,
    isLoading: false,
    error: null,

    startTransaction: (recipient, amount) => {
      const transaction: Transaction = {
        id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        recipient,
        amount,
        status: 'pending',
        timestamp: new Date(),
      };
      set({ currentTransaction: transaction, error: null });
    },

    updateTransactionAmount: (amount) => {
      const { currentTransaction } = get();
      if (currentTransaction) {
        set({
          currentTransaction: { ...currentTransaction, amount },
        });
      }
    },

    updateTransactionStatus: (status) => {
      const { currentTransaction } = get();
      if (currentTransaction) {
        set({
          currentTransaction: { ...currentTransaction, status },
          ...(status === 'completed' || status === 'failed' ? { isLoading: false } : {}),
          ...(status === 'failed' ? { error: 'Transaction failed' } : { error: null }),
        });
      }
    },

    clearTransaction: () => {
      set({ currentTransaction: null, error: null });
    },

    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
  })
);

export const useHackerBucksStore = createSelectorFunctions(useTransactionStore)
