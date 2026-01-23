import "dotenv/config";
// import { GoogleGenerativeAI } from "@google/generative-ai";

// // 1. Connection Setup
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// // 2. Model Select karna (Gemini 1.5 Flash - Fast & Cheap/Free)
// const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
// console.log("Loaded Key:", process.env.GEMINI_API_KEY);
// async function main() {
//   try {
//     console.log("🤖 Thinking...");
    
//     // 3. Simple Message bhejna (Zero-Shot)
//     const prompt = "Hi Gemini! Are you working? Just say yes or no.";
    
//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const text = response.text();

//     console.log("✨ Answer:", text);
    
//   } catch (error) {
//     console.error("❌ Error:", error.message);
//   }
// }

// main();

import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI();

async function main() {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: "Say Hello in Hinglish" }],
    });

    console.log("✅ Reply:", response.choices[0].message.content);
  } catch (error) {
    console.log("❌ Error:", error.message);
  }
}

main();