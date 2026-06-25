import { useEffect, useState } from "react";
import { subscribeConfigs } from "../lib/api";

export function useAllConfigs() {
  const [configs, setConfigs] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeConfigs((data) => {
      setConfigs(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { configs, loading };
}
