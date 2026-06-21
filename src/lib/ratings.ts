/* eslint-disable prettier/prettier */
import { publicApi } from "@/lib/api/client";

export type PublicReview = {
  id: string;
  clientName: string;
  comment: string;
  score: number;
  submittedAt: string;
  photoUri?: string;
  source?: "google" | "internal";
};

export type PublicReviewsResponse = {
  source: "google" | "internal" | "mixed" | "empty";
  businessName: string;
  averageScore: number;
  totalCount: number;
  reviews: PublicReview[];
  mapsUri: string;
};

export async function fetchPublicReviews(): Promise<PublicReviewsResponse> {
  return publicApi.get<PublicReviewsResponse>("/ratings/public");
}
