import { useEffect, useState } from "react";
import { api } from "../api.js";

export function useFetch(path, fallback = []) {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api
      .get(path)
      .then((res) => mounted && setData(res.data))
      .catch(() => mounted && setData(fallback))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [path]);

  return { data, loading };
}
