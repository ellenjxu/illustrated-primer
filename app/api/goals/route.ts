import {NextResponse} from "next/server";

const initialGoals = [
	{id: 1, name: "Create a glider", completed: false},
	{id: 2, name: "Create a glider gun", completed: false},
	{id: 3, name: "Create an eater", completed: false},
	{id: 4, name: "Create a NOT gate", completed: false},
	{id: 5, name: "Create an AND gate", completed: false},
];

let currentGoals = initialGoals;

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
