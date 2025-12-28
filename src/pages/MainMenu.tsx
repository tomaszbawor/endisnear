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
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

type MenuAction =
	| { type: "start" }
	| { type: "continue" }
	| { type: "open_settings" }
	| { type: "open_about" };

export default function EndIsNearMainMenu() {
	const [hasSave] = React.useState<boolean>(false);

	// Settings state - Externalize into the local storage
	const [masterVolume, setMasterVolume] = React.useState<number[]>([70]);
	const [fullscreen, setFullscreen] = React.useState<boolean>(true);
	const [difficulty, setDifficulty] = React.useState<string>("normal");

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
				<div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr]">
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

						<div className="mt-8 flex flex-wrap gap-3">
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
														{masterVolume[0]}%
													</span>
												</div>
												<Slider
													id="master-volume"
													value={masterVolume}
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
													checked={fullscreen}
													onCheckedChange={setFullscreen}
												/>
											</div>
										</div>

										<Separator />

										{/* Gameplay */}
										<div className="space-y-3">
											<div className="flex items-center gap-2">
												<Skull className="h-4 w-4 text-muted-foreground" />
												<h3 className="text-sm font-medium">Gameplay</h3>
											</div>
											<div className="space-y-2">
												<Label className="text-sm text-muted-foreground">
													Difficulty
												</Label>
												<Select
													value={difficulty}
													onValueChange={setDifficulty}
												>
													<SelectTrigger>
														<SelectValue placeholder="Select difficulty" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="story">Story</SelectItem>
														<SelectItem value="normal">Normal</SelectItem>
														<SelectItem value="hard">Hard</SelectItem>
														<SelectItem value="nightmare">Nightmare</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>

										<div className="flex justify-end gap-2">
											<Button
												variant="secondary"
												onClick={() => console.log("Settings reset")}
											>
												Reset
											</Button>
											<Button onClick={() => console.log("Settings saved")}>
												Save
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

					{/* Side panel */}
					<aside className="flex items-center">
						<Card className="w-full">
							<CardHeader>
								<CardTitle className="text-base">Session</CardTitle>
								<CardDescription>Quick status and last save.</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="rounded-lg border p-3">
									<div className="flex items-center justify-between">
										<p className="text-sm font-medium">Save slot</p>
										<p className="text-sm text-muted-foreground">
											{hasSave ? "01" : "—"}
										</p>
									</div>
									<Separator className="my-3" />
									<div className="space-y-1 text-sm text-muted-foreground">
										<div className="flex items-center justify-between">
											<span>Location</span>
											<span className="text-foreground">Ash District</span>
										</div>
										<div className="flex items-center justify-between">
											<span>Cycle</span>
											<span className="text-foreground">Nightfall</span>
										</div>
										<div className="flex items-center justify-between">
											<span>Time played</span>
											<span className="text-foreground">02:13:44</span>
										</div>
									</div>
								</div>

								<div className="rounded-lg border p-3">
									<p className="text-sm font-medium">Recommended</p>
									<p className="mt-1 text-sm text-muted-foreground">
										For first run, start on{" "}
										<span className="text-foreground">Normal</span>. You can
										raise difficulty after you learn routes.
									</p>
								</div>
							</CardContent>
						</Card>
					</aside>
				</div>
			</main>
		</CenteredPageContainer>
	);
}
