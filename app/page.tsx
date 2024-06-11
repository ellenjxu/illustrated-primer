// app/page.tsx
import Link from "next/link";

export default function Home() {
	return (
		<div className="container">
			<h1>The Illustrated Primer</h1>
			<Link href="/puzzle1">start</Link>
		</div>
	);
}
