import { contact } from "./contact";

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// schema.org data for search results: address, phone and opening hours.
export const autoRepairJsonLd = (url: URL | undefined) =>
  JSON.stringify({
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    name: contact.name,
    url: url?.href,
    telephone: contact.phone,
    hasMap: contact.mapUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Neapoleos 10",
      addressLocality: "Paphos",
      postalCode: "8020",
      addressCountry: "CY",
    },
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: weekdays, opens: "08:00", closes: "17:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "08:00", closes: "13:00" },
    ],
  });
