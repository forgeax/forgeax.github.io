import { color } from '../../math/dist/index.mjs';
import { DEFAULT_STANDARD_PBR_PARAM_SCHEMA, DEFAULT_STANDARD_SURFACE_MODULE } from '../../shader/dist/index.mjs';
import { err, ok, standardSurfaceParameters, deriveStandardLayerPlan } from '../../types/dist/index.mjs';
import { ResourceInvalidValueError } from '../../ecs/dist/projection/index.mjs';

// src/materials.ts
var STANDARD_MATERIAL_MODULE = "forgeax_material::standard";
function pass(name, options, fragmentEntry) {
  const authoredState = options.renderState ?? {};
  const authoredRecord = authoredState;
  const tags = authoredRecord.tags ?? {};
  const lightMode = name === "shadow-caster" ? "ShadowCaster" : name === "forward" ? "Forward" : "Deferred";
  return {
    name,
    program: {
      module: name === "shadow-caster" ? "forgeax::default-shadow-caster" : STANDARD_MATERIAL_MODULE,
      fragmentEntry,
      moduleSlots: { surface: options.surfaceModule }
    },
    renderState: {
      ...authoredState,
      tags: options.surfaceModule === DEFAULT_STANDARD_SURFACE_MODULE ? { LightMode: lightMode, ...tags } : {
        ...tags,
        LightMode: lightMode,
        SurfaceModule: options.surfaceModule,
        SurfaceKind: options.surfaceKind ?? "standard",
        GeometryVariant: options.geometryVariant ?? "rigid",
        LightingLane: options.lightingLane ?? "direct",
        AlphaClip: options.alphaClip === true ? "enabled" : "disabled"
      },
      ...options.queue === void 0 ? {} : { queue: options.queue }
    }
  };
}
function projectStandardSurfacePasses(options) {
  const authoredPasses = options.declaredPasses;
  const passNames = options.surfaceKind === "full-custom" && authoredPasses !== void 0 ? [...authoredPasses] : ["forward"];
  if (authoredPasses === void 0 || options.surfaceKind !== "full-custom") {
    const blended = options.renderState?.blend !== void 0;
    if (!blended && options.layerPlan?.mode !== "physical") passNames.push("deferred");
    if (options.castShadow !== false) passNames.push("shadow-caster");
  }
  const entries = passNames.map(
    (name) => pass(
      name,
      options,
      name === "forward" ? "fs_main" : name === "deferred" ? "fs_gbuffer" : "fs_shadow"
    )
  );
  const passes = entries;
  return passes;
}

// src/materials.ts
var MaterialAuthoringContractError = class extends Error {
  code = "material-authoring-contract-invalid";
  expected = "Standard material authoring values are finite and within their declared ranges";
  hint;
  detail;
  constructor(parameter, reason, actual) {
    super(`Materials.standard: ${parameter} violates the authoring contract (${reason})`);
    this.name = "MaterialAuthoringContractError";
    this.hint = `set ${parameter} to a finite number${parameter === "alphaCutoff" ? " in [0, 1]" : ""} before publishing the material`;
    this.detail = {
      code: "material-authoring-contract-invalid",
      material: "Standard",
      parameter,
      reason,
      ...actual === void 0 ? {} : { actual }
    };
  }
};
var MaterialTransmissionContractError = class extends Error {
  code = "material-transmission-contract-invalid";
  expected = "transmission material values satisfy finite ranges and Forward depth rules";
  hint = "repair the named transmission value or pass state before publishing the material";
  detail;
  constructor(parameter, reason, actual) {
    super(`Materials.standard: ${parameter} violates the transmission contract (${reason})`);
    this.name = "MaterialTransmissionContractError";
    this.detail = {
      code: "material-transmission-contract-invalid",
      material: "Standard",
      parameter,
      reason,
      ...actual === void 0 ? {} : { actual }
    };
  }
};
var SPRITE_PREMULTIPLIED_ALPHA_BLEND = {
  color: { srcFactor: "one", dstFactor: "one-minus-src-alpha", operation: "add" },
  alpha: { srcFactor: "one", dstFactor: "one-minus-src-alpha", operation: "add" }
};
var UNLIT_MODULE = "forgeax_material::unlit";
function colorHexFromNumber(value) {
  if (!Number.isInteger(value) || value < 0 || value > 16777215) {
    throw new Error(`material color number must be an integer in [0, 0xffffff], got ${value}`);
  }
  return `#${value.toString(16).padStart(6, "0")}`;
}
function linearColorFromInput(input, channels) {
  if (typeof input === "number" || typeof input === "string") {
    const parsed = color.create();
    color.fromCss(parsed, typeof input === "number" ? colorHexFromNumber(input) : input);
    return channels === 3 ? [parsed[0], parsed[1], parsed[2]] : Array.from(parsed);
  }
  if (input.length !== channels) {
    throw new Error(`material color tuple must contain ${channels} channels, got ${input.length}`);
  }
  return [...input];
}
function srgb(input) {
  if (input.length !== 3 && input.length !== 4) {
    throw new Error(`sRGB material color tuple must contain 3 or 4 channels, got ${input.length}`);
  }
  const parsed = color.create(input[0] ?? 0, input[1] ?? 0, input[2] ?? 0, input[3] ?? 1);
  color.srgbToLinear(parsed, parsed);
  return input.length === 3 ? [parsed[0], parsed[1], parsed[2]] : [parsed[0], parsed[1], parsed[2], parsed[3]];
}
function authoredColorParameter(name, type, colorSpace, optional = false) {
  return {
    name,
    type,
    ...{ colorSpace },
    ...optional ? { optional: true } : {}
  };
}
function standardParameters(colorSpace, opts) {
  const physicalNames = /* @__PURE__ */ new Set();
  const addPhysical = (...names) => {
    for (const name of names) physicalNames.add(name);
  };
  if (opts.clearcoat !== void 0 || opts.clearcoatRoughness !== void 0 || opts.clearcoatNormalScale !== void 0 || opts.clearcoatTexture !== void 0 || opts.clearcoatRoughnessTexture !== void 0 || opts.clearcoatNormalTexture !== void 0) {
    addPhysical(
      "clearcoat",
      "clearcoatRoughness",
      "clearcoatNormalScale",
      ...opts.clearcoatTexture === void 0 ? [] : ["clearcoatTexture"],
      ...opts.clearcoatRoughnessTexture === void 0 ? [] : ["clearcoatRoughnessTexture"],
      ...opts.clearcoatNormalTexture === void 0 ? [] : ["clearcoatNormalTexture"]
    );
  }
  if (opts.anisotropyStrength !== void 0 || opts.anisotropyRotation !== void 0 || opts.anisotropyTexture !== void 0) {
    addPhysical("anisotropyStrength", "anisotropyRotation");
    if (opts.anisotropyTexture !== void 0) addPhysical("anisotropyTexture");
  }
  if (opts.sheenColor !== void 0 || opts.sheenRoughness !== void 0 || opts.sheenColorTexture !== void 0 || opts.sheenRoughnessTexture !== void 0) {
    addPhysical("sheenColor", "sheenRoughness");
    if (opts.sheenColorTexture !== void 0) addPhysical("sheenColorTexture");
    if (opts.sheenRoughnessTexture !== void 0) addPhysical("sheenRoughnessTexture");
  }
  if (opts.iridescence !== void 0 || opts.iridescenceIor !== void 0 || opts.iridescenceThicknessMinimum !== void 0 || opts.iridescenceThicknessMaximum !== void 0 || opts.iridescenceTexture !== void 0 || opts.iridescenceThicknessTexture !== void 0) {
    addPhysical(
      "iridescence",
      "iridescenceIor",
      "iridescenceThicknessMinimum",
      "iridescenceThicknessMaximum",
      ...opts.iridescenceTexture === void 0 ? [] : ["iridescenceTexture"],
      ...opts.iridescenceThicknessTexture === void 0 ? [] : ["iridescenceThicknessTexture"]
    );
  }
  const baseNames = /* @__PURE__ */ new Set([
    "baseColor",
    "metallic",
    "roughness",
    "metallicChannel",
    "roughnessChannel",
    "aoChannel",
    "extraChannel",
    "emissive",
    "emissiveIntensity",
    "occlusionStrength",
    "alphaCutoff",
    "normalScale",
    "specular",
    "specularColor",
    // IOR is part of the always-present dielectric F0 contract. The
    // transmission layer may be absent, but the Standard shader still
    // consumes this scalar for the base reflection path.
    "ior"
  ]);
  if (opts.specularTexture !== void 0) baseNames.add("specularTexture");
  if (opts.specularColorTexture !== void 0) baseNames.add("specularColorTexture");
  if (opts.transmission !== void 0 || opts.ior !== void 0 || opts.thickness !== void 0 || opts.transmissionTexture !== void 0 || opts.thicknessTexture !== void 0 || opts.attenuationColor !== void 0 || opts.attenuationDistance !== void 0) {
    for (const name of [
      "transmission",
      "ior",
      "thickness",
      "attenuationColor",
      "attenuationDistance"
    ]) {
      baseNames.add(name);
    }
  }
  for (const parameter of DEFAULT_STANDARD_PBR_PARAM_SCHEMA) {
    if (parameter.type === "texture2d" && opts[parameter.name] !== void 0) {
      baseNames.add(parameter.name);
    }
  }
  const availableSchema = DEFAULT_STANDARD_PBR_PARAM_SCHEMA;
  const numericSchema = availableSchema.filter((entry) => !entry.type.startsWith("texture"));
  const textureSchema = availableSchema.filter((entry) => entry.type.startsWith("texture"));
  const orderedSchema = [...numericSchema, ...textureSchema];
  return orderedSchema.filter((entry) => baseNames.has(entry.name) || physicalNames.has(entry.name)).map((entry) => {
    const type = entry.type.startsWith("texture") ? "texture" : entry.type;
    const isRequired = entry.name === "baseColor" || entry.name === "metallic" || entry.name === "roughness";
    const authoredColor = entry.type === "color" || entry.type === "vec3" && entry.name !== "attenuationColor";
    const schemaColorSpace = "colorSpace" in entry ? entry.colorSpace : void 0;
    const colorSpaceProjection = {};
    if (authoredColor && true) {
      colorSpaceProjection.colorSpace = colorSpace;
    } else if (!authoredColor && schemaColorSpace !== void 0) {
      colorSpaceProjection.colorSpace = schemaColorSpace;
    }
    return {
      name: entry.name,
      type,
      ...colorSpaceProjection,
      ...isRequired ? {} : { optional: true }
    };
  });
}
function unlitParameters(colorSpace) {
  return [
    authoredColorParameter("baseColor", "color", colorSpace),
    { name: "alphaCutoff", type: "f32", optional: true },
    { name: "baseColorTexture", type: "texture", optional: true }
  ];
}
function pass2(name, module, renderState, fragmentEntry, queue) {
  const lightMode = name === "shadow-caster" ? "ShadowCaster" : name === "deferred" ? "Deferred" : "Forward";
  const authoredState = renderState ?? {};
  const authoredTags = authoredState.tags;
  return {
    name,
    program: {
      module,
      ...{} 
    },
    renderState: {
      ...authoredState,
      tags: { LightMode: lightMode, ...authoredTags },
      ...queue === void 0 ? {} : { queue }
    }
  };
}
function shadowCasterRenderState(renderState) {
  if (renderState?.cullMode === void 0 && renderState?.frontFace === void 0) return void 0;
  return {
    ...renderState.cullMode === void 0 ? {} : { cullMode: renderState.cullMode },
    ...renderState.frontFace === void 0 ? {} : { frontFace: renderState.frontFace }
  };
}
function unlit(rgba, opts) {
  if (opts?.alphaCutoff !== void 0 && (opts.alphaCutoff < 0 || opts.alphaCutoff > 1)) {
    throw new Error(`Materials.unlit: alphaCutoff must be in [0, 1], got ${opts.alphaCutoff}`);
  }
  const values = { baseColor: linearColorFromInput(rgba, 4) };
  if (opts?.baseColorTexture !== void 0) values.baseColorTexture = opts.baseColorTexture;
  if (opts?.alphaCutoff !== void 0) values.alphaCutoff = opts.alphaCutoff;
  const passes = [
    pass2("forward", UNLIT_MODULE, opts?.renderState, void 0, opts?.queue)
  ];
  if (opts?.castShadow !== false) {
    passes.push(pass2("shadow-caster", UNLIT_MODULE, shadowCasterRenderState(opts?.renderState)));
  }
  return {
    kind: "material",
    colorSpace: "linear",
    passes,
    parameters: unlitParameters("linear"),
    values
  };
}
function validateChannel(name, value) {
  if (value !== void 0 && (!Number.isInteger(value) || value < 0 || value > 3)) {
    throw new Error(`Materials.standard: ${name} must be an integer in [0, 3], got ${value}`);
  }
}
function validateFiniteRange(name, value, minimum, maximum) {
  if (value === void 0 || !Number.isFinite(value)) {
    if (value === void 0) return;
    throw new MaterialTransmissionContractError(name, "non-finite", value);
  }
  if (value < minimum || maximum !== void 0 && value > maximum) {
    throw new MaterialTransmissionContractError(name, "range", value);
  }
}
function standardDefault(opts) {
  const occlusionStrength = opts.occlusionStrength ?? 1;
  if (occlusionStrength < 0 || occlusionStrength > 1) {
    throw new Error(
      `Materials.standard: occlusionStrength must be in [0, 1], got ${occlusionStrength}`
    );
  }
  if (opts.alphaCutoff !== void 0 && !Number.isFinite(opts.alphaCutoff)) {
    throw new MaterialAuthoringContractError("alphaCutoff", "non-finite", opts.alphaCutoff);
  }
  if (opts.alphaCutoff !== void 0 && (opts.alphaCutoff < 0 || opts.alphaCutoff > 1)) {
    throw new MaterialAuthoringContractError("alphaCutoff", "range", opts.alphaCutoff);
  }
  if (opts.normalScale !== void 0 && !Number.isFinite(opts.normalScale)) {
    throw new MaterialAuthoringContractError("normalScale", "non-finite", opts.normalScale);
  }
  validateChannel("metallicChannel", opts.metallicChannel);
  validateChannel("roughnessChannel", opts.roughnessChannel);
  const transmission = opts.transmission ?? 0;
  const ior = opts.ior ?? 1.5;
  const thickness = opts.thickness ?? 0;
  const attenuationColor = opts.attenuationColor ?? [1, 1, 1];
  validateFiniteRange("transmission", transmission, 0, 1);
  validateFiniteRange("ior", ior, 1);
  validateFiniteRange("thickness", thickness, 0);
  validateFiniteRange("attenuationDistance", opts.attenuationDistance, Number.MIN_VALUE);
  if (attenuationColor.length !== 3 || attenuationColor.some((value) => !Number.isFinite(value) || value < 0 || value > 1)) {
    throw new MaterialTransmissionContractError("attenuationColor", "shape", attenuationColor);
  }
  if (transmission > 0 && opts.renderState?.blend !== void 0) {
    throw new MaterialTransmissionContractError("transmission", "blend", opts.renderState.blend);
  }
  if (transmission > 0 && opts.renderState?.depthWriteEnabled === true) {
    throw new MaterialTransmissionContractError("transmission", "depth-write", true);
  }
  const values = {
    baseColor: linearColorFromInput(opts.baseColor, 4),
    metallic: opts.metallic ?? 0,
    roughness: opts.roughness ?? 0.5,
    occlusionStrength,
    specular: opts.specular ?? 1,
    specularColor: opts.specularColor === void 0 ? [1, 1, 1] : linearColorFromInput(opts.specularColor, 3),
    transmission,
    ior,
    thickness,
    attenuationColor
  };
  if (opts.metallicChannel !== void 0) values.metallicChannel = opts.metallicChannel;
  if (opts.roughnessChannel !== void 0) values.roughnessChannel = opts.roughnessChannel;
  if (opts.clearcoat !== void 0) values.clearcoat = opts.clearcoat;
  if (opts.clearcoatRoughness !== void 0) values.clearcoatRoughness = opts.clearcoatRoughness;
  if (opts.clearcoatTexture !== void 0) values.clearcoatTexture = opts.clearcoatTexture;
  if (opts.clearcoatRoughnessTexture !== void 0) {
    values.clearcoatRoughnessTexture = opts.clearcoatRoughnessTexture;
  }
  if (opts.clearcoatNormalTexture !== void 0) {
    values.clearcoatNormalTexture = opts.clearcoatNormalTexture;
  }
  if (opts.clearcoatNormalScale !== void 0)
    values.clearcoatNormalScale = opts.clearcoatNormalScale;
  if (opts.anisotropyStrength !== void 0) values.anisotropyStrength = opts.anisotropyStrength;
  if (opts.anisotropyRotation !== void 0) values.anisotropyRotation = opts.anisotropyRotation;
  if (opts.anisotropyTexture !== void 0) values.anisotropyTexture = opts.anisotropyTexture;
  if (opts.sheenColor !== void 0) values.sheenColor = linearColorFromInput(opts.sheenColor, 3);
  if (opts.sheenRoughness !== void 0) values.sheenRoughness = opts.sheenRoughness;
  if (opts.sheenColorTexture !== void 0) values.sheenColorTexture = opts.sheenColorTexture;
  if (opts.sheenRoughnessTexture !== void 0) {
    values.sheenRoughnessTexture = opts.sheenRoughnessTexture;
  }
  if (opts.iridescence !== void 0) values.iridescence = opts.iridescence;
  if (opts.iridescenceIor !== void 0) values.iridescenceIor = opts.iridescenceIor;
  if (opts.iridescenceThicknessMinimum !== void 0) {
    values.iridescenceThicknessMinimum = opts.iridescenceThicknessMinimum;
  }
  if (opts.iridescenceThicknessMaximum !== void 0) {
    values.iridescenceThicknessMaximum = opts.iridescenceThicknessMaximum;
  }
  if (opts.iridescenceTexture !== void 0) values.iridescenceTexture = opts.iridescenceTexture;
  if (opts.iridescenceThicknessTexture !== void 0) {
    values.iridescenceThicknessTexture = opts.iridescenceThicknessTexture;
  }
  if (opts.emissive !== void 0) values.emissive = linearColorFromInput(opts.emissive, 3);
  if (opts.emissiveIntensity !== void 0) values.emissiveIntensity = opts.emissiveIntensity;
  if (opts.emissiveTexture !== void 0) values.emissiveTexture = opts.emissiveTexture;
  if (opts.baseColorTexture !== void 0) values.baseColorTexture = opts.baseColorTexture;
  if (opts.metallicRoughnessTexture !== void 0) {
    values.metallicRoughnessTexture = opts.metallicRoughnessTexture;
  }
  if (opts.normalTexture !== void 0) values.normalTexture = opts.normalTexture;
  if (opts.normalScale !== void 0) values.normalScale = opts.normalScale;
  if (opts.occlusionTexture !== void 0) values.occlusionTexture = opts.occlusionTexture;
  if (opts.specularTexture !== void 0) values.specularTexture = opts.specularTexture;
  if (opts.specularColorTexture !== void 0) {
    values.specularColorTexture = opts.specularColorTexture;
  }
  if (opts.alphaCutoff !== void 0) values.alphaCutoff = opts.alphaCutoff;
  if (opts.transmissionTexture !== void 0) values.transmissionTexture = opts.transmissionTexture;
  if (opts.thicknessTexture !== void 0) values.thicknessTexture = opts.thicknessTexture;
  if (opts.attenuationDistance !== void 0) values.attenuationDistance = opts.attenuationDistance;
  const forwardRenderState = transmission > 0 ? { ...opts.renderState ?? {}, depthWriteEnabled: false } : opts.renderState;
  const parameters = standardSurfaceParameters(standardParameters("linear", opts));
  const declaredNames = new Set(parameters.map((parameter) => parameter.name));
  for (const name of Object.keys(values)) {
    if (!declaredNames.has(name)) delete values[name];
  }
  const layerPlan = deriveStandardLayerPlan(parameters);
  const projected = projectStandardSurfacePasses({
    surfaceModule: DEFAULT_STANDARD_SURFACE_MODULE,
    ...forwardRenderState === void 0 ? {} : { renderState: forwardRenderState },
    ...opts.castShadow === void 0 ? {} : { castShadow: opts.castShadow },
    ...opts.queue === void 0 ? {} : { queue: opts.queue },
    layerPlan
  });
  const passes = transmission > 0 ? projected.filter((entry) => entry.name !== "deferred") : projected;
  return {
    kind: "material",
    colorSpace: "linear",
    passes,
    parameters,
    values
  };
}
function standardCustom(opts) {
  const layerPlan = deriveStandardLayerPlan(
    opts.parameters.filter((parameter) => parameter.optional !== true)
  );
  return {
    kind: "material",
    ...opts.colorSpace === void 0 || opts.colorSpace === "srgb" ? {} : { colorSpace: opts.colorSpace },
    passes: projectStandardSurfacePasses({
      surfaceModule: opts.surfaceModule,
      values: opts.values,
      ...opts.renderState === void 0 ? {} : { renderState: opts.renderState },
      ...opts.castShadow === void 0 ? {} : { castShadow: opts.castShadow },
      ...opts.queue === void 0 ? {} : { queue: opts.queue },
      layerPlan
    }),
    parameters: standardSurfaceParameters(opts.parameters),
    values: opts.values
  };
}
function standard(options) {
  return options.surfaceModule === void 0 ? standardDefault(options) : standardCustom(options);
}
var Materials = { unlit, standard, srgb };
var TRANSPARENT_SORT_CONFIG_KEY = "TransparentSortConfig";
var TRANSPARENT_SORT_MODE_LAYER_Z = 0;
var TRANSPARENT_SORT_MODE_LAYER_Y = 1;
var TRANSPARENT_SORT_MODE_LAYER_YZ = 2;
var TRANSPARENT_SORT_MODE_DISTANCE = 3;
var TransparentSort = Object.freeze({
  layerZ: TRANSPARENT_SORT_MODE_LAYER_Z,
  layerY: TRANSPARENT_SORT_MODE_LAYER_Y,
  layerYZ: TRANSPARENT_SORT_MODE_LAYER_YZ,
  distance: TRANSPARENT_SORT_MODE_DISTANCE,
  configure: setTransparentSortConfig
});
var DEFAULT_CONFIG = Object.freeze({
  mode: TRANSPARENT_SORT_MODE_LAYER_Z,
  yzAlpha: 1
});
var VALID_MODES = /* @__PURE__ */ new Set([
  TRANSPARENT_SORT_MODE_LAYER_Z,
  TRANSPARENT_SORT_MODE_LAYER_Y,
  TRANSPARENT_SORT_MODE_LAYER_YZ,
  TRANSPARENT_SORT_MODE_DISTANCE
]);
var EXPECTED_MODE = "mode \u2208 {0, 1, 2, 3}";
var HINT_MODE = "0=layer-z, 1=layer-y, 2=layer-yz, 3=distance";
function getTransparentSortConfig(world) {
  if ("resolveAsset" in world) return world.transparentSort;
  if (!world.hasResource(TRANSPARENT_SORT_CONFIG_KEY)) {
    return DEFAULT_CONFIG;
  }
  return world.getResource(TRANSPARENT_SORT_CONFIG_KEY);
}
function setTransparentSortConfig(world, cfg) {
  if (!VALID_MODES.has(cfg.mode)) {
    return err(
      new ResourceInvalidValueError(EXPECTED_MODE, HINT_MODE, {
        receivedMode: cfg.mode,
        receivedKey: TRANSPARENT_SORT_CONFIG_KEY
      })
    );
  }
  world.insertResource(TRANSPARENT_SORT_CONFIG_KEY, {
    mode: cfg.mode,
    yzAlpha: cfg.yzAlpha
  });
  return ok(void 0);
}

export { MaterialAuthoringContractError, MaterialTransmissionContractError, Materials, SPRITE_PREMULTIPLIED_ALPHA_BLEND, TRANSPARENT_SORT_MODE_DISTANCE, TRANSPARENT_SORT_MODE_LAYER_Y, TRANSPARENT_SORT_MODE_LAYER_YZ, TRANSPARENT_SORT_MODE_LAYER_Z, TransparentSort, getTransparentSortConfig, srgb };
