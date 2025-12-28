import { createBrowserRouter } from "react-router";

import CharacterPage from "./pages/CharacterPage";
import MainMenu from "./pages/MainMenu";
import NewGamePage from "./pages/NewGame";

export const appRouter = createBrowserRouter([
	{
		path: "/",
		element: <MainMenu />,
	},
	{
		path: "/newGame",
		element: <NewGamePage />,
	},
	{
		path: "/characterPage",
		element: <CharacterPage />,
	},
	{
		path: "/test",
		element: <CharacterPage />,
	},
]);
