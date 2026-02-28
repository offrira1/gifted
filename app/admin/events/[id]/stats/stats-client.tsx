"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Download, Search } from "lucide-react";
import { exportGiftsCSV } from "@/server/actions/csv";

export type StatsRow = {
  id: string;
  createdAt: string;
  createdAtRaw: string;
  payerFirstName: string;
  payerLastName: string;
  giverDisplayName: string;
  amount: number;
  paymentMethod: string;
  status: string;
  blessingText: string | null;
  mediaUrl: string | null;
};

export function StatsClient({
  eventId,
  initialRows,
}: {
  eventId: string;
  initialRows: StatsRow[];
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [methodFilter, setMethodFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedBlessing, setExpandedBlessing] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let list = initialRows;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.payerFirstName.toLowerCase().includes(q) ||
          r.payerLastName.toLowerCase().includes(q) ||
          r.giverDisplayName.toLowerCase().includes(q)
      );
    }
    if (statusFilter) list = list.filter((r) => r.status === statusFilter);
    if (methodFilter) list = list.filter((r) => r.paymentMethod === methodFilter);
    if (dateFrom) list = list.filter((r) => r.createdAtRaw.slice(0, 10) >= dateFrom);
    if (dateTo) list = list.filter((r) => r.createdAtRaw.slice(0, 10) <= dateTo);
    return list;
  }, [initialRows, search, statusFilter, methodFilter, dateFrom, dateTo]);

  const statusOptions = useMemo(() => {
    const s = new Set(initialRows.map((r) => r.status));
    return Array.from(s);
  }, [initialRows]);

  const methodOptions = useMemo(() => {
    const m = new Set(initialRows.map((r) => r.paymentMethod));
    return Array.from(m);
  }, [initialRows]);

  function toggleBlessing(id: string) {
    setExpandedBlessing((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleExportCSV() {
    const csv = await exportGiftsCSV(eventId);
    if (!csv) return;
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gifts-${eventId.slice(0, 8)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/e/${eventId}`} target="_blank" rel="noopener">
            כנס לאירוע
            <ArrowRight className="h-4 w-4 ms-2" />
          </Link>
        </Button>
        <Button onClick={handleExportCSV} size="sm">
          <Download className="h-4 w-4 me-2" />
          הורד דוח CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>פילטרים</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="חיפוש שם..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-[200px]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">כל הסטטוסים</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">כל אמצעי התשלום</option>
            {methodOptions.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="max-w-[160px]"
            placeholder="מתאריך"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="max-w-[160px]"
            placeholder="עד תאריך"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>טבלת תשלומים ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-sm border-collapse" dir="rtl">
            <thead>
              <tr className="border-b">
                <th className="text-right py-2 pe-2">תאריך/שעה</th>
                <th className="text-right py-2 pe-2">שם משלם</th>
                <th className="text-right py-2 pe-2">נותן מתנה</th>
                <th className="text-right py-2 pe-2">סכום</th>
                <th className="text-right py-2 pe-2">אמצעי תשלום</th>
                <th className="text-right py-2 pe-2">סטטוס</th>
                <th className="text-right py-2 pe-2">ברכה</th>
                <th className="text-right py-2 pe-2">קבצים</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    אין רשומות
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="border-b">
                    <td className="py-2 pe-2">{r.createdAt}</td>
                    <td className="py-2 pe-2">{r.payerFirstName} {r.payerLastName}</td>
                    <td className="py-2 pe-2">{r.giverDisplayName}</td>
                    <td className="py-2 pe-2">₪{r.amount}</td>
                    <td className="py-2 pe-2">{r.paymentMethod}</td>
                    <td className="py-2 pe-2">{r.status}</td>
                    <td className="py-2 pe-2 max-w-[200px]">
                      {r.blessingText ? (
                        <>
                          <span className={expandedBlessing.has(r.id) ? "" : "line-clamp-2"}>
                            {r.blessingText}
                          </span>
                          <button
                            type="button"
                            className="text-primary text-xs me-1 underline"
                            onClick={() => toggleBlessing(r.id)}
                          >
                            {expandedBlessing.has(r.id) ? "הצג פחות" : "הצג עוד"}
                          </button>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-2 pe-2">
                      {r.mediaUrl ? (
                        <a
                          href={r.mediaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline text-xs"
                        >
                          צפייה
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
