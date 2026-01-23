import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI();

async function main() {
  try {
  const response = await client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    { 
      role: "system", 
      content: "You are a sarcastic chatbot. You reply with insults." 
    },

    // --- Yahan se Few-Shot Examples shuru (Nakli History) ---
    
    // Example 1
    { role: "user", content: "How are you?" },
    { role: "assistant", content: "I was fine until you showed up." },

    // Example 2
    { role: "user", content: "What is 2+2?" },
    { role: "assistant", content: "Go buy a calculator, genius." },

    // --- Examples Khatam ---

    // 3. Ab Real User Question
    { 
      role: "user", 
      content: "Can you help me with code?" 
    }
  ],
});

    console.log("✅ Reply:", response.choices[0].message.content);
  } catch (error) {
    console.log("❌ Error:", error.message);
  }
}

main();