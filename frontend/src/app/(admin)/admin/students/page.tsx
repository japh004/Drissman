"use client";

import { useEffect, useState } from "react";
import { useAuth, useLocalStorage } from "@/hooks";
import { Search, GraduationCap, CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { enrollmentService, EnrollmentDto } from "@/lib/enrollment-service";

interface CandidatEnrollment {
    id: string;
    offerId: string;
    offerName: string;
    schoolId: string;
    schoolName: string;
    price: number;
    hours: number;
    permitType: string;
    modules: { id: string; name: string; category: string; requiredHours: number }[];
    status: "PENDING" | "ACTIVE" | "COMPLETED" | "REFUSED";
    enrolledAt: string;
    studentId: string;
    studentName: string;
}

const statusConfig: Record<string, { label: string; class: string }> = {
    ACTIVE: { label: "Actif", class: "bg-green-500/10 text-green-400" },
    PENDING: { label: "En attente", class: "bg-yellow-500/10 text-yellow-400" },
    COMPLETED: { label: "Termine", class: "bg-blue-500/10 text-blue-400" },
    REFUSED: { label: "Refuse", class: "bg-red-500/10 text-red-400" },
};

export default function StudentsPage() {
    const { user, token } = useAuth();
    const [enrollments, setEnrollments] = useLocalStorage<CandidatEnrollment[]>("candidat_enrollments", []);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("ALL");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            if (!token) return;
            try {
                const remote = await enrollmentService.getAdminEnrollments(token);
                const mapped: CandidatEnrollment[] = remote.map((e: EnrollmentDto) => ({
                    id: e.id,
                    offerId: e.offerId,
                    offerName: e.offerName,
                    schoolId: e.schoolId,
                    schoolName: e.schoolName,
                    price: e.price,
                    hours: e.hours,
                    permitType: e.permitType,
                    modules: [],
                    status: e.status === "CANCELLED" ? "REFUSED" : (e.status as CandidatEnrollment["status"]),
                    enrolledAt: e.enrolledAt,
                    studentId: e.studentId,
                    studentName: e.studentName,
                }));
                setEnrollments(prev => {
                    // If API is temporarily empty but local already has data (fallback mode),
                    // keep local entries to avoid "disappearing" enrollments.
                    if (mapped.length === 0 && prev.length > 0) return prev;

                    const map = new Map<string, CandidatEnrollment>();
                    [...prev, ...mapped].forEach(item => map.set(item.id, item));
                    return Array.from(map.values());
                });
            } catch {
                // keep local fallback
            }
        };
        load();
    }, [setEnrollments, token]);

    const scopedEnrollments = enrollments.filter(e => {
        if (!user?.schoolId) return true;
        return e.schoolId === user.schoolId || e.schoolId === "admin-school";
    });

    const filtered = scopedEnrollments.filter(e => {
        const matchSearch = e.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.offerName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchStatus = filterStatus === "ALL" || e.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const pendingCount = scopedEnrollments.filter(e => e.status === "PENDING").length;
    const activeCount = scopedEnrollments.filter(e => e.status === "ACTIVE").length;

    const handleValidate = (id: string) => {
        if (token) {
            enrollmentService.updateEnrollmentStatus(id, "ACTIVE", token).catch(() => null);
        }
        setEnrollments(prev => prev.map(e =>
            e.id === id ? { ...e, status: "ACTIVE" as const } : e
        ));
        toast.success("Inscription validee !");
    };

    const handleRefuse = (id: string) => {
        if (token) {
            enrollmentService.updateEnrollmentStatus(id, "CANCELLED", token).catch(() => null);
        }
        setEnrollments(prev => prev.map(e =>
            e.id === id ? { ...e, status: "REFUSED" as const } : e
        ));
        toast.success("Inscription refusee");
    };

    function formatPrice(n: number) { return new Intl.NumberFormat("fr-FR").format(n); }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-snow">Eleves & Inscriptions</h1>
                    <p className="text-sm text-mist mt-0.5">
                        {scopedEnrollments.length} inscription{scopedEnrollments.length > 1 ? "s" : ""}
                        {pendingCount > 0 && <> · <span className="text-yellow-400">{pendingCount} en attente</span></>}
                        {activeCount > 0 && <> · <span className="text-green-400">{activeCount} actif{activeCount > 1 ? "s" : ""}</span></>}
                    </p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mist/40" />
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Rechercher un eleve ou une offre..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-snow placeholder:text-mist/40 focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 transition-all text-sm" />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {["ALL", "PENDING", "ACTIVE", "COMPLETED", "REFUSED"].map(st => (
                        <button key={st} onClick={() => setFilterStatus(st)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${filterStatus === st ? "bg-signal/10 text-signal border-signal/20" : "bg-white/5 text-mist border-white/10 hover:text-snow"}`}>
                            {st === "ALL" ? "Tous" : statusConfig[st]?.label}
                            {st === "PENDING" && pendingCount > 0 && <span className="ml-1 bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-md text-[9px]">{pendingCount}</span>}
                        </button>
                    ))}
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <GraduationCap className="h-16 w-16 text-mist/15 mb-4" />
                    <h3 className="text-lg font-bold text-snow/60 mb-1">
                        {scopedEnrollments.length === 0 ? "Aucune inscription" : "Aucun resultat"}
                    </h3>
                    <p className="text-sm text-mist/40 max-w-sm">
                        {scopedEnrollments.length === 0
                            ? "Les inscriptions apparaitront ici lorsque des eleves s'inscriront a vos offres."
                            : `Aucune inscription ne correspond a "${searchQuery}"`}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((enrollment) => {
                        const st = statusConfig[enrollment.status] || statusConfig.ACTIVE;
                        const isExpanded = expandedId === enrollment.id;
                        const nameParts = enrollment.studentName.split(" ");
                        const initials = (nameParts[0]?.[0] || "") + (nameParts[1]?.[0] || "");
                        return (
                            <div key={enrollment.id} className={`bg-white/[0.03] rounded-2xl border transition-all ${enrollment.status === "PENDING" ? "border-yellow-500/20" : "border-white/[0.06]"}`}>
                                <div className="p-4 flex items-center gap-4 cursor-pointer hover:bg-white/[0.02] transition-all rounded-2xl"
                                    onClick={() => setExpandedId(isExpanded ? null : enrollment.id)}>
                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-signal/20 to-blue-500/20 flex items-center justify-center text-signal font-bold text-xs shrink-0">
                                        {initials}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="text-sm font-bold text-snow">{enrollment.studentName}</h3>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${st.class}`}>{st.label}</span>
                                        </div>
                                        <p className="text-xs text-mist/50 mt-0.5">
                                            {enrollment.offerName} · Permis {enrollment.permitType} · {formatPrice(enrollment.price)} F · {enrollment.hours}h
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {enrollment.status === "PENDING" && (
                                            <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                                                <button onClick={() => handleValidate(enrollment.id)}
                                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-xs font-bold hover:bg-green-500/20 transition-all">
                                                    <CheckCircle className="h-3 w-3" /> Valider
                                                </button>
                                                <button onClick={() => handleRefuse(enrollment.id)}
                                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all">
                                                    <XCircle className="h-3 w-3" /> Refuser
                                                </button>
                                            </div>
                                        )}
                                        <span className="text-xs text-mist/30">
                                            {new Date(enrollment.enrolledAt).toLocaleDateString("fr-FR")}
                                        </span>
                                        {enrollment.modules.length > 0 && (
                                            <span className="text-mist/30">
                                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {isExpanded && enrollment.modules.length > 0 && (
                                    <div className="px-4 pb-4 pt-0">
                                        <p className="text-[10px] font-bold text-mist/40 uppercase tracking-wider mb-2">Modules inclus</p>
                                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                            {enrollment.modules.map((mod, i) => (
                                                <div key={i} className="bg-white/[0.02] rounded-xl border border-white/[0.04] p-2.5 flex items-center gap-2">
                                                    <span>{mod.category === "CODE" ? "??" : mod.category === "CONDUITE" ? "??" : "??"}</span>
                                                    <div>
                                                        <p className="text-xs font-bold text-snow">{mod.name}</p>
                                                        <p className="text-[10px] text-mist/40">{mod.requiredHours}h requises</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
