import { Atom, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import type { FC } from "react";

import "./styles/globals.css";
import { Button } from "./components/ui/button";

const countValueAtom = Atom.make(0);

export const IndexPage: FC = () => {
	const countValue = useAtomValue(countValueAtom);
	const setCountValue = useAtomSet(countValueAtom);

	const onclick = () => {
		setCountValue((num) => num + 1);
	};

	return (
		<div className="container">
			<Button onClick={onclick}>Number: {countValue}</Button>
		</div>
	);
};
