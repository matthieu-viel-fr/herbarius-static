import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { load } from 'cheerio';

const PUBLIC = resolve('public');

// Pages that use the main layout (header/nav/footer)
const CONTENT_PAGES = [
  'index', 'programme', 'activites', 'hebergements', 'visite-virtuelle',
  'contact', 'visites-botaniques', 'ateliers', 'conferences', 'conception',
  'vente-plantes', 'liste-tomates', 'cabane', 'qui-sommes-nous',
];

// Redirect-only pages (no layout)
const REDIRECT_PAGES = ['infos-pratiques'];

const ALL_PAGES = [...CONTENT_PAGES, ...REDIRECT_PAGES];
const LANGS = ['fr', 'en'];

// Nav items expected in every content page
const NAV_ITEMS = ['index', 'programme', 'activites', 'hebergements', 'visite-virtuelle', 'contact'];

/** Load and cache parsed HTML */
const cache = {};
function getPage(lang, slug) {
  const key = `${lang}/${slug}`;
  if (!cache[key]) {
    const filePath = join(PUBLIC, lang, `${slug}.html`);
    const html = readFileSync(filePath, 'utf-8');
    cache[key] = { html, $: load(html), filePath };
  }
  return cache[key];
}

// ---------------------------------------------------------------------------
// 1. All expected files exist
// ---------------------------------------------------------------------------
describe('File existence', () => {
  it('root index.html exists', () => {
    assert.ok(existsSync(join(PUBLIC, 'index.html')));
  });

  for (const lang of LANGS) {
    for (const slug of ALL_PAGES) {
      it(`${lang}/${slug}.html exists`, () => {
        assert.ok(existsSync(join(PUBLIC, lang, `${slug}.html`)));
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 2. Structural integrity of content pages
// ---------------------------------------------------------------------------
describe('Page structure', () => {
  for (const lang of LANGS) {
    for (const slug of CONTENT_PAGES) {
      describe(`${lang}/${slug}`, () => {
        it('has correct lang attribute', () => {
          const { $ } = getPage(lang, slug);
          assert.equal($('html').attr('lang'), lang);
        });

        it('has a non-empty <title>', () => {
          const { $ } = getPage(lang, slug);
          assert.ok($('title').text().trim().length > 0);
        });

        it('has meta viewport', () => {
          const { $ } = getPage(lang, slug);
          assert.ok($('meta[name="viewport"]').length > 0);
        });

        it('has meta description', () => {
          const { $ } = getPage(lang, slug);
          const desc = $('meta[name="description"]').attr('content');
          assert.ok(desc && desc.trim().length > 0, 'meta description should not be empty');
        });

        it('has <header>', () => {
          const { $ } = getPage(lang, slug);
          assert.ok($('header').length > 0);
        });

        it('has <nav>', () => {
          const { $ } = getPage(lang, slug);
          assert.ok($('nav').length > 0);
        });

        it('has <footer>', () => {
          const { $ } = getPage(lang, slug);
          assert.ok($('footer').length > 0);
        });

        it('has favicon link', () => {
          const { $ } = getPage(lang, slug);
          assert.ok($('link[rel="icon"]').length > 0);
        });

        it('references style.css', () => {
          const { $ } = getPage(lang, slug);
          const href = $('link[rel="stylesheet"][href*="style.css"]');
          assert.ok(href.length > 0);
        });

        it('references main.js', () => {
          const { $ } = getPage(lang, slug);
          assert.ok($('script[src*="main.js"]').length > 0);
        });
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 3. Navigation
// ---------------------------------------------------------------------------
describe('Navigation', () => {
  for (const lang of LANGS) {
    for (const slug of CONTENT_PAGES) {
      it(`${lang}/${slug} — nav has all expected links`, () => {
        const { $ } = getPage(lang, slug);
        const hrefs = $('nav .nav-links a')
          .map((_, el) => $(el).attr('href'))
          .get();

        for (const item of NAV_ITEMS) {
          assert.ok(
            hrefs.some(h => h.includes(`${item}.html`)),
            `Missing nav link for "${item}" in ${lang}/${slug}`
          );
        }
      });

      it(`${lang}/${slug} — nav links have non-empty text`, () => {
        const { $ } = getPage(lang, slug);
        $('nav .nav-links a').each((_, el) => {
          assert.ok($(el).text().trim().length > 0, `Empty nav link text in ${lang}/${slug}`);
        });
      });

      it(`${lang}/${slug} — has language switch link`, () => {
        const { $ } = getPage(lang, slug);
        const otherLang = lang === 'fr' ? 'en' : 'fr';
        const langLink = $('nav .nav-lang a').attr('href');
        assert.ok(langLink && langLink.includes(`../${otherLang}/`), 'Language switch should point to other lang');
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 4. i18n — hreflang tags & page parity
// ---------------------------------------------------------------------------
describe('i18n', () => {
  for (const slug of ALL_PAGES) {
    it(`${slug} exists in both FR and EN`, () => {
      assert.ok(existsSync(join(PUBLIC, 'fr', `${slug}.html`)));
      assert.ok(existsSync(join(PUBLIC, 'en', `${slug}.html`)));
    });
  }

  for (const lang of LANGS) {
    for (const slug of CONTENT_PAGES) {
      it(`${lang}/${slug} — has hreflang fr and en`, () => {
        const { $ } = getPage(lang, slug);
        const frAlt = $('link[hreflang="fr"]').attr('href');
        const enAlt = $('link[hreflang="en"]').attr('href');
        assert.ok(frAlt, 'Missing hreflang="fr"');
        assert.ok(enAlt, 'Missing hreflang="en"');
        assert.ok(frAlt.includes('/fr/'), 'hreflang fr should point to /fr/');
        assert.ok(enAlt.includes('/en/'), 'hreflang en should point to /en/');
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 5. Internal links — no broken links within the site
// ---------------------------------------------------------------------------
describe('Internal links', () => {
  for (const lang of LANGS) {
    for (const slug of CONTENT_PAGES) {
      it(`${lang}/${slug} — all internal links resolve to existing files`, () => {
        const { $ } = getPage(lang, slug);
        const pageDir = join(PUBLIC, lang);

        $('a[href]').each((_, el) => {
          const href = $(el).attr('href');
          // Skip external links, mailto, tel, anchors, and server-hosted assets
          if (!href || href.startsWith('http') || href.startsWith('mailto:') ||
              href.startsWith('tel:') || href.startsWith('#') ||
              href.startsWith('/images/') || href.startsWith('/documents/')) {
            return;
          }

          // Resolve relative to the page's directory or to public/
          let target;
          if (href.startsWith('../')) {
            target = resolve(pageDir, href);
          } else {
            target = resolve(pageDir, href.split('#')[0]);
          }

          assert.ok(
            existsSync(target),
            `Broken link "${href}" in ${lang}/${slug} (resolved: ${target})`
          );
        });
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 6. Assets exist
// ---------------------------------------------------------------------------
describe('Assets', () => {
  it('css/style.css exists', () => {
    assert.ok(existsSync(join(PUBLIC, 'css', 'style.css')));
  });

  it('js/main.js exists', () => {
    assert.ok(existsSync(join(PUBLIC, 'js', 'main.js')));
  });

  it('favicon.ico exists', () => {
    assert.ok(existsSync(join(PUBLIC, 'favicon.ico')));
  });
});

// ---------------------------------------------------------------------------
// 7. Footer structure
// ---------------------------------------------------------------------------
describe('Footer', () => {
  for (const lang of LANGS) {
    it(`${lang}/index — footer has contact info`, () => {
      const { $ } = getPage(lang, 'index');
      const footerText = $('footer').text();
      assert.ok(footerText.includes('herbarius.net'), 'Footer should mention herbarius.net');
      assert.ok($('footer a[href^="mailto:"]').length > 0, 'Footer should have email link');
      assert.ok($('footer a[href^="tel:"]').length > 0, 'Footer should have phone link');
    });

    it(`${lang}/index — footer links resolve`, () => {
      const { $ } = getPage(lang, 'index');
      const pageDir = join(PUBLIC, lang);

      $('footer a[href]').each((_, el) => {
        const href = $(el).attr('href');
        if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

        const target = resolve(pageDir, href.split('#')[0]);
        assert.ok(existsSync(target), `Broken footer link "${href}" in ${lang}/index`);
      });
    });
  }
});
