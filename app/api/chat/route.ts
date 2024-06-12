import {NextResponse} from "next/server";
import fs from "fs";
import path from "path";

const contextFilePath = path.join(process.cwd(), "public/context.md");
const context = fs.readFileSync(contextFilePath, "utf-8");

const contextKeywords = [
	{
		id: 6,
		name: "Great Ice Age has occurred",
		keywords: ["Great Ice Age", "Ice Age"],
		completed: false,
	},
	{
		id: 7,
		name: "Discovered memristor technology",
		keywords: ["memristor", "memristors"],
		completed: false,
	},
	{
		id: 8,
		name: "Knowledge of religion",
		keywords: ["Shintoism", "Buddhism"],
		completed: false,
	},
	{
		id: 9,
		name: "Discovered ultimate goal",
		keywords: ["computer", "ultimate"],
		completed: false,
	},
];

export async function POST(request: Request) {
	const {message, history} = await request.json();
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
	const goalsUrl = new URL("/api/goals", baseUrl).toString();

	let goalsContext = "";
	try {
		const goalsResponse = await fetch(goalsUrl, {method: "GET"});
		if (goalsResponse.ok) {
			const goalsData = await goalsResponse.json();
			const currentGoals = goalsData.goals.filter(
				(goal: any) => !goal.completed
			);
			goalsContext =
				currentGoals.length > 0
					? `Current goals: ${currentGoals
							.map((goal: any) => goal.name)
							.join(", ")}.`
					: "All goals have been completed!";
		} else {
			goalsContext = "Unable to fetch current goals at this time.";
		}
	} catch (error) {
		console.error("Error fetching goals:", error);
		goalsContext = "Unable to fetch current goals at this time.";
	}

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
					messages: [
						{
							role: "system",
							content:
								"You are a narrator in an Illustrated Primer for a young child (around 10 years old), set in a futuristic ice age world. Your role is to answer questions from the child and teach them about the world they are growing up in. Reveal information gradually and with narrative, use simple and concise language. Use the writing style of the following excerpt and Ted Chiang/Ken Liu. Keep answers to 1-2 sentences. The user may ask about their next goals and their status:" +
								goalsContext +
								context,
						},
						...history.map((msg: any) => ({
							role: msg.sender === "You" ? "user" : "assistant",
							content: msg.message,
						})),
						{role: "user", content: message},
					],
					temperature: 0.7,
				}),
			}
		);
		if (!openAIResponse.ok) {
			throw new Error(`OpenAI API error: ${openAIResponse.statusText}`);
		}

		const responseData = await openAIResponse.json();
		const chatResponse = responseData.choices[0].message.content;
		const mentionedKeywords = contextKeywords.filter(({keywords}) =>
			keywords.some((keyword) =>
				chatResponse.toLowerCase().includes(keyword.toLowerCase())
			)
		);
		const goalUpdates = mentionedKeywords.map(({id}) => ({
			goalId: id,
			completed: true,
		}));

		if (goalUpdates.length > 0) {
			await Promise.all(
				goalUpdates.map(({goalId, completed}) =>
					fetch(goalsUrl, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({goalId, completed}),
					})
				)
			);
		}

		// fetch updated goal
		const updatedGoalsResponse = await fetch(goalsUrl, {
			method: "GET",
		});

		if (updatedGoalsResponse.ok) {
			const updatedGoalsData = await updatedGoalsResponse.json();
			return NextResponse.json({
				response: chatResponse,
				goals: updatedGoalsData.goals,
			});
		}

		return NextResponse.json({response: chatResponse});
	} catch (error: any) {
		console.error("Error in API route:", error);
		return NextResponse.json({error: error.message}, {status: 500});
	}
}
