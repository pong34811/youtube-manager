import { ref, onValue, get } from "firebase/database";
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
