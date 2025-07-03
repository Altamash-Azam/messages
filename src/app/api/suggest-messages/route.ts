import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { NextResponse } from 'next/server';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        // Parse the request body to get the prompt
        const { prompt: userPrompt } = await req.json();
        console.log('Received prompt:', userPrompt);

        const prompt = "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What's a hobby you've recently started?||If you could have dinner with any historical figure, who would it be?||What's a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment."

        if (!process.env.OPENAI_API_KEY) {
            return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const result = streamText({
            model: openai('gpt-4o'),
            maxTokens: 400,
            prompt,
        });

        console.log('StreamText result created', result.toDataStreamResponse());
        return result.toDataStreamResponse();
    } catch (error) {
        console.error('API route error:', error);

        // Handle specific OpenAI errors
        if (typeof error === 'object' && error !== null && 'status' in error && (error as any).status === 401) {
            return new Response(JSON.stringify({ error: 'Invalid OpenAI API key' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (typeof error === 'object' && error !== null && 'status' in error && (error as any).status === 429) {
            return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
                status: 429,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({
            error: (error instanceof Error ? error.message : 'An unexpected error occurred')
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}