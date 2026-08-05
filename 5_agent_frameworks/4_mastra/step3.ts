
import "./env.ts";
import { Agent } from "@mastra/core/agent";
import { showTodos, completeTask } from "./tools.ts";
import { resetBoard, addGoal, showBoard } from "./board.ts";

resetBoard();
addGoal("Read notes.txt, translate its contents into natural Spanish, and write the Spanish to spanish.txt.");

const boardAgent = new Agent({
  id: "board-agent",
  name: "Board Agent",
  instructions: "You help manage a shared todo board.",
  model: "openai/gpt-5.4-mini",
  tools: { showTodos, completeTask },
});

const reply = await boardAgent.generate("What is on the board right now, and what is its status?");
console.log(reply.text);

console.log("\nThe board:");
showBoard();

process.exit(0); 
