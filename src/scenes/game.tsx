import { Box, Text, useInput } from "ink";
import { useEffect, useState } from "react";
import { useGame, useScene, type GameResult } from "../contexts";

type Mode = "root" | "earn" | "burn";

type RootOption = "SKIP" | "EARN" | "BURN";

type SubOption = "Small" | "Big" | "Back";

export function GameScene() {
  const { setActiveScene } = useScene();
  const { game, setLastResult } = useGame();

  const [mode, setMode] = useState<Mode>("root");
  const [rootSelected, setRootSelected] = useState(0);
  const [subSelected, setSubSelected] = useState(0);

  useEffect(() => {
    game.newGame();
    setLastResult(null);
    setMode("root");
    setRootSelected(0);
    setSubSelected(0);
  }, [game, setLastResult]);

  const rootOptions: RootOption[] = ["SKIP", "EARN", "BURN"];
  const subOptions: SubOption[] = ["Small", "Big", "Back"];

  const clampIndex = (next: number, max: number) => Math.min(Math.max(next, 0), max);

  const goGameOver = (outcome: GameResult["outcome"]) => {
    const player = game.getPlayer();
    const result: GameResult = {
      outcome,
      roundsSurvived: game.getRound(),
      finalMoney: player.getMoney(),
      finalHeat: player.getHeat(),
    };
    setLastResult(result);
    setActiveScene("gameOver");
  };

  const checkEnd = () => {
    if (game.isInSession()) {
      return;
    }

    if (game.getRound() === 20) {
      goGameOver("win");
      return;
    }

    goGameOver("lose");
  };

  const applyRoot = () => {
    const selected = rootOptions[rootSelected];
    if (selected === "SKIP") {
      game.getPlayer().skip();
      checkEnd();
      return;
    }

    if (selected === "EARN") {
      setMode("earn");
      setSubSelected(0);
      return;
    }

    if (selected === "BURN") {
      setMode("burn");
      setSubSelected(0);
      return;
    }
  };

  const applySub = () => {
    const selected = subOptions[subSelected];
    if (selected === "Back") {
      setMode("root");
      setSubSelected(0);
      return;
    }

    if (mode === "earn") {
      if (selected === "Small") {
        game.getPlayer().earnSmall();
      } else {
        game.getPlayer().earnBig();
      }
      checkEnd();
      return;
    }

    if (mode === "burn") {
      if (selected === "Small") {
        game.getPlayer().burnSmall();
      } else {
        game.getPlayer().burnBig();
      }
      checkEnd();
    }
  };

  useInput((_, key) => {
    if (mode === "root") {
      if (key.downArrow) {
        setRootSelected((prev) => clampIndex(prev + 1, rootOptions.length - 1));
      } else if (key.upArrow) {
        setRootSelected((prev) => clampIndex(prev - 1, rootOptions.length - 1));
      } else if (key.return) {
        applyRoot();
      }
      return;
    }

    if (key.leftArrow) {
      setMode("root");
      setSubSelected(0);
      return;
    }

    if (key.downArrow) {
      setSubSelected((prev) => clampIndex(prev + 1, subOptions.length - 1));
    } else if (key.upArrow) {
      setSubSelected((prev) => clampIndex(prev - 1, subOptions.length - 1));
    } else if (key.return || key.rightArrow) {
      applySub();
    }
  });

  const player = game.getPlayer();

  return (
    <Box flexDirection="column" marginY={1}>
      <Text bold color="#ff5922">
        Burning Wallet
      </Text>

      <Box flexDirection="column" marginTop={1}>
        <Text>
          Round: {game.getRound()} / 20
        </Text>
        <Text>Actions left: {game.getActionsLeft()}</Text>
        <Text>Money: ${player.getMoney()}</Text>
        <Text>Heat: {player.getHeat()}</Text>
      </Box>

      <Box flexDirection="column" marginTop={1}>
        {mode === "root" ? (
          <>
            {rootOptions.map((opt, idx) => (
              <Box key={opt} backgroundColor={idx === rootSelected ? "#ff5922" : ""}>
                <Text>+ {opt}</Text>
              </Box>
            ))}
          </>
        ) : (
          <>
            <Text>{mode === "earn" ? "EARN" : "BURN"}</Text>
            {subOptions.map((opt, idx) => (
              <Box key={opt} backgroundColor={idx === subSelected ? "#ff5922" : ""}>
                <Text>+ {opt}</Text>
              </Box>
            ))}
            <Box marginTop={1}>
              <Text color="gray">Left arrow to go back</Text>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
