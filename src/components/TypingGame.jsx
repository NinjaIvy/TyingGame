
import React, { useState, useRef, useEffect } from "react";

// 收藏单词到localStorage
function addFavoriteWord(wordObj) {
  let list = [];
  try {
    list = JSON.parse(localStorage.getItem('favoriteWords') || '[]');
  } catch {}
  // 避免重复收藏
  if (!list.some(item => item.word === wordObj.word)) {
    list.push(wordObj);
    localStorage.setItem('favoriteWords', JSON.stringify(list));
  }
}
// 朗读英文和中文
function speakWord(word, cn) {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel(); // 防止叠加
    const enUtter = new window.SpeechSynthesisUtterance(word);
    enUtter.lang = 'en-US';
    window.speechSynthesis.speak(enUtter);
    if (cn) {
      enUtter.onend = () => {
        setTimeout(() => {
          const cnUtter = new window.SpeechSynthesisUtterance(cn);
          cnUtter.lang = 'zh-CN';
          window.speechSynthesis.speak(cnUtter);
        }, 80);
      };
    }
  }
}
import { setUnlockedLevel, getUnlockedLevel } from "./LevelSelector";

export default function TypingGame({ level, onBack }) {
  const [input, setInput] = useState("");
  const [currentTask, setCurrentTask] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [round, setRound] = useState(1); // 记录循环轮数
  const [showSpeed, setShowSpeed] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [canNext, setCanNext] = useState(false); // 是否允许进入下一关
  const inputRef = useRef();

  // 任务展开，每个任务重复3次
  const rawTasks = level.tasks;
  // 判断是否为带翻译的对象
  const isObjTask = typeof rawTasks[0] === 'object' && rawTasks[0] !== null && 'word' in rawTasks[0];
  // 展开任务，每项重复3次
  const tasks = React.useMemo(() => {
    if (!rawTasks) return [];
    let arr = [];
    for (let i = 0; i < rawTasks.length; i++) {
      for (let j = 0; j < 2; j++) {
        arr.push(rawTasks[i]);
      }
    }
    return arr;
  }, [rawTasks]);

  // 自动朗读当前任务
  useEffect(() => {
    let word = isObjTask ? tasks[currentTask].word : tasks[currentTask];
    let cn = isObjTask ? tasks[currentTask].cn : undefined;
    speakWord(word, cn);
    // eslint-disable-next-line
  }, [currentTask, round, isObjTask]);

  const handleChange = (e) => {
    if (!startTime) setStartTime(Date.now());
    setInput(e.target.value);
  const answer = isObjTask ? tasks[currentTask].word : tasks[currentTask];
  if (e.target.value === answer) {
      const newCompleted = completed + 1;
      setCompleted(newCompleted);
      setTimeout(() => {
        setInput("");
        // 完成一轮
        if (currentTask === tasks.length - 1) {
          setCurrentTask(0);
          setRound((r) => r + 1);
        } else {
          setCurrentTask((i) => i + 1);
        }
        // 只有本轮全部完成才解锁下一关（且只在本轮第一次完成时解锁）
        if (newCompleted % tasks.length === 0 && newCompleted !== 0 && (newCompleted / tasks.length) === round) {
          if (level.id === getUnlockedLevel()) {
            setUnlockedLevel(level.id + 1);
          }
        }
        inputRef.current && inputRef.current.focus();
      }, 200);
    }
  };

  const handleRestart = () => {
    setInput("");
    setCurrentTask(0);
    setCompleted(0);
    setRound(1);
    setShowSpeed(false);
    setStartTime(null);
    setEndTime(null);
    setCanNext(false);
    inputRef.current && inputRef.current.focus();
  };

  const handleNextLevel = () => {
    // 解锁下一关
    if (level.id === getUnlockedLevel()) {
      setUnlockedLevel(level.id + 1);
    }
    onBack();
  };

  // 只在点击“下一关”时才允许进入下一关，自动循环任务
  // 取消endTime和完成判定，始终可输入
  const duration = startTime ? (Date.now() - startTime) / 1000 : 0;
  const wpm = duration > 0 ? (tasks.join("").length / 5) / (duration / 60) : 0;

  return (
    <div>
      <button onClick={onBack}>返回关卡选择</button>
      <h2>第{level.id}关</h2>
      {level.desc && (
        <div style={{ margin: '8px 0', color: '#1976d2', fontWeight: 500 }}>{level.desc}</div>
      )}
      <div style={{ margin: 8 }}>第 {round} 轮</div>
      <div style={{ fontSize: 32, margin: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
        {isObjTask ? tasks[currentTask].word : tasks[currentTask]}
        {isObjTask && (
          <span style={{ fontSize: 18, color: '#888' }}>{tasks[currentTask].cn}</span>
        )}
        <button style={{ marginLeft: 16, fontSize: 16 }} onClick={() => {
          if (isObjTask) {
            addFavoriteWord(tasks[currentTask]);
          } else {
            addFavoriteWord({ word: tasks[currentTask], cn: '' });
          }
        }}>收藏</button>
      </div>
      {/* <div style={{ marginBottom: 8 }}>任务 {currentTask + 1} / {tasks.length}</div> */}
      <input
        ref={inputRef}
        value={input}
        onChange={handleChange}
        style={{ fontSize: 24, padding: 8, width: 200 }}
        autoFocus
      />
      <div style={{ margin: 8 }}>已完成 {completed} / {tasks.length}</div>
      <div style={{ marginTop: 16 }}>
        <button onClick={handleRestart}>重置本关</button>
        <button onClick={() => setShowSpeed((v) => !v)} style={{ marginLeft: 8 }}>
          {showSpeed ? "隐藏速度" : "显示速度"}
        </button>
        <button
          onClick={handleNextLevel}
          style={{ marginLeft: 8 }}
          disabled={getUnlockedLevel() <= level.id}
        >
          下一关
        </button>
        {showSpeed && (
          <div style={{ marginTop: 8 }}>
            <div>用时: {duration.toFixed(2)} 秒</div>
            <div>速度: {wpm.toFixed(2)} WPM</div>
          </div>
        )}
      </div>
    </div>
  );
}
