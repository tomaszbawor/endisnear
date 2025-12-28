import { BrowserKeyValueStore } from "@effect/platform-browser";
import { Atom } from "@effect-atom/atom-react";

export const atomRuntime = Atom.runtime(BrowserKeyValueStore.layerLocalStorage);
