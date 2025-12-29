import { Atom, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { Plus, Save } from "lucide-react";
import { useNavigate } from "react-router";
import GameContainer from "@/components/custom/GameContainer";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSavesValues } from "@/state/gameSaves";

// Local atom for selected save slot
const selectedSlotAtom = Atom.make<number | null>(null);

export default function NewGamePage() {
	const navigate = useNavigate();
	const selectedSlot = useAtomValue(selectedSlotAtom);
	const setSelectedSlot = useAtomSet(selectedSlotAtom);

	const gameSaves = useSavesValues();

	const handleSlotSelect = (slotId: number) => {
		console.log(`Slot selected ${slotId}`);
		setSelectedSlot(slotId);
	};

	const handleContinue = () => {
		if (selectedSlot !== null) {
			// TODO: Navigate to character creation or game with selected slot
			console.log(`Starting game with slot ${selectedSlot}`);
		}
	};

	const handleBack = () => {
		navigate("/");
	};

	return (
		<GameContainer>
			<main className="relative flex flex-col items-center justify-center px-6 py-14">
				<div className="w-full max-w-3xl">
					{/* Header */}
					<div className="mb-8 text-center">
						<div className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-3">
							<Save className="h-4 w-4" />
							<span>Select a save slot</span>
						</div>
						<h1 className="text-4xl font-semibold tracking-tight">New Game</h1>
						<p className="mt-2 text-base text-muted-foreground">
							Choose a slot to begin your journey
						</p>
					</div>

					{/* Save Slots */}
					<div className="grid gap-4 md:grid-cols-2 mb-8">
						{gameSaves.map((slot, idx) => (
							<Card
								// biome-ignore lint/suspicious/noArrayIndexKey: This is tuple
								key={idx}
								className={`cursor-pointer transition-all hover:border-foreground/50 ${
									selectedSlot === idx
										? "border-amber-300 ring-2 ring-foreground/20"
										: ""
								}`}
								onClick={() => handleSlotSelect(idx)}
							>
								<CardHeader>
									<CardTitle className="flex items-center justify-between text-base">
										<span>Slot {String(idx + 1).padStart(2, "0")}</span>
										{slot == null ? (
											<div className="flex items-center gap-1.5 text-sm text-muted-foreground font-normal">
												<Plus className="h-3.5 w-3.5" />
												<span>Empty</span>
											</div>
										) : (
											<Save className="h-4 w-4 text-muted-foreground" />
										)}
									</CardTitle>
									<CardDescription>
										{slot == null ? "Start a new adventure" : slot.timePlayed}
									</CardDescription>
								</CardHeader>
								{!(slot == null) && (
									<CardContent>
										<div className="rounded-lg border p-3">
											<div className="space-y-1 text-sm">
												<div className="flex items-center justify-between">
													<span className="text-muted-foreground">
														Character
													</span>
													<span className="font-medium">{slot.playerName}</span>
												</div>
												<Separator className="my-2" />
												<div className="flex items-center justify-between">
													<span className="text-muted-foreground">
														Location
													</span>
													<span className="text-foreground">
														{slot.location}
													</span>
												</div>
												<div className="flex items-center justify-between">
													<span className="text-muted-foreground">
														Time played
													</span>
													<span className="text-foreground">
														{slot.timePlayed}
													</span>
												</div>
											</div>
										</div>
									</CardContent>
								)}
							</Card>
						))}
					</div>

					{/* Warning */}
					{/*
          <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <div className="flex items-start gap-3">
              <Skull className="h-5 w-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">
                  Warning: Permadeath Active
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  You have one life, use it wisely. Death is permanent and your
                  save will be deleted.
                </p>
              </div>
            </div>
          </div>
          */}

					{/* Action Buttons */}
					<div className="flex justify-between gap-3">
						<Button variant="outline" size="lg" onClick={handleBack}>
							Back to Menu
						</Button>
						<Button
							size="lg"
							disabled={selectedSlot === null}
							onClick={handleContinue}
						>
							Continue
						</Button>
					</div>
				</div>
			</main>
		</GameContainer>
	);
}
