// src/animated-bounds.ts
var empty = () => [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
function union(out, box) {
  for (let axis = 0; axis < 3; axis++) {
    out[axis] = Math.min(out[axis] ?? NaN, box[axis] ?? NaN);
    out[axis + 3] = Math.max(out[axis + 3] ?? NaN, box[axis + 3] ?? NaN);
  }
}
function multiply(a, b) {
  const values = [a[0] * b[0], a[0] * b[1], a[1] * b[0], a[1] * b[1]];
  return [Math.min(...values), Math.max(...values)];
}
function linear(box, matrix, translation) {
  const out = empty();
  for (let axis = 0; axis < 3; axis++) {
    let lo = translation[axis] ?? NaN, hi = lo;
    for (let column = 0; column < 3; column++) {
      const coefficient = matrix[column * 3 + axis] ?? NaN;
      const range = multiply(
        [box[column] ?? NaN, box[column + 3] ?? NaN],
        [coefficient, coefficient]
      );
      lo += range[0];
      hi += range[1];
    }
    out[axis] = lo;
    out[axis + 3] = hi;
  }
  return out;
}
function rotationMatrix(q, inverse) {
  const length = Math.hypot(q[0] ?? NaN, q[1] ?? NaN, q[2] ?? NaN, q[3] ?? NaN);
  if (!(length > 0)) return Array(9).fill(NaN);
  const sign = inverse ? -1 : 1;
  const x = (q[0] ?? NaN) / length * sign, y = (q[1] ?? NaN) / length * sign, z = (q[2] ?? NaN) / length * sign, w = (q[3] ?? NaN) / length;
  return [
    1 - 2 * (y * y + z * z),
    2 * (x * y + z * w),
    2 * (x * z - y * w),
    2 * (x * y - z * w),
    1 - 2 * (x * x + z * z),
    2 * (y * z + x * w),
    2 * (x * z + y * w),
    2 * (y * z - x * w),
    1 - 2 * (x * x + y * y)
  ];
}
function boxRadius(box) {
  return Math.hypot(
    ...[0, 1, 2].map(
      (axis) => Math.max(Math.abs(box[axis] ?? NaN), Math.abs(box[axis + 3] ?? NaN))
    )
  );
}
function transform(bound, node, inverse) {
  let out = [...bound.box];
  let radius = bound.radius;
  const translate = (subtract) => {
    radius += Math.hypot(
      ...node.translation.map((range) => Math.max(Math.abs(range[0]), Math.abs(range[1])))
    );
    for (let axis = 0; axis < 3; axis++) {
      const range = node.translation[axis] ?? [NaN, NaN];
      out[axis] = (out[axis] ?? NaN) + (subtract ? -range[1] : range[0]);
      out[axis + 3] = (out[axis + 3] ?? NaN) + (subtract ? -range[0] : range[1]);
    }
  };
  const scale = (invert) => {
    radius *= Math.max(
      ...node.scale.map(
        (range) => invert ? 1 / Math.min(Math.abs(range[0]), Math.abs(range[1])) : Math.max(Math.abs(range[0]), Math.abs(range[1]))
      )
    );
    for (let axis = 0; axis < 3; axis++) {
      let range = node.scale[axis] ?? [NaN, NaN];
      if (invert)
        range = range[0] <= 0 && range[1] >= 0 ? [NaN, NaN] : [1 / range[1], 1 / range[0]];
      const result = multiply([out[axis] ?? NaN, out[axis + 3] ?? NaN], range);
      out[axis] = result[0];
      out[axis + 3] = result[1];
    }
  };
  const rotate = () => {
    if (node.animatedRotation) {
      radius = Math.min(radius, boxRadius(out));
      out = [-radius, -radius, -radius, radius, radius, radius];
    } else out = linear(out, rotationMatrix(node.rotation, inverse), [0, 0, 0]);
  };
  if (inverse) {
    translate(true);
    rotate();
    scale(true);
  } else {
    scale(false);
    rotate();
    translate(false);
  }
  return { box: out, radius: Math.min(radius, boxRadius(out)) };
}
function deriveConservativeAnimatedBounds(input) {
  const { nodes, channels, jointNodes, inverseBindMatrices, meshes } = input;
  if (jointNodes.length === 0 || inverseBindMatrices.length !== jointNodes.length * 16 || meshes.length === 0)
    return void 0;
  if (channels.some(
    (channel) => channel.interpolation !== "LINEAR" && channel.interpolation !== "STEP"
  ))
    return void 0;
  if (Array.from(inverseBindMatrices).some((value) => !Number.isFinite(value)) || nodes.some(
    (node) => [
      ...Array.from(node.translation),
      ...Array.from(node.scale),
      ...Array.from(node.rotation)
    ].some((value) => !Number.isFinite(value)) || Math.hypot(...Array.from(node.rotation)) === 0
  ) || channels.some(
    (channel) => nodes[channel.node] === void 0 || Array.from(channel.values).some((value) => !Number.isFinite(value)) || channel.values.length % (channel.property === "rotation" ? 4 : 3) !== 0
  ))
    return void 0;
  const envelopes = nodes.map((node, index) => {
    const ranges = (property) => [0, 1, 2].map((axis) => {
      let lo = node[property][axis] ?? NaN, hi = lo;
      for (const channel of channels)
        if (channel.node === index && channel.property === property) {
          if (channel.values.length % 3 !== 0) return [NaN, NaN];
          for (let key = axis; key < channel.values.length; key += 3) {
            lo = Math.min(lo, channel.values[key] ?? NaN);
            hi = Math.max(hi, channel.values[key] ?? NaN);
          }
        }
      return [lo, hi];
    });
    return {
      translation: ranges("translation"),
      scale: ranges("scale"),
      rotation: node.rotation,
      animatedRotation: channels.some(
        (channel) => channel.node === index && channel.property === "rotation"
      )
    };
  });
  const ancestry = (index) => {
    const chain = [];
    let current = index;
    while (current !== null) {
      const node = nodes[current];
      if (node === void 0 || chain.includes(current)) return void 0;
      chain.push(current);
      current = node.parent;
    }
    return chain;
  };
  const result = empty();
  for (const mesh of meshes) {
    const count = mesh.positions.length / 3;
    if (!Number.isInteger(count) || mesh.joints.length !== count * 4 || mesh.weights.length !== count * 4)
      return void 0;
    const meshChain = ancestry(mesh.node);
    if (meshChain === void 0) return void 0;
    const jointBoxes = jointNodes.map(empty);
    let minWeightSum = Infinity, maxWeightSum = 0;
    for (let vertex = 0; vertex < count; vertex++) {
      const p = [
        mesh.positions[vertex * 3] ?? NaN,
        mesh.positions[vertex * 3 + 1] ?? NaN,
        mesh.positions[vertex * 3 + 2] ?? NaN
      ];
      if (!p.every(Number.isFinite)) return void 0;
      let sum = 0;
      for (let lane = 0; lane < 4; lane++) {
        const weight = mesh.weights[vertex * 4 + lane] ?? NaN;
        if (!Number.isFinite(weight) || weight < 0) return void 0;
        sum += weight;
        if (weight === 0) continue;
        const joint = mesh.joints[vertex * 4 + lane] ?? NaN;
        const box = jointBoxes[joint];
        if (!Number.isInteger(joint) || box === void 0) return void 0;
        const offset = joint * 16;
        const extent = [0, 1, 2].map((axis) => mesh.morphExtent?.[vertex * 3 + axis] ?? 0);
        if (!extent.every((value) => Number.isFinite(value) && value >= 0)) return void 0;
        const local = [
          ...p.map((value, axis) => value - (extent[axis] ?? NaN)),
          ...p.map((value, axis) => value + (extent[axis] ?? NaN))
        ];
        const matrix = [0, 1, 2, 4, 5, 6, 8, 9, 10].map(
          (index) => inverseBindMatrices[offset + index] ?? NaN
        );
        union(
          box,
          linear(local, matrix, [
            inverseBindMatrices[offset + 12] ?? NaN,
            inverseBindMatrices[offset + 13] ?? NaN,
            inverseBindMatrices[offset + 14] ?? NaN
          ])
        );
      }
      if (!(sum > 0)) return void 0;
      minWeightSum = Math.min(minWeightSum, sum);
      maxWeightSum = Math.max(maxWeightSum, sum);
    }
    const meshBounds = empty();
    for (let joint = 0; joint < jointNodes.length; joint++) {
      const jointBox = jointBoxes[joint];
      if (jointBox === void 0) return void 0;
      if (jointBox[0] === Infinity) continue;
      let bound = { box: jointBox, radius: boxRadius(jointBox) };
      const jointChain = ancestry(jointNodes[joint] ?? NaN);
      if (jointChain === void 0) return void 0;
      const common = jointChain.find((index) => meshChain.includes(index));
      for (const index of jointChain) {
        if (index === common) break;
        const envelope = envelopes[index];
        if (envelope === void 0) return void 0;
        bound = transform(bound, envelope, false);
      }
      const inverseChain = meshChain.slice(
        0,
        common === void 0 ? meshChain.length : meshChain.indexOf(common)
      );
      for (const index of inverseChain.reverse()) {
        const envelope = envelopes[index];
        if (envelope === void 0) return void 0;
        bound = transform(bound, envelope, true);
      }
      union(meshBounds, bound.box);
    }
    for (let axis = 0; axis < 3; axis++) {
      const range = multiply(
        [meshBounds[axis] ?? NaN, meshBounds[axis + 3] ?? NaN],
        [minWeightSum, maxWeightSum]
      );
      meshBounds[axis] = range[0];
      meshBounds[axis + 3] = range[1];
    }
    union(result, meshBounds);
  }
  if (!result.every(Number.isFinite)) return void 0;
  const margin = Math.max(1, ...result.map(Math.abs)) * 1e-5;
  return Float32Array.from(result.map((value, index) => value + (index < 3 ? -margin : margin)));
}
export {
  deriveConservativeAnimatedBounds
};
