// Renderer-owned scene colour/depth. A short hemispherical pulse refracts only
// visible pixels behind its front surface; foreground objects remain intact.
struct Out { @builtin(position) position:vec4<f32>, @location(0) uv:vec2<f32> };
struct SeedEffect { centerRadius:vec4<f32>, eyeStrength:vec4<f32>, clock:vec4<f32> };
struct Params { inverseViewProjection:mat4x4<f32>, effects:array<SeedEffect,6> };
@group(1) @binding(0) var sceneColor:texture_2d<f32>;
@group(1) @binding(1) var sceneSampler:sampler;
@group(1) @binding(2) var<uniform> p:Params;
@group(1) @binding(3) var sceneDepth:texture_depth_2d;
@group(1) @binding(4) var depthSampler:sampler;
@vertex fn vs_main(@builtin(vertex_index) index:u32)->Out {
 let x=select(-1.0,3.0,index==1u);let y=select(-1.0,3.0,index==2u);
 var o:Out;o.position=vec4<f32>(x,y,0.0,1.0);o.uv=vec2<f32>((x+1.0)*.5,1.0-(y+1.0)*.5);return o;
}
fn worldAt(uv:vec2<f32>,depth:f32)->vec3<f32>{
 let w=p.inverseViewProjection*vec4<f32>(uv.x*2.0-1.0,1.0-uv.y*2.0,depth,1.0);return w.xyz/w.w;
}
@fragment fn fs_main(i:Out)->@location(0) vec4<f32>{
 let original=textureSampleLevel(sceneColor,sceneSampler,i.uv,0.0);
 if(p.effects[0].eyeStrength.w<=0.0&&p.effects[0].clock.z<=0.0){return original;}
 let dimensions=textureDimensions(sceneDepth);
 let pixel=clamp(vec2<i32>(i.uv*vec2<f32>(dimensions)),vec2<i32>(0),vec2<i32>(dimensions)-1);
 let point=worldAt(i.uv,textureLoad(sceneDepth,pixel,0));
 let ray=normalize(point-p.effects[0].eyeStrength.xyz);
 var uv=i.uv;var highlight=vec3<f32>(0.0);
 // All six casts share depth reconstruction and one final scene-colour sample.
 for(var index=0u;index<6u;index++){
  let effect=p.effects[index];
  if(effect.eyeStrength.w<=0.0&&effect.clock.z<=0.0){break;}
  let toCentre=point.xz-effect.centerRadius.xz;
  let proximity=1.0-smoothstep(effect.centerRadius.w*.4,effect.centerRadius.w*2.8,length(toCentre));
  let kick=sin(effect.clock.x*96.0)*effect.clock.z*proximity;
  uv=clamp(uv+vec2<f32>(kick*.25,-kick*.65)/vec2<f32>(dimensions),vec2<f32>(.001),vec2<f32>(.999));
  let offset=effect.eyeStrength.xyz-effect.centerRadius.xyz;
  let b=dot(offset,ray);let d=b*b-dot(offset,offset)+effect.centerRadius.w*effect.centerRadius.w;
  if(d<=0.0){continue;}
  let distance=-b-sqrt(d);
  if(distance<=0.0||length(point-effect.eyeStrength.xyz)<distance){continue;}
  let hit=effect.eyeStrength.xyz+ray*distance;
  if(hit.y<effect.clock.y){continue;}
  let normal=normalize(hit-effect.centerRadius.xyz);
  let facing=abs(dot(normal,-ray));let rim=pow(1.0-facing,2.0);
  let ripple=sin(hit.y*21.0+hit.x*13.0-hit.z*17.0-effect.clock.x*38.0);
  // Rupture opens at the crown, then runs down uneven meridians. A few large
  // connected gaps read as a membrane tearing away instead of a fading globe.
  let azimuth=atan2(normal.z,normal.x);
  let tearPattern=clamp(.1+.58*(1.0-normal.y)+.13*sin(azimuth*3.0+normal.y*4.0)+.07*sin(azimuth*7.0-normal.y*3.0),.075,.94);
  let shell=1.0-smoothstep(tearPattern-.055,tearPattern+.085,effect.clock.w);
  let shift=vec2<f32>(normal.x+normal.z*.35,-normal.y)*effect.eyeStrength.w*(.25+rim*.75)*(1.0+ripple*.35)*shell/vec2<f32>(dimensions);
  uv=clamp(uv+shift,vec2<f32>(.001),vec2<f32>(.999));
  // Refraction and impact amplitudes remain intact; only the visible rim is
  // broken into moving lime strokes, leaving the shell optically transparent.
  let stroke=smoothstep(.18,.85,.5+.5*sin(normal.x*8.0+normal.z*6.0-effect.clock.x*11.0));
  let rimTint=mix(vec3<f32>(.07,.17,.018),vec3<f32>(.24,.34,.035),stroke);
  let tearEdge=(1.0-smoothstep(.018,.085,abs(effect.clock.w-tearPattern)))*smoothstep(0.0,.12,effect.clock.w);
  highlight+=rimTint*rim*(.15+.85*stroke)*effect.eyeStrength.w/9.0*shell
    +vec3<f32>(.12,.19,.015)*tearEdge*shell*effect.eyeStrength.w/9.0
    +vec3<f32>(.035,.045,.012)*proximity*effect.clock.z/9.0;
 }
 return vec4<f32>(textureSampleLevel(sceneColor,sceneSampler,uv,0.0).rgb+highlight,original.a);
}
