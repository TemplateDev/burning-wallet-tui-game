import { Menu } from "../components/index.js";
import { useScene } from "../contexts/index.js";
import { useApp } from "ink";

export function TitleScreen() {
    const { exit } = useApp();
    const { setActiveScene } = useScene();
    return (
        <Menu
            onPlay={() => setActiveScene("game")}
            onTutorial={() => setActiveScene("tutorial")}
            onExit={exit}
        />
    );
}