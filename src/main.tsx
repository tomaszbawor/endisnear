import { createRoot } from "react-dom/client";
import MainMenu from "./components/pages/MainMenu";
import "./styles/globals.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import CharacterPage from "./components/features/CharacterPage";
import NewGamePage from "./components/pages/NewGame";

const root = document.getElementById("root");

const router = createBrowserRouter([
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
]);

if (!root) {
	throw new Error("Root container not found");
}

createRoot(root).render(<RouterProvider router={router} />);
