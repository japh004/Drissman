"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock, MapPin, User } from "lucide-react";
import { PageTransition } from "@/components/ui/motion";
import { useAuth } from "@/hooks";
import { enrollmentService, type CandidateSessionDto } from "@/lib/enrollment-service";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; class: string }> = {
  SCHEDULED: { label: "Planifie", class: "bg-blue-500/10 text-blue-400" },
  CONFIRMED: { label: "Confirme", class: "bg-signal/10 text-signal" },
  IN_PROGRESS: { label: "En cours", class: "bg-amber-500/10 text-amber-400" },
  COMPLETED: { label: "Termine", class: "bg-green-500/10 text-green-400" },
  CANCELLED: { label: "Annule", class: "bg-red-500/10 text-red-400" },
  NO_SHOW: { label: "Absence", class: "bg-red-500/10 text-red-400" },
};

export default function CandidatPlanningPage() {
  const { token } = useAuth();
  const [sessions, setSessions] = useState<CandidateSessionDto[]>([]);

  useEffect(() => {
    if (!token) return;
    void enrollmentService
      .getMySessions(token)
      .then((data) =>
        setSessions(
          data.sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`)),
        ),
      )
      .catch((error: any) => toast.error(error.message || "Chargement planning impossible"));
  }, [token]);

  const upcoming = useMemo(
    () => sessions.filter((s) => s.status !== "COMPLETED" && s.status !== "CANCELLED"),
    [sessions],
  );
  const past = useMemo(() => sessions.filter((s) => s.status === "COMPLETED"), [sessions]);

  return (
    <PageTransition className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-snow">Mon Planning</h1>
        <p className="text-sm text-mist mt-0.5">{upcoming.length} seance(s) a venir</p>
      </div>

      <div>
        <h2 className="text-sm font-bold text-signal mb-3 uppercase tracking-wider">A venir</h2>
        {upcoming.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center bg-white/[0.03] rounded-2xl border border-white/[0.06]">
            <CalendarDays className="h-12 w-12 text-mist/15 mb-3" />
            <p className="text-sm text-mist/50">Aucune seance programmee</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((s) => {
              const st = statusConfig[s.status] || statusConfig.SCHEDULED;
              return (
                <div key={s.sessionId} className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-4 flex items-center gap-4">
                  <div className="bg-signal/10 text-signal font-mono text-xs font-bold p-2.5 rounded-xl text-center min-w-[90px]">
                    <div>{s.startTime}</div>
                    <div className="text-mist/30 text-[10px]">{s.date}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <h3 className="text-sm font-bold text-snow">{s.offerName}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${st.class}`}>{st.label}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-mist/50">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" />{s.monitorName}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{s.meetingPoint || "Lieu a definir"}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{s.startTime} - {s.endTime}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-sm font-bold text-mist/40 mb-3 uppercase tracking-wider">Historique</h2>
        {past.length === 0 ? (
          <p className="text-xs text-mist/30">Vos seances terminees apparaitront ici</p>
        ) : (
          <div className="space-y-2">
            {past.map((s) => (
              <div key={s.sessionId} className="bg-white/[0.02] rounded-xl border border-white/[0.04] p-3 flex items-center gap-4 opacity-70">
                <span className="text-xs text-mist/40 font-mono min-w-[80px] text-center">{s.date}</span>
                <div className="flex-1"><p className="text-sm text-mist">{s.offerName} · {s.monitorName}</p></div>
                <span className="bg-green-500/10 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-lg">Termine</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
