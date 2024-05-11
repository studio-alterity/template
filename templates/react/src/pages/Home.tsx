import Counter from "@/components/Counter";
import { useFoo } from "@/hooks";

export default function Home() {
  const { foo } = useFoo();

  return (
    <main>
      <h1>{foo}</h1>
      <Counter />
    </main>
  );
}
