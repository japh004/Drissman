"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, CheckCircle, MapPin } from "lucide-react";
import { PageTransition } from "@/components/ui/motion";
import { useAuth } from "@/hooks";
import { monitorService, type MonitorSessionViewDto } from "@/lib/monitor-service";
import { toast } from "sonner";

function getWeekStart(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay() + 1 + offset * 7);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekDates(offset: number) {
  const start = getWeekStart(offset);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });
}

export default function MonitorPlanningPage() {
  const { token } = useAuth();
  const [sessions, setSessions] = useState<MonitorSessionViewDto[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadSessions = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await monitorService.getMySessions(token);
      setSessions(data);
    } catch (error: any) {
      toast.error(error.message || "Chargement planning impossible");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSessions();
  }, [token]);

  const weekDates = getWeekDates(weekOffset);
  const today = new Date().toISOString().split("T")[0];
  const weekSessions = useMemo(
    () => sessions.filter((s) => weekDates.includes(s.date) && s.status !== "CANCELLED"),
    [sessions, weekDates],
  );

  const markCompleted = async (id: string) => {
    if (!token) return;
    try {
      await monitorService.completeSession(id, undefined, token);
      await loadSessions();
      toast.success("Seance validee");
    } catch (error: any) {
      toast.error(error.message || "Validation impossible");
    }
  };

  return (
    <PageTransition className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-snow">Mon Planning</h1>
          <p className="text-sm text-mist mt-0.5">{weekSessions.length} seance(s) cette semaine</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekOffset((o) => o - 1)} className="p-2 rounded-xl bg-white/5 text-mist hover:text-snow transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => setWeekOffset((o) => o + 1)} className="p-2 rounded-xl bg-white/5 text-mist hover:text-snow transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-mist/60">Chargement...</div>
      ) : weekSessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white/[0.03] rounded-2xl border border-white/[0.06]">
          <CalendarDays className="h-16 w-16 text-mist/15 mb-4" />
          <h3 className="text-lg font-bold text-snow/60 mb-1">Aucune seance cette semaine</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {weekSessions.map((s) => (
            <div key={s.sessionId} className={`bg-white/[0.03] rounded-2xl border p-4 flex items-center gap-4 ${s.status === "COMPLETED" ? "opacity-60 border-green-500/20" : "border-white/[0.06]"}`}>
              <div className="bg-signal/10 text-signal font-mono text-xs font-bold p-2.5 rounded-xl text-center min-w-[90px]">
                <div>{s.startTime}</div>
                <div className="text-mist/30 text-[10px]">{s.date === today ? "Aujourd'hui" : s.date}</div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-snow">{s.offerName}</h3>
                <p className="text-xs text-mist/50">{s.studentName}</p>
                <p className="text-xs text-mist/50 flex items-center gap-1"><MapPin className="h-3 w-3" />{s.meetingPoint || "Lieu a definir"}</p>
              </div>
              {s.status !== "COMPLETED" && (
                <button onClick={() => void markCompleted(s.sessionId)} className="flex items-center gap-1 text-[10px] font-bold text-green-400 bg-green-500/10 px-2.5 py-1.5 rounded-lg hover:bg-green-500/20 transition-all">
                  <CheckCircle className="h-3 w-3" /> Valider
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </PageTransition>
  );
}
