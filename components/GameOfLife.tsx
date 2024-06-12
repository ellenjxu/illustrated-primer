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
		const glider = [
			[1, 0, 0],
			[0, 1, 1],
			[1, 1, 0],
		];

		const isGliderPresent = grid.some((row, i) =>
			row.some((cell, j) => {
				if (i + 2 < numRows && j + 2 < numCols) {
					return (
						cell === glider[0][0] &&
						grid[i][j + 1] === glider[0][1] &&
						grid[i][j + 2] === glider[0][2] &&
						grid[i + 1][j] === glider[1][0] &&
						grid[i + 1][j + 1] === glider[1][1] &&
						grid[i + 1][j + 2] === glider[1][2] &&
						grid[i + 2][j] === glider[2][0] &&
						grid[i + 2][j + 1] === glider[2][1] &&
						grid[i + 2][j + 2] === glider[2][2]
					);
				}
				return false;
			})
		);

		// TODO: Check for other goals

		if (isGliderPresent) {
			updateGoalStatus(1, true);
		}
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
				{/* <h3>Goals</h3> */}
				<p>Number of Goals Completed: {completedGoalsCount}</p>
				{/* <ul>
					{goalStatus.map((goal) => (
						<li
							key={goal.id}
							className={goal.completed ? styles.completed : ""}
						>
							{goal.name} {goal.completed && "✔"}
						</li>
					))}
				</ul> */}
			</div>
		</div>
	);
};

export default GameOfLife;
