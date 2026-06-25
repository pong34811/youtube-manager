import { create } from "zustand";
import { persist } from "zustand/middleware";

const useLocaleStore = create(
  persist(
    (set) => ({
      locale: "th",
      setLocale: (locale) => set({ locale }),
      toggleLocale: () => set((s) => ({ locale: s.locale === "th" ? "en" : "th" })),
    }),
    { name: "locale-store" }
  )
);

export default useLocaleStore;
