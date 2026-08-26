import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Nav } from "./_components/Nav";

export default async function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-dash-bg">
      <Nav />
      {children}
    </div>
  );
}
