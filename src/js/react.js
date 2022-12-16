import React from 'react'

import k from '../xt/lang/base-lib'

// js.react/Try [152] 
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

// js.react/id [170] 
function id(n){
  return React.useCallback(Math.random().toString(36).substr(2,(n || 6) || 4),[]);
}

// js.react/useStep [180] 
function useStep(f){
  let [done,setDone] = React.useState();
  React.useEffect(function (){
    if(!done){
      return f(setDone);
    }
  });
  return [done,setDone];
}

// js.react/makeLazy [190] 
function makeLazy(component){
  if(k.fnp(component)){
    return component;
  }
  else{
    return React.lazy(function (){
      return component;
    });
  }
}

// js.react/useLazy [198] 
function useLazy(component){
  if(k.fnp(component)){
    return component;
  }
  else{
    return React.useCallback(React.lazy(function (){
      return component;
    }),[]);
  }
}

// js.react/useRefresh [210] 
function useRefresh(){
  let [flag,setFlag] = React.useState(true);
  let refresh = function (){
    return setFlag(!flag);
  };
  return refresh;
}

// js.react/useGetCount [218] 
function useGetCount(n){
  let counterRef = React.useRef(n || 0);
  React.useEffect(function (){
    counterRef.current = (1 + counterRef.current);
  });
  let getCount = React.useCallback(function (){
    return counterRef.current;
  },[]);
  return getCount;
}

// js.react/useFollowRef [228] 
function useFollowRef(value,f){
  f = (f || k.identity);
  let valueRef = React.useRef(f(value));
  React.useEffect(function (){
    valueRef.current = f(value);
  },[value]);
  return valueRef;
}

// js.react/useIsMounted [242] 
function useIsMounted(){
  let mountedRef = React.useRef(true);
  let isMounted = React.useCallback(function (){
    return mountedRef.current;
  },[]);
  React.useEffect(function (){
    return function (){
      mountedRef.current = false;
    };
  },[]);
  return isMounted;
}

// js.react/useIsMountedWrap [253] 
function useIsMountedWrap(){
  let isMounted = useIsMounted();
  return function (f){
    return function (...args){
      if(isMounted()){
        f(...args);
      }
    };
  };
}

// js.react/useMountedCallback [264] 
function useMountedCallback(cb){
  let cbRef = useFollowRef(cb);
  React.useEffect(function (){
    if(cbRef.current){
      cbRef.current(true);
    }
    return function (){
      if(cbRef.current){
        cbRef.current(false);
      }
    };
  },[]);
}

// js.react/useFollowDelayed [276] 
function useFollowDelayed(value,delay,isMounted){
  if(0 == delay){
    return [value,k.noop];
  }
  let [delayed,setDelayed] = React.useState(value);
  React.useEffect(function (){
    new Promise(function (resolve,reject){
      setTimeout(function (){
        try{
          resolve(          (function (){
                      if(isMounted()){
                        setDelayed(value);
                      }
                    })());
        }
        catch(e){
          reject(e);
        }
      },delay);
    });
  },[value]);
  return [delayed,setDelayed];
}

// js.react/runIntervalStop [294] 
function runIntervalStop(intervalRef){
  let interval = intervalRef.current;
  if(null != interval){
    clearInterval(interval);
    intervalRef.current = null;
  }
  return interval;
}

// js.react/runIntervalStart [304] 
function runIntervalStart(fRef,msRef,intervalRef){
  let prev = runIntervalStop(intervalRef);
  if(null != msRef.current){
    let curr = setInterval(function (){
      new Promise(function (){
        fRef.current();
      });
    },msRef.current);
    intervalRef.current = curr;
    return [prev,curr];
  }
  return [prev];
}

// js.react/useInterval [317] 
function useInterval(f,ms){
  let fRef = useFollowRef(f);
  let msRef = useFollowRef(ms);
  let intervalRef = React.useRef(null);
  let stopInterval = React.useCallback(function (){
    return runIntervalStop(intervalRef);
  },[]);
  let startInterval = React.useCallback(function (){
    return runIntervalStart(fRef,msRef,intervalRef);
  },[]);
  React.useEffect(function (){
    startInterval();
    return stopInterval;
  },[ms]);
  return {startInterval,stopInterval};
}

// js.react/runTimeoutStop [340] 
function runTimeoutStop(timeoutRef){
  let timeout = timeoutRef.current;
  if(null != timeout){
    clearTimeout(timeout);
    timeoutRef.current = null;
  }
  return timeout;
}

// js.react/runTimeoutStart [350] 
function runTimeoutStart(fRef,msRef,timeoutRef){
  let prev = runTimeoutStop(timeoutRef);
  let curr = setTimeout(function (){
    new Promise(function (){
      fRef.current();
    });
  },msRef.current || 0);
  timeoutRef.current = curr;
  return [prev,curr];
}

// js.react/useTimeout [361] 
function useTimeout(f,ms,init){
  let fRef = useFollowRef(f);
  let msRef = useFollowRef(ms);
  let timeoutRef = React.useRef(null);
  let stopTimeout = React.useCallback(function (){
    return runTimeoutStop(timeoutRef);
  },[]);
  let startTimeout = React.useCallback(function (){
    return runTimeoutStart(fRef,msRef,timeoutRef);
  },[]);
  React.useEffect(function (){
    if(false != init){
      startTimeout();
    }
    return stopTimeout;
  },[]);
  return {startTimeout,stopTimeout};
}

// js.react/useCountdown [383] 
function useCountdown(initial,onComplete,opts){
  let {interval = 1000,step = 1,to = 0} = opts || {};
  let [current,setCurrent] = React.useState(initial);
  let {startInterval,stopInterval} = useInterval(function (){
    if(current > to){
      setCurrent(current - step);
    }
    else{
      stopInterval();
      if(onComplete){
        onComplete(current);
      }
    }
  },interval);
  return [
    current,
    setCurrent,
    {"startCountdown":startInterval,"stopCountdown":stopInterval}
  ];
}

// js.react/useNow [411] 
function useNow(interval){
  let [now,setNow] = React.useState(Date.now());
  let {startInterval,stopInterval} = useInterval(function (){
    setNow(Date.now());
  },interval || 1000);
  return [now,{"startNow":startInterval,"stopNow":stopInterval}];
}

// js.react/useSubmit [428] 
function useSubmit({
  result,
  delay = 200,
  setResult = function (){
  return null;
},
  onSubmit = function (){
  return null;
},
  onError = function (res){
  return res["body"];
},
  onSuccess = k.identity,
  isMounted = function (){
  return true;
}
}){
  let [waiting,setWaiting] = React.useState(function (){
    return false;
  });
  let onAction = function (){
    setWaiting(true);
    new Promise(function (resolve,reject){
      try{
        resolve(        (function (){
                  if(onSubmit){
                    return onSubmit();
                  }
                })());
      }
      catch(e){
        reject(e);
      }
    }).then(function (res){
      if(isMounted()){
        setResult(onSuccess(res));
      }
      new Promise(function (resolve,reject){
        setTimeout(function (){
          try{
            resolve(            (function (){
                          if(isMounted()){
                            setWaiting(false);
                          }
                        })());
          }
          catch(e){
            reject(e);
          }
        },delay);
      });
    }).catch(function (err){
      new Promise(function (resolve,reject){
        setTimeout(function (){
          try{
            resolve(            (function (){
                          if(isMounted()){
                            setWaiting(false);
                          }
                        })());
          }
          catch(e){
            reject(e);
          }
        },delay);
      });
      if(isMounted()){
        setResult(onError(err));
      }
    });
  };
  let errored = result && ("error" == result[["status"]]);
  return {errored,onAction,setWaiting,waiting};
}

// js.react/useSubmitResult [462] 
function useSubmitResult({onError,onResult,onSubmit,onSuccess,result,setResult}){
  let isMounted = useIsMounted();
  [result,setResult] = ((null == setResult) ? React.useState() : [result,setResult]);
  React.useEffect(function (){
    if(onResult){
      onResult(result);
    }
  },[result]);
  let {errored,onAction,setWaiting,waiting} = useSubmit({isMounted,onError,onSubmit,onSuccess,result,setResult});
  return {errored,isMounted,onAction,result,setResult,setWaiting,waiting,"onActionPress":function (){
      return errored ? setResult(null) : onAction();
    },"onActionReset":function (){
      return setResult(null);
    }};
}

// js.react/convertIndex [500] 
function convertIndex({
  data,
  value,
  setValue,
  allowNotFound,
  valueFn = function (x){
  return x;
}
}){
  let forwardFn = function (idx){
    let out = data && data[idx || 0];
    return out ? valueFn(out) : null;
  };
  let reverseFn = function (label){
    let idx = data.map(valueFn).indexOf(label);
    return allowNotFound ? idx : Math.max(0,idx);
  };
  let setIndex = function (idx){
    setValue(forwardFn(idx));
  };
  let index = reverseFn(value);
  let items = data.map(valueFn);
  return {index,items,setIndex};
}

// js.react/convertModular [522] 
function convertModular({
  data,
  value,
  setValue,
  valueFn = function (x){
  return x;
},
  indexFn
}){
  let forwardFn = function (idx){
    let out = data && data[k.mod_pos(idx || 0,(data).length)];
    return out ? valueFn(out) : null;
  };
  let reverseFn = function (label){
    let pval = indexFn();
    let nval = Math.max(0,data.map(valueFn).indexOf(label));
    let offset = k.mod_offset(pval,nval,(data).length);
    return pval + offset;
  };
  let setIndex = function (idx){
    setValue(forwardFn(idx));
  };
  let index = reverseFn(value);
  let items = data.map(valueFn);
  return {index,items,setIndex};
}

// js.react/convertIndices [554] 
function convertIndices({
  data,
  values,
  setValues,
  valueFn = function (x){
  return x;
}
}){
  let forwardFn = function (indices){
    let out = [];
    for(let i = 0; i < indices.length; ++i){
      let e = indices[i];
      if(e){
        out.push(data[i]);
      }
    };
    return out;
  };
  let reverseFn = function (values){
    return data.map(function (e){
      return 0 <= values.indexOf(e);
    });
  };
  let setIndices = function (indices){
    setValues(forwardFn(indices));
  };
  let indices = reverseFn(values);
  let items = data.map(valueFn);
  return {indices,items,setIndices};
}

// js.react/convertPosition [575] 
function convertPosition({length,max,min,step}){
  let divisions = Math.floor((max - min) / step);
  let unit = length / divisions;
  let forwardFn = function (value){
    let n = Math.floor((value - min) / step);
    return n * unit;
  };
  let reverseFn = function (pos){
    let relative = Math.max(0,Math.min(length,pos));
    let n = Math.round(relative / unit);
    let out = min + (n * step);
    return out;
  };
  return {forwardFn,reverseFn};
}

// js.react/useChanging [595] 
function useChanging(data,f,state){
  f = (f || function (arr){
    return arr[0];
  });
  data = (data || []);
  let [value,setValue] = state || React.useState(f(data));
  React.useEffect(function (){
    if(k.not_emptyp(data) && ((null == value) || (0 > data.indexOf(value)))){
      setValue(f(data));
    }
  },[JSON.stringify(data)]);
  return [value,setValue];
}

// js.react/useTree [609] 
function useTree({branchesFn,displayFn,formatFn,initial,parents,root,setInitial,targetFn,tree}){
  branchesFn = (branchesFn || function (tree,_parents,_root){
    if(tree){
      return k.sort(k.obj_keys(tree));
    }
    else{
      return [];
    }
  });
  targetFn = (targetFn || function (tree,branch,_parents,_root){
    if(tree){
      return tree[branch];
    }
    else{
      return null;
    }
  });
  let branches = branchesFn(tree,parents,root);
  let [branch,setBranch] = React.useState(initial || branches[0]);
  let target = (tree && branch) ? targetFn(tree,branch,parents,root) : null;
  React.useEffect(function (){
    if((null != branch) && (null == target) && k.not_emptyp(branches) && targetFn(tree,branches[0],parents,root)){
      setBranch(branches[0]);
    }
    if((null != branch) && setInitial && (initial != branch)){
      setInitial(branch);
    }
  },[branch,initial]);
  let view = displayFn(target,branch,parents,root);
  return {branch,branches,setBranch,view};
}

var MODULE = {
  "Try":Try,
  "id":id,
  "useStep":useStep,
  "makeLazy":makeLazy,
  "useLazy":useLazy,
  "useRefresh":useRefresh,
  "useGetCount":useGetCount,
  "useFollowRef":useFollowRef,
  "useIsMounted":useIsMounted,
  "useIsMountedWrap":useIsMountedWrap,
  "useMountedCallback":useMountedCallback,
  "useFollowDelayed":useFollowDelayed,
  "runIntervalStop":runIntervalStop,
  "runIntervalStart":runIntervalStart,
  "useInterval":useInterval,
  "runTimeoutStop":runTimeoutStop,
  "runTimeoutStart":runTimeoutStart,
  "useTimeout":useTimeout,
  "useCountdown":useCountdown,
  "useNow":useNow,
  "useSubmit":useSubmit,
  "useSubmitResult":useSubmitResult,
  "convertIndex":convertIndex,
  "convertModular":convertModular,
  "convertIndices":convertIndices,
  "convertPosition":convertPosition,
  "useChanging":useChanging,
  "useTree":useTree
};

export default MODULE