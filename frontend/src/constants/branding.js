export const BRAND_DETAILS = Object.freeze({
  name: "GreenLeaf Farm",
  address: "123 Farm Valley Road, Green County, Sri Lanka",
  email: "contact@greenleaffarm.com",
  phone: "+94 11 234 5678",
});

export const BRAND_CONTACT_LINE = `${BRAND_DETAILS.email} | ${BRAND_DETAILS.phone}`;

export const BRAND_DOCUMENT_TITLES = Object.freeze({
  invoice: "Invoice",
  report: "Report",
});

export const formatDocumentTitle = (title) =>
  (title ? String(title).toUpperCase() : "");