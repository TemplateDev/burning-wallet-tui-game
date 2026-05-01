import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const CONFIG_PATH = join(__dirname, "..", "..", "config", "game.json");

export interface GameConfig {
  initialMoney: number;
  initialHeat: number;
  actionsPerRound: number;
  targetRound: number;
  heat: {
    earnSmall: number;
    earnBig: number;
    burnSmall: number;
    burnBig: number;
  };
  heatIncreasePerRound: number;
  money: {
    earnSmall: number;
    earnBig: number;
    burnSmall: number;
    burnBig: number;
  };
  penalty: Array<{ threshold: number; loss: number }>;
  skipTiers: Array<{ threshold: number; reduction: number }>;
}

let cachedConfig: GameConfig | null = null;

export function loadConfig(): GameConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const raw = readFileSync(CONFIG_PATH, "utf-8");
  const parsed = JSON.parse(raw) as GameConfig;

  cachedConfig = parsed;
  return parsed;
}
