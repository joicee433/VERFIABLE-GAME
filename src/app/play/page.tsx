import Link from "next/link";
import type { Metadata } from "next";
import { PlayFlow } from "@/components/PlayFlow";

export const metadata: Metadata = { title: "Play | Verified Weekly Challenge" };

export default function PlayPage() {
  return (
    <main id="main" className="mx-auto max-w-2xl px-5 py-10">
      <Link href="/" className="font-display font-bold underline underline-offset-4">Verified Weekly Challenge</Link>
      <PlayFlow />
    </main>
  );
}
