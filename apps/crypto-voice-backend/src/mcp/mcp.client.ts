import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { z } from 'zod';

export class McpClient {
  private readonly transport: SSEClientTransport;
  private client: Client | null = null;

  constructor(private readonly serverUrl: string) {
    this.transport = new SSEClientTransport(new URL(serverUrl));
  }

  async connect() {
    const client = new Client(
      {
        name: 'codefunded/crypto-voice',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );
    await client.connect(this.transport);
    this.client = client;
  }

  async listTools() {
    if (!this.client) {
      throw new Error('Client not connected');
    }
    const tools = await this.client.listTools();
    return tools;
  }

  async callTool<Args extends z.ZodTypeAny>(
    toolName: string,
    toolArgs: z.infer<Args>,
  ) {
    if (!this.client) {
      throw new Error('Client not connected');
    }
    const result = await this.client.callTool({
      name: toolName,
      arguments: toolArgs,
    });
    return result;
  }

  async disconnect() {
    if (!this.client) {
      throw new Error('Client not connected');
    }
    await this.client.close();
    this.client = null;
  }
}
