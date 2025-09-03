import React, { useState, useEffect } from "react";
import { levels } from "../data/levels";

function getUnlockedLevel() {
  return parseInt(localStorage.getItem("unlockedLevel") || "1", 10);
}

function setUnlockedLevel(level) {
  localStorage.setItem("unlockedLevel", String(level));
}

function toRoman(num) {
  const romans = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
  ];
  let result = '';
  for (const [value, numeral] of romans) {
    while (num >= value) {
      result += numeral;
      num -= value;
    }
  }
  return result;
}


export default function LevelSelector({ onSelect, guardianMode }) {
  const [unlockedLevel, setUnlockedLevelState] = useState(getUnlockedLevel());

  useEffect(() => {
    setUnlockedLevelState(getUnlockedLevel());
  }, []);

  const handleSelect = (level) => {
    if (level.id <= unlockedLevel || guardianMode) {
      onSelect(level);
    }
  };

  // 监护人模式下手动锁定/解锁关卡
  const handleLock = (level, lock) => {
    if (lock) {
      // 锁定到level.id-1
      setUnlockedLevel(level.id - 1);
      setUnlockedLevelState(level.id - 1);
    } else {
      // 解锁到level.id
      setUnlockedLevel(level.id);
      setUnlockedLevelState(level.id);
    }
  };

  return (
    <div>
      <h2>选择关卡</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        {levels.map((level) => (
          <div key={level.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 80 }}>
            <button
              onClick={() => handleSelect(level)}
              disabled={!guardianMode && level.id > unlockedLevel}
              style={{
                width: 48,
                height: 48,
                background: level.id > unlockedLevel ? "#eee" : "#b3e5fc",
                color: level.id > unlockedLevel ? "#aaa" : "#000",
                borderRadius: 8,
                border: "1px solid #90caf9",
                fontWeight: "bold",
              }}
            >
              {level.id}
            </button>
            {guardianMode && (
              <div style={{ marginTop: 2 }}>
                {level.id <= unlockedLevel ? (
                  <button style={{ fontSize: 10 }} onClick={() => handleLock(level, true)}>锁定</button>
                ) : (
                  <button style={{ fontSize: 10 }} onClick={() => handleLock(level, false)}>解锁</button>
                )}
              </div>
            )}
            {level.desc && (
              <div style={{ fontSize: 12, color: '#1976d2', textAlign: 'center', marginTop: 4, minHeight: 32 }}>
                {level.desc}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export { setUnlockedLevel, getUnlockedLevel };
