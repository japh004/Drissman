import { apiClient } from "./api-client";

export interface PaymentDto {
    id: string;
    enrollmentId: string;
    amount: number;
    status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
    method: string;
    phone: string | null;
    reference: string;
    createdAt: string;
    paidAt: string | null;
}

/** Mappe les libellés UI vers les codes backend (Invoice.PaymentMethod). */
export function toPaymentMethodCode(label: string): string {
    const normalized = label.trim().toLowerCase();
    if (normalized.includes("orange")) return "ORANGE_MONEY";
    if (normalized.includes("mtn") || normalized.includes("momo")) return "MTN_MOMO";
    if (normalized.includes("carte") || normalized.includes("card")) return "CARD";
    return "CASH";
}

export const paymentService = {
    initiate: (enrollmentId: string, method: string, phone: string, token: string) =>
        apiClient.post<PaymentDto>(
            "/payments/initiate",
            { enrollmentId, method: toPaymentMethodCode(method), phone },
            token,
        ),

    getMyPayments: (token: string) =>
        apiClient.get<PaymentDto[]>("/payments/me", token),

    confirm: (invoiceId: string, token: string) =>
        apiClient.post<PaymentDto>(`/schools/admin/payments/${invoiceId}/confirm`, undefined, token),
};
