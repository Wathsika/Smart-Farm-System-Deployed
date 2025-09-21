// --- START OF FILE controllers/chat.controller.js ---

import Product from "../models/Product.js";
// ✅ openaiClient.js path එක 'utils' ෆෝල්ඩරයට අනුව වෙනස් කළා
import { openai, CHAT_MODEL } from "../utils/openaiClient.js"; // <--- PATH CHANGED!

// ඔබේ product search utilities
import {
  detectIntent,
  findProductsByQuery,
  productAnswer,
  getProductInformationForTool
} from "../utils/productSearch.js"; // ✅ ඔබේ productSearch.js path එකට ගැලපෙන ලෙස යොදන්න!
// ✅ discountSearch.js import කරන්න
import { getDiscountInformationForTool } from "../utils/discountSearch.js"; // ✅ ඔබේ discountSearch.js path එකට ගැලපෙන ලෙස යොදන්න!


export async function handleChat(req, res) {
  try {
    const userMessage = String(req.body?.message || "").trim();
    if (!userMessage) return res.status(400).json({ error: "message required" });

    // 1. --- OpenAI වෙත යැවිය යුතු Tools අර්ථ දැක්වීම ---
    const tools = [
      {
        type: "function",
        function: {
          name: "getProductInformationForTool",
          description: "Retrieve product details, price, stock, or description from the GreenLeaf store catalog. Use this tool for any product-related queries.",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The product name or SKU the user is asking about (e.g., 'Organic Apples', 'MLK002', 'Milk', 'Bread'). This should be extracted from the user's message.",
              },
              intent: {
                type: "string",
                enum: ["price", "stock", "description", "info"],
                description: "The specific information the user is seeking about the product (e.g., 'price', 'stock', 'description', 'info' for general details).",
                default: "info",
              },
            },
            required: ["query"],
          },
        },
      },
      // ✅ මෙන්න අලුත් Discount Information Tool එක
      {
        type: "function",
        function: {
          name: "getDiscountInformationForTool",
          description: "Retrieve information about active discounts, either general discounts, discounts for a specific product, or by a discount code. Use this tool for any discount or offer related queries.",
          parameters: {
            type: "object",
            properties: {
              productQuery: {
                type: "string",
                description: "The name or type of product for which the user is asking for a discount (e.g., 'Organic Apples', 'Dairy products', 'Coffee'). Only provide a value for this if a product is clearly specified in the user's question.",
                nullable: true,
              },
              code: {
                type: "string",
                description: "A specific discount code the user is asking about (e.g., 'SUMMER20', 'SAVE10'). Only provide a value for this if a discount code is explicitly mentioned.",
                nullable: true,
              },
            },
          },
        },
      },
    ];

    // 2. --- පළමු OpenAI API ඇමතුම ---
    const firstResponse = await openai.chat.completions.create({
      model: CHAT_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a helpful and friendly store assistant for GreenLeaf, an organic products store. You can answer questions about products, store policies, and general queries. Use the available tools to find specific product or discount information. If you cannot find information using tools, or if it's a general question, answer from your knowledge. Keep answers concise and helpful."
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      tools: tools,
      tool_choice: "auto",
      temperature: 0.7,
      max_tokens: 350, // ටිකක් වැඩි කළා
    });

    const responseMessage = firstResponse.choices[0].message;

    // 3. --- OpenAI ගේ ප්‍රතිචාරය හසුරුවන්න ---
    if (responseMessage.tool_calls) {
      const toolCall = responseMessage.tool_calls[0];
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);
      console.log(`OpenAI requested tool call: ${functionName} with arguments:`, functionArgs);

      let toolOutput;

      if (functionName === "getProductInformationForTool") {
        toolOutput = await getProductInformationForTool(functionArgs);
      } else if (functionName === "getDiscountInformationForTool") {
        // OpenAI විසින් `productQuery` හෝ `code` අර්ථ දක්වා නැත්නම්,
        // අපි එය `null` හෝ `undefined` ලෙස getDiscountInformationForTool වෙත යවනවා.
        toolOutput = await getDiscountInformationForTool({
          productQuery: functionArgs.productQuery || null,
          code: functionArgs.code || null
        });
      } else {
        return res.json({ answer: "My apologies, I received a tool call I don't know how to handle.", mode: "openai_error" });
      }

      console.log("Tool output:", toolOutput);

      // 5. --- Tool එකේ ප්‍රතිඵලය සමග නැවත OpenAI වෙත යවන්න ---
      const secondResponse = await openai.chat.completions.create({
        model: CHAT_MODEL,
        messages: [
          {
            role: "system",
            content: "You are a helpful and friendly store assistant for GreenLeaf, an organic products store. You can answer questions about products, store policies, and general queries. Use the available tools to find specific product or discount information. If you cannot find information using tools, or if it's a general question, answer from your knowledge. Keep answers concise and helpful."
          },
          {
            role: "user",
            content: userMessage,
          },
          responseMessage,
          {
            role: "tool",
            tool_call_id: toolCall.id,
            content: toolOutput,
          },
        ],
        temperature: 0.7,
        max_tokens: 350,
      });

      const finalAnswer = secondResponse.choices[0].message.content;
      return res.json({ answer: finalAnswer, mode: `openai_tool_${functionName}` });
    } else {
      const finalAnswer = responseMessage.content;
      return res.json({ answer: finalAnswer, mode: "openai_direct" });
    }

  } catch (e) {
    console.error("Chatbot Error:", e);
    let errorMessage = "Server issue. Please try again later.";
    if (e.response && e.response.data && e.response.data.error) {
        errorMessage = `OpenAI API Error: ${e.response.data.error.message}`;
        if (e.response.status === 401) {
            errorMessage += ". Please check your API key.";
        }
    } else if (e.message) {
        errorMessage = `Error: ${e.message}`;
    }
    res.status(500).json({ error: errorMessage });
  }
}

// --- END OF FILE controllers/chat.controller.js ---