import { useState, useCallback, useEffect } from "react";
import { moduleService } from "@/lib/api";
import { Module, CreateModulePayload } from "@/types/module";
import { toast } from "sonner";

export function useModules(schoolId?: string) {
    const [modules, setModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchModules = useCallback(async () => {
        if (!schoolId) return;
        setLoading(true);
        try {
            const data = await moduleService.getModules();
            setModules(data);
        } catch (err: any) {
            toast.error("Impossible de charger les modules");
        } finally {
            setLoading(false);
        }
    }, [schoolId]);

    useEffect(() => {
        fetchModules();
    }, [fetchModules]);

    const createModule = async (payload: CreateModulePayload) => {
        try {
            await moduleService.createModule(payload);
            await fetchModules();
            toast.success("Module créé");
            return true;
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la création du module");
            return false;
        }
    };

    const updateModule = async (moduleId: string, payload: CreateModulePayload) => {
        try {
            await moduleService.updateModule(moduleId, payload);
            await fetchModules();
            toast.success("Module modifié");
            return true;
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la modification");
            return false;
        }
    };

    const deleteModule = async (moduleId: string) => {
        try {
            await moduleService.deleteModule(moduleId);
            await fetchModules();
            toast.success("Module supprimé");
            return true;
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la suppression");
            return false;
        }
    };

    return {
        modules,
        loading,
        refetch: fetchModules,
        createModule,
        updateModule,
        deleteModule
    };
}
