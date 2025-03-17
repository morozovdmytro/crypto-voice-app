import { JobContext, llm, multimodal, defineAgent } from "@livekit/agents";
import * as openai from '@livekit/agents-plugin-openai';
import { OPENAI_INSTRUCTIONS } from "../constants.js";
import { McpClient } from "../mcp/index.js";

export default defineAgent({
    entry: async (ctx: JobContext) => {
        try {
            console.log('Starting agent');

            const openaiApiKey = process.env.OPENAI_API_KEY;
            if (!openaiApiKey) {
                throw new Error('OPENAI_API_KEY is not set');
            }

            console.log('Connecting to Livekit');
            await ctx.connect();

            console.log('Waiting for participant');
            const participant = await ctx.waitForParticipant();

            const participantMetadata = participant.metadata;
            const participantAttributes = participant.attributes;

            console.log('Participant metadata:', participantMetadata);
            console.log('Participant attributes:', participantAttributes);

            let userInfo = {};
            if (participantMetadata) {
                try {
                    userInfo = JSON.parse(participantMetadata);
                    console.log('Parsed user info:', userInfo);
                } catch (error) {
                    console.error('Error parsing participant metadata:', error);
                }
            }

            const mcpServerUrl = process.env.MCP_SERVER_URL;
            if (!mcpServerUrl) {
                throw new Error('MCP_SERVER_URL is not set');
            }
            const mcpClient = new McpClient(mcpServerUrl);
            await mcpClient.connect();

            const tools = await mcpClient.listTools();
            console.log('Available tools:', tools);

            console.log('Creating model');
            const model = new openai.realtime.RealtimeModel({
                instructions: OPENAI_INSTRUCTIONS,
                apiKey: openaiApiKey,
            });

            const fncCtx: llm.FunctionContext = {};

            tools?.tools?.forEach((tool) => {
                fncCtx[tool.name] = {
                    description: tool.description ?? tool.name,
                    parameters: tool.inputSchema,
                    execute: async (args: any) => {
                        console.log(`Executing tool: ${tool.name} with args: ${JSON.stringify(args)}`);
                        const result = await mcpClient.callTool(tool.name, args);
                        console.log(`Tool ${tool.name} executed with result: ${JSON.stringify(result)}`);
                        return result.content?.[0]?.text ?? 'No result';
                    }
                }
                console.log(`Added tool: ${tool.name}`);
            });

            console.log('Creating agent');
            const agent = new multimodal.MultimodalAgent({
                model,
                fncCtx,
            });

            console.log('Starting agent');
            const session = await agent
                .start(ctx.room, participant)
                .then((session) => session as openai.realtime.RealtimeSession);

            // Create a greeting message that includes user information if available
            let greetingText = 'Say "How can I help you today?"';

            // If we have user information, include it in the greeting
            if (Object.keys(userInfo).length > 0) {
                greetingText = `The user's information is: ${JSON.stringify(userInfo)}. Greet them by name if available and ask how you can help them today.`;
            }

            console.log('Sending message to agent');
            session.conversation.item.create(
                llm.ChatMessage.create({
                    role: llm.ChatRole.USER,
                    text: greetingText,
                }),
            );

            console.log('Creating response');
            session.response.create();
        } catch (error) {
            console.error('Error in agent:', error);
            throw error;
        }
    }
}); 