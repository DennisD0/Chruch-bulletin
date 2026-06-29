import { NextResponse } from "next/server";
import { spawn } from "child_process";
import { writeFileSync, mkdirSync, existsSync, rmSync } from "fs";
import { join } from "path";

const CHROME = `C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe`;
const DEBUG_PORT = 9333;

function waitForChrome(timeoutMs = 10_000): Promise<void> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
        if (res.ok) return resolve();
      } catch {
        // not up yet
      }
      if (Date.now() - start > timeoutMs) return reject(new Error("Chrome devtools port never came up"));
      setTimeout(tick, 150);
    };
    tick();
  });
}

export async function GET() {
  const tmpDir = join(process.cwd(), ".next", "tmp");
  if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });
  const profileDir = join(tmpDir, "chrome-pdf-profile");
  // Fresh profile each run avoids Chrome forwarding the request into an existing
  // user session (which silently ignores headless/devtools flags).
  if (existsSync(profileDir)) rmSync(profileDir, { recursive: true, force: true });

  const chrome = spawn(CHROME, [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${profileDir}`,
  ], { stdio: "ignore" });

  try {
    await waitForChrome();

    const newTabRes = await fetch(
      `http://127.0.0.1:${DEBUG_PORT}/json/new?http://localhost:3000/print`,
      { method: "PUT" }
    );
    const tab = await newTabRes.json();
    const ws = new WebSocket(tab.webSocketDebuggerUrl);

    const pdfBase64: string = await new Promise((resolve, reject) => {
      let msgId = 0;
      const pending = new Map<number, (result: any) => void>();

      const send = (method: string, params: Record<string, unknown> = {}) => {
        const id = ++msgId;
        return new Promise<any>((res) => {
          pending.set(id, res);
          ws.send(JSON.stringify({ id, method, params }));
        });
      };

      ws.onopen = async () => {
        await send("Page.enable");
        send("Page.navigate", { url: "http://localhost:3000/print" });
      };

      ws.onmessage = async (ev: MessageEvent) => {
        const msg = JSON.parse(ev.data as string);
        if (msg.id && pending.has(msg.id)) {
          pending.get(msg.id)!(msg.result);
          pending.delete(msg.id);
        }
        if (msg.method === "Page.loadEventFired") {
          try {
            const result = await send("Page.printToPDF", {
              preferCSSPageSize: true,
              printBackground: true,
              // The bulletin is always exactly 2 pages; total content height lands on
              // an exact multiple of the page height, which trips a Chromium pagination
              // quirk that appends one extra blank page. Pin the range to suppress it.
              pageRanges: "1-2",
            });
            resolve(result.data);
          } catch (e) {
            reject(e);
          }
        }
      };
      ws.onerror = (e) => reject(new Error("WebSocket error: " + JSON.stringify(e)));
      setTimeout(() => reject(new Error("printToPDF timed out")), 20_000);
    });

    ws.close();
    const outPath = join(tmpDir, "bulletin-export.pdf");
    writeFileSync(outPath, Buffer.from(pdfBase64, "base64"));

    return new NextResponse(Buffer.from(pdfBase64, "base64"), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="bulletin.pdf"`,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  } finally {
    chrome.kill();
  }
}
