# Ghala Alshreef — Portfolio

A static, bilingual (English / Arabic) portfolio site. Plain HTML, CSS and vanilla JavaScript: no framework and no build step.

```
index.html               page shell, meta tags, fonts
styles.css               all styling (copied verbatim from the design reference)
app.js                   loads the data, renders the page, handles interactions
data/portfolio-data.json ALL the content, in English and Arabic
assets/*.webp            project screenshots
favicon.svg              gold four-point star
```

## Run it locally

The page loads its content with `fetch`, which browsers block for `file://` pages, so you need a local web server. Opening `index.html` directly will show the "could not be loaded" message.

From this folder, run:

```bash
npx serve .
```

Then open the address it prints (usually http://localhost:3000).

No Node? Python works too:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Edit the content

Everything you read on the site comes from `data/portfolio-data.json`. Edit it, save, and reload the page.

- Every piece of text has an `"en"` and an `"ar"` version. Keep both.
- About Me: wrap words in `**double asterisks**` to highlight them in gold.
- Capabilities: wrap a phrase in `{curly braces}` and set `"project"` to a project `id` (for example `"askmypdf"`). The phrase then links to that project's card. If no project has that id, the phrase stays plain text.
- Projects (`featured`) appear in the order they're listed. The first seven also appear as stars on the constellation map.
- Screenshots: put the `.webp` in `assets/` and reference it as `"assets/name.webp"`, with a `label` and `alt` text in both languages.
- Links: set `live`, `github` or `play` on a project only when that link should be public. Leave a field out to hide its button.
- `education`, `heroDemo` and `hero.intro` are kept in the file on purpose but aren't shown on the page.

The JSON must stay valid. A missing comma or quote will make the page show the "could not be loaded" message. https://jsonlint.com can find the error.

## Deploy

### Vercel

1. Push this folder to a GitHub repository.
2. At https://vercel.com/new, import the repository.
3. Framework preset: **Other**. Leave the build command empty and set the output directory to `.` (the root).
4. Click **Deploy**.

Or from the terminal, inside this folder:

```bash
npx vercel --prod
```

### GitHub Pages

1. Push this folder to a GitHub repository. `index.html` must be at the repository root.
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, pick `main` and `/ (root)`, then save.
4. After a minute the site is live at `https://<your-username>.github.io/<repo-name>/`.

All paths in the site are relative, so it works from a sub-path like that.

### Netlify

Drag this folder onto https://app.netlify.com/drop.

## After deploying

Social previews: once you know the final URL, you can add a preview image to `index.html`. Social sites require an absolute URL, for example:

```html
<meta property="og:image" content="https://your-domain/assets/bunyan-hero.webp">
<meta property="og:url" content="https://your-domain/">
```

and change `twitter:card` to `summary_large_image`.
