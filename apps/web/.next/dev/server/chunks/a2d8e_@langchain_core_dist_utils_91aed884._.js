module.exports = [
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/env.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "env_exports",
    ()=>env_exports,
    "getEnv",
    ()=>getEnv,
    "getEnvironmentVariable",
    ()=>getEnvironmentVariable,
    "getRuntimeEnvironment",
    ()=>getRuntimeEnvironment,
    "isBrowser",
    ()=>isBrowser,
    "isDeno",
    ()=>isDeno,
    "isJsDom",
    ()=>isJsDom,
    "isNode",
    ()=>isNode,
    "isWebWorker",
    ()=>isWebWorker
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/_virtual/rolldown_runtime.js [app-route] (ecmascript)");
;
//#region src/utils/env.ts
var env_exports = {};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__export"])(env_exports, {
    getEnv: ()=>getEnv,
    getEnvironmentVariable: ()=>getEnvironmentVariable,
    getRuntimeEnvironment: ()=>getRuntimeEnvironment,
    isBrowser: ()=>isBrowser,
    isDeno: ()=>isDeno,
    isJsDom: ()=>isJsDom,
    isNode: ()=>isNode,
    isWebWorker: ()=>isWebWorker
});
const isBrowser = ()=>("TURBOPACK compile-time value", "undefined") !== "undefined" && typeof window.document !== "undefined";
const isWebWorker = ()=>typeof globalThis === "object" && globalThis.constructor && globalThis.constructor.name === "DedicatedWorkerGlobalScope";
const isJsDom = ()=>("TURBOPACK compile-time value", "undefined") !== "undefined" && window.name === "nodejs" || typeof navigator !== "undefined" && navigator.userAgent.includes("jsdom");
const isDeno = ()=>typeof Deno !== "undefined";
const isNode = ()=>typeof process !== "undefined" && typeof process.versions !== "undefined" && typeof process.versions.node !== "undefined" && !isDeno();
const getEnv = ()=>{
    let env;
    if (isBrowser()) env = "browser";
    else if (isNode()) env = "node";
    else if (isWebWorker()) env = "webworker";
    else if (isJsDom()) env = "jsdom";
    else if (isDeno()) env = "deno";
    else env = "other";
    return env;
};
let runtimeEnvironment;
function getRuntimeEnvironment() {
    if (runtimeEnvironment === void 0) {
        const env = getEnv();
        runtimeEnvironment = {
            library: "langchain-js",
            runtime: env
        };
    }
    return runtimeEnvironment;
}
function getEnvironmentVariable(name) {
    try {
        if (typeof process !== "undefined") return process.env?.[name];
        else if (isDeno()) return Deno?.env.get(name);
        else return void 0;
    } catch  {
        return void 0;
    }
}
;
 //# sourceMappingURL=env.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/json.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

//#region src/utils/json.ts
__turbopack_context__.s([
    "parseJsonMarkdown",
    ()=>parseJsonMarkdown,
    "parsePartialJson",
    ()=>parsePartialJson
]);
function parseJsonMarkdown(s, parser = parsePartialJson) {
    s = s.trim();
    const firstFenceIndex = s.indexOf("```");
    if (firstFenceIndex === -1) return parser(s);
    let contentAfterFence = s.substring(firstFenceIndex + 3);
    if (contentAfterFence.startsWith("json\n")) contentAfterFence = contentAfterFence.substring(5);
    else if (contentAfterFence.startsWith("json")) contentAfterFence = contentAfterFence.substring(4);
    else if (contentAfterFence.startsWith("\n")) contentAfterFence = contentAfterFence.substring(1);
    const closingFenceIndex = contentAfterFence.indexOf("```");
    let finalContent = contentAfterFence;
    if (closingFenceIndex !== -1) finalContent = contentAfterFence.substring(0, closingFenceIndex);
    return parser(finalContent.trim());
}
/**
* Recursive descent partial JSON parser.
* @param s - The string to parse.
* @returns The parsed value.
* @throws Error if the input is a malformed JSON string.
*/ function strictParsePartialJson(s) {
    try {
        return JSON.parse(s);
    } catch  {}
    const buffer = s.trim();
    if (buffer.length === 0) throw new Error("Unexpected end of JSON input");
    let pos = 0;
    function skipWhitespace() {
        while(pos < buffer.length && /\s/.test(buffer[pos]))pos += 1;
    }
    function parseString() {
        if (buffer[pos] !== "\"") throw new Error(`Expected '"' at position ${pos}, got '${buffer[pos]}'`);
        pos += 1;
        let result = "";
        let escaped = false;
        while(pos < buffer.length){
            const char = buffer[pos];
            if (escaped) {
                if (char === "n") result += "\n";
                else if (char === "t") result += "	";
                else if (char === "r") result += "\r";
                else if (char === "\\") result += "\\";
                else if (char === "\"") result += "\"";
                else if (char === "b") result += "\b";
                else if (char === "f") result += "\f";
                else if (char === "/") result += "/";
                else if (char === "u") {
                    const hex = buffer.substring(pos + 1, pos + 5);
                    if (/^[0-9A-Fa-f]{0,4}$/.test(hex)) {
                        if (hex.length === 4) result += String.fromCharCode(Number.parseInt(hex, 16));
                        else result += `u${hex}`;
                        pos += hex.length;
                    } else throw new Error(`Invalid unicode escape sequence '\\u${hex}' at position ${pos}`);
                } else throw new Error(`Invalid escape sequence '\\${char}' at position ${pos}`);
                escaped = false;
            } else if (char === "\\") escaped = true;
            else if (char === "\"") {
                pos += 1;
                return result;
            } else result += char;
            pos += 1;
        }
        if (escaped) result += "\\";
        return result;
    }
    function parseNumber() {
        const start = pos;
        let numStr = "";
        if (buffer[pos] === "-") {
            numStr += "-";
            pos += 1;
        }
        if (pos < buffer.length && buffer[pos] === "0") {
            numStr += "0";
            pos += 1;
            if (buffer[pos] >= "0" && buffer[pos] <= "9") throw new Error(`Invalid number at position ${start}`);
        }
        if (pos < buffer.length && buffer[pos] >= "1" && buffer[pos] <= "9") while(pos < buffer.length && buffer[pos] >= "0" && buffer[pos] <= "9"){
            numStr += buffer[pos];
            pos += 1;
        }
        if (pos < buffer.length && buffer[pos] === ".") {
            numStr += ".";
            pos += 1;
            while(pos < buffer.length && buffer[pos] >= "0" && buffer[pos] <= "9"){
                numStr += buffer[pos];
                pos += 1;
            }
        }
        if (pos < buffer.length && (buffer[pos] === "e" || buffer[pos] === "E")) {
            numStr += buffer[pos];
            pos += 1;
            if (pos < buffer.length && (buffer[pos] === "+" || buffer[pos] === "-")) {
                numStr += buffer[pos];
                pos += 1;
            }
            while(pos < buffer.length && buffer[pos] >= "0" && buffer[pos] <= "9"){
                numStr += buffer[pos];
                pos += 1;
            }
        }
        if (numStr === "-") return -0;
        const num = Number.parseFloat(numStr);
        if (Number.isNaN(num)) {
            pos = start;
            throw new Error(`Invalid number '${numStr}' at position ${start}`);
        }
        return num;
    }
    function parseValue() {
        skipWhitespace();
        if (pos >= buffer.length) throw new Error(`Unexpected end of input at position ${pos}`);
        const char = buffer[pos];
        if (char === "{") return parseObject();
        if (char === "[") return parseArray();
        if (char === "\"") return parseString();
        if ("null".startsWith(buffer.substring(pos, pos + 4))) {
            pos += Math.min(4, buffer.length - pos);
            return null;
        }
        if ("true".startsWith(buffer.substring(pos, pos + 4))) {
            pos += Math.min(4, buffer.length - pos);
            return true;
        }
        if ("false".startsWith(buffer.substring(pos, pos + 5))) {
            pos += Math.min(5, buffer.length - pos);
            return false;
        }
        if (char === "-" || char >= "0" && char <= "9") return parseNumber();
        throw new Error(`Unexpected character '${char}' at position ${pos}`);
    }
    function parseArray() {
        if (buffer[pos] !== "[") throw new Error(`Expected '[' at position ${pos}, got '${buffer[pos]}'`);
        const arr = [];
        pos += 1;
        skipWhitespace();
        if (pos >= buffer.length) return arr;
        if (buffer[pos] === "]") {
            pos += 1;
            return arr;
        }
        while(pos < buffer.length){
            skipWhitespace();
            if (pos >= buffer.length) return arr;
            arr.push(parseValue());
            skipWhitespace();
            if (pos >= buffer.length) return arr;
            if (buffer[pos] === "]") {
                pos += 1;
                return arr;
            } else if (buffer[pos] === ",") {
                pos += 1;
                continue;
            }
            throw new Error(`Expected ',' or ']' at position ${pos}, got '${buffer[pos]}'`);
        }
        return arr;
    }
    function parseObject() {
        if (buffer[pos] !== "{") throw new Error(`Expected '{' at position ${pos}, got '${buffer[pos]}'`);
        const obj = {};
        pos += 1;
        skipWhitespace();
        if (pos >= buffer.length) return obj;
        if (buffer[pos] === "}") {
            pos += 1;
            return obj;
        }
        while(pos < buffer.length){
            skipWhitespace();
            if (pos >= buffer.length) return obj;
            const key = parseString();
            skipWhitespace();
            if (pos >= buffer.length) return obj;
            if (buffer[pos] !== ":") throw new Error(`Expected ':' at position ${pos}, got '${buffer[pos]}'`);
            pos += 1;
            skipWhitespace();
            if (pos >= buffer.length) return obj;
            obj[key] = parseValue();
            skipWhitespace();
            if (pos >= buffer.length) return obj;
            if (buffer[pos] === "}") {
                pos += 1;
                return obj;
            } else if (buffer[pos] === ",") {
                pos += 1;
                continue;
            }
            throw new Error(`Expected ',' or '}' at position ${pos}, got '${buffer[pos]}'`);
        }
        return obj;
    }
    const value = parseValue();
    skipWhitespace();
    if (pos < buffer.length) throw new Error(`Unexpected character '${buffer[pos]}' at position ${pos}`);
    return value;
}
function parsePartialJson(s) {
    try {
        if (typeof s === "undefined") return null;
        return strictParsePartialJson(s);
    } catch  {
        return null;
    }
}
;
 //# sourceMappingURL=json.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/callbacks.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isTracingEnabled",
    ()=>isTracingEnabled
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$env$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/env.js [app-route] (ecmascript)");
;
//#region src/utils/callbacks.ts
const isTracingEnabled = (tracingEnabled)=>{
    if (tracingEnabled !== void 0) return tracingEnabled;
    const envVars = [
        "LANGSMITH_TRACING_V2",
        "LANGCHAIN_TRACING_V2",
        "LANGSMITH_TRACING",
        "LANGCHAIN_TRACING"
    ];
    return !!envVars.find((envVar)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$env$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getEnvironmentVariable"])(envVar) === "true");
};
;
 //# sourceMappingURL=callbacks.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/signal.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

//#region src/utils/signal.ts
/**
* Race a promise with an abort signal. If the signal is aborted, the promise will
* be rejected with the error from the signal. If the promise is rejected, the signal will be aborted.
*
* @param promise - The promise to race.
* @param signal - The abort signal.
* @returns The result of the promise.
*/ __turbopack_context__.s([
    "getAbortSignalError",
    ()=>getAbortSignalError,
    "raceWithSignal",
    ()=>raceWithSignal
]);
async function raceWithSignal(promise, signal) {
    if (signal === void 0) return promise;
    let listener;
    return Promise.race([
        promise.catch((err)=>{
            if (!signal?.aborted) throw err;
            else return void 0;
        }),
        new Promise((_, reject)=>{
            listener = ()=>{
                reject(getAbortSignalError(signal));
            };
            signal.addEventListener("abort", listener);
            if (signal.aborted) reject(getAbortSignalError(signal));
        })
    ]).finally(()=>signal.removeEventListener("abort", listener));
}
/**
* Get the error from an abort signal. Since you can set the reason to anything,
* we have to do some type gymnastics to get a proper error message.
*
* @param signal - The abort signal.
* @returns The error from the abort signal.
*/ function getAbortSignalError(signal) {
    if (signal?.reason instanceof Error) return signal.reason;
    if (typeof signal?.reason === "string") return new Error(signal.reason);
    return /* @__PURE__ */ new Error("Aborted");
}
;
 //# sourceMappingURL=signal.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/stream.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AsyncGeneratorWithSetup",
    ()=>AsyncGeneratorWithSetup,
    "IterableReadableStream",
    ()=>IterableReadableStream,
    "atee",
    ()=>atee,
    "concat",
    ()=>concat,
    "pipeGeneratorWithSetup",
    ()=>pipeGeneratorWithSetup,
    "stream_exports",
    ()=>stream_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/_virtual/rolldown_runtime.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/singletons/async_local_storage/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/singletons/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/runnables/config.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$signal$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/signal.js [app-route] (ecmascript)");
;
;
;
;
;
//#region src/utils/stream.ts
var stream_exports = {};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__export"])(stream_exports, {
    AsyncGeneratorWithSetup: ()=>AsyncGeneratorWithSetup,
    IterableReadableStream: ()=>IterableReadableStream,
    atee: ()=>atee,
    concat: ()=>concat,
    pipeGeneratorWithSetup: ()=>pipeGeneratorWithSetup
});
var IterableReadableStream = class IterableReadableStream extends ReadableStream {
    reader;
    ensureReader() {
        if (!this.reader) this.reader = this.getReader();
    }
    async next() {
        this.ensureReader();
        try {
            const result = await this.reader.read();
            if (result.done) {
                this.reader.releaseLock();
                return {
                    done: true,
                    value: void 0
                };
            } else return {
                done: false,
                value: result.value
            };
        } catch (e) {
            this.reader.releaseLock();
            throw e;
        }
    }
    async return() {
        this.ensureReader();
        if (this.locked) {
            const cancelPromise = this.reader.cancel();
            this.reader.releaseLock();
            await cancelPromise;
        }
        return {
            done: true,
            value: void 0
        };
    }
    async throw(e) {
        this.ensureReader();
        if (this.locked) {
            const cancelPromise = this.reader.cancel();
            this.reader.releaseLock();
            await cancelPromise;
        }
        throw e;
    }
    [Symbol.asyncIterator]() {
        return this;
    }
    async [Symbol.asyncDispose]() {
        await this.return();
    }
    static fromReadableStream(stream) {
        const reader = stream.getReader();
        return new IterableReadableStream({
            start (controller) {
                return pump();
                //TURBOPACK unreachable
                ;
                function pump() {
                    return reader.read().then(({ done, value })=>{
                        if (done) {
                            controller.close();
                            return;
                        }
                        controller.enqueue(value);
                        return pump();
                    });
                }
            },
            cancel () {
                reader.releaseLock();
            }
        });
    }
    static fromAsyncGenerator(generator) {
        return new IterableReadableStream({
            async pull (controller) {
                const { value, done } = await generator.next();
                if (done) controller.close();
                controller.enqueue(value);
            },
            async cancel (reason) {
                await generator.return(reason);
            }
        });
    }
};
function atee(iter, length = 2) {
    const buffers = Array.from({
        length
    }, ()=>[]);
    return buffers.map(async function* makeIter(buffer) {
        while(true)if (buffer.length === 0) {
            const result = await iter.next();
            for (const buffer$1 of buffers)buffer$1.push(result);
        } else if (buffer[0].done) return;
        else yield buffer.shift().value;
    });
}
function concat(first, second) {
    if (Array.isArray(first) && Array.isArray(second)) return first.concat(second);
    else if (typeof first === "string" && typeof second === "string") return first + second;
    else if (typeof first === "number" && typeof second === "number") return first + second;
    else if ("concat" in first && typeof first.concat === "function") return first.concat(second);
    else if (typeof first === "object" && typeof second === "object") {
        const chunk = {
            ...first
        };
        for (const [key, value] of Object.entries(second))if (key in chunk && !Array.isArray(chunk[key])) chunk[key] = concat(chunk[key], value);
        else chunk[key] = value;
        return chunk;
    } else throw new Error(`Cannot concat ${typeof first} and ${typeof second}`);
}
var AsyncGeneratorWithSetup = class {
    generator;
    setup;
    config;
    signal;
    firstResult;
    firstResultUsed = false;
    constructor(params){
        this.generator = params.generator;
        this.config = params.config;
        this.signal = params.signal ?? this.config?.signal;
        this.setup = new Promise((resolve, reject)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AsyncLocalStorageProviderSingleton"].runWithConfig((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pickRunnableConfigKeys"])(params.config), async ()=>{
                this.firstResult = params.generator.next();
                if (params.startSetup) this.firstResult.then(params.startSetup).then(resolve, reject);
                else this.firstResult.then((_result)=>resolve(void 0), reject);
            }, true);
        });
    }
    async next(...args) {
        this.signal?.throwIfAborted();
        if (!this.firstResultUsed) {
            this.firstResultUsed = true;
            return this.firstResult;
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AsyncLocalStorageProviderSingleton"].runWithConfig((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pickRunnableConfigKeys"])(this.config), this.signal ? async ()=>{
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$signal$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["raceWithSignal"])(this.generator.next(...args), this.signal);
        } : async ()=>{
            return this.generator.next(...args);
        }, true);
    }
    async return(value) {
        return this.generator.return(value);
    }
    async throw(e) {
        return this.generator.throw(e);
    }
    [Symbol.asyncIterator]() {
        return this;
    }
    async [Symbol.asyncDispose]() {
        await this.return();
    }
};
async function pipeGeneratorWithSetup(to, generator, startSetup, signal, ...args) {
    const gen = new AsyncGeneratorWithSetup({
        generator,
        startSetup,
        signal
    });
    const setup = await gen.setup;
    return {
        output: to(gen, setup, ...args),
        setup
    };
}
;
 //# sourceMappingURL=stream.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/types/zod.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "extendInteropZodObject",
    ()=>extendInteropZodObject,
    "getInteropZodDefaultGetter",
    ()=>getInteropZodDefaultGetter,
    "getInteropZodObjectShape",
    ()=>getInteropZodObjectShape,
    "getSchemaDescription",
    ()=>getSchemaDescription,
    "interopParse",
    ()=>interopParse,
    "interopParseAsync",
    ()=>interopParseAsync,
    "interopSafeParse",
    ()=>interopSafeParse,
    "interopSafeParseAsync",
    ()=>interopSafeParseAsync,
    "interopZodObjectMakeFieldsOptional",
    ()=>interopZodObjectMakeFieldsOptional,
    "interopZodObjectPartial",
    ()=>interopZodObjectPartial,
    "interopZodObjectPassthrough",
    ()=>interopZodObjectPassthrough,
    "interopZodObjectStrict",
    ()=>interopZodObjectStrict,
    "interopZodTransformInputSchema",
    ()=>interopZodTransformInputSchema,
    "isInteropZodError",
    ()=>isInteropZodError,
    "isInteropZodLiteral",
    ()=>isInteropZodLiteral,
    "isInteropZodObject",
    ()=>isInteropZodObject,
    "isInteropZodSchema",
    ()=>isInteropZodSchema,
    "isShapelessZodSchema",
    ()=>isShapelessZodSchema,
    "isSimpleStringZodSchema",
    ()=>isSimpleStringZodSchema,
    "isZodArrayV4",
    ()=>isZodArrayV4,
    "isZodLiteralV3",
    ()=>isZodLiteralV3,
    "isZodLiteralV4",
    ()=>isZodLiteralV4,
    "isZodNullableV4",
    ()=>isZodNullableV4,
    "isZodObjectV3",
    ()=>isZodObjectV3,
    "isZodObjectV4",
    ()=>isZodObjectV4,
    "isZodOptionalV4",
    ()=>isZodOptionalV4,
    "isZodSchema",
    ()=>isZodSchema,
    "isZodSchemaV3",
    ()=>isZodSchemaV3,
    "isZodSchemaV4",
    ()=>isZodSchemaV4
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$core$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/v4/core/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$core$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/v4/core/schemas.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$core$2f$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/v4/core/api.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$core$2f$registries$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/v4/core/registries.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$core$2f$parse$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/v4/core/parse.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$core$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__util$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/v4/core/util.js [app-route] (ecmascript) <export * as util>");
;
//#region src/utils/types/zod.ts
function isZodSchemaV4(schema) {
    if (typeof schema !== "object" || schema === null) return false;
    const obj = schema;
    if (!("_zod" in obj)) return false;
    const zod = obj._zod;
    return typeof zod === "object" && zod !== null && "def" in zod;
}
function isZodSchemaV3(schema) {
    if (typeof schema !== "object" || schema === null) return false;
    const obj = schema;
    if (!("_def" in obj) || "_zod" in obj) return false;
    const def = obj._def;
    return typeof def === "object" && def != null && "typeName" in def;
}
/** Backward compatible isZodSchema for Zod 3 */ function isZodSchema(schema) {
    if (isZodSchemaV4(schema)) console.warn("[WARNING] Attempting to use Zod 4 schema in a context where Zod 3 schema is expected. This may cause unexpected behavior.");
    return isZodSchemaV3(schema);
}
/**
* Given either a Zod schema, or plain object, determine if the input is a Zod schema.
*
* @param {unknown} input
* @returns {boolean} Whether or not the provided input is a Zod schema.
*/ function isInteropZodSchema(input) {
    if (!input) return false;
    if (typeof input !== "object") return false;
    if (Array.isArray(input)) return false;
    if (isZodSchemaV4(input) || isZodSchemaV3(input)) return true;
    return false;
}
function isZodLiteralV3(obj) {
    if (typeof obj === "object" && obj !== null && "_def" in obj && typeof obj._def === "object" && obj._def !== null && "typeName" in obj._def && obj._def.typeName === "ZodLiteral") return true;
    return false;
}
function isZodLiteralV4(obj) {
    if (!isZodSchemaV4(obj)) return false;
    if (typeof obj === "object" && obj !== null && "_zod" in obj && typeof obj._zod === "object" && obj._zod !== null && "def" in obj._zod && typeof obj._zod.def === "object" && obj._zod.def !== null && "type" in obj._zod.def && obj._zod.def.type === "literal") return true;
    return false;
}
/**
* Determines if the provided value is an InteropZodLiteral (Zod v3 or v4 literal schema).
*
* @param obj The value to check.
* @returns {boolean} True if the value is a Zod v3 or v4 literal schema, false otherwise.
*/ function isInteropZodLiteral(obj) {
    if (isZodLiteralV3(obj)) return true;
    if (isZodLiteralV4(obj)) return true;
    return false;
}
/**
* Asynchronously parses the input using the provided Zod schema (v3 or v4) and returns a safe parse result.
* This function handles both Zod v3 and v4 schemas, returning a result object indicating success or failure.
*
* @template T - The expected output type of the schema.
* @param {InteropZodType<T>} schema - The Zod schema (v3 or v4) to use for parsing.
* @param {unknown} input - The input value to parse.
* @returns {Promise<InteropZodSafeParseResult<T>>} A promise that resolves to a safe parse result object.
* @throws {Error} If the schema is not a recognized Zod v3 or v4 schema.
*/ async function interopSafeParseAsync(schema, input) {
    if (isZodSchemaV4(schema)) try {
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$core$2f$parse$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseAsync"])(schema, input);
        return {
            success: true,
            data
        };
    } catch (error) {
        return {
            success: false,
            error
        };
    }
    if (isZodSchemaV3(schema)) return await schema.safeParseAsync(input);
    throw new Error("Schema must be an instance of z3.ZodType or z4.$ZodType");
}
/**
* Asynchronously parses the input using the provided Zod schema (v3 or v4) and returns the parsed value.
* Throws an error if parsing fails or if the schema is not a recognized Zod v3 or v4 schema.
*
* @template T - The expected output type of the schema.
* @param {InteropZodType<T>} schema - The Zod schema (v3 or v4) to use for parsing.
* @param {unknown} input - The input value to parse.
* @returns {Promise<T>} A promise that resolves to the parsed value.
* @throws {Error} If parsing fails or the schema is not a recognized Zod v3 or v4 schema.
*/ async function interopParseAsync(schema, input) {
    if (isZodSchemaV4(schema)) return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$core$2f$parse$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseAsync"])(schema, input);
    if (isZodSchemaV3(schema)) return await schema.parseAsync(input);
    throw new Error("Schema must be an instance of z3.ZodType or z4.$ZodType");
}
/**
* Safely parses the input using the provided Zod schema (v3 or v4) and returns a result object
* indicating success or failure. This function is compatible with both Zod v3 and v4 schemas.
*
* @template T - The expected output type of the schema.
* @param {InteropZodType<T>} schema - The Zod schema (v3 or v4) to use for parsing.
* @param {unknown} input - The input value to parse.
* @returns {InteropZodSafeParseResult<T>} An object with either the parsed data (on success)
*   or the error (on failure).
* @throws {Error} If the schema is not a recognized Zod v3 or v4 schema.
*/ function interopSafeParse(schema, input) {
    if (isZodSchemaV4(schema)) try {
        const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$core$2f$parse$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parse"])(schema, input);
        return {
            success: true,
            data
        };
    } catch (error) {
        return {
            success: false,
            error
        };
    }
    if (isZodSchemaV3(schema)) return schema.safeParse(input);
    throw new Error("Schema must be an instance of z3.ZodType or z4.$ZodType");
}
/**
* Parses the input using the provided Zod schema (v3 or v4) and returns the parsed value.
* Throws an error if parsing fails or if the schema is not a recognized Zod v3 or v4 schema.
*
* @template T - The expected output type of the schema.
* @param {InteropZodType<T>} schema - The Zod schema (v3 or v4) to use for parsing.
* @param {unknown} input - The input value to parse.
* @returns {T} The parsed value.
* @throws {Error} If parsing fails or the schema is not a recognized Zod v3 or v4 schema.
*/ function interopParse(schema, input) {
    if (isZodSchemaV4(schema)) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$core$2f$parse$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parse"])(schema, input);
    if (isZodSchemaV3(schema)) return schema.parse(input);
    throw new Error("Schema must be an instance of z3.ZodType or z4.$ZodType");
}
/**
* Retrieves the description from a schema definition (v3, v4, or plain object), if available.
*
* @param {unknown} schema - The schema to extract the description from.
* @returns {string | undefined} The description of the schema, or undefined if not present.
*/ function getSchemaDescription(schema) {
    if (isZodSchemaV4(schema)) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$core$2f$registries$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["globalRegistry"].get(schema)?.description;
    if (isZodSchemaV3(schema)) return schema.description;
    if ("description" in schema && typeof schema.description === "string") return schema.description;
    return void 0;
}
/**
* Determines if the provided Zod schema is "shapeless".
* A shapeless schema is one that does not define any object shape,
* such as ZodString, ZodNumber, ZodBoolean, ZodAny, etc.
* For ZodObject, it must have no shape keys to be considered shapeless.
* ZodRecord schemas are considered shapeless since they define dynamic
* key-value mappings without fixed keys.
*
* @param schema The Zod schema to check.
* @returns {boolean} True if the schema is shapeless, false otherwise.
*/ function isShapelessZodSchema(schema) {
    if (!isInteropZodSchema(schema)) return false;
    if (isZodSchemaV3(schema)) {
        const def = schema._def;
        if (def.typeName === "ZodObject") {
            const obj = schema;
            return !obj.shape || Object.keys(obj.shape).length === 0;
        }
        if (def.typeName === "ZodRecord") return true;
    }
    if (isZodSchemaV4(schema)) {
        const def = schema._zod.def;
        if (def.type === "object") {
            const obj = schema;
            return !obj.shape || Object.keys(obj.shape).length === 0;
        }
        if (def.type === "record") return true;
    }
    if (typeof schema === "object" && schema !== null && !("shape" in schema)) return true;
    return false;
}
/**
* Determines if the provided Zod schema should be treated as a simple string schema
* that maps to DynamicTool. This aligns with the type-level constraint of
* InteropZodType<string | undefined> which only matches basic string schemas.
* If the provided schema is just z.string(), we can make the determination that
* the tool is just a generic string tool that doesn't require any input validation.
*
* This function only returns true for basic ZodString schemas, including:
* - Basic string schemas (z.string())
* - String schemas with validations (z.string().min(1), z.string().email(), etc.)
*
* This function returns false for everything else, including:
* - String schemas with defaults (z.string().default("value"))
* - Branded string schemas (z.string().brand<"UserId">())
* - String schemas with catch operations (z.string().catch("default"))
* - Optional/nullable string schemas (z.string().optional())
* - Transformed schemas (z.string().transform() or z.object().transform())
* - Object or record schemas, even if they're empty
* - Any other schema type
*
* @param schema The Zod schema to check.
* @returns {boolean} True if the schema is a basic ZodString, false otherwise.
*/ function isSimpleStringZodSchema(schema) {
    if (!isInteropZodSchema(schema)) return false;
    if (isZodSchemaV3(schema)) {
        const def = schema._def;
        return def.typeName === "ZodString";
    }
    if (isZodSchemaV4(schema)) {
        const def = schema._zod.def;
        return def.type === "string";
    }
    return false;
}
function isZodObjectV3(obj) {
    if (typeof obj === "object" && obj !== null && "_def" in obj && typeof obj._def === "object" && obj._def !== null && "typeName" in obj._def && obj._def.typeName === "ZodObject") return true;
    return false;
}
function isZodObjectV4(obj) {
    if (!isZodSchemaV4(obj)) return false;
    if (typeof obj === "object" && obj !== null && "_zod" in obj && typeof obj._zod === "object" && obj._zod !== null && "def" in obj._zod && typeof obj._zod.def === "object" && obj._zod.def !== null && "type" in obj._zod.def && obj._zod.def.type === "object") return true;
    return false;
}
function isZodArrayV4(obj) {
    if (!isZodSchemaV4(obj)) return false;
    if (typeof obj === "object" && obj !== null && "_zod" in obj && typeof obj._zod === "object" && obj._zod !== null && "def" in obj._zod && typeof obj._zod.def === "object" && obj._zod.def !== null && "type" in obj._zod.def && obj._zod.def.type === "array") return true;
    return false;
}
function isZodOptionalV4(obj) {
    if (!isZodSchemaV4(obj)) return false;
    if (typeof obj === "object" && obj !== null && "_zod" in obj && typeof obj._zod === "object" && obj._zod !== null && "def" in obj._zod && typeof obj._zod.def === "object" && obj._zod.def !== null && "type" in obj._zod.def && obj._zod.def.type === "optional") return true;
    return false;
}
function isZodNullableV4(obj) {
    if (!isZodSchemaV4(obj)) return false;
    if (typeof obj === "object" && obj !== null && "_zod" in obj && typeof obj._zod === "object" && obj._zod !== null && "def" in obj._zod && typeof obj._zod.def === "object" && obj._zod.def !== null && "type" in obj._zod.def && obj._zod.def.type === "nullable") return true;
    return false;
}
/**
* Determines if the provided value is an InteropZodObject (Zod v3 or v4 object schema).
*
* @param obj The value to check.
* @returns {boolean} True if the value is a Zod v3 or v4 object schema, false otherwise.
*/ function isInteropZodObject(obj) {
    if (isZodObjectV3(obj)) return true;
    if (isZodObjectV4(obj)) return true;
    return false;
}
/**
* Retrieves the shape (fields) of a Zod object schema, supporting both Zod v3 and v4.
*
* @template T - The type of the Zod object schema.
* @param {T} schema - The Zod object schema instance (either v3 or v4).
* @returns {InteropZodObjectShape<T>} The shape of the object schema.
* @throws {Error} If the schema is not a Zod v3 or v4 object.
*/ function getInteropZodObjectShape(schema) {
    if (isZodSchemaV3(schema)) return schema.shape;
    if (isZodSchemaV4(schema)) return schema._zod.def.shape;
    throw new Error("Schema must be an instance of z3.ZodObject or z4.$ZodObject");
}
/**
* Extends a Zod object schema with additional fields, supporting both Zod v3 and v4.
*
* @template T - The type of the Zod object schema.
* @param {T} schema - The Zod object schema instance (either v3 or v4).
* @param {InteropZodObjectShape} extension - The fields to add to the schema.
* @returns {InteropZodObject} The extended Zod object schema.
* @throws {Error} If the schema is not a Zod v3 or v4 object.
*/ function extendInteropZodObject(schema, extension) {
    if (isZodSchemaV3(schema)) return schema.extend(extension);
    if (isZodSchemaV4(schema)) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$core$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__util$3e$__["util"].extend(schema, extension);
    throw new Error("Schema must be an instance of z3.ZodObject or z4.$ZodObject");
}
/**
* Returns a partial version of a Zod object schema, making all fields optional.
* Supports both Zod v3 and v4.
*
* @template T - The type of the Zod object schema.
* @param {T} schema - The Zod object schema instance (either v3 or v4).
* @returns {InteropZodObject} The partial Zod object schema.
* @throws {Error} If the schema is not a Zod v3 or v4 object.
*/ function interopZodObjectPartial(schema) {
    if (isZodSchemaV3(schema)) return schema.partial();
    if (isZodSchemaV4(schema)) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$core$2f$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__util$3e$__["util"].partial(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$core$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["$ZodOptional"], schema, void 0);
    throw new Error("Schema must be an instance of z3.ZodObject or z4.$ZodObject");
}
/**
* Returns a strict version of a Zod object schema, disallowing unknown keys.
* Supports both Zod v3 and v4 object schemas. If `recursive` is true, applies strictness
* recursively to all nested object schemas and arrays of object schemas.
*
* @template T - The type of the Zod object schema.
* @param {T} schema - The Zod object schema instance (either v3 or v4).
* @param {boolean} [recursive=false] - Whether to apply strictness recursively to nested objects/arrays.
* @returns {InteropZodObject} The strict Zod object schema.
* @throws {Error} If the schema is not a Zod v3 or v4 object.
*/ function interopZodObjectStrict(schema, recursive = false) {
    if (isZodSchemaV3(schema)) return schema.strict();
    if (isZodObjectV4(schema)) {
        const outputShape = schema._zod.def.shape;
        if (recursive) for (const [key, keySchema] of Object.entries(schema._zod.def.shape)){
            if (isZodObjectV4(keySchema)) {
                const outputSchema = interopZodObjectStrict(keySchema, recursive);
                outputShape[key] = outputSchema;
            } else if (isZodArrayV4(keySchema)) {
                let elementSchema = keySchema._zod.def.element;
                if (isZodObjectV4(elementSchema)) elementSchema = interopZodObjectStrict(elementSchema, recursive);
                outputShape[key] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$core$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clone"])(keySchema, {
                    ...keySchema._zod.def,
                    element: elementSchema
                });
            } else outputShape[key] = keySchema;
            const meta$1 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$core$2f$registries$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["globalRegistry"].get(keySchema);
            if (meta$1) __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$core$2f$registries$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["globalRegistry"].add(outputShape[key], meta$1);
        }
        const modifiedSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$core$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clone"])(schema, {
            ...schema._zod.def,
            shape: outputShape,
            catchall: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$core$2f$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["_never"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$core$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["$ZodNever"])
        });
        const meta = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$core$2f$registries$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["globalRegistry"].get(schema);
        if (meta) __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$core$2f$registries$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["globalRegistry"].add(modifiedSchema, meta);
        return modifiedSchema;
    }
    throw new Error("Schema must be an instance of z3.ZodObject or z4.$ZodObject");
}
/**
* Returns a passthrough version of a Zod object schema, allowing unknown keys.
* Supports both Zod v3 and v4 object schemas. If `recursive` is true, applies passthrough
* recursively to all nested object schemas and arrays of object schemas.
*
* @template T - The type of the Zod object schema.
* @param {T} schema - The Zod object schema instance (either v3 or v4).
* @param {boolean} [recursive=false] - Whether to apply passthrough recursively to nested objects/arrays.
* @returns {InteropZodObject} The passthrough Zod object schema.
* @throws {Error} If the schema is not a Zod v3 or v4 object.
*/ function interopZodObjectPassthrough(schema, recursive = false) {
    if (isZodObjectV3(schema)) return schema.passthrough();
    if (isZodObjectV4(schema)) {
        const outputShape = schema._zod.def.shape;
        if (recursive) for (const [key, keySchema] of Object.entries(schema._zod.def.shape)){
            if (isZodObjectV4(keySchema)) {
                const outputSchema = interopZodObjectPassthrough(keySchema, recursive);
                outputShape[key] = outputSchema;
            } else if (isZodArrayV4(keySchema)) {
                let elementSchema = keySchema._zod.def.element;
                if (isZodObjectV4(elementSchema)) elementSchema = interopZodObjectPassthrough(elementSchema, recursive);
                outputShape[key] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$core$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clone"])(keySchema, {
                    ...keySchema._zod.def,
                    element: elementSchema
                });
            } else outputShape[key] = keySchema;
            const meta$1 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$core$2f$registries$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["globalRegistry"].get(keySchema);
            if (meta$1) __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$core$2f$registries$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["globalRegistry"].add(outputShape[key], meta$1);
        }
        const modifiedSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$core$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clone"])(schema, {
            ...schema._zod.def,
            shape: outputShape,
            catchall: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$core$2f$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["_unknown"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$core$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["$ZodUnknown"])
        });
        const meta = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$core$2f$registries$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["globalRegistry"].get(schema);
        if (meta) __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$core$2f$registries$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["globalRegistry"].add(modifiedSchema, meta);
        return modifiedSchema;
    }
    throw new Error("Schema must be an instance of z3.ZodObject or z4.$ZodObject");
}
/**
* Returns a getter function for the default value of a Zod schema, if one is defined.
* Supports both Zod v3 and v4 schemas. If the schema has a default value,
* the returned function will return that value when called. If no default is defined,
* returns undefined.
*
* @template T - The type of the Zod schema.
* @param {T} schema - The Zod schema instance (either v3 or v4).
* @returns {(() => InferInteropZodOutput<T>) | undefined} A function that returns the default value, or undefined if no default is set.
*/ function getInteropZodDefaultGetter(schema) {
    if (isZodSchemaV3(schema)) try {
        const defaultValue = schema.parse(void 0);
        return ()=>defaultValue;
    } catch  {
        return void 0;
    }
    if (isZodSchemaV4(schema)) try {
        const defaultValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$core$2f$parse$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parse"])(schema, void 0);
        return ()=>defaultValue;
    } catch  {
        return void 0;
    }
    return void 0;
}
function isZodTransformV3(schema) {
    return isZodSchemaV3(schema) && "typeName" in schema._def && schema._def.typeName === "ZodEffects";
}
function isZodTransformV4(schema) {
    return isZodSchemaV4(schema) && schema._zod.def.type === "pipe";
}
function interopZodTransformInputSchemaImpl(schema, recursive, cache) {
    const cached = cache.get(schema);
    if (cached !== void 0) return cached;
    if (isZodSchemaV3(schema)) {
        if (isZodTransformV3(schema)) return interopZodTransformInputSchemaImpl(schema._def.schema, recursive, cache);
        return schema;
    }
    if (isZodSchemaV4(schema)) {
        let outputSchema = schema;
        if (isZodTransformV4(schema)) outputSchema = interopZodTransformInputSchemaImpl(schema._zod.def.in, recursive, cache);
        if (recursive) {
            if (isZodObjectV4(outputSchema)) {
                const outputShape = outputSchema._zod.def.shape;
                for (const [key, keySchema] of Object.entries(outputSchema._zod.def.shape))outputShape[key] = interopZodTransformInputSchemaImpl(keySchema, recursive, cache);
                outputSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$core$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clone"])(outputSchema, {
                    ...outputSchema._zod.def,
                    shape: outputShape
                });
            } else if (isZodArrayV4(outputSchema)) {
                const elementSchema = interopZodTransformInputSchemaImpl(outputSchema._zod.def.element, recursive, cache);
                outputSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$core$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clone"])(outputSchema, {
                    ...outputSchema._zod.def,
                    element: elementSchema
                });
            } else if (isZodOptionalV4(outputSchema)) {
                const innerSchema = interopZodTransformInputSchemaImpl(outputSchema._zod.def.innerType, recursive, cache);
                outputSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$core$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clone"])(outputSchema, {
                    ...outputSchema._zod.def,
                    innerType: innerSchema
                });
            } else if (isZodNullableV4(outputSchema)) {
                const innerSchema = interopZodTransformInputSchemaImpl(outputSchema._zod.def.innerType, recursive, cache);
                outputSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$core$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clone"])(outputSchema, {
                    ...outputSchema._zod.def,
                    innerType: innerSchema
                });
            }
        }
        const meta = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$core$2f$registries$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["globalRegistry"].get(schema);
        if (meta) __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$core$2f$registries$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["globalRegistry"].add(outputSchema, meta);
        cache.set(schema, outputSchema);
        return outputSchema;
    }
    throw new Error("Schema must be an instance of z3.ZodType or z4.$ZodType");
}
/**
* Returns the input type of a Zod transform schema, for both v3 and v4.
* If the schema is not a transform, returns undefined. If `recursive` is true,
* recursively processes nested object schemas and arrays of object schemas.
*
* @param schema - The Zod schema instance (v3 or v4)
* @param {boolean} [recursive=false] - Whether to recursively process nested objects/arrays.
* @returns The input Zod schema of the transform, or undefined if not a transform
*/ function interopZodTransformInputSchema(schema, recursive = false) {
    const cache = /* @__PURE__ */ new WeakMap();
    return interopZodTransformInputSchemaImpl(schema, recursive, cache);
}
/**
* Creates a modified version of a Zod object schema where fields matching a predicate are made optional.
* Supports both Zod v3 and v4 schemas and preserves the original schema version.
*
* @template T - The type of the Zod object schema.
* @param {T} schema - The Zod object schema instance (either v3 or v4).
* @param {(key: string, value: InteropZodType) => boolean} predicate - Function to determine which fields should be optional.
* @returns {InteropZodObject} The modified Zod object schema.
* @throws {Error} If the schema is not a Zod v3 or v4 object.
*/ function interopZodObjectMakeFieldsOptional(schema, predicate) {
    if (isZodSchemaV3(schema)) {
        const shape = getInteropZodObjectShape(schema);
        const modifiedShape = {};
        for (const [key, value] of Object.entries(shape))if (predicate(key, value)) modifiedShape[key] = value.optional();
        else modifiedShape[key] = value;
        return schema.extend(modifiedShape);
    }
    if (isZodSchemaV4(schema)) {
        const shape = getInteropZodObjectShape(schema);
        const outputShape = {
            ...schema._zod.def.shape
        };
        for (const [key, value] of Object.entries(shape))if (predicate(key, value)) outputShape[key] = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$core$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["$ZodOptional"]({
            type: "optional",
            innerType: value
        });
        const modifiedSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$core$2f$schemas$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clone"])(schema, {
            ...schema._zod.def,
            shape: outputShape
        });
        const meta = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$core$2f$registries$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["globalRegistry"].get(schema);
        if (meta) __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$core$2f$registries$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["globalRegistry"].add(modifiedSchema, meta);
        return modifiedSchema;
    }
    throw new Error("Schema must be an instance of z3.ZodObject or z4.$ZodObject");
}
function isInteropZodError(e) {
    return e instanceof Error && (e.constructor.name === "ZodError" || e.constructor.name === "$ZodError");
}
;
 //# sourceMappingURL=zod.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/Options.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

//#region src/utils/zod-to-json-schema/Options.ts
__turbopack_context__.s([
    "defaultOptions",
    ()=>defaultOptions,
    "getDefaultOptions",
    ()=>getDefaultOptions,
    "ignoreOverride",
    ()=>ignoreOverride
]);
const ignoreOverride = Symbol("Let zodToJsonSchema decide on which parser to use");
const defaultOptions = {
    name: void 0,
    $refStrategy: "root",
    basePath: [
        "#"
    ],
    effectStrategy: "input",
    pipeStrategy: "all",
    dateStrategy: "format:date-time",
    mapStrategy: "entries",
    removeAdditionalStrategy: "passthrough",
    allowedAdditionalProperties: true,
    rejectedAdditionalProperties: false,
    definitionPath: "definitions",
    target: "jsonSchema7",
    strictUnions: false,
    definitions: {},
    errorMessages: false,
    markdownDescription: false,
    patternStrategy: "escape",
    applyRegexFlags: false,
    emailStrategy: "format:email",
    base64Strategy: "contentEncoding:base64",
    nameStrategy: "ref",
    openAiAnyTypeName: "OpenAiAnyType"
};
const getDefaultOptions = (options)=>typeof options === "string" ? {
        ...defaultOptions,
        name: options
    } : {
        ...defaultOptions,
        ...options
    };
;
 //# sourceMappingURL=Options.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/Refs.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getRefs",
    ()=>getRefs
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$Options$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/Options.js [app-route] (ecmascript)");
;
//#region src/utils/zod-to-json-schema/Refs.ts
const getRefs = (options)=>{
    const _options = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$Options$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDefaultOptions"])(options);
    const currentPath = _options.name !== void 0 ? [
        ..._options.basePath,
        _options.definitionPath,
        _options.name
    ] : _options.basePath;
    return {
        ..._options,
        flags: {
            hasReferencedOpenAiAnyType: false
        },
        currentPath,
        propertyPath: void 0,
        seen: new Map(Object.entries(_options.definitions).map(([name, def])=>[
                def._def,
                {
                    def: def._def,
                    path: [
                        ..._options.basePath,
                        _options.definitionPath,
                        name
                    ],
                    jsonSchema: void 0
                }
            ]))
    };
};
;
 //# sourceMappingURL=Refs.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/getRelativePath.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

//#region src/utils/zod-to-json-schema/getRelativePath.ts
__turbopack_context__.s([
    "getRelativePath",
    ()=>getRelativePath
]);
const getRelativePath = (pathA, pathB)=>{
    let i = 0;
    for(; i < pathA.length && i < pathB.length; i++)if (pathA[i] !== pathB[i]) break;
    return [
        (pathA.length - i).toString(),
        ...pathB.slice(i)
    ].join("/");
};
;
 //# sourceMappingURL=getRelativePath.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/any.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseAnyDef",
    ()=>parseAnyDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$getRelativePath$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/getRelativePath.js [app-route] (ecmascript)");
;
//#region src/utils/zod-to-json-schema/parsers/any.ts
function parseAnyDef(refs) {
    if (refs.target !== "openAi") return {};
    const anyDefinitionPath = [
        ...refs.basePath,
        refs.definitionPath,
        refs.openAiAnyTypeName
    ];
    refs.flags.hasReferencedOpenAiAnyType = true;
    return {
        $ref: refs.$refStrategy === "relative" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$getRelativePath$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getRelativePath"])(anyDefinitionPath, refs.currentPath) : anyDefinitionPath.join("/")
    };
}
;
 //# sourceMappingURL=any.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/errorMessages.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

//#region src/utils/zod-to-json-schema/errorMessages.ts
__turbopack_context__.s([
    "addErrorMessage",
    ()=>addErrorMessage,
    "setResponseValueAndErrors",
    ()=>setResponseValueAndErrors
]);
function addErrorMessage(res, key, errorMessage, refs) {
    if (!refs?.errorMessages) return;
    if (errorMessage) res.errorMessage = {
        ...res.errorMessage,
        [key]: errorMessage
    };
}
function setResponseValueAndErrors(res, key, value, errorMessage, refs) {
    res[key] = value;
    addErrorMessage(res, key, errorMessage, refs);
}
;
 //# sourceMappingURL=errorMessages.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/array.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseArrayDef",
    ()=>parseArrayDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/errorMessages.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parseDef.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/v3/types.js [app-route] (ecmascript)");
;
;
;
//#region src/utils/zod-to-json-schema/parsers/array.ts
function parseArrayDef(def, refs) {
    const res = {
        type: "array"
    };
    if (def.type?._def && def.type?._def?.typeName !== __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodAny) res.items = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseDef"])(def.type._def, {
        ...refs,
        currentPath: [
            ...refs.currentPath,
            "items"
        ]
    });
    if (def.minLength) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "minItems", def.minLength.value, def.minLength.message, refs);
    if (def.maxLength) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "maxItems", def.maxLength.value, def.maxLength.message, refs);
    if (def.exactLength) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "minItems", def.exactLength.value, def.exactLength.message, refs);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "maxItems", def.exactLength.value, def.exactLength.message, refs);
    }
    return res;
}
;
 //# sourceMappingURL=array.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/bigint.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseBigintDef",
    ()=>parseBigintDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/errorMessages.js [app-route] (ecmascript)");
;
//#region src/utils/zod-to-json-schema/parsers/bigint.ts
function parseBigintDef(def, refs) {
    const res = {
        type: "integer",
        format: "int64"
    };
    if (!def.checks) return res;
    for (const check of def.checks)switch(check.kind){
        case "min":
            if (refs.target === "jsonSchema7") if (check.inclusive) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "minimum", check.value, check.message, refs);
            else (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "exclusiveMinimum", check.value, check.message, refs);
            else {
                if (!check.inclusive) res.exclusiveMinimum = true;
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "minimum", check.value, check.message, refs);
            }
            break;
        case "max":
            if (refs.target === "jsonSchema7") if (check.inclusive) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "maximum", check.value, check.message, refs);
            else (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "exclusiveMaximum", check.value, check.message, refs);
            else {
                if (!check.inclusive) res.exclusiveMaximum = true;
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "maximum", check.value, check.message, refs);
            }
            break;
        case "multipleOf":
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "multipleOf", check.value, check.message, refs);
            break;
    }
    return res;
}
;
 //# sourceMappingURL=bigint.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/boolean.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

//#region src/utils/zod-to-json-schema/parsers/boolean.ts
__turbopack_context__.s([
    "parseBooleanDef",
    ()=>parseBooleanDef
]);
function parseBooleanDef() {
    return {
        type: "boolean"
    };
}
;
 //# sourceMappingURL=boolean.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/branded.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseBrandedDef",
    ()=>parseBrandedDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parseDef.js [app-route] (ecmascript)");
;
//#region src/utils/zod-to-json-schema/parsers/branded.ts
function parseBrandedDef(_def, refs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseDef"])(_def.type._def, refs);
}
;
 //# sourceMappingURL=branded.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/catch.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseCatchDef",
    ()=>parseCatchDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parseDef.js [app-route] (ecmascript)");
;
//#region src/utils/zod-to-json-schema/parsers/catch.ts
const parseCatchDef = (def, refs)=>{
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseDef"])(def.innerType._def, refs);
};
;
 //# sourceMappingURL=catch.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/date.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseDateDef",
    ()=>parseDateDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/errorMessages.js [app-route] (ecmascript)");
;
//#region src/utils/zod-to-json-schema/parsers/date.ts
function parseDateDef(def, refs, overrideDateStrategy) {
    const strategy = overrideDateStrategy ?? refs.dateStrategy;
    if (Array.isArray(strategy)) return {
        anyOf: strategy.map((item)=>parseDateDef(def, refs, item))
    };
    switch(strategy){
        case "string":
        case "format:date-time":
            return {
                type: "string",
                format: "date-time"
            };
        case "format:date":
            return {
                type: "string",
                format: "date"
            };
        case "integer":
            return integerDateParser(def, refs);
    }
}
const integerDateParser = (def, refs)=>{
    const res = {
        type: "integer",
        format: "unix-time"
    };
    if (refs.target === "openApi3") return res;
    for (const check of def.checks)switch(check.kind){
        case "min":
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "minimum", check.value, check.message, refs);
            break;
        case "max":
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "maximum", check.value, check.message, refs);
            break;
    }
    return res;
};
;
 //# sourceMappingURL=date.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/default.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseDefaultDef",
    ()=>parseDefaultDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parseDef.js [app-route] (ecmascript)");
;
//#region src/utils/zod-to-json-schema/parsers/default.ts
function parseDefaultDef(_def, refs) {
    return {
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseDef"])(_def.innerType._def, refs),
        default: _def.defaultValue()
    };
}
;
 //# sourceMappingURL=default.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/effects.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseEffectsDef",
    ()=>parseEffectsDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/any.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parseDef.js [app-route] (ecmascript)");
;
;
//#region src/utils/zod-to-json-schema/parsers/effects.ts
function parseEffectsDef(_def, refs) {
    return refs.effectStrategy === "input" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseDef"])(_def.schema._def, refs) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseAnyDef"])(refs);
}
;
 //# sourceMappingURL=effects.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/enum.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

//#region src/utils/zod-to-json-schema/parsers/enum.ts
__turbopack_context__.s([
    "parseEnumDef",
    ()=>parseEnumDef
]);
function parseEnumDef(def) {
    return {
        type: "string",
        enum: Array.from(def.values)
    };
}
;
 //# sourceMappingURL=enum.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/intersection.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseIntersectionDef",
    ()=>parseIntersectionDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parseDef.js [app-route] (ecmascript)");
;
//#region src/utils/zod-to-json-schema/parsers/intersection.ts
const isJsonSchema7AllOfType = (type)=>{
    if ("type" in type && type.type === "string") return false;
    return "allOf" in type;
};
function parseIntersectionDef(def, refs) {
    const allOf = [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseDef"])(def.left._def, {
            ...refs,
            currentPath: [
                ...refs.currentPath,
                "allOf",
                "0"
            ]
        }),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseDef"])(def.right._def, {
            ...refs,
            currentPath: [
                ...refs.currentPath,
                "allOf",
                "1"
            ]
        })
    ].filter((x)=>!!x);
    let unevaluatedProperties = refs.target === "jsonSchema2019-09" ? {
        unevaluatedProperties: false
    } : void 0;
    const mergedAllOf = [];
    allOf.forEach((schema)=>{
        if (isJsonSchema7AllOfType(schema)) {
            mergedAllOf.push(...schema.allOf);
            if (schema.unevaluatedProperties === void 0) unevaluatedProperties = void 0;
        } else {
            let nestedSchema = schema;
            if ("additionalProperties" in schema && schema.additionalProperties === false) {
                const { additionalProperties, ...rest } = schema;
                nestedSchema = rest;
            } else unevaluatedProperties = void 0;
            mergedAllOf.push(nestedSchema);
        }
    });
    return mergedAllOf.length ? {
        allOf: mergedAllOf,
        ...unevaluatedProperties
    } : void 0;
}
;
 //# sourceMappingURL=intersection.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/literal.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

//#region src/utils/zod-to-json-schema/parsers/literal.ts
__turbopack_context__.s([
    "parseLiteralDef",
    ()=>parseLiteralDef
]);
function parseLiteralDef(def, refs) {
    const parsedType = typeof def.value;
    if (parsedType !== "bigint" && parsedType !== "number" && parsedType !== "boolean" && parsedType !== "string") return {
        type: Array.isArray(def.value) ? "array" : "object"
    };
    if (refs.target === "openApi3") return {
        type: parsedType === "bigint" ? "integer" : parsedType,
        enum: [
            def.value
        ]
    };
    return {
        type: parsedType === "bigint" ? "integer" : parsedType,
        const: def.value
    };
}
;
 //# sourceMappingURL=literal.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/string.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseStringDef",
    ()=>parseStringDef,
    "zodPatterns",
    ()=>zodPatterns
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/errorMessages.js [app-route] (ecmascript)");
;
//#region src/utils/zod-to-json-schema/parsers/string.ts
let emojiRegex = void 0;
/**
* Generated from the regular expressions found here as of 2024-05-22:
* https://github.com/colinhacks/zod/blob/master/src/types.ts.
*
* Expressions with /i flag have been changed accordingly.
*/ const zodPatterns = {
    cuid: /^[cC][^\s-]{8,}$/,
    cuid2: /^[0-9a-z]+$/,
    ulid: /^[0-9A-HJKMNP-TV-Z]{26}$/,
    email: /^(?!\.)(?!.*\.\.)([a-zA-Z0-9_'+\-\.]*)[a-zA-Z0-9_+-]@([a-zA-Z0-9][a-zA-Z0-9\-]*\.)+[a-zA-Z]{2,}$/,
    emoji: ()=>{
        if (emojiRegex === void 0) emojiRegex = RegExp("^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$", "u");
        return emojiRegex;
    },
    uuid: /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/,
    ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,
    ipv4Cidr: /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/,
    ipv6: /^(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$/,
    ipv6Cidr: /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,
    base64: /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/,
    base64url: /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/,
    nanoid: /^[a-zA-Z0-9_-]{21}$/,
    jwt: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/
};
function parseStringDef(def, refs) {
    const res = {
        type: "string"
    };
    if (def.checks) for (const check of def.checks)switch(check.kind){
        case "min":
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "minLength", typeof res.minLength === "number" ? Math.max(res.minLength, check.value) : check.value, check.message, refs);
            break;
        case "max":
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "maxLength", typeof res.maxLength === "number" ? Math.min(res.maxLength, check.value) : check.value, check.message, refs);
            break;
        case "email":
            switch(refs.emailStrategy){
                case "format:email":
                    addFormat(res, "email", check.message, refs);
                    break;
                case "format:idn-email":
                    addFormat(res, "idn-email", check.message, refs);
                    break;
                case "pattern:zod":
                    addPattern(res, zodPatterns.email, check.message, refs);
                    break;
            }
            break;
        case "url":
            addFormat(res, "uri", check.message, refs);
            break;
        case "uuid":
            addFormat(res, "uuid", check.message, refs);
            break;
        case "regex":
            addPattern(res, check.regex, check.message, refs);
            break;
        case "cuid":
            addPattern(res, zodPatterns.cuid, check.message, refs);
            break;
        case "cuid2":
            addPattern(res, zodPatterns.cuid2, check.message, refs);
            break;
        case "startsWith":
            addPattern(res, RegExp(`^${escapeLiteralCheckValue(check.value, refs)}`), check.message, refs);
            break;
        case "endsWith":
            addPattern(res, RegExp(`${escapeLiteralCheckValue(check.value, refs)}$`), check.message, refs);
            break;
        case "datetime":
            addFormat(res, "date-time", check.message, refs);
            break;
        case "date":
            addFormat(res, "date", check.message, refs);
            break;
        case "time":
            addFormat(res, "time", check.message, refs);
            break;
        case "duration":
            addFormat(res, "duration", check.message, refs);
            break;
        case "length":
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "minLength", typeof res.minLength === "number" ? Math.max(res.minLength, check.value) : check.value, check.message, refs);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "maxLength", typeof res.maxLength === "number" ? Math.min(res.maxLength, check.value) : check.value, check.message, refs);
            break;
        case "includes":
            addPattern(res, RegExp(escapeLiteralCheckValue(check.value, refs)), check.message, refs);
            break;
        case "ip":
            if (check.version !== "v6") addFormat(res, "ipv4", check.message, refs);
            if (check.version !== "v4") addFormat(res, "ipv6", check.message, refs);
            break;
        case "base64url":
            addPattern(res, zodPatterns.base64url, check.message, refs);
            break;
        case "jwt":
            addPattern(res, zodPatterns.jwt, check.message, refs);
            break;
        case "cidr":
            if (check.version !== "v6") addPattern(res, zodPatterns.ipv4Cidr, check.message, refs);
            if (check.version !== "v4") addPattern(res, zodPatterns.ipv6Cidr, check.message, refs);
            break;
        case "emoji":
            addPattern(res, zodPatterns.emoji(), check.message, refs);
            break;
        case "ulid":
            addPattern(res, zodPatterns.ulid, check.message, refs);
            break;
        case "base64":
            switch(refs.base64Strategy){
                case "format:binary":
                    addFormat(res, "binary", check.message, refs);
                    break;
                case "contentEncoding:base64":
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "contentEncoding", "base64", check.message, refs);
                    break;
                case "pattern:zod":
                    addPattern(res, zodPatterns.base64, check.message, refs);
                    break;
            }
            break;
        case "nanoid":
            addPattern(res, zodPatterns.nanoid, check.message, refs);
            break;
        case "toLowerCase":
        case "toUpperCase":
        case "trim":
            break;
        default:
            /* c8 ignore next */ ((_)=>{})(check);
    }
    return res;
}
function escapeLiteralCheckValue(literal, refs) {
    return refs.patternStrategy === "escape" ? escapeNonAlphaNumeric(literal) : literal;
}
const ALPHA_NUMERIC = /* @__PURE__ */ new Set("ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvxyz0123456789");
function escapeNonAlphaNumeric(source) {
    let result = "";
    for(let i = 0; i < source.length; i++){
        if (!ALPHA_NUMERIC.has(source[i])) result += "\\";
        result += source[i];
    }
    return result;
}
function addFormat(schema, value, message, refs) {
    if (schema.format || schema.anyOf?.some((x)=>x.format)) {
        if (!schema.anyOf) schema.anyOf = [];
        if (schema.format) {
            schema.anyOf.push({
                format: schema.format,
                ...schema.errorMessage && refs.errorMessages && {
                    errorMessage: {
                        format: schema.errorMessage.format
                    }
                }
            });
            delete schema.format;
            if (schema.errorMessage) {
                delete schema.errorMessage.format;
                if (Object.keys(schema.errorMessage).length === 0) delete schema.errorMessage;
            }
        }
        schema.anyOf.push({
            format: value,
            ...message && refs.errorMessages && {
                errorMessage: {
                    format: message
                }
            }
        });
    } else (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(schema, "format", value, message, refs);
}
function addPattern(schema, regex, message, refs) {
    if (schema.pattern || schema.allOf?.some((x)=>x.pattern)) {
        if (!schema.allOf) schema.allOf = [];
        if (schema.pattern) {
            schema.allOf.push({
                pattern: schema.pattern,
                ...schema.errorMessage && refs.errorMessages && {
                    errorMessage: {
                        pattern: schema.errorMessage.pattern
                    }
                }
            });
            delete schema.pattern;
            if (schema.errorMessage) {
                delete schema.errorMessage.pattern;
                if (Object.keys(schema.errorMessage).length === 0) delete schema.errorMessage;
            }
        }
        schema.allOf.push({
            pattern: stringifyRegExpWithFlags(regex, refs),
            ...message && refs.errorMessages && {
                errorMessage: {
                    pattern: message
                }
            }
        });
    } else (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(schema, "pattern", stringifyRegExpWithFlags(regex, refs), message, refs);
}
function stringifyRegExpWithFlags(regex, refs) {
    if (!refs.applyRegexFlags || !regex.flags) return regex.source;
    const flags = {
        i: regex.flags.includes("i"),
        m: regex.flags.includes("m"),
        s: regex.flags.includes("s")
    };
    const source = flags.i ? regex.source.toLowerCase() : regex.source;
    let pattern = "";
    let isEscaped = false;
    let inCharGroup = false;
    let inCharRange = false;
    for(let i = 0; i < source.length; i++){
        if (isEscaped) {
            pattern += source[i];
            isEscaped = false;
            continue;
        }
        if (flags.i) {
            if (inCharGroup) {
                if (source[i].match(/[a-z]/)) {
                    if (inCharRange) {
                        pattern += source[i];
                        pattern += `${source[i - 2]}-${source[i]}`.toUpperCase();
                        inCharRange = false;
                    } else if (source[i + 1] === "-" && source[i + 2]?.match(/[a-z]/)) {
                        pattern += source[i];
                        inCharRange = true;
                    } else pattern += `${source[i]}${source[i].toUpperCase()}`;
                    continue;
                }
            } else if (source[i].match(/[a-z]/)) {
                pattern += `[${source[i]}${source[i].toUpperCase()}]`;
                continue;
            }
        }
        if (flags.m) {
            if (source[i] === "^") {
                pattern += `(^|(?<=[\r\n]))`;
                continue;
            } else if (source[i] === "$") {
                pattern += `($|(?=[\r\n]))`;
                continue;
            }
        }
        if (flags.s && source[i] === ".") {
            pattern += inCharGroup ? `${source[i]}\r\n` : `[${source[i]}\r\n]`;
            continue;
        }
        pattern += source[i];
        if (source[i] === "\\") isEscaped = true;
        else if (inCharGroup && source[i] === "]") inCharGroup = false;
        else if (!inCharGroup && source[i] === "[") inCharGroup = true;
    }
    try {
        new RegExp(pattern);
    } catch  {
        console.warn(`Could not convert regex pattern at ${refs.currentPath.join("/")} to a flag-independent form! Falling back to the flag-ignorant source`);
        return regex.source;
    }
    return pattern;
}
;
 //# sourceMappingURL=string.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/record.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseRecordDef",
    ()=>parseRecordDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/any.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$branded$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/branded.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$string$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/string.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parseDef.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/v3/types.js [app-route] (ecmascript)");
;
;
;
;
;
//#region src/utils/zod-to-json-schema/parsers/record.ts
function parseRecordDef(def, refs) {
    if (refs.target === "openAi") console.warn("Warning: OpenAI may not support records in schemas! Try an array of key-value pairs instead.");
    if (refs.target === "openApi3" && def.keyType?._def.typeName === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodEnum) return {
        type: "object",
        required: def.keyType._def.values,
        properties: def.keyType._def.values.reduce((acc, key)=>({
                ...acc,
                [key]: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseDef"])(def.valueType._def, {
                    ...refs,
                    currentPath: [
                        ...refs.currentPath,
                        "properties",
                        key
                    ]
                }) ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseAnyDef"])(refs)
            }), {}),
        additionalProperties: refs.rejectedAdditionalProperties
    };
    const schema = {
        type: "object",
        additionalProperties: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseDef"])(def.valueType._def, {
            ...refs,
            currentPath: [
                ...refs.currentPath,
                "additionalProperties"
            ]
        }) ?? refs.allowedAdditionalProperties
    };
    if (refs.target === "openApi3") return schema;
    if (def.keyType?._def.typeName === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodString && def.keyType._def.checks?.length) {
        const { type, ...keyType } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$string$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseStringDef"])(def.keyType._def, refs);
        return {
            ...schema,
            propertyNames: keyType
        };
    } else if (def.keyType?._def.typeName === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodEnum) return {
        ...schema,
        propertyNames: {
            enum: def.keyType._def.values
        }
    };
    else if (def.keyType?._def.typeName === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodBranded && def.keyType._def.type._def.typeName === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodString && def.keyType._def.type._def.checks?.length) {
        const { type, ...keyType } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$branded$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseBrandedDef"])(def.keyType._def, refs);
        return {
            ...schema,
            propertyNames: keyType
        };
    }
    return schema;
}
;
 //# sourceMappingURL=record.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/map.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseMapDef",
    ()=>parseMapDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/any.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$record$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/record.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parseDef.js [app-route] (ecmascript)");
;
;
;
//#region src/utils/zod-to-json-schema/parsers/map.ts
function parseMapDef(def, refs) {
    if (refs.mapStrategy === "record") return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$record$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseRecordDef"])(def, refs);
    const keys = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseDef"])(def.keyType._def, {
        ...refs,
        currentPath: [
            ...refs.currentPath,
            "items",
            "items",
            "0"
        ]
    }) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseAnyDef"])(refs);
    const values = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseDef"])(def.valueType._def, {
        ...refs,
        currentPath: [
            ...refs.currentPath,
            "items",
            "items",
            "1"
        ]
    }) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseAnyDef"])(refs);
    return {
        type: "array",
        maxItems: 125,
        items: {
            type: "array",
            items: [
                keys,
                values
            ],
            minItems: 2,
            maxItems: 2
        }
    };
}
;
 //# sourceMappingURL=map.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/nativeEnum.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

//#region src/utils/zod-to-json-schema/parsers/nativeEnum.ts
__turbopack_context__.s([
    "parseNativeEnumDef",
    ()=>parseNativeEnumDef
]);
function parseNativeEnumDef(def) {
    const object = def.values;
    const actualKeys = Object.keys(def.values).filter((key)=>{
        return typeof object[object[key]] !== "number";
    });
    const actualValues = actualKeys.map((key)=>object[key]);
    const parsedTypes = Array.from(new Set(actualValues.map((values)=>typeof values)));
    return {
        type: parsedTypes.length === 1 ? parsedTypes[0] === "string" ? "string" : "number" : [
            "string",
            "number"
        ],
        enum: actualValues
    };
}
;
 //# sourceMappingURL=nativeEnum.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/never.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseNeverDef",
    ()=>parseNeverDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/any.js [app-route] (ecmascript)");
;
//#region src/utils/zod-to-json-schema/parsers/never.ts
function parseNeverDef(refs) {
    return refs.target === "openAi" ? void 0 : {
        not: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseAnyDef"])({
            ...refs,
            currentPath: [
                ...refs.currentPath,
                "not"
            ]
        })
    };
}
;
 //# sourceMappingURL=never.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/null.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

//#region src/utils/zod-to-json-schema/parsers/null.ts
__turbopack_context__.s([
    "parseNullDef",
    ()=>parseNullDef
]);
function parseNullDef(refs) {
    return refs.target === "openApi3" ? {
        enum: [
            "null"
        ],
        nullable: true
    } : {
        type: "null"
    };
}
;
 //# sourceMappingURL=null.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/union.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseUnionDef",
    ()=>parseUnionDef,
    "primitiveMappings",
    ()=>primitiveMappings
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parseDef.js [app-route] (ecmascript)");
;
//#region src/utils/zod-to-json-schema/parsers/union.ts
const primitiveMappings = {
    ZodString: "string",
    ZodNumber: "number",
    ZodBigInt: "integer",
    ZodBoolean: "boolean",
    ZodNull: "null"
};
function parseUnionDef(def, refs) {
    if (refs.target === "openApi3") return asAnyOf(def, refs);
    const options = def.options instanceof Map ? Array.from(def.options.values()) : def.options;
    if (options.every((x)=>x._def.typeName in primitiveMappings && (!x._def.checks || !x._def.checks.length))) {
        const types = options.reduce((types$1, x)=>{
            const type = primitiveMappings[x._def.typeName];
            return type && !types$1.includes(type) ? [
                ...types$1,
                type
            ] : types$1;
        }, []);
        return {
            type: types.length > 1 ? types : types[0]
        };
    } else if (options.every((x)=>x._def.typeName === "ZodLiteral" && !x.description)) {
        const types = options.reduce((acc, x)=>{
            const type = typeof x._def.value;
            switch(type){
                case "string":
                case "number":
                case "boolean":
                    return [
                        ...acc,
                        type
                    ];
                case "bigint":
                    return [
                        ...acc,
                        "integer"
                    ];
                case "object":
                    if (x._def.value === null) return [
                        ...acc,
                        "null"
                    ];
                    return acc;
                case "symbol":
                case "undefined":
                case "function":
                default:
                    return acc;
            }
        }, []);
        if (types.length === options.length) {
            const uniqueTypes = types.filter((x, i, a)=>a.indexOf(x) === i);
            return {
                type: uniqueTypes.length > 1 ? uniqueTypes : uniqueTypes[0],
                enum: options.reduce((acc, x)=>{
                    return acc.includes(x._def.value) ? acc : [
                        ...acc,
                        x._def.value
                    ];
                }, [])
            };
        }
    } else if (options.every((x)=>x._def.typeName === "ZodEnum")) return {
        type: "string",
        enum: options.reduce((acc, x)=>[
                ...acc,
                ...x._def.values.filter((x$1)=>!acc.includes(x$1))
            ], [])
    };
    return asAnyOf(def, refs);
}
const asAnyOf = (def, refs)=>{
    const anyOf = (def.options instanceof Map ? Array.from(def.options.values()) : def.options).map((x, i)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseDef"])(x._def, {
            ...refs,
            currentPath: [
                ...refs.currentPath,
                "anyOf",
                `${i}`
            ]
        })).filter((x)=>!!x && (!refs.strictUnions || typeof x === "object" && Object.keys(x).length > 0));
    return anyOf.length ? {
        anyOf
    } : void 0;
};
;
 //# sourceMappingURL=union.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/nullable.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseNullableDef",
    ()=>parseNullableDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$union$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/union.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parseDef.js [app-route] (ecmascript)");
;
;
//#region src/utils/zod-to-json-schema/parsers/nullable.ts
function parseNullableDef(def, refs) {
    if ([
        "ZodString",
        "ZodNumber",
        "ZodBigInt",
        "ZodBoolean",
        "ZodNull"
    ].includes(def.innerType._def.typeName) && (!def.innerType._def.checks || !def.innerType._def.checks.length)) {
        if (refs.target === "openApi3") return {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$union$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["primitiveMappings"][def.innerType._def.typeName],
            nullable: true
        };
        return {
            type: [
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$union$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["primitiveMappings"][def.innerType._def.typeName],
                "null"
            ]
        };
    }
    if (refs.target === "openApi3") {
        const base$1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseDef"])(def.innerType._def, {
            ...refs,
            currentPath: [
                ...refs.currentPath
            ]
        });
        if (base$1 && "$ref" in base$1) return {
            allOf: [
                base$1
            ],
            nullable: true
        };
        return base$1 && {
            ...base$1,
            nullable: true
        };
    }
    const base = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseDef"])(def.innerType._def, {
        ...refs,
        currentPath: [
            ...refs.currentPath,
            "anyOf",
            "0"
        ]
    });
    return base && {
        anyOf: [
            base,
            {
                type: "null"
            }
        ]
    };
}
;
 //# sourceMappingURL=nullable.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/number.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseNumberDef",
    ()=>parseNumberDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/errorMessages.js [app-route] (ecmascript)");
;
//#region src/utils/zod-to-json-schema/parsers/number.ts
function parseNumberDef(def, refs) {
    const res = {
        type: "number"
    };
    if (!def.checks) return res;
    for (const check of def.checks)switch(check.kind){
        case "int":
            res.type = "integer";
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addErrorMessage"])(res, "type", check.message, refs);
            break;
        case "min":
            if (refs.target === "jsonSchema7") if (check.inclusive) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "minimum", check.value, check.message, refs);
            else (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "exclusiveMinimum", check.value, check.message, refs);
            else {
                if (!check.inclusive) res.exclusiveMinimum = true;
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "minimum", check.value, check.message, refs);
            }
            break;
        case "max":
            if (refs.target === "jsonSchema7") if (check.inclusive) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "maximum", check.value, check.message, refs);
            else (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "exclusiveMaximum", check.value, check.message, refs);
            else {
                if (!check.inclusive) res.exclusiveMaximum = true;
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "maximum", check.value, check.message, refs);
            }
            break;
        case "multipleOf":
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(res, "multipleOf", check.value, check.message, refs);
            break;
    }
    return res;
}
;
 //# sourceMappingURL=number.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/object.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseObjectDef",
    ()=>parseObjectDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parseDef.js [app-route] (ecmascript)");
;
//#region src/utils/zod-to-json-schema/parsers/object.ts
function parseObjectDef(def, refs) {
    const forceOptionalIntoNullable = refs.target === "openAi";
    const result = {
        type: "object",
        properties: {}
    };
    const required = [];
    const shape = def.shape();
    for(const propName in shape){
        let propDef = shape[propName];
        if (propDef === void 0 || propDef._def === void 0) continue;
        let propOptional = safeIsOptional(propDef);
        if (propOptional && forceOptionalIntoNullable) {
            if (propDef._def.typeName === "ZodOptional") propDef = propDef._def.innerType;
            if (!propDef.isNullable()) propDef = propDef.nullable();
            propOptional = false;
        }
        const parsedDef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseDef"])(propDef._def, {
            ...refs,
            currentPath: [
                ...refs.currentPath,
                "properties",
                propName
            ],
            propertyPath: [
                ...refs.currentPath,
                "properties",
                propName
            ]
        });
        if (parsedDef === void 0) continue;
        result.properties[propName] = parsedDef;
        if (!propOptional) required.push(propName);
    }
    if (required.length) result.required = required;
    const additionalProperties = decideAdditionalProperties(def, refs);
    if (additionalProperties !== void 0) result.additionalProperties = additionalProperties;
    return result;
}
function decideAdditionalProperties(def, refs) {
    if (def.catchall._def.typeName !== "ZodNever") return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseDef"])(def.catchall._def, {
        ...refs,
        currentPath: [
            ...refs.currentPath,
            "additionalProperties"
        ]
    });
    switch(def.unknownKeys){
        case "passthrough":
            return refs.allowedAdditionalProperties;
        case "strict":
            return refs.rejectedAdditionalProperties;
        case "strip":
            return refs.removeAdditionalStrategy === "strict" ? refs.allowedAdditionalProperties : refs.rejectedAdditionalProperties;
    }
}
function safeIsOptional(schema) {
    try {
        return schema.isOptional();
    } catch  {
        return true;
    }
}
;
 //# sourceMappingURL=object.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/optional.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseOptionalDef",
    ()=>parseOptionalDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/any.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parseDef.js [app-route] (ecmascript)");
;
;
//#region src/utils/zod-to-json-schema/parsers/optional.ts
const parseOptionalDef = (def, refs)=>{
    if (refs.currentPath.toString() === refs.propertyPath?.toString()) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseDef"])(def.innerType._def, refs);
    const innerSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseDef"])(def.innerType._def, {
        ...refs,
        currentPath: [
            ...refs.currentPath,
            "anyOf",
            "1"
        ]
    });
    return innerSchema ? {
        anyOf: [
            {
                not: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseAnyDef"])(refs)
            },
            innerSchema
        ]
    } : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseAnyDef"])(refs);
};
;
 //# sourceMappingURL=optional.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/pipeline.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parsePipelineDef",
    ()=>parsePipelineDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parseDef.js [app-route] (ecmascript)");
;
//#region src/utils/zod-to-json-schema/parsers/pipeline.ts
const parsePipelineDef = (def, refs)=>{
    if (refs.pipeStrategy === "input") return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseDef"])(def.in._def, refs);
    else if (refs.pipeStrategy === "output") return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseDef"])(def.out._def, refs);
    const a = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseDef"])(def.in._def, {
        ...refs,
        currentPath: [
            ...refs.currentPath,
            "allOf",
            "0"
        ]
    });
    const b = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseDef"])(def.out._def, {
        ...refs,
        currentPath: [
            ...refs.currentPath,
            "allOf",
            a ? "1" : "0"
        ]
    });
    return {
        allOf: [
            a,
            b
        ].filter((x)=>x !== void 0)
    };
};
;
 //# sourceMappingURL=pipeline.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/promise.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parsePromiseDef",
    ()=>parsePromiseDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parseDef.js [app-route] (ecmascript)");
;
//#region src/utils/zod-to-json-schema/parsers/promise.ts
function parsePromiseDef(def, refs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseDef"])(def.type._def, refs);
}
;
 //# sourceMappingURL=promise.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/set.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseSetDef",
    ()=>parseSetDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/errorMessages.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parseDef.js [app-route] (ecmascript)");
;
;
//#region src/utils/zod-to-json-schema/parsers/set.ts
function parseSetDef(def, refs) {
    const items = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseDef"])(def.valueType._def, {
        ...refs,
        currentPath: [
            ...refs.currentPath,
            "items"
        ]
    });
    const schema = {
        type: "array",
        uniqueItems: true,
        items
    };
    if (def.minSize) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(schema, "minItems", def.minSize.value, def.minSize.message, refs);
    if (def.maxSize) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setResponseValueAndErrors"])(schema, "maxItems", def.maxSize.value, def.maxSize.message, refs);
    return schema;
}
;
 //# sourceMappingURL=set.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/tuple.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseTupleDef",
    ()=>parseTupleDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parseDef.js [app-route] (ecmascript)");
;
//#region src/utils/zod-to-json-schema/parsers/tuple.ts
function parseTupleDef(def, refs) {
    if (def.rest) return {
        type: "array",
        minItems: def.items.length,
        items: def.items.map((x, i)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseDef"])(x._def, {
                ...refs,
                currentPath: [
                    ...refs.currentPath,
                    "items",
                    `${i}`
                ]
            })).reduce((acc, x)=>x === void 0 ? acc : [
                ...acc,
                x
            ], []),
        additionalItems: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseDef"])(def.rest._def, {
            ...refs,
            currentPath: [
                ...refs.currentPath,
                "additionalItems"
            ]
        })
    };
    else return {
        type: "array",
        minItems: def.items.length,
        maxItems: def.items.length,
        items: def.items.map((x, i)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseDef"])(x._def, {
                ...refs,
                currentPath: [
                    ...refs.currentPath,
                    "items",
                    `${i}`
                ]
            })).reduce((acc, x)=>x === void 0 ? acc : [
                ...acc,
                x
            ], [])
    };
}
;
 //# sourceMappingURL=tuple.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/undefined.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseUndefinedDef",
    ()=>parseUndefinedDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/any.js [app-route] (ecmascript)");
;
//#region src/utils/zod-to-json-schema/parsers/undefined.ts
function parseUndefinedDef(refs) {
    return {
        not: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseAnyDef"])(refs)
    };
}
;
 //# sourceMappingURL=undefined.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/unknown.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseUnknownDef",
    ()=>parseUnknownDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/any.js [app-route] (ecmascript)");
;
//#region src/utils/zod-to-json-schema/parsers/unknown.ts
function parseUnknownDef(refs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseAnyDef"])(refs);
}
;
 //# sourceMappingURL=unknown.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/readonly.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseReadonlyDef",
    ()=>parseReadonlyDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parseDef.js [app-route] (ecmascript)");
;
//#region src/utils/zod-to-json-schema/parsers/readonly.ts
const parseReadonlyDef = (def, refs)=>{
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseDef"])(def.innerType._def, refs);
};
;
 //# sourceMappingURL=readonly.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/selectParser.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "selectParser",
    ()=>selectParser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/any.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$array$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/array.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$bigint$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/bigint.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$boolean$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/boolean.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$branded$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/branded.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$catch$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/catch.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$date$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/date.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$default$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/default.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$effects$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/effects.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$enum$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/enum.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$intersection$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/intersection.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$literal$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/literal.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$string$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/string.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$record$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/record.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$map$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/map.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$nativeEnum$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/nativeEnum.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$never$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/never.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$null$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/null.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$union$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/union.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$nullable$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/nullable.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$number$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/number.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$object$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/object.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$optional$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/optional.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$pipeline$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/pipeline.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$promise$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/promise.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$set$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/set.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$tuple$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/tuple.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$undefined$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/undefined.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$unknown$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/unknown.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$readonly$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/readonly.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/v3/types.js [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
//#region src/utils/zod-to-json-schema/selectParser.ts
const selectParser = (def, typeName, refs)=>{
    switch(typeName){
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodString:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$string$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseStringDef"])(def, refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodNumber:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$number$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseNumberDef"])(def, refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodObject:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$object$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseObjectDef"])(def, refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodBigInt:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$bigint$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseBigintDef"])(def, refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodBoolean:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$boolean$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseBooleanDef"])();
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodDate:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$date$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseDateDef"])(def, refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodUndefined:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$undefined$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseUndefinedDef"])(refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodNull:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$null$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseNullDef"])(refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodArray:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$array$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseArrayDef"])(def, refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodUnion:
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodDiscriminatedUnion:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$union$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseUnionDef"])(def, refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodIntersection:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$intersection$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseIntersectionDef"])(def, refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodTuple:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$tuple$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseTupleDef"])(def, refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodRecord:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$record$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseRecordDef"])(def, refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodLiteral:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$literal$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseLiteralDef"])(def, refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodEnum:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$enum$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseEnumDef"])(def);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodNativeEnum:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$nativeEnum$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseNativeEnumDef"])(def);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodNullable:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$nullable$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseNullableDef"])(def, refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodOptional:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$optional$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseOptionalDef"])(def, refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodMap:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$map$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseMapDef"])(def, refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodSet:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$set$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseSetDef"])(def, refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodLazy:
            return ()=>def.getter()._def;
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodPromise:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$promise$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parsePromiseDef"])(def, refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodNaN:
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodNever:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$never$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseNeverDef"])(refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodEffects:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$effects$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseEffectsDef"])(def, refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodAny:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseAnyDef"])(refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodUnknown:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$unknown$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseUnknownDef"])(refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodDefault:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$default$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseDefaultDef"])(def, refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodBranded:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$branded$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseBrandedDef"])(def, refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodReadonly:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$readonly$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseReadonlyDef"])(def, refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodCatch:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$catch$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseCatchDef"])(def, refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodPipeline:
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$pipeline$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parsePipelineDef"])(def, refs);
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodFunction:
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodVoid:
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodFirstPartyTypeKind"].ZodSymbol:
            return void 0;
        default:
            /* c8 ignore next */ return ((_)=>void 0)(typeName);
    }
};
;
 //# sourceMappingURL=selectParser.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parseDef.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseDef",
    ()=>parseDef
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$Options$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/Options.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$getRelativePath$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/getRelativePath.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/any.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$selectParser$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/selectParser.js [app-route] (ecmascript)");
;
;
;
;
//#region src/utils/zod-to-json-schema/parseDef.ts
function parseDef(def, refs, forceResolution = false) {
    const seenItem = refs.seen.get(def);
    if (refs.override) {
        const overrideResult = refs.override?.(def, refs, seenItem, forceResolution);
        if (overrideResult !== __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$Options$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ignoreOverride"]) return overrideResult;
    }
    if (seenItem && !forceResolution) {
        const seenSchema = get$ref(seenItem, refs);
        if (seenSchema !== void 0) return seenSchema;
    }
    const newItem = {
        def,
        path: refs.currentPath,
        jsonSchema: void 0
    };
    refs.seen.set(def, newItem);
    const jsonSchemaOrGetter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$selectParser$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["selectParser"])(def, def.typeName, refs);
    const jsonSchema = typeof jsonSchemaOrGetter === "function" ? parseDef(jsonSchemaOrGetter(), refs) : jsonSchemaOrGetter;
    if (jsonSchema) addMeta(def, refs, jsonSchema);
    if (refs.postProcess) {
        const postProcessResult = refs.postProcess(jsonSchema, def, refs);
        newItem.jsonSchema = jsonSchema;
        return postProcessResult;
    }
    newItem.jsonSchema = jsonSchema;
    return jsonSchema;
}
const get$ref = (item, refs)=>{
    switch(refs.$refStrategy){
        case "root":
            return {
                $ref: item.path.join("/")
            };
        case "relative":
            return {
                $ref: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$getRelativePath$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getRelativePath"])(refs.currentPath, item.path)
            };
        case "none":
        case "seen":
            if (item.path.length < refs.currentPath.length && item.path.every((value, index)=>refs.currentPath[index] === value)) {
                console.warn(`Recursive reference detected at ${refs.currentPath.join("/")}! Defaulting to any`);
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseAnyDef"])(refs);
            }
            return refs.$refStrategy === "seen" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseAnyDef"])(refs) : void 0;
    }
};
const addMeta = (def, refs, jsonSchema)=>{
    if (def.description) {
        jsonSchema.description = def.description;
        if (refs.markdownDescription) jsonSchema.markdownDescription = def.description;
    }
    return jsonSchema;
};
;
 //# sourceMappingURL=parseDef.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/zodToJsonSchema.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "zodToJsonSchema",
    ()=>zodToJsonSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$Refs$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/Refs.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/any.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parseDef.js [app-route] (ecmascript)");
;
;
;
//#region src/utils/zod-to-json-schema/zodToJsonSchema.ts
const zodToJsonSchema = (schema, options)=>{
    const refs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$Refs$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getRefs"])(options);
    let definitions = typeof options === "object" && options.definitions ? Object.entries(options.definitions).reduce((acc, [name$1, schema$1])=>({
            ...acc,
            [name$1]: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseDef"])(schema$1._def, {
                ...refs,
                currentPath: [
                    ...refs.basePath,
                    refs.definitionPath,
                    name$1
                ]
            }, true) ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseAnyDef"])(refs)
        }), {}) : void 0;
    const name = typeof options === "string" ? options : options?.nameStrategy === "title" ? void 0 : options?.name;
    const main = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseDef"])(schema._def, name === void 0 ? refs : {
        ...refs,
        currentPath: [
            ...refs.basePath,
            refs.definitionPath,
            name
        ]
    }, false) ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseAnyDef"])(refs);
    const title = typeof options === "object" && options.name !== void 0 && options.nameStrategy === "title" ? options.name : void 0;
    if (title !== void 0) main.title = title;
    if (refs.flags.hasReferencedOpenAiAnyType) {
        if (!definitions) definitions = {};
        if (!definitions[refs.openAiAnyTypeName]) definitions[refs.openAiAnyTypeName] = {
            type: [
                "string",
                "number",
                "integer",
                "boolean",
                "array",
                "null"
            ],
            items: {
                $ref: refs.$refStrategy === "relative" ? "1" : [
                    ...refs.basePath,
                    refs.definitionPath,
                    refs.openAiAnyTypeName
                ].join("/")
            }
        };
    }
    const combined = name === void 0 ? definitions ? {
        ...main,
        [refs.definitionPath]: definitions
    } : main : {
        $ref: [
            ...refs.$refStrategy === "relative" ? [] : refs.basePath,
            refs.definitionPath,
            name
        ].join("/"),
        [refs.definitionPath]: {
            ...definitions,
            [name]: main
        }
    };
    if (refs.target === "jsonSchema7") combined.$schema = "http://json-schema.org/draft-07/schema#";
    else if (refs.target === "jsonSchema2019-09" || refs.target === "openAi") combined.$schema = "https://json-schema.org/draft/2019-09/schema#";
    if (refs.target === "openAi" && ("anyOf" in combined || "oneOf" in combined || "allOf" in combined || "type" in combined && Array.isArray(combined.type))) console.warn("Warning: OpenAI may not support schemas with unions as roots! Try wrapping it in an object property.");
    return combined;
};
;
 //# sourceMappingURL=zodToJsonSchema.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/index.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$Options$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/Options.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$Refs$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/Refs.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$errorMessages$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/errorMessages.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$getRelativePath$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/getRelativePath.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$any$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/any.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$array$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/array.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$bigint$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/bigint.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$boolean$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/boolean.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$branded$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/branded.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$catch$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/catch.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$date$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/date.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$default$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/default.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$effects$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/effects.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$enum$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/enum.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$intersection$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/intersection.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$literal$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/literal.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$string$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/string.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$record$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/record.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$map$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/map.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$nativeEnum$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/nativeEnum.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$never$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/never.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$null$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/null.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$union$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/union.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$nullable$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/nullable.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$number$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/number.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$object$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/object.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$optional$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/optional.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$pipeline$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/pipeline.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$promise$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/promise.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$set$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/set.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$tuple$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/tuple.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$undefined$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/undefined.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$unknown$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/unknown.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parsers$2f$readonly$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parsers/readonly.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$selectParser$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/selectParser.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$parseDef$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/parseDef.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$zodToJsonSchema$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/zodToJsonSchema.js [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/json_schema.js [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "json_schema_exports",
    ()=>json_schema_exports,
    "toJsonSchema",
    ()=>toJsonSchema,
    "validatesOnlyStrings",
    ()=>validatesOnlyStrings
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/_virtual/rolldown_runtime.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/types/zod.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$zodToJsonSchema$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/zodToJsonSchema.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/zod-to-json-schema/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$core$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/v4/core/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$core$2f$to$2d$json$2d$schema$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/v4/core/to-json-schema.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$validator$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/validator.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$deep$2d$compare$2d$strict$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/deep-compare-strict.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$dereference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/dereference.js [app-route] (ecmascript)");
;
;
;
;
;
;
//#region src/utils/json_schema.ts
var json_schema_exports = {};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__export"])(json_schema_exports, {
    Validator: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$validator$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Validator"],
    deepCompareStrict: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$deep$2d$compare$2d$strict$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deepCompareStrict"],
    toJsonSchema: ()=>toJsonSchema,
    validatesOnlyStrings: ()=>validatesOnlyStrings
});
/**
* Converts a Zod schema or JSON schema to a JSON schema.
* @param schema - The schema to convert.
* @returns The converted schema.
*/ function toJsonSchema(schema) {
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isZodSchemaV4"])(schema)) {
        const inputSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["interopZodTransformInputSchema"])(schema, true);
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isZodObjectV4"])(inputSchema)) {
            const strictSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["interopZodObjectStrict"])(inputSchema, true);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$core$2f$to$2d$json$2d$schema$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toJSONSchema"])(strictSchema);
        } else return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$core$2f$to$2d$json$2d$schema$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toJSONSchema"])(schema);
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isZodSchemaV3"])(schema)) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$zod$2d$to$2d$json$2d$schema$2f$zodToJsonSchema$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["zodToJsonSchema"])(schema);
    return schema;
}
/**
* Validates if a JSON schema validates only strings. May return false negatives in some edge cases
* (like recursive or unresolvable refs).
*
* @param schema - The schema to validate.
* @returns `true` if the schema validates only strings, `false` otherwise.
*/ function validatesOnlyStrings(schema) {
    if (!schema || typeof schema !== "object" || Object.keys(schema).length === 0 || Array.isArray(schema)) return false;
    if ("type" in schema) {
        if (typeof schema.type === "string") return schema.type === "string";
        if (Array.isArray(schema.type)) return schema.type.every((t)=>t === "string");
        return false;
    }
    if ("enum" in schema) return Array.isArray(schema.enum) && schema.enum.length > 0 && schema.enum.every((val)=>typeof val === "string");
    if ("const" in schema) return typeof schema.const === "string";
    if ("allOf" in schema && Array.isArray(schema.allOf)) return schema.allOf.some((subschema)=>validatesOnlyStrings(subschema));
    if ("anyOf" in schema && Array.isArray(schema.anyOf) || "oneOf" in schema && Array.isArray(schema.oneOf)) {
        const subschemas = "anyOf" in schema ? schema.anyOf : schema.oneOf;
        return subschemas.length > 0 && subschemas.every((subschema)=>validatesOnlyStrings(subschema));
    }
    if ("not" in schema) return false;
    if ("$ref" in schema && typeof schema.$ref === "string") {
        const ref = schema.$ref;
        const resolved = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$dereference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dereference"])(schema);
        if (resolved[ref]) return validatesOnlyStrings(resolved[ref]);
        return false;
    }
    return false;
}
;
 //# sourceMappingURL=json_schema.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/fast-json-patch/src/helpers.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

//#region src/utils/fast-json-patch/src/helpers.ts
/*!
* https://github.com/Starcounter-Jack/JSON-Patch
* (c) 2017-2022 Joachim Wester
* MIT licensed
*/ __turbopack_context__.s([
    "PatchError",
    ()=>PatchError,
    "_deepClone",
    ()=>_deepClone,
    "_objectKeys",
    ()=>_objectKeys,
    "escapePathComponent",
    ()=>escapePathComponent,
    "hasOwnProperty",
    ()=>hasOwnProperty,
    "hasUndefined",
    ()=>hasUndefined,
    "isInteger",
    ()=>isInteger,
    "unescapePathComponent",
    ()=>unescapePathComponent
]);
const _hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwnProperty(obj, key) {
    return _hasOwnProperty.call(obj, key);
}
function _objectKeys(obj) {
    if (Array.isArray(obj)) {
        const keys$1 = new Array(obj.length);
        for(let k = 0; k < keys$1.length; k++)keys$1[k] = "" + k;
        return keys$1;
    }
    if (Object.keys) return Object.keys(obj);
    let keys = [];
    for(let i in obj)if (hasOwnProperty(obj, i)) keys.push(i);
    return keys;
}
/**
* Deeply clone the object.
* https://jsperf.com/deep-copy-vs-json-stringify-json-parse/25 (recursiveDeepCopy)
* @param  {any} obj value to clone
* @return {any} cloned obj
*/ function _deepClone(obj) {
    switch(typeof obj){
        case "object":
            return JSON.parse(JSON.stringify(obj));
        case "undefined":
            return null;
        default:
            return obj;
    }
}
function isInteger(str) {
    let i = 0;
    const len = str.length;
    let charCode;
    while(i < len){
        charCode = str.charCodeAt(i);
        if (charCode >= 48 && charCode <= 57) {
            i++;
            continue;
        }
        return false;
    }
    return true;
}
/**
* Escapes a json pointer path
* @param path The raw pointer
* @return the Escaped path
*/ function escapePathComponent(path) {
    if (path.indexOf("/") === -1 && path.indexOf("~") === -1) return path;
    return path.replace(/~/g, "~0").replace(/\//g, "~1");
}
/**
* Unescapes a json pointer path
* @param path The escaped pointer
* @return The unescaped path
*/ function unescapePathComponent(path) {
    return path.replace(/~1/g, "/").replace(/~0/g, "~");
}
/**
* Recursively checks whether an object has any undefined values inside.
*/ function hasUndefined(obj) {
    if (obj === void 0) return true;
    if (obj) {
        if (Array.isArray(obj)) {
            for(let i$1 = 0, len = obj.length; i$1 < len; i$1++)if (hasUndefined(obj[i$1])) return true;
        } else if (typeof obj === "object") {
            const objKeys = _objectKeys(obj);
            const objKeysLength = objKeys.length;
            for(var i = 0; i < objKeysLength; i++)if (hasUndefined(obj[objKeys[i]])) return true;
        }
    }
    return false;
}
function patchErrorMessageFormatter(message, args) {
    const messageParts = [
        message
    ];
    for(const key in args){
        const value = typeof args[key] === "object" ? JSON.stringify(args[key], null, 2) : args[key];
        if (typeof value !== "undefined") messageParts.push(`${key}: ${value}`);
    }
    return messageParts.join("\n");
}
var PatchError = class extends Error {
    constructor(message, name, index, operation, tree){
        super(patchErrorMessageFormatter(message, {
            name,
            index,
            operation,
            tree
        }));
        this.name = name;
        this.index = index;
        this.operation = operation;
        this.tree = tree;
        Object.setPrototypeOf(this, new.target.prototype);
        this.message = patchErrorMessageFormatter(message, {
            name,
            index,
            operation,
            tree
        });
    }
};
;
 //# sourceMappingURL=helpers.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/fast-json-patch/src/core.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "_areEquals",
    ()=>_areEquals,
    "applyOperation",
    ()=>applyOperation,
    "applyPatch",
    ()=>applyPatch,
    "applyReducer",
    ()=>applyReducer,
    "core_exports",
    ()=>core_exports,
    "getValueByPointer",
    ()=>getValueByPointer,
    "validate",
    ()=>validate,
    "validator",
    ()=>validator
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/_virtual/rolldown_runtime.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/fast-json-patch/src/helpers.js [app-route] (ecmascript)");
;
;
//#region src/utils/fast-json-patch/src/core.ts
var core_exports = {};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__export"])(core_exports, {
    JsonPatchError: ()=>JsonPatchError,
    _areEquals: ()=>_areEquals,
    applyOperation: ()=>applyOperation,
    applyPatch: ()=>applyPatch,
    applyReducer: ()=>applyReducer,
    deepClone: ()=>deepClone,
    getValueByPointer: ()=>getValueByPointer,
    validate: ()=>validate,
    validator: ()=>validator
});
const JsonPatchError = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PatchError"];
const deepClone = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["_deepClone"];
const objOps = {
    add: function(obj, key, document) {
        obj[key] = this.value;
        return {
            newDocument: document
        };
    },
    remove: function(obj, key, document) {
        var removed = obj[key];
        delete obj[key];
        return {
            newDocument: document,
            removed
        };
    },
    replace: function(obj, key, document) {
        var removed = obj[key];
        obj[key] = this.value;
        return {
            newDocument: document,
            removed
        };
    },
    move: function(obj, key, document) {
        let removed = getValueByPointer(document, this.path);
        if (removed) removed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["_deepClone"])(removed);
        const originalValue = applyOperation(document, {
            op: "remove",
            path: this.from
        }).removed;
        applyOperation(document, {
            op: "add",
            path: this.path,
            value: originalValue
        });
        return {
            newDocument: document,
            removed
        };
    },
    copy: function(obj, key, document) {
        const valueToCopy = getValueByPointer(document, this.from);
        applyOperation(document, {
            op: "add",
            path: this.path,
            value: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["_deepClone"])(valueToCopy)
        });
        return {
            newDocument: document
        };
    },
    test: function(obj, key, document) {
        return {
            newDocument: document,
            test: _areEquals(obj[key], this.value)
        };
    },
    _get: function(obj, key, document) {
        this.value = obj[key];
        return {
            newDocument: document
        };
    }
};
var arrOps = {
    add: function(arr, i, document) {
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isInteger"])(i)) arr.splice(i, 0, this.value);
        else arr[i] = this.value;
        return {
            newDocument: document,
            index: i
        };
    },
    remove: function(arr, i, document) {
        var removedList = arr.splice(i, 1);
        return {
            newDocument: document,
            removed: removedList[0]
        };
    },
    replace: function(arr, i, document) {
        var removed = arr[i];
        arr[i] = this.value;
        return {
            newDocument: document,
            removed
        };
    },
    move: objOps.move,
    copy: objOps.copy,
    test: objOps.test,
    _get: objOps._get
};
/**
* Retrieves a value from a JSON document by a JSON pointer.
* Returns the value.
*
* @param document The document to get the value from
* @param pointer an escaped JSON pointer
* @return The retrieved value
*/ function getValueByPointer(document, pointer) {
    if (pointer == "") return document;
    var getOriginalDestination = {
        op: "_get",
        path: pointer
    };
    applyOperation(document, getOriginalDestination);
    return getOriginalDestination.value;
}
/**
* Apply a single JSON Patch Operation on a JSON document.
* Returns the {newDocument, result} of the operation.
* It modifies the `document` and `operation` objects - it gets the values by reference.
* If you would like to avoid touching your values, clone them:
* `jsonpatch.applyOperation(document, jsonpatch._deepClone(operation))`.
*
* @param document The document to patch
* @param operation The operation to apply
* @param validateOperation `false` is without validation, `true` to use default jsonpatch's validation, or you can pass a `validateOperation` callback to be used for validation.
* @param mutateDocument Whether to mutate the original document or clone it before applying
* @param banPrototypeModifications Whether to ban modifications to `__proto__`, defaults to `true`.
* @return `{newDocument, result}` after the operation
*/ function applyOperation(document, operation, validateOperation = false, mutateDocument = true, banPrototypeModifications = true, index = 0) {
    if (validateOperation) if (typeof validateOperation == "function") validateOperation(operation, 0, document, operation.path);
    else validator(operation, 0);
    if (operation.path === "") {
        let returnValue = {
            newDocument: document
        };
        if (operation.op === "add") {
            returnValue.newDocument = operation.value;
            return returnValue;
        } else if (operation.op === "replace") {
            returnValue.newDocument = operation.value;
            returnValue.removed = document;
            return returnValue;
        } else if (operation.op === "move" || operation.op === "copy") {
            returnValue.newDocument = getValueByPointer(document, operation.from);
            if (operation.op === "move") returnValue.removed = document;
            return returnValue;
        } else if (operation.op === "test") {
            returnValue.test = _areEquals(document, operation.value);
            if (returnValue.test === false) throw new JsonPatchError("Test operation failed", "TEST_OPERATION_FAILED", index, operation, document);
            returnValue.newDocument = document;
            return returnValue;
        } else if (operation.op === "remove") {
            returnValue.removed = document;
            returnValue.newDocument = null;
            return returnValue;
        } else if (operation.op === "_get") {
            operation.value = document;
            return returnValue;
        } else if (validateOperation) throw new JsonPatchError("Operation `op` property is not one of operations defined in RFC-6902", "OPERATION_OP_INVALID", index, operation, document);
        else return returnValue;
    } else {
        if (!mutateDocument) document = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["_deepClone"])(document);
        const path = operation.path || "";
        const keys = path.split("/");
        let obj = document;
        let t = 1;
        let len = keys.length;
        let existingPathFragment = void 0;
        let key;
        let validateFunction;
        if (typeof validateOperation == "function") validateFunction = validateOperation;
        else validateFunction = validator;
        while(true){
            key = keys[t];
            if (key && key.indexOf("~") != -1) key = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unescapePathComponent"])(key);
            if (banPrototypeModifications && (key == "__proto__" || key == "prototype" && t > 0 && keys[t - 1] == "constructor")) throw new TypeError("JSON-Patch: modifying `__proto__` or `constructor/prototype` prop is banned for security reasons, if this was on purpose, please set `banPrototypeModifications` flag false and pass it to this function. More info in fast-json-patch README");
            if (validateOperation) {
                if (existingPathFragment === void 0) {
                    if (obj[key] === void 0) existingPathFragment = keys.slice(0, t).join("/");
                    else if (t == len - 1) existingPathFragment = operation.path;
                    if (existingPathFragment !== void 0) validateFunction(operation, 0, document, existingPathFragment);
                }
            }
            t++;
            if (Array.isArray(obj)) {
                if (key === "-") key = obj.length;
                else if (validateOperation && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isInteger"])(key)) throw new JsonPatchError("Expected an unsigned base-10 integer value, making the new referenced value the array element with the zero-based index", "OPERATION_PATH_ILLEGAL_ARRAY_INDEX", index, operation, document);
                else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isInteger"])(key)) key = ~~key;
                if (t >= len) {
                    if (validateOperation && operation.op === "add" && key > obj.length) throw new JsonPatchError("The specified index MUST NOT be greater than the number of elements in the array", "OPERATION_VALUE_OUT_OF_BOUNDS", index, operation, document);
                    const returnValue = arrOps[operation.op].call(operation, obj, key, document);
                    if (returnValue.test === false) throw new JsonPatchError("Test operation failed", "TEST_OPERATION_FAILED", index, operation, document);
                    return returnValue;
                }
            } else if (t >= len) {
                const returnValue = objOps[operation.op].call(operation, obj, key, document);
                if (returnValue.test === false) throw new JsonPatchError("Test operation failed", "TEST_OPERATION_FAILED", index, operation, document);
                return returnValue;
            }
            obj = obj[key];
            if (validateOperation && t < len && (!obj || typeof obj !== "object")) throw new JsonPatchError("Cannot perform operation at the desired path", "OPERATION_PATH_UNRESOLVABLE", index, operation, document);
        }
    }
}
/**
* Apply a full JSON Patch array on a JSON document.
* Returns the {newDocument, result} of the patch.
* It modifies the `document` object and `patch` - it gets the values by reference.
* If you would like to avoid touching your values, clone them:
* `jsonpatch.applyPatch(document, jsonpatch._deepClone(patch))`.
*
* @param document The document to patch
* @param patch The patch to apply
* @param validateOperation `false` is without validation, `true` to use default jsonpatch's validation, or you can pass a `validateOperation` callback to be used for validation.
* @param mutateDocument Whether to mutate the original document or clone it before applying
* @param banPrototypeModifications Whether to ban modifications to `__proto__`, defaults to `true`.
* @return An array of `{newDocument, result}` after the patch
*/ function applyPatch(document, patch, validateOperation, mutateDocument = true, banPrototypeModifications = true) {
    if (validateOperation) {
        if (!Array.isArray(patch)) throw new JsonPatchError("Patch sequence must be an array", "SEQUENCE_NOT_AN_ARRAY");
    }
    if (!mutateDocument) document = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["_deepClone"])(document);
    const results = new Array(patch.length);
    for(let i = 0, length = patch.length; i < length; i++){
        results[i] = applyOperation(document, patch[i], validateOperation, true, banPrototypeModifications, i);
        document = results[i].newDocument;
    }
    results.newDocument = document;
    return results;
}
/**
* Apply a single JSON Patch Operation on a JSON document.
* Returns the updated document.
* Suitable as a reducer.
*
* @param document The document to patch
* @param operation The operation to apply
* @return The updated document
*/ function applyReducer(document, operation, index) {
    const operationResult = applyOperation(document, operation);
    if (operationResult.test === false) throw new JsonPatchError("Test operation failed", "TEST_OPERATION_FAILED", index, operation, document);
    return operationResult.newDocument;
}
/**
* Validates a single operation. Called from `jsonpatch.validate`. Throws `JsonPatchError` in case of an error.
* @param {object} operation - operation object (patch)
* @param {number} index - index of operation in the sequence
* @param {object} [document] - object where the operation is supposed to be applied
* @param {string} [existingPathFragment] - comes along with `document`
*/ function validator(operation, index, document, existingPathFragment) {
    if (typeof operation !== "object" || operation === null || Array.isArray(operation)) throw new JsonPatchError("Operation is not an object", "OPERATION_NOT_AN_OBJECT", index, operation, document);
    else if (!objOps[operation.op]) throw new JsonPatchError("Operation `op` property is not one of operations defined in RFC-6902", "OPERATION_OP_INVALID", index, operation, document);
    else if (typeof operation.path !== "string") throw new JsonPatchError("Operation `path` property is not a string", "OPERATION_PATH_INVALID", index, operation, document);
    else if (operation.path.indexOf("/") !== 0 && operation.path.length > 0) throw new JsonPatchError("Operation `path` property must start with \"/\"", "OPERATION_PATH_INVALID", index, operation, document);
    else if ((operation.op === "move" || operation.op === "copy") && typeof operation.from !== "string") throw new JsonPatchError("Operation `from` property is not present (applicable in `move` and `copy` operations)", "OPERATION_FROM_REQUIRED", index, operation, document);
    else if ((operation.op === "add" || operation.op === "replace" || operation.op === "test") && operation.value === void 0) throw new JsonPatchError("Operation `value` property is not present (applicable in `add`, `replace` and `test` operations)", "OPERATION_VALUE_REQUIRED", index, operation, document);
    else if ((operation.op === "add" || operation.op === "replace" || operation.op === "test") && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hasUndefined"])(operation.value)) throw new JsonPatchError("Operation `value` property is not present (applicable in `add`, `replace` and `test` operations)", "OPERATION_VALUE_CANNOT_CONTAIN_UNDEFINED", index, operation, document);
    else if (document) {
        if (operation.op == "add") {
            var pathLen = operation.path.split("/").length;
            var existingPathLen = existingPathFragment.split("/").length;
            if (pathLen !== existingPathLen + 1 && pathLen !== existingPathLen) throw new JsonPatchError("Cannot perform an `add` operation at the desired path", "OPERATION_PATH_CANNOT_ADD", index, operation, document);
        } else if (operation.op === "replace" || operation.op === "remove" || operation.op === "_get") {
            if (operation.path !== existingPathFragment) throw new JsonPatchError("Cannot perform the operation at a path that does not exist", "OPERATION_PATH_UNRESOLVABLE", index, operation, document);
        } else if (operation.op === "move" || operation.op === "copy") {
            var existingValue = {
                op: "_get",
                path: operation.from,
                value: void 0
            };
            var error = validate([
                existingValue
            ], document);
            if (error && error.name === "OPERATION_PATH_UNRESOLVABLE") throw new JsonPatchError("Cannot perform the operation from a path that does not exist", "OPERATION_FROM_UNRESOLVABLE", index, operation, document);
        }
    }
}
/**
* Validates a sequence of operations. If `document` parameter is provided, the sequence is additionally validated against the object document.
* If error is encountered, returns a JsonPatchError object
* @param sequence
* @param document
* @returns {JsonPatchError|undefined}
*/ function validate(sequence, document, externalValidator) {
    try {
        if (!Array.isArray(sequence)) throw new JsonPatchError("Patch sequence must be an array", "SEQUENCE_NOT_AN_ARRAY");
        if (document) applyPatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["_deepClone"])(document), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["_deepClone"])(sequence), externalValidator || true);
        else {
            externalValidator = externalValidator || validator;
            for(var i = 0; i < sequence.length; i++)externalValidator(sequence[i], i, document, void 0);
        }
    } catch (e) {
        if (e instanceof JsonPatchError) return e;
        else throw e;
    }
}
function _areEquals(a, b) {
    if (a === b) return true;
    if (a && b && typeof a == "object" && typeof b == "object") {
        var arrA = Array.isArray(a), arrB = Array.isArray(b), i, length, key;
        if (arrA && arrB) {
            length = a.length;
            if (length != b.length) return false;
            for(i = length; i-- !== 0;)if (!_areEquals(a[i], b[i])) return false;
            return true;
        }
        if (arrA != arrB) return false;
        var keys = Object.keys(a);
        length = keys.length;
        if (length !== Object.keys(b).length) return false;
        for(i = length; i-- !== 0;)if (!b.hasOwnProperty(keys[i])) return false;
        for(i = length; i-- !== 0;){
            key = keys[i];
            if (!_areEquals(a[key], b[key])) return false;
        }
        return true;
    }
    return a !== a && b !== b;
}
;
 //# sourceMappingURL=core.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/fast-json-patch/src/duplex.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "compare",
    ()=>compare
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/fast-json-patch/src/helpers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$core$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/fast-json-patch/src/core.js [app-route] (ecmascript)");
;
;
//#region src/utils/fast-json-patch/src/duplex.ts
function _generate(mirror, obj, patches, path, invertible) {
    if (obj === mirror) return;
    if (typeof obj.toJSON === "function") obj = obj.toJSON();
    var newKeys = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["_objectKeys"])(obj);
    var oldKeys = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["_objectKeys"])(mirror);
    var changed = false;
    var deleted = false;
    for(var t = oldKeys.length - 1; t >= 0; t--){
        var key = oldKeys[t];
        var oldVal = mirror[key];
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hasOwnProperty"])(obj, key) && !(obj[key] === void 0 && oldVal !== void 0 && Array.isArray(obj) === false)) {
            var newVal = obj[key];
            if (typeof oldVal == "object" && oldVal != null && typeof newVal == "object" && newVal != null && Array.isArray(oldVal) === Array.isArray(newVal)) _generate(oldVal, newVal, patches, path + "/" + (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["escapePathComponent"])(key), invertible);
            else if (oldVal !== newVal) {
                changed = true;
                if (invertible) patches.push({
                    op: "test",
                    path: path + "/" + (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["escapePathComponent"])(key),
                    value: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["_deepClone"])(oldVal)
                });
                patches.push({
                    op: "replace",
                    path: path + "/" + (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["escapePathComponent"])(key),
                    value: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["_deepClone"])(newVal)
                });
            }
        } else if (Array.isArray(mirror) === Array.isArray(obj)) {
            if (invertible) patches.push({
                op: "test",
                path: path + "/" + (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["escapePathComponent"])(key),
                value: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["_deepClone"])(oldVal)
            });
            patches.push({
                op: "remove",
                path: path + "/" + (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["escapePathComponent"])(key)
            });
            deleted = true;
        } else {
            if (invertible) patches.push({
                op: "test",
                path,
                value: mirror
            });
            patches.push({
                op: "replace",
                path,
                value: obj
            });
            changed = true;
        }
    }
    if (!deleted && newKeys.length == oldKeys.length) return;
    for(var t = 0; t < newKeys.length; t++){
        var key = newKeys[t];
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hasOwnProperty"])(mirror, key) && obj[key] !== void 0) patches.push({
            op: "add",
            path: path + "/" + (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["escapePathComponent"])(key),
            value: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["_deepClone"])(obj[key])
        });
    }
}
/**
* Create an array of patches from the differences in two objects
*/ function compare(tree1, tree2, invertible = false) {
    var patches = [];
    _generate(tree1, tree2, patches, "", invertible);
    return patches;
}
;
 //# sourceMappingURL=duplex.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/fast-json-patch/index.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/fast-json-patch/src/helpers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$core$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/fast-json-patch/src/core.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$duplex$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/fast-json-patch/src/duplex.js [app-route] (ecmascript)");
;
;
;
//#region src/utils/fast-json-patch/index.ts
var fast_json_patch_default = {
    ...__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$core$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["core_exports"],
    JsonPatchError: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PatchError"],
    deepClone: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["_deepClone"],
    escapePathComponent: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["escapePathComponent"],
    unescapePathComponent: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$helpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unescapePathComponent"]
}; //#endregion
 //# sourceMappingURL=index.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/async_caller.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AsyncCaller",
    ()=>AsyncCaller,
    "async_caller_exports",
    ()=>async_caller_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/_virtual/rolldown_runtime.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$node_modules$2f2e$pnpm$2f$p$2d$retry$40$7$2e$1$2e$0$2f$node_modules$2f$p$2d$retry$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/node_modules/.pnpm/p-retry@7.1.0/node_modules/p-retry/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$signal$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/signal.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$p$2d$queue$40$9$2e$0$2e$1$2f$node_modules$2f$p$2d$queue$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/p-queue@9.0.1/node_modules/p-queue/dist/index.js [app-route] (ecmascript) <locals>");
;
;
;
;
//#region src/utils/async_caller.ts
var async_caller_exports = {};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__export"])(async_caller_exports, {
    AsyncCaller: ()=>AsyncCaller
});
const STATUS_NO_RETRY = [
    400,
    401,
    402,
    403,
    404,
    405,
    406,
    407,
    409
];
const defaultFailedAttemptHandler = (error)=>{
    if (error.message.startsWith("Cancel") || error.message.startsWith("AbortError") || error.name === "AbortError") throw error;
    if (error?.code === "ECONNABORTED") throw error;
    const status = error?.response?.status ?? error?.status;
    if (status && STATUS_NO_RETRY.includes(+status)) throw error;
    if (error?.error?.code === "insufficient_quota") {
        const err = new Error(error?.message);
        err.name = "InsufficientQuotaError";
        throw err;
    }
};
/**
* A class that can be used to make async calls with concurrency and retry logic.
*
* This is useful for making calls to any kind of "expensive" external resource,
* be it because it's rate-limited, subject to network issues, etc.
*
* Concurrent calls are limited by the `maxConcurrency` parameter, which defaults
* to `Infinity`. This means that by default, all calls will be made in parallel.
*
* Retries are limited by the `maxRetries` parameter, which defaults to 6. This
* means that by default, each call will be retried up to 6 times, with an
* exponential backoff between each attempt.
*/ var AsyncCaller = class {
    maxConcurrency;
    maxRetries;
    onFailedAttempt;
    queue;
    constructor(params){
        this.maxConcurrency = params.maxConcurrency ?? Infinity;
        this.maxRetries = params.maxRetries ?? 6;
        this.onFailedAttempt = params.onFailedAttempt ?? defaultFailedAttemptHandler;
        const PQueue = "default" in __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$p$2d$queue$40$9$2e$0$2e$1$2f$node_modules$2f$p$2d$queue$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"] ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$p$2d$queue$40$9$2e$0$2e$1$2f$node_modules$2f$p$2d$queue$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].default : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$p$2d$queue$40$9$2e$0$2e$1$2f$node_modules$2f$p$2d$queue$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"];
        this.queue = new PQueue({
            concurrency: this.maxConcurrency
        });
    }
    async call(callable, ...args) {
        return this.queue.add(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$node_modules$2f2e$pnpm$2f$p$2d$retry$40$7$2e$1$2e$0$2f$node_modules$2f$p$2d$retry$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pRetry"])(()=>callable(...args).catch((error)=>{
                    if (error instanceof Error) throw error;
                    else throw new Error(error);
                }), {
                onFailedAttempt: ({ error })=>this.onFailedAttempt?.(error),
                retries: this.maxRetries,
                randomize: true
            }), {
            throwOnTimeout: true
        });
    }
    callWithOptions(options, callable, ...args) {
        if (options.signal) {
            let listener;
            return Promise.race([
                this.call(callable, ...args),
                new Promise((_, reject)=>{
                    listener = ()=>{
                        reject((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$signal$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAbortSignalError"])(options.signal));
                    };
                    options.signal?.addEventListener("abort", listener);
                })
            ]).finally(()=>{
                if (options.signal && listener) options.signal.removeEventListener("abort", listener);
            });
        }
        return this.call(callable, ...args);
    }
    fetch(...args) {
        return this.call(()=>fetch(...args).then((res)=>res.ok ? res : Promise.reject(res)));
    }
};
;
 //# sourceMappingURL=async_caller.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/js-sha256/hash.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

//#region src/utils/js-sha256/hash.ts
__turbopack_context__.s([
    "sha256",
    ()=>sha256
]);
var HEX_CHARS = "0123456789abcdef".split("");
var EXTRA = [
    -2147483648,
    8388608,
    32768,
    128
];
var SHIFT = [
    24,
    16,
    8,
    0
];
var K = [
    1116352408,
    1899447441,
    3049323471,
    3921009573,
    961987163,
    1508970993,
    2453635748,
    2870763221,
    3624381080,
    310598401,
    607225278,
    1426881987,
    1925078388,
    2162078206,
    2614888103,
    3248222580,
    3835390401,
    4022224774,
    264347078,
    604807628,
    770255983,
    1249150122,
    1555081692,
    1996064986,
    2554220882,
    2821834349,
    2952996808,
    3210313671,
    3336571891,
    3584528711,
    113926993,
    338241895,
    666307205,
    773529912,
    1294757372,
    1396182291,
    1695183700,
    1986661051,
    2177026350,
    2456956037,
    2730485921,
    2820302411,
    3259730800,
    3345764771,
    3516065817,
    3600352804,
    4094571909,
    275423344,
    430227734,
    506948616,
    659060556,
    883997877,
    958139571,
    1322822218,
    1537002063,
    1747873779,
    1955562222,
    2024104815,
    2227730452,
    2361852424,
    2428436474,
    2756734187,
    3204031479,
    3329325298
];
var blocks = [];
function Sha256(is224, sharedMemory) {
    if (sharedMemory) {
        blocks[0] = blocks[16] = blocks[1] = blocks[2] = blocks[3] = blocks[4] = blocks[5] = blocks[6] = blocks[7] = blocks[8] = blocks[9] = blocks[10] = blocks[11] = blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
        this.blocks = blocks;
    } else this.blocks = [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
    ];
    if (is224) {
        this.h0 = 3238371032;
        this.h1 = 914150663;
        this.h2 = 812702999;
        this.h3 = 4144912697;
        this.h4 = 4290775857;
        this.h5 = 1750603025;
        this.h6 = 1694076839;
        this.h7 = 3204075428;
    } else {
        this.h0 = 1779033703;
        this.h1 = 3144134277;
        this.h2 = 1013904242;
        this.h3 = 2773480762;
        this.h4 = 1359893119;
        this.h5 = 2600822924;
        this.h6 = 528734635;
        this.h7 = 1541459225;
    }
    this.block = this.start = this.bytes = this.hBytes = 0;
    this.finalized = this.hashed = false;
    this.first = true;
    this.is224 = is224;
}
Sha256.prototype.update = function(message) {
    if (this.finalized) return;
    var notString, type = typeof message;
    if (type !== "string") {
        if (type === "object") {
            if (message === null) throw new Error(ERROR);
            else if (ARRAY_BUFFER && message.constructor === ArrayBuffer) message = new Uint8Array(message);
            else if (!Array.isArray(message)) {
                if (!ARRAY_BUFFER || !ArrayBuffer.isView(message)) throw new Error(ERROR);
            }
        } else throw new Error(ERROR);
        notString = true;
    }
    var code, index = 0, i, length = message.length, blocks$1 = this.blocks;
    while(index < length){
        if (this.hashed) {
            this.hashed = false;
            blocks$1[0] = this.block;
            this.block = blocks$1[16] = blocks$1[1] = blocks$1[2] = blocks$1[3] = blocks$1[4] = blocks$1[5] = blocks$1[6] = blocks$1[7] = blocks$1[8] = blocks$1[9] = blocks$1[10] = blocks$1[11] = blocks$1[12] = blocks$1[13] = blocks$1[14] = blocks$1[15] = 0;
        }
        if (notString) for(i = this.start; index < length && i < 64; ++index)blocks$1[i >>> 2] |= message[index] << SHIFT[i++ & 3];
        else for(i = this.start; index < length && i < 64; ++index){
            code = message.charCodeAt(index);
            if (code < 128) blocks$1[i >>> 2] |= code << SHIFT[i++ & 3];
            else if (code < 2048) {
                blocks$1[i >>> 2] |= (192 | code >>> 6) << SHIFT[i++ & 3];
                blocks$1[i >>> 2] |= (128 | code & 63) << SHIFT[i++ & 3];
            } else if (code < 55296 || code >= 57344) {
                blocks$1[i >>> 2] |= (224 | code >>> 12) << SHIFT[i++ & 3];
                blocks$1[i >>> 2] |= (128 | code >>> 6 & 63) << SHIFT[i++ & 3];
                blocks$1[i >>> 2] |= (128 | code & 63) << SHIFT[i++ & 3];
            } else {
                code = 65536 + ((code & 1023) << 10 | message.charCodeAt(++index) & 1023);
                blocks$1[i >>> 2] |= (240 | code >>> 18) << SHIFT[i++ & 3];
                blocks$1[i >>> 2] |= (128 | code >>> 12 & 63) << SHIFT[i++ & 3];
                blocks$1[i >>> 2] |= (128 | code >>> 6 & 63) << SHIFT[i++ & 3];
                blocks$1[i >>> 2] |= (128 | code & 63) << SHIFT[i++ & 3];
            }
        }
        this.lastByteIndex = i;
        this.bytes += i - this.start;
        if (i >= 64) {
            this.block = blocks$1[16];
            this.start = i - 64;
            this.hash();
            this.hashed = true;
        } else this.start = i;
    }
    if (this.bytes > 4294967295) {
        this.hBytes += this.bytes / 4294967296 << 0;
        this.bytes = this.bytes % 4294967296;
    }
    return this;
};
Sha256.prototype.finalize = function() {
    if (this.finalized) return;
    this.finalized = true;
    var blocks$1 = this.blocks, i = this.lastByteIndex;
    blocks$1[16] = this.block;
    blocks$1[i >>> 2] |= EXTRA[i & 3];
    this.block = blocks$1[16];
    if (i >= 56) {
        if (!this.hashed) this.hash();
        blocks$1[0] = this.block;
        blocks$1[16] = blocks$1[1] = blocks$1[2] = blocks$1[3] = blocks$1[4] = blocks$1[5] = blocks$1[6] = blocks$1[7] = blocks$1[8] = blocks$1[9] = blocks$1[10] = blocks$1[11] = blocks$1[12] = blocks$1[13] = blocks$1[14] = blocks$1[15] = 0;
    }
    blocks$1[14] = this.hBytes << 3 | this.bytes >>> 29;
    blocks$1[15] = this.bytes << 3;
    this.hash();
};
Sha256.prototype.hash = function() {
    var a = this.h0, b = this.h1, c = this.h2, d = this.h3, e = this.h4, f = this.h5, g = this.h6, h = this.h7, blocks$1 = this.blocks, j, s0, s1, maj, t1, t2, ch, ab, da, cd, bc;
    for(j = 16; j < 64; ++j){
        t1 = blocks$1[j - 15];
        s0 = (t1 >>> 7 | t1 << 25) ^ (t1 >>> 18 | t1 << 14) ^ t1 >>> 3;
        t1 = blocks$1[j - 2];
        s1 = (t1 >>> 17 | t1 << 15) ^ (t1 >>> 19 | t1 << 13) ^ t1 >>> 10;
        blocks$1[j] = blocks$1[j - 16] + s0 + blocks$1[j - 7] + s1 << 0;
    }
    bc = b & c;
    for(j = 0; j < 64; j += 4){
        if (this.first) {
            if (this.is224) {
                ab = 300032;
                t1 = blocks$1[0] - 1413257819;
                h = t1 - 150054599 << 0;
                d = t1 + 24177077 << 0;
            } else {
                ab = 704751109;
                t1 = blocks$1[0] - 210244248;
                h = t1 - 1521486534 << 0;
                d = t1 + 143694565 << 0;
            }
            this.first = false;
        } else {
            s0 = (a >>> 2 | a << 30) ^ (a >>> 13 | a << 19) ^ (a >>> 22 | a << 10);
            s1 = (e >>> 6 | e << 26) ^ (e >>> 11 | e << 21) ^ (e >>> 25 | e << 7);
            ab = a & b;
            maj = ab ^ a & c ^ bc;
            ch = e & f ^ ~e & g;
            t1 = h + s1 + ch + K[j] + blocks$1[j];
            t2 = s0 + maj;
            h = d + t1 << 0;
            d = t1 + t2 << 0;
        }
        s0 = (d >>> 2 | d << 30) ^ (d >>> 13 | d << 19) ^ (d >>> 22 | d << 10);
        s1 = (h >>> 6 | h << 26) ^ (h >>> 11 | h << 21) ^ (h >>> 25 | h << 7);
        da = d & a;
        maj = da ^ d & b ^ ab;
        ch = g & h ^ ~g & e;
        t1 = f + s1 + ch + K[j + 1] + blocks$1[j + 1];
        t2 = s0 + maj;
        g = c + t1 << 0;
        c = t1 + t2 << 0;
        s0 = (c >>> 2 | c << 30) ^ (c >>> 13 | c << 19) ^ (c >>> 22 | c << 10);
        s1 = (g >>> 6 | g << 26) ^ (g >>> 11 | g << 21) ^ (g >>> 25 | g << 7);
        cd = c & d;
        maj = cd ^ c & a ^ da;
        ch = f & g ^ ~f & h;
        t1 = e + s1 + ch + K[j + 2] + blocks$1[j + 2];
        t2 = s0 + maj;
        f = b + t1 << 0;
        b = t1 + t2 << 0;
        s0 = (b >>> 2 | b << 30) ^ (b >>> 13 | b << 19) ^ (b >>> 22 | b << 10);
        s1 = (f >>> 6 | f << 26) ^ (f >>> 11 | f << 21) ^ (f >>> 25 | f << 7);
        bc = b & c;
        maj = bc ^ b & d ^ cd;
        ch = f & g ^ ~f & h;
        t1 = e + s1 + ch + K[j + 3] + blocks$1[j + 3];
        t2 = s0 + maj;
        e = a + t1 << 0;
        a = t1 + t2 << 0;
        this.chromeBugWorkAround = true;
    }
    this.h0 = this.h0 + a << 0;
    this.h1 = this.h1 + b << 0;
    this.h2 = this.h2 + c << 0;
    this.h3 = this.h3 + d << 0;
    this.h4 = this.h4 + e << 0;
    this.h5 = this.h5 + f << 0;
    this.h6 = this.h6 + g << 0;
    this.h7 = this.h7 + h << 0;
};
Sha256.prototype.hex = function() {
    this.finalize();
    var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3, h4 = this.h4, h5 = this.h5, h6 = this.h6, h7 = this.h7;
    var hex = HEX_CHARS[h0 >>> 28 & 15] + HEX_CHARS[h0 >>> 24 & 15] + HEX_CHARS[h0 >>> 20 & 15] + HEX_CHARS[h0 >>> 16 & 15] + HEX_CHARS[h0 >>> 12 & 15] + HEX_CHARS[h0 >>> 8 & 15] + HEX_CHARS[h0 >>> 4 & 15] + HEX_CHARS[h0 & 15] + HEX_CHARS[h1 >>> 28 & 15] + HEX_CHARS[h1 >>> 24 & 15] + HEX_CHARS[h1 >>> 20 & 15] + HEX_CHARS[h1 >>> 16 & 15] + HEX_CHARS[h1 >>> 12 & 15] + HEX_CHARS[h1 >>> 8 & 15] + HEX_CHARS[h1 >>> 4 & 15] + HEX_CHARS[h1 & 15] + HEX_CHARS[h2 >>> 28 & 15] + HEX_CHARS[h2 >>> 24 & 15] + HEX_CHARS[h2 >>> 20 & 15] + HEX_CHARS[h2 >>> 16 & 15] + HEX_CHARS[h2 >>> 12 & 15] + HEX_CHARS[h2 >>> 8 & 15] + HEX_CHARS[h2 >>> 4 & 15] + HEX_CHARS[h2 & 15] + HEX_CHARS[h3 >>> 28 & 15] + HEX_CHARS[h3 >>> 24 & 15] + HEX_CHARS[h3 >>> 20 & 15] + HEX_CHARS[h3 >>> 16 & 15] + HEX_CHARS[h3 >>> 12 & 15] + HEX_CHARS[h3 >>> 8 & 15] + HEX_CHARS[h3 >>> 4 & 15] + HEX_CHARS[h3 & 15] + HEX_CHARS[h4 >>> 28 & 15] + HEX_CHARS[h4 >>> 24 & 15] + HEX_CHARS[h4 >>> 20 & 15] + HEX_CHARS[h4 >>> 16 & 15] + HEX_CHARS[h4 >>> 12 & 15] + HEX_CHARS[h4 >>> 8 & 15] + HEX_CHARS[h4 >>> 4 & 15] + HEX_CHARS[h4 & 15] + HEX_CHARS[h5 >>> 28 & 15] + HEX_CHARS[h5 >>> 24 & 15] + HEX_CHARS[h5 >>> 20 & 15] + HEX_CHARS[h5 >>> 16 & 15] + HEX_CHARS[h5 >>> 12 & 15] + HEX_CHARS[h5 >>> 8 & 15] + HEX_CHARS[h5 >>> 4 & 15] + HEX_CHARS[h5 & 15] + HEX_CHARS[h6 >>> 28 & 15] + HEX_CHARS[h6 >>> 24 & 15] + HEX_CHARS[h6 >>> 20 & 15] + HEX_CHARS[h6 >>> 16 & 15] + HEX_CHARS[h6 >>> 12 & 15] + HEX_CHARS[h6 >>> 8 & 15] + HEX_CHARS[h6 >>> 4 & 15] + HEX_CHARS[h6 & 15];
    if (!this.is224) hex += HEX_CHARS[h7 >>> 28 & 15] + HEX_CHARS[h7 >>> 24 & 15] + HEX_CHARS[h7 >>> 20 & 15] + HEX_CHARS[h7 >>> 16 & 15] + HEX_CHARS[h7 >>> 12 & 15] + HEX_CHARS[h7 >>> 8 & 15] + HEX_CHARS[h7 >>> 4 & 15] + HEX_CHARS[h7 & 15];
    return hex;
};
Sha256.prototype.toString = Sha256.prototype.hex;
Sha256.prototype.digest = function() {
    this.finalize();
    var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3, h4 = this.h4, h5 = this.h5, h6 = this.h6, h7 = this.h7;
    var arr = [
        h0 >>> 24 & 255,
        h0 >>> 16 & 255,
        h0 >>> 8 & 255,
        h0 & 255,
        h1 >>> 24 & 255,
        h1 >>> 16 & 255,
        h1 >>> 8 & 255,
        h1 & 255,
        h2 >>> 24 & 255,
        h2 >>> 16 & 255,
        h2 >>> 8 & 255,
        h2 & 255,
        h3 >>> 24 & 255,
        h3 >>> 16 & 255,
        h3 >>> 8 & 255,
        h3 & 255,
        h4 >>> 24 & 255,
        h4 >>> 16 & 255,
        h4 >>> 8 & 255,
        h4 & 255,
        h5 >>> 24 & 255,
        h5 >>> 16 & 255,
        h5 >>> 8 & 255,
        h5 & 255,
        h6 >>> 24 & 255,
        h6 >>> 16 & 255,
        h6 >>> 8 & 255,
        h6 & 255
    ];
    if (!this.is224) arr.push(h7 >>> 24 & 255, h7 >>> 16 & 255, h7 >>> 8 & 255, h7 & 255);
    return arr;
};
Sha256.prototype.array = Sha256.prototype.digest;
Sha256.prototype.arrayBuffer = function() {
    this.finalize();
    var buffer = /* @__PURE__ */ new ArrayBuffer(this.is224 ? 28 : 32);
    var dataView = new DataView(buffer);
    dataView.setUint32(0, this.h0);
    dataView.setUint32(4, this.h1);
    dataView.setUint32(8, this.h2);
    dataView.setUint32(12, this.h3);
    dataView.setUint32(16, this.h4);
    dataView.setUint32(20, this.h5);
    dataView.setUint32(24, this.h6);
    if (!this.is224) dataView.setUint32(28, this.h7);
    return buffer;
};
const sha256 = (...strings)=>{
    return new Sha256(false, true).update(strings.join("")).hex();
};
;
 //# sourceMappingURL=hash.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/hash.js [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "hash_exports",
    ()=>hash_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/_virtual/rolldown_runtime.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$js$2d$sha256$2f$hash$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/js-sha256/hash.js [app-route] (ecmascript)");
;
;
//#region src/utils/hash.ts
var hash_exports = {};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__export"])(hash_exports, {
    sha256: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$js$2d$sha256$2f$hash$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sha256"]
});
;
 //# sourceMappingURL=hash.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/tiktoken.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "encodingForModel",
    ()=>encodingForModel,
    "getEncoding",
    ()=>getEncoding,
    "tiktoken_exports",
    ()=>tiktoken_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/_virtual/rolldown_runtime.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$async_caller$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/async_caller.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$js$2d$tiktoken$40$1$2e$0$2e$21$2f$node_modules$2f$js$2d$tiktoken$2f$dist$2f$lite$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/js-tiktoken@1.0.21/node_modules/js-tiktoken/dist/lite.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$js$2d$tiktoken$40$1$2e$0$2e$21$2f$node_modules$2f$js$2d$tiktoken$2f$dist$2f$chunk$2d$VL2OQCWN$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/js-tiktoken@1.0.21/node_modules/js-tiktoken/dist/chunk-VL2OQCWN.js [app-route] (ecmascript)");
;
;
;
//#region src/utils/tiktoken.ts
var tiktoken_exports = {};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__export"])(tiktoken_exports, {
    encodingForModel: ()=>encodingForModel,
    getEncoding: ()=>getEncoding
});
const cache = {};
const caller = /* @__PURE__ */ new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$async_caller$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AsyncCaller"]({});
async function getEncoding(encoding) {
    if (!(encoding in cache)) cache[encoding] = caller.fetch(`https://tiktoken.pages.dev/js/${encoding}.json`).then((res)=>res.json()).then((data)=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$js$2d$tiktoken$40$1$2e$0$2e$21$2f$node_modules$2f$js$2d$tiktoken$2f$dist$2f$chunk$2d$VL2OQCWN$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Tiktoken"](data)).catch((e)=>{
        delete cache[encoding];
        throw e;
    });
    return await cache[encoding];
}
async function encodingForModel(model) {
    return getEncoding((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$js$2d$tiktoken$40$1$2e$0$2e$21$2f$node_modules$2f$js$2d$tiktoken$2f$dist$2f$chunk$2d$VL2OQCWN$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getEncodingNameForModel"])(model));
}
;
 //# sourceMappingURL=tiktoken.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/types/index.js [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "types_exports",
    ()=>types_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/_virtual/rolldown_runtime.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/types/zod.js [app-route] (ecmascript)");
;
;
//#region src/utils/types/index.ts
var types_exports = {};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__export"])(types_exports, {
    extendInteropZodObject: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extendInteropZodObject"],
    getInteropZodDefaultGetter: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getInteropZodDefaultGetter"],
    getInteropZodObjectShape: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getInteropZodObjectShape"],
    getSchemaDescription: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSchemaDescription"],
    interopParse: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["interopParse"],
    interopParseAsync: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["interopParseAsync"],
    interopSafeParse: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["interopSafeParse"],
    interopSafeParseAsync: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["interopSafeParseAsync"],
    interopZodObjectMakeFieldsOptional: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["interopZodObjectMakeFieldsOptional"],
    interopZodObjectPartial: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["interopZodObjectPartial"],
    interopZodObjectPassthrough: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["interopZodObjectPassthrough"],
    interopZodObjectStrict: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["interopZodObjectStrict"],
    interopZodTransformInputSchema: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["interopZodTransformInputSchema"],
    isInteropZodError: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isInteropZodError"],
    isInteropZodLiteral: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isInteropZodLiteral"],
    isInteropZodObject: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isInteropZodObject"],
    isInteropZodSchema: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isInteropZodSchema"],
    isShapelessZodSchema: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isShapelessZodSchema"],
    isSimpleStringZodSchema: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isSimpleStringZodSchema"],
    isZodArrayV4: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isZodArrayV4"],
    isZodLiteralV3: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isZodLiteralV3"],
    isZodLiteralV4: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isZodLiteralV4"],
    isZodNullableV4: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isZodNullableV4"],
    isZodObjectV3: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isZodObjectV3"],
    isZodObjectV4: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isZodObjectV4"],
    isZodOptionalV4: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isZodOptionalV4"],
    isZodSchema: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isZodSchema"],
    isZodSchemaV3: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isZodSchemaV3"],
    isZodSchemaV4: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isZodSchemaV4"]
});
;
 //# sourceMappingURL=index.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/json_patch.js [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "json_patch_exports",
    ()=>json_patch_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/_virtual/rolldown_runtime.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$core$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/fast-json-patch/src/core.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$duplex$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/fast-json-patch/src/duplex.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/fast-json-patch/index.js [app-route] (ecmascript)");
;
;
;
;
//#region src/utils/json_patch.ts
var json_patch_exports = {};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__export"])(json_patch_exports, {
    applyPatch: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$core$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["applyPatch"],
    compare: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$duplex$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["compare"]
});
;
 //# sourceMappingURL=json_patch.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/sax-js/sax.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

//#region src/utils/sax-js/sax.ts
__turbopack_context__.s([
    "sax",
    ()=>sax
]);
const initializeSax = function() {
    const sax$1 = {};
    sax$1.parser = function(strict, opt) {
        return new SAXParser(strict, opt);
    };
    sax$1.SAXParser = SAXParser;
    sax$1.SAXStream = SAXStream;
    sax$1.createStream = createStream;
    sax$1.MAX_BUFFER_LENGTH = 64 * 1024;
    const buffers = [
        "comment",
        "sgmlDecl",
        "textNode",
        "tagName",
        "doctype",
        "procInstName",
        "procInstBody",
        "entity",
        "attribName",
        "attribValue",
        "cdata",
        "script"
    ];
    sax$1.EVENTS = [
        "text",
        "processinginstruction",
        "sgmldeclaration",
        "doctype",
        "comment",
        "opentagstart",
        "attribute",
        "opentag",
        "closetag",
        "opencdata",
        "cdata",
        "closecdata",
        "error",
        "end",
        "ready",
        "script",
        "opennamespace",
        "closenamespace"
    ];
    function SAXParser(strict, opt) {
        if (!(this instanceof SAXParser)) return new SAXParser(strict, opt);
        var parser = this;
        clearBuffers(parser);
        parser.q = parser.c = "";
        parser.bufferCheckPosition = sax$1.MAX_BUFFER_LENGTH;
        parser.opt = opt || {};
        parser.opt.lowercase = parser.opt.lowercase || parser.opt.lowercasetags;
        parser.looseCase = parser.opt.lowercase ? "toLowerCase" : "toUpperCase";
        parser.tags = [];
        parser.closed = parser.closedRoot = parser.sawRoot = false;
        parser.tag = parser.error = null;
        parser.strict = !!strict;
        parser.noscript = !!(strict || parser.opt.noscript);
        parser.state = S.BEGIN;
        parser.strictEntities = parser.opt.strictEntities;
        parser.ENTITIES = parser.strictEntities ? Object.create(sax$1.XML_ENTITIES) : Object.create(sax$1.ENTITIES);
        parser.attribList = [];
        if (parser.opt.xmlns) parser.ns = Object.create(rootNS);
        parser.trackPosition = parser.opt.position !== false;
        if (parser.trackPosition) parser.position = parser.line = parser.column = 0;
        emit(parser, "onready");
    }
    if (!Object.create) Object.create = function(o) {
        function F() {}
        F.prototype = o;
        var newf = new F();
        return newf;
    };
    if (!Object.keys) Object.keys = function(o) {
        var a = [];
        for(var i in o)if (o.hasOwnProperty(i)) a.push(i);
        return a;
    };
    function checkBufferLength(parser) {
        var maxAllowed = Math.max(sax$1.MAX_BUFFER_LENGTH, 10);
        var maxActual = 0;
        for(var i = 0, l = buffers.length; i < l; i++){
            var len = parser[buffers[i]].length;
            if (len > maxAllowed) switch(buffers[i]){
                case "textNode":
                    closeText(parser);
                    break;
                case "cdata":
                    emitNode(parser, "oncdata", parser.cdata);
                    parser.cdata = "";
                    break;
                case "script":
                    emitNode(parser, "onscript", parser.script);
                    parser.script = "";
                    break;
                default:
                    error(parser, "Max buffer length exceeded: " + buffers[i]);
            }
            maxActual = Math.max(maxActual, len);
        }
        var m = sax$1.MAX_BUFFER_LENGTH - maxActual;
        parser.bufferCheckPosition = m + parser.position;
    }
    function clearBuffers(parser) {
        for(var i = 0, l = buffers.length; i < l; i++)parser[buffers[i]] = "";
    }
    function flushBuffers(parser) {
        closeText(parser);
        if (parser.cdata !== "") {
            emitNode(parser, "oncdata", parser.cdata);
            parser.cdata = "";
        }
        if (parser.script !== "") {
            emitNode(parser, "onscript", parser.script);
            parser.script = "";
        }
    }
    SAXParser.prototype = {
        end: function() {
            end(this);
        },
        write,
        resume: function() {
            this.error = null;
            return this;
        },
        close: function() {
            return this.write(null);
        },
        flush: function() {
            flushBuffers(this);
        }
    };
    var Stream = ReadableStream;
    if (!Stream) Stream = function() {};
    var streamWraps = sax$1.EVENTS.filter(function(ev) {
        return ev !== "error" && ev !== "end";
    });
    function createStream(strict, opt) {
        return new SAXStream(strict, opt);
    }
    function SAXStream(strict, opt) {
        if (!(this instanceof SAXStream)) return new SAXStream(strict, opt);
        Stream.apply(this);
        this._parser = new SAXParser(strict, opt);
        this.writable = true;
        this.readable = true;
        var me = this;
        this._parser.onend = function() {
            me.emit("end");
        };
        this._parser.onerror = function(er) {
            me.emit("error", er);
            me._parser.error = null;
        };
        this._decoder = null;
        streamWraps.forEach(function(ev) {
            Object.defineProperty(me, "on" + ev, {
                get: function() {
                    return me._parser["on" + ev];
                },
                set: function(h) {
                    if (!h) {
                        me.removeAllListeners(ev);
                        me._parser["on" + ev] = h;
                        return h;
                    }
                    me.on(ev, h);
                },
                enumerable: true,
                configurable: false
            });
        });
    }
    SAXStream.prototype = Object.create(Stream.prototype, {
        constructor: {
            value: SAXStream
        }
    });
    SAXStream.prototype.write = function(data) {
        this._parser.write(data.toString());
        this.emit("data", data);
        return true;
    };
    SAXStream.prototype.end = function(chunk) {
        if (chunk && chunk.length) this.write(chunk);
        this._parser.end();
        return true;
    };
    SAXStream.prototype.on = function(ev, handler) {
        var me = this;
        if (!me._parser["on" + ev] && streamWraps.indexOf(ev) !== -1) me._parser["on" + ev] = function() {
            var args = arguments.length === 1 ? [
                arguments[0]
            ] : Array.apply(null, arguments);
            args.splice(0, 0, ev);
            me.emit.apply(me, args);
        };
        return Stream.prototype.on.call(me, ev, handler);
    };
    var CDATA = "[CDATA[";
    var DOCTYPE = "DOCTYPE";
    var XML_NAMESPACE = "http://www.w3.org/XML/1998/namespace";
    var XMLNS_NAMESPACE = "http://www.w3.org/2000/xmlns/";
    var rootNS = {
        xml: XML_NAMESPACE,
        xmlns: XMLNS_NAMESPACE
    };
    var nameStart = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;
    var nameBody = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
    var entityStart = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;
    var entityBody = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
    function isWhitespace(c) {
        return c === " " || c === "\n" || c === "\r" || c === "	";
    }
    function isQuote(c) {
        return c === "\"" || c === "'";
    }
    function isAttribEnd(c) {
        return c === ">" || isWhitespace(c);
    }
    function isMatch(regex, c) {
        return regex.test(c);
    }
    function notMatch(regex, c) {
        return !isMatch(regex, c);
    }
    var S = 0;
    sax$1.STATE = {
        BEGIN: S++,
        BEGIN_WHITESPACE: S++,
        TEXT: S++,
        TEXT_ENTITY: S++,
        OPEN_WAKA: S++,
        SGML_DECL: S++,
        SGML_DECL_QUOTED: S++,
        DOCTYPE: S++,
        DOCTYPE_QUOTED: S++,
        DOCTYPE_DTD: S++,
        DOCTYPE_DTD_QUOTED: S++,
        COMMENT_STARTING: S++,
        COMMENT: S++,
        COMMENT_ENDING: S++,
        COMMENT_ENDED: S++,
        CDATA: S++,
        CDATA_ENDING: S++,
        CDATA_ENDING_2: S++,
        PROC_INST: S++,
        PROC_INST_BODY: S++,
        PROC_INST_ENDING: S++,
        OPEN_TAG: S++,
        OPEN_TAG_SLASH: S++,
        ATTRIB: S++,
        ATTRIB_NAME: S++,
        ATTRIB_NAME_SAW_WHITE: S++,
        ATTRIB_VALUE: S++,
        ATTRIB_VALUE_QUOTED: S++,
        ATTRIB_VALUE_CLOSED: S++,
        ATTRIB_VALUE_UNQUOTED: S++,
        ATTRIB_VALUE_ENTITY_Q: S++,
        ATTRIB_VALUE_ENTITY_U: S++,
        CLOSE_TAG: S++,
        CLOSE_TAG_SAW_WHITE: S++,
        SCRIPT: S++,
        SCRIPT_ENDING: S++
    };
    sax$1.XML_ENTITIES = {
        amp: "&",
        gt: ">",
        lt: "<",
        quot: "\"",
        apos: "'"
    };
    sax$1.ENTITIES = {
        amp: "&",
        gt: ">",
        lt: "<",
        quot: "\"",
        apos: "'",
        AElig: 198,
        Aacute: 193,
        Acirc: 194,
        Agrave: 192,
        Aring: 197,
        Atilde: 195,
        Auml: 196,
        Ccedil: 199,
        ETH: 208,
        Eacute: 201,
        Ecirc: 202,
        Egrave: 200,
        Euml: 203,
        Iacute: 205,
        Icirc: 206,
        Igrave: 204,
        Iuml: 207,
        Ntilde: 209,
        Oacute: 211,
        Ocirc: 212,
        Ograve: 210,
        Oslash: 216,
        Otilde: 213,
        Ouml: 214,
        THORN: 222,
        Uacute: 218,
        Ucirc: 219,
        Ugrave: 217,
        Uuml: 220,
        Yacute: 221,
        aacute: 225,
        acirc: 226,
        aelig: 230,
        agrave: 224,
        aring: 229,
        atilde: 227,
        auml: 228,
        ccedil: 231,
        eacute: 233,
        ecirc: 234,
        egrave: 232,
        eth: 240,
        euml: 235,
        iacute: 237,
        icirc: 238,
        igrave: 236,
        iuml: 239,
        ntilde: 241,
        oacute: 243,
        ocirc: 244,
        ograve: 242,
        oslash: 248,
        otilde: 245,
        ouml: 246,
        szlig: 223,
        thorn: 254,
        uacute: 250,
        ucirc: 251,
        ugrave: 249,
        uuml: 252,
        yacute: 253,
        yuml: 255,
        copy: 169,
        reg: 174,
        nbsp: 160,
        iexcl: 161,
        cent: 162,
        pound: 163,
        curren: 164,
        yen: 165,
        brvbar: 166,
        sect: 167,
        uml: 168,
        ordf: 170,
        laquo: 171,
        not: 172,
        shy: 173,
        macr: 175,
        deg: 176,
        plusmn: 177,
        sup1: 185,
        sup2: 178,
        sup3: 179,
        acute: 180,
        micro: 181,
        para: 182,
        middot: 183,
        cedil: 184,
        ordm: 186,
        raquo: 187,
        frac14: 188,
        frac12: 189,
        frac34: 190,
        iquest: 191,
        times: 215,
        divide: 247,
        OElig: 338,
        oelig: 339,
        Scaron: 352,
        scaron: 353,
        Yuml: 376,
        fnof: 402,
        circ: 710,
        tilde: 732,
        Alpha: 913,
        Beta: 914,
        Gamma: 915,
        Delta: 916,
        Epsilon: 917,
        Zeta: 918,
        Eta: 919,
        Theta: 920,
        Iota: 921,
        Kappa: 922,
        Lambda: 923,
        Mu: 924,
        Nu: 925,
        Xi: 926,
        Omicron: 927,
        Pi: 928,
        Rho: 929,
        Sigma: 931,
        Tau: 932,
        Upsilon: 933,
        Phi: 934,
        Chi: 935,
        Psi: 936,
        Omega: 937,
        alpha: 945,
        beta: 946,
        gamma: 947,
        delta: 948,
        epsilon: 949,
        zeta: 950,
        eta: 951,
        theta: 952,
        iota: 953,
        kappa: 954,
        lambda: 955,
        mu: 956,
        nu: 957,
        xi: 958,
        omicron: 959,
        pi: 960,
        rho: 961,
        sigmaf: 962,
        sigma: 963,
        tau: 964,
        upsilon: 965,
        phi: 966,
        chi: 967,
        psi: 968,
        omega: 969,
        thetasym: 977,
        upsih: 978,
        piv: 982,
        ensp: 8194,
        emsp: 8195,
        thinsp: 8201,
        zwnj: 8204,
        zwj: 8205,
        lrm: 8206,
        rlm: 8207,
        ndash: 8211,
        mdash: 8212,
        lsquo: 8216,
        rsquo: 8217,
        sbquo: 8218,
        ldquo: 8220,
        rdquo: 8221,
        bdquo: 8222,
        dagger: 8224,
        Dagger: 8225,
        bull: 8226,
        hellip: 8230,
        permil: 8240,
        prime: 8242,
        Prime: 8243,
        lsaquo: 8249,
        rsaquo: 8250,
        oline: 8254,
        frasl: 8260,
        euro: 8364,
        image: 8465,
        weierp: 8472,
        real: 8476,
        trade: 8482,
        alefsym: 8501,
        larr: 8592,
        uarr: 8593,
        rarr: 8594,
        darr: 8595,
        harr: 8596,
        crarr: 8629,
        lArr: 8656,
        uArr: 8657,
        rArr: 8658,
        dArr: 8659,
        hArr: 8660,
        forall: 8704,
        part: 8706,
        exist: 8707,
        empty: 8709,
        nabla: 8711,
        isin: 8712,
        notin: 8713,
        ni: 8715,
        prod: 8719,
        sum: 8721,
        minus: 8722,
        lowast: 8727,
        radic: 8730,
        prop: 8733,
        infin: 8734,
        ang: 8736,
        and: 8743,
        or: 8744,
        cap: 8745,
        cup: 8746,
        int: 8747,
        there4: 8756,
        sim: 8764,
        cong: 8773,
        asymp: 8776,
        ne: 8800,
        equiv: 8801,
        le: 8804,
        ge: 8805,
        sub: 8834,
        sup: 8835,
        nsub: 8836,
        sube: 8838,
        supe: 8839,
        oplus: 8853,
        otimes: 8855,
        perp: 8869,
        sdot: 8901,
        lceil: 8968,
        rceil: 8969,
        lfloor: 8970,
        rfloor: 8971,
        lang: 9001,
        rang: 9002,
        loz: 9674,
        spades: 9824,
        clubs: 9827,
        hearts: 9829,
        diams: 9830
    };
    Object.keys(sax$1.ENTITIES).forEach(function(key) {
        var e = sax$1.ENTITIES[key];
        var s$1 = typeof e === "number" ? String.fromCharCode(e) : e;
        sax$1.ENTITIES[key] = s$1;
    });
    for(var s in sax$1.STATE)sax$1.STATE[sax$1.STATE[s]] = s;
    S = sax$1.STATE;
    function emit(parser, event, data) {
        parser[event] && parser[event](data);
    }
    function emitNode(parser, nodeType, data) {
        if (parser.textNode) closeText(parser);
        emit(parser, nodeType, data);
    }
    function closeText(parser) {
        parser.textNode = textopts(parser.opt, parser.textNode);
        if (parser.textNode) emit(parser, "ontext", parser.textNode);
        parser.textNode = "";
    }
    function textopts(opt, text) {
        if (opt.trim) text = text.trim();
        if (opt.normalize) text = text.replace(/\s+/g, " ");
        return text;
    }
    function error(parser, er) {
        closeText(parser);
        if (parser.trackPosition) er += "\nLine: " + parser.line + "\nColumn: " + parser.column + "\nChar: " + parser.c;
        er = new Error(er);
        parser.error = er;
        emit(parser, "onerror", er);
        return parser;
    }
    function end(parser) {
        if (parser.sawRoot && !parser.closedRoot) strictFail(parser, "Unclosed root tag");
        if (parser.state !== S.BEGIN && parser.state !== S.BEGIN_WHITESPACE && parser.state !== S.TEXT) error(parser, "Unexpected end");
        closeText(parser);
        parser.c = "";
        parser.closed = true;
        emit(parser, "onend");
        SAXParser.call(parser, parser.strict, parser.opt);
        return parser;
    }
    function strictFail(parser, message) {
        if (typeof parser !== "object" || !(parser instanceof SAXParser)) throw new Error("bad call to strictFail");
        if (parser.strict) error(parser, message);
    }
    function newTag(parser) {
        if (!parser.strict) parser.tagName = parser.tagName[parser.looseCase]();
        var parent = parser.tags[parser.tags.length - 1] || parser;
        var tag = parser.tag = {
            name: parser.tagName,
            attributes: {}
        };
        if (parser.opt.xmlns) tag.ns = parent.ns;
        parser.attribList.length = 0;
        emitNode(parser, "onopentagstart", tag);
    }
    function qname(name, attribute) {
        var i = name.indexOf(":");
        var qualName = i < 0 ? [
            "",
            name
        ] : name.split(":");
        var prefix = qualName[0];
        var local = qualName[1];
        if (attribute && name === "xmlns") {
            prefix = "xmlns";
            local = "";
        }
        return {
            prefix,
            local
        };
    }
    function attrib(parser) {
        if (!parser.strict) parser.attribName = parser.attribName[parser.looseCase]();
        if (parser.attribList.indexOf(parser.attribName) !== -1 || parser.tag.attributes.hasOwnProperty(parser.attribName)) {
            parser.attribName = parser.attribValue = "";
            return;
        }
        if (parser.opt.xmlns) {
            var qn = qname(parser.attribName, true);
            var prefix = qn.prefix;
            var local = qn.local;
            if (prefix === "xmlns") if (local === "xml" && parser.attribValue !== XML_NAMESPACE) strictFail(parser, "xml: prefix must be bound to " + XML_NAMESPACE + "\nActual: " + parser.attribValue);
            else if (local === "xmlns" && parser.attribValue !== XMLNS_NAMESPACE) strictFail(parser, "xmlns: prefix must be bound to " + XMLNS_NAMESPACE + "\nActual: " + parser.attribValue);
            else {
                var tag = parser.tag;
                var parent = parser.tags[parser.tags.length - 1] || parser;
                if (tag.ns === parent.ns) tag.ns = Object.create(parent.ns);
                tag.ns[local] = parser.attribValue;
            }
            parser.attribList.push([
                parser.attribName,
                parser.attribValue
            ]);
        } else {
            parser.tag.attributes[parser.attribName] = parser.attribValue;
            emitNode(parser, "onattribute", {
                name: parser.attribName,
                value: parser.attribValue
            });
        }
        parser.attribName = parser.attribValue = "";
    }
    function openTag(parser, selfClosing) {
        if (parser.opt.xmlns) {
            var tag = parser.tag;
            var qn = qname(parser.tagName);
            tag.prefix = qn.prefix;
            tag.local = qn.local;
            tag.uri = tag.ns[qn.prefix] || "";
            if (tag.prefix && !tag.uri) {
                strictFail(parser, "Unbound namespace prefix: " + JSON.stringify(parser.tagName));
                tag.uri = qn.prefix;
            }
            var parent = parser.tags[parser.tags.length - 1] || parser;
            if (tag.ns && parent.ns !== tag.ns) Object.keys(tag.ns).forEach(function(p) {
                emitNode(parser, "onopennamespace", {
                    prefix: p,
                    uri: tag.ns[p]
                });
            });
            for(var i = 0, l = parser.attribList.length; i < l; i++){
                var nv = parser.attribList[i];
                var name = nv[0];
                var value = nv[1];
                var qualName = qname(name, true);
                var prefix = qualName.prefix;
                var local = qualName.local;
                var uri = prefix === "" ? "" : tag.ns[prefix] || "";
                var a = {
                    name,
                    value,
                    prefix,
                    local,
                    uri
                };
                if (prefix && prefix !== "xmlns" && !uri) {
                    strictFail(parser, "Unbound namespace prefix: " + JSON.stringify(prefix));
                    a.uri = prefix;
                }
                parser.tag.attributes[name] = a;
                emitNode(parser, "onattribute", a);
            }
            parser.attribList.length = 0;
        }
        parser.tag.isSelfClosing = !!selfClosing;
        parser.sawRoot = true;
        parser.tags.push(parser.tag);
        emitNode(parser, "onopentag", parser.tag);
        if (!selfClosing) {
            if (!parser.noscript && parser.tagName.toLowerCase() === "script") parser.state = S.SCRIPT;
            else parser.state = S.TEXT;
            parser.tag = null;
            parser.tagName = "";
        }
        parser.attribName = parser.attribValue = "";
        parser.attribList.length = 0;
    }
    function closeTag(parser) {
        if (!parser.tagName) {
            strictFail(parser, "Weird empty close tag.");
            parser.textNode += "</>";
            parser.state = S.TEXT;
            return;
        }
        if (parser.script) {
            if (parser.tagName !== "script") {
                parser.script += "</" + parser.tagName + ">";
                parser.tagName = "";
                parser.state = S.SCRIPT;
                return;
            }
            emitNode(parser, "onscript", parser.script);
            parser.script = "";
        }
        var t = parser.tags.length;
        var tagName = parser.tagName;
        if (!parser.strict) tagName = tagName[parser.looseCase]();
        var closeTo = tagName;
        while(t--){
            var close = parser.tags[t];
            if (close.name !== closeTo) strictFail(parser, "Unexpected close tag");
            else break;
        }
        if (t < 0) {
            strictFail(parser, "Unmatched closing tag: " + parser.tagName);
            parser.textNode += "</" + parser.tagName + ">";
            parser.state = S.TEXT;
            return;
        }
        parser.tagName = tagName;
        var s$1 = parser.tags.length;
        while(s$1-- > t){
            var tag = parser.tag = parser.tags.pop();
            parser.tagName = parser.tag.name;
            emitNode(parser, "onclosetag", parser.tagName);
            var x = {};
            for(var i in tag.ns)x[i] = tag.ns[i];
            var parent = parser.tags[parser.tags.length - 1] || parser;
            if (parser.opt.xmlns && tag.ns !== parent.ns) Object.keys(tag.ns).forEach(function(p) {
                var n = tag.ns[p];
                emitNode(parser, "onclosenamespace", {
                    prefix: p,
                    uri: n
                });
            });
        }
        if (t === 0) parser.closedRoot = true;
        parser.tagName = parser.attribValue = parser.attribName = "";
        parser.attribList.length = 0;
        parser.state = S.TEXT;
    }
    function parseEntity(parser) {
        var entity = parser.entity;
        var entityLC = entity.toLowerCase();
        var num;
        var numStr = "";
        if (parser.ENTITIES[entity]) return parser.ENTITIES[entity];
        if (parser.ENTITIES[entityLC]) return parser.ENTITIES[entityLC];
        entity = entityLC;
        if (entity.charAt(0) === "#") if (entity.charAt(1) === "x") {
            entity = entity.slice(2);
            num = parseInt(entity, 16);
            numStr = num.toString(16);
        } else {
            entity = entity.slice(1);
            num = parseInt(entity, 10);
            numStr = num.toString(10);
        }
        entity = entity.replace(/^0+/, "");
        if (isNaN(num) || numStr.toLowerCase() !== entity) {
            strictFail(parser, "Invalid character entity");
            return "&" + parser.entity + ";";
        }
        return String.fromCodePoint(num);
    }
    function beginWhiteSpace(parser, c) {
        if (c === "<") {
            parser.state = S.OPEN_WAKA;
            parser.startTagPosition = parser.position;
        } else if (!isWhitespace(c)) {
            strictFail(parser, "Non-whitespace before first tag.");
            parser.textNode = c;
            parser.state = S.TEXT;
        }
    }
    function charAt(chunk, i) {
        var result = "";
        if (i < chunk.length) result = chunk.charAt(i);
        return result;
    }
    function write(chunk) {
        var parser = this;
        if (this.error) throw this.error;
        if (parser.closed) return error(parser, "Cannot write after close. Assign an onready handler.");
        if (chunk === null) return end(parser);
        if (typeof chunk === "object") chunk = chunk.toString();
        var i = 0;
        var c = "";
        while(true){
            c = charAt(chunk, i++);
            parser.c = c;
            if (!c) break;
            if (parser.trackPosition) {
                parser.position++;
                if (c === "\n") {
                    parser.line++;
                    parser.column = 0;
                } else parser.column++;
            }
            switch(parser.state){
                case S.BEGIN:
                    parser.state = S.BEGIN_WHITESPACE;
                    if (c === "﻿") continue;
                    beginWhiteSpace(parser, c);
                    continue;
                case S.BEGIN_WHITESPACE:
                    beginWhiteSpace(parser, c);
                    continue;
                case S.TEXT:
                    if (parser.sawRoot && !parser.closedRoot) {
                        var starti = i - 1;
                        while(c && c !== "<" && c !== "&"){
                            c = charAt(chunk, i++);
                            if (c && parser.trackPosition) {
                                parser.position++;
                                if (c === "\n") {
                                    parser.line++;
                                    parser.column = 0;
                                } else parser.column++;
                            }
                        }
                        parser.textNode += chunk.substring(starti, i - 1);
                    }
                    if (c === "<" && !(parser.sawRoot && parser.closedRoot && !parser.strict)) {
                        parser.state = S.OPEN_WAKA;
                        parser.startTagPosition = parser.position;
                    } else {
                        if (!isWhitespace(c) && (!parser.sawRoot || parser.closedRoot)) strictFail(parser, "Text data outside of root node.");
                        if (c === "&") parser.state = S.TEXT_ENTITY;
                        else parser.textNode += c;
                    }
                    continue;
                case S.SCRIPT:
                    if (c === "<") parser.state = S.SCRIPT_ENDING;
                    else parser.script += c;
                    continue;
                case S.SCRIPT_ENDING:
                    if (c === "/") parser.state = S.CLOSE_TAG;
                    else {
                        parser.script += "<" + c;
                        parser.state = S.SCRIPT;
                    }
                    continue;
                case S.OPEN_WAKA:
                    if (c === "!") {
                        parser.state = S.SGML_DECL;
                        parser.sgmlDecl = "";
                    } else if (isWhitespace(c)) {} else if (isMatch(nameStart, c)) {
                        parser.state = S.OPEN_TAG;
                        parser.tagName = c;
                    } else if (c === "/") {
                        parser.state = S.CLOSE_TAG;
                        parser.tagName = "";
                    } else if (c === "?") {
                        parser.state = S.PROC_INST;
                        parser.procInstName = parser.procInstBody = "";
                    } else {
                        strictFail(parser, "Unencoded <");
                        if (parser.startTagPosition + 1 < parser.position) {
                            var pad = parser.position - parser.startTagPosition;
                            c = new Array(pad).join(" ") + c;
                        }
                        parser.textNode += "<" + c;
                        parser.state = S.TEXT;
                    }
                    continue;
                case S.SGML_DECL:
                    if ((parser.sgmlDecl + c).toUpperCase() === CDATA) {
                        emitNode(parser, "onopencdata");
                        parser.state = S.CDATA;
                        parser.sgmlDecl = "";
                        parser.cdata = "";
                    } else if (parser.sgmlDecl + c === "--") {
                        parser.state = S.COMMENT;
                        parser.comment = "";
                        parser.sgmlDecl = "";
                    } else if ((parser.sgmlDecl + c).toUpperCase() === DOCTYPE) {
                        parser.state = S.DOCTYPE;
                        if (parser.doctype || parser.sawRoot) strictFail(parser, "Inappropriately located doctype declaration");
                        parser.doctype = "";
                        parser.sgmlDecl = "";
                    } else if (c === ">") {
                        emitNode(parser, "onsgmldeclaration", parser.sgmlDecl);
                        parser.sgmlDecl = "";
                        parser.state = S.TEXT;
                    } else if (isQuote(c)) {
                        parser.state = S.SGML_DECL_QUOTED;
                        parser.sgmlDecl += c;
                    } else parser.sgmlDecl += c;
                    continue;
                case S.SGML_DECL_QUOTED:
                    if (c === parser.q) {
                        parser.state = S.SGML_DECL;
                        parser.q = "";
                    }
                    parser.sgmlDecl += c;
                    continue;
                case S.DOCTYPE:
                    if (c === ">") {
                        parser.state = S.TEXT;
                        emitNode(parser, "ondoctype", parser.doctype);
                        parser.doctype = true;
                    } else {
                        parser.doctype += c;
                        if (c === "[") parser.state = S.DOCTYPE_DTD;
                        else if (isQuote(c)) {
                            parser.state = S.DOCTYPE_QUOTED;
                            parser.q = c;
                        }
                    }
                    continue;
                case S.DOCTYPE_QUOTED:
                    parser.doctype += c;
                    if (c === parser.q) {
                        parser.q = "";
                        parser.state = S.DOCTYPE;
                    }
                    continue;
                case S.DOCTYPE_DTD:
                    parser.doctype += c;
                    if (c === "]") parser.state = S.DOCTYPE;
                    else if (isQuote(c)) {
                        parser.state = S.DOCTYPE_DTD_QUOTED;
                        parser.q = c;
                    }
                    continue;
                case S.DOCTYPE_DTD_QUOTED:
                    parser.doctype += c;
                    if (c === parser.q) {
                        parser.state = S.DOCTYPE_DTD;
                        parser.q = "";
                    }
                    continue;
                case S.COMMENT:
                    if (c === "-") parser.state = S.COMMENT_ENDING;
                    else parser.comment += c;
                    continue;
                case S.COMMENT_ENDING:
                    if (c === "-") {
                        parser.state = S.COMMENT_ENDED;
                        parser.comment = textopts(parser.opt, parser.comment);
                        if (parser.comment) emitNode(parser, "oncomment", parser.comment);
                        parser.comment = "";
                    } else {
                        parser.comment += "-" + c;
                        parser.state = S.COMMENT;
                    }
                    continue;
                case S.COMMENT_ENDED:
                    if (c !== ">") {
                        strictFail(parser, "Malformed comment");
                        parser.comment += "--" + c;
                        parser.state = S.COMMENT;
                    } else parser.state = S.TEXT;
                    continue;
                case S.CDATA:
                    if (c === "]") parser.state = S.CDATA_ENDING;
                    else parser.cdata += c;
                    continue;
                case S.CDATA_ENDING:
                    if (c === "]") parser.state = S.CDATA_ENDING_2;
                    else {
                        parser.cdata += "]" + c;
                        parser.state = S.CDATA;
                    }
                    continue;
                case S.CDATA_ENDING_2:
                    if (c === ">") {
                        if (parser.cdata) emitNode(parser, "oncdata", parser.cdata);
                        emitNode(parser, "onclosecdata");
                        parser.cdata = "";
                        parser.state = S.TEXT;
                    } else if (c === "]") parser.cdata += "]";
                    else {
                        parser.cdata += "]]" + c;
                        parser.state = S.CDATA;
                    }
                    continue;
                case S.PROC_INST:
                    if (c === "?") parser.state = S.PROC_INST_ENDING;
                    else if (isWhitespace(c)) parser.state = S.PROC_INST_BODY;
                    else parser.procInstName += c;
                    continue;
                case S.PROC_INST_BODY:
                    if (!parser.procInstBody && isWhitespace(c)) continue;
                    else if (c === "?") parser.state = S.PROC_INST_ENDING;
                    else parser.procInstBody += c;
                    continue;
                case S.PROC_INST_ENDING:
                    if (c === ">") {
                        emitNode(parser, "onprocessinginstruction", {
                            name: parser.procInstName,
                            body: parser.procInstBody
                        });
                        parser.procInstName = parser.procInstBody = "";
                        parser.state = S.TEXT;
                    } else {
                        parser.procInstBody += "?" + c;
                        parser.state = S.PROC_INST_BODY;
                    }
                    continue;
                case S.OPEN_TAG:
                    if (isMatch(nameBody, c)) parser.tagName += c;
                    else {
                        newTag(parser);
                        if (c === ">") openTag(parser);
                        else if (c === "/") parser.state = S.OPEN_TAG_SLASH;
                        else {
                            if (!isWhitespace(c)) strictFail(parser, "Invalid character in tag name");
                            parser.state = S.ATTRIB;
                        }
                    }
                    continue;
                case S.OPEN_TAG_SLASH:
                    if (c === ">") {
                        openTag(parser, true);
                        closeTag(parser);
                    } else {
                        strictFail(parser, "Forward-slash in opening tag not followed by >");
                        parser.state = S.ATTRIB;
                    }
                    continue;
                case S.ATTRIB:
                    if (isWhitespace(c)) continue;
                    else if (c === ">") openTag(parser);
                    else if (c === "/") parser.state = S.OPEN_TAG_SLASH;
                    else if (isMatch(nameStart, c)) {
                        parser.attribName = c;
                        parser.attribValue = "";
                        parser.state = S.ATTRIB_NAME;
                    } else strictFail(parser, "Invalid attribute name");
                    continue;
                case S.ATTRIB_NAME:
                    if (c === "=") parser.state = S.ATTRIB_VALUE;
                    else if (c === ">") {
                        strictFail(parser, "Attribute without value");
                        parser.attribValue = parser.attribName;
                        attrib(parser);
                        openTag(parser);
                    } else if (isWhitespace(c)) parser.state = S.ATTRIB_NAME_SAW_WHITE;
                    else if (isMatch(nameBody, c)) parser.attribName += c;
                    else strictFail(parser, "Invalid attribute name");
                    continue;
                case S.ATTRIB_NAME_SAW_WHITE:
                    if (c === "=") parser.state = S.ATTRIB_VALUE;
                    else if (isWhitespace(c)) continue;
                    else {
                        strictFail(parser, "Attribute without value");
                        parser.tag.attributes[parser.attribName] = "";
                        parser.attribValue = "";
                        emitNode(parser, "onattribute", {
                            name: parser.attribName,
                            value: ""
                        });
                        parser.attribName = "";
                        if (c === ">") openTag(parser);
                        else if (isMatch(nameStart, c)) {
                            parser.attribName = c;
                            parser.state = S.ATTRIB_NAME;
                        } else {
                            strictFail(parser, "Invalid attribute name");
                            parser.state = S.ATTRIB;
                        }
                    }
                    continue;
                case S.ATTRIB_VALUE:
                    if (isWhitespace(c)) continue;
                    else if (isQuote(c)) {
                        parser.q = c;
                        parser.state = S.ATTRIB_VALUE_QUOTED;
                    } else {
                        strictFail(parser, "Unquoted attribute value");
                        parser.state = S.ATTRIB_VALUE_UNQUOTED;
                        parser.attribValue = c;
                    }
                    continue;
                case S.ATTRIB_VALUE_QUOTED:
                    if (c !== parser.q) {
                        if (c === "&") parser.state = S.ATTRIB_VALUE_ENTITY_Q;
                        else parser.attribValue += c;
                        continue;
                    }
                    attrib(parser);
                    parser.q = "";
                    parser.state = S.ATTRIB_VALUE_CLOSED;
                    continue;
                case S.ATTRIB_VALUE_CLOSED:
                    if (isWhitespace(c)) parser.state = S.ATTRIB;
                    else if (c === ">") openTag(parser);
                    else if (c === "/") parser.state = S.OPEN_TAG_SLASH;
                    else if (isMatch(nameStart, c)) {
                        strictFail(parser, "No whitespace between attributes");
                        parser.attribName = c;
                        parser.attribValue = "";
                        parser.state = S.ATTRIB_NAME;
                    } else strictFail(parser, "Invalid attribute name");
                    continue;
                case S.ATTRIB_VALUE_UNQUOTED:
                    if (!isAttribEnd(c)) {
                        if (c === "&") parser.state = S.ATTRIB_VALUE_ENTITY_U;
                        else parser.attribValue += c;
                        continue;
                    }
                    attrib(parser);
                    if (c === ">") openTag(parser);
                    else parser.state = S.ATTRIB;
                    continue;
                case S.CLOSE_TAG:
                    if (!parser.tagName) if (isWhitespace(c)) continue;
                    else if (notMatch(nameStart, c)) if (parser.script) {
                        parser.script += "</" + c;
                        parser.state = S.SCRIPT;
                    } else strictFail(parser, "Invalid tagname in closing tag.");
                    else parser.tagName = c;
                    else if (c === ">") closeTag(parser);
                    else if (isMatch(nameBody, c)) parser.tagName += c;
                    else if (parser.script) {
                        parser.script += "</" + parser.tagName;
                        parser.tagName = "";
                        parser.state = S.SCRIPT;
                    } else {
                        if (!isWhitespace(c)) strictFail(parser, "Invalid tagname in closing tag");
                        parser.state = S.CLOSE_TAG_SAW_WHITE;
                    }
                    continue;
                case S.CLOSE_TAG_SAW_WHITE:
                    if (isWhitespace(c)) continue;
                    if (c === ">") closeTag(parser);
                    else strictFail(parser, "Invalid characters in closing tag");
                    continue;
                case S.TEXT_ENTITY:
                case S.ATTRIB_VALUE_ENTITY_Q:
                case S.ATTRIB_VALUE_ENTITY_U:
                    var returnState;
                    var buffer;
                    switch(parser.state){
                        case S.TEXT_ENTITY:
                            returnState = S.TEXT;
                            buffer = "textNode";
                            break;
                        case S.ATTRIB_VALUE_ENTITY_Q:
                            returnState = S.ATTRIB_VALUE_QUOTED;
                            buffer = "attribValue";
                            break;
                        case S.ATTRIB_VALUE_ENTITY_U:
                            returnState = S.ATTRIB_VALUE_UNQUOTED;
                            buffer = "attribValue";
                            break;
                    }
                    if (c === ";") if (parser.opt.unparsedEntities) {
                        var parsedEntity = parseEntity(parser);
                        parser.entity = "";
                        parser.state = returnState;
                        parser.write(parsedEntity);
                    } else {
                        parser[buffer] += parseEntity(parser);
                        parser.entity = "";
                        parser.state = returnState;
                    }
                    else if (isMatch(parser.entity.length ? entityBody : entityStart, c)) parser.entity += c;
                    else {
                        strictFail(parser, "Invalid character in entity name");
                        parser[buffer] += "&" + parser.entity + c;
                        parser.entity = "";
                        parser.state = returnState;
                    }
                    continue;
                default:
                    throw new Error(parser, "Unknown state: " + parser.state);
            }
        }
        if (parser.position >= parser.bufferCheckPosition) checkBufferLength(parser);
        return parser;
    }
    /*! http://mths.be/fromcodepoint v0.1.0 by @mathias */ /* istanbul ignore next */ if (!String.fromCodePoint) (function() {
        var stringFromCharCode = String.fromCharCode;
        var floor = Math.floor;
        var fromCodePoint = function() {
            var MAX_SIZE = 16384;
            var codeUnits = [];
            var highSurrogate;
            var lowSurrogate;
            var index = -1;
            var length = arguments.length;
            if (!length) return "";
            var result = "";
            while(++index < length){
                var codePoint = Number(arguments[index]);
                if (!isFinite(codePoint) || codePoint < 0 || codePoint > 1114111 || floor(codePoint) !== codePoint) throw RangeError("Invalid code point: " + codePoint);
                if (codePoint <= 65535) codeUnits.push(codePoint);
                else {
                    codePoint -= 65536;
                    highSurrogate = (codePoint >> 10) + 55296;
                    lowSurrogate = codePoint % 1024 + 56320;
                    codeUnits.push(highSurrogate, lowSurrogate);
                }
                if (index + 1 === length || codeUnits.length > MAX_SIZE) {
                    result += stringFromCharCode.apply(null, codeUnits);
                    codeUnits.length = 0;
                }
            }
            return result;
        };
        /* istanbul ignore next */ if (Object.defineProperty) Object.defineProperty(String, "fromCodePoint", {
            value: fromCodePoint,
            configurable: true,
            writable: true
        });
        else String.fromCodePoint = fromCodePoint;
    })();
    return sax$1;
};
const sax = initializeSax();
;
 //# sourceMappingURL=sax.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/function_calling.js [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "convertToOpenAIFunction",
    ()=>convertToOpenAIFunction,
    "convertToOpenAITool",
    ()=>convertToOpenAITool,
    "function_calling_exports",
    ()=>function_calling_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/_virtual/rolldown_runtime.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json_schema$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/json_schema.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/tools/types.js [app-route] (ecmascript)");
;
;
;
//#region src/utils/function_calling.ts
var function_calling_exports = {};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__export"])(function_calling_exports, {
    convertToOpenAIFunction: ()=>convertToOpenAIFunction,
    convertToOpenAITool: ()=>convertToOpenAITool,
    isLangChainTool: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isLangChainTool"],
    isRunnableToolLike: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRunnableToolLike"],
    isStructuredTool: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isStructuredTool"],
    isStructuredToolParams: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isStructuredToolParams"]
});
/**
* Formats a `StructuredTool` or `RunnableToolLike` instance into a format
* that is compatible with OpenAI function calling. If `StructuredTool` or
* `RunnableToolLike` has a zod schema, the output will be converted into a
* JSON schema, which is then used as the parameters for the OpenAI tool.
*
* @param {StructuredToolInterface | RunnableToolLike} tool The tool to convert to an OpenAI function.
* @returns {FunctionDefinition} The inputted tool in OpenAI function format.
*/ function convertToOpenAIFunction(tool, fields) {
    const fieldsCopy = typeof fields === "number" ? void 0 : fields;
    return {
        name: tool.name,
        description: tool.description,
        parameters: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json_schema$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toJsonSchema"])(tool.schema),
        ...fieldsCopy?.strict !== void 0 ? {
            strict: fieldsCopy.strict
        } : {}
    };
}
/**
* Formats a `StructuredTool` or `RunnableToolLike` instance into a
* format that is compatible with OpenAI tool calling. If `StructuredTool` or
* `RunnableToolLike` has a zod schema, the output will be converted into a
* JSON schema, which is then used as the parameters for the OpenAI tool.
*
* @param {StructuredToolInterface | Record<string, any> | RunnableToolLike} tool The tool to convert to an OpenAI tool.
* @returns {ToolDefinition} The inputted tool in OpenAI tool format.
*/ function convertToOpenAITool(tool, fields) {
    const fieldsCopy = typeof fields === "number" ? void 0 : fields;
    let toolDef;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isLangChainTool"])(tool)) toolDef = {
        type: "function",
        function: convertToOpenAIFunction(tool)
    };
    else toolDef = tool;
    if (fieldsCopy?.strict !== void 0) toolDef.function.strict = fieldsCopy.strict;
    return toolDef;
}
;
 //# sourceMappingURL=function_calling.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/chunk_array.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "chunkArray",
    ()=>chunkArray,
    "chunk_array_exports",
    ()=>chunk_array_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/_virtual/rolldown_runtime.js [app-route] (ecmascript)");
;
//#region src/utils/chunk_array.ts
var chunk_array_exports = {};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__export"])(chunk_array_exports, {
    chunkArray: ()=>chunkArray
});
const chunkArray = (arr, chunkSize)=>arr.reduce((chunks, elem, index)=>{
        const chunkIndex = Math.floor(index / chunkSize);
        const chunk = chunks[chunkIndex] || [];
        chunks[chunkIndex] = chunk.concat([
            elem
        ]);
        return chunks;
    }, []);
;
 //# sourceMappingURL=chunk_array.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/function_calling.js [app-route] (ecmascript) <locals> <export convertToOpenAITool as formatToOpenAITool>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "formatToOpenAITool",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$function_calling$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["convertToOpenAITool"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$function_calling$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/function_calling.js [app-route] (ecmascript) <locals>");
}),
];

//# sourceMappingURL=a2d8e_%40langchain_core_dist_utils_91aed884._.js.map