import { JobContext, llm, multimodal, defineAgent } from "@livekit/agents";
import * as openai from '@livekit/agents-plugin-openai';

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

            console.log('Creating model');
            const model = new openai.realtime.RealtimeModel({
                instructions: 'You are a helpful assistant.',
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

            console.log('Sending message to agent');
            session.conversation.item.create(
                llm.ChatMessage.create({
                    role: llm.ChatRole.USER,
                    text: 'Say "How can I help you today?"',
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