import { GlyphText, SpriteRegionOverride, SpriteInstances, selectActiveCameraIndex, getActiveCamera } from './chunk-X2KA6WHM.mjs';
import { RenderIntentInvalidError, DynamicResolutionRequiresTaaError, ShadowInvalidConfigError, VolumeDensityShapeMismatchError, VolumeInvalidBoundsError, VolumeInvalidParametersError, VolumeOwnerConflictError, MotionBlurValidationError, gpuDrivenShadowDrawKey, STANDARD_OUTPUT_TRANSFORM_FEATURE_ID, IES_SLICE_CAPACITY, COOKIE_SLICE_CAPACITY, SHADOW_ATLAS_DEFAULT_LAYERS, MaterialSkinAttrMissingError, isStandardPbrSkinMaterialShader, SkinMaterialMismatchError, validateInstanceTransforms, buildGpuDrivenDraws, deriveInstancesUnionBounds, worldEntityKey, gpuDrivenSourceDrawItemIndex, selectPasses, resolveRenderTargetMaterialSource, isCanonicalStandardPbrMaterialShader, BarrelDistortionInvalidParameterError, DynamicResolutionInvalidParameterError, COOKIE_SLICE_SIZE, EnvironmentSourceConflictError, FogCardinalityError, resolveMotionBlurParams, isStandardPbrMaterialShader, AtmosphereInvalidParameterError } from './chunk-OYW4NIWJ.mjs';
import { defineComponent, Entity, Time } from '../../ecs/dist/index.mjs';
import { R_MIN, err, ok, TextError, toShared, handleSlot, AssetError, ASSET_ERROR_HINTS, materialValuesToLinearRuntime, derive, unpackSlot, materialGuidText } from '../../types/dist/index.mjs';
import { TONEMAP_SHADER_MODE, standardTextureMask, DEFAULT_STANDARD_PBR_PARAM_SCHEMA, STANDARD_PIPELINE_PARAM_SCHEMA, DEFAULT_STANDARD_SURFACE_MODULE } from '../../shader/dist/index.mjs';
import { SpawnLightInvalidBoundsError, routeWorldError, SpriteInstancesMutuallyExclusiveWithInstancesError, SpriteInstancesRequiresSpriteShaderError, SpriteInstancesCountMismatchError, readRenderArrayView } from '../../ecs/dist/projection/index.mjs';
import { Transform, projectHierarchy, GlobalTransform, MorphWeights } from '../../scene/dist/index.mjs';
import { vec3, mat4, frustum, box3 } from '../../math/dist/index.mjs';
import { resolveAssetHandle, walkMaterialPassesOverSharedRefs, selectMaterialPassProgram, materialParametersToParamSchema as materialParametersToParamSchema$1 } from '../../assets-runtime/dist/index.mjs';
import { AssetGuid } from '../../pack/dist/guid.mjs';
import { RhiError } from '../../rhi/dist/index.mjs';
import { Skin, SkinInstancesCoexistForbiddenError, SkeletonResolveFailedError, JointCountMismatchError, JointEntityDanglingError } from '../../skinning/dist/index.mjs';
import { PROCEDURAL_FLOATS_PER_VERTEX } from '../../geometry/dist/index.mjs';
import { resetFontConcurrency, trackFontConcurrency, layoutGlyphText, conservativeCubeAabb, bakeGlyphMesh } from '../../graphics-extras/dist/index.mjs';

var Atmosphere = defineComponent("Atmosphere", {
  turbidity: { type: "f32", default: 2 },
  rayleigh: { type: "f32", default: 1 },
  mieCoefficient: { type: "f32", default: 5e-3 },
  mieDirectionalG: { type: "f32", default: 0.8 },
  sunAngularRadius: { type: "f32", default: 4675e-6 },
  /** Independent multiplier for the analytic circumsolar lobe. */
  circumsolarStrength: { type: "f32", default: 1 },
  /** Relative angular width of the analytic circumsolar lobe. */
  circumsolarWidth: { type: "f32", default: 1 }
});
var BarrelDistortion = defineComponent("BarrelDistortion", {
  strength: { type: "f32", default: 0 },
  centerX: { type: "f32", default: 0.5 },
  centerY: { type: "f32", default: 0.5 }
});
var DEFAULT_BARREL_DISTORTION = Object.freeze({
  strength: 0,
  centerX: 0.5,
  centerY: 0.5
});
function invalid(field, value, expected) {
  return new BarrelDistortionInvalidParameterError({ field, value, expected });
}
function validateBarrelDistortionParameters(input) {
  const value = input ?? {};
  const strength = value.strength ?? DEFAULT_BARREL_DISTORTION.strength;
  const centerX = value.centerX ?? DEFAULT_BARREL_DISTORTION.centerX;
  const centerY = value.centerY ?? DEFAULT_BARREL_DISTORTION.centerY;
  if (!Number.isFinite(strength) || strength < 0 || strength > 0.35) {
    return err(invalid("strength", strength, "finite and in [0, 0.35]"));
  }
  if (!Number.isFinite(centerX) || centerX < 0 || centerX > 1) {
    return err(invalid("centerX", centerX, "finite and in [0, 1]"));
  }
  if (!Number.isFinite(centerY) || centerY < 0 || centerY > 1) {
    return err(invalid("centerY", centerY, "finite and in [0, 1]"));
  }
  return ok(Object.freeze({ strength, centerX, centerY }));
}
var CAMERA_PROJECTION_PERSPECTIVE = 0;
var CAMERA_PROJECTION_ORTHOGRAPHIC = 1;
var CAMERA_EXPOSURE_MODE_MANUAL = 0;
var CAMERA_EXPOSURE_MODE_AUTO = 1;
var CAMERA_TEMPERATURE_MIN = 1e3;
var CAMERA_TEMPERATURE_MAX = 4e4;
var CAMERA_TINT_MIN = -1;
var CAMERA_TINT_MAX = 1;
var CameraError = class extends Error {
  code;
  expected;
  hint;
  detail;
  constructor(code, field, actual, expected, hint) {
    super(`${code}: ${field}=${String(actual)}; expected ${expected}`);
    this.name = "CameraError";
    this.code = code;
    this.expected = expected;
    this.hint = hint;
    this.detail = Object.freeze({ field, actual, expected });
  }
};
function actualValue(value) {
  if (typeof value === "number" || typeof value === "string") return value;
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}
function cameraError(code, field, actual, expected, hint) {
  return new CameraError(code, field, actualValue(actual), expected, hint);
}
function finitePositive(value) {
  return Number.isFinite(value) && value > 0;
}
function validateCameraExposure(exposure) {
  if (typeof exposure !== "object" || exposure === null) {
    throw cameraError(
      "camera-exposure-invalid",
      "value",
      exposure,
      "an object with kind manual or auto",
      "choose one member of the CameraExposure union"
    );
  }
  if (exposure.kind === "manual") {
    if (!finitePositive(exposure.multiplier)) {
      throw cameraError(
        "camera-exposure-invalid",
        "multiplier",
        exposure.multiplier,
        "a finite number greater than zero",
        "set Camera.exposure to a positive finite manual multiplier"
      );
    }
    return exposure;
  }
  if (exposure.kind === "auto") {
    const [min, max] = exposure.rangeEv;
    const [up, down] = exposure.rates;
    if (!finitePositive(exposure.fallback) || !Number.isFinite(exposure.compensationEv) || !Number.isFinite(min) || !Number.isFinite(max) || min > max || !Number.isFinite(up) || !Number.isFinite(down) || up < 0 || down < 0) {
      throw cameraError(
        "camera-exposure-invalid",
        "auto",
        JSON.stringify(exposure),
        "finite fallback/compensation, an ordered range, and non-negative rates",
        "inspect fallback, compensationEv, rangeEv, and rates before rebuilding the camera"
      );
    }
    return exposure;
  }
  throw cameraError(
    "camera-exposure-invalid",
    "kind",
    exposure.kind,
    "'manual' or 'auto'",
    "choose one member of the CameraExposure union"
  );
}
function validateCameraColorGrading(temperature, tint, colorLutStrength) {
  if (!Number.isFinite(temperature) || temperature < CAMERA_TEMPERATURE_MIN || temperature > CAMERA_TEMPERATURE_MAX) {
    throw cameraError(
      "camera-color-grading-invalid",
      "temperature",
      temperature,
      `a finite value in [${CAMERA_TEMPERATURE_MIN}, ${CAMERA_TEMPERATURE_MAX}]`,
      "set Camera.temperature to a supported Kelvin value"
    );
  }
  if (!Number.isFinite(tint) || tint < CAMERA_TINT_MIN || tint > CAMERA_TINT_MAX) {
    throw cameraError(
      "camera-color-grading-invalid",
      "tint",
      tint,
      `a finite value in [${CAMERA_TINT_MIN}, ${CAMERA_TINT_MAX}]`,
      "set Camera.tint to a normalized value between -1 and 1"
    );
  }
  if (!Number.isFinite(colorLutStrength) || colorLutStrength < 0 || colorLutStrength > 1) {
    throw cameraError(
      "camera-color-grading-invalid",
      "colorLutStrength",
      colorLutStrength,
      "a finite value in [0, 1]",
      "set Camera.colorLutStrength to zero to disable the LUT or a blend in [0, 1]"
    );
  }
}
function cameraProjectionFromF32(value) {
  return value === CAMERA_PROJECTION_ORTHOGRAPHIC ? "orthographic" : "perspective";
}
var TONEMAP_NONE = TONEMAP_SHADER_MODE.none;
var TONEMAP_REINHARD_EXTENDED = TONEMAP_SHADER_MODE.reinhardExtended;
var TONEMAP_REINHARD = TONEMAP_SHADER_MODE.reinhard;
var TONEMAP_LINEAR = TONEMAP_SHADER_MODE.linear;
var TONEMAP_CINEON = TONEMAP_SHADER_MODE.cineon;
var TONEMAP_ACES_FILMIC = TONEMAP_SHADER_MODE.acesFilmic;
var TONEMAP_AGX = TONEMAP_SHADER_MODE.agx;
var TONEMAP_NEUTRAL = TONEMAP_SHADER_MODE.neutral;
function tonemapFromF32(value) {
  switch (value) {
    case TONEMAP_REINHARD_EXTENDED:
      return "reinhard-extended";
    case TONEMAP_REINHARD:
      return "reinhard";
    case TONEMAP_LINEAR:
      return "linear";
    case TONEMAP_CINEON:
      return "cineon";
    case TONEMAP_ACES_FILMIC:
      return "aces-filmic";
    case TONEMAP_AGX:
      return "agx";
    case TONEMAP_NEUTRAL:
      return "neutral";
    default:
      return "none";
  }
}
function tonemapToU32(mode) {
  switch (mode) {
    case "reinhard-extended":
      return TONEMAP_REINHARD_EXTENDED;
    case "reinhard":
      return TONEMAP_REINHARD;
    case "linear":
      return TONEMAP_LINEAR;
    case "cineon":
      return TONEMAP_CINEON;
    case "aces-filmic":
      return TONEMAP_ACES_FILMIC;
    case "agx":
      return TONEMAP_AGX;
    case "neutral":
      return TONEMAP_NEUTRAL;
    case "none":
      return TONEMAP_NONE;
  }
  throw cameraError(
    "camera-tonemap-invalid",
    "tonemap",
    mode,
    "one of the closed Tonemap values",
    "select a supported Camera tonemap mode"
  );
}
var ANTIALIAS_NONE = 0;
var ANTIALIAS_FXAA = 1;
var ANTIALIAS_MSAA = 2;
var ANTIALIAS_TAA = 3;
function antialiasFromF32(value) {
  if (value === ANTIALIAS_NONE) return "none";
  if (value === ANTIALIAS_FXAA) return "fxaa";
  if (value === ANTIALIAS_MSAA) return "msaa";
  if (value === ANTIALIAS_TAA) return "taa";
  throw cameraError(
    "camera-antialias-invalid",
    "antialias",
    value,
    `${ANTIALIAS_NONE}, ${ANTIALIAS_FXAA}, ${ANTIALIAS_MSAA}, or ${ANTIALIAS_TAA}`,
    "select a supported Camera antialias mode"
  );
}
var BLOOM_DISABLED = 0;
var BLOOM_ENABLED = 1;
var CAMERA_BLOOM_INTENSITY_MIN = 0;
var CAMERA_BLOOM_INTENSITY_MAX = 8;
var CAMERA_BLOOM_THRESHOLD_MIN = 0;
var CAMERA_BLOOM_THRESHOLD_MAX = 65504;
var CAMERA_BLOOM_SOFT_KNEE_MIN = 0;
var CAMERA_BLOOM_SOFT_KNEE_MAX = 1;
var CAMERA_BLOOM_SCATTER_MIN = 0;
var CAMERA_BLOOM_SCATTER_MAX = 0.95;
function bloomEnabledFromF32(value) {
  if (value === BLOOM_DISABLED) return "off";
  if (value === BLOOM_ENABLED) return "on";
  throw cameraError(
    "camera-bloom-invalid",
    "bloom",
    value,
    `${BLOOM_DISABLED} or ${BLOOM_ENABLED}`,
    "select Camera bloom off or on"
  );
}
function validateBloomRange(field, value, min, max) {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw cameraError(
      "camera-bloom-invalid",
      field,
      value,
      `a finite value in [${min}, ${max}]`,
      `set Camera.${field} to a finite value in [${min}, ${max}]`
    );
  }
}
function validateCameraBloom(bloom, threshold, intensity, softKnee, scatter) {
  const enabled = bloomEnabledFromF32(bloom);
  validateBloomRange(
    "bloomThreshold",
    threshold,
    CAMERA_BLOOM_THRESHOLD_MIN,
    CAMERA_BLOOM_THRESHOLD_MAX
  );
  validateBloomRange(
    "bloomIntensity",
    intensity,
    CAMERA_BLOOM_INTENSITY_MIN,
    CAMERA_BLOOM_INTENSITY_MAX
  );
  validateBloomRange(
    "bloomSoftKnee",
    softKnee,
    CAMERA_BLOOM_SOFT_KNEE_MIN,
    CAMERA_BLOOM_SOFT_KNEE_MAX
  );
  validateBloomRange("bloomScatter", scatter, CAMERA_BLOOM_SCATTER_MIN, CAMERA_BLOOM_SCATTER_MAX);
  return enabled;
}
var Camera = defineComponent("Camera", {
  fov: { type: "f32" },
  aspect: { type: "f32" },
  near: { type: "f32" },
  far: { type: "f32" },
  projection: { type: "f32", default: 0 },
  left: { type: "f32", default: -1 },
  right: { type: "f32", default: 1 },
  bottom: { type: "f32", default: -1 },
  top: { type: "f32", default: 1 },
  tonemap: { type: "f32", default: 0 },
  exposure: { type: "f32", default: 1 },
  exposureMode: { type: "f32", default: CAMERA_EXPOSURE_MODE_MANUAL },
  compensationEv: { type: "f32", default: 0 },
  rangeEv: { type: "array<f32, 2>", default: new Float32Array([-8, 8]) },
  rates: { type: "array<f32, 2>", default: new Float32Array([3, 1]) },
  whitePoint: { type: "f32", default: 4 },
  temperature: { type: "f32", default: 6504 },
  tint: { type: "f32", default: 0 },
  colorLut: { type: "shared<TextureAsset>", default: 0 },
  colorLutStrength: { type: "f32", default: 0 },
  antialias: { type: "f32", default: 0 },
  historyVersion: { type: "u32", default: 0 },
  bloom: { type: "f32", default: 0 },
  bloomThreshold: { type: "f32", default: 1 },
  bloomIntensity: { type: "f32", default: 1 },
  bloomSoftKnee: { type: "f32", default: 0.5 },
  bloomScatter: { type: "f32", default: 0.7 },
  // M1 target camera role: zero means this camera is eligible for display;
  // non-zero shared targets are auxiliary producers whose views and receipt
  // promotion remain owned by Renderer.
  target: { type: "shared<RenderTarget>", simulationTransient: true },
  // feat-20260709 M3 / D-3: clear-color is one inline `array<f32,4>` column.
  // The earlier 4-scalar form (clearR/G/B/A) was chosen when this was believed
  // to be the only SoA-safe shape; the Transform (pos/quat/scale) and light
  // (direction/color) precedents disprove that -- an `array<f32,N>` IS an
  // inline stride-N SoA column, read on the hot path as `col[i*N+a]` with zero
  // allocation, so collapsing four scalars into one column removes three field
  // names a reader must track without changing the storage layout or read
  // pattern. The default `[0, 0, 0, 0]` is transparent black; explicit alpha
  // stays visible through the same public array field.
  clearColor: { type: "array<f32, 4>", default: new Float32Array([0, 0, 0, 0]) },
  // feat-20260617-host-engine-contract-and-video-cutscene / M3 / D-4: the
  // aspect-sync sidecar on the createApp(canvas) path writes
  // canvas.width / canvas.height into `aspect` every frame when this flag is
  // true. Reuses the existing `bool` column tier (AnimationPlayer.paused /
  // AudioSource.playing precedent) -- zero ECS infrastructure change. Default
  // true so demos that never touch aspect track the canvas automatically
  // (charter P1 default-is-correct); set false for render-to-texture /
  // split-screen cameras that drive aspect themselves. Read it via
  // world.get (readRow narrows bool -> JS boolean); the query-bundle path
  // returns a raw 0/1 number (the `!== 0` always-true trap).
  autoAspect: { type: "bool", default: true }
});
function cameraExposureFromColumns(input) {
  if (input.exposureMode === CAMERA_EXPOSURE_MODE_MANUAL) {
    return validateCameraExposure({ kind: "manual", multiplier: input.exposure });
  }
  if (input.exposureMode === CAMERA_EXPOSURE_MODE_AUTO) {
    return validateCameraExposure({
      kind: "auto",
      fallback: input.exposure,
      compensationEv: input.compensationEv,
      rangeEv: [input.rangeEv[0] ?? -8, input.rangeEv[1] ?? 8],
      rates: [input.rates[0] ?? 3, input.rates[1] ?? 1]
    });
  }
  throw cameraError(
    "camera-exposure-mode-invalid",
    "exposureMode",
    input.exposureMode,
    `${CAMERA_EXPOSURE_MODE_MANUAL} or ${CAMERA_EXPOSURE_MODE_AUTO}`,
    "set Camera.exposureMode to the manual or auto encoding"
  );
}
function cameraExposureColumns(exposure) {
  const checked = validateCameraExposure(exposure);
  if (checked.kind === "manual") {
    return {
      exposureMode: CAMERA_EXPOSURE_MODE_MANUAL,
      exposure: checked.multiplier,
      compensationEv: 0,
      rangeEv: new Float32Array([-8, 8]),
      rates: new Float32Array([3, 1])
    };
  }
  return {
    exposureMode: CAMERA_EXPOSURE_MODE_AUTO,
    exposure: checked.fallback,
    compensationEv: checked.compensationEv,
    rangeEv: new Float32Array(checked.rangeEv),
    rates: new Float32Array(checked.rates)
  };
}
function cameraColorGradingColumns(opts) {
  const exposure = opts.exposure ?? { kind: "manual", multiplier: 1 };
  const temperature = opts.temperature ?? 6504;
  const tint = opts.tint ?? 0;
  const colorLutStrength = opts.colorLutStrength ?? 0;
  validateCameraColorGrading(temperature, tint, colorLutStrength);
  return {
    ...cameraExposureColumns(exposure),
    temperature,
    tint,
    colorLut: opts.colorLut ?? 0,
    colorLutStrength
  };
}
function cameraPodFromDefaults() {
  const base = {};
  for (const [key, field] of Object.entries(Camera.fields)) {
    if ("default" in field && field.default !== void 0) {
      base[key] = field.default;
    }
  }
  return base;
}
function perspective(opts) {
  return {
    // cameraPodFromDefaults() reads autoAspect's schema default (true), so an
    // omitted opts.autoAspect lands the default-correct value; an explicit
    // false overrides it below (D-4: factory one-step opt-out, charter P1).
    ...cameraPodFromDefaults(),
    fov: opts.fov,
    aspect: opts.aspect,
    near: opts.near ?? 0.1,
    far: opts.far ?? 100,
    projection: CAMERA_PROJECTION_PERSPECTIVE,
    ...opts.autoAspect !== void 0 ? { autoAspect: opts.autoAspect } : {},
    ...cameraColorGradingColumns(opts)
  };
}
function orthographic(opts) {
  return {
    ...cameraPodFromDefaults(),
    fov: 0,
    aspect: 1,
    near: opts.near ?? 0.1,
    far: opts.far ?? 100,
    projection: CAMERA_PROJECTION_ORTHOGRAPHIC,
    left: opts.left,
    right: opts.right,
    bottom: opts.bottom,
    top: opts.top,
    ...cameraColorGradingColumns(opts)
  };
}
var CloudQualityValue = Object.freeze({
  low: 0,
  medium: 1,
  high: 2
});
var CloudLayer = defineComponent("CloudLayer", {
  /** Stable integer seed for the periodic 3D density field. */
  seed: { type: "u32", default: 1337 },
  /** World-space lower edge of the layer, in metres. */
  baseHeight: { type: "f32", default: 120 },
  /** World-space thickness of the layer, in metres. */
  thickness: { type: "f32", default: 80 },
  /** Horizontal noise scale, in cycles per metre. */
  scale: { type: "f32", default: 4e-3 },
  /** Coverage threshold in [0, 1]. */
  coverage: { type: "f32", default: 0.48 },
  /** Extinction multiplier in inverse metres. */
  density: { type: "f32", default: 1 },
  /** World-space wind velocity in metres per second. */
  wind: { type: "array<f32, 3>", default: new Float32Array([8, 0, 2]) },
  /** Quality controls cache resolution and bounded ray steps. */
  quality: { type: "f32", default: CloudQualityValue.medium },
  /** Maximum world-space distance represented by the light-space shadow map. */
  shadowRange: { type: "f32", default: 512 }
});
function cloudQualityFromF32(value) {
  if (value === CloudQualityValue.low) return "low";
  if (value === CloudQualityValue.medium) return "medium";
  if (value === CloudQualityValue.high) return "high";
  return void 0;
}
var CUBE_CAMERA_UPDATE_ONCE = 0;
var CUBE_CAMERA_UPDATE_ON_DEMAND = 1;
var CUBE_CAMERA_UPDATE_CONTINUOUS = 2;
var CUBE_CAMERA_FACE_ORDER = ["+X", "-X", "+Y", "-Y", "+Z", "-Z"];
function cubeCameraUpdateIntentFromF32(value) {
  switch (value) {
    case CUBE_CAMERA_UPDATE_ONCE:
      return "once";
    case CUBE_CAMERA_UPDATE_ON_DEMAND:
      return "on-demand";
    case CUBE_CAMERA_UPDATE_CONTINUOUS:
      return "continuous";
    default:
      throw new RenderIntentInvalidError("CubeCamera", value);
  }
}
function cubeCameraUpdateIntentToF32(intent) {
  switch (intent) {
    case "once":
      return CUBE_CAMERA_UPDATE_ONCE;
    case "on-demand":
      return CUBE_CAMERA_UPDATE_ON_DEMAND;
    case "continuous":
      return CUBE_CAMERA_UPDATE_CONTINUOUS;
  }
}
var CubeCamera = defineComponent("CubeCamera", {
  target: { type: "shared<RenderTarget>", simulationTransient: true },
  near: { type: "f32", default: 0.1 },
  far: { type: "f32", default: 100 },
  updateIntent: { type: "f32", default: CUBE_CAMERA_UPDATE_ONCE },
  requestVersion: { type: "u32", default: 0 },
  faceBudget: { type: "u32", default: 1 }
});
var DepthOfFieldQualityValue = Object.freeze({
  low: 0,
  medium: 1,
  high: 2
});
var DepthOfFieldSideValue = Object.freeze({
  both: 0,
  near: 1,
  far: 2
});
var DepthOfField = defineComponent("DepthOfField", {
  focusDistance: { type: "f32", default: 8 },
  fStop: { type: "f32", default: 2.8 },
  sensorHeight: { type: "f32", default: 0.024 },
  maxRadiusPixels: { type: "f32", default: 16 },
  quality: { type: "f32", default: DepthOfFieldQualityValue.medium },
  blurSide: { type: "f32", default: DepthOfFieldSideValue.both }
});
function depthOfFieldQualityFromF32(value) {
  if (value === DepthOfFieldQualityValue.low) return "low";
  if (value === DepthOfFieldQualityValue.medium) return "medium";
  if (value === DepthOfFieldQualityValue.high) return "high";
  return void 0;
}
function depthOfFieldSideFromF32(value) {
  if (value === DepthOfFieldSideValue.both) return "both";
  if (value === DepthOfFieldSideValue.near) return "near";
  if (value === DepthOfFieldSideValue.far) return "far";
  return void 0;
}

// src/components/directional-shadow-filter.ts
var DirectionalShadowFilterValue = Object.freeze({
  pcf1: 1,
  pcf3: 2,
  pcf5: 3,
  pcssMedium: 4,
  pcssHigh: 5
});
function directionalShadowQualityFromF32(value, angularRadiusRadians, maxPenumbraTexels) {
  switch (value) {
    case DirectionalShadowFilterValue.pcf1:
      return { kind: "pcf", kernel: 1 };
    case DirectionalShadowFilterValue.pcf3:
      return { kind: "pcf", kernel: 3 };
    case DirectionalShadowFilterValue.pcf5:
      return { kind: "pcf", kernel: 5 };
    case DirectionalShadowFilterValue.pcssMedium:
      return {
        kind: "pcss",
        preset: "medium",
        angularRadiusRadians,
        maxPenumbraTexels
      };
    case DirectionalShadowFilterValue.pcssHigh:
      return {
        kind: "pcss",
        preset: "high",
        angularRadiusRadians,
        maxPenumbraTexels
      };
    default:
      return void 0;
  }
}
var DirectionalLight = defineComponent("DirectionalLight", {
  // direction is the ONLY field with no default (D-5): omitting it lands the
  // array layer-3 all-zero [0,0,0], which the renderer owner rejects -- there is no
  // universal default direction, so "default is illegal" forces an explicit
  // non-zero value. color carries an explicit layer-2 default [1,1,1] (white);
  // the array layer-3 fallback is all-zero, so the default MUST be explicit.
  direction: { type: "array<f32, 3>" },
  color: { type: "array<f32, 3>", default: new Float32Array([1, 1, 1]) },
  intensity: { type: "f32", default: 1 },
  // Shadow opt-out gate: defaults to true so zero-config spawns get shadows.
  castShadow: { type: "bool", default: true },
  // 9 shadow fields migrated from DirectionalLightShadow (feat-20260621 M1).
  cascadeCount: { type: "f32", default: 4 },
  splitLambda: { type: "f32", default: 0.75 },
  cascadeBlend: { type: "f32", default: 0.2 },
  mapSize: { type: "f32", default: 2048 },
  depthBias: { type: "f32", default: 1e-5 },
  normalBias: { type: "f32", default: 0.05 },
  // Sole shadow coverage knob (feat replaces nearPlane/farPlane). The PSSM
  // near end derives from the active camera near; shadowDistance is the far
  // reach. Default 200 world units (matches UE-style "dynamic shadow
  // distance"; the old farPlane default was 50).
  shadowDistance: { type: "f32", default: 200 },
  shadowFilter: {
    type: "enum",
    default: DirectionalShadowFilterValue.pcf3,
    labels: DirectionalShadowFilterValue
  },
  shadowAngularRadius: { type: "f32", default: 465e-5 },
  maxPenumbraTexels: { type: "f32", default: 32 }
});
var DynamicResolution = defineComponent("DynamicResolution", {
  targetGpuMs: { type: "f32", default: 16.67 },
  minScale: { type: "f32", default: 0.67 },
  maxScale: { type: "f32", default: 1 }
});
var DEFAULT_DYNAMIC_RESOLUTION = Object.freeze({
  targetGpuMs: 16.67,
  minScale: 0.67,
  maxScale: 1
});
function invalid2(field, value, expected) {
  return new DynamicResolutionInvalidParameterError({ field, value, expected });
}
function validateDynamicResolutionParameters(input) {
  const value = input ?? {};
  const targetGpuMs = value.targetGpuMs ?? DEFAULT_DYNAMIC_RESOLUTION.targetGpuMs;
  const minScale = value.minScale ?? DEFAULT_DYNAMIC_RESOLUTION.minScale;
  const maxScale = value.maxScale ?? DEFAULT_DYNAMIC_RESOLUTION.maxScale;
  if (!Number.isFinite(targetGpuMs) || targetGpuMs <= 0) {
    return err(invalid2("targetGpuMs", targetGpuMs, "finite and greater than 0"));
  }
  if (!Number.isFinite(minScale) || minScale < 0.5 || minScale > 1) {
    return err(invalid2("minScale", minScale, "finite and in [0.5, 1.0]"));
  }
  if (!Number.isFinite(maxScale) || maxScale < 0.5 || maxScale > 1) {
    return err(invalid2("maxScale", maxScale, "finite and in [0.5, 1.0]"));
  }
  if (minScale > maxScale) {
    return err(invalid2("minScale", minScale, "less than or equal to maxScale"));
  }
  return ok(Object.freeze({ targetGpuMs, minScale, maxScale }));
}
function validateDynamicResolutionCamera(input, antialias) {
  if (input === void 0) return ok(void 0);
  const parameters = validateDynamicResolutionParameters(input);
  if (!parameters.ok) return parameters;
  if (antialias !== "taa") {
    return err(new DynamicResolutionRequiresTaaError({ antialias }));
  }
  return parameters;
}
var Fog = defineComponent("Fog", {
  color: { type: "array<f32, 3>", default: new Float32Array([0.5, 0.5, 0.5]) },
  density: { type: "f32", default: 0.01 },
  heightFalloff: { type: "f32", default: 0 },
  maxOpacity: { type: "f32", default: 1 }
});
var Instances = defineComponent("Instances", {
  transforms: { type: "array<f32>" }
});
var Layer = defineComponent("Layer", {
  value: { type: "i32", default: 0 }
});

// src/components/light-helpers.ts
var RANGE_ZERO_FALLBACK_INV_R2 = 1e8;
var DEG_TO_RAD = Math.PI / 180;
var PCSS_RADIUS_MIN = 1e-4;
var PCSS_RADIUS_MAX = 0.05;
var PCSS_PENUMBRA_MIN = 1;
var PCSS_PENUMBRA_MAX = 64;
function degToCos(deg) {
  return Math.cos(deg * DEG_TO_RAD);
}
function computeInvRangeSquared(range) {
  if (range === Number.POSITIVE_INFINITY) return 0;
  if (range === 0) return RANGE_ZERO_FALLBACK_INV_R2;
  return 1 / (range * range);
}
function validateDirection(componentName, direction) {
  const dir = direction;
  if (dir === void 0 || (dir[0] ?? 0) === 0 && (dir[1] ?? 0) === 0 && (dir[2] ?? 0) === 0) {
    return new SpawnLightInvalidBoundsError(
      componentName,
      "direction",
      dir === void 0 ? [0, 0, 0] : [dir[0] ?? 0, dir[1] ?? 0, dir[2] ?? 0]
    );
  }
  return null;
}
function validateDirectionalLightData(data) {
  const directionError = validateDirection(
    "DirectionalLight",
    data.direction
  );
  if (directionError !== null) return err(directionError);
  if (data.castShadow === false) return ok(void 0);
  const mapSize = data.mapSize ?? 2048;
  if (mapSize < 1) {
    return err(new ShadowInvalidConfigError("mapSize", mapSize, 1));
  }
  const cascadeCount = data.cascadeCount ?? 4;
  if (cascadeCount < 1 || cascadeCount > 4 || !Number.isInteger(cascadeCount)) {
    return err(new ShadowInvalidConfigError("cascadeCount", cascadeCount, 1, 4));
  }
  const splitLambda = data.splitLambda ?? 0.75;
  if (splitLambda < 0 || splitLambda > 1) {
    return err(new ShadowInvalidConfigError("splitLambda", splitLambda, 0, 1));
  }
  const cascadeBlend = data.cascadeBlend ?? 0.2;
  if (cascadeBlend < 0 || cascadeBlend > 0.5) {
    return err(new ShadowInvalidConfigError("cascadeBlend", cascadeBlend, 0, 0.5));
  }
  const shadowDistance = data.shadowDistance ?? 200;
  if (shadowDistance <= 0) {
    return err(new ShadowInvalidConfigError("shadowDistance", shadowDistance, 0, ">"));
  }
  const shadowFilter = data.shadowFilter ?? DirectionalShadowFilterValue.pcf3;
  const allowedFilters = Object.values(DirectionalShadowFilterValue);
  if (!Number.isFinite(shadowFilter) || !allowedFilters.includes(shadowFilter)) {
    return err(
      new ShadowInvalidConfigError(
        "shadowFilter",
        shadowFilter,
        { kind: "allowed-values", values: allowedFilters },
        void 0,
        "one of [pcf1, pcf3, pcf5, pcssMedium, pcssHigh]"
      )
    );
  }
  if (shadowFilter === DirectionalShadowFilterValue.pcssMedium || shadowFilter === DirectionalShadowFilterValue.pcssHigh) {
    const shadowAngularRadius = data.shadowAngularRadius ?? 465e-5;
    if (!Number.isFinite(shadowAngularRadius)) {
      return err(
        new ShadowInvalidConfigError("shadowAngularRadius", shadowAngularRadius, {
          kind: "range",
          min: PCSS_RADIUS_MIN,
          max: PCSS_RADIUS_MAX
        })
      );
    }
    if (shadowAngularRadius < Math.fround(PCSS_RADIUS_MIN) || shadowAngularRadius > Math.fround(PCSS_RADIUS_MAX)) {
      return err(
        new ShadowInvalidConfigError("shadowAngularRadius", shadowAngularRadius, {
          kind: "range",
          min: PCSS_RADIUS_MIN,
          max: PCSS_RADIUS_MAX
        })
      );
    }
    const maxPenumbraTexels = data.maxPenumbraTexels ?? 32;
    if (!Number.isFinite(maxPenumbraTexels) || !Number.isInteger(maxPenumbraTexels) || maxPenumbraTexels < PCSS_PENUMBRA_MIN || maxPenumbraTexels > PCSS_PENUMBRA_MAX) {
      return err(
        new ShadowInvalidConfigError(
          "maxPenumbraTexels",
          maxPenumbraTexels,
          { kind: "range", min: PCSS_PENUMBRA_MIN, max: PCSS_PENUMBRA_MAX },
          void 0,
          "a finite integer in [1, 64]"
        )
      );
    }
  }
  return ok(void 0);
}
function validateSpotLightData(data) {
  const directionError = validateDirection(
    "SpotLight",
    data.direction
  );
  if (directionError !== null) return err(directionError);
  if (data.castShadow === false) return ok(void 0);
  const range = data.range ?? 10;
  if (typeof range !== "number" || Number.isNaN(range) || range < 0) {
    return err(new SpawnLightInvalidBoundsError("SpotLight", "range", range));
  }
  const innerConeDeg = data.innerConeDeg ?? 0;
  const outerConeDeg = data.outerConeDeg ?? 45;
  if (outerConeDeg > 90) {
    return err(new SpawnLightInvalidBoundsError("SpotLight", "outerNinety", outerConeDeg));
  }
  if (outerConeDeg <= innerConeDeg) {
    return err(new SpawnLightInvalidBoundsError("SpotLight", "innerOuter", outerConeDeg));
  }
  const mapSize = data.mapSize ?? 2048;
  if (mapSize < 1) return err(new ShadowInvalidConfigError("mapSize", mapSize, 1));
  const nearPlane = data.nearPlane;
  const farPlane = data.farPlane;
  if (nearPlane !== void 0 && farPlane !== void 0 && farPlane <= nearPlane) {
    return err(new ShadowInvalidConfigError("farPlane", farPlane, nearPlane));
  }
  const pcfKernelSize = data.pcfKernelSize ?? 3;
  if (pcfKernelSize < 1 || pcfKernelSize % 2 === 0) {
    return err(
      new ShadowInvalidConfigError(
        "pcfKernelSize",
        pcfKernelSize,
        { kind: "lower-bound", operator: ">=", value: 1 },
        void 0,
        "an odd integer >= 1"
      )
    );
  }
  const shadowIntensity = data.shadowIntensity ?? 1;
  if (!Number.isFinite(shadowIntensity) || shadowIntensity < 0 || shadowIntensity > 1) {
    return err(new ShadowInvalidConfigError("shadowIntensity", shadowIntensity, 0, 1));
  }
  return ok(void 0);
}
function validatePointLightData(data) {
  const range = data.range ?? 10;
  if (typeof range !== "number" || Number.isNaN(range) || range < 0) {
    return err(new SpawnLightInvalidBoundsError("PointLight", "range", range));
  }
  return ok(void 0);
}
function validatePointLightShadowData(data) {
  const mapSize = data.mapSize ?? 512;
  if (mapSize < 1) return err(new ShadowInvalidConfigError("mapSize", mapSize, 1));
  const nearPlane = data.nearPlane ?? 0.1;
  const farPlane = data.farPlane ?? 25;
  if (farPlane <= nearPlane) {
    return err(new ShadowInvalidConfigError("farPlane", farPlane, nearPlane));
  }
  const pcfKernelSize = data.pcfKernelSize ?? 3;
  if (pcfKernelSize < 1 || pcfKernelSize % 2 === 0) {
    return err(
      new ShadowInvalidConfigError(
        "pcfKernelSize",
        pcfKernelSize,
        { kind: "lower-bound", operator: ">=", value: 1 },
        void 0,
        "an odd integer >= 1"
      )
    );
  }
  return ok(void 0);
}
function validateRectAreaLightData(data) {
  const intensity = data.intensity ?? 1;
  if (typeof intensity !== "number" || !Number.isFinite(intensity) || intensity < 0) {
    return err(new SpawnLightInvalidBoundsError("RectAreaLight", "intensity", intensity));
  }
  const color = data.color ?? [1, 1, 1];
  if (color.length !== 3 || Array.from(color).some(
    (value) => typeof value !== "number" || !Number.isFinite(value) || value < 0
  )) {
    return err(new SpawnLightInvalidBoundsError("RectAreaLight", "color", Array.from(color)));
  }
  for (const field of ["width", "height", "range"]) {
    const value = data[field] ?? (field === "range" ? 10 : 1);
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
      return err(new SpawnLightInvalidBoundsError("RectAreaLight", field, value));
    }
  }
  return ok(void 0);
}
function validateLightProbeData(data) {
  const irradiance = data.irradiance;
  if (irradiance === void 0 || irradiance.length !== 27 || Array.from(irradiance).some((value) => typeof value !== "number" || !Number.isFinite(value))) {
    return err(
      new SpawnLightInvalidBoundsError(
        "LightProbe",
        "irradiance",
        irradiance === void 0 ? [] : Array.from(irradiance)
      )
    );
  }
  const radius = data.radius ?? R_MIN;
  if (typeof radius !== "number" || !Number.isFinite(radius) || radius < R_MIN) {
    return err(new SpawnLightInvalidBoundsError("LightProbe", "radius", radius));
  }
  return ok(void 0);
}
var LightProbe = defineComponent("LightProbe", {
  irradiance: { type: "array<f32, 27>" },
  radius: { type: "f32", default: R_MIN }
});
var Lines = defineComponent(
  "Lines",
  {
    widthPx: { type: "f32", default: 1 }
  },
  {
    meta: {
      quickStart: "Attach Lines to render line-list MeshAsset pairs in screen pixels.",
      diagnostics: "Inspect widthPx at the points-lines admission boundary.",
      recovery: "Use points-lines-invalid-style for non-finite or non-positive widthPx values.",
      boundaries: "Lines owns raster width only; MeshFilter and MeshRenderer own geometry and material."
    }
  }
);
var MeshFilter = defineComponent("MeshFilter", {
  assetHandle: { type: "shared<MeshAsset>" }
});
var MeshRenderer = defineComponent("MeshRenderer", {
  materials: { type: "array<shared<MaterialAsset>>", default: [] }
});
var MotionBlur = defineComponent("MotionBlur", {
  shutterAngle: { type: "f32", default: 180 },
  maxRadiusPixels: { type: "f32", default: 32 },
  sampleCount: { type: "f32", default: 8 },
  targetFps: { type: "f32", default: 60 }
});
var PointLight = defineComponent("PointLight", {
  // color carries an explicit layer-2 default [1,1,1] (white); the array
  // layer-3 fallback is all-zero, so the default MUST be explicit (D-5).
  color: { type: "array<f32, 3>", default: new Float32Array([1, 1, 1]) },
  intensity: { type: "f32", default: 1 },
  range: { type: "f32", default: 10 }
});
var PointLightShadow = defineComponent("PointLightShadow", {
  mapSize: { type: "f32", default: 512 },
  depthBias: { type: "f32", default: 5e-3 },
  normalBias: { type: "f32", default: 0.05 },
  nearPlane: { type: "f32", default: 0.1 },
  farPlane: { type: "f32", default: 25 },
  pcfKernelSize: { type: "f32", default: 3 }
});
var PointShapeValue = Object.freeze({
  square: 0,
  circle: 1
});
function pointShapeFromU32(value) {
  switch (value) {
    case PointShapeValue.square:
      return "square";
    case PointShapeValue.circle:
      return "circle";
    default:
      return void 0;
  }
}
var Points = defineComponent(
  "Points",
  {
    sizePx: { type: "f32", default: 4 },
    shape: { type: "enum", default: PointShapeValue.square, labels: PointShapeValue }
  },
  {
    meta: {
      quickStart: "Attach Points to render point-list MeshAsset vertices in screen pixels.",
      diagnostics: "Inspect sizePx and decode shape with pointShapeFromU32.",
      recovery: "Use points-lines-invalid-style for non-finite or non-positive sizePx values.",
      boundaries: "Points owns raster size and shape only; MeshFilter and MeshRenderer own geometry and material."
    }
  }
);
var schema = {
  shader: "string",
  data: "buffer"
};
var PostProcessParams = defineComponent("PostProcessParams", schema);
var RectAreaLight = defineComponent("RectAreaLight", {
  color: { type: "array<f32, 3>", default: new Float32Array([1, 1, 1]) },
  intensity: { type: "f32", default: 1 },
  width: { type: "f32", default: 1 },
  height: { type: "f32", default: 1 },
  range: { type: "f32", default: 10 }
});
var REFLECTION_PROBE_UPDATE_ONCE = 0;
var REFLECTION_PROBE_UPDATE_ON_CHANGE = 1;
var REFLECTION_PROBE_UPDATE_CONTINUOUS = 2;
function reflectionProbeUpdateIntentFromF32(value) {
  switch (value) {
    case REFLECTION_PROBE_UPDATE_ONCE:
      return "once";
    case REFLECTION_PROBE_UPDATE_ON_CHANGE:
      return "on-change";
    case REFLECTION_PROBE_UPDATE_CONTINUOUS:
      return "continuous";
    default:
      throw new RenderIntentInvalidError("ReflectionProbe", value);
  }
}
function reflectionProbeUpdateIntentToF32(intent) {
  switch (intent) {
    case "once":
      return REFLECTION_PROBE_UPDATE_ONCE;
    case "on-change":
      return REFLECTION_PROBE_UPDATE_ON_CHANGE;
    case "continuous":
      return REFLECTION_PROBE_UPDATE_CONTINUOUS;
  }
}
var ReflectionProbe = defineComponent("ReflectionProbe", {
  halfExtents: { type: "array<f32, 3>", default: new Float32Array([1, 1, 1]) },
  priority: { type: "f32", default: 0 },
  boxProjection: { type: "bool", default: false },
  intensity: { type: "f32", default: 1 },
  resolution: { type: "u32", default: 256 },
  updateIntent: { type: "f32", default: REFLECTION_PROBE_UPDATE_ONCE },
  invalidationVersion: { type: "u32", default: 0 }
});
var SceneInstance = defineComponent(
  "SceneInstance",
  {
    source: { type: "shared<SceneAsset>" },
    mapping: { type: "array<entity>" },
    // The unique slot is the ECS storage seam for the instance's structured
    // runtime payload; keep the nested semantic visible to schema consumers.
    state: { type: "unique<SceneInstanceState>", shape: "nested" }
  },
  { transient: true }
);
var ScreenSpaceReflection = defineComponent("ScreenSpaceReflection", {
  maxDistance: { type: "f32", default: 40 },
  thickness: { type: "f32", default: 0.2 },
  maxRoughness: { type: "f32", default: 0.6 }
});
var SKYBOX_MODE_CUBEMAP = 0;
var SkyboxBackground = defineComponent("SkyboxBackground", {
  // The GPU skybox projection is render-owned presentation state; restore
  // keeps the portable mode/rotation controls and lets the owner re-resolve
  // the environment asset on the target world.
  equirect: { type: "shared<EquirectAsset>", simulationTransient: true },
  mode: { type: "f32", default: SKYBOX_MODE_CUBEMAP },
  rotation: { type: "array<f32, 4>", default: new Float32Array([0, 0, 0, 1]) }
});
var Skylight = defineComponent("Skylight", {
  // The GPU equirect-to-cubemap projection is render-owned presentation
  // state. Record/restore preserves the portable lighting controls while the
  // render owner resolves this asset again on the target world.
  equirect: { type: "shared<EquirectAsset>", simulationTransient: true },
  // color carries an explicit layer-2 default [1,1,1] (white); the array
  // layer-3 fallback is all-zero, so the default MUST be explicit (D-5).
  color: { type: "array<f32, 3>", default: new Float32Array([1, 1, 1]) },
  intensity: { type: "f32", default: 1 },
  rotation: { type: "array<f32, 4>", default: new Float32Array([0, 0, 0, 1]) }
});
var SortKey = defineComponent("SortKey", {
  value: { type: "f32", default: 0 }
});
var SpotLight = defineComponent("SpotLight", {
  // direction has no default (D-5): omitting it lands the array layer-3
  // all-zero, which validate() rejects. color carries an explicit layer-2
  // default [1,1,1] (white); the array layer-3 fallback is all-zero.
  direction: { type: "array<f32, 3>" },
  color: { type: "array<f32, 3>", default: new Float32Array([1, 1, 1]) },
  intensity: { type: "f32", default: 1 },
  range: { type: "f32", default: 10 },
  innerConeDeg: { type: "f32", default: 0 },
  outerConeDeg: { type: "f32", default: 45 },
  iesProfile: { type: "shared<IesProfileAsset>" },
  cookie: { type: "shared<TextureAsset>" },
  rollDeg: { type: "f32", default: 0 },
  // Shadow opt-out gate: defaults to true so zero-config spawns cast shadows.
  castShadow: { type: "bool", default: true },
  // 7 shadow fields aligned with the shared light shadow vocabulary.
  mapSize: { type: "f32", default: 2048 },
  depthBias: { type: "f32", default: 5e-3 },
  normalBias: { type: "f32", default: 0.05 },
  nearPlane: { type: "f32", default: 0.1 },
  farPlane: { type: "f32", default: 50 },
  pcfKernelSize: { type: "f32", default: 3 },
  // Three's SpotLight.shadow.intensity is the fraction of visibility applied
  // to a shadowed contribution. Keep it in the author-facing [0,1] domain;
  // extract/record transport this one fact to surface and volume consumers.
  shadowIntensity: { type: "f32", default: 1 },
  // Shared TextureAsset identity; publication and residency remain owned by
  // the existing asset and GPU resource owners.
  projector: { type: "shared<TextureAsset>", simulationTransient: true }
});
var VisibilityStateValue = Object.freeze({
  inherited: 0,
  hidden: 1,
  visible: 2
});
function visibilityStateFromU32(value) {
  switch (value) {
    case VisibilityStateValue.inherited:
      return "inherited";
    case VisibilityStateValue.hidden:
      return "hidden";
    case VisibilityStateValue.visible:
      return "visible";
    default:
      return void 0;
  }
}
var Visibility = defineComponent(
  "Visibility",
  {
    state: {
      type: "enum",
      default: VisibilityStateValue.inherited,
      labels: VisibilityStateValue
    }
  },
  {
    meta: {
      quickStart: "Attach Visibility to author render participation intent.",
      diagnostics: "Compare the ECS state with resolveVisibility and renderer.visibilityStats.",
      recovery: "Use structured ECS write errors and repair the owning scene relation.",
      boundaries: "Visibility does not own camera, picking, lifecycle, assets, or VFX shadow policy."
    }
  }
);
var COMPUTED_UV_BOUNDARY_EPSILON = Number.EPSILON * 16;
function freezeBarrelDistortionMapping(mapping) {
  const camera = mapping.camera;
  return Object.freeze({
    ...mapping,
    ...camera === void 0 ? {} : {
      camera: Object.freeze({
        projection: camera.projection,
        far: camera.far,
        viewMatrix: Object.freeze(Array.from(camera.viewMatrix)),
        projectionMatrix: Object.freeze(Array.from(camera.projectionMatrix))
      })
    }
  });
}
function attachBarrelDistortionCameraFrame(mapping, camera) {
  return freezeBarrelDistortionMapping({
    ...mapping,
    camera: {
      projection: camera.projection,
      far: camera.far,
      viewMatrix: camera.viewMatrix,
      projectionMatrix: camera.projectionMatrix
    }
  });
}
function invalidExtent(field, value) {
  return new BarrelDistortionInvalidParameterError({
    field,
    value,
    expected: "finite and greater than 0"
  });
}
function createBarrelDistortionMapping(width, height, input) {
  if (!Number.isFinite(width) || width <= 0) return err(invalidExtent("width", width));
  if (!Number.isFinite(height) || height <= 0) return err(invalidExtent("height", height));
  const parameters = validateBarrelDistortionParameters(input);
  if (!parameters.ok) return parameters;
  const { strength, centerX, centerY } = parameters.value;
  const aspect = width / height;
  const radiusSquared = 4 * (aspect * aspect * Math.max(centerX, 1 - centerX) ** 2 + Math.max(centerY, 1 - centerY) ** 2);
  return ok(
    Object.freeze({
      width,
      height,
      aspect,
      strength,
      centerX,
      centerY,
      radiusSquared
    })
  );
}
function displayToSceneScale(mapping, ux, uy) {
  const px = 2 * mapping.aspect * (ux - mapping.centerX);
  const py = 2 * (uy - mapping.centerY);
  const t = (px * px + py * py) / mapping.radiusSquared;
  return (1 - mapping.strength) / (1 - mapping.strength * t);
}
function normalizeComputedUv(out, x, y) {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return false;
  if (x < -COMPUTED_UV_BOUNDARY_EPSILON || x > 1 + COMPUTED_UV_BOUNDARY_EPSILON || y < -COMPUTED_UV_BOUNDARY_EPSILON || y > 1 + COMPUTED_UV_BOUNDARY_EPSILON) {
    return false;
  }
  out.x = Math.min(1, Math.max(0, x));
  out.y = Math.min(1, Math.max(0, y));
  return true;
}
function mapDisplayUvToSceneUv(out, mapping, ux, uy) {
  if (!Number.isFinite(ux) || !Number.isFinite(uy) || ux < 0 || ux > 1 || uy < 0 || uy > 1)
    return false;
  if (mapping.strength === 0) {
    out.x = ux;
    out.y = uy;
    return ux >= 0 && ux <= 1 && uy >= 0 && uy <= 1;
  }
  const scale = displayToSceneScale(mapping, ux, uy);
  return normalizeComputedUv(
    out,
    mapping.centerX + (ux - mapping.centerX) * scale,
    mapping.centerY + (uy - mapping.centerY) * scale
  );
}
function mapSceneUvToDisplayUv(out, mapping, ux, uy) {
  if (!Number.isFinite(ux) || !Number.isFinite(uy) || ux < 0 || ux > 1 || uy < 0 || uy > 1)
    return false;
  if (mapping.strength === 0) {
    out.x = ux;
    out.y = uy;
    return ux >= 0 && ux <= 1 && uy >= 0 && uy <= 1;
  }
  const px = 2 * mapping.aspect * (ux - mapping.centerX);
  const py = 2 * (uy - mapping.centerY);
  const sourceRadius = Math.hypot(px, py);
  if (sourceRadius === 0) {
    out.x = mapping.centerX;
    out.y = mapping.centerY;
    return true;
  }
  const discriminant = (1 - mapping.strength) ** 2 + 4 * mapping.strength * sourceRadius * sourceRadius / mapping.radiusSquared;
  const displayRadius = 2 * sourceRadius / (1 - mapping.strength + Math.sqrt(Math.max(0, discriminant)));
  const scale = displayRadius / sourceRadius;
  return normalizeComputedUv(
    out,
    mapping.centerX + (ux - mapping.centerX) * scale,
    mapping.centerY + (uy - mapping.centerY) * scale
  );
}
function validPixel(point) {
  return Number.isFinite(point.x) && Number.isFinite(point.y);
}
function mapDisplayToScene(out, mapping, displayX, displayY) {
  if (!Number.isFinite(displayX) || !Number.isFinite(displayY)) return false;
  if (displayX < 0 || displayX > mapping.width || displayY < 0 || displayY > mapping.height) {
    return false;
  }
  const scene = { x: 0, y: 0 };
  if (!mapDisplayUvToSceneUv(scene, mapping, displayX / mapping.width, displayY / mapping.height)) {
    return false;
  }
  out.x = scene.x * mapping.width;
  out.y = scene.y * mapping.height;
  return validPixel(out);
}
function mapSceneToDisplay(out, mapping, sceneX, sceneY) {
  if (!Number.isFinite(sceneX) || !Number.isFinite(sceneY)) return false;
  if (sceneX < 0 || sceneX > mapping.width || sceneY < 0 || sceneY > mapping.height) {
    return false;
  }
  const display = { x: 0, y: 0 };
  if (!mapSceneUvToDisplayUv(display, mapping, sceneX / mapping.width, sceneY / mapping.height)) {
    return false;
  }
  out.x = display.x * mapping.width;
  out.y = display.y * mapping.height;
  return validPixel(out);
}

// src/errors/cloud.ts
var CloudLayerInvalidParameterError = class extends Error {
  code = "cloud-layer-invalid-parameter";
  expected;
  hint;
  detail;
  constructor(field, value, expected) {
    super(`CloudLayer.${field} is invalid`);
    this.name = "CloudLayerInvalidParameterError";
    this.expected = `CloudLayer.${field} must be ${expected}`;
    this.hint = `set CloudLayer.${field} to ${expected}`;
    this.detail = { field, value, expected };
  }
};
var CloudLayerOwnerConflictError = class extends Error {
  code = "cloud-layer-owner-conflict";
  expected = "at most one CloudLayer owns a World frame";
  hint = "remove additional CloudLayer owners before extraction";
  detail;
  constructor(count) {
    super(`CloudLayer owner cardinality is ${count}`);
    this.name = "CloudLayerOwnerConflictError";
    this.detail = { count };
  }
};
var CloudLayerCacheInvalidError = class extends Error {
  code = "cloud-layer-cache-invalid";
  expected = "the density cache payload matches its reconstructible source";
  hint = "discard the derived cache and rebuild it from CloudLayer source facts";
  detail;
  constructor(sourceKey, reason) {
    super(`CloudLayer cache is invalid: ${reason}`);
    this.name = "CloudLayerCacheInvalidError";
    this.detail = { sourceKey, reason };
  }
};
var CloudLayerCapabilityMissingError = class extends Error {
  code = "cloud-layer-capability-missing";
  expected = "the selected backend exposes the capability required by the cloud lane";
  hint = "inspect the capability report, disable the cloud lane on this backend, or retry on a backend with the required capability";
  detail;
  constructor(capability) {
    super(`CloudLayer capability is unavailable: ${capability}`);
    this.name = "CloudLayerCapabilityMissingError";
    this.detail = { capability };
  }
};
var CloudLayerResourceFailureError = class extends Error {
  code = "cloud-layer-resource-failed";
  expected = "cloud resources are created, submitted and retired as one generation";
  hint = "keep the last-known-good cloud generation and retry after recovery";
  detail;
  constructor(detail) {
    super(`CloudLayer ${detail.stage} resource failed at generation ${detail.generation}`);
    this.name = "CloudLayerResourceFailureError";
    this.detail = detail;
  }
};
var CLOUD_QUALITY_PROFILES = Object.freeze({
  low: Object.freeze({
    // Preserve low-profile ray counts while keeping separate puffs from
    // collapsing into one bilinear cache smear.
    cacheResolution: 32,
    viewSteps: 40,
    shadowSteps: 12,
    historyWeight: 0.82,
    viewDistance: 1600
  }),
  medium: Object.freeze({
    cacheResolution: 40,
    viewSteps: 64,
    shadowSteps: 20,
    historyWeight: 0.9,
    viewDistance: 2400
  }),
  high: Object.freeze({
    cacheResolution: 64,
    viewSteps: 64,
    shadowSteps: 32,
    historyWeight: 0.94,
    viewDistance: 4e3
  })
});
function cloudShadowResolutionForQuality(qualityValue) {
  return CLOUD_QUALITY_PROFILES[qualityValue].cacheResolution * 4;
}
function cloudViewDistanceForQuality(qualityValue) {
  return CLOUD_QUALITY_PROFILES[qualityValue].viewDistance;
}
var CLOUD_EXTINCTION_COEFFICIENT = 0.03;
var DEFAULT_CLOUD_LAYER = Object.freeze({
  seed: 1337,
  baseHeight: 120,
  thickness: 80,
  scale: 4e-3,
  coverage: 0.48,
  density: 1,
  wind: Object.freeze([8, 0, 2]),
  quality: "medium",
  shadowRange: 512
});
function invalid3(field, value, expected) {
  return err(new CloudLayerInvalidParameterError(field, value, expected));
}
function finiteRange(field, value, min, max = Number.POSITIVE_INFINITY) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) {
    const expected = Number.isFinite(max) ? `finite and in [${min}, ${max}]` : `finite and >= ${min}`;
    return invalid3(field, value, expected);
  }
  return ok(value);
}
function quality(value) {
  if (typeof value === "string" && (value === "low" || value === "medium" || value === "high")) {
    return ok(value);
  }
  if (typeof value === "number") {
    const resolved = cloudQualityFromF32(value);
    if (resolved !== void 0) return ok(resolved);
  }
  return invalid3(
    "quality",
    value,
    `one of low, medium, high (codes ${CloudQualityValue.low}, ${CloudQualityValue.medium}, ${CloudQualityValue.high})`
  );
}
function wind(value) {
  if (value === void 0 || value === null || typeof value !== "object") {
    return invalid3("wind", value, "three finite world-space components");
  }
  const source = value;
  if (source.length !== 3) return invalid3("wind", value, "three finite world-space components");
  const result = [
    source[0] ?? Number.NaN,
    source[1] ?? Number.NaN,
    source[2] ?? Number.NaN
  ];
  if (result.some((entry) => !Number.isFinite(entry) || Math.abs(entry) > 1e3)) {
    return invalid3("wind", value, "three finite components in [-1000, 1000]");
  }
  return ok(Object.freeze(result));
}
function validateCloudLayer(input) {
  const value = input ?? {};
  const seed = value.seed ?? DEFAULT_CLOUD_LAYER.seed;
  if (typeof seed !== "number" || !Number.isInteger(seed) || seed < 0 || seed > 4294967295) {
    return invalid3("seed", seed, "an integer in [0, 4294967295]");
  }
  const baseHeight = finiteRange(
    "baseHeight",
    value.baseHeight ?? DEFAULT_CLOUD_LAYER.baseHeight,
    -1e5,
    1e6
  );
  if (!baseHeight.ok) return baseHeight;
  const thickness = finiteRange(
    "thickness",
    value.thickness ?? DEFAULT_CLOUD_LAYER.thickness,
    1e-3,
    1e6
  );
  if (!thickness.ok) return thickness;
  const scale = finiteRange("scale", value.scale ?? DEFAULT_CLOUD_LAYER.scale, 1e-6, 10);
  if (!scale.ok) return scale;
  const coverage = finiteRange("coverage", value.coverage ?? DEFAULT_CLOUD_LAYER.coverage, 0, 1);
  if (!coverage.ok) return coverage;
  const density = finiteRange("density", value.density ?? DEFAULT_CLOUD_LAYER.density, 0, 32);
  if (!density.ok) return density;
  const resolvedWind = wind(value.wind ?? DEFAULT_CLOUD_LAYER.wind);
  if (!resolvedWind.ok) return resolvedWind;
  const resolvedQuality = quality(value.quality ?? DEFAULT_CLOUD_LAYER.quality);
  if (!resolvedQuality.ok) return resolvedQuality;
  const shadowRange = finiteRange(
    "shadowRange",
    value.shadowRange ?? DEFAULT_CLOUD_LAYER.shadowRange,
    1e-3,
    1e7
  );
  if (!shadowRange.ok) return shadowRange;
  return ok(
    Object.freeze({
      seed,
      baseHeight: baseHeight.value,
      thickness: thickness.value,
      scale: scale.value,
      coverage: coverage.value,
      density: density.value,
      wind: resolvedWind.value,
      quality: resolvedQuality.value,
      shadowRange: shadowRange.value
    })
  );
}
function cloudLayerSourceKey(params) {
  return [
    "cloud-layer-v1",
    params.seed,
    params.baseHeight,
    params.thickness,
    params.scale,
    params.coverage,
    params.density,
    params.wind[0],
    params.wind[1],
    params.wind[2],
    params.quality,
    params.shadowRange
  ].join(":");
}
function cloudLayerFormationKey(params) {
  return [
    "cloud-formation-v5",
    params.seed,
    params.baseHeight,
    params.thickness,
    params.scale,
    params.quality
  ].join(":");
}
var MAX_VOLUMETRIC_FOG_OWNERS = 8;
var VolumetricFogSamplingValue = { noise: 0, density: 1 };
var VolumetricFog = defineComponent("VolumetricFog", {
  light: { type: "entity" },
  spotLight: { type: "entity" },
  density: { type: "shared<TextureAsset>", simulationTransient: true },
  boundsMin: { type: "array<f32, 3>" },
  boundsMax: { type: "array<f32, 3>" },
  extinction: { type: "array<f32, 3>" },
  albedo: { type: "array<f32, 3>" },
  emission: { type: "array<f32, 3>" },
  anisotropy: { type: "f32", default: 0 },
  maxDistance: { type: "f32", default: 100 },
  sampling: { type: "enum", labels: VolumetricFogSamplingValue, default: 0 }
});
function finiteVector(value) {
  return value.every(Number.isFinite);
}
function validBounds(bounds) {
  if (!finiteVector(bounds.min) || !finiteVector(bounds.max)) return false;
  return bounds.max.every((value, index) => value > (bounds.min[index] ?? value));
}
function validRange(value, min, max = Infinity) {
  return value.every((entry) => Number.isFinite(entry) && entry >= min && entry <= max);
}
function validateVolumetricFog(input) {
  if (input.density.shape.viewDimension !== "3d" || input.density.colorSpace === "srgb") {
    return err(
      new VolumeDensityShapeMismatchError(input.density.guid, input.density.shape.viewDimension)
    );
  }
  if (!validBounds(input.bounds)) return err(new VolumeInvalidBoundsError(input.bounds));
  if (!validRange(input.extinction, 0) || !validRange(input.albedo, 0, 1) || !validRange(input.emission, 0) || !Number.isFinite(input.anisotropy) || input.anisotropy <= -1 || input.anisotropy >= 1 || !Number.isFinite(input.maxDistance) || input.maxDistance <= 0 || input.sampling !== void 0 && input.sampling !== "noise" && input.sampling !== "density") {
    return err(new VolumeInvalidParametersError(input));
  }
  return ok(input);
}

// src/environment/signature.ts
function sorted(items) {
  return [...items].sort((left, right) => left.entityKey - right.entityKey);
}
function environmentSignature(input) {
  return JSON.stringify({
    environments: sorted(input.environments),
    fogs: sorted(input.fogs),
    suns: sorted(input.suns)
  });
}
function environmentOnlySignature(input) {
  return JSON.stringify({
    environments: sorted(input.environments),
    suns: sorted(input.suns)
  });
}
function fogOnlySignature(input) {
  return JSON.stringify({ fogs: sorted(input.fogs) });
}
function environmentFactSignatures(input) {
  return {
    environmentSignature: environmentOnlySignature(input),
    fogSignature: fogOnlySignature(input),
    signature: environmentSignature(input)
  };
}

// src/extract/environment.ts
var ATMOSPHERE_PARAMETER_RANGES = Object.freeze({
  turbidity: Object.freeze({ min: 1, max: 20 }),
  rayleigh: Object.freeze({ min: 0, max: Number.POSITIVE_INFINITY }),
  mieCoefficient: Object.freeze({ min: 0, max: Number.POSITIVE_INFINITY }),
  mieDirectionalG: Object.freeze({ min: 0, max: 0.999 }),
  sunAngularRadius: Object.freeze({ min: 0, max: Number.POSITIVE_INFINITY }),
  circumsolarStrength: Object.freeze({ min: 0, max: 4 }),
  circumsolarWidth: Object.freeze({ min: 0.25, max: 4 })
});
function validateFogParameters(candidate) {
  if (candidate.color.length !== 3) {
    return {
      field: "color",
      value: candidate.color.length,
      expected: "exactly three finite channels in [0, 1]"
    };
  }
  for (let index = 0; index < candidate.color.length; index += 1) {
    const value = candidate.color[index];
    if (value === void 0 || !Number.isFinite(value) || value < 0 || value > 1) {
      return {
        field: `color[${index}]`,
        value: value ?? Number.NaN,
        expected: "a finite number in [0, 1]"
      };
    }
  }
  if (!Number.isFinite(candidate.density) || candidate.density < 0) {
    return { field: "density", value: candidate.density, expected: "a finite number >= 0" };
  }
  if (!Number.isFinite(candidate.heightFalloff) || candidate.heightFalloff < 0) {
    return {
      field: "heightFalloff",
      value: candidate.heightFalloff,
      expected: "a finite number >= 0"
    };
  }
  if (!Number.isFinite(candidate.maxOpacity) || candidate.maxOpacity < 0 || candidate.maxOpacity > 1) {
    return {
      field: "maxOpacity",
      value: candidate.maxOpacity,
      expected: "a finite number in [0, 1]"
    };
  }
  return void 0;
}
function validateAtmosphereParameters(parameters) {
  for (const field of Object.keys(ATMOSPHERE_PARAMETER_RANGES)) {
    const value = parameters[field];
    const range = ATMOSPHERE_PARAMETER_RANGES[field];
    if (!Number.isFinite(value) || value < range.min || value > range.max) {
      return new AtmosphereInvalidParameterError(field, value, range);
    }
  }
  return void 0;
}

// src/environment/frame.ts
var SKYLIGHT_RECOVERY_FALLBACK = Object.freeze({
  kind: "skylight",
  active: false
});
var EnvironmentSelectionParameterError = class extends Error {
  code = "environment-selection-invalid";
  expected;
  hint;
  detail;
  constructor(field, value, expected) {
    super(`environment selection field ${field} is invalid`);
    this.name = "EnvironmentSelectionParameterError";
    this.expected = expected;
    this.hint = `set ${field} to a finite value satisfying ${expected}`;
    this.detail = { field, value };
  }
};
var SunCardinalityError = class extends Error {
  code = "sun-cardinality";
  expected = "atmosphere has exactly one sun owner";
  hint = "add exactly one DirectionalLight sun for the atmosphere owner";
  detail;
  constructor(value) {
    super(`atmosphere sun cardinality is ${value}`);
    this.name = "SunCardinalityError";
    this.detail = { field: "sun", value };
  }
};
function freezeCandidate(candidate) {
  return Object.freeze(candidate);
}
function freezeFog(candidate) {
  return Object.freeze({
    ...candidate,
    color: Object.freeze([...candidate.color])
  });
}
function selectEnvironment(input) {
  if (input.environments.length > 1) {
    return err(
      new EnvironmentSourceConflictError(
        [...input.environments].sort((left, right) => left.entityKey - right.entityKey).map(({ kind, entityKey, sourceKey }) => ({ kind, entityKey, sourceKey }))
      )
    );
  }
  if (input.fogs.length > 1) return err(new FogCardinalityError(input.fogs.length));
  const selectedFog = input.fogs[0];
  if (selectedFog !== void 0) {
    const issue = validateFogParameters(selectedFog);
    if (issue !== void 0) {
      return err(new EnvironmentSelectionParameterError(issue.field, issue.value, issue.expected));
    }
  }
  const selected = input.environments[0];
  if (selected?.kind === "atmosphere") {
    const invalid5 = validateAtmosphereParameters(selected.atmosphere);
    if (invalid5 !== void 0) return err(invalid5);
  }
  if (selected?.kind === "atmosphere" && input.suns.length !== 1) {
    return err(new SunCardinalityError(input.suns.length));
  }
  const source = selected === void 0 ? { kind: "none" } : selected.kind === "atmosphere" ? {
    kind: "atmosphere",
    entityKey: selected.entityKey,
    sourceKey: selected.sourceKey,
    atmosphere: Object.freeze({ ...selected.atmosphere })
  } : {
    kind: "image",
    entityKey: selected.entityKey,
    sourceKey: selected.sourceKey
  };
  const sun = input.suns[0] === void 0 ? void 0 : freezeCandidate({ ...input.suns[0] });
  const fog = selectedFog === void 0 ? void 0 : freezeFog(selectedFog);
  const signatureInput = {
    environments: selected === void 0 ? [] : [selected],
    fogs: selectedFog === void 0 ? [] : [selectedFog],
    suns: input.suns
  };
  const signatures = environmentFactSignatures(signatureInput);
  const result = {
    source: Object.freeze(source),
    fog,
    ...signatures,
    revision: 0,
    sun
  };
  Object.defineProperty(result, "lane", { value: input.lane, enumerable: false });
  return ok(Object.freeze(result));
}
var DEPTH_OF_FIELD_PARAMS_BYTE_SIZE = 64;
var MIN_F_STOP = Math.fround(0.7);
var MAX_F_STOP = Math.fround(32);
var MAX_LINEAR_DEPTH_RAW = Math.fround(1 - 2 ** -24);
var DEFAULT_DEPTH_OF_FIELD_PARAMS = Object.freeze({
  focusDistance: 8,
  fStop: 2.8,
  sensorHeight: 0.024,
  maxRadiusPixels: 16,
  quality: "medium",
  blurSide: "both",
  focalLength: 0
});
function quantizeF32(value) {
  return Math.fround(value);
}
var DepthOfFieldValidationError = class extends Error {
  code;
  expected;
  hint;
  detail;
  constructor(code, detail, expected, hint) {
    super(`${code}: ${expected}`);
    this.name = "DepthOfFieldValidationError";
    this.code = code;
    this.expected = expected;
    this.hint = hint;
    this.detail = detail;
  }
};
function depthOfFieldRequestFailure(error) {
  return Object.freeze({
    code: error.code,
    detail: error.detail,
    expected: error.expected,
    hint: error.hint
  });
}
function resolveDepthOfFieldFrameParams(requested, requestFailure, accepted) {
  if (requested !== void 0) return requested;
  if (requestFailure === void 0 || requestFailure.code === "depth-of-field-orthographic-unsupported") {
    return void 0;
  }
  return accepted;
}
function invalid4(field, value, expected, bound) {
  return new DepthOfFieldValidationError(
    "depth-of-field-invalid-params",
    { field, value, expected, ...bound === void 0 ? {} : { bound } },
    expected,
    `set ${field} to ${expected}`
  );
}
function focalLength(sensorHeight, fov) {
  return sensorHeight / (2 * Math.tan(fov / 2));
}
function opticalCocScale(params) {
  return params.focalLength / params.sensorHeight / (2 * params.fStop) * (params.focalLength / (params.focusDistance - params.focalLength));
}
function frameCocCoefficient(params, outputHeight) {
  return quantizeF32(quantizeF32(outputHeight) * opticalCocScale(params));
}
function resolveDepthOfFieldFrameValues(params, input) {
  const focusDistance = quantizeF32(params.focusDistance);
  const fStop = quantizeF32(params.fStop);
  const sensorHeight = quantizeF32(params.sensorHeight);
  const focal = quantizeF32(params.focalLength);
  const maxRadiusPixels = quantizeF32(params.maxRadiusPixels);
  const outputHeight = quantizeF32(input.outputHeight);
  const near = quantizeF32(input.near);
  const far = quantizeF32(input.far);
  const finitePositiveFields = [
    ["focusDistance", focusDistance, params.focusDistance],
    ["sensorHeight", sensorHeight, params.sensorHeight],
    ["focalLength", focal, params.focalLength],
    ["near", near, input.near],
    ["far", far, input.far]
  ];
  for (const [field, value, raw] of finitePositiveFields) {
    if (!Number.isFinite(value) || value <= 0) {
      return err(invalid4(field, raw, "a finite positive f32 value"));
    }
  }
  if (!Number.isFinite(fStop) || fStop < MIN_F_STOP || fStop > MAX_F_STOP) {
    return err(
      invalid4("fStop", params.fStop, "a finite f32 value in [0.7, 32]", [MIN_F_STOP, MAX_F_STOP])
    );
  }
  if (!Number.isFinite(maxRadiusPixels) || maxRadiusPixels < 0 || maxRadiusPixels > 32) {
    return err(
      invalid4("maxRadiusPixels", params.maxRadiusPixels, "a finite f32 value in [0, 32]", [0, 32])
    );
  }
  if (!Number.isFinite(outputHeight) || outputHeight <= 0) {
    return err(invalid4("outputHeight", input.outputHeight, "a finite positive f32 value"));
  }
  if (far <= near) {
    return err(invalid4("near/far", [input.near, input.far], "finite f32 near > 0 and far > near"));
  }
  if (focusDistance <= focal) {
    return err(invalid4("focusDistance", params.focusDistance, "greater than focalLength in f32"));
  }
  const depthRatio = quantizeF32(near / far);
  if (!Number.isFinite(depthRatio) || depthRatio <= 0) {
    return err(invalid4("near/far ratio", depthRatio, "a finite positive f32 value"));
  }
  for (const raw of [quantizeF32(2 ** -149), 0.5, MAX_LINEAR_DEPTH_RAW]) {
    const oneMinusRaw = quantizeF32(1 - raw);
    const weightedRatio = quantizeF32(raw * depthRatio);
    const denominator = quantizeF32(oneMinusRaw + weightedRatio);
    const distance = quantizeF32(near / denominator);
    if (!Number.isFinite(oneMinusRaw) || oneMinusRaw <= 0 || !Number.isFinite(weightedRatio) || !Number.isFinite(denominator) || denominator <= 0 || !Number.isFinite(distance) || distance <= 0) {
      return err(invalid4("linearDepth", distance, "finite positive f32 reconstruction"));
    }
  }
  const cocCoefficient = frameCocCoefficient(
    {
      focusDistance,
      fStop,
      sensorHeight,
      focalLength: focal
    },
    outputHeight
  );
  if (!Number.isFinite(cocCoefficient) || cocCoefficient <= 0) {
    return err(
      invalid4("cocCoefficient", cocCoefficient, "a finite positive value representable as f32")
    );
  }
  for (const [field, depth] of [
    ["near", near],
    ["far", far]
  ]) {
    const focusOverDepth = quantizeF32(focusDistance / depth);
    const depthFactor = quantizeF32(1 - focusOverDepth);
    const radius = quantizeF32(cocCoefficient * depthFactor);
    if (!Number.isFinite(focusOverDepth) || !Number.isFinite(depthFactor) || !Number.isFinite(radius)) {
      return err(invalid4(`coc.${field}`, radius, "a finite value representable as f32"));
    }
  }
  return ok({
    focusDistance,
    fStop,
    sensorHeight,
    focalLength: focal,
    maxRadiusPixels,
    outputHeight,
    near,
    far,
    cocCoefficient
  });
}
function validateDepthOfFieldFrameParams(params, input) {
  const resolved = resolveDepthOfFieldFrameValues(params, input);
  return resolved.ok ? ok(void 0) : resolved;
}
function validateDepthOfFieldParams(input, camera) {
  if (camera?.projection === "orthographic") {
    return err(
      new DepthOfFieldValidationError(
        "depth-of-field-orthographic-unsupported",
        { projection: "orthographic" },
        "DepthOfField requires a perspective Camera",
        "use a perspective Camera or remove the DepthOfField component"
      )
    );
  }
  const value = input ?? {};
  const focusDistance = quantizeF32(
    value.focusDistance ?? DEFAULT_DEPTH_OF_FIELD_PARAMS.focusDistance
  );
  const fStop = quantizeF32(value.fStop ?? DEFAULT_DEPTH_OF_FIELD_PARAMS.fStop);
  const sensorHeight = quantizeF32(
    value.sensorHeight ?? DEFAULT_DEPTH_OF_FIELD_PARAMS.sensorHeight
  );
  const maxRadiusPixels = quantizeF32(
    value.maxRadiusPixels ?? DEFAULT_DEPTH_OF_FIELD_PARAMS.maxRadiusPixels
  );
  const qualityValue = quantizeF32(value.quality ?? DepthOfFieldQualityValue.medium);
  const blurSideValue = quantizeF32(value.blurSide ?? DepthOfFieldSideValue.both);
  const quality2 = depthOfFieldQualityFromF32(qualityValue);
  const blurSide = depthOfFieldSideFromF32(blurSideValue);
  if (!Number.isFinite(focusDistance) || focusDistance <= 0) {
    return err(
      invalid4("focusDistance", value.focusDistance ?? focusDistance, "a finite positive f32 value")
    );
  }
  if (!Number.isFinite(fStop) || fStop < MIN_F_STOP || fStop > MAX_F_STOP) {
    return err(
      invalid4("fStop", value.fStop ?? fStop, "a finite f32 value in [0.7, 32]", [
        MIN_F_STOP,
        MAX_F_STOP
      ])
    );
  }
  if (!Number.isFinite(sensorHeight) || sensorHeight <= 0) {
    return err(
      invalid4("sensorHeight", value.sensorHeight ?? sensorHeight, "a finite positive f32 value")
    );
  }
  if (!Number.isFinite(maxRadiusPixels) || maxRadiusPixels < 0 || maxRadiusPixels > 32) {
    return err(
      invalid4(
        "maxRadiusPixels",
        value.maxRadiusPixels ?? maxRadiusPixels,
        "a finite f32 value in [0, 32]",
        [0, 32]
      )
    );
  }
  if (quality2 === void 0) {
    return err(invalid4("quality", qualityValue, "DepthOfFieldQualityValue.low, medium, or high"));
  }
  if (blurSide === void 0) {
    return err(invalid4("blurSide", blurSideValue, "DepthOfFieldSideValue.both, near, or far"));
  }
  let focal = DEFAULT_DEPTH_OF_FIELD_PARAMS.focalLength;
  if (camera !== void 0) {
    const fov = quantizeF32(camera.fov);
    const near = quantizeF32(camera.near);
    const far = quantizeF32(camera.far);
    if (!Number.isFinite(fov) || fov <= 0 || fov >= Math.PI) {
      return err(invalid4("fov", camera.fov, "a finite f32 value in (0, PI)"));
    }
    if (!Number.isFinite(near) || !Number.isFinite(far) || near <= 0 || far <= near) {
      return err(
        invalid4("near/far", [camera.near, camera.far], "finite f32 near > 0 and far > near")
      );
    }
    focal = quantizeF32(focalLength(sensorHeight, fov));
    if (!Number.isFinite(focal) || focal <= 0) {
      return err(invalid4("focalLength", focal, "a finite positive f32 value"));
    }
    if (focusDistance < near || focusDistance > far) {
      return err(
        invalid4("focusDistance", focusDistance, `a value in [${near}, ${far}]`, [near, far])
      );
    }
    if (focusDistance <= focal) {
      return err(
        invalid4("focusDistance", focusDistance, `greater than focalLength in f32 (${focal})`)
      );
    }
  }
  return ok(
    Object.freeze({
      focusDistance,
      fStop,
      sensorHeight,
      maxRadiusPixels,
      quality: quality2,
      blurSide,
      focalLength: focal
    })
  );
}
function resolveDepthOfFieldParams(input, camera) {
  if (input === void 0) return ok(void 0);
  return validateDepthOfFieldParams(input, camera);
}
function depthOfFieldTapCount(quality2) {
  switch (quality2) {
    case "low":
      return 16;
    case "medium":
      return 32;
    case "high":
      return 64;
  }
}
function depthOfFieldSideCode(side) {
  switch (side) {
    case "both":
      return DepthOfFieldSideValue.both;
    case "near":
      return DepthOfFieldSideValue.near;
    case "far":
      return DepthOfFieldSideValue.far;
  }
}
function depthOfFieldQualityCode(quality2) {
  switch (quality2) {
    case "low":
      return DepthOfFieldQualityValue.low;
    case "medium":
      return DepthOfFieldQualityValue.medium;
    case "high":
      return DepthOfFieldQualityValue.high;
  }
}
function signedDepthOfFieldCoC(params, viewDepth, outputHeight) {
  if (!Number.isFinite(viewDepth) || viewDepth <= 0 || !Number.isFinite(outputHeight) || outputHeight <= 0 || !Number.isFinite(params.focalLength) || params.focalLength <= 0 || !Number.isFinite(params.sensorHeight) || params.sensorHeight <= 0 || !Number.isFinite(params.fStop) || params.fStop <= 0 || !Number.isFinite(params.focusDistance) || params.focusDistance <= params.focalLength) {
    return 0;
  }
  const focusDistance = quantizeF32(params.focusDistance);
  const depth = quantizeF32(viewDepth);
  const focalLength2 = quantizeF32(params.focalLength);
  const sensorHeight = quantizeF32(params.sensorHeight);
  const fStop = quantizeF32(params.fStop);
  const coefficient = frameCocCoefficient(
    { focusDistance, focalLength: focalLength2, sensorHeight, fStop },
    outputHeight
  );
  const depthFactor = quantizeF32(1 - quantizeF32(focusDistance / depth));
  const radius = quantizeF32(coefficient * depthFactor);
  const limit = Number.isFinite(params.maxRadiusPixels) ? quantizeF32(params.maxRadiusPixels) : Number.POSITIVE_INFINITY;
  return Math.max(-limit, Math.min(limit, Number.isFinite(radius) ? radius : 0));
}
function packDepthOfFieldParams(params, input) {
  const frameValues = resolveDepthOfFieldFrameValues(params, input);
  if (!frameValues.ok) throw frameValues.error;
  const {
    focusDistance,
    fStop,
    sensorHeight,
    focalLength: focal,
    outputHeight,
    maxRadiusPixels,
    near,
    far,
    cocCoefficient
  } = frameValues.value;
  const payload = new Float32Array(DEPTH_OF_FIELD_PARAMS_BYTE_SIZE / 4);
  payload.set([
    focusDistance,
    fStop,
    sensorHeight,
    focal,
    outputHeight,
    maxRadiusPixels,
    depthOfFieldSideCode(params.blurSide),
    depthOfFieldQualityCode(params.quality),
    near,
    far,
    input.useTemporalDepth ? 1 : 0,
    0,
    // row2.w reserved
    cocCoefficient,
    // row3.x / WGSL reserved.x
    0,
    0,
    0
  ]);
  return new Uint8Array(payload.buffer);
}
function hasVolumetricFogCapability(caps, shaders) {
  return caps.compute && caps.storageTexture && shaders !== void 0;
}
function resolveVolumetricFogLightPair(world, point, spot) {
  const expected = "PointLight + SpotLight in the same World";
  if (!world.get(point, Entity).ok || !world.get(spot, Entity).ok) {
    return {
      status: "unresolved",
      reason: "missing-entity",
      point,
      spot,
      expected,
      actual: "point or spot entity is absent from this World",
      hint: "assign two live entities from the same World and retry"
    };
  }
  if (point === spot) {
    return {
      status: "unresolved",
      reason: "same-entity",
      point,
      spot,
      expected,
      actual: "PointLight and SpotLight share one EntityHandle",
      hint: "spawn PointLight and SpotLight on two different entities"
    };
  }
  const pointValid = world.hasComponent(point, PointLight) && world.hasComponent(point, Transform);
  const spotValid = world.hasComponent(spot, SpotLight) && world.hasComponent(spot, Transform);
  if (!pointValid || !spotValid) {
    return {
      status: "unresolved",
      reason: "wrong-component",
      point,
      spot,
      expected,
      actual: `pointValid=${pointValid}; spotValid=${spotValid}`,
      hint: "attach PointLight and SpotLight with Transform to separate same-World entities"
    };
  }
  return { status: "available", mode: "point-spot", point, spot };
}
function resolveSelectedVolumetricLight(world, entity) {
  const expected = "DirectionalLight | PointLight | SpotLight";
  if (!world.get(entity, Entity).ok) {
    return {
      status: "unresolved",
      reason: "missing-entity",
      entity,
      expected,
      actual: "missing or foreign World entity",
      hint: "assign VolumetricFog.light to a live DirectionalLight or SpotLight in this World"
    };
  }
  const hasDirectional = world.hasComponent(entity, DirectionalLight);
  const hasSpot = world.hasComponent(entity, SpotLight);
  if (hasDirectional && hasSpot) {
    return {
      status: "unresolved",
      reason: "ambiguous",
      entity,
      expected,
      actual: "DirectionalLight + SpotLight",
      hint: "remove one mutually exclusive light component from the selected entity"
    };
  }
  if (hasDirectional) return { status: "available", entity, kind: "directional" };
  if (world.hasComponent(entity, PointLight) && world.hasComponent(entity, Transform)) {
    return { status: "available", entity, kind: "point" };
  }
  if (hasSpot && world.hasComponent(entity, Transform)) {
    return { status: "available", entity, kind: "spot" };
  }
  const actual = hasSpot ? "SpotLight without Transform" : world.hasComponent(entity, PointLight) ? "PointLight" : "other component";
  return {
    status: "unresolved",
    reason: "wrong-component",
    entity,
    expected,
    actual,
    hint: "add exactly one supported light component and a Transform for PointLight or SpotLight in the same World"
  };
}
function resolveIntegratedVolumeConsumer(resource, consumer) {
  return { consumer, resource };
}
var FACE_ORIENTATION = [
  { direction: [1, 0, 0], up: [0, 1, 0] },
  { direction: [-1, 0, 0], up: [0, 1, 0] },
  { direction: [0, 1, 0], up: [0, 0, -1] },
  { direction: [0, -1, 0], up: [0, 0, 1] },
  { direction: [0, 0, 1], up: [0, 1, 0] },
  { direction: [0, 0, -1], up: [0, 1, 0] }
];
function assertRange(near, far) {
  if (!Number.isFinite(near) || near <= 0 || !Number.isFinite(far) || far <= near) {
    throw new RangeError("CubeCamera requires finite near > 0 and far > near.");
  }
}
function buildCubeCameraFaceViews(input) {
  assertRange(input.near, input.far);
  const views = [];
  for (const [index, face] of CUBE_CAMERA_FACE_ORDER.entries()) {
    const orientation = FACE_ORIENTATION[index];
    if (orientation === void 0)
      throw new Error(`CubeCamera face orientation missing at ${index}`);
    const target = [
      (input.position[0] ?? 0) + orientation.direction[0],
      (input.position[1] ?? 0) + orientation.direction[1],
      (input.position[2] ?? 0) + orientation.direction[2]
    ];
    const view = mat4.lookAt(mat4.create(), input.position, target, orientation.up);
    const projection = mat4.perspective(mat4.create(), Math.PI / 2, 1, input.near, input.far);
    const viewProjection = mat4.multiply(mat4.create(), projection, view);
    views.push({
      position: input.position,
      face,
      direction: orientation.direction,
      up: orientation.up,
      near: input.near,
      far: input.far,
      view,
      projection,
      viewProjection
    });
  }
  return views;
}

// src/mesh-material-bindings.ts
var EMPTY_RESIDENCY = Object.freeze({
  readiness: "pending",
  samplers: Object.freeze([]),
  textures: Object.freeze([])
});
function projectMeshMaterialBindingObservation(input) {
  const residency = input.bindings.map((_, index) => {
    const value = input.residency?.[index] ?? EMPTY_RESIDENCY;
    return Object.freeze({
      ...value,
      samplers: Object.freeze(value.samplers.map((sampler) => Object.freeze({ ...sampler }))),
      textures: Object.freeze(value.textures.map((texture) => Object.freeze({ ...texture }))),
      ...value.preparationFailure === void 0 ? {} : {
        preparationFailure: Object.freeze({
          ...value.preparationFailure,
          ...value.preparationFailure.detail === void 0 ? {} : { detail: Object.freeze({ ...value.preparationFailure.detail }) }
        })
      }
    });
  });
  return {
    worldId: input.worldId,
    ...input.worldIdentity === void 0 ? {} : { worldIdentity: input.worldIdentity },
    entityKey: input.entityKey,
    bindings: Object.freeze([...input.bindings]),
    diagnostics: Object.freeze([...input.diagnostics]),
    residency: Object.freeze(residency)
  };
}
function summarizeMeshMaterialBindings(observations) {
  let ready = 0;
  let pending = 0;
  let failed = 0;
  let lastKnownGood = 0;
  let textureCount = 0;
  let samplerCount = 0;
  for (const observation of observations) {
    for (const residency of observation.residency) {
      switch (residency.readiness) {
        case "ready":
          ready += 1;
          break;
        case "pending":
          pending += 1;
          break;
        case "failed":
          failed += 1;
          break;
        case "last-known-good":
          lastKnownGood += 1;
          break;
      }
      textureCount += residency.textures.length;
      samplerCount += residency.samplers.length;
    }
  }
  return {
    total: ready + pending + failed + lastKnownGood,
    ready,
    pending,
    failed,
    lastKnownGood,
    textureCount,
    samplerCount
  };
}
function resolveMeshMaterialBindings(mesh, rendererOverrides, deps) {
  const bindings = [];
  const diagnostics = [];
  if (!Array.isArray(mesh.materialSlots)) {
    return { ok: false, code: "mesh-material-slots-missing" };
  }
  if (rendererOverrides.length > mesh.materialSlots.length) {
    diagnostics.push({
      code: "mesh-renderer-material-override-overflow",
      slotIndex: mesh.materialSlots.length
    });
  }
  for (let slotIndex = 0; slotIndex < mesh.materialSlots.length; slotIndex++) {
    const override = rendererOverrides[slotIndex] ?? 0;
    if (override !== 0 && deps.isValidOverride(override)) {
      bindings.push({ handle: override, source: "renderer-override" });
      continue;
    }
    if (override !== 0) {
      diagnostics.push({
        code: "mesh-renderer-material-override-invalid",
        slotIndex,
        handle: override
      });
    }
    const declaredDefault = mesh.materialSlots[slotIndex]?.defaultMaterial;
    if (declaredDefault !== void 0) {
      const handle = deps.resolveMeshDefault(declaredDefault);
      if (handle === void 0) {
        return {
          ok: false,
          code: "mesh-default-material-not-ready",
          slotIndex,
          defaultMaterial: declaredDefault
        };
      }
      bindings.push({ handle, source: "mesh-default" });
      continue;
    }
    bindings.push({ handle: 0, source: "engine-default" });
  }
  return { ok: true, bindings, diagnostics };
}
function resolveVisibility(world, hierarchy = projectHierarchy(world)) {
  const query = world.query({ read: [Visibility] });
  const visitVisibilityRows = (visit) => {
    if (!query.ok) return;
    const spans = query.value.spans();
    if (spans.ok) {
      for (const span of spans.value) {
        const states = span.get(Visibility).state;
        for (let index = 0; index < span.length; index += 1) {
          visit(span.entities[index], states[index] ?? 0);
        }
      }
      return;
    }
    for (const row of query.value) {
      visit(row.entity, row.get(Visibility).state);
    }
  };
  let intentCount = 0;
  let hasAnyHiddenIntent = false;
  visitVisibilityRows((_entity, rawState) => {
    intentCount += 1;
    if (rawState === VisibilityStateValue.hidden) {
      hasAnyHiddenIntent = true;
    }
  });
  let resolveEntity;
  let hasIntent;
  const ensureResolver = () => {
    if (resolveEntity !== void 0) return;
    const intentByEntity = /* @__PURE__ */ new Map();
    visitVisibilityRows((entity, rawState) => {
      const intent = visibilityStateFromU32(rawState);
      if (intent !== void 0) {
        intentByEntity.set(entity, intent);
      }
    });
    hasIntent = (entity) => intentByEntity.has(entity);
    const resolved = /* @__PURE__ */ new Map();
    const resolving = /* @__PURE__ */ new Set();
    resolveEntity = (entity) => {
      const existing = resolved.get(entity);
      if (existing !== void 0) return existing;
      if (resolving.has(entity)) return void 0;
      const intent = intentByEntity.get(entity) ?? "inherited";
      resolving.add(entity);
      let result;
      if (intent === "hidden") {
        result = { intent, effective: "hidden", source: "self" };
      } else if (intent === "visible") {
        result = { intent, effective: "visible", source: "self" };
      } else {
        const parent = hierarchy.getParent(entity);
        const parentResult = parent === void 0 ? void 0 : resolveEntity?.(parent);
        result = parentResult === void 0 ? { intent, effective: "visible", source: "default" } : { intent, effective: parentResult.effective, source: "parent" };
      }
      resolving.delete(entity);
      resolved.set(entity, result);
      return result;
    };
  };
  const snapshot = {
    diagnostics: hierarchy.diagnostics,
    hasAnyIntent: intentCount > 0,
    hasAnyHiddenIntent,
    get(entity) {
      ensureResolver();
      return hasIntent?.(entity) ? resolveEntity?.(entity) : void 0;
    },
    effective(entity) {
      ensureResolver();
      return resolveEntity?.(entity)?.effective ?? "visible";
    }
  };
  return snapshot;
}
function selectCloudLayerFrame(candidates, worldTimeSeconds = 0, sunDirection = void 0, sunRadiance = void 0) {
  if (candidates.length === 0) return ok(void 0);
  if (candidates.length > 1) return err(new CloudLayerOwnerConflictError(candidates.length));
  const candidate = candidates[0];
  if (candidate === void 0) return ok(void 0);
  const validated = validateCloudLayer(candidate.data);
  if (!validated.ok) return validated;
  return ok(
    Object.freeze({
      status: "available",
      entityKey: candidate.entityKey,
      sourceKey: cloudLayerSourceKey(validated.value),
      params: validated.value,
      worldTimeSeconds: Number.isFinite(worldTimeSeconds) ? Math.max(0, worldTimeSeconds) : 0,
      sunDirection: sunDirection === void 0 ? void 0 : Object.freeze([...sunDirection]),
      sunRadiance: sunRadiance === void 0 ? void 0 : Object.freeze([...sunRadiance]),
      revision: 1
    })
  );
}
function extractCloudLayer(world) {
  const candidates = [];
  try {
    const query = world.query({ read: [CloudLayer] });
    if (!query.ok) return ok(void 0);
    for (const row of query.value)
      candidates.push({ entityKey: row.entity, data: row.get(CloudLayer) });
  } catch {
    return ok(void 0);
  }
  let sunDirection;
  let sunRadiance;
  try {
    const query = world.query({ read: [DirectionalLight] });
    if (query.ok) {
      for (const row of query.value) {
        const light = row.get(DirectionalLight);
        const intensity = Number.isFinite(light.intensity) ? Math.max(0, light.intensity) : 0;
        sunDirection = [
          -(light.direction[0] ?? 0),
          -(light.direction[1] ?? -1),
          -(light.direction[2] ?? 0)
        ];
        sunRadiance = [
          (light.color[0] ?? 1) * intensity,
          (light.color[1] ?? 1) * intensity,
          (light.color[2] ?? 1) * intensity
        ];
        break;
      }
    }
  } catch {
  }
  return selectCloudLayerFrame(
    candidates,
    world.getResource(Time).elapsed,
    sunDirection,
    sunRadiance
  );
}
function extractVolumetricFog(inputs) {
  if (inputs.length === 0) return ok({ status: "off" });
  if (inputs.length > MAX_VOLUMETRIC_FOG_OWNERS)
    return err(new VolumeOwnerConflictError(inputs.length));
  const fogs = [];
  for (const input of inputs) {
    const validated = validateVolumetricFog(input);
    if (!validated.ok) return validated;
    fogs.push(validated.value);
  }
  return ok({ status: "available", fogs });
}

// src/extract/directional-shadow-projection.ts
function projectDirectionalShadow(fits, mapSize, shadowFilter, shadowAngularRadius, maxPenumbraTexels) {
  if (!Number.isFinite(mapSize) || mapSize < 1) return void 0;
  const directionalShadowQuality = directionalShadowQualityFromF32(
    shadowFilter,
    shadowAngularRadius,
    maxPenumbraTexels
  );
  if (directionalShadowQuality === void 0) return void 0;
  const splitPlanes = new Float32Array(16);
  for (let index = 0; index < fits.length && index < 4; index += 1) {
    const fit = fits[index];
    if (fit === void 0) continue;
    const width = Math.abs(fit.maxX - fit.minX);
    const height = Math.abs(fit.maxY - fit.minY);
    const depth = Math.abs(fit.maxZ - fit.minZ);
    const worldUnitsPerTexel = Math.max(width, height, Number.EPSILON) / mapSize;
    const lightDepthWorldSpan = Math.max(depth, Number.EPSILON);
    if (!Number.isFinite(worldUnitsPerTexel) || !Number.isFinite(lightDepthWorldSpan)) {
      return void 0;
    }
    const lane = index * 4;
    splitPlanes[lane] = fit.split;
    splitPlanes[lane + 1] = worldUnitsPerTexel;
    splitPlanes[lane + 2] = lightDepthWorldSpan;
  }
  return { splitPlanes, directionalShadowQuality };
}
function buildCameraFrusta(cameras) {
  const planes = [];
  for (const camera of cameras) {
    if (camera.projection === "perspective" && (camera.fov <= 0 || camera.aspect <= 0) || camera.near >= camera.far) {
      planes.push(new Float32Array(0));
      continue;
    }
    const projection = mat4.create();
    if (camera.projection === "orthographic") {
      mat4.orthographic(
        projection,
        camera.orthoLeft,
        camera.orthoRight,
        camera.orthoTop,
        camera.orthoBottom,
        camera.near,
        camera.far
      );
    } else {
      mat4.perspective(projection, camera.fov, camera.aspect, camera.near, camera.far);
    }
    const view = mat4.create();
    mat4.invert(view, camera.world);
    const viewProjection = mat4.create();
    mat4.multiply(viewProjection, projection, view);
    const cameraPlanes = frustum.create();
    frustum.fromViewProjection(cameraPlanes, viewProjection);
    planes.push(cameraPlanes);
  }
  return planes;
}
var bakeCache = /* @__PURE__ */ new WeakMap();
var materialCache = /* @__PURE__ */ new WeakMap();
var liveGlyphSlots = /* @__PURE__ */ new WeakMap();
function entitySlot(entity) {
  return unpackSlot(entity);
}
function worldBakeCache(world) {
  let cache = bakeCache.get(world);
  if (cache === void 0) {
    cache = /* @__PURE__ */ new Map();
    bakeCache.set(world, cache);
  }
  return cache;
}
function worldMaterialCache(world) {
  let cache = materialCache.get(world);
  if (cache === void 0) {
    cache = /* @__PURE__ */ new Map();
    materialCache.set(world, cache);
  }
  return cache;
}
function releaseGlyphProducers(world, entity) {
  const slot = entitySlot(entity);
  const bake = bakeCache.get(world)?.get(slot);
  if (bake?.handle === entity) {
    world.sharedRefs.release(bake.record.meshHandle);
    bakeCache.get(world)?.delete(slot);
  }
  const material = materialCache.get(world)?.get(slot);
  if (material !== void 0) {
    world.sharedRefs.release(material);
    materialCache.get(world)?.delete(slot);
  }
}
function clearRejectedGlyphState(world, entity) {
  const slot = entitySlot(entity);
  const bake = bakeCache.get(world)?.get(slot);
  if (bake?.handle !== entity) return;
  if (world.get(entity, MeshFilter).ok) world.removeComponent(entity, MeshFilter);
  if (world.get(entity, MeshRenderer).ok) world.removeComponent(entity, MeshRenderer);
  releaseGlyphProducers(world, entity);
}
var MSDF_TEXT_BLEND = {
  color: { srcFactor: "one", dstFactor: "one-minus-src-alpha", operation: "add" },
  alpha: { srcFactor: "one", dstFactor: "one-minus-src-alpha", operation: "add" }
};
function glyphTextLayoutSystem(world, gpuStore) {
  resetFontConcurrency();
  const entities = collectGlyphEntities(world);
  const live = liveGlyphSlots.get(world) ?? /* @__PURE__ */ new Set();
  live.clear();
  for (const entity of entities) live.add(entitySlot(entity));
  liveGlyphSlots.set(world, live);
  for (const entry of worldBakeCache(world).values()) {
    if (!live.has(entitySlot(entry.handle))) releaseGlyphProducers(world, entry.handle);
  }
  let firstError = null;
  for (const entity of entities) {
    const error = processEntity(world, gpuStore, entity);
    if (error !== null && firstError === null) firstError = error;
  }
  if (firstError !== null) return err(firstError);
  return ok(void 0);
}
function collectGlyphEntities(world) {
  const entities = [];
  const query = world.query({ read: [GlyphText] }).unwrap();
  for (const row of query) {
    entities.push(row.entity);
  }
  return entities;
}
function processEntity(world, gpuStore, entity) {
  const gtRes = world.get(entity, GlyphText);
  if (!gtRes.ok) return null;
  const gt = gtRes.value;
  if (gt.fontHandle === 0) return null;
  try {
    trackFontConcurrency(gt.fontHandle);
  } catch (e) {
    if (e instanceof TextError) {
      clearRejectedGlyphState(world, entity);
      return e;
    }
    throw e;
  }
  const fontRes = resolveAssetHandle(world, asFontHandle(gt.fontHandle));
  if (!fontRes.ok) return null;
  const font = fontRes.value;
  const signature = signatureOf(gt);
  const entityCache = worldBakeCache(world);
  const slot = entitySlot(entity);
  const cachedEntry = entityCache.get(slot);
  if (cachedEntry !== void 0 && cachedEntry.handle !== entity) {
    world.sharedRefs.release(cachedEntry.record.meshHandle);
    const staleMaterial = worldMaterialCache(world).get(slot);
    if (staleMaterial !== void 0) {
      world.sharedRefs.release(staleMaterial);
      worldMaterialCache(world).delete(slot);
    }
    entityCache.delete(slot);
  }
  const cached = cachedEntry?.handle === entity ? cachedEntry.record : void 0;
  if (cached !== void 0) {
    ensureGlyphMeshMaterialSlots(world, cached.meshHandle);
    if (cached.signature === signature) return null;
    const layout2 = layoutGlyphText(font, gt.text, gt.fontSize);
    const meshHandle = cached.meshHandle;
    const submeshes = [
      {
        indexOffset: 0,
        indexCount: layout2.indices.length,
        vertexCount: layout2.vertices.length / PROCEDURAL_FLOATS_PER_VERTEX,
        topology: "triangle-list",
        materialSlot: 0
      }
    ];
    const mesh = world.sharedRefs.resolve(meshHandle);
    if (mesh.ok) {
      const aabb = conservativeCubeAabb(layout2.radius);
      Object.assign(mesh.value, {
        vertices: layout2.vertices,
        indices: layout2.indices,
        submeshes,
        materialSlots: [{ slotName: "Default" }],
        aabb
      });
    }
    gpuStore.updateMesh(meshHandle, layout2.vertices, layout2.indices, 0, submeshes);
    const materialId2 = resolveTextMaterial(world, gt, font, slot);
    if (materialId2 !== cached.materialHandle) {
      world.set(entity, MeshRenderer, {
        materials: [materialId2]
      });
    }
    entityCache.set(slot, {
      handle: entity,
      record: {
        meshHandle: cached.meshHandle,
        signature,
        materialHandle: materialId2
      }
    });
    return null;
  }
  const existingFilter = world.get(entity, MeshFilter);
  if (existingFilter.ok) {
    ensureGlyphMeshMaterialSlots(world, existingFilter.value.assetHandle);
    return null;
  }
  const layout = layoutGlyphText(font, gt.text, gt.fontSize);
  const bake = bakeGlyphMesh(world, layout);
  if (!bake.ok) return null;
  const materialId = resolveTextMaterial(world, gt, font, slot);
  world.addComponent(entity, {
    component: MeshFilter,
    data: { assetHandle: bake.value.handle }
  });
  world.addComponent(entity, {
    component: MeshRenderer,
    data: { materials: [materialId] }
  });
  entityCache.set(slot, {
    handle: entity,
    record: {
      meshHandle: bake.value.handle,
      signature,
      materialHandle: materialId
    }
  });
  return null;
}
function ensureGlyphMeshMaterialSlots(world, meshHandle) {
  const mesh = world.sharedRefs.resolve(meshHandle);
  if (mesh.ok && !Array.isArray(mesh.value.materialSlots)) {
    Object.assign(mesh.value, { materialSlots: [{ slotName: "Default" }] });
  }
}
function resolveTextMaterial(world, gt, font, slot) {
  const cache = worldMaterialCache(world);
  const material = {
    kind: "material",
    passes: [
      {
        name: "text",
        program: { module: "forgeax::msdf-text" },
        renderState: {
          ...{
            blend: MSDF_TEXT_BLEND,
            cullMode: "none",
            depthWriteEnabled: false,
            depthCompare: "less-equal"
          },
          tags: { LightMode: "Forward" },
          queue: 3e3
        }
      }
    ],
    values: {
      tintColor: [gt.color[0] ?? 1, gt.color[1] ?? 1, gt.color[2] ?? 1, gt.color[3] ?? 1],
      distanceRange: [
        font.common.distanceRange,
        font.common.atlasWidth,
        font.common.atlasHeight,
        0
      ],
      baseColorTexture: { texture: font.atlas }
    },
    parameters: [
      { name: "tintColor", type: "color", default: [1, 1, 1, 1] },
      { name: "distanceRange", type: "vec4", default: [4, 512, 512, 0] },
      { name: "baseColorTexture", type: "texture" },
      { name: "metallicRoughnessTexture", type: "texture", optional: true },
      { name: "normalTexture", type: "texture", optional: true }
    ]
  };
  const id = world.allocSharedRef("MaterialAsset", material);
  const previous = cache.get(slot);
  cache.set(slot, id);
  if (previous !== void 0 && previous !== id) {
    world.sharedRefs.release(previous);
  }
  return id;
}
function signatureOf(gt) {
  return `${gt.fontHandle}|${gt.fontSize}|${gt.text}|${gt.color[0]},${gt.color[1]},${gt.color[2]},${gt.color[3]}`;
}
function asFontHandle(raw) {
  return toShared(raw);
}

// src/points-lines/bounds.ts
function expandPointsLinesBounds(bounds, style) {
  if (bounds.length < 6 || style === void 0) return new Float32Array(bounds);
  const marginPx = style.kind === "points" ? style.sizePx * 0.5 : style.widthPx * 0.5;
  if (!Number.isFinite(marginPx) || marginPx <= 0) return new Float32Array(bounds);
  return new Float32Array([
    (bounds[0] ?? 0) - marginPx,
    (bounds[1] ?? 0) - marginPx,
    (bounds[2] ?? 0) - marginPx,
    (bounds[3] ?? 0) + marginPx,
    (bounds[4] ?? 0) + marginPx,
    (bounds[5] ?? 0) + marginPx
  ]);
}
var COOKIE_PROJECTION_CACHE = /* @__PURE__ */ new WeakMap();
function srgbToLinear(value) {
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}
function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}
function sourceChannel(asset, x, y, channel) {
  const offset = (y * asset.shape.extent.width + x) * 4 + channel;
  const encoded = (asset.data[offset] ?? 0) / 255;
  return channel < 3 && asset.colorSpace === "srgb" ? srgbToLinear(encoded) : encoded;
}
function sampleSourceChannel(asset, x, y, channel) {
  const sourceX = clamp01((x + 0.5) / COOKIE_SLICE_SIZE) * (asset.shape.extent.width - 1);
  const sourceY = clamp01((y + 0.5) / COOKIE_SLICE_SIZE) * (asset.shape.extent.height - 1);
  const x0 = Math.floor(sourceX);
  const y0 = Math.floor(sourceY);
  const x1 = Math.min(asset.shape.extent.width - 1, x0 + 1);
  const y1 = Math.min(asset.shape.extent.height - 1, y0 + 1);
  const tx = sourceX - x0;
  const ty = sourceY - y0;
  const top = sourceChannel(asset, x0, y0, channel) * (1 - tx) + sourceChannel(asset, x1, y0, channel) * tx;
  const bottom = sourceChannel(asset, x0, y1, channel) * (1 - tx) + sourceChannel(asset, x1, y1, channel) * tx;
  return top * (1 - ty) + bottom * ty;
}
function prepareCookieProjection(asset) {
  if (COOKIE_PROJECTION_CACHE.has(asset)) {
    return COOKIE_PROJECTION_CACHE.get(asset) ?? void 0;
  }
  const supportedFormat = asset.format === "rgba8unorm" || asset.format === "rgba8unorm-srgb";
  const validDimensions = Number.isSafeInteger(asset.shape.extent.width) && Number.isSafeInteger(asset.shape.extent.height) && asset.shape.extent.width > 0 && asset.shape.extent.height > 0;
  const validFormatPair = asset.format === "rgba8unorm-srgb" && asset.colorSpace === "srgb" || asset.format === "rgba8unorm" && asset.colorSpace === "linear";
  const validPayload = asset.data.byteLength >= asset.shape.extent.width * asset.shape.extent.height * 4;
  if (!supportedFormat || !validDimensions || !validFormatPair || !validPayload) {
    COOKIE_PROJECTION_CACHE.set(asset, null);
    return void 0;
  }
  const data = new Uint8Array(COOKIE_SLICE_SIZE * COOKIE_SLICE_SIZE * 4);
  for (let y = 0; y < COOKIE_SLICE_SIZE; y += 1) {
    for (let x = 0; x < COOKIE_SLICE_SIZE; x += 1) {
      const target = (y * COOKIE_SLICE_SIZE + x) * 4;
      data[target] = Math.round(clamp01(sampleSourceChannel(asset, x, y, 0)) * 255);
      data[target + 1] = Math.round(clamp01(sampleSourceChannel(asset, x, y, 1)) * 255);
      data[target + 2] = Math.round(clamp01(sampleSourceChannel(asset, x, y, 2)) * 255);
      data[target + 3] = Math.round(clamp01(sampleSourceChannel(asset, x, y, 3)) * 255);
    }
  }
  const matrix = new Float32Array(16);
  matrix[0] = asset.shape.extent.height / asset.shape.extent.width;
  matrix[5] = 1;
  matrix[10] = 1;
  matrix[15] = 1;
  const projection = {
    data,
    matrix,
    aspect: asset.shape.extent.width / asset.shape.extent.height
  };
  COOKIE_PROJECTION_CACHE.set(asset, projection);
  return projection;
}
function createCookieProjectionMatrixData(count) {
  const data = new Float32Array(count * 16);
  for (let index = 0; index < count; index += 1) {
    const base = index * 16;
    data[base] = 1;
    data[base + 5] = 1;
    data[base + 10] = 1;
    data[base + 15] = 1;
  }
  return data;
}
function buildShadowFrusta(lights) {
  const result = [];
  const add = (matrix) => {
    result.push(frustum.fromViewProjection(frustum.create(), matrix));
  };
  for (const matrix of lights.lightViewProj?.slice(0, lights.cascadeCount) ?? []) add(matrix);
  for (const snapshot of lights.pointShadow) {
    if (snapshot.shadowAtlasLayer < 0) continue;
    for (let face = 0; face < 6; face += 1)
      add(snapshot.shadowMatrices.subarray(face * 16, (face + 1) * 16));
  }
  for (const snapshot of lights.spot) {
    if (snapshot.shadowAtlasTile >= 0 && snapshot.lightViewProj !== void 0)
      add(snapshot.lightViewProj);
  }
  return result;
}

// src/render-system-extract-tail.ts
function skinPaletteIdentity(world, entity) {
  return `skin:${world.identity}:${entity}`;
}
function materialProgramSelectionRequiresSkin(selection) {
  if (selection.abi?.skinPaletteAddress !== void 0) return true;
  const semantics = new Set((selection.abi?.vertexInputs ?? []).map((input) => input.semantic));
  return semantics.has("skinIndex") && semantics.has("skinWeight");
}
function isMissingMaterialProgram(error) {
  return error !== null && typeof error === "object" && error.code === "material-specialization-not-cooked";
}
function extractFrames(worlds, owner, assets, pipelineState, materialSnapshotCachesByWorld, options = {}) {
  const cameraOwner = typeof owner === "number" ? owner : owner.cameraOwner;
  const resourceOwner = typeof owner === "number" ? owner : owner.resourceOwner;
  const cameraEntityKey = typeof owner === "number" ? void 0 : owner.cameraEntityKey;
  const renderableRequest = options.renderables ?? "full";
  const renderableMode = typeof renderableRequest === "object" ? "full" : renderableRequest;
  const partialEntitiesByWorld = typeof renderableRequest === "object" ? renderableRequest.entitiesByWorld : void 0;
  const retainHidden = options.retainHidden ?? typeof renderableRequest === "object";
  const skinPaletteAllocator = pipelineState?.skinPaletteAllocator ?? null;
  const reconcileSkinFrame = renderableRequest === "full";
  if (skinPaletteAllocator !== null && reconcileSkinFrame) {
    skinPaletteAllocator.beginFrame();
    skinPaletteAllocator.resetForFrame();
  }
  const failedWorlds = /* @__PURE__ */ new Set();
  const resourceOwnerWorld = worlds[resourceOwner];
  const resourceOwnerFog = resourceOwnerWorld === void 0 ? null : selectFogFrame(resourceOwnerWorld) ?? null;
  const succeededFrames = [];
  const succeededIndices = [];
  const extractionOrder = Array.from({ length: worlds.length }, (_, wi) => wi).sort((a, b) => {
    if (a === cameraOwner) return -1;
    if (b === cameraOwner) return 1;
    return a - b;
  });
  const framesByWorld = /* @__PURE__ */ new Map();
  for (const wi of extractionOrder) {
    const world = worlds[wi];
    if (world === void 0 || failedWorlds.has(world)) continue;
    try {
      if (skinPaletteAllocator !== null && partialEntitiesByWorld !== void 0) {
        for (const entityKey of partialEntitiesByWorld[wi] ?? []) {
          if (!world.hasComponent(entityKey, Skin)) {
            skinPaletteAllocator.releasePersistentSlice(skinPaletteIdentity(world, entityKey));
          }
        }
      }
      const isCameraOwner = wi === cameraOwner;
      const cameraOwnerFrame2 = framesByWorld.get(cameraOwner);
      const prepared = prepareExtractContext(world, {
        ...assets !== void 0 ? { assets } : {},
        ...pipelineState !== void 0 ? { pipelineState } : {},
        resourceOwnerFog: wi === resourceOwner ? resourceOwnerFog : null,
        ...materialSnapshotCachesByWorld === void 0 ? {} : {
          materialSnapshotCache: materialSnapshotCachesByWorld.get(world) ?? (() => {
            const cache = /* @__PURE__ */ new Map();
            materialSnapshotCachesByWorld.set(world, cache);
            return cache;
          })()
        },
        ...options.materialContext === void 0 ? {} : { materialContext: options.materialContext },
        cull: options.cull === "none" ? "none" : isCameraOwner ? "self" : "external",
        renderables: renderableMode,
        ...isCameraOwner && cameraEntityKey !== void 0 ? { cameraEntityKey } : {},
        ...partialEntitiesByWorld?.[wi] === void 0 ? {} : { renderableEntities: partialEntitiesByWorld[wi] },
        retainHidden,
        worldId: wi,
        ...options.getMaterialShaderArtifact === void 0 ? {} : { getMaterialShaderArtifact: options.getMaterialShaderArtifact },
        ...options.instanceCollections === void 0 ? {} : { instanceCollections: options.instanceCollections },
        ...cameraOwnerFrame2 === void 0 ? {} : { cullCameras: cameraOwnerFrame2.cameras }
      });
      const frame = extractFrame(world, prepared);
      framesByWorld.set(wi, frame);
    } catch (err13) {
      if (err13 instanceof MotionBlurValidationError) throw err13;
      try {
        createWorldInternalView(world)._routeError(err13, {
          severity: Severity.Error,
          systemName: `RenderSystem.extractFrames(world[${wi}])`
        });
      } catch {
      }
    }
  }
  if (skinPaletteAllocator !== null && reconcileSkinFrame) {
    skinPaletteAllocator.endFrame();
  }
  for (let wi = 0; wi < worlds.length; wi++) {
    const frame = framesByWorld.get(wi);
    if (frame === void 0) continue;
    succeededFrames.push(frame);
    succeededIndices.push(wi);
  }
  const renderables = [];
  const dispatchEntries = [];
  const shadowCasterEntityKeys = /* @__PURE__ */ new Set();
  const shadowCasterDrawKeys = /* @__PURE__ */ new Set();
  const shadowCasterMembership = /* @__PURE__ */ new Map();
  const visibilitySnapshots = [];
  const featureVisibilitySnapshots = [];
  const hiddenEntityReports = [];
  for (let fi = 0; fi < succeededFrames.length; fi++) {
    const f = succeededFrames[fi];
    const wId = succeededIndices[fi];
    if (f === void 0 || wId === void 0) continue;
    const base = renderables.length;
    const visibilitySnapshot = f.visibilitySnapshots[0];
    const world = worlds[wId];
    if (visibilitySnapshot !== void 0) {
      visibilitySnapshots.push(visibilitySnapshot);
      if (world !== void 0)
        featureVisibilitySnapshots.push({ world, snapshot: visibilitySnapshot });
    }
    hiddenEntityReports.push(...f.hiddenEntityReports);
    for (const r of f.renderables) {
      renderables.push({
        ...r,
        worldId: wId,
        ...r.pointsLines === void 0 ? {} : { pointsLines: { ...r.pointsLines, worldId: wId } }
      });
    }
    for (const d of f.dispatch) {
      dispatchEntries.push({ ...d, renderableIndex: (d.renderableIndex ?? 0) + base });
    }
    for (const key of f.shadowCasterEntityKeys) shadowCasterEntityKeys.add(key);
    for (const key of f.shadowCasterDrawKeys) shadowCasterDrawKeys.add(key);
    for (const membership of f.shadowCasterMembership ?? []) {
      const rebased = { ...membership, renderableIndex: membership.renderableIndex + base };
      const key = gpuDrivenShadowDrawKey(
        rebased.worldEntity,
        rebased.materialHandle,
        rebased.drawItemIndex,
        rebased.passIndex
      );
      shadowCasterMembership.set(key, rebased);
    }
  }
  dispatchEntries.sort((a, b) => (a.queue ?? 0) - (b.queue ?? 0));
  const point = [];
  const spot = [];
  const rect = [];
  let directional;
  let directionalCount = 0;
  let lightViewProj;
  let splitPlanes;
  let cascadeCount;
  let cascadeBlend;
  let shadowMapSize;
  let depthBias;
  let normalBias;
  let directionalShadowQuality;
  let directionalShadowError;
  const pointShadow = [];
  let directionalCsmConfig;
  let directionalCsmDirection;
  for (let fi = 0; fi < succeededFrames.length; fi += 1) {
    const f = succeededFrames[fi];
    const wId = succeededIndices[fi] ?? 0;
    if (f === void 0) continue;
    for (const p of f.lights.point) point.push({ ...p, worldId: wId });
    for (const s of f.lights.spot) spot.push({ ...s, worldId: wId });
    for (const r of f.lights.rect) rect.push(r);
    for (const ps of f.lights.pointShadow) pointShadow.push({ ...ps, worldId: wId });
    if (directional === void 0 && f.lights.directional !== void 0) {
      directional = f.lights.directional;
      lightViewProj = f.lights.lightViewProj;
      splitPlanes = f.lights.splitPlanes;
      cascadeCount = f.lights.cascadeCount;
      cascadeBlend = f.lights.cascadeBlend;
      shadowMapSize = f.lights.shadowMapSize;
      depthBias = f.lights.depthBias;
      normalBias = f.lights.normalBias;
      directionalShadowQuality = f.lights.directionalShadowQuality;
      directionalShadowError = f.lights.directionalShadowError;
      directionalCsmConfig = f.lights.directionalCsmConfig;
      directionalCsmDirection = f.lights.directionalCsmDirection;
    }
    directionalCount += f.lights.directionalCount;
  }
  let cameraOwnerFrame;
  let resourceOwnerFrame;
  for (let fi = 0; fi < succeededFrames.length; fi++) {
    if (succeededIndices[fi] === cameraOwner) cameraOwnerFrame = succeededFrames[fi];
    if (succeededIndices[fi] === resourceOwner) resourceOwnerFrame = succeededFrames[fi];
  }
  const cameras = cameraOwnerFrame?.cameras.map((camera) => ({ ...camera, worldId: cameraOwner })) ?? [];
  const auxiliaryCameras = cameraOwnerFrame?.auxiliaryCameras.map((camera) => ({ ...camera, worldId: cameraOwner })) ?? [];
  const cubeCameras = cameraOwnerFrame !== void 0 ? [...cameraOwnerFrame.cubeCameras] : [];
  const mergeCam = cameras[0];
  if (directionalCsmConfig !== void 0 && directionalCsmDirection !== void 0) {
    const mergeCameraData = mergeCam !== void 0 ? {
      world: mergeCam.world,
      fov: mergeCam.fov,
      aspect: mergeCam.aspect,
      near: mergeCam.near,
      far: mergeCam.far,
      projection: mergeCam.projection,
      orthoLeft: mergeCam.orthoLeft,
      orthoRight: mergeCam.orthoRight,
      orthoBottom: mergeCam.orthoBottom,
      orthoTop: mergeCam.orthoTop
    } : void 0;
    const csm = computeDirectionalCsm(
      directionalCsmDirection,
      directionalCsmConfig,
      mergeCameraData
    );
    if (csm !== null) {
      lightViewProj = csm.lightViewProj;
      splitPlanes = csm.splitPlanes;
      cascadeCount = csm.cascadeCount;
      cascadeBlend = csm.cascadeBlend;
      shadowMapSize = csm.shadowMapSize;
      directionalShadowQuality = csm.directionalShadowQuality;
    }
  }
  const lights = {
    directional,
    directionalCount,
    point,
    spot,
    rect,
    lightViewProj,
    splitPlanes,
    cascadeCount,
    cascadeBlend,
    shadowMapSize,
    depthBias,
    normalBias,
    directionalShadowQuality,
    directionalShadowError,
    pointShadow,
    directionalCsmConfig,
    directionalCsmDirection
  };
  const volumetricFog = resourceOwnerFrame?.volumetricFog;
  const cloudLayer = resourceOwnerFrame?.cloudLayer;
  const skylight = resourceOwnerFrame?.skylight;
  const skylightCount = resourceOwnerFrame?.skylightCount ?? 0;
  const skybox = resourceOwnerFrame?.skybox;
  const skyboxCount = resourceOwnerFrame?.skyboxCount ?? 0;
  const fog = resourceOwnerFrame?.fog;
  const fogFailure = resourceOwnerFrame?.fogFailure;
  const environment = resourceOwnerFrame?.environment;
  const lightProbes = succeededFrames.flatMap((frame, index) => {
    const worldId = succeededIndices[index] ?? 0;
    return (frame.lightProbes ?? []).map((probe) => ({ ...probe, worldId }));
  });
  const postProcessParams = new Map(resourceOwnerFrame?.postProcessParams);
  const OUTPUT_TRANSFORM_PARAM_KEY = STANDARD_OUTPUT_TRANSFORM_FEATURE_ID;
  const cameraTonemapParam = cameraOwnerFrame?.postProcessParams.get(OUTPUT_TRANSFORM_PARAM_KEY);
  if (cameraTonemapParam !== void 0) {
    postProcessParams.set(OUTPUT_TRANSFORM_PARAM_KEY, cameraTonemapParam);
  } else {
    postProcessParams.delete(OUTPUT_TRANSFORM_PARAM_KEY);
  }
  const frustumStats = {
    culled: succeededFrames.reduce((s, f) => s + f.frustumStats.culled, 0),
    total: succeededFrames.reduce((s, f) => s + f.frustumStats.total, 0)
  };
  const visibilityStats = {
    explicitlyHidden: succeededFrames.reduce((s, f) => s + f.visibilityStats.explicitlyHidden, 0)
  };
  const materialTextureSources = {
    sourceFieldsVisited: 0,
    numericSharedRefProbes: 0,
    sourceCacheHits: 0,
    sourceCacheMisses: 0,
    producerRoutes: {}
  };
  for (const frame of succeededFrames) {
    const stats = frame.materialTextureSources;
    if (stats === void 0) continue;
    materialTextureSources.sourceFieldsVisited += stats.sourceFieldsVisited;
    materialTextureSources.numericSharedRefProbes += stats.numericSharedRefProbes;
    materialTextureSources.sourceCacheHits += stats.sourceCacheHits;
    materialTextureSources.sourceCacheMisses += stats.sourceCacheMisses;
    for (const [route, count] of Object.entries(stats.producerRoutes)) {
      materialTextureSources.producerRoutes[route] = (materialTextureSources.producerRoutes[route] ?? 0) + count;
    }
  }
  const reflectionProbes = succeededFrames.flatMap((f, index) => {
    const worldId = succeededIndices[index] ?? 0;
    return (f.reflectionProbes ?? []).map((probe) => ({ ...probe, worldId }));
  });
  return {
    cameras,
    auxiliaryCameras,
    cubeCameras,
    reflectionProbes,
    lights,
    ...volumetricFog === void 0 ? {} : { volumetricFog: { ...volumetricFog, worldId: resourceOwner } },
    ...cloudLayer === void 0 ? {} : { cloudLayer },
    renderables,
    dispatch: dispatchEntries,
    shadowCasterEntityKeys,
    shadowCasterDrawKeys,
    ...shadowCasterMembership.size === 0 ? {} : { shadowCasterMembership: [...shadowCasterMembership.values()] },
    skylight,
    skylightCount,
    lightProbes,
    skybox,
    skyboxCount,
    fog,
    ...fogFailure === void 0 ? {} : { fogFailure },
    environment,
    environmentReady: resourceOwnerFrame !== void 0 && environment !== void 0,
    frustumStats,
    visibilityStats,
    materialTextureSources,
    postProcessParams,
    visibilitySnapshots,
    featureVisibilitySnapshots,
    hiddenEntityReports
  };
}
function hasFiniteOrderedLocalAabb(aabb) {
  if (aabb === void 0 || aabb.length !== 6) return false;
  const minX = aabb[0];
  const minY = aabb[1];
  const minZ = aabb[2];
  const maxX = aabb[3];
  const maxY = aabb[4];
  const maxZ = aabb[5];
  if (minX === void 0 || minY === void 0 || minZ === void 0 || maxX === void 0 || maxY === void 0 || maxZ === void 0) {
    return false;
  }
  if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(minZ) || !Number.isFinite(maxX) || !Number.isFinite(maxY) || !Number.isFinite(maxZ)) {
    return false;
  }
  return minX <= maxX && minY <= maxY && minZ <= maxZ;
}
function morphSnapshotFor(mesh, weights) {
  const targets = mesh.morphTargets;
  if (targets === void 0 || targets.length === 0 || weights === void 0) return void 0;
  if (weights.length !== targets.length) return void 0;
  const firstPositions = targets[0]?.position;
  if (firstPositions === void 0 || firstPositions.length === 0 || firstPositions.length % 3 !== 0) {
    return void 0;
  }
  const vertexCount = firstPositions.length / 3;
  if (mesh.vertices.length % vertexCount !== 0) return void 0;
  for (let targetIndex = 0; targetIndex < targets.length; targetIndex += 1) {
    const target = targets[targetIndex];
    if (target?.position?.length !== firstPositions.length) return void 0;
  }
  const copied = new Float32Array(weights.length);
  for (let index = 0; index < weights.length; index += 1) {
    const weight = weights[index] ?? Number.NaN;
    if (!Number.isFinite(weight)) return void 0;
    copied[index] = weight;
  }
  if (copied.every((weight) => weight === 0)) return void 0;
  return { weights: copied, targetCount: targets.length };
}
function extractFrame(world, context) {
  const {
    assets,
    pipelineState,
    materialSnapshotCache: persistentMaterialSnapshotCache,
    cull: cullMode,
    resourceOwnerFog,
    getMaterialShaderArtifact,
    instanceCollections,
    renderableEntities,
    retainHidden
  } = context;
  const fog = resourceOwnerFog === void 0 ? selectFogFrame(world) : resourceOwnerFog ?? void 0;
  const fogFailure = fogState(world).failure;
  const visibility = context.visibility.hasAnyHiddenIntent ? context.visibility : void 0;
  const skinPaletteAllocator = pipelineState?.skinPaletteAllocator ?? null;
  const materialTextureSourceStats = {
    sourceFieldsVisited: 0,
    numericSharedRefProbes: 0,
    sourceCacheHits: 0,
    sourceCacheMisses: 0,
    producerRoutes: {}
  };
  const materialTextureSourceCache = /* @__PURE__ */ new Map();
  const directionalLightQuery = world.query({ read: [DirectionalLight] }).unwrap();
  const worldInternal = createWorldInternalView(world);
  let volumetricFog = extractVolumeSnapshot(world, assets, worldInternal);
  let cloudLayer;
  const extractedCloudLayer = extractCloudLayer(world);
  if (extractedCloudLayer.ok) {
    cloudLayer = extractedCloudLayer.value;
  } else {
    worldInternal._routeError(extractedCloudLayer.error, {
      severity: Severity.Error,
      systemName: "RenderSystem.extract (cloud-layer)"
    });
  }
  const cameraRoles = selectCameraRoles(world, context.cameraEntityKey);
  const cameras = [...cameraRoles.display];
  const auxiliaryCameras = cameraRoles.auxiliary;
  const cubeCameras = collectCubeCameraSnapshots(world);
  const reflectionProbes = collectReflectionProbeFacts(world);
  let directional;
  let directionalCount = 0;
  let firstHitCastShadow;
  let firstHitShadowFields;
  for (const row of directionalLightQuery) {
    const l = row.get(DirectionalLight);
    directionalCount += 1;
    const intensity = l.intensity;
    const snapshot = {
      kind: "directional",
      entity: row.entity,
      direction: vec3.create(l.direction[0] ?? 0, l.direction[1] ?? -1, l.direction[2] ?? 0),
      color: vec3.create(
        (l.color[0] ?? 1) * intensity,
        (l.color[1] ?? 1) * intensity,
        (l.color[2] ?? 1) * intensity
      ),
      intensity
    };
    if (directional === void 0) {
      directional = snapshot;
      firstHitCastShadow = l.castShadow;
      firstHitShadowFields = {
        cascadeCount: l.cascadeCount,
        splitLambda: l.splitLambda,
        cascadeBlend: l.cascadeBlend,
        mapSize: l.mapSize,
        depthBias: l.depthBias,
        normalBias: l.normalBias,
        shadowDistance: l.shadowDistance,
        shadowFilter: l.shadowFilter,
        shadowAngularRadius: l.shadowAngularRadius,
        maxPenumbraTexels: l.maxPenumbraTexels
      };
    }
  }
  let directionalShadowError;
  if (directional !== void 0 && firstHitShadowFields !== void 0) {
    const validation = validateDirectionalLightData({
      direction: directional.direction,
      castShadow: firstHitCastShadow,
      ...firstHitShadowFields
    });
    if (!validation.ok) {
      directionalShadowError = validation.error;
      worldInternal._routeError(directionalShadowError, {
        severity: Severity.Error,
        systemName: "RenderSystem.extract (directional-shadow)"
      });
    }
  }
  const pointSnapshots = [];
  const pointSnapshotEntities = [];
  const pointLightQuery = world.query({
    read: [PointLight],
    optional: [Transform, GlobalTransform]
  }).unwrap();
  for (const row of pointLightQuery) {
    const p = row.get(PointLight);
    const hasTransform = row.get(GlobalTransform) !== void 0;
    const intensity = p.intensity;
    const range = p.range;
    const entityId = row.entity;
    let worldMat;
    if (hasTransform) {
      const view = worldInternal._getArrayView(entityId, GlobalTransform, "world");
      if (view !== void 0) worldMat = new Float32Array(view);
    }
    const position = worldMat !== void 0 ? mat4.getTranslation(vec3.create(), worldMat) : vec3.create(0, 0, 0);
    pointSnapshots.push({
      kind: "point",
      entity: entityId,
      worldId: context.worldId,
      position,
      color: vec3.create(
        (p.color[0] ?? 1) * intensity,
        (p.color[1] ?? 1) * intensity,
        (p.color[2] ?? 1) * intensity
      ),
      intensity,
      invRangeSquared: computeInvRangeSquared(range)
    });
    pointSnapshotEntities.push(entityId);
  }
  const spotSnapshots = [];
  const spotLightQuery = world.query({
    read: [SpotLight],
    optional: [Transform, GlobalTransform]
  }).unwrap();
  let spotTileNext = 0;
  const iesSlices = /* @__PURE__ */ new Map();
  const cookieSlices = /* @__PURE__ */ new Map();
  const projectorSlices = /* @__PURE__ */ new Map();
  for (const row of spotLightQuery) {
    const s = row.get(SpotLight);
    const hasTransform = row.get(GlobalTransform) !== void 0;
    const intensity = s.intensity;
    const range = s.range;
    const innerConeDeg = s.innerConeDeg;
    const outerConeDeg = s.outerConeDeg;
    let worldMat;
    if (hasTransform) {
      const entity = row.entity;
      const view = worldInternal._getArrayView(entity, GlobalTransform, "world");
      if (view !== void 0) worldMat = new Float32Array(view);
    }
    const position = worldMat !== void 0 ? mat4.getTranslation(vec3.create(), worldMat) : vec3.create(0, 0, 0);
    const dir = vec3.create(s.direction[0] ?? 0, s.direction[1] ?? -1, s.direction[2] ?? 0);
    const dirLen = Math.sqrt(
      (dir[0] ?? 0) * (dir[0] ?? 0) + (dir[1] ?? 0) * (dir[1] ?? 0) + (dir[2] ?? 0) * (dir[2] ?? 0)
    );
    const EPSILON = 1e-6;
    const hasValidDirection = dirLen > EPSILON;
    if (!hasValidDirection) {
      worldInternal._routeError(
        new SpawnLightInvalidBoundsError("SpotLight", "direction", [
          dir[0] ?? 0,
          dir[1] ?? 0,
          dir[2] ?? 0
        ]),
        {
          severity: Severity.Error,
          systemName: "RenderSystem.extract (spot-direction)"
        }
      );
    }
    const dirN = vec3.create(
      hasValidDirection ? (dir[0] ?? 0) / dirLen : dir[0] ?? 0,
      hasValidDirection ? (dir[1] ?? 0) / dirLen : dir[1] ?? 0,
      hasValidDirection ? (dir[2] ?? 0) / dirLen : dir[2] ?? 0
    );
    const castShadow = s.castShadow;
    const sMapSize = s.mapSize;
    const sNearPlane = s.nearPlane;
    const sFarPlane = s.farPlane;
    const iesProfileAsset = s.iesProfile === void 0 ? void 0 : resolveAssetHandle(world, s.iesProfile);
    const cookieAsset = s.cookie === void 0 ? void 0 : resolveAssetHandle(world, s.cookie);
    const hasProjector = Number(s.projector) > 0;
    let projectorHandle;
    let projectorAsset;
    let projectorGuid;
    if (hasProjector) {
      const candidate = toShared(Math.round(Number(s.projector)));
      const resolvedProjector = resolveAssetHandle(world, candidate);
      if (!resolvedProjector.ok || resolvedProjector.value.kind !== "texture") {
        worldInternal._routeError(
          resolvedProjector.ok ? new RhiError({
            code: "asset-not-registered",
            expected: "SpotLight.projector resolves to a TextureAsset",
            hint: "load the authored projector TextureAsset before assigning SpotLight.projector",
            detail: { assetHandle: Number(candidate) }
          }) : resolvedProjector.error,
          { severity: Severity.Error, systemName: "RenderSystem.extract (spot-projector)" }
        );
      } else {
        projectorHandle = candidate;
        projectorAsset = resolvedProjector.value;
        projectorGuid = assets?.guidOf(projectorAsset) ?? `handle:${Number(candidate)}`;
      }
    }
    const iesProfileData = iesProfileAsset?.ok && iesProfileAsset.value.kind === "ies-profile" ? new Uint8Array(iesProfileAsset.value.data) : void 0;
    const cookieProjection = cookieAsset?.ok && cookieAsset.value.kind === "texture" ? prepareCookieProjection(cookieAsset.value) : void 0;
    const cookieData = cookieProjection?.data;
    const projectorProjection = projectorAsset === void 0 ? void 0 : prepareCookieProjection(projectorAsset);
    const projectorData = projectorProjection?.data;
    const iesProfileHandle = s.iesProfile === void 0 ? void 0 : handleSlot(s.iesProfile);
    const cookieHandle = s.cookie === void 0 ? void 0 : handleSlot(s.cookie);
    let iesProfileSlice = iesProfileHandle === void 0 ? void 0 : iesSlices.get(iesProfileHandle);
    if (iesProfileSlice === void 0 && iesProfileHandle !== void 0 && iesProfileData !== void 0 && iesSlices.size < IES_SLICE_CAPACITY) {
      iesProfileSlice = iesSlices.size;
      iesSlices.set(iesProfileHandle, iesProfileSlice);
    }
    let cookieSlice = cookieHandle === void 0 ? void 0 : cookieSlices.get(cookieHandle);
    if (cookieSlice === void 0 && cookieHandle !== void 0 && cookieData !== void 0 && cookieSlices.size < COOKIE_SLICE_CAPACITY) {
      cookieSlice = cookieSlices.size;
      cookieSlices.set(cookieHandle, cookieSlice);
    }
    let projectorSlice = projectorHandle === void 0 ? void 0 : projectorSlices.get(projectorHandle) ?? cookieSlices.get(projectorHandle);
    if (projectorSlice === void 0 && projectorHandle !== void 0 && projectorData !== void 0 && cookieSlices.size + projectorSlices.size < COOKIE_SLICE_CAPACITY) {
      projectorSlice = cookieSlices.size + projectorSlices.size;
      projectorSlices.set(projectorHandle, projectorSlice);
    }
    const shadowIntensity = s.shadowIntensity;
    let lightViewProj2;
    let shadowAtlasTile = -1;
    if ((castShadow || hasProjector) && hasValidDirection) {
      const target = vec3.create(
        (position[0] ?? 0) + (dirN[0] ?? 0),
        (position[1] ?? 0) + (dirN[1] ?? 0),
        (position[2] ?? 0) + (dirN[2] ?? 0)
      );
      const fov = outerConeDeg * 2 * (Math.PI / 180);
      const proj = mat4.create();
      mat4.perspective(proj, fov, 1, sNearPlane, sFarPlane);
      const view = mat4.create();
      mat4.lookAt(view, position, target, vec3.create(0, 1, 0));
      lightViewProj2 = new Float32Array(16);
      mat4.multiply(lightViewProj2, proj, view);
      if (castShadow && spotTileNext < 4) {
        shadowAtlasTile = spotTileNext;
        spotTileNext += 1;
      }
    }
    spotSnapshots.push({
      kind: "spot",
      entity: row.entity,
      worldId: context.worldId,
      // D-6: position reflects world transform; direction stays sourced
      // from SpotLight.direction (NOT rotated by the parent).
      position,
      direction: dirN,
      color: vec3.create(
        (s.color[0] ?? 1) * intensity,
        (s.color[1] ?? 1) * intensity,
        (s.color[2] ?? 1) * intensity
      ),
      intensity,
      invRangeSquared: computeInvRangeSquared(range),
      cosInner: degToCos(innerConeDeg),
      cosOuter: degToCos(outerConeDeg),
      ...s.iesProfile === void 0 ? {} : {
        iesProfileHandle: handleSlot(s.iesProfile),
        ...iesProfileSlice === void 0 ? {} : { iesProfileSlice }
      },
      ...s.cookie === void 0 ? {} : {
        cookieHandle: handleSlot(s.cookie),
        ...cookieSlice === void 0 ? {} : { cookieSlice }
      },
      ...iesProfileData === void 0 ? {} : { iesProfileData },
      ...cookieData === void 0 ? {} : { cookieData },
      ...cookieProjection === void 0 ? {} : { cookieMatrix: cookieProjection.matrix },
      ...projectorSlice === void 0 ? {} : { projectorSlice },
      ...projectorData === void 0 ? {} : { projectorData },
      ...projectorProjection === void 0 ? {} : { projectorMatrix: projectorProjection.matrix },
      rollDeg: s.rollDeg,
      // ── shadow fields ──
      castShadow,
      lightViewProj: lightViewProj2,
      mapSize: sMapSize,
      nearPlane: sNearPlane,
      farPlane: sFarPlane,
      shadowAtlasTile,
      shadowIntensity,
      depthBias: s.depthBias,
      normalBias: s.normalBias,
      pcfKernelSize: s.pcfKernelSize,
      ...projectorHandle === void 0 || projectorAsset === void 0 || projectorGuid === void 0 ? {} : {
        projectorHandle,
        projectorAsset,
        projectorGuid,
        projectorGeneration: 1,
        projectorRevision: 1
      }
    });
  }
  const rectSnapshots = [];
  const rectLightQuery = world.query({
    read: [RectAreaLight],
    optional: [Transform, GlobalTransform]
  }).unwrap();
  for (const row of rectLightQuery) {
    const light = row.get(RectAreaLight);
    const validation = validateRectAreaLightData({
      intensity: light.intensity,
      color: light.color,
      width: light.width,
      height: light.height,
      range: light.range
    });
    if (!validation.ok) {
      worldInternal._routeError(validation.error, {
        severity: Severity.Error,
        systemName: "RenderSystem.extract (rect-area-light)"
      });
      continue;
    }
    const worldView = row.get(GlobalTransform);
    const worldMat = worldView === void 0 ? void 0 : new Float32Array(worldInternal._getArrayView(row.entity, GlobalTransform, "world") ?? []);
    const position = worldMat !== void 0 ? mat4.getTranslation(vec3.create(), worldMat) : vec3.create(0, 0, 0);
    const frame = buildRectAreaWorldFrame({
      center: position,
      axisX: [worldMat?.[0] ?? 1, worldMat?.[1] ?? 0, worldMat?.[2] ?? 0],
      axisY: [worldMat?.[4] ?? 0, worldMat?.[5] ?? 1, worldMat?.[6] ?? 0],
      width: light.width,
      height: light.height
    });
    rectSnapshots.push({
      kind: "rect-area",
      position,
      color: vec3.create(
        (light.color[0] ?? 1) * light.intensity,
        (light.color[1] ?? 1) * light.intensity,
        (light.color[2] ?? 1) * light.intensity
      ),
      intensity: light.intensity,
      invRangeSquared: computeInvRangeSquared(light.range),
      halfWidth: frame.halfWidth,
      halfHeight: frame.halfHeight,
      axisX: frame.axisX,
      axisY: frame.axisY
    });
  }
  let volumeSpot;
  const extractedFog = volumetricFog;
  if (extractedFog !== void 0) {
    if (extractedFog.spotLightEntity !== void 0) {
      volumeSpot = spotSnapshots.find((light) => light.entity === extractedFog.spotLightEntity);
    } else if (extractedFog.lightKind === "spot") {
      volumeSpot = spotSnapshots.find((light) => light.entity === extractedFog.lightEntity);
    }
  }
  if (volumetricFog !== void 0 && volumetricFog.status === "available" && volumeSpot?.projectorAsset !== void 0 && volumeSpot.projectorHandle !== void 0) {
    const projectorHandle = volumeSpot.projectorHandle;
    const projectorAsset = volumeSpot.projectorAsset;
    volumetricFog = {
      ...volumetricFog,
      projector: {
        guid: volumeSpot.projectorGuid ?? `handle:${Number(volumeSpot.projectorHandle)}`,
        generation: volumeSpot.projectorGeneration ?? 1,
        view: "2d",
        sampler: "linear-clamp-to-edge",
        projection: "spot-projection",
        revision: volumeSpot.projectorRevision ?? 1
      },
      projectorHandle,
      projectorAsset
    };
  }
  let lightViewProj;
  let splitPlanes;
  let cascadeCount;
  let cascadeBlend;
  let shadowMapSize;
  let directionalShadowQuality;
  let directionalCsmConfig;
  let directionalCsmDirection;
  const cam0 = cameras[0];
  const cameraData = cam0 !== void 0 ? {
    world: cam0.world,
    fov: cam0.fov,
    aspect: cam0.aspect,
    near: cam0.near,
    far: cam0.far,
    projection: cam0.projection,
    orthoLeft: cam0.orthoLeft,
    orthoRight: cam0.orthoRight,
    orthoBottom: cam0.orthoBottom,
    orthoTop: cam0.orthoTop
  } : void 0;
  if (directional !== void 0 && firstHitCastShadow !== false && directionalShadowError === void 0) {
    const dirSnapshot = directional;
    const sf = firstHitShadowFields;
    if (sf !== void 0) {
      directionalCsmConfig = {
        cascadeCount: sf.cascadeCount,
        splitLambda: sf.splitLambda,
        cascadeBlend: sf.cascadeBlend,
        mapSize: sf.mapSize,
        shadowDistance: sf.shadowDistance,
        shadowFilter: sf.shadowFilter,
        shadowAngularRadius: sf.shadowAngularRadius,
        maxPenumbraTexels: sf.maxPenumbraTexels
      };
      directionalCsmDirection = dirSnapshot.direction;
      const csm = computeDirectionalCsm(dirSnapshot.direction, directionalCsmConfig, cameraData);
      cascadeCount = Math.round(sf.cascadeCount);
      cascadeBlend = sf.cascadeBlend;
      shadowMapSize = sf.mapSize;
      if (csm !== null) {
        lightViewProj = csm.lightViewProj;
        splitPlanes = csm.splitPlanes;
        directionalShadowQuality = csm.directionalShadowQuality;
      } else {
        const sNear = cameraData?.near ?? 0.1;
        const splits = pssmSplit(sNear, sf.shadowDistance, cascadeCount, sf.splitLambda);
        const padded = new Float32Array(16);
        for (let i = 0; i < splits.length; i++) padded[i * 4] = splits[i] ?? 0;
        splitPlanes = padded;
      }
      directionalShadowQuality = directionalShadowQualityFromF32(
        sf.shadowFilter,
        sf.shadowAngularRadius,
        sf.maxPenumbraTexels
      );
    }
  }
  const paddedSplitPlanes = new Float32Array(16);
  if (splitPlanes !== void 0) {
    for (let i = 0; i < splitPlanes.length; i++) {
      paddedSplitPlanes[i] = splitPlanes[i] ?? 0;
    }
  }
  const pointShadowSnapshots = [];
  {
    const pointShadowQuery = world.query({ read: [Transform, GlobalTransform, PointLightShadow], with: [PointLight] }).unwrap();
    for (const row of pointShadowQuery) {
      const ps = row.get(PointLightShadow);
      const wRow = row.get(GlobalTransform).world;
      if (wRow === void 0) continue;
      const px = wRow[12] ?? 0;
      const py = wRow[13] ?? 0;
      const pz = wRow[14] ?? 0;
      const lightPos = vec3.create(px, py, pz);
      const mapSize = ps.mapSize;
      const nearPlane = ps.nearPlane;
      const farPlane = ps.farPlane;
      const layer = pointShadowSnapshots.length < SHADOW_ATLAS_DEFAULT_LAYERS ? pointShadowSnapshots.length : -1;
      const matrices = buildPointShadowMatrices(lightPos, nearPlane, farPlane);
      const packed = new Float32Array(96);
      for (let f = 0; f < 6; f++) {
        const m = matrices[f];
        if (m === void 0) continue;
        for (let k = 0; k < 16; k++) {
          packed[f * 16 + k] = m[k] ?? 0;
        }
      }
      pointShadowSnapshots.push({
        entity: row.entity,
        worldId: context.worldId,
        position: lightPos,
        mapSize,
        nearPlane,
        farPlane,
        depthBias: ps.depthBias,
        normalBias: ps.normalBias,
        shadowAtlasLayer: layer,
        shadowMatrices: packed
      });
    }
  }
  if (pointShadowSnapshots.length > 0) {
    const shadowByEntity = /* @__PURE__ */ new Map();
    for (const ps of pointShadowSnapshots) shadowByEntity.set(ps.entity, ps);
    for (let i = 0; i < pointSnapshots.length; i++) {
      const entityId = pointSnapshotEntities[i] ?? 0;
      const ps = shadowByEntity.get(entityId);
      if (ps !== void 0) {
        pointSnapshots[i] = {
          ...pointSnapshots[i],
          shadowAtlasLayer: ps.shadowAtlasLayer,
          shadowNear: ps.nearPlane,
          shadowFar: ps.farPlane
        };
      }
    }
  }
  const lights = {
    directional,
    directionalCount,
    point: pointSnapshots,
    spot: spotSnapshots,
    rect: rectSnapshots,
    lightViewProj,
    splitPlanes: splitPlanes !== void 0 ? paddedSplitPlanes : void 0,
    cascadeCount,
    cascadeBlend,
    shadowMapSize,
    depthBias: firstHitCastShadow !== false ? firstHitShadowFields?.depthBias : void 0,
    normalBias: firstHitCastShadow !== false ? firstHitShadowFields?.normalBias : void 0,
    directionalShadowQuality,
    directionalShadowError,
    pointShadow: pointShadowSnapshots,
    // bug-20260710-editor-cross-world-shadow: raw CSM config + light direction
    // so the merge layer can recompute matrices against the surfaced camera.
    directionalCsmConfig,
    directionalCsmDirection
  };
  const shadowFrusta = cullMode === "none" ? [] : buildShadowFrusta(lights);
  const skylightQuery = world.query({ read: [Skylight] }).unwrap();
  let skylight;
  let skylightCount = 0;
  for (const row of skylightQuery) {
    const s = row.get(Skylight);
    const equirectRaw = s.equirect;
    const intensity = s.intensity;
    const colorR = s.color[0] ?? 1;
    const colorG = s.color[1] ?? 1;
    const colorB = s.color[2] ?? 1;
    const rotation = [
      s.rotation[0] ?? 0,
      s.rotation[1] ?? 0,
      s.rotation[2] ?? 0,
      s.rotation[3] ?? 1
    ];
    skylightCount += 1;
    if (skylight === void 0) {
      skylight = {
        equirectHandle: equirectRaw !== void 0 ? Math.round(equirectRaw) : 0,
        color: [colorR, colorG, colorB],
        intensity,
        rotation,
        // w19: winning entity handle for the multi-Skylight once-warn (F-8).
        entityHandle: row.entity
      };
    }
  }
  const lightProbeQuery = world.query({ read: [LightProbe, GlobalTransform] }).unwrap();
  const lightProbes = [];
  for (const row of lightProbeQuery) {
    const probe = row.get(LightProbe);
    const validation = validateLightProbeData({
      irradiance: probe.irradiance,
      radius: probe.radius
    });
    if (!validation.ok) {
      worldInternal._routeError(validation.error, {
        severity: Severity.Error,
        systemName: "RenderSystem.extract (light-probe)"
      });
      continue;
    }
    const transform = row.get(GlobalTransform);
    lightProbes.push({
      identity: String(row.entity),
      worldId: context.worldId,
      position: [transform.world[12] ?? 0, transform.world[13] ?? 0, transform.world[14] ?? 0],
      radius: probe.radius,
      irradiance: new Float32Array(probe.irradiance),
      admitted: true
    });
  }
  const skyboxQuery = world.query({ read: [SkyboxBackground] }).unwrap();
  let skybox;
  let skyboxCount = 0;
  for (const row of skyboxQuery) {
    const s = row.get(SkyboxBackground);
    const equirectRaw = s.equirect;
    const modeRaw = s.mode;
    const rotation = [
      s.rotation[0] ?? 0,
      s.rotation[1] ?? 0,
      s.rotation[2] ?? 0,
      s.rotation[3] ?? 1
    ];
    skyboxCount += 1;
    if (skybox === void 0 && equirectRaw !== void 0) {
      skybox = {
        equirectHandle: Math.round(equirectRaw),
        mode: modeRaw,
        rotation,
        // w19: winning entity handle for the multi-SkyboxBackground warn (F-8).
        entityHandle: row.entity
      };
    }
  }
  const environmentCandidates = [];
  const imageEnvironment = skylight?.equirectHandle !== void 0 && skylight.equirectHandle > 0 ? skylight : skybox?.equirectHandle !== void 0 && skybox.equirectHandle > 0 ? skybox : void 0;
  if (imageEnvironment !== void 0) {
    environmentCandidates.push({
      kind: "image",
      entityKey: imageEnvironment.entityHandle,
      sourceKey: `equirect:${imageEnvironment.equirectHandle}`
    });
  }
  const atmosphereQuery = world.query({ read: [Atmosphere] }).unwrap();
  for (const row of atmosphereQuery) {
    const value = row.get(Atmosphere);
    const atmosphere = {
      turbidity: value.turbidity,
      rayleigh: value.rayleigh,
      mieCoefficient: value.mieCoefficient,
      mieDirectionalG: value.mieDirectionalG,
      sunAngularRadius: value.sunAngularRadius,
      circumsolarStrength: value.circumsolarStrength,
      circumsolarWidth: value.circumsolarWidth
    };
    environmentCandidates.push({
      kind: "atmosphere",
      entityKey: row.entity,
      sourceKey: `atmosphere:${row.entity}`,
      atmosphere
    });
  }
  const directionalDirection = directional?.direction;
  const directionalLength = directionalDirection === void 0 ? 0 : Math.hypot(
    directionalDirection[0] ?? 0,
    directionalDirection[1] ?? 0,
    directionalDirection[2] ?? 0
  );
  const sunIntensity = directional?.intensity ?? 0;
  const sunColor = sunIntensity > 0 && directional !== void 0 ? [
    (directional.color[0] ?? 0) / sunIntensity,
    (directional.color[1] ?? 0) / sunIntensity,
    (directional.color[2] ?? 0) / sunIntensity
  ] : [0, 0, 0];
  const sun = directional === void 0 || directional.entity === void 0 || directionalLength <= 1e-6 ? [] : [
    {
      entityKey: directional.entity,
      direction: [
        -(directionalDirection?.[0] ?? 0) / directionalLength,
        -(directionalDirection?.[1] ?? 0) / directionalLength,
        -(directionalDirection?.[2] ?? 0) / directionalLength
      ],
      color: sunColor,
      intensity: directional.intensity
    }
  ];
  const environmentSelection = selectEnvironment({
    environments: environmentCandidates,
    fogs: fog === void 0 ? [] : [fog],
    suns: sun,
    lane: "direct"
  });
  if (!environmentSelection.ok) {
    routeWorldError(world, environmentSelection.error, {
      systemName: "RenderSystem.extract (environment-selection)"
    });
    throw environmentSelection.error;
  }
  const environment = environmentSelection.value;
  const cullingCameras = cullMode === "external" ? context.cullCameras ?? [] : cameras;
  const frustumPlanes = cullMode === "none" ? [] : buildCameraFrusta(cullingCameras);
  const renderables = [];
  let frustumCulled = 0;
  let frustumTotal = 0;
  const explicitlyHidden = /* @__PURE__ */ new Set();
  let dispatch = [];
  const shadowMembershipEntries = [];
  const materialSnapshotCache = /* @__PURE__ */ new Map();
  const skinnedMaterialSnapshotCache = /* @__PURE__ */ new Map();
  const meshRendererQuery = context.renderables === "none" ? [] : world.query({
    read: [MeshRenderer],
    optional: [
      Transform,
      GlobalTransform,
      MeshFilter,
      Instances,
      Skin,
      Layer,
      MorphWeights,
      SpriteRegionOverride,
      SpriteInstances,
      Points,
      Lines,
      SortKey
    ]
  }).unwrap();
  const resolveArchVersion = (entity) => {
    const values = [
      worldInternal._getArrayView(entity, SpriteInstances, "transforms"),
      worldInternal._getArrayView(entity, SpriteInstances, "regions")
    ];
    let hash = 2166136261;
    for (const value of values) {
      hash = Math.imul(hash ^ (value?.length ?? 0), 16777619) >>> 0;
      if (value === void 0) continue;
      for (let index = 0; index < value.length; index += 1) {
        hash = Math.imul(hash ^ Math.fround(value[index] ?? 0), 16777619) >>> 0;
      }
    }
    return hash;
  };
  const flushPendingDispatch = (pending) => {
    for (const entry of pending) dispatch.push(entry);
  };
  const requestedRows = renderableEntities === void 0 ? meshRendererQuery : {
    *[Symbol.iterator]() {
      for (const entity of renderableEntities) {
        const row = meshRendererQuery.at(entity);
        if (row !== void 0) yield row;
      }
    }
  };
  for (const row of requestedRows) {
    const hasTransform = row.has(Transform);
    const meshFilter = row.get(MeshFilter);
    const hasInstances = row.has(Instances);
    const skin = row.get(Skin);
    const morphWeightsView = worldInternal._getArrayView(row.entity, MorphWeights, "weights");
    const hasMeshFilter = meshFilter !== void 0;
    const hasSkin = skin !== void 0;
    const hasSpriteInstances = row.has(SpriteInstances);
    const points = row.get(Points);
    const lines = row.get(Lines);
    const sortKey = row.get(SortKey)?.value;
    const pointsLinesComponent = points !== void 0 ? "Points" : lines !== void 0 ? "Lines" : void 0;
    const isRenderable = hasTransform && hasMeshFilter;
    const fAssetHandle = meshFilter?.assetHandle;
    const fLayerValue = row.get(Layer)?.value;
    const hasSpriteRegionOverride = row.has(SpriteRegionOverride);
    const skinSkeletonView = skin?.skeleton;
    let archVersion = 0;
    if (hasInstances || hasSpriteInstances) {
      archVersion = resolveArchVersion(row.entity);
    }
    {
      const entity = row.entity;
      const authorVisible = !(isRenderable && visibility?.effective(entity) === "hidden");
      if (!authorVisible) explicitlyHidden.add(entity);
      if (!authorVisible && !retainHidden) {
        continue;
      }
      if (isRenderable && fAssetHandle === 0) {
        continue;
      }
      const layerVal = fLayerValue ?? 0;
      const pendingDispatch = [];
      const materialsView = worldInternal._getArrayView(entity, MeshRenderer, "materials");
      const materialCount = materialsView?.length ?? 0;
      let materialHandles = Array.from(materialsView ?? []);
      let materialBindingSources = materialHandles.map(
        () => "renderer-override"
      );
      let materialBindingDiagnostics = [];
      let gpuDrivenMesh;
      const fAssetHandleVal = fAssetHandle;
      if (fAssetHandleVal !== void 0 && fAssetHandleVal !== 0 && assets !== void 0 && assets !== null) {
        const meshHandle = toShared(fAssetHandleVal);
        const meshRes = resolveAssetHandle(world, meshHandle);
        if (meshRes.ok && meshRes.value.kind === "mesh") {
          const meshAsset = meshRes.value;
          const guid = meshRes.value.guid ?? "<no-guid>";
          gpuDrivenMesh = meshAsset;
          if (!Array.isArray(meshAsset.materialSlots) && world.get(entity, GlyphText).ok) {
            ensureGlyphMeshMaterialSlots(world, meshHandle);
          }
          const resolvedBindings = resolveMeshMaterialBindings(meshAsset, materialsView ?? [], {
            isValidOverride(handle) {
              const resolved = resolveAssetHandle(world, toShared(handle));
              return resolved.ok && resolved.value.kind === "material";
            },
            resolveMeshDefault(defaultGuid) {
              const guidText = AssetGuid.format(defaultGuid);
              if (assets.lookup(guidText)?.kind !== "material") return void 0;
              return internSharedRefFromGuid(world, assets, guidText, "MaterialAsset");
            }
          });
          if (!resolvedBindings.ok) {
            if (resolvedBindings.code === "mesh-material-slots-missing") {
              worldInternal._routeError(
                new AssetError({
                  code: "load-failed",
                  expected: "every MeshAsset producer supplies materialSlots[]",
                  hint: `fix the MeshAsset producer; renderer inheritance never guesses slot topology (mesh=${guid}, entity=${entity}, vertices=${meshAsset.vertices.length}, indices=${meshAsset.indices?.length ?? 0})`,
                  detail: {
                    referencedByGuid: guid,
                    referencedByKind: "mesh",
                    subAssetGuid: "<material-slots-missing>",
                    sourceField: { fieldName: "materialSlots" }
                  }
                }),
                {
                  severity: Severity.Error,
                  systemName: "RenderSystem.extract (mesh-material-slots-missing)"
                }
              );
              continue;
            }
            const materialGuid = AssetGuid.format(resolvedBindings.defaultMaterial);
            worldInternal._routeError(
              new AssetError({
                code: "load-failed",
                expected: `MeshAsset materialSlots[${resolvedBindings.slotIndex}] default ${materialGuid} is ready and a MaterialAsset`,
                hint: `loadByGuid(meshGuid) must recursively load the declared default material; mesh=${guid}, slot=${resolvedBindings.slotIndex}, material=${materialGuid}`,
                detail: {
                  referencedByGuid: guid,
                  referencedByKind: "mesh",
                  subAssetGuid: materialGuid,
                  sourceField: {
                    fieldName: "materialSlots",
                    arrayIndex: resolvedBindings.slotIndex
                  }
                }
              }),
              {
                severity: Severity.Error,
                systemName: "RenderSystem.extract (mesh-default-not-ready)"
              }
            );
            continue;
          }
          materialHandles = resolvedBindings.bindings.map((binding) => binding.handle);
          materialBindingSources = resolvedBindings.bindings.map((binding) => binding.source);
          materialBindingDiagnostics = resolvedBindings.diagnostics.map((diagnostic) => ({
            ...diagnostic,
            detail: diagnostic.code === "mesh-renderer-material-override-overflow" ? {
              expectedCount: meshAsset.materialSlots.length,
              actualCount: materialCount,
              meshAssetGuid: guid
            } : {
              meshAssetGuid: guid,
              slotIndex: diagnostic.slotIndex,
              handle: diagnostic.handle ?? 0
            }
          }));
          for (const diagnostic of resolvedBindings.diagnostics) {
            worldInternal._routeError(
              new AssetError({
                code: diagnostic.code,
                expected: diagnostic.code === "mesh-renderer-material-override-overflow" ? `materials.length <= materialSlots.length (${meshAsset.materialSlots.length})` : `materials[${diagnostic.slotIndex}] resolves to a live MaterialAsset`,
                hint: ASSET_ERROR_HINTS[diagnostic.code],
                detail: diagnostic.code === "mesh-renderer-material-override-overflow" ? {
                  expectedCount: meshAsset.materialSlots.length,
                  actualCount: materialCount,
                  meshAssetGuid: guid
                } : {
                  meshAssetGuid: guid,
                  slotIndex: diagnostic.slotIndex,
                  handle: diagnostic.handle ?? 0
                }
              }),
              {
                severity: Severity.Warning,
                systemName: `RenderSystem.extract (${diagnostic.code})`
              }
            );
          }
        }
      }
      if (materialHandles.length === 0) {
        materialHandles = [0];
        materialBindingSources = ["engine-default"];
      }
      const handleRaw = materialHandles[0] ?? 0;
      const cachedMaterial = handleRaw !== 0 && !hasSpriteRegionOverride && !hasSkin ? materialSnapshotCache.get(handleRaw) : void 0;
      let materialSnap;
      let materialProgramSelections;
      if (cachedMaterial !== void 0) {
        materialSnap = cachedMaterial.snapshot;
        if (isRenderable) {
          appendMaterialDispatchEntries(
            pendingDispatch,
            cachedMaterial.passes,
            entity,
            handleRaw,
            renderables.length,
            layerVal,
            materialSnap.paramSnapshot,
            0,
            materialSnap.materialProgramKeys
          );
        }
      } else if (handleRaw === 0 || assets === void 0 || assets === null) {
        materialSnap = defaultMaterialSnapshot(handleRaw);
      } else {
        const tagged = toShared(handleRaw);
        const stablePersistentCached = !hasSpriteRegionOverride && !hasSkin ? readStablePersistentMaterialSnapshot(
          persistentMaterialSnapshotCache,
          handleRaw,
          assets
        ) : void 0;
        if (stablePersistentCached !== void 0) {
          materialSnapshotCache.set(handleRaw, stablePersistentCached);
          materialSnap = stablePersistentCached.snapshot;
          if (isRenderable) {
            appendMaterialDispatchEntries(
              pendingDispatch,
              stablePersistentCached.passes,
              entity,
              handleRaw,
              renderables.length,
              layerVal,
              materialSnap.paramSnapshot,
              0,
              materialSnap.materialProgramKeys
            );
          }
        } else {
          const res = resolveAssetHandle(world, tagged);
          if (!res.ok) {
            if (isRenderable) {
              const rhiErr = new RhiError({
                code: "asset-not-registered",
                expected: "MeshRenderer.material in AssetRegistry",
                hint: "catalog the material via assetRegistry.catalog(guid, asset) + world.allocSharedRef before spawn, or remove the material field to fall back to default",
                detail: { assetHandle: handleRaw }
              });
              worldInternal._routeError(rhiErr, {
                severity: Severity.Error,
                systemName: "RenderSystem.extract (material asset-not-registered)"
              });
            }
            continue;
          }
          const asset = res.value;
          if (asset.kind !== "material") {
            materialSnap = defaultMaterialSnapshot(handleRaw);
          } else {
            const source = world.sharedRefs.resolve(tagged);
            const programOwner = source.ok && source.value.kind === "material" ? source.value : asset;
            const resolvedResult = walkMaterialPassesOverSharedRefs(world, tagged, assets);
            if (!resolvedResult.ok) {
              const err13 = resolvedResult.error;
              switch (err13.code) {
                case "material-parent-not-found":
                case "material-no-effective-pass":
                case "material-value-unknown":
                case "material-value-type-mismatch":
                case "material-contract-program-mismatch":
                  worldInternal._routeError(err13, {
                    severity: Severity.Error,
                    systemName: `RenderSystem.extract (${err13.code})`
                  });
                  break;
                case "material-circular-inheritance":
                  worldInternal._routeError(err13, {
                    severity: Severity.Error,
                    systemName: "RenderSystem.extract (material-circular-inheritance)"
                  });
                  break;
                default:
                  worldInternal._routeError(err13, {
                    severity: Severity.Error,
                    systemName: `RenderSystem.extract (_materialWalk: ${err13.code})`
                  });
              }
              continue;
            }
            const resolved = resolvedResult.value;
            const allPasses = resolved.passes;
            const materialContext = context.materialContext === void 0 ? void 0 : {
              ...context.materialContext,
              geometry: hasSkin ? "skinned" : context.materialContext.geometry
            };
            try {
              materialProgramSelections = materialProgramSelectionsForMaterial(
                programOwner,
                assets,
                materialContext
              );
            } catch (error) {
              if (isMissingMaterialProgram(error) && materialContext?.geometry === "mesh") {
                try {
                  const skinnedSelections = materialProgramSelectionsForMaterial(
                    programOwner,
                    assets,
                    {
                      ...materialContext,
                      geometry: "skinned"
                    }
                  );
                  if (skinnedSelections?.some(materialProgramSelectionRequiresSkin) === true && gpuDrivenMesh !== void 0) {
                    const hasSkinIndex = gpuDrivenMesh.attributes.skinIndex !== void 0;
                    const hasSkinWeight = gpuDrivenMesh.attributes.skinWeight !== void 0;
                    if (!hasSkinIndex || !hasSkinWeight) {
                      const missing = !hasSkinIndex && !hasSkinWeight ? "both" : !hasSkinIndex ? "skinIndex" : "skinWeight";
                      worldInternal._routeError(new MaterialSkinAttrMissingError(entity, missing), {
                        severity: Severity.Error,
                        systemName: "RenderSystem.extract (material-skin-attr-missing)"
                      });
                      continue;
                    }
                  }
                } catch {
                }
              }
              throw error;
            }
            const materialProgramKeys = materialProgramSelections === void 0 ? void 0 : Object.fromEntries(
              materialProgramSelections.map(({ pass, specializationKey }) => [
                pass,
                specializationKey
              ])
            );
            const materialSceneIndexProgramKeys = materialSceneIndexProgramKeysForMaterial(
              programOwner,
              assets,
              materialContext
            );
            const authoredFirstPassShader = runtimeMaterialShaderIdForMaterial(
              allPasses,
              void 0
            );
            const firstPassShader = runtimeMaterialShaderIdForMaterial(
              allPasses,
              materialProgramKeys
            );
            const pv = materialValuesToLinearRuntime(
              resolved.values,
              materialColorParameterSchema(resolved.parameters ?? [], firstPassShader, assets),
              resolved.colorSpace
            );
            const baseColorPv = pv.baseColor;
            const baseColor = vec3.create(
              baseColorPv?.[0] ?? 1,
              baseColorPv?.[1] ?? 1,
              baseColorPv?.[2] ?? 1
            );
            const metallicPv = typeof pv.metallic === "number" ? pv.metallic : 0;
            const roughnessPv = typeof pv.roughness === "number" ? pv.roughness : 0.5;
            const specularColorPv = pv.specularColor;
            const normalScalePv = materialNormalScale(pv);
            const paramSnap = {};
            for (const [k, v] of Object.entries(pv)) {
              if (typeof v === "number") paramSnap[k] = v;
              else if (typeof v === "string") paramSnap[k] = v;
              else if (Array.isArray(v) && v.every((x) => typeof x === "number")) {
                paramSnap[k] = v;
              }
            }
            const materialParamSchema = materialParamSchemaForMaterial(
              resolved.parameters ?? [],
              authoredFirstPassShader,
              allPasses
            );
            {
              const hasSkinSkel = hasSkin && skinSkeletonView !== void 0 && skinSkeletonView !== void 0 && skinSkeletonView !== 0;
              const isPbrSkinMaterial = materialProgramSelections?.some(materialProgramSelectionRequiresSkin) === true || isStandardPbrSkinMaterialShader(firstPassShader);
              if (hasSkinSkel && !isPbrSkinMaterial) {
                worldInternal._routeError(new SkinMaterialMismatchError(entity, firstPassShader), {
                  severity: Severity.Error,
                  systemName: "RenderSystem.extract (skin-material-mismatch)"
                });
                continue;
              }
              if (isPbrSkinMaterial && fAssetHandleVal !== void 0 && fAssetHandleVal !== 0) {
                const meshHandleForSkinCheck = toShared(fAssetHandleVal);
                const meshResForSkinCheck = resolveAssetHandle(
                  world,
                  meshHandleForSkinCheck
                );
                if (meshResForSkinCheck.ok) {
                  const meshAttrs = meshResForSkinCheck.value.attributes;
                  const hasSkinIdx = meshAttrs.skinIndex !== void 0;
                  const hasSkinWt = meshAttrs.skinWeight !== void 0;
                  if (!hasSkinIdx || !hasSkinWt) {
                    const missing = !hasSkinIdx && !hasSkinWt ? "both" : !hasSkinIdx ? "skinIndex" : "skinWeight";
                    worldInternal._routeError(new MaterialSkinAttrMissingError(entity, missing), {
                      severity: Severity.Error,
                      systemName: "RenderSystem.extract (material-skin-attr-missing)"
                    });
                    continue;
                  }
                }
              }
            }
            const isSprite = firstPassShader === "forgeax::sprite" || firstPassShader === "forgeax::sprite-lit";
            const validateTextureHandle = (fieldName, raw) => {
              let handle;
              const textureRef = materialTextureRef(raw);
              const textureGuid = assetReferenceText(textureRef);
              if (textureGuid !== void 0) {
                if (assets === null || assets === void 0) return void 0;
                const interned = internSharedRefFromGuid(
                  world,
                  assets,
                  textureGuid,
                  "TextureAsset"
                );
                if (interned === void 0) return void 0;
                handle = interned;
              } else if (typeof textureRef === "number") {
                handle = toShared(textureRef);
              } else {
                return void 0;
              }
              if (assets === null || assets === void 0) return handle;
              const declaredFields = materialTextureFields(
                firstPassShader,
                materialParamSchema.length > 0 ? derive(materialParamSchema).textureFieldNames : firstPassShader !== void 0 ? assets.materialShaderTextureFieldNames(firstPassShader) : void 0
              );
              if (declaredFields === void 0) return handle;
              if (!declaredFields.has(fieldName) && !isEngineInjectedTextureField(firstPassShader, fieldName)) {
                return void 0;
              }
              const assetRes = resolveAssetHandle(world, handle);
              if (!assetRes.ok) return void 0;
              const kind = assetRes.value.kind;
              if (kind !== "texture") return void 0;
              return handle;
            };
            const resolveParamHandle = (raw, brand) => {
              const value = materialTextureRef(raw);
              if (typeof value === "number") return toShared(value);
              const guid = assetReferenceText(value);
              if (guid !== void 0) {
                if (assets === null || assets === void 0) return void 0;
                return internSharedRefFromGuid(world, assets, guid, brand);
              }
              return void 0;
            };
            const userRegionFields = materialTextureFields(
              firstPassShader,
              materialParamSchema.length > 0 ? derive(materialParamSchema).textureFieldNames : firstPassShader !== void 0 && assets !== null && assets !== void 0 ? assets.materialShaderTextureFieldNames(firstPassShader) : void 0
            ) ?? BUILTIN_USER_REGION_TEXTURE_FIELDS;
            const authoredTextureFields = collectAuthoredMaterialTextureFields(
              resolved.values,
              firstPassShader,
              materialParamSchema.length > 0 ? materialParamSchema : void 0,
              assets
            );
            const authoredSamplerFields = collectAuthoredMaterialSamplerFields(
              resolved.values,
              authoredTextureFields
            );
            const textureHandles = /* @__PURE__ */ new Map();
            const videoTextureFields = /* @__PURE__ */ new Map();
            for (const field of userRegionFields) {
              const videoHandle = assets !== null && assets !== void 0 ? resolveVideoFieldHandle(pv[field], world, assets) : void 0;
              if (videoHandle !== void 0) {
                videoTextureFields.set(field, videoHandle);
                continue;
              }
              const handle = validateTextureHandle(field, pv[field]);
              if (handle !== void 0) textureHandles.set(field, handle);
            }
            const baseColorTextureHandle = textureHandles.get("baseColorTexture");
            const metallicRoughnessTextureHandle = textureHandles.get("metallicRoughnessTexture");
            const normalTextureHandle = textureHandles.get("normalTexture");
            const samplerHandles = collectMaterialTextureSamplers(
              pv,
              (value) => resolveParamHandle(materialTextureRef(value), "SamplerAsset")
            );
            const emissiveTextureHandle = validateTextureHandle(
              "emissiveTexture",
              pv.emissiveTexture
            );
            const occlusionTextureHandle = validateTextureHandle(
              "occlusionTexture",
              pv.occlusionTexture
            );
            const textureCoordinates = collectMaterialTextureCoordinates(pv);
            const textureSources = collectMaterialTextureSources(
              pv,
              world,
              materialTextureSourceFields(
                materialParamSchema.length > 0 ? materialParamSchema : void 0
              ),
              materialTextureSourceStats,
              materialTextureSourceCache
            );
            const emissivePv = pv.emissive;
            const firstPassTransparent = allPasses[0]?.renderState?.blend !== void 0;
            if (isSprite) {
              let overrideRegion;
              if (hasSpriteRegionOverride) {
                const overrideView = worldInternal._getArrayView(
                  entity,
                  SpriteRegionOverride,
                  "region"
                );
                if (overrideView !== void 0 && overrideView.length >= 4) {
                  overrideRegion = [
                    overrideView[0] ?? 0,
                    overrideView[1] ?? 0,
                    overrideView[2] ?? 1,
                    overrideView[3] ?? 1
                  ];
                }
              }
              const regionPv = paramSnap.region;
              let regionX = overrideRegion?.[0] ?? regionPv?.[0] ?? 0;
              let regionY = overrideRegion?.[1] ?? regionPv?.[1] ?? 0;
              let regionZ = overrideRegion?.[2] ?? regionPv?.[2] ?? 1;
              let regionW = overrideRegion?.[3] ?? regionPv?.[3] ?? 1;
              const flipXPv = typeof pv.flipX === "number" ? pv.flipX : 0;
              const flipYPv = typeof pv.flipY === "number" ? pv.flipY : 0;
              if (flipXPv !== 0) {
                regionX += regionZ;
                regionZ = -regionZ;
              }
              if (flipYPv !== 0) {
                regionY += regionW;
                regionW = -regionW;
              }
              paramSnap.region = [regionX, regionY, regionZ, regionW];
              if (!("slicesAndMode" in paramSnap)) {
                paramSnap.slicesAndMode = [0, 0, 0, 0];
              }
            }
            materialSnap = {
              baseColor,
              metallic: metallicPv,
              roughness: roughnessPv,
              ...resolved.surface?.model === void 0 ? {} : { surfaceModel: resolved.surface.model },
              deferredPass: allPasses.some(
                (pass) => String(
                  pass.renderState?.tags?.LightMode ?? pass.name
                ) === "Deferred"
              ),
              ...specularColorPv !== void 0 && {
                specularColor: [
                  specularColorPv[0] ?? 1,
                  specularColorPv[1] ?? 1,
                  specularColorPv[2] ?? 1
                ]
              },
              normalScale: normalScalePv,
              materialShaderId: firstPassShader,
              materialProgramKeys,
              materialSceneIndexProgramKeys,
              materialHandle: handleRaw,
              renderState: pipelineRenderState(allPasses[0]?.renderState),
              paramSnapshot: paramSnap,
              ...materialParamSchema.length > 0 && { materialParamSchema },
              standardTextureMask: materialStandardTextureMask(
                resolved.parameters,
                firstPassShader,
                pv
              ),
              ...textureCoordinates.size > 0 && { textureCoordinates },
              ...authoredTextureFields === void 0 ? {} : { authoredTextureFields },
              ...samplerHandles.size > 0 && { samplerHandles },
              ...authoredSamplerFields === void 0 ? {} : { authoredSamplerFields },
              ...textureHandles.size > 0 && { textureHandles },
              ...textureSources.size > 0 && { textureSources },
              ...videoTextureFields.size > 0 && { videoTextureFields },
              ...baseColorTextureHandle !== void 0 && {
                baseColorTexture: baseColorTextureHandle
              },
              ...metallicRoughnessTextureHandle !== void 0 && {
                metallicRoughnessTexture: metallicRoughnessTextureHandle
              },
              ...normalTextureHandle !== void 0 && { normalTexture: normalTextureHandle },
              ...emissivePv !== void 0 && {
                emissive: [emissivePv[0] ?? 0, emissivePv[1] ?? 0, emissivePv[2] ?? 0]
              },
              ...typeof pv.emissiveIntensity === "number" && {
                emissiveIntensity: pv.emissiveIntensity
              },
              ...emissiveTextureHandle !== void 0 && {
                emissiveTexture: emissiveTextureHandle
              },
              ...occlusionTextureHandle !== void 0 && {
                occlusionTexture: occlusionTextureHandle
              },
              ...typeof pv.occlusionStrength === "number" && {
                occlusionStrength: pv.occlusionStrength
              },
              transparent: firstPassTransparent
            };
            if (!hasSpriteRegionOverride && !hasSkin) {
              const stored = storeMaterialSnapshot(
                materialSnapshotCache,
                handleRaw,
                materialSnap,
                allPasses,
                asset,
                assets
              );
              if (stored.crossFrameSafe) persistentMaterialSnapshotCache?.set(handleRaw, stored);
            }
            if (isRenderable) {
              appendMaterialDispatchEntries(
                pendingDispatch,
                allPasses,
                entity,
                handleRaw,
                renderables.length,
                layerVal,
                paramSnap,
                0,
                materialProgramKeys
              );
            }
          }
        }
      }
      if (isRenderable && handleRaw === 0) {
        const shadowCasterTags = { LightMode: "ShadowCaster" };
        const nextRenderableIndex = renderables.length;
        pendingDispatch.push({
          entityIndex: entity,
          materialHandle: 0,
          renderableIndex: nextRenderableIndex,
          passIndex: 0,
          queue: 2e3,
          layer: layerVal,
          tags: shadowCasterTags,
          renderState: void 0,
          defines: void 0,
          vertexEntry: "vs_main",
          fragmentEntry: void 0,
          materialShaderId: "forgeax::default-shadow-caster",
          paramSnapshot: {}
        });
        appendMaterialDispatchEntries(
          pendingDispatch,
          [DEFAULT_FORWARD_PASS],
          entity,
          0,
          nextRenderableIndex,
          layerVal,
          {},
          1
        );
      }
      if (isRenderable) {
        let skinSlice;
        let skinPose;
        const skinIdentity = hasSkin ? skinPaletteIdentity(world, entity) : void 0;
        const releaseSkinIdentity = () => {
          if (skinIdentity !== void 0) {
            skinPaletteAllocator?.releasePersistentSlice(skinIdentity);
          }
        };
        if (hasSkin) {
          const skeletonHandleRaw = skinSkeletonView;
          if (skeletonHandleRaw !== void 0 && skeletonHandleRaw !== 0 && assets !== void 0 && assets !== null) {
            if (hasInstances) {
              worldInternal._routeError(new SkinInstancesCoexistForbiddenError(entity), {
                severity: Severity.Error,
                systemName: "RenderSystem.extract (skin-instances-coexist)"
              });
              releaseSkinIdentity();
              continue;
            }
            const skeletonHandle = toShared(skeletonHandleRaw);
            const skeletonRes = resolveAssetHandle(world, skeletonHandle);
            if (!skeletonRes.ok || skeletonRes.value.kind !== "skeleton") {
              worldInternal._routeError(new SkeletonResolveFailedError(entity, skeletonHandleRaw), {
                severity: Severity.Error,
                systemName: "RenderSystem.extract (skeleton-resolve-failed)"
              });
              releaseSkinIdentity();
              continue;
            }
            const skeleton = skeletonRes.value;
            const skinJoints = skin?.joints;
            if (skinJoints === void 0) {
              releaseSkinIdentity();
              continue;
            }
            const jointsLength = skinJoints.length;
            if (jointsLength !== skeleton.jointCount) {
              worldInternal._routeError(
                new JointCountMismatchError(entity, skeleton.jointCount, jointsLength),
                {
                  severity: Severity.Error,
                  systemName: "RenderSystem.extract (joint-count-mismatch)"
                }
              );
              releaseSkinIdentity();
              continue;
            }
            const jointWorlds = new Array(skeleton.jointCount);
            let jointDangling = -1;
            for (let jIdx = 0; jIdx < skeleton.jointCount; jIdx++) {
              const jointEntityRaw = skinJoints[jIdx] ?? 0;
              const jointEntity = jointEntityRaw;
              const jointWorld = worldInternal._getArrayView(jointEntity, GlobalTransform, "world");
              if (jointWorld === void 0) {
                jointDangling = jIdx;
                break;
              }
              const jointWorldMat = mat4.create();
              jointWorldMat.set(jointWorld);
              jointWorlds[jIdx] = jointWorldMat;
            }
            if (jointDangling >= 0) {
              worldInternal._routeError(new JointEntityDanglingError(entity, jointDangling), {
                severity: Severity.Error,
                systemName: "RenderSystem.extract (joint-entity-dangling)"
              });
              releaseSkinIdentity();
              continue;
            }
            const ibmFlat = skeleton.inverseBindMatrices;
            const ibms = new Array(skeleton.jointCount);
            for (let jIdx = 0; jIdx < skeleton.jointCount; jIdx++) {
              ibms[jIdx] = ibmFlat.subarray(jIdx * 16, jIdx * 16 + 16);
            }
            if (skinPaletteAllocator !== null) {
              const identity = skinPaletteIdentity(world, entity);
              const generation = skeletonHandleRaw >>> 0 ^ skeleton.jointCount;
              const bounds = hasFiniteOrderedLocalAabb(skeleton.bounds) ? new Float32Array(skeleton.bounds) : void 0;
              skinPaletteAllocator.observePersistentJoints(identity, ibms, jointWorlds);
              const receipt = skinPaletteAllocator.allocatePersistentSlice({
                identity,
                generation: generation >>> 0,
                jointCount: skeleton.jointCount,
                ...bounds === void 0 ? {} : { bounds }
              });
              skinPaletteAllocator.writePersistentJointPalette(receipt, ibms, jointWorlds);
              skinSlice = receipt;
            } else {
              skinPose = {
                identity: skinPaletteIdentity(world, entity),
                generation: (skeletonHandleRaw >>> 0 ^ skeleton.jointCount) >>> 0,
                jointCount: skeleton.jointCount,
                ...hasFiniteOrderedLocalAabb(skeleton.bounds) ? { bounds: new Float32Array(skeleton.bounds) } : {},
                inverseBindMatrices: ibms,
                jointWorlds
              };
            }
          }
        }
        if (skinSlice === void 0 && skinPose === void 0 && hasSkin) {
          releaseSkinIdentity();
          if (materialSnap.materialShaderId === "forgeax::pbr-skin" || materialProgramSelections?.some(materialProgramSelectionRequiresSkin) === true) {
            pendingDispatch.length = 0;
            continue;
          }
        }
        const worldView = worldInternal._getArrayView(entity, GlobalTransform, "world");
        if (worldView === void 0) {
          releaseSkinIdentity();
          continue;
        }
        const worldMat = new Float32Array(worldView);
        const transformSnap = { world: worldMat };
        const materialsArr = [materialSnap];
        if (assets !== void 0 && assets !== null) {
          for (let mi = 1; mi < materialHandles.length; mi++) {
            const subHandle = materialHandles[mi] ?? 0;
            const subCache = hasSkin ? skinnedMaterialSnapshotCache : materialSnapshotCache;
            const cachedSubmaterial = subCache.get(subHandle);
            materialsArr.push(
              cachedSubmaterial?.snapshot ?? resolveMaterialSnapshot(
                subHandle,
                world,
                assets,
                subCache,
                hasSkin ? void 0 : persistentMaterialSnapshotCache,
                context.materialContext === void 0 ? void 0 : {
                  ...context.materialContext,
                  geometry: hasSkin ? "skinned" : context.materialContext.geometry
                },
                materialTextureSourceStats,
                materialTextureSourceCache
              )
            );
          }
        }
        if (isRenderable && assets !== void 0 && assets !== null) {
          for (let mi = 1; mi < materialHandles.length; mi++) {
            const subHandle = materialHandles[mi] ?? 0;
            if (subHandle === handleRaw) continue;
            const subEntry = (hasSkin ? skinnedMaterialSnapshotCache : materialSnapshotCache).get(subHandle) ?? (hasSkin ? void 0 : readPersistentMaterialSnapshot(
              persistentMaterialSnapshotCache,
              subHandle,
              assets
            ));
            appendMaterialDispatchEntries(
              pendingDispatch,
              subEntry?.passes ?? (subHandle === 0 ? [DEFAULT_FORWARD_PASS] : []),
              entity,
              subHandle,
              renderables.length,
              layerVal,
              materialsArr[mi]?.paramSnapshot,
              0,
              materialsArr[mi]?.materialProgramKeys
            );
          }
        }
        let spriteInstancesSnap;
        if (hasSpriteInstances) {
          if (hasInstances) {
            worldInternal._routeError(
              new SpriteInstancesMutuallyExclusiveWithInstancesError(entity),
              {
                severity: Severity.Error,
                systemName: "RenderSystem.extract (sprite-instances-mutually-exclusive)"
              }
            );
            continue;
          }
          if (materialSnap.materialShaderId !== "forgeax::sprite" && materialSnap.materialShaderId !== "forgeax::sprite-lit") {
            worldInternal._routeError(
              new SpriteInstancesRequiresSpriteShaderError(
                entity,
                materialSnap.materialShaderId ?? "undefined"
              ),
              {
                severity: Severity.Error,
                systemName: "RenderSystem.extract (sprite-instances-requires-sprite-shader)"
              }
            );
            continue;
          }
          const transforms = worldInternal._getArrayView(entity, SpriteInstances, "transforms");
          const regions = worldInternal._getArrayView(entity, SpriteInstances, "regions");
          if (transforms !== void 0 && regions !== void 0) {
            const transformsLength = transforms.length;
            const regionsLength = regions.length;
            const tCount = transformsLength / 16;
            const rCount = regionsLength / 4;
            if (transformsLength % 16 !== 0 || regionsLength % 4 !== 0 || tCount !== rCount) {
              worldInternal._routeError(
                new SpriteInstancesCountMismatchError(transformsLength, regionsLength),
                {
                  severity: Severity.Error,
                  systemName: "RenderSystem.extract (sprite-instances-count-mismatch)"
                }
              );
              continue;
            }
            const transformsCopy = new Float32Array(transforms);
            const regionsCopy = new Float32Array(regions);
            spriteInstancesSnap = {
              transforms: transformsCopy,
              regions: regionsCopy,
              instanceCount: tCount,
              cacheKey: entity,
              archVersion
            };
          }
        }
        let localAabb;
        let lods;
        let lodHysteresis;
        let morph;
        const assetHandleRaw = Math.round(fAssetHandle ?? 0);
        if (assetHandleRaw !== 0) {
          const meshRes = resolveAssetHandle(world, toShared(assetHandleRaw));
          if (meshRes.ok && meshRes.value.kind === "mesh") {
            const meshAsset = meshRes.value;
            lods = meshAsset.lods;
            lodHysteresis = meshAsset.lodHysteresis;
            morph = morphSnapshotFor(meshAsset, morphWeightsView);
            const meshAabb = skinSlice?.bounds ?? meshAsset.aabb;
            if (morph === void 0 && hasFiniteOrderedLocalAabb(meshAabb)) {
              localAabb = new Float32Array(meshAabb);
            }
          }
        }
        const pointsLinesStyle = points !== void 0 ? (() => {
          const shape = pointShapeFromU32(points.shape);
          return shape === void 0 ? void 0 : { kind: "points", sizePx: points.sizePx, shape };
        })() : lines === void 0 ? void 0 : { kind: "lines", widthPx: lines.widthPx };
        const cullingLocalAabb = expandPointsLinesBounds(localAabb ?? [], pointsLinesStyle);
        const pointsLines = pointsLinesComponent === void 0 ? void 0 : {
          worldId: context.worldId,
          entityKey: entity,
          component: pointsLinesComponent,
          meshHandle: assetHandleRaw,
          meshGeneration: assets?.catalogEpoch ?? 0,
          materialHandle: handleRaw,
          materialGeneration: assets?.catalogEpoch ?? 0,
          style: pointsLinesStyle,
          layer: layerVal,
          sortKey,
          visible: true,
          sourceBounds: cullingLocalAabb,
          viewport: { width: 0, height: 0, dpr: 1 },
          projection: identityProjection()
        };
        let instancesSnap;
        if (hasInstances) {
          const transforms = worldInternal._getArrayView(entity, Instances, "transforms") ?? new Float32Array();
          const invalid5 = validateInstanceTransforms(transforms);
          if (invalid5 !== void 0) {
            worldInternal._routeError(invalid5, {
              severity: Severity.Error,
              systemName: "RenderSystem.extract (Instances transforms)"
            });
            continue;
          }
          const projected = instanceCollections?.project(world, entity, transforms);
          instancesSnap = {
            transforms: projected?.transforms ?? new Float32Array(transforms),
            instanceCount: transforms.length / 16,
            cacheKey: entity,
            archVersion: projected === void 0 ? archVersion : 0,
            ...projected === void 0 ? {} : {
              collectionId: projected.collectionId,
              revision: projected.revision,
              generations: projected.generations
            }
          };
        }
        const baseRenderable = {
          assetHandle: Math.round(fAssetHandle ?? 0),
          transform: transformSnap,
          ...lods === void 0 ? {} : { lods },
          ...lodHysteresis === void 0 ? {} : { lodHysteresis },
          ...localAabb !== void 0 ? { localAabb: cullingLocalAabb } : {},
          material: materialSnap,
          materials: materialsArr,
          materialBindingSources,
          materialBindingDiagnostics,
          worldId: context.worldId,
          entityKey: entity,
          ...authorVisible ? {} : { authorVisible: false },
          ...skinSlice !== void 0 ? { skin: skinSlice } : {},
          ...skinPose === void 0 ? {} : { skinPose },
          ...skin?.joints === void 0 ? {} : { skinJointEntities: Array.from(skin.joints, (joint) => Number(joint)) },
          ...morph !== void 0 ? { morph } : {},
          ...instancesSnap !== void 0 ? { instances: instancesSnap } : {},
          ...spriteInstancesSnap !== void 0 ? { spriteInstances: spriteInstancesSnap } : {},
          ...pointsLines !== void 0 ? { pointsLines } : {}
        };
        const gpuDrivenDraws = skinPose === void 0 ? buildGpuDrivenDraws({
          mesh: gpuDrivenMesh,
          materials: materialsArr,
          fallbackMaterial: materialSnap,
          baseSnapshot: baseRenderable,
          ...getMaterialShaderArtifact === void 0 ? {} : { getMaterialShaderArtifact },
          ...lods === void 0 ? {} : {
            lodMeshes: lods.map((lod) => {
              const lower = assets?.lookup(lod.mesh);
              return lower?.kind === "mesh" ? lower : void 0;
            })
          }
        }) : [];
        for (const draw of gpuDrivenDraws) {
          if (draw.preparationError === void 0) continue;
          worldInternal._routeError(draw.preparationError, {
            severity: Severity.Error,
            systemName: `RenderSystem.extract (gpu-driven-preparation:${draw.preparationError.code})`
          });
        }
        const renderable = morph === void 0 && gpuDrivenDraws.length > 0 ? { ...baseRenderable, gpuDrivenDraws } : baseRenderable;
        if (localAabb !== void 0) {
          const derivedInstancesBounds = instancesSnap === void 0 || instancesSnap.instanceCount === 0 ? void 0 : deriveInstancesUnionBounds({
            meshAabb: cullingLocalAabb,
            entityWorld: transformSnap.world,
            transforms: instancesSnap.transforms
          });
          if (instancesSnap?.instanceCount === 0) ; else if (hasInstances && (instancesSnap === void 0 || derivedInstancesBounds === void 0)) ; else {
            const worldAabb = box3.create();
            if (derivedInstancesBounds !== void 0) {
              worldAabb[0] = derivedInstancesBounds[0] ?? 0;
              worldAabb[1] = derivedInstancesBounds[1] ?? 0;
              worldAabb[2] = derivedInstancesBounds[2] ?? 0;
              worldAabb[3] = derivedInstancesBounds[3] ?? 0;
              worldAabb[4] = derivedInstancesBounds[4] ?? 0;
              worldAabb[5] = derivedInstancesBounds[5] ?? 0;
            } else {
              box3.transformBox3(worldAabb, cullingLocalAabb, transformSnap.world);
            }
            frustumTotal += 1;
            let visible = frustumPlanes.length === 0;
            for (let ci = 0; ci < frustumPlanes.length; ci++) {
              const planes = frustumPlanes[ci];
              if (planes.length === 0) {
                visible = true;
                break;
              }
              if (frustum.intersectsBox(planes, worldAabb)) {
                visible = true;
                break;
              }
            }
            if (!visible) {
              frustumCulled += 1;
              const shadowVisible = shadowFrusta.length > 0 && pendingDispatch.some((entry) => entry.tags.LightMode === "ShadowCaster") && shadowFrusta.some(
                (lightPlanes) => frustum.intersectsBox(lightPlanes, worldAabb)
              );
              if (!shadowVisible) continue;
              for (let i = pendingDispatch.length - 1; i >= 0; i -= 1) {
                if (pendingDispatch[i]?.tags.LightMode !== "ShadowCaster") {
                  pendingDispatch.splice(i, 1);
                }
              }
            }
          }
        }
        if (!authorVisible) pendingDispatch.length = 0;
        const localShadowMembershipEntries = [];
        if (gpuDrivenMesh !== void 0) {
          const worldEntity = worldEntityKey(context.worldId, entity);
          for (const [drawItemIndex, submesh] of gpuDrivenMesh.submeshes.entries()) {
            if (submesh.topology !== "triangle-list" && submesh.topology !== "triangle-strip") {
              continue;
            }
            const material = materialsArr[submesh.materialSlot] ?? materialSnap;
            const materialHandle = material.materialHandle ?? -1;
            const shadowEntries = pendingDispatch.filter(
              (entry) => entry.tags.LightMode === "ShadowCaster" && entry.materialHandle === materialHandle
            );
            const draw = renderable.gpuDrivenDraws?.find(
              (candidate, compactIndex) => gpuDrivenSourceDrawItemIndex(candidate, compactIndex) === drawItemIndex
            );
            const cpuReason = shadowCasterCpuReason(
              material,
              draw,
              shadowEntries,
              morph,
              skinSlice
            );
            for (const entry of shadowEntries) {
              const membership = {
                worldEntity,
                renderableIndex: renderables.length,
                drawItemIndex,
                materialHandle,
                passIndex: entry.passIndex,
                ...entry.materialShaderId === void 0 ? {} : { materialShaderId: entry.materialShaderId },
                ...entry.vertexEntry === void 0 ? {} : { vertexEntry: entry.vertexEntry },
                ...entry.fragmentEntry === void 0 ? {} : { fragmentEntry: entry.fragmentEntry },
                ...entry.renderState === void 0 ? {} : { renderState: entry.renderState },
                ...cpuReason === void 0 ? {} : { cpuReason },
                gpuDrivenEligible: cpuReason === void 0
              };
              shadowMembershipEntries.push(membership);
              localShadowMembershipEntries.push(membership);
            }
          }
        }
        const shadowCasterPasses = localShadowMembershipEntries.map((membership) => ({
          drawItemIndex: membership.drawItemIndex,
          materialHandle: membership.materialHandle,
          passIndex: membership.passIndex,
          ...membership.materialShaderId === void 0 ? {} : { materialShaderId: membership.materialShaderId },
          ...membership.renderState === void 0 ? {} : { renderState: membership.renderState },
          ...membership.cpuReason === void 0 ? {} : { cpuReason: membership.cpuReason }
        }));
        const renderableWithShadowPasses = shadowCasterPasses.length === 0 ? renderable : { ...renderable, shadowCasterPasses };
        flushPendingDispatch(pendingDispatch);
        renderables.push(renderableWithShadowPasses);
      }
    }
  }
  dispatch = sortDispatchByQueue(dispatch);
  const shadowCasterEntityKeys = /* @__PURE__ */ new Set();
  const shadowCasterDrawKeys = /* @__PURE__ */ new Set();
  const shadowCasterMembership = /* @__PURE__ */ new Map();
  for (const entry of dispatch) {
    if (entry.tags.LightMode !== "ShadowCaster") continue;
    const renderable = renderables[entry.renderableIndex];
    if (renderable !== void 0) {
      const worldEntity = worldEntityKey(renderable.worldId, renderable.entityKey);
      shadowCasterEntityKeys.add(worldEntity);
    }
  }
  for (const membership of shadowMembershipEntries) {
    const key = gpuDrivenShadowDrawKey(
      membership.worldEntity,
      membership.materialHandle,
      membership.drawItemIndex,
      membership.passIndex
    );
    shadowCasterDrawKeys.add(key);
    shadowCasterMembership.set(key, membership);
    shadowCasterEntityKeys.add(membership.worldEntity);
  }
  const postProcessParams = /* @__PURE__ */ new Map();
  const postProcessParamsQuery = world.query({ with: [PostProcessParams] }).unwrap();
  for (const row of postProcessParamsQuery) {
    const entity = row.entity;
    const read = world.get(entity, PostProcessParams);
    if (!read.ok) continue;
    postProcessParams.set(read.value.shader, read.value.data);
  }
  const tonemapCamera = cameras[0];
  if (tonemapCamera !== void 0) {
    postProcessParams.set(STANDARD_OUTPUT_TRANSFORM_FEATURE_ID, tonemapParams(tonemapCamera));
  }
  return {
    cameras,
    auxiliaryCameras,
    cubeCameras,
    reflectionProbes,
    lights,
    environment,
    environmentReady: true,
    ...volumetricFog === void 0 ? {} : { volumetricFog },
    ...cloudLayer === void 0 ? {} : { cloudLayer },
    renderables,
    dispatch,
    shadowCasterEntityKeys,
    shadowCasterDrawKeys,
    ...shadowCasterMembership.size === 0 ? {} : { shadowCasterMembership: [...shadowCasterMembership.values()] },
    skylight,
    skylightCount,
    lightProbes,
    skybox,
    skyboxCount,
    fog,
    ...fogFailure === void 0 ? {} : { fogFailure },
    frustumStats: { culled: frustumCulled, total: frustumTotal },
    visibilityStats: { explicitlyHidden: explicitlyHidden.size },
    materialTextureSources: materialTextureSourceStats,
    postProcessParams,
    visibilitySnapshots: [context.visibility],
    featureVisibilitySnapshots: [{ world, snapshot: context.visibility }],
    hiddenEntityReports: [...explicitlyHidden].map((entity) => ({ world, entity }))
  };
}
var DEFAULT_MATERIAL_SNAPSHOT = Object.freeze({
  baseColor: vec3.create(0.5, 0.5, 0.5),
  metallic: 0,
  roughness: 1,
  materialHandle: 0
});
function defaultMaterialSnapshot(materialHandle = 0) {
  return materialHandle === 0 ? DEFAULT_MATERIAL_SNAPSHOT : { ...DEFAULT_MATERIAL_SNAPSHOT, materialHandle };
}
function identityProjection() {
  const projection = new Float32Array(16);
  projection[0] = 1;
  projection[5] = 1;
  projection[10] = 1;
  projection[15] = 1;
  return projection;
}

// src/render-system-extract.ts
function buildRectAreaWorldFrame(input) {
  const center = vec3.create(input.center[0] ?? 0, input.center[1] ?? 0, input.center[2] ?? 0);
  const axisX = vec3.normalize(
    vec3.create(),
    vec3.create(input.axisX[0] ?? 0, input.axisX[1] ?? 0, input.axisX[2] ?? 0)
  );
  const axisY = vec3.normalize(
    vec3.create(),
    vec3.create(input.axisY[0] ?? 0, input.axisY[1] ?? 0, input.axisY[2] ?? 0)
  );
  const normal = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), axisX, axisY));
  normal[0] = normal[0] === 0 ? 0 : normal[0] ?? 0;
  normal[1] = normal[1] === 0 ? 0 : normal[1] ?? 0;
  normal[2] = normal[2] === 0 ? 0 : normal[2] ?? 0;
  return {
    center,
    axisX,
    axisY,
    normal,
    halfWidth: Math.max(0, input.width * 0.5),
    halfHeight: Math.max(0, input.height * 0.5)
  };
}
function rectAreaFacesPoint(frame, point) {
  const toPoint = vec3.create(
    (point[0] ?? 0) - (frame.center[0] ?? 0),
    (point[1] ?? 0) - (frame.center[1] ?? 0),
    (point[2] ?? 0) - (frame.center[2] ?? 0)
  );
  return vec3.dot(frame.normal, toPoint) > 0;
}
function sortDispatchByQueue(entries) {
  return entries.slice().sort((a, b) => a.queue - b.queue);
}
var DEFAULT_FORWARD_PASS = {
  name: "forward",
  program: { module: "forgeax::default-unlit", vertexEntry: "vs_main", fragmentEntry: "fs_main" },
  renderState: { tags: { LightMode: "Forward" }, queue: 2e3 }
};
function appendMaterialDispatchEntries(pendingDispatch, passes, entity, materialHandle, renderableIndex, layer, paramSnapshot, passIndexOffset = 0, materialProgramKeys) {
  const matchedPasses = selectPasses(passes, {});
  for (let pIdx = 0; pIdx < matchedPasses.length; pIdx++) {
    const pass = matchedPasses[pIdx];
    if (pass === void 0) continue;
    const passState = pass.renderState ?? {};
    const authoredShaderId = runtimeMaterialShaderId(pass.program.module, pass.name);
    const dispatchShaderId = materialProgramKeys === void 0 ? authoredShaderId : materialProgramKeys[pass.name];
    if (materialProgramKeys !== void 0 && dispatchShaderId === void 0)
      throw new Error(`Missing published material program for Pass ${pass.name}`);
    pendingDispatch.push({
      entityIndex: entity,
      materialHandle,
      renderableIndex,
      passIndex: passIndexOffset + pIdx,
      queue: passState.queue ?? 2e3,
      layer,
      tags: passState.tags ?? {},
      renderState: pipelineRenderState(passState),
      // Material module identity is already closed in the cooked program.
      // It must never become a draw-time define map.
      defines: void 0,
      vertexEntry: pass.program.vertexEntry,
      fragmentEntry: pass.program.fragmentEntry,
      materialShaderId: dispatchShaderId,
      paramSnapshot,
      ...passState.stencilReference !== void 0 && {
        stencilReference: passState.stencilReference
      }
    });
  }
}
function selectCameraTargetViews(candidates, options) {
  const display = candidates.find(
    (candidate) => candidate.entityKey === options.displayEntityKey && candidate.target === void 0
  );
  const rejected = [];
  const ordered = candidates.filter((candidate) => candidate.target !== void 0).sort((left, right) => left.worldId - right.worldId || left.entityKey - right.entityKey);
  const auxiliary = [];
  const seenTargets = /* @__PURE__ */ new Set();
  for (const candidate of ordered) {
    const duplicate = candidate.target !== void 0 && seenTargets.has(candidate.target);
    if (candidate.target !== void 0) seenTargets.add(candidate.target);
    if (candidate.entityKey === options.displayEntityKey) {
      rejected.push({ entityKey: candidate.entityKey, reason: "display-target" });
      continue;
    }
    if (candidate.target === void 0 || duplicate) {
      rejected.push({ entityKey: candidate.entityKey, reason: "duplicate-target" });
      continue;
    }
    if (auxiliary.length >= Math.max(0, options.budget)) {
      rejected.push({ entityKey: candidate.entityKey, reason: "budget" });
      continue;
    }
    auxiliary.push(candidate);
  }
  return {
    display,
    auxiliary: Object.freeze(auxiliary),
    rejected: Object.freeze(rejected)
  };
}
var Severity = Object.freeze({ Error: "error", Warning: "warning" });
function createWorldInternalView(world) {
  return {
    _routeError(error, ctx) {
      routeWorldError(world, error, { systemName: ctx.systemName });
    },
    _getArrayView(entity, component, fieldName) {
      return readRenderArrayView(world, entity, component, fieldName);
    }
  };
}
function resolveCameraTarget(world, raw) {
  if (raw === void 0 || raw <= 0) return void 0;
  const resolved = world.sharedRefs.resolve(
    toShared(Math.round(raw))
  );
  return resolved.ok ? resolved.value : void 0;
}
var BUILTIN_USER_REGION_TEXTURE_FIELDS = [
  "baseColorTexture",
  "metallicRoughnessTexture",
  "normalTexture",
  "specularColorTexture",
  "emissiveTexture",
  "occlusionTexture",
  "transmissionTexture",
  "thicknessTexture"
];
var BUILTIN_USER_REGION_TEXTURE_FIELD_SET = new Set(BUILTIN_USER_REGION_TEXTURE_FIELDS);
var BUILTIN_BASE_COLOR_TEXTURE_FIELD_SET = /* @__PURE__ */ new Set(["baseColorTexture"]);
function materialTextureFields(shaderId, fields) {
  if (fields !== void 0 && fields.size > 0) return fields;
  if (shaderId === "forgeax::default-standard-pbr" || shaderId === "forgeax::default-standard-pbr-skin" || shaderId === "forgeax::pbr-skin") {
    return BUILTIN_USER_REGION_TEXTURE_FIELD_SET;
  }
  if (shaderId === "forgeax::default-unlit" || shaderId === "forgeax::sprite" || shaderId === "forgeax::sprite-lit") {
    return BUILTIN_BASE_COLOR_TEXTURE_FIELD_SET;
  }
  return fields;
}
function declaredMaterialTextureFields(shaderId, paramSchema, assets) {
  return materialTextureFields(
    shaderId,
    paramSchema !== void 0 ? derive(paramSchema).textureFieldNames : shaderId !== void 0 ? assets.materialShaderTextureFieldNames(shaderId) : void 0
  );
}
function collectAuthoredMaterialTextureFields(values, shaderId, paramSchema, assets) {
  const fields = declaredMaterialTextureFields(shaderId, paramSchema, assets);
  if (fields === void 0) return void 0;
  const authored = /* @__PURE__ */ new Set();
  for (const field of fields) {
    if (Object.hasOwn(values, field)) authored.add(field);
  }
  return authored.size === 0 ? void 0 : authored;
}
function collectAuthoredMaterialSamplerFields(values, textureFields) {
  const authored = /* @__PURE__ */ new Set();
  for (const field of textureFields ?? []) {
    if (materialTextureValue(values[field])?.sampler !== void 0) authored.add(field);
  }
  if (Object.hasOwn(values, "sampler") && values.sampler !== void 0) {
    authored.add("baseColorTexture");
  }
  return authored.size === 0 ? void 0 : authored;
}
function runtimeMaterialShaderId(module, passName) {
  if (passName === "shadow-caster" && (module === "forgeax_material::standard" || module === "forgeax_material::unlit" || module === "forgeax::default-standard-pbr" || module === "forgeax::default-unlit")) {
    return "forgeax::default-shadow-caster";
  }
  switch (module) {
    case "forgeax_material::standard":
      return "forgeax::default-standard-pbr";
    case "forgeax_material::unlit":
      return "forgeax::default-unlit";
    case "forgeax_material::sprite":
      return "forgeax::sprite";
    case "forgeax_material::sprite-lit":
      return "forgeax::sprite-lit";
    default:
      return module;
  }
}
function materialProgramKeysForMaterial(material, assets, context) {
  return materialProgramKeysForAddress(material, assets, context, "direct");
}
function materialProgramSelectionsForMaterial(material, assets, context, address = "direct") {
  const projection = assets.getMaterialProjectionForPayload(material);
  if (projection === void 0) return void 0;
  if (context === void 0)
    throw new Error("Published material selection requires renderer-owned compiler context");
  return projection.passes.map((pass) => {
    const mode = String(
      pass.renderState?.tags?.LightMode ?? pass.name
    );
    const passKind = /shadow/i.test(mode) ? "shadow" : /depth/i.test(mode) ? "depth" : "forward";
    const selectedContext = {
      ...context,
      pass: passKind,
      pipeline: /deferred|gbuffer/i.test(mode) ? "deferred" : context.pipeline
    };
    const selected = selectMaterialPassProgram(projection, pass.name, selectedContext, address);
    return {
      pass: pass.name,
      context: selectedContext,
      specializationKey: selected.specializationKey,
      ...selected.abi === void 0 ? {} : { abi: selected.abi }
    };
  });
}
function materialSceneIndexProgramKeysForMaterial(material, assets, context) {
  const projection = assets.getMaterialProjectionForPayload(material);
  if (projection === void 0) return void 0;
  if (context === void 0)
    throw new Error("Published material selection requires renderer-owned compiler context");
  const entries = {};
  for (const pass of projection.passes) {
    const mode = String(
      pass.renderState?.tags?.LightMode ?? pass.name
    );
    const passKind = /shadow/i.test(mode) ? "shadow" : /depth/i.test(mode) ? "depth" : "forward";
    const selectedContext = {
      ...context,
      pass: passKind,
      pipeline: /deferred|gbuffer/i.test(mode) ? "deferred" : context.pipeline
    };
    try {
      const selected = selectMaterialPassProgram(
        projection,
        pass.name,
        selectedContext,
        "scene-index"
      );
      entries[pass.name] = { specializationKey: selected.specializationKey, pass: passKind };
    } catch (error) {
      if (!isMissingMaterialProgram2(error)) throw error;
    }
  }
  return Object.keys(entries).length === 0 ? void 0 : entries;
}
function isMissingMaterialProgram2(error) {
  return error !== null && typeof error === "object" && error.code === "material-specialization-not-cooked";
}
function materialProgramKeysForAddress(material, assets, context, address) {
  const selections = materialProgramSelectionsForMaterial(material, assets, context, address);
  return selections === void 0 ? void 0 : Object.fromEntries(
    selections.map(({ pass, specializationKey }) => [pass, specializationKey])
  );
}
function runtimeMaterialShaderIdForMaterial(passes, programs) {
  const pass = passes.find(
    (pass2) => !/shadow|depth/i.test(
      String(
        pass2.renderState?.tags?.LightMode ?? pass2.name
      )
    )
  ) ?? passes[0];
  if (pass === void 0) return void 0;
  return programs === void 0 ? runtimeMaterialShaderId(pass.program.module, pass.name) : programs[pass.name];
}
function pipelineRenderState(renderState) {
  if (renderState === void 0) return void 0;
  const {
    cullMode,
    depthCompare,
    depthWriteEnabled,
    blend,
    alphaToCoverageEnabled,
    stencil,
    stencilReadMask,
    stencilWriteMask,
    frontFace
  } = renderState;
  if (cullMode === void 0 && depthCompare === void 0 && depthWriteEnabled === void 0 && blend === void 0 && alphaToCoverageEnabled === void 0 && stencil === void 0 && stencilReadMask === void 0 && stencilWriteMask === void 0 && frontFace === void 0) {
    return void 0;
  }
  return {
    ...cullMode !== void 0 && { cullMode },
    ...depthCompare !== void 0 && { depthCompare },
    ...depthWriteEnabled !== void 0 && { depthWriteEnabled },
    ...blend !== void 0 && { blend },
    ...alphaToCoverageEnabled !== void 0 && { alphaToCoverageEnabled },
    ...stencil !== void 0 && { stencil },
    ...stencilReadMask !== void 0 && { stencilReadMask },
    ...stencilWriteMask !== void 0 && { stencilWriteMask },
    ...frontFace !== void 0 && { frontFace }
  };
}
function shadowCasterCpuReason(material, draw, shadowEntries, morph, skin) {
  if (shadowEntries.length !== 1) return "multi-pass";
  if (material.transparent === true || material.renderState?.blend !== void 0) {
    return "transparent";
  }
  if (morph !== void 0) return "morph";
  const shadowEntry = shadowEntries[0];
  if (shadowEntry?.renderState !== void 0) return "unsupported-render-state";
  if (draw === void 0) return "missing-gpu-draw";
  if (draw.prepared === void 0) return "unprepared";
  const preparedMaterial = draw.prepared.identity.material;
  const preparedDeformation = draw.prepared.identity.deformation;
  const materialContractMatches = preparedMaterial === material.materialShaderId;
  const deformationContractMatches = skin === void 0 && preparedDeformation === "rigid" || skin !== void 0 && preparedDeformation === "skin";
  if (!materialContractMatches || !deformationContractMatches) return "prepared-contract";
  if (preparedDeformation === "skin" && !hasFiniteOrderedSkinBounds(skin?.bounds)) {
    return "missing-skin-bounds";
  }
  return void 0;
}
function hasFiniteOrderedSkinBounds(bounds) {
  if (bounds === void 0 || bounds.length !== 6) return false;
  const minX = bounds[0];
  const minY = bounds[1];
  const minZ = bounds[2];
  const maxX = bounds[3];
  const maxY = bounds[4];
  const maxZ = bounds[5];
  return minX !== void 0 && minY !== void 0 && minZ !== void 0 && maxX !== void 0 && maxY !== void 0 && maxZ !== void 0 && Number.isFinite(minX) && Number.isFinite(minY) && Number.isFinite(minZ) && Number.isFinite(maxX) && Number.isFinite(maxY) && Number.isFinite(maxZ) && minX <= maxX && minY <= maxY && minZ <= maxZ;
}
var guidHandleInternByWorld = /* @__PURE__ */ new WeakMap();
function internSharedRefFromGuid(world, assetsRef, guid, brand) {
  let perWorld = guidHandleInternByWorld.get(world);
  if (perWorld === void 0) {
    perWorld = /* @__PURE__ */ new Map();
    guidHandleInternByWorld.set(world, perWorld);
  }
  const key = `${guid.toLowerCase()}\0${brand}`;
  const cached = perWorld.get(key);
  const payload = assetsRef.lookup(guid);
  if (cached !== void 0 && cached.payload === payload) {
    const cachedHandle = toShared(cached.handle);
    if (world.sharedRefs.resolve(cachedHandle).ok) return cachedHandle;
  }
  if (cached !== void 0) {
    world.sharedRefs.release(toShared(cached.handle));
    perWorld.delete(key);
  }
  if (payload === void 0) return void 0;
  const handle = world.internSharedRef(brand, payload);
  perWorld.set(key, { handle, payload });
  return handle;
}
function resolveVideoFieldHandle(value, world, assetsRef) {
  const texture = materialTextureValue(value);
  const textureGuid = assetReferenceText(texture?.texture ?? value);
  if (textureGuid === void 0) return void 0;
  const payload = assetsRef.lookup(textureGuid);
  if (payload === void 0 || payload.kind !== "video") return void 0;
  return internSharedRefFromGuid(world, assetsRef, textureGuid, "VideoAsset");
}
function materialTextureValue(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return void 0;
  const textureValue = value;
  return typeof textureValue.texture === "number" || typeof textureValue.texture === "string" || textureValue.texture instanceof Uint8Array ? textureValue : void 0;
}
function assetReferenceText(value) {
  if (typeof value === "string") return value;
  if (value instanceof Uint8Array && isAssetGuidBytes(value)) return AssetGuid.format(value);
  return void 0;
}
function isAssetGuidBytes(value) {
  return value.byteLength === 16;
}
function materialNormalScale(values) {
  const scale = values.normalScale;
  return typeof scale === "number" && Number.isFinite(scale) ? scale : 1;
}
function materialTextureRef(value) {
  return materialTextureValue(value)?.texture ?? value;
}
function collectMaterialTextureCoordinates(values) {
  const out = /* @__PURE__ */ new Map();
  for (const [field, value] of Object.entries(values)) {
    if (!field.endsWith("Texture")) continue;
    const coordinates = materialTextureValue(value)?.coordinates;
    if (coordinates !== void 0) out.set(field, coordinates);
  }
  return out;
}
function materialTextureSourceFields(schema2) {
  if (schema2 === void 0) return void 0;
  const fields = /* @__PURE__ */ new Set();
  for (const entry of schema2) {
    if (entry.type.startsWith("texture")) fields.add(entry.name);
  }
  return fields;
}
function collectMaterialTextureSources(values, world, textureFields, stats, cache) {
  const out = /* @__PURE__ */ new Map();
  for (const [field, value] of Object.entries(values)) {
    const structured = materialTextureValue(value);
    const schemaKnown = textureFields !== void 0;
    const schemaAdmitted = textureFields?.has(field) === true;
    if (schemaKnown && !schemaAdmitted) continue;
    const reference = structured?.texture ?? value;
    if (stats !== void 0) stats.sourceFieldsVisited += 1;
    if (typeof reference !== "number") continue;
    if (stats !== void 0) stats.numericSharedRefProbes += 1;
    let source;
    if (cache?.has(reference) === true) {
      if (stats !== void 0) stats.sourceCacheHits += 1;
      source = cache.get(reference) ?? void 0;
    } else {
      if (stats !== void 0) stats.sourceCacheMisses += 1;
      const resolved = world.sharedRefs.resolve(toShared(reference));
      if (!resolved.ok) {
        cache?.set(reference, null);
      } else {
        const binding = resolveRenderTargetMaterialSource(resolved.value);
        cache?.set(reference, binding === void 0 ? null : resolved.value);
        source = binding === void 0 ? void 0 : resolved.value;
      }
    }
    if (source === void 0) continue;
    if (stats !== void 0) {
      stats.producerRoutes.renderTarget = (stats.producerRoutes.renderTarget ?? 0) + 1;
    }
    out.set(field, source);
  }
  return out;
}
function collectMaterialTextureSamplers(values, resolveSampler) {
  const out = /* @__PURE__ */ new Map();
  for (const [field, value] of Object.entries(values)) {
    const sampler = resolveSampler(materialTextureValue(value)?.sampler);
    if (sampler !== void 0) out.set(field, sampler);
  }
  const legacySampler = resolveSampler(values.sampler);
  if (legacySampler !== void 0 && !out.has("baseColorTexture")) {
    out.set("baseColorTexture", legacySampler);
  }
  return out;
}
function collectUserRegionTextureHandles(pv, shaderId, paramSchema, assetsRef, world, resolveTex, videoOut) {
  const fields = materialTextureFields(
    shaderId,
    paramSchema !== void 0 ? derive(paramSchema).textureFieldNames : shaderId !== void 0 ? assetsRef.materialShaderTextureFieldNames(shaderId) : void 0
  ) ?? BUILTIN_USER_REGION_TEXTURE_FIELDS;
  const out = /* @__PURE__ */ new Map();
  for (const field of fields) {
    const videoHandle = resolveVideoFieldHandle(pv[field], world, assetsRef);
    if (videoHandle !== void 0) {
      videoOut.set(field, videoHandle);
      continue;
    }
    const handle = resolveTex(materialTextureRef(pv[field]), "TextureAsset");
    if (handle !== void 0) out.set(field, handle);
  }
  return out;
}
var ENGINE_INJECTED_TEXTURE_FIELDS = /* @__PURE__ */ new Set(["emissiveTexture", "occlusionTexture"]);
function isEngineInjectedTextureField(shaderId, fieldName) {
  return isStandardPbrMaterialShader(shaderId) && ENGINE_INJECTED_TEXTURE_FIELDS.has(fieldName);
}
function materialStandardTextureMask(parameters, shaderId, values) {
  return isCanonicalStandardPbrMaterialShader(shaderId) ? standardTextureMask(
    // Canonical materials may provide values without redeclaring the root
    // schema. Pruning must agree with the texture binder in that route too.
    DEFAULT_STANDARD_PBR_PARAM_SCHEMA.filter(
      (entry) => entry.type === "texture2d" && (values[entry.name] !== void 0 || parameters?.some(
        (parameter) => parameter.name === entry.name && parameter.default !== void 0
      ))
    )
  ) : void 0;
}
function materialParametersToParamSchema(parameters, shaderId) {
  if (isCanonicalStandardPbrMaterialShader(shaderId)) return STANDARD_PIPELINE_PARAM_SCHEMA;
  return materialParametersToParamSchema$1(parameters);
}
function materialParamSchemaForMaterial(parameters, authoredShaderId, passes) {
  const firstPass = passes.find(
    (pass) => !/shadow|depth/i.test(
      String(
        pass.renderState?.tags?.LightMode ?? pass.name
      )
    )
  ) ?? passes[0];
  const surfaceModule = firstPass?.program.moduleSlots?.surface;
  const schemaShaderId = surfaceModule === void 0 || surfaceModule === DEFAULT_STANDARD_SURFACE_MODULE ? authoredShaderId : void 0;
  return materialParametersToParamSchema(parameters, schemaShaderId);
}
function materialColorParameterSchema(parameters, shaderId, assets) {
  if (shaderId === void 0) return parameters;
  const shader = assets.shaderRegistry.findMaterialArtifact(shaderId);
  if (!shader.ok) return parameters;
  const byName = new Map(
    shader.value.paramSchema.map((parameter) => [parameter.name, parameter])
  );
  for (const parameter of parameters) byName.set(parameter.name, parameter);
  return [...byName.values()];
}
var MATERIAL_PARENT_CHAIN_LIMIT = 128;
function isDeepFrozen(value, seen = /* @__PURE__ */ new Set()) {
  if (typeof value !== "object" || value === null) return true;
  if (seen.has(value)) return true;
  if (!Object.isFrozen(value)) return false;
  seen.add(value);
  for (const child of Object.values(value)) {
    if (!isDeepFrozen(child, seen)) return false;
  }
  return true;
}
function captureMaterialCacheChain(root, assets) {
  const chain = [];
  const visitedParentGuids = /* @__PURE__ */ new Set();
  let current = root;
  for (let depth = 0; depth < MATERIAL_PARENT_CHAIN_LIMIT; depth += 1) {
    const parentRef = current.parent;
    const parentGuid = parentRef === void 0 ? void 0 : materialGuidText(parentRef);
    chain.push({ asset: current, parentGuid });
    if (parentGuid === void 0) return chain;
    if (parentRef === void 0) return void 0;
    if (visitedParentGuids.has(parentGuid)) return void 0;
    visitedParentGuids.add(parentGuid);
    const parent = assets.lookup(parentRef);
    if (parent?.kind !== "material") return void 0;
    current = parent;
  }
  return void 0;
}
function readPersistentMaterialSnapshot(cache, handleRaw, assets) {
  const entry = cache?.get(handleRaw);
  if (entry === void 0) return void 0;
  if (entry.crossFrameSafe && entry.chain !== void 0 && entry.catalogEpoch === assets.catalogEpoch)
    return entry;
  cache?.delete(handleRaw);
  return void 0;
}
function readStablePersistentMaterialSnapshot(cache, handleRaw, assets) {
  const entry = cache?.get(handleRaw);
  return entry?.crossFrameSafe === true && entry.chain !== void 0 && entry.catalogEpoch === assets.catalogEpoch ? entry : void 0;
}
function storeMaterialSnapshot(cache, handleRaw, snapshot, passes, root, assets) {
  const chain = captureMaterialCacheChain(root, assets);
  const entry = {
    snapshot,
    passes,
    crossFrameSafe: chain?.every(({ asset }) => isDeepFrozen(asset)) === true,
    ...chain === void 0 ? {} : { chain },
    ...chain === void 0 ? {} : { catalogEpoch: assets.catalogEpoch }
  };
  cache.set(handleRaw, entry);
  return entry;
}
function resolveMaterialSnapshot(handleRaw, world, assetsRef, materialSnapshotCache, persistentMaterialSnapshotCache, materialContext, materialTextureSourceStats, materialTextureSourceCache) {
  if (handleRaw === 0) return defaultMaterialSnapshot(handleRaw);
  const cached = materialSnapshotCache?.get(handleRaw);
  if (cached !== void 0) return cached.snapshot;
  const stablePersistentCached = readStablePersistentMaterialSnapshot(
    persistentMaterialSnapshotCache,
    handleRaw,
    assetsRef
  );
  if (stablePersistentCached !== void 0) {
    materialSnapshotCache?.set(handleRaw, stablePersistentCached);
    return stablePersistentCached.snapshot;
  }
  const tagged = toShared(handleRaw);
  const res = resolveAssetHandle(world, tagged);
  if (!res.ok) return defaultMaterialSnapshot(handleRaw);
  const asset = res.value;
  if (asset.kind !== "material") return defaultMaterialSnapshot(handleRaw);
  const persistentCached = readPersistentMaterialSnapshot(
    persistentMaterialSnapshotCache,
    handleRaw,
    assetsRef
  );
  if (persistentCached !== void 0) {
    materialSnapshotCache?.set(handleRaw, persistentCached);
    return persistentCached.snapshot;
  }
  const resolvedResult = walkMaterialPassesOverSharedRefs(world, tagged, assetsRef);
  if (!resolvedResult.ok) return defaultMaterialSnapshot(handleRaw);
  const resolved = resolvedResult.value;
  const allPasses = resolved.passes;
  const source = world.sharedRefs.resolve(tagged);
  const programOwner = source.ok && source.value.kind === "material" ? source.value : asset;
  const materialProgramKeys = materialProgramKeysForMaterial(
    programOwner,
    assetsRef,
    materialContext
  );
  const materialSceneIndexProgramKeys = materialSceneIndexProgramKeysForMaterial(
    programOwner,
    assetsRef,
    materialContext
  );
  const authoredFirstPassShader = runtimeMaterialShaderIdForMaterial(allPasses, void 0);
  const firstPassShader = runtimeMaterialShaderIdForMaterial(allPasses, materialProgramKeys);
  const pv = materialValuesToLinearRuntime(
    resolved.values,
    materialColorParameterSchema(resolved.parameters ?? [], firstPassShader, assetsRef),
    resolved.colorSpace
  );
  const baseColorPv = pv.baseColor;
  const baseColor = vec3.create(
    baseColorPv?.[0] ?? 1,
    baseColorPv?.[1] ?? 1,
    baseColorPv?.[2] ?? 1
  );
  const metallicPv = typeof pv.metallic === "number" ? pv.metallic : 0;
  const roughnessPv = typeof pv.roughness === "number" ? pv.roughness : 0.5;
  const specularColorPv = pv.specularColor;
  const normalScalePv = materialNormalScale(pv);
  const paramSnap = {};
  for (const [k, v] of Object.entries(pv)) {
    if (typeof v === "number") paramSnap[k] = v;
    else if (typeof v === "string") paramSnap[k] = v;
    else if (Array.isArray(v) && v.every((x) => typeof x === "number")) {
      paramSnap[k] = v;
    }
  }
  const materialParamSchema = materialParamSchemaForMaterial(
    resolved.parameters ?? [],
    authoredFirstPassShader,
    allPasses
  );
  const resolveTexLike = (value, brand) => {
    if (typeof value === "number") return toShared(value);
    if (typeof value === "string") {
      return internSharedRefFromGuid(world, assetsRef, value, brand);
    }
    return void 0;
  };
  const videoTextureFields = /* @__PURE__ */ new Map();
  const textureHandles = collectUserRegionTextureHandles(
    pv,
    firstPassShader,
    materialParamSchema.length > 0 ? materialParamSchema : void 0,
    assetsRef,
    world,
    resolveTexLike,
    videoTextureFields
  );
  const samplerHandles = collectMaterialTextureSamplers(
    pv,
    (value) => resolveTexLike(materialTextureRef(value), "SamplerAsset")
  );
  const textureSources = collectMaterialTextureSources(
    pv,
    world,
    materialTextureSourceFields(materialParamSchema.length > 0 ? materialParamSchema : void 0),
    materialTextureSourceStats,
    materialTextureSourceCache
  );
  const emissiveTextureHandle = resolveTexLike(
    materialTextureRef(pv.emissiveTexture),
    "TextureAsset"
  );
  const occlusionTextureHandle = resolveTexLike(
    materialTextureRef(pv.occlusionTexture),
    "TextureAsset"
  );
  const textureCoordinates = collectMaterialTextureCoordinates(pv);
  const baseColorTextureHandle = textureHandles.get("baseColorTexture");
  const metallicRoughnessTextureHandle = textureHandles.get("metallicRoughnessTexture");
  const normalTextureHandle = textureHandles.get("normalTexture");
  const emissivePv = pv.emissive;
  const snapshot = {
    baseColor,
    metallic: metallicPv,
    roughness: roughnessPv,
    ...resolved.surface?.model === void 0 ? {} : { surfaceModel: resolved.surface.model },
    deferredPass: allPasses.some(
      (pass) => String(
        pass.renderState?.tags?.LightMode ?? pass.name
      ) === "Deferred"
    ),
    ...specularColorPv !== void 0 && {
      specularColor: [
        specularColorPv[0] ?? 1,
        specularColorPv[1] ?? 1,
        specularColorPv[2] ?? 1
      ]
    },
    normalScale: normalScalePv,
    materialShaderId: firstPassShader,
    materialProgramKeys,
    materialSceneIndexProgramKeys,
    materialHandle: handleRaw,
    renderState: pipelineRenderState(allPasses[0]?.renderState),
    paramSnapshot: paramSnap,
    ...materialParamSchema.length > 0 && { materialParamSchema },
    standardTextureMask: materialStandardTextureMask(resolved.parameters, firstPassShader, pv),
    ...textureCoordinates.size > 0 && { textureCoordinates },
    ...textureHandles.size > 0 && { textureHandles },
    ...textureSources.size > 0 && { textureSources },
    ...videoTextureFields.size > 0 && { videoTextureFields },
    ...samplerHandles.size > 0 && { samplerHandles },
    ...baseColorTextureHandle !== void 0 && { baseColorTexture: baseColorTextureHandle },
    ...metallicRoughnessTextureHandle !== void 0 && {
      metallicRoughnessTexture: metallicRoughnessTextureHandle
    },
    ...normalTextureHandle !== void 0 && { normalTexture: normalTextureHandle },
    ...emissivePv !== void 0 && {
      emissive: [emissivePv[0] ?? 0, emissivePv[1] ?? 0, emissivePv[2] ?? 0]
    },
    ...typeof pv.emissiveIntensity === "number" && { emissiveIntensity: pv.emissiveIntensity },
    ...emissiveTextureHandle !== void 0 && { emissiveTexture: emissiveTextureHandle },
    ...occlusionTextureHandle !== void 0 && { occlusionTexture: occlusionTextureHandle },
    ...typeof pv.occlusionStrength === "number" && { occlusionStrength: pv.occlusionStrength },
    // feat-city-glb Bug 5 (per-submesh transparency): derive `transparent`
    // from the first pass's `renderState.blend` presence, identical to the
    // entity-level snapshot builder (extractFrame archetype loop). Without
    // this, per-submesh materials (materials[i>=1], e.g. a glTF BLEND decal
    // submesh on a multi-material mesh) never carry the transparent flag, so
    // the record stage's LDR split + blend routing treats them as opaque and
    // their alpha=0 texels composite as black.
    transparent: allPasses[0]?.renderState?.blend !== void 0
  };
  const stored = materialSnapshotCache !== void 0 ? storeMaterialSnapshot(
    materialSnapshotCache,
    handleRaw,
    snapshot,
    allPasses,
    asset,
    assetsRef
  ) : void 0;
  const cacheEntry = stored ?? (persistentMaterialSnapshotCache !== void 0 ? storeMaterialSnapshot(
    persistentMaterialSnapshotCache,
    handleRaw,
    snapshot,
    allPasses,
    asset,
    assetsRef
  ) : void 0);
  if (cacheEntry?.crossFrameSafe === true) {
    persistentMaterialSnapshotCache?.set(handleRaw, cacheEntry);
  }
  return snapshot;
}
function computeFrustumCorners(vp, camNear, camFar, nearZ, farZ, projection) {
  const invVP = mat4.create();
  mat4.invert(invVP, vp);
  const corners = [];
  const span = camFar - camNear;
  const ndcNear = projection === "orthographic" ? (nearZ - camNear) / span : camFar * (nearZ - camNear) / (nearZ * span);
  const ndcFar = projection === "orthographic" ? (farZ - camNear) / span : camFar * (farZ - camNear) / (farZ * span);
  const signs = [-1, 1];
  for (const sx of signs) {
    for (const sy of signs) {
      corners.push(unprojectNDC(invVP, sx, sy, ndcNear));
    }
  }
  for (const sx of signs) {
    for (const sy of signs) {
      corners.push(unprojectNDC(invVP, sx, sy, ndcFar));
    }
  }
  return corners;
}
function unprojectNDC(invVP, ndcX, ndcY, ndcZ) {
  const ndc = vec3.create(ndcX, ndcY, ndcZ);
  const ws = vec3.create();
  mat4.unproject(ws, ndc, invVP);
  return ws;
}
function pssmSplit(nearPlane, farPlane, cascadeCount, splitLambda) {
  const EPS = 1e-6;
  if (farPlane <= nearPlane + EPS) {
    throw new ShadowInvalidConfigError("shadowDistance", farPlane, nearPlane + EPS);
  }
  const result = new Float32Array(cascadeCount);
  const m = cascadeCount;
  const n = nearPlane;
  const f = farPlane;
  const ratio = f / n;
  for (let i = 1; i <= m; i++) {
    const t = i / m;
    const logPart = n * ratio ** t;
    const uniformPart = n + t * (f - n);
    result[i - 1] = splitLambda * logPart + (1 - splitLambda) * uniformPart;
  }
  return result;
}
function buildPointShadowMatrices(lightPos, near, far) {
  return buildCubeCameraFaceViews({ position: lightPos, near, far }).map(({ viewProjection }) => {
    for (const offset of [0, 4, 8, 12]) viewProjection[offset] = -(viewProjection[offset] ?? 0);
    return viewProjection;
  });
}
function computeDirectionalCsm(direction, config, cameraData) {
  const cascadeCount = Math.round(config.cascadeCount);
  const sNear = cameraData?.near ?? 0.1;
  const sFar = config.shadowDistance;
  const splits = pssmSplit(sNear, sFar, cascadeCount, config.splitLambda);
  const lightDirN = vec3.normalize(vec3.create(), direction);
  const lightTarget = vec3.create(lightDirN[0] ?? 0, lightDirN[1] ?? 0, lightDirN[2] ?? 0);
  const lightView = mat4.create();
  mat4.lookAt(lightView, vec3.create(0, 0, 0), lightTarget, vec3.create(0, 1, 0));
  if (cameraData === void 0) return null;
  const camProj = mat4.create();
  if (cameraData.projection === "orthographic") {
    mat4.orthographic(
      camProj,
      cameraData.orthoLeft,
      cameraData.orthoRight,
      cameraData.orthoTop,
      cameraData.orthoBottom,
      cameraData.near,
      cameraData.far
    );
  } else {
    mat4.perspective(camProj, cameraData.fov, cameraData.aspect, cameraData.near, cameraData.far);
  }
  const camView = mat4.create();
  mat4.invert(camView, cameraData.world);
  const cameraVP = mat4.create();
  mat4.multiply(cameraVP, camProj, camView);
  const resultLightViewProjs = [];
  const cascadeFits = [];
  let lightSpaceMaxZFull = -Infinity;
  const fullCorners = computeFrustumCorners(
    cameraVP,
    cameraData.near,
    cameraData.far,
    sNear,
    sFar,
    cameraData.projection
  );
  for (const ws of fullCorners) {
    const ls = vec3.create();
    mat4.transformVec3(ls, lightView, ws);
    if ((ls[2] ?? 0) > lightSpaceMaxZFull) lightSpaceMaxZFull = ls[2] ?? 0;
  }
  for (let cIdx = 0; cIdx < 4; cIdx++) {
    if (cIdx >= cascadeCount) {
      resultLightViewProjs.push(new Float32Array(16));
      continue;
    }
    const previousSplit = splits[cIdx - 1] ?? sNear;
    const cascadeNear = cIdx === 0 ? sNear : Math.max(sNear, previousSplit * (1 - config.cascadeBlend));
    const cascadeFar = splits[cIdx] ?? sFar;
    const corners = computeFrustumCorners(
      cameraVP,
      cameraData.near,
      cameraData.far,
      cascadeNear,
      cascadeFar,
      cameraData.projection
    );
    const lightMVP = mat4.clone(lightView);
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;
    for (const ws of corners) {
      const ls = vec3.create();
      mat4.transformVec3(ls, lightMVP, ws);
      if ((ls[0] ?? 0) < minX) minX = ls[0] ?? 0;
      if ((ls[0] ?? 0) > maxX) maxX = ls[0] ?? 0;
      if ((ls[1] ?? 0) < minY) minY = ls[1] ?? 0;
      if ((ls[1] ?? 0) > maxY) maxY = ls[1] ?? 0;
      if ((ls[2] ?? 0) < minZ) minZ = ls[2] ?? 0;
      if ((ls[2] ?? 0) > maxZ) maxZ = ls[2] ?? 0;
    }
    const texelX = (maxX - minX) / config.mapSize;
    const texelY = (maxY - minY) / config.mapSize;
    if (Number.isFinite(texelX) && texelX > 0) {
      const centerX = (minX + maxX) * 0.5;
      const snappedCenterX = Math.round(centerX / texelX) * texelX;
      const halfWidth = (maxX - minX) * 0.5 + texelX * 0.5;
      minX = snappedCenterX - halfWidth;
      maxX = snappedCenterX + halfWidth;
    }
    if (Number.isFinite(texelY) && texelY > 0) {
      const centerY = (minY + maxY) * 0.5;
      const snappedCenterY = Math.round(centerY / texelY) * texelY;
      const halfHeight = (maxY - minY) * 0.5 + texelY * 0.5;
      minY = snappedCenterY - halfHeight;
      maxY = snappedCenterY + halfHeight;
    }
    const nearZ = Math.max(maxZ, lightSpaceMaxZFull);
    const orthoProj = mat4.create();
    mat4.orthographic(orthoProj, minX, maxX, maxY, minY, -nearZ, -minZ);
    cascadeFits.push({
      split: splits[cIdx] ?? sFar,
      minX,
      maxX,
      minY,
      maxY,
      minZ,
      maxZ: nearZ
    });
    resultLightViewProjs.push(new Float32Array(mat4.multiply(mat4.create(), orthoProj, lightView)));
  }
  const projection = projectDirectionalShadow(
    cascadeFits,
    config.mapSize,
    config.shadowFilter ?? 2,
    config.shadowAngularRadius ?? 465e-5,
    config.maxPenumbraTexels ?? 32
  );
  if (projection === void 0) return null;
  return {
    lightViewProj: resultLightViewProjs,
    splitPlanes: projection.splitPlanes,
    cascadeCount,
    cascadeBlend: config.cascadeBlend,
    shadowMapSize: config.mapSize,
    directionalShadowQuality: projection.directionalShadowQuality
  };
}
var ALL_VISIBLE = {
  diagnostics: [],
  hasAnyIntent: false,
  hasAnyHiddenIntent: false,
  get: () => void 0,
  effective: () => "visible"
};
function collectCameraSnapshots(world) {
  const worldInternal = createWorldInternalView(world);
  const cameras = [];
  const cameraQuery = world.query({
    read: [Camera],
    optional: [
      MotionBlur,
      DynamicResolution,
      ScreenSpaceReflection,
      DepthOfField,
      BarrelDistortion
    ],
    with: [Transform, GlobalTransform]
  }).unwrap();
  for (const row of cameraQuery) {
    const cam = row.get(Camera);
    const motionBlur = row.get(MotionBlur);
    const barrelDistortion = row.get(BarrelDistortion);
    const motionBlurResult = resolveMotionBlurParams(motionBlur);
    if (!motionBlurResult.ok) throw motionBlurResult.error;
    const motionBlurParams = motionBlurResult.value;
    const depthOfField = row.get(DepthOfField);
    const dynamicResolution = row.get(DynamicResolution);
    const screenSpaceReflection = row.get(ScreenSpaceReflection);
    const projection = cameraProjectionFromF32(cam.projection);
    const depthOfFieldResult = resolveDepthOfFieldParams(depthOfField, {
      projection,
      fov: cam.fov,
      near: cam.near,
      far: cam.far
    });
    const depthOfFieldError = depthOfFieldResult.ok ? void 0 : depthOfFieldRequestFailure(depthOfFieldResult.error);
    const entity = row.entity;
    const view = worldInternal._getArrayView(entity, GlobalTransform, "world");
    if (view === void 0) continue;
    const worldMat = new Float32Array(view);
    const target = resolveCameraTarget(world, cam.target);
    const hasNonDefaultOutput = cam.exposureMode !== CAMERA_EXPOSURE_MODE_MANUAL || cam.exposure !== 1 || cam.temperature !== 6504 || cam.tint !== 0 || cam.colorLut !== 0 || cam.colorLutStrength !== 0;
    const output = hasNonDefaultOutput ? {
      exposure: cameraExposureFromColumns(cam),
      temperature: cam.temperature,
      tint: cam.tint,
      colorLut: cam.colorLut,
      colorLutStrength: cam.colorLutStrength
    } : void 0;
    const antialias = antialiasFromF32(cam.antialias);
    const dynamicResolutionResult = validateDynamicResolutionCamera(dynamicResolution, antialias);
    if (!dynamicResolutionResult.ok) throw dynamicResolutionResult.error;
    const barrelDistortionResult = validateBarrelDistortionParameters(barrelDistortion);
    if (!barrelDistortionResult.ok) throw barrelDistortionResult.error;
    cameras.push({
      entityKey: entity,
      ...target === void 0 ? {} : { target },
      historyVersion: cam.historyVersion,
      position: mat4.getTranslation(vec3.create(), worldMat),
      world: worldMat,
      fov: cam.fov,
      aspect: cam.aspect,
      near: cam.near,
      far: cam.far,
      projection,
      orthoLeft: cam.left,
      orthoRight: cam.right,
      orthoBottom: cam.bottom,
      orthoTop: cam.top,
      tonemap: tonemapFromF32(cam.tonemap),
      exposure: cam.exposure,
      whitePoint: cam.whitePoint,
      ...output === void 0 ? {} : { output },
      antialias,
      ...dynamicResolutionResult.value === void 0 ? {} : { dynamicResolution: dynamicResolutionResult.value },
      bloom: validateCameraBloom(
        cam.bloom,
        cam.bloomThreshold,
        cam.bloomIntensity,
        cam.bloomSoftKnee,
        cam.bloomScatter
      ),
      bloomThreshold: cam.bloomThreshold,
      bloomIntensity: cam.bloomIntensity,
      bloomSoftKnee: cam.bloomSoftKnee,
      bloomScatter: cam.bloomScatter,
      clearColor: [
        cam.clearColor[0] ?? 0,
        cam.clearColor[1] ?? 0,
        cam.clearColor[2] ?? 0,
        cam.clearColor[3] ?? 1
      ],
      ...depthOfFieldResult.ok && depthOfFieldResult.value !== void 0 ? { depthOfField: depthOfFieldResult.value } : {},
      ...depthOfFieldError === void 0 ? {} : { depthOfFieldError },
      ...motionBlurParams === void 0 ? {} : {
        motionBlur: {
          shutterAngle: motionBlurParams.shutterAngle,
          maxRadiusPixels: motionBlurParams.maxRadiusPixels,
          sampleCount: motionBlurParams.sampleCount,
          targetFps: motionBlurParams.targetFps
        }
      },
      ...barrelDistortion === void 0 ? {} : { barrelDistortion: barrelDistortionResult.value },
      ...screenSpaceReflection === void 0 ? {} : {
        screenSpaceReflection: {
          maxDistance: screenSpaceReflection.maxDistance,
          thickness: screenSpaceReflection.thickness,
          maxRoughness: screenSpaceReflection.maxRoughness
        }
      }
    });
  }
  return cameras;
}
function collectCubeCameraSnapshots(world) {
  const worldInternal = createWorldInternalView(world);
  const snapshots = [];
  const query = world.query({ read: [CubeCamera], with: [Transform, GlobalTransform] }).unwrap();
  for (const row of query) {
    const camera = row.get(CubeCamera);
    const target = resolveCameraTarget(world, camera.target);
    if (target === void 0) continue;
    const view = worldInternal._getArrayView(row.entity, GlobalTransform, "world");
    if (view === void 0) continue;
    snapshots.push({
      entityKey: row.entity,
      target,
      position: [view[12] ?? 0, view[13] ?? 0, view[14] ?? 0],
      near: camera.near,
      far: camera.far,
      updateIntent: cubeCameraUpdateIntentFromF32(camera.updateIntent),
      requestVersion: camera.requestVersion,
      faceBudget: camera.faceBudget
    });
  }
  return snapshots;
}
function collectReflectionProbeFacts(world) {
  const worldInternal = createWorldInternalView(world);
  const facts = [];
  const query = world.query({ read: [ReflectionProbe], with: [Transform, GlobalTransform] }).unwrap();
  for (const row of query) {
    const probe = row.get(ReflectionProbe);
    const view = worldInternal._getArrayView(row.entity, GlobalTransform, "world");
    if (view === void 0) {
      continue;
    }
    facts.push({
      worldId: 0,
      entityKey: row.entity,
      center: [view[12] ?? 0, view[13] ?? 0, view[14] ?? 0],
      halfExtents: [
        probe.halfExtents[0] ?? 0,
        probe.halfExtents[1] ?? 0,
        probe.halfExtents[2] ?? 0
      ],
      priority: probe.priority,
      intensity: probe.intensity,
      resolution: probe.resolution,
      boxProjection: probe.boxProjection,
      revision: probe.invalidationVersion,
      updateIntent: reflectionProbeUpdateIntentFromF32(probe.updateIntent),
      invalidationVersion: probe.invalidationVersion
    });
  }
  return facts;
}
function selectCameraRoles(world, requestedEntityKey) {
  const cameras = collectCameraSnapshots(world);
  const displayEntities = cameras.filter((camera) => camera.target === void 0).map((camera) => camera.entityKey ?? 0);
  const hasExplicitSelection = requestedEntityKey !== void 0;
  const activeCameraIndex = selectActiveCameraIndex(
    displayEntities,
    hasExplicitSelection ? requestedEntityKey : getActiveCamera(world)?.entity
  );
  const displayEntityKey = hasExplicitSelection ? displayEntities[activeCameraIndex] : displayEntities[activeCameraIndex] ?? displayEntities[0];
  const display = displayEntityKey === void 0 ? [] : cameras.filter((camera) => camera.entityKey === displayEntityKey);
  const candidates = cameras.map((camera) => ({
    worldId: 0,
    entityKey: camera.entityKey ?? 0,
    ...camera.target === void 0 ? {} : { target: camera.target },
    requestVersion: 0,
    update: "continuous"
  }));
  const selected = selectCameraTargetViews(candidates, {
    ...displayEntityKey === void 0 ? {} : { displayEntityKey },
    budget: 1
  });
  const auxiliary = selected.auxiliary.flatMap(
    (candidate) => cameras.filter((camera) => camera.entityKey === candidate.entityKey)
  );
  return { display, auxiliary };
}
function tonemapParams(camera) {
  const bytes = new ArrayBuffer(16);
  const floats = new Float32Array(bytes);
  const integers = new Uint32Array(bytes);
  floats[0] = camera.exposure;
  floats[1] = camera.whitePoint;
  integers[2] = tonemapToU32(camera.tonemap);
  return new Uint8Array(bytes);
}
function prepareExtractContext(world, options = {}) {
  const renderables = options.renderables ?? "full";
  return {
    materialContext: options.materialContext,
    assets: options.assets,
    pipelineState: options.pipelineState,
    materialSnapshotCache: options.materialSnapshotCache,
    resourceOwnerFog: options.resourceOwnerFog,
    cull: options.cull ?? "self",
    cullCameras: options.cullCameras,
    ...options.cameraEntityKey === void 0 ? {} : { cameraEntityKey: options.cameraEntityKey },
    renderables,
    worldId: options.worldId ?? 0,
    renderableEntities: options.renderableEntities,
    retainHidden: options.retainHidden ?? false,
    visibility: renderables === "none" ? ALL_VISIBLE : resolveVisibility(world),
    getMaterialShaderArtifact: options.getMaterialShaderArtifact,
    instanceCollections: options.instanceCollections
  };
}
var fogQueries = /* @__PURE__ */ new WeakMap();
var fogLkgStates = /* @__PURE__ */ new WeakMap();
function fogState(world) {
  const existing = fogLkgStates.get(world);
  if (existing !== void 0) return existing;
  const created = { lkg: void 0, failure: void 0 };
  fogLkgStates.set(world, created);
  return created;
}
function selectFogFrame(world) {
  const fogCandidates = [];
  let fogQuery = fogQueries.get(world);
  if (fogQuery === void 0) {
    fogQuery = world.query({ read: [Fog] }).unwrap();
    fogQueries.set(world, fogQuery);
  }
  for (const row of fogQuery) {
    const value = row.get(Fog);
    fogCandidates.push({
      entityKey: row.entity,
      color: [value.color[0] ?? 0, value.color[1] ?? 0, value.color[2] ?? 0],
      density: value.density,
      heightFalloff: value.heightFalloff,
      maxOpacity: value.maxOpacity
    });
  }
  const fogSelection = selectEnvironment({
    environments: [],
    fogs: fogCandidates,
    suns: [],
    lane: "direct"
  });
  const state = fogState(world);
  if (fogSelection.ok) {
    state.lkg = fogSelection.value.fog;
    state.failure = void 0;
    return fogSelection.value.fog;
  }
  state.failure = {
    code: fogSelection.error.code,
    expected: fogSelection.error.expected,
    hint: fogSelection.error.hint,
    detail: Object.freeze({ ...fogSelection.error.detail })
  };
  routeWorldError(world, fogSelection.error, {
    systemName: "RenderSystem.extract (fog-selection)"
  });
  if (state.lkg !== void 0) return state.lkg;
  throw fogSelection.error;
}
function textureDigest(texture) {
  let hash = 2166136261;
  for (const byte of texture.data) hash = Math.imul(hash ^ byte, 16777619) >>> 0;
  return `fnv1a:${hash.toString(16).padStart(8, "0")}`;
}
function extractVolumeSnapshot(world, assets, worldInternal) {
  const elapsed = world.getResource(Time).elapsed;
  const worldTimeSeconds = Number.isFinite(elapsed) ? Math.max(0, elapsed) : 0;
  const query = world.query({ read: [VolumetricFog] }).unwrap();
  const authorings = [];
  const members = [];
  let selectedLight;
  for (const row of query) {
    selectedLight = void 0;
    const source = row.get(VolumetricFog);
    if (source.light === null) continue;
    const selected = resolveSelectedVolumetricLight(world, source.light);
    if (selected.status === "available") {
      const pairSpot = source.spotLight === null ? void 0 : source.spotLight;
      selectedLight ??= {
        entity: selected.entity,
        kind: selected.kind,
        ...selected.kind === "point" ? { pointLightEntity: selected.entity } : {},
        ...pairSpot === void 0 ? {} : { spotLightEntity: pairSpot }
      };
    }
    const densityHandle = toShared(Math.round(Number(source.density)));
    const resolved = resolveAssetHandle(world, densityHandle);
    if (!resolved.ok || resolved.value.kind !== "texture") {
      worldInternal._routeError(
        resolved.ok ? new RhiError({
          code: "asset-not-registered",
          expected: "VolumetricFog.density resolves to a TextureAsset",
          hint: "load a TextureAsset before assigning it to VolumetricFog.density",
          detail: { assetHandle: Number(densityHandle) }
        }) : resolved.error,
        { severity: Severity.Error, systemName: "RenderSystem.extract (volumetric-density)" }
      );
      return { status: "degraded", worldTimeSeconds };
    }
    const densityAsset = resolved.value;
    const guid = assets?.guidOf(densityAsset) ?? `handle:${Number(densityHandle)}`;
    const shape = densityAsset.shape;
    const density = shape.viewDimension === "3d" ? {
      guid,
      generation: 1,
      shape: {
        viewDimension: "3d",
        extent: {
          width: shape.extent.width,
          height: shape.extent.height,
          depth: shape.extent.depth
        }
      },
      format: densityAsset.format,
      colorSpace: densityAsset.colorSpace
    } : {
      guid,
      generation: 1,
      shape: {
        viewDimension: shape.viewDimension,
        extent: shape.viewDimension === "2d-array" ? {
          width: shape.extent.width,
          height: shape.extent.height,
          layers: shape.extent.layers
        } : { width: shape.extent.width, height: shape.extent.height }
      },
      format: densityAsset.format,
      colorSpace: densityAsset.colorSpace
    };
    const authoring = {
      light: source.light,
      density,
      bounds: {
        min: [source.boundsMin[0] ?? 0, source.boundsMin[1] ?? 0, source.boundsMin[2] ?? 0],
        max: [source.boundsMax[0] ?? 0, source.boundsMax[1] ?? 0, source.boundsMax[2] ?? 0]
      },
      extinction: [source.extinction[0] ?? 0, source.extinction[1] ?? 0, source.extinction[2] ?? 0],
      albedo: [source.albedo[0] ?? 0, source.albedo[1] ?? 0, source.albedo[2] ?? 0],
      emission: [source.emission[0] ?? 0, source.emission[1] ?? 0, source.emission[2] ?? 0],
      anisotropy: source.anisotropy,
      maxDistance: source.maxDistance,
      sampling: source.sampling === 1 ? "density" : "noise"
    };
    authorings.push(authoring);
    members.push({
      status: "available",
      worldTimeSeconds,
      densityHandle,
      densityAsset,
      guid,
      generation: 1,
      digest: textureDigest(densityAsset),
      ...selectedLight === void 0 ? {} : {
        lightEntity: selectedLight.entity,
        lightKind: selectedLight.kind,
        ...selectedLight.pointLightEntity === void 0 ? {} : { pointLightEntity: selectedLight.pointLightEntity },
        ...selectedLight.spotLightEntity === void 0 ? {} : { spotLightEntity: selectedLight.spotLightEntity }
      }
    });
  }
  if (authorings.length === 0) return void 0;
  const extracted = extractVolumetricFog(authorings);
  if (!extracted.ok) {
    worldInternal._routeError(extracted.error, {
      severity: Severity.Error,
      systemName: "RenderSystem.extract (volumetric-fog)"
    });
    return { ...members[0], status: "degraded" };
  }
  if (extracted.value.status === "off") return { status: "off" };
  const validatedMembers = extracted.value.fogs.map((fog, index) => ({
    ...members[index],
    status: "available",
    fog
  }));
  return {
    status: "available",
    ...validatedMembers[0],
    additional: validatedMembers.slice(1)
  };
}

export { ANTIALIAS_FXAA, ANTIALIAS_MSAA, ANTIALIAS_NONE, ANTIALIAS_TAA, Atmosphere, BLOOM_DISABLED, BLOOM_ENABLED, BarrelDistortion, CAMERA_BLOOM_INTENSITY_MAX, CAMERA_BLOOM_INTENSITY_MIN, CAMERA_BLOOM_SCATTER_MAX, CAMERA_BLOOM_SCATTER_MIN, CAMERA_BLOOM_SOFT_KNEE_MAX, CAMERA_BLOOM_SOFT_KNEE_MIN, CAMERA_BLOOM_THRESHOLD_MAX, CAMERA_BLOOM_THRESHOLD_MIN, CAMERA_EXPOSURE_MODE_AUTO, CAMERA_EXPOSURE_MODE_MANUAL, CAMERA_PROJECTION_ORTHOGRAPHIC, CAMERA_PROJECTION_PERSPECTIVE, CAMERA_TEMPERATURE_MAX, CAMERA_TEMPERATURE_MIN, CAMERA_TINT_MAX, CAMERA_TINT_MIN, CLOUD_EXTINCTION_COEFFICIENT, CLOUD_QUALITY_PROFILES, CUBE_CAMERA_FACE_ORDER, CUBE_CAMERA_UPDATE_CONTINUOUS, CUBE_CAMERA_UPDATE_ONCE, CUBE_CAMERA_UPDATE_ON_DEMAND, Camera, CameraError, CloudLayer, CloudLayerCacheInvalidError, CloudLayerCapabilityMissingError, CloudLayerInvalidParameterError, CloudLayerOwnerConflictError, CloudLayerResourceFailureError, CloudQualityValue, CubeCamera, DEFAULT_CLOUD_LAYER, DEFAULT_DEPTH_OF_FIELD_PARAMS, DEPTH_OF_FIELD_PARAMS_BYTE_SIZE, DepthOfField, DepthOfFieldQualityValue, DepthOfFieldSideValue, DepthOfFieldValidationError, DirectionalLight, DirectionalShadowFilterValue, DynamicResolution, Fog, Instances, Layer, LightProbe, Lines, MAX_VOLUMETRIC_FOG_OWNERS, MeshFilter, MeshRenderer, MotionBlur, PointLight, PointLightShadow, PointShapeValue, Points, PostProcessParams, REFLECTION_PROBE_UPDATE_CONTINUOUS, REFLECTION_PROBE_UPDATE_ONCE, REFLECTION_PROBE_UPDATE_ON_CHANGE, RectAreaLight, ReflectionProbe, SKYBOX_MODE_CUBEMAP, SKYLIGHT_RECOVERY_FALLBACK, SceneInstance, ScreenSpaceReflection, SkyboxBackground, Skylight, SortKey, SpotLight, SunCardinalityError, TONEMAP_ACES_FILMIC, TONEMAP_AGX, TONEMAP_CINEON, TONEMAP_LINEAR, TONEMAP_NEUTRAL, TONEMAP_NONE, TONEMAP_REINHARD, TONEMAP_REINHARD_EXTENDED, Visibility, VisibilityStateValue, VolumetricFog, VolumetricFogSamplingValue, attachBarrelDistortionCameraFrame, buildCameraFrusta, buildCubeCameraFaceViews, buildRectAreaWorldFrame, buildShadowFrusta, cameraExposureFromColumns, cameraProjectionFromF32, cloudLayerFormationKey, cloudLayerSourceKey, cloudQualityFromF32, cloudShadowResolutionForQuality, cloudViewDistanceForQuality, computeInvRangeSquared, createBarrelDistortionMapping, createCookieProjectionMatrixData, cubeCameraUpdateIntentFromF32, cubeCameraUpdateIntentToF32, degToCos, depthOfFieldQualityCode, depthOfFieldQualityFromF32, depthOfFieldRequestFailure, depthOfFieldSideCode, depthOfFieldSideFromF32, depthOfFieldTapCount, directionalShadowQualityFromF32, extractCloudLayer, extractFrames, extractVolumetricFog, freezeBarrelDistortionMapping, glyphTextLayoutSystem, hasVolumetricFogCapability, internSharedRefFromGuid, mapDisplayToScene, mapDisplayUvToSceneUv, mapSceneToDisplay, mapSceneUvToDisplayUv, orthographic, packDepthOfFieldParams, perspective, pointShapeFromU32, projectMeshMaterialBindingObservation, rectAreaFacesPoint, reflectionProbeUpdateIntentFromF32, reflectionProbeUpdateIntentToF32, resolveDepthOfFieldFrameParams, resolveDepthOfFieldParams, resolveIntegratedVolumeConsumer, resolveMaterialSnapshot, resolveSelectedVolumetricLight, resolveVisibility, resolveVolumetricFogLightPair, selectCloudLayerFrame, signedDepthOfFieldCoC, summarizeMeshMaterialBindings, validateBarrelDistortionParameters, validateCameraBloom, validateCameraColorGrading, validateCameraExposure, validateCloudLayer, validateDepthOfFieldFrameParams, validateDepthOfFieldParams, validateDirection, validateDirectionalLightData, validateDynamicResolutionCamera, validateDynamicResolutionParameters, validateLightProbeData, validatePointLightData, validatePointLightShadowData, validateRectAreaLightData, validateSpotLightData, validateVolumetricFog, visibilityStateFromU32 };
