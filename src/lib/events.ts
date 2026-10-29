// Holiday styling: the only list of events and their dates. Dates are
// "MM-DD", both ends inclusive, in the workshop's time zone; a range with
// from > to crosses the new year (e.g. "12-20" to "01-07").
//
// For each id: html[data-event="<id>"] in src/styles/site.css (section
// Holidays) sets the accent and shows .event-icon--<id>; the icon itself is
// in src/components/EventIcons.astro, whose type check fails on a missing one.
export const timeZone = "Europe/Nicosia";

export const events = [
    // { id: "halloween", from: "10-29", to: "11-01" }
] as const;

export type EventId = (typeof events)[number]["id"];
