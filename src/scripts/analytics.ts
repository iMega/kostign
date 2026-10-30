// GA4 events: the contact links, the language switch and the collapsed
// work areas. A link takes part by data-track (the action) and
// data-track-location (where it is on the page); an area by its
// <details id>. Without the tag (no measurement ID in the build) it does
// nothing.

declare global {
  interface Window {
    gtag?: (command: "event", name: string, params: Record<string, unknown>) => void;
  }
}

const track = (name: string, params: Record<string, unknown>) => {
  if (typeof window.gtag !== "function") return;
  window.gtag("event", name, { ...params, language: document.documentElement.lang });
};

const linkEvents: Record<string, (link: HTMLAnchorElement) => [string, Record<string, unknown>]> = {
  call: () => ["click_to_call", {}],
  directions: () => ["get_directions", {}],
  language: (link) => ["select_language", { language_selected: link.hreflang }],
};

// Capture phase: the event is queued before the browser leaves the page;
// the beacon outlives a same-tab navigation (the language switch).
document.addEventListener(
  "click",
  (e) => {
    const link = (e.target as Element).closest<HTMLAnchorElement>("a[data-track]");
    const event = link && linkEvents[link.dataset.track ?? ""];
    if (!link || !event) return;

    const [name, params] = event(link);
    track(name, { ...params, link_location: link.dataset.trackLocation, transport_type: "beacon" });
  },
  { capture: true },
);

// toggle does not bubble: caught on the way down. Only opening counts,
// by a click on the title or by a link to the area (#engine).
document.addEventListener(
  "toggle",
  (e) => {
    const details = e.target;
    if (details instanceof HTMLDetailsElement && details.open) {
      track("expand_section", { section_id: details.id });
    }
  },
  { capture: true },
);

export {};
