import { TitleScreen, Tutorial, GameScene, GameOver } from './scenes';
import { GameProvider, SceneProvider } from './contexts';
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