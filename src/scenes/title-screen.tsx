import { Menu } from "../components";
import { useScene } from "../contexts";
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