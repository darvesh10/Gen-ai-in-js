import 'dotenv/config';
import { OpenAI } from 'openai';
import axios from 'axios';
import fs from 'fs';

// --- TOOLS SETUP ---

async function loader(url) {
  console.log(`\n🌐 Reading Website: ${url}`);
  try {
    const { data } = await axios.get(url);
    // Token limit bachane ke liye sirf 6000 characters le rahe hain
    return typeof data === 'string' ? data.slice(0, 6000) : "No text data found";
  } catch (error) {
    return `Failed to load website: ${error.message}`;
  }
}

async function writer(args) {
  // Input kabhi string mein aata hai kabhi object mein, handle kar rahe hain
  const { filename, content } = typeof args === 'string' ? JSON.parse(args) : args;
  
  console.log(`\n💾 Writing Code to: ${filename}`);
  try {
    fs.writeFileSync(filename, content);
    return `Success! File saved at ${filename}`;
  } catch (error) {
    return `Failed to save file: ${error.message}`;
  }
}

const TOOL_MAP = {
  loader: loader,
  writer: writer,
};

// --- AI SETUP ---
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function main() {
  const SYSTEM_PROMPT = `
    You are an Autonomous AI Web Cloner.
    Goal: Read a website URL, understand its design, and generate a clone HTML file locally.

    TOOLS available:
    - loader(url): Get HTML source.
    - writer({ "filename": "index.html", "content": "<html>...</html>" }): Save the file.

    RULES:
    - Always START -> THINK -> TOOL -> OBSERVE -> OUTPUT.
    - If you get the HTML, rewrite a clean version (don't copy junk code).
    - Combine HTML and CSS in one file.
    - ALWAYS save the file using the writer tool before finishing.
    
    Output JSON Format:
    { "step": "START | THINK | OUTPUT | OBSERVE | TOOL", "content": "...", "tool_name": "...", "input": "..." }
  `;

  // Yahan apna URL badal sakte ho testing ke liye
  const userQuery = "Clone this website: https://example.com";

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userQuery },
  ];

  console.log(`🤖 Mission Started: ${userQuery}\n`);

  while (true) {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    messages.push({ role: 'assistant', content: JSON.stringify(result) });

    // --- LOGIC HANDLING ---

    if (result.step === 'START') {
      console.log(`🔥 START: ${result.content}`);
      continue;
    }

    if (result.step === 'THINK') {
      console.log(`🧠 THINK: ${result.content}`);
      continue;
    }

    if (result.step === 'TOOL') {
      const toolName = result.tool_name;
      console.log(`🛠️ TOOL: Using ${toolName}...`);

      if (!TOOL_MAP[toolName]) {
        console.log("❌ Error: Tool not found");
        break;
      }

      // Tool ko call kiya
      const toolOutput = await TOOL_MAP[toolName](result.input);
      
      // Output bada ho sakta hai, console pe thoda hi dikhayenge
      console.log(`👀 OBSERVE: Got Data (Length: ${toolOutput.length} chars)`);

      messages.push({
        role: 'developer',
        content: JSON.stringify({ step: 'OBSERVE', content: toolOutput })
      });
      continue;
    }

    if (result.step === 'OUTPUT') {
      console.log(`\n✅ DONE: ${result.content}`);
      break;
    }
  }
}

main();























































































// import { GoogleGenerativeAI } from "@google/generative-ai"

// // Apni API Key yahan paste kar
// const genAI = new GoogleGenerativeAI('');

// async function listAllModels() {
//   const { GoogleGenerativeAI } = await import("@google/generative-ai");
//   const genAI = new GoogleGenerativeAI("");
//   const result = await genAI.listModels();
//   console.log(result.models.map(m => m.name));
// }
// // listAllModels(); // Isse call karke dekh lo


// async function runTest() {
//   try {
//   const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
//     const prompt = "hi explain humans in just 5 words dont use more than this";

//     console.log("Testing API Key...");
//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const text = response.text();

//     console.log("------------------------------");
//     console.log("✅ Success! Response:", text);
//     console.log("------------------------------");
//     console.log("Note: Agar ye response fast aaya hai, toh paid/trial active ho sakta hai.");
//   } catch (error) {
//     console.error("❌ Error found:");
//     if (error.message.includes("429")) {
//       console.error("Status: Rate Limit Reached (Free Tier ki limit cross ho gayi).");
//     } else if (error.message.includes("403")) {
//       console.error("Status: API Key Invalid ya Billing issue.");
//     } else {
//       console.error(error.message);
//     }
//   }
// }

// runTest();