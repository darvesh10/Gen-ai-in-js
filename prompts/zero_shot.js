import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  try {
   const response = await client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    // 1. System Instruction (Bas role bataya)
    { 
      role: "system", 
      content: "You are a helpful coding assistant." 
    },
    
    // 2. Direct Question (Zero examples)
    { 
      role: "user", 
      content: "Explain Recursion in one line." 
    }
  ],
});

    console.log("✅ Reply:", response.choices[0].message.content);
  } catch (error) {
    console.log("❌ Error:", error.message);
  }
}

main();