import { Atom, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import type { FC } from "react";

import "./styles/globals.css";
import CharacterPage from "./components/features/CharacterPage";
import { Button } from "./components/ui/button";

const countValueAtom = Atom.make(0);

export const IndexPage: FC = () => {
	const countValue = useAtomValue(countValueAtom);
	const setCountValue = useAtomSet(countValueAtom);

	const onclick = () => {
		setCountValue((num) => num + 1);
	};

	return (
		<div className="container min-h-screen flex flex-col gap-8">
			<div className="border-4 border-primary p-6 bg-card shadow-[8px_8px_0px_0px_rgba(0,255,65,0.3)]">
				<h1 className="text-2xl mb-6 text-primary">End Is Near</h1>
				<div>
					<Button onClick={onclick}>Number: {countValue}</Button>
				</div>
			</div>

			<CharacterPage />
		</div>
	);
};
