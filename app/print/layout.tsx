// Bare layout for the print route — no header, no background, no padding
export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
