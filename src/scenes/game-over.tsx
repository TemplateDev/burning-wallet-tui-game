import { Box, Text, useInput } from "ink";
import { useScene, useGame } from "../contexts";

export function GameOver() {
  const { setActiveScene } = useScene();
  const { lastResult } = useGame();

  useInput((_, key) => {
    if (key.return) {
      setActiveScene("title");
    }
  });

  if (!lastResult) {
    return (
      <Box flexDirection="column" marginY={2}>
        <Text bold color="#ff5922">
          Game Over
        </Text>
        <Text color="gray">No result found. Press enter to return.</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" marginY={2}>
      <Text bold color="#ff5922">
        {lastResult.outcome === "win" ? "You Win" : "You Lose"}
      </Text>

      <Box flexDirection="column" marginTop={1}>
        <Text>Rounds survived: {lastResult.roundsSurvived}</Text>
        <Text>Final money: ${lastResult.finalMoney}</Text>
        <Text>Final heat: {lastResult.finalHeat}</Text>
      </Box>

      <Box marginTop={1}>
        <Text color="gray">Press enter to return to menu...</Text>
      </Box>
    </Box>
  );
}
