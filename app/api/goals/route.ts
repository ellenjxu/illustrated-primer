import {NextResponse} from "next/server";

const initialGoals = [
	{id: 1, name: "Create a glider", completed: false},
	{id: 2, name: "Create a glider gun", completed: false},
	{id: 3, name: "Create an eater", completed: false},
	{id: 4, name: "Create a NOT gate", completed: false},
	{id: 5, name: "Create an AND gate", completed: false},
];

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
		keywords: ["computer", "ultimate goal", "final goal"],
		completed: false,
	},
];

let currentGoals = [...initialGoals, ...contextKeywords];

export async function GET() {
	return NextResponse.json({goals: currentGoals});
}

export async function POST(request: Request) {
	const {goalId, completed} = await request.json();

	currentGoals = currentGoals.map((goal) =>
		goal.id === goalId ? {...goal, completed} : goal
	);

	return NextResponse.json({goals: currentGoals});
}
