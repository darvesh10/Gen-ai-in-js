import 'dotenv/config';
import { OpenAI } from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getJudgeFeedback(thought, originalQuestion) {
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: "system",
        content: `You are a strict Logic Reviewer. 
        Analyze the User's thought process for the given Question.
        - If the thought is correct and logical, reply with JSON: {"status": "APPROVED", "feedback": "Great, proceed."}
        - If the thought is WRONG, reply with JSON: {"status": "REJECTED", "feedback": "Brief explanation of error."}`
      },
      {
        role: "user",
        content: `Question: ${originalQuestion}\n\nCurrent Thought: ${thought}`
      }
    ],
    response_format: { type: "json_object" } // Judge ko bhi JSON force kiya
  });

  return JSON.parse(response.choices[0].message.content);
}

async function main() {
  // Is question ko change karke dekhna (e.g., maths or coding)
  const USER_QUESTION = "Write a code in JS to find a prime number as fast as possible";

  const SYSTEM_PROMPT = `
    You are an AI assistant named "Student". You solve problems step-by-step.
    
    Response Format (Strict JSON):
    { "step": "START" | "THINK" | "OUTPUT", "content": "your text here" }

    Rules:
    1. Start with { "step": "START", "content": "..." }
    2. Then { "step": "THINK", "content": "..." } for every logical step.
    3. After every THINK, stop and wait for EVALUATION.
    4. Only give { "step": "OUTPUT" } when you are 100% sure.
  `;

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: USER_QUESTION },
  ];

  console.log(`🤖 Question: ${USER_QUESTION}\n`);

  while (true) {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini', // Sasta aur tikau
      messages: messages,
      response_format: { type: "json_object" } // JSON Mode ON (Zaruri hai)
    });

    const rawContent = response.choices[0].message.content;
    const parsedContent = JSON.parse(rawContent);

    // AI ka message history mein save karo;
    messages.push({ role: 'assistant', content: rawContent });

  
    // STEP 1: START
   
    if (parsedContent.step === 'START') {
      console.log(`🚀 START: ${parsedContent.content}`);
      continue;
    }

 
    // STEP 2: THINKING (Main Magic Here)
    
    if (parsedContent.step === 'THINK') {
      console.log(`\t Socha: ${parsedContent.content}`);

      // Judge ko call kiya (Wait karega)
      console.log(`\t Judge Checking...`);
      const judgeResult = await getJudgeFeedback(parsedContent.content, USER_QUESTION);
      
      console.log(`\t Judge Said: [${judgeResult.status}] ${judgeResult.feedback}`);

      // Judge ka feedback Student ko wapas bhejo
      messages.push({
        role: 'user', // User ban ke feedback diya
        content: JSON.stringify({
          step: 'EVALUATE',
          status: judgeResult.status,
          content: judgeResult.feedback
        }),
      });

      continue;
    }

    if (parsedContent.step === 'OUTPUT') {
      console.log(`\n✅ FINAL ANSWER:\n${parsedContent.content}`);
      break;
    }
  }

  console.log('\n🏁 Process Done...');
}

main();