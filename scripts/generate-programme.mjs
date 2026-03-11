#!/usr/bin/env node
/**
 * Reads data/programme.xlsx and regenerates the events section
 * of src/fr/programme.njk and src/en/programme.njk.
 *
 * The EN version is translated via DeepL API (free tier).
 * Set DEEPL_API_KEY env var to enable translation.
 * Without it, only the FR page is generated.
 *
 * Excel format:
 *   Sheet "Config":  A1=titre du programme, A2=nom du fichier PDF
 *   Sheet "Événements": columns Mois|Jour|Date|Horaire|Catégorie|Titre|Description|Prix|Contact
 */

import { readFile, writeFile, readdir, copyFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import ExcelJS from "exceljs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const XLSX_PATH = resolve(ROOT, "data/programme.xlsx");
const FR_PATH = resolve(ROOT, "src/fr/programme.njk");
const EN_PATH = resolve(ROOT, "src/en/programme.njk");

const START_MARKER = "<!-- PROGRAMME-EVENTS-START -->";
const END_MARKER = "<!-- PROGRAMME-EVENTS-END -->";

const DEEPL_API_KEY = process.env.DEEPL_API_KEY || "";

// ── DeepL translation ───────────────────────────────────────────────────

async function translateBatch(texts) {
  if (!DEEPL_API_KEY || texts.length === 0) return texts;

  // DeepL free API uses api-free.deepl.com, pro uses api.deepl.com
  const host = DEEPL_API_KEY.endsWith(":fx")
    ? "api-free.deepl.com"
    : "api.deepl.com";

  const results = [];

  // DeepL accepts max 50 texts per request — batch accordingly
  for (let i = 0; i < texts.length; i += 50) {
    const batch = texts.slice(i, i + 50);
    const params = new URLSearchParams();
    for (const t of batch) {
      params.append("text", t);
    }
    params.append("source_lang", "FR");
    params.append("target_lang", "EN-GB");

    const res = await fetch(`https://${host}/v2/translate`, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`DeepL API error ${res.status}: ${body}`);
    }

    const data = await res.json();
    for (const t of data.translations) {
      results.push(t.text);
    }
  }

  return results;
}

async function translateMonths(months, titre) {
  // Collect all translatable strings with their paths
  const texts = [];

  // Title
  texts.push(titre);

  // Month names
  for (const month of months) {
    texts.push(month.name);
  }

  // Event fields (jour, date, horaire, categorie, titre, description, prix)
  // Contact is NOT translated (names, emails, phones, URLs)
  for (const month of months) {
    for (const event of month.events) {
      texts.push(event.jour);
      texts.push(event.date);
      texts.push(event.horaire);
      texts.push(event.categorie);
      texts.push(event.titre);
      texts.push(event.description);
      texts.push(event.prix);
    }
  }

  // Filter empty strings — DeepL rejects them
  // Keep track of indices to map back
  const indexMap = [];
  const toTranslate = [];
  for (let i = 0; i < texts.length; i++) {
    if (texts[i]) {
      indexMap.push(i);
      toTranslate.push(texts[i]);
    }
  }

  console.log(`Translating ${toTranslate.length} strings via DeepL...`);
  const translated = await translateBatch(toTranslate);

  // Map back
  const result = [...texts];
  for (let i = 0; i < indexMap.length; i++) {
    result[indexMap[i]] = translated[i];
  }

  // Rebuild structure
  let idx = 0;
  const enTitre = result[idx++];

  const enMonths = months.map((month) => {
    const enMonth = { name: result[idx++], id: month.id, events: [] };
    for (const event of month.events) {
      enMonth.events.push({
        jour: result[idx++],
        date: result[idx++],
        horaire: result[idx++],
        categorie: result[idx++],
        titre: result[idx++],
        description: result[idx++],
        prix: result[idx++],
        contact: event.contact, // NOT translated
      });
    }
    return enMonth;
  });

  return { enTitre, enMonths };
}

// ── Contact auto-linking ────────────────────────────────────────────────

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatPhone(raw) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 10) {
    return "+33" + digits.slice(1);
  }
  if (digits.startsWith("33") && digits.length === 11) {
    return "+" + digits;
  }
  return null;
}

function autoLinkContact(text) {
  if (!text) return "";

  // Split on separators while keeping them
  const parts = text.split(/([\s]+(?:—|\/|ou|or)[\s]+)/);

  return parts
    .map((part) => {
      const trimmed = part.trim();

      // Email
      const emailMatch = trimmed.match(
        /^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/,
      );
      if (emailMatch) {
        return `<a href="mailto:${emailMatch[1]}">${emailMatch[1]}</a>`;
      }

      // URL
      const urlMatch = trimmed.match(/^(https?:\/\/[^\s]+)$/);
      if (urlMatch) {
        const url = urlMatch[1];
        const domain = url
          .replace(/^https?:\/\//, "")
          .replace(/^www\./, "")
          .replace(/\/$/, "");
        return `<a href="${url}" target="_blank" rel="noopener">${domain}</a>`;
      }

      // Phone (various FR formats)
      const phoneMatch = trimmed.match(
        /^(\d{2}[.\s-]?\d{2}[.\s-]?\d{2}[.\s-]?\d{2}[.\s-]?\d{2})$/,
      );
      if (phoneMatch) {
        const tel = formatPhone(phoneMatch[1]);
        if (tel) {
          return `<a href="tel:${tel}">${trimmed}</a>`;
        }
      }

      // Separator or plain text — return as-is
      return part;
    })
    .join("");
}

// ── HTML generation ─────────────────────────────────────────────────────

function monthId(monthName) {
  return monthName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+\d{4}$/, "")
    .trim();
}

function generateEventHtml(event) {
  const lines = [];
  lines.push(`        <article class="prog-event">`);
  lines.push(`          <div class="prog-event-date">`);
  lines.push(
    `            <span class="prog-event-day">${escapeHtml(event.jour)}</span>`,
  );
  lines.push(
    `            <span class="prog-event-num">${escapeHtml(event.date)}</span>`,
  );
  lines.push(
    `            <span class="prog-event-time">${escapeHtml(event.horaire)}</span>`,
  );
  lines.push(`          </div>`);
  lines.push(`          <div class="prog-event-body">`);

  if (event.categorie) {
    lines.push(
      `            <p class="prog-event-category">${escapeHtml(event.categorie)}</p>`,
    );
  }

  lines.push(`            <h3>${escapeHtml(event.titre)}</h3>`);

  // Description: split on newlines for paragraphs, lines starting with "- " become list items
  if (event.description) {
    const descLines = event.description.split(/\n/);
    let inList = false;

    for (const line of descLines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (trimmed.startsWith("- ")) {
        if (!inList) {
          lines.push(`            <ul>`);
          inList = true;
        }
        lines.push(
          `              <li>${escapeHtml(trimmed.slice(2))}</li>`,
        );
      } else {
        if (inList) {
          lines.push(`            </ul>`);
          inList = false;
        }
        lines.push(`            <p>${escapeHtml(trimmed)}</p>`);
      }
    }
    if (inList) {
      lines.push(`            </ul>`);
    }
  }

  lines.push(`            <div class="prog-event-meta">`);
  lines.push(
    `              <span class="prog-event-price">${event.prix ? escapeHtml(event.prix) : "&nbsp;"}</span>`,
  );
  lines.push(
    `              <span class="prog-event-contact">${autoLinkContact(event.contact || "")}</span>`,
  );
  lines.push(`            </div>`);
  lines.push(`          </div>`);
  lines.push(`        </article>`);

  return lines.join("\n");
}

function generateEventsBlock(months) {
  return months
    .map((month) => {
      const sectionLines = [];
      sectionLines.push(
        `      <section class="prog-month" id="${month.id}">`,
      );
      sectionLines.push(
        `        <h2 class="prog-month-title">${escapeHtml(month.name)}</h2>`,
      );
      sectionLines.push("");

      for (const event of month.events) {
        sectionLines.push(generateEventHtml(event));
        sectionLines.push("");
      }

      sectionLines.push(`      </section>`);
      return sectionLines.join("\n");
    })
    .join("\n\n");
}

function injectIntoTemplate(template, titre, pdfFilename, eventsHtml) {
  // Update title in frontmatter
  if (titre) {
    template = template.replace(
      /^title: ".*"$/m,
      `title: "${titre} — Herbarius"`,
    );
    template = template.replace(/<h1>.*<\/h1>/, `<h1>${escapeHtml(titre)}</h1>`);
  }

  // Update PDF link
  if (pdfFilename) {
    template = template.replace(
      /href="\/documents\/[^"]*"/,
      `href="/documents/${pdfFilename}"`,
    );
  }

  // Replace events block
  const startIdx = template.indexOf(START_MARKER);
  const endIdx = template.indexOf(END_MARKER);

  if (startIdx === -1 || endIdx === -1) {
    throw new Error("PROGRAMME-EVENTS markers not found in template.");
  }

  const before = template.slice(0, startIdx + START_MARKER.length);
  const after = template.slice(endIdx);

  return before + "\n" + eventsHtml + "\n      " + after;
}

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(XLSX_PATH);

  // ── Config sheet ──
  const configSheet = workbook.getWorksheet("Config");
  if (!configSheet) {
    console.error('Sheet "Config" not found in Excel.');
    process.exit(1);
  }

  const titre = configSheet.getCell("A1").value?.toString() || "";

  // ── Find and copy PDF from data/ to src/documents/ ──
  const dataDir = resolve(ROOT, "data");
  const docsDir = resolve(ROOT, "src/documents");
  await mkdir(docsDir, { recursive: true });

  const dataFiles = await readdir(dataDir);
  const pdfFile = dataFiles.find((f) => f.toLowerCase().endsWith(".pdf"));
  const pdfFilename = pdfFile || "";

  if (pdfFile) {
    await copyFile(resolve(dataDir, pdfFile), resolve(docsDir, pdfFile));
    console.log(`PDF: copied data/${pdfFile} → src/documents/${pdfFile}`);
  } else {
    console.log("PDF: no PDF found in data/.");
  }

  // ── Events sheet ──
  const eventsSheet = workbook.getWorksheet("Événements");
  if (!eventsSheet) {
    console.error('Sheet "Événements" not found in Excel.');
    process.exit(1);
  }

  // Parse events, group by month
  const months = [];
  let currentMonth = null;

  eventsSheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip header row

    const cellVal = (col) => {
      const v = row.getCell(col).value;
      if (v === null || v === undefined) return "";
      if (typeof v === "object" && v.richText) {
        return v.richText.map((r) => r.text).join("");
      }
      return v.toString().trim();
    };

    const mois = cellVal(1);
    const jour = cellVal(2);
    const date = cellVal(3);
    const horaire = cellVal(4);
    const categorie = cellVal(5);
    const titreEv = cellVal(6);
    const description = cellVal(7);
    const prix = cellVal(8);
    const contact = cellVal(9);

    if (!jour && !date && !titreEv) return;

    if (mois) {
      currentMonth = { name: mois, id: monthId(mois), events: [] };
      months.push(currentMonth);
    }

    if (!currentMonth) {
      console.error(`Row ${rowNumber}: event without a month.`);
      process.exit(1);
    }

    currentMonth.events.push({
      jour,
      date,
      horaire,
      categorie,
      titre: titreEv,
      description,
      prix,
      contact,
    });
  });

  const totalEvents = months.reduce((s, m) => s + m.events.length, 0);

  // ── Generate FR ──
  const frEventsHtml = generateEventsBlock(months);
  let frTemplate = await readFile(FR_PATH, "utf-8");
  frTemplate = injectIntoTemplate(frTemplate, titre, pdfFilename, frEventsHtml);
  await writeFile(FR_PATH, frTemplate, "utf-8");
  console.log(`FR: ${months.length} months, ${totalEvents} events.`);

  // ── Generate EN (with DeepL) ──
  if (!DEEPL_API_KEY) {
    console.log("EN: skipped (no DEEPL_API_KEY).");
    return;
  }

  const { enTitre, enMonths } = await translateMonths(months, titre);
  const enEventsHtml = generateEventsBlock(enMonths);
  let enTemplate = await readFile(EN_PATH, "utf-8");
  enTemplate = injectIntoTemplate(
    enTemplate,
    enTitre,
    pdfFilename,
    enEventsHtml,
  );
  await writeFile(EN_PATH, enTemplate, "utf-8");
  console.log(`EN: ${enMonths.length} months, ${totalEvents} events (translated).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
