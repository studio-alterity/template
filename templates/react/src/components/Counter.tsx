import { useGlobalStore } from "@/store";

export default function Counter() {
  const count = useGlobalStore(state => state.count);
  const setCount = useGlobalStore(state => state.setCount);

  return (
    <>
      <h3>Count: {count}</h3>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </>
  );
}
