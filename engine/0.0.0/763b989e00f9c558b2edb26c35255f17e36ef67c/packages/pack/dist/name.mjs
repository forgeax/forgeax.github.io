// src/deriveAssetName.ts
function baseName(p) {
  const trimmed = p.replace(/[/\\]+$/, "");
  const idx = Math.max(trimmed.lastIndexOf("/"), trimmed.lastIndexOf("\\"));
  return idx === -1 ? trimmed : trimmed.slice(idx + 1);
}
function deriveAssetName(packagePath, _assetCount, storedName) {
  if (storedName !== void 0) {
    return storedName;
  }
  if (packagePath === null) {
    return "";
  }
  return baseName(packagePath);
}

export { deriveAssetName };
