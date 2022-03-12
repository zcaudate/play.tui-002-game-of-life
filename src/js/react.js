import React from 'react'

// js.react/Try [130] 
class Try extends React.Component{
  constructor(props){
    super(props);
    this.state = {"hasError":false,"error":null};
  }
  static getDerivedStateFromError(error){
    return {error,"hasError":true};
  }
  render(){
    if(this.state.hasError){
      return this.props.fallback;
    }
    else{
      return this.props.children;
    }
  }
}

// js.react/runIsMounted [153] 
function runIsMounted(mounted){
  let isMounted = function (){
    return mounted.current;
  };
  let runInit = function (){
    mounted.current = true;
    return function (){
      mounted.current = false;
    };
  };
  return [isMounted,runInit];
}

// js.react/useIsMounted [163] 
function useIsMounted(){
  let mounted = React.useRef(true);
  let [isMounted,runInit] = React.useCallback(runIsMounted(mounted),[]);
  React.useEffect(function (){
    runInit();
  },[]);
  return isMounted;
}

// js.react/runInterval [177] 
function runInterval(saved,f){
  let runFn = function (){
    return saved.current = f;
  };
  let runWatch = function (ms){
    if(null != ms){
      let interval = setInterval(function (){
        new Promise(function (){
          saved.current();
        });
      },ms);
      return function (){
        return [interval,clearInterval(interval)];
      };
    }
  };
  return [runFn,runWatch];
}

// js.react/useInterval [190] 
function useInterval(f,ms){
  let saved = React.useRef(null);
  let [runFn,runWatch] = runInterval(saved,f);
  React.useEffect(function (){
    runFn();
  });
  React.useEffect(function (){
    runWatch(ms);
  },[ms]);
}

// js.react/runTimeout [203] 
function runTimeout(saved,f){
  let runFn = function (){
    return saved.current = f;
  };
  let runWatch = function (ms){
    if(null != ms){
      let timeout = setInterval(function (){
        new Promise(function (){
          saved.current();
        });
      },ms);
      return function (){
        return [timeout,clearTimeout(timeout)];
      };
    }
  };
  return [runFn,runWatch];
}

// js.react/useTimeout [216] 
function useTimeout(f,ms){
  let saved = React.useRef(null);
  let [runFn,runWatch] = runTimeout(saved,f);
  React.useEffect(function (){
    runFn();
  });
  React.useEffect(function (){
    runWatch(ms);
  },[ms]);
}

// js.react/runCountdown [229] 
function runCountdown([current,setCurrent],timeoutFn,opts){
  let {interval = 1000,step = 1,to = 0} = opts || {};
  let timeout = setTimeout(function (){
    new Promise(function (){
      if(current > to){
        setCurrent(current - 1);
      }
      else{
        if(timeoutFn){
          timeoutFn(current);
        }
      }
    });
  },interval);
  return function (){
    return [timeout,clearTimeout(timeout)];
  };
}

// js.react/useCountdown [243] 
function useCountdown(initial,timeoutFn,opts){
  let [current,setCurrent] = React.useState(initial);
  React.useEffect(function (){
    runCountdown([current,setCurrent],timeoutFn,opts);
  });
  return [current,setCurrent];
}

// js.react/runNow [256] 
function runNow([time,setTime],interval){
  let timeout = setTimeout(function (){
    new Promise(function (){
      setTime(Date.now());
    });
  },interval);
  return function (){
    return [timeout,clearTimeout(timeout)];
  };
}

// js.react/useNow [265] 
function useNow(interval = 1000){
  let [time,setTime] = React.useState(Date.now());
  React.useEffect(function (){
    runNow([time,setTime],interval);
  });
  return time;
}

// js.react/runStep [278] 
function runStep([done,setDone],f){
  if(!done){
    return f(setDone);
  }
}

// js.react/useStep [285] 
function useStep(f){
  let [done,setDone] = React.useState();
  React.useEffect(function (){
    runStep([done,setDone],f);
  });
  return [done,setDone];
}

// js.react/runStepAsync [297] 
function runStepAsync([done,setDone],[waiting,setWaiting],f){
  if(!done && !waiting){
    return f(setWaiting,setDone);
  }
}

// js.react/useStepAsync [307] 
function useStepAsync(f){
  let [done,setDone] = React.useState();
  let [waiting,setWaiting] = React.useState();
  React.useEffect(function (){
    runStepAsync([done,setDone],[waiting,setWaiting],f);
  });
  return {done,setDone,setWaiting,waiting};
}

var MODULE = {
  "Try":Try,
  "runIsMounted":runIsMounted,
  "useIsMounted":useIsMounted,
  "runInterval":runInterval,
  "useInterval":useInterval,
  "runTimeout":runTimeout,
  "useTimeout":useTimeout,
  "runCountdown":runCountdown,
  "useCountdown":useCountdown,
  "runNow":runNow,
  "useNow":useNow,
  "runStep":runStep,
  "useStep":useStep,
  "runStepAsync":runStepAsync,
  "useStepAsync":useStepAsync
};

export default MODULE