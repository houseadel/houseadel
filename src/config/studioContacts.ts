/**
 * Every public address House Adel is reachable at, in one place.
 *
 * `hello@houseadel.com` is the canonical public address. Mail sent to it is
 * routed by Cloudflare Email Routing into the studio's underlying inbox, and
 * replies leave through Brevo's SMTP relay as that same address — but none of
 * that is the website's business. The underlying inbox is infrastructure and is
 * deliberately never published here, because everything in this file is
 * rendered into the page: the footer, the Contact column, and the contact line
 * on both legal pages all read from it.
 */
export const studioContacts = Object.freeze({
  instagram: {
    label: "Instagram",
    value: "@thehouseadel",
    href: "https://www.instagram.com/thehouseadel/",
  },
  tiktok: {
    label: "TikTok",
    value: "@house.adel",
    href: "https://www.tiktok.com/@house.adel",
  },
  whatsapp: {
    label: "WhatsApp",
    value: "+62 811 7783 600",
    href: "https://wa.me/628117783600",
  },
  email: {
    label: "Email",
    value: "hello@houseadel.com",
    href: "mailto:hello@houseadel.com",
  },
});

export const studioContactLinks = Object.freeze([
  studioContacts.instagram,
  studioContacts.tiktok,
  studioContacts.whatsapp,
  studioContacts.email,
]);
