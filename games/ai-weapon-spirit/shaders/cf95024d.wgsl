#define_import_path ai_weapon_spirit_magic::prismatic_lightning

// Native Ribbon segment ABI: endpoints and width are prepared by the VFX renderer.
struct SegmentInput {
 @location(0) start: vec3<f32>,
 @location(1) endpoint: vec3<f32>,
 @location(2) color: vec4<f32>,
 @location(3) properties: vec2<f32>,
}
struct VertexOutput {
 @builtin(position) position: vec4<f32>,
 @location(0) color: vec4<f32>,
 @location(1) side: f32,
}
@vertex fn vs_main(input: SegmentInput, @builtin(vertex_index) vertex_index: u32) -> VertexOutput {
 let corners=array<vec2<f32>,6>(vec2<f32>(0.0,-1.0),vec2<f32>(1.0,-1.0),vec2<f32>(1.0,1.0),
  vec2<f32>(0.0,-1.0),vec2<f32>(1.0,1.0),vec2<f32>(0.0,1.0));
 let corner=corners[vertex_index];
 let delta=input.endpoint.xy-input.start.xy;
 let normal=normalize(vec2<f32>(-delta.y,delta.x)+vec2<f32>(.000001,0.0));
 let point=mix(input.start,input.endpoint,corner.x);
 var output:VertexOutput;
 // Reserve a soft corona around the authored conductor without more particles.
 output.position=vec4<f32>(point.xy+normal*corner.y*input.properties.x*2.5,point.z,1.0);
 output.color=input.color;output.side=corner.y;
 return output;
}
@fragment fn fs_main(input:VertexOutput)->@location(0) vec4<f32> {
 let radius=abs(input.side);
 let edge=1.0-smoothstep(.72,1.0,radius);
 let halo=exp(-radius*radius*5.0)*edge;
 let core=exp(-radius*radius*100.0);
 let opacity=clamp(input.color.a,0.0,1.0);
 // Linear HDR emission: a hot near-white spine surrounded by the seven-color
 // corona. Additive light never darkens the scene; native Bloom spreads peaks.
 let hotCore=mix(vec3<f32>(1.0),input.color.rgb,.35);
 let radiance=input.color.rgb*(halo*2.4+core*6.0)+hotCore*core*3.0;
 return vec4<f32>(radiance*opacity,halo*opacity);
}
