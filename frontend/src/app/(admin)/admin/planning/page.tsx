"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth, useLocalStorage } from "@/hooks";
import { adminSessionService, type AvailableOfferDto, type SessionEnrollmentOptionDto, type SessionDto } from "@/lib/admin-session-service";
import { adminMonitorService, type AdminMonitorDto } from "@/lib/admin-monitor-service";

interface ModuleItem {
  id: string;
  name: string;
  lessons?: Array<{ id: string; name: string }>;
}

const emptyForm = {
  date: "",
  startTime: "09:00",
  endTime: "10:00",
  offerId: "",
  enrollmentId: "",
  monitorId: "",
  meetingPoint: "",
  moduleId: "",
  lessonId: "",
};

export default function PlanningPage() {
  const { token } = useAuth();
  const [modules] = useLocalStorage<ModuleItem[]>("modules", []);
  const [form, setForm] = useState(emptyForm);
  const [offers, setOffers] = useState<AvailableOfferDto[]>([]);
  const [enrollments, setEnrollments] = useState<SessionEnrollmentOptionDto[]>([]);
  const [monitors, setMonitors] = useState<AdminMonitorDto[]>([]);
  const [createdSessions, setCreatedSessions] = useState<SessionDto[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedModule = useMemo(() => modules.find((m) => m.id === form.moduleId), [modules, form.moduleId]);
  const availableLessons = selectedModule?.lessons || [];

  useEffect(() => {
    if (!token) return;
    void adminMonitorService
      .list(token)
      .then((data) => setMonitors(data.filter((m) => m.status === "ACTIVE")))
      .catch((error: any) => toast.error(error.message || "Impossible de charger les moniteurs"));
  }, [token]);

  useEffect(() => {
    if (!token || !form.date) {
      setOffers([]);
      return;
    }
    setLoadingOffers(true);
    void adminSessionService
      .availableOffers(form.date, token)
      .then((data) => setOffers(data))
      .catch((error: any) => toast.error(error.message || "Impossible de charger les offres disponibles"))
      .finally(() => setLoadingOffers(false));
  }, [token, form.date]);

  useEffect(() => {
    if (!token || !form.date || !form.offerId) {
      setEnrollments([]);
      return;
    }
    setLoadingEnrollments(true);
    void adminSessionService
      .availableEnrollments(form.offerId, form.date, token)
      .then((data) => setEnrollments(data))
      .catch((error: any) => toast.error(error.message || "Impossible de charger les eleves eligibles"))
      .finally(() => setLoadingEnrollments(false));
  }, [token, form.date, form.offerId]);

  const createSession = async () => {
    if (!token) return;
    if (!form.date) return toast.error("Date obligatoire");
    if (!form.offerId) return toast.error("Offre obligatoire");
    if (!form.enrollmentId) return toast.error("Eleve inscrit obligatoire");
    if (!form.monitorId) return toast.error("Moniteur obligatoire");
    if (!form.startTime || !form.endTime || form.startTime >= form.endTime) return toast.error("Plage horaire invalide");
    if (availableLessons.length > 0 && !form.lessonId) return toast.error("Lecon obligatoire");

    setSubmitting(true);
    try {
      const session = await adminSessionService.create(
        {
          enrollmentId: form.enrollmentId,
          monitorId: form.monitorId,
          date: form.date,
          startTime: form.startTime,
          endTime: form.endTime,
          meetingPoint: form.meetingPoint,
        },
        token,
      );
      setCreatedSessions((prev) => [session, ...prev]);
      setForm((prev) => ({ ...emptyForm, date: prev.date }));
      toast.success("Seance programmee");
    } catch (error: any) {
      toast.error(error.message || "Creation impossible");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-snow">Planning</h1>
        <p className="text-sm text-mist mt-0.5">Creation de seance liee a une offre disponible dans la periode selectionnee</p>
      </div>

      <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-mist uppercase tracking-wider">Date *</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) =>
                setForm((p) => ({ ...p, date: e.target.value, offerId: "", enrollmentId: "" }))
              }
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-mist uppercase tracking-wider">Offre disponible *</label>
            <select
              value={form.offerId}
              onChange={(e) => setForm((p) => ({ ...p, offerId: e.target.value, enrollmentId: "" }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow text-sm"
            >
              <option value="" className="bg-asphalt">
                {loadingOffers ? "Chargement..." : "Selectionner une offre"}
              </option>
              {offers.map((offer) => (
                <option key={offer.offerId} value={offer.offerId} className="bg-asphalt">
                  {offer.offerName} - Permis {offer.permitType}
                </option>
              ))}
            </select>
            {form.date && !loadingOffers && offers.length === 0 && (
              <p className="text-[10px] text-yellow-400/80">Aucune offre disponible sur cette periode/session.</p>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-mist uppercase tracking-wider">Eleve inscrit *</label>
            <select
              value={form.enrollmentId}
              onChange={(e) => setForm((p) => ({ ...p, enrollmentId: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow text-sm"
            >
              <option value="" className="bg-asphalt">
                {loadingEnrollments ? "Chargement..." : "Selectionner un eleve"}
              </option>
              {enrollments.map((enrollment) => (
                <option key={enrollment.enrollmentId} value={enrollment.enrollmentId} className="bg-asphalt">
                  {enrollment.studentName} ({enrollment.status})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-mist uppercase tracking-wider">Moniteur *</label>
            <select
              value={form.monitorId}
              onChange={(e) => setForm((p) => ({ ...p, monitorId: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow text-sm"
            >
              <option value="" className="bg-asphalt">
                Selectionner un moniteur
              </option>
              {monitors.map((monitor) => (
                <option key={monitor.id} value={monitor.id} className="bg-asphalt">
                  {monitor.firstName} {monitor.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-mist uppercase tracking-wider">Module</label>
            <select
              value={form.moduleId}
              onChange={(e) => setForm((p) => ({ ...p, moduleId: e.target.value, lessonId: "" }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow text-sm"
            >
              <option value="" className="bg-asphalt">Selectionner un module</option>
              {modules.map((module) => (
                <option key={module.id} value={module.id} className="bg-asphalt">{module.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-mist uppercase tracking-wider">Lecon</label>
            <select
              value={form.lessonId}
              onChange={(e) => setForm((p) => ({ ...p, lessonId: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow text-sm"
            >
              <option value="" className="bg-asphalt">{availableLessons.length > 0 ? "Selectionner une lecon" : "Aucune lecon"}</option>
              {availableLessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id} className="bg-asphalt">{lesson.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <input type="time" value={form.startTime} onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow text-sm" />
          <input type="time" value={form.endTime} onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow text-sm" />
          <input type="text" value={form.meetingPoint} onChange={(e) => setForm((p) => ({ ...p, meetingPoint: e.target.value }))} placeholder="Lieu de rendez-vous" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow text-sm" />
        </div>

        <button
          onClick={() => void createSession()}
          disabled={submitting}
          className="flex items-center gap-2 bg-gradient-to-r from-signal to-amber-400 text-asphalt font-bold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-all shadow-lg shadow-signal/20 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> {submitting ? "Creation..." : "Programmer la seance"}
        </button>
      </div>

      <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-6">
        <h2 className="text-base font-black text-snow mb-3">Dernieres seances creees</h2>
        {createdSessions.length === 0 ? (
          <div className="flex items-center gap-2 text-mist/50 text-sm">
            <CalendarDays className="h-4 w-4" /> Aucune creation sur cette session.
          </div>
        ) : (
          <div className="space-y-2">
            {createdSessions.map((session) => (
              <div key={session.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3 flex items-center justify-between">
                <div className="text-sm text-snow">
                  {session.date} {session.startTime} - {session.endTime}
                </div>
                <div className="text-xs text-mist/60 flex items-center gap-1">
                  <Users className="h-3 w-3" /> {session.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
