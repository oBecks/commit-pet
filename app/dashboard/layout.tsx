import { Nav } from "./_components/Nav";

export default function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-dash-bg">
      <Nav />
      {children}
    </div>
  );
}
