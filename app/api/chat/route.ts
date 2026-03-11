
import { NextResponse } from 'next/server';

export const runtime = 'nodejs'; // Use nodejs runtime for compatibility with Ollama

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Ensure there are messages
    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'No messages provided' },
        { status: 400 }
      );
    }

    // Connect to local Ollama instance
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || 'phi3:mini',
        messages: [
          {
            role: 'system',
            content: `You are Sangam AI, an intelligent assistant for the Sangam government schemes platform. 
            Your goal is to help users find relevant government schemes based on their needs.
            Always be polite, professional, and concise. 
            If you recommend schemes, present them clearly with bullet points.
            Currently, you can answer general questions. Scheme-specific detailed knowledge will be added soon.`
          },
          ...messages
        ],
        stream: true, // Enable streaming
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    // Create a TransformStream to process the Ollama response format
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = new TextDecoder().decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (!line.trim()) continue;
              try {
                const json = JSON.parse(line);
                if (json.message?.content) {
                  controller.enqueue(new TextEncoder().encode(json.message.content));
                }
                if (json.done) {
                  // End of stream
                }
              } catch (e) {
                console.error('Error parsing JSON chunk', e);
              }
            }
          }
        } catch (error) {
          console.error('Stream processing error:', error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });

  } catch (error: any) {
    console.error('AI Service Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
