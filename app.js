/* Ghala Ahmad Alshreef — portfolio
 * Plain JavaScript port of the reference design's component logic.
 * All content comes from data/portfolio-data.json. Every string from the
 * data is escaped before it is inserted, so nothing from the JSON is ever
 * treated as raw HTML.
 */
(function () {
  'use strict';

  var LANG_KEY = 'ghala-portfolio-lang';
  var DATA_URL = 'data/portfolio-data.json';
  var STAR_POINTS = [[10, 72], [24, 46], [40, 58], [54, 28], [68, 42], [80, 18], [92, 50]];
  // Constellation-map star positions (percent). One star per featured project:
  // x is spread evenly from 4 to 96, y zig-zags like the original 7-star layout.
  var MAP_Y = [64, 26, 72, 30, 70, 26, 62, 30, 68, 28];
  function mapPoints(n) {
    var pts = [];
    for (var i = 0; i < n; i++) pts.push([n > 1 ? Math.round(4 + (92 * i) / (n - 1)) : 50, MAP_Y[i % MAP_Y.length]]);
    return pts;
  }

  var root = document.getElementById('app');
  var state = { data: null, error: false, lang: 'en', open: {}, stars: 3, shotBy: {}, darbKnown: true };

  try {
    var saved = window.localStorage.getItem(LANG_KEY);
    if (saved === 'ar' || saved === 'en') state.lang = saved;
  } catch (e) { /* storage unavailable: keep default */ }

  /* ---------- helpers ---------- */

  var ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return ESC[c]; });
  }
  // Only allow the URL shapes the JSON actually uses.
  function safeUrl(u) {
    u = String(u == null ? '' : u).trim();
    if (/^(https?:\/\/|mailto:)/i.test(u) || /^#[\w-]*$/.test(u) || /^assets\/[\w.\-\/]+$/.test(u)) return u;
    return '';
  }
  function cls(c) { return c ? ' ' + c : ''; }
  function isArabic(t) { return /[\u0600-\u06FF]/.test(t || ''); }
  function num(i) { return (i + 1 < 10 ? '0' : '') + (i + 1); }

  function setState(patch) {
    var next = typeof patch === 'function' ? patch(state) : patch;
    for (var k in next) if (Object.prototype.hasOwnProperty.call(next, k)) state[k] = next[k];
    render();
  }

  /* ---------- icons (copied from the reference) ---------- */

  var STAR4 = '<path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z"></path>';
  var ICON = {
    brand: '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l1.9 6.6L20.5 10l-6.6 1.9L12 18.5l-1.9-6.6L3.5 10l6.6-1.4z"></path><circle cx="19" cy="19" r="1.6"></circle><circle cx="5" cy="19.5" r="1"></circle></svg>',
    eyebrow: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' + STAR4 + '</svg>',
    down: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M19 12l-7 7-7-7"></path></svg>',
    ext: '<svg class="flip" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9"></path></svg>',
    arrow: '<svg class="flip" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>',
    github: function (size) {
      return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"></path></svg>';
    },
    vr: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9.5A2.5 2.5 0 0 1 5.5 7h13A2.5 2.5 0 0 1 21 9.5v5a2.5 2.5 0 0 1-2.5 2.5h-3.2l-1.6-2.2a2 2 0 0 0-3.4 0L8.7 17H5.5A2.5 2.5 0 0 1 3 14.5z"></path><circle cx="8" cy="12" r="1.6"></circle><circle cx="16" cy="12" r="1.6"></circle></svg>',
    download: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"></path></svg>',
    mail: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3 7 9 6 9-6"></path></svg>'
  };

  var HEGRA_ART =
    '<g fill="#F4E4B8"><circle class="tw" cx="22" cy="18" r="1.3"></circle><circle cx="58" cy="34" r="1"></circle><circle class="tw2" cx="92" cy="12" r="1.4"></circle><circle cx="150" cy="22" r="1"></circle><circle class="tw" cx="226" cy="44" r="1.2"></circle><circle cx="34" cy="60" r="0.9"></circle></g>' +
    '<circle cx="196" cy="26" r="10" fill="#F4E4B8" opacity=".92"></circle>' +
    '<circle cx="200" cy="23" r="9" fill="#17142D"></circle>' +
    '<path d="M0 140 L0 118 Q20 104 38 110 L52 66 Q120 34 188 64 L204 108 Q222 102 240 112 L240 140 Z" fill="#7A4E35"></path>' +
    '<path d="M52 66 Q120 34 188 64 L196 90 Q120 62 46 92 Z" fill="#8F5D3F"></path>' +
    '<rect x="88" y="74" width="64" height="66" fill="#B47A52"></rect>' +
    '<rect x="84" y="70" width="72" height="6" fill="#C98E62"></rect>' +
    '<polygon points="86,70 86,64 92,64 92,58 98,58 98,52 104,52 104,46 110,46 110,70" fill="#B47A52"></polygon>' +
    '<polygon points="154,70 154,64 148,64 148,58 142,58 142,52 136,52 136,46 130,46 130,70" fill="#B47A52"></polygon>' +
    '<rect x="92" y="80" width="5" height="60" fill="#9F6A46"></rect>' +
    '<rect x="143" y="80" width="5" height="60" fill="#9F6A46"></rect>' +
    '<polygon points="106,106 120,96 134,106" fill="#C98E62"></polygon>' +
    '<rect x="110" y="106" width="20" height="34" fill="#2B1C14"></rect>' +
    '<circle cx="120" cy="122" r="15" fill="none" stroke="#B0A2F0" stroke-width="1.6" stroke-dasharray="4 3"></circle>' +
    '<circle cx="120" cy="122" r="2.4" fill="#F4E4B8"></circle>';

  var DARB_KNOWN_SVG =
    '<svg viewBox="0 0 116 200" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">' +
    '<rect width="116" height="200" fill="#2A2547"></rect>' +
    '<circle cx="92" cy="30" r="1.2" fill="#F4E4B8"></circle><circle cx="20" cy="44" r="1" fill="#F4E4B8"></circle>' +
    '<rect y="160" width="116" height="40" fill="#3A3150"></rect>' +
    '<rect x="8" y="82" width="24" height="80" fill="#B98A5E"></rect>' +
    '<rect x="84" y="82" width="24" height="80" fill="#B98A5E"></rect>' +
    '<rect x="28" y="100" width="60" height="62" fill="#C99A6C"></rect>' +
    '<polygon points="8,82 14,74 20,82 26,74 32,82" fill="#B98A5E"></polygon>' +
    '<polygon points="84,82 90,74 96,82 102,74 108,82" fill="#B98A5E"></polygon>' +
    '<polygon points="28,100 34,94 40,100 46,94 52,100 58,94 64,100 70,94 76,100 82,94 88,100" fill="#C99A6C"></polygon>' +
    '<g fill="#4A3324"><polygon points="16,100 20,94 24,100"></polygon><polygon points="92,100 96,94 100,100"></polygon><polygon points="40,118 44,112 48,118"></polygon><polygon points="68,118 72,112 76,118"></polygon></g>' +
    '<rect x="50" y="132" width="16" height="30" rx="8" fill="#4A3324"></rect>' +
    '<rect x="4" y="66" width="108" height="100" rx="6" fill="none" stroke="#F4E4B8" stroke-width="2"></rect>' +
    '</svg>';

  var DARB_UNKNOWN_SVG =
    '<svg viewBox="0 0 116 200" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">' +
    '<rect width="116" height="200" fill="#2A2547"></rect>' +
    '<rect y="160" width="116" height="40" fill="#3A3150"></rect>' +
    '<rect x="26" y="60" width="64" height="102" fill="#4C4672"></rect>' +
    '<g fill="#6E6896"><rect x="34" y="70" width="10" height="10"></rect><rect x="53" y="70" width="10" height="10"></rect><rect x="72" y="70" width="10" height="10"></rect><rect x="34" y="90" width="10" height="10"></rect><rect x="53" y="90" width="10" height="10"></rect><rect x="72" y="90" width="10" height="10"></rect><rect x="34" y="110" width="10" height="10"></rect><rect x="53" y="110" width="10" height="10"></rect><rect x="72" y="110" width="10" height="10"></rect></g>' +
    '<rect x="4" y="50" width="108" height="116" rx="6" fill="none" stroke="#B0A2F0" stroke-width="2" stroke-dasharray="6 4"></rect>' +
    '<circle cx="58" cy="40" r="11" fill="#B0A2F0"></circle>' +
    '<text x="58" y="45" text-anchor="middle" font-family="Inter, sans-serif" font-size="14" font-weight="700" fill="#0E0C1D">?</text>' +
    '</svg>';

  var DRONE_DETECT_SVG_INNER =
    '<rect width="240" height="150" fill="#2A2547"></rect>' +
    '<path d="M0 104 L240 78" stroke="#352F57" stroke-width="18"></path>' +
    '<rect x="150" y="14" width="70" height="44" rx="4" fill="#332D52"></rect>' +
    '<g fill="#E9E4F7"><circle cx="44" cy="46" r="5"></circle><circle cx="92" cy="62" r="5"></circle><circle cx="120" cy="108" r="5"></circle><circle cx="186" cy="100" r="5"></circle><circle cx="64" cy="118" r="5"></circle></g>' +
    '<g fill="none" stroke="#F4E4B8" stroke-width="1.6"><rect x="35" y="37" width="18" height="18" rx="2"></rect><rect x="83" y="53" width="18" height="18" rx="2"></rect><rect x="111" y="99" width="18" height="18" rx="2"></rect><rect x="177" y="91" width="18" height="18" rx="2"></rect><rect x="55" y="109" width="18" height="18" rx="2"></rect></g>' +
    '<g font-family="Inter, sans-serif" font-size="8" font-weight="600" fill="#F4E4B8"><text x="35" y="33">person</text><text x="83" y="49">person</text><text x="111" y="95">person</text><text x="177" y="87">person</text><text x="55" y="105">person</text></g>';

  var DRONE_TRACK_SVG_INNER =
    '<rect width="240" height="150" fill="#2A2547"></rect>' +
    '<path d="M0 104 L240 78" stroke="#352F57" stroke-width="18"></path>' +
    '<rect x="150" y="14" width="70" height="44" rx="4" fill="#332D52"></rect>' +
    '<path d="M40 120 C 70 108, 96 98, 128 92 S 180 70, 196 52" fill="none" stroke="#B0A2F0" stroke-width="2" stroke-dasharray="4 4"></path>' +
    '<circle cx="40" cy="120" r="5" fill="#E9E4F7" opacity=".25"></circle>' +
    '<circle cx="128" cy="92" r="5" fill="#E9E4F7" opacity=".5"></circle>' +
    '<circle cx="196" cy="52" r="5" fill="#E9E4F7"></circle>' +
    '<rect x="187" y="43" width="18" height="18" rx="2" fill="none" stroke="#F4E4B8" stroke-width="1.8"></rect>' +
    '<g font-family="Inter, sans-serif" font-size="8" font-weight="600"><text x="30" y="137" fill="#ADA5C6">t1</text><text x="122" y="110" fill="#ADA5C6">t2</text><text x="210" y="56" fill="#F4E4B8">t3</text></g>' +
    '<rect x="180" y="26" width="32" height="13" rx="6.5" fill="#F4E4B8"></rect>' +
    '<text x="196" y="35.5" text-anchor="middle" font-family="Inter, sans-serif" font-size="8" font-weight="700" fill="#0E0C1D">ID 3</text>' +
    '<path d="M60 40 C 70 44, 78 50, 86 58" fill="none" stroke="#8E7BE0" stroke-width="1.6" stroke-dasharray="3 3"></path>' +
    '<circle cx="86" cy="58" r="5" fill="#E9E4F7"></circle>' +
    '<rect x="77" y="49" width="18" height="18" rx="2" fill="none" stroke="#B0A2F0" stroke-width="1.6"></rect>' +
    '<rect x="71" y="33" width="30" height="13" rx="6.5" fill="#B0A2F0"></rect>' +
    '<text x="86" y="42.5" text-anchor="middle" font-family="Inter, sans-serif" font-size="8" font-weight="700" fill="#0E0C1D">ID 1</text>';

  /* ---------- view model (port of renderVals) ---------- */

  function buildView() {
    var s = state;
    var lang = s.lang === 'ar' ? 'ar' : 'en';
    var d = s.data || {};
    function L(x) {
      if (x == null) return '';
      if (typeof x === 'string') return x;
      return x[lang] != null ? x[lang] : (x.en || '');
    }
    var ui = d.ui || {};
    function U(k) { return L(ui[k]); }
    var sec = d.sections || {};
    var secV = {};
    Object.keys(sec).forEach(function (k) { secV[k] = L(sec[k]); });

    var featured = (d.featured || []).map(function (p, i) {
      var open = !!s.open[p.id];
      var vt = p.visualText || {};
      var alt = L(p.altName);
      var totalStars = STAR_POINTS.length;
      var lit = Math.max(0, Math.min(s.stars, totalStars));
      var steps = vt.steps || [];
      var items = (p.screenshots && p.screenshots.items) || [];
      var hasShots = items.length > 0;
      var raw = (s.shotBy || {})[p.id];
      var cur = raw == null ? (p.coverLabel ? -1 : 0) : raw;
      var shotItem = items[Math.max(0, Math.min(cur, items.length - 1))] || {};
      var coverOn = !!p.coverLabel && cur === -1;
      return {
        id: p.id,
        visual: p.visual,
        num: num(i),
        headId: 'proj-' + p.id,
        cardId: 'project-' + p.id,
        panelId: 'panel-' + p.id,
        name: L(p.name), altName: alt, hasAlt: !!alt, altLang: isArabic(alt) ? 'ar' : 'en',
        status: L(p.status), role: L(p.role), problem: L(p.problem), summary: L(p.summary),
        contributionTitle: U(p.contributionTitle || 'myContribution'),
        contribution: (p.contribution || []).map(function (c) { return { text: L(c), label: L(c && c.label) }; }),
        method: L(p.method), methodTitle: U(p.methodTitle || 'technicalDetail'),
        live: p.live || '', liveLabel: U('viewLive'),
        toolsLabel: U(p.toolsLabel || 'tools'),
        tools: (p.tools || []).map(L),
        github: p.github || '', githubLabel: U(p.githubLabel || 'viewGithub'), newTab: U('opensNewTab'),
        expanded: open,
        toggleLabel: open ? U('readLess') : U('readMore'),
        hasShots: hasShots,
        shotCaption: p.screenshots ? L(p.screenshots.caption) : L(vt.caption),
        shot: { src: shotItem.src || '', alt: L(shotItem.alt) },
        shots: items.map(function (it, k) { return { src: it.src, label: L(it.label), on: k === cur, idx: k }; }),
        darbKnown: !!s.darbKnown, darbGroup: L(vt.group),
        knownBtn: L(vt.knownBtn), unknownBtn: L(vt.unknownBtn),
        resTitle: s.darbKnown ? L(vt.knownTitle) : L(vt.unknownTitle),
        resText: s.darbKnown ? L(vt.knownText) : L(vt.unknownText),
        resSource: L(vt.knownSource),
        cvTarget: L(vt.target),
        cvRows: (vt.rows || []).map(function (r) { return { kind: r.kind || '', tag: L(r.tag), text: L(r.text) }; }),
        coverOn: coverOn,
        coverLabel: L(p.coverLabel),
        wideCaption: coverOn ? L(vt.caption) : (p.screenshots ? L(p.screenshots.caption) : ''),
        play: p.play || '', playLabel: U('playVR'), hegraAria: L(vt.aria),
        caption: L(vt.caption), question: L(vt.question),
        steps: steps.map(function (t, j) {
          return { text: L(t), n: j + 1, notLast: j < steps.length - 1,
            cls: j === 0 ? 'start' : (j === steps.length - 1 ? 'end' : 'agent') };
        }),
        detectTitle: L(vt.detectTitle), detectText: L(vt.detectText),
        trackTitle: L(vt.trackTitle), trackText: L(vt.trackText),
        stars: STAR_POINTS.map(function (pt, j) { return { x: pt[0], y: pt[1], lit: j < lit }; }),
        starCount: lit + ' / ' + totalStars + ' ' + L(vt.starsOf),
        starLabel: lit >= totalStars ? L(vt.restart) : L(vt.complete)
      };
    });

    var MAP_PTS = mapPoints(Math.min(featured.length, MAP_Y.length));
    var mapStars = featured.slice(0, MAP_PTS.length).map(function (f, i) {
      return { name: f.name, href: '#' + f.cardId, x: MAP_PTS[i][0], y: MAP_PTS[i][1], tw: i % 2 ? 'tw2' : 'tw' };
    });

    var caps = (d.capabilities || []).map(function (c, i) {
      var t = L(c.text); var a = t.indexOf('{'), b = t.indexOf('}');
      var before = t, mid = '', after = '';
      if (a > -1 && b > a) { before = t.slice(0, a); mid = t.slice(a + 1, b); after = t.slice(b + 1); }
      var target = (d.featured || []).some(function (f) { return f.id === c.project; });
      return { num: num(i), title: L(c.title), before: before, mid: mid, after: after,
        hasLink: !!mid && target, href: '#project-' + c.project };
    });

    var ab = d.about || {};
    var about = {
      title: L(ab.title),
      paras: (ab.paragraphs || []).map(function (pp) {
        return L(pp).split('**').map(function (b, k) { return { text: b, em: k % 2 === 1 }; })
          .filter(function (x) { return x.text !== ''; });
      })
    };

    var more = (d.more || []).map(function (m) {
      return { name: L(m.name), label: L(m.label), text: L(m.text), live: m.live || '', github: m.github || '',
        githubLabel: U('viewGithubTeam'), liveLabel: U('viewLiveSite'), newTab: U('opensNewTab'),
        tools: (m.tools || []).map(L) };
    });

    var exp = d.experience || {};
    var mf = exp.featured || {};
    var person = d.person || {};
    var hero = d.hero || {};
    var contact = d.contact || {};
    var links = d.links || {};

    return {
      lang: lang,
      dir: lang === 'ar' ? 'rtl' : 'ltr',
      name: L(person.name), shortName: L(person.shortName),
      altName: person.name ? (lang === 'ar' ? person.name.en : person.name.ar) : '',
      altNameLang: lang === 'ar' ? 'en' : 'ar',
      mapStars: mapStars, caps: caps, about: about,
      toolGroups: (d.toolGroups || []).map(function (g) { return { label: L(g.label), items: (g.items || []).map(L) }; }),
      links: { github: links.github || '', linkedin: links.linkedin || '', email: links.email || '',
               cv: links.cv || '', cvFileName: links.cvFileName || 'CV.pdf' },
      ui: {
        skip: U('skip'), navProjects: U('navProjects'), navExperience: U('navExperience'), navContact: U('navContact'),
        navLabel: lang === 'ar' ? 'التنقل الرئيسي' : 'Main navigation',
        langButton: U('langButton'), langButtonLang: U('langButtonLang'), langButtonAria: U('langButtonAria'),
        langButtonCls: lang === 'en' ? 'ar-label' : '',
        opensNewTab: U('opensNewTab'), footer: U('footer'), downloadCv: U('downloadCv'), cvMeta: U('cvMeta') || 'PDF'
      },
      hero: { eyebrow: L(hero.eyebrow), headline: L(hero.headline), primaryCta: L(hero.primaryCta), secondaryCta: L(hero.secondaryCta) },
      sec: secV,
      featured: featured,
      more: more,
      mob: {
        org: L(mf.org), role: L(mf.role), team: L(mf.team), dates: L(mf.dates), lead: L(mf.lead),
        highlights: (mf.highlights || []).map(function (h) { return { value: L(h.value), text: L(h.text) }; })
      },
      roles: (exp.roles || []).map(function (r) { return { org: L(r.org), role: L(r.role), dates: L(r.dates), text: L(r.text) }; }),
      contact: { title: L(contact.title), text: L(contact.text), github: L(contact.github), linkedin: L(contact.linkedin), email: L(contact.email) }
    };
  }

  /* ---------- templates ---------- */

  function cvButton(v) {
    var url = safeUrl(v.links.cv);
    if (!url) return '';
    return '<a class="btn" href="' + esc(url) + '" download="' + esc(v.links.cvFileName) + '" type="application/pdf">' +
      ICON.download + esc(v.ui.downloadCv) + '<span class="email-addr">' + esc(v.ui.cvMeta) + '</span></a>';
  }

  function extLink(className, href, inner, newTab, key) {
    var url = safeUrl(href);
    if (!url) return '';
    return '<a class="' + className + '" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer"' +
      (key ? ' data-k="' + esc(key) + '"' : '') + '>' + inner + '<span class="sr-only"> ' + esc(newTab) + '</span></a>';
  }

  function shotTab(p, sh, tall) {
    return '<button type="button" class="shot-tab' + cls(sh.on ? 'on' : '') + '" aria-pressed="' + sh.on + '"' +
      ' data-action="shot" data-id="' + esc(p.id) + '" data-idx="' + sh.idx + '" data-k="shot-' + esc(p.id) + '-' + sh.idx + '">' +
      '<img' + (tall ? ' class="tall"' : '') + ' src="' + esc(safeUrl(sh.src)) + '" alt="" width="' + (tall ? 30 : 64) + '" height="' + (tall ? 64 : 46) + '" loading="lazy" decoding="async">' +
      '<span>' + esc(sh.label) + '</span></button>';
  }

  function shotImg(p, w, h, style) {
    return '<img src="' + esc(safeUrl(p.shot.src)) + '" alt="' + esc(p.shot.alt) + '" width="' + w + '" height="' + h + '" loading="lazy" decoding="async"' +
      (style ? ' style="' + style + '"' : '') + '>';
  }

  function visualBunyan(p) {
    var h = '<div class="card-visual v-bunyan"><span class="vis-caption">' + esc(p.shotCaption) + '</span>';
    if (p.hasShots) {
      h += '<figure class="shot">' + shotImg(p, 1600, 1160) + '</figure>' +
        (p.shots.length > 1 ? '<div class="shot-tabs" role="group" aria-label="' + esc(p.shotCaption) + '">' +
          p.shots.map(function (sh) { return shotTab(p, sh, false); }).join('') + '</div>' : '');
    }
    h += '<p class="flow-cap">' + esc(p.caption) + '</p><ol class="flow" aria-label="' + esc(p.caption) + '">' +
      p.steps.map(function (st) {
        return '<li><span class="flow-step ' + st.cls + '">' + esc(st.text) + '</span>' +
          (st.notLast ? '<span class="flow-arrow" aria-hidden="true">' + ICON.arrow + '</span>' : '') + '</li>';
      }).join('') + '</ol></div>';
    return h;
  }

  function visualDarb(p) {
    return '<div class="card-visual v-darb"><span class="vis-caption">' + esc(p.caption) + '</span>' +
      '<div class="phone" aria-hidden="true"><div class="phone-screen">' + (p.darbKnown ? DARB_KNOWN_SVG : DARB_UNKNOWN_SVG) + '</div></div>' +
      '<div class="darb-side"><div class="seg" role="group" aria-label="' + esc(p.darbGroup) + '">' +
      '<button type="button" class="seg-btn' + cls(p.darbKnown ? 'on' : '') + '" aria-pressed="' + p.darbKnown + '" data-action="darb" data-val="known" data-k="darb-known">' + esc(p.knownBtn) + '</button>' +
      '<button type="button" class="seg-btn' + cls(p.darbKnown ? '' : 'on') + '" aria-pressed="' + !p.darbKnown + '" data-action="darb" data-val="unknown" data-k="darb-unknown">' + esc(p.unknownBtn) + '</button>' +
      '</div><div class="res' + cls(p.darbKnown ? '' : 'honest') + '" aria-live="polite">' +
      '<p class="res-title">' + esc(p.resTitle) + '</p><p class="res-text">' + esc(p.resText) + '</p>' +
      (p.darbKnown ? '<p class="res-src">' + esc(p.resSource) + '</p>' : '') +
      '</div></div></div>';
  }

  function visualCv(p) {
    return '<div class="card-visual v-cv"><span class="vis-caption">' + esc(p.caption) + '</span>' +
      '<div class="mini-cv" aria-hidden="true">' +
      '<div class="cv-head"><span class="cv-avatar"></span><span style="flex: 1"><span class="mini-line" style="display: block; width: 70%"></span><span class="mini-line s" style="display: block; width: 45%; margin-bottom: 0"></span></span></div>' +
      '<div class="mini-line"></div><div class="mini-line s"></div>' +
      '<div class="mini-hl"><div class="mini-line"></div><div class="mini-line s"></div></div>' +
      '<div class="mini-line"></div><div class="mini-line s"></div>' +
      '</div><div class="cv-side"><p class="cv-target">' + esc(p.cvTarget) + '</p><ul class="cv-rows">' +
      p.cvRows.map(function (r) {
        return '<li class="cv-row"><span class="cv-tag' + cls(esc(r.kind)) + '">' + esc(r.tag) + '</span><span>' + esc(r.text) + '</span></li>';
      }).join('') + '</ul></div></div>';
  }

  function visualPdf(p) {
    return '<div class="card-visual v-pdf"><span class="vis-caption">' + esc(p.caption) + '</span>' +
      '<div class="mini-doc" aria-hidden="true">' +
      '<div class="mini-line"></div><div class="mini-line s"></div><div class="mini-line"></div>' +
      '<div class="mini-hl"><div class="mini-line"></div><div class="mini-line s"></div></div>' +
      '<div class="mini-line"></div><div class="mini-line s"></div>' +
      '</div><div class="pdf-side"><p class="bubble">' + esc(p.question) + '</p><ol class="mini-steps">' +
      p.steps.map(function (st) { return '<li>' + st.n + '. ' + esc(st.text) + '</li>'; }).join('') +
      '</ol></div></div>';
  }

  function visualDrone(p) {
    return '<div class="card-visual v-drone"><span class="vis-caption">' + esc(p.shotCaption) + '</span>' +
      (p.hasShots ? '<figure class="shot">' + shotImg(p, 1280, 895, 'aspect-ratio: 1280 / 895') + '</figure>' : '') +
      '<p class="flow-cap">' + esc(p.caption) + '</p><div class="drone-panels">' +
      '<figure class="drone-panel"><svg viewBox="0 0 240 150" role="img" aria-label="' + esc(p.detectTitle + ' — ' + p.detectText) + '">' + DRONE_DETECT_SVG_INNER + '</svg>' +
      '<figcaption><b>' + esc(p.detectTitle) + '</b>' + esc(p.detectText) + '</figcaption></figure>' +
      '<figure class="drone-panel"><svg viewBox="0 0 240 150" role="img" aria-label="' + esc(p.trackTitle + ' — ' + p.trackText) + '">' + DRONE_TRACK_SVG_INNER + '</svg>' +
      '<figcaption><b>' + esc(p.trackTitle) + '</b>' + esc(p.trackText) + '</figcaption></figure>' +
      '</div></div>';
  }

  function visualWahjShots(p) {
    return '<div class="card-visual v-phone-shots"><span class="vis-caption">' + esc(p.shotCaption) + '</span>' +
      '<div class="phone-shots"><figure class="phone-big">' + shotImg(p, 300, 640) + '</figure>' +
      '<div class="shot-tabs vertical" role="group" aria-label="' + esc(p.shotCaption) + '">' +
      p.shots.map(function (sh) { return shotTab(p, sh, true); }).join('') +
      '</div></div></div>';
  }

  // Interactive sky; used only if Wahj has no screenshots in the JSON.
  function visualWahjSky(p) {
    return '<div class="card-visual v-wahj"><span class="vis-caption">' + esc(p.caption) + '</span>' +
      '<div class="sky" aria-hidden="true"><svg viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points="10,72 24,46 40,58 54,28 68,42 80,18 92,50" fill="none" stroke="#5E5585" stroke-width="1" stroke-dasharray="3 3" vector-effect="non-scaling-stroke"></polyline></svg>' +
      p.stars.map(function (st) { return '<span class="star' + cls(st.lit ? 'lit' : '') + '" style="left: ' + st.x + '%; top: ' + st.y + '%"></span>'; }).join('') +
      '</div><div class="sky-row"><p class="sky-count" aria-live="polite">' + esc(p.starCount) + '</p>' +
      '<button type="button" class="sky-btn" data-action="stars" data-k="stars">' + esc(p.starLabel) + '</button></div></div>';
  }

  function visualHegraShots(p) {
    var h = '<div class="card-visual v-wide-shots"><span class="vis-caption">' + esc(p.wideCaption) + '</span>';
    if (p.coverOn) {
      h += '<div class="hegra-cover"><svg viewBox="0 0 240 140" role="img" aria-label="' + esc(p.hegraAria) + '">' + HEGRA_ART + '</svg></div>';
    } else {
      h += '<figure class="shot">' + shotImg(p, 1206, 520, 'aspect-ratio: 1206 / 520') + '</figure>';
    }
    h += '<div class="shot-tabs" role="group" aria-label="' + esc(p.shotCaption) + '">' +
      '<button type="button" class="shot-tab' + cls(p.coverOn ? 'on' : '') + '" aria-pressed="' + p.coverOn + '" data-action="shot" data-id="' + esc(p.id) + '" data-idx="-1" data-k="shot-' + esc(p.id) + '--1">' +
      '<span class="cover-thumb" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">' + STAR4 + '</svg></span><span>' + esc(p.coverLabel) + '</span></button>' +
      p.shots.map(function (sh) { return shotTab(p, sh, false); }).join('') +
      '</div></div>';
    return h;
  }

  function visualHegraArt(p) {
    return '<div class="card-visual v-hegra"><span class="vis-caption">' + esc(p.caption) + '</span>' +
      '<svg viewBox="0 0 240 140" role="img" aria-label="' + esc(p.hegraAria) + '">' + HEGRA_ART + '</svg></div>';
  }

  function cardVisual(p) {
    switch (p.visual) {
      case 'bunyan': return visualBunyan(p);
      case 'darb': return visualDarb(p);
      case 'cv': return visualCv(p);
      case 'pdf': return visualPdf(p);
      case 'drone': return visualDrone(p);
      case 'wahj': return p.hasShots ? visualWahjShots(p) : visualWahjSky(p);
      case 'hegra': return p.hasShots ? visualHegraShots(p) : visualHegraArt(p);
      default: return '';
    }
  }

  function card(p) {
    var h = '<li class="card card-' + esc(p.id) + '" id="' + esc(p.cardId) + '">' +
      '<article class="card-art" aria-labelledby="' + esc(p.headId) + '">' + cardVisual(p) +
      '<div class="card-body">' +
      '<div class="card-top"><span class="card-num" aria-hidden="true">' + p.num + '</span><p class="card-status">' + esc(p.status) + '</p></div>' +
      '<h3 class="card-title" id="' + esc(p.headId) + '">' + esc(p.name) +
      (p.hasAlt ? '<span class="alt" lang="' + p.altLang + '">' + esc(p.altName) + '</span>' : '') + '</h3>' +
      '<p class="card-role">' + esc(p.role) + '</p>' +
      '<p class="card-problem">' + esc(p.problem) + '</p>' +
      '<ul class="chips" aria-label="' + esc(p.toolsLabel) + '">' + p.tools.map(function (t) { return '<li class="chip">' + esc(t) + '</li>'; }).join('') + '</ul>' +
      (p.play ? extLink('play-btn', p.play, ICON.vr + esc(p.playLabel), p.newTab, 'play-' + p.id) : '') +
      '<button type="button" class="toggle" aria-expanded="' + p.expanded + '" aria-controls="' + esc(p.panelId) + '" data-action="toggle" data-id="' + esc(p.id) + '" data-k="toggle-' + esc(p.id) + '">' +
      '<span>' + esc(p.toggleLabel) + '</span><span class="chev" aria-hidden="true"></span></button>' +
      '<div id="' + esc(p.panelId) + '">';
    if (p.expanded) {
      h += '<div class="card-more"><p>' + esc(p.summary) + '</p>' +
        '<p class="more-h">' + esc(p.contributionTitle) + '</p><ul class="contrib">' +
        p.contribution.map(function (c) {
          return '<li>' + (c.label ? '<strong>' + esc(c.label) + ': </strong>' : '') + esc(c.text) + '</li>';
        }).join('') + '</ul>' +
        (p.method ? '<div class="tech"><p class="more-h">' + esc(p.methodTitle) + '</p><p>' + esc(p.method) + '</p></div>' : '') +
        '<div class="links-row">' +
        (p.live ? extLink('gh', p.live, ICON.ext + esc(p.liveLabel), p.newTab) : '') +
        (p.github ? extLink('gh', p.github, ICON.github(18) + esc(p.githubLabel), p.newTab) : '') +
        '</div></div>';
    }
    h += '</div></div></article></li>';
    return h;
  }

  function page(v) {
    var h = '';
    h += '<a class="skip" href="#main">' + esc(v.ui.skip) + '</a>';

    // Header
    h += '<header class="top"><div class="wrap top-in">' +
      '<a class="brand" href="#main">' + ICON.brand + '<span>' + esc(v.shortName) + '</span></a>' +
      '<nav aria-label="' + esc(v.ui.navLabel) + '" style="display: contents"><ul class="nav">' +
      '<li><a href="#projects">' + esc(v.ui.navProjects) + '</a></li>' +
      '<li><a href="#experience">' + esc(v.ui.navExperience) + '</a></li>' +
      '<li><a href="#contact">' + esc(v.ui.navContact) + '</a></li>' +
      '</ul></nav>' +
      '<button type="button" class="lang-btn" data-action="lang" data-k="lang" aria-label="' + esc(v.ui.langButtonAria) + '">' +
      '<span lang="' + esc(v.ui.langButtonLang) + '"' + (v.ui.langButtonCls ? ' class="' + v.ui.langButtonCls + '"' : '') + '>' + esc(v.ui.langButton) + '</span></button>' +
      '</div></header>';

    h += '<main id="main">';

    // Hero
    h += '<section class="hero" aria-labelledby="hero-name">' +
      '<svg class="hero-sky" viewBox="0 0 520 260" aria-hidden="true">' +
      '<polyline points="20,200 110,150 190,180 270,90 360,120 430,40 500,96" fill="none" stroke="#B0A2F0" stroke-width="1" stroke-dasharray="3 5" opacity=".7"></polyline>' +
      '<g fill="#F4E4B8"><circle class="tw" cx="20" cy="200" r="2.5"></circle><circle cx="110" cy="150" r="3"></circle><circle class="tw2" cx="190" cy="180" r="2"></circle><circle cx="270" cy="90" r="3.5"></circle><circle class="tw" cx="360" cy="120" r="2.2"></circle><circle cx="430" cy="40" r="4"></circle><circle class="tw2" cx="500" cy="96" r="2.5"></circle></g>' +
      '</svg><div class="wrap hero-grid"><div>' +
      '<p class="eyebrow">' + ICON.eyebrow + esc(v.hero.eyebrow) + '</p>' +
      '<h1 class="hero-name" id="hero-name">' + esc(v.name) + '<span class="hero-name-alt ' + v.altNameLang + '" lang="' + v.altNameLang + '">' + esc(v.altName) + '</span></h1>' +
      '<p class="hero-title" style="margin-bottom: 32px">' + esc(v.hero.headline) + '</p>' +
      '<div class="actions">' +
      '<a class="btn primary" href="#projects">' + esc(v.hero.primaryCta) + ICON.down + '</a>' +
      extLink('btn', v.links.linkedin, esc(v.hero.secondaryCta) + ICON.ext, v.ui.opensNewTab) +
      cvButton(v) +
      '</div></div></div></section>';

    // About
    h += '<section class="section about" id="about" aria-labelledby="about-title"><div class="wrap about-grid">' +
      '<div class="about-head"><h2 class="h2 about-title" id="about-title">' +
      '<svg class="about-star tw" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' + STAR4 + '</svg>' +
      '<span>' + esc(v.about.title) + '</span></h2></div><div class="about-body">' +
      v.about.paras.map(function (parts) {
        return '<p class="about-p">' + parts.map(function (pt) {
          return pt.em ? '<strong class="about-em">' + esc(pt.text) + '</strong>' : esc(pt.text);
        }).join('') + '</p>';
      }).join('') + '</div></div></section>';

    // Projects
    h += '<section class="section" id="projects" aria-labelledby="projects-title"><div class="wrap">' +
      '<p class="kicker">' + esc(v.sec.projectsKicker) + '</p>' +
      '<h2 class="h2" id="projects-title">' + esc(v.sec.projectsTitle) + '</h2>' +
      '<p class="lede">' + esc(v.sec.projectsIntro) + '</p>' +
      '<nav class="map" aria-label="' + esc(v.sec.mapAria) + '"><p class="map-label">' + esc(v.sec.mapLabel) + '</p><div class="map-field">' +
      '<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points="' +
      v.mapStars.map(function (m) { return m.x + ',' + m.y; }).join(' ') +
      '" fill="none" stroke="#B0A2F0" stroke-width="1" stroke-dasharray="4 5" vector-effect="non-scaling-stroke" opacity=".75"></polyline></svg>' +
      v.mapStars.map(function (m) {
        return '<a class="map-star" href="' + esc(m.href) + '" style="left: ' + m.x + '%; top: ' + m.y + '%"><span class="map-dot ' + m.tw + '" aria-hidden="true"></span><span>' + esc(m.name) + '</span></a>';
      }).join('') +
      '</div></nav>' +
      '<ul class="cards">' + v.featured.map(card).join('') + '</ul>' +
      '</div></section>';

    // More of my work (only when the data has items)
    if (v.more.length) h += '<section class="section" id="more" aria-labelledby="more-title" style="padding-top: 0"><div class="wrap">' +
      '<p class="kicker">' + esc(v.sec.moreKicker) + '</p>' +
      '<h2 class="h2" id="more-title" style="font-size: clamp(24px, 2.4vw, 32px); margin-bottom: 24px">' + esc(v.sec.moreTitle) + '</h2>' +
      '<ul class="more-grid">' + v.more.map(function (m) {
        var links = (m.live ? extLink('gh', m.live, ICON.ext + esc(m.liveLabel), m.newTab) : '') +
          (m.github ? extLink('gh', m.github, ICON.github(16) + esc(m.githubLabel), m.newTab) : '');
        return '<li class="more-item"><p class="more-label">' + esc(m.label) + '</p>' +
          '<h3 class="more-name">' + esc(m.name) + '</h3><p class="more-text">' + esc(m.text) + '</p>' +
          '<ul class="chips">' + m.tools.map(function (t) { return '<li class="chip">' + esc(t) + '</li>'; }).join('') + '</ul>' +
          (links ? '<div class="links-row" style="margin: 0 0 12px">' + links + '</div>' : '') + '</li>';
      }).join('') + '</ul></div></section>';

    // Capabilities
    h += '<section class="section caps-section" id="capabilities" aria-labelledby="cap-title"><div class="wrap">' +
      '<p class="kicker">' + esc(v.sec.capKicker) + '</p>' +
      '<h2 class="h2" id="cap-title" style="margin-bottom: 32px">' + esc(v.sec.capTitle) + '</h2>' +
      '<ul class="caps">' + v.caps.map(function (c) {
        var mid = c.hasLink ? '<a class="cap-link" href="' + esc(c.href) + '">' + esc(c.mid) + '</a>' : esc(c.mid);
        return '<li class="cap"><span class="cap-num" aria-hidden="true">' + c.num + '</span><div>' +
          '<h3 class="cap-title">' + esc(c.title) + '</h3>' +
          '<p class="cap-text">' + esc(c.before) + mid + esc(c.after) + '</p></div></li>';
      }).join('') + '</ul></div></section>';

    // Tools
    h += '<section class="section tools-section" id="tools" aria-labelledby="tools-title"><div class="wrap">' +
      '<p class="kicker">' + esc(v.sec.toolsKicker) + '</p>' +
      '<h2 class="h2 h2-sm" id="tools-title">' + esc(v.sec.toolsTitle) + '</h2>' +
      '<dl class="tool-list">' + v.toolGroups.map(function (g) {
        return '<div class="tool-row"><dt class="tool-label">' + esc(g.label) + '</dt>' +
          '<dd class="tool-tags"><ul class="tags">' + g.items.map(function (t) { return '<li class="tag">' + esc(t) + '</li>'; }).join('') + '</ul></dd></div>';
      }).join('') + '</dl></div></section>';

    // Divider
    h += '<div class="divider" aria-hidden="true"><svg width="120" height="20" viewBox="0 0 120 20"><polyline points="4,14 34,6 60,12 86,4 116,12" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="3 4"></polyline><g fill="#F4E4B8"><circle cx="4" cy="14" r="1.6"></circle><circle cx="34" cy="6" r="2"></circle><circle class="tw" cx="60" cy="12" r="2.6"></circle><circle cx="86" cy="4" r="1.8"></circle><circle cx="116" cy="12" r="1.6"></circle></g></svg></div>';

    // Experience
    h += '<section class="section" id="experience" aria-labelledby="exp-title"><div class="wrap">' +
      '<p class="kicker">' + esc(v.sec.experienceKicker) + '</p>' +
      '<h2 class="h2" id="exp-title" style="margin-bottom: 36px">' + esc(v.sec.experienceTitle) + '</h2>' +
      '<article class="mobily" aria-labelledby="mobily-org"><div>' +
      '<h3 class="org" id="mobily-org">' + esc(v.mob.org) + '</h3>' +
      '<p class="role">' + esc(v.mob.role) + '</p><p class="meta">' + esc(v.mob.team) + '</p>' +
      '<span class="dates">' + esc(v.mob.dates) + '</span></div><div>' +
      '<p class="lead">' + esc(v.mob.lead) + '</p><ul class="hl-grid">' +
      v.mob.highlights.map(function (hl) { return '<li class="hl"><span class="hl-v">' + esc(hl.value) + '</span><span class="hl-t">' + esc(hl.text) + '</span></li>'; }).join('') +
      '</ul></div></article><ul class="roles">' +
      v.roles.map(function (r) {
        return '<li class="role-card"><p class="role-org">' + esc(r.org) + '</p><h3 class="role-title">' + esc(r.role) + '</h3>' +
          (r.dates ? '<p class="role-date">' + esc(r.dates) + '</p>' : '') + '<p class="role-text">' + esc(r.text) + '</p></li>';
      }).join('') + '</ul></div></section>';

    // Contact
    var mail = v.links.email ? safeUrl('mailto:' + v.links.email) : '';
    h += '<section class="section" id="contact" aria-labelledby="contact-title"><div class="wrap"><div class="contact">' +
      '<svg class="contact-sky" viewBox="0 0 400 300" preserveAspectRatio="xMaxYMid slice" aria-hidden="true"><polyline points="60,240 140,170 210,200 280,110 350,140 380,50" fill="none" stroke="#B0A2F0" stroke-width="1" stroke-dasharray="3 5" opacity=".6"></polyline><g fill="#F4E4B8"><circle cx="60" cy="240" r="2.4"></circle><circle class="tw" cx="140" cy="170" r="3"></circle><circle cx="210" cy="200" r="2"></circle><circle class="tw2" cx="280" cy="110" r="3.6"></circle><circle cx="350" cy="140" r="2.2"></circle><circle class="tw" cx="380" cy="50" r="4"></circle></g></svg>' +
      '<div class="contact-in"><p class="kicker">' + esc(v.sec.contactKicker) + '</p>' +
      '<h2 class="contact-title" id="contact-title">' + esc(v.contact.title) + '</h2>' +
      '<p class="contact-text">' + esc(v.contact.text) + '</p><div class="actions">' +
      extLink('btn primary', v.links.linkedin, esc(v.contact.linkedin) + ICON.ext, v.ui.opensNewTab) +
      cvButton(v) +
      (mail ? '<a class="btn" href="' + esc(mail) + '">' + ICON.mail + esc(v.contact.email) + '<span class="email-addr">' + esc(v.links.email) + '</span></a>' : '') +
      extLink('btn', v.links.github, esc(v.contact.github) + ICON.ext, v.ui.opensNewTab) +
      '</div></div></div></div></section>';

    h += '</main>';

    // Footer
    h += '<footer class="wrap foot"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' + STAR4 + '</svg><p style="margin: 0">' + esc(v.ui.footer) + '</p></footer>';
    return h;
  }

  /* ---------- render ---------- */

  function applyLang(lang) {
    var dir = lang === 'ar' ? 'rtl' : 'ltr';
    root.className = 'site lang-' + lang;
    root.setAttribute('dir', dir);
    root.setAttribute('lang', lang);
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', dir);
  }

  function render() {
    var lang = state.lang === 'ar' ? 'ar' : 'en';
    applyLang(lang);

    if (!state.data) {
      root.innerHTML = '<p class="state-msg" role="status">' + esc(state.error
        ? 'The portfolio content (portfolio-data.json) could not be loaded. · تعذّر تحميل محتوى الملف.'
        : 'Loading… · جاري التحميل…') + '</p>';
      return;
    }

    // Remember which control had focus so keyboard users keep their place.
    var active = document.activeElement;
    var focusKey = active && root.contains(active) ? active.getAttribute('data-k') : null;

    root.innerHTML = page(buildView());

    if (focusKey) {
      var el = root.querySelector('[data-k="' + focusKey.replace(/["\\]/g, '\\$&') + '"]');
      if (el) el.focus({ preventScroll: true });
    }
  }

  /* ---------- events ---------- */

  root.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('[data-action]') : null;
    if (!btn || !root.contains(btn)) return;
    var action = btn.getAttribute('data-action');
    var id = btn.getAttribute('data-id');

    if (action === 'lang') {
      var next = state.lang === 'ar' ? 'en' : 'ar';
      try { window.localStorage.setItem(LANG_KEY, next); } catch (err) { /* ignore */ }
      setState({ lang: next });
    } else if (action === 'toggle') {
      setState(function (st) { var o = Object.assign({}, st.open); o[id] = !st.open[id]; return { open: o }; });
    } else if (action === 'shot') {
      var idx = parseInt(btn.getAttribute('data-idx'), 10);
      setState(function (st) { var o = Object.assign({}, st.shotBy); o[id] = idx; return { shotBy: o }; });
    } else if (action === 'darb') {
      setState({ darbKnown: btn.getAttribute('data-val') === 'known' });
    } else if (action === 'stars') {
      setState(function (st) { return { stars: st.stars >= STAR_POINTS.length ? 1 : st.stars + 1 }; });
    }
  });

  /* ---------- boot ---------- */

  render();
  fetch(DATA_URL, { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function (d) {
      setState({ data: d, error: false });
      // If the page was opened with a #hash, jump there now that the content exists.
      if (location.hash) {
        var target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
        if (target) target.scrollIntoView();
      }
    })
    .catch(function (err) {
      console.warn('Could not load ' + DATA_URL, err);
      setState({ error: true });
    });
})();
