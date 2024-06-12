import Link from "next/link";

export default function Home() {
	return (
		<div className="home-container">
			<h1>The Illustrated Primer</h1>
			<p>Can you discover this world and its patterns?</p>
			<Link href="/puzzle1">start</Link>
		</div>
	);
}
