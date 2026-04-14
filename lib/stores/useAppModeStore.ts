import { create } from "zustand";
import { persist } from "zustand/middleware";

type AppMode = "edit" | "usage";

interface AppModeStore {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  toggleMode: () => void;
}

export const useAppModeStore = create<AppModeStore>()(
  persist(
    (set) => ({
      mode: "usage", // Default to Usage Mode

      setMode: (mode: AppMode) => {
        set({ mode });
      },

      toggleMode: () => {
        set((state) => ({
          mode: state.mode === "edit" ? "usage" : "edit",
        }));
      },
    }),
    {
      name: "app-mode-storage",
    }
  )
);

// Selector helpers
export const selectMode = (state: AppModeStore) => state.mode;
export const selectIsEditMode = (state: AppModeStore) => state.mode === "edit";
