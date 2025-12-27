import type { FC } from "react";

import "./styles/globals.css";
import { Button } from "./components/ui/button";

export const IndexPage: FC = () => {
	const onclick = () => {
		console.log("Test");
	};

	return (
		<div>
			<Button onClick={onclick}>Hello</Button>
		</div>
	);
};
