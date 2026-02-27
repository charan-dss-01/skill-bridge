import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function POST(req) {
    try {
        const { industry, role, fullTranscript } = await req.json();

        if (!fullTranscript || fullTranscript.length === 0) {
            return Response.json(
                { error: "Transcript is required" },
                { status: 400 }
            );
        }

        const transcriptText = fullTranscript
            .map(
                (t, i) =>
                    `Q${i + 1}: ${t.question}\nAnswer: ${t.answer}`
            )
            .join("\n\n");

        const prompt = `
      Analyze this complete mock interview transcript for a ${role} position in the ${industry} industry.

      Transcript:
      ${transcriptText}

      Evaluate the candidate's performance across the entire interview.
      Criteria for confidence scoring:
      - Clarity of explanation
      - Directness of answer
      - Structure of the response
      - Appropriate length balance (not too short, not rambling)
      - Minimal filler usage based on the transcribed text

      Return STRICT JSON format ONLY:
      {
        "overallScore": number (0-100),
        "technicalScore": number (0-100),
        "communicationScore": number (0-100),
        "confidenceScore": number (0-100),
        "strengths": ["string", "string"],
        "weaknesses": ["string", "string"],
        "fillerWordAnalysis": {
            "fillerCount": number,
            "repeatedPhrases": ["string"],
            "improvementSuggestion": "string"
        },
        "improvementPlan": "detailed paragraph explaining how they can generally improve"
      }
    `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
        const match = cleanedText.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("Invalid response format from Gemini");

        const analysis = JSON.parse(match[0]);

        return Response.json(analysis);
    } catch (error) {
        console.error("Live Interview Evaluation Error:", error);
        return Response.json(
            { error: "Failed to evaluate interview" },
            { status: 500 }
        );
    }
}
