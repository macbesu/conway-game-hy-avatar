import React, { useCallback, useEffect, useRef, useState } from "react";
import produce from "immer";
import { data, rules } from "./constants";
import "./App.css";

const ROWS = 70;
const COLS = 93;

const directions = [
  [0, 1],
  [0, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
  [-1, -1],
  [1, 0],
  [-1, 0],
];

function App() {
  const [grid, setGrid] = useState([...data]);
  const [isActive, setIsActive] = useState(false);

  const activeRef = useRef<boolean>(isActive);
  activeRef.current = isActive;

  const handleRandom = useCallback(() => {
    setGrid((p) => {
      return produce(data, (dataCopy) => {
        for (let i = 0; i < ROWS; ++i) {
          for (let j = 0; j < COLS; ++j) {
            if (p[i][j] === -1) continue;
            dataCopy[i][j] = Math.random() > 0.7 ? 1 : 0;
          }
        }
      });
    });
  }, []);

  const handlePlay = useCallback(() => {
    if (!activeRef.current) return;
    setGrid((p) => {
      return produce(p, (gridCopy) => {
        for (let i = 0; i < ROWS; ++i) {
          for (let j = 0; j < COLS; ++j) {
            if (p[i][j] === -1) continue;
            let neighbors = 0;
            for (const [dx, dy] of directions) {
              const [x, y] = [i + dx, j + dy];
              if (x >= 0 && x < ROWS && y >= 0 && y < COLS && p[x][y] !== -1) {
                neighbors += p[x][y];
              }
            }

            if (neighbors < 2 || neighbors > 3) {
              gridCopy[i][j] = 0;
            } else if (p[i][j] === 0 && neighbors === 3) {
              gridCopy[i][j] = 1;
            }
          }
        }
      });
    });

    setTimeout(handlePlay, 50);
  }, []);

  const handleClickGrid = useCallback(
    (x: number, y: number) => {
      if (activeRef.current) return;
      if (grid[x][y] === -1) return;
      const newGrid = produce(grid, (gridCopy) => {
        gridCopy[x][y] = grid[x][y] === 0 ? 1 : 0;
      });
      setGrid(newGrid);
    },
    [grid]
  );

  useEffect(() => {
    console.log(rules);
  }, []);

  return (
    <div className='App'>
      <div className='controls'>
        <button
          onClick={() => {
            setIsActive((p) => !p);
            if (!isActive) {
              activeRef.current = true;
              handlePlay();
            }
          }}>
          {isActive ? "停止" : "开始"}
        </button>
        <button onClick={handleRandom}>随机</button>
        <button
          onClick={() => {
            setGrid([...data]);
            setIsActive(false);
          }}>
          重置
        </button>
      </div>
      <div className='wrapper' style={styles.wrapper}>
        {grid.map((cols, i) =>
          cols.map((_, j) => (
            <div
              key={`${i}-${j}`}
              className='grid'
              onClick={() => handleClickGrid(i, j)}
              style={{
                opacity: grid[i][j] === -1 ? 0 : 1,
                backgroundColor: grid[i][j] === 1 ? "#f3ab3c" : undefined,
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "grid",
    gridTemplateColumns: `repeat(${COLS}, 10px)`,
  },
};

export default App;
