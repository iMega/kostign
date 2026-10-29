// @ts-check
import { defineConfig } from "astro/config";

// Static output only: the server (mygarage-infra) serves files, there is no
// Node process behind it. Pages build to <page>/index.html, which the
// proxy resolves for /<page> and /<page>/.
//
// The site address is never written in the code: SITE_URL (CI sets it per
// environment) becomes Astro.site in pages; empty leaves it undefined.
export default defineConfig({
  site: process.env.SITE_URL || undefined,
  output: "static",
  build: {
    format: "directory",
    // The stylesheet is a few KiB: inline it so it does not block the
    // first render with an extra request.
    inlineStylesheets: "always",
  },
});
