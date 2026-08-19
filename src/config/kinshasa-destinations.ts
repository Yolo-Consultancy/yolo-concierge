/* eslint-disable prettier/prettier */
/** Trois destinations populaires — location véhicules Kinshasa */

import destGombe from "@/assets/kinshasa/dest-gombe.jpg";
import destNdjili from "@/assets/kinshasa/dest-ndjili.jpg";
import destNgaliema from "@/assets/kinshasa/dest-ngaliema.jpg";

export type KinshasaDestination = {
  id: string;
  name: string;
  commune: string;
  description: string;
  image: string;
};

export const POPULAR_KINSHASA_DESTINATIONS: KinshasaDestination[] = [
  {
    id: "gombe",
    name: "Gombe",
    commune: "Gombe",
    description: "Centre-ville, boulevard du 30 Juin, hôtels & affaires",
    image: destGombe,
  },
  {
    id: "ndjili",
    name: "Aéroport de N'djili",
    commune: "N'djili",
    description: "Transferts arrivée & départ, accueil VIP",
    image: destNdjili,
  },
  {
    id: "ngaliema",
    name: "Ngaliema",
    commune: "Ngaliema",
    description: "Binza, Joli Parc, Ma Campagne, Delvaux",
    image: destNgaliema,
  },
];
