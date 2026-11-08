# Environment variables

This folder contains setup guidance only. Do not put real API keys or passwords in this folder or commit them to GitHub.

## Local development

1. Copy the root `.env.example` file to `.env` in the project root.
2. Add your real values to `.env`.
3. Restart the Vite development server after changing environment values.

The root `.env` is ignored by Git. Commit `.env.example` only; it contains variable names and blank placeholders.

## Vercel deployment

- For the AI scan and chatbot, add these server values in **Vercel → Project Settings → Environment Variables**:

  ```text
  GEMINI_API_KEY
  FATSECRET_CLIENT_ID
  FATSECRET_CLIENT_SECRET
  ```

- Nusa Bot and image identification use Gemini through `GEMINI_API_KEY`.
- Add only keys for providers you use. The values entered as GitHub Actions Secrets do not automatically transfer to Vercel.
- The frontend calls API routes on the same Vercel domain. Leave `VITE_API_BASE_URL` unset.
- `GEMINI_API_KEY` and `FATSECRET_CLIENT_SECRET` must remain server-side; never rename them to `VITE_*`.

GitHub Pages publishes only the static frontend through `.github/workflows/deploy-pages.yml`; it cannot run the functions in `api/`. The workflow currently points `VITE_API_BASE_URL` to an external API deployment. Update that URL and the API's allowed origin if you deploy this repository elsewhere. Keep `GEMINI_API_KEY` and FatSecret credentials in the API host's server-side environment. In the repository's **Settings → Pages**, set the build and deployment source to **GitHub Actions**.

Firebase web configuration and the Supabase anon key are client-side values, not server secrets. Protect their use with Firebase/Supabase security rules and provider-side restrictions. Never put a Supabase `service_role` key in a `VITE_*` variable.

## API key handling

AyuScan and Nusa Bot send requests to the server-side API. They do not ask visitors to enter a provider API key; keep all provider credentials in Vercel environment variables.
