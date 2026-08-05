import "./env.ts";
import { Agent } from "@mastra/core/agent";

const agent = new Agent({
  id: "assistant",
  name: "Assistant",
  instructions: "You are a concise, friendly assistant. Reply in a single short sentence.",
  model: "openai/gpt-5.4-mini",
});

console.log(`Created agent: ${agent.name}`);
