import { create } from "zustand";

export const useGlobalStore = create<GlobalStore>(set => ({
  count: 0,
  setCount: count => set({ count }),
}));

interface GlobalStore {
  count: number;
  setCount: (count: number) => void;
}
