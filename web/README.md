# Alex Morgan — Developer Portfolio

A production-ready, dark-first portfolio built with React, Tailwind CSS, Vite, and Framer Motion. The design uses a warm black canvas, coral editorial accents, lime status cues, mono metadata, and responsive card layouts.

## Local development

```bash
cd web
npm install
npm run dev
```

To load a real public GitHub repository list, create `web/.env`:

```bash
VITE_GITHUB_USERNAME=your-github-username
```

The app fetches up to three recently updated public repositories from the GitHub REST API. If the variable is absent or the request fails, it falls back to the curated project placeholders in `src/data.ts`, which are intentionally easy to replace with your own links and copy.

## Customize

Update the profile name, social links, email address, project content, skills, and copy in `src/App.tsx` and `src/data.ts`. Replace placeholder `#` live demo and repository URLs before publishing. The contact form is intentionally front-end only: connect its submit handler to Formspree, Resend, a serverless function, or your preferred form provider when you are ready.

## Deploy to Vercel

1. Import the repository in Vercel.
2. Set the **Root Directory** to `web`.
3. Keep the framework preset as **Vite**.
4. Set the build command to `npm run build` and output directory to `dist`.
5. Add `VITE_GITHUB_USERNAME` under Project Settings → Environment Variables if you want live repositories.
6. Deploy.

## Deploy to GitHub Pages

This is a Vite static build and can be served from `web/dist`.

```bash
cd web
npm install
npm run build
```

Publish the contents of `web/dist` with GitHub Pages, or add a GitHub Actions workflow that runs the same commands and uploads `web/dist` as the Pages artifact. If your Pages site is hosted at a repository subpath, set Vite's `base` option in `vite.config.ts` to `'/repository-name/'` before building. For a custom domain or `username.github.io` repository, the default `/` base works.

## Existing mobile app

The original Expo app remains untouched at the repository root. The portfolio is isolated under `web/` so it can be deployed independently without changing the mobile build.
