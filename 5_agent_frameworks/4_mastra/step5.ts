import "./env.ts";
import { join } from "node:path";
import { mkdirSync, rmSync, existsSync, readFileSync } from "node:fs";
import { Agent } from "@mastra/core/agent";
import { boardTools, makeFilesystem, WORKSPACE } from "./tools.ts";
import { resetBoard, addGoal, claimTodo, showBoard } from "./board.ts";

const GOAL = "Read notes.txt, translate its contents into natural Spanish, and write the Spanish to spanish.txt.";

const INSTRUCTIONS = `
You are a careful worker with a shared todo board and a set of file tools.

Take the pending goal and see it through. Begin by laying out a short plan: the handful of concrete steps the work itself breaks down into, added to the board under the goal. Then carry them out with your file tools, marking each step done as you finish it. Once the steps are all done, close the goal. Your files live in the single folder your tools are allowed to use.
`;


mkdirSync(WORKSPACE, { recursive: true });
rmSync(join(WORKSPACE, "spanish.txt"), { force: true });
resetBoard();
const goalId = addGoal(GOAL);
claimTodo(goalId); 
console.log(`Seeded goal ${goalId}: ${GOAL}\n`);


const filesystem = makeFilesystem();
const worker = new Agent({
  id: "worker",
  name: "Worker",
  instructions: INSTRUCTIONS,
  model: "openai/gpt-5.4-mini",
  tools: { ...boardTools, ...(await filesystem.listTools()) },
});

await worker.generate("Please work the pending goal on the board.", { maxSteps: 25 });
await filesystem.disconnect();

console.log("\nBoard after the run:");
showBoard();
const spanish = join(WORKSPACE, "spanish.txt");
if (existsSync(spanish)) {
  console.log("\nspanish.txt:\n" + readFileSync(spanish, "utf-8"));
}

process.exit(0);
