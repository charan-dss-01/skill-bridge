import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function test() {
  const prompt = `Generate 2 technical interview questions for a tech-software-development professional.`;

  try {
    const result = await model.generateContent(prompt);
    console.log("Success:", result.response.text());
  } catch (error) {
    console.error("Gemini Error Stack:", error);
  }
}

test();
