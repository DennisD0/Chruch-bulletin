"use client";

import { useEffect, useState, useCallback } from "react";
import BulletinPreview, { PAGE_W, PAGE_H } from "@/app/components/BulletinPreview";
import type {
  BulletinData,
  ServiceRow,
  SeminarRow,
  MemoryVerse,
  CleaningRow,
  WeekScheduleDay,
  WeekScheduleItem,
  NewsItem,
  PrayerRequest,
  CalendarBanner,
  FellowshipRow,
} from "@/lib/bulletin-types";

// ---------------------------------------------------------------------------
// Shared small components
// ---------------------------------------------------------------------------

function Field({
  label,
  value,
  onChange,
  multiline = false,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
}) {
  const cls =
    "w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 focus:outline-none focus:border-blue-400";
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
        {label}
      </label>
      {multiline ? (
        <textarea
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cls}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cls}
        />
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-black uppercase tracking-widest text-blue-900 mb-4">
      {children}
    </h2>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm flex flex-col gap-4">
      {children}
    </div>
  );
}

function AddBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="self-start rounded-full border border-blue-200 bg-white px-4 py-1.5 text-xs font-bold text-blue-900 transition-colors hover:bg-blue-50"
    >
      + {label}
    </button>
  );
}

function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 rounded-full px-2 py-1 text-lg leading-none text-stone-300 hover:bg-stone-100 hover:text-stone-500 transition-colors"
    >
      ×
    </button>
  );
}

// ---------------------------------------------------------------------------
// Tab: Header
// ---------------------------------------------------------------------------

function HeaderTab({
  data,
  set,
}: {
  data: BulletinData;
  set: (patch: Partial<BulletinData>) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <Card>
        <SectionTitle>Bulletin header</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Bulletin number"
            value={data.number}
            onChange={(v) => set({ number: v })}
          />
          <Field
            label="Date"
            value={data.date}
            onChange={(v) => set({ date: v })}
          />
        </div>
        <Field
          label="Pastor name"
          value={data.pastor}
          onChange={(v) => set({ pastor: v })}
        />
      </Card>

      <Card>
        <SectionTitle>Cover quote</SectionTitle>
        <Field
          label="Quote text"
          value={data.quote}
          onChange={(v) => set({ quote: v })}
          multiline
          rows={2}
        />
        <Field
          label="Scripture reference"
          value={data.quoteRef}
          onChange={(v) => set({ quoteRef: v })}
        />
      </Card>

      <Card>
        <SectionTitle>Contact info</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Phone"
            value={data.phone}
            onChange={(v) => set({ phone: v })}
          />
          <Field
            label="Email"
            value={data.email}
            onChange={(v) => set({ email: v })}
          />
        </div>
        <Field
          label="Address"
          value={data.address}
          onChange={(v) => set({ address: v })}
        />
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Sermon
// ---------------------------------------------------------------------------

function SermonTab({
  data,
  set,
}: {
  data: BulletinData;
  set: (patch: Partial<BulletinData>) => void;
}) {
  return (
    <Card>
      <SectionTitle>Lord&apos;s Day Sermon</SectionTitle>
      <Field
        label="Title"
        value={data.sermonTitle}
        onChange={(v) => set({ sermonTitle: v })}
      />
      <Field
        label="Main verse"
        value={data.sermonVerse}
        onChange={(v) => set({ sermonVerse: v })}
      />
      <Field
        label="Speaker"
        value={data.sermonSpeaker}
        onChange={(v) => set({ sermonSpeaker: v })}
      />
      <Field
        label="Ending praise"
        value={data.sermonEndingPraise}
        onChange={(v) => set({ sermonEndingPraise: v })}
      />
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Tab: Services
// ---------------------------------------------------------------------------

function ServicesTab({
  data,
  set,
}: {
  data: BulletinData;
  set: (patch: Partial<BulletinData>) => void;
}) {
  const updateRow = (i: number, patch: Partial<ServiceRow>) => {
    const rows = data.services.map((r, idx) =>
      idx === i ? { ...r, ...patch } : r
    );
    set({ services: rows });
  };
  const addRow = () =>
    set({
      services: [
        ...data.services,
        { date: "", usherSun: "", lunchDuty: "", childCare: "", usherWed: "" },
      ],
    });
  const removeRow = (i: number) =>
    set({ services: data.services.filter((_, idx) => idx !== i) });

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <SectionTitle>Weekly duty roster</SectionTitle>
        {data.services.map((row, i) => (
          <div
            key={i}
            className="flex gap-2 items-start rounded-xl border border-stone-100 p-3"
          >
            <div className="flex-1 grid grid-cols-2 gap-3">
              <Field
                label="Date"
                value={row.date}
                onChange={(v) => updateRow(i, { date: v })}
              />
              <Field
                label="Usher (Sun)"
                value={row.usherSun}
                onChange={(v) => updateRow(i, { usherSun: v })}
              />
              <Field
                label="Lunch duty"
                value={row.lunchDuty}
                onChange={(v) => updateRow(i, { lunchDuty: v })}
                multiline
                rows={2}
              />
              <Field
                label="Child care"
                value={row.childCare}
                onChange={(v) => updateRow(i, { childCare: v })}
              />
              <Field
                label="Usher (Wed)"
                value={row.usherWed}
                onChange={(v) => updateRow(i, { usherWed: v })}
              />
            </div>
            <RemoveBtn onClick={() => removeRow(i)} />
          </div>
        ))}
        <AddBtn onClick={addRow} label="Add week" />
      </Card>

      <Card>
        <SectionTitle>US East Coast Bible Seminar</SectionTitle>
        {data.eastCoastSeminar.map((row, i) => (
          <div
            key={i}
            className="flex gap-2 items-start rounded-xl border border-stone-100 p-3"
          >
            <div className="flex-1 grid grid-cols-2 gap-3">
              <Field
                label="Date"
                value={row.date}
                onChange={(v) => {
                  const rows = data.eastCoastSeminar.map((r, idx) =>
                    idx === i ? { ...r, date: v } : r
                  );
                  set({ eastCoastSeminar: rows });
                }}
              />
              <Field
                label="Church"
                value={row.church}
                onChange={(v) => {
                  const rows = data.eastCoastSeminar.map((r, idx) =>
                    idx === i ? { ...r, church: v } : r
                  );
                  set({ eastCoastSeminar: rows });
                }}
              />
              <Field
                label="Speaker"
                value={row.speaker}
                onChange={(v) => {
                  const rows = data.eastCoastSeminar.map((r, idx) =>
                    idx === i ? { ...r, speaker: v } : r
                  );
                  set({ eastCoastSeminar: rows });
                }}
              />
              <Field
                label="Language"
                value={row.language}
                onChange={(v) => {
                  const rows = data.eastCoastSeminar.map((r, idx) =>
                    idx === i ? { ...r, language: v } : r
                  );
                  set({ eastCoastSeminar: rows });
                }}
              />
            </div>
            <RemoveBtn
              onClick={() =>
                set({
                  eastCoastSeminar: data.eastCoastSeminar.filter(
                    (_, idx) => idx !== i
                  ),
                })
              }
            />
          </div>
        ))}
        <AddBtn
          onClick={() =>
            set({
              eastCoastSeminar: [
                ...data.eastCoastSeminar,
                { date: "", church: "", speaker: "", language: "" },
              ],
            })
          }
          label="Add seminar row"
        />
      </Card>

      <Card>
        <SectionTitle>Services &amp; Fellowship (fixed schedule)</SectionTitle>
        {data.fellowship.map((row, i) => (
          <div
            key={i}
            className="flex gap-2 items-start rounded-xl border border-stone-100 p-3"
          >
            <div className="flex-1 grid grid-cols-2 gap-3">
              {(
                [
                  ["name", "Service name"],
                  ["day", "Day"],
                  ["time", "Time"],
                  ["location", "Location"],
                ] as [keyof FellowshipRow, string][]
              ).map(([key, lbl]) => (
                <Field
                  key={key}
                  label={lbl}
                  value={row[key]}
                  onChange={(v) => {
                    const rows = data.fellowship.map((r, idx) =>
                      idx === i ? { ...r, [key]: v } : r
                    );
                    set({ fellowship: rows });
                  }}
                />
              ))}
            </div>
            <RemoveBtn
              onClick={() =>
                set({
                  fellowship: data.fellowship.filter((_, idx) => idx !== i),
                })
              }
            />
          </div>
        ))}
        <AddBtn
          onClick={() =>
            set({
              fellowship: [
                ...data.fellowship,
                { name: "", day: "", time: "", location: "" },
              ],
            })
          }
          label="Add row"
        />
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Bible Reading
// ---------------------------------------------------------------------------

function BibleReadingTab({
  data,
  set,
}: {
  data: BulletinData;
  set: (patch: Partial<BulletinData>) => void;
}) {
  const days = data.bibleReadingDates;
  const updateDate = (i: number, v: string) => {
    const arr = [...data.bibleReadingDates];
    arr[i] = v;
    set({ bibleReadingDates: arr });
  };
  const update1 = (i: number, v: string) => {
    const arr = [...data.bibleReading1];
    arr[i] = v;
    set({ bibleReading1: arr });
  };
  const update2 = (i: number, v: string) => {
    const arr = [...data.bibleReading2];
    arr[i] = v;
    set({ bibleReading2: arr });
  };

  return (
    <Card>
      <SectionTitle>Weekly Bible reading</SectionTitle>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="text-left text-[10px] font-bold uppercase tracking-widest text-stone-400 pb-2 pr-3 whitespace-nowrap">
                Row
              </th>
              {days.map((_, i) => (
                <th key={i} className="pb-2 px-1">
                  <input
                    value={data.bibleReadingDates[i]}
                    onChange={(e) => updateDate(i, e.target.value)}
                    className="w-16 rounded-lg border border-stone-200 bg-white px-2 py-1 text-center text-xs font-bold text-stone-600 focus:outline-none focus:border-blue-400"
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {([
              ["Reading 1", data.bibleReading1, update1],
              ["Reading 2", data.bibleReading2, update2],
            ] as [string, string[], (i: number, v: string) => void][]).map(
              ([label, vals, updater]) => (
                <tr key={label}>
                  <td className="text-[10px] font-bold uppercase tracking-widest text-stone-400 pr-3 py-1 whitespace-nowrap align-top pt-2">
                    {label}
                  </td>
                  {days.map((_, i) => (
                    <td key={i} className="px-1 py-1 align-top">
                      <textarea
                        rows={2}
                        value={vals[i] ?? ""}
                        onChange={(e) => updater(i, e.target.value)}
                        className="w-full min-w-[90px] rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs text-stone-700 resize-none focus:outline-none focus:border-blue-400"
                      />
                    </td>
                  ))}
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Tab: Memory Verses
// ---------------------------------------------------------------------------

function MemoryVersesTab({
  data,
  set,
}: {
  data: BulletinData;
  set: (patch: Partial<BulletinData>) => void;
}) {
  const update = (i: number, patch: Partial<MemoryVerse>) => {
    const arr = data.memoryVerses.map((v, idx) =>
      idx === i ? { ...v, ...patch } : v
    );
    set({ memoryVerses: arr });
  };

  return (
    <div className="flex flex-col gap-5">
      {data.memoryVerses.map((verse, i) => (
        <Card key={i}>
          <SectionTitle>{verse.label} — Memory Verse</SectionTitle>
          <div className="grid grid-cols-3 gap-4">
            <Field
              label="Label"
              value={verse.label}
              onChange={(v) => update(i, { label: v })}
            />
            <Field
              label="Date"
              value={verse.date}
              onChange={(v) => update(i, { date: v })}
            />
            <Field
              label="Theme"
              value={verse.theme}
              onChange={(v) => update(i, { theme: v })}
            />
          </div>
          <Field
            label="Scripture reference"
            value={verse.reference}
            onChange={(v) => update(i, { reference: v })}
          />
          <Field
            label="Verse text"
            value={verse.text}
            onChange={(v) => update(i, { text: v })}
            multiline
            rows={4}
          />
        </Card>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Monthly Calendar
// ---------------------------------------------------------------------------

function CalendarTab({
  data,
  set,
}: {
  data: BulletinData;
  set: (patch: Partial<BulletinData>) => void;
}) {
  const [newDate, setNewDate] = useState("");
  const [newEvent, setNewEvent] = useState("");

  const addEvent = () => {
    if (!newDate.trim() || !newEvent.trim()) return;
    const prev = data.calendarEvents[newDate] ?? [];
    set({
      calendarEvents: { ...data.calendarEvents, [newDate]: [...prev, newEvent.trim()] },
    });
    setNewEvent("");
  };

  const removeEvent = (date: string, evtIdx: number) => {
    const prev = data.calendarEvents[date].filter((_, i) => i !== evtIdx);
    const next = { ...data.calendarEvents };
    if (prev.length === 0) delete next[date];
    else next[date] = prev;
    set({ calendarEvents: next });
  };

  const updateBanner = (i: number, patch: Partial<CalendarBanner>) => {
    set({
      calendarBanners: data.calendarBanners.map((b, idx) =>
        idx === i ? { ...b, ...patch } : b
      ),
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <SectionTitle>Calendar month</SectionTitle>
        <Field
          label="Month / Year (e.g. 07/2026)"
          value={data.calendarMonth}
          onChange={(v) => set({ calendarMonth: v })}
        />
      </Card>

      <Card>
        <SectionTitle>Daily events</SectionTitle>
        <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
          {Object.entries(data.calendarEvents)
            .sort(([a], [b]) => {
              const parse = (d: string) => {
                const [m, day] = d.split("/").map(Number);
                return m * 100 + day;
              };
              return parse(a) - parse(b);
            })
            .map(([date, events]) => (
              <div
                key={date}
                className="rounded-xl border border-stone-100 p-3 flex flex-col gap-1"
              >
                <span className="text-xs font-black text-blue-900">{date}</span>
                <div className="flex flex-wrap gap-1.5">
                  {events.map((evt, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 px-2 py-0.5 text-xs text-blue-800"
                    >
                      {evt}
                      <button
                        onClick={() => removeEvent(date, idx)}
                        className="text-blue-300 hover:text-red-400 leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ))}
        </div>

        <div className="border-t border-stone-100 pt-4 flex flex-col gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
            Add event
          </span>
          <div className="flex gap-2">
            <input
              placeholder="Date (e.g. 7/12)"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-28 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            />
            <input
              placeholder="Event name"
              value={newEvent}
              onChange={(e) => setNewEvent(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addEvent()}
              className="flex-1 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            />
            <button
              onClick={addEvent}
              className="rounded-xl bg-blue-900 px-4 py-2 text-sm font-bold text-white hover:bg-blue-800"
            >
              Add
            </button>
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle>Spanning events (banners)</SectionTitle>
        {data.calendarBanners.map((banner, i) => (
          <div
            key={i}
            className="flex gap-2 items-start rounded-xl border border-stone-100 p-3"
          >
            <div className="flex-1 grid grid-cols-3 gap-3">
              <Field
                label="Label"
                value={banner.label}
                onChange={(v) => updateBanner(i, { label: v })}
              />
              <Field
                label="Start date"
                value={banner.startDate}
                onChange={(v) => updateBanner(i, { startDate: v })}
              />
              <Field
                label="End date"
                value={banner.endDate}
                onChange={(v) => updateBanner(i, { endDate: v })}
              />
            </div>
            <RemoveBtn
              onClick={() =>
                set({
                  calendarBanners: data.calendarBanners.filter(
                    (_, idx) => idx !== i
                  ),
                })
              }
            />
          </div>
        ))}
        <AddBtn
          onClick={() =>
            set({
              calendarBanners: [
                ...data.calendarBanners,
                { label: "", startDate: "", endDate: "" },
              ],
            })
          }
          label="Add banner"
        />
      </Card>

      <Card>
        <SectionTitle>Bible Seminar info</SectionTitle>
        <Field
          label="Title"
          value={data.seminarInfo.title}
          onChange={(v) =>
            set({ seminarInfo: { ...data.seminarInfo, title: v } })
          }
        />
        <Field
          label="Date / time"
          value={data.seminarInfo.date}
          onChange={(v) =>
            set({ seminarInfo: { ...data.seminarInfo, date: v } })
          }
        />
        <Field
          label="Speaker"
          value={data.seminarInfo.speaker}
          onChange={(v) =>
            set({ seminarInfo: { ...data.seminarInfo, speaker: v } })
          }
        />
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Weekly Schedule
// ---------------------------------------------------------------------------

function WeeklyScheduleTab({
  data,
  set,
}: {
  data: BulletinData;
  set: (patch: Partial<BulletinData>) => void;
}) {
  const updateDay = (di: number, patch: Partial<WeekScheduleDay>) => {
    set({
      weekSchedule: data.weekSchedule.map((d, i) =>
        i === di ? { ...d, ...patch } : d
      ),
    });
  };

  const updateItem = (di: number, ii: number, patch: Partial<WeekScheduleItem>) => {
    const items = data.weekSchedule[di].items.map((it, i) =>
      i === ii ? { ...it, ...patch } : it
    );
    updateDay(di, { items });
  };

  const addItem = (di: number) => {
    const items = [
      ...data.weekSchedule[di].items,
      { name: "", location: "", time: "" },
    ];
    updateDay(di, { items });
  };

  const removeItem = (di: number, ii: number) => {
    const items = data.weekSchedule[di].items.filter((_, i) => i !== ii);
    updateDay(di, { items });
  };

  const addDay = () => {
    set({
      weekSchedule: [
        ...data.weekSchedule,
        { date: "", items: [{ name: "", location: "", time: "" }] },
      ],
    });
  };

  return (
    <div className="flex flex-col gap-5">
      {data.weekSchedule.map((day, di) => (
        <Card key={di}>
          <div className="flex items-center gap-3">
            <input
              value={day.date}
              onChange={(e) => updateDay(di, { date: e.target.value })}
              placeholder="Date (e.g. 6/28(Sun))"
              className="flex-1 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-bold text-blue-900 focus:outline-none focus:border-blue-400"
            />
            <RemoveBtn
              onClick={() =>
                set({
                  weekSchedule: data.weekSchedule.filter((_, i) => i !== di),
                })
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            {day.items.map((item, ii) => (
              <div
                key={ii}
                className="flex gap-2 items-start rounded-xl border border-stone-100 p-3"
              >
                <div className="flex-1 grid grid-cols-3 gap-3">
                  <Field
                    label="Event"
                    value={item.name}
                    onChange={(v) => updateItem(di, ii, { name: v })}
                  />
                  <Field
                    label="Location"
                    value={item.location}
                    onChange={(v) => updateItem(di, ii, { location: v })}
                  />
                  <Field
                    label="Time"
                    value={item.time}
                    onChange={(v) => updateItem(di, ii, { time: v })}
                  />
                </div>
                <RemoveBtn onClick={() => removeItem(di, ii)} />
              </div>
            ))}
          </div>

          <AddBtn onClick={() => addItem(di)} label="Add event" />
        </Card>
      ))}
      <AddBtn onClick={addDay} label="Add day" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: News
// ---------------------------------------------------------------------------

function NewsTab({
  data,
  set,
}: {
  data: BulletinData;
  set: (patch: Partial<BulletinData>) => void;
}) {
  const updateNews = (i: number, patch: Partial<NewsItem>) => {
    set({ news: data.news.map((n, idx) => (idx === i ? { ...n, ...patch } : n)) });
  };
  const updateJoint = (i: number, patch: Partial<NewsItem>) => {
    set({
      jointPrayer: data.jointPrayer.map((n, idx) =>
        idx === i ? { ...n, ...patch } : n
      ),
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <SectionTitle>NY Church News</SectionTitle>
        {data.news.map((item, i) => (
          <div
            key={i}
            className="flex gap-2 items-start rounded-xl border border-stone-100 p-3"
          >
            <div className="flex-1 flex flex-col gap-3">
              <Field
                label="Title"
                value={item.title}
                onChange={(v) => updateNews(i, { title: v })}
              />
              <Field
                label="Body"
                value={item.body}
                onChange={(v) => updateNews(i, { body: v })}
                multiline
                rows={3}
              />
            </div>
            <RemoveBtn
              onClick={() =>
                set({ news: data.news.filter((_, idx) => idx !== i) })
              }
            />
          </div>
        ))}
        <AddBtn
          onClick={() =>
            set({ news: [...data.news, { title: "", body: "" }] })
          }
          label="Add news item"
        />
      </Card>

      <Card>
        <SectionTitle>Joint Prayer</SectionTitle>
        {data.jointPrayer.map((item, i) => (
          <div
            key={i}
            className="flex gap-2 items-start rounded-xl border border-stone-100 p-3"
          >
            <div className="flex-1 flex flex-col gap-3">
              <Field
                label="Title"
                value={item.title}
                onChange={(v) => updateJoint(i, { title: v })}
              />
              <Field
                label="Body"
                value={item.body}
                onChange={(v) => updateJoint(i, { body: v })}
                multiline
                rows={3}
              />
            </div>
            <RemoveBtn
              onClick={() =>
                set({
                  jointPrayer: data.jointPrayer.filter((_, idx) => idx !== i),
                })
              }
            />
          </div>
        ))}
        <AddBtn
          onClick={() =>
            set({ jointPrayer: [...data.jointPrayer, { title: "", body: "" }] })
          }
          label="Add joint prayer"
        />
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Prayer Requests
// ---------------------------------------------------------------------------

function PrayerTab({
  data,
  set,
}: {
  data: BulletinData;
  set: (patch: Partial<BulletinData>) => void;
}) {
  const update = (i: number, patch: Partial<PrayerRequest>) => {
    set({
      prayerRequests: data.prayerRequests.map((r, idx) =>
        idx === i ? { ...r, ...patch } : r
      ),
    });
  };

  return (
    <Card>
      <SectionTitle>Prayer Requests</SectionTitle>
      <div className="flex flex-col gap-2">
        {data.prayerRequests.map((req, i) => (
          <div
            key={i}
            className="flex gap-2 items-center rounded-xl border border-stone-100 p-2"
          >
            <div className="flex-1 grid grid-cols-3 gap-2">
              <Field
                label="Who (requester)"
                value={req.who}
                onChange={(v) => update(i, { who: v })}
              />
              <Field
                label="Whom (person)"
                value={req.whom}
                onChange={(v) => update(i, { whom: v })}
              />
              <Field
                label="Relation"
                value={req.relation}
                onChange={(v) => update(i, { relation: v })}
              />
            </div>
            <RemoveBtn
              onClick={() =>
                set({
                  prayerRequests: data.prayerRequests.filter((_, idx) => idx !== i),
                })
              }
            />
          </div>
        ))}
      </div>
      <AddBtn
        onClick={() =>
          set({
            prayerRequests: [
              ...data.prayerRequests,
              { who: "", whom: "", relation: "" },
            ],
          })
        }
        label="Add prayer request"
      />
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Tab: Cleaning
// ---------------------------------------------------------------------------

function CleaningTab({
  data,
  set,
}: {
  data: BulletinData;
  set: (patch: Partial<BulletinData>) => void;
}) {
  const update = (i: number, patch: Partial<CleaningRow>) => {
    set({
      cleaningAreas: data.cleaningAreas.map((r, idx) =>
        idx === i ? { ...r, ...patch } : r
      ),
    });
  };

  return (
    <Card>
      <SectionTitle>Lord&apos;s Day Cleaning Areas</SectionTitle>
      {data.cleaningAreas.map((row, i) => (
        <div
          key={i}
          className="flex gap-2 items-center rounded-xl border border-stone-100 p-2"
        >
          <div className="flex-1 grid grid-cols-2 gap-3">
            <Field
              label="Location"
              value={row.location}
              onChange={(v) => update(i, { location: v })}
            />
            <Field
              label="Group"
              value={row.group}
              onChange={(v) => update(i, { group: v })}
            />
          </div>
          <RemoveBtn
            onClick={() =>
              set({
                cleaningAreas: data.cleaningAreas.filter((_, idx) => idx !== i),
              })
            }
          />
        </div>
      ))}
      <AddBtn
        onClick={() =>
          set({
            cleaningAreas: [...data.cleaningAreas, { location: "", group: "" }],
          })
        }
        label="Add area"
      />
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Tab: Preview
// ---------------------------------------------------------------------------

function PreviewTab({ data }: { data: BulletinData }) {
  const [zoom, setZoom] = useState(0.72);
  const [exporting, setExporting] = useState(false);
  const scaledH = (PAGE_H * 2 + 6) * zoom;

  async function exportPDF() {
    setExporting(true);
    try {
      // Server-side: Chrome headless renders /print with native fonts → perfect fidelity
      const res = await fetch("/api/export-pdf");
      if (!res.ok) {
        const { error } = await res.json();
        alert("Export failed: " + error);
        return;
      }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `bulletin-${data.number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Controls row */}
      <div className="flex items-center gap-3 bg-white rounded-2xl border border-stone-100 px-4 py-2 shadow-sm">
        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Zoom</span>
        <input
          type="range" min={0.4} max={1.2} step={0.02} value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="flex-1 accent-blue-900"
        />
        <span className="w-10 text-right text-xs font-bold text-blue-900 tabular-nums">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={exportPDF}
          disabled={exporting}
          className="ml-2 px-4 py-1.5 rounded-xl bg-blue-900 text-white text-xs font-bold
                     hover:bg-blue-800 disabled:opacity-50 disabled:cursor-wait transition"
        >
          {exporting ? "Exporting…" : "Export PDF"}
        </button>
      </div>

      {/* Scaled bulletin */}
      <div
        className="overflow-x-auto rounded-2xl border border-stone-200 shadow-sm"
        style={{ height: scaledH + 2 }}
      >
        <div style={{ transform: `scale(${zoom})`, transformOrigin: "top left", width: PAGE_W }}>
          <BulletinPreview data={data} />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

const TABS = [
  { id: "header",    label: "Header" },
  { id: "sermon",   label: "Sermon" },
  { id: "services", label: "Services" },
  { id: "bible",    label: "Bible Reading" },
  { id: "memory",   label: "Memory Verses" },
  { id: "calendar", label: "Calendar" },
  { id: "schedule", label: "Weekly Schedule" },
  { id: "news",     label: "News" },
  { id: "prayer",   label: "Prayer" },
  { id: "cleaning", label: "Cleaning" },
  { id: "preview",  label: "Preview" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function Home() {
  const [data, setData] = useState<BulletinData | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("header");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    fetch("/api/bulletin")
      .then((r) => r.json())
      .then(setData);
  }, []);

  const patch = useCallback((p: Partial<BulletinData>) => {
    setData((prev) => (prev ? { ...prev, ...p } : prev));
  }, []);

  const save = async () => {
    if (!data) return;
    setSaving(true);
    const res = await fetch("/api/bulletin", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    setSavedMsg(res.ok ? "Saved!" : "Error saving");
    setTimeout(() => setSavedMsg(""), 2000);
  };

  return (
    <div className="min-h-full flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-stone-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="New York Church"
            className="h-9 w-9 shrink-0 object-contain"
          />
          <div className="min-w-0 flex-1">
            <h1 className="whitespace-nowrap font-black leading-tight tracking-tight text-blue-900 text-[clamp(0.78rem,4vw,1rem)]">
              NEW YORK CHURCH
            </h1>
            <p className="text-stone-400 text-xs mt-0.5 tracking-wide">
              Bulletin editor
            </p>
          </div>

          <div className="flex items-center gap-3">
            {savedMsg && (
              <span
                className={`text-xs font-bold ${
                  savedMsg === "Saved!" ? "text-green-600" : "text-red-500"
                }`}
              >
                {savedMsg}
              </span>
            )}
            <button
              onClick={save}
              disabled={saving || !data}
              className="rounded-full bg-blue-900 px-5 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-800 disabled:opacity-40"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="max-w-5xl mx-auto px-4 pb-0 flex gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 px-3 py-2 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-blue-900 text-blue-900"
                  : "border-transparent text-stone-400 hover:text-stone-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        {!data ? (
          <div className="flex items-center gap-3 text-stone-400 text-sm">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-stone-200 border-t-blue-900" />
            Loading bulletin…
          </div>
        ) : (
          <>
            {activeTab === "header"    && <HeaderTab    data={data} set={patch} />}
            {activeTab === "sermon"    && <SermonTab    data={data} set={patch} />}
            {activeTab === "services"  && <ServicesTab  data={data} set={patch} />}
            {activeTab === "bible"     && <BibleReadingTab data={data} set={patch} />}
            {activeTab === "memory"    && <MemoryVersesTab data={data} set={patch} />}
            {activeTab === "calendar"  && <CalendarTab  data={data} set={patch} />}
            {activeTab === "schedule"  && <WeeklyScheduleTab data={data} set={patch} />}
            {activeTab === "news"      && <NewsTab      data={data} set={patch} />}
            {activeTab === "prayer"    && <PrayerTab    data={data} set={patch} />}
            {activeTab === "cleaning"  && <CleaningTab  data={data} set={patch} />}
            {activeTab === "preview"   && <PreviewTab   data={data} />}
          </>
        )}
      </main>
    </div>
  );
}
