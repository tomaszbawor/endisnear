import { createRoot } from "react-dom/client";
import "./styles/globals.css";
import { RouterProvider } from "react-router";
import { appRouter } from "./router";

const root = document.getElementById("root");

if (!root) {
	throw new Error("Root container not found");
}

createRoot(root).render(<RouterProvider router={appRouter} />);
