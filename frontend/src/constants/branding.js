export const BRAND_DETAILS = Object.freeze({
  name: "GreenLeaf Farm",

  address: "10/F, Ginimellagaha, Baddegama, Sri Lanka",

  email: "contact@greenleaffarm.com",
  phone: "+94 91 227 6246",
});

export const BRAND_CONTACT_LINE = `${BRAND_DETAILS.email} | ${BRAND_DETAILS.phone}`;

export const BRAND_DOCUMENT_TITLES = Object.freeze({
  invoice: "Invoice",
  report: "Report",
});

export const formatDocumentTitle = (title) =>
  title ? String(title).toUpperCase() : "";
