
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createTool } from "@mastra/core/tools";
import { MCPClient } from "@mastra/mcp";
import { z } from "zod";
import { addStep, listTodos, completeTodo } from "./board.ts";

/** The one folder the filesystem server is allowed to touch. */
export const WORKSPACE = join(dirname(fileURLToPath(import.meta.url)), "workspace");

export const showTodos = createTool({
  id: "show_todos",
  description: "List every todo on the board. A goal has parent_id null; a step has parent_id set to its goal's id.",
  inputSchema: z.object({}),
  execute: async () => ({ todos: listTodos() }),
});

export const planSteps = createTool({
  id: "plan_steps",
  description: "Break a goal into an ordered checklist of steps on the board. Pass the goal's id and a short list of step descriptions.",
  inputSchema: z.object({ goalId: z.number(), steps: z.array(z.string()) }),
  execute: async ({ goalId, steps }) => ({ goalId, stepIds: steps.map((s: string) => addStep(goalId, s)) }),
});

export const completeTask = createTool({
  id: "complete_task",
  description: "Mark a todo (a step or the goal) with this id as done and record a short result summary.",
  inputSchema: z.object({ taskId: z.number(), result: z.string() }),
  execute: async ({ taskId, result }) => {
    completeTodo(taskId, result);
    return { taskId, status: "done" };
  },
});

/** Attach to an agent with tools: { ...boardTools }. */
export const boardTools = { showTodos, planSteps, completeTask };


export function makeFilesystem(dir = WORKSPACE): MCPClient {
  return new MCPClient({
    servers: {
      filesystem: {
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-filesystem", dir],
        stderr: "ignore",
        cwd: dir,
      },
    },
  });
}
