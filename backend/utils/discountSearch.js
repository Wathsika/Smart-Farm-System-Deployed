// --- START OF FILE utils/discountSearch.js ---

import Discount from "../models/Discount.js"; // ✅ ඔබේ Discount model එකට ඇති නිවැරදි path එක මෙය යැයි උපකල්පනය කර ඇත
import Product from "../models/Product.js"; // Product model එකත් අවශ්‍යයි

const norm = s => (s||"").toString().toLowerCase().trim();

// OpenAI විසින් කැඳවිය හැකි "tool" එකේ ක්‍රියාකාරිත්වය
export async function getDiscountInformationForTool({ productQuery = null, code = null }) {
  let discounts = [];
  const now = new Date();

  // Find active discounts with the new model structure
  const baseQuery = {
    startDate: { $lte: now },
    endDate: { $gte: now },
    isActive: true,
  };

  // 1. If a specific discount code is provided
  if (code) {
    discounts = await Discount.find({ ...baseQuery, code: new RegExp(`^${norm(code)}$`, 'i') }).lean();
  }
  // 2. If a specific product query is provided
  else if (productQuery) {
    const productQueryRx = new RegExp(norm(productQuery).split(" ").join(".*"), 'i');
    
    // First, find products matching the query to infer context for discounts
    // NOTE: Your Discount model does NOT directly link to ProductIds/CategoryIds.
    // So, we'll look for general discounts or discounts whose 'name' field
    // *might* imply a product. This part will be less precise than direct linking.
    // If you add product-specific discount linking to your Discount model,
    // this logic would need to be updated.
    
    // For now, if a product is queried, we'll try to find any discount whose 'name' or 'code'
    // contains the product query, OR general discounts.

    // Try to find general discounts or those with discount name/code related to the product query
    discounts = await Discount.find({
        ...baseQuery,
        $or: [
            // Look for discounts whose name or code contains the product query
            { name: productQueryRx },
            { code: productQueryRx }
        ]
    }).lean();
    
    if (discounts.length === 0) {
      return `Sorry, I couldn't find any active discounts specifically mentioning "${productQuery}".`;
    }

  }
  // 3. If no specific product or code, list all general active discounts
  else {
    // We'll consider any active discount as "general" if not specifically tied to a productQuery or code.
    // You might want to categorize discounts further in your model (e.g., global, product-specific, category-specific)
    // For now, this will return all active discounts not filtered by product/code
    discounts = await Discount.find(baseQuery).lean();
  }

  if (discounts.length === 0) {
    return "Currently, there are no active general discounts available. Please check back later!";
  }

  // Format the discounts into a readable string
  let response = "Here are the active discounts available:\n";
  discounts.forEach(discount => {
    const discountValue = discount.type === 'PERCENTAGE'
      ? `${discount.value}% off`
      : `LKR ${discount.value.toLocaleString("en-LK")} off`; // Use toLocaleString for currency formatting

    const minAmount = discount.minPurchase > 0
      ? ` for purchases over LKR ${discount.minPurchase.toLocaleString("en-LK")}`
      : "";
    
    // Check if the name and code are the same or different for clarity
    const nameOrCode = (discount.name && discount.name.toLowerCase() !== discount.code.toLowerCase())
                       ? `"${discount.name}" (Code: ${discount.code})`
                       : `Code: ${discount.code}`;

    response += `\n- ${nameOrCode}: Get ${discountValue}${minAmount}. Valid until ${new Date(discount.endDate).toDateString()}.\n`;
  });

  return response.trim();
}

// --- END OF FILE utils/discountSearch.js ---