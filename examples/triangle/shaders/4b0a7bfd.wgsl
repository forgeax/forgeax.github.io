struct View {
    worldViewProj: mat4x4<f32>,
    lightDir: vec3<f32>,
    lightColor: vec3<f32>,
    cameraPos: vec3<f32>,
}

struct Mesh {
    worldFromLocal: mat4x4<f32>,
}

@group(0) @binding(0) 
var<uniform> view: View;
@group(2) @binding(0) 
var<storage> meshes: array<Mesh>;

