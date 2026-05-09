import Sidebar from "@/components/sidebar/sidebar";
import Header from "@/components/header/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-row px-4 md:px-7.5 py-5 h-screen w-full gap-7.5 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col w-full min-w-0">
        <Header />
        <div className="overflow-y-auto overflow-x-hidden scrollbar-hide">
          {children}
        </div>
      </div>
    </div>
  );
}
