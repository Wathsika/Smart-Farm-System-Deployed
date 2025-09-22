// --- START OF FILE controllers/chat.controller.js ---

import Product from "../models/Product.js";
import { openai, CHAT_MODEL } from "../utils/openaiClient.js";

import {
  detectIntent,
  findProductsByQuery,
  productAnswer,
  getProductInformationForTool
} from "../utils/productSearch.js";
import { getDiscountInformationForTool } from "../utils/discountSearch.js";


export async function handleChat(req, res) {
  try {
    const userMessage = String(req.body?.message || "").trim();
    if (!userMessage) return res.status(400).json({ error: "message required" });

    const tools = [
      {
        type: "function",
        function: {
          name: "getProductInformationForTool",
          description: "Retrieve details (price, stock, description, general info) for one or more products from the GreenLeaf store catalog. Use this tool for any product-related queries.",
          parameters: {
            type: "object",
            properties: {
              productQueries: {
                type: "array",
                description: "A list of product names or SKUs the user is asking about (e.g., ['Organic Apples', 'MLK002', 'Milk', 'Bread']). Each item in the array should be a distinct product query.",
                items: {
                  type: "string",
                },
                minItems: 1,
              },
              intent: {
                type: "string",
                enum: ["price", "stock", "description", "info"],
                description: "The specific information the user is seeking about these products (e.g., 'price', 'stock', 'description', 'info' for general details). If user is asking about multiple items and one general intent (e.g., 'price'), provide that. If user asks about 'details of apple and price of milk', use 'info' and let the underlying function sort out the exact product string for 'apple' vs 'milk'.",
                default: "info",
              },
            },
            required: ["productQueries"],
          },
        },
      },
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

    const firstResponse = await openai.chat.completions.create({
      model: CHAT_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a helpful and friendly store assistant for GreenLeaf, an organic products store. You can answer questions about products, store policies, and general queries. Use the available tools to find specific product or discount information. For product queries, you can search for multiple products at once by providing a list of product names/SKUs. If you cannot find information using tools, or if it's a general question, answer from your knowledge. Keep answers concise and helpful."
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      tools: tools,
      tool_choice: "auto",
      temperature: 0.7,
      max_tokens: 400,
    });

    const responseMessage = firstResponse.choices[0].message;

    if (responseMessage.tool_calls) {
      // ✅ මෙතන තමයි ප්‍රධාන වෙනස්කම: සියලුම tool calls Array එකක් ලෙස හසුරුවන්න
      const toolCalls = responseMessage.tool_calls;
      const toolMessages = []; // සියලුම tool output messages මේකට එකතු කරමු

      for (const toolCall of toolCalls) { // ✅ toolCalls Array එක හරහා iterate කරන්න
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);
        console.log(`OpenAI requested tool call: ${functionName} with arguments:`, functionArgs);

        let toolOutput;

        if (functionName === "getProductInformationForTool") {
          // getProductInformationForTool එක දැන් multiple queries support කරන නිසා,
          // OpenAI විසින් එක් tool call එකකදී query list එකක් එවිය හැකියි
          toolOutput = await getProductInformationForTool({
            productQueries: functionArgs.productQueries,
            intent: functionArgs.intent || null
          });
        } else if (functionName === "getDiscountInformationForTool") {
          toolOutput = await getDiscountInformationForTool({
            productQuery: functionArgs.productQuery || null,
            code: functionArgs.code || null
          });
        } else {
          // If an unrecognized tool is requested, we need to report it back to OpenAI
          toolOutput = `Error: Unrecognized tool "${functionName}"`;
        }
        
        console.log("Tool output:", toolOutput);
        
        // ✅ එක් එක් tool call එකට අදාළ tool message එක toolMessages Array එකට එකතු කරන්න
        toolMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: toolOutput,
        });
      }

      // 5. --- Tool එකේ ප්‍රතිඵලය (සියල්ල) සමග නැවත OpenAI වෙත යවන්න ---
      const secondResponse = await openai.chat.completions.create({
        model: CHAT_MODEL,
        messages: [
          {
            role: "system",
            content: "You are a helpful and friendly store assistant for GreenLeaf, an organic products store. You can answer questions about products, store policies, and general queries. Use the available tools to find specific product or discount information. For product queries, you can search for multiple products at once by providing a list of product names/SKUs. If you cannot find information using tools, or if it's a general question, answer from your knowledge. Keep answers concise and helpful."
          },
          {
            role: "user",
            content: userMessage,
          },
          responseMessage, // OpenAI ගේ original assistant message (with ALL tool_calls)
          ...toolMessages, // ✅ මෙහිදී සියලුම tool outputs Array එක Splice කළ යුතුය
        ],
        temperature: 0.7,
        max_tokens: 400,
      });

      const finalAnswer = secondResponse.choices[0].message.content;
      return res.json({ answer: finalAnswer, mode: `openai_tool_handled` }); // mode එක සාමාන්‍යකරණය කළා
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