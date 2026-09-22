#define_import_path ai_weapon_spirit_vfx::elemental_billboard
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



fn hash(p:vec2<f32>)->f32 {return fract(sin(dot(p,vec2<f32>(127.1,311.7)))*43758.5453);}
fn noise(p:vec2<f32>)->f32 {
 let i=floor(p);let f=fract(p);let u=f*f*(3.0-2.0*f);
 return mix(mix(hash(i),hash(i+vec2<f32>(1.0,0.0)),u.x),mix(hash(i+vec2<f32>(0.0,1.0)),hash(i+1.0),u.x),u.y);
}
@fragment fn fs_main(i:VertexOutput)->@location(0) vec4<f32> {
 let t=i.sheet_frame/60.0;
 let seed=i.color.b*13.0+i.color.g*7.0;
 let p=i.local;
 // Two advected noise scales break the silhouette; motion comes from the native age clock.
 let n=noise(p*2.4+vec2<f32>(seed,-t*1.9));
 let fine=noise(p*5.7+vec2<f32>(n*.6+seed,t*-3.1));
 let edge=1.0-smoothstep(.64,1.0,max(abs(p.x),abs(p.y)));
 var rgb:vec3<f32>;var alpha:f32;
 if(i.surface.x<.06){
   let height=clamp(p.y*.5+.5,0.0,1.0);
   let center=(n-.5)*(.16+height*.35)+sin(p.y*4.0-t*5.0+seed)*height*.09;
   let width=.62*(1.0-height*.83)+fine*.12;
   let flank=1.0-smoothstep(width*.65,width,abs(p.x-center));
   let vertical=1.0-smoothstep(.55,.96,abs(p.y));
   let fringe=smoothstep(.2,.6,n*.65+fine*.35);
   let body=flank*vertical*mix(fringe,1.0,flank*.85);
   let heat=pow(flank,2.0)*(1.0-height*.8)*(.75+fine*.25);
   rgb=mix(vec3<f32>(.9,.055,.006),vec3<f32>(2.9,1.38,.27),heat)*i.color.rgb;
   alpha=body*edge*i.color.a;
 }else{
   let body=1.0-smoothstep(.3,.98,length(p+vec2<f32>(n-.5,fine-.5)*.23));
   let density=body*(.3+n*.48+fine*.22);
   alpha=density*edge*i.color.a;
   rgb=i.color.rgb*(.75+fine*.25);
 }
 alpha=softParticle(i.position,alpha,i.fade_distance);
 return vec4<f32>(rgb*alpha,alpha);
}
