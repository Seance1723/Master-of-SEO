#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { ACTIONS, findAction, formatActions } from "./actions.js";
import { readMemory, updateMemory, updateReadmeStatus } from "./memory.js";
import { ROOT } from "./paths.js";

const protocolVersion = "2024-11-05";
let buffer = "";

const tools = [
  {
    name: "master_of_seo_actions",
    description: "Show all available Master of SEO slash actions. Use when the user types / in a Master of SEO workflow.",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "master_of_seo_action",
    description: "Read one modular /seo-master action file.",
    inputSchema: {
      type: "object",
      properties: { action: { type: "string", description: "Action name, such as technical-audit." } },
      required: ["action"]
    }
  },
  {
    name: "master_of_seo_read_memory",
    description: "Read Master of SEO project memory before starting the next group/module.",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "master_of_seo_update_memory",
    description: "Append a project memory note after a group/module.",
    inputSchema: {
      type: "object",
      properties: { note: { type: "string" } },
      required: ["note"]
    }
  },
  {
    name: "master_of_seo_complete_group",
    description: "Complete a group/module by updating memory and README status.",
    inputSchema: {
      type: "object",
      properties: {
        completedGroup: { type: "string" },
        nextAction: { type: "string" }
      },
      required: ["completedGroup"]
    }
  }
];

function send(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

function text(content) {
  return { content: [{ type: "text", text: content }] };
}

async function handle(request) {
  const { id, method, params = {} } = request;

  try {
    if (method === "initialize") {
      send({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion,
          capabilities: {
            tools: {},
            prompts: {},
            resources: {}
          },
          serverInfo: { name: "master-of-seo", version: "0.1.0" }
        }
      });
      return;
    }

    if (method === "notifications/initialized") return;

    if (method === "tools/list") {
      send({ jsonrpc: "2.0", id, result: { tools } });
      return;
    }

    if (method === "tools/call") {
      const name = params.name;
      const args = params.arguments || {};

      if (name === "master_of_seo_actions") {
        send({ jsonrpc: "2.0", id, result: text(formatActions()) });
        return;
      }

      if (name === "master_of_seo_action") {
        const action = findAction(args.action);
        if (!action) throw new Error(`Unknown action: ${args.action}`);
        const content = await readFile(`${ROOT}/${action.reference}`, "utf8");
        send({ jsonrpc: "2.0", id, result: text(content) });
        return;
      }

      if (name === "master_of_seo_read_memory") {
        send({ jsonrpc: "2.0", id, result: text(await readMemory()) });
        return;
      }

      if (name === "master_of_seo_update_memory") {
        send({ jsonrpc: "2.0", id, result: text(await updateMemory(args.note)) });
        return;
      }

      if (name === "master_of_seo_complete_group") {
        await updateMemory(`Completed group/module: ${args.completedGroup}\nNext action: ${args.nextAction || "read memory, then choose the next /seo-master action"}`);
        const status = await updateReadmeStatus(args);
        send({ jsonrpc: "2.0", id, result: text(status) });
        return;
      }

      throw new Error(`Unknown tool: ${name}`);
    }

    if (method === "prompts/list") {
      send({
        jsonrpc: "2.0",
        id,
        result: {
          prompts: [
            {
              name: "seo-master",
              description: "Start the gated Master of SEO workflow.",
              arguments: []
            }
          ]
        }
      });
      return;
    }

    if (method === "prompts/get") {
      send({
        jsonrpc: "2.0",
        id,
        result: {
          description: "Master of SEO gated workflow",
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: "/seo-master\nRead project memory first, then ask which action to run or show actions when I type /."
              }
            }
          ]
        }
      });
      return;
    }

    if (method === "resources/list") {
      send({
        jsonrpc: "2.0",
        id,
        result: {
          resources: [
            { uri: "master-of-seo://actions", name: "Master of SEO actions", mimeType: "text/markdown" },
            { uri: "master-of-seo://memory", name: "Master of SEO project memory", mimeType: "text/markdown" }
          ]
        }
      });
      return;
    }

    if (method === "resources/read") {
      const uri = params.uri;
      const content = uri === "master-of-seo://memory" ? await readMemory() : formatActions();
      send({ jsonrpc: "2.0", id, result: { contents: [{ uri, mimeType: "text/markdown", text: content }] } });
      return;
    }

    send({ jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } });
  } catch (error) {
    send({ jsonrpc: "2.0", id, error: { code: -32000, message: error.message } });
  }
}

process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  buffer += chunk;
  const lines = buffer.split(/\r?\n/u);
  buffer = lines.pop() || "";
  for (const line of lines) {
    if (!line.trim()) continue;
    handle(JSON.parse(line));
  }
});
