import React, { useState, useEffect } from "react";

export default function FavoriteWords({ onBack }) {
  const [words, setWords] = useState([]);
  useEffect(() => {
    try {
      const list = JSON.parse(localStorage.getItem('favoriteWords') || '[]');
      setWords(list);
    } catch {
      setWords([]);
    }
  }, []);
  return (
    <div>
      <button onClick={onBack}>返回主页</button>
      <h2>收藏的单词</h2>
      {words.length === 0 ? (
        <div>暂无收藏</div>
      ) : (
        <ul>
          {words.map((item, idx) => (
            <li key={item.word + idx} style={{ fontSize: 24, margin: 8 }}>
              {item.word} {item.cn && <span style={{ color: '#888', fontSize: 18 }}>({item.cn})</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
