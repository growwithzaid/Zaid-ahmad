# Zaid Ahmad portfolio

Static portfolio for GitHub Pages with the home page, `/development/`, and `/seo/` experiences. Source pages are plain HTML/CSS/JS. The production output is built into `dist/` and deliberately copies only selected public assets. It excludes the supplied original CV (which contains a residential address), the SEO MP4, and unrelated files.

## Local preview

From the repository root, run:

```powershell
./scripts/build.ps1
python -m http.server 8000 --directory dist
```

Open `http://localhost:8000/`, `/development/`, and `/seo/`. Direct routes are folders with `index.html`, so refreshing them works on static hosts.

## GitHub Pages

The existing public portfolio repository is `growwithzaid/Zaid-ahmad` and its current site URL is `https://growwithzaid.github.io/Zaid-ahmad/`. The workflow at `.github/workflows/pages.yml` builds `dist/` and deploys it to Pages. In the GitHub repository, set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**. Push to `main`; then inspect the Actions run and verify the live site at the URL above.

The local output is a project-site build. Page and asset links are relative so they work under the `/Zaid-ahmad/` path. The canonical links and sitemap use the current site URL.

## Resume privacy

`assets/cv/Zaid-Ahmad-CV.pdf` is a privacy-safe portfolio copy assembled from verified CV details. It uses the current email/phone and omits the old residential address and portrait. The original `assets/documents/zaid-ahmad-gazi-resume.pdf` is preserved locally and excluded from Git and the deployment output. Review the safe copy before publishing it.

## Contact form

The form is disabled until `assets/config.js` contains the deployed Apps Script `/exec` URL. The source is `apps-script/Code.gs`; follow `CONTACT-FORM-SETUP.md`. A real submission and spreadsheet row must be verified before describing the integration as active. The current task cannot deploy it without the user’s Google authorization flow.
