import { Text, Box, useInput } from 'ink';
import { useState } from 'react';

export function Menu({
    onPlay,
    onTutorial,
    onExit,
}: {
    onPlay?: () => void;
    onTutorial?: () => void;
    onExit?: () => void;
}) {
    const [selected, setSelected] = useState(0);

    const setSelection = (callback: (prev: number) => number) => {
        setSelected((prev) => Math.min(Math.max(callback(prev), 0), 2));
    };

    const applySelection = () => {
        if (selected === 0) {
            onPlay?.();
        } else if (selected === 1) {
            onTutorial?.();
        } else if (selected === 2) {
            onExit?.();
        }
    };
    
    useInput((_, key) => {
        if (key.downArrow) {
            setSelection((prev) => prev + 1);
        } else if (key.upArrow) {
            setSelection((prev) => prev - 1);
        } else if (key.return) {
            applySelection();
        }
    });

    return (
        <Box flexDirection='column' marginY={2}>
            <Text bold color='#ff5922'>Burning Wallet</Text>
            <Box flexDirection='column'>
                <Box backgroundColor={selected === 0 ? '#ff5922' : ''}>
                    <Text>+ Play</Text>
                </Box>
                <Box backgroundColor={selected === 1 ? '#ff5922' : ''}>
                    <Text>+ Tutorial</Text>
                </Box>
                <Box backgroundColor={selected === 2 ? '#ff5922' : ''}>
                    <Text>+ Exit</Text>
                </Box>
            </Box>
        </Box>
    );
}

export default Menu;