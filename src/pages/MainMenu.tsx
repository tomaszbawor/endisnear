import { useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import {
	Info,
	Monitor,
	Play,
	Settings as SettingsIcon,
	Skull,
	Volume2,
} from "lucide-react";
import * as React from "react";
import { useNavigate } from "react-router";
import CenteredPageContainer from "@/components/custom/CenteredPageContainer";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { gameConfigAtom } from "@/state/gameConfig";
import { hasSaveAtom } from "@/state/gameSaves";

type MenuAction =
	| { type: "start" }
	| { type: "continue" }
	| { type: "open_settings" }
	| { type: "open_about" };

export default function EndIsNearMainMenu() {
	// Use computed atom to check if any save exists
	const hasSave = useAtomValue(hasSaveAtom);

	//TODO: Move settings dialog to component
	const gameSettings = useAtomValue(gameConfigAtom);
	const setGameSettings = useAtomSet(gameConfigAtom);

	const setMasterVolume = (vol: [number]) => {
		setGameSettings({
			...gameSettings,
			volume: vol[0],
		});
	};

	const setIsFullScreen = (isFullscreen: boolean) => {
		setGameSettings({
			...gameSettings,
			isFullscreen: isFullscreen,
		});
	};

	const resetSettings = () => {
		setGameSettings({
			volume: 50,
			isFullscreen: false,
		});
	};

	//TODO: Remove this dispatch mechanism
	const dispatch = React.useCallback((action: MenuAction) => {
		console.log("MENU_ACTION", action);
	}, []);

	const navigate = useNavigate();
	const newGameClicked = () => {
		navigate("/newGame");
	};

	return (
		<CenteredPageContainer>
			<main className="relative flex items-center justify-center px-6 py-14">
				<div>
					{/* Title / Flavor */}
					<section className="flex flex-col justify-center">
						<div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
							<Skull className="h-4 w-4" />
							<span>Idle infinite battle game</span>
							<Separator orientation="vertical" className="mx-1 h-4" />
							<span>Build 0.0.1</span>
						</div>

						<h1 className="mt-4 text-5xl font-semibold tracking-tight md:text-6xl">
							End <span className="text-muted-foreground">Is</span> Near
						</h1>
						<p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
							You have one life, use it.
						</p>

						<div className="mt-8 flex flex-col flex-wrap gap-3">
							<Button size="lg" className="gap-2" onClick={newGameClicked}>
								<Play className="h-4 w-4" />
								New Game
							</Button>

							<Button
								size="lg"
								variant="secondary"
								className="gap-2"
								disabled={!hasSave}
								onClick={() => dispatch({ type: "continue" })}
							>
								Continue
							</Button>

							<Dialog>
								<DialogTrigger asChild>
									<Button
										size="lg"
										variant="outline"
										className="gap-2"
										onClick={() => dispatch({ type: "open_settings" })}
									>
										<SettingsIcon className="h-4 w-4" />
										Settings
									</Button>
								</DialogTrigger>
								<DialogContent className="sm:max-w-lg">
									<DialogHeader>
										<DialogTitle>Settings</DialogTitle>
										<DialogDescription>
											Adjust the experience. Wire these values to your game
											store.
										</DialogDescription>
									</DialogHeader>

									<div className="mt-2 space-y-6">
										{/* Audio */}
										<div className="space-y-3">
											<div className="flex items-center gap-2">
												<Volume2 className="h-4 w-4 text-muted-foreground" />
												<h3 className="text-sm font-medium">Audio</h3>
											</div>
											<div className="space-y-2">
												<div className="flex items-center justify-between">
													<Label
														htmlFor="master-volume"
														className="text-sm text-muted-foreground"
													>
														Master volume
													</Label>
													<span className="text-sm tabular-nums text-muted-foreground">
														{gameSettings.volume}%
													</span>
												</div>
												<Slider
													id="master-volume"
													value={[gameSettings.volume]}
													onValueChange={setMasterVolume}
													min={0}
													max={100}
													step={1}
												/>
											</div>
										</div>

										<Separator />

										{/* Display */}
										<div className="space-y-3">
											<div className="flex items-center gap-2">
												<Monitor className="h-4 w-4 text-muted-foreground" />
												<h3 className="text-sm font-medium">Display</h3>
											</div>
											<div className="flex items-center justify-between rounded-lg border p-3">
												<div className="space-y-1">
													<p className="text-sm font-medium">Fullscreen</p>
													<p className="text-sm text-muted-foreground">
														Toggle immersive mode.
													</p>
												</div>
												<Switch
													checked={gameSettings.isFullscreen}
													onCheckedChange={setIsFullScreen}
												/>
											</div>
										</div>

										<Separator />

										{/* Gameplay */}

										<div className="flex justify-end gap-2">
											<Button variant="secondary" onClick={resetSettings}>
												Reset
											</Button>
										</div>
									</div>
								</DialogContent>
							</Dialog>

							<Dialog>
								<DialogTrigger asChild>
									<Button
										size="lg"
										variant="ghost"
										className="gap-2"
										onClick={() => dispatch({ type: "open_about" })}
									>
										<Info className="h-4 w-4" />
										About
									</Button>
								</DialogTrigger>
								<DialogContent className="sm:max-w-lg">
									<DialogHeader>
										<DialogTitle>About</DialogTitle>
										<DialogDescription>
											End Is Near — a bleak survival experience.
										</DialogDescription>
									</DialogHeader>
									<div className="space-y-4 text-sm text-muted-foreground">
										<p>Some information about the game</p>
										<p className="text-xs">
											© {new Date().getFullYear()} JacksaiCodes. All rights
											reserved.
										</p>
									</div>
								</DialogContent>
							</Dialog>
						</div>
					</section>
				</div>
			</main>
		</CenteredPageContainer>
	);
}
