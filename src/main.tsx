import './game/runtime';
import { TitleScreen, Tutorial } from './scenes';
import { SceneProvider } from './contexts';
import { render } from 'ink';

function App() {
    return (
        <SceneProvider
            scenes={{
                title: <TitleScreen />,
                tutorial: <Tutorial />
            }}
            initialScene='title'
        />
    );
}

render(<App />);