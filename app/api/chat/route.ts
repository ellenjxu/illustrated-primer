// app/api/chat/route.ts
import {NextResponse} from "next/server";
import fs from "fs";
import path from "path";

const contextFilePath = path.join(process.cwd(), "public/context.md");
const context = fs.readFileSync(contextFilePath, "utf-8");

export async function POST(request: Request) {
	const {message, history} = await request.json();

	// const test = `Responding to: ${message}`;
	// return NextResponse.json({response: test});
	try {
		const openAIResponse = await fetch(
			"https://api.openai.com/v1/chat/completions",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
				},
				body: JSON.stringify({
					model: "gpt-4",
					messages: [...history, {role: "user", content: message}],
					temperature: 0.7,
				}),
			}
		);

		if (!openAIResponse.ok) {
			throw new Error(`OpenAI API error: ${openAIResponse.statusText}`);
		}

		const responseData = await openAIResponse.json();
		const chatResponse = responseData.choices[0].message.content;

		return NextResponse.json({response: chatResponse});
	} catch (error: any) {
		console.error("Error in API route:", error);
		return NextResponse.json({error: error.message}, {status: 500});
	}
}
