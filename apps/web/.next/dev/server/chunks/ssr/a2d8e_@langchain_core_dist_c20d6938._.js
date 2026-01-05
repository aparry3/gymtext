module.exports = [
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/_virtual/rolldown_runtime.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

//#region rolldown:runtime
__turbopack_context__.s([
    "__export",
    ()=>__export
]);
var __defProp = Object.defineProperty;
var __export = (target, all)=>{
    for(var name in all)__defProp(target, name, {
        get: all[name],
        enumerable: true
    });
};
;
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/load/map_keys.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "keyFromJson",
    ()=>keyFromJson,
    "keyToJson",
    ()=>keyToJson,
    "mapKeys",
    ()=>mapKeys
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$node_modules$2f2e$pnpm$2f$decamelize$40$6$2e$0$2e$1$2f$node_modules$2f$decamelize$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/node_modules/.pnpm/decamelize@6.0.1/node_modules/decamelize/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$node_modules$2f2e$pnpm$2f$camelcase$40$9$2e$0$2e$0$2f$node_modules$2f$camelcase$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/node_modules/.pnpm/camelcase@9.0.0/node_modules/camelcase/index.js [app-rsc] (ecmascript)");
;
;
//#region src/load/map_keys.ts
function keyToJson(key, map) {
    return map?.[key] || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$node_modules$2f2e$pnpm$2f$decamelize$40$6$2e$0$2e$1$2f$node_modules$2f$decamelize$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["decamelize"])(key);
}
function keyFromJson(key, map) {
    return map?.[key] || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$node_modules$2f2e$pnpm$2f$camelcase$40$9$2e$0$2e$0$2f$node_modules$2f$camelcase$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["camelCase"])(key);
}
function mapKeys(fields, mapper, map) {
    const mapped = {};
    for(const key in fields)if (Object.hasOwn(fields, key)) mapped[mapper(key, map)] = fields[key];
    return mapped;
}
;
 //# sourceMappingURL=map_keys.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/load/serializable.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Serializable",
    ()=>Serializable,
    "get_lc_unique_name",
    ()=>get_lc_unique_name,
    "serializable_exports",
    ()=>serializable_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/_virtual/rolldown_runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$map_keys$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/load/map_keys.js [app-rsc] (ecmascript)");
;
;
//#region src/load/serializable.ts
var serializable_exports = {};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__export"])(serializable_exports, {
    Serializable: ()=>Serializable,
    get_lc_unique_name: ()=>get_lc_unique_name
});
function shallowCopy(obj) {
    return Array.isArray(obj) ? [
        ...obj
    ] : {
        ...obj
    };
}
function replaceSecrets(root, secretsMap) {
    const result = shallowCopy(root);
    for (const [path, secretId] of Object.entries(secretsMap)){
        const [last, ...partsReverse] = path.split(".").reverse();
        let current = result;
        for (const part of partsReverse.reverse()){
            if (current[part] === void 0) break;
            current[part] = shallowCopy(current[part]);
            current = current[part];
        }
        if (current[last] !== void 0) current[last] = {
            lc: 1,
            type: "secret",
            id: [
                secretId
            ]
        };
    }
    return result;
}
/**
* Get a unique name for the module, rather than parent class implementations.
* Should not be subclassed, subclass lc_name above instead.
*/ function get_lc_unique_name(serializableClass) {
    const parentClass = Object.getPrototypeOf(serializableClass);
    const lcNameIsSubclassed = typeof serializableClass.lc_name === "function" && (typeof parentClass.lc_name !== "function" || serializableClass.lc_name() !== parentClass.lc_name());
    if (lcNameIsSubclassed) return serializableClass.lc_name();
    else return serializableClass.name;
}
var Serializable = class Serializable {
    lc_serializable = false;
    lc_kwargs;
    /**
	* The name of the serializable. Override to provide an alias or
	* to preserve the serialized module name in minified environments.
	*
	* Implemented as a static method to support loading logic.
	*/ static lc_name() {
        return this.name;
    }
    /**
	* The final serialized identifier for the module.
	*/ get lc_id() {
        return [
            ...this.lc_namespace,
            get_lc_unique_name(this.constructor)
        ];
    }
    /**
	* A map of secrets, which will be omitted from serialization.
	* Keys are paths to the secret in constructor args, e.g. "foo.bar.baz".
	* Values are the secret ids, which will be used when deserializing.
	*/ get lc_secrets() {
        return void 0;
    }
    /**
	* A map of additional attributes to merge with constructor args.
	* Keys are the attribute names, e.g. "foo".
	* Values are the attribute values, which will be serialized.
	* These attributes need to be accepted by the constructor as arguments.
	*/ get lc_attributes() {
        return void 0;
    }
    /**
	* A map of aliases for constructor args.
	* Keys are the attribute names, e.g. "foo".
	* Values are the alias that will replace the key in serialization.
	* This is used to eg. make argument names match Python.
	*/ get lc_aliases() {
        return void 0;
    }
    /**
	* A manual list of keys that should be serialized.
	* If not overridden, all fields passed into the constructor will be serialized.
	*/ get lc_serializable_keys() {
        return void 0;
    }
    constructor(kwargs, ..._args){
        if (this.lc_serializable_keys !== void 0) this.lc_kwargs = Object.fromEntries(Object.entries(kwargs || {}).filter(([key])=>this.lc_serializable_keys?.includes(key)));
        else this.lc_kwargs = kwargs ?? {};
    }
    toJSON() {
        if (!this.lc_serializable) return this.toJSONNotImplemented();
        if (this.lc_kwargs instanceof Serializable || typeof this.lc_kwargs !== "object" || Array.isArray(this.lc_kwargs)) return this.toJSONNotImplemented();
        const aliases = {};
        const secrets = {};
        const kwargs = Object.keys(this.lc_kwargs).reduce((acc, key)=>{
            acc[key] = key in this ? this[key] : this.lc_kwargs[key];
            return acc;
        }, {});
        for(let current = Object.getPrototypeOf(this); current; current = Object.getPrototypeOf(current)){
            Object.assign(aliases, Reflect.get(current, "lc_aliases", this));
            Object.assign(secrets, Reflect.get(current, "lc_secrets", this));
            Object.assign(kwargs, Reflect.get(current, "lc_attributes", this));
        }
        Object.keys(secrets).forEach((keyPath)=>{
            let read = this;
            let write = kwargs;
            const [last, ...partsReverse] = keyPath.split(".").reverse();
            for (const key of partsReverse.reverse()){
                if (!(key in read) || read[key] === void 0) return;
                if (!(key in write) || write[key] === void 0) {
                    if (typeof read[key] === "object" && read[key] != null) write[key] = {};
                    else if (Array.isArray(read[key])) write[key] = [];
                }
                read = read[key];
                write = write[key];
            }
            if (last in read && read[last] !== void 0) write[last] = write[last] || read[last];
        });
        return {
            lc: 1,
            type: "constructor",
            id: this.lc_id,
            kwargs: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$map_keys$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["mapKeys"])(Object.keys(secrets).length ? replaceSecrets(kwargs, secrets) : kwargs, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$map_keys$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["keyToJson"], aliases)
        };
    }
    toJSONNotImplemented() {
        return {
            lc: 1,
            type: "not_implemented",
            id: this.lc_id
        };
    }
};
;
 //# sourceMappingURL=serializable.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/errors/index.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

//#region src/errors/index.ts
__turbopack_context__.s([
    "addLangChainErrorFields",
    ()=>addLangChainErrorFields
]);
function addLangChainErrorFields(error, lc_error_code) {
    error.lc_error_code = lc_error_code;
    error.message = `${error.message}\n\nTroubleshooting URL: https://docs.langchain.com/oss/javascript/langchain/errors/${lc_error_code}/\n`;
    return error;
}
;
 //# sourceMappingURL=index.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/tools/utils.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

//#region src/tools/utils.ts
__turbopack_context__.s([
    "ToolInputParsingException",
    ()=>ToolInputParsingException,
    "_configHasToolCallId",
    ()=>_configHasToolCallId,
    "_isToolCall",
    ()=>_isToolCall
]);
function _isToolCall(toolCall) {
    return !!(toolCall && typeof toolCall === "object" && "type" in toolCall && toolCall.type === "tool_call");
}
function _configHasToolCallId(config) {
    return !!(config && typeof config === "object" && "toolCall" in config && config.toolCall != null && typeof config.toolCall === "object" && "id" in config.toolCall && typeof config.toolCall.id === "string");
}
/**
* Custom error class used to handle exceptions related to tool input parsing.
* It extends the built-in `Error` class and adds an optional `output`
* property that can hold the output that caused the exception.
*/ var ToolInputParsingException = class extends Error {
    output;
    constructor(message, output){
        super(message);
        this.output = output;
    }
};
;
 //# sourceMappingURL=utils.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/tools/types.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isLangChainTool",
    ()=>isLangChainTool,
    "isRunnableToolLike",
    ()=>isRunnableToolLike,
    "isStructuredTool",
    ()=>isStructuredTool,
    "isStructuredToolParams",
    ()=>isStructuredToolParams
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/types/zod.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/runnables/base.js [app-rsc] (ecmascript)");
;
;
//#region src/tools/types.ts
/**
* Confirm whether the inputted tool is an instance of `StructuredToolInterface`.
*
* @param {StructuredToolInterface | JSONSchema | undefined} tool The tool to check if it is an instance of `StructuredToolInterface`.
* @returns {tool is StructuredToolInterface} Whether the inputted tool is an instance of `StructuredToolInterface`.
*/ function isStructuredTool(tool) {
    return tool !== void 0 && Array.isArray(tool.lc_namespace);
}
/**
* Confirm whether the inputted tool is an instance of `RunnableToolLike`.
*
* @param {unknown | undefined} tool The tool to check if it is an instance of `RunnableToolLike`.
* @returns {tool is RunnableToolLike} Whether the inputted tool is an instance of `RunnableToolLike`.
*/ function isRunnableToolLike(tool) {
    return tool !== void 0 && __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Runnable"].isRunnable(tool) && "lc_name" in tool.constructor && typeof tool.constructor.lc_name === "function" && tool.constructor.lc_name() === "RunnableToolLike";
}
/**
* Confirm whether or not the tool contains the necessary properties to be considered a `StructuredToolParams`.
*
* @param {unknown | undefined} tool The object to check if it is a `StructuredToolParams`.
* @returns {tool is StructuredToolParams} Whether the inputted object is a `StructuredToolParams`.
*/ function isStructuredToolParams(tool) {
    return !!tool && typeof tool === "object" && "name" in tool && "schema" in tool && ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isInteropZodSchema"])(tool.schema) || tool.schema != null && typeof tool.schema === "object" && "type" in tool.schema && typeof tool.schema.type === "string" && [
        "null",
        "boolean",
        "object",
        "array",
        "number",
        "string"
    ].includes(tool.schema.type));
}
/**
* Whether or not the tool is one of StructuredTool, RunnableTool or StructuredToolParams.
* It returns `is StructuredToolParams` since that is the most minimal interface of the three,
* while still containing the necessary properties to be passed to a LLM for tool calling.
*
* @param {unknown | undefined} tool The tool to check if it is a LangChain tool.
* @returns {tool is StructuredToolParams} Whether the inputted tool is a LangChain tool.
*/ function isLangChainTool(tool) {
    return isStructuredToolParams(tool) || isRunnableToolLike(tool) || isStructuredTool(tool);
}
;
 //# sourceMappingURL=types.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/tools/index.js [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseToolkit",
    ()=>BaseToolkit,
    "DynamicStructuredTool",
    ()=>DynamicStructuredTool,
    "DynamicTool",
    ()=>DynamicTool,
    "StructuredTool",
    ()=>StructuredTool,
    "Tool",
    ()=>Tool,
    "tool",
    ()=>tool,
    "tools_exports",
    ()=>tools_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/_virtual/rolldown_runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$tool$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/messages/tool.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/tools/utils.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$manager$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/callbacks/manager.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/singletons/async_local_storage/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/singletons/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/runnables/config.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$signal$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/signal.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/types/zod.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json_schema$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/json_schema.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/language_models/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/tools/types.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/v3/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/validate.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/v4/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$classic$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/v4/classic/index.js [app-rsc] (ecmascript)");
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
//#region src/tools/index.ts
var tools_exports = {};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__export"])(tools_exports, {
    BaseToolkit: ()=>BaseToolkit,
    DynamicStructuredTool: ()=>DynamicStructuredTool,
    DynamicTool: ()=>DynamicTool,
    StructuredTool: ()=>StructuredTool,
    Tool: ()=>Tool,
    ToolInputParsingException: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ToolInputParsingException"],
    isLangChainTool: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isLangChainTool"],
    isRunnableToolLike: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isRunnableToolLike"],
    isStructuredTool: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isStructuredTool"],
    isStructuredToolParams: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$types$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isStructuredToolParams"],
    tool: ()=>tool
});
/**
* Base class for Tools that accept input of any shape defined by a Zod schema.
*/ var StructuredTool = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseLangChain"] {
    /**
	* Optional provider-specific extra fields for the tool.
	*
	* This is used to pass provider-specific configuration that doesn't fit into
	* standard tool fields.
	*/ extras;
    /**
	* Whether to return the tool's output directly.
	*
	* Setting this to true means that after the tool is called,
	* an agent should stop looping.
	*/ returnDirect = false;
    verboseParsingErrors = false;
    get lc_namespace() {
        return [
            "langchain",
            "tools"
        ];
    }
    /**
	* The tool response format.
	*
	* If "content" then the output of the tool is interpreted as the contents of a
	* ToolMessage. If "content_and_artifact" then the output is expected to be a
	* two-tuple corresponding to the (content, artifact) of a ToolMessage.
	*
	* @default "content"
	*/ responseFormat = "content";
    /**
	* Default config object for the tool runnable.
	*/ defaultConfig;
    constructor(fields){
        super(fields ?? {});
        this.verboseParsingErrors = fields?.verboseParsingErrors ?? this.verboseParsingErrors;
        this.responseFormat = fields?.responseFormat ?? this.responseFormat;
        this.defaultConfig = fields?.defaultConfig ?? this.defaultConfig;
        this.metadata = fields?.metadata ?? this.metadata;
        this.extras = fields?.extras ?? this.extras;
    }
    /**
	* Invokes the tool with the provided input and configuration.
	* @param input The input for the tool.
	* @param config Optional configuration for the tool.
	* @returns A Promise that resolves with the tool's output.
	*/ async invoke(input, config) {
        let toolInput;
        let enrichedConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureConfig"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["mergeConfigs"])(this.defaultConfig, config));
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["_isToolCall"])(input)) {
            toolInput = input.args;
            enrichedConfig = {
                ...enrichedConfig,
                toolCall: input
            };
        } else toolInput = input;
        return this.call(toolInput, enrichedConfig);
    }
    /**
	* @deprecated Use .invoke() instead. Will be removed in 0.3.0.
	*
	* Calls the tool with the provided argument, configuration, and tags. It
	* parses the input according to the schema, handles any errors, and
	* manages callbacks.
	* @param arg The input argument for the tool.
	* @param configArg Optional configuration or callbacks for the tool.
	* @param tags Optional tags for the tool.
	* @returns A Promise that resolves with a string.
	*/ async call(arg, configArg, tags) {
        const inputForValidation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["_isToolCall"])(arg) ? arg.args : arg;
        let parsed;
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isInteropZodSchema"])(this.schema)) try {
            parsed = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["interopParseAsync"])(this.schema, inputForValidation);
        } catch (e) {
            let message = `Received tool input did not match expected schema`;
            if (this.verboseParsingErrors) message = `${message}\nDetails: ${e.message}`;
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isInteropZodError"])(e)) message = `${message}\n\n${__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v4$2f$classic$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].prettifyError(e)}`;
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ToolInputParsingException"](message, JSON.stringify(arg));
        }
        else {
            const result$1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["validate"])(inputForValidation, this.schema);
            if (!result$1.valid) {
                let message = `Received tool input did not match expected schema`;
                if (this.verboseParsingErrors) message = `${message}\nDetails: ${result$1.errors.map((e)=>`${e.keywordLocation}: ${e.error}`).join("\n")}`;
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ToolInputParsingException"](message, JSON.stringify(arg));
            }
            parsed = inputForValidation;
        }
        const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$manager$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseCallbackConfigArg"])(configArg);
        const callbackManager_ = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$manager$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CallbackManager"].configure(config.callbacks, this.callbacks, config.tags || tags, this.tags, config.metadata, this.metadata, {
            verbose: this.verbose
        });
        const runManager = await callbackManager_?.handleToolStart(this.toJSON(), typeof arg === "string" ? arg : JSON.stringify(arg), config.runId, void 0, void 0, void 0, config.runName);
        delete config.runId;
        let result;
        try {
            result = await this._call(parsed, runManager, config);
        } catch (e) {
            await runManager?.handleToolError(e);
            throw e;
        }
        let content;
        let artifact;
        if (this.responseFormat === "content_and_artifact") if (Array.isArray(result) && result.length === 2) [content, artifact] = result;
        else throw new Error(`Tool response format is "content_and_artifact" but the output was not a two-tuple.\nResult: ${JSON.stringify(result)}`);
        else content = result;
        let toolCallId;
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["_isToolCall"])(arg)) toolCallId = arg.id;
        if (!toolCallId && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tools$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["_configHasToolCallId"])(config)) toolCallId = config.toolCall.id;
        const formattedOutput = _formatToolOutput({
            content,
            artifact,
            toolCallId,
            name: this.name,
            metadata: this.metadata
        });
        await runManager?.handleToolEnd(formattedOutput);
        return formattedOutput;
    }
};
/**
* Base class for Tools that accept input as a string.
*/ var Tool = class extends StructuredTool {
    schema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].object({
        input: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].string().optional()
    }).transform((obj)=>obj.input);
    constructor(fields){
        super(fields);
    }
    /**
	* @deprecated Use .invoke() instead. Will be removed in 0.3.0.
	*
	* Calls the tool with the provided argument and callbacks. It handles
	* string inputs specifically.
	* @param arg The input argument for the tool, which can be a string, undefined, or an input of the tool's schema.
	* @param callbacks Optional callbacks for the tool.
	* @returns A Promise that resolves with a string.
	*/ call(arg, callbacks) {
        const structuredArg = typeof arg === "string" || arg == null ? {
            input: arg
        } : arg;
        return super.call(structuredArg, callbacks);
    }
};
/**
* A tool that can be created dynamically from a function, name, and description.
*/ var DynamicTool = class extends Tool {
    static lc_name() {
        return "DynamicTool";
    }
    name;
    description;
    func;
    constructor(fields){
        super(fields);
        this.name = fields.name;
        this.description = fields.description;
        this.func = fields.func;
        this.returnDirect = fields.returnDirect ?? this.returnDirect;
    }
    /**
	* @deprecated Use .invoke() instead. Will be removed in 0.3.0.
	*/ async call(arg, configArg) {
        const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$manager$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseCallbackConfigArg"])(configArg);
        if (config.runName === void 0) config.runName = this.name;
        return super.call(arg, config);
    }
    /** @ignore */ async _call(input, runManager, parentConfig) {
        return this.func(input, runManager, parentConfig);
    }
};
/**
* A tool that can be created dynamically from a function, name, and
* description, designed to work with structured data. It extends the
* StructuredTool class and overrides the _call method to execute the
* provided function when the tool is called.
*
* Schema can be passed as Zod or JSON schema. The tool will not validate
* input if JSON schema is passed.
*/ var DynamicStructuredTool = class extends StructuredTool {
    static lc_name() {
        return "DynamicStructuredTool";
    }
    name;
    description;
    func;
    schema;
    constructor(fields){
        super(fields);
        this.name = fields.name;
        this.description = fields.description;
        this.func = fields.func;
        this.returnDirect = fields.returnDirect ?? this.returnDirect;
        this.schema = fields.schema;
    }
    /**
	* @deprecated Use .invoke() instead. Will be removed in 0.3.0.
	*/ async call(arg, configArg, tags) {
        const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$manager$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseCallbackConfigArg"])(configArg);
        if (config.runName === void 0) config.runName = this.name;
        return super.call(arg, config, tags);
    }
    _call(arg, runManager, parentConfig) {
        return this.func(arg, runManager, parentConfig);
    }
};
/**
* Abstract base class for toolkits in LangChain. Toolkits are collections
* of tools that agents can use. Subclasses must implement the `tools`
* property to provide the specific tools for the toolkit.
*/ var BaseToolkit = class {
    getTools() {
        return this.tools;
    }
};
function tool(func, fields) {
    const isSimpleStringSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isSimpleStringZodSchema"])(fields.schema);
    const isStringJSONSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json_schema$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["validatesOnlyStrings"])(fields.schema);
    if (!fields.schema || isSimpleStringSchema || isStringJSONSchema) return new DynamicTool({
        ...fields,
        description: fields.description ?? fields.schema?.description ?? `${fields.name} tool`,
        func: async (input, runManager, config)=>{
            return new Promise((resolve, reject)=>{
                const childConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["patchConfig"])(config, {
                    callbacks: runManager?.getChild()
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AsyncLocalStorageProviderSingleton"].runWithConfig((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["pickRunnableConfigKeys"])(childConfig), async ()=>{
                    try {
                        resolve(func(input, childConfig));
                    } catch (e) {
                        reject(e);
                    }
                });
            });
        }
    });
    const schema = fields.schema;
    const description = fields.description ?? fields.schema.description ?? `${fields.name} tool`;
    return new DynamicStructuredTool({
        ...fields,
        description,
        schema,
        func: async (input, runManager, config)=>{
            return new Promise((resolve, reject)=>{
                let listener;
                const cleanup = ()=>{
                    if (config?.signal && listener) config.signal.removeEventListener("abort", listener);
                };
                if (config?.signal) {
                    listener = ()=>{
                        cleanup();
                        reject((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$signal$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getAbortSignalError"])(config.signal));
                    };
                    config.signal.addEventListener("abort", listener);
                }
                const childConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["patchConfig"])(config, {
                    callbacks: runManager?.getChild()
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AsyncLocalStorageProviderSingleton"].runWithConfig((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$config$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["pickRunnableConfigKeys"])(childConfig), async ()=>{
                    try {
                        const result = await func(input, childConfig);
                        /**
						* If the signal is aborted, we don't want to resolve the promise
						* as the promise is already rejected.
						*/ if (config?.signal?.aborted) {
                            cleanup();
                            return;
                        }
                        cleanup();
                        resolve(result);
                    } catch (e) {
                        cleanup();
                        reject(e);
                    }
                });
            });
        }
    });
}
function _formatToolOutput(params) {
    const { content, artifact, toolCallId, metadata } = params;
    if (toolCallId && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$tool$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isDirectToolOutput"])(content)) if (typeof content === "string" || Array.isArray(content) && content.every((item)=>typeof item === "object")) return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$tool$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ToolMessage"]({
        status: "success",
        content,
        artifact,
        tool_call_id: toolCallId,
        name: params.name,
        metadata
    });
    else return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$tool$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ToolMessage"]({
        status: "success",
        content: _stringify(content),
        artifact,
        tool_call_id: toolCallId,
        name: params.name,
        metadata
    });
    else return content;
}
function _stringify(content) {
    try {
        return JSON.stringify(content, null, 2) ?? "";
    } catch (_noOp) {
        return `${content}`;
    }
}
;
 //# sourceMappingURL=index.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/callbacks/base.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseCallbackHandler",
    ()=>BaseCallbackHandler,
    "base_exports",
    ()=>base_exports,
    "callbackHandlerPrefersStreaming",
    ()=>callbackHandlerPrefersStreaming,
    "isBaseCallbackHandler",
    ()=>isBaseCallbackHandler
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/_virtual/rolldown_runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$serializable$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/load/serializable.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$env$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/env.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$uuid$40$10$2e$0$2e$0$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$v4$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/uuid@10.0.0/node_modules/uuid/dist/esm-node/v4.js [app-rsc] (ecmascript) <export default as v4>");
;
;
;
;
//#region src/callbacks/base.ts
var base_exports = {};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__export"])(base_exports, {
    BaseCallbackHandler: ()=>BaseCallbackHandler,
    callbackHandlerPrefersStreaming: ()=>callbackHandlerPrefersStreaming,
    isBaseCallbackHandler: ()=>isBaseCallbackHandler
});
/**
* Abstract class that provides a set of optional methods that can be
* overridden in derived classes to handle various events during the
* execution of a LangChain application.
*/ var BaseCallbackHandlerMethodsClass = class {
};
function callbackHandlerPrefersStreaming(x) {
    return "lc_prefer_streaming" in x && x.lc_prefer_streaming;
}
/**
* Abstract base class for creating callback handlers in the LangChain
* framework. It provides a set of optional methods that can be overridden
* in derived classes to handle various events during the execution of a
* LangChain application.
*/ var BaseCallbackHandler = class extends BaseCallbackHandlerMethodsClass {
    lc_serializable = false;
    get lc_namespace() {
        return [
            "langchain_core",
            "callbacks",
            this.name
        ];
    }
    get lc_secrets() {
        return void 0;
    }
    get lc_attributes() {
        return void 0;
    }
    get lc_aliases() {
        return void 0;
    }
    get lc_serializable_keys() {
        return void 0;
    }
    /**
	* The name of the serializable. Override to provide an alias or
	* to preserve the serialized module name in minified environments.
	*
	* Implemented as a static method to support loading logic.
	*/ static lc_name() {
        return this.name;
    }
    /**
	* The final serialized identifier for the module.
	*/ get lc_id() {
        return [
            ...this.lc_namespace,
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$serializable$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["get_lc_unique_name"])(this.constructor)
        ];
    }
    lc_kwargs;
    ignoreLLM = false;
    ignoreChain = false;
    ignoreAgent = false;
    ignoreRetriever = false;
    ignoreCustomEvent = false;
    raiseError = false;
    awaitHandlers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$env$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getEnvironmentVariable"])("LANGCHAIN_CALLBACKS_BACKGROUND") === "false";
    constructor(input){
        super();
        this.lc_kwargs = input || {};
        if (input) {
            this.ignoreLLM = input.ignoreLLM ?? this.ignoreLLM;
            this.ignoreChain = input.ignoreChain ?? this.ignoreChain;
            this.ignoreAgent = input.ignoreAgent ?? this.ignoreAgent;
            this.ignoreRetriever = input.ignoreRetriever ?? this.ignoreRetriever;
            this.ignoreCustomEvent = input.ignoreCustomEvent ?? this.ignoreCustomEvent;
            this.raiseError = input.raiseError ?? this.raiseError;
            this.awaitHandlers = this.raiseError || (input._awaitHandler ?? this.awaitHandlers);
        }
    }
    copy() {
        return new this.constructor(this);
    }
    toJSON() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$serializable$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Serializable"].prototype.toJSON.call(this);
    }
    toJSONNotImplemented() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$serializable$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Serializable"].prototype.toJSONNotImplemented.call(this);
    }
    static fromMethods(methods) {
        class Handler extends BaseCallbackHandler {
            name = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$uuid$40$10$2e$0$2e$0$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$v4$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"]();
            constructor(){
                super();
                Object.assign(this, methods);
            }
        }
        return new Handler();
    }
};
const isBaseCallbackHandler = (x)=>{
    const callbackHandler = x;
    return callbackHandler !== void 0 && typeof callbackHandler.copy === "function" && typeof callbackHandler.name === "string" && typeof callbackHandler.awaitHandlers === "boolean";
};
;
 //# sourceMappingURL=base.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/callbacks/promises.js [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "promises_exports",
    ()=>promises_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/_virtual/rolldown_runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/singletons/callbacks.js [app-rsc] (ecmascript)");
;
;
//#region src/callbacks/promises.ts
var promises_exports = {};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__export"])(promises_exports, {
    awaitAllCallbacks: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["awaitAllCallbacks"],
    consumeCallback: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["consumeCallback"]
});
;
 //# sourceMappingURL=promises.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/callbacks/manager.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseCallbackManager",
    ()=>BaseCallbackManager,
    "BaseRunManager",
    ()=>BaseRunManager,
    "CallbackManager",
    ()=>CallbackManager,
    "CallbackManagerForChainRun",
    ()=>CallbackManagerForChainRun,
    "CallbackManagerForLLMRun",
    ()=>CallbackManagerForLLMRun,
    "CallbackManagerForRetrieverRun",
    ()=>CallbackManagerForRetrieverRun,
    "CallbackManagerForToolRun",
    ()=>CallbackManagerForToolRun,
    "ensureHandler",
    ()=>ensureHandler,
    "manager_exports",
    ()=>manager_exports,
    "parseCallbackConfigArg",
    ()=>parseCallbackConfigArg
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/_virtual/rolldown_runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/messages/utils.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$env$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/env.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/callbacks/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/tracers/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$console$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/tracers/console.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$tracer_langchain$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/tracers/tracer_langchain.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/singletons/callbacks.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$promises$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/callbacks/promises.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/callbacks.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$context$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/singletons/async_local_storage/context.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$uuid$40$10$2e$0$2e$0$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$v4$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/uuid@10.0.0/node_modules/uuid/dist/esm-node/v4.js [app-rsc] (ecmascript) <export default as v4>");
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
//#region src/callbacks/manager.ts
var manager_exports = {};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__export"])(manager_exports, {
    BaseCallbackManager: ()=>BaseCallbackManager,
    BaseRunManager: ()=>BaseRunManager,
    CallbackManager: ()=>CallbackManager,
    CallbackManagerForChainRun: ()=>CallbackManagerForChainRun,
    CallbackManagerForLLMRun: ()=>CallbackManagerForLLMRun,
    CallbackManagerForRetrieverRun: ()=>CallbackManagerForRetrieverRun,
    CallbackManagerForToolRun: ()=>CallbackManagerForToolRun,
    ensureHandler: ()=>ensureHandler,
    parseCallbackConfigArg: ()=>parseCallbackConfigArg
});
function parseCallbackConfigArg(arg) {
    if (!arg) return {};
    else if (Array.isArray(arg) || "name" in arg) return {
        callbacks: arg
    };
    else return arg;
}
/**
* Manage callbacks from different components of LangChain.
*/ var BaseCallbackManager = class {
    setHandler(handler) {
        return this.setHandlers([
            handler
        ]);
    }
};
/**
* Base class for run manager in LangChain.
*/ var BaseRunManager = class {
    constructor(runId, handlers, inheritableHandlers, tags, inheritableTags, metadata, inheritableMetadata, _parentRunId){
        this.runId = runId;
        this.handlers = handlers;
        this.inheritableHandlers = inheritableHandlers;
        this.tags = tags;
        this.inheritableTags = inheritableTags;
        this.metadata = metadata;
        this.inheritableMetadata = inheritableMetadata;
        this._parentRunId = _parentRunId;
    }
    get parentRunId() {
        return this._parentRunId;
    }
    async handleText(text) {
        await Promise.all(this.handlers.map((handler)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["consumeCallback"])(async ()=>{
                try {
                    await handler.handleText?.(text, this.runId, this._parentRunId, this.tags);
                } catch (err) {
                    const logFunction = handler.raiseError ? console.error : console.warn;
                    logFunction(`Error in handler ${handler.constructor.name}, handleText: ${err}`);
                    if (handler.raiseError) throw err;
                }
            }, handler.awaitHandlers)));
    }
    async handleCustomEvent(eventName, data, _runId, _tags, _metadata) {
        await Promise.all(this.handlers.map((handler)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["consumeCallback"])(async ()=>{
                try {
                    await handler.handleCustomEvent?.(eventName, data, this.runId, this.tags, this.metadata);
                } catch (err) {
                    const logFunction = handler.raiseError ? console.error : console.warn;
                    logFunction(`Error in handler ${handler.constructor.name}, handleCustomEvent: ${err}`);
                    if (handler.raiseError) throw err;
                }
            }, handler.awaitHandlers)));
    }
};
/**
* Manages callbacks for retriever runs.
*/ var CallbackManagerForRetrieverRun = class extends BaseRunManager {
    getChild(tag) {
        const manager = new CallbackManager(this.runId);
        manager.setHandlers(this.inheritableHandlers);
        manager.addTags(this.inheritableTags);
        manager.addMetadata(this.inheritableMetadata);
        if (tag) manager.addTags([
            tag
        ], false);
        return manager;
    }
    async handleRetrieverEnd(documents) {
        await Promise.all(this.handlers.map((handler)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["consumeCallback"])(async ()=>{
                if (!handler.ignoreRetriever) try {
                    await handler.handleRetrieverEnd?.(documents, this.runId, this._parentRunId, this.tags);
                } catch (err) {
                    const logFunction = handler.raiseError ? console.error : console.warn;
                    logFunction(`Error in handler ${handler.constructor.name}, handleRetriever`);
                    if (handler.raiseError) throw err;
                }
            }, handler.awaitHandlers)));
    }
    async handleRetrieverError(err) {
        await Promise.all(this.handlers.map((handler)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["consumeCallback"])(async ()=>{
                if (!handler.ignoreRetriever) try {
                    await handler.handleRetrieverError?.(err, this.runId, this._parentRunId, this.tags);
                } catch (error) {
                    const logFunction = handler.raiseError ? console.error : console.warn;
                    logFunction(`Error in handler ${handler.constructor.name}, handleRetrieverError: ${error}`);
                    if (handler.raiseError) throw err;
                }
            }, handler.awaitHandlers)));
    }
};
var CallbackManagerForLLMRun = class extends BaseRunManager {
    async handleLLMNewToken(token, idx, _runId, _parentRunId, _tags, fields) {
        await Promise.all(this.handlers.map((handler)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["consumeCallback"])(async ()=>{
                if (!handler.ignoreLLM) try {
                    await handler.handleLLMNewToken?.(token, idx ?? {
                        prompt: 0,
                        completion: 0
                    }, this.runId, this._parentRunId, this.tags, fields);
                } catch (err) {
                    const logFunction = handler.raiseError ? console.error : console.warn;
                    logFunction(`Error in handler ${handler.constructor.name}, handleLLMNewToken: ${err}`);
                    if (handler.raiseError) throw err;
                }
            }, handler.awaitHandlers)));
    }
    async handleLLMError(err, _runId, _parentRunId, _tags, extraParams) {
        await Promise.all(this.handlers.map((handler)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["consumeCallback"])(async ()=>{
                if (!handler.ignoreLLM) try {
                    await handler.handleLLMError?.(err, this.runId, this._parentRunId, this.tags, extraParams);
                } catch (err$1) {
                    const logFunction = handler.raiseError ? console.error : console.warn;
                    logFunction(`Error in handler ${handler.constructor.name}, handleLLMError: ${err$1}`);
                    if (handler.raiseError) throw err$1;
                }
            }, handler.awaitHandlers)));
    }
    async handleLLMEnd(output, _runId, _parentRunId, _tags, extraParams) {
        await Promise.all(this.handlers.map((handler)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["consumeCallback"])(async ()=>{
                if (!handler.ignoreLLM) try {
                    await handler.handleLLMEnd?.(output, this.runId, this._parentRunId, this.tags, extraParams);
                } catch (err) {
                    const logFunction = handler.raiseError ? console.error : console.warn;
                    logFunction(`Error in handler ${handler.constructor.name}, handleLLMEnd: ${err}`);
                    if (handler.raiseError) throw err;
                }
            }, handler.awaitHandlers)));
    }
};
var CallbackManagerForChainRun = class extends BaseRunManager {
    getChild(tag) {
        const manager = new CallbackManager(this.runId);
        manager.setHandlers(this.inheritableHandlers);
        manager.addTags(this.inheritableTags);
        manager.addMetadata(this.inheritableMetadata);
        if (tag) manager.addTags([
            tag
        ], false);
        return manager;
    }
    async handleChainError(err, _runId, _parentRunId, _tags, kwargs) {
        await Promise.all(this.handlers.map((handler)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["consumeCallback"])(async ()=>{
                if (!handler.ignoreChain) try {
                    await handler.handleChainError?.(err, this.runId, this._parentRunId, this.tags, kwargs);
                } catch (err$1) {
                    const logFunction = handler.raiseError ? console.error : console.warn;
                    logFunction(`Error in handler ${handler.constructor.name}, handleChainError: ${err$1}`);
                    if (handler.raiseError) throw err$1;
                }
            }, handler.awaitHandlers)));
    }
    async handleChainEnd(output, _runId, _parentRunId, _tags, kwargs) {
        await Promise.all(this.handlers.map((handler)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["consumeCallback"])(async ()=>{
                if (!handler.ignoreChain) try {
                    await handler.handleChainEnd?.(output, this.runId, this._parentRunId, this.tags, kwargs);
                } catch (err) {
                    const logFunction = handler.raiseError ? console.error : console.warn;
                    logFunction(`Error in handler ${handler.constructor.name}, handleChainEnd: ${err}`);
                    if (handler.raiseError) throw err;
                }
            }, handler.awaitHandlers)));
    }
    async handleAgentAction(action) {
        await Promise.all(this.handlers.map((handler)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["consumeCallback"])(async ()=>{
                if (!handler.ignoreAgent) try {
                    await handler.handleAgentAction?.(action, this.runId, this._parentRunId, this.tags);
                } catch (err) {
                    const logFunction = handler.raiseError ? console.error : console.warn;
                    logFunction(`Error in handler ${handler.constructor.name}, handleAgentAction: ${err}`);
                    if (handler.raiseError) throw err;
                }
            }, handler.awaitHandlers)));
    }
    async handleAgentEnd(action) {
        await Promise.all(this.handlers.map((handler)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["consumeCallback"])(async ()=>{
                if (!handler.ignoreAgent) try {
                    await handler.handleAgentEnd?.(action, this.runId, this._parentRunId, this.tags);
                } catch (err) {
                    const logFunction = handler.raiseError ? console.error : console.warn;
                    logFunction(`Error in handler ${handler.constructor.name}, handleAgentEnd: ${err}`);
                    if (handler.raiseError) throw err;
                }
            }, handler.awaitHandlers)));
    }
};
var CallbackManagerForToolRun = class extends BaseRunManager {
    getChild(tag) {
        const manager = new CallbackManager(this.runId);
        manager.setHandlers(this.inheritableHandlers);
        manager.addTags(this.inheritableTags);
        manager.addMetadata(this.inheritableMetadata);
        if (tag) manager.addTags([
            tag
        ], false);
        return manager;
    }
    async handleToolError(err) {
        await Promise.all(this.handlers.map((handler)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["consumeCallback"])(async ()=>{
                if (!handler.ignoreAgent) try {
                    await handler.handleToolError?.(err, this.runId, this._parentRunId, this.tags);
                } catch (err$1) {
                    const logFunction = handler.raiseError ? console.error : console.warn;
                    logFunction(`Error in handler ${handler.constructor.name}, handleToolError: ${err$1}`);
                    if (handler.raiseError) throw err$1;
                }
            }, handler.awaitHandlers)));
    }
    async handleToolEnd(output) {
        await Promise.all(this.handlers.map((handler)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["consumeCallback"])(async ()=>{
                if (!handler.ignoreAgent) try {
                    await handler.handleToolEnd?.(output, this.runId, this._parentRunId, this.tags);
                } catch (err) {
                    const logFunction = handler.raiseError ? console.error : console.warn;
                    logFunction(`Error in handler ${handler.constructor.name}, handleToolEnd: ${err}`);
                    if (handler.raiseError) throw err;
                }
            }, handler.awaitHandlers)));
    }
};
/**
* @example
* ```typescript
* const prompt = PromptTemplate.fromTemplate("What is the answer to {question}?");
*
* // Example of using LLMChain with OpenAI and a simple prompt
* const chain = new LLMChain({
*   llm: new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0.9 }),
*   prompt,
* });
*
* // Running the chain with a single question
* const result = await chain.call({
*   question: "What is the airspeed velocity of an unladen swallow?",
* });
* console.log("The answer is:", result);
* ```
*/ var CallbackManager = class CallbackManager extends BaseCallbackManager {
    handlers = [];
    inheritableHandlers = [];
    tags = [];
    inheritableTags = [];
    metadata = {};
    inheritableMetadata = {};
    name = "callback_manager";
    _parentRunId;
    constructor(parentRunId, options){
        super();
        this.handlers = options?.handlers ?? this.handlers;
        this.inheritableHandlers = options?.inheritableHandlers ?? this.inheritableHandlers;
        this.tags = options?.tags ?? this.tags;
        this.inheritableTags = options?.inheritableTags ?? this.inheritableTags;
        this.metadata = options?.metadata ?? this.metadata;
        this.inheritableMetadata = options?.inheritableMetadata ?? this.inheritableMetadata;
        this._parentRunId = parentRunId;
    }
    /**
	* Gets the parent run ID, if any.
	*
	* @returns The parent run ID.
	*/ getParentRunId() {
        return this._parentRunId;
    }
    async handleLLMStart(llm, prompts, runId = void 0, _parentRunId = void 0, extraParams = void 0, _tags = void 0, _metadata = void 0, runName = void 0) {
        return Promise.all(prompts.map(async (prompt, idx)=>{
            const runId_ = idx === 0 && runId ? runId : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$uuid$40$10$2e$0$2e$0$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$v4$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])();
            await Promise.all(this.handlers.map((handler)=>{
                if (handler.ignoreLLM) return;
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isBaseTracer"])(handler)) handler._createRunForLLMStart(llm, [
                    prompt
                ], runId_, this._parentRunId, extraParams, this.tags, this.metadata, runName);
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["consumeCallback"])(async ()=>{
                    try {
                        await handler.handleLLMStart?.(llm, [
                            prompt
                        ], runId_, this._parentRunId, extraParams, this.tags, this.metadata, runName);
                    } catch (err) {
                        const logFunction = handler.raiseError ? console.error : console.warn;
                        logFunction(`Error in handler ${handler.constructor.name}, handleLLMStart: ${err}`);
                        if (handler.raiseError) throw err;
                    }
                }, handler.awaitHandlers);
            }));
            return new CallbackManagerForLLMRun(runId_, this.handlers, this.inheritableHandlers, this.tags, this.inheritableTags, this.metadata, this.inheritableMetadata, this._parentRunId);
        }));
    }
    async handleChatModelStart(llm, messages, runId = void 0, _parentRunId = void 0, extraParams = void 0, _tags = void 0, _metadata = void 0, runName = void 0) {
        return Promise.all(messages.map(async (messageGroup, idx)=>{
            const runId_ = idx === 0 && runId ? runId : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$uuid$40$10$2e$0$2e$0$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$v4$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])();
            await Promise.all(this.handlers.map((handler)=>{
                if (handler.ignoreLLM) return;
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isBaseTracer"])(handler)) handler._createRunForChatModelStart(llm, [
                    messageGroup
                ], runId_, this._parentRunId, extraParams, this.tags, this.metadata, runName);
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["consumeCallback"])(async ()=>{
                    try {
                        if (handler.handleChatModelStart) await handler.handleChatModelStart?.(llm, [
                            messageGroup
                        ], runId_, this._parentRunId, extraParams, this.tags, this.metadata, runName);
                        else if (handler.handleLLMStart) {
                            const messageString = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getBufferString"])(messageGroup);
                            await handler.handleLLMStart?.(llm, [
                                messageString
                            ], runId_, this._parentRunId, extraParams, this.tags, this.metadata, runName);
                        }
                    } catch (err) {
                        const logFunction = handler.raiseError ? console.error : console.warn;
                        logFunction(`Error in handler ${handler.constructor.name}, handleLLMStart: ${err}`);
                        if (handler.raiseError) throw err;
                    }
                }, handler.awaitHandlers);
            }));
            return new CallbackManagerForLLMRun(runId_, this.handlers, this.inheritableHandlers, this.tags, this.inheritableTags, this.metadata, this.inheritableMetadata, this._parentRunId);
        }));
    }
    async handleChainStart(chain, inputs, runId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$uuid$40$10$2e$0$2e$0$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$v4$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(), runType = void 0, _tags = void 0, _metadata = void 0, runName = void 0) {
        await Promise.all(this.handlers.map((handler)=>{
            if (handler.ignoreChain) return;
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isBaseTracer"])(handler)) handler._createRunForChainStart(chain, inputs, runId, this._parentRunId, this.tags, this.metadata, runType, runName);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["consumeCallback"])(async ()=>{
                try {
                    await handler.handleChainStart?.(chain, inputs, runId, this._parentRunId, this.tags, this.metadata, runType, runName);
                } catch (err) {
                    const logFunction = handler.raiseError ? console.error : console.warn;
                    logFunction(`Error in handler ${handler.constructor.name}, handleChainStart: ${err}`);
                    if (handler.raiseError) throw err;
                }
            }, handler.awaitHandlers);
        }));
        return new CallbackManagerForChainRun(runId, this.handlers, this.inheritableHandlers, this.tags, this.inheritableTags, this.metadata, this.inheritableMetadata, this._parentRunId);
    }
    async handleToolStart(tool, input, runId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$uuid$40$10$2e$0$2e$0$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$v4$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(), _parentRunId = void 0, _tags = void 0, _metadata = void 0, runName = void 0) {
        await Promise.all(this.handlers.map((handler)=>{
            if (handler.ignoreAgent) return;
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isBaseTracer"])(handler)) handler._createRunForToolStart(tool, input, runId, this._parentRunId, this.tags, this.metadata, runName);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["consumeCallback"])(async ()=>{
                try {
                    await handler.handleToolStart?.(tool, input, runId, this._parentRunId, this.tags, this.metadata, runName);
                } catch (err) {
                    const logFunction = handler.raiseError ? console.error : console.warn;
                    logFunction(`Error in handler ${handler.constructor.name}, handleToolStart: ${err}`);
                    if (handler.raiseError) throw err;
                }
            }, handler.awaitHandlers);
        }));
        return new CallbackManagerForToolRun(runId, this.handlers, this.inheritableHandlers, this.tags, this.inheritableTags, this.metadata, this.inheritableMetadata, this._parentRunId);
    }
    async handleRetrieverStart(retriever, query, runId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$uuid$40$10$2e$0$2e$0$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$v4$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(), _parentRunId = void 0, _tags = void 0, _metadata = void 0, runName = void 0) {
        await Promise.all(this.handlers.map((handler)=>{
            if (handler.ignoreRetriever) return;
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isBaseTracer"])(handler)) handler._createRunForRetrieverStart(retriever, query, runId, this._parentRunId, this.tags, this.metadata, runName);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["consumeCallback"])(async ()=>{
                try {
                    await handler.handleRetrieverStart?.(retriever, query, runId, this._parentRunId, this.tags, this.metadata, runName);
                } catch (err) {
                    const logFunction = handler.raiseError ? console.error : console.warn;
                    logFunction(`Error in handler ${handler.constructor.name}, handleRetrieverStart: ${err}`);
                    if (handler.raiseError) throw err;
                }
            }, handler.awaitHandlers);
        }));
        return new CallbackManagerForRetrieverRun(runId, this.handlers, this.inheritableHandlers, this.tags, this.inheritableTags, this.metadata, this.inheritableMetadata, this._parentRunId);
    }
    async handleCustomEvent(eventName, data, runId, _tags, _metadata) {
        await Promise.all(this.handlers.map((handler)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["consumeCallback"])(async ()=>{
                if (!handler.ignoreCustomEvent) try {
                    await handler.handleCustomEvent?.(eventName, data, runId, this.tags, this.metadata);
                } catch (err) {
                    const logFunction = handler.raiseError ? console.error : console.warn;
                    logFunction(`Error in handler ${handler.constructor.name}, handleCustomEvent: ${err}`);
                    if (handler.raiseError) throw err;
                }
            }, handler.awaitHandlers)));
    }
    addHandler(handler, inherit = true) {
        this.handlers.push(handler);
        if (inherit) this.inheritableHandlers.push(handler);
    }
    removeHandler(handler) {
        this.handlers = this.handlers.filter((_handler)=>_handler !== handler);
        this.inheritableHandlers = this.inheritableHandlers.filter((_handler)=>_handler !== handler);
    }
    setHandlers(handlers, inherit = true) {
        this.handlers = [];
        this.inheritableHandlers = [];
        for (const handler of handlers)this.addHandler(handler, inherit);
    }
    addTags(tags, inherit = true) {
        this.removeTags(tags);
        this.tags.push(...tags);
        if (inherit) this.inheritableTags.push(...tags);
    }
    removeTags(tags) {
        this.tags = this.tags.filter((tag)=>!tags.includes(tag));
        this.inheritableTags = this.inheritableTags.filter((tag)=>!tags.includes(tag));
    }
    addMetadata(metadata, inherit = true) {
        this.metadata = {
            ...this.metadata,
            ...metadata
        };
        if (inherit) this.inheritableMetadata = {
            ...this.inheritableMetadata,
            ...metadata
        };
    }
    removeMetadata(metadata) {
        for (const key of Object.keys(metadata)){
            delete this.metadata[key];
            delete this.inheritableMetadata[key];
        }
    }
    copy(additionalHandlers = [], inherit = true) {
        const manager = new CallbackManager(this._parentRunId);
        for (const handler of this.handlers){
            const inheritable = this.inheritableHandlers.includes(handler);
            manager.addHandler(handler, inheritable);
        }
        for (const tag of this.tags){
            const inheritable = this.inheritableTags.includes(tag);
            manager.addTags([
                tag
            ], inheritable);
        }
        for (const key of Object.keys(this.metadata)){
            const inheritable = Object.keys(this.inheritableMetadata).includes(key);
            manager.addMetadata({
                [key]: this.metadata[key]
            }, inheritable);
        }
        for (const handler of additionalHandlers){
            if (manager.handlers.filter((h)=>h.name === "console_callback_handler").some((h)=>h.name === handler.name)) continue;
            manager.addHandler(handler, inherit);
        }
        return manager;
    }
    static fromHandlers(handlers) {
        class Handler extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseCallbackHandler"] {
            name = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$uuid$40$10$2e$0$2e$0$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$v4$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])();
            constructor(){
                super();
                Object.assign(this, handlers);
            }
        }
        const manager = new this();
        manager.addHandler(new Handler());
        return manager;
    }
    static configure(inheritableHandlers, localHandlers, inheritableTags, localTags, inheritableMetadata, localMetadata, options) {
        return this._configureSync(inheritableHandlers, localHandlers, inheritableTags, localTags, inheritableMetadata, localMetadata, options);
    }
    static _configureSync(inheritableHandlers, localHandlers, inheritableTags, localTags, inheritableMetadata, localMetadata, options) {
        let callbackManager;
        if (inheritableHandlers || localHandlers) {
            if (Array.isArray(inheritableHandlers) || !inheritableHandlers) {
                callbackManager = new CallbackManager();
                callbackManager.setHandlers(inheritableHandlers?.map(ensureHandler) ?? [], true);
            } else callbackManager = inheritableHandlers;
            callbackManager = callbackManager.copy(Array.isArray(localHandlers) ? localHandlers.map(ensureHandler) : localHandlers?.handlers, false);
        }
        const verboseEnabled = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$env$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getEnvironmentVariable"])("LANGCHAIN_VERBOSE") === "true" || options?.verbose;
        const tracingV2Enabled = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$tracer_langchain$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["LangChainTracer"].getTraceableRunTree()?.tracingEnabled || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$callbacks$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isTracingEnabled"])();
        const tracingEnabled = tracingV2Enabled || ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$env$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getEnvironmentVariable"])("LANGCHAIN_TRACING") ?? false);
        if (verboseEnabled || tracingEnabled) {
            if (!callbackManager) callbackManager = new CallbackManager();
            if (verboseEnabled && !callbackManager.handlers.some((handler)=>handler.name === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$console$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ConsoleCallbackHandler"].prototype.name)) {
                const consoleHandler = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$console$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ConsoleCallbackHandler"]();
                callbackManager.addHandler(consoleHandler, true);
            }
            if (tracingEnabled && !callbackManager.handlers.some((handler)=>handler.name === "langchain_tracer")) {
                if (tracingV2Enabled) {
                    const tracerV2 = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$tracer_langchain$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["LangChainTracer"]();
                    callbackManager.addHandler(tracerV2, true);
                }
            }
            if (tracingV2Enabled) {
                const implicitRunTree = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$tracer_langchain$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["LangChainTracer"].getTraceableRunTree();
                if (implicitRunTree && callbackManager._parentRunId === void 0) {
                    callbackManager._parentRunId = implicitRunTree.id;
                    const tracerV2 = callbackManager.handlers.find((handler)=>handler.name === "langchain_tracer");
                    tracerV2?.updateFromRunTree(implicitRunTree);
                }
            }
        }
        for (const { contextVar, inheritable = true, handlerClass, envVar } of (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$context$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["_getConfigureHooks"])()){
            const createIfNotInContext = envVar && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$env$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getEnvironmentVariable"])(envVar) === "true" && handlerClass;
            let handler;
            const contextVarValue = contextVar !== void 0 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$context$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getContextVariable"])(contextVar) : void 0;
            if (contextVarValue && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isBaseCallbackHandler"])(contextVarValue)) handler = contextVarValue;
            else if (createIfNotInContext) handler = new handlerClass({});
            if (handler !== void 0) {
                if (!callbackManager) callbackManager = new CallbackManager();
                if (!callbackManager.handlers.some((h)=>h.name === handler.name)) callbackManager.addHandler(handler, inheritable);
            }
        }
        if (inheritableTags || localTags) {
            if (callbackManager) {
                callbackManager.addTags(inheritableTags ?? []);
                callbackManager.addTags(localTags ?? [], false);
            }
        }
        if (inheritableMetadata || localMetadata) {
            if (callbackManager) {
                callbackManager.addMetadata(inheritableMetadata ?? {});
                callbackManager.addMetadata(localMetadata ?? {}, false);
            }
        }
        return callbackManager;
    }
};
function ensureHandler(handler) {
    if ("name" in handler) return handler;
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseCallbackHandler"].fromMethods(handler);
}
;
 //# sourceMappingURL=manager.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/tracers/base.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseTracer",
    ()=>BaseTracer,
    "base_exports",
    ()=>base_exports,
    "isBaseTracer",
    ()=>isBaseTracer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/_virtual/rolldown_runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$env$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/env.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/callbacks/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$3$2e$72_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$2_$40$op_7ow2d6aq23ha3vqd6kfsdw35ce$2f$node_modules$2f$langsmith$2f$run_trees$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/langsmith@0.3.72_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57.2_@op_7ow2d6aq23ha3vqd6kfsdw35ce/node_modules/langsmith/run_trees.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$3$2e$72_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$2_$40$op_7ow2d6aq23ha3vqd6kfsdw35ce$2f$node_modules$2f$langsmith$2f$dist$2f$run_trees$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/langsmith@0.3.72_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57.2_@op_7ow2d6aq23ha3vqd6kfsdw35ce/node_modules/langsmith/dist/run_trees.js [app-rsc] (ecmascript)");
;
;
;
;
//#region src/tracers/base.ts
var base_exports = {};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__export"])(base_exports, {
    BaseTracer: ()=>BaseTracer,
    isBaseTracer: ()=>isBaseTracer
});
const convertRunTreeToRun = (runTree)=>{
    if (!runTree) return void 0;
    runTree.events = runTree.events ?? [];
    runTree.child_runs = runTree.child_runs ?? [];
    return runTree;
};
function convertRunToRunTree(run, parentRun) {
    if (!run) return void 0;
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$3$2e$72_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$2_$40$op_7ow2d6aq23ha3vqd6kfsdw35ce$2f$node_modules$2f$langsmith$2f$dist$2f$run_trees$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["RunTree"]({
        ...run,
        start_time: run._serialized_start_time ?? run.start_time,
        parent_run: convertRunToRunTree(parentRun),
        child_runs: run.child_runs.map((r)=>convertRunToRunTree(r)).filter((r)=>r !== void 0),
        extra: {
            ...run.extra,
            runtime: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$env$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getRuntimeEnvironment"])()
        },
        tracingEnabled: false
    });
}
function _coerceToDict(value, defaultKey) {
    return value && !Array.isArray(value) && typeof value === "object" ? value : {
        [defaultKey]: value
    };
}
function isBaseTracer(x) {
    return typeof x._addRunToRunMap === "function";
}
var BaseTracer = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseCallbackHandler"] {
    /** @deprecated Use `runTreeMap` instead. */ runMap = /* @__PURE__ */ new Map();
    runTreeMap = /* @__PURE__ */ new Map();
    usesRunTreeMap = false;
    constructor(_fields){
        super(...arguments);
    }
    copy() {
        return this;
    }
    getRunById(runId) {
        if (runId === void 0) return void 0;
        return this.usesRunTreeMap ? convertRunTreeToRun(this.runTreeMap.get(runId)) : this.runMap.get(runId);
    }
    stringifyError(error) {
        if (error instanceof Error) return error.message + (error?.stack ? `\n\n${error.stack}` : "");
        if (typeof error === "string") return error;
        return `${error}`;
    }
    _addChildRun(parentRun, childRun) {
        parentRun.child_runs.push(childRun);
    }
    _addRunToRunMap(run) {
        const { dottedOrder: currentDottedOrder, microsecondPrecisionDatestring } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$3$2e$72_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$2_$40$op_7ow2d6aq23ha3vqd6kfsdw35ce$2f$node_modules$2f$langsmith$2f$dist$2f$run_trees$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["convertToDottedOrderFormat"])(new Date(run.start_time).getTime(), run.id, run.execution_order);
        const storedRun = {
            ...run
        };
        const parentRun = this.getRunById(storedRun.parent_run_id);
        if (storedRun.parent_run_id !== void 0) {
            if (parentRun) {
                this._addChildRun(parentRun, storedRun);
                parentRun.child_execution_order = Math.max(parentRun.child_execution_order, storedRun.child_execution_order);
                storedRun.trace_id = parentRun.trace_id;
                if (parentRun.dotted_order !== void 0) {
                    storedRun.dotted_order = [
                        parentRun.dotted_order,
                        currentDottedOrder
                    ].join(".");
                    storedRun._serialized_start_time = microsecondPrecisionDatestring;
                }
            }
        } else {
            storedRun.trace_id = storedRun.id;
            storedRun.dotted_order = currentDottedOrder;
            storedRun._serialized_start_time = microsecondPrecisionDatestring;
        }
        if (this.usesRunTreeMap) {
            const runTree = convertRunToRunTree(storedRun, parentRun);
            if (runTree !== void 0) this.runTreeMap.set(storedRun.id, runTree);
        } else this.runMap.set(storedRun.id, storedRun);
        return storedRun;
    }
    async _endTrace(run) {
        const parentRun = run.parent_run_id !== void 0 && this.getRunById(run.parent_run_id);
        if (parentRun) parentRun.child_execution_order = Math.max(parentRun.child_execution_order, run.child_execution_order);
        else await this.persistRun(run);
        await this.onRunUpdate?.(run);
        if (this.usesRunTreeMap) this.runTreeMap.delete(run.id);
        else this.runMap.delete(run.id);
    }
    _getExecutionOrder(parentRunId) {
        const parentRun = parentRunId !== void 0 && this.getRunById(parentRunId);
        if (!parentRun) return 1;
        return parentRun.child_execution_order + 1;
    }
    /**
	* Create and add a run to the run map for LLM start events.
	* This must sometimes be done synchronously to avoid race conditions
	* when callbacks are backgrounded, so we expose it as a separate method here.
	*/ _createRunForLLMStart(llm, prompts, runId, parentRunId, extraParams, tags, metadata, name) {
        const execution_order = this._getExecutionOrder(parentRunId);
        const start_time = Date.now();
        const finalExtraParams = metadata ? {
            ...extraParams,
            metadata
        } : extraParams;
        const run = {
            id: runId,
            name: name ?? llm.id[llm.id.length - 1],
            parent_run_id: parentRunId,
            start_time,
            serialized: llm,
            events: [
                {
                    name: "start",
                    time: new Date(start_time).toISOString()
                }
            ],
            inputs: {
                prompts
            },
            execution_order,
            child_runs: [],
            child_execution_order: execution_order,
            run_type: "llm",
            extra: finalExtraParams ?? {},
            tags: tags || []
        };
        return this._addRunToRunMap(run);
    }
    async handleLLMStart(llm, prompts, runId, parentRunId, extraParams, tags, metadata, name) {
        const run = this.getRunById(runId) ?? this._createRunForLLMStart(llm, prompts, runId, parentRunId, extraParams, tags, metadata, name);
        await this.onRunCreate?.(run);
        await this.onLLMStart?.(run);
        return run;
    }
    /**
	* Create and add a run to the run map for chat model start events.
	* This must sometimes be done synchronously to avoid race conditions
	* when callbacks are backgrounded, so we expose it as a separate method here.
	*/ _createRunForChatModelStart(llm, messages, runId, parentRunId, extraParams, tags, metadata, name) {
        const execution_order = this._getExecutionOrder(parentRunId);
        const start_time = Date.now();
        const finalExtraParams = metadata ? {
            ...extraParams,
            metadata
        } : extraParams;
        const run = {
            id: runId,
            name: name ?? llm.id[llm.id.length - 1],
            parent_run_id: parentRunId,
            start_time,
            serialized: llm,
            events: [
                {
                    name: "start",
                    time: new Date(start_time).toISOString()
                }
            ],
            inputs: {
                messages
            },
            execution_order,
            child_runs: [],
            child_execution_order: execution_order,
            run_type: "llm",
            extra: finalExtraParams ?? {},
            tags: tags || []
        };
        return this._addRunToRunMap(run);
    }
    async handleChatModelStart(llm, messages, runId, parentRunId, extraParams, tags, metadata, name) {
        const run = this.getRunById(runId) ?? this._createRunForChatModelStart(llm, messages, runId, parentRunId, extraParams, tags, metadata, name);
        await this.onRunCreate?.(run);
        await this.onLLMStart?.(run);
        return run;
    }
    async handleLLMEnd(output, runId, _parentRunId, _tags, extraParams) {
        const run = this.getRunById(runId);
        if (!run || run?.run_type !== "llm") throw new Error("No LLM run to end.");
        run.end_time = Date.now();
        run.outputs = output;
        run.events.push({
            name: "end",
            time: new Date(run.end_time).toISOString()
        });
        run.extra = {
            ...run.extra,
            ...extraParams
        };
        await this.onLLMEnd?.(run);
        await this._endTrace(run);
        return run;
    }
    async handleLLMError(error, runId, _parentRunId, _tags, extraParams) {
        const run = this.getRunById(runId);
        if (!run || run?.run_type !== "llm") throw new Error("No LLM run to end.");
        run.end_time = Date.now();
        run.error = this.stringifyError(error);
        run.events.push({
            name: "error",
            time: new Date(run.end_time).toISOString()
        });
        run.extra = {
            ...run.extra,
            ...extraParams
        };
        await this.onLLMError?.(run);
        await this._endTrace(run);
        return run;
    }
    /**
	* Create and add a run to the run map for chain start events.
	* This must sometimes be done synchronously to avoid race conditions
	* when callbacks are backgrounded, so we expose it as a separate method here.
	*/ _createRunForChainStart(chain, inputs, runId, parentRunId, tags, metadata, runType, name) {
        const execution_order = this._getExecutionOrder(parentRunId);
        const start_time = Date.now();
        const run = {
            id: runId,
            name: name ?? chain.id[chain.id.length - 1],
            parent_run_id: parentRunId,
            start_time,
            serialized: chain,
            events: [
                {
                    name: "start",
                    time: new Date(start_time).toISOString()
                }
            ],
            inputs,
            execution_order,
            child_execution_order: execution_order,
            run_type: runType ?? "chain",
            child_runs: [],
            extra: metadata ? {
                metadata
            } : {},
            tags: tags || []
        };
        return this._addRunToRunMap(run);
    }
    async handleChainStart(chain, inputs, runId, parentRunId, tags, metadata, runType, name) {
        const run = this.getRunById(runId) ?? this._createRunForChainStart(chain, inputs, runId, parentRunId, tags, metadata, runType, name);
        await this.onRunCreate?.(run);
        await this.onChainStart?.(run);
        return run;
    }
    async handleChainEnd(outputs, runId, _parentRunId, _tags, kwargs) {
        const run = this.getRunById(runId);
        if (!run) throw new Error("No chain run to end.");
        run.end_time = Date.now();
        run.outputs = _coerceToDict(outputs, "output");
        run.events.push({
            name: "end",
            time: new Date(run.end_time).toISOString()
        });
        if (kwargs?.inputs !== void 0) run.inputs = _coerceToDict(kwargs.inputs, "input");
        await this.onChainEnd?.(run);
        await this._endTrace(run);
        return run;
    }
    async handleChainError(error, runId, _parentRunId, _tags, kwargs) {
        const run = this.getRunById(runId);
        if (!run) throw new Error("No chain run to end.");
        run.end_time = Date.now();
        run.error = this.stringifyError(error);
        run.events.push({
            name: "error",
            time: new Date(run.end_time).toISOString()
        });
        if (kwargs?.inputs !== void 0) run.inputs = _coerceToDict(kwargs.inputs, "input");
        await this.onChainError?.(run);
        await this._endTrace(run);
        return run;
    }
    /**
	* Create and add a run to the run map for tool start events.
	* This must sometimes be done synchronously to avoid race conditions
	* when callbacks are backgrounded, so we expose it as a separate method here.
	*/ _createRunForToolStart(tool, input, runId, parentRunId, tags, metadata, name) {
        const execution_order = this._getExecutionOrder(parentRunId);
        const start_time = Date.now();
        const run = {
            id: runId,
            name: name ?? tool.id[tool.id.length - 1],
            parent_run_id: parentRunId,
            start_time,
            serialized: tool,
            events: [
                {
                    name: "start",
                    time: new Date(start_time).toISOString()
                }
            ],
            inputs: {
                input
            },
            execution_order,
            child_execution_order: execution_order,
            run_type: "tool",
            child_runs: [],
            extra: metadata ? {
                metadata
            } : {},
            tags: tags || []
        };
        return this._addRunToRunMap(run);
    }
    async handleToolStart(tool, input, runId, parentRunId, tags, metadata, name) {
        const run = this.getRunById(runId) ?? this._createRunForToolStart(tool, input, runId, parentRunId, tags, metadata, name);
        await this.onRunCreate?.(run);
        await this.onToolStart?.(run);
        return run;
    }
    async handleToolEnd(output, runId) {
        const run = this.getRunById(runId);
        if (!run || run?.run_type !== "tool") throw new Error("No tool run to end");
        run.end_time = Date.now();
        run.outputs = {
            output
        };
        run.events.push({
            name: "end",
            time: new Date(run.end_time).toISOString()
        });
        await this.onToolEnd?.(run);
        await this._endTrace(run);
        return run;
    }
    async handleToolError(error, runId) {
        const run = this.getRunById(runId);
        if (!run || run?.run_type !== "tool") throw new Error("No tool run to end");
        run.end_time = Date.now();
        run.error = this.stringifyError(error);
        run.events.push({
            name: "error",
            time: new Date(run.end_time).toISOString()
        });
        await this.onToolError?.(run);
        await this._endTrace(run);
        return run;
    }
    async handleAgentAction(action, runId) {
        const run = this.getRunById(runId);
        if (!run || run?.run_type !== "chain") return;
        const agentRun = run;
        agentRun.actions = agentRun.actions || [];
        agentRun.actions.push(action);
        agentRun.events.push({
            name: "agent_action",
            time: /* @__PURE__ */ new Date().toISOString(),
            kwargs: {
                action
            }
        });
        await this.onAgentAction?.(run);
    }
    async handleAgentEnd(action, runId) {
        const run = this.getRunById(runId);
        if (!run || run?.run_type !== "chain") return;
        run.events.push({
            name: "agent_end",
            time: /* @__PURE__ */ new Date().toISOString(),
            kwargs: {
                action
            }
        });
        await this.onAgentEnd?.(run);
    }
    /**
	* Create and add a run to the run map for retriever start events.
	* This must sometimes be done synchronously to avoid race conditions
	* when callbacks are backgrounded, so we expose it as a separate method here.
	*/ _createRunForRetrieverStart(retriever, query, runId, parentRunId, tags, metadata, name) {
        const execution_order = this._getExecutionOrder(parentRunId);
        const start_time = Date.now();
        const run = {
            id: runId,
            name: name ?? retriever.id[retriever.id.length - 1],
            parent_run_id: parentRunId,
            start_time,
            serialized: retriever,
            events: [
                {
                    name: "start",
                    time: new Date(start_time).toISOString()
                }
            ],
            inputs: {
                query
            },
            execution_order,
            child_execution_order: execution_order,
            run_type: "retriever",
            child_runs: [],
            extra: metadata ? {
                metadata
            } : {},
            tags: tags || []
        };
        return this._addRunToRunMap(run);
    }
    async handleRetrieverStart(retriever, query, runId, parentRunId, tags, metadata, name) {
        const run = this.getRunById(runId) ?? this._createRunForRetrieverStart(retriever, query, runId, parentRunId, tags, metadata, name);
        await this.onRunCreate?.(run);
        await this.onRetrieverStart?.(run);
        return run;
    }
    async handleRetrieverEnd(documents, runId) {
        const run = this.getRunById(runId);
        if (!run || run?.run_type !== "retriever") throw new Error("No retriever run to end");
        run.end_time = Date.now();
        run.outputs = {
            documents
        };
        run.events.push({
            name: "end",
            time: new Date(run.end_time).toISOString()
        });
        await this.onRetrieverEnd?.(run);
        await this._endTrace(run);
        return run;
    }
    async handleRetrieverError(error, runId) {
        const run = this.getRunById(runId);
        if (!run || run?.run_type !== "retriever") throw new Error("No retriever run to end");
        run.end_time = Date.now();
        run.error = this.stringifyError(error);
        run.events.push({
            name: "error",
            time: new Date(run.end_time).toISOString()
        });
        await this.onRetrieverError?.(run);
        await this._endTrace(run);
        return run;
    }
    async handleText(text, runId) {
        const run = this.getRunById(runId);
        if (!run || run?.run_type !== "chain") return;
        run.events.push({
            name: "text",
            time: /* @__PURE__ */ new Date().toISOString(),
            kwargs: {
                text
            }
        });
        await this.onText?.(run);
    }
    async handleLLMNewToken(token, idx, runId, _parentRunId, _tags, fields) {
        const run = this.getRunById(runId);
        if (!run || run?.run_type !== "llm") throw new Error(`Invalid "runId" provided to "handleLLMNewToken" callback.`);
        run.events.push({
            name: "new_token",
            time: /* @__PURE__ */ new Date().toISOString(),
            kwargs: {
                token,
                idx,
                chunk: fields?.chunk
            }
        });
        await this.onLLMNewToken?.(run, token, {
            chunk: fields?.chunk
        });
        return run;
    }
};
;
 //# sourceMappingURL=base.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/tracers/console.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ConsoleCallbackHandler",
    ()=>ConsoleCallbackHandler,
    "console_exports",
    ()=>console_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/_virtual/rolldown_runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/tracers/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$node_modules$2f2e$pnpm$2f$ansi$2d$styles$40$6$2e$2$2e$3$2f$node_modules$2f$ansi$2d$styles$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/node_modules/.pnpm/ansi-styles@6.2.3/node_modules/ansi-styles/index.js [app-rsc] (ecmascript)");
;
;
;
//#region src/tracers/console.ts
var console_exports = {};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__export"])(console_exports, {
    ConsoleCallbackHandler: ()=>ConsoleCallbackHandler
});
function wrap(style, text) {
    return `${style.open}${text}${style.close}`;
}
function tryJsonStringify(obj, fallback) {
    try {
        return JSON.stringify(obj, null, 2);
    } catch  {
        return fallback;
    }
}
function formatKVMapItem(value) {
    if (typeof value === "string") return value.trim();
    if (value === null || value === void 0) return value;
    return tryJsonStringify(value, value.toString());
}
function elapsed(run) {
    if (!run.end_time) return "";
    const elapsed$1 = run.end_time - run.start_time;
    if (elapsed$1 < 1e3) return `${elapsed$1}ms`;
    return `${(elapsed$1 / 1e3).toFixed(2)}s`;
}
const { color } = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$node_modules$2f2e$pnpm$2f$ansi$2d$styles$40$6$2e$2$2e$3$2f$node_modules$2f$ansi$2d$styles$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"];
/**
* A tracer that logs all events to the console. It extends from the
* `BaseTracer` class and overrides its methods to provide custom logging
* functionality.
* @example
* ```typescript
*
* const llm = new ChatAnthropic({
*   temperature: 0,
*   tags: ["example", "callbacks", "constructor"],
*   callbacks: [new ConsoleCallbackHandler()],
* });
*
* ```
*/ var ConsoleCallbackHandler = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseTracer"] {
    name = "console_callback_handler";
    /**
	* Method used to persist the run. In this case, it simply returns a
	* resolved promise as there's no persistence logic.
	* @param _run The run to persist.
	* @returns A resolved promise.
	*/ persistRun(_run) {
        return Promise.resolve();
    }
    /**
	* Method used to get all the parent runs of a given run.
	* @param run The run whose parents are to be retrieved.
	* @returns An array of parent runs.
	*/ getParents(run) {
        const parents = [];
        let currentRun = run;
        while(currentRun.parent_run_id){
            const parent = this.runMap.get(currentRun.parent_run_id);
            if (parent) {
                parents.push(parent);
                currentRun = parent;
            } else break;
        }
        return parents;
    }
    /**
	* Method used to get a string representation of the run's lineage, which
	* is used in logging.
	* @param run The run whose lineage is to be retrieved.
	* @returns A string representation of the run's lineage.
	*/ getBreadcrumbs(run) {
        const parents = this.getParents(run).reverse();
        const string = [
            ...parents,
            run
        ].map((parent, i, arr)=>{
            const name = `${parent.execution_order}:${parent.run_type}:${parent.name}`;
            return i === arr.length - 1 ? wrap(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$node_modules$2f2e$pnpm$2f$ansi$2d$styles$40$6$2e$2$2e$3$2f$node_modules$2f$ansi$2d$styles$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].bold, name) : name;
        }).join(" > ");
        return wrap(color.grey, string);
    }
    /**
	* Method used to log the start of a chain run.
	* @param run The chain run that has started.
	* @returns void
	*/ onChainStart(run) {
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.green, "[chain/start]")} [${crumbs}] Entering Chain run with input: ${tryJsonStringify(run.inputs, "[inputs]")}`);
    }
    /**
	* Method used to log the end of a chain run.
	* @param run The chain run that has ended.
	* @returns void
	*/ onChainEnd(run) {
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.cyan, "[chain/end]")} [${crumbs}] [${elapsed(run)}] Exiting Chain run with output: ${tryJsonStringify(run.outputs, "[outputs]")}`);
    }
    /**
	* Method used to log any errors of a chain run.
	* @param run The chain run that has errored.
	* @returns void
	*/ onChainError(run) {
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.red, "[chain/error]")} [${crumbs}] [${elapsed(run)}] Chain run errored with error: ${tryJsonStringify(run.error, "[error]")}`);
    }
    /**
	* Method used to log the start of an LLM run.
	* @param run The LLM run that has started.
	* @returns void
	*/ onLLMStart(run) {
        const crumbs = this.getBreadcrumbs(run);
        const inputs = "prompts" in run.inputs ? {
            prompts: run.inputs.prompts.map((p)=>p.trim())
        } : run.inputs;
        console.log(`${wrap(color.green, "[llm/start]")} [${crumbs}] Entering LLM run with input: ${tryJsonStringify(inputs, "[inputs]")}`);
    }
    /**
	* Method used to log the end of an LLM run.
	* @param run The LLM run that has ended.
	* @returns void
	*/ onLLMEnd(run) {
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.cyan, "[llm/end]")} [${crumbs}] [${elapsed(run)}] Exiting LLM run with output: ${tryJsonStringify(run.outputs, "[response]")}`);
    }
    /**
	* Method used to log any errors of an LLM run.
	* @param run The LLM run that has errored.
	* @returns void
	*/ onLLMError(run) {
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.red, "[llm/error]")} [${crumbs}] [${elapsed(run)}] LLM run errored with error: ${tryJsonStringify(run.error, "[error]")}`);
    }
    /**
	* Method used to log the start of a tool run.
	* @param run The tool run that has started.
	* @returns void
	*/ onToolStart(run) {
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.green, "[tool/start]")} [${crumbs}] Entering Tool run with input: "${formatKVMapItem(run.inputs.input)}"`);
    }
    /**
	* Method used to log the end of a tool run.
	* @param run The tool run that has ended.
	* @returns void
	*/ onToolEnd(run) {
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.cyan, "[tool/end]")} [${crumbs}] [${elapsed(run)}] Exiting Tool run with output: "${formatKVMapItem(run.outputs?.output)}"`);
    }
    /**
	* Method used to log any errors of a tool run.
	* @param run The tool run that has errored.
	* @returns void
	*/ onToolError(run) {
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.red, "[tool/error]")} [${crumbs}] [${elapsed(run)}] Tool run errored with error: ${tryJsonStringify(run.error, "[error]")}`);
    }
    /**
	* Method used to log the start of a retriever run.
	* @param run The retriever run that has started.
	* @returns void
	*/ onRetrieverStart(run) {
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.green, "[retriever/start]")} [${crumbs}] Entering Retriever run with input: ${tryJsonStringify(run.inputs, "[inputs]")}`);
    }
    /**
	* Method used to log the end of a retriever run.
	* @param run The retriever run that has ended.
	* @returns void
	*/ onRetrieverEnd(run) {
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.cyan, "[retriever/end]")} [${crumbs}] [${elapsed(run)}] Exiting Retriever run with output: ${tryJsonStringify(run.outputs, "[outputs]")}`);
    }
    /**
	* Method used to log any errors of a retriever run.
	* @param run The retriever run that has errored.
	* @returns void
	*/ onRetrieverError(run) {
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.red, "[retriever/error]")} [${crumbs}] [${elapsed(run)}] Retriever run errored with error: ${tryJsonStringify(run.error, "[error]")}`);
    }
    /**
	* Method used to log the action selected by the agent.
	* @param run The run in which the agent action occurred.
	* @returns void
	*/ onAgentAction(run) {
        const agentRun = run;
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.blue, "[agent/action]")} [${crumbs}] Agent selected action: ${tryJsonStringify(agentRun.actions[agentRun.actions.length - 1], "[action]")}`);
    }
};
;
 //# sourceMappingURL=console.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/tracers/tracer_langchain.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LangChainTracer",
    ()=>LangChainTracer,
    "tracer_langchain_exports",
    ()=>tracer_langchain_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/_virtual/rolldown_runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/tracers/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$tracer$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/singletons/tracer.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$3$2e$72_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$2_$40$op_7ow2d6aq23ha3vqd6kfsdw35ce$2f$node_modules$2f$langsmith$2f$singletons$2f$traceable$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/langsmith@0.3.72_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57.2_@op_7ow2d6aq23ha3vqd6kfsdw35ce/node_modules/langsmith/singletons/traceable.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$3$2e$72_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$2_$40$op_7ow2d6aq23ha3vqd6kfsdw35ce$2f$node_modules$2f$langsmith$2f$dist$2f$singletons$2f$traceable$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/langsmith@0.3.72_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57.2_@op_7ow2d6aq23ha3vqd6kfsdw35ce/node_modules/langsmith/dist/singletons/traceable.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$3$2e$72_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$2_$40$op_7ow2d6aq23ha3vqd6kfsdw35ce$2f$node_modules$2f$langsmith$2f$run_trees$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/langsmith@0.3.72_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57.2_@op_7ow2d6aq23ha3vqd6kfsdw35ce/node_modules/langsmith/run_trees.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$3$2e$72_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$2_$40$op_7ow2d6aq23ha3vqd6kfsdw35ce$2f$node_modules$2f$langsmith$2f$dist$2f$run_trees$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/langsmith@0.3.72_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57.2_@op_7ow2d6aq23ha3vqd6kfsdw35ce/node_modules/langsmith/dist/run_trees.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$3$2e$72_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$2_$40$op_7ow2d6aq23ha3vqd6kfsdw35ce$2f$node_modules$2f$langsmith$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/langsmith@0.3.72_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57.2_@op_7ow2d6aq23ha3vqd6kfsdw35ce/node_modules/langsmith/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$3$2e$72_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$2_$40$op_7ow2d6aq23ha3vqd6kfsdw35ce$2f$node_modules$2f$langsmith$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/langsmith@0.3.72_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57.2_@op_7ow2d6aq23ha3vqd6kfsdw35ce/node_modules/langsmith/dist/index.js [app-rsc] (ecmascript)");
;
;
;
;
;
;
//#region src/tracers/tracer_langchain.ts
var tracer_langchain_exports = {};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__export"])(tracer_langchain_exports, {
    LangChainTracer: ()=>LangChainTracer
});
var LangChainTracer = class LangChainTracer extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseTracer"] {
    name = "langchain_tracer";
    projectName;
    exampleId;
    client;
    replicas;
    usesRunTreeMap = true;
    constructor(fields = {}){
        super(fields);
        const { exampleId, projectName, client, replicas } = fields;
        this.projectName = projectName ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$3$2e$72_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$2_$40$op_7ow2d6aq23ha3vqd6kfsdw35ce$2f$node_modules$2f$langsmith$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDefaultProjectName"])();
        this.replicas = replicas;
        this.exampleId = exampleId;
        this.client = client ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$tracer$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDefaultLangChainClientSingleton"])();
        const traceableTree = LangChainTracer.getTraceableRunTree();
        if (traceableTree) this.updateFromRunTree(traceableTree);
    }
    async persistRun(_run) {}
    async onRunCreate(run) {
        const runTree = this.getRunTreeWithTracingConfig(run.id);
        await runTree?.postRun();
    }
    async onRunUpdate(run) {
        const runTree = this.getRunTreeWithTracingConfig(run.id);
        await runTree?.patchRun();
    }
    getRun(id) {
        return this.runTreeMap.get(id);
    }
    updateFromRunTree(runTree) {
        this.runTreeMap.set(runTree.id, runTree);
        let rootRun = runTree;
        const visited = /* @__PURE__ */ new Set();
        while(rootRun.parent_run){
            if (visited.has(rootRun.id)) break;
            visited.add(rootRun.id);
            if (!rootRun.parent_run) break;
            rootRun = rootRun.parent_run;
        }
        visited.clear();
        const queue = [
            rootRun
        ];
        while(queue.length > 0){
            const current = queue.shift();
            if (!current || visited.has(current.id)) continue;
            visited.add(current.id);
            this.runTreeMap.set(current.id, current);
            if (current.child_runs) queue.push(...current.child_runs);
        }
        this.client = runTree.client ?? this.client;
        this.replicas = runTree.replicas ?? this.replicas;
        this.projectName = runTree.project_name ?? this.projectName;
        this.exampleId = runTree.reference_example_id ?? this.exampleId;
    }
    getRunTreeWithTracingConfig(id) {
        const runTree = this.runTreeMap.get(id);
        if (!runTree) return void 0;
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$3$2e$72_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$2_$40$op_7ow2d6aq23ha3vqd6kfsdw35ce$2f$node_modules$2f$langsmith$2f$dist$2f$run_trees$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["RunTree"]({
            ...runTree,
            client: this.client,
            project_name: this.projectName,
            replicas: this.replicas,
            reference_example_id: this.exampleId,
            tracingEnabled: true
        });
    }
    static getTraceableRunTree() {
        try {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$3$2e$72_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$2_$40$op_7ow2d6aq23ha3vqd6kfsdw35ce$2f$node_modules$2f$langsmith$2f$dist$2f$singletons$2f$traceable$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCurrentRunTree"])(true);
        } catch  {
            return void 0;
        }
    }
};
;
 //# sourceMappingURL=tracer_langchain.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/tracers/log_stream.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LogStreamCallbackHandler",
    ()=>LogStreamCallbackHandler,
    "RunLog",
    ()=>RunLog,
    "RunLogPatch",
    ()=>RunLogPatch,
    "isLogStreamHandler",
    ()=>isLogStreamHandler,
    "log_stream_exports",
    ()=>log_stream_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/_virtual/rolldown_runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/messages/ai.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$core$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/fast-json-patch/src/core.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/fast-json-patch/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/tracers/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$stream$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/stream.js [app-rsc] (ecmascript)");
;
;
;
;
;
;
//#region src/tracers/log_stream.ts
var log_stream_exports = {};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__export"])(log_stream_exports, {
    LogStreamCallbackHandler: ()=>LogStreamCallbackHandler,
    RunLog: ()=>RunLog,
    RunLogPatch: ()=>RunLogPatch,
    isLogStreamHandler: ()=>isLogStreamHandler
});
/**
* List of jsonpatch JSONPatchOperations, which describe how to create the run state
* from an empty dict. This is the minimal representation of the log, designed to
* be serialized as JSON and sent over the wire to reconstruct the log on the other
* side. Reconstruction of the state can be done with any jsonpatch-compliant library,
* see https://jsonpatch.com for more information.
*/ var RunLogPatch = class {
    ops;
    constructor(fields){
        this.ops = fields.ops ?? [];
    }
    concat(other) {
        const ops = this.ops.concat(other.ops);
        const states = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$core$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["applyPatch"])({}, ops);
        return new RunLog({
            ops,
            state: states[states.length - 1].newDocument
        });
    }
};
var RunLog = class RunLog extends RunLogPatch {
    state;
    constructor(fields){
        super(fields);
        this.state = fields.state;
    }
    concat(other) {
        const ops = this.ops.concat(other.ops);
        const states = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$core$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["applyPatch"])(this.state, other.ops);
        return new RunLog({
            ops,
            state: states[states.length - 1].newDocument
        });
    }
    static fromRunLogPatch(patch) {
        const states = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$core$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["applyPatch"])({}, patch.ops);
        return new RunLog({
            ops: patch.ops,
            state: states[states.length - 1].newDocument
        });
    }
};
const isLogStreamHandler = (handler)=>handler.name === "log_stream_tracer";
/**
* Extract standardized inputs from a run.
*
* Standardizes the inputs based on the type of the runnable used.
*
* @param run - Run object
* @param schemaFormat - The schema format to use.
*
* @returns Valid inputs are only dict. By conventions, inputs always represented
* invocation using named arguments.
* A null means that the input is not yet known!
*/ async function _getStandardizedInputs(run, schemaFormat) {
    if (schemaFormat === "original") throw new Error("Do not assign inputs with original schema drop the key for now. When inputs are added to streamLog they should be added with standardized schema for streaming events.");
    const { inputs } = run;
    if ([
        "retriever",
        "llm",
        "prompt"
    ].includes(run.run_type)) return inputs;
    if (Object.keys(inputs).length === 1 && inputs?.input === "") return void 0;
    return inputs.input;
}
async function _getStandardizedOutputs(run, schemaFormat) {
    const { outputs } = run;
    if (schemaFormat === "original") return outputs;
    if ([
        "retriever",
        "llm",
        "prompt"
    ].includes(run.run_type)) return outputs;
    if (outputs !== void 0 && Object.keys(outputs).length === 1 && outputs?.output !== void 0) return outputs.output;
    return outputs;
}
function isChatGenerationChunk(x) {
    return x !== void 0 && x.message !== void 0;
}
/**
* Class that extends the `BaseTracer` class from the
* `langchain.callbacks.tracers.base` module. It represents a callback
* handler that logs the execution of runs and emits `RunLog` instances to a
* `RunLogStream`.
*/ var LogStreamCallbackHandler = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseTracer"] {
    autoClose = true;
    includeNames;
    includeTypes;
    includeTags;
    excludeNames;
    excludeTypes;
    excludeTags;
    _schemaFormat = "original";
    rootId;
    keyMapByRunId = {};
    counterMapByRunName = {};
    transformStream;
    writer;
    receiveStream;
    name = "log_stream_tracer";
    lc_prefer_streaming = true;
    constructor(fields){
        super({
            _awaitHandler: true,
            ...fields
        });
        this.autoClose = fields?.autoClose ?? true;
        this.includeNames = fields?.includeNames;
        this.includeTypes = fields?.includeTypes;
        this.includeTags = fields?.includeTags;
        this.excludeNames = fields?.excludeNames;
        this.excludeTypes = fields?.excludeTypes;
        this.excludeTags = fields?.excludeTags;
        this._schemaFormat = fields?._schemaFormat ?? this._schemaFormat;
        this.transformStream = new TransformStream();
        this.writer = this.transformStream.writable.getWriter();
        this.receiveStream = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$stream$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["IterableReadableStream"].fromReadableStream(this.transformStream.readable);
    }
    [Symbol.asyncIterator]() {
        return this.receiveStream;
    }
    async persistRun(_run) {}
    _includeRun(run) {
        if (run.id === this.rootId) return false;
        const runTags = run.tags ?? [];
        let include = this.includeNames === void 0 && this.includeTags === void 0 && this.includeTypes === void 0;
        if (this.includeNames !== void 0) include = include || this.includeNames.includes(run.name);
        if (this.includeTypes !== void 0) include = include || this.includeTypes.includes(run.run_type);
        if (this.includeTags !== void 0) include = include || runTags.find((tag)=>this.includeTags?.includes(tag)) !== void 0;
        if (this.excludeNames !== void 0) include = include && !this.excludeNames.includes(run.name);
        if (this.excludeTypes !== void 0) include = include && !this.excludeTypes.includes(run.run_type);
        if (this.excludeTags !== void 0) include = include && runTags.every((tag)=>!this.excludeTags?.includes(tag));
        return include;
    }
    async *tapOutputIterable(runId, output) {
        for await (const chunk of output){
            if (runId !== this.rootId) {
                const key = this.keyMapByRunId[runId];
                if (key) await this.writer.write(new RunLogPatch({
                    ops: [
                        {
                            op: "add",
                            path: `/logs/${key}/streamed_output/-`,
                            value: chunk
                        }
                    ]
                }));
            }
            yield chunk;
        }
    }
    async onRunCreate(run) {
        if (this.rootId === void 0) {
            this.rootId = run.id;
            await this.writer.write(new RunLogPatch({
                ops: [
                    {
                        op: "replace",
                        path: "",
                        value: {
                            id: run.id,
                            name: run.name,
                            type: run.run_type,
                            streamed_output: [],
                            final_output: void 0,
                            logs: {}
                        }
                    }
                ]
            }));
        }
        if (!this._includeRun(run)) return;
        if (this.counterMapByRunName[run.name] === void 0) this.counterMapByRunName[run.name] = 0;
        this.counterMapByRunName[run.name] += 1;
        const count = this.counterMapByRunName[run.name];
        this.keyMapByRunId[run.id] = count === 1 ? run.name : `${run.name}:${count}`;
        const logEntry = {
            id: run.id,
            name: run.name,
            type: run.run_type,
            tags: run.tags ?? [],
            metadata: run.extra?.metadata ?? {},
            start_time: new Date(run.start_time).toISOString(),
            streamed_output: [],
            streamed_output_str: [],
            final_output: void 0,
            end_time: void 0
        };
        if (this._schemaFormat === "streaming_events") logEntry.inputs = await _getStandardizedInputs(run, this._schemaFormat);
        await this.writer.write(new RunLogPatch({
            ops: [
                {
                    op: "add",
                    path: `/logs/${this.keyMapByRunId[run.id]}`,
                    value: logEntry
                }
            ]
        }));
    }
    async onRunUpdate(run) {
        try {
            const runName = this.keyMapByRunId[run.id];
            if (runName === void 0) return;
            const ops = [];
            if (this._schemaFormat === "streaming_events") ops.push({
                op: "replace",
                path: `/logs/${runName}/inputs`,
                value: await _getStandardizedInputs(run, this._schemaFormat)
            });
            ops.push({
                op: "add",
                path: `/logs/${runName}/final_output`,
                value: await _getStandardizedOutputs(run, this._schemaFormat)
            });
            if (run.end_time !== void 0) ops.push({
                op: "add",
                path: `/logs/${runName}/end_time`,
                value: new Date(run.end_time).toISOString()
            });
            const patch = new RunLogPatch({
                ops
            });
            await this.writer.write(patch);
        } finally{
            if (run.id === this.rootId) {
                const patch = new RunLogPatch({
                    ops: [
                        {
                            op: "replace",
                            path: "/final_output",
                            value: await _getStandardizedOutputs(run, this._schemaFormat)
                        }
                    ]
                });
                await this.writer.write(patch);
                if (this.autoClose) await this.writer.close();
            }
        }
    }
    async onLLMNewToken(run, token, kwargs) {
        const runName = this.keyMapByRunId[run.id];
        if (runName === void 0) return;
        const isChatModel = run.inputs.messages !== void 0;
        let streamedOutputValue;
        if (isChatModel) if (isChatGenerationChunk(kwargs?.chunk)) streamedOutputValue = kwargs?.chunk;
        else streamedOutputValue = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AIMessageChunk"]({
            id: `run-${run.id}`,
            content: token
        });
        else streamedOutputValue = token;
        const patch = new RunLogPatch({
            ops: [
                {
                    op: "add",
                    path: `/logs/${runName}/streamed_output_str/-`,
                    value: token
                },
                {
                    op: "add",
                    path: `/logs/${runName}/streamed_output/-`,
                    value: streamedOutputValue
                }
            ]
        });
        await this.writer.write(patch);
    }
};
;
 //# sourceMappingURL=log_stream.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/tracers/event_stream.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EventStreamCallbackHandler",
    ()=>EventStreamCallbackHandler,
    "isStreamEventsHandler",
    ()=>isStreamEventsHandler
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/messages/ai.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/tracers/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$stream$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/stream.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$outputs$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/outputs.js [app-rsc] (ecmascript)");
;
;
;
;
//#region src/tracers/event_stream.ts
function assignName({ name, serialized }) {
    if (name !== void 0) return name;
    if (serialized?.name !== void 0) return serialized.name;
    else if (serialized?.id !== void 0 && Array.isArray(serialized?.id)) return serialized.id[serialized.id.length - 1];
    return "Unnamed";
}
const isStreamEventsHandler = (handler)=>handler.name === "event_stream_tracer";
/**
* Class that extends the `BaseTracer` class from the
* `langchain.callbacks.tracers.base` module. It represents a callback
* handler that logs the execution of runs and emits `RunLog` instances to a
* `RunLogStream`.
*/ var EventStreamCallbackHandler = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseTracer"] {
    autoClose = true;
    includeNames;
    includeTypes;
    includeTags;
    excludeNames;
    excludeTypes;
    excludeTags;
    runInfoMap = /* @__PURE__ */ new Map();
    tappedPromises = /* @__PURE__ */ new Map();
    transformStream;
    writer;
    receiveStream;
    name = "event_stream_tracer";
    lc_prefer_streaming = true;
    constructor(fields){
        super({
            _awaitHandler: true,
            ...fields
        });
        this.autoClose = fields?.autoClose ?? true;
        this.includeNames = fields?.includeNames;
        this.includeTypes = fields?.includeTypes;
        this.includeTags = fields?.includeTags;
        this.excludeNames = fields?.excludeNames;
        this.excludeTypes = fields?.excludeTypes;
        this.excludeTags = fields?.excludeTags;
        this.transformStream = new TransformStream();
        this.writer = this.transformStream.writable.getWriter();
        this.receiveStream = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$stream$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["IterableReadableStream"].fromReadableStream(this.transformStream.readable);
    }
    [Symbol.asyncIterator]() {
        return this.receiveStream;
    }
    async persistRun(_run) {}
    _includeRun(run) {
        const runTags = run.tags ?? [];
        let include = this.includeNames === void 0 && this.includeTags === void 0 && this.includeTypes === void 0;
        if (this.includeNames !== void 0) include = include || this.includeNames.includes(run.name);
        if (this.includeTypes !== void 0) include = include || this.includeTypes.includes(run.runType);
        if (this.includeTags !== void 0) include = include || runTags.find((tag)=>this.includeTags?.includes(tag)) !== void 0;
        if (this.excludeNames !== void 0) include = include && !this.excludeNames.includes(run.name);
        if (this.excludeTypes !== void 0) include = include && !this.excludeTypes.includes(run.runType);
        if (this.excludeTags !== void 0) include = include && runTags.every((tag)=>!this.excludeTags?.includes(tag));
        return include;
    }
    async *tapOutputIterable(runId, outputStream) {
        const firstChunk = await outputStream.next();
        if (firstChunk.done) return;
        const runInfo = this.runInfoMap.get(runId);
        if (runInfo === void 0) {
            yield firstChunk.value;
            return;
        }
        function _formatOutputChunk(eventType, data) {
            if (eventType === "llm" && typeof data === "string") return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$outputs$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["GenerationChunk"]({
                text: data
            });
            return data;
        }
        let tappedPromise = this.tappedPromises.get(runId);
        if (tappedPromise === void 0) {
            let tappedPromiseResolver;
            tappedPromise = new Promise((resolve)=>{
                tappedPromiseResolver = resolve;
            });
            this.tappedPromises.set(runId, tappedPromise);
            try {
                const event = {
                    event: `on_${runInfo.runType}_stream`,
                    run_id: runId,
                    name: runInfo.name,
                    tags: runInfo.tags,
                    metadata: runInfo.metadata,
                    data: {}
                };
                await this.send({
                    ...event,
                    data: {
                        chunk: _formatOutputChunk(runInfo.runType, firstChunk.value)
                    }
                }, runInfo);
                yield firstChunk.value;
                for await (const chunk of outputStream){
                    if (runInfo.runType !== "tool" && runInfo.runType !== "retriever") await this.send({
                        ...event,
                        data: {
                            chunk: _formatOutputChunk(runInfo.runType, chunk)
                        }
                    }, runInfo);
                    yield chunk;
                }
            } finally{
                tappedPromiseResolver?.();
            }
        } else {
            yield firstChunk.value;
            for await (const chunk of outputStream)yield chunk;
        }
    }
    async send(payload, run) {
        if (this._includeRun(run)) await this.writer.write(payload);
    }
    async sendEndEvent(payload, run) {
        const tappedPromise = this.tappedPromises.get(payload.run_id);
        if (tappedPromise !== void 0) tappedPromise.then(()=>{
            this.send(payload, run);
        });
        else await this.send(payload, run);
    }
    async onLLMStart(run) {
        const runName = assignName(run);
        const runType = run.inputs.messages !== void 0 ? "chat_model" : "llm";
        const runInfo = {
            tags: run.tags ?? [],
            metadata: run.extra?.metadata ?? {},
            name: runName,
            runType,
            inputs: run.inputs
        };
        this.runInfoMap.set(run.id, runInfo);
        const eventName = `on_${runType}_start`;
        await this.send({
            event: eventName,
            data: {
                input: run.inputs
            },
            name: runName,
            tags: run.tags ?? [],
            run_id: run.id,
            metadata: run.extra?.metadata ?? {}
        }, runInfo);
    }
    async onLLMNewToken(run, token, kwargs) {
        const runInfo = this.runInfoMap.get(run.id);
        let chunk;
        let eventName;
        if (runInfo === void 0) throw new Error(`onLLMNewToken: Run ID ${run.id} not found in run map.`);
        if (this.runInfoMap.size === 1) return;
        if (runInfo.runType === "chat_model") {
            eventName = "on_chat_model_stream";
            if (kwargs?.chunk === void 0) chunk = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AIMessageChunk"]({
                content: token,
                id: `run-${run.id}`
            });
            else chunk = kwargs.chunk.message;
        } else if (runInfo.runType === "llm") {
            eventName = "on_llm_stream";
            if (kwargs?.chunk === void 0) chunk = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$outputs$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["GenerationChunk"]({
                text: token
            });
            else chunk = kwargs.chunk;
        } else throw new Error(`Unexpected run type ${runInfo.runType}`);
        await this.send({
            event: eventName,
            data: {
                chunk
            },
            run_id: run.id,
            name: runInfo.name,
            tags: runInfo.tags,
            metadata: runInfo.metadata
        }, runInfo);
    }
    async onLLMEnd(run) {
        const runInfo = this.runInfoMap.get(run.id);
        this.runInfoMap.delete(run.id);
        let eventName;
        if (runInfo === void 0) throw new Error(`onLLMEnd: Run ID ${run.id} not found in run map.`);
        const generations = run.outputs?.generations;
        let output;
        if (runInfo.runType === "chat_model") {
            for (const generation of generations ?? []){
                if (output !== void 0) break;
                output = generation[0]?.message;
            }
            eventName = "on_chat_model_end";
        } else if (runInfo.runType === "llm") {
            output = {
                generations: generations?.map((generation)=>{
                    return generation.map((chunk)=>{
                        return {
                            text: chunk.text,
                            generationInfo: chunk.generationInfo
                        };
                    });
                }),
                llmOutput: run.outputs?.llmOutput ?? {}
            };
            eventName = "on_llm_end";
        } else throw new Error(`onLLMEnd: Unexpected run type: ${runInfo.runType}`);
        await this.sendEndEvent({
            event: eventName,
            data: {
                output,
                input: runInfo.inputs
            },
            run_id: run.id,
            name: runInfo.name,
            tags: runInfo.tags,
            metadata: runInfo.metadata
        }, runInfo);
    }
    async onChainStart(run) {
        const runName = assignName(run);
        const runType = run.run_type ?? "chain";
        const runInfo = {
            tags: run.tags ?? [],
            metadata: run.extra?.metadata ?? {},
            name: runName,
            runType: run.run_type
        };
        let eventData = {};
        if (run.inputs.input === "" && Object.keys(run.inputs).length === 1) {
            eventData = {};
            runInfo.inputs = {};
        } else if (run.inputs.input !== void 0) {
            eventData.input = run.inputs.input;
            runInfo.inputs = run.inputs.input;
        } else {
            eventData.input = run.inputs;
            runInfo.inputs = run.inputs;
        }
        this.runInfoMap.set(run.id, runInfo);
        await this.send({
            event: `on_${runType}_start`,
            data: eventData,
            name: runName,
            tags: run.tags ?? [],
            run_id: run.id,
            metadata: run.extra?.metadata ?? {}
        }, runInfo);
    }
    async onChainEnd(run) {
        const runInfo = this.runInfoMap.get(run.id);
        this.runInfoMap.delete(run.id);
        if (runInfo === void 0) throw new Error(`onChainEnd: Run ID ${run.id} not found in run map.`);
        const eventName = `on_${run.run_type}_end`;
        const inputs = run.inputs ?? runInfo.inputs ?? {};
        const outputs = run.outputs?.output ?? run.outputs;
        const data = {
            output: outputs,
            input: inputs
        };
        if (inputs.input && Object.keys(inputs).length === 1) {
            data.input = inputs.input;
            runInfo.inputs = inputs.input;
        }
        await this.sendEndEvent({
            event: eventName,
            data,
            run_id: run.id,
            name: runInfo.name,
            tags: runInfo.tags,
            metadata: runInfo.metadata ?? {}
        }, runInfo);
    }
    async onToolStart(run) {
        const runName = assignName(run);
        const runInfo = {
            tags: run.tags ?? [],
            metadata: run.extra?.metadata ?? {},
            name: runName,
            runType: "tool",
            inputs: run.inputs ?? {}
        };
        this.runInfoMap.set(run.id, runInfo);
        await this.send({
            event: "on_tool_start",
            data: {
                input: run.inputs ?? {}
            },
            name: runName,
            run_id: run.id,
            tags: run.tags ?? [],
            metadata: run.extra?.metadata ?? {}
        }, runInfo);
    }
    async onToolEnd(run) {
        const runInfo = this.runInfoMap.get(run.id);
        this.runInfoMap.delete(run.id);
        if (runInfo === void 0) throw new Error(`onToolEnd: Run ID ${run.id} not found in run map.`);
        if (runInfo.inputs === void 0) throw new Error(`onToolEnd: Run ID ${run.id} is a tool call, and is expected to have traced inputs.`);
        const output = run.outputs?.output === void 0 ? run.outputs : run.outputs.output;
        await this.sendEndEvent({
            event: "on_tool_end",
            data: {
                output,
                input: runInfo.inputs
            },
            run_id: run.id,
            name: runInfo.name,
            tags: runInfo.tags,
            metadata: runInfo.metadata
        }, runInfo);
    }
    async onRetrieverStart(run) {
        const runName = assignName(run);
        const runType = "retriever";
        const runInfo = {
            tags: run.tags ?? [],
            metadata: run.extra?.metadata ?? {},
            name: runName,
            runType,
            inputs: {
                query: run.inputs.query
            }
        };
        this.runInfoMap.set(run.id, runInfo);
        await this.send({
            event: "on_retriever_start",
            data: {
                input: {
                    query: run.inputs.query
                }
            },
            name: runName,
            tags: run.tags ?? [],
            run_id: run.id,
            metadata: run.extra?.metadata ?? {}
        }, runInfo);
    }
    async onRetrieverEnd(run) {
        const runInfo = this.runInfoMap.get(run.id);
        this.runInfoMap.delete(run.id);
        if (runInfo === void 0) throw new Error(`onRetrieverEnd: Run ID ${run.id} not found in run map.`);
        await this.sendEndEvent({
            event: "on_retriever_end",
            data: {
                output: run.outputs?.documents ?? run.outputs,
                input: runInfo.inputs
            },
            run_id: run.id,
            name: runInfo.name,
            tags: runInfo.tags,
            metadata: runInfo.metadata
        }, runInfo);
    }
    async handleCustomEvent(eventName, data, runId) {
        const runInfo = this.runInfoMap.get(runId);
        if (runInfo === void 0) throw new Error(`handleCustomEvent: Run ID ${runId} not found in run map.`);
        await this.send({
            event: "on_custom_event",
            run_id: runId,
            name: eventName,
            tags: runInfo.tags,
            metadata: runInfo.metadata,
            data
        }, runInfo);
    }
    async finish() {
        const pendingPromises = [
            ...this.tappedPromises.values()
        ];
        Promise.all(pendingPromises).finally(()=>{
            this.writer.close();
        });
    }
};
;
 //# sourceMappingURL=event_stream.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/tracers/root_listener.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RootListenersTracer",
    ()=>RootListenersTracer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/tracers/base.js [app-rsc] (ecmascript)");
;
//#region src/tracers/root_listener.ts
var RootListenersTracer = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$tracers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseTracer"] {
    name = "RootListenersTracer";
    /** The Run's ID. Type UUID */ rootId;
    config;
    argOnStart;
    argOnEnd;
    argOnError;
    constructor({ config, onStart, onEnd, onError }){
        super({
            _awaitHandler: true
        });
        this.config = config;
        this.argOnStart = onStart;
        this.argOnEnd = onEnd;
        this.argOnError = onError;
    }
    /**
	* This is a legacy method only called once for an entire run tree
	* therefore not useful here
	* @param {Run} _ Not used
	*/ persistRun(_) {
        return Promise.resolve();
    }
    async onRunCreate(run) {
        if (this.rootId) return;
        this.rootId = run.id;
        if (this.argOnStart) await this.argOnStart(run, this.config);
    }
    async onRunUpdate(run) {
        if (run.id !== this.rootId) return;
        if (!run.error) {
            if (this.argOnEnd) await this.argOnEnd(run, this.config);
        } else if (this.argOnError) await this.argOnError(run, this.config);
    }
};
;
 //# sourceMappingURL=root_listener.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/singletons/tracer.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getDefaultLangChainClientSingleton",
    ()=>getDefaultLangChainClientSingleton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$env$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/env.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$3$2e$72_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$2_$40$op_7ow2d6aq23ha3vqd6kfsdw35ce$2f$node_modules$2f$langsmith$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/langsmith@0.3.72_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57.2_@op_7ow2d6aq23ha3vqd6kfsdw35ce/node_modules/langsmith/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$3$2e$72_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$2_$40$op_7ow2d6aq23ha3vqd6kfsdw35ce$2f$node_modules$2f$langsmith$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/langsmith@0.3.72_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57.2_@op_7ow2d6aq23ha3vqd6kfsdw35ce/node_modules/langsmith/dist/index.js [app-rsc] (ecmascript)");
;
;
//#region src/singletons/tracer.ts
let client;
const getDefaultLangChainClientSingleton = ()=>{
    if (client === void 0) {
        const clientParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$env$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getEnvironmentVariable"])("LANGCHAIN_CALLBACKS_BACKGROUND") === "false" ? {
            blockOnRootRunFinalization: true
        } : {};
        client = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$3$2e$72_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$2_$40$op_7ow2d6aq23ha3vqd6kfsdw35ce$2f$node_modules$2f$langsmith$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Client"](clientParams);
    }
    return client;
};
;
 //# sourceMappingURL=tracer.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/singletons/async_local_storage/globals.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

//#region src/singletons/async_local_storage/globals.ts
__turbopack_context__.s([
    "_CONTEXT_VARIABLES_KEY",
    ()=>_CONTEXT_VARIABLES_KEY,
    "getGlobalAsyncLocalStorageInstance",
    ()=>getGlobalAsyncLocalStorageInstance,
    "setGlobalAsyncLocalStorageInstance",
    ()=>setGlobalAsyncLocalStorageInstance
]);
const TRACING_ALS_KEY = Symbol.for("ls:tracing_async_local_storage");
const _CONTEXT_VARIABLES_KEY = Symbol.for("lc:context_variables");
const setGlobalAsyncLocalStorageInstance = (instance)=>{
    globalThis[TRACING_ALS_KEY] = instance;
};
const getGlobalAsyncLocalStorageInstance = ()=>{
    return globalThis[TRACING_ALS_KEY];
};
;
 //# sourceMappingURL=globals.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/singletons/callbacks.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "awaitAllCallbacks",
    ()=>awaitAllCallbacks,
    "consumeCallback",
    ()=>consumeCallback
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$tracer$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/singletons/tracer.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$globals$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/singletons/async_local_storage/globals.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$p$2d$queue$40$9$2e$0$2e$1$2f$node_modules$2f$p$2d$queue$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/p-queue@9.0.1/node_modules/p-queue/dist/index.js [app-rsc] (ecmascript) <locals>");
;
;
;
//#region src/singletons/callbacks.ts
let queue;
/**
* Creates a queue using the p-queue library. The queue is configured to
* auto-start and has a concurrency of 1, meaning it will process tasks
* one at a time.
*/ function createQueue() {
    const PQueue = "default" in __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$p$2d$queue$40$9$2e$0$2e$1$2f$node_modules$2f$p$2d$queue$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"] ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$p$2d$queue$40$9$2e$0$2e$1$2f$node_modules$2f$p$2d$queue$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].default : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$p$2d$queue$40$9$2e$0$2e$1$2f$node_modules$2f$p$2d$queue$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"];
    return new PQueue({
        autoStart: true,
        concurrency: 1
    });
}
function getQueue() {
    if (typeof queue === "undefined") queue = createQueue();
    return queue;
}
/**
* Consume a promise, either adding it to the queue or waiting for it to resolve
* @param promiseFn Promise to consume
* @param wait Whether to wait for the promise to resolve or resolve immediately
*/ async function consumeCallback(promiseFn, wait) {
    if (wait === true) {
        const asyncLocalStorageInstance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$globals$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getGlobalAsyncLocalStorageInstance"])();
        if (asyncLocalStorageInstance !== void 0) await asyncLocalStorageInstance.run(void 0, async ()=>promiseFn());
        else await promiseFn();
    } else {
        queue = getQueue();
        queue.add(async ()=>{
            const asyncLocalStorageInstance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$globals$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getGlobalAsyncLocalStorageInstance"])();
            if (asyncLocalStorageInstance !== void 0) await asyncLocalStorageInstance.run(void 0, async ()=>promiseFn());
            else await promiseFn();
        });
    }
}
/**
* Waits for all promises in the queue to resolve. If the queue is
* undefined, it immediately resolves a promise.
*/ async function awaitAllCallbacks() {
    const defaultClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$tracer$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDefaultLangChainClientSingleton"])();
    await Promise.allSettled([
        typeof queue !== "undefined" ? queue.onIdle() : Promise.resolve(),
        defaultClient.awaitPendingTraceBatches()
    ]);
}
;
 //# sourceMappingURL=callbacks.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/singletons/async_local_storage/context.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "_getConfigureHooks",
    ()=>_getConfigureHooks,
    "getContextVariable",
    ()=>getContextVariable,
    "registerConfigureHook",
    ()=>registerConfigureHook,
    "setContextVariable",
    ()=>setContextVariable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$globals$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/singletons/async_local_storage/globals.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$3$2e$72_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$2_$40$op_7ow2d6aq23ha3vqd6kfsdw35ce$2f$node_modules$2f$langsmith$2f$run_trees$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/langsmith@0.3.72_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57.2_@op_7ow2d6aq23ha3vqd6kfsdw35ce/node_modules/langsmith/run_trees.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$3$2e$72_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$2_$40$op_7ow2d6aq23ha3vqd6kfsdw35ce$2f$node_modules$2f$langsmith$2f$dist$2f$run_trees$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/langsmith@0.3.72_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57.2_@op_7ow2d6aq23ha3vqd6kfsdw35ce/node_modules/langsmith/dist/run_trees.js [app-rsc] (ecmascript)");
;
;
//#region src/singletons/async_local_storage/context.ts
/**
* Set a context variable. Context variables are scoped to any
* child runnables called by the current runnable, or globally if set outside
* of any runnable.
*
* @remarks
* This function is only supported in environments that support AsyncLocalStorage,
* including Node.js, Deno, and Cloudflare Workers.
*
* @example
* ```ts
* import { RunnableLambda } from "@langchain/core/runnables";
* import {
*   getContextVariable,
*   setContextVariable
* } from "@langchain/core/context";
*
* const nested = RunnableLambda.from(() => {
*   // "bar" because it was set by a parent
*   console.log(getContextVariable("foo"));
*
*   // Override to "baz", but only for child runnables
*   setContextVariable("foo", "baz");
*
*   // Now "baz", but only for child runnables
*   return getContextVariable("foo");
* });
*
* const runnable = RunnableLambda.from(async () => {
*   // Set a context variable named "foo"
*   setContextVariable("foo", "bar");
*
*   const res = await nested.invoke({});
*
*   // Still "bar" since child changes do not affect parents
*   console.log(getContextVariable("foo"));
*
*   return res;
* });
*
* // undefined, because context variable has not been set yet
* console.log(getContextVariable("foo"));
*
* // Final return value is "baz"
* const result = await runnable.invoke({});
* ```
*
* @param name The name of the context variable.
* @param value The value to set.
*/ function setContextVariable(name, value) {
    const asyncLocalStorageInstance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$globals$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getGlobalAsyncLocalStorageInstance"])();
    if (asyncLocalStorageInstance === void 0) throw new Error(`Internal error: Global shared async local storage instance has not been initialized.`);
    const runTree = asyncLocalStorageInstance.getStore();
    const contextVars = {
        ...runTree?.[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$globals$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["_CONTEXT_VARIABLES_KEY"]]
    };
    contextVars[name] = value;
    let newValue = {};
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$3$2e$72_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$2_$40$op_7ow2d6aq23ha3vqd6kfsdw35ce$2f$node_modules$2f$langsmith$2f$dist$2f$run_trees$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isRunTree"])(runTree)) newValue = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$3$2e$72_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$2_$40$op_7ow2d6aq23ha3vqd6kfsdw35ce$2f$node_modules$2f$langsmith$2f$dist$2f$run_trees$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["RunTree"](runTree);
    newValue[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$globals$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["_CONTEXT_VARIABLES_KEY"]] = contextVars;
    asyncLocalStorageInstance.enterWith(newValue);
}
/**
* Get the value of a previously set context variable. Context variables
* are scoped to any child runnables called by the current runnable,
* or globally if set outside of any runnable.
*
* @remarks
* This function is only supported in environments that support AsyncLocalStorage,
* including Node.js, Deno, and Cloudflare Workers.
*
* @example
* ```ts
* import { RunnableLambda } from "@langchain/core/runnables";
* import {
*   getContextVariable,
*   setContextVariable
* } from "@langchain/core/context";
*
* const nested = RunnableLambda.from(() => {
*   // "bar" because it was set by a parent
*   console.log(getContextVariable("foo"));
*
*   // Override to "baz", but only for child runnables
*   setContextVariable("foo", "baz");
*
*   // Now "baz", but only for child runnables
*   return getContextVariable("foo");
* });
*
* const runnable = RunnableLambda.from(async () => {
*   // Set a context variable named "foo"
*   setContextVariable("foo", "bar");
*
*   const res = await nested.invoke({});
*
*   // Still "bar" since child changes do not affect parents
*   console.log(getContextVariable("foo"));
*
*   return res;
* });
*
* // undefined, because context variable has not been set yet
* console.log(getContextVariable("foo"));
*
* // Final return value is "baz"
* const result = await runnable.invoke({});
* ```
*
* @param name The name of the context variable.
*/ function getContextVariable(name) {
    const asyncLocalStorageInstance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$globals$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getGlobalAsyncLocalStorageInstance"])();
    if (asyncLocalStorageInstance === void 0) return void 0;
    const runTree = asyncLocalStorageInstance.getStore();
    return runTree?.[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$globals$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["_CONTEXT_VARIABLES_KEY"]]?.[name];
}
const LC_CONFIGURE_HOOKS_KEY = Symbol("lc:configure_hooks");
const _getConfigureHooks = ()=>getContextVariable(LC_CONFIGURE_HOOKS_KEY) || [];
/**
* Register a callback configure hook to automatically add callback handlers to all runs.
*
* There are two ways to use this:
*
* 1. Using a context variable:
*    - Set `contextVar` to specify the variable name
*    - Use `setContextVariable()` to store your handler instance
*
* 2. Using an environment variable:
*    - Set both `envVar` and `handlerClass`
*    - The handler will be instantiated when the env var is set to "true".
*
* @example
* ```typescript
* // Method 1: Using context variable
* import {
*   registerConfigureHook,
*   setContextVariable
* } from "@langchain/core/context";
*
* const tracer = new MyCallbackHandler();
* registerConfigureHook({
*   contextVar: "my_tracer",
* });
* setContextVariable("my_tracer", tracer);
*
* // ...run code here
*
* // Method 2: Using environment variable
* registerConfigureHook({
*   handlerClass: MyCallbackHandler,
*   envVar: "MY_TRACER_ENABLED",
* });
* process.env.MY_TRACER_ENABLED = "true";
*
* // ...run code here
* ```
*
* @param config Configuration object for the hook
* @param config.contextVar Name of the context variable containing the handler instance
* @param config.inheritable Whether child runs should inherit this handler
* @param config.handlerClass Optional callback handler class (required if using envVar)
* @param config.envVar Optional environment variable name to control handler activation
*/ const registerConfigureHook = (config)=>{
    if (config.envVar && !config.handlerClass) throw new Error("If envVar is set, handlerClass must also be set to a non-None value.");
    setContextVariable(LC_CONFIGURE_HOOKS_KEY, [
        ..._getConfigureHooks(),
        config
    ]);
};
;
 //# sourceMappingURL=context.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/singletons/async_local_storage/index.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AsyncLocalStorageProviderSingleton",
    ()=>AsyncLocalStorageProviderSingleton,
    "MockAsyncLocalStorage",
    ()=>MockAsyncLocalStorage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$globals$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/singletons/async_local_storage/globals.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$manager$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/callbacks/manager.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$3$2e$72_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$2_$40$op_7ow2d6aq23ha3vqd6kfsdw35ce$2f$node_modules$2f$langsmith$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/langsmith@0.3.72_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57.2_@op_7ow2d6aq23ha3vqd6kfsdw35ce/node_modules/langsmith/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$3$2e$72_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$2_$40$op_7ow2d6aq23ha3vqd6kfsdw35ce$2f$node_modules$2f$langsmith$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/langsmith@0.3.72_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57.2_@op_7ow2d6aq23ha3vqd6kfsdw35ce/node_modules/langsmith/dist/index.js [app-rsc] (ecmascript)");
;
;
;
//#region src/singletons/async_local_storage/index.ts
var MockAsyncLocalStorage = class {
    getStore() {
        return void 0;
    }
    run(_store, callback) {
        return callback();
    }
    enterWith(_store) {
        return void 0;
    }
};
const mockAsyncLocalStorage = new MockAsyncLocalStorage();
const LC_CHILD_KEY = Symbol.for("lc:child_config");
var AsyncLocalStorageProvider = class {
    getInstance() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$globals$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getGlobalAsyncLocalStorageInstance"])() ?? mockAsyncLocalStorage;
    }
    getRunnableConfig() {
        const storage = this.getInstance();
        return storage.getStore()?.extra?.[LC_CHILD_KEY];
    }
    runWithConfig(config, callback, avoidCreatingRootRunTree) {
        const callbackManager = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$manager$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CallbackManager"]._configureSync(config?.callbacks, void 0, config?.tags, void 0, config?.metadata);
        const storage = this.getInstance();
        const previousValue = storage.getStore();
        const parentRunId = callbackManager?.getParentRunId();
        const langChainTracer = callbackManager?.handlers?.find((handler)=>handler?.name === "langchain_tracer");
        let runTree;
        if (langChainTracer && parentRunId) runTree = langChainTracer.getRunTreeWithTracingConfig(parentRunId);
        else if (!avoidCreatingRootRunTree) runTree = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$langsmith$40$0$2e$3$2e$72_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$2_$40$op_7ow2d6aq23ha3vqd6kfsdw35ce$2f$node_modules$2f$langsmith$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["RunTree"]({
            name: "<runnable_lambda>",
            tracingEnabled: false
        });
        if (runTree) runTree.extra = {
            ...runTree.extra,
            [LC_CHILD_KEY]: config
        };
        if (previousValue !== void 0 && previousValue[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$globals$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["_CONTEXT_VARIABLES_KEY"]] !== void 0) {
            if (runTree === void 0) runTree = {};
            runTree[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$globals$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["_CONTEXT_VARIABLES_KEY"]] = previousValue[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$globals$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["_CONTEXT_VARIABLES_KEY"]];
        }
        return storage.run(runTree, callback);
    }
    initializeGlobalInstance(instance) {
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$globals$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getGlobalAsyncLocalStorageInstance"])() === void 0) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$globals$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setGlobalAsyncLocalStorageInstance"])(instance);
    }
};
const AsyncLocalStorageProviderSingleton = new AsyncLocalStorageProvider();
;
 //# sourceMappingURL=index.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/singletons/index.js [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "singletons_exports",
    ()=>singletons_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/_virtual/rolldown_runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$globals$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/singletons/async_local_storage/globals.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/singletons/async_local_storage/index.js [app-rsc] (ecmascript)");
;
;
;
//#region src/singletons/index.ts
var singletons_exports = {};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__export"])(singletons_exports, {
    AsyncLocalStorageProviderSingleton: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AsyncLocalStorageProviderSingleton"],
    MockAsyncLocalStorage: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["MockAsyncLocalStorage"],
    _CONTEXT_VARIABLES_KEY: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$singletons$2f$async_local_storage$2f$globals$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["_CONTEXT_VARIABLES_KEY"]
});
;
 //# sourceMappingURL=index.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/outputs.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ChatGenerationChunk",
    ()=>ChatGenerationChunk,
    "GenerationChunk",
    ()=>GenerationChunk,
    "RUN_KEY",
    ()=>RUN_KEY,
    "outputs_exports",
    ()=>outputs_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/_virtual/rolldown_runtime.js [app-rsc] (ecmascript)");
;
//#region src/outputs.ts
var outputs_exports = {};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__export"])(outputs_exports, {
    ChatGenerationChunk: ()=>ChatGenerationChunk,
    GenerationChunk: ()=>GenerationChunk,
    RUN_KEY: ()=>RUN_KEY
});
const RUN_KEY = "__run";
/**
* Chunk of a single generation. Used for streaming.
*/ var GenerationChunk = class GenerationChunk {
    text;
    generationInfo;
    constructor(fields){
        this.text = fields.text;
        this.generationInfo = fields.generationInfo;
    }
    concat(chunk) {
        return new GenerationChunk({
            text: this.text + chunk.text,
            generationInfo: {
                ...this.generationInfo,
                ...chunk.generationInfo
            }
        });
    }
};
var ChatGenerationChunk = class ChatGenerationChunk extends GenerationChunk {
    message;
    constructor(fields){
        super(fields);
        this.message = fields.message;
    }
    concat(chunk) {
        return new ChatGenerationChunk({
            text: this.text + chunk.text,
            generationInfo: {
                ...this.generationInfo,
                ...chunk.generationInfo
            },
            message: this.message.concat(chunk.message)
        });
    }
};
;
 //# sourceMappingURL=outputs.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/prompt_values.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BasePromptValue",
    ()=>BasePromptValue,
    "ChatPromptValue",
    ()=>ChatPromptValue,
    "ImagePromptValue",
    ()=>ImagePromptValue,
    "StringPromptValue",
    ()=>StringPromptValue,
    "prompt_values_exports",
    ()=>prompt_values_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/_virtual/rolldown_runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$serializable$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/load/serializable.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$human$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/messages/human.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/messages/utils.js [app-rsc] (ecmascript)");
;
;
;
;
//#region src/prompt_values.ts
var prompt_values_exports = {};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__export"])(prompt_values_exports, {
    BasePromptValue: ()=>BasePromptValue,
    ChatPromptValue: ()=>ChatPromptValue,
    ImagePromptValue: ()=>ImagePromptValue,
    StringPromptValue: ()=>StringPromptValue
});
/**
* Base PromptValue class. All prompt values should extend this class.
*/ var BasePromptValue = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$load$2f$serializable$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Serializable"] {
};
/**
* Represents a prompt value as a string. It extends the BasePromptValue
* class and overrides the toString and toChatMessages methods.
*/ var StringPromptValue = class extends BasePromptValue {
    static lc_name() {
        return "StringPromptValue";
    }
    lc_namespace = [
        "langchain_core",
        "prompt_values"
    ];
    lc_serializable = true;
    value;
    constructor(value){
        super({
            value
        });
        this.value = value;
    }
    toString() {
        return this.value;
    }
    toChatMessages() {
        return [
            new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$human$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["HumanMessage"](this.value)
        ];
    }
};
/**
* Class that represents a chat prompt value. It extends the
* BasePromptValue and includes an array of BaseMessage instances.
*/ var ChatPromptValue = class extends BasePromptValue {
    lc_namespace = [
        "langchain_core",
        "prompt_values"
    ];
    lc_serializable = true;
    static lc_name() {
        return "ChatPromptValue";
    }
    messages;
    constructor(fields){
        if (Array.isArray(fields)) fields = {
            messages: fields
        };
        super(fields);
        this.messages = fields.messages;
    }
    toString() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getBufferString"])(this.messages);
    }
    toChatMessages() {
        return this.messages;
    }
};
/**
* Class that represents an image prompt value. It extends the
* BasePromptValue and includes an ImageURL instance.
*/ var ImagePromptValue = class extends BasePromptValue {
    lc_namespace = [
        "langchain_core",
        "prompt_values"
    ];
    lc_serializable = true;
    static lc_name() {
        return "ImagePromptValue";
    }
    imageUrl;
    /** @ignore */ value;
    constructor(fields){
        if (!("imageUrl" in fields)) fields = {
            imageUrl: fields
        };
        super(fields);
        this.imageUrl = fields.imageUrl;
    }
    toString() {
        return this.imageUrl.url;
    }
    toChatMessages() {
        return [
            new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$human$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["HumanMessage"]({
                content: [
                    {
                        type: "image_url",
                        image_url: {
                            detail: this.imageUrl.detail,
                            url: this.imageUrl.url
                        }
                    }
                ]
            })
        ];
    }
};
;
 //# sourceMappingURL=prompt_values.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/caches/index.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseCache",
    ()=>BaseCache,
    "InMemoryCache",
    ()=>InMemoryCache,
    "caches_exports",
    ()=>caches_exports,
    "defaultHashKeyEncoder",
    ()=>defaultHashKeyEncoder,
    "deserializeStoredGeneration",
    ()=>deserializeStoredGeneration,
    "serializeGeneration",
    ()=>serializeGeneration
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/_virtual/rolldown_runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/messages/utils.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$js$2d$sha256$2f$hash$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/js-sha256/hash.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$hash$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/hash.js [app-rsc] (ecmascript) <locals>");
;
;
;
;
//#region src/caches/index.ts
var caches_exports = {};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__export"])(caches_exports, {
    BaseCache: ()=>BaseCache,
    InMemoryCache: ()=>InMemoryCache,
    defaultHashKeyEncoder: ()=>defaultHashKeyEncoder,
    deserializeStoredGeneration: ()=>deserializeStoredGeneration,
    serializeGeneration: ()=>serializeGeneration
});
const defaultHashKeyEncoder = (...strings)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$js$2d$sha256$2f$hash$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sha256"])(strings.join("_"));
function deserializeStoredGeneration(storedGeneration) {
    if (storedGeneration.message !== void 0) return {
        text: storedGeneration.text,
        message: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["mapStoredMessageToChatMessage"])(storedGeneration.message)
    };
    else return {
        text: storedGeneration.text
    };
}
function serializeGeneration(generation) {
    const serializedValue = {
        text: generation.text
    };
    if (generation.message !== void 0) serializedValue.message = generation.message.toDict();
    return serializedValue;
}
/**
* Base class for all caches. All caches should extend this class.
*/ var BaseCache = class {
    keyEncoder = defaultHashKeyEncoder;
    /**
	* Sets a custom key encoder function for the cache.
	* This function should take a prompt and an LLM key and return a string
	* that will be used as the cache key.
	* @param keyEncoderFn The custom key encoder function.
	*/ makeDefaultKeyEncoder(keyEncoderFn) {
        this.keyEncoder = keyEncoderFn;
    }
};
const GLOBAL_MAP = /* @__PURE__ */ new Map();
/**
* A cache for storing LLM generations that stores data in memory.
*/ var InMemoryCache = class InMemoryCache extends BaseCache {
    cache;
    constructor(map){
        super();
        this.cache = map ?? /* @__PURE__ */ new Map();
    }
    /**
	* Retrieves data from the cache using a prompt and an LLM key. If the
	* data is not found, it returns null.
	* @param prompt The prompt used to find the data.
	* @param llmKey The LLM key used to find the data.
	* @returns The data corresponding to the prompt and LLM key, or null if not found.
	*/ lookup(prompt, llmKey) {
        return Promise.resolve(this.cache.get(this.keyEncoder(prompt, llmKey)) ?? null);
    }
    /**
	* Updates the cache with new data using a prompt and an LLM key.
	* @param prompt The prompt used to store the data.
	* @param llmKey The LLM key used to store the data.
	* @param value The data to be stored.
	*/ async update(prompt, llmKey, value) {
        this.cache.set(this.keyEncoder(prompt, llmKey), value);
    }
    /**
	* Returns a global instance of InMemoryCache using a predefined global
	* map as the initial cache.
	* @returns A global instance of InMemoryCache.
	*/ static global() {
        return new InMemoryCache(GLOBAL_MAP);
    }
};
;
 //# sourceMappingURL=index.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/language_models/base.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseLangChain",
    ()=>BaseLangChain,
    "BaseLanguageModel",
    ()=>BaseLanguageModel,
    "base_exports",
    ()=>base_exports,
    "calculateMaxTokens",
    ()=>calculateMaxTokens,
    "getEmbeddingContextSize",
    ()=>getEmbeddingContextSize,
    "getModelContextSize",
    ()=>getModelContextSize,
    "getModelNameForTiktoken",
    ()=>getModelNameForTiktoken,
    "isOpenAITool",
    ()=>isOpenAITool
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/_virtual/rolldown_runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/messages/utils.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$async_caller$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/async_caller.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/runnables/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompt_values$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/prompt_values.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$caches$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/caches/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$tiktoken$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/tiktoken.js [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
//#region src/language_models/base.ts
var base_exports = {};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__export"])(base_exports, {
    BaseLangChain: ()=>BaseLangChain,
    BaseLanguageModel: ()=>BaseLanguageModel,
    calculateMaxTokens: ()=>calculateMaxTokens,
    getEmbeddingContextSize: ()=>getEmbeddingContextSize,
    getModelContextSize: ()=>getModelContextSize,
    getModelNameForTiktoken: ()=>getModelNameForTiktoken,
    isOpenAITool: ()=>isOpenAITool
});
const getModelNameForTiktoken = (modelName)=>{
    if (modelName.startsWith("gpt-5")) return "gpt-5";
    if (modelName.startsWith("gpt-3.5-turbo-16k")) return "gpt-3.5-turbo-16k";
    if (modelName.startsWith("gpt-3.5-turbo-")) return "gpt-3.5-turbo";
    if (modelName.startsWith("gpt-4-32k")) return "gpt-4-32k";
    if (modelName.startsWith("gpt-4-")) return "gpt-4";
    if (modelName.startsWith("gpt-4o")) return "gpt-4o";
    return modelName;
};
const getEmbeddingContextSize = (modelName)=>{
    switch(modelName){
        case "text-embedding-ada-002":
            return 8191;
        default:
            return 2046;
    }
};
/**
* Get the context window size (max input tokens) for a given model.
*
* Context window sizes are sourced from official model documentation:
* - OpenAI: https://platform.openai.com/docs/models
* - Anthropic: https://docs.anthropic.com/claude/docs/models-overview
* - Google: https://ai.google.dev/gemini/docs/models/gemini
*
* @param modelName - The name of the model
* @returns The context window size in tokens
*/ const getModelContextSize = (modelName)=>{
    const normalizedName = getModelNameForTiktoken(modelName);
    switch(normalizedName){
        case "gpt-5":
        case "gpt-5-turbo":
        case "gpt-5-turbo-preview":
            return 4e5;
        case "gpt-4o":
        case "gpt-4o-mini":
        case "gpt-4o-2024-05-13":
        case "gpt-4o-2024-08-06":
            return 128e3;
        case "gpt-4-turbo":
        case "gpt-4-turbo-preview":
        case "gpt-4-turbo-2024-04-09":
        case "gpt-4-0125-preview":
        case "gpt-4-1106-preview":
            return 128e3;
        case "gpt-4-32k":
        case "gpt-4-32k-0314":
        case "gpt-4-32k-0613":
            return 32768;
        case "gpt-4":
        case "gpt-4-0314":
        case "gpt-4-0613":
            return 8192;
        case "gpt-3.5-turbo-16k":
        case "gpt-3.5-turbo-16k-0613":
            return 16384;
        case "gpt-3.5-turbo":
        case "gpt-3.5-turbo-0301":
        case "gpt-3.5-turbo-0613":
        case "gpt-3.5-turbo-1106":
        case "gpt-3.5-turbo-0125":
            return 4096;
        case "text-davinci-003":
        case "text-davinci-002":
            return 4097;
        case "text-davinci-001":
            return 2049;
        case "text-curie-001":
        case "text-babbage-001":
        case "text-ada-001":
            return 2048;
        case "code-davinci-002":
        case "code-davinci-001":
            return 8e3;
        case "code-cushman-001":
            return 2048;
        case "claude-3-5-sonnet-20241022":
        case "claude-3-5-sonnet-20240620":
        case "claude-3-opus-20240229":
        case "claude-3-sonnet-20240229":
        case "claude-3-haiku-20240307":
        case "claude-2.1":
            return 2e5;
        case "claude-2.0":
        case "claude-instant-1.2":
            return 1e5;
        case "gemini-1.5-pro":
        case "gemini-1.5-pro-latest":
        case "gemini-1.5-flash":
        case "gemini-1.5-flash-latest":
            return 1e6;
        case "gemini-pro":
        case "gemini-pro-vision":
            return 32768;
        default:
            return 4097;
    }
};
/**
* Whether or not the input matches the OpenAI tool definition.
* @param {unknown} tool The input to check.
* @returns {boolean} Whether the input is an OpenAI tool definition.
*/ function isOpenAITool(tool) {
    if (typeof tool !== "object" || !tool) return false;
    if ("type" in tool && tool.type === "function" && "function" in tool && typeof tool.function === "object" && tool.function && "name" in tool.function && "parameters" in tool.function) return true;
    return false;
}
const calculateMaxTokens = async ({ prompt, modelName })=>{
    let numTokens;
    try {
        numTokens = (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$tiktoken$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["encodingForModel"])(getModelNameForTiktoken(modelName))).encode(prompt).length;
    } catch  {
        console.warn("Failed to calculate number of tokens, falling back to approximate count");
        numTokens = Math.ceil(prompt.length / 4);
    }
    const maxTokens = getModelContextSize(modelName);
    return maxTokens - numTokens;
};
const getVerbosity = ()=>false;
/**
* Base class for language models, chains, tools.
*/ var BaseLangChain = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Runnable"] {
    /**
	* Whether to print out response text.
	*/ verbose;
    callbacks;
    tags;
    metadata;
    get lc_attributes() {
        return {
            callbacks: void 0,
            verbose: void 0
        };
    }
    constructor(params){
        super(params);
        this.verbose = params.verbose ?? getVerbosity();
        this.callbacks = params.callbacks;
        this.tags = params.tags ?? [];
        this.metadata = params.metadata ?? {};
    }
};
/**
* Base class for language models.
*/ var BaseLanguageModel = class extends BaseLangChain {
    /**
	* Keys that the language model accepts as call options.
	*/ get callKeys() {
        return [
            "stop",
            "timeout",
            "signal",
            "tags",
            "metadata",
            "callbacks"
        ];
    }
    /**
	* The async caller should be used by subclasses to make any async calls,
	* which will thus benefit from the concurrency and retry logic.
	*/ caller;
    cache;
    constructor({ callbacks, callbackManager, ...params }){
        const { cache, ...rest } = params;
        super({
            callbacks: callbacks ?? callbackManager,
            ...rest
        });
        if (typeof cache === "object") this.cache = cache;
        else if (cache) this.cache = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$caches$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["InMemoryCache"].global();
        else this.cache = void 0;
        this.caller = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$async_caller$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AsyncCaller"](params ?? {});
    }
    _encoding;
    /**
	* Get the number of tokens in the content.
	* @param content The content to get the number of tokens for.
	* @returns The number of tokens in the content.
	*/ async getNumTokens(content) {
        let textContent;
        if (typeof content === "string") textContent = content;
        else /**
		* Content is an array of ContentBlock
		*
		* ToDo(@christian-bromann): This is a temporary fix to get the number of tokens for the content.
		* We need to find a better way to do this.
		* @see https://github.com/langchain-ai/langchainjs/pull/8341#pullrequestreview-2933713116
		*/ textContent = content.map((item)=>{
            if (typeof item === "string") return item;
            if (item.type === "text" && "text" in item) return item.text;
            return "";
        }).join("");
        let numTokens = Math.ceil(textContent.length / 4);
        if (!this._encoding) try {
            this._encoding = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$tiktoken$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["encodingForModel"])("modelName" in this ? getModelNameForTiktoken(this.modelName) : "gpt2");
        } catch (error) {
            console.warn("Failed to calculate number of tokens, falling back to approximate count", error);
        }
        if (this._encoding) try {
            numTokens = this._encoding.encode(textContent).length;
        } catch (error) {
            console.warn("Failed to calculate number of tokens, falling back to approximate count", error);
        }
        return numTokens;
    }
    static _convertInputToPromptValue(input) {
        if (typeof input === "string") return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompt_values$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["StringPromptValue"](input);
        else if (Array.isArray(input)) return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompt_values$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ChatPromptValue"](input.map(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["coerceMessageLikeToMessage"]));
        else return input;
    }
    /**
	* Get the identifying parameters of the LLM.
	*/ _identifyingParams() {
        return {};
    }
    /**
	* Create a unique cache key for a specific call to a specific language model.
	* @param callOptions Call options for the model
	* @returns A unique cache key.
	*/ _getSerializedCacheKeyParametersForCall({ config, ...callOptions }) {
        const params = {
            ...this._identifyingParams(),
            ...callOptions,
            _type: this._llmType(),
            _model: this._modelType()
        };
        const filteredEntries = Object.entries(params).filter(([_, value])=>value !== void 0);
        const serializedEntries = filteredEntries.map(([key, value])=>`${key}:${JSON.stringify(value)}`).sort().join(",");
        return serializedEntries;
    }
    /**
	* @deprecated
	* Return a json-like object representing this LLM.
	*/ serialize() {
        return {
            ...this._identifyingParams(),
            _type: this._llmType(),
            _model: this._modelType()
        };
    }
    /**
	* @deprecated
	* Load an LLM from a json-like object describing it.
	*/ static async deserialize(_data) {
        throw new Error("Use .toJSON() instead");
    }
    /**
	* Return profiling information for the model.
	*
	* @returns {ModelProfile} An object describing the model's capabilities and constraints
	*/ get profile() {
        return {};
    }
};
;
 //# sourceMappingURL=base.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/language_models/utils.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

//#region src/language_models/utils.ts
__turbopack_context__.s([
    "castStandardMessageContent",
    ()=>castStandardMessageContent,
    "iife",
    ()=>iife
]);
const iife = (fn)=>fn();
function castStandardMessageContent(message) {
    const Cls = message.constructor;
    return new Cls({
        ...message,
        content: message.contentBlocks,
        response_metadata: {
            ...message.response_metadata,
            output_version: "v1"
        }
    });
}
;
 //# sourceMappingURL=utils.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/language_models/chat_models.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseChatModel",
    ()=>BaseChatModel,
    "SimpleChatModel",
    ()=>SimpleChatModel,
    "chat_models_exports",
    ()=>chat_models_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/_virtual/rolldown_runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$content$2f$data$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/messages/content/data.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/messages/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/messages/utils.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/messages/ai.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$env$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/env.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/callbacks/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$manager$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/callbacks/manager.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$stream$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/stream.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$outputs$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/outputs.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/types/zod.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json_schema$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/json_schema.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/runnables/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/messages/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/language_models/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$passthrough$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/runnables/passthrough.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/language_models/utils.js [app-rsc] (ecmascript)");
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
//#region src/language_models/chat_models.ts
var chat_models_exports = {};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__export"])(chat_models_exports, {
    BaseChatModel: ()=>BaseChatModel,
    SimpleChatModel: ()=>SimpleChatModel
});
function _formatForTracing(messages) {
    const messagesToTrace = [];
    for (const message of messages){
        let messageToTrace = message;
        if (Array.isArray(message.content)) for(let idx = 0; idx < message.content.length; idx++){
            const block = message.content[idx];
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$content$2f$data$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isURLContentBlock"])(block) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$content$2f$data$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isBase64ContentBlock"])(block)) {
                if (messageToTrace === message) messageToTrace = new message.constructor({
                    ...messageToTrace,
                    content: [
                        ...message.content.slice(0, idx),
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$content$2f$data$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["convertToOpenAIImageBlock"])(block),
                        ...message.content.slice(idx + 1)
                    ]
                });
            }
        }
        messagesToTrace.push(messageToTrace);
    }
    return messagesToTrace;
}
/**
* Base class for chat models. It extends the BaseLanguageModel class and
* provides methods for generating chat based on input messages.
*/ var BaseChatModel = class BaseChatModel extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseLanguageModel"] {
    lc_namespace = [
        "langchain",
        "chat_models",
        this._llmType()
    ];
    disableStreaming = false;
    outputVersion;
    get callKeys() {
        return [
            ...super.callKeys,
            "outputVersion"
        ];
    }
    constructor(fields){
        super(fields);
        this.outputVersion = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["iife"])(()=>{
            const outputVersion = fields.outputVersion ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$env$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getEnvironmentVariable"])("LC_OUTPUT_VERSION");
            if (outputVersion && [
                "v0",
                "v1"
            ].includes(outputVersion)) return outputVersion;
            return "v0";
        });
    }
    _separateRunnableConfigFromCallOptionsCompat(options) {
        const [runnableConfig, callOptions] = super._separateRunnableConfigFromCallOptions(options);
        callOptions.signal = runnableConfig.signal;
        return [
            runnableConfig,
            callOptions
        ];
    }
    /**
	* Invokes the chat model with a single input.
	* @param input The input for the language model.
	* @param options The call options.
	* @returns A Promise that resolves to a BaseMessageChunk.
	*/ async invoke(input, options) {
        const promptValue = BaseChatModel._convertInputToPromptValue(input);
        const result = await this.generatePrompt([
            promptValue
        ], options, options?.callbacks);
        const chatGeneration = result.generations[0][0];
        return chatGeneration.message;
    }
    async *_streamResponseChunks(_messages, _options, _runManager) {
        throw new Error("Not implemented.");
    }
    async *_streamIterator(input, options) {
        if (this._streamResponseChunks === BaseChatModel.prototype._streamResponseChunks || this.disableStreaming) yield this.invoke(input, options);
        else {
            const prompt = BaseChatModel._convertInputToPromptValue(input);
            const messages = prompt.toChatMessages();
            const [runnableConfig, callOptions] = this._separateRunnableConfigFromCallOptionsCompat(options);
            const inheritableMetadata = {
                ...runnableConfig.metadata,
                ...this.getLsParams(callOptions)
            };
            const callbackManager_ = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$manager$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CallbackManager"].configure(runnableConfig.callbacks, this.callbacks, runnableConfig.tags, this.tags, inheritableMetadata, this.metadata, {
                verbose: this.verbose
            });
            const extra = {
                options: callOptions,
                invocation_params: this?.invocationParams(callOptions),
                batch_size: 1
            };
            const outputVersion = callOptions.outputVersion ?? this.outputVersion;
            const runManagers = await callbackManager_?.handleChatModelStart(this.toJSON(), [
                _formatForTracing(messages)
            ], runnableConfig.runId, void 0, extra, void 0, void 0, runnableConfig.runName);
            let generationChunk;
            let llmOutput;
            try {
                for await (const chunk of this._streamResponseChunks(messages, callOptions, runManagers?.[0])){
                    if (chunk.message.id == null) {
                        const runId = runManagers?.at(0)?.runId;
                        if (runId != null) chunk.message._updateId(`run-${runId}`);
                    }
                    chunk.message.response_metadata = {
                        ...chunk.generationInfo,
                        ...chunk.message.response_metadata
                    };
                    if (outputVersion === "v1") yield (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["castStandardMessageContent"])(chunk.message);
                    else yield chunk.message;
                    if (!generationChunk) generationChunk = chunk;
                    else generationChunk = generationChunk.concat(chunk);
                    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isAIMessageChunk"])(chunk.message) && chunk.message.usage_metadata !== void 0) llmOutput = {
                        tokenUsage: {
                            promptTokens: chunk.message.usage_metadata.input_tokens,
                            completionTokens: chunk.message.usage_metadata.output_tokens,
                            totalTokens: chunk.message.usage_metadata.total_tokens
                        }
                    };
                }
            } catch (err) {
                await Promise.all((runManagers ?? []).map((runManager)=>runManager?.handleLLMError(err)));
                throw err;
            }
            await Promise.all((runManagers ?? []).map((runManager)=>runManager?.handleLLMEnd({
                    generations: [
                        [
                            generationChunk
                        ]
                    ],
                    llmOutput
                })));
        }
    }
    getLsParams(options) {
        const providerName = this.getName().startsWith("Chat") ? this.getName().replace("Chat", "") : this.getName();
        return {
            ls_model_type: "chat",
            ls_stop: options.stop,
            ls_provider: providerName
        };
    }
    /** @ignore */ async _generateUncached(messages, parsedOptions, handledOptions, startedRunManagers) {
        const baseMessages = messages.map((messageList)=>messageList.map(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["coerceMessageLikeToMessage"]));
        let runManagers;
        if (startedRunManagers !== void 0 && startedRunManagers.length === baseMessages.length) runManagers = startedRunManagers;
        else {
            const inheritableMetadata = {
                ...handledOptions.metadata,
                ...this.getLsParams(parsedOptions)
            };
            const callbackManager_ = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$manager$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CallbackManager"].configure(handledOptions.callbacks, this.callbacks, handledOptions.tags, this.tags, inheritableMetadata, this.metadata, {
                verbose: this.verbose
            });
            const extra = {
                options: parsedOptions,
                invocation_params: this?.invocationParams(parsedOptions),
                batch_size: 1
            };
            runManagers = await callbackManager_?.handleChatModelStart(this.toJSON(), baseMessages.map(_formatForTracing), handledOptions.runId, void 0, extra, void 0, void 0, handledOptions.runName);
        }
        const outputVersion = parsedOptions.outputVersion ?? this.outputVersion;
        const generations = [];
        const llmOutputs = [];
        const hasStreamingHandler = !!runManagers?.[0].handlers.find(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["callbackHandlerPrefersStreaming"]);
        if (hasStreamingHandler && !this.disableStreaming && baseMessages.length === 1 && this._streamResponseChunks !== BaseChatModel.prototype._streamResponseChunks) try {
            const stream = await this._streamResponseChunks(baseMessages[0], parsedOptions, runManagers?.[0]);
            let aggregated;
            let llmOutput;
            for await (const chunk of stream){
                if (chunk.message.id == null) {
                    const runId = runManagers?.at(0)?.runId;
                    if (runId != null) chunk.message._updateId(`run-${runId}`);
                }
                if (aggregated === void 0) aggregated = chunk;
                else aggregated = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$stream$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["concat"])(aggregated, chunk);
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isAIMessageChunk"])(chunk.message) && chunk.message.usage_metadata !== void 0) llmOutput = {
                    tokenUsage: {
                        promptTokens: chunk.message.usage_metadata.input_tokens,
                        completionTokens: chunk.message.usage_metadata.output_tokens,
                        totalTokens: chunk.message.usage_metadata.total_tokens
                    }
                };
            }
            if (aggregated === void 0) throw new Error("Received empty response from chat model call.");
            generations.push([
                aggregated
            ]);
            await runManagers?.[0].handleLLMEnd({
                generations,
                llmOutput
            });
        } catch (e) {
            await runManagers?.[0].handleLLMError(e);
            throw e;
        }
        else {
            const results = await Promise.allSettled(baseMessages.map(async (messageList, i)=>{
                const generateResults = await this._generate(messageList, {
                    ...parsedOptions,
                    promptIndex: i
                }, runManagers?.[i]);
                if (outputVersion === "v1") for (const generation of generateResults.generations)generation.message = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["castStandardMessageContent"])(generation.message);
                return generateResults;
            }));
            await Promise.all(results.map(async (pResult, i)=>{
                if (pResult.status === "fulfilled") {
                    const result = pResult.value;
                    for (const generation of result.generations){
                        if (generation.message.id == null) {
                            const runId = runManagers?.at(0)?.runId;
                            if (runId != null) generation.message._updateId(`run-${runId}`);
                        }
                        generation.message.response_metadata = {
                            ...generation.generationInfo,
                            ...generation.message.response_metadata
                        };
                    }
                    if (result.generations.length === 1) result.generations[0].message.response_metadata = {
                        ...result.llmOutput,
                        ...result.generations[0].message.response_metadata
                    };
                    generations[i] = result.generations;
                    llmOutputs[i] = result.llmOutput;
                    return runManagers?.[i]?.handleLLMEnd({
                        generations: [
                            result.generations
                        ],
                        llmOutput: result.llmOutput
                    });
                } else {
                    await runManagers?.[i]?.handleLLMError(pResult.reason);
                    return Promise.reject(pResult.reason);
                }
            }));
        }
        const output = {
            generations,
            llmOutput: llmOutputs.length ? this._combineLLMOutput?.(...llmOutputs) : void 0
        };
        Object.defineProperty(output, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$outputs$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["RUN_KEY"], {
            value: runManagers ? {
                runIds: runManagers?.map((manager)=>manager.runId)
            } : void 0,
            configurable: true
        });
        return output;
    }
    async _generateCached({ messages, cache, llmStringKey, parsedOptions, handledOptions }) {
        const baseMessages = messages.map((messageList)=>messageList.map(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["coerceMessageLikeToMessage"]));
        const inheritableMetadata = {
            ...handledOptions.metadata,
            ...this.getLsParams(parsedOptions)
        };
        const callbackManager_ = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$manager$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CallbackManager"].configure(handledOptions.callbacks, this.callbacks, handledOptions.tags, this.tags, inheritableMetadata, this.metadata, {
            verbose: this.verbose
        });
        const extra = {
            options: parsedOptions,
            invocation_params: this?.invocationParams(parsedOptions),
            batch_size: 1
        };
        const runManagers = await callbackManager_?.handleChatModelStart(this.toJSON(), baseMessages.map(_formatForTracing), handledOptions.runId, void 0, extra, void 0, void 0, handledOptions.runName);
        const missingPromptIndices = [];
        const results = await Promise.allSettled(baseMessages.map(async (baseMessage, index)=>{
            const prompt = BaseChatModel._convertInputToPromptValue(baseMessage).toString();
            const result = await cache.lookup(prompt, llmStringKey);
            if (result == null) missingPromptIndices.push(index);
            return result;
        }));
        const cachedResults = results.map((result, index)=>({
                result,
                runManager: runManagers?.[index]
            })).filter(({ result })=>result.status === "fulfilled" && result.value != null || result.status === "rejected");
        const outputVersion = parsedOptions.outputVersion ?? this.outputVersion;
        const generations = [];
        await Promise.all(cachedResults.map(async ({ result: promiseResult, runManager }, i)=>{
            if (promiseResult.status === "fulfilled") {
                const result = promiseResult.value;
                generations[i] = result.map((result$1)=>{
                    if ("message" in result$1 && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isBaseMessage"])(result$1.message) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isAIMessage"])(result$1.message)) {
                        result$1.message.usage_metadata = {
                            input_tokens: 0,
                            output_tokens: 0,
                            total_tokens: 0
                        };
                        if (outputVersion === "v1") result$1.message = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["castStandardMessageContent"])(result$1.message);
                    }
                    result$1.generationInfo = {
                        ...result$1.generationInfo,
                        tokenUsage: {}
                    };
                    return result$1;
                });
                if (result.length) await runManager?.handleLLMNewToken(result[0].text);
                return runManager?.handleLLMEnd({
                    generations: [
                        result
                    ]
                }, void 0, void 0, void 0, {
                    cached: true
                });
            } else {
                await runManager?.handleLLMError(promiseResult.reason, void 0, void 0, void 0, {
                    cached: true
                });
                return Promise.reject(promiseResult.reason);
            }
        }));
        const output = {
            generations,
            missingPromptIndices,
            startedRunManagers: runManagers
        };
        Object.defineProperty(output, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$outputs$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["RUN_KEY"], {
            value: runManagers ? {
                runIds: runManagers?.map((manager)=>manager.runId)
            } : void 0,
            configurable: true
        });
        return output;
    }
    /**
	* Generates chat based on the input messages.
	* @param messages An array of arrays of BaseMessage instances.
	* @param options The call options or an array of stop sequences.
	* @param callbacks The callbacks for the language model.
	* @returns A Promise that resolves to an LLMResult.
	*/ async generate(messages, options, callbacks) {
        let parsedOptions;
        if (Array.isArray(options)) parsedOptions = {
            stop: options
        };
        else parsedOptions = options;
        const baseMessages = messages.map((messageList)=>messageList.map(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["coerceMessageLikeToMessage"]));
        const [runnableConfig, callOptions] = this._separateRunnableConfigFromCallOptionsCompat(parsedOptions);
        runnableConfig.callbacks = runnableConfig.callbacks ?? callbacks;
        if (!this.cache) return this._generateUncached(baseMessages, callOptions, runnableConfig);
        const { cache } = this;
        const llmStringKey = this._getSerializedCacheKeyParametersForCall(callOptions);
        const { generations, missingPromptIndices, startedRunManagers } = await this._generateCached({
            messages: baseMessages,
            cache,
            llmStringKey,
            parsedOptions: callOptions,
            handledOptions: runnableConfig
        });
        let llmOutput = {};
        if (missingPromptIndices.length > 0) {
            const results = await this._generateUncached(missingPromptIndices.map((i)=>baseMessages[i]), callOptions, runnableConfig, startedRunManagers !== void 0 ? missingPromptIndices.map((i)=>startedRunManagers?.[i]) : void 0);
            await Promise.all(results.generations.map(async (generation, index)=>{
                const promptIndex = missingPromptIndices[index];
                generations[promptIndex] = generation;
                const prompt = BaseChatModel._convertInputToPromptValue(baseMessages[promptIndex]).toString();
                return cache.update(prompt, llmStringKey, generation);
            }));
            llmOutput = results.llmOutput ?? {};
        }
        return {
            generations,
            llmOutput
        };
    }
    /**
	* Get the parameters used to invoke the model
	*/ invocationParams(_options) {
        return {};
    }
    _modelType() {
        return "base_chat_model";
    }
    /**
	* Generates a prompt based on the input prompt values.
	* @param promptValues An array of BasePromptValue instances.
	* @param options The call options or an array of stop sequences.
	* @param callbacks The callbacks for the language model.
	* @returns A Promise that resolves to an LLMResult.
	*/ async generatePrompt(promptValues, options, callbacks) {
        const promptMessages = promptValues.map((promptValue)=>promptValue.toChatMessages());
        return this.generate(promptMessages, options, callbacks);
    }
    withStructuredOutput(outputSchema, config) {
        if (typeof this.bindTools !== "function") throw new Error(`Chat model must implement ".bindTools()" to use withStructuredOutput.`);
        if (config?.strict) throw new Error(`"strict" mode is not supported for this model by default.`);
        const schema = outputSchema;
        const name = config?.name;
        const description = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getSchemaDescription"])(schema) ?? "A function available to call.";
        const method = config?.method;
        const includeRaw = config?.includeRaw;
        if (method === "jsonMode") throw new Error(`Base withStructuredOutput implementation only supports "functionCalling" as a method.`);
        let functionName = name ?? "extract";
        let tools;
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isInteropZodSchema"])(schema)) tools = [
            {
                type: "function",
                function: {
                    name: functionName,
                    description,
                    parameters: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json_schema$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toJsonSchema"])(schema)
                }
            }
        ];
        else {
            if ("name" in schema) functionName = schema.name;
            tools = [
                {
                    type: "function",
                    function: {
                        name: functionName,
                        description,
                        parameters: schema
                    }
                }
            ];
        }
        const llm = this.bindTools(tools);
        const outputParser = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["RunnableLambda"].from((input)=>{
            if (!__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AIMessageChunk"].isInstance(input)) throw new Error("Input is not an AIMessageChunk.");
            if (!input.tool_calls || input.tool_calls.length === 0) throw new Error("No tool calls found in the response.");
            const toolCall = input.tool_calls.find((tc)=>tc.name === functionName);
            if (!toolCall) throw new Error(`No tool call found with name ${functionName}.`);
            return toolCall.args;
        });
        if (!includeRaw) return llm.pipe(outputParser).withConfig({
            runName: "StructuredOutput"
        });
        const parserAssign = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$passthrough$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["RunnablePassthrough"].assign({
            parsed: (input, config$1)=>outputParser.invoke(input.raw, config$1)
        });
        const parserNone = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$passthrough$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["RunnablePassthrough"].assign({
            parsed: ()=>null
        });
        const parsedWithFallback = parserAssign.withFallbacks({
            fallbacks: [
                parserNone
            ]
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["RunnableSequence"].from([
            {
                raw: llm
            },
            parsedWithFallback
        ]).withConfig({
            runName: "StructuredOutputRunnable"
        });
    }
};
/**
* An abstract class that extends BaseChatModel and provides a simple
* implementation of _generate.
*/ var SimpleChatModel = class extends BaseChatModel {
    async _generate(messages, options, runManager) {
        const text = await this._call(messages, options, runManager);
        const message = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AIMessage"](text);
        if (typeof message.content !== "string") throw new Error("Cannot generate with a simple chat model when output is not a string.");
        return {
            generations: [
                {
                    text: message.content,
                    message
                }
            ]
        };
    }
};
;
 //# sourceMappingURL=chat_models.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/language_models/llms.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseLLM",
    ()=>BaseLLM,
    "LLM",
    ()=>LLM,
    "llms_exports",
    ()=>llms_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/_virtual/rolldown_runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/callbacks/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$manager$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/callbacks/manager.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$stream$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/stream.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$outputs$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/outputs.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/language_models/base.js [app-rsc] (ecmascript)");
;
;
;
;
;
;
//#region src/language_models/llms.ts
var llms_exports = {};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__export"])(llms_exports, {
    BaseLLM: ()=>BaseLLM,
    LLM: ()=>LLM
});
/**
* LLM Wrapper. Takes in a prompt (or prompts) and returns a string.
*/ var BaseLLM = class BaseLLM extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$language_models$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseLanguageModel"] {
    lc_namespace = [
        "langchain",
        "llms",
        this._llmType()
    ];
    /**
	* This method takes an input and options, and returns a string. It
	* converts the input to a prompt value and generates a result based on
	* the prompt.
	* @param input Input for the LLM.
	* @param options Options for the LLM call.
	* @returns A string result based on the prompt.
	*/ async invoke(input, options) {
        const promptValue = BaseLLM._convertInputToPromptValue(input);
        const result = await this.generatePrompt([
            promptValue
        ], options, options?.callbacks);
        return result.generations[0][0].text;
    }
    async *_streamResponseChunks(_input, _options, _runManager) {
        throw new Error("Not implemented.");
    }
    _separateRunnableConfigFromCallOptionsCompat(options) {
        const [runnableConfig, callOptions] = super._separateRunnableConfigFromCallOptions(options);
        callOptions.signal = runnableConfig.signal;
        return [
            runnableConfig,
            callOptions
        ];
    }
    async *_streamIterator(input, options) {
        if (this._streamResponseChunks === BaseLLM.prototype._streamResponseChunks) yield this.invoke(input, options);
        else {
            const prompt = BaseLLM._convertInputToPromptValue(input);
            const [runnableConfig, callOptions] = this._separateRunnableConfigFromCallOptionsCompat(options);
            const callbackManager_ = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$manager$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CallbackManager"].configure(runnableConfig.callbacks, this.callbacks, runnableConfig.tags, this.tags, runnableConfig.metadata, this.metadata, {
                verbose: this.verbose
            });
            const extra = {
                options: callOptions,
                invocation_params: this?.invocationParams(callOptions),
                batch_size: 1
            };
            const runManagers = await callbackManager_?.handleLLMStart(this.toJSON(), [
                prompt.toString()
            ], runnableConfig.runId, void 0, extra, void 0, void 0, runnableConfig.runName);
            let generation = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$outputs$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["GenerationChunk"]({
                text: ""
            });
            try {
                for await (const chunk of this._streamResponseChunks(prompt.toString(), callOptions, runManagers?.[0])){
                    if (!generation) generation = chunk;
                    else generation = generation.concat(chunk);
                    if (typeof chunk.text === "string") yield chunk.text;
                }
            } catch (err) {
                await Promise.all((runManagers ?? []).map((runManager)=>runManager?.handleLLMError(err)));
                throw err;
            }
            await Promise.all((runManagers ?? []).map((runManager)=>runManager?.handleLLMEnd({
                    generations: [
                        [
                            generation
                        ]
                    ]
                })));
        }
    }
    /**
	* This method takes prompt values, options, and callbacks, and generates
	* a result based on the prompts.
	* @param promptValues Prompt values for the LLM.
	* @param options Options for the LLM call.
	* @param callbacks Callbacks for the LLM call.
	* @returns An LLMResult based on the prompts.
	*/ async generatePrompt(promptValues, options, callbacks) {
        const prompts = promptValues.map((promptValue)=>promptValue.toString());
        return this.generate(prompts, options, callbacks);
    }
    /**
	* Get the parameters used to invoke the model
	*/ invocationParams(_options) {
        return {};
    }
    _flattenLLMResult(llmResult) {
        const llmResults = [];
        for(let i = 0; i < llmResult.generations.length; i += 1){
            const genList = llmResult.generations[i];
            if (i === 0) llmResults.push({
                generations: [
                    genList
                ],
                llmOutput: llmResult.llmOutput
            });
            else {
                const llmOutput = llmResult.llmOutput ? {
                    ...llmResult.llmOutput,
                    tokenUsage: {}
                } : void 0;
                llmResults.push({
                    generations: [
                        genList
                    ],
                    llmOutput
                });
            }
        }
        return llmResults;
    }
    /** @ignore */ async _generateUncached(prompts, parsedOptions, handledOptions, startedRunManagers) {
        let runManagers;
        if (startedRunManagers !== void 0 && startedRunManagers.length === prompts.length) runManagers = startedRunManagers;
        else {
            const callbackManager_ = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$manager$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CallbackManager"].configure(handledOptions.callbacks, this.callbacks, handledOptions.tags, this.tags, handledOptions.metadata, this.metadata, {
                verbose: this.verbose
            });
            const extra = {
                options: parsedOptions,
                invocation_params: this?.invocationParams(parsedOptions),
                batch_size: prompts.length
            };
            runManagers = await callbackManager_?.handleLLMStart(this.toJSON(), prompts, handledOptions.runId, void 0, extra, void 0, void 0, handledOptions?.runName);
        }
        const hasStreamingHandler = !!runManagers?.[0].handlers.find(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["callbackHandlerPrefersStreaming"]);
        let output;
        if (hasStreamingHandler && prompts.length === 1 && this._streamResponseChunks !== BaseLLM.prototype._streamResponseChunks) try {
            const stream = await this._streamResponseChunks(prompts[0], parsedOptions, runManagers?.[0]);
            let aggregated;
            for await (const chunk of stream)if (aggregated === void 0) aggregated = chunk;
            else aggregated = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$stream$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["concat"])(aggregated, chunk);
            if (aggregated === void 0) throw new Error("Received empty response from chat model call.");
            output = {
                generations: [
                    [
                        aggregated
                    ]
                ],
                llmOutput: {}
            };
            await runManagers?.[0].handleLLMEnd(output);
        } catch (e) {
            await runManagers?.[0].handleLLMError(e);
            throw e;
        }
        else {
            try {
                output = await this._generate(prompts, parsedOptions, runManagers?.[0]);
            } catch (err) {
                await Promise.all((runManagers ?? []).map((runManager)=>runManager?.handleLLMError(err)));
                throw err;
            }
            const flattenedOutputs = this._flattenLLMResult(output);
            await Promise.all((runManagers ?? []).map((runManager, i)=>runManager?.handleLLMEnd(flattenedOutputs[i])));
        }
        const runIds = runManagers?.map((manager)=>manager.runId) || void 0;
        Object.defineProperty(output, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$outputs$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["RUN_KEY"], {
            value: runIds ? {
                runIds
            } : void 0,
            configurable: true
        });
        return output;
    }
    async _generateCached({ prompts, cache, llmStringKey, parsedOptions, handledOptions, runId }) {
        const callbackManager_ = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$callbacks$2f$manager$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CallbackManager"].configure(handledOptions.callbacks, this.callbacks, handledOptions.tags, this.tags, handledOptions.metadata, this.metadata, {
            verbose: this.verbose
        });
        const extra = {
            options: parsedOptions,
            invocation_params: this?.invocationParams(parsedOptions),
            batch_size: prompts.length
        };
        const runManagers = await callbackManager_?.handleLLMStart(this.toJSON(), prompts, runId, void 0, extra, void 0, void 0, handledOptions?.runName);
        const missingPromptIndices = [];
        const results = await Promise.allSettled(prompts.map(async (prompt, index)=>{
            const result = await cache.lookup(prompt, llmStringKey);
            if (result == null) missingPromptIndices.push(index);
            return result;
        }));
        const cachedResults = results.map((result, index)=>({
                result,
                runManager: runManagers?.[index]
            })).filter(({ result })=>result.status === "fulfilled" && result.value != null || result.status === "rejected");
        const generations = [];
        await Promise.all(cachedResults.map(async ({ result: promiseResult, runManager }, i)=>{
            if (promiseResult.status === "fulfilled") {
                const result = promiseResult.value;
                generations[i] = result.map((result$1)=>{
                    result$1.generationInfo = {
                        ...result$1.generationInfo,
                        tokenUsage: {}
                    };
                    return result$1;
                });
                if (result.length) await runManager?.handleLLMNewToken(result[0].text);
                return runManager?.handleLLMEnd({
                    generations: [
                        result
                    ]
                }, void 0, void 0, void 0, {
                    cached: true
                });
            } else {
                await runManager?.handleLLMError(promiseResult.reason, void 0, void 0, void 0, {
                    cached: true
                });
                return Promise.reject(promiseResult.reason);
            }
        }));
        const output = {
            generations,
            missingPromptIndices,
            startedRunManagers: runManagers
        };
        Object.defineProperty(output, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$outputs$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["RUN_KEY"], {
            value: runManagers ? {
                runIds: runManagers?.map((manager)=>manager.runId)
            } : void 0,
            configurable: true
        });
        return output;
    }
    /**
	* Run the LLM on the given prompts and input, handling caching.
	*/ async generate(prompts, options, callbacks) {
        if (!Array.isArray(prompts)) throw new Error("Argument 'prompts' is expected to be a string[]");
        let parsedOptions;
        if (Array.isArray(options)) parsedOptions = {
            stop: options
        };
        else parsedOptions = options;
        const [runnableConfig, callOptions] = this._separateRunnableConfigFromCallOptionsCompat(parsedOptions);
        runnableConfig.callbacks = runnableConfig.callbacks ?? callbacks;
        if (!this.cache) return this._generateUncached(prompts, callOptions, runnableConfig);
        const { cache } = this;
        const llmStringKey = this._getSerializedCacheKeyParametersForCall(callOptions);
        const { generations, missingPromptIndices, startedRunManagers } = await this._generateCached({
            prompts,
            cache,
            llmStringKey,
            parsedOptions: callOptions,
            handledOptions: runnableConfig,
            runId: runnableConfig.runId
        });
        let llmOutput = {};
        if (missingPromptIndices.length > 0) {
            const results = await this._generateUncached(missingPromptIndices.map((i)=>prompts[i]), callOptions, runnableConfig, startedRunManagers !== void 0 ? missingPromptIndices.map((i)=>startedRunManagers?.[i]) : void 0);
            await Promise.all(results.generations.map(async (generation, index)=>{
                const promptIndex = missingPromptIndices[index];
                generations[promptIndex] = generation;
                return cache.update(prompts[promptIndex], llmStringKey, generation);
            }));
            llmOutput = results.llmOutput ?? {};
        }
        return {
            generations,
            llmOutput
        };
    }
    /**
	* Get the identifying parameters of the LLM.
	*/ _identifyingParams() {
        return {};
    }
    _modelType() {
        return "base_llm";
    }
};
/**
* LLM class that provides a simpler interface to subclass than {@link BaseLLM}.
*
* Requires only implementing a simpler {@link _call} method instead of {@link _generate}.
*
* @augments BaseLLM
*/ var LLM = class extends BaseLLM {
    async _generate(prompts, options, runManager) {
        const generations = await Promise.all(prompts.map((prompt, promptIndex)=>this._call(prompt, {
                ...options,
                promptIndex
            }, runManager).then((text)=>[
                    {
                        text
                    }
                ])));
        return {
            generations
        };
    }
};
;
 //# sourceMappingURL=llms.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/output_parsers/base.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseLLMOutputParser",
    ()=>BaseLLMOutputParser,
    "BaseOutputParser",
    ()=>BaseOutputParser,
    "OutputParserException",
    ()=>OutputParserException
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$errors$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/errors/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/runnables/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/runnables/index.js [app-rsc] (ecmascript) <locals>");
;
;
;
//#region src/output_parsers/base.ts
/**
* Abstract base class for parsing the output of a Large Language Model
* (LLM) call. It provides methods for parsing the result of an LLM call
* and invoking the parser with a given input.
*/ var BaseLLMOutputParser = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$runnables$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Runnable"] {
    /**
	* Parses the result of an LLM call with a given prompt. By default, it
	* simply calls `parseResult`.
	* @param generations The generations from an LLM call.
	* @param _prompt The prompt used in the LLM call.
	* @param callbacks Optional callbacks.
	* @returns A promise of the parsed output.
	*/ parseResultWithPrompt(generations, _prompt, callbacks) {
        return this.parseResult(generations, callbacks);
    }
    _baseMessageToString(message) {
        return typeof message.content === "string" ? message.content : this._baseMessageContentToString(message.content);
    }
    _baseMessageContentToString(content) {
        return JSON.stringify(content);
    }
    /**
	* Calls the parser with a given input and optional configuration options.
	* If the input is a string, it creates a generation with the input as
	* text and calls `parseResult`. If the input is a `BaseMessage`, it
	* creates a generation with the input as a message and the content of the
	* input as text, and then calls `parseResult`.
	* @param input The input to the parser, which can be a string or a `BaseMessage`.
	* @param options Optional configuration options.
	* @returns A promise of the parsed output.
	*/ async invoke(input, options) {
        if (typeof input === "string") return this._callWithConfig(async (input$1, options$1)=>this.parseResult([
                {
                    text: input$1
                }
            ], options$1?.callbacks), input, {
            ...options,
            runType: "parser"
        });
        else return this._callWithConfig(async (input$1, options$1)=>this.parseResult([
                {
                    message: input$1,
                    text: this._baseMessageToString(input$1)
                }
            ], options$1?.callbacks), input, {
            ...options,
            runType: "parser"
        });
    }
};
/**
* Class to parse the output of an LLM call.
*/ var BaseOutputParser = class extends BaseLLMOutputParser {
    parseResult(generations, callbacks) {
        return this.parse(generations[0].text, callbacks);
    }
    async parseWithPrompt(text, _prompt, callbacks) {
        return this.parse(text, callbacks);
    }
    /**
	* Return the string type key uniquely identifying this class of parser
	*/ _type() {
        throw new Error("_type not implemented");
    }
};
/**
* Exception that output parsers should raise to signify a parsing error.
*
* This exists to differentiate parsing errors from other code or execution errors
* that also may arise inside the output parser. OutputParserExceptions will be
* available to catch and handle in ways to fix the parsing error, while other
* errors will be raised.
*
* @param message - The error that's being re-raised or an error message.
* @param llmOutput - String model output which is error-ing.
* @param observation - String explanation of error which can be passed to a
*     model to try and remediate the issue.
* @param sendToLLM - Whether to send the observation and llm_output back to an Agent
*     after an OutputParserException has been raised. This gives the underlying
*     model driving the agent the context that the previous output was improperly
*     structured, in the hopes that it will update the output to the correct
*     format.
*/ var OutputParserException = class extends Error {
    llmOutput;
    observation;
    sendToLLM;
    constructor(message, llmOutput, observation, sendToLLM = false){
        super(message);
        this.llmOutput = llmOutput;
        this.observation = observation;
        this.sendToLLM = sendToLLM;
        if (sendToLLM) {
            if (observation === void 0 || llmOutput === void 0) throw new Error("Arguments 'observation' & 'llmOutput' are required if 'sendToLlm' is true");
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$errors$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addLangChainErrorFields"])(this, "OUTPUT_PARSING_FAILURE");
    }
};
;
 //# sourceMappingURL=base.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/output_parsers/transform.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseCumulativeTransformOutputParser",
    ()=>BaseCumulativeTransformOutputParser,
    "BaseTransformOutputParser",
    ()=>BaseTransformOutputParser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/messages/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/messages/utils.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$outputs$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/outputs.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/output_parsers/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$deep$2d$compare$2d$strict$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/deep-compare-strict.js [app-rsc] (ecmascript)");
;
;
;
;
;
//#region src/output_parsers/transform.ts
/**
* Class to parse the output of an LLM call that also allows streaming inputs.
*/ var BaseTransformOutputParser = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseOutputParser"] {
    async *_transform(inputGenerator) {
        for await (const chunk of inputGenerator)if (typeof chunk === "string") yield this.parseResult([
            {
                text: chunk
            }
        ]);
        else yield this.parseResult([
            {
                message: chunk,
                text: this._baseMessageToString(chunk)
            }
        ]);
    }
    /**
	* Transforms an asynchronous generator of input into an asynchronous
	* generator of parsed output.
	* @param inputGenerator An asynchronous generator of input.
	* @param options A configuration object.
	* @returns An asynchronous generator of parsed output.
	*/ async *transform(inputGenerator, options) {
        yield* this._transformStreamWithConfig(inputGenerator, this._transform.bind(this), {
            ...options,
            runType: "parser"
        });
    }
};
/**
* A base class for output parsers that can handle streaming input. It
* extends the `BaseTransformOutputParser` class and provides a method for
* converting parsed outputs into a diff format.
*/ var BaseCumulativeTransformOutputParser = class extends BaseTransformOutputParser {
    diff = false;
    constructor(fields){
        super(fields);
        this.diff = fields?.diff ?? this.diff;
    }
    async *_transform(inputGenerator) {
        let prevParsed;
        let accGen;
        for await (const chunk of inputGenerator){
            if (typeof chunk !== "string" && typeof chunk.content !== "string") throw new Error("Cannot handle non-string output.");
            let chunkGen;
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isBaseMessageChunk"])(chunk)) {
                if (typeof chunk.content !== "string") throw new Error("Cannot handle non-string message output.");
                chunkGen = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$outputs$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ChatGenerationChunk"]({
                    message: chunk,
                    text: chunk.content
                });
            } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isBaseMessage"])(chunk)) {
                if (typeof chunk.content !== "string") throw new Error("Cannot handle non-string message output.");
                chunkGen = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$outputs$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ChatGenerationChunk"]({
                    message: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["convertToChunk"])(chunk),
                    text: chunk.content
                });
            } else chunkGen = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$outputs$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["GenerationChunk"]({
                text: chunk
            });
            if (accGen === void 0) accGen = chunkGen;
            else accGen = accGen.concat(chunkGen);
            const parsed = await this.parsePartialResult([
                accGen
            ]);
            if (parsed !== void 0 && parsed !== null && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cfworker$2b$json$2d$schema$40$4$2e$1$2e$1$2f$node_modules$2f40$cfworker$2f$json$2d$schema$2f$dist$2f$esm$2f$deep$2d$compare$2d$strict$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deepCompareStrict"])(parsed, prevParsed)) {
                if (this.diff) yield this._diff(prevParsed, parsed);
                else yield parsed;
                prevParsed = parsed;
            }
        }
    }
    getFormatInstructions() {
        return "";
    }
};
;
 //# sourceMappingURL=transform.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/output_parsers/json.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "JsonOutputParser",
    ()=>JsonOutputParser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/json.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$duplex$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/fast-json-patch/src/duplex.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$transform$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/output_parsers/transform.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json_patch$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/json_patch.js [app-rsc] (ecmascript) <locals>");
;
;
;
;
//#region src/output_parsers/json.ts
/**
* Class for parsing the output of an LLM into a JSON object.
*/ var JsonOutputParser = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$transform$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseCumulativeTransformOutputParser"] {
    static lc_name() {
        return "JsonOutputParser";
    }
    lc_namespace = [
        "langchain_core",
        "output_parsers"
    ];
    lc_serializable = true;
    /** @internal */ _concatOutputChunks(first, second) {
        if (this.diff) return super._concatOutputChunks(first, second);
        return second;
    }
    _diff(prev, next) {
        if (!next) return void 0;
        if (!prev) return [
            {
                op: "replace",
                path: "",
                value: next
            }
        ];
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$duplex$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["compare"])(prev, next);
    }
    async parsePartialResult(generations) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseJsonMarkdown"])(generations[0].text);
    }
    async parse(text) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseJsonMarkdown"])(text, JSON.parse);
    }
    getFormatInstructions() {
        return "";
    }
};
;
 //# sourceMappingURL=json.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/output_parsers/bytes.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BytesOutputParser",
    ()=>BytesOutputParser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$transform$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/output_parsers/transform.js [app-rsc] (ecmascript)");
;
//#region src/output_parsers/bytes.ts
/**
* OutputParser that parses LLMResult into the top likely string and
* encodes it into bytes.
*/ var BytesOutputParser = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$transform$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseTransformOutputParser"] {
    static lc_name() {
        return "BytesOutputParser";
    }
    lc_namespace = [
        "langchain_core",
        "output_parsers",
        "bytes"
    ];
    lc_serializable = true;
    textEncoder = new TextEncoder();
    parse(text) {
        return Promise.resolve(this.textEncoder.encode(text));
    }
    getFormatInstructions() {
        return "";
    }
};
;
 //# sourceMappingURL=bytes.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/output_parsers/list.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CommaSeparatedListOutputParser",
    ()=>CommaSeparatedListOutputParser,
    "CustomListOutputParser",
    ()=>CustomListOutputParser,
    "ListOutputParser",
    ()=>ListOutputParser,
    "MarkdownListOutputParser",
    ()=>MarkdownListOutputParser,
    "NumberedListOutputParser",
    ()=>NumberedListOutputParser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/output_parsers/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$transform$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/output_parsers/transform.js [app-rsc] (ecmascript)");
;
;
//#region src/output_parsers/list.ts
/**
* Class to parse the output of an LLM call to a list.
* @augments BaseOutputParser
*/ var ListOutputParser = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$transform$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseTransformOutputParser"] {
    re;
    async *_transform(inputGenerator) {
        let buffer = "";
        for await (const input of inputGenerator){
            if (typeof input === "string") buffer += input;
            else buffer += input.content;
            if (!this.re) {
                const parts = await this.parse(buffer);
                if (parts.length > 1) {
                    for (const part of parts.slice(0, -1))yield [
                        part
                    ];
                    buffer = parts[parts.length - 1];
                }
            } else {
                const matches = [
                    ...buffer.matchAll(this.re)
                ];
                if (matches.length > 1) {
                    let doneIdx = 0;
                    for (const match of matches.slice(0, -1)){
                        yield [
                            match[1]
                        ];
                        doneIdx += (match.index ?? 0) + match[0].length;
                    }
                    buffer = buffer.slice(doneIdx);
                }
            }
        }
        for (const part of (await this.parse(buffer)))yield [
            part
        ];
    }
};
/**
* Class to parse the output of an LLM call as a comma-separated list.
* @augments ListOutputParser
*/ var CommaSeparatedListOutputParser = class extends ListOutputParser {
    static lc_name() {
        return "CommaSeparatedListOutputParser";
    }
    lc_namespace = [
        "langchain_core",
        "output_parsers",
        "list"
    ];
    lc_serializable = true;
    /**
	* Parses the given text into an array of strings, using a comma as the
	* separator. If the parsing fails, throws an OutputParserException.
	* @param text The text to parse.
	* @returns An array of strings obtained by splitting the input text at each comma.
	*/ async parse(text) {
        try {
            return text.trim().split(",").map((s)=>s.trim());
        } catch  {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["OutputParserException"](`Could not parse output: ${text}`, text);
        }
    }
    /**
	* Provides instructions on the expected format of the response for the
	* CommaSeparatedListOutputParser.
	* @returns A string containing instructions on the expected format of the response.
	*/ getFormatInstructions() {
        return `Your response should be a list of comma separated values, eg: \`foo, bar, baz\``;
    }
};
/**
* Class to parse the output of an LLM call to a list with a specific length and separator.
* @augments ListOutputParser
*/ var CustomListOutputParser = class extends ListOutputParser {
    lc_namespace = [
        "langchain_core",
        "output_parsers",
        "list"
    ];
    length;
    separator;
    constructor({ length, separator }){
        super(...arguments);
        this.length = length;
        this.separator = separator || ",";
    }
    /**
	* Parses the given text into an array of strings, using the specified
	* separator. If the parsing fails or the number of items in the list
	* doesn't match the expected length, throws an OutputParserException.
	* @param text The text to parse.
	* @returns An array of strings obtained by splitting the input text at each occurrence of the specified separator.
	*/ async parse(text) {
        try {
            const items = text.trim().split(this.separator).map((s)=>s.trim());
            if (this.length !== void 0 && items.length !== this.length) throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["OutputParserException"](`Incorrect number of items. Expected ${this.length}, got ${items.length}.`);
            return items;
        } catch (e) {
            if (Object.getPrototypeOf(e) === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["OutputParserException"].prototype) throw e;
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["OutputParserException"](`Could not parse output: ${text}`);
        }
    }
    /**
	* Provides instructions on the expected format of the response for the
	* CustomListOutputParser, including the number of items and the
	* separator.
	* @returns A string containing instructions on the expected format of the response.
	*/ getFormatInstructions() {
        return `Your response should be a list of ${this.length === void 0 ? "" : `${this.length} `}items separated by "${this.separator}" (eg: \`foo${this.separator} bar${this.separator} baz\`)`;
    }
};
var NumberedListOutputParser = class extends ListOutputParser {
    static lc_name() {
        return "NumberedListOutputParser";
    }
    lc_namespace = [
        "langchain_core",
        "output_parsers",
        "list"
    ];
    lc_serializable = true;
    getFormatInstructions() {
        return `Your response should be a numbered list with each item on a new line. For example: \n\n1. foo\n\n2. bar\n\n3. baz`;
    }
    re = /\d+\.\s([^\n]+)/g;
    async parse(text) {
        return [
            ...text.matchAll(this.re) ?? []
        ].map((m)=>m[1]);
    }
};
var MarkdownListOutputParser = class extends ListOutputParser {
    static lc_name() {
        return "NumberedListOutputParser";
    }
    lc_namespace = [
        "langchain_core",
        "output_parsers",
        "list"
    ];
    lc_serializable = true;
    getFormatInstructions() {
        return `Your response should be a numbered list with each item on a new line. For example: \n\n1. foo\n\n2. bar\n\n3. baz`;
    }
    re = /^\s*[-*]\s([^\n]+)$/gm;
    async parse(text) {
        return [
            ...text.matchAll(this.re) ?? []
        ].map((m)=>m[1]);
    }
};
;
 //# sourceMappingURL=list.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/output_parsers/string.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StringOutputParser",
    ()=>StringOutputParser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$transform$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/output_parsers/transform.js [app-rsc] (ecmascript)");
;
//#region src/output_parsers/string.ts
/**
* OutputParser that parses LLMResult into the top likely string.
* @example
* ```typescript
* const promptTemplate = PromptTemplate.fromTemplate(
*   "Tell me a joke about {topic}",
* );
*
* const chain = RunnableSequence.from([
*   promptTemplate,
*   new ChatOpenAI({ model: "gpt-4o-mini" }),
*   new StringOutputParser(),
* ]);
*
* const result = await chain.invoke({ topic: "bears" });
* console.log("What do you call a bear with no teeth? A gummy bear!");
* ```
*/ var StringOutputParser = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$transform$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseTransformOutputParser"] {
    static lc_name() {
        return "StrOutputParser";
    }
    lc_namespace = [
        "langchain_core",
        "output_parsers",
        "string"
    ];
    lc_serializable = true;
    /**
	* Parses a string output from an LLM call. This method is meant to be
	* implemented by subclasses to define how a string output from an LLM
	* should be parsed.
	* @param text The string output from an LLM call.
	* @param callbacks Optional callbacks.
	* @returns A promise of the parsed output.
	*/ parse(text) {
        return Promise.resolve(text);
    }
    getFormatInstructions() {
        return "";
    }
    _textContentToString(content) {
        return content.text;
    }
    _imageUrlContentToString(_content) {
        throw new Error(`Cannot coerce a multimodal "image_url" message part into a string.`);
    }
    _messageContentToString(content) {
        switch(content.type){
            case "text":
            case "text_delta":
                if ("text" in content) return this._textContentToString(content);
                break;
            case "image_url":
                if ("image_url" in content) return this._imageUrlContentToString(content);
                break;
            default:
                throw new Error(`Cannot coerce "${content.type}" message part into a string.`);
        }
        throw new Error(`Invalid content type: ${content.type}`);
    }
    _baseMessageContentToString(content) {
        return content.reduce((acc, item)=>acc + this._messageContentToString(item), "");
    }
};
;
 //# sourceMappingURL=string.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/output_parsers/structured.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AsymmetricStructuredOutputParser",
    ()=>AsymmetricStructuredOutputParser,
    "JsonMarkdownStructuredOutputParser",
    ()=>JsonMarkdownStructuredOutputParser,
    "StructuredOutputParser",
    ()=>StructuredOutputParser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/types/zod.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json_schema$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/json_schema.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/output_parsers/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@3.25.67/node_modules/zod/dist/esm/v3/index.js [app-rsc] (ecmascript)");
;
;
;
;
//#region src/output_parsers/structured.ts
var StructuredOutputParser = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseOutputParser"] {
    static lc_name() {
        return "StructuredOutputParser";
    }
    lc_namespace = [
        "langchain",
        "output_parsers",
        "structured"
    ];
    toJSON() {
        return this.toJSONNotImplemented();
    }
    constructor(schema){
        super(schema);
        this.schema = schema;
    }
    /**
	* Creates a new StructuredOutputParser from a Zod schema.
	* @param schema The Zod schema which the output should match
	* @returns A new instance of StructuredOutputParser.
	*/ static fromZodSchema(schema) {
        return new this(schema);
    }
    /**
	* Creates a new StructuredOutputParser from a set of names and
	* descriptions.
	* @param schemas An object where each key is a name and each value is a description
	* @returns A new instance of StructuredOutputParser.
	*/ static fromNamesAndDescriptions(schemas) {
        const zodSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].object(Object.fromEntries(Object.entries(schemas).map(([name, description])=>[
                name,
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].string().describe(description)
            ])));
        return new this(zodSchema);
    }
    /**
	* Returns a markdown code snippet with a JSON object formatted according
	* to the schema.
	* @param options Optional. The options for formatting the instructions
	* @returns A markdown code snippet with a JSON object formatted according to the schema.
	*/ getFormatInstructions() {
        return `You must format your output as a JSON value that adheres to a given "JSON Schema" instance.

"JSON Schema" is a declarative language that allows you to annotate and validate JSON documents.

For example, the example "JSON Schema" instance {{"properties": {{"foo": {{"description": "a list of test words", "type": "array", "items": {{"type": "string"}}}}}}, "required": ["foo"]}}
would match an object with one required property, "foo". The "type" property specifies "foo" must be an "array", and the "description" property semantically describes it as "a list of test words". The items within "foo" must be strings.
Thus, the object {{"foo": ["bar", "baz"]}} is a well-formatted instance of this example "JSON Schema". The object {{"properties": {{"foo": ["bar", "baz"]}}}} is not well-formatted.

Your output will be parsed and type-checked according to the provided schema instance, so make sure all fields in your output match the schema exactly and there are no trailing commas!

Here is the JSON Schema instance your output must adhere to. Include the enclosing markdown codeblock:
\`\`\`json
${JSON.stringify((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json_schema$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toJsonSchema"])(this.schema))}
\`\`\`
`;
    }
    /**
	* Parses the given text according to the schema.
	* @param text The text to parse
	* @returns The parsed output.
	*/ async parse(text) {
        try {
            const trimmedText = text.trim();
            const json = trimmedText.match(/^```(?:json)?\s*([\s\S]*?)```/)?.[1] || trimmedText.match(/```json\s*([\s\S]*?)```/)?.[1] || trimmedText;
            const escapedJson = json.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, (_match, capturedGroup)=>{
                const escapedInsideQuotes = capturedGroup.replace(/\n/g, "\\n");
                return `"${escapedInsideQuotes}"`;
            }).replace(/\n/g, "");
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["interopParseAsync"])(this.schema, JSON.parse(escapedJson));
        } catch (e) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["OutputParserException"](`Failed to parse. Text: "${text}". Error: ${e}`, text);
        }
    }
};
/**
* A specific type of `StructuredOutputParser` that parses JSON data
* formatted as a markdown code snippet.
*/ var JsonMarkdownStructuredOutputParser = class extends StructuredOutputParser {
    static lc_name() {
        return "JsonMarkdownStructuredOutputParser";
    }
    getFormatInstructions(options) {
        const interpolationDepth = options?.interpolationDepth ?? 1;
        if (interpolationDepth < 1) throw new Error("f string interpolation depth must be at least 1");
        return `Return a markdown code snippet with a JSON object formatted to look like:\n\`\`\`json\n${this._schemaToInstruction((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json_schema$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toJsonSchema"])(this.schema)).replaceAll("{", "{".repeat(interpolationDepth)).replaceAll("}", "}".repeat(interpolationDepth))}\n\`\`\``;
    }
    _schemaToInstruction(schemaInput, indent = 2) {
        const schema = schemaInput;
        if ("type" in schema) {
            let nullable = false;
            let type;
            if (Array.isArray(schema.type)) {
                const nullIdx = schema.type.findIndex((type$1)=>type$1 === "null");
                if (nullIdx !== -1) {
                    nullable = true;
                    schema.type.splice(nullIdx, 1);
                }
                type = schema.type.join(" | ");
            } else type = schema.type;
            if (schema.type === "object" && schema.properties) {
                const description$1 = schema.description ? ` // ${schema.description}` : "";
                const properties = Object.entries(schema.properties).map(([key, value])=>{
                    const isOptional = schema.required?.includes(key) ? "" : " (optional)";
                    return `${" ".repeat(indent)}"${key}": ${this._schemaToInstruction(value, indent + 2)}${isOptional}`;
                }).join("\n");
                return `{\n${properties}\n${" ".repeat(indent - 2)}}${description$1}`;
            }
            if (schema.type === "array" && schema.items) {
                const description$1 = schema.description ? ` // ${schema.description}` : "";
                return `array[\n${" ".repeat(indent)}${this._schemaToInstruction(schema.items, indent + 2)}\n${" ".repeat(indent - 2)}] ${description$1}`;
            }
            const isNullable = nullable ? " (nullable)" : "";
            const description = schema.description ? ` // ${schema.description}` : "";
            return `${type}${description}${isNullable}`;
        }
        if ("anyOf" in schema) return schema.anyOf.map((s)=>this._schemaToInstruction(s, indent)).join(`\n${" ".repeat(indent - 2)}`);
        throw new Error("unsupported schema type");
    }
    static fromZodSchema(schema) {
        return new this(schema);
    }
    static fromNamesAndDescriptions(schemas) {
        const zodSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].object(Object.fromEntries(Object.entries(schemas).map(([name, description])=>[
                name,
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$3$2e$25$2e$67$2f$node_modules$2f$zod$2f$dist$2f$esm$2f$v3$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].string().describe(description)
            ])));
        return new this(zodSchema);
    }
};
/**
* A type of `StructuredOutputParser` that handles asymmetric input and
* output schemas.
*/ var AsymmetricStructuredOutputParser = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseOutputParser"] {
    structuredInputParser;
    constructor({ inputSchema }){
        super(...arguments);
        this.structuredInputParser = new JsonMarkdownStructuredOutputParser(inputSchema);
    }
    async parse(text) {
        let parsedInput;
        try {
            parsedInput = await this.structuredInputParser.parse(text);
        } catch (e) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["OutputParserException"](`Failed to parse. Text: "${text}". Error: ${e}`, text);
        }
        return this.outputProcessor(parsedInput);
    }
    getFormatInstructions() {
        return this.structuredInputParser.getFormatInstructions();
    }
};
;
 //# sourceMappingURL=structured.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/output_parsers/xml.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "XMLOutputParser",
    ()=>XMLOutputParser,
    "XML_FORMAT_INSTRUCTIONS",
    ()=>XML_FORMAT_INSTRUCTIONS,
    "parseXMLMarkdown",
    ()=>parseXMLMarkdown
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$duplex$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/fast-json-patch/src/duplex.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$transform$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/output_parsers/transform.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json_patch$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/json_patch.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$sax$2d$js$2f$sax$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/sax-js/sax.js [app-rsc] (ecmascript)");
;
;
;
;
//#region src/output_parsers/xml.ts
const XML_FORMAT_INSTRUCTIONS = `The output should be formatted as a XML file.
1. Output should conform to the tags below. 
2. If tags are not given, make them on your own.
3. Remember to always open and close all the tags.

As an example, for the tags ["foo", "bar", "baz"]:
1. String "<foo>\n   <bar>\n      <baz></baz>\n   </bar>\n</foo>" is a well-formatted instance of the schema. 
2. String "<foo>\n   <bar>\n   </foo>" is a badly-formatted instance.
3. String "<foo>\n   <tag>\n   </tag>\n</foo>" is a badly-formatted instance.

Here are the output tags:
\`\`\`
{tags}
\`\`\``;
var XMLOutputParser = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$transform$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseCumulativeTransformOutputParser"] {
    tags;
    constructor(fields){
        super(fields);
        this.tags = fields?.tags;
    }
    static lc_name() {
        return "XMLOutputParser";
    }
    lc_namespace = [
        "langchain_core",
        "output_parsers"
    ];
    lc_serializable = true;
    _diff(prev, next) {
        if (!next) return void 0;
        if (!prev) return [
            {
                op: "replace",
                path: "",
                value: next
            }
        ];
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$fast$2d$json$2d$patch$2f$src$2f$duplex$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["compare"])(prev, next);
    }
    async parsePartialResult(generations) {
        return parseXMLMarkdown(generations[0].text);
    }
    async parse(text) {
        return parseXMLMarkdown(text);
    }
    getFormatInstructions() {
        const withTags = !!(this.tags && this.tags.length > 0);
        return withTags ? XML_FORMAT_INSTRUCTIONS.replace("{tags}", this.tags?.join(", ") ?? "") : XML_FORMAT_INSTRUCTIONS;
    }
};
const strip = (text)=>text.split("\n").map((line)=>line.replace(/^\s+/, "")).join("\n").trim();
const parseParsedResult = (input)=>{
    if (Object.keys(input).length === 0) return {};
    const result = {};
    if (input.children.length > 0) {
        result[input.name] = input.children.map(parseParsedResult);
        return result;
    } else {
        result[input.name] = input.text ?? void 0;
        return result;
    }
};
function parseXMLMarkdown(s) {
    const cleanedString = strip(s);
    const parser = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$sax$2d$js$2f$sax$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sax"].parser(true);
    let parsedResult = {};
    const elementStack = [];
    parser.onopentag = (node)=>{
        const element = {
            name: node.name,
            attributes: node.attributes,
            children: [],
            text: "",
            isSelfClosing: node.isSelfClosing
        };
        if (elementStack.length > 0) {
            const parentElement = elementStack[elementStack.length - 1];
            parentElement.children.push(element);
        } else parsedResult = element;
        if (!node.isSelfClosing) elementStack.push(element);
    };
    parser.onclosetag = ()=>{
        if (elementStack.length > 0) {
            const lastElement = elementStack.pop();
            if (elementStack.length === 0 && lastElement) parsedResult = lastElement;
        }
    };
    parser.ontext = (text)=>{
        if (elementStack.length > 0) {
            const currentElement = elementStack[elementStack.length - 1];
            currentElement.text += text;
        }
    };
    parser.onattribute = (attr)=>{
        if (elementStack.length > 0) {
            const currentElement = elementStack[elementStack.length - 1];
            currentElement.attributes[attr.name] = attr.value;
        }
    };
    const match = /```(xml)?(.*)```/s.exec(cleanedString);
    const xmlString = match ? match[2] : cleanedString;
    parser.write(xmlString).close();
    if (parsedResult && parsedResult.name === "?xml") parsedResult = parsedResult.children[0];
    return parseParsedResult(parsedResult);
}
;
 //# sourceMappingURL=xml.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/output_parsers/index.js [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "output_parsers_exports",
    ()=>output_parsers_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/_virtual/rolldown_runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/json.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/output_parsers/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$transform$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/output_parsers/transform.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$json$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/output_parsers/json.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$bytes$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/output_parsers/bytes.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$list$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/output_parsers/list.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$string$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/output_parsers/string.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$structured$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/output_parsers/structured.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$xml$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/output_parsers/xml.js [app-rsc] (ecmascript)");
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
//#region src/output_parsers/index.ts
var output_parsers_exports = {};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__export"])(output_parsers_exports, {
    AsymmetricStructuredOutputParser: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$structured$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AsymmetricStructuredOutputParser"],
    BaseCumulativeTransformOutputParser: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$transform$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseCumulativeTransformOutputParser"],
    BaseLLMOutputParser: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseLLMOutputParser"],
    BaseOutputParser: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseOutputParser"],
    BaseTransformOutputParser: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$transform$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseTransformOutputParser"],
    BytesOutputParser: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$bytes$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BytesOutputParser"],
    CommaSeparatedListOutputParser: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$list$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CommaSeparatedListOutputParser"],
    CustomListOutputParser: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$list$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CustomListOutputParser"],
    JsonMarkdownStructuredOutputParser: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$structured$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["JsonMarkdownStructuredOutputParser"],
    JsonOutputParser: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$json$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["JsonOutputParser"],
    ListOutputParser: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$list$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ListOutputParser"],
    MarkdownListOutputParser: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$list$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["MarkdownListOutputParser"],
    NumberedListOutputParser: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$list$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["NumberedListOutputParser"],
    OutputParserException: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["OutputParserException"],
    StringOutputParser: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$string$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["StringOutputParser"],
    StructuredOutputParser: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$structured$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["StructuredOutputParser"],
    XMLOutputParser: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$xml$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["XMLOutputParser"],
    XML_FORMAT_INSTRUCTIONS: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$xml$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["XML_FORMAT_INSTRUCTIONS"],
    parseJsonMarkdown: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseJsonMarkdown"],
    parsePartialJson: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parsePartialJson"],
    parseXMLMarkdown: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$xml$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseXMLMarkdown"]
});
;
 //# sourceMappingURL=index.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/output_parsers/openai_tools/json_output_tools_parsers.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "JsonOutputKeyToolsParser",
    ()=>JsonOutputKeyToolsParser,
    "JsonOutputToolsParser",
    ()=>JsonOutputToolsParser,
    "convertLangChainToolCallToOpenAI",
    ()=>convertLangChainToolCallToOpenAI,
    "makeInvalidToolCall",
    ()=>makeInvalidToolCall,
    "parseToolCall",
    ()=>parseToolCall
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/json.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/messages/ai.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/types/zod.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/output_parsers/base.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$transform$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/output_parsers/transform.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$json$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/output_parsers/json.js [app-rsc] (ecmascript)");
;
;
;
;
;
;
//#region src/output_parsers/openai_tools/json_output_tools_parsers.ts
function parseToolCall(rawToolCall, options) {
    if (rawToolCall.function === void 0) return void 0;
    let functionArgs;
    if (options?.partial) try {
        functionArgs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$json$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parsePartialJson"])(rawToolCall.function.arguments ?? "{}");
    } catch  {
        return void 0;
    }
    else try {
        functionArgs = JSON.parse(rawToolCall.function.arguments);
    } catch (e) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["OutputParserException"]([
            `Function "${rawToolCall.function.name}" arguments:`,
            ``,
            rawToolCall.function.arguments,
            ``,
            `are not valid JSON.`,
            `Error: ${e.message}`
        ].join("\n"));
    }
    const parsedToolCall = {
        name: rawToolCall.function.name,
        args: functionArgs,
        type: "tool_call"
    };
    if (options?.returnId) parsedToolCall.id = rawToolCall.id;
    return parsedToolCall;
}
function convertLangChainToolCallToOpenAI(toolCall) {
    if (toolCall.id === void 0) throw new Error(`All OpenAI tool calls must have an "id" field.`);
    return {
        id: toolCall.id,
        type: "function",
        function: {
            name: toolCall.name,
            arguments: JSON.stringify(toolCall.args)
        }
    };
}
function makeInvalidToolCall(rawToolCall, errorMsg) {
    return {
        name: rawToolCall.function?.name,
        args: rawToolCall.function?.arguments,
        id: rawToolCall.id,
        error: errorMsg,
        type: "invalid_tool_call"
    };
}
/**
* Class for parsing the output of a tool-calling LLM into a JSON object.
*/ var JsonOutputToolsParser = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$transform$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BaseCumulativeTransformOutputParser"] {
    static lc_name() {
        return "JsonOutputToolsParser";
    }
    returnId = false;
    lc_namespace = [
        "langchain",
        "output_parsers",
        "openai_tools"
    ];
    lc_serializable = true;
    constructor(fields){
        super(fields);
        this.returnId = fields?.returnId ?? this.returnId;
    }
    _diff() {
        throw new Error("Not supported.");
    }
    async parse() {
        throw new Error("Not implemented.");
    }
    async parseResult(generations) {
        const result = await this.parsePartialResult(generations, false);
        return result;
    }
    /**
	* Parses the output and returns a JSON object. If `argsOnly` is true,
	* only the arguments of the function call are returned.
	* @param generations The output of the LLM to parse.
	* @returns A JSON object representation of the function call or its arguments.
	*/ async parsePartialResult(generations, partial = true) {
        const message = generations[0].message;
        let toolCalls;
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$messages$2f$ai$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isAIMessage"])(message) && message.tool_calls?.length) toolCalls = message.tool_calls.map((toolCall)=>{
            const { id, ...rest } = toolCall;
            if (!this.returnId) return rest;
            return {
                id,
                ...rest
            };
        });
        else if (message.additional_kwargs.tool_calls !== void 0) {
            const rawToolCalls = JSON.parse(JSON.stringify(message.additional_kwargs.tool_calls));
            toolCalls = rawToolCalls.map((rawToolCall)=>{
                return parseToolCall(rawToolCall, {
                    returnId: this.returnId,
                    partial
                });
            });
        }
        if (!toolCalls) return [];
        const parsedToolCalls = [];
        for (const toolCall of toolCalls)if (toolCall !== void 0) {
            const backwardsCompatibleToolCall = {
                type: toolCall.name,
                args: toolCall.args,
                id: toolCall.id
            };
            parsedToolCalls.push(backwardsCompatibleToolCall);
        }
        return parsedToolCalls;
    }
};
/**
* Class for parsing the output of a tool-calling LLM into a JSON object if you are
* expecting only a single tool to be called.
*/ var JsonOutputKeyToolsParser = class extends JsonOutputToolsParser {
    static lc_name() {
        return "JsonOutputKeyToolsParser";
    }
    lc_namespace = [
        "langchain",
        "output_parsers",
        "openai_tools"
    ];
    lc_serializable = true;
    returnId = false;
    /** The type of tool calls to return. */ keyName;
    /** Whether to return only the first tool call. */ returnSingle = false;
    zodSchema;
    constructor(params){
        super(params);
        this.keyName = params.keyName;
        this.returnSingle = params.returnSingle ?? this.returnSingle;
        this.zodSchema = params.zodSchema;
    }
    async _validateResult(result) {
        if (this.zodSchema === void 0) return result;
        const zodParsedResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$types$2f$zod$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["interopSafeParseAsync"])(this.zodSchema, result);
        if (zodParsedResult.success) return zodParsedResult.data;
        else throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$base$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["OutputParserException"](`Failed to parse. Text: "${JSON.stringify(result, null, 2)}". Error: ${JSON.stringify(zodParsedResult.error?.issues)}`, JSON.stringify(result, null, 2));
    }
    async parsePartialResult(generations) {
        const results = await super.parsePartialResult(generations);
        const matchingResults = results.filter((result)=>result.type === this.keyName);
        let returnedValues = matchingResults;
        if (!matchingResults.length) return void 0;
        if (!this.returnId) returnedValues = matchingResults.map((result)=>result.args);
        if (this.returnSingle) return returnedValues[0];
        return returnedValues;
    }
    async parseResult(generations) {
        const results = await super.parsePartialResult(generations, false);
        const matchingResults = results.filter((result)=>result.type === this.keyName);
        let returnedValues = matchingResults;
        if (!matchingResults.length) return void 0;
        if (!this.returnId) returnedValues = matchingResults.map((result)=>result.args);
        if (this.returnSingle) return this._validateResult(returnedValues[0]);
        const toolCallResults = await Promise.all(returnedValues.map((value)=>this._validateResult(value)));
        return toolCallResults;
    }
};
;
 //# sourceMappingURL=json_output_tools_parsers.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/output_parsers/openai_tools/index.js [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "openai_tools_exports",
    ()=>openai_tools_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/_virtual/rolldown_runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$openai_tools$2f$json_output_tools_parsers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/output_parsers/openai_tools/json_output_tools_parsers.js [app-rsc] (ecmascript)");
;
;
//#region src/output_parsers/openai_tools/index.ts
var openai_tools_exports = {};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__export"])(openai_tools_exports, {
    JsonOutputKeyToolsParser: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$openai_tools$2f$json_output_tools_parsers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["JsonOutputKeyToolsParser"],
    JsonOutputToolsParser: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$openai_tools$2f$json_output_tools_parsers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["JsonOutputToolsParser"],
    convertLangChainToolCallToOpenAI: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$openai_tools$2f$json_output_tools_parsers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["convertLangChainToolCallToOpenAI"],
    makeInvalidToolCall: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$openai_tools$2f$json_output_tools_parsers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["makeInvalidToolCall"],
    parseToolCall: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$output_parsers$2f$openai_tools$2f$json_output_tools_parsers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseToolCall"]
});
;
 //# sourceMappingURL=index.js.map
}),
"[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/embeddings.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Embeddings",
    ()=>Embeddings,
    "embeddings_exports",
    ()=>embeddings_exports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/_virtual/rolldown_runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$async_caller$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@langchain+core@1.1.3_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp-proto@0.57._bz4v4aj56ywmgvv3gse2dgz4fm/node_modules/@langchain/core/dist/utils/async_caller.js [app-rsc] (ecmascript)");
;
;
//#region src/embeddings.ts
var embeddings_exports = {};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$_virtual$2f$rolldown_runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__export"])(embeddings_exports, {
    Embeddings: ()=>Embeddings
});
/**
* An abstract class that provides methods for embedding documents and
* queries using LangChain.
*/ var Embeddings = class {
    /**
	* The async caller should be used by subclasses to make any async calls,
	* which will thus benefit from the concurrency and retry logic.
	*/ caller;
    constructor(params){
        this.caller = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$langchain$2b$core$40$1$2e$1$2e$3_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_$40$opentelemetry$2b$exporter$2d$trace$2d$otlp$2d$proto$40$0$2e$57$2e$_bz4v4aj56ywmgvv3gse2dgz4fm$2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$utils$2f$async_caller$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AsyncCaller"](params ?? {});
    }
};
;
 //# sourceMappingURL=embeddings.js.map
}),
];

//# sourceMappingURL=a2d8e_%40langchain_core_dist_c20d6938._.js.map