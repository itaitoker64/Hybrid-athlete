/**
 * Native build configuration.
 *
 * On the web, the app and its serverless function share an origin, so the app
 * can call /api/ai with a relative path. Inside the Android app the page is
 * served from https://localhost, which has no /api route — the AI features
 * would fail with a confusing "AI UNREACHABLE" until this points somewhere real.
 *
 * Set this to the origin of your deployment (no trailing slash), e.g.
 *   window.HA_API_BASE = "https://hybrid-athlete.vercel.app";
 *
 * Leaving it empty is a valid choice: everything except the AI vision and
 * coaching features works fully offline, and those surface the existing
 * "AI UNREACHABLE" message rather than crashing.
 */
window.HA_API_BASE = "";
