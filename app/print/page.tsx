import { readFileSync } from "fs";
import { join } from "path";
import BulletinPreview from "@/app/components/BulletinPreview";
import type { BulletinData } from "@/lib/bulletin-types";

export const metadata = { title: "Bulletin Print" };

export default function PrintPage() {
  const data = JSON.parse(
    readFileSync(join(process.cwd(), "data", "bulletin.json"), "utf-8")
  ) as BulletinData;

  return (
    <>
      {/* These <style> and <link> tags are hoisted to <head> by React 18 */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=block"
        rel="stylesheet"
      />
      <style>{`
        @page { size: 14in 8.5in; margin: 0; }
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
        .bulletin-page { page-break-after: always; break-after: page; }
        .bulletin-page:last-child { page-break-after: avoid; break-after: avoid; }
        nextjs-portal { display: none !important; }
      `}</style>
      <BulletinPreview data={data} />
    </>
  );
}
