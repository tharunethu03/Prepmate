export default function AuthUtilLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="force-light bg-background">{children}</div>;
}
