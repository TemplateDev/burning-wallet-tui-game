import { useScene } from "../contexts/index.js";
import { Instructions } from "../components/index.js";

export function Tutorial() {
    const { setActiveScene } = useScene();
    return <Instructions onFinished={() => setActiveScene("game")} />;
}