import readline from "readline";
import { Tiktoken } from "js-tiktoken/lite";
import o200k_base from "js-tiktoken/ranks/o200k_base";

const enc = new Tiktoken(o200k_base);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("\n🧠 Token Visualizer (CLI)");
console.log("✅ Powered by js-tiktoken (OpenAI-style tokenizer)\n");

function showTokens(text) {
  const tokenIds = enc.encode(text);

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📌 Input Text:");
  console.log(text);

  console.log("\n🔢 Total Tokens:", tokenIds.length);

  console.log("\n🧩 Token IDs:");
  console.log(tokenIds);
   const inputPricePer1M = 0.15; // Example rate ($ per 1M tokens)
  const estimatedCost = (tokenIds.length / 1_000_000) * inputPricePer1M;

  console.log("\n💰 Estimated Input Cost:");
  console.log(`$${estimatedCost.toFixed(8)} (at $${inputPricePer1M}/1M tokens)`);

  console.log("\n📝 Token Breakdown (decode):");
  tokenIds.forEach((id, index) => {
    const chunk = enc.decode([id]);
    console.log(index + 1, ".", id, "->", chunk);
  });

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

function askInput() {
  rl.question("Enter text (or type 'exit'): ", (text) => {
    if (text.trim().toLowerCase() === "exit") {
      console.log("\n👋 Exiting Token Visualizer. Bye!\n");
      rl.close();
      return;
    }

    if (!text.trim()) {
      console.log("\n⚠️ Please enter some text.\n");
      return askInput();
    }

    showTokens(text);
    askInput();
  });
}

askInput();
