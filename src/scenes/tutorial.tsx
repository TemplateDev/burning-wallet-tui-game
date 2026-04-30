import { useScene } from "../contexts";
import { Instructions } from "../components";

export function Tutorial() {
    const { setActiveScene } = useScene();
    return <Instructions onFinished={() => setActiveScene("game")} />;
}