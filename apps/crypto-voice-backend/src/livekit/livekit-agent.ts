import { JobContext, llm, multimodal, defineAgent } from '@livekit/agents';
import * as openai from '@livekit/agents-plugin-openai';
import { OPENAI_INSTRUCTIONS } from '../constants.js';
import { McpClient } from '../mcp/index.js';
import { ToolCallResult } from '../types.js';
import { getProcessor } from '../utils/processor.utils.js';
import { Tool } from '../types.js';

export default defineAgent({
  entry: async (ctx: JobContext) => {
    // Generate a unique conversation ID from the room name/id
    const conversationId = ctx.room?.name || 'unknown';
    console.log(`Starting agent for conversation ${conversationId}`);

    try {
      // Check environment variables once at the start
      const openaiApiKey = process.env.OPENAI_API_KEY;
      if (!openaiApiKey) {
        throw new Error('OPENAI_API_KEY is not set');
      }

      const mcpServerUrl = process.env.MCP_SERVER_URL;
      if (!mcpServerUrl) {
        throw new Error('MCP_SERVER_URL is not set');
      }

      // Connect to Livekit
      console.log(`Connecting to Livekit for conversation ${conversationId}`);
      await ctx.connect();

      // Wait for participant asynchronously
      console.log(`Waiting for participant in conversation ${conversationId}`);
      const participant = await ctx.waitForParticipant();

      const participantMetadata = participant.metadata;
      const participantAttributes = participant.attributes;

      console.log(`Participant joined conversation ${conversationId}`);
      console.log('Participant metadata:', participantMetadata);
      console.log('Participant attributes:', participantAttributes);

      // Process user information
      let userInfo: Record<string, any> = {};
      if (participantMetadata) {
        try {
          userInfo = JSON.parse(participantMetadata) as Record<string, any>;
          console.log(
            `Parsed user info for conversation ${conversationId}:`,
            userInfo,
          );
        } catch (error) {
          console.error(
            `Error parsing participant metadata for conversation ${conversationId}:`,
            error,
          );
        }
      }

      const mcpClient = new McpClient(mcpServerUrl);
      await mcpClient.connect();

      const tools = await mcpClient.listTools();

      console.log(`Available tools for conversation ${conversationId}:`, tools);

      console.log(`Creating model for conversation ${conversationId}`);
      const model = new openai.realtime.RealtimeModel({
        instructions: OPENAI_INSTRUCTIONS,
        apiKey: openaiApiKey,
      });

      const fncCtx: llm.FunctionContext = {};

      if (tools?.tools) {
        tools.tools.forEach((tool: Tool) => {
          fncCtx[tool.name] = {
            description: tool.description ?? tool.name,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            parameters: tool.inputSchema,
            execute: async (args: any) => {
              console.log(
                `Conversation ${conversationId} - Executing tool: ${tool.name} with args: ${JSON.stringify(args)}`,
              );

              try {
                const result = (await mcpClient.callTool(
                  tool.name,
                  args,
                )) as ToolCallResult;

                console.log(
                  `Conversation ${conversationId} - Tool ${tool.name} executed with result: ${JSON.stringify(result)}`,
                );

                if (result.type?.length) {
                  console.log(
                    `Conversation ${conversationId} - Processing result of type: ${result.type}`,
                  );
                  const processor = getProcessor(result.type, ctx);
                  await processor.process(result);
                }

                return result.content?.[0]?.text ?? 'No result';
              } catch (error: any) {
                console.error(
                  `Conversation ${conversationId} - Error executing tool ${tool.name}:`,
                  error,
                );

                return `There was an error executing the ${tool.name} tool: ${(error as Error)?.message || 'Unknown error'}. You can try a different approach or ask the user for more information.`;
              }
            },
          };
        });
      }

      console.log(`Creating agent for conversation ${conversationId}`);
      const agent = new multimodal.MultimodalAgent({
        model,
        fncCtx,
      });

      console.log(`Starting agent session for conversation ${conversationId}`);
      const session = await agent
        .start(ctx.room, participant)
        .then((session) => session as openai.realtime.RealtimeSession);

      let greetingText = 'Say "How can I help you today?"';

      if (Object.keys(userInfo).length > 0) {
        greetingText = `The user's information is: ${JSON.stringify(userInfo)}. Greet them by name if available and ask how you can help them today.`;
      }

      console.log(
        `Sending greeting to agent for conversation ${conversationId}`,
      );
      session.conversation.item.create(
        llm.ChatMessage.create({
          role: llm.ChatRole.USER,
          text: greetingText,
        }),
      );

      console.log(`Creating response for conversation ${conversationId}`);
      session.response.create();

      ctx.room.once('disconnected', () => {
        console.log(
          `Conversation ${conversationId} disconnected, performing cleanup`,
        );
      });

      ctx.room.on('dataReceived', (payload) => {
        console.log(`Conversation ${conversationId} - Received data`);
        const decoder = new TextDecoder();
        const message = decoder.decode(payload);
        const eventData = JSON.parse(message) as {
          type: string;
          status: string;
          amount: string;
          message: string;
        };

        console.log(`Conversation ${conversationId} - Event data:`, eventData);

        if (eventData?.message?.length) {
          session.conversation.item.create(
            llm.ChatMessage.create({
              role: llm.ChatRole.USER,
              text: eventData.message,
            }),
          );
          session.response.create();
        }
      });
    } catch (error) {
      console.error(
        `Error in agent for conversation ${conversationId}:`,
        error,
      );
      throw error;
    }
  },
});
