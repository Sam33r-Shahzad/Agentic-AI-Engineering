

import "./env.ts";
import { Agent } from "@mastra/core/agent";
import { makeFilesystem } from "./tools.ts";

const filesystem = makeFilesystem();

const fileAgent = new Agent({
  id: "file-agent",
  name: "File Agent",
  instructions: "You can read and write files in your workspace. Use your tools to do what is asked.",
  model: "openai/gpt-5.4-mini",
  tools: await filesystem.listTools(),
});

const reply = await fileAgent.generate("Read notes.txt and summarize it in one short sentence.");
console.log(reply.text);

await filesystem.disconnect();

process.exit(0);
