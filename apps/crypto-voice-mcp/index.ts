#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import { tools } from "./tools";
import logger from "./services/logger";

const app = express();
let transport: SSEServerTransport;

logger.info('Starting crypto-voice MCP server');

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

// Register all tools with the MCP server
logger.info({ toolCount: tools.length }, 'Registering tools with MCP server');
tools.forEach((tool) => {
    logger.debug({ toolName: tool.name }, 'Registering tool');
    server.tool(tool.name, tool.description, tool.schema, tool.tool);
});

app.get("/sse", async (req, res) => {
    logger.info({ ip: req.ip }, 'Received SSE connection');
    transport = new SSEServerTransport("/message", res);
    await server.connect(transport);
});

app.post("/message", async (req, res) => {
    logger.debug('Received message from client');
    
    try {
        await transport.handlePostMessage(req, res);
    } catch (error) {
        logger.error({ error }, 'Error handling message');
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    logger.info({ port: PORT }, 'MCP Server is running');
});