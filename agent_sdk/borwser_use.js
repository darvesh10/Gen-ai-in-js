import 'dotenv/config';
import { Agent, run, tool } from '@openai/agents';
import { z } from 'zod';
import { chromium } from 'playwright';
import fs from 'fs';

// 1. BROWSER LAUNCH (Playwright)
const browser = await chromium.launch({ headless: false }); // Headless: false taaki tu dekh sake kya ho raha hai
const page = await browser.newPage();

// --- TOOLS DEFINITION ---

// Tool 1: Website Kholna
const navigateTool = tool({
  name: 'navigate_url',
  description: 'Navigate to a specific URL',
  parameters: z.object({
    url: z.string().describe('The URL to visit'),
  }),
  execute: async ({ url }) => {
    await page.goto(url);
    return `Mapsd to ${url}`;
  },
});

// Tool 2: Screenshot Lena (Aankhein) - VERY IMPORTANT
const screenshotTool = tool({
  name: 'take_screenshot',
  description: 'Take a screenshot of the current page to understand the UI',
  parameters: z.object({}),
  execute: async () => {
    const screenshot = await page.screenshot();
    // AI ko hum image nahi bhej sakte directly SDK mein abhi,
    // Isliye hum save karte hain aur AI ko bolte hain "Maine dekh liya".
    // (Advanced version mein Base64 bhejte hain, par abhi simple rakhte hain)
    const path = `screenshot_${Date.now()}.png`;
    fs.writeFileSync(path, screenshot);
    return `Screenshot saved at ${path}. Analyze the UI structure from context or ask user. (Note: In real VLM agent, image goes to LLM)`;
  },
});

// Tool 3: Click Karna (Coordinates nahi, Selector use karenge - Easy way)
const clickTool = tool({
  name: 'click_element',
  description: 'Click on an element using text or selector',
  parameters: z.object({
    selector: z.string().describe('The text on the button or input placeholder to click (e.g., "Submit" or "Name")'),
  }),
  execute: async ({ selector }) => {
    // Playwright ka magic: Text se element dhundhna
    try {
      await page.getByText(selector, { exact: false }).first().click();
      return `Clicked on element containing text: "${selector}"`;
    } catch (e) {
      // Agar text se nahi mila toh CSS selector try karega
      try {
          await page.click(selector);
          return `Clicked on selector: "${selector}"`;
      } catch (err) {
          return `Failed to click. Error: ${err.message}`;
      }
    }
  },
});

// Tool 4: Form Bharna (Keyboard)
const fillFormTool = tool({
  name: 'fill_input',
  description: 'Type text into an input field',
  parameters: z.object({
    label: z.string().describe('The label or placeholder of the input field (e.g., "Name", "Email")'),
    value: z.string().describe('The value to type'),
  }),
  execute: async ({ label, value }) => {
    try {
      await page.getByPlaceholder(label, { exact: false }).fill(value);
      return `Typed "${value}" into field "${label}"`;
    } catch (e) {
       // Fallback: Label text se dhundho
       try {
           await page.getByLabel(label).fill(value);
           return `Typed "${value}" into field label "${label}"`;
       } catch (err) {
           return `Failed to type. Error: ${err.message}`;
       }
    }
  },
});

// --- AGENT DEFINITION ---

const browserAgent = new Agent({
  name: 'Browser Automation Agent',
  model: 'gpt-4o', // Vision model zaruri hai agar hum image analysis karein (abhi text logic use kar rahe hain)
  instructions: `
    You are a Browser Automation Assistant.
    Your goal is to interact with websites to complete user tasks.

    Workflow:
    1. Navigate to the URL.
    2. Always 'take_screenshot' to confirm page loaded (in this simplified version, assume layout).
    3. Use 'fill_input' to fill forms.
    4. Use 'click_element' to click buttons.

    Tips for PiyushGarg.dev Contact Form:
    - The inputs usually have placeholders like "Name", "Email", "Message".
    - The button usually says "Send Message" or "Submit".
  `,
  tools: [navigateTool, screenshotTool, clickTool, fillFormTool],
});

// --- RUNNER ---

async function main() {
  const task = "Go to https://piyushgarg.dev, find the contact form, and fill Name='Test User', Email='test@example.com', Message='Hello from AI Agent', then click Send.";

  console.log(`🤖 Starting Task: ${task}\n`);

  const result = await run(browserAgent, task);

  console.log("✅ Task Completed!");
  console.log("Final Response:", result.finalOutput);

  // Browser band mat karna taaki tu dekh sake kya hua
  // await browser.close();
}

main();