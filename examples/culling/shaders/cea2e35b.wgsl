const SSR_HIZ_EMPTY_DEPTH: f32 = 3.402823e38f;

@group(0) @binding(0) 
var sourceHiZ: texture_2d<f32>;
@group(0) @binding(1) 
var hizOutput: texture_storage_2d<r32float,write>;

fn isFinite(value: f32) -> bool {
    var local_1: bool;

    if (value == value) {
        local_1 = (abs(value) < 3.402823e38f);
    } else {
        local_1 = false;
    }
    let _e8 = local_1;
    return _e8;
}

fn normalizeSsrHiZDepth(value_1: f32) -> f32 {
    var local_2: bool;

    let _e1 = isFinite(value_1);
    if _e1 {
        local_2 = (value_1 > 0f);
    } else {
        local_2 = false;
    }
    let _e8 = local_2;
    return select(SSR_HIZ_EMPTY_DEPTH, value_1, _e8);
}

fn reduceSsrHiZFootprint(destinationCoordinate: vec2<u32>, sourceSize: vec2<u32>, destinationSize: vec2<u32>) -> f32 {
    var minimum: f32 = SSR_HIZ_EMPTY_DEPTH;
    var y: u32;
    var x: u32;

    let sourceStart = ((destinationCoordinate * sourceSize) / destinationSize);
    let sourceEnd = min((((((destinationCoordinate + vec2(1u)) * sourceSize) + destinationSize) - vec2(1u)) / destinationSize), sourceSize);
    y = sourceStart.y;
    loop {
        let _e18 = y;
        if (_e18 < sourceEnd.y) {
        } else {
            break;
        }
        {
            x = sourceStart.x;
            loop {
                let _e23 = x;
                if (_e23 < sourceEnd.x) {
                } else {
                    break;
                }
                {
                    let _e26 = x;
                    let _e27 = y;
                    let _e32 = textureLoad(sourceHiZ, vec2<i32>(vec2<u32>(_e26, _e27)), 0i);
                    let _e34 = normalizeSsrHiZDepth(_e32.x);
                    let _e36 = minimum;
                    minimum = min(_e36, _e34);
                }
                continuing {
                    let _e38 = x;
                    x = (_e38 + 1u);
                }
            }
        }
        continuing {
            let _e41 = y;
            y = (_e41 + 1u);
        }
    }
    let _e44 = minimum;
    return _e44;
}

@compute @workgroup_size(8, 8, 1) 
fn ssr_hiz_reduce(@builtin(global_invocation_id) globalId: vec3<u32>) {
    var local: bool;

    let sourceSize_1 = textureDimensions(sourceHiZ, 0i);
    let destinationSize_1 = textureDimensions(hizOutput);
    if !((globalId.x >= destinationSize_1.x)) {
        local = (globalId.y >= destinationSize_1.y);
    } else {
        local = true;
    }
    let _e16 = local;
    if _e16 {
        return;
    }
    let _e18 = reduceSsrHiZFootprint(globalId.xy, sourceSize_1, destinationSize_1);
    textureStore(hizOutput, vec2<i32>(globalId.xy), vec4<f32>(_e18, 0f, 0f, 1f));
    return;
}
