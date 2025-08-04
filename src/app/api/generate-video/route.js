import { GoogleGenAI } from "@google/genai";

export async function POST(request) {
  try {
    const { prompt } = await request.json();
    
    const ai = new GoogleGenAI({
        apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
    });

    let operation = await ai.models.generateVideos({
      model: "veo-3.0-generate-preview",
      prompt: prompt || "A whimsical stop-motion animation of a tiny robot tending to a garden of glowing mushrooms on a miniature planet.",
    });

    // Poll the operation status until the video is ready
    while (!operation.done) {
      console.log("Waiting for video generation to complete...")
      await new Promise((resolve) => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({
        operation: operation,
      });
    }

    // Download the generated video
    // const downloadResult = await ai.files.download({
    //   file: operation.response.generatedVideos[0].video,
    //   downloadPath: "style_example.mp4",
    // });

    return Response.json({ 
      message: 'Video generated successfully',
      videoPath: 'style_example.mp4',
      operation: operation.response
    });

  } catch (error) {
    console.error('Error generating video:', error);
    return Response.json(
      { message: 'Error generating video', error: error.message },
      { status: 500 }
    );
  }
}