import { JobContext, llm, multimodal, defineAgent } from "@livekit/agents";
import * as openai from '@livekit/agents-plugin-openai';
import { OPENAI_INSTRUCTIONS } from "../constants.js";
import { McpClient } from "../mcp/index.js";

// Define the expected shape of tool call results
interface ToolCallResult {
    type?: string;
    transactionData?: any;
    content?: Array<{
        type: string;
        text: string;
    }>;
}

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
                        
                        try {
                            // Set a timeout for the overall tool execution
                            const toolCallPromise = mcpClient.callTool(tool.name, args);
                            const timeoutPromise = new Promise<never>((_, reject) => {
                                setTimeout(() => reject(new Error(`Tool ${tool.name} execution timed out after 20 seconds`)), 20000);
                            });
                            
                            const result = await Promise.race([toolCallPromise, timeoutPromise]) as ToolCallResult;
                            console.log(`Tool ${tool.name} executed with result: ${JSON.stringify(result)}`);

                            if (result.type === 'transaction' && result.transactionData) {
                                console.log('Transaction data detected, sending to client via data channel');
                                if (ctx.room.localParticipant) {
                                    await ctx.room.localParticipant.publishData(
                                        Buffer.from(result.transactionData),
                                        { topic: 'transaction', reliable: true }
                                    );
                                    console.log('Transaction data sent to client');
                                } else {
                                    console.warn('Cannot send transaction data: localParticipant is undefined');
                                }
                            }

                            // Return only the text content for the model
                            return result.content?.[0]?.text ?? 'No result';
                        } catch (error) {
                            console.error(`Error executing tool ${tool.name}:`, error);
                            
                            // Return an error message to the model so it can handle it gracefully
                            return `There was an error executing the ${tool.name} tool: ${error.message || 'Unknown error'}. You can try a different approach or ask the user for more information.`;
                        }
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