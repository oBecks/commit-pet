import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="flex flex-1 min-h-dvh flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Commit Pet</h1>
      <Link
        href={userId ? "/dashboard" : "/sign-in"}
        className="rounded-full bg-dash-accent px-5 py-2 text-sm font-semibold text-white hover:bg-[#C2560B]"
      >
        {userId ? "Go to dashboard" : "Sign in"}
      </Link>
    </div>
  );
}
