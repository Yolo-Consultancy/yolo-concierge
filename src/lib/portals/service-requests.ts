/* eslint-disable prettier/prettier */
import { api, clientApi, publicApi } from "@/lib/api/client";
import type { ServiceType } from "@/config/portals";

export type ServiceRequestStatus = "nouveau" | "en_cours" | "traite" | "annule";

export type ServiceRequest = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  serviceType: ServiceType | "general";
  status: ServiceRequestStatus;
  handled: boolean;
  createdAt: string;
};

export async function submitServiceRequest(payload: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  serviceType: ServiceType;
}) {
  return publicApi.post<ServiceRequest>("/contact", payload);
}

export async function listAdminServiceRequests(serviceType: ServiceType) {
  return api.get<ServiceRequest[]>(`/contact?serviceType=${serviceType}`);
}

export async function listMyServiceRequests(serviceType: ServiceType) {
  return clientApi.get<ServiceRequest[]>(`/contact/mine?serviceType=${serviceType}`);
}

export async function updateServiceRequestStatus(id: string, status: ServiceRequestStatus) {
  return api.patch<ServiceRequest>(`/contact/${id}/status`, { status });
}

export const STATUS_LABELS: Record<ServiceRequestStatus, string> = {
  nouveau: "Nouveau",
  en_cours: "En cours",
  traite: "Traité",
  annule: "Annulé",
};

export const STATUS_COLORS: Record<ServiceRequestStatus, string> = {
  nouveau: "bg-amber-500/15 text-amber-700",
  en_cours: "bg-blue-500/15 text-blue-700",
  traite: "bg-emerald-500/15 text-emerald-700",
  annule: "bg-muted text-muted-foreground",
};
