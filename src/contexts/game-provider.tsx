import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Game } from "../game/classes";

export type GameResult = {
  outcome: "win" | "lose";
  roundsSurvived: number;
  finalMoney: number;
  finalHeat: number;
};

type GameContextValue = {
  game: Game;
  lastResult: GameResult | null;
  setLastResult: (result: GameResult | null) => void;
};

type GameProviderProps = {
  children: ReactNode;
};

export const GameContext = createContext<GameContextValue>({
  game: new Game(),
  lastResult: null,
  setLastResult: () => {},
});

export function GameProvider({ children }: GameProviderProps) {
  const [, setTick] = useState(0);
  const [lastResult, setLastResult] = useState<GameResult | null>(null);

  const game = useMemo(() => {
    const onChange = () => setTick((t) => t + 1);
    return new Game(undefined, undefined, onChange);
  }, []);

  return (
    <GameContext.Provider
      value={{
        game,
        lastResult,
        setLastResult,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
