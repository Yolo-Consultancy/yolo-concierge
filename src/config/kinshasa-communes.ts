/* eslint-disable prettier/prettier */
/** Communes et quartiers de Kinshasa — source administrative RDC */

export type KinshasaCommune = {
  id: string;
  name: string;
  alias?: string;
  quartiers: string[];
};

export const KINSHASA_COMMUNES: KinshasaCommune[] = [
  { id: "bandalungwa", name: "Bandalungwa", alias: "Bandal", quartiers: ["Adoula", "Bisengo", "Kasa-Vubu", "Lubudi", "Lumumba", "Makelele", "Molaert", "Tshibangu"] },
  { id: "barumbu", name: "Barumbu", quartiers: ["Bitshiaku-tshiaku (Bitshaka)", "Funa I", "Funa II", "Kapinga Bapu (Kapanga)", "Kasaï (Kasafi)", "Libulu", "Mozindo", "Ndolo", "Tshimanga"] },
  { id: "bumbu", name: "Bumbu", quartiers: ["Dipiya", "Kasaï", "Kwango", "Lokoro", "Lukenie", "Mai-Ndombé", "Mongala", "Ubangi"] },
  { id: "gombe", name: "Gombe", quartiers: ["Fleuve Congo", "Haut-Commandement", "Kalina", "Résidentiel"] },
  { id: "kalamu", name: "Kalamu", quartiers: ["Immo-Congo", "Kimbangu", "Matonge", "Pinzi", "Yolo-Nord", "Yolo-Sud"] },
  { id: "kasa-vubu", name: "Kasa-Vubu", quartiers: ["Katanga", "Lodja", "Lubumbashi", "Mfumu-Nsuka"] },
  { id: "kimbanseke", name: "Kimbanseke", quartiers: ["Kingasani", "Mokali", "Ngandu", "Nsanga"] },
  { id: "kinshasa", name: "Kinshasa (commune)", quartiers: ["Aketi", "Boyoma", "Djalo", "Madimba", "Mongala", "Ngabka", "Pende"] },
  { id: "kintambo", name: "Kintambo", quartiers: ["Itimbiri", "Kilimani", "Komorico", "Lubudi"] },
  { id: "kisenso", name: "Kisenso", quartiers: ["Amba", "Kimbangu", "Kitomesa", "Liboke"] },
  { id: "lemba", name: "Lemba", quartiers: ["Camp Bumba", "Camp Kabila", "Commercial", "Échangeur", "École", "Foire", "Gombele", "Kemi (Righini)", "Kimpwanza", "Livulu", "Madrandele", "Masano", "Mbanza-Lemba", "Molo", "Salongo"] },
  { id: "limete", name: "Limete", quartiers: ["Kingabwa", "Masina", "Mososo", "Résidentiel"] },
  { id: "lingwala", name: "Lingwala", quartiers: ["Lokole", "Poto-Poto", "Singa-Mopepe", "Voix du Peuple"] },
  { id: "makala", name: "Makala", quartiers: ["Baggata", "Concession", "Itaga", "Makala"] },
  { id: "maluku", name: "Maluku", quartiers: ["Kimpoko", "Maluku", "Mbankana", "Mongata"] },
  { id: "masina", name: "Masina", quartiers: ["Abattoir", "Mapela", "Pascal", "Sans-Fil"] },
  { id: "matete", name: "Matete", quartiers: ["Anunga", "Banunu", "Debonhomme", "Kimbangu"] },
  { id: "mont-ngafula", name: "Mont-Ngafula", quartiers: ["Cité-Verte", "Kindele", "Mama-Yemo", "Mitendi"] },
  {
    id: "ndjili",
    name: "N'djili",
    quartiers: Array.from({ length: 13 }, (_, i) => `Quartier ${i + 1}`),
  },
  { id: "ngaba", name: "Ngaba", quartiers: ["Bulambemba", "Laba", "Mukulua", "Telema"] },
  { id: "ngaliema", name: "Ngaliema", quartiers: ["Anciens Combattants", "Bangu (Delvaux)", "Basoko (GB)", "Binza Pigeon", "Djelo Binza", "Joli Parc", "Kinsuka Pêcheur", "Lukunga", "Ngomba Kikusa"] },
  { id: "ngiri-ngiri", name: "Ngiri-Ngiri", quartiers: ["Cartouche", "Elengesa", "Mayulu", "Saïo"] },
  { id: "nsele", name: "N'sele", quartiers: ["Badara", "Kinkole", "Mpasa", "Talangai"] },
  { id: "selembao", name: "Selembao", quartiers: ["Badiadingi", "Inga", "Liboke", "Ngafani"] },
];

export function getCommuneById(id: string) {
  return KINSHASA_COMMUNES.find((c) => c.id === id);
}

export function getCommuneLabel(id: string) {
  const c = getCommuneById(id);
  if (!c) return id;
  return c.alias ? `${c.name} (${c.alias})` : c.name;
}
