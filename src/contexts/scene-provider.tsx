import { createContext, useContext, useState, type ReactNode } from "react";

export type SceneMap = Record<string, ReactNode>;

type SceneProviderProps = {
  scenes: SceneMap;
  initialScene: string;
  children?: ReactNode;
};

type SceneContextValue = {
  scenes: SceneMap;
  activeScene: string;
  setActiveScene: (sceneName: string) => void;
};

export const SceneContext = createContext<SceneContextValue>({
  scenes: {},
  activeScene: "",
  setActiveScene: () => {},
});

export const SceneProvider = ({
  scenes,
  initialScene,
  children,
}: SceneProviderProps) => {
  const [activeScene, setActiveScene] = useState(initialScene);

  return (
    <SceneContext.Provider
      value={{
        scenes,
        activeScene,
        setActiveScene,
      }}
    >
      {children ?? scenes[activeScene] ?? null}
    </SceneContext.Provider>
  );
};

export const useScene = () => {
  const context = useContext(SceneContext);
  if (!context) {
    throw new Error("useScene must be used within a SceneProvider");
  }
  return context;
};