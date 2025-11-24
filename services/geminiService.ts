import { GoogleGenAI } from "@google/genai";
import { Language, ModelType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCode = async (
  prompt: string, 
  language: Language, 
  modelLabel: ModelType
): Promise<string> => {
  const modelName = 'gemini-3-pro-preview'; // Coding tasks should use gemini-3-pro-preview
  
  const systemPrompt = `You are an expert coding assistant specializing in ${language}. 
  The user has selected the model configuration: ${modelLabel}.
  Your task is to generate clean, runnable, and efficient code based on the user's request.
  Do not include markdown backticks (e.g. \`\`\`) in the output, just the raw code.
  Add comments explaining complex parts.`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2, // Low temp for precise code
      }
    });
    return response.text || "// No code generated.";
  } catch (error) {
    console.error("Gemini Gen Error:", error);
    throw new Error("Failed to generate code. Please try again.");
  }
};

export const explainCode = async (
  code: string,
  language: Language
): Promise<string> => {
  const modelName = 'gemini-3-pro-preview'; // Advanced reasoning tasks should use gemini-3-pro-preview
  
  const systemPrompt = `You are a senior software engineer. 
  Analyze the following ${language} code. 
  Perform a virtual AST analysis to understand the structure.
  Provide a structured explanation covering:
  1. Logic Flow
  2. Time & Space Complexity
  3. Edge Cases & Potential Bugs
  4. Suggested Improvements
  
  Format the output in clear Markdown.`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: code,
      config: {
        systemInstruction: systemPrompt,
      }
    });
    return response.text || "No explanation generated.";
  } catch (error) {
    console.error("Gemini Explain Error:", error);
    throw new Error("Failed to explain code.");
  }
};