import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
});

export async function POST(req) {
  try {
    const { industry, role, skills, company } = await req.json();

    if (!industry) {
      return Response.json(
        { error: "Industry is required" },
        { status: 400 }
      );
    }

    const prompt = `
You are an expert AI interviewer.

Create exactly 5 interview questions for a candidate applying for a ${role || "professional"
      } role in the ${industry} industry.

${company
        ? `The candidate is specifically preparing for interviews at ${company}.
Adapt the tone, difficulty, and focus to match ${company}'s real interview style.
Reflect what ${company} values most in candidates.`
        : ""
      }

${skills?.length
        ? `The candidate has expertise in: ${skills.join(", ")}.`
        : ""
      }

Guidelines:
- Questions must be conversational and natural (good for text-to-speech).
- Make them increasingly challenging.
- Include a mix of:
  - Behavioral questions
  - Technical questions
  - Problem-solving questions
${company
        ? `- If a company is provided, tailor questions to that company's known interview patterns 
      (e.g., leadership principles for Amazon, system design for Google, product thinking for Meta, etc.).`
        : ""
      }

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



    // Clean Gemini formatting (remove ```json blocks)
    const cleanedText = text
      .replace(/```(?:json)?\n?/g, "")
      .replace(/```/g, "")
      .trim();

    // Extract JSON safely
    const match = cleanedText.match(/\{[\s\S]*\}/);

    if (!match) {
      throw new Error("Invalid response format from Gemini");
    }

    const data = JSON.parse(match[0]);

    if (
      !data.questions ||
      !Array.isArray(data.questions) ||
      data.questions.length < 5
    ) {
      throw new Error("Questions not generated properly");
    }

    return Response.json({
      questions: data.questions.slice(0, 5),
    });
  } catch (error) {
    console.error("Live Interview Question Generation Error:", error);

    return Response.json(
      { error: "AI service is busy. Please try again in a minute." },
      { status: 500 }
    );
  }
}