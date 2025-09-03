import React, { useState } from "react";
import LevelSelector from "./components/LevelSelector";
import TypingGame from "./components/TypingGame";
import FavoriteWords from "./components/FavoriteWords";

export default function App() {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [guardianMode, setGuardianMode] = useState(false);
  const [showFavorite, setShowFavorite] = useState(false);

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
      <h1>小学生分级打字游戏</h1>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <button onClick={() => setGuardianMode((v) => !v)}>
          {guardianMode ? "退出监护人模式" : "进入监护人模式"}
        </button>
        <button onClick={() => setShowFavorite(true)}>
          查看收藏
        </button>
      </div>
      {showFavorite ? (
        <FavoriteWords onBack={() => setShowFavorite(false)} />
      ) : !selectedLevel ? (
        <LevelSelector onSelect={setSelectedLevel} guardianMode={guardianMode} />
      ) : (
        <TypingGame level={selectedLevel} onBack={() => setSelectedLevel(null)} />
      )}
    </div>
  );
}
