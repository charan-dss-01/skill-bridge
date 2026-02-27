import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function POST(req) {
    try {
        const { industry, role, skills } = await req.json();

        const prompt = `
      You are an expert AI interviewer. 
      Create exactly 5 interview questions for a candidate applying for a ${role || "professional"} role in the ${industry} industry.
      ${skills?.length ? `The candidate has expertise in: ${skills.join(", ")}.` : ""}

      Make the questions conversational, natural to be spoken aloud by a text-to-speech engine, and increasingly challenging.
      Include a mix of behavioral and technical questions.

      Return STRICT JSON format ONLY:
      {
        "questions": [
          "string",
          "string",
          "string",
          "string",
          "string"
        ]
      }
    `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
        const match = cleanedText.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("Invalid response format from Gemini");

        const data = JSON.parse(match[0]);

        // Ensure we send exactly 5 questions
        if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
            throw new Error("Questions not generated properly");
        }

        return Response.json({ questions: data.questions.slice(0, 5) });
    } catch (error) {
        console.error("Live Interview Question Generation Error:", error);
        return Response.json(
            { error: "Failed to generate interview questions" },
            { status: 500 }
        );
    }
}
