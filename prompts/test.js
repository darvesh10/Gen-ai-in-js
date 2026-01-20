require("dotenv").config(); // .env se key load karega
const { GoogleGenerativeAI } = require("@google/generative-ai");

// 1. Connection Setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 2. Model Select karna (Gemini 1.5 Flash - Fast & Cheap/Free)
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function main() {
  try {
    console.log("🤖 Thinking...");
    
    // 3. Simple Message bhejna (Zero-Shot)
    const prompt = "Hi Gemini! Are you working? Just say yes or no.";
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("✨ Answer:", text);
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

main();