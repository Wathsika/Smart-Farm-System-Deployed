export const BRAND_DETAILS = Object.freeze({
  name: "GreenLeaf Farm",
  address: "244/9, Dines Place, Kaduwela Rd, Malabe, Sri Lanka",
  email: "contact@greenleaffarm.com",
  phone: "+94 77 123 4567",
});

export const BRAND_CONTACT_LINE = `${BRAND_DETAILS.email} | ${BRAND_DETAILS.phone}`;

export const BRAND_DOCUMENT_TITLES = Object.freeze({
  invoice: "Invoice",
  report: "Report",
});

export const formatDocumentTitle = (title) =>
  (title ? String(title).toUpperCase() : "");