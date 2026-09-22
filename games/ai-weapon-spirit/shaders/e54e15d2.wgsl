struct Out { @builtin(position) position:vec4<f32>, @location(0) uv:vec2<f32> };
struct Params { centerClock:vec4<f32>, impact:vec4<f32>, view:vec4<f32> };
@group(1) @binding(0) var sceneColor:texture_2d<f32>;
@group(1) @binding(1) var sceneSampler:sampler;
@group(1) @binding(2) var<uniform> p:Params;
@vertex fn vs_main(@builtin(vertex_index) index:u32)->Out {
 let x=select(-1.0,3.0,index==1u);let y=select(-1.0,3.0,index==2u);
 var o:Out;o.position=vec4<f32>(x,y,0.0,1.0);o.uv=vec2<f32>((x+1.0)*.5,1.0-(y+1.0)*.5);return o;
}
@fragment fn fs_main(i:Out)->@location(0) vec4<f32>{
 let original=textureSampleLevel(sceneColor,sceneSampler,i.uv,0.0);
 if(p.centerClock.w<=0.0){return original;}
 let size=vec2<f32>(textureDimensions(sceneColor));
 let delta=(i.uv-p.centerClock.xy)*vec2<f32>(p.view.x,1.0);
 let distance=length(delta);let direction=delta/max(distance,.0001);
 let age=p.centerClock.z;let envelope=p.centerClock.w;
 let radius=.04+.92*clamp(age/max(p.view.y,.001),0.0,1.0);
 let ring=exp(-pow((distance-radius)/.055,2.0));
 let shift=direction*p.impact.y*envelope*ring/size;
 let uv=clamp(i.uv+shift,vec2<f32>(.001),vec2<f32>(.999));
 let chromatic=direction*p.impact.z*envelope/size;
 let r=textureSampleLevel(sceneColor,sceneSampler,clamp(uv+chromatic,vec2<f32>(.001),vec2<f32>(.999)),0.0).r;
 let g=textureSampleLevel(sceneColor,sceneSampler,uv,0.0).g;
 let b=textureSampleLevel(sceneColor,sceneSampler,clamp(uv-chromatic,vec2<f32>(.001),vec2<f32>(.999)),0.0).b;
 let edge=smoothstep(.2,.7,length((i.uv-.5)*vec2<f32>(1.0,.85)));
 var color=vec3<f32>(r,g,b)*(1.0-edge*p.impact.w*envelope);
 color=mix(color,vec3<f32>(1.0,.93,.78),clamp(p.impact.x,0.0,.7));
 return vec4<f32>(color,original.a);
}
