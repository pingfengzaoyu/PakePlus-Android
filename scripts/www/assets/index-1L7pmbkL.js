(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link2 of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link2);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link2) {
    const fetchOpts = {};
    if (link2.integrity)
      fetchOpts.integrity = link2.integrity;
    if (link2.referrerPolicy)
      fetchOpts.referrerPolicy = link2.referrerPolicy;
    if (link2.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link2.crossOrigin === "anonymous")
      fetchOpts.credentials = "omit";
    else
      fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link2) {
    if (link2.ep)
      return;
    link2.ep = true;
    const fetchOpts = getFetchOpts(link2);
    fetch(link2.href, fetchOpts);
  }
})();
/**
* @vue/shared v3.6.0-alpha.2
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function makeMap(str) {
  const map2 = /* @__PURE__ */ Object.create(null);
  for (const key of str.split(","))
    map2[key] = 1;
  return (val) => val in map2;
}
const EMPTY_OBJ = Object.freeze({});
const NOOP = () => {
};
const extend = Object.assign;
const hasOwnProperty$1 = Object.prototype.hasOwnProperty;
const hasOwn = (val, key) => hasOwnProperty$1.call(val, key);
const isArray$1 = Array.isArray;
const isMap = (val) => toTypeString(val) === "[object Map]";
const isSet = (val) => toTypeString(val) === "[object Set]";
const isFunction = (val) => typeof val === "function";
const isString = (val) => typeof val === "string";
const isSymbol = (val) => typeof val === "symbol";
const isObject = (val) => val !== null && typeof val === "object";
const isPromise = (val) => {
  return (isObject(val) || isFunction(val)) && isFunction(val.then) && isFunction(val.catch);
};
const objectToString = Object.prototype.toString;
const toTypeString = (value) => objectToString.call(value);
const toRawType = (value) => {
  return toTypeString(value).slice(8, -1);
};
const isPlainObject = (val) => toTypeString(val) === "[object Object]";
const isIntegerKey = (key) => isString(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key;
const cacheStringFunction = (fn) => {
  const cache = /* @__PURE__ */ Object.create(null);
  return (str) => {
    const hit = cache[str];
    return hit || (cache[str] = fn(str));
  };
};
const capitalize = cacheStringFunction((str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
});
const hasChanged = (value, oldValue) => !Object.is(value, oldValue);
const def = (obj, key, value, writable = false) => {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: false,
    writable,
    value
  });
};
let _globalThis;
const getGlobalThis = () => {
  return _globalThis || (_globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
};
/**
* @vue/reactivity v3.6.0-alpha.2
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function warn$2(msg, ...args) {
  console.warn(`[Vue warn] ${msg}`, ...args);
}
var ReactiveFlags$1 = /* @__PURE__ */ ((ReactiveFlags2) => {
  ReactiveFlags2[ReactiveFlags2["None"] = 0] = "None";
  ReactiveFlags2[ReactiveFlags2["Mutable"] = 1] = "Mutable";
  ReactiveFlags2[ReactiveFlags2["Watching"] = 2] = "Watching";
  ReactiveFlags2[ReactiveFlags2["RecursedCheck"] = 4] = "RecursedCheck";
  ReactiveFlags2[ReactiveFlags2["Recursed"] = 8] = "Recursed";
  ReactiveFlags2[ReactiveFlags2["Dirty"] = 16] = "Dirty";
  ReactiveFlags2[ReactiveFlags2["Pending"] = 32] = "Pending";
  return ReactiveFlags2;
})(ReactiveFlags$1 || {});
const notifyBuffer = [];
let batchDepth = 0;
let activeSub = void 0;
let notifyIndex = 0;
let notifyBufferLength = 0;
function setActiveSub(sub) {
  try {
    return activeSub;
  } finally {
    activeSub = sub;
  }
}
function startBatch() {
  ++batchDepth;
}
function endBatch() {
  if (!--batchDepth && notifyBufferLength) {
    flush();
  }
}
function link(dep, sub) {
  const prevDep = sub.depsTail;
  if (prevDep !== void 0 && prevDep.dep === dep) {
    return;
  }
  let nextDep = void 0;
  const recursedCheck = sub.flags & 4;
  if (recursedCheck) {
    nextDep = prevDep !== void 0 ? prevDep.nextDep : sub.deps;
    if (nextDep !== void 0 && nextDep.dep === dep) {
      sub.depsTail = nextDep;
      return;
    }
  }
  const prevSub = dep.subsTail;
  const newLink = sub.depsTail = dep.subsTail = {
    dep,
    sub,
    prevDep,
    nextDep,
    prevSub,
    nextSub: void 0
  };
  if (nextDep !== void 0) {
    nextDep.prevDep = newLink;
  }
  if (prevDep !== void 0) {
    prevDep.nextDep = newLink;
  } else {
    sub.deps = newLink;
  }
  if (prevSub !== void 0) {
    prevSub.nextSub = newLink;
  } else {
    dep.subs = newLink;
  }
}
function unlink(link2, sub = link2.sub) {
  const dep = link2.dep;
  const prevDep = link2.prevDep;
  const nextDep = link2.nextDep;
  const nextSub = link2.nextSub;
  const prevSub = link2.prevSub;
  if (nextDep !== void 0) {
    nextDep.prevDep = prevDep;
  } else {
    sub.depsTail = prevDep;
  }
  if (prevDep !== void 0) {
    prevDep.nextDep = nextDep;
  } else {
    sub.deps = nextDep;
  }
  if (nextSub !== void 0) {
    nextSub.prevSub = prevSub;
  } else {
    dep.subsTail = prevSub;
  }
  if (prevSub !== void 0) {
    prevSub.nextSub = nextSub;
  } else if ((dep.subs = nextSub) === void 0) {
    let toRemove = dep.deps;
    if (toRemove !== void 0) {
      do {
        toRemove = unlink(toRemove, dep);
      } while (toRemove !== void 0);
      dep.flags |= 16;
    }
  }
  return nextDep;
}
function propagate(link2) {
  let next = link2.nextSub;
  let stack2;
  top:
    do {
      const sub = link2.sub;
      let flags = sub.flags;
      if (flags & (1 | 2)) {
        if (!(flags & (4 | 8 | 16 | 32))) {
          sub.flags = flags | 32;
        } else if (!(flags & (4 | 8))) {
          flags = 0;
        } else if (!(flags & 4)) {
          sub.flags = flags & -9 | 32;
        } else if (!(flags & (16 | 32)) && isValidLink(link2, sub)) {
          sub.flags = flags | 8 | 32;
          flags &= 1;
        } else {
          flags = 0;
        }
        if (flags & 2) {
          notifyBuffer[notifyBufferLength++] = sub;
        }
        if (flags & 1) {
          const subSubs = sub.subs;
          if (subSubs !== void 0) {
            link2 = subSubs;
            if (subSubs.nextSub !== void 0) {
              stack2 = { value: next, prev: stack2 };
              next = link2.nextSub;
            }
            continue;
          }
        }
      }
      if ((link2 = next) !== void 0) {
        next = link2.nextSub;
        continue;
      }
      while (stack2 !== void 0) {
        link2 = stack2.value;
        stack2 = stack2.prev;
        if (link2 !== void 0) {
          next = link2.nextSub;
          continue top;
        }
      }
      break;
    } while (true);
}
function startTracking(sub) {
  sub.depsTail = void 0;
  sub.flags = sub.flags & -57 | 4;
  return setActiveSub(sub);
}
function endTracking(sub, prevSub) {
  if (activeSub !== sub) {
    warn$2(
      "Active effect was not restored correctly - this is likely a Vue internal bug."
    );
  }
  activeSub = prevSub;
  const depsTail = sub.depsTail;
  let toRemove = depsTail !== void 0 ? depsTail.nextDep : sub.deps;
  while (toRemove !== void 0) {
    toRemove = unlink(toRemove, sub);
  }
  sub.flags &= -5;
}
function flush() {
  while (notifyIndex < notifyBufferLength) {
    const effect2 = notifyBuffer[notifyIndex];
    notifyBuffer[notifyIndex++] = void 0;
    effect2.notify();
  }
  notifyIndex = 0;
  notifyBufferLength = 0;
}
function checkDirty(link2, sub) {
  let stack2;
  let checkDepth = 0;
  top:
    do {
      const dep = link2.dep;
      const depFlags = dep.flags;
      let dirty = false;
      if (sub.flags & 16) {
        dirty = true;
      } else if ((depFlags & (1 | 16)) === (1 | 16)) {
        if (dep.update()) {
          const subs = dep.subs;
          if (subs.nextSub !== void 0) {
            shallowPropagate(subs);
          }
          dirty = true;
        }
      } else if ((depFlags & (1 | 32)) === (1 | 32)) {
        if (link2.nextSub !== void 0 || link2.prevSub !== void 0) {
          stack2 = { value: link2, prev: stack2 };
        }
        link2 = dep.deps;
        sub = dep;
        ++checkDepth;
        continue;
      }
      if (!dirty && link2.nextDep !== void 0) {
        link2 = link2.nextDep;
        continue;
      }
      while (checkDepth) {
        --checkDepth;
        const firstSub = sub.subs;
        const hasMultipleSubs = firstSub.nextSub !== void 0;
        if (hasMultipleSubs) {
          link2 = stack2.value;
          stack2 = stack2.prev;
        } else {
          link2 = firstSub;
        }
        if (dirty) {
          if (sub.update()) {
            if (hasMultipleSubs) {
              shallowPropagate(firstSub);
            }
            sub = link2.sub;
            continue;
          }
        } else {
          sub.flags &= -33;
        }
        sub = link2.sub;
        if (link2.nextDep !== void 0) {
          link2 = link2.nextDep;
          continue top;
        }
        dirty = false;
      }
      return dirty;
    } while (true);
}
function shallowPropagate(link2) {
  do {
    const sub = link2.sub;
    const nextSub = link2.nextSub;
    const subFlags = sub.flags;
    if ((subFlags & (32 | 16)) === 32) {
      sub.flags = subFlags | 16;
    }
    link2 = nextSub;
  } while (link2 !== void 0);
}
function isValidLink(checkLink, sub) {
  const depsTail = sub.depsTail;
  if (depsTail !== void 0) {
    let link2 = sub.deps;
    do {
      if (link2 === checkLink) {
        return true;
      }
      if (link2 === depsTail) {
        break;
      }
      link2 = link2.nextDep;
    } while (link2 !== void 0);
  }
  return false;
}
const triggerEventInfos = [];
function onTrack(sub, debugInfo) {
  if (sub.onTrack) {
    sub.onTrack(
      extend(
        {
          effect: sub
        },
        debugInfo
      )
    );
  }
}
function onTrigger(sub) {
  if (sub.onTrigger) {
    const debugInfo = triggerEventInfos[triggerEventInfos.length - 1];
    sub.onTrigger(
      extend(
        {
          effect: sub
        },
        debugInfo
      )
    );
  }
}
function setupOnTrigger(target) {
  Object.defineProperty(target.prototype, "onTrigger", {
    get() {
      return this._onTrigger;
    },
    set(val) {
      if (val && !this._onTrigger)
        setupFlagsHandler(this);
      this._onTrigger = val;
    }
  });
}
function setupFlagsHandler(target) {
  target._flags = target.flags;
  Object.defineProperty(target, "flags", {
    get() {
      return target._flags;
    },
    set(value) {
      if (!(target._flags & (ReactiveFlags$1.Dirty | ReactiveFlags$1.Pending)) && !!(value & (ReactiveFlags$1.Dirty | ReactiveFlags$1.Pending))) {
        onTrigger(this);
      }
      target._flags = value;
    }
  });
}
class Dep {
  constructor(map2, key) {
    this.map = map2;
    this.key = key;
    this._subs = void 0;
    this.subsTail = void 0;
    this.flags = ReactiveFlags$1.None;
  }
  get subs() {
    return this._subs;
  }
  set subs(value) {
    this._subs = value;
    if (value === void 0) {
      this.map.delete(this.key);
    }
  }
}
const targetMap = /* @__PURE__ */ new WeakMap();
const ITERATE_KEY = Symbol(
  "Object iterate"
);
const MAP_KEY_ITERATE_KEY = Symbol(
  "Map keys iterate"
);
const ARRAY_ITERATE_KEY = Symbol(
  "Array iterate"
);
function track(target, type, key) {
  if (activeSub !== void 0) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, dep = new Dep(depsMap, key));
    }
    {
      onTrack(activeSub, {
        target,
        type,
        key
      });
    }
    link(dep, activeSub);
  }
}
function trigger(target, type, key, newValue, oldValue, oldTarget) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  const run = (dep) => {
    if (dep !== void 0 && dep.subs !== void 0) {
      {
        triggerEventInfos.push({
          target,
          type,
          key,
          newValue,
          oldValue,
          oldTarget
        });
      }
      propagate(dep.subs);
      shallowPropagate(dep.subs);
      {
        triggerEventInfos.pop();
      }
    }
  };
  startBatch();
  if (type === "clear") {
    depsMap.forEach(run);
  } else {
    const targetIsArray = isArray$1(target);
    const isArrayIndex = targetIsArray && isIntegerKey(key);
    if (targetIsArray && key === "length") {
      const newLength = Number(newValue);
      depsMap.forEach((dep, key2) => {
        if (key2 === "length" || key2 === ARRAY_ITERATE_KEY || !isSymbol(key2) && key2 >= newLength) {
          run(dep);
        }
      });
    } else {
      if (key !== void 0 || depsMap.has(void 0)) {
        run(depsMap.get(key));
      }
      if (isArrayIndex) {
        run(depsMap.get(ARRAY_ITERATE_KEY));
      }
      switch (type) {
        case "add":
          if (!targetIsArray) {
            run(depsMap.get(ITERATE_KEY));
            if (isMap(target)) {
              run(depsMap.get(MAP_KEY_ITERATE_KEY));
            }
          } else if (isArrayIndex) {
            run(depsMap.get("length"));
          }
          break;
        case "delete":
          if (!targetIsArray) {
            run(depsMap.get(ITERATE_KEY));
            if (isMap(target)) {
              run(depsMap.get(MAP_KEY_ITERATE_KEY));
            }
          }
          break;
        case "set":
          if (isMap(target)) {
            run(depsMap.get(ITERATE_KEY));
          }
          break;
      }
    }
  }
  endBatch();
}
function reactiveReadArray(array) {
  const raw = toRaw(array);
  if (raw === array)
    return raw;
  track(raw, "iterate", ARRAY_ITERATE_KEY);
  return isShallow(array) ? raw : raw.map(toReactive);
}
function shallowReadArray(arr) {
  track(arr = toRaw(arr), "iterate", ARRAY_ITERATE_KEY);
  return arr;
}
const arrayInstrumentations = {
  __proto__: null,
  [Symbol.iterator]() {
    return iterator(this, Symbol.iterator, toReactive);
  },
  concat(...args) {
    return reactiveReadArray(this).concat(
      ...args.map((x) => isArray$1(x) ? reactiveReadArray(x) : x)
    );
  },
  entries() {
    return iterator(this, "entries", (value) => {
      value[1] = toReactive(value[1]);
      return value;
    });
  },
  every(fn, thisArg) {
    return apply(this, "every", fn, thisArg, void 0, arguments);
  },
  filter(fn, thisArg) {
    return apply(this, "filter", fn, thisArg, (v) => v.map(toReactive), arguments);
  },
  find(fn, thisArg) {
    return apply(this, "find", fn, thisArg, toReactive, arguments);
  },
  findIndex(fn, thisArg) {
    return apply(this, "findIndex", fn, thisArg, void 0, arguments);
  },
  findLast(fn, thisArg) {
    return apply(this, "findLast", fn, thisArg, toReactive, arguments);
  },
  findLastIndex(fn, thisArg) {
    return apply(this, "findLastIndex", fn, thisArg, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(fn, thisArg) {
    return apply(this, "forEach", fn, thisArg, void 0, arguments);
  },
  includes(...args) {
    return searchProxy(this, "includes", args);
  },
  indexOf(...args) {
    return searchProxy(this, "indexOf", args);
  },
  join(separator) {
    return reactiveReadArray(this).join(separator);
  },
  // keys() iterator only reads `length`, no optimisation required
  lastIndexOf(...args) {
    return searchProxy(this, "lastIndexOf", args);
  },
  map(fn, thisArg) {
    return apply(this, "map", fn, thisArg, void 0, arguments);
  },
  pop() {
    return noTracking(this, "pop");
  },
  push(...args) {
    return noTracking(this, "push", args);
  },
  reduce(fn, ...args) {
    return reduce(this, "reduce", fn, args);
  },
  reduceRight(fn, ...args) {
    return reduce(this, "reduceRight", fn, args);
  },
  shift() {
    return noTracking(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(fn, thisArg) {
    return apply(this, "some", fn, thisArg, void 0, arguments);
  },
  splice(...args) {
    return noTracking(this, "splice", args);
  },
  toReversed() {
    return reactiveReadArray(this).toReversed();
  },
  toSorted(comparer) {
    return reactiveReadArray(this).toSorted(comparer);
  },
  toSpliced(...args) {
    return reactiveReadArray(this).toSpliced(...args);
  },
  unshift(...args) {
    return noTracking(this, "unshift", args);
  },
  values() {
    return iterator(this, "values", toReactive);
  }
};
function iterator(self2, method, wrapValue) {
  const arr = shallowReadArray(self2);
  const iter = arr[method]();
  if (arr !== self2 && !isShallow(self2)) {
    iter._next = iter.next;
    iter.next = () => {
      const result = iter._next();
      if (result.value) {
        result.value = wrapValue(result.value);
      }
      return result;
    };
  }
  return iter;
}
const arrayProto = Array.prototype;
function apply(self2, method, fn, thisArg, wrappedRetFn, args) {
  const arr = shallowReadArray(self2);
  const needsWrap = arr !== self2 && !isShallow(self2);
  const methodFn = arr[method];
  if (methodFn !== arrayProto[method]) {
    const result2 = methodFn.apply(self2, args);
    return needsWrap ? toReactive(result2) : result2;
  }
  let wrappedFn = fn;
  if (arr !== self2) {
    if (needsWrap) {
      wrappedFn = function(item, index) {
        return fn.call(this, toReactive(item), index, self2);
      };
    } else if (fn.length > 2) {
      wrappedFn = function(item, index) {
        return fn.call(this, item, index, self2);
      };
    }
  }
  const result = methodFn.call(arr, wrappedFn, thisArg);
  return needsWrap && wrappedRetFn ? wrappedRetFn(result) : result;
}
function reduce(self2, method, fn, args) {
  const arr = shallowReadArray(self2);
  let wrappedFn = fn;
  if (arr !== self2) {
    if (!isShallow(self2)) {
      wrappedFn = function(acc, item, index) {
        return fn.call(this, acc, toReactive(item), index, self2);
      };
    } else if (fn.length > 3) {
      wrappedFn = function(acc, item, index) {
        return fn.call(this, acc, item, index, self2);
      };
    }
  }
  return arr[method](wrappedFn, ...args);
}
function searchProxy(self2, method, args) {
  const arr = toRaw(self2);
  track(arr, "iterate", ARRAY_ITERATE_KEY);
  const res = arr[method](...args);
  if ((res === -1 || res === false) && isProxy(args[0])) {
    args[0] = toRaw(args[0]);
    return arr[method](...args);
  }
  return res;
}
function noTracking(self2, method, args = []) {
  startBatch();
  const prevSub = setActiveSub();
  const res = toRaw(self2)[method].apply(self2, args);
  setActiveSub(prevSub);
  endBatch();
  return res;
}
const isNonTrackableKeys = /* @__PURE__ */ makeMap(`__proto__,__v_isRef,__isVue`);
const builtInSymbols = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((key) => key !== "arguments" && key !== "caller").map((key) => Symbol[key]).filter(isSymbol)
);
function hasOwnProperty(key) {
  if (!isSymbol(key))
    key = String(key);
  const obj = toRaw(this);
  track(obj, "has", key);
  return obj.hasOwnProperty(key);
}
class BaseReactiveHandler {
  constructor(_isReadonly = false, _isShallow = false) {
    this._isReadonly = _isReadonly;
    this._isShallow = _isShallow;
  }
  get(target, key, receiver) {
    if (key === "__v_skip")
      return target["__v_skip"];
    const isReadonly2 = this._isReadonly, isShallow2 = this._isShallow;
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_isShallow") {
      return isShallow2;
    } else if (key === "__v_raw") {
      if (receiver === (isReadonly2 ? isShallow2 ? shallowReadonlyMap : readonlyMap : isShallow2 ? shallowReactiveMap : reactiveMap).get(target) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(target) === Object.getPrototypeOf(receiver)) {
        return target;
      }
      return;
    }
    const targetIsArray = isArray$1(target);
    if (!isReadonly2) {
      let fn;
      if (targetIsArray && (fn = arrayInstrumentations[key])) {
        return fn;
      }
      if (key === "hasOwnProperty") {
        return hasOwnProperty;
      }
    }
    const wasRef = isRef(target);
    const res = Reflect.get(
      target,
      key,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      wasRef ? target : receiver
    );
    if (wasRef && key !== "value") {
      return res;
    }
    if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
      return res;
    }
    if (!isReadonly2) {
      track(target, "get", key);
    }
    if (isShallow2) {
      return res;
    }
    if (isRef(res)) {
      return targetIsArray && isIntegerKey(key) ? res : res.value;
    }
    if (isObject(res)) {
      return isReadonly2 ? readonly(res) : reactive(res);
    }
    return res;
  }
}
class MutableReactiveHandler extends BaseReactiveHandler {
  constructor(isShallow2 = false) {
    super(false, isShallow2);
  }
  set(target, key, value, receiver) {
    let oldValue = target[key];
    if (!this._isShallow) {
      const isOldValueReadonly = isReadonly(oldValue);
      if (!isShallow(value) && !isReadonly(value)) {
        oldValue = toRaw(oldValue);
        value = toRaw(value);
      }
      if (!isArray$1(target) && isRef(oldValue) && !isRef(value)) {
        if (isOldValueReadonly) {
          return false;
        } else {
          oldValue.value = value;
          return true;
        }
      }
    }
    const hadKey = isArray$1(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target, key);
    const result = Reflect.set(
      target,
      key,
      value,
      isRef(target) ? target : receiver
    );
    if (target === toRaw(receiver)) {
      if (!hadKey) {
        trigger(target, "add", key, value);
      } else if (hasChanged(value, oldValue)) {
        trigger(target, "set", key, value, oldValue);
      }
    }
    return result;
  }
  deleteProperty(target, key) {
    const hadKey = hasOwn(target, key);
    const oldValue = target[key];
    const result = Reflect.deleteProperty(target, key);
    if (result && hadKey) {
      trigger(target, "delete", key, void 0, oldValue);
    }
    return result;
  }
  has(target, key) {
    const result = Reflect.has(target, key);
    if (!isSymbol(key) || !builtInSymbols.has(key)) {
      track(target, "has", key);
    }
    return result;
  }
  ownKeys(target) {
    track(
      target,
      "iterate",
      isArray$1(target) ? "length" : ITERATE_KEY
    );
    return Reflect.ownKeys(target);
  }
}
class ReadonlyReactiveHandler extends BaseReactiveHandler {
  constructor(isShallow2 = false) {
    super(true, isShallow2);
  }
  set(target, key) {
    {
      warn$2(
        `Set operation on key "${String(key)}" failed: target is readonly.`,
        target
      );
    }
    return true;
  }
  deleteProperty(target, key) {
    {
      warn$2(
        `Delete operation on key "${String(key)}" failed: target is readonly.`,
        target
      );
    }
    return true;
  }
}
const mutableHandlers = /* @__PURE__ */ new MutableReactiveHandler();
const readonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler();
const shallowReadonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler(true);
const toShallow = (value) => value;
const getProto = (v) => Reflect.getPrototypeOf(v);
function createIterableMethod(method, isReadonly2, isShallow2) {
  return function(...args) {
    const target = this["__v_raw"];
    const rawTarget = toRaw(target);
    const targetIsMap = isMap(rawTarget);
    const isPair = method === "entries" || method === Symbol.iterator && targetIsMap;
    const isKeyOnly = method === "keys" && targetIsMap;
    const innerIterator = target[method](...args);
    const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
    !isReadonly2 && track(
      rawTarget,
      "iterate",
      isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY
    );
    return {
      // iterator protocol
      next() {
        const { value, done } = innerIterator.next();
        return done ? { value, done } : {
          value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
          done
        };
      },
      // iterable protocol
      [Symbol.iterator]() {
        return this;
      }
    };
  };
}
function createReadonlyMethod(type) {
  return function(...args) {
    {
      const key = args[0] ? `on key "${args[0]}" ` : ``;
      warn$2(
        `${capitalize(type)} operation ${key}failed: target is readonly.`,
        toRaw(this)
      );
    }
    return type === "delete" ? false : type === "clear" ? void 0 : this;
  };
}
function createInstrumentations(readonly2, shallow) {
  const instrumentations = {
    get(key) {
      const target = this["__v_raw"];
      const rawTarget = toRaw(target);
      const rawKey = toRaw(key);
      if (!readonly2) {
        if (hasChanged(key, rawKey)) {
          track(rawTarget, "get", key);
        }
        track(rawTarget, "get", rawKey);
      }
      const { has } = getProto(rawTarget);
      const wrap = shallow ? toShallow : readonly2 ? toReadonly : toReactive;
      if (has.call(rawTarget, key)) {
        return wrap(target.get(key));
      } else if (has.call(rawTarget, rawKey)) {
        return wrap(target.get(rawKey));
      } else if (target !== rawTarget) {
        target.get(key);
      }
    },
    get size() {
      const target = this["__v_raw"];
      !readonly2 && track(toRaw(target), "iterate", ITERATE_KEY);
      return Reflect.get(target, "size", target);
    },
    has(key) {
      const target = this["__v_raw"];
      const rawTarget = toRaw(target);
      const rawKey = toRaw(key);
      if (!readonly2) {
        if (hasChanged(key, rawKey)) {
          track(rawTarget, "has", key);
        }
        track(rawTarget, "has", rawKey);
      }
      return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
    },
    forEach(callback, thisArg) {
      const observed = this;
      const target = observed["__v_raw"];
      const rawTarget = toRaw(target);
      const wrap = shallow ? toShallow : readonly2 ? toReadonly : toReactive;
      !readonly2 && track(rawTarget, "iterate", ITERATE_KEY);
      return target.forEach((value, key) => {
        return callback.call(thisArg, wrap(value), wrap(key), observed);
      });
    }
  };
  extend(
    instrumentations,
    readonly2 ? {
      add: createReadonlyMethod("add"),
      set: createReadonlyMethod("set"),
      delete: createReadonlyMethod("delete"),
      clear: createReadonlyMethod("clear")
    } : {
      add(value) {
        if (!shallow && !isShallow(value) && !isReadonly(value)) {
          value = toRaw(value);
        }
        const target = toRaw(this);
        const proto = getProto(target);
        const hadKey = proto.has.call(target, value);
        if (!hadKey) {
          target.add(value);
          trigger(target, "add", value, value);
        }
        return this;
      },
      set(key, value) {
        if (!shallow && !isShallow(value) && !isReadonly(value)) {
          value = toRaw(value);
        }
        const target = toRaw(this);
        const { has, get } = getProto(target);
        let hadKey = has.call(target, key);
        if (!hadKey) {
          key = toRaw(key);
          hadKey = has.call(target, key);
        } else {
          checkIdentityKeys(target, has, key);
        }
        const oldValue = get.call(target, key);
        target.set(key, value);
        if (!hadKey) {
          trigger(target, "add", key, value);
        } else if (hasChanged(value, oldValue)) {
          trigger(target, "set", key, value, oldValue);
        }
        return this;
      },
      delete(key) {
        const target = toRaw(this);
        const { has, get } = getProto(target);
        let hadKey = has.call(target, key);
        if (!hadKey) {
          key = toRaw(key);
          hadKey = has.call(target, key);
        } else {
          checkIdentityKeys(target, has, key);
        }
        const oldValue = get ? get.call(target, key) : void 0;
        const result = target.delete(key);
        if (hadKey) {
          trigger(target, "delete", key, void 0, oldValue);
        }
        return result;
      },
      clear() {
        const target = toRaw(this);
        const hadItems = target.size !== 0;
        const oldTarget = isMap(target) ? new Map(target) : new Set(target);
        const result = target.clear();
        if (hadItems) {
          trigger(
            target,
            "clear",
            void 0,
            void 0,
            oldTarget
          );
        }
        return result;
      }
    }
  );
  const iteratorMethods = [
    "keys",
    "values",
    "entries",
    Symbol.iterator
  ];
  iteratorMethods.forEach((method) => {
    instrumentations[method] = createIterableMethod(method, readonly2, shallow);
  });
  return instrumentations;
}
function createInstrumentationGetter(isReadonly2, shallow) {
  const instrumentations = createInstrumentations(isReadonly2, shallow);
  return (target, key, receiver) => {
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_raw") {
      return target;
    }
    return Reflect.get(
      hasOwn(instrumentations, key) && key in target ? instrumentations : target,
      key,
      receiver
    );
  };
}
const mutableCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(false, false)
};
const readonlyCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(true, false)
};
const shallowReadonlyCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(true, true)
};
function checkIdentityKeys(target, has, key) {
  const rawKey = toRaw(key);
  if (rawKey !== key && has.call(target, rawKey)) {
    const type = toRawType(target);
    warn$2(
      `Reactive ${type} contains both the raw and reactive versions of the same object${type === `Map` ? ` as keys` : ``}, which can lead to inconsistencies. Avoid differentiating between the raw and reactive versions of an object and only use the reactive version if possible.`
    );
  }
}
const reactiveMap = /* @__PURE__ */ new WeakMap();
const shallowReactiveMap = /* @__PURE__ */ new WeakMap();
const readonlyMap = /* @__PURE__ */ new WeakMap();
const shallowReadonlyMap = /* @__PURE__ */ new WeakMap();
function targetTypeMap(rawType) {
  switch (rawType) {
    case "Object":
    case "Array":
      return 1;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return 2;
    default:
      return 0;
  }
}
function getTargetType(value) {
  return value["__v_skip"] || !Object.isExtensible(value) ? 0 : targetTypeMap(toRawType(value));
}
function reactive(target) {
  if (isReadonly(target)) {
    return target;
  }
  return createReactiveObject(
    target,
    false,
    mutableHandlers,
    mutableCollectionHandlers,
    reactiveMap
  );
}
function readonly(target) {
  return createReactiveObject(
    target,
    true,
    readonlyHandlers,
    readonlyCollectionHandlers,
    readonlyMap
  );
}
function shallowReadonly(target) {
  return createReactiveObject(
    target,
    true,
    shallowReadonlyHandlers,
    shallowReadonlyCollectionHandlers,
    shallowReadonlyMap
  );
}
function createReactiveObject(target, isReadonly2, baseHandlers, collectionHandlers, proxyMap) {
  if (!isObject(target)) {
    {
      warn$2(
        `value cannot be made ${isReadonly2 ? "readonly" : "reactive"}: ${String(
          target
        )}`
      );
    }
    return target;
  }
  if (target["__v_raw"] && !(isReadonly2 && target["__v_isReactive"])) {
    return target;
  }
  const targetType = getTargetType(target);
  if (targetType === 0) {
    return target;
  }
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  const proxy = new Proxy(
    target,
    targetType === 2 ? collectionHandlers : baseHandlers
  );
  proxyMap.set(target, proxy);
  return proxy;
}
function isReactive(value) {
  if (isReadonly(value)) {
    return isReactive(value["__v_raw"]);
  }
  return !!(value && value["__v_isReactive"]);
}
function isReadonly(value) {
  return !!(value && value["__v_isReadonly"]);
}
function isShallow(value) {
  return !!(value && value["__v_isShallow"]);
}
function isProxy(value) {
  return value ? !!value["__v_raw"] : false;
}
function toRaw(observed) {
  const raw = observed && observed["__v_raw"];
  return raw ? toRaw(raw) : observed;
}
function markRaw(value) {
  if (!hasOwn(value, "__v_skip") && Object.isExtensible(value)) {
    def(value, "__v_skip", true);
  }
  return value;
}
const toReactive = (value) => isObject(value) ? reactive(value) : value;
const toReadonly = (value) => isObject(value) ? readonly(value) : value;
function isRef(r) {
  return r ? r["__v_isRef"] === true : false;
}
function unref(ref2) {
  return isRef(ref2) ? ref2.value : ref2;
}
const shallowUnwrapHandlers = {
  get: (target, key, receiver) => key === "__v_raw" ? target : unref(Reflect.get(target, key, receiver)),
  set: (target, key, value, receiver) => {
    const oldValue = target[key];
    if (isRef(oldValue) && !isRef(value)) {
      oldValue.value = value;
      return true;
    } else {
      return Reflect.set(target, key, value, receiver);
    }
  }
};
function proxyRefs(objectWithRefs) {
  return isReactive(objectWithRefs) ? objectWithRefs : new Proxy(objectWithRefs, shallowUnwrapHandlers);
}
class ReactiveEffect {
  constructor(fn) {
    this.deps = void 0;
    this.depsTail = void 0;
    this.subs = void 0;
    this.subsTail = void 0;
    this.flags = ReactiveFlags$1.Watching | ReactiveFlags$1.Dirty;
    this.cleanups = [];
    this.cleanupsLength = 0;
    if (fn !== void 0) {
      this.fn = fn;
    }
    if (activeEffectScope) {
      link(this, activeEffectScope);
    }
  }
  // @ts-expect-error
  fn() {
  }
  get active() {
    return !(this.flags & 1024);
  }
  pause() {
    this.flags |= 256;
  }
  resume() {
    const flags = this.flags &= -257;
    if (flags & (ReactiveFlags$1.Dirty | ReactiveFlags$1.Pending)) {
      this.notify();
    }
  }
  notify() {
    if (!(this.flags & 256) && this.dirty) {
      this.run();
    }
  }
  run() {
    if (!this.active) {
      return this.fn();
    }
    cleanup(this);
    const prevSub = startTracking(this);
    try {
      return this.fn();
    } finally {
      endTracking(this, prevSub);
      const flags = this.flags;
      if ((flags & (ReactiveFlags$1.Recursed | 128)) === (ReactiveFlags$1.Recursed | 128)) {
        this.flags = flags & ~ReactiveFlags$1.Recursed;
        this.notify();
      }
    }
  }
  stop() {
    if (!this.active) {
      return;
    }
    this.flags = 1024;
    let dep = this.deps;
    while (dep !== void 0) {
      dep = unlink(dep, this);
    }
    const sub = this.subs;
    if (sub !== void 0) {
      unlink(sub);
    }
    cleanup(this);
  }
  get dirty() {
    const flags = this.flags;
    if (flags & ReactiveFlags$1.Dirty) {
      return true;
    }
    if (flags & ReactiveFlags$1.Pending) {
      if (checkDirty(this.deps, this)) {
        this.flags = flags | ReactiveFlags$1.Dirty;
        return true;
      } else {
        this.flags = flags & ~ReactiveFlags$1.Pending;
      }
    }
    return false;
  }
}
{
  setupOnTrigger(ReactiveEffect);
}
function cleanup(sub) {
  const l = sub.cleanupsLength;
  if (l) {
    for (let i = 0; i < l; i++) {
      sub.cleanups[i]();
    }
    sub.cleanupsLength = 0;
  }
}
let activeEffectScope;
function setCurrentScope(scope) {
  try {
    return activeEffectScope;
  } finally {
    activeEffectScope = scope;
  }
}
class ComputedRefImpl {
  constructor(fn, setter) {
    this.fn = fn;
    this.setter = setter;
    this._value = void 0;
    this.subs = void 0;
    this.subsTail = void 0;
    this.deps = void 0;
    this.depsTail = void 0;
    this.flags = ReactiveFlags$1.Mutable | ReactiveFlags$1.Dirty;
    this.__v_isRef = true;
    this["__v_isReadonly"] = !setter;
  }
  // TODO isolatedDeclarations "__v_isReadonly"
  // for backwards compat
  get effect() {
    return this;
  }
  // for backwards compat
  get dep() {
    return this;
  }
  /**
   * @internal
   * for backwards compat
   */
  get _dirty() {
    const flags = this.flags;
    if (flags & ReactiveFlags$1.Dirty) {
      return true;
    }
    if (flags & ReactiveFlags$1.Pending) {
      if (checkDirty(this.deps, this)) {
        this.flags = flags | ReactiveFlags$1.Dirty;
        return true;
      } else {
        this.flags = flags & ~ReactiveFlags$1.Pending;
      }
    }
    return false;
  }
  /**
   * @internal
   * for backwards compat
   */
  set _dirty(v) {
    if (v) {
      this.flags |= ReactiveFlags$1.Dirty;
    } else {
      this.flags &= ~(ReactiveFlags$1.Dirty | ReactiveFlags$1.Pending);
    }
  }
  get value() {
    const flags = this.flags;
    if (flags & ReactiveFlags$1.Dirty || flags & ReactiveFlags$1.Pending && checkDirty(this.deps, this)) {
      if (this.update()) {
        const subs = this.subs;
        if (subs !== void 0) {
          shallowPropagate(subs);
        }
      }
    } else if (flags & ReactiveFlags$1.Pending) {
      this.flags = flags & ~ReactiveFlags$1.Pending;
    }
    if (activeSub !== void 0) {
      {
        onTrack(activeSub, {
          target: this,
          type: "get",
          key: "value"
        });
      }
      link(this, activeSub);
    } else if (activeEffectScope !== void 0) {
      link(this, activeEffectScope);
    }
    return this._value;
  }
  set value(newValue) {
    if (this.setter) {
      this.setter(newValue);
    } else {
      warn$2("Write operation failed: computed value is readonly");
    }
  }
  update() {
    const prevSub = startTracking(this);
    try {
      const oldValue = this._value;
      const newValue = this.fn(oldValue);
      if (hasChanged(oldValue, newValue)) {
        this._value = newValue;
        return true;
      }
      return false;
    } finally {
      endTracking(this, prevSub);
    }
  }
}
{
  setupOnTrigger(ComputedRefImpl);
}
const INITIAL_WATCHER_VALUE = {};
let activeWatcher = void 0;
function onWatcherCleanup(cleanupFn, failSilently = false, owner = activeWatcher) {
  if (owner) {
    const { call } = owner.options;
    if (call) {
      owner.cleanups[owner.cleanupsLength++] = () => call(cleanupFn, 4);
    } else {
      owner.cleanups[owner.cleanupsLength++] = cleanupFn;
    }
  } else if (!failSilently) {
    warn$2(
      `onWatcherCleanup() was called when there was no active watcher to associate with.`
    );
  }
}
class WatcherEffect extends ReactiveEffect {
  constructor(source, cb, options = EMPTY_OBJ) {
    const { deep, once, call, onWarn } = options;
    let getter;
    let forceTrigger = false;
    let isMultiSource = false;
    if (isRef(source)) {
      getter = () => source.value;
      forceTrigger = isShallow(source);
    } else if (isReactive(source)) {
      getter = () => reactiveGetter(source, deep);
      forceTrigger = true;
    } else if (isArray$1(source)) {
      isMultiSource = true;
      forceTrigger = source.some((s) => isReactive(s) || isShallow(s));
      getter = () => source.map((s) => {
        if (isRef(s)) {
          return s.value;
        } else if (isReactive(s)) {
          return reactiveGetter(s, deep);
        } else if (isFunction(s)) {
          return call ? call(s, 2) : s();
        } else {
          warnInvalidSource(s, onWarn);
        }
      });
    } else if (isFunction(source)) {
      if (cb) {
        getter = call ? () => call(source, 2) : source;
      } else {
        getter = () => {
          if (this.cleanupsLength) {
            const prevSub = setActiveSub();
            try {
              cleanup(this);
            } finally {
              setActiveSub(prevSub);
            }
          }
          const currentEffect = activeWatcher;
          activeWatcher = this;
          try {
            return call ? call(source, 3, [
              this.boundCleanup
            ]) : source(this.boundCleanup);
          } finally {
            activeWatcher = currentEffect;
          }
        };
      }
    } else {
      getter = NOOP;
      warnInvalidSource(source, onWarn);
    }
    if (cb && deep) {
      const baseGetter = getter;
      const depth = deep === true ? Infinity : deep;
      getter = () => traverse(baseGetter(), depth);
    }
    super(getter);
    this.cb = cb;
    this.options = options;
    this.boundCleanup = (fn) => onWatcherCleanup(fn, false, this);
    this.forceTrigger = forceTrigger;
    this.isMultiSource = isMultiSource;
    if (once && cb) {
      const _cb = cb;
      cb = (...args) => {
        _cb(...args);
        this.stop();
      };
    }
    this.cb = cb;
    this.oldValue = isMultiSource ? new Array(source.length).fill(INITIAL_WATCHER_VALUE) : INITIAL_WATCHER_VALUE;
    {
      this.onTrack = options.onTrack;
      this.onTrigger = options.onTrigger;
    }
  }
  run(initialRun = false) {
    const oldValue = this.oldValue;
    const newValue = this.oldValue = super.run();
    if (!this.cb) {
      return;
    }
    const { immediate, deep, call } = this.options;
    if (initialRun && !immediate) {
      return;
    }
    if (deep || this.forceTrigger || (this.isMultiSource ? newValue.some((v, i) => hasChanged(v, oldValue[i])) : hasChanged(newValue, oldValue))) {
      cleanup(this);
      const currentWatcher = activeWatcher;
      activeWatcher = this;
      try {
        const args = [
          newValue,
          // pass undefined as the old value when it's changed for the first time
          oldValue === INITIAL_WATCHER_VALUE ? void 0 : this.isMultiSource && oldValue[0] === INITIAL_WATCHER_VALUE ? [] : oldValue,
          this.boundCleanup
        ];
        call ? call(this.cb, 3, args) : (
          // @ts-expect-error
          this.cb(...args)
        );
      } finally {
        activeWatcher = currentWatcher;
      }
    }
  }
}
function reactiveGetter(source, deep) {
  if (deep)
    return source;
  if (isShallow(source) || deep === false || deep === 0)
    return traverse(source, 1);
  return traverse(source);
}
function warnInvalidSource(s, onWarn) {
  (onWarn || warn$2)(
    `Invalid watch source: `,
    s,
    `A watch source can only be a getter/effect function, a ref, a reactive object, or an array of these types.`
  );
}
function traverse(value, depth = Infinity, seen) {
  if (depth <= 0 || !isObject(value) || value["__v_skip"]) {
    return value;
  }
  seen = seen || /* @__PURE__ */ new Set();
  if (seen.has(value)) {
    return value;
  }
  seen.add(value);
  depth--;
  if (isRef(value)) {
    traverse(value.value, depth, seen);
  } else if (isArray$1(value)) {
    for (let i = 0; i < value.length; i++) {
      traverse(value[i], depth, seen);
    }
  } else if (isSet(value) || isMap(value)) {
    value.forEach((v) => {
      traverse(v, depth, seen);
    });
  } else if (isPlainObject(value)) {
    for (const key in value) {
      traverse(value[key], depth, seen);
    }
    for (const key of Object.getOwnPropertySymbols(value)) {
      if (Object.prototype.propertyIsEnumerable.call(value, key)) {
        traverse(value[key], depth, seen);
      }
    }
  }
  return value;
}
function finallyConstructor(callback) {
  var constructor = this.constructor;
  return this.then(
    function(value) {
      return constructor.resolve(callback()).then(function() {
        return value;
      });
    },
    function(reason) {
      return constructor.resolve(callback()).then(function() {
        return constructor.reject(reason);
      });
    }
  );
}
function allSettled(arr) {
  var P = this;
  return new P(function(resolve2, reject2) {
    if (!(arr && typeof arr.length !== "undefined")) {
      return reject2(
        new TypeError(
          typeof arr + " " + arr + " is not iterable(cannot read property Symbol(Symbol.iterator))"
        )
      );
    }
    var args = Array.prototype.slice.call(arr);
    if (args.length === 0)
      return resolve2([]);
    var remaining = args.length;
    function res(i2, val) {
      if (val && (typeof val === "object" || typeof val === "function")) {
        var then = val.then;
        if (typeof then === "function") {
          then.call(
            val,
            function(val2) {
              res(i2, val2);
            },
            function(e) {
              args[i2] = { status: "rejected", reason: e };
              if (--remaining === 0) {
                resolve2(args);
              }
            }
          );
          return;
        }
      }
      args[i2] = { status: "fulfilled", value: val };
      if (--remaining === 0) {
        resolve2(args);
      }
    }
    for (var i = 0; i < args.length; i++) {
      res(i, args[i]);
    }
  });
}
function AggregateError(errors, message) {
  this.name = "AggregateError", this.errors = errors;
  this.message = message || "";
}
AggregateError.prototype = Error.prototype;
function any(arr) {
  var P = this;
  return new P(function(resolve2, reject2) {
    if (!(arr && typeof arr.length !== "undefined")) {
      return reject2(new TypeError("Promise.any accepts an array"));
    }
    var args = Array.prototype.slice.call(arr);
    if (args.length === 0)
      return reject2();
    var rejectionReasons = [];
    for (var i = 0; i < args.length; i++) {
      try {
        P.resolve(args[i]).then(resolve2).catch(function(error) {
          rejectionReasons.push(error);
          if (rejectionReasons.length === args.length) {
            reject2(
              new AggregateError(
                rejectionReasons,
                "All promises were rejected"
              )
            );
          }
        });
      } catch (ex) {
        reject2(ex);
      }
    }
  });
}
var setTimeoutFunc = setTimeout;
function isArray(x) {
  return Boolean(x && typeof x.length !== "undefined");
}
function noop() {
}
function bind(fn, thisArg) {
  return function() {
    fn.apply(thisArg, arguments);
  };
}
function Promise$1(fn) {
  if (!(this instanceof Promise$1))
    throw new TypeError("Promises must be constructed via new");
  if (typeof fn !== "function")
    throw new TypeError("not a function");
  this._state = 0;
  this._handled = false;
  this._value = void 0;
  this._deferreds = [];
  doResolve(fn, this);
}
function handle(self2, deferred) {
  while (self2._state === 3) {
    self2 = self2._value;
  }
  if (self2._state === 0) {
    self2._deferreds.push(deferred);
    return;
  }
  self2._handled = true;
  Promise$1._immediateFn(function() {
    var cb = self2._state === 1 ? deferred.onFulfilled : deferred.onRejected;
    if (cb === null) {
      (self2._state === 1 ? resolve : reject)(deferred.promise, self2._value);
      return;
    }
    var ret;
    try {
      ret = cb(self2._value);
    } catch (e) {
      reject(deferred.promise, e);
      return;
    }
    resolve(deferred.promise, ret);
  });
}
function resolve(self2, newValue) {
  try {
    if (newValue === self2)
      throw new TypeError("A promise cannot be resolved with itself.");
    if (newValue && (typeof newValue === "object" || typeof newValue === "function")) {
      var then = newValue.then;
      if (newValue instanceof Promise$1) {
        self2._state = 3;
        self2._value = newValue;
        finale(self2);
        return;
      } else if (typeof then === "function") {
        doResolve(bind(then, newValue), self2);
        return;
      }
    }
    self2._state = 1;
    self2._value = newValue;
    finale(self2);
  } catch (e) {
    reject(self2, e);
  }
}
function reject(self2, newValue) {
  self2._state = 2;
  self2._value = newValue;
  finale(self2);
}
function finale(self2) {
  if (self2._state === 2 && self2._deferreds.length === 0) {
    Promise$1._immediateFn(function() {
      if (!self2._handled) {
        Promise$1._unhandledRejectionFn(self2._value);
      }
    });
  }
  for (var i = 0, len = self2._deferreds.length; i < len; i++) {
    handle(self2, self2._deferreds[i]);
  }
  self2._deferreds = null;
}
function Handler(onFulfilled, onRejected, promise) {
  this.onFulfilled = typeof onFulfilled === "function" ? onFulfilled : null;
  this.onRejected = typeof onRejected === "function" ? onRejected : null;
  this.promise = promise;
}
function doResolve(fn, self2) {
  var done = false;
  try {
    fn(
      function(value) {
        if (done)
          return;
        done = true;
        resolve(self2, value);
      },
      function(reason) {
        if (done)
          return;
        done = true;
        reject(self2, reason);
      }
    );
  } catch (ex) {
    if (done)
      return;
    done = true;
    reject(self2, ex);
  }
}
Promise$1.prototype["catch"] = function(onRejected) {
  return this.then(null, onRejected);
};
Promise$1.prototype.then = function(onFulfilled, onRejected) {
  var prom = new this.constructor(noop);
  handle(this, new Handler(onFulfilled, onRejected, prom));
  return prom;
};
Promise$1.prototype["finally"] = finallyConstructor;
Promise$1.all = function(arr) {
  return new Promise$1(function(resolve2, reject2) {
    if (!isArray(arr)) {
      return reject2(new TypeError("Promise.all accepts an array"));
    }
    var args = Array.prototype.slice.call(arr);
    if (args.length === 0)
      return resolve2([]);
    var remaining = args.length;
    function res(i2, val) {
      try {
        if (val && (typeof val === "object" || typeof val === "function")) {
          var then = val.then;
          if (typeof then === "function") {
            then.call(
              val,
              function(val2) {
                res(i2, val2);
              },
              reject2
            );
            return;
          }
        }
        args[i2] = val;
        if (--remaining === 0) {
          resolve2(args);
        }
      } catch (ex) {
        reject2(ex);
      }
    }
    for (var i = 0; i < args.length; i++) {
      res(i, args[i]);
    }
  });
};
Promise$1.any = any;
Promise$1.allSettled = allSettled;
Promise$1.resolve = function(value) {
  if (value && typeof value === "object" && value.constructor === Promise$1) {
    return value;
  }
  return new Promise$1(function(resolve2) {
    resolve2(value);
  });
};
Promise$1.reject = function(value) {
  return new Promise$1(function(resolve2, reject2) {
    reject2(value);
  });
};
Promise$1.race = function(arr) {
  return new Promise$1(function(resolve2, reject2) {
    if (!isArray(arr)) {
      return reject2(new TypeError("Promise.race accepts an array"));
    }
    for (var i = 0, len = arr.length; i < len; i++) {
      Promise$1.resolve(arr[i]).then(resolve2, reject2);
    }
  });
};
Promise$1._immediateFn = // @ts-ignore
typeof setImmediate === "function" && function(fn) {
  setImmediate(fn);
} || function(fn) {
  setTimeoutFunc(fn, 0);
};
Promise$1._unhandledRejectionFn = function _unhandledRejectionFn(err) {
  if (typeof console !== "undefined" && console) {
    console.warn("Possible Unhandled Promise Rejection:", err);
  }
};
/**
* @vue/runtime-core v3.6.0-alpha.2
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
const stack = [];
function pushWarningContext(ctx) {
  stack.push(ctx);
}
function popWarningContext() {
  stack.pop();
}
let isWarning = false;
function warn$1(msg, ...args) {
  if (isWarning)
    return;
  isWarning = true;
  const prevSub = setActiveSub();
  const entry = stack.length ? stack[stack.length - 1] : null;
  const instance = isVNode(entry) ? entry.component : entry;
  const appWarnHandler = instance && instance.appContext.config.warnHandler;
  const trace = getComponentTrace();
  if (appWarnHandler) {
    callWithErrorHandling(
      appWarnHandler,
      instance,
      11,
      [
        // eslint-disable-next-line no-restricted-syntax
        msg + args.map((a) => {
          var _a, _b;
          return (_b = (_a = a.toString) == null ? void 0 : _a.call(a)) != null ? _b : JSON.stringify(a);
        }).join(""),
        instance && instance.proxy || instance,
        trace.map(
          ({ ctx }) => `at <${formatComponentName(instance, ctx.type)}>`
        ).join("\n"),
        trace
      ]
    );
  } else {
    const warnArgs = [`[Vue warn]: ${msg}`, ...args];
    if (trace.length && // avoid spamming console during tests
    true) {
      warnArgs.push(`
`, ...formatTrace(trace));
    }
    console.warn(...warnArgs);
  }
  setActiveSub(prevSub);
  isWarning = false;
}
function getComponentTrace() {
  let currentCtx = stack[stack.length - 1];
  if (!currentCtx) {
    return [];
  }
  const normalizedStack = [];
  while (currentCtx) {
    const last = normalizedStack[0];
    if (last && last.ctx === currentCtx) {
      last.recurseCount++;
    } else {
      normalizedStack.push({
        ctx: currentCtx,
        recurseCount: 0
      });
    }
    if (isVNode(currentCtx)) {
      const parent = currentCtx.component && currentCtx.component.parent;
      currentCtx = parent && parent.vnode || parent;
    } else {
      currentCtx = currentCtx.parent;
    }
  }
  return normalizedStack;
}
function formatTrace(trace) {
  const logs = [];
  trace.forEach((entry, i) => {
    logs.push(...i === 0 ? [] : [`
`], ...formatTraceEntry(entry));
  });
  return logs;
}
function formatTraceEntry({ ctx, recurseCount }) {
  const postfix = recurseCount > 0 ? `... (${recurseCount} recursive calls)` : ``;
  const instance = isVNode(ctx) ? ctx.component : ctx;
  const isRoot = instance ? instance.parent == null : false;
  const open = ` at <${formatComponentName(instance, ctx.type, isRoot)}`;
  const close = `>` + postfix;
  return ctx.props ? [open, ...formatProps(ctx.props), close] : [open + close];
}
function formatProps(props) {
  const res = [];
  const keys = Object.keys(props);
  keys.slice(0, 3).forEach((key) => {
    res.push(...formatProp(key, props[key]));
  });
  if (keys.length > 3) {
    res.push(` ...`);
  }
  return res;
}
function formatProp(key, value, raw) {
  if (isString(value)) {
    value = JSON.stringify(value);
    return raw ? value : [`${key}=${value}`];
  } else if (typeof value === "number" || typeof value === "boolean" || value == null) {
    return raw ? value : [`${key}=${value}`];
  } else if (isRef(value)) {
    value = formatProp(key, toRaw(value.value), true);
    return raw ? value : [`${key}=Ref<`, value, `>`];
  } else if (isFunction(value)) {
    return [`${key}=fn${value.name ? `<${value.name}>` : ``}`];
  } else {
    value = toRaw(value);
    return raw ? value : [`${key}=`, value];
  }
}
const ErrorTypeStrings$1 = {
  ["sp"]: "serverPrefetch hook",
  ["bc"]: "beforeCreate hook",
  ["c"]: "created hook",
  ["bm"]: "beforeMount hook",
  ["m"]: "mounted hook",
  ["bu"]: "beforeUpdate hook",
  ["u"]: "updated",
  ["bum"]: "beforeUnmount hook",
  ["um"]: "unmounted hook",
  ["a"]: "activated hook",
  ["da"]: "deactivated hook",
  ["ec"]: "errorCaptured hook",
  ["rtc"]: "renderTracked hook",
  ["rtg"]: "renderTriggered hook",
  [0]: "setup function",
  [1]: "render function",
  [2]: "watcher getter",
  [3]: "watcher callback",
  [4]: "watcher cleanup function",
  [5]: "native event handler",
  [6]: "component event handler",
  [7]: "vnode hook",
  [8]: "directive hook",
  [9]: "transition hook",
  [10]: "app errorHandler",
  [11]: "app warnHandler",
  [12]: "ref function",
  [13]: "async component loader",
  [14]: "scheduler flush",
  [15]: "component update",
  [16]: "app unmount cleanup function"
};
function callWithErrorHandling(fn, instance, type, args) {
  try {
    return args ? fn(...args) : fn();
  } catch (err) {
    handleError(err, instance, type);
  }
}
function callWithAsyncErrorHandling(fn, instance, type, args) {
  if (isFunction(fn)) {
    const res = callWithErrorHandling(fn, instance, type, args);
    if (res && isPromise(res)) {
      res.catch((err) => {
        handleError(err, instance, type);
      });
    }
    return res;
  }
  if (isArray$1(fn)) {
    const values = [];
    for (let i = 0; i < fn.length; i++) {
      values.push(callWithAsyncErrorHandling(fn[i], instance, type, args));
    }
    return values;
  } else {
    warn$1(
      `Invalid value type passed to callWithAsyncErrorHandling(): ${typeof fn}`
    );
  }
}
function handleError(err, instance, type, throwInDev = true) {
  const { errorHandler, throwUnhandledErrorInProduction } = instance && instance.appContext.config || EMPTY_OBJ;
  if (instance) {
    let cur = instance.parent;
    const exposedInstance = instance.proxy || instance;
    const errorInfo = ErrorTypeStrings$1[type] || type;
    while (cur) {
      const errorCapturedHooks = cur.ec;
      if (errorCapturedHooks) {
        for (let i = 0; i < errorCapturedHooks.length; i++) {
          if (errorCapturedHooks[i](err, exposedInstance, errorInfo) === false) {
            return;
          }
        }
      }
      cur = cur.parent;
    }
    if (errorHandler) {
      const prevSub = setActiveSub();
      callWithErrorHandling(errorHandler, null, 10, [
        err,
        exposedInstance,
        errorInfo
      ]);
      setActiveSub(prevSub);
      return;
    }
  }
  logError(err, type, instance, throwInDev, throwUnhandledErrorInProduction);
}
function logError(err, type, instance, throwInDev = true, throwInProd = false) {
  {
    const info = ErrorTypeStrings$1[type] || type;
    if (instance) {
      pushWarningContext(instance);
    }
    warn$1(`Unhandled error${info ? ` during execution of ${info}` : ``}`);
    if (instance) {
      popWarningContext();
    }
    if (err instanceof Error) {
      console.error(
        `---BEGIN:EXCEPTION---${err.message}
${err.stack || ""}---END:EXCEPTION---`
      );
    } else {
      console.error(err);
    }
  }
}
const jobs = [];
let postJobs = [];
let activePostJobs = null;
let currentFlushPromise = null;
let jobsLength = 0;
let flushIndex = 0;
let postFlushIndex = 0;
const resolvedPromise = /* @__PURE__ */ Promise$1.resolve();
const RECURSION_LIMIT = 100;
function nextTick(fn, instance = getCurrentGenericInstance()) {
  const promise = currentFlushPromise || resolvedPromise;
  const current = currentFlushPromise === null || instance === null ? promise : promise.then(() => {
    return new Promise((resolve2) => {
      if (instance === null) {
        resolve2();
      } else {
        instance.$waitNativeRender(() => {
          resolve2();
        });
      }
    });
  });
  return fn ? current.then(this ? fn.bind(this) : fn) : current;
}
function findInsertionIndex(order, queue, start, end) {
  while (start < end) {
    const middle = start + end >>> 1;
    if (queue[middle].order <= order) {
      start = middle + 1;
    } else {
      end = middle;
    }
  }
  return start;
}
function queueJob(job, id, isPre = false) {
  if (queueJobWorker(
    job,
    id === void 0 ? isPre ? -2 : Infinity : isPre ? id * 2 : id * 2 + 1,
    jobs,
    jobsLength,
    flushIndex
  )) {
    jobsLength++;
    queueFlush();
  }
}
function queueJobWorker(job, order, queue, length, flushIndex2) {
  const flags = job.flags;
  if (!(flags & 1)) {
    job.flags = flags | 1;
    job.order = order;
    if (flushIndex2 === length || // fast path when the job id is larger than the tail
    order >= queue[length - 1].order) {
      queue[length] = job;
    } else {
      queue.splice(findInsertionIndex(order, queue, flushIndex2, length), 0, job);
    }
    return true;
  }
  return false;
}
const doFlushJobs = () => {
  try {
    flushJobs();
  } catch (e) {
    currentFlushPromise = null;
    throw e;
  }
};
function queueFlush() {
  if (!currentFlushPromise) {
    currentFlushPromise = resolvedPromise.then(doFlushJobs);
  }
}
function queuePostFlushCb(jobs2, id = Infinity) {
  if (!isArray$1(jobs2)) {
    if (activePostJobs && id === -1) {
      activePostJobs.splice(postFlushIndex, 0, jobs2);
    } else {
      queueJobWorker(jobs2, id, postJobs, postJobs.length, 0);
    }
  } else {
    for (const job of jobs2) {
      queueJobWorker(job, id, postJobs, postJobs.length, 0);
    }
  }
  queueFlush();
}
function flushPostFlushCbs(seen) {
  if (postJobs.length) {
    if (activePostJobs) {
      activePostJobs.push(...postJobs);
      postJobs.length = 0;
      return;
    }
    activePostJobs = postJobs;
    postJobs = [];
    {
      seen = seen || /* @__PURE__ */ new Map();
    }
    while (postFlushIndex < activePostJobs.length) {
      const cb = activePostJobs[postFlushIndex++];
      if (checkRecursiveUpdates(seen, cb)) {
        continue;
      }
      if (cb.flags & 2) {
        cb.flags &= -2;
      }
      if (!(cb.flags & 4)) {
        try {
          cb();
        } finally {
          cb.flags &= -2;
        }
      }
    }
    activePostJobs = null;
    postFlushIndex = 0;
  }
}
function flushJobs(seen) {
  {
    seen || (seen = /* @__PURE__ */ new Map());
  }
  try {
    while (flushIndex < jobsLength) {
      const job = jobs[flushIndex];
      jobs[flushIndex++] = void 0;
      if (!(job.flags & 4)) {
        if (checkRecursiveUpdates(seen, job)) {
          continue;
        }
        if (job.flags & 2) {
          job.flags &= ~1;
        }
        try {
          job();
        } catch (err) {
          handleError(
            err,
            job.i,
            job.i ? 15 : 14
          );
        } finally {
          if (!(job.flags & 2)) {
            job.flags &= ~1;
          }
        }
      }
    }
  } finally {
    while (flushIndex < jobsLength) {
      jobs[flushIndex].flags &= -2;
      jobs[flushIndex++] = void 0;
    }
    flushIndex = 0;
    jobsLength = 0;
    flushPostFlushCbs(seen);
    currentFlushPromise = null;
    if (jobsLength || postJobs.length) {
      flushJobs(seen);
    }
  }
}
function checkRecursiveUpdates(seen, fn) {
  const count = seen.get(fn) || 0;
  if (count > RECURSION_LIMIT) {
    const instance = fn.i;
    const componentName = instance && getComponentName(instance.type);
    handleError(
      `Maximum recursive updates exceeded${componentName ? ` in component <${componentName}>` : ``}. This means you have a reactive effect that is mutating its own dependencies and thus recursively triggering itself. Possible sources include component template, render function, updated hook or watcher source function.`,
      null,
      10
    );
    return true;
  }
  seen.set(fn, count + 1);
  return false;
}
const hmrDirtyComponents = /* @__PURE__ */ new Map();
{
  getGlobalThis().__VUE_HMR_RUNTIME__ = {
    createRecord: tryWrap(createRecord),
    rerender: tryWrap(rerender),
    reload: tryWrap(reload)
  };
}
const map = /* @__PURE__ */ new Map();
function createRecord(id, initialDef) {
  if (map.has(id)) {
    return false;
  }
  map.set(id, {
    initialDef: normalizeClassComponent(initialDef),
    instances: /* @__PURE__ */ new Set()
  });
  return true;
}
function normalizeClassComponent(component) {
  return isClassComponent(component) ? component.__vccOpts : component;
}
function rerender(id, newRender) {
  const record = map.get(id);
  if (!record) {
    return;
  }
  record.initialDef.render = newRender;
  [...record.instances].forEach((instance) => {
    if (newRender) {
      instance.render = newRender;
      normalizeClassComponent(instance.type).render = newRender;
    }
    if (instance.vapor) {
      instance.hmrRerender();
    } else {
      const i = instance;
      i.renderCache = [];
      i.effect.run();
    }
    nextTick(() => {
    });
  });
}
function reload(id, newComp) {
  const record = map.get(id);
  if (!record)
    return;
  newComp = normalizeClassComponent(newComp);
  updateComponentDef(record.initialDef, newComp);
  const instances = [...record.instances];
  if (newComp.__vapor) {
    for (const instance of instances) {
      instance.hmrReload(newComp);
    }
  } else {
    for (const instance of instances) {
      const oldComp = normalizeClassComponent(instance.type);
      let dirtyInstances = hmrDirtyComponents.get(oldComp);
      if (!dirtyInstances) {
        if (oldComp !== record.initialDef) {
          updateComponentDef(oldComp, newComp);
        }
        hmrDirtyComponents.set(oldComp, dirtyInstances = /* @__PURE__ */ new Set());
      }
      dirtyInstances.add(instance);
      instance.appContext.propsCache.delete(instance.type);
      instance.appContext.emitsCache.delete(instance.type);
      instance.appContext.optionsCache.delete(instance.type);
      if (instance.ceReload) {
        dirtyInstances.add(instance);
        instance.ceReload(newComp.styles);
        dirtyInstances.delete(instance);
      } else if (instance.parent) {
        queueJob(() => {
          const parent = instance.parent;
          if (parent.vapor) {
            parent.hmrRerender();
          } else {
            parent.effect.run();
          }
          nextTick(() => {
          });
          dirtyInstances.delete(instance);
        });
      } else if (instance.appContext.reload) {
        instance.appContext.reload();
      } else if (typeof window !== "undefined") {
        window.location.reload();
      } else {
        console.warn(
          "[HMR] Root or manually mounted instance modified. Full reload required."
        );
      }
      if (instance.root.ce && instance !== instance.root) {
        instance.root.ce._removeChildStyle(oldComp);
      }
    }
  }
  queuePostFlushCb(() => {
    hmrDirtyComponents.clear();
  });
}
function updateComponentDef(oldComp, newComp) {
  extend(oldComp, newComp);
  for (const key in oldComp) {
    if (key !== "__file" && !(key in newComp)) {
      delete oldComp[key];
    }
  }
}
function tryWrap(fn) {
  return (id, arg) => {
    try {
      return fn(id, arg);
    } catch (e) {
      console.error(e);
      console.warn(
        `[HMR] Something went wrong during Vue component hot-reload. Full reload required.`
      );
    }
  };
}
let currentRenderingInstance = null;
getGlobalThis().requestIdleCallback || ((cb) => setTimeout(cb, 1));
getGlobalThis().cancelIdleCallback || ((id) => clearTimeout(id));
const getPublicInstance = (i) => {
  if (!i)
    return null;
  if (i.vapor || isStatefulComponent(i))
    return getComponentPublicInstance(i);
  return getPublicInstance(i.parent);
};
const publicPropertiesMap = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ extend(/* @__PURE__ */ Object.create(null), {
    $: (i) => i,
    $el: (i) => {
      if (i.vapor) {
        if (i.block instanceof Node) {
          return i.block;
        }
        return null;
      }
      return i.vnode.el;
    },
    $data: (i) => i.data,
    $props: (i) => shallowReadonly(i.props),
    $attrs: (i) => shallowReadonly(i.attrs),
    $slots: (i) => shallowReadonly(i.slots),
    $refs: (i) => shallowReadonly(i.refs),
    $parent: (i) => getPublicInstance(i.parent),
    $root: (i) => getPublicInstance(i.root),
    $host: (i) => i.ce,
    $emit: (i) => i.emit,
    $options: (i) => resolveMergedOptions(i),
    $forceUpdate: (i) => i.f || (i.f = () => {
      queueJob(i.update);
    }),
    // fixed by xxxxxx
    // $nextTick: i => i.n || (i.n = nextTick.bind(i.proxy!)),
    $nextTick: (i) => i.n || (i.n = (fn) => nextTick.bind(i.proxy)(fn, i)),
    $watch: (i) => instanceWatch.bind(i)
  })
);
publicPropertiesMap.$callMethod = (i) => {
  return (methodName, ...args) => {
    const proxy = getComponentPublicInstance(i) || i.proxy;
    if (!proxy) {
      return null;
    }
    const method = proxy[methodName];
    if (method) {
      return method(...args);
    }
    console.error(`method ${methodName} not found`);
    return null;
  };
};
const PublicInstanceProxyHandlers = {};
{
  PublicInstanceProxyHandlers.ownKeys = (target) => {
    warn$1(
      `Avoid app logic that relies on enumerating keys on a component instance. The keys will be empty in production mode to avoid performance overhead.`
    );
    return Reflect.ownKeys(target);
  };
}
function normalizePropsOrEmits(props) {
  return isArray$1(props) ? props.reduce(
    (normalized, p2) => (normalized[p2] = null, normalized),
    {}
  ) : props;
}
function resolveMergedOptions(instance) {
  const base = instance.type;
  const { mixins, extends: extendsOptions } = base;
  const {
    mixins: globalMixins,
    optionsCache: cache,
    config: { optionMergeStrategies }
  } = instance.appContext;
  const cached = cache.get(base);
  let resolved;
  if (cached) {
    resolved = cached;
  } else if (!globalMixins.length && !mixins && !extendsOptions) {
    {
      resolved = base;
    }
  } else {
    resolved = {};
    if (globalMixins.length) {
      globalMixins.forEach(
        (m) => mergeOptions(resolved, m, optionMergeStrategies, true)
      );
    }
    mergeOptions(resolved, base, optionMergeStrategies);
  }
  if (isObject(base)) {
    cache.set(base, resolved);
  }
  return resolved;
}
function mergeOptions(to, from, strats, asMixin = false) {
  const { mixins, extends: extendsOptions } = from;
  if (extendsOptions) {
    mergeOptions(to, extendsOptions, strats, true);
  }
  if (mixins) {
    mixins.forEach(
      (m) => mergeOptions(to, m, strats, true)
    );
  }
  for (const key in from) {
    if (asMixin && key === "expose") {
      warn$1(
        `"expose" option is ignored when declared in mixins or extends. It should only be declared in the base component itself.`
      );
    } else {
      const strat = internalOptionMergeStrats[key] || strats && strats[key];
      to[key] = strat ? strat(to[key], from[key]) : from[key];
    }
  }
  return to;
}
const internalOptionMergeStrats = {
  data: mergeDataFn,
  props: mergeEmitsOrPropsOptions,
  emits: mergeEmitsOrPropsOptions,
  // objects
  methods: mergeObjectOptions,
  computed: mergeObjectOptions,
  // lifecycle
  beforeCreate: mergeAsArray,
  created: mergeAsArray,
  beforeMount: mergeAsArray,
  mounted: mergeAsArray,
  beforeUpdate: mergeAsArray,
  updated: mergeAsArray,
  beforeDestroy: mergeAsArray,
  beforeUnmount: mergeAsArray,
  destroyed: mergeAsArray,
  unmounted: mergeAsArray,
  activated: mergeAsArray,
  deactivated: mergeAsArray,
  errorCaptured: mergeAsArray,
  serverPrefetch: mergeAsArray,
  // assets
  components: mergeObjectOptions,
  directives: mergeObjectOptions,
  // watch
  watch: mergeWatchOptions,
  // provide / inject
  provide: mergeDataFn,
  inject: mergeInject
};
function mergeDataFn(to, from) {
  if (!from) {
    return to;
  }
  if (!to) {
    return from;
  }
  return function mergedDataFn() {
    return extend(
      isFunction(to) ? to.call(this, this) : to,
      isFunction(from) ? from.call(this, this) : from
    );
  };
}
function mergeInject(to, from) {
  return mergeObjectOptions(normalizeInject(to), normalizeInject(from));
}
function normalizeInject(raw) {
  if (isArray$1(raw)) {
    const res = {};
    for (let i = 0; i < raw.length; i++) {
      res[raw[i]] = raw[i];
    }
    return res;
  }
  return raw;
}
function mergeAsArray(to, from) {
  return to ? [...new Set([].concat(to, from))] : from;
}
function mergeObjectOptions(to, from) {
  return to ? extend(/* @__PURE__ */ Object.create(null), to, from) : from;
}
function mergeEmitsOrPropsOptions(to, from) {
  if (to) {
    if (isArray$1(to) && isArray$1(from)) {
      return [.../* @__PURE__ */ new Set([...to, ...from])];
    }
    return extend(
      /* @__PURE__ */ Object.create(null),
      normalizePropsOrEmits(to),
      normalizePropsOrEmits(from != null ? from : {})
    );
  } else {
    return from;
  }
}
function mergeWatchOptions(to, from) {
  if (!to)
    return from;
  if (!from)
    return to;
  const merged = extend(/* @__PURE__ */ Object.create(null), to);
  for (const key in from) {
    merged[key] = mergeAsArray(to[key], from[key]);
  }
  return merged;
}
const queuePostRenderEffect = queueEffectWithSuspense;
class RenderWatcherEffect extends WatcherEffect {
  constructor(instance, source, cb, options, flush2) {
    super(source, cb, options);
    this.flush = flush2;
    const job = () => {
      if (this.dirty) {
        this.run();
      }
    };
    if (cb) {
      this.flags |= 128;
      job.flags |= 2;
    }
    if (instance) {
      job.i = instance;
    }
    this.job = job;
  }
  notify() {
    const flags = this.flags;
    if (!(flags & 256)) {
      const flush2 = this.flush;
      const job = this.job;
      if (flush2 === "post") {
        queuePostRenderEffect(job, void 0, job.i ? job.i.suspense : null);
      } else if (flush2 === "pre") {
        queueJob(job, job.i ? job.i.uid : void 0, true);
      } else {
        job();
      }
    }
  }
}
function doWatch(source, cb, options = EMPTY_OBJ) {
  const { immediate, deep, flush: flush2 = "pre", once } = options;
  if (!cb) {
    if (immediate !== void 0) {
      warn$1(
        `watch() "immediate" option is only respected when using the watch(source, callback, options?) signature.`
      );
    }
    if (deep !== void 0) {
      warn$1(
        `watch() "deep" option is only respected when using the watch(source, callback, options?) signature.`
      );
    }
    if (once !== void 0) {
      warn$1(
        `watch() "once" option is only respected when using the watch(source, callback, options?) signature.`
      );
    }
  }
  const baseWatchOptions = extend({}, options);
  baseWatchOptions.onWarn = warn$1;
  const instance = currentInstance;
  baseWatchOptions.call = (fn, type, args) => callWithAsyncErrorHandling(fn, instance, type, args);
  const effect2 = new RenderWatcherEffect(
    instance,
    source,
    cb,
    baseWatchOptions,
    flush2
  );
  if (cb) {
    effect2.run(true);
  } else if (flush2 === "post") {
    queuePostRenderEffect(effect2.job, void 0, instance && instance.suspense);
  } else {
    effect2.run(true);
  }
  const stop2 = effect2.stop.bind(effect2);
  stop2.pause = effect2.pause.bind(effect2);
  stop2.resume = effect2.resume.bind(effect2);
  stop2.stop = stop2;
  return stop2;
}
function instanceWatch(source, value, options) {
  const publicThis = this.proxy;
  const getter = isString(source) ? source.includes(".") ? createPathGetter(publicThis, source) : () => publicThis[source] : source.bind(publicThis, publicThis);
  let cb;
  if (isFunction(value)) {
    cb = value;
  } else {
    cb = value.handler;
    options = value;
  }
  const prev = setCurrentInstance(this);
  const res = doWatch(getter, cb.bind(publicThis), options);
  setCurrentInstance(...prev);
  return res;
}
function createPathGetter(ctx, path) {
  const segments = path.split(".");
  return () => {
    let cur = ctx;
    for (let i = 0; i < segments.length && cur; i++) {
      cur = cur[segments[i]];
    }
    return cur;
  };
}
function queueEffectWithSuspense(fn, id, suspense) {
  if (suspense && suspense.pendingBranch) {
    if (isArray$1(fn)) {
      suspense.effects.push(...fn);
    } else {
      suspense.effects.push(fn);
    }
  } else {
    queuePostFlushCb(fn, id);
  }
}
function isVNode(value) {
  return value ? value.__v_isVNode === true : false;
}
let currentInstance = null;
const getCurrentGenericInstance = () => currentInstance || currentRenderingInstance;
let simpleSetCurrentInstance;
{
  simpleSetCurrentInstance = (i) => {
    currentInstance = i;
  };
}
const setCurrentInstance = (instance, scope = instance !== null ? instance.scope : void 0) => {
  try {
    return [currentInstance, setCurrentScope(scope)];
  } finally {
    simpleSetCurrentInstance(instance);
  }
};
function isStatefulComponent(instance) {
  return instance.vnode.shapeFlag & 4;
}
function getComponentPublicInstance(instance) {
  if (instance.exposed) {
    return instance.exposeProxy || (instance.exposeProxy = new Proxy(proxyRefs(markRaw(instance.exposed)), {
      get(target, key) {
        if (key in target) {
          return target[key];
        } else if (key in publicPropertiesMap) {
          return publicPropertiesMap[key](
            instance
          );
        }
      },
      has(target, key) {
        return key in target || key in publicPropertiesMap;
      }
    }));
  } else {
    return instance.proxy;
  }
}
const classifyRE = /(?:^|[-_])(\w)/g;
const classify = (str) => str.replace(classifyRE, (c) => c.toUpperCase()).replace(/[-_]/g, "");
function getComponentName(Component, includeInferred = true) {
  return isFunction(Component) ? Component.displayName || Component.name : Component.name || includeInferred && Component.__name;
}
function formatComponentName(instance, Component, isRoot = false) {
  let name = getComponentName(Component);
  if (!name && Component.__file) {
    const match = Component.__file.match(/([^/\\]+)\.\w+$/);
    if (match) {
      name = match[1];
    }
  }
  if (!name && instance && instance.parent) {
    const inferFromRegistry = (registry) => {
      for (const key in registry) {
        if (registry[key] === Component) {
          return key;
        }
      }
    };
    name = inferFromRegistry(
      instance.components || instance.parent.type.components
    ) || inferFromRegistry(instance.appContext.components);
  }
  return name ? classify(name) : isRoot ? `App` : `Anonymous`;
}
function isClassComponent(value) {
  return isFunction(value) && "__vccOpts" in value;
}
function initCustomFormatter() {
  if (typeof window === "undefined") {
    return;
  }
  const vueStyle = { style: "color:#3ba776" };
  const numberStyle = { style: "color:#1677ff" };
  const stringStyle = { style: "color:#f5222d" };
  const keywordStyle = { style: "color:#eb2f96" };
  const formatter = {
    __vue_custom_formatter: true,
    header(obj) {
      if (!isObject(obj)) {
        return null;
      }
      if (obj.__isVue) {
        return ["div", vueStyle, `VueInstance`];
      } else if (isRef(obj)) {
        const prevSub = setActiveSub();
        const value = obj.value;
        setActiveSub(prevSub);
        return [
          "div",
          {},
          ["span", vueStyle, genRefFlag(obj)],
          "<",
          formatValue(value),
          `>`
        ];
      } else if (isReactive(obj)) {
        return [
          "div",
          {},
          ["span", vueStyle, isShallow(obj) ? "ShallowReactive" : "Reactive"],
          "<",
          formatValue(obj),
          `>${isReadonly(obj) ? ` (readonly)` : ``}`
        ];
      } else if (isReadonly(obj)) {
        return [
          "div",
          {},
          ["span", vueStyle, isShallow(obj) ? "ShallowReadonly" : "Readonly"],
          "<",
          formatValue(obj),
          ">"
        ];
      }
      return null;
    },
    hasBody(obj) {
      return obj && obj.__isVue;
    },
    body(obj) {
      if (obj && obj.__isVue) {
        return [
          "div",
          {},
          ...formatInstance(obj.$)
        ];
      }
    }
  };
  function formatInstance(instance) {
    const blocks = [];
    if (instance.type.props && instance.props) {
      blocks.push(createInstanceBlock("props", toRaw(instance.props)));
    }
    if (instance.setupState !== EMPTY_OBJ) {
      blocks.push(createInstanceBlock("setup", instance.setupState));
    }
    if (instance.data !== EMPTY_OBJ) {
      blocks.push(createInstanceBlock("data", toRaw(instance.data)));
    }
    const computed2 = extractKeys(instance, "computed");
    if (computed2) {
      blocks.push(createInstanceBlock("computed", computed2));
    }
    const injected = extractKeys(instance, "inject");
    if (injected) {
      blocks.push(createInstanceBlock("injected", injected));
    }
    blocks.push([
      "div",
      {},
      [
        "span",
        {
          style: keywordStyle.style + ";opacity:0.66"
        },
        "$ (internal): "
      ],
      ["object", { object: instance }]
    ]);
    return blocks;
  }
  function createInstanceBlock(type, target) {
    target = extend({}, target);
    if (!Object.keys(target).length) {
      return ["span", {}];
    }
    return [
      "div",
      { style: "line-height:1.25em;margin-bottom:0.6em" },
      [
        "div",
        {
          style: "color:#476582"
        },
        type
      ],
      [
        "div",
        {
          style: "padding-left:1.25em"
        },
        ...Object.keys(target).map((key) => {
          return [
            "div",
            {},
            ["span", keywordStyle, key + ": "],
            formatValue(target[key], false)
          ];
        })
      ]
    ];
  }
  function formatValue(v, asRaw = true) {
    if (typeof v === "number") {
      return ["span", numberStyle, v];
    } else if (typeof v === "string") {
      return ["span", stringStyle, JSON.stringify(v)];
    } else if (typeof v === "boolean") {
      return ["span", keywordStyle, v];
    } else if (isObject(v)) {
      return ["object", { object: asRaw ? toRaw(v) : v }];
    } else {
      return ["span", stringStyle, String(v)];
    }
  }
  function extractKeys(instance, type) {
    const Comp = instance.type;
    if (isFunction(Comp)) {
      return;
    }
    const extracted = {};
    for (const key in instance.ctx) {
      if (isKeyOfType(Comp, key, type)) {
        extracted[key] = instance.ctx[key];
      }
    }
    return extracted;
  }
  function isKeyOfType(Comp, key, type) {
    const opts = Comp[type];
    if (isArray$1(opts) && opts.includes(key) || isObject(opts) && key in opts) {
      return true;
    }
    if (Comp.extends && isKeyOfType(Comp.extends, key, type)) {
      return true;
    }
    if (Comp.mixins && Comp.mixins.some((m) => isKeyOfType(m, key, type))) {
      return true;
    }
  }
  function genRefFlag(v) {
    if (isShallow(v)) {
      return `ShallowRef`;
    }
    if (v.effect) {
      return `ComputedRef`;
    }
    return `Ref`;
  }
  if (window.devtoolsFormatters) {
    window.devtoolsFormatters.push(formatter);
  } else {
    window.devtoolsFormatters = [formatter];
  }
}
const warn = warn$1;
/**
* @vue/runtime-dom v3.6.0-alpha.2
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let policy = void 0;
const tt = typeof window !== "undefined" && window.trustedTypes;
if (tt) {
  try {
    policy = /* @__PURE__ */ tt.createPolicy("vue", {
      createHTML: (val) => val
    });
  } catch (e) {
    warn(`Error creating trusted types policy: ${e}`);
  }
}
/**
* vue v3.6.0-alpha.2
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function initDev() {
  {
    initCustomFormatter();
  }
}
{
  initDev();
}
/*!
 * pinia v2.1.7
 * (c) 2023 Eduardo San Martin Morote
 * @license MIT
 */
var MutationType;
(function(MutationType2) {
  MutationType2["direct"] = "direct";
  MutationType2["patchObject"] = "patch object";
  MutationType2["patchFunction"] = "patch function";
})(MutationType || (MutationType = {}));
