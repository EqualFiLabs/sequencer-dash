export function createCache<K, V>(
  ttl: number,
  read: (key: K) => Promise<V>,
  clock = Date.now,
) {
  const values = new Map<K, { at: number; value: V }>();
  const pending = new Map<K, Promise<V>>();
  return (key: K): Promise<V> => {
    const cached = values.get(key);
    if (cached && clock() - cached.at < ttl)
      return Promise.resolve(cached.value);
    const existing = pending.get(key);
    if (existing) return existing;
    const task = Promise.resolve()
      .then(() => read(key))
      .then((value) => {
        values.set(key, { at: clock(), value });
        return value;
      })
      .finally(() => pending.delete(key));
    pending.set(key, task);
    return task;
  };
}
