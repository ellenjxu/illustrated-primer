"use client";
import {useState, useEffect} from "react";
import GameOfLife from "../../components/GameOfLife";
import styles from "./Puzzle1.module.css";

export default function Puzzle1() {
	const [userInput, setUserInput] = useState("");
	const [chatHistory, setChatHistory] = useState<
		{sender: string; message: string}[]
	>([]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setUserInput(e.target.value);
	};

	const sendMessage = async () => {
		if (userInput.trim()) {
			const newUserMessage = {sender: "You", message: userInput};
			const updatedHistory = [...chatHistory, newUserMessage];

			setChatHistory(updatedHistory);
			setUserInput("");

			try {
				const response = await fetch("/api/chat", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({message: userInput, history: updatedHistory}),
				});

				if (!response.ok) {
					throw new Error("Network response was not ok");
				}

				const data = await response.json();
				const gptResponse = {sender: "Primer", message: data.response};

				setChatHistory([...updatedHistory, gptResponse]);
			} catch (error) {
				console.error("Error:", error);
				const errorMessage = {
					sender: "Primer",
					message: "Error communicating with GPT-4 agent.",
				};
				setChatHistory([...updatedHistory, errorMessage]);
			}
		}
	};

	useEffect(() => {}, []);

	return (
		<div className={styles.container}>
			<div className={styles.puzzle}>
				<GameOfLife />
			</div>
			<div className={styles.chatbox}>
				<div className={styles.chatOutput}>
					{chatHistory.map((chat, index) => (
						<div
							key={index}
							className={
								chat.sender === "You" ? styles.userMessage : styles.gptMessage
							}
						>
							<strong>{chat.sender}:</strong> {chat.message}
						</div>
					))}
				</div>
				<input
					type="text"
					value={userInput}
					onChange={handleInputChange}
					placeholder="Type your message..."
				/>
				<button onClick={sendMessage}>Send</button>
			</div>
		</div>
	);
}
