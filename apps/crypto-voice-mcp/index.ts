#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import { tools } from "./tools";

const app = express();
let transport: SSEServerTransport;

const server = new McpServer(
    {
        name: "codefunded/crypto-voice",
        version: "0.1.0",
    },
    {
        capabilities: {
            tools: {
                listChanged: true
            }
        }
    }
);

tools.forEach((tool) => {
    server.tool(tool.name, tool.description, tool.schema, tool.tool);
});

app.get("/sse", async (req, res) => {
    console.log("Received connection");
    transport = new SSEServerTransport("/message", res);
    await server.connect(transport);
    
});

app.post("/message", async (req, res) => {
    console.log("Received message");
    
    await transport.handlePostMessage(req, res);
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});