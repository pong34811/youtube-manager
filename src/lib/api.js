import { ref, onValue, get, push, update, remove } from "firebase/database";
import { database } from "../firebase";

export const subscribeConfigs = (callback) => {
  const configsRef = ref(database, "youtube-configs");
  const unsubscribe = onValue(configsRef, (snapshot) => {
    callback(snapshot.val() || {});
  });
  return unsubscribe;
};

export const checkUserEmail = async (email) => {
  const usersRef = ref(database, "users");
  const snapshot = await get(usersRef);
  const users = snapshot.val();
  if (!users) return null;
  let found = null;
  Object.entries(users).forEach(([key, user]) => {
    if (user.email && user.email.toLowerCase() === email.toLowerCase()) {
      found = { id: key, ...user };
    }
  });
  return found;
};

export const subscribeUsers = (callback) => {
  const usersRef = ref(database, "users");
  return onValue(usersRef, (snapshot) => {
    callback(snapshot.val() || {});
  });
};

export const addUser = async (userData) => {
  const usersRef = ref(database, "users");
  return push(usersRef, { ...userData, createdAt: new Date().toLocaleString("en-GB") });
};

export const updateUser = async (id, userData) => {
  return update(ref(database, `users/${id}`), userData);
};

export const deleteUser = async (id) => {
  return remove(ref(database, `users/${id}`));
};
