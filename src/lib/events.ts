// Holiday styling: the only list of events and their dates. Dates are
// "MM-DD", both ends inclusive, in the workshop's time zone; a range with
// from > to crosses the new year (e.g. "12-20" to "01-07"). Holidays tied to
// Orthodox Easter give easter: [from, to] instead, in days from Easter Sunday.
// A one-day holiday starts two days early. Where ranges overlap, the earlier
// entry wins.
//
// For each id: html[data-event="<id>"] in src/styles/site.css (section
// Holidays) sets the accent and shows .event-icon--<id>; the icon itself is
// in src/components/EventIcons.astro, whose type check fails on a missing one.
export const timeZone = "Europe/Nicosia";

export const events = [
    { id: "christmas", from: "12-22", to: "01-06" }, // Christmas, New Year, Epiphany
    { id: "green-monday", easter: [-50, -48] },
    { id: "greek-independence", from: "03-23", to: "03-25" },
    { id: "national-day", from: "03-30", to: "04-01" }, // EOKA Day
    { id: "easter", easter: [-2, 2] }, // Good Friday to Easter Tuesday; before labour-day
    { id: "labour-day", from: "04-29", to: "05-01" },
    { id: "kataklysmos", easter: [48, 50] }, // Pentecost Monday
    { id: "assumption", from: "08-13", to: "08-15" },
    { id: "independence-day", from: "09-29", to: "10-01" },
    { id: "ochi-day", from: "10-26", to: "10-28" },
    { id: "halloween", from: "10-29", to: "11-01" }
] as const;

export type EventId = (typeof events)[number]["id"];
