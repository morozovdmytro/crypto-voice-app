import { JobContext, llm, multimodal, defineAgent } from "@livekit/agents";
import * as openai from '@livekit/agents-plugin-openai';
import { OPENAI_INSTRUCTIONS, OPENAI_MODEL, OPENAI_TEMPERATURE, OPENAI_VOICE } from "../constants.js";

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
            
            // Access participant metadata and attributes
            const participantMetadata = participant.metadata;
            const participantAttributes = participant.attributes;
            
            console.log('Participant metadata:', participantMetadata);
            console.log('Participant attributes:', participantAttributes);
            
            // Parse user information from metadata if it exists
            let userInfo = {};
            if (participantMetadata) {
                try {
                    userInfo = JSON.parse(participantMetadata);
                    console.log('Parsed user info:', userInfo);
                } catch (error) {
                    console.error('Error parsing participant metadata:', error);
                }
            }

            console.log('Creating model');
            const model = new openai.realtime.RealtimeModel({
                instructions: OPENAI_INSTRUCTIONS,
                apiKey: openaiApiKey,
            });

            const fncCtx: llm.FunctionContext = {};

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