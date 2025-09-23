// --- START OF FILE utils/productSearch.js ---

import Product from "../models/Product.js";

const norm = s => (s||"").toString().toLowerCase().trim();

export function detectIntent(msg){
  const m = norm(msg);
  if (/(price|cost|how much|මිල|මිල කීයද|කියලද)\s*(of|for)?/i.test(m)) return "price";
  if (/(stock|available|in stock|ඇතිද|availability|qty|quantity)\s*(of|for)?/i.test(m)) return "stock";
  if (/(description|details|about|information|ගැන|තොරතුරු)/i.test(m)) return "description";
  return "info";
}

export async function findProductsByQuery(q, limit=5){
  const query = norm(q);
  const rx = new RegExp(query.split(" ").join(".*"), "i");

  // 1. SKU exact match (highest priority, ignores spaces for robustness)
  const skuExact = await Product.findOne({ sku: new RegExp("^"+query.replace(/\s/g,""), "i"), status: { $ne: "ARCHIVED" } }).lean();
  if (skuExact) return [skuExact];

  // 2. Exact name match (case-insensitive)
  const exactName = await Product.findOne({ name: new RegExp(`^${query}$`, "i"), status: { $ne: "ARCHIVED" } }).lean();
  if (exactName) return [exactName];

  // 3. Name regex (word-by-word presence)
  const byName = await Product.find({ name: rx, status: { $ne: "ARCHIVED" } }).limit(limit).lean();
  if (byName.length) return byName;

  // 4. Fallback: Category/tag/partial SKU regex
  return await Product.find({
    $or: [{ category: rx }, { tags: rx }, { sku: rx }],
    status: { $ne: "ARCHIVED" }
  }).limit(limit).lean();
}

export function productAnswer(p, intent="info"){
  const qty = p?.stock?.qty ?? undefined;
  const stockText = qty === undefined ? "" : qty > 0 ? `In stock (${qty})` : "Out of stock";
  const unit = p?.unit ? ` per ${p.unit}` : "";
  const price = typeof p?.price === "number" ? `LKR ${p.price.toLocaleString("en-LK")}` : "Price not set";

  switch (intent) {
    case "price":
      return `${p.name}: ${price}${unit}. ${stockText}`.trim();
    case "stock":
      return `${p.name}: ${stockText || "Stock information not available."}.`;
    case "description":
      return `${p.name}: ${p.description || "No description available."} Category: ${p.category}. ${price}${unit}. ${stockText}.`.trim();
    case "info":
    default:
      return `${p.name} is priced at ${price}${unit}. ${stockText}. Category: ${p.category}.`;
  }
}

// ✅ නව function එක: මෙය OpenAI විසින් කැඳවිය හැකි "tool" එක වනු ඇත
// `productQueries` Array එකක් ලෙස බලාපොරොත්තු වේ
export async function getProductInformationForTool({ productQueries, intent }) {
  if (!Array.isArray(productQueries) || productQueries.length === 0) {
    return "No product queries provided to the tool.";
  }

  const results = [];
  for (const query of productQueries) { // Array එකේ ඇති එක් එක් query සඳහා සොයන්න
    const products = await findProductsByQuery(query, 1);
    if (products.length > 0) {
      const product = products[0];
      const finalIntent = intent || detectIntent(query); // List එකකදී common intent එකක් හෝ individual intent
      results.push(productAnswer(product, finalIntent));
    } else {
      results.push(`Sorry, I couldn't find "${query}" in our catalog.`);
    }
  }
  
  // සියලු ප්‍රතිඵල එක string එකක් ලෙස combine කර ආපසු එවන්න
  return results.join("\n");
}

// --- END OF FILE utils/productSearch.js ---