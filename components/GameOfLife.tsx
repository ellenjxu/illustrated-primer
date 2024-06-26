"use client";
import React, {useState, useCallback, useRef, useEffect} from "react";
import styles from "./GameOfLife.module.css";

const numRows = 30;
const numCols = 50;

const operations = [
	[0, 1],
	[0, -1],
	[1, -1],
	[-1, 1],
	[1, 1],
	[-1, -1],
	[1, 0],
	[-1, 0],
];

const generateEmptyGrid = () => {
	return Array.from({length: numRows}).map(() => Array(numCols).fill(0));
};

const checkPatternInGrid = (grid: number[][], pattern: number[][]) => {
	if (!pattern || pattern.length === 0 || pattern[0].length === 0) {
		console.error("Pattern is not defined or is empty");
		return false;
	}

	const patternRows = pattern.length;
	const patternCols = pattern[0].length;

	for (let i = 0; i <= grid.length - patternRows; i++) {
		for (let j = 0; j <= grid[0].length - patternCols; j++) {
			let match = true;
			for (let x = 0; x < patternRows; x++) {
				for (let y = 0; y < patternCols; y++) {
					if (grid[i + x][j + y] !== pattern[x][y]) {
						match = false;
						break;
					}
				}
				if (!match) break;
			}
			if (match) return true;
		}
	}
	return false;
};

const GameOfLife = () => {
	const [grid, setGrid] = useState(generateEmptyGrid);
	const [running, setRunning] = useState(false);
	const [goalStatus, setGoalStatus] = useState<any[]>([]);
	const runningRef = useRef(running);
	runningRef.current = running;

	const fetchGoals = async () => {
		const response = await fetch("/api/goals");
		const data = await response.json();
		setGoalStatus(data.goals);
	};

	const updateGoalStatus = async (goalId: number, completed: boolean) => {
		await fetch("/api/goals", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({goalId, completed}),
		});
		fetchGoals();
	};

	const runSimulation = useCallback(() => {
		if (!runningRef.current) {
			return;
		}

		setGrid((g) => {
			return g.map((row, i) =>
				row.map((cell, j) => {
					let neighbors = 0;
					operations.forEach(([x, y]) => {
						const newI = i + x;
						const newJ = j + y;
						if (newI >= 0 && newI < numRows && newJ >= 0 && newJ < numCols) {
							neighbors += g[newI][newJ];
						}
					});

					if (neighbors < 2 || neighbors > 3) {
						return 0;
					} else if (cell === 0 && neighbors === 3) {
						return 1;
					} else {
						return cell;
					}
				})
			);
		});

		setTimeout(runSimulation, 100);
	}, []);

	const handleClick = (i: number, j: number) => {
		const newGrid = grid.map((row, rowIndex) =>
			row.map((col, colIndex) => {
				if (rowIndex === i && colIndex === j) {
					return grid[i][j] ? 0 : 1;
				}
				return col;
			})
		);
		setGrid(newGrid);
	};

	const checkGoals = () => {
		const patterns = [
			{
				id: 1,
				name: "Create a glider",
				pattern: [
					[0, 1, 0],
					[0, 0, 1],
					[1, 1, 1],
				],
			},
			{
				id: 2,
				name: "Create a glider gun",
				pattern: [
					[
						0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
						0, 0, 1, 0, 0, 0, 0, 0, 0, 0,
					],
					[
						0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
						0, 1, 0, 1, 0, 0, 0, 0, 0, 0,
					],
					[
						0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0,
						0, 0, 0, 0, 0, 0, 0, 1, 1, 0,
					],
					[
						0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0,
						1, 1, 0, 0, 0, 0, 0, 1, 1, 0,
					],
					[
						1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1,
						0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
					],
					[
						1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1,
						0, 0, 0, 1, 0, 1, 1, 0, 0, 0,
					],
					[
						0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0,
						0, 0, 0, 0, 1, 0, 0, 0, 0, 0,
					],
					[
						0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1,
						0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					],
					[
						0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1,
						0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					],
				],
			},
			{
				id: 3,
				name: "Create an eater",
				pattern: [
					[1, 1, 0, 0],
					[1, 0, 1, 0],
					[0, 0, 1, 0],
					[0, 0, 1, 1],
				],
			},
			// {
			// 	id: 4,
			// 	name: "Create a NOT gate",
			// 	pattern: [
			// 		/* NOT gate pattern array */
			// 	],
			// },
			// {
			// 	id: 5,
			// 	name: "Create an AND gate",
			// 	pattern: [
			// 		/* AND gate pattern array */
			// 	],
			// },
		];

		patterns.forEach(({id, pattern}) => {
			if (checkPatternInGrid(grid, pattern)) {
				updateGoalStatus(id, true);
			}
		});
	};

	useEffect(() => {
		fetchGoals();
	}, []);

	useEffect(() => {
		if (running) {
			checkGoals();
		}
	}, [grid]);

	const completedGoalsCount = goalStatus.filter(
		(goal) => goal.completed
	).length;

	return (
		<div className={styles.container}>
			<div className={styles.grid}>
				{grid.map((row, i) =>
					row.map((col, j) => (
						<div
							key={`${i}-${j}`}
							onClick={() => handleClick(i, j)}
							className={styles.cell}
							style={{
								backgroundColor: grid[i][j] ? "black" : undefined,
							}}
						/>
					))
				)}
			</div>
			<div className={styles.controls}>
				<button
					onClick={() => {
						setRunning(!running);
						if (!running) {
							runningRef.current = true;
							runSimulation();
						}
					}}
				>
					{running ? "Stop" : "Start"}
				</button>
				<button onClick={() => setGrid(generateEmptyGrid())} disabled={running}>
					Clear
				</button>
				<button
					onClick={() => {
						const rows = [];
						for (let i = 0; i < numRows; i++) {
							rows.push(
								Array.from(Array(numCols), () => (Math.random() > 0.7 ? 1 : 0))
							);
						}
						setGrid(rows);
					}}
					disabled={running}
				>
					Random
				</button>
			</div>
			<div className={styles.statusBar}>
				<p>Number of Goals Completed: {completedGoalsCount}</p>
				<ul>
					{goalStatus
						.filter((goal) => goal.completed)
						.map((goal) => (
							<li key={goal.id} className={styles.completed}>
								{goal.name} ✔
							</li>
						))}
				</ul>
			</div>
		</div>
	);
};

export default GameOfLife;
