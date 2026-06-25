import { create } from "zustand";

const useAuthStore = create((set) => ({
  currentUser: JSON.parse(localStorage.getItem("loggedInUser") || "null"),
  login: (user) => {
    localStorage.setItem("loggedInUser", JSON.stringify(user));
    set({ currentUser: user });
  },
  logout: () => {
    localStorage.removeItem("loggedInUser");
    set({ currentUser: null });
  },
}));

export default useAuthStore;
