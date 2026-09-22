#define_import_path ai_weapon_spirit_vfx::wood_seed_billboard
// The analytic fog producer was removed from this shader. Billboard
// soft-particle depth is therefore the sole group-0 resource again, matching
// the prepared group-0-resource layout and its binding resolver.
@group(0) @binding(0) var scene_depth: texture_depth_2d;

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
  @location(1) local: vec2<f32>,
  @location(2) emissive_intensity: vec4<f32>,
  @location(3) surface: vec4<f32>,
  @location(4) sheet_uv: vec2<f32>,
  @location(5) sheet_frame: f32,
  @location(6) fade_distance: f32,
  @location(7) clip_position: vec3<f32>,
  @location(8) tint: vec4<f32>,
};

fn textureSheetFrame(age: f32, frameRate: f32, frameCount: u32) -> u32 {
  if (frameCount == 0u || frameRate <= 0.0) { return 0u; }
  return min(frameCount - 1u, u32(max(0.0, floor(age * frameRate))));
}

fn textureSheetUv(local: vec2<f32>, frame: u32, columns: u32, rows: u32) -> vec2<f32> {
  let safeColumns = max(columns, 1u);
  let safeRows = max(rows, 1u);
  let cell = vec2<u32>(frame % safeColumns, frame / safeColumns);
  return (local + vec2<f32>(1.0)) * 0.5 / vec2<f32>(f32(safeColumns), f32(safeRows)) +
    vec2<f32>(f32(cell.x) / f32(safeColumns), f32(cell.y) / f32(safeRows));
}

fn billboardPivot(corner: vec2<f32>, pivot: vec2<f32>) -> vec2<f32> {
  return corner + pivot * 2.0;
}

fn softParticleFactor(particleDepth: f32, sceneDepth: f32, fadeDistance: f32) -> f32 {
  if (fadeDistance <= 0.0) { return 1.0; }
  return clamp((sceneDepth - particleDepth) / fadeDistance, 0.0, 1.0);
}

fn billboardSortingKey(depth: f32, mode: u32) -> f32 {
  return select(0.0, depth, mode == 2u);
}

fn softParticle(position: vec4<f32>, alpha: f32, fadeDistance: f32) -> f32 {
  let pixel = vec2<i32>(position.xy);
  let sceneDepth = textureLoad(scene_depth, pixel, 0);
  if (fadeDistance <= 0.0) {
    return select(alpha, 0.0, position.z > sceneDepth);
  }
  return alpha * softParticleFactor(position.z, sceneDepth, fadeDistance);
}

struct VertexInput {
  @location(0) position: vec3<f32>,
  @location(1) right: vec2<f32>,
  @location(2) up: vec2<f32>,
  @location(3) particle_color: vec4<f32>,
  @location(4) base_color: vec4<f32>,
  @location(5) emissive_intensity: vec4<f32>,
  @location(6) surface: vec4<f32>,
  @location(7) advanced: vec4<f32>,
  @location(8) texture_sheet: vec4<f32>,
};

@vertex
fn vs_main(input: VertexInput, @builtin(vertex_index) vertex_index: u32) -> VertexOutput {
  let corners = array<vec2<f32>, 6>(
    vec2<f32>(-1.0, -1.0), vec2<f32>(1.0, -1.0), vec2<f32>(1.0, 1.0),
    vec2<f32>(-1.0, -1.0), vec2<f32>(1.0, 1.0), vec2<f32>(-1.0, 1.0)
  );
  let corner = billboardPivot(corners[vertex_index], input.advanced.xy);
  var output: VertexOutput;
  // Keep native projected sizes; flame and vapor recipes own their metre scale.
  let particleSize = 1.0;
  let clipPosition = vec3<f32>(
    input.position.xy + (input.right * corner.x + input.up * corner.y) * particleSize,
    input.position.z,
  );
  output.position = vec4<f32>(clipPosition, 1.0);
  output.clip_position = clipPosition;
  output.color = input.particle_color;
  output.tint = input.base_color;
  output.local = corner;
  output.emissive_intensity = input.emissive_intensity;
  output.surface = input.surface;
  output.sheet_uv = textureSheetUv(
    corners[vertex_index],
    u32(input.advanced.z),
    u32(input.texture_sheet.x),
    u32(input.texture_sheet.y),
  );
  output.sheet_frame = input.advanced.z;
  output.fade_distance = input.texture_sheet.z;
  return output;
}



// Native projected billboard ABI. Variant 0 is the luminous spore membrane;
// variant 1 supplies fine pollen, vertical wake strokes and impact rays.
@fragment fn fs_main(i:VertexOutput)->@location(0) vec4<f32> {
 let p=i.local; let r=length(p);
 let edge=1.0-smoothstep(.82,1.0,r);
 var rgb:vec3<f32>; var alpha:f32;
 if(i.surface.x<.06){
   let rim=exp(-pow((r-.77)/.075,2.0));
   let core=exp(-dot(p-vec2<f32>(-.07,.02),p-vec2<f32>(-.07,.02))*20.0);
   let gleam=exp(-dot(p-vec2<f32>(-.28,.36),p-vec2<f32>(-.28,.36))*90.0);
   rgb=vec3<f32>(.12,.68,.21)*(.23+rim*.6)+vec3<f32>(1.7,2.1,.28)*core+vec3<f32>(.8,1.4,.7)*gleam;
   alpha=(.13+rim*.65+core*.85+gleam*.3)*edge*i.color.a;
 }else if(i.surface.x<.2){
   let spine=exp(-p.x*p.x*15.0);
   alpha=spine*(1.0-smoothstep(.2,1.0,abs(p.y)))*edge*i.color.a;
   rgb=i.color.rgb;
 }else{
   let bend=p.x-.12*sin(p.y*3.0);
   let width=.62*pow(max(0.0,1.0-p.y*p.y),.85);
   let blade=1.0-smoothstep(width-.055,width,abs(bend));
   let vein=exp(-bend*bend*1800.0);
   let ribs=pow(max(0.0,cos(p.y*24.0+abs(bend)*16.0)),12.0);
   alpha=blade*(1.0-smoothstep(.88,1.0,abs(p.y)))*i.color.a;
   rgb=i.color.rgb*(.62+.3*smoothstep(-.5,.5,bend))+vec3<f32>(.22,.3,.045)*(vein+ribs*.18);
 }
 alpha=softParticle(i.position,alpha,i.fade_distance);
 return vec4<f32>(rgb*alpha,alpha);
}
