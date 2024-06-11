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
			setChatHistory([...chatHistory, {sender: "You", message: userInput}]);
			setUserInput("");

			const response = await fetch("/api/chat", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({message: userInput}),
			});

			const data = await response.json();
			setChatHistory([
				...chatHistory,
				{sender: "You", message: userInput},
				{sender: "GPT-4", message: data.response},
			]);
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
