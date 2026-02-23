"use client";

import { useState } from "react";
import { Search, GraduationCap, Clock, CheckCircle, XCircle, MoreVertical, Eye, Mail, Phone, Filter } from "lucide-react";

const mockStudents = [
    { id: "1", firstName: "Sarah", lastName: "Kamga", email: "sarah.k@gmail.com", phone: "+237 690 111 222", offer: "Permis B Classique", enrollmentStatus: "ACTIVE", progress: 65, hoursCompleted: 22, hoursRequired: 35, enrolledAt: "2025-01-15" },
    { id: "2", firstName: "Junior", lastName: "Moussa", email: "junior.m@gmail.com", phone: "+237 677 333 444", offer: "Permis Accéléré", enrollmentStatus: "ACTIVE", progress: 40, hoursCompleted: 16, hoursRequired: 40, enrolledAt: "2025-01-20" },
    { id: "3", firstName: "Alice", lastName: "Kotto", email: "alice.k@gmail.com", phone: "+237 655 555 666", offer: "Code Illimité", enrollmentStatus: "PENDING", progress: 0, hoursCompleted: 0, hoursRequired: 20, enrolledAt: "2025-02-22" },
    { id: "4", firstName: "Bruno", lastName: "Nganou", email: "bruno.n@gmail.com", phone: "+237 690 777 888", offer: "Permis B Classique", enrollmentStatus: "ACTIVE", progress: 90, hoursCompleted: 31, hoursRequired: 35, enrolledAt: "2024-11-10" },
    { id: "5", firstName: "Diane", lastName: "Fouda", email: "diane.f@gmail.com", phone: "+237 677 999 000", offer: "Permis B Classique", enrollmentStatus: "COMPLETED", progress: 100, hoursCompleted: 35, hoursRequired: 35, enrolledAt: "2024-09-05" },
    { id: "6", firstName: "Emmanuel", lastName: "Biya", email: "emmanuel.b@gmail.com", phone: "+237 655 111 333", offer: "Permis Moto A", enrollmentStatus: "PENDING", progress: 0, hoursCompleted: 0, hoursRequired: 20, enrolledAt: "2025-02-23" },
];

const statusConfig: Record<string, { label: string; class: string; icon: typeof CheckCircle }> = {
    ACTIVE: { label: "Actif", class: "bg-green-500/10 text-green-400", icon: CheckCircle },
    PENDING: { label: "En attente", class: "bg-yellow-500/10 text-yellow-400", icon: Clock },
    COMPLETED: { label: "Terminé", class: "bg-blue-500/10 text-blue-400", icon: CheckCircle },
    CANCELLED: { label: "Annulé", class: "bg-red-500/10 text-red-400", icon: XCircle },
};

export default function StudentsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("ALL");

    const filtered = mockStudents.filter(s => {
        const matchSearch = `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
        const matchStatus = filterStatus === "ALL" || s.enrollmentStatus === filterStatus;
        return matchSearch && matchStatus;
    });

    const pendingCount = mockStudents.filter(s => s.enrollmentStatus === "PENDING").length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-snow">Élèves</h1>
                    <p className="text-sm text-mist mt-0.5">{mockStudents.length} élèves inscrits · <span className="text-yellow-400">{pendingCount} en attente</span></p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mist/40" />
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Rechercher un élève..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-snow placeholder:text-mist/40 focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 transition-all text-sm" />
                </div>
                <div className="flex gap-2">
                    {["ALL", "ACTIVE", "PENDING", "COMPLETED"].map(st => (
                        <button key={st} onClick={() => setFilterStatus(st)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${filterStatus === st ? "bg-signal/10 text-signal border-signal/20" : "bg-white/5 text-mist border-white/10 hover:text-snow"}`}>
                            {st === "ALL" ? "Tous" : statusConfig[st]?.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/[0.06]">
                                <th className="text-left text-[10px] font-bold text-mist/40 uppercase tracking-wider px-5 py-3">Élève</th>
                                <th className="text-left text-[10px] font-bold text-mist/40 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Offre</th>
                                <th className="text-left text-[10px] font-bold text-mist/40 uppercase tracking-wider px-5 py-3">Statut</th>
                                <th className="text-left text-[10px] font-bold text-mist/40 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Progression</th>
                                <th className="text-left text-[10px] font-bold text-mist/40 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Inscrit le</th>
                                <th className="px-5 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((student) => {
                                const st = statusConfig[student.enrollmentStatus] || statusConfig.ACTIVE;
                                return (
                                    <tr key={student.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-signal/20 to-blue-500/20 flex items-center justify-center text-signal font-bold text-xs shrink-0">
                                                    {student.firstName[0]}{student.lastName[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-snow">{student.firstName} {student.lastName}</p>
                                                    <p className="text-[10px] text-mist/40">{student.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 hidden lg:table-cell">
                                            <span className="text-xs text-mist">{student.offer}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${st.class}`}>{st.label}</span>
                                        </td>
                                        <td className="px-5 py-4 hidden md:table-cell">
                                            <div className="flex items-center gap-3">
                                                <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${student.progress >= 100 ? "bg-green-400" : student.progress >= 60 ? "bg-signal" : "bg-blue-400"}`}
                                                        style={{ width: `${student.progress}%` }} />
                                                </div>
                                                <span className="text-xs text-mist/50 font-mono">{student.hoursCompleted}/{student.hoursRequired}h</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 hidden lg:table-cell">
                                            <span className="text-xs text-mist/40">{new Date(student.enrolledAt).toLocaleDateString("fr-FR")}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            {student.enrollmentStatus === "PENDING" ? (
                                                <div className="flex gap-1">
                                                    <button className="px-2.5 py-1 rounded-lg bg-green-500/10 text-green-400 text-[10px] font-bold hover:bg-green-500/20 transition-all">Valider</button>
                                                    <button className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 text-[10px] font-bold hover:bg-red-500/20 transition-all">Refuser</button>
                                                </div>
                                            ) : (
                                                <button className="p-1.5 rounded-lg hover:bg-white/5 text-mist/40 hover:text-snow opacity-0 group-hover:opacity-100 transition-all">
                                                    <Eye className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
