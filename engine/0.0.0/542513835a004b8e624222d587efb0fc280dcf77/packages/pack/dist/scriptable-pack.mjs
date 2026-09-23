import { sha1 } from '../../../vendor/@noble/hashes/legacy.js';
import { uuidv7obj } from '../../../vendor/uuidv7/dist/index.js';
import { ok, err } from '../../types/dist/index.mjs';

// src/guid.ts

// src/errors.ts
var PackError = class extends Error {
  code;
  expected;
  hint;
  detail;
  cause;
  constructor(args) {
    super(`[PackError ${args.code}] expected: ${args.expected}; hint: ${args.hint}`);
    this.name = "PackError";
    this.code = args.code;
    this.expected = args.expected;
    this.hint = args.hint;
    this.detail = args.detail;
    if (args.cause !== void 0) this.cause = args.cause;
  }
};

// src/guid.ts
function brand(bytes) {
  return bytes;
}
var HEX_BYTE = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
function bytesToDashForm(bytes) {
  const h = HEX_BYTE;
  return `${h[bytes[0]]}${h[bytes[1]]}${h[bytes[2]]}${h[bytes[3]]}-${h[bytes[4]]}${h[bytes[5]]}-${h[bytes[6]]}${h[bytes[7]]}-${h[bytes[8]]}${h[bytes[9]]}-${h[bytes[10]]}${h[bytes[11]]}${h[bytes[12]]}${h[bytes[13]]}${h[bytes[14]]}${h[bytes[15]]}`;
}
var UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
var PACK_SOURCE_KEY_RE = /^[a-z0-9][a-z0-9._-]*(\/[a-z0-9][a-z0-9._-]*)*$/;
function isValidPackSourceKey(value) {
  return typeof value === "string" && PACK_SOURCE_KEY_RE.test(value);
}
function isValidAssetGuidString(value) {
  return typeof value === "string" && UUID_RE.test(value);
}
function dashFormToBytes(dashForm) {
  const hex = dashForm.replace(/-/g, "");
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}
function randomUuidBytes() {
  const uuid = uuidv7obj();
  const bytes = new Uint8Array(16);
  bytes.set(uuid.bytes);
  return bytes;
}
function packageId(value) {
  return value;
}
var PackageId = {
  parse(dashForm) {
    const parsed = AssetGuid.parse(dashForm);
    return parsed.ok ? { ok: true, value: packageId(parsed.value) } : parsed;
  },
  format(value) {
    return bytesToDashForm(value);
  },
  random() {
    return packageId(randomUuidBytes());
  }
};
function derivedGuid(namespace, sourceKey) {
  if (!(namespace instanceof Uint8Array) || namespace.byteLength !== 16) {
    throw new TypeError("AssetGuid.derive requires a 16-byte PackageId");
  }
  if (!isValidPackSourceKey(sourceKey)) {
    const error = new TypeError(
      `AssetGuid.derive received invalid sourceKey ${JSON.stringify(sourceKey)}`
    );
    Object.defineProperty(error, "code", { value: "pack-source-key-invalid" });
    throw error;
  }
  const name = new TextEncoder().encode(sourceKey);
  const input = new Uint8Array(namespace.byteLength + name.byteLength);
  input.set(namespace, 0);
  input.set(name, namespace.byteLength);
  const digest = sha1(input);
  const result = digest.slice(0, 16);
  result[6] = (result[6] ?? 0) & 15 | 80;
  result[8] = (result[8] ?? 0) & 63 | 128;
  return brand(result);
}
var AssetGuid = {
  /**
   * Parse a 36-char RFC 4122 dash-form UUID string into an AssetGuid.
   * Returns Ok(AssetGuid) on success or Err(PackError) with code 'pack-guid-malformed' on failure.
   * Never throws for expected failures (requirements §4.2 / §14 / charter proposition 4).
   */
  parse(dashForm) {
    if (!isValidAssetGuidString(dashForm)) {
      return {
        ok: false,
        error: new PackError({
          code: "pack-guid-malformed",
          expected: "36-char RFC 4122 dash-form UUID",
          hint: "use AssetGuid.random() or a UUIDv7 generator; all GUID fields must be 36-char RFC 4122 dash-form",
          detail: {
            raw: dashForm,
            reason: "expected 36-char RFC 4122 dash-form UUID"
          }
        })
      };
    }
    return { ok: true, value: brand(dashFormToBytes(dashForm)) };
  },
  /**
   * Format an AssetGuid as a 36-char RFC 4122 lowercase dash-form string.
   */
  format(guid) {
    return bytesToDashForm(guid);
  },
  /**
   * Test byte-by-byte equality between two AssetGuids.
   */
  equals(a, b) {
    for (let i = 0; i < 16; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  },
  /**
   * Mint a new time-ordered UUIDv7 as an AssetGuid.
   * Works in both Node.js and browser environments.
   */
  random() {
    return brand(randomUuidBytes());
  },
  /** Derive the stable UUIDv5 projection for one Pack subject and sourceKey. */
  derive(namespace, sourceKey) {
    return derivedGuid(namespace, sourceKey);
  }
};
var PACK_PARAMETER_TYPES = [
  "bool",
  "u32",
  "i32",
  "f32",
  "f64",
  "string",
  "enum",
  "vec2",
  "vec3",
  "vec4",
  "color",
  "asset-guid"
];
function authoringError(code, expected, hint, detail = {}, actual) {
  return {
    code,
    expected,
    hint,
    ...actual === void 0 ? {} : { actual },
    detail
  };
}
function failure(error) {
  return err(error);
}
function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function validateSceneComponents(value) {
  if (value === void 0) return ok(void 0);
  if (!Array.isArray(value)) {
    return failure(
      parameterFailure(
        "$.sceneComponents",
        "an array of component schema records",
        value,
        "sceneComponents is not an array"
      )
    );
  }
  const components = [];
  const names = /* @__PURE__ */ new Set();
  for (const [componentIndex, candidate] of value.entries()) {
    if (!isRecord(candidate) || typeof candidate.name !== "string" || !isRecord(candidate.fields)) {
      return failure(
        parameterFailure(
          `$.sceneComponents[${componentIndex}]`,
          "a component record with name and fields",
          candidate,
          "scene component schema is malformed"
        )
      );
    }
    if (candidate.name.length === 0 || names.has(candidate.name)) {
      return failure(
        parameterFailure(
          `$.sceneComponents[${componentIndex}].name`,
          "a non-empty unique component name",
          candidate.name,
          "scene component names must be unique"
        )
      );
    }
    names.add(candidate.name);
    const fields = {};
    for (const [fieldName, field] of Object.entries(candidate.fields)) {
      if (typeof field === "string" && field.length === 0 || typeof field !== "string" && (!isRecord(field) || typeof field.type !== "string" || field.type.length === 0)) {
        return failure(
          parameterFailure(
            `$.sceneComponents[${componentIndex}].fields.${fieldName}`,
            "a field type string or { type: string }",
            field,
            "scene component field schema is malformed"
          )
        );
      }
      fields[fieldName] = field;
    }
    components.push({ name: candidate.name, fields });
  }
  return ok(components);
}
function isPackageId(value) {
  return value instanceof Uint8Array && value.byteLength === 16;
}
function cloneValue(value) {
  if (value instanceof Uint8Array) return value.slice();
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  return value;
}
function sourceKeyFailure(sourceKey, propertyPath = "$.sourceKey") {
  return authoringError(
    "pack-source-key-invalid",
    "a sourceKey matching ^[a-z0-9][a-z0-9._-]*(/[a-z0-9][a-z0-9._-]*)*$",
    "use a stable lower-case semantic key; do not derive it from file paths or output order",
    { propertyPath, sourceKey },
    typeof sourceKey === "string" ? sourceKey : void 0
  );
}
function parameterFailure(propertyPath, expected, actual, reason) {
  return authoringError(
    "pack-parameter-invalid",
    expected,
    "repair the parameter declaration or the instance values, then inspect and rebuild",
    { propertyPath, reason, actual: typeof actual === "string" ? actual : JSON.stringify(actual) }
  );
}
function numericType(type) {
  return type === "u32" || type === "i32" || type === "f32" || type === "f64";
}
function vectorLength(type) {
  switch (type) {
    case "vec2":
      return 2;
    case "vec3":
      return 3;
    case "vec4":
    case "color":
      return 4;
    default:
      return void 0;
  }
}
function parameterValueError(parameter, value, propertyPath) {
  const { type } = parameter;
  if (type === "bool") {
    return typeof value === "boolean" ? void 0 : parameterFailure(propertyPath, "a boolean", value, "bool value has the wrong type");
  }
  if (numericType(type)) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return parameterFailure(
        propertyPath,
        "a finite number",
        value,
        "numeric value is not finite"
      );
    }
    if ((type === "u32" || type === "i32") && !Number.isInteger(value)) {
      return parameterFailure(
        propertyPath,
        "an integer",
        value,
        "integer parameter received a fraction"
      );
    }
    if (type === "u32" && (value < 0 || value > 4294967295)) {
      return parameterFailure(
        propertyPath,
        "an unsigned 32-bit integer",
        value,
        "u32 value is outside [0, 2^32 - 1]"
      );
    }
    if (type === "i32" && (value < -2147483648 || value > 2147483647)) {
      return parameterFailure(
        propertyPath,
        "a signed 32-bit integer",
        value,
        "i32 value is outside [-2^31, 2^31 - 1]"
      );
    }
    if (type === "f32" && !Number.isFinite(Math.fround(value))) {
      return parameterFailure(
        propertyPath,
        "a finite IEEE-754 32-bit float",
        value,
        "f32 value overflows binary32"
      );
    }
    if (parameter.minimum !== void 0 && value < parameter.minimum) {
      return parameterFailure(
        propertyPath,
        `a number >= ${parameter.minimum}`,
        value,
        "value is below minimum"
      );
    }
    if (parameter.maximum !== void 0 && value > parameter.maximum) {
      return parameterFailure(
        propertyPath,
        `a number <= ${parameter.maximum}`,
        value,
        "value is above maximum"
      );
    }
    return void 0;
  }
  if (type === "string") {
    return typeof value === "string" ? void 0 : parameterFailure(propertyPath, "a string", value, "string parameter has the wrong type");
  }
  if (type === "enum") {
    if (typeof value !== "string") {
      return parameterFailure(
        propertyPath,
        "one of the declared enum strings",
        value,
        "enum value has the wrong type"
      );
    }
    if (parameter.values === void 0 || !parameter.values.includes(value)) {
      return parameterFailure(
        propertyPath,
        "one of the declared enum values",
        value,
        "enum value is not declared"
      );
    }
    return void 0;
  }
  const length = vectorLength(type);
  if (length !== void 0) {
    if (!Array.isArray(value) || value.length !== length || value.some((component) => typeof component !== "number" || !Number.isFinite(component))) {
      return parameterFailure(
        propertyPath,
        `a finite numeric vector with ${length} components`,
        value,
        "vector value has the wrong shape"
      );
    }
    if (type === "color" && value.some((component) => component < 0 || component > 1)) {
      return parameterFailure(
        propertyPath,
        "an RGBA color with components in [0, 1]",
        value,
        "color component is outside [0, 1]"
      );
    }
    return void 0;
  }
  if (type === "asset-guid") {
    const validString = typeof value === "string" && isValidAssetGuidString(value);
    if (!(value instanceof Uint8Array && value.byteLength === 16) && !validString) {
      return parameterFailure(
        propertyPath,
        "a 16-byte AssetGuid or UUID string",
        value,
        "asset GUID value is malformed"
      );
    }
    return void 0;
  }
  return parameterFailure(
    propertyPath,
    "a supported Pack parameter type",
    value,
    "unknown parameter type"
  );
}
function normalizeParameterValue(parameter, value, propertyPath) {
  const error = parameterValueError(parameter, value, propertyPath);
  if (error !== void 0) return failure(error);
  if (parameter.type === "asset-guid" && typeof value === "string") {
    const parsed = AssetGuid.parse(value);
    if (!parsed.ok) {
      return failure(
        parameterFailure(
          propertyPath,
          "a valid AssetGuid UUID string",
          value,
          "asset GUID parser rejected the value"
        )
      );
    }
    return ok(parsed.value);
  }
  return ok(cloneValue(value));
}
function validateParameterDefinitions(parameters, propertyPath = "$.parameters") {
  if (!Array.isArray(parameters) || parameters.length === 0) {
    return failure(
      parameterFailure(
        propertyPath,
        "a non-empty parameter descriptor array",
        parameters,
        "parameters must be explicit and non-empty"
      )
    );
  }
  const names = /* @__PURE__ */ new Set();
  const normalized = [];
  for (const [index, candidate] of parameters.entries()) {
    const path = `${propertyPath}[${index}]`;
    if (!isRecord(candidate))
      return failure(
        parameterFailure(
          path,
          "a parameter descriptor object",
          candidate,
          "descriptor is not an object"
        )
      );
    const name = candidate.name;
    if (typeof name !== "string" || !/^[A-Za-z][A-Za-z0-9_.-]*$/.test(name)) {
      return failure(
        parameterFailure(
          `${path}.name`,
          "a unique identifier-like parameter name",
          name,
          "parameter name is invalid"
        )
      );
    }
    if (names.has(name))
      return failure(
        parameterFailure(
          `${path}.name`,
          "a unique parameter name",
          name,
          "parameter name is duplicated"
        )
      );
    names.add(name);
    const unknown = Object.keys(candidate).find(
      (key) => !["name", "type", "default", "minimum", "maximum", "values", "kind"].includes(key)
    );
    if (unknown !== void 0) {
      return failure(
        parameterFailure(
          `${path}.${unknown}`,
          "only name, type, default, minimum, maximum, values, and kind fields",
          candidate[unknown],
          "parameter descriptors are a closed authoring schema"
        )
      );
    }
    const type = candidate.type;
    if (typeof type !== "string" || !PACK_PARAMETER_TYPES.includes(type)) {
      return failure(
        parameterFailure(
          `${path}.type`,
          PACK_PARAMETER_TYPES.join(" | "),
          type,
          "parameter type is not supported"
        )
      );
    }
    const typed = {
      ...candidate,
      name,
      type
    };
    if (typed.values !== void 0) {
      if (typed.type !== "enum" || !Array.isArray(typed.values) || typed.values.length === 0 || typed.values.some((item) => typeof item !== "string") || new Set(typed.values).size !== typed.values.length) {
        return failure(
          parameterFailure(
            `${path}.values`,
            "unique non-empty strings for enum",
            typed.values,
            "enum values are malformed"
          )
        );
      }
    } else if (typed.type === "enum") {
      return failure(
        parameterFailure(
          `${path}.values`,
          "a non-empty enum choices array",
          typed.values,
          "enum has no choices"
        )
      );
    }
    if (typed.kind !== void 0 && (typed.type !== "asset-guid" || typeof typed.kind !== "string")) {
      return failure(
        parameterFailure(
          `${path}.kind`,
          "a kind constraint only on asset-guid parameters",
          typed.kind,
          "kind is misplaced"
        )
      );
    }
    for (const field of ["minimum", "maximum"]) {
      const bound = typed[field];
      if (bound !== void 0 && (typeof bound !== "number" || !Number.isFinite(bound))) {
        return failure(
          parameterFailure(
            `${path}.${field}`,
            "a finite numeric bound",
            bound,
            "numeric bound is invalid"
          )
        );
      }
    }
    if (!numericType(typed.type) && (typed.minimum !== void 0 || typed.maximum !== void 0)) {
      return failure(
        parameterFailure(
          path,
          "minimum/maximum only on numeric parameters",
          typed,
          "numeric bounds are not meaningful for this parameter type"
        )
      );
    }
    if (typed.minimum !== void 0 && typed.maximum !== void 0 && typed.minimum > typed.maximum) {
      return failure(
        parameterFailure(path, "minimum <= maximum", typed, "numeric bounds are reversed")
      );
    }
    const defaultResult = normalizeParameterValue(typed, typed.default, `${path}.default`);
    if (!defaultResult.ok) return defaultResult;
    normalized.push({
      ...typed,
      default: defaultResult.value,
      ...typed.values === void 0 ? {} : { values: Object.freeze([...typed.values]) }
    });
  }
  return ok(Object.freeze(normalized));
}
function definePackageId(value) {
  if (isPackageId(value)) return value.slice();
  const parsed = PackageId.parse(value);
  if (!parsed.ok) {
    const error = authoringError(
      "pack-package-id-invalid",
      "a 36-character RFC 4122 UUID packageId",
      "use PackageId.random() or repair the packageId literal before loading the Pack",
      { value },
      value
    );
    throw Object.assign(new TypeError(error.hint), error);
  }
  return parsed.value;
}
function cloneDefinition(definition) {
  const parameters = "parameters" in definition ? Object.freeze(
    definition.parameters.map(
      (parameter) => Object.freeze({
        ...parameter,
        default: cloneValue(parameter.default),
        ...parameter.values === void 0 ? {} : { values: Object.freeze(parameter.values.map((value) => cloneValue(value))) }
      })
    )
  ) : void 0;
  const sceneComponents = definition.sceneComponents === void 0 ? void 0 : Object.freeze(
    definition.sceneComponents.map(
      (component) => Object.freeze({
        name: component.name,
        fields: Object.freeze({ ...component.fields })
      })
    )
  );
  return Object.freeze({
    ...definition,
    packageId: definition.packageId.slice(),
    ...parameters === void 0 ? {} : { parameters },
    ...sceneComponents === void 0 ? {} : { sceneComponents }
  });
}
function definePack(definition) {
  const validated = validatePackDefinition(definition);
  if (!validated.ok) throw Object.assign(new TypeError(validated.error.hint), validated.error);
  return cloneDefinition(
    validated.value
  );
}
function projectScriptablePackMeta(definition, sourcePath) {
  return {
    schemaVersion: "2.0.0",
    kind: "scriptable-pack-source",
    packageId: PackageId.format(definition.packageId),
    source: sourcePath,
    ..."parameters" in definition ? {
      parameters: definition.parameters.map((parameter) => ({
        name: parameter.name,
        type: parameter.type,
        default: jsonParameterValue(parameter.default),
        ...parameter.minimum === void 0 ? {} : { minimum: parameter.minimum },
        ...parameter.maximum === void 0 ? {} : { maximum: parameter.maximum },
        ...parameter.values === void 0 ? {} : { values: parameter.values },
        ...parameter.kind === void 0 ? {} : { kind: parameter.kind }
      }))
    } : {}
  };
}
function jsonParameterValue(value) {
  return value instanceof Uint8Array ? AssetGuid.format(value) : value;
}
function validatePackDefinition(value, sourcePath) {
  if (!isRecord(value))
    return failure(
      parameterFailure("$", "a Pack definition object", value, "definition is not an object")
    );
  const unknown = Object.keys(value).find(
    (key) => !["schemaVersion", "packageId", "name", "parameters", "sceneComponents", "build"].includes(
      key
    )
  );
  if (unknown !== void 0) {
    return failure(
      parameterFailure(
        `$.${unknown}`,
        "only schemaVersion, packageId, name, parameters, sceneComponents, and build fields",
        value[unknown],
        "legacy static output declarations and external asset tables are not part of v2 authoring"
      )
    );
  }
  if (value.schemaVersion !== "2.0.0") {
    return failure(
      parameterFailure(
        "$.schemaVersion",
        "the literal '2.0.0'",
        value.schemaVersion,
        "authoring source schema is unsupported"
      )
    );
  }
  if (!isPackageId(value.packageId)) {
    return failure(
      authoringError(
        "pack-package-id-invalid",
        "a 16-byte PackageId",
        "use definePackageId() for the stable source identity",
        { sourcePath, propertyPath: "$.packageId" },
        typeof value.packageId === "string" ? value.packageId : void 0
      )
    );
  }
  if (value.name !== void 0 && typeof value.name !== "string") {
    return failure(
      parameterFailure("$.name", "a string when present", value.name, "display name is malformed")
    );
  }
  if (typeof value.build !== "function") {
    return failure(
      parameterFailure("$.build", "a build function", value.build, "build is not callable")
    );
  }
  const sceneComponents = validateSceneComponents(value.sceneComponents);
  if (!sceneComponents.ok) return sceneComponents;
  const hasParameters = Object.hasOwn(value, "parameters");
  if (!hasParameters) {
    return ok(
      Object.freeze({
        schemaVersion: "2.0.0",
        packageId: value.packageId,
        ...value.name === void 0 ? {} : { name: value.name },
        ...sceneComponents.value === void 0 ? {} : { sceneComponents: sceneComponents.value },
        build: value.build
      })
    );
  }
  const parameters = validateParameterDefinitions(value.parameters);
  if (!parameters.ok) return parameters;
  return ok(
    Object.freeze({
      schemaVersion: "2.0.0",
      packageId: value.packageId,
      ...value.name === void 0 ? {} : { name: value.name },
      ...sceneComponents.value === void 0 ? {} : { sceneComponents: sceneComponents.value },
      parameters: parameters.value,
      build: value.build
    })
  );
}
function hasPackParameters(value) {
  return isRecord(value) && Array.isArray(value.parameters) && value.parameters.length > 0;
}
function resolvePackParameterValues(definition, overrides = {}, inheritedValues) {
  if (!isRecord(overrides)) {
    return failure(
      parameterFailure(
        "$.values",
        "an object of sparse parameter overrides",
        overrides,
        "values is not an object"
      )
    );
  }
  const descriptors = new Map(
    definition.parameters.map((parameter) => [parameter.name, parameter])
  );
  for (const name of Object.keys(overrides)) {
    if (!descriptors.has(name)) {
      return failure(
        parameterFailure(
          `$.values.${name}`,
          "a declared parameter name",
          name,
          "instance contains an unknown parameter"
        )
      );
    }
  }
  const values = {};
  for (const parameter of definition.parameters) {
    const raw = Object.hasOwn(overrides, parameter.name) ? overrides[parameter.name] : inheritedValues?.[parameter.name] ?? parameter.default;
    const normalized = normalizeParameterValue(parameter, raw, `$.values.${parameter.name}`);
    if (!normalized.ok) return normalized;
    values[parameter.name] = normalized.value;
  }
  return ok(Object.freeze(values));
}
function jsonError(propertyPath, expected, actual, reason) {
  return failure(
    authoringError(
      "pack-parameter-invalid",
      expected,
      "repair the v3 pack.json authoring data, then rerun scan or rebuild",
      {
        propertyPath,
        reason,
        actual: typeof actual === "string" ? actual : JSON.stringify(actual)
      }
    )
  );
}
function parsePackageId(value, propertyPath) {
  if (typeof value !== "string") {
    return failure(
      authoringError(
        "pack-package-id-invalid",
        "a UUID string",
        "repair packageId in the authoring file",
        { propertyPath, value }
      )
    );
  }
  const parsed = PackageId.parse(value);
  if (!parsed.ok) {
    return failure(
      authoringError(
        "pack-package-id-invalid",
        "a 36-character RFC 4122 UUID",
        "repair packageId or use the authoring gateway to mint one",
        { propertyPath, value },
        value
      )
    );
  }
  return ok(parsed.value);
}
function parsePackJsonAsset(value, sourceKey) {
  if (!isRecord(value))
    return jsonError(
      `$.assets.${sourceKey}`,
      "an asset entry object",
      value,
      "asset entry is not an object"
    );
  const allowed = /* @__PURE__ */ new Set(["kind", "payload", "refs", "name", "artifacts"]);
  const unknown = Object.keys(value).find((key) => !allowed.has(key));
  if (unknown !== void 0)
    return jsonError(
      `$.assets.${sourceKey}.${unknown}`,
      "no GUID or extra authoring field",
      value[unknown],
      "direct v3 entries derive identity from their object key"
    );
  if (typeof value.kind !== "string" || value.kind.length === 0)
    return jsonError(
      `$.assets.${sourceKey}.kind`,
      "a non-empty asset kind",
      value.kind,
      "asset kind is missing"
    );
  if (!isRecord(value.payload))
    return jsonError(
      `$.assets.${sourceKey}.payload`,
      "a JSON object payload",
      value.payload,
      "payload must be a plain object"
    );
  if (!Array.isArray(value.refs) || value.refs.some((ref) => typeof ref !== "string" || !isValidAssetGuidString(ref))) {
    return jsonError(
      `$.assets.${sourceKey}.refs`,
      "an array of UUID references",
      value.refs,
      "references must already be real AssetGuids"
    );
  }
  if (value.name !== void 0 && (typeof value.name !== "string" || value.name.length === 0))
    return jsonError(
      `$.assets.${sourceKey}.name`,
      "a non-empty display name when present",
      value.name,
      "asset name is malformed"
    );
  if (value.artifacts !== void 0 && !isRecord(value.artifacts))
    return jsonError(
      `$.assets.${sourceKey}.artifacts`,
      "an artifact descriptor object when present",
      value.artifacts,
      "artifacts are not an object"
    );
  const base = {
    kind: value.kind,
    payload: value.payload,
    refs: Object.freeze([...value.refs]),
    ...value.name === void 0 ? {} : { name: value.name }
  };
  if (value.artifacts === void 0) return ok(base);
  const withArtifacts = {
    ...base,
    artifacts: value.artifacts
  };
  return ok(withArtifacts);
}
function parsePackSourceJson(value) {
  if (!isRecord(value))
    return jsonError("$", "a v3 pack.json object", value, "document is not an object");
  if (value.schemaVersion !== "3.0.0")
    return jsonError(
      "$.schemaVersion",
      "the literal '3.0.0'",
      value.schemaVersion,
      "document schema is not v3"
    );
  const unknown = Object.keys(value).find(
    (key) => !["schemaVersion", "packageId", "assets", "parent", "values"].includes(key)
  );
  if (unknown !== void 0)
    return jsonError(
      `$.${unknown}`,
      "no extra top-level authoring fields",
      value[unknown],
      "keep the v3 document to packageId+assets or packageId+parent+values"
    );
  const packageResult = parsePackageId(value.packageId, "$.packageId");
  if (!packageResult.ok) return packageResult;
  const hasAssets = Object.hasOwn(value, "assets");
  const hasParent = Object.hasOwn(value, "parent");
  const hasValues = Object.hasOwn(value, "values");
  if (hasAssets && (hasParent || hasValues))
    return jsonError(
      "$",
      "assets or parent+values, never both",
      value,
      "direct and instance branches are mutually exclusive"
    );
  if (hasAssets) {
    if (!isRecord(value.assets))
      return jsonError(
        "$.assets",
        "a sourceKey to asset object",
        value.assets,
        "direct assets are not an object"
      );
    const assets = {};
    for (const [sourceKey, entry] of Object.entries(value.assets)) {
      if (!isValidPackSourceKey(sourceKey))
        return failure(sourceKeyFailure(sourceKey, `$.assets.${sourceKey}`));
      const parsed = parsePackJsonAsset(entry, sourceKey);
      if (!parsed.ok) return parsed;
      assets[sourceKey] = parsed.value;
    }
    return ok({
      format: "direct",
      schemaVersion: "3.0.0",
      packageId: packageResult.value,
      assets: Object.freeze(assets)
    });
  }
  if (!hasParent || !hasValues || hasAssets)
    return jsonError(
      "$",
      "parent and values for an instance document",
      value,
      "instance branch is incomplete"
    );
  const parentResult = parsePackageId(value.parent, "$.parent");
  if (!parentResult.ok) return parentResult;
  if (!isRecord(value.values))
    return jsonError(
      "$.values",
      "a sparse parameter object",
      value.values,
      "instance values are not an object"
    );
  return ok({
    format: "instance",
    schemaVersion: "3.0.0",
    packageId: packageResult.value,
    parent: parentResult.value,
    values: Object.freeze({ ...value.values })
  });
}
function projectDirectPackJson(value) {
  const parsed = "format" in value ? ok(value) : parsePackSourceJson(value);
  if (!parsed.ok) return parsed;
  if (parsed.value.format !== "direct") {
    return failure(
      authoringError(
        "pack-parameter-invalid",
        "a direct v3 pack.json",
        "projectDirectPackJson accepts the direct branch only",
        { observed: parsed.value.format }
      )
    );
  }
  const assets = [];
  for (const [sourceKey, entry] of Object.entries(parsed.value.assets).sort(
    ([left], [right]) => left.localeCompare(right)
  )) {
    assets.push({
      ...entry,
      guid: AssetGuid.format(AssetGuid.derive(parsed.value.packageId, sourceKey)),
      sourceKey
    });
  }
  return ok({ packageId: PackageId.format(parsed.value.packageId), assets: Object.freeze(assets) });
}
function subjectId(subject) {
  return PackageId.format(subject.packageId).toLowerCase();
}
async function resolvePackParameterInheritance(subject, readParent) {
  const visited = /* @__PURE__ */ new Set();
  async function visit(current, path) {
    const currentId = subjectId(current);
    if (visited.has(currentId) || path.includes(currentId)) {
      return failure(
        authoringError(
          "pack-parent-cycle",
          "a finite acyclic Pack parent chain",
          "inspect parentChain and repair the first repeated packageId",
          { packageId: currentId, parentChain: [...path, currentId] }
        )
      );
    }
    visited.add(currentId);
    const nextPath = [...path, currentId];
    if (current.format === "direct") {
      return failure(
        authoringError(
          "pack-parent-has-no-parameters",
          "a ScriptablePack source with parameters as the parent",
          "direct packs cannot be instance parents; point the instance at a ScriptablePack source with parameters",
          { packageId: currentId }
        )
      );
    }
    if (current.format === "source") {
      const descriptors2 = validateParameterDefinitions(current.parameters, "$.parameters");
      if (!descriptors2.ok) return descriptors2;
      if (descriptors2.value.length === 0) {
        return failure(
          authoringError(
            "pack-parent-has-no-parameters",
            "the parent source to declare a non-empty parameter list",
            "use clone for an independent zero-parameter Pack instead of creating an empty instance",
            { packageId: currentId }
          )
        );
      }
      const definition2 = {
        packageId: current.packageId,
        parameters: descriptors2.value};
      const values2 = resolvePackParameterValues(definition2);
      if (!values2.ok) return values2;
      return ok({
        packageId: current.packageId,
        rootPackageId: current.packageId,
        values: values2.value,
        parentChain: [],
        parameters: descriptors2.value
      });
    }
    const parent = await readParent(current.parent);
    if (parent === void 0) {
      return failure(
        authoringError(
          "pack-parent-not-found",
          "the parent packageId to resolve in the source index",
          "inspect the parent locator or recreate the instance from a live ScriptablePack with parameters",
          { packageId: currentId, parent: PackageId.format(current.parent) }
        )
      );
    }
    if (PackageId.format(parent.packageId).toLowerCase() !== PackageId.format(current.parent).toLowerCase()) {
      return failure(
        authoringError(
          "pack-parent-not-found",
          "the parent reader to return the requested packageId",
          "repair the Source Index locator and retry inheritance resolution",
          {
            packageId: currentId,
            requestedParent: PackageId.format(current.parent),
            observedParent: PackageId.format(parent.packageId)
          }
        )
      );
    }
    const resolvedParent = await visit(parent, nextPath);
    if (!resolvedParent.ok) return resolvedParent;
    const descriptors = resolvedParent.value.parameters;
    const definition = {
      packageId: resolvedParent.value.rootPackageId,
      parameters: descriptors};
    const values = resolvePackParameterValues(
      definition,
      current.values,
      resolvedParent.value.values
    );
    if (!values.ok) return values;
    return ok({
      packageId: current.packageId,
      rootPackageId: resolvedParent.value.rootPackageId,
      values: values.value,
      parentChain: [PackageId.format(current.parent), ...resolvedParent.value.parentChain],
      parameters: descriptors
    });
  }
  return visit(subject, []);
}
var resolvePackInheritance = resolvePackParameterInheritance;
var PACK_AUTHORING_OPERATION_IDS = [
  "asset.list",
  "asset.inspect",
  "asset.resolve",
  "asset.verify",
  "asset-source.create",
  "asset-source.clone",
  "asset-source.create-instance",
  "asset-source.apply-values",
  "asset-source.rebuild",
  "asset-source.cold-cook"
];
function createPackAuthoringGateway(port) {
  const requests = /* @__PURE__ */ new Map();
  return {
    execute(operation) {
      if (typeof operation.requestId !== "string" || operation.requestId.trim().length === 0) {
        return Promise.resolve(
          failure(
            authoringError(
              "pack-source-revision-conflict",
              "a non-empty caller-minted requestId",
              "mint a new requestId and retry",
              { requestId: operation.requestId }
            )
          )
        );
      }
      let fingerprint;
      try {
        fingerprint = JSON.stringify(operation);
      } catch (cause) {
        return Promise.resolve(
          failure(
            authoringError(
              "pack-parameter-invalid",
              "a JSON-serialisable authoring operation",
              "remove non-serialisable operation fields and retry with a new requestId",
              {
                requestId: operation.requestId,
                cause: cause instanceof Error ? cause.message : String(cause)
              }
            )
          )
        );
      }
      const previous = requests.get(operation.requestId);
      if (previous !== void 0) {
        if (previous.fingerprint === fingerprint) return previous.result;
        return Promise.resolve(
          failure(
            authoringError(
              "pack-source-revision-conflict",
              "one immutable operation per requestId",
              "read the original result or mint a new requestId",
              { requestId: operation.requestId }
            )
          )
        );
      }
      const result = Promise.resolve().then(() => port.execute(operation)).catch(
        (cause) => failure(
          authoringError(
            "pack-parameter-invalid",
            "the Pack authoring port to return a structured Result",
            "repair the gateway port failure, then retry with a new requestId",
            {
              requestId: operation.requestId,
              cause: cause instanceof Error ? cause.message : String(cause)
            }
          )
        )
      );
      requests.set(operation.requestId, { fingerprint, result });
      return result;
    }
  };
}
var PACK_AUTHORING_OPERATION_DESCRIPTORS = PACK_AUTHORING_OPERATION_IDS.map((id) => ({
  id,
  domain: id.startsWith("asset-source.") ? "session" : "asset",
  readOnly: id.startsWith("asset."),
  requiresRevision: !id.startsWith("asset.") && id !== "asset-source.create"
}));

// src/scriptable-pack.ts
var SCRIPTABLE_PACK_ASSET_KINDS = [
  "mesh",
  "material",
  "scene",
  "texture",
  "equirect",
  "sampler",
  "font",
  "render-pipeline",
  "tileset",
  "video",
  "skeleton",
  "skin",
  "animation-clip",
  "animation-graph",
  "audio",
  "particle-effect",
  "ies-profile"
];
function isScriptablePackAssetKind(value) {
  return SCRIPTABLE_PACK_ASSET_KINDS.includes(value);
}
var SCRIPTABLE_PACK_CAPABILITY_MANIFEST = {
  assetKinds: SCRIPTABLE_PACK_ASSET_KINDS,
  durablePayload: true,
  refs: true,
  artifacts: true,
  hostCapabilities: ["audio-install", "video-play", "particle-execute"]
};
function sceneComponentFieldType(value) {
  if (typeof value === "string") return value;
  if (value === null || typeof value !== "object" || Array.isArray(value)) return void 0;
  const type = value.type;
  return typeof type === "string" ? type : void 0;
}
function projectScriptablePackSceneComponents(components) {
  return (components ?? []).map((component) => ({
    name: component.name,
    fields: Object.fromEntries(
      Object.entries(component.fields).map(([fieldName, field]) => [
        fieldName,
        sceneComponentFieldType(field)
      ])
    )
  }));
}

export { AssetGuid, PACK_AUTHORING_OPERATION_DESCRIPTORS, PACK_AUTHORING_OPERATION_IDS, PACK_PARAMETER_TYPES, PACK_SOURCE_KEY_RE, PackageId, SCRIPTABLE_PACK_ASSET_KINDS, SCRIPTABLE_PACK_CAPABILITY_MANIFEST, createPackAuthoringGateway, definePack, definePackageId, hasPackParameters, isScriptablePackAssetKind, isValidAssetGuidString, isValidPackSourceKey, parsePackSourceJson, projectDirectPackJson, projectScriptablePackMeta, projectScriptablePackSceneComponents, resolvePackInheritance, resolvePackParameterInheritance, resolvePackParameterValues, validatePackDefinition };
