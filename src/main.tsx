import { TitleScreen, Tutorial, GameScene, GameOver } from './scenes/index.js';
import { GameProvider, SceneProvider } from './contexts/index.js';
import { render } from 'ink';

function App() {
    return (
        <GameProvider>
            <SceneProvider
                scenes={{
                    title: <TitleScreen />,
                    tutorial: <Tutorial />,
                    game: <GameScene />,
                    gameOver: <GameOver />,
                }}
                initialScene='title'
            />
        </GameProvider>
    );
}

render(<App />);