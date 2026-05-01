import { Box, Text, useInput } from "ink";
import { useEffect, useRef, useState } from "react";
import { useGame, useScene, type GameResult } from "../contexts";
import { loadConfig } from "../config/loader";

type Mode = "root" | "earn" | "burn";

type RootOption = "SKIP" | "EARN" | "BURN";

type SubOption = "Small" | "Big" | "Back";

export function GameScene() {
  const { setActiveScene } = useScene();
  const { game, setLastResult } = useGame();

  const [mode, setMode] = useState<Mode>("root");
  const [rootSelected, setRootSelected] = useState(0);
  const [subSelected, setSubSelected] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const config = loadConfig();

  const [displayRound, setDisplayRound] = useState(1);
  const [displayActionsLeft, setDisplayActionsLeft] = useState(config.actionsPerRound);
  const [displayMoney, setDisplayMoney] = useState(0);
  const [displayHeat, setDisplayHeat] = useState(0);

  const lastSnapshotRef = useRef({
    round: 1,
    actionsLeft: config.actionsPerRound,
    money: 0,
    heat: 0,
  });

  useEffect(() => {
    game.newGame();
    setLastResult(null);
    setMode("root");
    setRootSelected(0);
    setSubSelected(0);
    setIsTransitioning(false);

    const player = game.getPlayer();
    const snapshot = {
      round: game.getRound(),
      actionsLeft: game.getActionsLeft(),
      money: player.getMoney(),
      heat: player.getHeat(),
    };

    lastSnapshotRef.current = snapshot;
    setDisplayRound(snapshot.round);
    setDisplayActionsLeft(snapshot.actionsLeft);
    setDisplayMoney(snapshot.money);
    setDisplayHeat(snapshot.heat);
  }, [game, setLastResult]);

  const clampHeat = (heat: number) => Math.max(Math.min(heat, 100), 0);

  const animateToSnapshot = (from: typeof lastSnapshotRef.current, to: typeof lastSnapshotRef.current) => {
    setIsTransitioning(true);
    setMode("root");
    setSubSelected(0);

    setDisplayRound(from.round);
    setDisplayActionsLeft(from.actionsLeft);
    setDisplayMoney(from.money);
    setDisplayHeat(from.heat);

    const durationMs = 900;
    const stepMs = 45;
    const steps = Math.max(1, Math.floor(durationMs / stepMs));
    let step = 0;

    const interval = setInterval(() => {
      step += 1;
      const t = Math.min(step / steps, 1);

      const lerpInt = (a: number, b: number) => Math.round(a + (b - a) * t);

      setDisplayRound(lerpInt(from.round, to.round));
      setDisplayActionsLeft(lerpInt(from.actionsLeft, to.actionsLeft));
      setDisplayMoney(lerpInt(from.money, to.money));
      setDisplayHeat(lerpInt(from.heat, to.heat));

      if (t >= 1) {
        clearInterval(interval);
        setIsTransitioning(false);
      }
    }, stepMs);
  };

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

  const maybeStartTurnTransition = () => {
    if (!game.isInSession()) {
      return;
    }

    const player = game.getPlayer();
    const current = {
      round: game.getRound(),
      actionsLeft: game.getActionsLeft(),
      money: player.getMoney(),
      heat: player.getHeat(),
    };

    const prev = lastSnapshotRef.current;

    const isTurnBoundary =
      current.actionsLeft === 2 &&
      current.round === prev.round + 1;

    if (isTurnBoundary) {
      animateToSnapshot(prev, current);
    } else {
      setDisplayRound(current.round);
      setDisplayActionsLeft(current.actionsLeft);
      setDisplayMoney(current.money);
      setDisplayHeat(current.heat);
    }
  };

  const applyRoot = () => {
    const selected = rootOptions[rootSelected];
    if (selected === "SKIP") {
      game.skipTurn();
      maybeStartTurnTransition();
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
      maybeStartTurnTransition();
      checkEnd();
      return;
    }

    if (mode === "burn") {
      if (selected === "Small") {
        game.getPlayer().burnSmall();
      } else {
        game.getPlayer().burnBig();
      }
      maybeStartTurnTransition();
      checkEnd();
      return;
    }
  };

  useInput((_, key) => {
    if (isTransitioning) {
      return;
    }

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

  const currentSnapshot = {
    round: game.getRound(),
    actionsLeft: game.getActionsLeft(),
    money: player.getMoney(),
    heat: player.getHeat(),
  };

  if (!isTransitioning) {
    lastSnapshotRef.current = currentSnapshot;
  }

  const previewFor = (deltaMoney: number, deltaHeat: number) => {
    const nextMoney = Math.max(displayMoney + deltaMoney, 0);
    const nextHeat = clampHeat(displayHeat + deltaHeat);
    return { nextMoney, nextHeat };
  };

  return (
    <Box flexDirection="column" marginY={1}>
      <Text bold color="#ff5922">
        Burning Wallet
      </Text>

      <Box flexDirection="column" marginTop={1}>
        <Text>
          Round: {displayRound} / {config.targetRound}
        </Text>
        <Text>Actions left: {displayActionsLeft}</Text>
        <Text>Money: ${displayMoney}</Text>
        <Text>Heat: {displayHeat}</Text>
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
            {subOptions.map((opt, idx) => {
              if (opt === "Back") {
                return (
                  <Box key={opt} backgroundColor={idx === subSelected ? "#ff5922" : ""}>
                    <Text>+ {opt}</Text>
                  </Box>
                );
              }

              const isSmall = opt === "Small";

              const deltaMoney = mode === "earn"
                ? (isSmall ? config.money.earnSmall : config.money.earnBig)
                : (isSmall ? config.money.burnSmall : config.money.burnBig);
              const deltaHeat = mode === "earn"
                ? (isSmall ? config.heat.earnSmall : config.heat.earnBig)
                : (isSmall ? config.heat.burnSmall : config.heat.burnBig);

              const preview = previewFor(deltaMoney, deltaHeat);

              let staticDeltaMoney = "";
              let staticDeltaHeat = "";

              if (idx === subSelected) {
                staticDeltaMoney = deltaMoney >= 0 ? `+$${deltaMoney}` : `-$${Math.abs(deltaMoney)}`;
                staticDeltaHeat = deltaHeat >= 0 ? `+${deltaHeat} heat` : `-${Math.abs(deltaHeat)} heat`;
              }

              return (
                <Box key={opt} backgroundColor={idx === subSelected ? "#ff5922" : ""}>
                  <Text>
                    + {opt} {staticDeltaMoney && `(${staticDeltaMoney}, ${staticDeltaHeat})`} =&gt; ${preview.nextMoney}, heat {preview.nextHeat}
                  </Text>
                </Box>
              );
            })}
            <Box marginTop={1}>
              <Text color="gray">Left arrow to go back</Text>
            </Box>
          </>
        )}
      </Box>

      {isTransitioning && (
        <Box marginTop={1}>
          <Text color="gray">Ending turn...</Text>
        </Box>
      )}
    </Box>
  );
}
