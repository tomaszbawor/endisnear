import { createBrowserRouter } from "react-router";

import BattleTestPage from "./pages/BattleTestPage";
import CharacterPage from "./pages/CharacterPage";
import GameLoopPage from "./pages/GameLoop";
import HeroCreationPage from "./pages/HeroCreation";
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
		path: "/heroCreation",
		element: <HeroCreationPage />,
	},
	{
		path: "/gameLoop",
		element: <GameLoopPage />,
	},
	{
		path: "/characterPage",
		element: <CharacterPage />,
	},
	{
		path: "/test",
		element: <BattleTestPage />,
	},
]);
