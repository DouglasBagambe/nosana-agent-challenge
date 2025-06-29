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
