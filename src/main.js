import React from 'react'

import blessed from 'blessed'

import reactBlessed from 'react-blessed'

import r from './js/react'

// play.tui-002-game-of-life.main/ROWS [10] 
var ROWS = 32;

// play.tui-002-game-of-life.main/COLS [12] 
var COLS = 32;

// play.tui-002-game-of-life.main/INTERVAL [14] 
var INTERVAL = 100;

// play.tui-002-game-of-life.main/PARAMS [16] 
var PARAMS = {"born":{"min":3,"max":3},"live":{"min":2,"max":3}};

// play.tui-002-game-of-life.main/gridNew [20] 
function gridNew(rows,cols){
  let grid = new Array(rows);
  let y = null;
  for(let y = 0; y < rows; y = (y + 1)){
    grid[y] = new Array(cols);
  }
  return grid;
}

// play.tui-002-game-of-life.main/gridSeed [29] 
function gridSeed(grid,rows,cols){
  for(let y = 0; y < rows; y = (y + 1)){
    for(let x = 0; x < cols; x = (x + 1)){
      grid[y][x] = Math.round(0.8 * Math.random());
    }
  }
}

// play.tui-002-game-of-life.main/gridCreate [36] 
function gridCreate(rows,cols){
  let grid = gridNew(rows,cols);
  gridSeed(grid,rows,cols);
  return grid;
}

// play.tui-002-game-of-life.main/gridCount [42] 
function gridCount(grid,y,x,rows,cols){
  let sum = 0;
  for(let v = -1; v < 2; v = (v + 1)){
    for(let h = -1; h < 2; h = (h + 1)){
      let yi = (y + v + rows) % rows;
      let xi = (x + h + cols) % cols;
      sum += grid[yi][xi];
    }
  }
  sum -= grid[y][x];
  return sum;
}

// play.tui-002-game-of-life.main/gridNext [53] 
function gridNext(grid,rows,cols){
  let next = gridNew(rows,cols);
  for(let y = 0; y < rows; y = (y + 1)){
    for(let x = 0; x < cols; x = (x + 1)){
      let curr = grid[y][x];
      let near = gridCount(grid,y,x,rows,cols);
      if((curr === 0) && (near === 3)){
        next[y][x] = 1;
      }
      else if((curr === 1) && ((near < 2) || (near > 3))){
        next[y][x] = 0;
      }
      else{
        next[y][x] = curr;
      }
    }
  }
  return next;
}

// play.tui-002-game-of-life.main/Button [73] 
function Button({action,color,disabled,left,text,top}){
  return (
    <button
      left={left || 0}
      top={top || 0}
      content={text}
      shrink={true}
      mouse={true}
      onPress={function (){
        if(action && !disabled){
          action();
        }
      }}
      padding={{"top":1,"right":2,"bottom":1,"left":2}}
      style={{
        "bg":!disabled ? [color,"black"] : null,
        "fg":!disabled ? ["white","gray"] : null,
        "focus":{"bold":true}
      }}>
    </button>);
}

// play.tui-002-game-of-life.main/TimeControl [93] 
function TimeControl(props){
  return (
    <box shrink={true}>
      <Button
        left={1}
        text="START"
        color="green"
        disabled={!props.state.paused}
        action={props.fn.start}>
      </Button>
      <Button
        left={10}
        text="STOP"
        color="red"
        disabled={props.state.paused}
        action={props.fn.stop}>
      </Button>
      <Button
        left={21}
        text="NEXT"
        color="blue"
        disabled={!props.state.paused}
        action={props.fn.next}>
      </Button>
      <Button left={54} text="RESET" color="grey" action={props.fn.reset}></Button>
    </box>);
}

// play.tui-002-game-of-life.main/initialState [121] 
function initialState(rows,cols){
  return {
    "rows":rows,
    "cols":cols,
    "grid":gridCreate(rows,cols),
    "paused":true,
    "counter":0
  };
}

// play.tui-002-game-of-life.main/GridView [129] 
function GridView(props){
  let {cols,grid,rows} = props.state;
  return (
    <box
      label=" Grid "
      width={2 + (2 * rows)}
      height={2 + cols}
      border="line">
      {grid.map(function (row,i){
        return row.map(function (col,j){
          return (
            <box
              top={i}
              width={2}
              left={2 * j}
              key={i + "_" + j}
              content=""
              style={{"bg":(1 == col) ? ["yellow","black"] : null}}
              shrink={true}>
            </box>);
        });
      })}
    </box>);
}

// play.tui-002-game-of-life.main/App [151] 
function App(){
  let [state,setState] = React.useState(initialState(ROWS,COLS));
  let next_fn = function (){
    let {cols,counter,grid,rows} = state;
    setState(
      {...state,"counter":counter + 1,"grid":gridNext(grid,rows,cols)}
    );
  };
  let actions = {
    "reset":function (){
        let {cols,grid,rows} = state;
        setState({...state,"grid":gridCreate(rows,cols)});
      },
    "next":next_fn,
    "start":function (){
        let {paused} = state;
        setState({...state,"paused":!paused});
      },
    "stop":function (){
        let {paused} = state;
        setState({...state,"paused":!paused});
      }
  };
  r.useInterval(function (){
    if(!state.paused){
      next_fn();
    }
  },INTERVAL);
  return (
    <box left={2} top={1} shrink={true}>
      <box shrink={true}><TimeControl state={state} fn={actions}></TimeControl></box>
      <box top={4} shrink={true}><GridView state={state} fn={actions}></GridView></box>
    </box>);
}

// play.tui-002-game-of-life.main/Screen [188] 
function Screen(){
  let screen = blessed.screen({
    "autoPadding":true,
    "smartCSR":true,
    "title":"Tui 002 - Game of Life"
  });
  screen.key(["q","C-c","Esc"],function (){
    this.destroy();
  });
  return screen;
}

// play.tui-002-game-of-life.main/__main__ [198] 
reactBlessed.render((
  <App></App>),Screen());