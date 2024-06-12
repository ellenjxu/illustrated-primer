// app/puzzle1/page.tsx
"use client";
import {useState} from "react";

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
					body: JSON.stringify({
						message: userInput,
						history: updatedHistory.map((msg) => ({
							role: msg.sender === "You" ? "user" : "assistant",
							content: msg.message,
						})),
					}),
				});

				if (!response.ok) {
					throw new Error("Network response was not ok");
				}

				const data = await response.json();
				const gptResponse = {sender: "GPT-4", message: data.response};

				setChatHistory([...updatedHistory, gptResponse]);
			} catch (error) {
				console.error("Error:", error);
				const errorMessage = {
					sender: "GPT-4",
					message: "Error communicating with GPT-4 agent.",
				};
				setChatHistory([...updatedHistory, errorMessage]);
			}
		}
	};

	return (
		<div className="container">
			<div className="puzzle">
				<h1>Puzzle 1</h1>
				<p>Solve the puzzle: What is 2 + 2?</p>
				<a href="/">Back to Home</a>
			</div>
			<div className="chatbox">
				<div className="chatOutput">
					{chatHistory.map((chat, index) => (
						<div
							key={index}
							className={chat.sender === "You" ? "userMessage" : "gptMessage"}
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
