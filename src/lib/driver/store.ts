/* eslint-disable prettier/prettier */
import { driverApi } from "@/lib/api/client";
import type { MissionStatus } from "@/lib/admin/store";

export type DriverMission = {
  id: string;
  bookingId: string;
  assigneeId: string;
  assigneeName: string;
  type: string;
  scheduledAt: string;
  status: MissionStatus;
  notes: string;
  clientName: string;
  vehicleName: string;
  pickupLocation: string;
  hasReport: boolean;
};

export type TripReportPayload = {
  missionId: string;
  notes: string;
  incidents?: string;
  odometerEnd?: number;
  fuelLevel?: string;
};

export async function listDriverMissions(): Promise<DriverMission[]> {
  return driverApi.get<DriverMission[]>("/trip-reports/driver/missions");
}

export async function submitTripReport(payload: TripReportPayload) {
  return driverApi.post<{
    id: string;
    adminEmailSent: boolean;
    ratingScheduledAt: string;
  }>("/trip-reports", payload);
}
