import dotenv from "dotenv";
import { createGroq } from "@ai-sdk/groq";

// Load environment variables
dotenv.config();

// Export environment variables
export const modelName =
  process.env.MODEL_NAME_AT_ENDPOINT ?? "llama-3.1-8b-instant";
export const baseURL =
  process.env.API_BASE_URL ?? "https://api.groq.com/openai/v1";
export const apiKey = process.env.GROQ_API_KEY;

// Create Groq provider using AI SDK
const groq = createGroq({
  baseURL,
  apiKey,
});

// Export the model instance for Mastra
export const model = groq(modelName);

console.log(`ModelName: ${modelName}\nbaseURL: ${baseURL}`);

// import dotenv from "dotenv";

// // Load environment variables
// dotenv.config();

// // Export environment variables
// export const modelName =
//   process.env.MODEL_NAME_AT_ENDPOINT ?? "llama-3.1-8b-instant";
// export const baseURL =
//   process.env.API_BASE_URL ?? "https://api.groq.com/openai/v1";
// export const apiKey = process.env.GROQ_API_KEY;

// // Create model configuration that works with Mastra's DynamicArgument type
// export const model = {
//   provider: "groq", // Specify the provider
//   name: modelName,
//   config: {
//     baseURL,
//     apiKey,
//   },
// };

// // Alternative approach if the above doesn't work:
// // You might need to create a function that returns the model configuration
// export const createModel = () => ({
//   provider: "groq",
//   name: modelName,
//   config: {
//     baseURL,
//     apiKey,
//   },
// });

// console.log(`ModelName: ${modelName}\nbaseURL: ${baseURL}`);
