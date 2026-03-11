#!/usr/bin/env node
/**
 * Creates a sample data/programme.xlsx from the current programme page,
 * serving both as test data and format documentation for Florence.
 */

import { writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import ExcelJS from "exceljs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUTPUT = resolve(ROOT, "data/programme.xlsx");

const workbook = new ExcelJS.Workbook();

// ── Config sheet ──
const config = workbook.addWorksheet("Config");
config.getCell("A1").value = "Programme printemps-été 2026";
config.getCell("A2").value = "2026_programme_printemps_ete.pdf";
config.getColumn(1).width = 50;

// ── Events sheet ──
const events = workbook.addWorksheet("Événements");

const headers = [
  "Mois",
  "Jour",
  "Date",
  "Horaire",
  "Catégorie",
  "Titre",
  "Description",
  "Prix",
  "Contact",
];

const headerRow = events.addRow(headers);
headerRow.font = { bold: true };
headerRow.fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF4A7C59" },
};
headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };

// Set column widths
events.getColumn(1).width = 18;
events.getColumn(2).width = 14;
events.getColumn(3).width = 18;
events.getColumn(4).width = 22;
events.getColumn(5).width = 40;
events.getColumn(6).width = 50;
events.getColumn(7).width = 80;
events.getColumn(8).width = 30;
events.getColumn(9).width = 45;

// Sample data (subset of current programme)
const data = [
  // Janvier
  [
    "Janvier 2026",
    "Samedi",
    "31 janvier",
    "10h - 13h",
    "Atelier avec Rose",
    "Art du mouvement avec la méthode Feldenkrais — Le dos en mouvement !",
    "Vous souffrez de tensions cervicales, lombalgies, certaines difficultés à se pencher ou tourner la tête. Cet atelier est pour vous ! Lors de cette matinée, vous pratiquerez des mouvements simples, doux et inhabituels : Sentir et développer la richesse des possibilités de notre chaîne vertébrale pour redonner souplesse et vitalité à votre dos. Une invitation à redécouvrir un dos libre, vivant et un quotidien plus fluide !",
    "35 € + 5 € adhésion annuelle",
    "rosegiovannini@free.fr — http://www.rosegiovannini.com",
  ],
  [
    "",
    "Samedi",
    "31 janvier",
    "14h - 16h",
    "Atelier avec Rose",
    "1, 2, 3 Sommeil !",
    "Venez découvrir un système innovant afin d'améliorer votre sommeil !\nLe sommeil, c'est un besoin vital… mais parfois, il nous échappe. Longues nuits sans repos, agitation, pensées qui tournent en boucle… Cela vous parle ?\nLe Sounder Sleep Système, créé par Mickel Grumdman, praticien Feldenkrais, est une technique douce et puissante basée sur la respiration et des mini-mouvements.\nUne présentation claire du système, une pratique guidée de 30 minutes, un moment d'échange convivial autour d'une tisane Herbarius !",
    "Gratuit",
    "rosegiovannini@free.fr — http://www.rosegiovannini.com",
  ],

  // Février
  [
    "Février 2026",
    "Samedi",
    "14 février",
    "9h30 - 18h",
    "Stage avec Florence",
    "Débuter en permaculture",
    "À l'issue du stage, vous saurez ce qu'est la permaculture (philosophie et techniques). Vous pourrez mettre en pratique les notions-clés pour transformer votre lieu et installer un jardin en autonomie alimentaire, dans le respect de la Vie.\nC'est un stage pratique… vêtements et chaussures adaptées.",
    "100 €, incluant le repas et les boissons",
    "f.goulley@herbarius.net",
  ],
  [
    "",
    "Samedi",
    "21 février",
    "14h - 17h",
    "Stage avec Florence",
    "Plessage d'osier",
    "Venez apprendre à monter une barrière tressée en osier, une cabane pour les enfants et pleins d'autres réalisations ! Vous repartirez avec des branches de saule jaune pour mettre en pratique chez vous.\nApportez une paire de ciseaux, un sécateur et de bons gants de jardinage.",
    "35 € — Branches d'osier offertes, ainsi qu'une tisane",
    "f.goulley@herbarius.net",
  ],
  [
    "",
    "Dimanche",
    "22 février",
    "14h - 17h",
    "Atelier avec Florence Sagory, réflexologue esthéticienne",
    "Atelier cosmétiques au naturel — Crème hydratante au géranium rosat",
    "Venez créer votre crème hydratante au géranium rosat. L'occasion de passer un dimanche bien-être. Nous finirons par un goûter convivial.",
    "Participation libre",
    "06 31 50 68 00",
  ],
  [
    "",
    "Samedi",
    "28 février",
    "15h - 17h30",
    "Atelier avec Florence",
    "Jardiner au naturel — Que semer mois par mois ? Comment réussir ses semis ?",
    "Venez découvrir comment composter, nourrir le jardin, pailler en réutilisant vos propres ressources (tontes, tailles) !\nEn collaboration avec Lamballe Terre et Mer.",
    "Gratuit",
    "06.03.43.25.28 ou preventiondechets@lamballe-terre-mer.bzh",
  ],

  // Mars
  [
    "Mars 2026",
    "Samedi",
    "21 mars",
    "14h30 - 17h",
    "Atelier avec Isabelle",
    "Élixirs floraux harmonisants du printemps",
    "Venez à la découverte des Fleurs de Bach !",
    "25 €",
    "02.96.32.68.21",
  ],
  [
    "",
    "Dimanche",
    "22 mars",
    "9h - 18h",
    "Exposition",
    "Herbarius expose au Marché des plantes d'Andel",
    "Entrée gratuite.",
    "Entrée gratuite",
    "https://comitedesfetesandel.com/",
  ],
  [
    "",
    "Samedi",
    "28 mars",
    "15h - 17h30",
    "Atelier avec Florence",
    "Jardiner au naturel — Le potager de mars, que semer, comment réussir ?",
    "Venez découvrir comment composter, nourrir le jardin, pailler en réutilisant vos propres ressources (tontes, tailles) !\nEn collaboration avec Lamballe Terre et Mer.",
    "Gratuit",
    "06.03.43.25.28 ou preventiondechets@lamballe-terre-mer.bzh",
  ],

  // Avril
  [
    "Avril 2026",
    "Sam. & Dim.",
    "11 - 12 avril",
    "10h - 18h",
    "Exposition",
    "Fête des plantes de Vue sur Vert — Golf de Lancieux (22)",
    "19, Avenue des Ajoncs.",
    "Entrée 2 € — Gratuit enfants",
    "https://www.facebook.com/Vuesurvert.infos/",
  ],
  [
    "",
    "Sam. & Dim.",
    "18 - 19 avril",
    "9h30 - 18h",
    "Exposition",
    "Fête des jardins — Château de Pommorio, Tréveneuc",
    "",
    "Entrée 5 € — Gratuit -16 ans",
    "http://fetedesjardins.com/",
  ],
  [
    "",
    "Samedi",
    "18 avril",
    "14h30 - 17h",
    "Atelier avec Isabelle",
    "Élixirs floraux harmonisants des émotions",
    "Venez à la découverte des Fleurs de Bach !",
    "25 €",
    "02.96.32.68.21",
  ],
  [
    "",
    "Sam. & Dim.",
    "25 - 26 avril",
    "Sam. 13h-19h / Dim. 10h-19h",
    "Exposition",
    "Fête des jardins des Côtes d'Armor — Château de La Roche Jagu, Ploëzal (22)",
    "",
    "Entrée gratuite",
    "https://www.larochejagu.fr",
  ],

  // Mai
  [
    "Mai 2026",
    "Jeudi",
    "1er mai",
    "9h30 - 18h",
    "Exposition",
    "38ème journée des plantes à Brest",
    "Conservatoire Botanique — Rampe du Stang'alar.",
    "Entrée gratuite",
    "https://archeauxplantes.jimdofree.com/",
  ],
  [
    "",
    "Dimanche",
    "3 mai",
    "10h - 19h",
    "Exposition",
    "Nature en fête — Parc de Port Breton, Dinard",
    "Organisé par la ville de Dinard.",
    "Gratuit",
    "https://www.ville-dinard.fr/agenda/nature-en-fete/",
  ],
  [
    "",
    "Dimanche",
    "10 mai",
    "14h - 17h",
    "Atelier avec Florence Sagory, réflexologue esthéticienne",
    "Atelier cosmétiques au naturel — Huile aux fleurs du jardin",
    "Venez créer votre huile aux fleurs du jardin qui servira au massage ou à la relaxation. Initiation à la réflexologie fasciale. Nous finirons par un goûter convivial.",
    "Participation libre",
    "06 31 50 68 00",
  ],
  [
    "",
    "Jeudi",
    "14 mai",
    "10h - 18h",
    "Exposition",
    "La fête du Potager — Domaine de la Hardouinais, Saint Launeuc (22)",
    "Près de Merdrignac.",
    "Entrée 2 € — Gratuit -12 ans",
    "https://www.arduen.com",
  ],
  [
    "",
    "Jeudi",
    "14 mai",
    "10h - 13h",
    "Atelier avec Rose",
    "Art du mouvement — Feldenkrais : L'aisance dans la marche",
    "Cycle « Éveille ton printemps ». Découvrez comment votre bassin, source de force et de stabilité, s'articule avec vos hanches pour vous permettre de bouger avec fluidité et liberté.",
    "35 € la matinée / 60 € les 2 matinées",
    "rosegiovannini@free.fr — 06 09 31 00 13",
  ],
  [
    "",
    "Vendredi",
    "15 mai",
    "10h - 13h",
    "Atelier avec Rose",
    "Art du mouvement — Feldenkrais : Je respire donc je vis !",
    "Cycle « Éveille ton printemps ». Apprenez à ouvrir vos côtes et votre cage thoracique pour libérer votre souffle et ressentir pleinement chaque inspiration.",
    "35 € la matinée / 60 € les 2 matinées",
    "rosegiovannini@free.fr — 06 09 31 00 13",
  ],
  [
    "",
    "Samedi",
    "16 mai",
    "14h30 - 17h",
    "Atelier avec Isabelle",
    "Élixirs floraux harmonisants de la volonté",
    "Venez à la découverte des Fleurs de Bach !",
    "25 €",
    "02 96 32 68 21",
  ],
  [
    "",
    "Dimanche",
    "17 mai",
    "9h - 18h",
    "Exposition",
    "22ème fête du jardinage et de l'agriculture — Belle Isle en Terre",
    "Château de Lady Mond — Centre d'Initiation à la Rivière. Organisé par Eau et Rivières de Bretagne.",
    "Gratuit",
    "https://www.eau-et-rivieres.org/fete-jardinage2026",
  ],
  [
    "",
    "Mardi",
    "19 mai",
    "18h - 19h15",
    "Atelier avec Rose",
    "Art du mouvement — Feldenkrais : Petit à petit, l'oiseau fait son nid",
    "Cycle « Un été en mouvement ! ». Un temps pour soi en pratiquant des mouvements doux et guidés, pour se déposer, respirer et se régénérer en profondeur.",
    "15 € la séance / 70 € le cycle de 6 séances",
    "rosegiovannini@free.fr — 06 09 31 00 13",
  ],
  [
    "",
    "Mardi",
    "26 mai",
    "18h - 19h15",
    "Atelier avec Rose",
    "Art du mouvement — Feldenkrais : Petit à petit, l'oiseau fait son nid",
    "Cycle « Un été en mouvement ! ». Un temps pour soi en pratiquant des mouvements doux et guidés, pour se déposer, respirer et se régénérer en profondeur.",
    "15 € la séance / 70 € le cycle de 6 séances",
    "rosegiovannini@free.fr — 06 09 31 00 13",
  ],

  // Juin
  [
    "Juin 2026",
    "Ven. Sam. Dim.",
    "5 - 7 juin",
    "Ven. 14h-18h / Sam. 9h-12h / Dim. 14h-17h",
    "Rendez-vous aux Jardins — Thème : La vue",
    "Rendez-vous aux Jardins",
    "Le jardin est ouvert avec des visites guidées :\n- Vendredi 15h — Visite guidée « Les légumes anciens » — 5 €\n- Samedi 10h — Visite guidée « Histoire des jardins » — 5 €\n- Dimanche — Visite guidée « Les épices au potager permacole » — 5 €",
    "5 € par visite guidée",
    "https://rendezvousauxjardins.culture.gouv.fr/",
  ],
  [
    "",
    "Samedi",
    "6 juin",
    "15h - 17h30",
    "Atelier avec Florence",
    "Jardiner au naturel — Comment faire avec la canicule ?",
    "En collaboration avec Lamballe Terre et Mer.",
    "Gratuit",
    "06.03.43.25.28 ou preventiondechets@lamballe-terre-mer.bzh",
  ],
  [
    "",
    "Samedi",
    "13 juin",
    "14h30 - 17h",
    "Atelier avec Isabelle",
    "Élixirs floraux harmonisants des tempéraments",
    "Venez à la découverte des Fleurs de Bach !",
    "25 €",
    "02.96.32.68.21",
  ],
  [
    "",
    "Samedi",
    "20 juin",
    "15h - 17h30",
    "Atelier avec Florence",
    "Jardiner au naturel — Biodiversité au jardin, quel intérêt ?",
    "En collaboration avec Lamballe Terre et Mer.",
    "Gratuit",
    "06.03.43.25.28 ou preventiondechets@lamballe-terre-mer.bzh",
  ],

  // Juillet
  [
    "Juillet 2026",
    "Mardi",
    "7 juillet",
    "10h - 12h",
    "Sortie botanique — En partenariat avec la ville de Plérin",
    "Sortie botanique sur le GR34 — Pointe du Roselier, Plérin (22)",
    "Florence, horticultrice et botaniste, vous emmène à la découverte des plantes sauvages comestibles et médicinales sur le GR34.",
    "",
    "Information et réservation : 02 96 79 80 02",
  ],
  [
    "",
    "Jeudi",
    "16 juillet",
    "10h - 11h15",
    "Atelier avec Rose",
    "Art du mouvement — Feldenkrais : Comme un poisson dans l'eau",
    "Cycle « Un été en mouvement ! ». Retrouver de l'aisance et de la fluidité dans vos articulations.",
    "15 € la séance / 70 € le cycle de 6 séances",
    "rosegiovannini@free.fr — 06 09 31 00 13",
  ],
  [
    "",
    "Jeudi",
    "16 juillet",
    "14h - 16h",
    "Visite guidée — Lamballe Armor",
    "Découverte du jardin médiéval de l'église Saint Jean à Lamballe",
    "Lors des jeudis festifs de l'été, Florence vous invite à explorer le jardin médiéval situé au pied de l'église Saint Jean.",
    "Gratuit",
    "Animation proposée par Lamballe Armor",
  ],
  [
    "",
    "Jeudi",
    "23 juillet",
    "10h - 11h15",
    "Atelier avec Rose",
    "Art du mouvement — Feldenkrais : Comme un poisson dans l'eau",
    "Cycle « Un été en mouvement ! ». Retrouver de l'aisance et de la fluidité dans vos articulations.",
    "15 € la séance / 70 € le cycle de 6 séances",
    "rosegiovannini@free.fr — 06 09 31 00 13",
  ],
  [
    "",
    "Jeudi",
    "23 juillet",
    "14h - 16h",
    "Visite guidée — Lamballe Armor",
    "Découverte du jardin médiéval de l'église Saint Jean à Lamballe",
    "Lors des jeudis festifs de l'été.",
    "Gratuit",
    "Animation proposée par Lamballe Armor",
  ],
  [
    "",
    "Jeudi",
    "30 juillet",
    "10h - 11h15",
    "Atelier avec Rose",
    "Art du mouvement — Feldenkrais : Comme un poisson dans l'eau",
    "Cycle « Un été en mouvement ! ». Retrouver de l'aisance et de la fluidité dans vos articulations.",
    "15 € la séance / 70 € le cycle de 6 séances",
    "rosegiovannini@free.fr — 06 09 31 00 13",
  ],
];

for (const row of data) {
  events.addRow(row);
}

// Wrap text in description column
events.getColumn(7).alignment = { wrapText: true, vertical: "top" };

await workbook.xlsx.writeFile(OUTPUT);
console.log(`Sample Excel written to ${OUTPUT}`);
