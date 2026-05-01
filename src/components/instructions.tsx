import { Text, Box, useInput } from 'ink';
import { useState, useEffect } from 'react';

const instructions = [
    [
        "The game is simple. You have a wallet with a certain amount of money.",
        "The goal is to survive 20 rounds without going bankrupt."
    ],
    [
        "However, just surviving isn't enough.",
        "Your wallet is burning money every round and it only gets faster.",
        "The only way to slow the burn is to burn your money."
    ],
    [
        "Not all hope is lost.",
        "You have three options each round:",
        "- SKIP",
        "- EARN",
        "- BURN",
        "You can make two actions per round."
    ],
    [
        "SKIP will cancel all actions for the round and reduces heat based on current level.",
        "EARN will give you money but also increase the burn rate.",
        "BURN will reduce the burn rate but cost you money."
    ],
    [
        "The game ends when you run out of money or reach round 20."
    ]
]

export function Instructions({ onFinished }: { onFinished?: () => void }) {
    const [currentInstruction, setCurrentInstruction] = useState(0);
    const [revealedLines, setRevealedLines] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    
    useEffect(() => {
        const currentLines = instructions[currentInstruction];
        if (!currentLines) {
            setIsAnimating(false);
            return;
        }

        setIsAnimating(true);
        setRevealedLines(0);

        const interval = setInterval(() => {
            setRevealedLines((prev) => {
                const next = prev + 1;
                if (next >= currentLines.length) {
                    clearInterval(interval);
                    setTimeout(() => {
                        setIsAnimating(false);
                    }, 2000);
                    return currentLines.length;
                }
                return next;
            });
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, [currentInstruction])    

    useInput((_, key) => {
        if (key.return && !isAnimating) {
            if (currentInstruction >= instructions.length - 1) {
                onFinished?.();
                return;
            }
            setCurrentInstruction(currentInstruction + 1);
        }
    });

    return (
        <Box flexDirection='column' marginY={3}>
            <Box marginBottom={1}>
            <Text bold color='#ff5922'>Instructions</Text>
            </Box>
            {instructions[currentInstruction]?.slice(0, revealedLines).map((line, index) => (
                <Text key={index}>{line}</Text>
            ))}
            <Box marginTop={1}>
                {!isAnimating && <Text color='gray'>Press enter to continue...</Text>}
            </Box>
        </Box>
    );
}