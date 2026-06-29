import type { BulletinData, CalendarBanner } from "@/lib/bulletin-types";

// ── Design tokens ──────────────────────────────────────────────────────────────
const B   = "#1F4E79"; // dark navy  — section titles, rules, contact text
const BL  = "#4472C4"; // accent blue — table col-headers, service names
const GR  = "#595959"; // body gray
const LG  = "#D9D9D9"; // table row borders (light gray)
const SUN = "#C00000"; // Sunday red
const SAT = "#2E74B5"; // Saturday blue

// ── Page: US Legal landscape 14" × 8.5" @ 96 dpi ─────────────────────────────
export const PAGE_W = 1344;
export const PAGE_H = 816;
const PM_H = 32;  // left/right page margin ≈ 0.33"
const PM_V = 26;  // top/bottom page margin ≈ 0.27"
const CGAP = 13;  // inter-column padding each side (26 px total gap)

// ── Typography (all in px at render resolution) ────────────────────────────────
const F = {
  title:    42,     // "Church Bulletin"
  quote:    10.5,   // cover italic quote
  quoteRef: 9.5,    // "Psalms 118:17"
  pastor:   10,     // "Pastor Chong Kyung Park"
  secHead:  9.5,    // section heading label
  body:     8.5,    // standard body
  small:    7.5,    // secondary / tight cells
  contact:  9,      // contact-info block
};

// ── Shared primitives ──────────────────────────────────────────────────────────

const BASE_STYLE: React.CSSProperties = {
  fontFamily: "'Inter', 'Calibri', Arial, sans-serif",
  fontSize: F.body,
  lineHeight: 1.35,
  color: "#000",
};

/** Bold section label + full-width rule in navy */
function SecHead({ title }: { title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5, lineHeight: 1 }}>
      <span style={{ color: B, fontWeight: 700, fontSize: F.secHead, whiteSpace: "nowrap" }}>
        {title}
      </span>
      <div style={{ flex: 1, height: 0.75, background: B }} />
    </div>
  );
}

/** Table column-header cell — blue, top+bottom rule */
function TH({ children, center, w }: { children?: React.ReactNode; center?: boolean; w?: number }) {
  return (
    <th style={{
      color: BL, fontWeight: 700, fontSize: F.small,
      textAlign: center ? "center" : "left",
      padding: "2px 4px 2px 0",
      borderTop: `0.75px solid ${BL}`,
      borderBottom: `0.75px solid ${BL}`,
      whiteSpace: "nowrap", lineHeight: 1.25,
      width: w,
    }}>
      {children}
    </th>
  );
}

/** Table data cell */
function TD({
  children, center, top, bold, color, noWrap, span, xs, pr = 4,
}: {
  children?: React.ReactNode;
  center?: boolean; top?: boolean; bold?: boolean;
  color?: string; noWrap?: boolean;
  span?: number; xs?: boolean; pr?: number;
}) {
  return (
    <td rowSpan={span} style={{
      fontSize: xs ? F.small : F.body,
      lineHeight: 1.3,
      padding: `1.5px ${pr}px 1.5px 0`,
      borderBottom: `0.5px solid ${LG}`,
      textAlign: center ? "center" : "left",
      verticalAlign: top ? "top" : "middle",
      fontWeight: bold ? 700 : 400,
      color: color ?? GR,
      whiteSpace: noWrap ? "nowrap" : undefined,
    }}>
      {children}
    </td>
  );
}

/** Memory-verse header: "Label (date) Reference ··· Theme" */
function VerseRow({ label, date, reference, theme }: {
  label: string; date: string; reference: string; theme: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "baseline" }}>
      <span style={{ fontWeight: 700, fontSize: F.body, whiteSpace: "nowrap" }}>
        {label} ({date}) {reference}
      </span>
      <span style={{
        flex: 1, borderBottom: `1px dotted ${GR}`,
        margin: "0 3px 1.5px", minWidth: 6,
      }} />
      <span style={{ fontWeight: 700, fontSize: F.body, whiteSpace: "nowrap" }}>
        {theme}
      </span>
    </div>
  );
}

// ── Monthly calendar grid ──────────────────────────────────────────────────────

function CalGrid({ month, year, events, banners }: {
  month: number; year: number;
  events: Record<string, string[]>;
  banners: CalendarBanner[];
}) {
  const DOW = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const first = new Date(year, month - 1, 1).getDay();
  const days  = new Date(year, month, 0).getDate();

  const flat: number[] = [...Array(first).fill(0)];
  for (let d = 1; d <= days; d++) flat.push(d);
  while (flat.length % 7 !== 0) flat.push(0);
  const weeks: number[][] = [];
  for (let i = 0; i < flat.length; i += 7) weeks.push(flat.slice(i, i + 7));

  const bVal = (s: string) => { const [m,d] = s.split("/").map(Number); return m*100+d; };
  const inB  = (b: CalendarBanner, d: number) => {
    const c = month*100+d;
    return c >= bVal(b.startDate) && c <= bVal(b.endDate);
  };

  // Each day cell ≈ (32% of 1280 − 13px padding − 6px total gap) / 7
  const CW = 52;

  return (
    <div>
      {/* Day-of-week header */}
      <div style={{ display:"grid", gridTemplateColumns:`repeat(7,${CW}px)`, gap:1, marginBottom:1 }}>
        {DOW.map((d,i) => (
          <div key={d} style={{
            textAlign:"center", fontWeight:700, fontSize:7,
            color: i===0 ? SUN : i===6 ? SAT : B,
            paddingBottom:2, lineHeight:1,
          }}>{d}</div>
        ))}
      </div>

      {/* Week rows */}
      {weeks.map((week, wi) => {
        const activeBanners = banners.filter(b => week.some(d => d>0 && inB(b,d)));
        return (
          <div key={wi} style={{ marginBottom:1 }}>

            {/* Banner strips */}
            {activeBanners.map((b, bi) => {
              const sc = week.findIndex(d => d>0 && inB(b,d));
              const cnt = week.filter(d => d>0 && inB(b,d)).length;
              const isFirst = !weeks.slice(0,wi).some(prev => prev.some(d => d>0 && inB(b,d)));
              return (
                <div key={bi} style={{ position:"relative", height:11 }}>
                  <div style={{
                    position:"absolute",
                    left: sc*(CW+1),
                    width: cnt*(CW+1)-1,
                    height:10,
                    background:"#BDD7EE",
                    borderRadius:2,
                    display:"flex", alignItems:"center", paddingLeft:3, overflow:"hidden",
                  }}>
                    {isFirst && (
                      <span style={{ fontSize:6, color:B, fontWeight:700, whiteSpace:"nowrap" }}>
                        {b.label}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Day cells */}
            <div style={{ display:"grid", gridTemplateColumns:`repeat(7,${CW}px)`, gap:1 }}>
              {week.map((day,di) => {
                if (!day) return (
                  <div key={di} style={{ height:34, border:`0.5px solid ${LG}`, background:"#FAFAFA" }} />
                );
                const key  = `${month}/${day}`;
                const evts = events[key] ?? [];
                const bnr  = banners.some(b => inB(b,day));
                return (
                  <div key={di} style={{
                    height:34, border:`0.5px solid ${LG}`,
                    background: bnr ? "#EBF3FB" : "#fff",
                    padding:"1px 2px", overflow:"hidden",
                  }}>
                    <div style={{
                      fontWeight:700, fontSize:7, lineHeight:1.2,
                      color: di===0 ? SUN : di===6 ? SAT : "#222",
                    }}>{day}</div>
                    {evts.map((e,ei) => (
                      <div key={ei} style={{ fontSize:5.5, color:GR, lineHeight:1.2 }}>•{e}</div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function BulletinPreview({ data }: { data: BulletinData }) {
  const [mm, yyyy] = data.calendarMonth.split("/").map(Number);

  const page: React.CSSProperties = {
    ...BASE_STYLE,
    width: PAGE_W, height: PAGE_H,
    background: "#fff",
    display: "flex", flexDirection: "row",
    padding: `${PM_V}px ${PM_H}px`,
    boxSizing: "border-box", overflow: "hidden",
  };

  // Column widths in px, computed off the page's CONTENT box (not the padded outer box) —
  // percentage widths on flex children resolve against the outer box in some renderers,
  // which silently overflowed the rightmost (cover) column by ~60px during PDF export.
  const CONTENT_W = PAGE_W - 2 * PM_H;
  const COL_W0 = Math.round(CONTENT_W * 0.32);
  const COL_W1 = Math.round(CONTENT_W * 0.40);
  const COL_W2 = CONTENT_W - COL_W0 - COL_W1;
  const COL_WS = [COL_W0, COL_W1, COL_W2];

  // Column container — each is a flex column
  const col = (i: 0|1|2): React.CSSProperties => ({
    display: "flex", flexDirection: "column", flexShrink: 0,
    boxSizing: "border-box", overflow: "hidden",
    width: COL_WS[i],
    paddingLeft:  i===0 ? 0 : CGAP,
    paddingRight: i===2 ? 0 : CGAP,
    borderRight:  i<2 ? `0.75px solid ${LG}` : "none",
  });

  const tbl: React.CSSProperties = { width:"100%", borderCollapse:"collapse", marginBottom:9 };
  const gap = (mb=9): React.CSSProperties => ({ marginBottom:mb });

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div id="bulletin-preview" style={{ width:PAGE_W, background:"#F0F0F0" }}>

      {/* ════════════ PAGE 1 ════════════ */}
      <div className="bulletin-page" style={{ ...page, marginBottom:2 }}>

        {/* ╔══ COL 1: Bible Reading · Memory Verses · Cleaning ══╗ */}
        <div style={col(0)}>

          {/* Bible Reading */}
          <div style={gap()}>
            <SecHead title="Bible Reading" />
            <table style={tbl}>
              <thead>
                <tr>
                  <TH w={28}> </TH>
                  {data.bibleReadingDates.map((d,i) => <TH key={i} center>{d}</TH>)}
                </tr>
              </thead>
              <tbody>
                {([
                  ["1\nReading",  data.bibleReading1],
                  ["2\nReadings", data.bibleReading2],
                ] as [string,string[]][]).map(([lbl,vals]) => (
                  <tr key={lbl}>
                    <td style={{
                      color:BL, fontWeight:700, fontSize:F.small,
                      padding:"2px 3px 2px 0", whiteSpace:"pre-line",
                      verticalAlign:"top", lineHeight:1.2,
                      borderBottom:`0.5px solid ${LG}`, width:28,
                    }}>{lbl}</td>
                    {vals.map((v,i) => (
                      <td key={i} style={{
                        fontSize:F.small, textAlign:"center", verticalAlign:"top",
                        padding:"2px 2px 2px 0", whiteSpace:"pre-line",
                        borderBottom:`0.5px solid ${LG}`, color:GR, lineHeight:1.25,
                      }}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Memory Verses */}
          <div style={gap()}>
            <SecHead title="Memory Verses" />
            {data.memoryVerses.map((v,i) => (
              <div key={i} style={{ marginBottom:8 }}>
                <VerseRow label={v.label} date={v.date} reference={v.reference} theme={v.theme} />
                <p style={{ fontSize:F.small, color:GR, lineHeight:1.45, marginTop:2 }}>
                  {v.text}
                </p>
              </div>
            ))}
          </div>

          {/* Lord's Day Cleaning Area */}
          <div style={gap(0)}>
            <SecHead title="Lord's Day Cleaning Area" />
            <table style={{ ...tbl, marginBottom:0 }}>
              <thead>
                <tr><TH>Location</TH><TH>Group</TH></tr>
              </thead>
              <tbody>
                {data.cleaningAreas.map((r,i) => (
                  <tr key={i}>
                    <TD xs>{r.location}</TD>
                    <TD xs>{r.group}</TD>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ╔══ COL 2: Sermon · Services · Seminar · Fellowship · Contact ══╗ */}
        <div style={col(1)}>

          {/* Lord's Day Sermon */}
          <div style={gap()}>
            <SecHead title="Lord's Day Sermon" />
            <table style={{ ...tbl }}>
              <tbody>
                {([
                  ["Title",         data.sermonTitle],
                  ["Main verse",    data.sermonVerse],
                  ["Speaker",       data.sermonSpeaker],
                  ["Ending praise", data.sermonEndingPraise],
                ] as [string,string][]).map(([lbl,val]) => (
                  <tr key={lbl}>
                    <td style={{
                      color:BL, fontWeight:700, fontSize:F.body,
                      padding:"1.5px 8px 1.5px 0",
                      whiteSpace:"nowrap", verticalAlign:"top",
                      lineHeight:1.3, width:78,
                    }}>{lbl}</td>
                    <td style={{
                      fontSize:F.body, color:GR,
                      padding:"1.5px 0", verticalAlign:"top", lineHeight:1.3,
                    }}>{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Services */}
          <div style={gap()}>
            <SecHead title="Services" />
            <table style={tbl}>
              <thead>
                <tr>
                  {["Sunday","Usher (SUN)","Lunch Duty","Child Care","Usher (WED)"].map(h => (
                    <TH key={h}>{h}</TH>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.services.map((r,i) => (
                  <tr key={i}>
                    {[r.date, r.usherSun, r.lunchDuty, r.childCare, r.usherWed].map((v,j) => (
                      <TD key={j} top xs>
                        <span style={{ whiteSpace:"pre-line" }}>{v}</span>
                      </TD>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* US East Coast Bible Seminar */}
          <div style={gap()}>
            <SecHead title="US East Coast Bible Seminar" />
            <table style={tbl}>
              <thead>
                <tr>
                  {["Date","Church","Speaker","Language"].map(h => <TH key={h}>{h}</TH>)}
                </tr>
              </thead>
              <tbody>
                {data.eastCoastSeminar.map((r,i) => (
                  <tr key={i}>
                    <TD noWrap xs>{r.date}</TD>
                    <TD xs>{r.church}</TD>
                    <TD xs>{r.speaker}</TD>
                    <TD xs>{r.language}</TD>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Services & Fellowship */}
          <div style={gap()}>
            <SecHead title="Services &amp; Fellowship" />
            <table style={{ ...tbl, marginBottom:0 }}>
              <tbody>
                {data.fellowship.map((r,i) => (
                  <tr key={i}>
                    <td style={{
                      color:BL, fontWeight:700, fontSize:F.body,
                      padding:"2px 8px 2px 0", whiteSpace:"nowrap",
                      borderBottom:`0.5px solid ${LG}`,
                    }}>{r.name}</td>
                    <td style={{ fontSize:F.body, color:GR, padding:"2px 8px 2px 0", borderBottom:`0.5px solid ${LG}` }}>{r.day}</td>
                    <td style={{ fontSize:F.body, color:GR, padding:"2px 8px 2px 0", whiteSpace:"nowrap", borderBottom:`0.5px solid ${LG}` }}>{r.time}</td>
                    <td style={{ fontSize:F.body, color:GR, padding:"2px 0", borderBottom:`0.5px solid ${LG}` }}>{r.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Contact — pinned to bottom */}
          <div style={{ marginTop:"auto", paddingTop:6, borderTop:`1px solid ${B}` }}>
            <p style={{ color:B, fontWeight:700, fontSize:F.contact, lineHeight:1.5, margin:0 }}>
              Pastor {data.phone}&nbsp;&nbsp;&nbsp;&nbsp;{data.email}
            </p>
            <p style={{ color:B, fontWeight:700, fontSize:F.contact, lineHeight:1.5, margin:0 }}>
              Address {data.address}
            </p>
          </div>
        </div>

        {/* ╔══ COL 3: Cover panel ══╗ */}
        <div style={{ ...col(2), alignItems:"center" }}>

          {/* No. / Date */}
          <div style={{
            width:"100%", display:"flex", justifyContent:"space-between",
            fontSize:F.small, lineHeight:1, marginBottom:6,
          }}>
            <span>No. {data.number}</span>
            <span>{data.date}</span>
          </div>

          {/* "Church Bulletin" — forced two-line break, matches original's stacked title */}
          <h1 style={{
            fontSize: F.title, fontWeight:900,
            textAlign:"center", letterSpacing:-1.5, lineHeight:1.0,
            color:"#000", margin:"6px 0 10px", width:"100%",
          }}>
            Church<br />Bulletin
          </h1>

          {/* Quote */}
          <div style={{ textAlign:"center", marginBottom:10, width:"100%", padding:"0 2px" }}>
            <p style={{
              fontStyle:"italic", fontWeight:700,
              fontSize:F.quote, lineHeight:1.65, whiteSpace:"pre-line", margin:0,
            }}>
              {data.quote}
            </p>
            <p style={{ fontWeight:700, fontSize:F.quoteRef, marginTop:5, marginBottom:0 }}>
              {data.quoteRef}
            </p>
          </div>

          {/* Church photo */}
          <div style={{
            width:"100%", flex:1, maxHeight:360,
            background:"#E2EAF4", borderRadius:3,
            marginBottom:8, overflow:"hidden",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/church.jpg"
              alt="New York Church building"
              style={{ width:"100%", height:"100%", objectFit:"cover" }}
            />
          </div>

          {/* Pastor */}
          <p style={{ textAlign:"center", fontSize:F.pastor, lineHeight:1.4, margin:"0 0 8px" }}>
            Pastor <strong style={{ fontWeight:900 }}>{data.pastor}</strong>
          </p>

          {/* Full logo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-full.png"
            alt="Jesus Baptist U.S.A. Conference — New York Church"
            style={{ width:"100%", objectFit:"contain", maxHeight:62 }}
          />
        </div>
      </div>

      {/* ════════════ PAGE 2 ════════════ */}
      <div className="bulletin-page" style={page}>

        {/* ╔══ COL 1: Calendar · Bible Seminar Info ══╗ */}
        <div style={col(0)}>
          <SecHead title={`Monthly Schedule ${data.calendarMonth}`} />
          <CalGrid month={mm} year={yyyy} events={data.calendarEvents} banners={data.calendarBanners} />

          <div style={{ marginTop:10 }}>
            <SecHead title="Bible Seminar Info" />
            <div style={{ border:`0.75px solid ${B}`, borderRadius:3, padding:"7px 12px" }}>
              <p style={{
                textAlign:"center", fontWeight:700, color:BL,
                fontSize:9, marginBottom:5, lineHeight:1.3,
              }}>
                {data.seminarInfo.title}
              </p>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <tbody>
                  {([
                    ["DATE",    data.seminarInfo.date],
                    ["SPEAKER", data.seminarInfo.speaker],
                  ] as [string,string][]).map(([lbl,val]) => (
                    <tr key={lbl}>
                      <td style={{ color:BL, fontWeight:700, fontSize:F.body, paddingRight:8, paddingBottom:2, width:54, whiteSpace:"nowrap" }}>{lbl}</td>
                      <td style={{ fontSize:F.body, color:GR, paddingBottom:2 }}>{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ╔══ COL 2: This week's schedule · NY Church News ══╗ */}
        <div style={col(1)}>

          <div style={gap()}>
            <SecHead title="This week's schedule" />
            <table style={tbl}>
              <tbody>
                {data.weekSchedule.flatMap((day,di) =>
                  day.items.map((item,ii) => (
                    <tr key={`${di}-${ii}`}>
                      {ii===0 && (
                        <td rowSpan={day.items.length} style={{
                          fontWeight:700, fontSize:F.body,
                          padding:"2px 6px 2px 0",
                          verticalAlign:"top", whiteSpace:"nowrap",
                          borderBottom:`0.5px solid ${LG}`, color:"#000",
                        }}>
                          {day.date}
                        </td>
                      )}
                      <TD top xs>{item.name}</TD>
                      <TD top xs>{item.location}</TD>
                      <TD top xs noWrap>{item.time}</TD>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div style={gap(0)}>
            <SecHead title="NY Church News" />
            {data.news.map((item,i) => (
              <div key={i} style={{ marginBottom:7 }}>
                <p style={{ fontWeight:700, fontSize:F.body, lineHeight:1.3, margin:"0 0 1px" }}>
                  {i+1}. {item.title}
                </p>
                {item.body.split("\n").filter(Boolean).map((line,li) => (
                  <p key={li} style={{
                    fontSize:F.small, color:GR,
                    paddingLeft:10, lineHeight:1.45, margin:0,
                  }}>
                    {"- "+line.replace(/^[-–•]\s*/,"")}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ╔══ COL 3: Prayer Request · Joint Prayer ══╗ */}
        <div style={col(2)}>

          <div style={gap()}>
            <SecHead title="Prayer Request" />
            <table style={{ ...tbl, tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: "19%" }} /><col style={{ width: "14%" }} /><col style={{ width: "17%" }} />
                <col style={{ width: "19%" }} /><col style={{ width: "14%" }} /><col style={{ width: "17%" }} />
              </colgroup>
              <thead>
                <tr>
                  <TH>Who</TH><TH>Whom</TH><TH>Relation</TH>
                  <TH>Who</TH><TH>Whom</TH><TH>Relation</TH>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: Math.ceil(data.prayerRequests.length/2) }, (_,i) => {
                  const L = data.prayerRequests[i*2];
                  const R = data.prayerRequests[i*2+1];
                  return (
                    <tr key={i}>
                      <TD xs>{L?.who}</TD>
                      <TD xs>{L?.whom}</TD>
                      <TD xs pr={10}>{L?.relation}</TD>
                      <TD xs>{R?.who??""}</TD>
                      <TD xs>{R?.whom??""}</TD>
                      <TD xs>{R?.relation??""}</TD>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={gap(0)}>
            <SecHead title="Joint Prayer" />
            {data.jointPrayer.map((item,i) => (
              <div key={i} style={{ marginBottom:7 }}>
                <p style={{ fontWeight:700, fontSize:F.body, lineHeight:1.3, margin:"0 0 1px" }}>
                  {i+1}. {item.title}
                </p>
                <p style={{ fontSize:F.small, color:GR, paddingLeft:10, lineHeight:1.45, margin:0 }}>
                  {"- "+item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
