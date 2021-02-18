import _ from "lodash";
import ut from "util";
import React, { useState } from "react";
import blessed from "blessed";
import { render } from "react-blessed";
import useInterval from "@use-it/interval";

// play.tui-game-of-life-raw.main/ROWS
const ROWS = 32;

// play.tui-game-of-life-raw.main/COLS
const COLS = 32;

// play.tui-game-of-life-raw.main/INTERVAL
const INTERVAL = 100;

// play.tui-game-of-life-raw.main/PARAMS
const PARAMS = { born: { min: 3, max: 3 }, live: { min: 2, max: 3 } };

// play.tui-game-of-life-raw.main/gridNew
function gridNew(rows, cols) {
  let grid = new Array(rows);
  for (let y = 0; y < rows; y++) {
    grid[y] = new Array(cols);
  }
  return grid;
}

// play.tui-game-of-life-raw.main/gridSeed
function gridSeed(grid, rows, cols) {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      grid[y][x] = Math.round(0.8 * Math.random());
    }
  }
}

// play.tui-game-of-life-raw.main/gridCreate
function gridCreate(rows, cols) {
  let grid = gridNew(rows, cols);
  gridSeed(grid, rows, cols);
  return grid;
}

// play.tui-game-of-life-raw.main/gridCount
function gridCount(grid, y, x, rows, cols) {
  let sum = 0;
  for (let v = -1; v < 2; v++) {
    for (let h = -1; h < 2; h++) {
      let yi = (y + v + rows) % rows;
      let xi = (x + h + cols) % cols;
      sum += grid[yi][xi];
    }
  }
  sum -= grid[y][x];
  return sum;
}

// play.tui-game-of-life-raw.main/gridNext
function gridNext(grid, rows, cols) {
  let next = gridNew(rows, cols);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let curr = grid[y][x];
      let near = gridCount(grid, y, x, rows, cols);
      if (curr === 0 && near === 3) {
        next[y][x] = 1;
      } else if (curr === 1 && (near < 2 || near > 3)) {
        next[y][x] = 0;
      } else {
        next[y][x] = curr;
      }
    }
  }
  return next;
}

// play.tui-game-of-life-raw.main/Button
function Button({ action, color, disabled, left, text, top }) {
  return (
    <button
      left={left || 0}
      top={top || 0}
      content={text}
      shrink={true}
      mouse={true}
      onPress={function () {
        if (action && !disabled) {
          action();
        }
      }}
      padding={{ top: 1, right: 2, bottom: 1, left: 2 }}
      style={{
        bg: !disabled ? color : "black",
        fg: !disabled ? "white" : "gray",
        focus: { bold: true },
      }}
    ></button>
  );
}

// play.tui-game-of-life-raw.main/TimeControl
function TimeControl(props) {
  return (
    <box shrink={true}>
      <Button
        left={1}
        text="START"
        color="green"
        disabled={!props.state.paused}
        action={props.fn.start}
      ></Button>
      <Button
        left={10}
        text="STOP"
        color="red"
        disabled={props.state.paused}
        action={props.fn.stop}
      ></Button>
      <Button
        left={21}
        text="NEXT"
        color="blue"
        disabled={!props.state.paused}
        action={props.fn.next}
      ></Button>
      <Button
        left={54}
        text="RESET"
        color="grey"
        action={props.fn.reset}
      ></Button>
    </box>
  );
}

// play.tui-game-of-life-raw.main/initialState
function initialState(rows, cols) {
  return {
    rows: rows,
    cols: cols,
    grid: gridCreate(rows, cols),
    paused: true,
    counter: 0,
  };
}

// play.tui-game-of-life-raw.main/GridView
function GridView(props) {
  let { cols, grid, rows } = props.state;
  return (
    <box label=" Grid " width={2 + 2 * rows} height={2 + cols} border="line">
      {grid.map(function (row, i) {
        return row.map(function (col, j) {
          return (
            <box
              top={i}
              width={2}
              left={2 * j}
              key={i + "_" + j}
              content=""
              style={{ bg: 1 == col ? "yellow" : "black" }}
              shrink={true}
            ></box>
          );
        });
      })}
    </box>
  );
}

// play.tui-game-of-life-raw.main/App
function App() {
  let [state, setState] = useState(initialState(ROWS, COLS));
  let next_fn = function () {
    let { cols, counter, grid, rows } = state;
    setState({
      ...state,
      counter: counter + 1,
      grid: gridNext(grid, rows, cols),
    });
  };
  useInterval(function () {
    if (!state.paused) {
      next_fn();
    }
  }, INTERVAL);
  let actions = {
    reset: function () {
      let { cols, grid, rows } = state;
      setState({ ...state, grid: gridCreate(rows, cols) });
    },
    next: next_fn,
    start: function () {
      let { paused } = state;
      setState({ ...state, paused: !paused });
    },
    stop: function () {
      let { paused } = state;
      setState({ ...state, paused: !paused });
    },
  };
  return (
    <box left={2} top={1} shrink={true}>
      <box shrink={true}>
        <TimeControl state={state} fn={actions}></TimeControl>
      </box>
      <box top={4} shrink={true}>
        <GridView state={state} fn={actions}></GridView>
      </box>
    </box>
  );
}

// play.tui-game-of-life-raw.main/Screen
function Screen() {
  const screen = blessed.screen({
    autoPadding: true,
    smartCSR: true,
    title: "Tui Game of Life",
  });
  screen.key(["q", "C-c", "Esc"], function () {
    this.destroy();
  });
  return screen;
}

// play.tui-game-of-life-raw.main/main
function main() {
  render(<App></App>, Screen());
}

main()