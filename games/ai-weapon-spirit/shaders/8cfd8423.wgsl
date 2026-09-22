#define_import_path ai_weapon_spirit_vfx::wood_seed_beam
#import forgeax_view::common::{View, view}
struct Input {
 @location(0) p:vec3<f32>, @location(1) normal:vec3<f32>, @location(2) uv:vec2<f32>, @location(3) tangent:vec4<f32>,
 @location(4) center:vec3<f32>, @location(5) right:vec3<f32>, @location(6) up:vec3<f32>, @location(7) forward:vec3<f32>,
 @location(8) color:vec4<f32>,
  @location(9) render_controls: vec2<f32>,
};
struct Out { @builtin(position) position:vec4<f32>, @location(0) local:vec3<f32>, @location(1) color:vec4<f32> };
@vertex fn vs_main(i:Input)->Out {
 var o:Out;o.position=view.worldViewProj * vec4<f32>(i.center+i.right*i.p.x+i.up*i.p.y+i.forward*i.p.z,1.0);
 o.local=i.p;o.color=i.color;return o;
}
@fragment fn fs_main(i:Out)->@location(0) vec4<f32> {
 let radius=length(i.local.xz);
 let core=exp(-radius*radius*1600.0);
 let edge=exp(-radius*radius*65.0)*(1.0-smoothstep(.19,.28,radius));
 let alpha=edge*i.color.a;
 let rgb=mix(vec3<f32>(.25,1.25,.16),vec3<f32>(2.1,2.5,1.0),core);
 return vec4<f32>(rgb*alpha,alpha);
}
