import { ok, err } from '../../types/dist/index.mjs';
import { sha256 } from '../../../vendor/@noble/hashes/sha2.js';
import { bytesToHex } from '../../../vendor/@noble/hashes/utils.js';
import { RhiError } from '../../rhi/dist/index.mjs';

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  __defProp(target, "default", { value: mod, enumerable: true }) ,
  mod
));

// ../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/utils/common.js
var require_common = __commonJS({
  "../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/utils/common.js"(exports) {
    var TYPED_OK = typeof Uint8Array !== "undefined" && typeof Uint16Array !== "undefined" && typeof Int32Array !== "undefined";
    function _has(obj, key) {
      return Object.prototype.hasOwnProperty.call(obj, key);
    }
    exports.assign = function(obj) {
      var sources = Array.prototype.slice.call(arguments, 1);
      while (sources.length) {
        var source = sources.shift();
        if (!source) {
          continue;
        }
        if (typeof source !== "object") {
          throw new TypeError(source + "must be non-object");
        }
        for (var p in source) {
          if (_has(source, p)) {
            obj[p] = source[p];
          }
        }
      }
      return obj;
    };
    exports.shrinkBuf = function(buf, size) {
      if (buf.length === size) {
        return buf;
      }
      if (buf.subarray) {
        return buf.subarray(0, size);
      }
      buf.length = size;
      return buf;
    };
    var fnTyped = {
      arraySet: function(dest, src, src_offs, len, dest_offs) {
        if (src.subarray && dest.subarray) {
          dest.set(src.subarray(src_offs, src_offs + len), dest_offs);
          return;
        }
        for (var i = 0; i < len; i++) {
          dest[dest_offs + i] = src[src_offs + i];
        }
      },
      // Join array of chunks to single array.
      flattenChunks: function(chunks) {
        var i, l, len, pos, chunk, result;
        len = 0;
        for (i = 0, l = chunks.length; i < l; i++) {
          len += chunks[i].length;
        }
        result = new Uint8Array(len);
        pos = 0;
        for (i = 0, l = chunks.length; i < l; i++) {
          chunk = chunks[i];
          result.set(chunk, pos);
          pos += chunk.length;
        }
        return result;
      }
    };
    var fnUntyped = {
      arraySet: function(dest, src, src_offs, len, dest_offs) {
        for (var i = 0; i < len; i++) {
          dest[dest_offs + i] = src[src_offs + i];
        }
      },
      // Join array of chunks to single array.
      flattenChunks: function(chunks) {
        return [].concat.apply([], chunks);
      }
    };
    exports.setTyped = function(on) {
      if (on) {
        exports.Buf8 = Uint8Array;
        exports.Buf16 = Uint16Array;
        exports.Buf32 = Int32Array;
        exports.assign(exports, fnTyped);
      } else {
        exports.Buf8 = Array;
        exports.Buf16 = Array;
        exports.Buf32 = Array;
        exports.assign(exports, fnUntyped);
      }
    };
    exports.setTyped(TYPED_OK);
  }
});

// ../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/trees.js
var require_trees = __commonJS({
  "../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/trees.js"(exports) {
    var utils = require_common();
    var Z_FIXED = 4;
    var Z_BINARY = 0;
    var Z_TEXT = 1;
    var Z_UNKNOWN = 2;
    function zero(buf) {
      var len = buf.length;
      while (--len >= 0) {
        buf[len] = 0;
      }
    }
    var STORED_BLOCK = 0;
    var STATIC_TREES = 1;
    var DYN_TREES = 2;
    var MIN_MATCH = 3;
    var MAX_MATCH = 258;
    var LENGTH_CODES = 29;
    var LITERALS = 256;
    var L_CODES = LITERALS + 1 + LENGTH_CODES;
    var D_CODES = 30;
    var BL_CODES = 19;
    var HEAP_SIZE = 2 * L_CODES + 1;
    var MAX_BITS = 15;
    var Buf_size = 16;
    var MAX_BL_BITS = 7;
    var END_BLOCK = 256;
    var REP_3_6 = 16;
    var REPZ_3_10 = 17;
    var REPZ_11_138 = 18;
    var extra_lbits = (
      /* extra bits for each length code */
      [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0]
    );
    var extra_dbits = (
      /* extra bits for each distance code */
      [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13]
    );
    var extra_blbits = (
      /* extra bits for each bit length code */
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7]
    );
    var bl_order = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
    var DIST_CODE_LEN = 512;
    var static_ltree = new Array((L_CODES + 2) * 2);
    zero(static_ltree);
    var static_dtree = new Array(D_CODES * 2);
    zero(static_dtree);
    var _dist_code = new Array(DIST_CODE_LEN);
    zero(_dist_code);
    var _length_code = new Array(MAX_MATCH - MIN_MATCH + 1);
    zero(_length_code);
    var base_length = new Array(LENGTH_CODES);
    zero(base_length);
    var base_dist = new Array(D_CODES);
    zero(base_dist);
    function StaticTreeDesc(static_tree, extra_bits, extra_base, elems, max_length) {
      this.static_tree = static_tree;
      this.extra_bits = extra_bits;
      this.extra_base = extra_base;
      this.elems = elems;
      this.max_length = max_length;
      this.has_stree = static_tree && static_tree.length;
    }
    var static_l_desc;
    var static_d_desc;
    var static_bl_desc;
    function TreeDesc(dyn_tree, stat_desc) {
      this.dyn_tree = dyn_tree;
      this.max_code = 0;
      this.stat_desc = stat_desc;
    }
    function d_code(dist) {
      return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
    }
    function put_short(s, w) {
      s.pending_buf[s.pending++] = w & 255;
      s.pending_buf[s.pending++] = w >>> 8 & 255;
    }
    function send_bits(s, value, length) {
      if (s.bi_valid > Buf_size - length) {
        s.bi_buf |= value << s.bi_valid & 65535;
        put_short(s, s.bi_buf);
        s.bi_buf = value >> Buf_size - s.bi_valid;
        s.bi_valid += length - Buf_size;
      } else {
        s.bi_buf |= value << s.bi_valid & 65535;
        s.bi_valid += length;
      }
    }
    function send_code(s, c, tree) {
      send_bits(
        s,
        tree[c * 2],
        tree[c * 2 + 1]
        /*.Len*/
      );
    }
    function bi_reverse(code, len) {
      var res = 0;
      do {
        res |= code & 1;
        code >>>= 1;
        res <<= 1;
      } while (--len > 0);
      return res >>> 1;
    }
    function bi_flush(s) {
      if (s.bi_valid === 16) {
        put_short(s, s.bi_buf);
        s.bi_buf = 0;
        s.bi_valid = 0;
      } else if (s.bi_valid >= 8) {
        s.pending_buf[s.pending++] = s.bi_buf & 255;
        s.bi_buf >>= 8;
        s.bi_valid -= 8;
      }
    }
    function gen_bitlen(s, desc) {
      var tree = desc.dyn_tree;
      var max_code = desc.max_code;
      var stree = desc.stat_desc.static_tree;
      var has_stree = desc.stat_desc.has_stree;
      var extra = desc.stat_desc.extra_bits;
      var base = desc.stat_desc.extra_base;
      var max_length = desc.stat_desc.max_length;
      var h;
      var n, m;
      var bits;
      var xbits;
      var f;
      var overflow = 0;
      for (bits = 0; bits <= MAX_BITS; bits++) {
        s.bl_count[bits] = 0;
      }
      tree[s.heap[s.heap_max] * 2 + 1] = 0;
      for (h = s.heap_max + 1; h < HEAP_SIZE; h++) {
        n = s.heap[h];
        bits = tree[tree[n * 2 + 1] * 2 + 1] + 1;
        if (bits > max_length) {
          bits = max_length;
          overflow++;
        }
        tree[n * 2 + 1] = bits;
        if (n > max_code) {
          continue;
        }
        s.bl_count[bits]++;
        xbits = 0;
        if (n >= base) {
          xbits = extra[n - base];
        }
        f = tree[n * 2];
        s.opt_len += f * (bits + xbits);
        if (has_stree) {
          s.static_len += f * (stree[n * 2 + 1] + xbits);
        }
      }
      if (overflow === 0) {
        return;
      }
      do {
        bits = max_length - 1;
        while (s.bl_count[bits] === 0) {
          bits--;
        }
        s.bl_count[bits]--;
        s.bl_count[bits + 1] += 2;
        s.bl_count[max_length]--;
        overflow -= 2;
      } while (overflow > 0);
      for (bits = max_length; bits !== 0; bits--) {
        n = s.bl_count[bits];
        while (n !== 0) {
          m = s.heap[--h];
          if (m > max_code) {
            continue;
          }
          if (tree[m * 2 + 1] !== bits) {
            s.opt_len += (bits - tree[m * 2 + 1]) * tree[m * 2];
            tree[m * 2 + 1] = bits;
          }
          n--;
        }
      }
    }
    function gen_codes(tree, max_code, bl_count) {
      var next_code = new Array(MAX_BITS + 1);
      var code = 0;
      var bits;
      var n;
      for (bits = 1; bits <= MAX_BITS; bits++) {
        next_code[bits] = code = code + bl_count[bits - 1] << 1;
      }
      for (n = 0; n <= max_code; n++) {
        var len = tree[n * 2 + 1];
        if (len === 0) {
          continue;
        }
        tree[n * 2] = bi_reverse(next_code[len]++, len);
      }
    }
    function tr_static_init() {
      var n;
      var bits;
      var length;
      var code;
      var dist;
      var bl_count = new Array(MAX_BITS + 1);
      length = 0;
      for (code = 0; code < LENGTH_CODES - 1; code++) {
        base_length[code] = length;
        for (n = 0; n < 1 << extra_lbits[code]; n++) {
          _length_code[length++] = code;
        }
      }
      _length_code[length - 1] = code;
      dist = 0;
      for (code = 0; code < 16; code++) {
        base_dist[code] = dist;
        for (n = 0; n < 1 << extra_dbits[code]; n++) {
          _dist_code[dist++] = code;
        }
      }
      dist >>= 7;
      for (; code < D_CODES; code++) {
        base_dist[code] = dist << 7;
        for (n = 0; n < 1 << extra_dbits[code] - 7; n++) {
          _dist_code[256 + dist++] = code;
        }
      }
      for (bits = 0; bits <= MAX_BITS; bits++) {
        bl_count[bits] = 0;
      }
      n = 0;
      while (n <= 143) {
        static_ltree[n * 2 + 1] = 8;
        n++;
        bl_count[8]++;
      }
      while (n <= 255) {
        static_ltree[n * 2 + 1] = 9;
        n++;
        bl_count[9]++;
      }
      while (n <= 279) {
        static_ltree[n * 2 + 1] = 7;
        n++;
        bl_count[7]++;
      }
      while (n <= 287) {
        static_ltree[n * 2 + 1] = 8;
        n++;
        bl_count[8]++;
      }
      gen_codes(static_ltree, L_CODES + 1, bl_count);
      for (n = 0; n < D_CODES; n++) {
        static_dtree[n * 2 + 1] = 5;
        static_dtree[n * 2] = bi_reverse(n, 5);
      }
      static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, LITERALS + 1, L_CODES, MAX_BITS);
      static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0, D_CODES, MAX_BITS);
      static_bl_desc = new StaticTreeDesc(new Array(0), extra_blbits, 0, BL_CODES, MAX_BL_BITS);
    }
    function init_block(s) {
      var n;
      for (n = 0; n < L_CODES; n++) {
        s.dyn_ltree[n * 2] = 0;
      }
      for (n = 0; n < D_CODES; n++) {
        s.dyn_dtree[n * 2] = 0;
      }
      for (n = 0; n < BL_CODES; n++) {
        s.bl_tree[n * 2] = 0;
      }
      s.dyn_ltree[END_BLOCK * 2] = 1;
      s.opt_len = s.static_len = 0;
      s.last_lit = s.matches = 0;
    }
    function bi_windup(s) {
      if (s.bi_valid > 8) {
        put_short(s, s.bi_buf);
      } else if (s.bi_valid > 0) {
        s.pending_buf[s.pending++] = s.bi_buf;
      }
      s.bi_buf = 0;
      s.bi_valid = 0;
    }
    function copy_block(s, buf, len, header) {
      bi_windup(s);
      {
        put_short(s, len);
        put_short(s, ~len);
      }
      utils.arraySet(s.pending_buf, s.window, buf, len, s.pending);
      s.pending += len;
    }
    function smaller(tree, n, m, depth) {
      var _n2 = n * 2;
      var _m2 = m * 2;
      return tree[_n2] < tree[_m2] || tree[_n2] === tree[_m2] && depth[n] <= depth[m];
    }
    function pqdownheap(s, tree, k) {
      var v = s.heap[k];
      var j = k << 1;
      while (j <= s.heap_len) {
        if (j < s.heap_len && smaller(tree, s.heap[j + 1], s.heap[j], s.depth)) {
          j++;
        }
        if (smaller(tree, v, s.heap[j], s.depth)) {
          break;
        }
        s.heap[k] = s.heap[j];
        k = j;
        j <<= 1;
      }
      s.heap[k] = v;
    }
    function compress_block(s, ltree, dtree) {
      var dist;
      var lc;
      var lx = 0;
      var code;
      var extra;
      if (s.last_lit !== 0) {
        do {
          dist = s.pending_buf[s.d_buf + lx * 2] << 8 | s.pending_buf[s.d_buf + lx * 2 + 1];
          lc = s.pending_buf[s.l_buf + lx];
          lx++;
          if (dist === 0) {
            send_code(s, lc, ltree);
          } else {
            code = _length_code[lc];
            send_code(s, code + LITERALS + 1, ltree);
            extra = extra_lbits[code];
            if (extra !== 0) {
              lc -= base_length[code];
              send_bits(s, lc, extra);
            }
            dist--;
            code = d_code(dist);
            send_code(s, code, dtree);
            extra = extra_dbits[code];
            if (extra !== 0) {
              dist -= base_dist[code];
              send_bits(s, dist, extra);
            }
          }
        } while (lx < s.last_lit);
      }
      send_code(s, END_BLOCK, ltree);
    }
    function build_tree(s, desc) {
      var tree = desc.dyn_tree;
      var stree = desc.stat_desc.static_tree;
      var has_stree = desc.stat_desc.has_stree;
      var elems = desc.stat_desc.elems;
      var n, m;
      var max_code = -1;
      var node;
      s.heap_len = 0;
      s.heap_max = HEAP_SIZE;
      for (n = 0; n < elems; n++) {
        if (tree[n * 2] !== 0) {
          s.heap[++s.heap_len] = max_code = n;
          s.depth[n] = 0;
        } else {
          tree[n * 2 + 1] = 0;
        }
      }
      while (s.heap_len < 2) {
        node = s.heap[++s.heap_len] = max_code < 2 ? ++max_code : 0;
        tree[node * 2] = 1;
        s.depth[node] = 0;
        s.opt_len--;
        if (has_stree) {
          s.static_len -= stree[node * 2 + 1];
        }
      }
      desc.max_code = max_code;
      for (n = s.heap_len >> 1; n >= 1; n--) {
        pqdownheap(s, tree, n);
      }
      node = elems;
      do {
        n = s.heap[
          1
          /*SMALLEST*/
        ];
        s.heap[
          1
          /*SMALLEST*/
        ] = s.heap[s.heap_len--];
        pqdownheap(
          s,
          tree,
          1
          /*SMALLEST*/
        );
        m = s.heap[
          1
          /*SMALLEST*/
        ];
        s.heap[--s.heap_max] = n;
        s.heap[--s.heap_max] = m;
        tree[node * 2] = tree[n * 2] + tree[m * 2];
        s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
        tree[n * 2 + 1] = tree[m * 2 + 1] = node;
        s.heap[
          1
          /*SMALLEST*/
        ] = node++;
        pqdownheap(
          s,
          tree,
          1
          /*SMALLEST*/
        );
      } while (s.heap_len >= 2);
      s.heap[--s.heap_max] = s.heap[
        1
        /*SMALLEST*/
      ];
      gen_bitlen(s, desc);
      gen_codes(tree, max_code, s.bl_count);
    }
    function scan_tree(s, tree, max_code) {
      var n;
      var prevlen = -1;
      var curlen;
      var nextlen = tree[0 * 2 + 1];
      var count = 0;
      var max_count = 7;
      var min_count = 4;
      if (nextlen === 0) {
        max_count = 138;
        min_count = 3;
      }
      tree[(max_code + 1) * 2 + 1] = 65535;
      for (n = 0; n <= max_code; n++) {
        curlen = nextlen;
        nextlen = tree[(n + 1) * 2 + 1];
        if (++count < max_count && curlen === nextlen) {
          continue;
        } else if (count < min_count) {
          s.bl_tree[curlen * 2] += count;
        } else if (curlen !== 0) {
          if (curlen !== prevlen) {
            s.bl_tree[curlen * 2]++;
          }
          s.bl_tree[REP_3_6 * 2]++;
        } else if (count <= 10) {
          s.bl_tree[REPZ_3_10 * 2]++;
        } else {
          s.bl_tree[REPZ_11_138 * 2]++;
        }
        count = 0;
        prevlen = curlen;
        if (nextlen === 0) {
          max_count = 138;
          min_count = 3;
        } else if (curlen === nextlen) {
          max_count = 6;
          min_count = 3;
        } else {
          max_count = 7;
          min_count = 4;
        }
      }
    }
    function send_tree(s, tree, max_code) {
      var n;
      var prevlen = -1;
      var curlen;
      var nextlen = tree[0 * 2 + 1];
      var count = 0;
      var max_count = 7;
      var min_count = 4;
      if (nextlen === 0) {
        max_count = 138;
        min_count = 3;
      }
      for (n = 0; n <= max_code; n++) {
        curlen = nextlen;
        nextlen = tree[(n + 1) * 2 + 1];
        if (++count < max_count && curlen === nextlen) {
          continue;
        } else if (count < min_count) {
          do {
            send_code(s, curlen, s.bl_tree);
          } while (--count !== 0);
        } else if (curlen !== 0) {
          if (curlen !== prevlen) {
            send_code(s, curlen, s.bl_tree);
            count--;
          }
          send_code(s, REP_3_6, s.bl_tree);
          send_bits(s, count - 3, 2);
        } else if (count <= 10) {
          send_code(s, REPZ_3_10, s.bl_tree);
          send_bits(s, count - 3, 3);
        } else {
          send_code(s, REPZ_11_138, s.bl_tree);
          send_bits(s, count - 11, 7);
        }
        count = 0;
        prevlen = curlen;
        if (nextlen === 0) {
          max_count = 138;
          min_count = 3;
        } else if (curlen === nextlen) {
          max_count = 6;
          min_count = 3;
        } else {
          max_count = 7;
          min_count = 4;
        }
      }
    }
    function build_bl_tree(s) {
      var max_blindex;
      scan_tree(s, s.dyn_ltree, s.l_desc.max_code);
      scan_tree(s, s.dyn_dtree, s.d_desc.max_code);
      build_tree(s, s.bl_desc);
      for (max_blindex = BL_CODES - 1; max_blindex >= 3; max_blindex--) {
        if (s.bl_tree[bl_order[max_blindex] * 2 + 1] !== 0) {
          break;
        }
      }
      s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
      return max_blindex;
    }
    function send_all_trees(s, lcodes, dcodes, blcodes) {
      var rank;
      send_bits(s, lcodes - 257, 5);
      send_bits(s, dcodes - 1, 5);
      send_bits(s, blcodes - 4, 4);
      for (rank = 0; rank < blcodes; rank++) {
        send_bits(s, s.bl_tree[bl_order[rank] * 2 + 1], 3);
      }
      send_tree(s, s.dyn_ltree, lcodes - 1);
      send_tree(s, s.dyn_dtree, dcodes - 1);
    }
    function detect_data_type(s) {
      var black_mask = 4093624447;
      var n;
      for (n = 0; n <= 31; n++, black_mask >>>= 1) {
        if (black_mask & 1 && s.dyn_ltree[n * 2] !== 0) {
          return Z_BINARY;
        }
      }
      if (s.dyn_ltree[9 * 2] !== 0 || s.dyn_ltree[10 * 2] !== 0 || s.dyn_ltree[13 * 2] !== 0) {
        return Z_TEXT;
      }
      for (n = 32; n < LITERALS; n++) {
        if (s.dyn_ltree[n * 2] !== 0) {
          return Z_TEXT;
        }
      }
      return Z_BINARY;
    }
    var static_init_done = false;
    function _tr_init(s) {
      if (!static_init_done) {
        tr_static_init();
        static_init_done = true;
      }
      s.l_desc = new TreeDesc(s.dyn_ltree, static_l_desc);
      s.d_desc = new TreeDesc(s.dyn_dtree, static_d_desc);
      s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);
      s.bi_buf = 0;
      s.bi_valid = 0;
      init_block(s);
    }
    function _tr_stored_block(s, buf, stored_len, last) {
      send_bits(s, (STORED_BLOCK << 1) + (last ? 1 : 0), 3);
      copy_block(s, buf, stored_len);
    }
    function _tr_align(s) {
      send_bits(s, STATIC_TREES << 1, 3);
      send_code(s, END_BLOCK, static_ltree);
      bi_flush(s);
    }
    function _tr_flush_block(s, buf, stored_len, last) {
      var opt_lenb, static_lenb;
      var max_blindex = 0;
      if (s.level > 0) {
        if (s.strm.data_type === Z_UNKNOWN) {
          s.strm.data_type = detect_data_type(s);
        }
        build_tree(s, s.l_desc);
        build_tree(s, s.d_desc);
        max_blindex = build_bl_tree(s);
        opt_lenb = s.opt_len + 3 + 7 >>> 3;
        static_lenb = s.static_len + 3 + 7 >>> 3;
        if (static_lenb <= opt_lenb) {
          opt_lenb = static_lenb;
        }
      } else {
        opt_lenb = static_lenb = stored_len + 5;
      }
      if (stored_len + 4 <= opt_lenb && buf !== -1) {
        _tr_stored_block(s, buf, stored_len, last);
      } else if (s.strategy === Z_FIXED || static_lenb === opt_lenb) {
        send_bits(s, (STATIC_TREES << 1) + (last ? 1 : 0), 3);
        compress_block(s, static_ltree, static_dtree);
      } else {
        send_bits(s, (DYN_TREES << 1) + (last ? 1 : 0), 3);
        send_all_trees(s, s.l_desc.max_code + 1, s.d_desc.max_code + 1, max_blindex + 1);
        compress_block(s, s.dyn_ltree, s.dyn_dtree);
      }
      init_block(s);
      if (last) {
        bi_windup(s);
      }
    }
    function _tr_tally(s, dist, lc) {
      s.pending_buf[s.d_buf + s.last_lit * 2] = dist >>> 8 & 255;
      s.pending_buf[s.d_buf + s.last_lit * 2 + 1] = dist & 255;
      s.pending_buf[s.l_buf + s.last_lit] = lc & 255;
      s.last_lit++;
      if (dist === 0) {
        s.dyn_ltree[lc * 2]++;
      } else {
        s.matches++;
        dist--;
        s.dyn_ltree[(_length_code[lc] + LITERALS + 1) * 2]++;
        s.dyn_dtree[d_code(dist) * 2]++;
      }
      return s.last_lit === s.lit_bufsize - 1;
    }
    exports._tr_init = _tr_init;
    exports._tr_stored_block = _tr_stored_block;
    exports._tr_flush_block = _tr_flush_block;
    exports._tr_tally = _tr_tally;
    exports._tr_align = _tr_align;
  }
});

// ../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/adler32.js
var require_adler32 = __commonJS({
  "../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/adler32.js"(exports, module) {
    function adler32(adler, buf, len, pos) {
      var s1 = adler & 65535 | 0, s2 = adler >>> 16 & 65535 | 0, n = 0;
      while (len !== 0) {
        n = len > 2e3 ? 2e3 : len;
        len -= n;
        do {
          s1 = s1 + buf[pos++] | 0;
          s2 = s2 + s1 | 0;
        } while (--n);
        s1 %= 65521;
        s2 %= 65521;
      }
      return s1 | s2 << 16 | 0;
    }
    module.exports = adler32;
  }
});

// ../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/crc32.js
var require_crc32 = __commonJS({
  "../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/crc32.js"(exports, module) {
    function makeTable() {
      var c, table = [];
      for (var n = 0; n < 256; n++) {
        c = n;
        for (var k = 0; k < 8; k++) {
          c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
        }
        table[n] = c;
      }
      return table;
    }
    var crcTable = makeTable();
    function crc32(crc, buf, len, pos) {
      var t = crcTable, end = pos + len;
      crc ^= -1;
      for (var i = pos; i < end; i++) {
        crc = crc >>> 8 ^ t[(crc ^ buf[i]) & 255];
      }
      return crc ^ -1;
    }
    module.exports = crc32;
  }
});

// ../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/messages.js
var require_messages = __commonJS({
  "../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/messages.js"(exports, module) {
    module.exports = {
      2: "need dictionary",
      /* Z_NEED_DICT       2  */
      1: "stream end",
      /* Z_STREAM_END      1  */
      0: "",
      /* Z_OK              0  */
      "-1": "file error",
      /* Z_ERRNO         (-1) */
      "-2": "stream error",
      /* Z_STREAM_ERROR  (-2) */
      "-3": "data error",
      /* Z_DATA_ERROR    (-3) */
      "-4": "insufficient memory",
      /* Z_MEM_ERROR     (-4) */
      "-5": "buffer error",
      /* Z_BUF_ERROR     (-5) */
      "-6": "incompatible version"
      /* Z_VERSION_ERROR (-6) */
    };
  }
});

// ../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/deflate.js
var require_deflate = __commonJS({
  "../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/deflate.js"(exports) {
    var utils = require_common();
    var trees = require_trees();
    var adler32 = require_adler32();
    var crc32 = require_crc32();
    var msg = require_messages();
    var Z_NO_FLUSH = 0;
    var Z_PARTIAL_FLUSH = 1;
    var Z_FULL_FLUSH = 3;
    var Z_FINISH = 4;
    var Z_BLOCK = 5;
    var Z_OK = 0;
    var Z_STREAM_END = 1;
    var Z_STREAM_ERROR = -2;
    var Z_DATA_ERROR = -3;
    var Z_BUF_ERROR = -5;
    var Z_DEFAULT_COMPRESSION = -1;
    var Z_FILTERED = 1;
    var Z_HUFFMAN_ONLY = 2;
    var Z_RLE = 3;
    var Z_FIXED = 4;
    var Z_DEFAULT_STRATEGY = 0;
    var Z_UNKNOWN = 2;
    var Z_DEFLATED = 8;
    var MAX_MEM_LEVEL = 9;
    var MAX_WBITS = 15;
    var DEF_MEM_LEVEL = 8;
    var LENGTH_CODES = 29;
    var LITERALS = 256;
    var L_CODES = LITERALS + 1 + LENGTH_CODES;
    var D_CODES = 30;
    var BL_CODES = 19;
    var HEAP_SIZE = 2 * L_CODES + 1;
    var MAX_BITS = 15;
    var MIN_MATCH = 3;
    var MAX_MATCH = 258;
    var MIN_LOOKAHEAD = MAX_MATCH + MIN_MATCH + 1;
    var PRESET_DICT = 32;
    var INIT_STATE = 42;
    var EXTRA_STATE = 69;
    var NAME_STATE = 73;
    var COMMENT_STATE = 91;
    var HCRC_STATE = 103;
    var BUSY_STATE = 113;
    var FINISH_STATE = 666;
    var BS_NEED_MORE = 1;
    var BS_BLOCK_DONE = 2;
    var BS_FINISH_STARTED = 3;
    var BS_FINISH_DONE = 4;
    var OS_CODE = 3;
    function err12(strm, errorCode) {
      strm.msg = msg[errorCode];
      return errorCode;
    }
    function rank(f) {
      return (f << 1) - (f > 4 ? 9 : 0);
    }
    function zero(buf) {
      var len = buf.length;
      while (--len >= 0) {
        buf[len] = 0;
      }
    }
    function flush_pending(strm) {
      var s = strm.state;
      var len = s.pending;
      if (len > strm.avail_out) {
        len = strm.avail_out;
      }
      if (len === 0) {
        return;
      }
      utils.arraySet(strm.output, s.pending_buf, s.pending_out, len, strm.next_out);
      strm.next_out += len;
      s.pending_out += len;
      strm.total_out += len;
      strm.avail_out -= len;
      s.pending -= len;
      if (s.pending === 0) {
        s.pending_out = 0;
      }
    }
    function flush_block_only(s, last) {
      trees._tr_flush_block(s, s.block_start >= 0 ? s.block_start : -1, s.strstart - s.block_start, last);
      s.block_start = s.strstart;
      flush_pending(s.strm);
    }
    function put_byte(s, b) {
      s.pending_buf[s.pending++] = b;
    }
    function putShortMSB(s, b) {
      s.pending_buf[s.pending++] = b >>> 8 & 255;
      s.pending_buf[s.pending++] = b & 255;
    }
    function read_buf(strm, buf, start, size) {
      var len = strm.avail_in;
      if (len > size) {
        len = size;
      }
      if (len === 0) {
        return 0;
      }
      strm.avail_in -= len;
      utils.arraySet(buf, strm.input, strm.next_in, len, start);
      if (strm.state.wrap === 1) {
        strm.adler = adler32(strm.adler, buf, len, start);
      } else if (strm.state.wrap === 2) {
        strm.adler = crc32(strm.adler, buf, len, start);
      }
      strm.next_in += len;
      strm.total_in += len;
      return len;
    }
    function longest_match(s, cur_match) {
      var chain_length = s.max_chain_length;
      var scan = s.strstart;
      var match;
      var len;
      var best_len = s.prev_length;
      var nice_match = s.nice_match;
      var limit = s.strstart > s.w_size - MIN_LOOKAHEAD ? s.strstart - (s.w_size - MIN_LOOKAHEAD) : 0;
      var _win = s.window;
      var wmask = s.w_mask;
      var prev = s.prev;
      var strend = s.strstart + MAX_MATCH;
      var scan_end1 = _win[scan + best_len - 1];
      var scan_end = _win[scan + best_len];
      if (s.prev_length >= s.good_match) {
        chain_length >>= 2;
      }
      if (nice_match > s.lookahead) {
        nice_match = s.lookahead;
      }
      do {
        match = cur_match;
        if (_win[match + best_len] !== scan_end || _win[match + best_len - 1] !== scan_end1 || _win[match] !== _win[scan] || _win[++match] !== _win[scan + 1]) {
          continue;
        }
        scan += 2;
        match++;
        do {
        } while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && scan < strend);
        len = MAX_MATCH - (strend - scan);
        scan = strend - MAX_MATCH;
        if (len > best_len) {
          s.match_start = cur_match;
          best_len = len;
          if (len >= nice_match) {
            break;
          }
          scan_end1 = _win[scan + best_len - 1];
          scan_end = _win[scan + best_len];
        }
      } while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);
      if (best_len <= s.lookahead) {
        return best_len;
      }
      return s.lookahead;
    }
    function fill_window(s) {
      var _w_size = s.w_size;
      var p, n, m, more, str;
      do {
        more = s.window_size - s.lookahead - s.strstart;
        if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {
          utils.arraySet(s.window, s.window, _w_size, _w_size, 0);
          s.match_start -= _w_size;
          s.strstart -= _w_size;
          s.block_start -= _w_size;
          n = s.hash_size;
          p = n;
          do {
            m = s.head[--p];
            s.head[p] = m >= _w_size ? m - _w_size : 0;
          } while (--n);
          n = _w_size;
          p = n;
          do {
            m = s.prev[--p];
            s.prev[p] = m >= _w_size ? m - _w_size : 0;
          } while (--n);
          more += _w_size;
        }
        if (s.strm.avail_in === 0) {
          break;
        }
        n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);
        s.lookahead += n;
        if (s.lookahead + s.insert >= MIN_MATCH) {
          str = s.strstart - s.insert;
          s.ins_h = s.window[str];
          s.ins_h = (s.ins_h << s.hash_shift ^ s.window[str + 1]) & s.hash_mask;
          while (s.insert) {
            s.ins_h = (s.ins_h << s.hash_shift ^ s.window[str + MIN_MATCH - 1]) & s.hash_mask;
            s.prev[str & s.w_mask] = s.head[s.ins_h];
            s.head[s.ins_h] = str;
            str++;
            s.insert--;
            if (s.lookahead + s.insert < MIN_MATCH) {
              break;
            }
          }
        }
      } while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);
    }
    function deflate_stored(s, flush) {
      var max_block_size = 65535;
      if (max_block_size > s.pending_buf_size - 5) {
        max_block_size = s.pending_buf_size - 5;
      }
      for (; ; ) {
        if (s.lookahead <= 1) {
          fill_window(s);
          if (s.lookahead === 0 && flush === Z_NO_FLUSH) {
            return BS_NEED_MORE;
          }
          if (s.lookahead === 0) {
            break;
          }
        }
        s.strstart += s.lookahead;
        s.lookahead = 0;
        var max_start = s.block_start + max_block_size;
        if (s.strstart === 0 || s.strstart >= max_start) {
          s.lookahead = s.strstart - max_start;
          s.strstart = max_start;
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
        if (s.strstart - s.block_start >= s.w_size - MIN_LOOKAHEAD) {
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
      }
      s.insert = 0;
      if (flush === Z_FINISH) {
        flush_block_only(s, true);
        if (s.strm.avail_out === 0) {
          return BS_FINISH_STARTED;
        }
        return BS_FINISH_DONE;
      }
      if (s.strstart > s.block_start) {
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      }
      return BS_NEED_MORE;
    }
    function deflate_fast(s, flush) {
      var hash_head;
      var bflush;
      for (; ; ) {
        if (s.lookahead < MIN_LOOKAHEAD) {
          fill_window(s);
          if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
            return BS_NEED_MORE;
          }
          if (s.lookahead === 0) {
            break;
          }
        }
        hash_head = 0;
        if (s.lookahead >= MIN_MATCH) {
          s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
        }
        if (hash_head !== 0 && s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD) {
          s.match_length = longest_match(s, hash_head);
        }
        if (s.match_length >= MIN_MATCH) {
          bflush = trees._tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH);
          s.lookahead -= s.match_length;
          if (s.match_length <= s.max_lazy_match && s.lookahead >= MIN_MATCH) {
            s.match_length--;
            do {
              s.strstart++;
              s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
              hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
              s.head[s.ins_h] = s.strstart;
            } while (--s.match_length !== 0);
            s.strstart++;
          } else {
            s.strstart += s.match_length;
            s.match_length = 0;
            s.ins_h = s.window[s.strstart];
            s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + 1]) & s.hash_mask;
          }
        } else {
          bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
          s.lookahead--;
          s.strstart++;
        }
        if (bflush) {
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
      }
      s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
      if (flush === Z_FINISH) {
        flush_block_only(s, true);
        if (s.strm.avail_out === 0) {
          return BS_FINISH_STARTED;
        }
        return BS_FINISH_DONE;
      }
      if (s.last_lit) {
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      }
      return BS_BLOCK_DONE;
    }
    function deflate_slow(s, flush) {
      var hash_head;
      var bflush;
      var max_insert;
      for (; ; ) {
        if (s.lookahead < MIN_LOOKAHEAD) {
          fill_window(s);
          if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
            return BS_NEED_MORE;
          }
          if (s.lookahead === 0) {
            break;
          }
        }
        hash_head = 0;
        if (s.lookahead >= MIN_MATCH) {
          s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
        }
        s.prev_length = s.match_length;
        s.prev_match = s.match_start;
        s.match_length = MIN_MATCH - 1;
        if (hash_head !== 0 && s.prev_length < s.max_lazy_match && s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD) {
          s.match_length = longest_match(s, hash_head);
          if (s.match_length <= 5 && (s.strategy === Z_FILTERED || s.match_length === MIN_MATCH && s.strstart - s.match_start > 4096)) {
            s.match_length = MIN_MATCH - 1;
          }
        }
        if (s.prev_length >= MIN_MATCH && s.match_length <= s.prev_length) {
          max_insert = s.strstart + s.lookahead - MIN_MATCH;
          bflush = trees._tr_tally(s, s.strstart - 1 - s.prev_match, s.prev_length - MIN_MATCH);
          s.lookahead -= s.prev_length - 1;
          s.prev_length -= 2;
          do {
            if (++s.strstart <= max_insert) {
              s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
              hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
              s.head[s.ins_h] = s.strstart;
            }
          } while (--s.prev_length !== 0);
          s.match_available = 0;
          s.match_length = MIN_MATCH - 1;
          s.strstart++;
          if (bflush) {
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
          }
        } else if (s.match_available) {
          bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);
          if (bflush) {
            flush_block_only(s, false);
          }
          s.strstart++;
          s.lookahead--;
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        } else {
          s.match_available = 1;
          s.strstart++;
          s.lookahead--;
        }
      }
      if (s.match_available) {
        bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);
        s.match_available = 0;
      }
      s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
      if (flush === Z_FINISH) {
        flush_block_only(s, true);
        if (s.strm.avail_out === 0) {
          return BS_FINISH_STARTED;
        }
        return BS_FINISH_DONE;
      }
      if (s.last_lit) {
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      }
      return BS_BLOCK_DONE;
    }
    function deflate_rle(s, flush) {
      var bflush;
      var prev;
      var scan, strend;
      var _win = s.window;
      for (; ; ) {
        if (s.lookahead <= MAX_MATCH) {
          fill_window(s);
          if (s.lookahead <= MAX_MATCH && flush === Z_NO_FLUSH) {
            return BS_NEED_MORE;
          }
          if (s.lookahead === 0) {
            break;
          }
        }
        s.match_length = 0;
        if (s.lookahead >= MIN_MATCH && s.strstart > 0) {
          scan = s.strstart - 1;
          prev = _win[scan];
          if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {
            strend = s.strstart + MAX_MATCH;
            do {
            } while (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && scan < strend);
            s.match_length = MAX_MATCH - (strend - scan);
            if (s.match_length > s.lookahead) {
              s.match_length = s.lookahead;
            }
          }
        }
        if (s.match_length >= MIN_MATCH) {
          bflush = trees._tr_tally(s, 1, s.match_length - MIN_MATCH);
          s.lookahead -= s.match_length;
          s.strstart += s.match_length;
          s.match_length = 0;
        } else {
          bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
          s.lookahead--;
          s.strstart++;
        }
        if (bflush) {
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
      }
      s.insert = 0;
      if (flush === Z_FINISH) {
        flush_block_only(s, true);
        if (s.strm.avail_out === 0) {
          return BS_FINISH_STARTED;
        }
        return BS_FINISH_DONE;
      }
      if (s.last_lit) {
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      }
      return BS_BLOCK_DONE;
    }
    function deflate_huff(s, flush) {
      var bflush;
      for (; ; ) {
        if (s.lookahead === 0) {
          fill_window(s);
          if (s.lookahead === 0) {
            if (flush === Z_NO_FLUSH) {
              return BS_NEED_MORE;
            }
            break;
          }
        }
        s.match_length = 0;
        bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
        s.lookahead--;
        s.strstart++;
        if (bflush) {
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
      }
      s.insert = 0;
      if (flush === Z_FINISH) {
        flush_block_only(s, true);
        if (s.strm.avail_out === 0) {
          return BS_FINISH_STARTED;
        }
        return BS_FINISH_DONE;
      }
      if (s.last_lit) {
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      }
      return BS_BLOCK_DONE;
    }
    function Config(good_length, max_lazy, nice_length, max_chain, func) {
      this.good_length = good_length;
      this.max_lazy = max_lazy;
      this.nice_length = nice_length;
      this.max_chain = max_chain;
      this.func = func;
    }
    var configuration_table;
    configuration_table = [
      /*      good lazy nice chain */
      new Config(0, 0, 0, 0, deflate_stored),
      /* 0 store only */
      new Config(4, 4, 8, 4, deflate_fast),
      /* 1 max speed, no lazy matches */
      new Config(4, 5, 16, 8, deflate_fast),
      /* 2 */
      new Config(4, 6, 32, 32, deflate_fast),
      /* 3 */
      new Config(4, 4, 16, 16, deflate_slow),
      /* 4 lazy matches */
      new Config(8, 16, 32, 32, deflate_slow),
      /* 5 */
      new Config(8, 16, 128, 128, deflate_slow),
      /* 6 */
      new Config(8, 32, 128, 256, deflate_slow),
      /* 7 */
      new Config(32, 128, 258, 1024, deflate_slow),
      /* 8 */
      new Config(32, 258, 258, 4096, deflate_slow)
      /* 9 max compression */
    ];
    function lm_init(s) {
      s.window_size = 2 * s.w_size;
      zero(s.head);
      s.max_lazy_match = configuration_table[s.level].max_lazy;
      s.good_match = configuration_table[s.level].good_length;
      s.nice_match = configuration_table[s.level].nice_length;
      s.max_chain_length = configuration_table[s.level].max_chain;
      s.strstart = 0;
      s.block_start = 0;
      s.lookahead = 0;
      s.insert = 0;
      s.match_length = s.prev_length = MIN_MATCH - 1;
      s.match_available = 0;
      s.ins_h = 0;
    }
    function DeflateState() {
      this.strm = null;
      this.status = 0;
      this.pending_buf = null;
      this.pending_buf_size = 0;
      this.pending_out = 0;
      this.pending = 0;
      this.wrap = 0;
      this.gzhead = null;
      this.gzindex = 0;
      this.method = Z_DEFLATED;
      this.last_flush = -1;
      this.w_size = 0;
      this.w_bits = 0;
      this.w_mask = 0;
      this.window = null;
      this.window_size = 0;
      this.prev = null;
      this.head = null;
      this.ins_h = 0;
      this.hash_size = 0;
      this.hash_bits = 0;
      this.hash_mask = 0;
      this.hash_shift = 0;
      this.block_start = 0;
      this.match_length = 0;
      this.prev_match = 0;
      this.match_available = 0;
      this.strstart = 0;
      this.match_start = 0;
      this.lookahead = 0;
      this.prev_length = 0;
      this.max_chain_length = 0;
      this.max_lazy_match = 0;
      this.level = 0;
      this.strategy = 0;
      this.good_match = 0;
      this.nice_match = 0;
      this.dyn_ltree = new utils.Buf16(HEAP_SIZE * 2);
      this.dyn_dtree = new utils.Buf16((2 * D_CODES + 1) * 2);
      this.bl_tree = new utils.Buf16((2 * BL_CODES + 1) * 2);
      zero(this.dyn_ltree);
      zero(this.dyn_dtree);
      zero(this.bl_tree);
      this.l_desc = null;
      this.d_desc = null;
      this.bl_desc = null;
      this.bl_count = new utils.Buf16(MAX_BITS + 1);
      this.heap = new utils.Buf16(2 * L_CODES + 1);
      zero(this.heap);
      this.heap_len = 0;
      this.heap_max = 0;
      this.depth = new utils.Buf16(2 * L_CODES + 1);
      zero(this.depth);
      this.l_buf = 0;
      this.lit_bufsize = 0;
      this.last_lit = 0;
      this.d_buf = 0;
      this.opt_len = 0;
      this.static_len = 0;
      this.matches = 0;
      this.insert = 0;
      this.bi_buf = 0;
      this.bi_valid = 0;
    }
    function deflateResetKeep(strm) {
      var s;
      if (!strm || !strm.state) {
        return err12(strm, Z_STREAM_ERROR);
      }
      strm.total_in = strm.total_out = 0;
      strm.data_type = Z_UNKNOWN;
      s = strm.state;
      s.pending = 0;
      s.pending_out = 0;
      if (s.wrap < 0) {
        s.wrap = -s.wrap;
      }
      s.status = s.wrap ? INIT_STATE : BUSY_STATE;
      strm.adler = s.wrap === 2 ? 0 : 1;
      s.last_flush = Z_NO_FLUSH;
      trees._tr_init(s);
      return Z_OK;
    }
    function deflateReset(strm) {
      var ret = deflateResetKeep(strm);
      if (ret === Z_OK) {
        lm_init(strm.state);
      }
      return ret;
    }
    function deflateSetHeader(strm, head) {
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      if (strm.state.wrap !== 2) {
        return Z_STREAM_ERROR;
      }
      strm.state.gzhead = head;
      return Z_OK;
    }
    function deflateInit2(strm, level, method, windowBits, memLevel, strategy) {
      if (!strm) {
        return Z_STREAM_ERROR;
      }
      var wrap2 = 1;
      if (level === Z_DEFAULT_COMPRESSION) {
        level = 6;
      }
      if (windowBits < 0) {
        wrap2 = 0;
        windowBits = -windowBits;
      } else if (windowBits > 15) {
        wrap2 = 2;
        windowBits -= 16;
      }
      if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || method !== Z_DEFLATED || windowBits < 8 || windowBits > 15 || level < 0 || level > 9 || strategy < 0 || strategy > Z_FIXED) {
        return err12(strm, Z_STREAM_ERROR);
      }
      if (windowBits === 8) {
        windowBits = 9;
      }
      var s = new DeflateState();
      strm.state = s;
      s.strm = strm;
      s.wrap = wrap2;
      s.gzhead = null;
      s.w_bits = windowBits;
      s.w_size = 1 << s.w_bits;
      s.w_mask = s.w_size - 1;
      s.hash_bits = memLevel + 7;
      s.hash_size = 1 << s.hash_bits;
      s.hash_mask = s.hash_size - 1;
      s.hash_shift = ~~((s.hash_bits + MIN_MATCH - 1) / MIN_MATCH);
      s.window = new utils.Buf8(s.w_size * 2);
      s.head = new utils.Buf16(s.hash_size);
      s.prev = new utils.Buf16(s.w_size);
      s.lit_bufsize = 1 << memLevel + 6;
      s.pending_buf_size = s.lit_bufsize * 4;
      s.pending_buf = new utils.Buf8(s.pending_buf_size);
      s.d_buf = 1 * s.lit_bufsize;
      s.l_buf = (1 + 2) * s.lit_bufsize;
      s.level = level;
      s.strategy = strategy;
      s.method = method;
      return deflateReset(strm);
    }
    function deflateInit(strm, level) {
      return deflateInit2(strm, level, Z_DEFLATED, MAX_WBITS, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY);
    }
    function deflate(strm, flush) {
      var old_flush, s;
      var beg, val;
      if (!strm || !strm.state || flush > Z_BLOCK || flush < 0) {
        return strm ? err12(strm, Z_STREAM_ERROR) : Z_STREAM_ERROR;
      }
      s = strm.state;
      if (!strm.output || !strm.input && strm.avail_in !== 0 || s.status === FINISH_STATE && flush !== Z_FINISH) {
        return err12(strm, strm.avail_out === 0 ? Z_BUF_ERROR : Z_STREAM_ERROR);
      }
      s.strm = strm;
      old_flush = s.last_flush;
      s.last_flush = flush;
      if (s.status === INIT_STATE) {
        if (s.wrap === 2) {
          strm.adler = 0;
          put_byte(s, 31);
          put_byte(s, 139);
          put_byte(s, 8);
          if (!s.gzhead) {
            put_byte(s, 0);
            put_byte(s, 0);
            put_byte(s, 0);
            put_byte(s, 0);
            put_byte(s, 0);
            put_byte(s, s.level === 9 ? 2 : s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ? 4 : 0);
            put_byte(s, OS_CODE);
            s.status = BUSY_STATE;
          } else {
            put_byte(
              s,
              (s.gzhead.text ? 1 : 0) + (s.gzhead.hcrc ? 2 : 0) + (!s.gzhead.extra ? 0 : 4) + (!s.gzhead.name ? 0 : 8) + (!s.gzhead.comment ? 0 : 16)
            );
            put_byte(s, s.gzhead.time & 255);
            put_byte(s, s.gzhead.time >> 8 & 255);
            put_byte(s, s.gzhead.time >> 16 & 255);
            put_byte(s, s.gzhead.time >> 24 & 255);
            put_byte(s, s.level === 9 ? 2 : s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ? 4 : 0);
            put_byte(s, s.gzhead.os & 255);
            if (s.gzhead.extra && s.gzhead.extra.length) {
              put_byte(s, s.gzhead.extra.length & 255);
              put_byte(s, s.gzhead.extra.length >> 8 & 255);
            }
            if (s.gzhead.hcrc) {
              strm.adler = crc32(strm.adler, s.pending_buf, s.pending, 0);
            }
            s.gzindex = 0;
            s.status = EXTRA_STATE;
          }
        } else {
          var header = Z_DEFLATED + (s.w_bits - 8 << 4) << 8;
          var level_flags = -1;
          if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) {
            level_flags = 0;
          } else if (s.level < 6) {
            level_flags = 1;
          } else if (s.level === 6) {
            level_flags = 2;
          } else {
            level_flags = 3;
          }
          header |= level_flags << 6;
          if (s.strstart !== 0) {
            header |= PRESET_DICT;
          }
          header += 31 - header % 31;
          s.status = BUSY_STATE;
          putShortMSB(s, header);
          if (s.strstart !== 0) {
            putShortMSB(s, strm.adler >>> 16);
            putShortMSB(s, strm.adler & 65535);
          }
          strm.adler = 1;
        }
      }
      if (s.status === EXTRA_STATE) {
        if (s.gzhead.extra) {
          beg = s.pending;
          while (s.gzindex < (s.gzhead.extra.length & 65535)) {
            if (s.pending === s.pending_buf_size) {
              if (s.gzhead.hcrc && s.pending > beg) {
                strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
              }
              flush_pending(strm);
              beg = s.pending;
              if (s.pending === s.pending_buf_size) {
                break;
              }
            }
            put_byte(s, s.gzhead.extra[s.gzindex] & 255);
            s.gzindex++;
          }
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          if (s.gzindex === s.gzhead.extra.length) {
            s.gzindex = 0;
            s.status = NAME_STATE;
          }
        } else {
          s.status = NAME_STATE;
        }
      }
      if (s.status === NAME_STATE) {
        if (s.gzhead.name) {
          beg = s.pending;
          do {
            if (s.pending === s.pending_buf_size) {
              if (s.gzhead.hcrc && s.pending > beg) {
                strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
              }
              flush_pending(strm);
              beg = s.pending;
              if (s.pending === s.pending_buf_size) {
                val = 1;
                break;
              }
            }
            if (s.gzindex < s.gzhead.name.length) {
              val = s.gzhead.name.charCodeAt(s.gzindex++) & 255;
            } else {
              val = 0;
            }
            put_byte(s, val);
          } while (val !== 0);
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          if (val === 0) {
            s.gzindex = 0;
            s.status = COMMENT_STATE;
          }
        } else {
          s.status = COMMENT_STATE;
        }
      }
      if (s.status === COMMENT_STATE) {
        if (s.gzhead.comment) {
          beg = s.pending;
          do {
            if (s.pending === s.pending_buf_size) {
              if (s.gzhead.hcrc && s.pending > beg) {
                strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
              }
              flush_pending(strm);
              beg = s.pending;
              if (s.pending === s.pending_buf_size) {
                val = 1;
                break;
              }
            }
            if (s.gzindex < s.gzhead.comment.length) {
              val = s.gzhead.comment.charCodeAt(s.gzindex++) & 255;
            } else {
              val = 0;
            }
            put_byte(s, val);
          } while (val !== 0);
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          if (val === 0) {
            s.status = HCRC_STATE;
          }
        } else {
          s.status = HCRC_STATE;
        }
      }
      if (s.status === HCRC_STATE) {
        if (s.gzhead.hcrc) {
          if (s.pending + 2 > s.pending_buf_size) {
            flush_pending(strm);
          }
          if (s.pending + 2 <= s.pending_buf_size) {
            put_byte(s, strm.adler & 255);
            put_byte(s, strm.adler >> 8 & 255);
            strm.adler = 0;
            s.status = BUSY_STATE;
          }
        } else {
          s.status = BUSY_STATE;
        }
      }
      if (s.pending !== 0) {
        flush_pending(strm);
        if (strm.avail_out === 0) {
          s.last_flush = -1;
          return Z_OK;
        }
      } else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) && flush !== Z_FINISH) {
        return err12(strm, Z_BUF_ERROR);
      }
      if (s.status === FINISH_STATE && strm.avail_in !== 0) {
        return err12(strm, Z_BUF_ERROR);
      }
      if (strm.avail_in !== 0 || s.lookahead !== 0 || flush !== Z_NO_FLUSH && s.status !== FINISH_STATE) {
        var bstate = s.strategy === Z_HUFFMAN_ONLY ? deflate_huff(s, flush) : s.strategy === Z_RLE ? deflate_rle(s, flush) : configuration_table[s.level].func(s, flush);
        if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) {
          s.status = FINISH_STATE;
        }
        if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
          if (strm.avail_out === 0) {
            s.last_flush = -1;
          }
          return Z_OK;
        }
        if (bstate === BS_BLOCK_DONE) {
          if (flush === Z_PARTIAL_FLUSH) {
            trees._tr_align(s);
          } else if (flush !== Z_BLOCK) {
            trees._tr_stored_block(s, 0, 0, false);
            if (flush === Z_FULL_FLUSH) {
              zero(s.head);
              if (s.lookahead === 0) {
                s.strstart = 0;
                s.block_start = 0;
                s.insert = 0;
              }
            }
          }
          flush_pending(strm);
          if (strm.avail_out === 0) {
            s.last_flush = -1;
            return Z_OK;
          }
        }
      }
      if (flush !== Z_FINISH) {
        return Z_OK;
      }
      if (s.wrap <= 0) {
        return Z_STREAM_END;
      }
      if (s.wrap === 2) {
        put_byte(s, strm.adler & 255);
        put_byte(s, strm.adler >> 8 & 255);
        put_byte(s, strm.adler >> 16 & 255);
        put_byte(s, strm.adler >> 24 & 255);
        put_byte(s, strm.total_in & 255);
        put_byte(s, strm.total_in >> 8 & 255);
        put_byte(s, strm.total_in >> 16 & 255);
        put_byte(s, strm.total_in >> 24 & 255);
      } else {
        putShortMSB(s, strm.adler >>> 16);
        putShortMSB(s, strm.adler & 65535);
      }
      flush_pending(strm);
      if (s.wrap > 0) {
        s.wrap = -s.wrap;
      }
      return s.pending !== 0 ? Z_OK : Z_STREAM_END;
    }
    function deflateEnd(strm) {
      var status;
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      status = strm.state.status;
      if (status !== INIT_STATE && status !== EXTRA_STATE && status !== NAME_STATE && status !== COMMENT_STATE && status !== HCRC_STATE && status !== BUSY_STATE && status !== FINISH_STATE) {
        return err12(strm, Z_STREAM_ERROR);
      }
      strm.state = null;
      return status === BUSY_STATE ? err12(strm, Z_DATA_ERROR) : Z_OK;
    }
    function deflateSetDictionary(strm, dictionary) {
      var dictLength = dictionary.length;
      var s;
      var str, n;
      var wrap2;
      var avail;
      var next;
      var input;
      var tmpDict;
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      s = strm.state;
      wrap2 = s.wrap;
      if (wrap2 === 2 || wrap2 === 1 && s.status !== INIT_STATE || s.lookahead) {
        return Z_STREAM_ERROR;
      }
      if (wrap2 === 1) {
        strm.adler = adler32(strm.adler, dictionary, dictLength, 0);
      }
      s.wrap = 0;
      if (dictLength >= s.w_size) {
        if (wrap2 === 0) {
          zero(s.head);
          s.strstart = 0;
          s.block_start = 0;
          s.insert = 0;
        }
        tmpDict = new utils.Buf8(s.w_size);
        utils.arraySet(tmpDict, dictionary, dictLength - s.w_size, s.w_size, 0);
        dictionary = tmpDict;
        dictLength = s.w_size;
      }
      avail = strm.avail_in;
      next = strm.next_in;
      input = strm.input;
      strm.avail_in = dictLength;
      strm.next_in = 0;
      strm.input = dictionary;
      fill_window(s);
      while (s.lookahead >= MIN_MATCH) {
        str = s.strstart;
        n = s.lookahead - (MIN_MATCH - 1);
        do {
          s.ins_h = (s.ins_h << s.hash_shift ^ s.window[str + MIN_MATCH - 1]) & s.hash_mask;
          s.prev[str & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = str;
          str++;
        } while (--n);
        s.strstart = str;
        s.lookahead = MIN_MATCH - 1;
        fill_window(s);
      }
      s.strstart += s.lookahead;
      s.block_start = s.strstart;
      s.insert = s.lookahead;
      s.lookahead = 0;
      s.match_length = s.prev_length = MIN_MATCH - 1;
      s.match_available = 0;
      strm.next_in = next;
      strm.input = input;
      strm.avail_in = avail;
      s.wrap = wrap2;
      return Z_OK;
    }
    exports.deflateInit = deflateInit;
    exports.deflateInit2 = deflateInit2;
    exports.deflateReset = deflateReset;
    exports.deflateResetKeep = deflateResetKeep;
    exports.deflateSetHeader = deflateSetHeader;
    exports.deflate = deflate;
    exports.deflateEnd = deflateEnd;
    exports.deflateSetDictionary = deflateSetDictionary;
    exports.deflateInfo = "pako deflate (from Nodeca project)";
  }
});

// ../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/utils/strings.js
var require_strings = __commonJS({
  "../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/utils/strings.js"(exports) {
    var utils = require_common();
    var STR_APPLY_OK = true;
    var STR_APPLY_UIA_OK = true;
    try {
      String.fromCharCode.apply(null, [0]);
    } catch (__) {
      STR_APPLY_OK = false;
    }
    try {
      String.fromCharCode.apply(null, new Uint8Array(1));
    } catch (__) {
      STR_APPLY_UIA_OK = false;
    }
    var _utf8len = new utils.Buf8(256);
    for (q = 0; q < 256; q++) {
      _utf8len[q] = q >= 252 ? 6 : q >= 248 ? 5 : q >= 240 ? 4 : q >= 224 ? 3 : q >= 192 ? 2 : 1;
    }
    var q;
    _utf8len[254] = _utf8len[254] = 1;
    exports.string2buf = function(str) {
      var buf, c, c2, m_pos, i, str_len = str.length, buf_len = 0;
      for (m_pos = 0; m_pos < str_len; m_pos++) {
        c = str.charCodeAt(m_pos);
        if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
          c2 = str.charCodeAt(m_pos + 1);
          if ((c2 & 64512) === 56320) {
            c = 65536 + (c - 55296 << 10) + (c2 - 56320);
            m_pos++;
          }
        }
        buf_len += c < 128 ? 1 : c < 2048 ? 2 : c < 65536 ? 3 : 4;
      }
      buf = new utils.Buf8(buf_len);
      for (i = 0, m_pos = 0; i < buf_len; m_pos++) {
        c = str.charCodeAt(m_pos);
        if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
          c2 = str.charCodeAt(m_pos + 1);
          if ((c2 & 64512) === 56320) {
            c = 65536 + (c - 55296 << 10) + (c2 - 56320);
            m_pos++;
          }
        }
        if (c < 128) {
          buf[i++] = c;
        } else if (c < 2048) {
          buf[i++] = 192 | c >>> 6;
          buf[i++] = 128 | c & 63;
        } else if (c < 65536) {
          buf[i++] = 224 | c >>> 12;
          buf[i++] = 128 | c >>> 6 & 63;
          buf[i++] = 128 | c & 63;
        } else {
          buf[i++] = 240 | c >>> 18;
          buf[i++] = 128 | c >>> 12 & 63;
          buf[i++] = 128 | c >>> 6 & 63;
          buf[i++] = 128 | c & 63;
        }
      }
      return buf;
    };
    function buf2binstring(buf, len) {
      if (len < 65534) {
        if (buf.subarray && STR_APPLY_UIA_OK || !buf.subarray && STR_APPLY_OK) {
          return String.fromCharCode.apply(null, utils.shrinkBuf(buf, len));
        }
      }
      var result = "";
      for (var i = 0; i < len; i++) {
        result += String.fromCharCode(buf[i]);
      }
      return result;
    }
    exports.buf2binstring = function(buf) {
      return buf2binstring(buf, buf.length);
    };
    exports.binstring2buf = function(str) {
      var buf = new utils.Buf8(str.length);
      for (var i = 0, len = buf.length; i < len; i++) {
        buf[i] = str.charCodeAt(i);
      }
      return buf;
    };
    exports.buf2string = function(buf, max) {
      var i, out, c, c_len;
      var len = max || buf.length;
      var utf16buf = new Array(len * 2);
      for (out = 0, i = 0; i < len; ) {
        c = buf[i++];
        if (c < 128) {
          utf16buf[out++] = c;
          continue;
        }
        c_len = _utf8len[c];
        if (c_len > 4) {
          utf16buf[out++] = 65533;
          i += c_len - 1;
          continue;
        }
        c &= c_len === 2 ? 31 : c_len === 3 ? 15 : 7;
        while (c_len > 1 && i < len) {
          c = c << 6 | buf[i++] & 63;
          c_len--;
        }
        if (c_len > 1) {
          utf16buf[out++] = 65533;
          continue;
        }
        if (c < 65536) {
          utf16buf[out++] = c;
        } else {
          c -= 65536;
          utf16buf[out++] = 55296 | c >> 10 & 1023;
          utf16buf[out++] = 56320 | c & 1023;
        }
      }
      return buf2binstring(utf16buf, out);
    };
    exports.utf8border = function(buf, max) {
      var pos;
      max = max || buf.length;
      if (max > buf.length) {
        max = buf.length;
      }
      pos = max - 1;
      while (pos >= 0 && (buf[pos] & 192) === 128) {
        pos--;
      }
      if (pos < 0) {
        return max;
      }
      if (pos === 0) {
        return max;
      }
      return pos + _utf8len[buf[pos]] > max ? pos : max;
    };
  }
});

// ../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/zstream.js
var require_zstream = __commonJS({
  "../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/zstream.js"(exports, module) {
    function ZStream() {
      this.input = null;
      this.next_in = 0;
      this.avail_in = 0;
      this.total_in = 0;
      this.output = null;
      this.next_out = 0;
      this.avail_out = 0;
      this.total_out = 0;
      this.msg = "";
      this.state = null;
      this.data_type = 2;
      this.adler = 0;
    }
    module.exports = ZStream;
  }
});

// ../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/deflate.js
var require_deflate2 = __commonJS({
  "../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/deflate.js"(exports) {
    var zlib_deflate = require_deflate();
    var utils = require_common();
    var strings = require_strings();
    var msg = require_messages();
    var ZStream = require_zstream();
    var toString = Object.prototype.toString;
    var Z_NO_FLUSH = 0;
    var Z_FINISH = 4;
    var Z_OK = 0;
    var Z_STREAM_END = 1;
    var Z_SYNC_FLUSH = 2;
    var Z_DEFAULT_COMPRESSION = -1;
    var Z_DEFAULT_STRATEGY = 0;
    var Z_DEFLATED = 8;
    function Deflate(options) {
      if (!(this instanceof Deflate)) return new Deflate(options);
      this.options = utils.assign({
        level: Z_DEFAULT_COMPRESSION,
        method: Z_DEFLATED,
        chunkSize: 16384,
        windowBits: 15,
        memLevel: 8,
        strategy: Z_DEFAULT_STRATEGY,
        to: ""
      }, options || {});
      var opt = this.options;
      if (opt.raw && opt.windowBits > 0) {
        opt.windowBits = -opt.windowBits;
      } else if (opt.gzip && opt.windowBits > 0 && opt.windowBits < 16) {
        opt.windowBits += 16;
      }
      this.err = 0;
      this.msg = "";
      this.ended = false;
      this.chunks = [];
      this.strm = new ZStream();
      this.strm.avail_out = 0;
      var status = zlib_deflate.deflateInit2(
        this.strm,
        opt.level,
        opt.method,
        opt.windowBits,
        opt.memLevel,
        opt.strategy
      );
      if (status !== Z_OK) {
        throw new Error(msg[status]);
      }
      if (opt.header) {
        zlib_deflate.deflateSetHeader(this.strm, opt.header);
      }
      if (opt.dictionary) {
        var dict;
        if (typeof opt.dictionary === "string") {
          dict = strings.string2buf(opt.dictionary);
        } else if (toString.call(opt.dictionary) === "[object ArrayBuffer]") {
          dict = new Uint8Array(opt.dictionary);
        } else {
          dict = opt.dictionary;
        }
        status = zlib_deflate.deflateSetDictionary(this.strm, dict);
        if (status !== Z_OK) {
          throw new Error(msg[status]);
        }
        this._dict_set = true;
      }
    }
    Deflate.prototype.push = function(data, mode) {
      var strm = this.strm;
      var chunkSize = this.options.chunkSize;
      var status, _mode;
      if (this.ended) {
        return false;
      }
      _mode = mode === ~~mode ? mode : mode === true ? Z_FINISH : Z_NO_FLUSH;
      if (typeof data === "string") {
        strm.input = strings.string2buf(data);
      } else if (toString.call(data) === "[object ArrayBuffer]") {
        strm.input = new Uint8Array(data);
      } else {
        strm.input = data;
      }
      strm.next_in = 0;
      strm.avail_in = strm.input.length;
      do {
        if (strm.avail_out === 0) {
          strm.output = new utils.Buf8(chunkSize);
          strm.next_out = 0;
          strm.avail_out = chunkSize;
        }
        status = zlib_deflate.deflate(strm, _mode);
        if (status !== Z_STREAM_END && status !== Z_OK) {
          this.onEnd(status);
          this.ended = true;
          return false;
        }
        if (strm.avail_out === 0 || strm.avail_in === 0 && (_mode === Z_FINISH || _mode === Z_SYNC_FLUSH)) {
          if (this.options.to === "string") {
            this.onData(strings.buf2binstring(utils.shrinkBuf(strm.output, strm.next_out)));
          } else {
            this.onData(utils.shrinkBuf(strm.output, strm.next_out));
          }
        }
      } while ((strm.avail_in > 0 || strm.avail_out === 0) && status !== Z_STREAM_END);
      if (_mode === Z_FINISH) {
        status = zlib_deflate.deflateEnd(this.strm);
        this.onEnd(status);
        this.ended = true;
        return status === Z_OK;
      }
      if (_mode === Z_SYNC_FLUSH) {
        this.onEnd(Z_OK);
        strm.avail_out = 0;
        return true;
      }
      return true;
    };
    Deflate.prototype.onData = function(chunk) {
      this.chunks.push(chunk);
    };
    Deflate.prototype.onEnd = function(status) {
      if (status === Z_OK) {
        if (this.options.to === "string") {
          this.result = this.chunks.join("");
        } else {
          this.result = utils.flattenChunks(this.chunks);
        }
      }
      this.chunks = [];
      this.err = status;
      this.msg = this.strm.msg;
    };
    function deflate(input, options) {
      var deflator = new Deflate(options);
      deflator.push(input, true);
      if (deflator.err) {
        throw deflator.msg || msg[deflator.err];
      }
      return deflator.result;
    }
    function deflateRaw(input, options) {
      options = options || {};
      options.raw = true;
      return deflate(input, options);
    }
    function gzip(input, options) {
      options = options || {};
      options.gzip = true;
      return deflate(input, options);
    }
    exports.Deflate = Deflate;
    exports.deflate = deflate;
    exports.deflateRaw = deflateRaw;
    exports.gzip = gzip;
  }
});

// ../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/inffast.js
var require_inffast = __commonJS({
  "../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/inffast.js"(exports, module) {
    var BAD = 30;
    var TYPE = 12;
    module.exports = function inflate_fast(strm, start) {
      var state;
      var _in;
      var last;
      var _out;
      var beg;
      var end;
      var dmax;
      var wsize;
      var whave;
      var wnext;
      var s_window;
      var hold;
      var bits;
      var lcode;
      var dcode;
      var lmask;
      var dmask;
      var here;
      var op;
      var len;
      var dist;
      var from;
      var from_source;
      var input, output;
      state = strm.state;
      _in = strm.next_in;
      input = strm.input;
      last = _in + (strm.avail_in - 5);
      _out = strm.next_out;
      output = strm.output;
      beg = _out - (start - strm.avail_out);
      end = _out + (strm.avail_out - 257);
      dmax = state.dmax;
      wsize = state.wsize;
      whave = state.whave;
      wnext = state.wnext;
      s_window = state.window;
      hold = state.hold;
      bits = state.bits;
      lcode = state.lencode;
      dcode = state.distcode;
      lmask = (1 << state.lenbits) - 1;
      dmask = (1 << state.distbits) - 1;
      top:
        do {
          if (bits < 15) {
            hold += input[_in++] << bits;
            bits += 8;
            hold += input[_in++] << bits;
            bits += 8;
          }
          here = lcode[hold & lmask];
          dolen:
            for (; ; ) {
              op = here >>> 24;
              hold >>>= op;
              bits -= op;
              op = here >>> 16 & 255;
              if (op === 0) {
                output[_out++] = here & 65535;
              } else if (op & 16) {
                len = here & 65535;
                op &= 15;
                if (op) {
                  if (bits < op) {
                    hold += input[_in++] << bits;
                    bits += 8;
                  }
                  len += hold & (1 << op) - 1;
                  hold >>>= op;
                  bits -= op;
                }
                if (bits < 15) {
                  hold += input[_in++] << bits;
                  bits += 8;
                  hold += input[_in++] << bits;
                  bits += 8;
                }
                here = dcode[hold & dmask];
                dodist:
                  for (; ; ) {
                    op = here >>> 24;
                    hold >>>= op;
                    bits -= op;
                    op = here >>> 16 & 255;
                    if (op & 16) {
                      dist = here & 65535;
                      op &= 15;
                      if (bits < op) {
                        hold += input[_in++] << bits;
                        bits += 8;
                        if (bits < op) {
                          hold += input[_in++] << bits;
                          bits += 8;
                        }
                      }
                      dist += hold & (1 << op) - 1;
                      if (dist > dmax) {
                        strm.msg = "invalid distance too far back";
                        state.mode = BAD;
                        break top;
                      }
                      hold >>>= op;
                      bits -= op;
                      op = _out - beg;
                      if (dist > op) {
                        op = dist - op;
                        if (op > whave) {
                          if (state.sane) {
                            strm.msg = "invalid distance too far back";
                            state.mode = BAD;
                            break top;
                          }
                        }
                        from = 0;
                        from_source = s_window;
                        if (wnext === 0) {
                          from += wsize - op;
                          if (op < len) {
                            len -= op;
                            do {
                              output[_out++] = s_window[from++];
                            } while (--op);
                            from = _out - dist;
                            from_source = output;
                          }
                        } else if (wnext < op) {
                          from += wsize + wnext - op;
                          op -= wnext;
                          if (op < len) {
                            len -= op;
                            do {
                              output[_out++] = s_window[from++];
                            } while (--op);
                            from = 0;
                            if (wnext < len) {
                              op = wnext;
                              len -= op;
                              do {
                                output[_out++] = s_window[from++];
                              } while (--op);
                              from = _out - dist;
                              from_source = output;
                            }
                          }
                        } else {
                          from += wnext - op;
                          if (op < len) {
                            len -= op;
                            do {
                              output[_out++] = s_window[from++];
                            } while (--op);
                            from = _out - dist;
                            from_source = output;
                          }
                        }
                        while (len > 2) {
                          output[_out++] = from_source[from++];
                          output[_out++] = from_source[from++];
                          output[_out++] = from_source[from++];
                          len -= 3;
                        }
                        if (len) {
                          output[_out++] = from_source[from++];
                          if (len > 1) {
                            output[_out++] = from_source[from++];
                          }
                        }
                      } else {
                        from = _out - dist;
                        do {
                          output[_out++] = output[from++];
                          output[_out++] = output[from++];
                          output[_out++] = output[from++];
                          len -= 3;
                        } while (len > 2);
                        if (len) {
                          output[_out++] = output[from++];
                          if (len > 1) {
                            output[_out++] = output[from++];
                          }
                        }
                      }
                    } else if ((op & 64) === 0) {
                      here = dcode[(here & 65535) + (hold & (1 << op) - 1)];
                      continue dodist;
                    } else {
                      strm.msg = "invalid distance code";
                      state.mode = BAD;
                      break top;
                    }
                    break;
                  }
              } else if ((op & 64) === 0) {
                here = lcode[(here & 65535) + (hold & (1 << op) - 1)];
                continue dolen;
              } else if (op & 32) {
                state.mode = TYPE;
                break top;
              } else {
                strm.msg = "invalid literal/length code";
                state.mode = BAD;
                break top;
              }
              break;
            }
        } while (_in < last && _out < end);
      len = bits >> 3;
      _in -= len;
      bits -= len << 3;
      hold &= (1 << bits) - 1;
      strm.next_in = _in;
      strm.next_out = _out;
      strm.avail_in = _in < last ? 5 + (last - _in) : 5 - (_in - last);
      strm.avail_out = _out < end ? 257 + (end - _out) : 257 - (_out - end);
      state.hold = hold;
      state.bits = bits;
      return;
    };
  }
});

// ../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/inftrees.js
var require_inftrees = __commonJS({
  "../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/inftrees.js"(exports, module) {
    var utils = require_common();
    var MAXBITS = 15;
    var ENOUGH_LENS = 852;
    var ENOUGH_DISTS = 592;
    var CODES = 0;
    var LENS = 1;
    var DISTS = 2;
    var lbase = [
      /* Length codes 257..285 base */
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      13,
      15,
      17,
      19,
      23,
      27,
      31,
      35,
      43,
      51,
      59,
      67,
      83,
      99,
      115,
      131,
      163,
      195,
      227,
      258,
      0,
      0
    ];
    var lext = [
      /* Length codes 257..285 extra */
      16,
      16,
      16,
      16,
      16,
      16,
      16,
      16,
      17,
      17,
      17,
      17,
      18,
      18,
      18,
      18,
      19,
      19,
      19,
      19,
      20,
      20,
      20,
      20,
      21,
      21,
      21,
      21,
      16,
      72,
      78
    ];
    var dbase = [
      /* Distance codes 0..29 base */
      1,
      2,
      3,
      4,
      5,
      7,
      9,
      13,
      17,
      25,
      33,
      49,
      65,
      97,
      129,
      193,
      257,
      385,
      513,
      769,
      1025,
      1537,
      2049,
      3073,
      4097,
      6145,
      8193,
      12289,
      16385,
      24577,
      0,
      0
    ];
    var dext = [
      /* Distance codes 0..29 extra */
      16,
      16,
      16,
      16,
      17,
      17,
      18,
      18,
      19,
      19,
      20,
      20,
      21,
      21,
      22,
      22,
      23,
      23,
      24,
      24,
      25,
      25,
      26,
      26,
      27,
      27,
      28,
      28,
      29,
      29,
      64,
      64
    ];
    module.exports = function inflate_table(type, lens, lens_index, codes, table, table_index, work, opts) {
      var bits = opts.bits;
      var len = 0;
      var sym = 0;
      var min = 0, max = 0;
      var root = 0;
      var curr = 0;
      var drop = 0;
      var left = 0;
      var used = 0;
      var huff = 0;
      var incr;
      var fill;
      var low;
      var mask;
      var next;
      var base = null;
      var base_index = 0;
      var end;
      var count = new utils.Buf16(MAXBITS + 1);
      var offs = new utils.Buf16(MAXBITS + 1);
      var extra = null;
      var extra_index = 0;
      var here_bits, here_op, here_val;
      for (len = 0; len <= MAXBITS; len++) {
        count[len] = 0;
      }
      for (sym = 0; sym < codes; sym++) {
        count[lens[lens_index + sym]]++;
      }
      root = bits;
      for (max = MAXBITS; max >= 1; max--) {
        if (count[max] !== 0) {
          break;
        }
      }
      if (root > max) {
        root = max;
      }
      if (max === 0) {
        table[table_index++] = 1 << 24 | 64 << 16 | 0;
        table[table_index++] = 1 << 24 | 64 << 16 | 0;
        opts.bits = 1;
        return 0;
      }
      for (min = 1; min < max; min++) {
        if (count[min] !== 0) {
          break;
        }
      }
      if (root < min) {
        root = min;
      }
      left = 1;
      for (len = 1; len <= MAXBITS; len++) {
        left <<= 1;
        left -= count[len];
        if (left < 0) {
          return -1;
        }
      }
      if (left > 0 && (type === CODES || max !== 1)) {
        return -1;
      }
      offs[1] = 0;
      for (len = 1; len < MAXBITS; len++) {
        offs[len + 1] = offs[len] + count[len];
      }
      for (sym = 0; sym < codes; sym++) {
        if (lens[lens_index + sym] !== 0) {
          work[offs[lens[lens_index + sym]]++] = sym;
        }
      }
      if (type === CODES) {
        base = extra = work;
        end = 19;
      } else if (type === LENS) {
        base = lbase;
        base_index -= 257;
        extra = lext;
        extra_index -= 257;
        end = 256;
      } else {
        base = dbase;
        extra = dext;
        end = -1;
      }
      huff = 0;
      sym = 0;
      len = min;
      next = table_index;
      curr = root;
      drop = 0;
      low = -1;
      used = 1 << root;
      mask = used - 1;
      if (type === LENS && used > ENOUGH_LENS || type === DISTS && used > ENOUGH_DISTS) {
        return 1;
      }
      for (; ; ) {
        here_bits = len - drop;
        if (work[sym] < end) {
          here_op = 0;
          here_val = work[sym];
        } else if (work[sym] > end) {
          here_op = extra[extra_index + work[sym]];
          here_val = base[base_index + work[sym]];
        } else {
          here_op = 32 + 64;
          here_val = 0;
        }
        incr = 1 << len - drop;
        fill = 1 << curr;
        min = fill;
        do {
          fill -= incr;
          table[next + (huff >> drop) + fill] = here_bits << 24 | here_op << 16 | here_val | 0;
        } while (fill !== 0);
        incr = 1 << len - 1;
        while (huff & incr) {
          incr >>= 1;
        }
        if (incr !== 0) {
          huff &= incr - 1;
          huff += incr;
        } else {
          huff = 0;
        }
        sym++;
        if (--count[len] === 0) {
          if (len === max) {
            break;
          }
          len = lens[lens_index + work[sym]];
        }
        if (len > root && (huff & mask) !== low) {
          if (drop === 0) {
            drop = root;
          }
          next += min;
          curr = len - drop;
          left = 1 << curr;
          while (curr + drop < max) {
            left -= count[curr + drop];
            if (left <= 0) {
              break;
            }
            curr++;
            left <<= 1;
          }
          used += 1 << curr;
          if (type === LENS && used > ENOUGH_LENS || type === DISTS && used > ENOUGH_DISTS) {
            return 1;
          }
          low = huff & mask;
          table[low] = root << 24 | curr << 16 | next - table_index | 0;
        }
      }
      if (huff !== 0) {
        table[next + huff] = len - drop << 24 | 64 << 16 | 0;
      }
      opts.bits = root;
      return 0;
    };
  }
});

// ../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/inflate.js
var require_inflate = __commonJS({
  "../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/inflate.js"(exports) {
    var utils = require_common();
    var adler32 = require_adler32();
    var crc32 = require_crc32();
    var inflate_fast = require_inffast();
    var inflate_table = require_inftrees();
    var CODES = 0;
    var LENS = 1;
    var DISTS = 2;
    var Z_FINISH = 4;
    var Z_BLOCK = 5;
    var Z_TREES = 6;
    var Z_OK = 0;
    var Z_STREAM_END = 1;
    var Z_NEED_DICT = 2;
    var Z_STREAM_ERROR = -2;
    var Z_DATA_ERROR = -3;
    var Z_MEM_ERROR = -4;
    var Z_BUF_ERROR = -5;
    var Z_DEFLATED = 8;
    var HEAD = 1;
    var FLAGS = 2;
    var TIME = 3;
    var OS = 4;
    var EXLEN = 5;
    var EXTRA = 6;
    var NAME = 7;
    var COMMENT = 8;
    var HCRC = 9;
    var DICTID = 10;
    var DICT = 11;
    var TYPE = 12;
    var TYPEDO = 13;
    var STORED = 14;
    var COPY_ = 15;
    var COPY = 16;
    var TABLE = 17;
    var LENLENS = 18;
    var CODELENS = 19;
    var LEN_ = 20;
    var LEN = 21;
    var LENEXT = 22;
    var DIST = 23;
    var DISTEXT = 24;
    var MATCH = 25;
    var LIT = 26;
    var CHECK = 27;
    var LENGTH = 28;
    var DONE = 29;
    var BAD = 30;
    var MEM = 31;
    var SYNC = 32;
    var ENOUGH_LENS = 852;
    var ENOUGH_DISTS = 592;
    var MAX_WBITS = 15;
    var DEF_WBITS = MAX_WBITS;
    function zswap32(q) {
      return (q >>> 24 & 255) + (q >>> 8 & 65280) + ((q & 65280) << 8) + ((q & 255) << 24);
    }
    function InflateState() {
      this.mode = 0;
      this.last = false;
      this.wrap = 0;
      this.havedict = false;
      this.flags = 0;
      this.dmax = 0;
      this.check = 0;
      this.total = 0;
      this.head = null;
      this.wbits = 0;
      this.wsize = 0;
      this.whave = 0;
      this.wnext = 0;
      this.window = null;
      this.hold = 0;
      this.bits = 0;
      this.length = 0;
      this.offset = 0;
      this.extra = 0;
      this.lencode = null;
      this.distcode = null;
      this.lenbits = 0;
      this.distbits = 0;
      this.ncode = 0;
      this.nlen = 0;
      this.ndist = 0;
      this.have = 0;
      this.next = null;
      this.lens = new utils.Buf16(320);
      this.work = new utils.Buf16(288);
      this.lendyn = null;
      this.distdyn = null;
      this.sane = 0;
      this.back = 0;
      this.was = 0;
    }
    function inflateResetKeep(strm) {
      var state;
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      state = strm.state;
      strm.total_in = strm.total_out = state.total = 0;
      strm.msg = "";
      if (state.wrap) {
        strm.adler = state.wrap & 1;
      }
      state.mode = HEAD;
      state.last = 0;
      state.havedict = 0;
      state.dmax = 32768;
      state.head = null;
      state.hold = 0;
      state.bits = 0;
      state.lencode = state.lendyn = new utils.Buf32(ENOUGH_LENS);
      state.distcode = state.distdyn = new utils.Buf32(ENOUGH_DISTS);
      state.sane = 1;
      state.back = -1;
      return Z_OK;
    }
    function inflateReset(strm) {
      var state;
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      state = strm.state;
      state.wsize = 0;
      state.whave = 0;
      state.wnext = 0;
      return inflateResetKeep(strm);
    }
    function inflateReset2(strm, windowBits) {
      var wrap2;
      var state;
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      state = strm.state;
      if (windowBits < 0) {
        wrap2 = 0;
        windowBits = -windowBits;
      } else {
        wrap2 = (windowBits >> 4) + 1;
        if (windowBits < 48) {
          windowBits &= 15;
        }
      }
      if (windowBits && (windowBits < 8 || windowBits > 15)) {
        return Z_STREAM_ERROR;
      }
      if (state.window !== null && state.wbits !== windowBits) {
        state.window = null;
      }
      state.wrap = wrap2;
      state.wbits = windowBits;
      return inflateReset(strm);
    }
    function inflateInit2(strm, windowBits) {
      var ret;
      var state;
      if (!strm) {
        return Z_STREAM_ERROR;
      }
      state = new InflateState();
      strm.state = state;
      state.window = null;
      ret = inflateReset2(strm, windowBits);
      if (ret !== Z_OK) {
        strm.state = null;
      }
      return ret;
    }
    function inflateInit(strm) {
      return inflateInit2(strm, DEF_WBITS);
    }
    var virgin = true;
    var lenfix;
    var distfix;
    function fixedtables(state) {
      if (virgin) {
        var sym;
        lenfix = new utils.Buf32(512);
        distfix = new utils.Buf32(32);
        sym = 0;
        while (sym < 144) {
          state.lens[sym++] = 8;
        }
        while (sym < 256) {
          state.lens[sym++] = 9;
        }
        while (sym < 280) {
          state.lens[sym++] = 7;
        }
        while (sym < 288) {
          state.lens[sym++] = 8;
        }
        inflate_table(LENS, state.lens, 0, 288, lenfix, 0, state.work, { bits: 9 });
        sym = 0;
        while (sym < 32) {
          state.lens[sym++] = 5;
        }
        inflate_table(DISTS, state.lens, 0, 32, distfix, 0, state.work, { bits: 5 });
        virgin = false;
      }
      state.lencode = lenfix;
      state.lenbits = 9;
      state.distcode = distfix;
      state.distbits = 5;
    }
    function updatewindow(strm, src, end, copy) {
      var dist;
      var state = strm.state;
      if (state.window === null) {
        state.wsize = 1 << state.wbits;
        state.wnext = 0;
        state.whave = 0;
        state.window = new utils.Buf8(state.wsize);
      }
      if (copy >= state.wsize) {
        utils.arraySet(state.window, src, end - state.wsize, state.wsize, 0);
        state.wnext = 0;
        state.whave = state.wsize;
      } else {
        dist = state.wsize - state.wnext;
        if (dist > copy) {
          dist = copy;
        }
        utils.arraySet(state.window, src, end - copy, dist, state.wnext);
        copy -= dist;
        if (copy) {
          utils.arraySet(state.window, src, end - copy, copy, 0);
          state.wnext = copy;
          state.whave = state.wsize;
        } else {
          state.wnext += dist;
          if (state.wnext === state.wsize) {
            state.wnext = 0;
          }
          if (state.whave < state.wsize) {
            state.whave += dist;
          }
        }
      }
      return 0;
    }
    function inflate(strm, flush) {
      var state;
      var input, output;
      var next;
      var put;
      var have, left;
      var hold;
      var bits;
      var _in, _out;
      var copy;
      var from;
      var from_source;
      var here = 0;
      var here_bits, here_op, here_val;
      var last_bits, last_op, last_val;
      var len;
      var ret;
      var hbuf = new utils.Buf8(4);
      var opts;
      var n;
      var order = (
        /* permutation of code lengths */
        [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]
      );
      if (!strm || !strm.state || !strm.output || !strm.input && strm.avail_in !== 0) {
        return Z_STREAM_ERROR;
      }
      state = strm.state;
      if (state.mode === TYPE) {
        state.mode = TYPEDO;
      }
      put = strm.next_out;
      output = strm.output;
      left = strm.avail_out;
      next = strm.next_in;
      input = strm.input;
      have = strm.avail_in;
      hold = state.hold;
      bits = state.bits;
      _in = have;
      _out = left;
      ret = Z_OK;
      inf_leave:
        for (; ; ) {
          switch (state.mode) {
            case HEAD:
              if (state.wrap === 0) {
                state.mode = TYPEDO;
                break;
              }
              while (bits < 16) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              if (state.wrap & 2 && hold === 35615) {
                state.check = 0;
                hbuf[0] = hold & 255;
                hbuf[1] = hold >>> 8 & 255;
                state.check = crc32(state.check, hbuf, 2, 0);
                hold = 0;
                bits = 0;
                state.mode = FLAGS;
                break;
              }
              state.flags = 0;
              if (state.head) {
                state.head.done = false;
              }
              if (!(state.wrap & 1) || /* check if zlib header allowed */
              (((hold & 255) << 8) + (hold >> 8)) % 31) {
                strm.msg = "incorrect header check";
                state.mode = BAD;
                break;
              }
              if ((hold & 15) !== Z_DEFLATED) {
                strm.msg = "unknown compression method";
                state.mode = BAD;
                break;
              }
              hold >>>= 4;
              bits -= 4;
              len = (hold & 15) + 8;
              if (state.wbits === 0) {
                state.wbits = len;
              } else if (len > state.wbits) {
                strm.msg = "invalid window size";
                state.mode = BAD;
                break;
              }
              state.dmax = 1 << len;
              strm.adler = state.check = 1;
              state.mode = hold & 512 ? DICTID : TYPE;
              hold = 0;
              bits = 0;
              break;
            case FLAGS:
              while (bits < 16) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              state.flags = hold;
              if ((state.flags & 255) !== Z_DEFLATED) {
                strm.msg = "unknown compression method";
                state.mode = BAD;
                break;
              }
              if (state.flags & 57344) {
                strm.msg = "unknown header flags set";
                state.mode = BAD;
                break;
              }
              if (state.head) {
                state.head.text = hold >> 8 & 1;
              }
              if (state.flags & 512) {
                hbuf[0] = hold & 255;
                hbuf[1] = hold >>> 8 & 255;
                state.check = crc32(state.check, hbuf, 2, 0);
              }
              hold = 0;
              bits = 0;
              state.mode = TIME;
            /* falls through */
            case TIME:
              while (bits < 32) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              if (state.head) {
                state.head.time = hold;
              }
              if (state.flags & 512) {
                hbuf[0] = hold & 255;
                hbuf[1] = hold >>> 8 & 255;
                hbuf[2] = hold >>> 16 & 255;
                hbuf[3] = hold >>> 24 & 255;
                state.check = crc32(state.check, hbuf, 4, 0);
              }
              hold = 0;
              bits = 0;
              state.mode = OS;
            /* falls through */
            case OS:
              while (bits < 16) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              if (state.head) {
                state.head.xflags = hold & 255;
                state.head.os = hold >> 8;
              }
              if (state.flags & 512) {
                hbuf[0] = hold & 255;
                hbuf[1] = hold >>> 8 & 255;
                state.check = crc32(state.check, hbuf, 2, 0);
              }
              hold = 0;
              bits = 0;
              state.mode = EXLEN;
            /* falls through */
            case EXLEN:
              if (state.flags & 1024) {
                while (bits < 16) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                state.length = hold;
                if (state.head) {
                  state.head.extra_len = hold;
                }
                if (state.flags & 512) {
                  hbuf[0] = hold & 255;
                  hbuf[1] = hold >>> 8 & 255;
                  state.check = crc32(state.check, hbuf, 2, 0);
                }
                hold = 0;
                bits = 0;
              } else if (state.head) {
                state.head.extra = null;
              }
              state.mode = EXTRA;
            /* falls through */
            case EXTRA:
              if (state.flags & 1024) {
                copy = state.length;
                if (copy > have) {
                  copy = have;
                }
                if (copy) {
                  if (state.head) {
                    len = state.head.extra_len - state.length;
                    if (!state.head.extra) {
                      state.head.extra = new Array(state.head.extra_len);
                    }
                    utils.arraySet(
                      state.head.extra,
                      input,
                      next,
                      // extra field is limited to 65536 bytes
                      // - no need for additional size check
                      copy,
                      /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/
                      len
                    );
                  }
                  if (state.flags & 512) {
                    state.check = crc32(state.check, input, copy, next);
                  }
                  have -= copy;
                  next += copy;
                  state.length -= copy;
                }
                if (state.length) {
                  break inf_leave;
                }
              }
              state.length = 0;
              state.mode = NAME;
            /* falls through */
            case NAME:
              if (state.flags & 2048) {
                if (have === 0) {
                  break inf_leave;
                }
                copy = 0;
                do {
                  len = input[next + copy++];
                  if (state.head && len && state.length < 65536) {
                    state.head.name += String.fromCharCode(len);
                  }
                } while (len && copy < have);
                if (state.flags & 512) {
                  state.check = crc32(state.check, input, copy, next);
                }
                have -= copy;
                next += copy;
                if (len) {
                  break inf_leave;
                }
              } else if (state.head) {
                state.head.name = null;
              }
              state.length = 0;
              state.mode = COMMENT;
            /* falls through */
            case COMMENT:
              if (state.flags & 4096) {
                if (have === 0) {
                  break inf_leave;
                }
                copy = 0;
                do {
                  len = input[next + copy++];
                  if (state.head && len && state.length < 65536) {
                    state.head.comment += String.fromCharCode(len);
                  }
                } while (len && copy < have);
                if (state.flags & 512) {
                  state.check = crc32(state.check, input, copy, next);
                }
                have -= copy;
                next += copy;
                if (len) {
                  break inf_leave;
                }
              } else if (state.head) {
                state.head.comment = null;
              }
              state.mode = HCRC;
            /* falls through */
            case HCRC:
              if (state.flags & 512) {
                while (bits < 16) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (hold !== (state.check & 65535)) {
                  strm.msg = "header crc mismatch";
                  state.mode = BAD;
                  break;
                }
                hold = 0;
                bits = 0;
              }
              if (state.head) {
                state.head.hcrc = state.flags >> 9 & 1;
                state.head.done = true;
              }
              strm.adler = state.check = 0;
              state.mode = TYPE;
              break;
            case DICTID:
              while (bits < 32) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              strm.adler = state.check = zswap32(hold);
              hold = 0;
              bits = 0;
              state.mode = DICT;
            /* falls through */
            case DICT:
              if (state.havedict === 0) {
                strm.next_out = put;
                strm.avail_out = left;
                strm.next_in = next;
                strm.avail_in = have;
                state.hold = hold;
                state.bits = bits;
                return Z_NEED_DICT;
              }
              strm.adler = state.check = 1;
              state.mode = TYPE;
            /* falls through */
            case TYPE:
              if (flush === Z_BLOCK || flush === Z_TREES) {
                break inf_leave;
              }
            /* falls through */
            case TYPEDO:
              if (state.last) {
                hold >>>= bits & 7;
                bits -= bits & 7;
                state.mode = CHECK;
                break;
              }
              while (bits < 3) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              state.last = hold & 1;
              hold >>>= 1;
              bits -= 1;
              switch (hold & 3) {
                case 0:
                  state.mode = STORED;
                  break;
                case 1:
                  fixedtables(state);
                  state.mode = LEN_;
                  if (flush === Z_TREES) {
                    hold >>>= 2;
                    bits -= 2;
                    break inf_leave;
                  }
                  break;
                case 2:
                  state.mode = TABLE;
                  break;
                case 3:
                  strm.msg = "invalid block type";
                  state.mode = BAD;
              }
              hold >>>= 2;
              bits -= 2;
              break;
            case STORED:
              hold >>>= bits & 7;
              bits -= bits & 7;
              while (bits < 32) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              if ((hold & 65535) !== (hold >>> 16 ^ 65535)) {
                strm.msg = "invalid stored block lengths";
                state.mode = BAD;
                break;
              }
              state.length = hold & 65535;
              hold = 0;
              bits = 0;
              state.mode = COPY_;
              if (flush === Z_TREES) {
                break inf_leave;
              }
            /* falls through */
            case COPY_:
              state.mode = COPY;
            /* falls through */
            case COPY:
              copy = state.length;
              if (copy) {
                if (copy > have) {
                  copy = have;
                }
                if (copy > left) {
                  copy = left;
                }
                if (copy === 0) {
                  break inf_leave;
                }
                utils.arraySet(output, input, next, copy, put);
                have -= copy;
                next += copy;
                left -= copy;
                put += copy;
                state.length -= copy;
                break;
              }
              state.mode = TYPE;
              break;
            case TABLE:
              while (bits < 14) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              state.nlen = (hold & 31) + 257;
              hold >>>= 5;
              bits -= 5;
              state.ndist = (hold & 31) + 1;
              hold >>>= 5;
              bits -= 5;
              state.ncode = (hold & 15) + 4;
              hold >>>= 4;
              bits -= 4;
              if (state.nlen > 286 || state.ndist > 30) {
                strm.msg = "too many length or distance symbols";
                state.mode = BAD;
                break;
              }
              state.have = 0;
              state.mode = LENLENS;
            /* falls through */
            case LENLENS:
              while (state.have < state.ncode) {
                while (bits < 3) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                state.lens[order[state.have++]] = hold & 7;
                hold >>>= 3;
                bits -= 3;
              }
              while (state.have < 19) {
                state.lens[order[state.have++]] = 0;
              }
              state.lencode = state.lendyn;
              state.lenbits = 7;
              opts = { bits: state.lenbits };
              ret = inflate_table(CODES, state.lens, 0, 19, state.lencode, 0, state.work, opts);
              state.lenbits = opts.bits;
              if (ret) {
                strm.msg = "invalid code lengths set";
                state.mode = BAD;
                break;
              }
              state.have = 0;
              state.mode = CODELENS;
            /* falls through */
            case CODELENS:
              while (state.have < state.nlen + state.ndist) {
                for (; ; ) {
                  here = state.lencode[hold & (1 << state.lenbits) - 1];
                  here_bits = here >>> 24;
                  here_op = here >>> 16 & 255;
                  here_val = here & 65535;
                  if (here_bits <= bits) {
                    break;
                  }
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (here_val < 16) {
                  hold >>>= here_bits;
                  bits -= here_bits;
                  state.lens[state.have++] = here_val;
                } else {
                  if (here_val === 16) {
                    n = here_bits + 2;
                    while (bits < n) {
                      if (have === 0) {
                        break inf_leave;
                      }
                      have--;
                      hold += input[next++] << bits;
                      bits += 8;
                    }
                    hold >>>= here_bits;
                    bits -= here_bits;
                    if (state.have === 0) {
                      strm.msg = "invalid bit length repeat";
                      state.mode = BAD;
                      break;
                    }
                    len = state.lens[state.have - 1];
                    copy = 3 + (hold & 3);
                    hold >>>= 2;
                    bits -= 2;
                  } else if (here_val === 17) {
                    n = here_bits + 3;
                    while (bits < n) {
                      if (have === 0) {
                        break inf_leave;
                      }
                      have--;
                      hold += input[next++] << bits;
                      bits += 8;
                    }
                    hold >>>= here_bits;
                    bits -= here_bits;
                    len = 0;
                    copy = 3 + (hold & 7);
                    hold >>>= 3;
                    bits -= 3;
                  } else {
                    n = here_bits + 7;
                    while (bits < n) {
                      if (have === 0) {
                        break inf_leave;
                      }
                      have--;
                      hold += input[next++] << bits;
                      bits += 8;
                    }
                    hold >>>= here_bits;
                    bits -= here_bits;
                    len = 0;
                    copy = 11 + (hold & 127);
                    hold >>>= 7;
                    bits -= 7;
                  }
                  if (state.have + copy > state.nlen + state.ndist) {
                    strm.msg = "invalid bit length repeat";
                    state.mode = BAD;
                    break;
                  }
                  while (copy--) {
                    state.lens[state.have++] = len;
                  }
                }
              }
              if (state.mode === BAD) {
                break;
              }
              if (state.lens[256] === 0) {
                strm.msg = "invalid code -- missing end-of-block";
                state.mode = BAD;
                break;
              }
              state.lenbits = 9;
              opts = { bits: state.lenbits };
              ret = inflate_table(LENS, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);
              state.lenbits = opts.bits;
              if (ret) {
                strm.msg = "invalid literal/lengths set";
                state.mode = BAD;
                break;
              }
              state.distbits = 6;
              state.distcode = state.distdyn;
              opts = { bits: state.distbits };
              ret = inflate_table(DISTS, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);
              state.distbits = opts.bits;
              if (ret) {
                strm.msg = "invalid distances set";
                state.mode = BAD;
                break;
              }
              state.mode = LEN_;
              if (flush === Z_TREES) {
                break inf_leave;
              }
            /* falls through */
            case LEN_:
              state.mode = LEN;
            /* falls through */
            case LEN:
              if (have >= 6 && left >= 258) {
                strm.next_out = put;
                strm.avail_out = left;
                strm.next_in = next;
                strm.avail_in = have;
                state.hold = hold;
                state.bits = bits;
                inflate_fast(strm, _out);
                put = strm.next_out;
                output = strm.output;
                left = strm.avail_out;
                next = strm.next_in;
                input = strm.input;
                have = strm.avail_in;
                hold = state.hold;
                bits = state.bits;
                if (state.mode === TYPE) {
                  state.back = -1;
                }
                break;
              }
              state.back = 0;
              for (; ; ) {
                here = state.lencode[hold & (1 << state.lenbits) - 1];
                here_bits = here >>> 24;
                here_op = here >>> 16 & 255;
                here_val = here & 65535;
                if (here_bits <= bits) {
                  break;
                }
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              if (here_op && (here_op & 240) === 0) {
                last_bits = here_bits;
                last_op = here_op;
                last_val = here_val;
                for (; ; ) {
                  here = state.lencode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> last_bits)];
                  here_bits = here >>> 24;
                  here_op = here >>> 16 & 255;
                  here_val = here & 65535;
                  if (last_bits + here_bits <= bits) {
                    break;
                  }
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                hold >>>= last_bits;
                bits -= last_bits;
                state.back += last_bits;
              }
              hold >>>= here_bits;
              bits -= here_bits;
              state.back += here_bits;
              state.length = here_val;
              if (here_op === 0) {
                state.mode = LIT;
                break;
              }
              if (here_op & 32) {
                state.back = -1;
                state.mode = TYPE;
                break;
              }
              if (here_op & 64) {
                strm.msg = "invalid literal/length code";
                state.mode = BAD;
                break;
              }
              state.extra = here_op & 15;
              state.mode = LENEXT;
            /* falls through */
            case LENEXT:
              if (state.extra) {
                n = state.extra;
                while (bits < n) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                state.length += hold & (1 << state.extra) - 1;
                hold >>>= state.extra;
                bits -= state.extra;
                state.back += state.extra;
              }
              state.was = state.length;
              state.mode = DIST;
            /* falls through */
            case DIST:
              for (; ; ) {
                here = state.distcode[hold & (1 << state.distbits) - 1];
                here_bits = here >>> 24;
                here_op = here >>> 16 & 255;
                here_val = here & 65535;
                if (here_bits <= bits) {
                  break;
                }
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              if ((here_op & 240) === 0) {
                last_bits = here_bits;
                last_op = here_op;
                last_val = here_val;
                for (; ; ) {
                  here = state.distcode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> last_bits)];
                  here_bits = here >>> 24;
                  here_op = here >>> 16 & 255;
                  here_val = here & 65535;
                  if (last_bits + here_bits <= bits) {
                    break;
                  }
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                hold >>>= last_bits;
                bits -= last_bits;
                state.back += last_bits;
              }
              hold >>>= here_bits;
              bits -= here_bits;
              state.back += here_bits;
              if (here_op & 64) {
                strm.msg = "invalid distance code";
                state.mode = BAD;
                break;
              }
              state.offset = here_val;
              state.extra = here_op & 15;
              state.mode = DISTEXT;
            /* falls through */
            case DISTEXT:
              if (state.extra) {
                n = state.extra;
                while (bits < n) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                state.offset += hold & (1 << state.extra) - 1;
                hold >>>= state.extra;
                bits -= state.extra;
                state.back += state.extra;
              }
              if (state.offset > state.dmax) {
                strm.msg = "invalid distance too far back";
                state.mode = BAD;
                break;
              }
              state.mode = MATCH;
            /* falls through */
            case MATCH:
              if (left === 0) {
                break inf_leave;
              }
              copy = _out - left;
              if (state.offset > copy) {
                copy = state.offset - copy;
                if (copy > state.whave) {
                  if (state.sane) {
                    strm.msg = "invalid distance too far back";
                    state.mode = BAD;
                    break;
                  }
                }
                if (copy > state.wnext) {
                  copy -= state.wnext;
                  from = state.wsize - copy;
                } else {
                  from = state.wnext - copy;
                }
                if (copy > state.length) {
                  copy = state.length;
                }
                from_source = state.window;
              } else {
                from_source = output;
                from = put - state.offset;
                copy = state.length;
              }
              if (copy > left) {
                copy = left;
              }
              left -= copy;
              state.length -= copy;
              do {
                output[put++] = from_source[from++];
              } while (--copy);
              if (state.length === 0) {
                state.mode = LEN;
              }
              break;
            case LIT:
              if (left === 0) {
                break inf_leave;
              }
              output[put++] = state.length;
              left--;
              state.mode = LEN;
              break;
            case CHECK:
              if (state.wrap) {
                while (bits < 32) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold |= input[next++] << bits;
                  bits += 8;
                }
                _out -= left;
                strm.total_out += _out;
                state.total += _out;
                if (_out) {
                  strm.adler = state.check = /*UPDATE(state.check, put - _out, _out);*/
                  state.flags ? crc32(state.check, output, _out, put - _out) : adler32(state.check, output, _out, put - _out);
                }
                _out = left;
                if ((state.flags ? hold : zswap32(hold)) !== state.check) {
                  strm.msg = "incorrect data check";
                  state.mode = BAD;
                  break;
                }
                hold = 0;
                bits = 0;
              }
              state.mode = LENGTH;
            /* falls through */
            case LENGTH:
              if (state.wrap && state.flags) {
                while (bits < 32) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (hold !== (state.total & 4294967295)) {
                  strm.msg = "incorrect length check";
                  state.mode = BAD;
                  break;
                }
                hold = 0;
                bits = 0;
              }
              state.mode = DONE;
            /* falls through */
            case DONE:
              ret = Z_STREAM_END;
              break inf_leave;
            case BAD:
              ret = Z_DATA_ERROR;
              break inf_leave;
            case MEM:
              return Z_MEM_ERROR;
            case SYNC:
            /* falls through */
            default:
              return Z_STREAM_ERROR;
          }
        }
      strm.next_out = put;
      strm.avail_out = left;
      strm.next_in = next;
      strm.avail_in = have;
      state.hold = hold;
      state.bits = bits;
      if (state.wsize || _out !== strm.avail_out && state.mode < BAD && (state.mode < CHECK || flush !== Z_FINISH)) {
        if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out)) ;
      }
      _in -= strm.avail_in;
      _out -= strm.avail_out;
      strm.total_in += _in;
      strm.total_out += _out;
      state.total += _out;
      if (state.wrap && _out) {
        strm.adler = state.check = /*UPDATE(state.check, strm.next_out - _out, _out);*/
        state.flags ? crc32(state.check, output, _out, strm.next_out - _out) : adler32(state.check, output, _out, strm.next_out - _out);
      }
      strm.data_type = state.bits + (state.last ? 64 : 0) + (state.mode === TYPE ? 128 : 0) + (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
      if ((_in === 0 && _out === 0 || flush === Z_FINISH) && ret === Z_OK) {
        ret = Z_BUF_ERROR;
      }
      return ret;
    }
    function inflateEnd(strm) {
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      var state = strm.state;
      if (state.window) {
        state.window = null;
      }
      strm.state = null;
      return Z_OK;
    }
    function inflateGetHeader(strm, head) {
      var state;
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      state = strm.state;
      if ((state.wrap & 2) === 0) {
        return Z_STREAM_ERROR;
      }
      state.head = head;
      head.done = false;
      return Z_OK;
    }
    function inflateSetDictionary(strm, dictionary) {
      var dictLength = dictionary.length;
      var state;
      var dictid;
      var ret;
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      state = strm.state;
      if (state.wrap !== 0 && state.mode !== DICT) {
        return Z_STREAM_ERROR;
      }
      if (state.mode === DICT) {
        dictid = 1;
        dictid = adler32(dictid, dictionary, dictLength, 0);
        if (dictid !== state.check) {
          return Z_DATA_ERROR;
        }
      }
      ret = updatewindow(strm, dictionary, dictLength, dictLength);
      if (ret) {
        state.mode = MEM;
        return Z_MEM_ERROR;
      }
      state.havedict = 1;
      return Z_OK;
    }
    exports.inflateReset = inflateReset;
    exports.inflateReset2 = inflateReset2;
    exports.inflateResetKeep = inflateResetKeep;
    exports.inflateInit = inflateInit;
    exports.inflateInit2 = inflateInit2;
    exports.inflate = inflate;
    exports.inflateEnd = inflateEnd;
    exports.inflateGetHeader = inflateGetHeader;
    exports.inflateSetDictionary = inflateSetDictionary;
    exports.inflateInfo = "pako inflate (from Nodeca project)";
  }
});

// ../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/constants.js
var require_constants = __commonJS({
  "../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/constants.js"(exports, module) {
    module.exports = {
      /* Allowed flush values; see deflate() and inflate() below for details */
      Z_NO_FLUSH: 0,
      Z_PARTIAL_FLUSH: 1,
      Z_SYNC_FLUSH: 2,
      Z_FULL_FLUSH: 3,
      Z_FINISH: 4,
      Z_BLOCK: 5,
      Z_TREES: 6,
      /* Return codes for the compression/decompression functions. Negative values
      * are errors, positive values are used for special but normal events.
      */
      Z_OK: 0,
      Z_STREAM_END: 1,
      Z_NEED_DICT: 2,
      Z_ERRNO: -1,
      Z_STREAM_ERROR: -2,
      Z_DATA_ERROR: -3,
      //Z_MEM_ERROR:     -4,
      Z_BUF_ERROR: -5,
      //Z_VERSION_ERROR: -6,
      /* compression levels */
      Z_NO_COMPRESSION: 0,
      Z_BEST_SPEED: 1,
      Z_BEST_COMPRESSION: 9,
      Z_DEFAULT_COMPRESSION: -1,
      Z_FILTERED: 1,
      Z_HUFFMAN_ONLY: 2,
      Z_RLE: 3,
      Z_FIXED: 4,
      Z_DEFAULT_STRATEGY: 0,
      /* Possible values of the data_type field (though see inflate()) */
      Z_BINARY: 0,
      Z_TEXT: 1,
      //Z_ASCII:                1, // = Z_TEXT (deprecated)
      Z_UNKNOWN: 2,
      /* The deflate compression method */
      Z_DEFLATED: 8
      //Z_NULL:                 null // Use -1 or null inline, depending on var type
    };
  }
});

// ../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/gzheader.js
var require_gzheader = __commonJS({
  "../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/zlib/gzheader.js"(exports, module) {
    function GZheader() {
      this.text = 0;
      this.time = 0;
      this.xflags = 0;
      this.os = 0;
      this.extra = null;
      this.extra_len = 0;
      this.name = "";
      this.comment = "";
      this.hcrc = 0;
      this.done = false;
    }
    module.exports = GZheader;
  }
});

// ../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/inflate.js
var require_inflate2 = __commonJS({
  "../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/lib/inflate.js"(exports) {
    var zlib_inflate = require_inflate();
    var utils = require_common();
    var strings = require_strings();
    var c = require_constants();
    var msg = require_messages();
    var ZStream = require_zstream();
    var GZheader = require_gzheader();
    var toString = Object.prototype.toString;
    function Inflate(options) {
      if (!(this instanceof Inflate)) return new Inflate(options);
      this.options = utils.assign({
        chunkSize: 16384,
        windowBits: 0,
        to: ""
      }, options || {});
      var opt = this.options;
      if (opt.raw && opt.windowBits >= 0 && opt.windowBits < 16) {
        opt.windowBits = -opt.windowBits;
        if (opt.windowBits === 0) {
          opt.windowBits = -15;
        }
      }
      if (opt.windowBits >= 0 && opt.windowBits < 16 && !(options && options.windowBits)) {
        opt.windowBits += 32;
      }
      if (opt.windowBits > 15 && opt.windowBits < 48) {
        if ((opt.windowBits & 15) === 0) {
          opt.windowBits |= 15;
        }
      }
      this.err = 0;
      this.msg = "";
      this.ended = false;
      this.chunks = [];
      this.strm = new ZStream();
      this.strm.avail_out = 0;
      var status = zlib_inflate.inflateInit2(
        this.strm,
        opt.windowBits
      );
      if (status !== c.Z_OK) {
        throw new Error(msg[status]);
      }
      this.header = new GZheader();
      zlib_inflate.inflateGetHeader(this.strm, this.header);
      if (opt.dictionary) {
        if (typeof opt.dictionary === "string") {
          opt.dictionary = strings.string2buf(opt.dictionary);
        } else if (toString.call(opt.dictionary) === "[object ArrayBuffer]") {
          opt.dictionary = new Uint8Array(opt.dictionary);
        }
        if (opt.raw) {
          status = zlib_inflate.inflateSetDictionary(this.strm, opt.dictionary);
          if (status !== c.Z_OK) {
            throw new Error(msg[status]);
          }
        }
      }
    }
    Inflate.prototype.push = function(data, mode) {
      var strm = this.strm;
      var chunkSize = this.options.chunkSize;
      var dictionary = this.options.dictionary;
      var status, _mode;
      var next_out_utf8, tail, utf8str;
      var allowBufError = false;
      if (this.ended) {
        return false;
      }
      _mode = mode === ~~mode ? mode : mode === true ? c.Z_FINISH : c.Z_NO_FLUSH;
      if (typeof data === "string") {
        strm.input = strings.binstring2buf(data);
      } else if (toString.call(data) === "[object ArrayBuffer]") {
        strm.input = new Uint8Array(data);
      } else {
        strm.input = data;
      }
      strm.next_in = 0;
      strm.avail_in = strm.input.length;
      do {
        if (strm.avail_out === 0) {
          strm.output = new utils.Buf8(chunkSize);
          strm.next_out = 0;
          strm.avail_out = chunkSize;
        }
        status = zlib_inflate.inflate(strm, c.Z_NO_FLUSH);
        if (status === c.Z_NEED_DICT && dictionary) {
          status = zlib_inflate.inflateSetDictionary(this.strm, dictionary);
        }
        if (status === c.Z_BUF_ERROR && allowBufError === true) {
          status = c.Z_OK;
          allowBufError = false;
        }
        if (status !== c.Z_STREAM_END && status !== c.Z_OK) {
          this.onEnd(status);
          this.ended = true;
          return false;
        }
        if (strm.next_out) {
          if (strm.avail_out === 0 || status === c.Z_STREAM_END || strm.avail_in === 0 && (_mode === c.Z_FINISH || _mode === c.Z_SYNC_FLUSH)) {
            if (this.options.to === "string") {
              next_out_utf8 = strings.utf8border(strm.output, strm.next_out);
              tail = strm.next_out - next_out_utf8;
              utf8str = strings.buf2string(strm.output, next_out_utf8);
              strm.next_out = tail;
              strm.avail_out = chunkSize - tail;
              if (tail) {
                utils.arraySet(strm.output, strm.output, next_out_utf8, tail, 0);
              }
              this.onData(utf8str);
            } else {
              this.onData(utils.shrinkBuf(strm.output, strm.next_out));
            }
          }
        }
        if (strm.avail_in === 0 && strm.avail_out === 0) {
          allowBufError = true;
        }
      } while ((strm.avail_in > 0 || strm.avail_out === 0) && status !== c.Z_STREAM_END);
      if (status === c.Z_STREAM_END) {
        _mode = c.Z_FINISH;
      }
      if (_mode === c.Z_FINISH) {
        status = zlib_inflate.inflateEnd(this.strm);
        this.onEnd(status);
        this.ended = true;
        return status === c.Z_OK;
      }
      if (_mode === c.Z_SYNC_FLUSH) {
        this.onEnd(c.Z_OK);
        strm.avail_out = 0;
        return true;
      }
      return true;
    };
    Inflate.prototype.onData = function(chunk) {
      this.chunks.push(chunk);
    };
    Inflate.prototype.onEnd = function(status) {
      if (status === c.Z_OK) {
        if (this.options.to === "string") {
          this.result = this.chunks.join("");
        } else {
          this.result = utils.flattenChunks(this.chunks);
        }
      }
      this.chunks = [];
      this.err = status;
      this.msg = this.strm.msg;
    };
    function inflate(input, options) {
      var inflator = new Inflate(options);
      inflator.push(input, true);
      if (inflator.err) {
        throw inflator.msg || msg[inflator.err];
      }
      return inflator.result;
    }
    function inflateRaw(input, options) {
      options = options || {};
      options.raw = true;
      return inflate(input, options);
    }
    exports.Inflate = Inflate;
    exports.inflate = inflate;
    exports.inflateRaw = inflateRaw;
    exports.ungzip = inflate;
  }
});

// ../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/index.js
var require_pako = __commonJS({
  "../../node_modules/.pnpm/pako@1.0.11/node_modules/pako/index.js"(exports, module) {
    var assign = require_common().assign;
    var deflate = require_deflate2();
    var inflate = require_inflate2();
    var constants = require_constants();
    var pako2 = {};
    assign(pako2, deflate, inflate, constants);
    module.exports = pako2;
  }
});

// src/errors.ts
var VERSION_HINT = "use the source revision/tool that produced this tape, or capture again on the current revision";
function createRhiDebugError(code, detail) {
  return {
    code,
    expected: expectedFor(code),
    hint: recoveryHint(code),
    detail
  };
}
function expectedFor(code) {
  switch (code) {
    case "capture-unavailable":
    case "capture-busy":
    case "capture-snapshot-failed":
    case "capture-timeout":
      return "a capture capability that can complete one bounded frame";
    case "tape-invalid":
    case "tape-version-unsupported":
      return "a valid v7 RHI debug tape";
    case "replay-capability-mismatch":
    case "replay-event-failed":
    case "replay-position-invalid":
      return "a fresh replay session with a valid workIndex";
    case "readback-failed":
    case "readback-unsupported":
      return "a supported readback target";
  }
}
function recoveryHint(code) {
  switch (code) {
    case "capture-unavailable":
      return "enable the single RHI capture capability and retry";
    case "capture-busy":
      return "wait for the active capture to finish, then issue one new request";
    case "capture-snapshot-failed":
      return "inspect the snapshot stage and capture again after fixing the resource";
    case "capture-timeout":
      return "increase the bounded timeout or capture again after the device becomes idle";
    case "tape-invalid":
      return "obtain complete bytes and retry strict decoding; do not continue to replay";
    case "tape-version-unsupported":
      return VERSION_HINT;
    case "replay-capability-mismatch":
      return "use a fresh device satisfying the recorded RHI capabilities";
    case "replay-event-failed":
      return "inspect eventIndex, kind, stage, and cause; later work is not valid";
    case "replay-position-invalid":
      return "choose a workIndex present in FrameModel.works";
    case "readback-failed":
      return "inspect the readback cause and retry on a live fresh replay session";
    case "readback-unsupported":
      return "inspect the descriptor or use a backend with the requested readback support";
  }
}

// src/initial-contents.ts
function unseededResources(tape) {
  return tape.bootstrap.flatMap((resource) => {
    if (resource.initialData.some((slice) => slice.byteLength > 0)) return [];
    const event = resource.create;
    if (event.kind !== "createBuffer" && event.kind !== "createTexture") return [];
    return [
      {
        resourceId: resource.handleId,
        kind: event.kind === "createBuffer" ? "buffer" : "texture",
        format: event.kind === "createTexture" ? event.desc.format : null,
        sampleCount: event.kind === "createTexture" ? event.desc.sampleCount ?? 1 : 1
      }
    ];
  });
}

// src/protocol/event-semantics.ts
var eventKinds = [
  "frameMark",
  "createBuffer",
  "createTexture",
  "createQuerySet",
  "destroyBuffer",
  "destroyTexture",
  "destroyQuerySet",
  "createTextureView",
  "createSampler",
  "createBindGroupLayout",
  "getBindGroupLayout",
  "createBindGroup",
  "createPipelineLayout",
  "createRenderPipeline",
  "createComputePipeline",
  "createShaderModule",
  "createCommandEncoder",
  "writeBuffer",
  "writeTexture",
  "copyExternalImageToTexture",
  "submit",
  "beginRenderPass",
  "beginOcclusionQuery",
  "endOcclusionQuery",
  "beginComputePass",
  "copyBufferToBuffer",
  "copyBufferToTexture",
  "copyTextureToBuffer",
  "copyTextureToTexture",
  "clearBuffer",
  "resolveQuerySet",
  "pushDebugGroup",
  "popDebugGroup",
  "insertDebugMarker",
  "finish",
  "setPipeline",
  "setVertexBuffer",
  "setIndexBuffer",
  "setBindGroup",
  "draw",
  "drawIndexed",
  "setViewport",
  "setScissorRect",
  "setStencilReference",
  "endRenderPass",
  "setBlendConstant",
  "drawIndirect",
  "drawIndexedIndirect",
  "passPushDebugGroup",
  "passPopDebugGroup",
  "passInsertDebugMarker",
  "setComputePipeline",
  "dispatchWorkgroups",
  "dispatchWorkgroupsIndirect",
  "endComputePass",
  "initialData"
];
var workEventKinds = [
  "draw",
  "drawIndexed",
  "drawIndirect",
  "drawIndexedIndirect",
  "dispatchWorkgroups",
  "dispatchWorkgroupsIndirect"
];
function isWorkEvent(kind) {
  return workEventKinds.includes(kind);
}
var EVENT_SEMANTICS = Object.fromEntries(
  eventKinds.map((kind) => [kind, semanticsFor(kind)])
);
function resourceKindForEvent(kind) {
  switch (kind) {
    case "createBuffer":
      return "buffer";
    case "createTexture":
      return "texture";
    case "createQuerySet":
      return "query-set";
    case "createTextureView":
      return "texture-view";
    case "createSampler":
      return "sampler";
    case "createShaderModule":
      return "shader-module";
    case "createRenderPipeline":
    case "createComputePipeline":
      return "pipeline";
    case "createBindGroup":
    case "createBindGroupLayout":
    case "getBindGroupLayout":
    case "createPipelineLayout":
      return "binding";
    case "createCommandEncoder":
      return "encoder";
    default:
      return void 0;
  }
}
function semanticsFor(kind) {
  const category = categoryFor(kind);
  return {
    category,
    created: (event) => createdHandles(event),
    read: (event) => referencedHandles(event),
    written: (event) => writtenHandles(event),
    destroyed: (event) => event.kind === "destroyBuffer" || event.kind === "destroyTexture" || event.kind === "destroyQuerySet" ? stringField(event, "handleId") : []
  };
}
function categoryFor(kind) {
  if (isWorkEvent(kind)) return "work";
  if (kind.startsWith("create") || kind.startsWith("destroy") || kind === "initialData" || kind === "getBindGroupLayout")
    return "resource";
  if (kind.includes("Pass")) return "pass";
  if (kind.startsWith("copy") || kind === "clearBuffer" || kind.startsWith("write")) return "copy";
  if (kind === "submit" || kind === "finish") return "submit";
  if (kind.includes("Debug")) return "marker";
  return "state";
}
function createdHandles(event) {
  if (event.kind === "createTextureView") return [event.resultHandleId];
  if (event.kind === "createCommandEncoder") return [event.cmdHandleId];
  if (resourceKindForEvent(event.kind) !== void 0) return stringField(event, "handleId");
  return [];
}
function referencedHandles(event) {
  const keys = [
    "sourceHandleId",
    "layoutHandleId",
    "vertexShaderModuleHandleId",
    "fragmentShaderModuleHandleId",
    "computeShaderModuleHandleId",
    "handleId",
    "bufferHandleId",
    "textureHandleId",
    "source",
    "destination",
    "resourceHandleIds",
    "bindGroupHandleId",
    "pipelineHandleId",
    "querySetHandleId",
    "occlusionQuerySetHandleId",
    "timestampQuerySetHandleId",
    "indexBufferHandleId",
    "vertexBufferHandleId"
  ];
  return keys.flatMap((key) => stringField(event, key));
}
function writtenHandles(event) {
  if (event.kind === "writeBuffer" || event.kind === "writeTexture")
    return stringField(event, "handleId");
  if (event.kind === "copyBufferToBuffer" || event.kind === "copyBufferToTexture" || event.kind === "copyTextureToBuffer" || event.kind === "copyTextureToTexture")
    return stringField(event, "destination");
  return [];
}
function stringField(event, key) {
  const value = event[key];
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.filter((item) => typeof item === "string");
  return [];
}

// src/protocol/tape-index.ts
function buildTapeIndex(tape) {
  const passes = [];
  const works = [];
  const resources = /* @__PURE__ */ new Map();
  const passIndexByEvent = [];
  let passIndex = -1;
  let currentPass;
  for (const [eventIndex, event] of tape.events.entries()) {
    passIndexByEvent[eventIndex] = passIndex;
    const semantics = EVENT_SEMANTICS[event.kind];
    if (event.kind === "beginRenderPass" || event.kind === "beginComputePass") {
      passIndex++;
      passIndexByEvent[eventIndex] = passIndex;
      currentPass = {
        kind: event.kind === "beginRenderPass" ? "render" : "compute",
        beginEventIndex: eventIndex,
        workIndices: []
      };
    }
    if (isWorkEvent(event.kind)) {
      const workIndex = works.length;
      works.push({ workIndex, eventIndex, passIndex, kind: event.kind });
      currentPass?.workIndices.push(workIndex);
    }
    if (event.kind === "endRenderPass" || event.kind === "endComputePass") {
      if (currentPass) {
        passes.push({
          passIndex,
          kind: currentPass.kind,
          beginEventIndex: currentPass.beginEventIndex,
          endEventIndex: eventIndex,
          workIndices: currentPass.workIndices
        });
        currentPass = void 0;
      }
    }
    const kind = resourceKindForEvent(event.kind);
    for (const resourceId of semantics.created(event)) {
      if (kind)
        resources.set(resourceId, {
          resourceId,
          kind,
          origin: "frame",
          createEventIndex: eventIndex,
          destroyEventIndex: void 0
        });
    }
    for (const resourceId of semantics.destroyed(event)) {
      const previous = resources.get(resourceId);
      if (previous) resources.set(resourceId, { ...previous, destroyEventIndex: eventIndex });
    }
  }
  if (currentPass)
    passes.push({
      passIndex,
      kind: currentPass.kind,
      beginEventIndex: currentPass.beginEventIndex,
      endEventIndex: void 0,
      workIndices: currentPass.workIndices
    });
  for (const resource of tape.bootstrap)
    resources.set(resource.handleId, {
      resourceId: resource.handleId,
      kind: resource.kind,
      origin: "bootstrap",
      createEventIndex: void 0,
      destroyEventIndex: void 0
    });
  return {
    passes,
    works,
    resources: [...resources.values()],
    eventKinds: [...eventKinds],
    passIndexByEvent
  };
}

// src/texel-layout.ts
function bytesPerTexel(format) {
  if (format === void 0) return void 0;
  return TEXEL_BYTES[format];
}
var TEXEL_BYTES = {
  // 8-bit channels
  r8unorm: 1,
  r8snorm: 1,
  r8uint: 1,
  r8sint: 1,
  rg8unorm: 2,
  rg8snorm: 2,
  rg8uint: 2,
  rg8sint: 2,
  rgba8unorm: 4,
  "rgba8unorm-srgb": 4,
  rgba8snorm: 4,
  rgba8uint: 4,
  rgba8sint: 4,
  bgra8unorm: 4,
  "bgra8unorm-srgb": 4,
  // 16-bit channels
  r16uint: 2,
  r16sint: 2,
  r16float: 2,
  rg16uint: 4,
  rg16sint: 4,
  rg16float: 4,
  rgba16uint: 8,
  rgba16sint: 8,
  rgba16float: 8,
  // 32-bit channels
  r32uint: 4,
  r32sint: 4,
  r32float: 4,
  depth32float: 4,
  rg32uint: 8,
  rg32sint: 8,
  rg32float: 8,
  rgba32uint: 16,
  rgba32sint: 16,
  rgba32float: 16,
  // packed
  rgb10a2unorm: 4,
  rg11b10ufloat: 4
};
var COMPRESSED_BLOCKS = {
  // BCn: all formats use 4x4 blocks; BC1/BC4 are 8 bytes, the rest 16.
  "bc1-rgba-unorm": { blockWidth: 4, blockHeight: 4, bytesPerBlock: 8 },
  "bc1-rgba-unorm-srgb": { blockWidth: 4, blockHeight: 4, bytesPerBlock: 8 },
  "bc2-rgba-unorm": { blockWidth: 4, blockHeight: 4, bytesPerBlock: 16 },
  "bc2-rgba-unorm-srgb": { blockWidth: 4, blockHeight: 4, bytesPerBlock: 16 },
  "bc3-rgba-unorm": { blockWidth: 4, blockHeight: 4, bytesPerBlock: 16 },
  "bc3-rgba-unorm-srgb": { blockWidth: 4, blockHeight: 4, bytesPerBlock: 16 },
  "bc4-r-unorm": { blockWidth: 4, blockHeight: 4, bytesPerBlock: 8 },
  "bc4-r-snorm": { blockWidth: 4, blockHeight: 4, bytesPerBlock: 8 },
  "bc5-rg-unorm": { blockWidth: 4, blockHeight: 4, bytesPerBlock: 16 },
  "bc5-rg-snorm": { blockWidth: 4, blockHeight: 4, bytesPerBlock: 16 },
  "bc6h-rgb-ufloat": { blockWidth: 4, blockHeight: 4, bytesPerBlock: 16 },
  "bc6h-rgb-float": { blockWidth: 4, blockHeight: 4, bytesPerBlock: 16 },
  "bc7-rgba-unorm": { blockWidth: 4, blockHeight: 4, bytesPerBlock: 16 },
  "bc7-rgba-unorm-srgb": { blockWidth: 4, blockHeight: 4, bytesPerBlock: 16 },
  // ETC2/EAC: all formats use 4x4 blocks; one or two 64-bit blocks.
  "etc2-rgb8unorm": { blockWidth: 4, blockHeight: 4, bytesPerBlock: 8 },
  "etc2-rgb8unorm-srgb": { blockWidth: 4, blockHeight: 4, bytesPerBlock: 8 },
  "etc2-rgb8a1unorm": { blockWidth: 4, blockHeight: 4, bytesPerBlock: 8 },
  "etc2-rgb8a1unorm-srgb": { blockWidth: 4, blockHeight: 4, bytesPerBlock: 8 },
  "etc2-rgba8unorm": { blockWidth: 4, blockHeight: 4, bytesPerBlock: 16 },
  "etc2-rgba8unorm-srgb": { blockWidth: 4, blockHeight: 4, bytesPerBlock: 16 },
  "eac-r11unorm": { blockWidth: 4, blockHeight: 4, bytesPerBlock: 8 },
  "eac-r11snorm": { blockWidth: 4, blockHeight: 4, bytesPerBlock: 8 },
  "eac-rg11unorm": { blockWidth: 4, blockHeight: 4, bytesPerBlock: 16 },
  "eac-rg11snorm": { blockWidth: 4, blockHeight: 4, bytesPerBlock: 16 },
  // ASTC uses 16-byte blocks with a format-specific footprint.
  "astc-4x4-unorm": { blockWidth: 4, blockHeight: 4, bytesPerBlock: 16 },
  "astc-4x4-unorm-srgb": { blockWidth: 4, blockHeight: 4, bytesPerBlock: 16 },
  "astc-5x4-unorm": { blockWidth: 5, blockHeight: 4, bytesPerBlock: 16 },
  "astc-5x4-unorm-srgb": { blockWidth: 5, blockHeight: 4, bytesPerBlock: 16 },
  "astc-5x5-unorm": { blockWidth: 5, blockHeight: 5, bytesPerBlock: 16 },
  "astc-5x5-unorm-srgb": { blockWidth: 5, blockHeight: 5, bytesPerBlock: 16 },
  "astc-6x5-unorm": { blockWidth: 6, blockHeight: 5, bytesPerBlock: 16 },
  "astc-6x5-unorm-srgb": { blockWidth: 6, blockHeight: 5, bytesPerBlock: 16 },
  "astc-6x6-unorm": { blockWidth: 6, blockHeight: 6, bytesPerBlock: 16 },
  "astc-6x6-unorm-srgb": { blockWidth: 6, blockHeight: 6, bytesPerBlock: 16 },
  "astc-8x5-unorm": { blockWidth: 8, blockHeight: 5, bytesPerBlock: 16 },
  "astc-8x5-unorm-srgb": { blockWidth: 8, blockHeight: 5, bytesPerBlock: 16 },
  "astc-8x6-unorm": { blockWidth: 8, blockHeight: 6, bytesPerBlock: 16 },
  "astc-8x6-unorm-srgb": { blockWidth: 8, blockHeight: 6, bytesPerBlock: 16 },
  "astc-8x8-unorm": { blockWidth: 8, blockHeight: 8, bytesPerBlock: 16 },
  "astc-8x8-unorm-srgb": { blockWidth: 8, blockHeight: 8, bytesPerBlock: 16 },
  "astc-10x5-unorm": { blockWidth: 10, blockHeight: 5, bytesPerBlock: 16 },
  "astc-10x5-unorm-srgb": { blockWidth: 10, blockHeight: 5, bytesPerBlock: 16 },
  "astc-10x6-unorm": { blockWidth: 10, blockHeight: 6, bytesPerBlock: 16 },
  "astc-10x6-unorm-srgb": { blockWidth: 10, blockHeight: 6, bytesPerBlock: 16 },
  "astc-10x8-unorm": { blockWidth: 10, blockHeight: 8, bytesPerBlock: 16 },
  "astc-10x8-unorm-srgb": { blockWidth: 10, blockHeight: 8, bytesPerBlock: 16 },
  "astc-10x10-unorm": { blockWidth: 10, blockHeight: 10, bytesPerBlock: 16 },
  "astc-10x10-unorm-srgb": { blockWidth: 10, blockHeight: 10, bytesPerBlock: 16 },
  "astc-12x10-unorm": { blockWidth: 12, blockHeight: 10, bytesPerBlock: 16 },
  "astc-12x10-unorm-srgb": { blockWidth: 12, blockHeight: 10, bytesPerBlock: 16 },
  "astc-12x12-unorm": { blockWidth: 12, blockHeight: 12, bytesPerBlock: 16 },
  "astc-12x12-unorm-srgb": { blockWidth: 12, blockHeight: 12, bytesPerBlock: 16 }
};
function textureBlockLayout(format) {
  if (format === void 0) return void 0;
  return COMPRESSED_BLOCKS[format] ?? (TEXEL_BYTES[format] === void 0 ? void 0 : { blockWidth: 1, blockHeight: 1, bytesPerBlock: TEXEL_BYTES[format] });
}
var FORMAT_INFO = {
  // 8-bit channels
  r8unorm: { channels: 1, channelType: "unorm" },
  r8snorm: { channels: 1, channelType: "snorm" },
  r8uint: { channels: 1, channelType: "uint" },
  r8sint: { channels: 1, channelType: "sint" },
  rg8unorm: { channels: 2, channelType: "unorm" },
  rg8snorm: { channels: 2, channelType: "snorm" },
  rg8uint: { channels: 2, channelType: "uint" },
  rg8sint: { channels: 2, channelType: "sint" },
  rgba8unorm: { channels: 4, channelType: "unorm" },
  "rgba8unorm-srgb": { channels: 4, channelType: "unorm" },
  rgba8snorm: { channels: 4, channelType: "snorm" },
  rgba8uint: { channels: 4, channelType: "uint" },
  rgba8sint: { channels: 4, channelType: "sint" },
  bgra8unorm: { channels: 4, channelType: "unorm", bgra: true },
  "bgra8unorm-srgb": { channels: 4, channelType: "unorm", bgra: true },
  // 16-bit channels
  r16uint: { channels: 1, channelType: "uint" },
  r16sint: { channels: 1, channelType: "sint" },
  r16float: { channels: 1, channelType: "float" },
  rg16uint: { channels: 2, channelType: "uint" },
  rg16sint: { channels: 2, channelType: "sint" },
  rg16float: { channels: 2, channelType: "float" },
  rgba16uint: { channels: 4, channelType: "uint" },
  rgba16sint: { channels: 4, channelType: "sint" },
  rgba16float: { channels: 4, channelType: "float" },
  // 32-bit channels
  r32uint: { channels: 1, channelType: "uint" },
  r32sint: { channels: 1, channelType: "sint" },
  r32float: { channels: 1, channelType: "float" },
  rg32uint: { channels: 2, channelType: "uint" },
  rg32sint: { channels: 2, channelType: "sint" },
  rg32float: { channels: 2, channelType: "float" },
  rgba32uint: { channels: 4, channelType: "uint" },
  rgba32sint: { channels: 4, channelType: "sint" },
  rgba32float: { channels: 4, channelType: "float" },
  // packed (channels share one 32-bit word; decoded by bit-field)
  rgb10a2unorm: { channels: 4, channelType: "unorm", packed: "rgb10a2unorm" },
  rg11b10ufloat: { channels: 3, channelType: "ufloat", packed: "rg11b10ufloat" }
};
function formatInfo(format) {
  if (format === void 0) return void 0;
  return FORMAT_INFO[format];
}
function projectTextureExtent(size) {
  if (typeof size === "number") return { width: size, height: 1, layerCount: 1 };
  if (Array.isArray(size)) {
    const width = typeof size[0] === "number" ? size[0] : 1;
    const height = typeof size[1] === "number" ? size[1] : width;
    const layerCount = typeof size[2] === "number" ? size[2] : 1;
    return { width, height, layerCount };
  }
  if (size !== null && typeof size === "object") {
    const record = size;
    const width = typeof record.width === "number" ? record.width : 1;
    const height = typeof record.height === "number" ? record.height : width;
    const layerCount = typeof record.depthOrArrayLayers === "number" ? record.depthOrArrayLayers : 1;
    return { width, height, layerCount };
  }
  return { width: 1, height: 1, layerCount: 1 };
}
function computeTextureLayout(format, width, height, layerCount, mipLevelCount) {
  const block = textureBlockLayout(format);
  if (block === void 0) return void 0;
  const layers = Math.max(1, layerCount);
  const mips = Math.max(1, mipLevelCount);
  const slices = [];
  let offset = 0;
  for (let layer = 0; layer < layers; layer++) {
    for (let mip = 0; mip < mips; mip++) {
      const mw = Math.max(1, width >> mip);
      const mh = Math.max(1, height >> mip);
      const blockCountX = Math.ceil(mw / block.blockWidth);
      const blockCountY = Math.ceil(mh / block.blockHeight);
      const byteLength = blockCountX * blockCountY * block.bytesPerBlock;
      slices.push({ layer, mip, width: mw, height: mh, byteOffset: offset, byteLength });
      offset += byteLength;
    }
  }
  return {
    blockWidth: block.blockWidth,
    blockHeight: block.blockHeight,
    bytesPerBlock: block.bytesPerBlock,
    layerCount: layers,
    mipLevelCount: mips,
    slices,
    totalBytes: offset
  };
}

// src/frame-model.ts
function jsonValue(value) {
  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean")
    return value;
  if (value === void 0) return null;
  if (Array.isArray(value)) return value.map(jsonValue);
  if (ArrayBuffer.isView(value))
    return Array.from(value, jsonValue);
  if (typeof value === "object") {
    const output = {};
    for (const [key, child] of Object.entries(value)) {
      if (child !== void 0) output[key] = jsonValue(child);
    }
    return output;
  }
  return String(value);
}
function eventDescriptor(event) {
  return jsonValue(event);
}
function workPipeline(pipelineId, pipelineEvents, shaderEvents) {
  if (pipelineId === void 0)
    return { status: "unavailable", shaders: [], reason: "pipeline-not-bound" };
  const event = pipelineEvents.get(pipelineId);
  if (event === void 0)
    return { status: "unavailable", shaders: [], reason: "descriptor-unavailable" };
  const shaders = [];
  const shaderRefs = event.kind === "createRenderPipeline" ? [
    ["vertex", event.vertexShaderModuleHandleId, event.desc.vertex?.entryPoint],
    ["fragment", event.fragmentShaderModuleHandleId, event.desc.fragment?.entryPoint]
  ] : event.kind === "createComputePipeline" ? [["compute", event.computeShaderModuleHandleId, event.desc.compute.entryPoint]] : [];
  for (const [stage, moduleId, entryPoint] of shaderRefs) {
    if (typeof moduleId !== "string") continue;
    const shader = shaderEvents.get(moduleId);
    shaders.push({
      stage,
      moduleHandleId: moduleId,
      entryPoint: typeof entryPoint === "string" ? entryPoint : null,
      source: shader?.kind === "createShaderModule" ? shader.wgslCode : null
    });
  }
  return {
    status: "available",
    pipelineHandleId: pipelineId,
    kind: event.kind === "createRenderPipeline" ? "render" : "compute",
    descriptor: eventDescriptor(event),
    shaders
  };
}
function buildFrameModel(tape) {
  const index = buildTapeIndex(tape);
  const events = tape.events;
  const passCommandIndices = index.passes.map(() => []);
  const commands = [];
  const groupPath = [];
  const currentPassByEvent = index.passIndexByEvent;
  const passAttachmentByIndex = /* @__PURE__ */ new Map();
  for (const pass of index.passes) {
    passAttachmentByIndex.set(pass.passIndex, {
      passIndex: pass.passIndex,
      kind: pass.kind,
      beginEventIndex: pass.beginEventIndex,
      endEventIndex: pass.endEventIndex ?? null,
      workIndices: pass.workIndices,
      commandIndices: [],
      colorAttachmentViewHandleIds: [],
      depthStencilViewHandleId: null
    });
    const begin = events[pass.beginEventIndex];
    if (begin?.kind === "beginRenderPass") {
      const attachment = passAttachmentByIndex.get(pass.passIndex);
      if (attachment !== void 0) {
        attachment.colorAttachmentViewHandleIds = begin.colorAttachmentViewHandleIds.filter(
          (id) => typeof id === "string"
        );
        attachment.depthStencilViewHandleId = begin.depthStencilViewHandleId ?? null;
      }
    }
  }
  for (const [eventIndex, event] of events.entries()) {
    const passIndex = currentPassByEvent[eventIndex] ?? -1;
    const isPush = event.kind === "pushDebugGroup" || event.kind === "passPushDebugGroup";
    const isPop = event.kind === "popDebugGroup" || event.kind === "passPopDebugGroup";
    const group = isPush ? [...groupPath, event.groupLabel] : [...groupPath];
    const marker = event.kind === "insertDebugMarker" || event.kind === "passInsertDebugMarker" ? event.markerLabel : void 0;
    const commandIndex = commands.length;
    commands.push({
      eventIndex,
      passIndex,
      kind: event.kind,
      category: EVENT_SEMANTICS[event.kind].category,
      isWork: isWorkEvent(event.kind),
      params: eventDescriptor(event),
      group,
      ...marker === void 0 ? {} : { marker }
    });
    if (passIndex >= 0) passCommandIndices[passIndex]?.push(commandIndex);
    if (isPush) groupPath.push(event.groupLabel);
    if (isPop) groupPath.pop();
  }
  const pipelineEvents = /* @__PURE__ */ new Map();
  const shaderEvents = /* @__PURE__ */ new Map();
  const bindGroups = /* @__PURE__ */ new Map();
  const resourceRecords = /* @__PURE__ */ new Map();
  const workByEvent = /* @__PURE__ */ new Map();
  for (const work of index.works) workByEvent.set(work.eventIndex, work.workIndex);
  for (const bootstrap of tape.bootstrap) {
    const create = bootstrap.create;
    if (create.kind === "createRenderPipeline" || create.kind === "createComputePipeline")
      pipelineEvents.set(create.handleId, create);
    if (create.kind === "createShaderModule") shaderEvents.set(create.handleId, create);
    if (create.kind === "createBindGroup") bindGroups.set(create.handleId, create);
    resourceRecords.set(bootstrap.handleId, {
      resourceId: bootstrap.handleId,
      kind: bootstrap.kind,
      origin: "bootstrap",
      createEventIndex: null,
      destroyEventIndex: null,
      descriptor: jsonValue(bootstrap.create),
      consumers: [],
      lifecycle: { state: "unavailable", byteEstimate: null }
    });
  }
  for (const [eventIndex, event] of events.entries()) {
    if (event.kind === "createRenderPipeline" || event.kind === "createComputePipeline")
      pipelineEvents.set(event.handleId, event);
    if (event.kind === "createShaderModule") shaderEvents.set(event.handleId, event);
    if (event.kind === "createBindGroup") bindGroups.set(event.handleId, event);
    const kind = resourceKindForEvent(event.kind);
    const handleId = kind === void 0 ? void 0 : event.kind === "createTextureView" ? event.resultHandleId : event.kind === "createCommandEncoder" ? event.cmdHandleId : "handleId" in event ? event.handleId : void 0;
    if (kind !== void 0 && handleId !== void 0) {
      resourceRecords.set(handleId, {
        resourceId: handleId,
        kind,
        origin: "frame",
        createEventIndex: eventIndex,
        destroyEventIndex: null,
        descriptor: eventDescriptor(event),
        consumers: [],
        lifecycle: { state: "unavailable", byteEstimate: null }
      });
    }
  }
  const lifecycle = buildResourceLifecycle(events);
  for (const record of lifecycle.resources) {
    const resource = resourceRecords.get(record.handleId);
    if (resource === void 0) continue;
    resourceRecords.set(record.handleId, {
      ...resource,
      destroyEventIndex: record.destroyedEventIndex ?? null,
      lifecycle: { state: record.state, byteEstimate: record.byteEstimate }
    });
  }
  for (const [eventIndex, event] of events.entries()) {
    const workIndex = workByEvent.get(eventIndex) ?? null;
    for (const resourceId of EVENT_SEMANTICS[event.kind].read(event)) {
      const resource = resourceRecords.get(resourceId);
      if (resource !== void 0)
        resource.consumers = [...resource.consumers, { eventIndex, workIndex, access: "read" }];
    }
    for (const resourceId of EVENT_SEMANTICS[event.kind].written(event)) {
      const resource = resourceRecords.get(resourceId);
      if (resource !== void 0)
        resource.consumers = [...resource.consumers, { eventIndex, workIndex, access: "write" }];
    }
  }
  const works = [];
  const currentPipeline = /* @__PURE__ */ new Map();
  const currentVertexBuffers = /* @__PURE__ */ new Map();
  const currentIndexBuffers = /* @__PURE__ */ new Map();
  const currentBindGroups = /* @__PURE__ */ new Map();
  const workByEventEntry = new Map(index.works.map((work) => [work.eventIndex, work]));
  for (const [eventIndex, event] of events.entries()) {
    if (event === void 0) continue;
    const passHandleId = "passHandleId" in event ? event.passHandleId : "";
    if (event.kind === "setPipeline" || event.kind === "setComputePipeline")
      currentPipeline.set(passHandleId, event.pipelineHandleId);
    if (event.kind === "setVertexBuffer") {
      const buffers = currentVertexBuffers.get(passHandleId) ?? /* @__PURE__ */ new Map();
      buffers.set(event.slot, {
        bufferHandleId: event.bufferHandleId,
        offset: event.offset ?? 0,
        size: event.size ?? null
      });
      currentVertexBuffers.set(passHandleId, buffers);
    }
    if (event.kind === "setIndexBuffer")
      currentIndexBuffers.set(passHandleId, {
        bufferHandleId: event.bufferHandleId,
        format: event.format,
        offset: event.offset ?? 0,
        size: event.size ?? null
      });
    if (event.kind === "setBindGroup") {
      const groups2 = currentBindGroups.get(passHandleId) ?? /* @__PURE__ */ new Map();
      groups2.set(event.index, event.bindGroupHandleId);
      currentBindGroups.set(passHandleId, groups2);
    }
    if (!isWorkEvent(event.kind)) continue;
    const work = workByEventEntry.get(eventIndex);
    if (work === void 0) continue;
    const pipelineId = currentPipeline.get(passHandleId);
    const groups = currentBindGroups.get(passHandleId) ?? /* @__PURE__ */ new Map();
    const bindings = [];
    for (const [groupIndex, bindGroupId] of groups) {
      const bindGroup = bindGroups.get(bindGroupId);
      for (const [entryIndex, resourceId] of bindGroup?.resourceHandleIds.entries() ?? []) {
        const entry = bindGroup?.entries[entryIndex];
        bindings.push({
          groupIndex,
          binding: entry?.binding ?? entryIndex,
          bindGroupId,
          resourceId: resourceId ?? null,
          resourceKind: entry?.resourceKind ?? null,
          bufferOffset: entry?.bufferOffset ?? null,
          bufferSize: entry?.bufferSize ?? null
        });
      }
    }
    const attachment = passAttachmentByIndex.get(work.passIndex);
    works.push({
      ...work,
      commandIndex: commands.findIndex((command) => command.eventIndex === work.eventIndex),
      drawCall: eventDescriptor(event),
      pipeline: workPipeline(pipelineId, pipelineEvents, shaderEvents),
      bindings,
      vertexBuffers: [...currentVertexBuffers.get(passHandleId)?.entries() ?? []].map(
        ([slot, buffer]) => ({ slot, ...buffer })
      ),
      indexBuffer: currentIndexBuffers.get(passHandleId) ?? null,
      attachments: attachment === void 0 ? null : {
        colorViewHandleIds: attachment.colorAttachmentViewHandleIds,
        depthStencilViewHandleId: attachment.depthStencilViewHandleId
      }
    });
  }
  const passes = index.passes.map((pass) => ({
    ...pass,
    endEventIndex: pass.endEventIndex ?? null,
    commandIndices: passCommandIndices[pass.passIndex] ?? [],
    colorAttachmentViewHandleIds: passAttachmentByIndex.get(pass.passIndex)?.colorAttachmentViewHandleIds ?? [],
    depthStencilViewHandleId: passAttachmentByIndex.get(pass.passIndex)?.depthStencilViewHandleId ?? null
  }));
  return {
    unseededResources: unseededResources(tape),
    commands,
    passes,
    resources: [...resourceRecords.values()],
    resourceLifecycle: lifecycle,
    works
  };
}
function asPositiveInteger(value) {
  return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : void 0;
}
function normalizeTextureSize(size) {
  if (typeof size === "number") {
    const width = asPositiveInteger(size);
    return width === void 0 ? void 0 : { width, height: 1, depthOrArrayLayers: 1 };
  }
  if (Array.isArray(size)) {
    const width = asPositiveInteger(size[0]);
    const height = asPositiveInteger(size[1] ?? 1);
    const depthOrArrayLayers = asPositiveInteger(size[2] ?? 1);
    return width === void 0 || height === void 0 || depthOrArrayLayers === void 0 ? void 0 : { width, height, depthOrArrayLayers };
  }
  if (size !== null && typeof size === "object") {
    const raw = size;
    const width = asPositiveInteger(raw.width);
    const height = asPositiveInteger(raw.height ?? 1);
    const depthOrArrayLayers = asPositiveInteger(raw.depthOrArrayLayers ?? 1);
    return width === void 0 || height === void 0 || depthOrArrayLayers === void 0 ? void 0 : { width, height, depthOrArrayLayers };
  }
  return void 0;
}
function estimateBytes(event) {
  if (event.kind === "createBuffer") {
    return { status: "known", bytes: event.desc.size, basis: "buffer-descriptor" };
  }
  if (event.kind !== "createTexture") {
    return { status: "unavailable", reason: "non-memory-resource" };
  }
  const dimension = event.desc.dimension ?? "2d";
  if (dimension === "3d") {
    return { status: "unavailable", reason: "unsupported-texture-dimension" };
  }
  const size = normalizeTextureSize(event.desc.size);
  if (size === void 0) return { status: "unavailable", reason: "invalid-texture-size" };
  const layers = dimension === "1d" ? 1 : size.depthOrArrayLayers;
  const layout = computeTextureLayout(
    event.desc.format,
    size.width,
    size.height,
    layers,
    event.desc.mipLevelCount ?? 1
  );
  if (layout === void 0) return { status: "unavailable", reason: "unsupported-texture-format" };
  return {
    status: "known",
    bytes: layout.totalBytes * (event.desc.sampleCount ?? 1),
    basis: "texture-tight-layout"
  };
}
function resourceIdentity(event) {
  switch (event.kind) {
    case "createBuffer":
      return { kind: "buffer", handleId: event.handleId };
    case "createTexture":
      return { kind: "texture", handleId: event.handleId };
    case "createTextureView":
      return { kind: "texture-view", handleId: event.resultHandleId };
    case "createSampler":
      return { kind: "sampler", handleId: event.handleId };
    case "createBindGroupLayout":
      return { kind: "bind-group-layout", handleId: event.handleId };
    case "createBindGroup":
      return { kind: "bind-group", handleId: event.handleId };
    case "createPipelineLayout":
      return { kind: "pipeline-layout", handleId: event.handleId };
    case "createRenderPipeline":
      return { kind: "render-pipeline", handleId: event.handleId };
    case "createComputePipeline":
      return { kind: "compute-pipeline", handleId: event.handleId };
    case "createShaderModule":
      return { kind: "shader-module", handleId: event.handleId };
    default:
      return void 0;
  }
}
function addBytes(bytes, estimate) {
  if (estimate.status === "known") bytes.known += estimate.bytes;
  else bytes.unavailable++;
}
function buildResourceLifecycle(events) {
  const records = /* @__PURE__ */ new Map();
  const origins = /* @__PURE__ */ new Map();
  let destroyEvents = 0;
  let unknownDestroyEvents = 0;
  for (let eventIndex = 0; eventIndex < events.length; eventIndex++) {
    const event = events[eventIndex];
    if (event === void 0) continue;
    const identity = resourceIdentity(event);
    if (identity !== void 0) {
      const origin = event.kind === "createTexture" && event.origin === "swapchain" ? "swapchain" : event.kind === "createTextureView" ? origins.get(event.sourceHandleId) ?? "engine" : "engine";
      origins.set(identity.handleId, origin);
      records.set(identity.handleId, {
        kind: identity.kind,
        origin,
        createdEventIndex: eventIndex,
        byteEstimate: estimateBytes(event)
      });
      continue;
    }
    if (event.kind !== "destroyBuffer" && event.kind !== "destroyTexture") continue;
    destroyEvents++;
    const record = records.get(event.handleId);
    const expectedKind = event.kind === "destroyBuffer" ? "buffer" : "texture";
    if (record === void 0 || record.kind !== expectedKind || record.destroyedEventIndex !== void 0) {
      unknownDestroyEvents++;
      continue;
    }
    record.destroyedEventIndex = eventIndex;
  }
  const resources = [];
  const createdBytes = { known: 0, unavailable: 0 };
  const destroyedBytes = { known: 0, unavailable: 0 };
  const liveBytes = { known: 0, unavailable: 0 };
  const originBreakdown = {
    engine: {
      created: 0,
      destroyed: 0,
      live: 0,
      knownCreated: 0,
      knownDestroyed: 0,
      knownLive: 0,
      unavailableCreated: 0,
      unavailableDestroyed: 0,
      unavailableLive: 0
    },
    swapchain: {
      created: 0,
      destroyed: 0,
      live: 0,
      knownCreated: 0,
      knownDestroyed: 0,
      knownLive: 0,
      unavailableCreated: 0,
      unavailableDestroyed: 0,
      unavailableLive: 0
    }
  };
  let destroyed = 0;
  for (const [handleId, record] of records) {
    const state = record.destroyedEventIndex === void 0 ? "live" : "destroyed";
    if (state === "destroyed") destroyed++;
    addBytes(createdBytes, record.byteEstimate);
    addBytes(state === "live" ? liveBytes : destroyedBytes, record.byteEstimate);
    const byOrigin = originBreakdown[record.origin];
    byOrigin.created++;
    if (state === "destroyed") byOrigin.destroyed++;
    else byOrigin.live++;
    if (record.byteEstimate.status === "known") {
      byOrigin.knownCreated += record.byteEstimate.bytes;
      if (state === "destroyed") byOrigin.knownDestroyed += record.byteEstimate.bytes;
      else byOrigin.knownLive += record.byteEstimate.bytes;
    } else {
      byOrigin.unavailableCreated++;
      if (state === "destroyed") byOrigin.unavailableDestroyed++;
      else byOrigin.unavailableLive++;
    }
    resources.push({
      handleId,
      kind: record.kind,
      origin: record.origin,
      state,
      createdEventIndex: record.createdEventIndex,
      ...record.destroyedEventIndex === void 0 ? {} : { destroyedEventIndex: record.destroyedEventIndex },
      byteEstimate: record.byteEstimate
    });
  }
  return {
    scope: "captured-tape-resource-closure",
    counts: {
      created: resources.length,
      destroyed,
      live: resources.length - destroyed,
      destroyEvents,
      unknownDestroyEvents
    },
    bytes: {
      knownCreated: createdBytes.known,
      knownDestroyed: destroyedBytes.known,
      knownLive: liveBytes.known,
      unavailableCreated: createdBytes.unavailable,
      unavailableDestroyed: destroyedBytes.unavailable,
      unavailableLive: liveBytes.unavailable
    },
    originBreakdown,
    availability: {
      destroy: "observed-buffer-texture",
      retire: "unavailable",
      driverAllocation: "unavailable"
    },
    resources
  };
}

// src/frame-summary.ts
function summarizeFrame(model) {
  return {
    commandCount: model.commands.length,
    passCount: model.passes.length,
    resourceCount: model.resources.length,
    unseededResources: model.unseededResources,
    works: model.works.map((work) => {
      const command = model.commands[work.commandIndex];
      return {
        workIndex: work.workIndex,
        eventIndex: work.eventIndex,
        passIndex: work.passIndex,
        kind: work.kind,
        group: command?.group ?? [],
        pipelineId: work.pipeline.pipelineHandleId ?? null,
        entryPoints: work.pipeline.shaders.map(({ stage, entryPoint }) => ({ stage, entryPoint })),
        attachments: work.attachments
      };
    })
  };
}

// src/protocol/codec.ts
var import_pako = __toESM(require_pako());

// src/protocol/types.ts
var TAPE_FORMAT_VERSION = 7;
var TAPE_MAGIC = "RHITAPE";
function validateTape(tape) {
  if (tape.header.formatVersion !== TAPE_FORMAT_VERSION)
    return err(
      createRhiDebugError("tape-invalid", { stage: "validate", cause: "format version is not 7" })
    );
  if (tape.header.eventCount !== tape.events.length || tape.header.blobCount !== tape.blobs.length)
    return err(
      createRhiDebugError("tape-invalid", {
        stage: "validate",
        cause: "header counts do not match payload counts"
      })
    );
  const declared = /* @__PURE__ */ new Set();
  for (const resource of tape.bootstrap) {
    if (declared.has(resource.handleId))
      return err(
        createRhiDebugError("tape-invalid", {
          stage: "validate",
          cause: `duplicate bootstrap handle ${resource.handleId}`
        })
      );
    if (!isResourceKind(resource.kind))
      return err(
        createRhiDebugError("tape-invalid", {
          stage: "validate",
          cause: `unknown resource kind ${resource.kind}`
        })
      );
    declared.add(resource.handleId);
  }
  const hashes = /* @__PURE__ */ new Set();
  for (const blob2 of tape.blobs) {
    if (hashes.has(blob2.hash))
      return err(
        createRhiDebugError("tape-invalid", {
          stage: "validate",
          cause: `duplicate blob hash ${blob2.hash}`
        })
      );
    hashes.add(blob2.hash);
  }
  for (let eventIndex = 0; eventIndex < tape.events.length; eventIndex++) {
    const event = tape.events[eventIndex];
    if (!event || !eventKinds.includes(event.kind))
      return err(
        createRhiDebugError("tape-invalid", {
          stage: "validate",
          cause: `unknown event kind at ${eventIndex}`
        })
      );
    const semantics = eventResources(event);
    for (const created of semantics.created) {
      if (declared.has(created))
        return err(
          createRhiDebugError("tape-invalid", {
            stage: "validate",
            cause: `duplicate handle ${created}`
          })
        );
      declared.add(created);
    }
    for (const read of semantics.reads) {
      if (!declared.has(read))
        return err(
          createRhiDebugError("tape-invalid", {
            stage: "validate",
            cause: `create-before-use violated for ${read} at ${eventIndex}`
          })
        );
    }
    for (const destroyed of semantics.destroyed) {
      if (!declared.has(destroyed))
        return err(
          createRhiDebugError("tape-invalid", {
            stage: "validate",
            cause: `destroy-before-use violated for ${destroyed} at ${eventIndex}`
          })
        );
      declared.delete(destroyed);
    }
  }
  return ok(tape);
}
function isResourceKind(value) {
  return [
    "buffer",
    "texture",
    "query-set",
    "texture-view",
    "sampler",
    "shader-module",
    "pipeline",
    "binding",
    "encoder"
  ].includes(value);
}
function eventResources(event) {
  switch (event.kind) {
    case "createBuffer":
    case "createTexture":
    case "createQuerySet":
    case "createSampler":
    case "createBindGroupLayout":
    case "getBindGroupLayout":
    case "createBindGroup":
    case "createPipelineLayout":
    case "createRenderPipeline":
    case "createComputePipeline":
    case "createShaderModule":
      return {
        created: [event.handleId],
        reads: handleRefs(event, [
          "layoutHandleId",
          "pipelineHandleId",
          "vertexShaderModuleHandleId",
          "fragmentShaderModuleHandleId",
          "computeShaderModuleHandleId"
        ]),
        destroyed: []
      };
    case "createTextureView":
      return { created: [event.resultHandleId], reads: [event.sourceHandleId], destroyed: [] };
    case "createCommandEncoder":
      return { created: [event.cmdHandleId], reads: [], destroyed: [] };
    case "destroyBuffer":
    case "destroyTexture":
    case "destroyQuerySet":
      return { created: [], reads: [event.handleId], destroyed: [event.handleId] };
    case "writeBuffer":
    case "writeTexture":
      return { created: [], reads: handleRefs(event, ["handleId", "destination"]), destroyed: [] };
    case "copyBufferToBuffer":
    case "copyBufferToTexture":
    case "copyTextureToBuffer":
    case "copyTextureToTexture":
    case "clearBuffer":
      return {
        created: [],
        reads: handleRefs(event, [
          "source",
          "destination",
          "sourceHandleId",
          "destinationHandleId",
          "bufferHandleId",
          "textureHandleId"
        ]),
        destroyed: []
      };
    case "resolveQuerySet":
      return {
        created: [],
        reads: handleRefs(event, ["cmdHandleId", "querySetHandleId", "destinationHandleId"]),
        destroyed: []
      };
    case "beginRenderPass":
      return {
        created: [event.passHandleId],
        reads: handleRefs(event, [
          "cmdHandleId",
          "occlusionQuerySetHandleId",
          "timestampQuerySetHandleId",
          "colorAttachmentViewHandleIds",
          "colorAttachmentResolveTargetHandleIds",
          "depthStencilViewHandleId"
        ]),
        destroyed: []
      };
    case "beginComputePass":
      return {
        created: [event.passHandleId],
        reads: handleRefs(event, ["cmdHandleId", "timestampQuerySetHandleId"]),
        destroyed: []
      };
    case "endRenderPass":
    case "endComputePass":
      return { created: [], reads: [event.passHandleId], destroyed: [event.passHandleId] };
    case "beginOcclusionQuery":
    case "endOcclusionQuery":
      return { created: [], reads: handleRefs(event, ["passHandleId"]), destroyed: [] };
    default:
      return { created: [], reads: [], destroyed: [] };
  }
}
function handleRefs(event, keys) {
  const refs = [];
  for (const key of keys) {
    const value = event[key];
    if (typeof value === "string") refs.push(value);
    if (Array.isArray(value))
      refs.push(...value.filter((item) => typeof item === "string"));
  }
  return refs;
}

// src/protocol/codec.ts
var MAGIC_BYTES = new TextEncoder().encode(TAPE_MAGIC);
var HEADER_BYTES = MAGIC_BYTES.byteLength + 12;
function encodeTape(tape, options = {}) {
  const validation = validateTape(tape);
  if (!validation.ok) return validation;
  const compression = options.compression ?? tape.blobs[0]?.compression ?? "none";
  const payloads = [];
  const blobs = [];
  let offset = 0;
  for (const blob2 of tape.blobs) {
    const raw = new Uint8Array(blob2.bytes);
    const payload = compression === "gzip" ? import_pako.default.gzip(raw) : raw;
    payloads.push(payload);
    blobs.push({
      hash: blob2.hash,
      offset,
      length: payload.byteLength,
      compression,
      digest: digestBytes(payload)
    });
    offset += payload.byteLength;
  }
  const wire = {
    header: { ...tape.header, blobCount: blobs.length },
    bootstrap: tape.bootstrap,
    events: tape.events,
    blobs
  };
  const json = canonicalJson(wire);
  const jsonBytes = new TextEncoder().encode(json);
  const output = new Uint8Array(HEADER_BYTES + jsonBytes.byteLength + offset);
  output.set(MAGIC_BYTES, 0);
  const view = new DataView(output.buffer);
  view.setUint32(MAGIC_BYTES.byteLength, TAPE_FORMAT_VERSION, true);
  view.setUint32(MAGIC_BYTES.byteLength + 4, jsonBytes.byteLength, true);
  view.setUint32(MAGIC_BYTES.byteLength + 8, offset, true);
  output.set(jsonBytes, HEADER_BYTES);
  let cursor = HEADER_BYTES + jsonBytes.byteLength;
  for (const payload of payloads) {
    output.set(payload, cursor);
    cursor += payload.byteLength;
  }
  return ok(output);
}
function decodeTape(bytes) {
  const legacy = decodeLegacyVersion(bytes);
  if (legacy !== void 0)
    return err(
      createRhiDebugError("tape-version-unsupported", { foundVersion: legacy, expectedVersion: 7 })
    );
  if (bytes.byteLength < HEADER_BYTES)
    return err(
      createRhiDebugError("tape-invalid", { stage: "decode", cause: "container is truncated" })
    );
  for (let i = 0; i < MAGIC_BYTES.byteLength; i++) {
    if (bytes[i] !== MAGIC_BYTES[i])
      return err(
        createRhiDebugError("tape-invalid", {
          stage: "decode",
          cause: "magic does not match RHITAPE"
        })
      );
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const version = view.getUint32(MAGIC_BYTES.byteLength, true);
  if (version !== TAPE_FORMAT_VERSION)
    return err(
      createRhiDebugError("tape-version-unsupported", {
        foundVersion: version,
        expectedVersion: 7
      })
    );
  const jsonLength = view.getUint32(MAGIC_BYTES.byteLength + 4, true);
  const payloadLength = view.getUint32(MAGIC_BYTES.byteLength + 8, true);
  const payloadStart = HEADER_BYTES + jsonLength;
  if (payloadStart > bytes.byteLength || payloadStart + payloadLength !== bytes.byteLength) {
    return err(
      createRhiDebugError("tape-invalid", {
        stage: "decode",
        cause: "container length is out of bounds"
      })
    );
  }
  let wire;
  try {
    wire = JSON.parse(
      new TextDecoder().decode(bytes.subarray(HEADER_BYTES, payloadStart))
    );
  } catch {
    return err(
      createRhiDebugError("tape-invalid", { stage: "decode", cause: "canonical JSON is invalid" })
    );
  }
  if (wire.header?.formatVersion !== TAPE_FORMAT_VERSION || !Array.isArray(wire.events) || !Array.isArray(wire.blobs)) {
    return err(
      createRhiDebugError("tape-invalid", {
        stage: "validate",
        cause: "required v7 fields are missing"
      })
    );
  }
  const payload = bytes.subarray(payloadStart);
  const decodedBlobs = [];
  for (const blob2 of wire.blobs) {
    if (!Number.isInteger(blob2.offset) || !Number.isInteger(blob2.length) || blob2.offset < 0 || blob2.length < 0 || blob2.offset + blob2.length > payload.byteLength) {
      return err(
        createRhiDebugError("tape-invalid", {
          stage: "validate",
          cause: "blob table entry is out of bounds"
        })
      );
    }
    const stored = payload.slice(blob2.offset, blob2.offset + blob2.length);
    if (digestBytes(stored) !== blob2.digest)
      return err(
        createRhiDebugError("tape-invalid", {
          stage: "validate",
          cause: `blob digest mismatch for ${blob2.hash}`
        })
      );
    let raw;
    try {
      raw = blob2.compression === "gzip" ? new Uint8Array(import_pako.default.ungzip(stored)) : stored;
    } catch {
      return err(
        createRhiDebugError("tape-invalid", {
          stage: "decode",
          cause: `blob decompression failed for ${blob2.hash}`
        })
      );
    }
    decodedBlobs.push({ hash: blob2.hash, bytes: raw, compression: blob2.compression });
  }
  const tape = {
    header: { ...wire.header, formatVersion: TAPE_FORMAT_VERSION, blobCount: decodedBlobs.length },
    bootstrap: wire.bootstrap ?? [],
    events: wire.events,
    blobs: decodedBlobs
  };
  const validation = validateTape(tape);
  if (!validation.ok) return validation;
  return ok(tape);
}
function decodeLegacyVersion(bytes) {
  if (bytes.length === 0 || bytes[0] !== 123) return void 0;
  try {
    const parsed = JSON.parse(new TextDecoder().decode(bytes));
    return typeof parsed.formatVersion === "number" && parsed.formatVersion !== 7 ? parsed.formatVersion : void 0;
  } catch {
    return void 0;
  }
}
function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const object = value;
  return `{${Object.keys(object).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(object[key])}`).join(",")}}`;
}
function digestBytes(bytes) {
  return `sha256:${bytesToHex(sha256(bytes))}`;
}
var COPY_DST_MAP_READ = 9;
var TEXTURE_READBACK_USAGE = COPY_DST_MAP_READ;
async function readbackTexturePixels(device, texture, texWidth, texHeight, opts) {
  const bytesPerBlock = opts?.bytesPerBlock ?? opts?.bytesPerTexel ?? 4;
  const blockWidth = opts?.blockWidth ?? 1;
  const blockHeight = opts?.blockHeight ?? 1;
  const blockCountX = Math.ceil(texWidth / blockWidth);
  const blockCountY = Math.ceil(texHeight / blockHeight);
  const copyWidth = blockCountX * blockWidth;
  const copyHeight = blockCountY * blockHeight;
  const mipLevel = opts?.mipLevel ?? 0;
  const baseArrayLayer = opts?.baseArrayLayer ?? 0;
  const aspect = opts?.aspect;
  const rowBytes = blockCountX * bytesPerBlock;
  const alignedRowBytes = Math.ceil(rowBytes / 256) * 256;
  const bufferSize = alignedRowBytes * blockCountY;
  const readbackBufferResult = device.createBuffer({
    size: bufferSize,
    usage: COPY_DST_MAP_READ
  });
  if (!readbackBufferResult.ok) {
    throw new Error(`createBuffer for readback failed: ${readbackBufferResult.error.code}`);
  }
  const readbackBuffer = readbackBufferResult.value;
  const encoderResult = device.createCommandEncoder({});
  if (!encoderResult.ok) {
    device.destroyBuffer(readbackBuffer);
    throw new Error(`createCommandEncoder for readback failed: ${encoderResult.error.code}`);
  }
  const encoder = encoderResult.value;
  try {
    encoder.copyTextureToBuffer(
      {
        texture,
        mipLevel,
        origin: { x: 0, y: 0, z: baseArrayLayer },
        // aspect selects depth vs stencil plane on combined depth-stencil
        // textures. stencil-only IS copyable on depth24plus-stencil8 (the
        // depth plane is not). Omitted -> backend default ('all').
        ...aspect !== void 0 ? { aspect } : {}
      },
      {
        buffer: readbackBuffer,
        offset: 0,
        bytesPerRow: alignedRowBytes,
        rowsPerImage: blockCountY
      },
      { width: copyWidth, height: copyHeight, depthOrArrayLayers: 1 }
    );
  } catch {
    device.destroyBuffer(readbackBuffer);
    throw new Error("copyTextureToBuffer failed");
  }
  const finishResult = encoder.finish();
  if (!finishResult.ok) {
    device.destroyBuffer(readbackBuffer);
    throw new Error(`encoder.finish failed: ${finishResult.error.code}`);
  }
  const queue = device.queue;
  queue.submit([finishResult.value]);
  await queue.onSubmittedWorkDone();
  const buffer = readbackBuffer;
  const mapResult = await buffer.mapAsync(1);
  if (!mapResult.ok) {
    device.destroyBuffer(readbackBuffer);
    throw new Error(`mapAsync(READ) failed: ${mapResult.error.code}`);
  }
  const mapped = mapResult.value;
  const rangeResult = mapped.getMappedRange();
  if (!rangeResult.ok) {
    mapped.unmap();
    device.destroyBuffer(readbackBuffer);
    throw new Error(`getMappedRange failed: ${rangeResult.error.code}`);
  }
  const fullPixels = new Uint8Array(rangeResult.value);
  const tightPixels = new Uint8Array(blockCountX * blockCountY * bytesPerBlock);
  for (let y = 0; y < blockCountY; y++) {
    const srcOffset = y * alignedRowBytes;
    const dstOffset = y * rowBytes;
    for (let x = 0; x < rowBytes; x++) {
      tightPixels[dstOffset + x] = fullPixels[srcOffset + x] ?? 0;
    }
  }
  mapped.unmap();
  device.destroyBuffer(readbackBuffer);
  return tightPixels;
}
async function readbackBufferBytes(device, buffer, size) {
  const fail = (phase, cause) => err(createRhiDebugError("readback-failed", { stage: "readback", phase, cause }));
  const readbackBufferResult = device.createBuffer({ size, usage: COPY_DST_MAP_READ });
  if (!readbackBufferResult.ok) {
    return fail("copy", `staging buffer creation failed: ${readbackBufferResult.error.code}`);
  }
  const readbackBuffer = readbackBufferResult.value;
  const encoderResult = device.createCommandEncoder({});
  if (!encoderResult.ok) {
    device.destroyBuffer(readbackBuffer);
    return fail("copy", `command encoder creation failed: ${encoderResult.error.code}`);
  }
  const encoder = encoderResult.value;
  try {
    encoder.copyBufferToBuffer(buffer, 0, readbackBuffer, 0, size);
  } catch (e) {
    device.destroyBuffer(readbackBuffer);
    return fail("copy", `copyBufferToBuffer failed: ${String(e)}`);
  }
  const finishResult = encoder.finish();
  if (!finishResult.ok) {
    device.destroyBuffer(readbackBuffer);
    return fail("copy", `encoder.finish failed: ${finishResult.error.code}`);
  }
  const queue = device.queue;
  queue.submit([finishResult.value]);
  await queue.onSubmittedWorkDone();
  const stagingBuffer = readbackBuffer;
  const mapResult = await stagingBuffer.mapAsync(1);
  if (!mapResult.ok) {
    device.destroyBuffer(readbackBuffer);
    return fail("map", `mapAsync(READ) failed: ${mapResult.error.code}`);
  }
  const mapped = mapResult.value;
  const rangeResult = mapped.getMappedRange();
  if (!rangeResult.ok) {
    mapped.unmap();
    device.destroyBuffer(readbackBuffer);
    return fail("map", `getMappedRange failed: ${rangeResult.error.code}`);
  }
  const bytes = new Uint8Array(rangeResult.value).slice();
  mapped.unmap();
  device.destroyBuffer(readbackBuffer);
  return ok(bytes.buffer);
}
async function raceCancellation(work, isCancelled) {
  if (isCancelled === void 0) return { cancelled: false, value: await work };
  if (isCancelled()) return { cancelled: true };
  let timer;
  const cancelled = new Promise((resolve) => {
    timer = setInterval(() => {
      if (isCancelled()) resolve({ cancelled: true });
    }, 1);
  });
  try {
    return await Promise.race([
      work.then((value) => ({ cancelled: false, value })),
      cancelled
    ]);
  } finally {
    if (timer !== void 0) clearInterval(timer);
  }
}
async function readbackBufferBytesBatch(device, requests, callbacks = {}) {
  if (requests.length === 0) return ok(/* @__PURE__ */ new Map());
  const firstRequest = requests[0];
  if (firstRequest === void 0) return ok(/* @__PURE__ */ new Map());
  const fail = (handleId, phase, cause) => err(
    createRhiDebugError("readback-failed", {
      stage: "readback",
      phase,
      cause: `${handleId}: ${cause}`
    })
  );
  const staging = [];
  const mapped = /* @__PURE__ */ new Map();
  const cleaned = /* @__PURE__ */ new Set();
  const cleanup = () => {
    for (const mappedBuffer of mapped.values()) mappedBuffer.unmap();
    for (const item of staging) {
      if (!cleaned.has(item.buffer)) {
        device.destroyBuffer(item.buffer);
        cleaned.add(item.buffer);
      }
    }
  };
  let encoder;
  try {
    const encoderResult = device.createCommandEncoder({});
    if (!encoderResult.ok)
      return fail(
        firstRequest.handleId,
        "copy",
        `command encoder creation failed: ${encoderResult.error.code}`
      );
    encoder = encoderResult.value;
    for (const request of requests) {
      const stagingResult = device.createBuffer({ size: request.size, usage: COPY_DST_MAP_READ });
      if (!stagingResult.ok) {
        cleanup();
        return fail(
          request.handleId,
          "copy",
          `staging buffer creation failed: ${stagingResult.error.code}`
        );
      }
      const stagingBuffer = stagingResult.value;
      staging.push({ request, buffer: stagingBuffer });
      try {
        encoder.copyBufferToBuffer(request.buffer, 0, stagingBuffer, 0, request.size);
      } catch (error) {
        cleanup();
        return fail(request.handleId, "copy", `copyBufferToBuffer failed: ${String(error)}`);
      }
    }
    const finishResult = encoder.finish();
    if (!finishResult.ok) {
      cleanup();
      return fail(
        firstRequest.handleId,
        "copy",
        `encoder.finish failed: ${finishResult.error.code}`
      );
    }
    device.queue.submit([finishResult.value]);
    await device.queue.onSubmittedWorkDone();
    const mapResultsPromise = Promise.all(
      staging.map(async (item) => {
        callbacks.onResourceStart?.(item.request.handleId);
        try {
          const result2 = await item.buffer.mapAsync(1);
          if (result2.ok) {
            if (callbacks.isCancelled?.()) result2.value.unmap();
            else mapped.set(item.buffer, result2.value);
          }
          return { item, result: result2 };
        } catch (error) {
          return { item, error };
        }
      })
    );
    const mapResults = await raceCancellation(mapResultsPromise, callbacks.isCancelled);
    if (mapResults.cancelled) {
      cleanup();
      return fail(
        firstRequest.handleId,
        "map",
        "buffer batch readback cancelled after the snapshot generation was invalidated"
      );
    }
    const result = /* @__PURE__ */ new Map();
    for (const mappedResult of mapResults.value) {
      if ("error" in mappedResult) {
        cleanup();
        return fail(
          mappedResult.item.request.handleId,
          "map",
          `mapAsync(READ) failed: ${String(mappedResult.error)}`
        );
      }
      if (!mappedResult.result.ok) {
        cleanup();
        return fail(
          mappedResult.item.request.handleId,
          "map",
          `mapAsync(READ) failed: ${mappedResult.result.error.code}`
        );
      }
      const mappedBuffer = mappedResult.result.value;
      const item = mappedResult.item;
      const rangeResult = mappedBuffer.getMappedRange();
      if (!rangeResult.ok) {
        cleanup();
        return fail(
          item.request.handleId,
          "map",
          `getMappedRange failed: ${rangeResult.error.code}`
        );
      }
      result.set(
        item.request.handleId,
        new Uint8Array(rangeResult.value).slice().buffer
      );
      mappedBuffer.unmap();
      mapped.delete(item.buffer);
      device.destroyBuffer(item.buffer);
      cleaned.add(item.buffer);
      callbacks.onResourceComplete?.(item.request.handleId);
    }
    return ok(result);
  } catch (error) {
    cleanup();
    return fail(firstRequest.handleId, "map", `buffer batch readback failed: ${String(error)}`);
  }
}
async function readbackTexturePixelsBatch(device, requests, callbacks = {}) {
  if (requests.length === 0) return ok(/* @__PURE__ */ new Map());
  const firstRequest = requests[0];
  if (firstRequest === void 0) return ok(/* @__PURE__ */ new Map());
  const fail = (handleId, phase, cause) => err(
    createRhiDebugError("readback-failed", {
      stage: "readback",
      phase,
      cause: `${handleId}: ${cause}`
    })
  );
  const staging = [];
  const mapped = /* @__PURE__ */ new Map();
  const cleaned = /* @__PURE__ */ new Set();
  const cleanup = () => {
    for (const mappedBuffer of mapped.values()) mappedBuffer.unmap();
    for (const item of staging) {
      if (!cleaned.has(item.buffer)) {
        device.destroyBuffer(item.buffer);
        cleaned.add(item.buffer);
      }
    }
  };
  let encoder;
  try {
    const encoderResult = device.createCommandEncoder({});
    if (!encoderResult.ok)
      return fail(
        firstRequest.handleId,
        "copy",
        `command encoder creation failed: ${encoderResult.error.code}`
      );
    encoder = encoderResult.value;
    for (const request of requests) {
      for (const slice of request.slices) {
        const blockCountX = Math.ceil(slice.width / request.blockWidth);
        const blockCountY = Math.ceil(slice.height / request.blockHeight);
        const rowBytes = blockCountX * request.bytesPerBlock;
        const alignedRowBytes = Math.ceil(rowBytes / 256) * 256;
        const stagingResult = device.createBuffer({
          size: alignedRowBytes * blockCountY,
          usage: TEXTURE_READBACK_USAGE
        });
        if (!stagingResult.ok) {
          cleanup();
          return fail(
            request.handleId,
            "copy",
            `staging buffer creation failed: ${stagingResult.error.code}`
          );
        }
        const stagingBuffer = stagingResult.value;
        staging.push({
          request,
          slice,
          buffer: stagingBuffer,
          bytesPerBlock: request.bytesPerBlock,
          blockWidth: request.blockWidth,
          blockHeight: request.blockHeight
        });
        try {
          encoder.copyTextureToBuffer(
            {
              texture: request.texture,
              ...request.aspect === void 0 ? {} : { aspect: request.aspect },
              mipLevel: slice.mip,
              origin: { x: 0, y: 0, z: slice.layer }
            },
            {
              buffer: stagingBuffer,
              offset: 0,
              bytesPerRow: alignedRowBytes,
              rowsPerImage: blockCountY
            },
            {
              width: blockCountX * request.blockWidth,
              height: blockCountY * request.blockHeight,
              depthOrArrayLayers: 1
            }
          );
        } catch (error) {
          cleanup();
          return fail(request.handleId, "copy", `copyTextureToBuffer failed: ${String(error)}`);
        }
      }
    }
    const finishResult = encoder.finish();
    if (!finishResult.ok) {
      cleanup();
      return fail(
        firstRequest.handleId,
        "copy",
        `encoder.finish failed: ${finishResult.error.code}`
      );
    }
    device.queue.submit([finishResult.value]);
    const drain = raceCancellation(device.queue.onSubmittedWorkDone(), callbacks.isCancelled);
    const drainResult = await drain;
    if (drainResult.cancelled) {
      cleanup();
      return fail(
        firstRequest.handleId,
        "map",
        "texture batch readback cancelled after the snapshot generation was invalidated"
      );
    }
    for (const request of requests) callbacks.onResourceStart?.(request.handleId);
    const mapResultsPromise = Promise.all(
      staging.map(async (item) => {
        try {
          const result2 = await item.buffer.mapAsync(1);
          if (result2.ok) {
            if (callbacks.isCancelled?.()) result2.value.unmap();
            else mapped.set(item.buffer, result2.value);
          }
          return { item, result: result2 };
        } catch (error) {
          return { item, error };
        }
      })
    );
    const mapResults = await raceCancellation(mapResultsPromise, callbacks.isCancelled);
    if (mapResults.cancelled) {
      cleanup();
      return fail(
        firstRequest.handleId,
        "map",
        "texture batch readback cancelled after the snapshot generation was invalidated"
      );
    }
    const bytesByHandle = /* @__PURE__ */ new Map();
    for (const request of requests)
      bytesByHandle.set(request.handleId, new Uint8Array(request.totalBytes));
    for (const mappedResult of mapResults.value) {
      if ("error" in mappedResult) {
        cleanup();
        return fail(
          mappedResult.item.request.handleId,
          "map",
          `mapAsync(READ) failed: ${String(mappedResult.error)}`
        );
      }
      if (!mappedResult.result.ok) {
        cleanup();
        return fail(
          mappedResult.item.request.handleId,
          "map",
          `mapAsync(READ) failed: ${mappedResult.result.error.code}`
        );
      }
      const item = mappedResult.item;
      const mappedBuffer = mappedResult.result.value;
      const rangeResult = mappedBuffer.getMappedRange();
      if (!rangeResult.ok) {
        cleanup();
        return fail(
          item.request.handleId,
          "map",
          `getMappedRange failed: ${rangeResult.error.code}`
        );
      }
      const fullBytes = new Uint8Array(rangeResult.value);
      const blockCountX = Math.ceil(item.slice.width / item.blockWidth);
      const blockCountY = Math.ceil(item.slice.height / item.blockHeight);
      const rowBytes = blockCountX * item.bytesPerBlock;
      const alignedRowBytes = Math.ceil(rowBytes / 256) * 256;
      const output = bytesByHandle.get(item.request.handleId);
      if (output === void 0) {
        cleanup();
        return fail(item.request.handleId, "map", "texture batch returned an unknown handle");
      }
      for (let y = 0; y < blockCountY; y++) {
        const srcOffset = y * alignedRowBytes;
        const dstOffset = item.slice.byteOffset + y * rowBytes;
        for (let x = 0; x < rowBytes; x++) output[dstOffset + x] = fullBytes[srcOffset + x] ?? 0;
      }
      mappedBuffer.unmap();
      mapped.delete(item.buffer);
      device.destroyBuffer(item.buffer);
      cleaned.add(item.buffer);
    }
    const result = /* @__PURE__ */ new Map();
    for (const request of requests) {
      const bytes = bytesByHandle.get(request.handleId);
      if (bytes === void 0) {
        cleanup();
        return fail(request.handleId, "map", "texture batch returned no bytes for a live texture");
      }
      result.set(request.handleId, bytes.buffer);
      callbacks.onResourceComplete?.(request.handleId);
    }
    return ok(result);
  } catch (error) {
    cleanup();
    return fail(firstRequest.handleId, "map", `texture batch readback failed: ${String(error)}`);
  }
}
function assembleTape(recorder) {
  const legacy = recorder.getTape();
  if (legacy === void 0) {
    return err(
      createRhiDebugError("capture-snapshot-failed", {
        stage: "snapshot",
        cause: "the recorder finalized without a frame event"
      })
    );
  }
  if ("code" in legacy) {
    return err(legacy);
  }
  const tape = toV7Tape(legacy, new Set(recorder.bootstrapEvents()));
  const encoded = encodeTape(tape);
  if (!encoded.ok) return err(encoded.error);
  return ok({
    bytes: encoded.value,
    digest: digestBytes(encoded.value),
    tape
  });
}
function toV7Tape(legacy, bootstrapEvents) {
  const firstFrame = legacy.events.findIndex((event) => event.kind === "frameMark");
  const boundary = firstFrame < 0 ? legacy.events.length : firstFrame;
  const bootstrap = [];
  const bootstrapIds = /* @__PURE__ */ new Set();
  const initialData = /* @__PURE__ */ new Map();
  for (const event of legacy.events.slice(0, boundary)) {
    if (event.kind === "initialData") {
      const hashes = initialData.get(event.handleId) ?? [];
      hashes.push(event.dataHash);
      initialData.set(event.handleId, hashes);
      continue;
    }
    if (!bootstrapEvents.has(event)) continue;
    const handleId = createdHandleId(event);
    const kind = resourceKind(event);
    if (handleId === void 0 || kind === void 0 || bootstrapIds.has(handleId)) continue;
    bootstrapIds.add(handleId);
    bootstrap.push({
      handleId,
      kind,
      create: toJsonRecord(event),
      initialData: []
    });
  }
  const allBlobs = Array.from(legacy.blobPool, ([hash, data]) => ({
    hash,
    bytes: new Uint8Array(data),
    compression: "none"
  }));
  const referenced = collectReferencedHandleIds(legacy.events, bootstrapEvents);
  const closure = collectBootstrapClosure(referenced, bootstrap);
  const keptBootstrap = bootstrap.filter((resource) => closure.has(resource.handleId)).map((resource) => {
    const hashes = initialData.get(resource.handleId) ?? [];
    const slices = hashes.flatMap((hash) => {
      const blob2 = legacy.blobPool.get(hash);
      return blob2 === void 0 ? [] : [{ hash, byteOffset: 0, byteLength: blob2.byteLength }];
    });
    return { ...resource, initialData: slices };
  });
  const events = legacy.events.filter((event) => event.kind !== "initialData" && !bootstrapEvents.has(event)).map(toJsonSafe);
  const keptHashes = new Set(
    keptBootstrap.flatMap((resource) => resource.initialData.map((slice) => slice.hash))
  );
  for (const event of events) {
    if ("dataHash" in event && typeof event.dataHash === "string") keptHashes.add(event.dataHash);
  }
  const blobs = allBlobs.filter((blob2) => keptHashes.has(blob2.hash));
  return {
    header: {
      formatVersion: 7,
      rhiCaps: { ...legacy.rhiCapsRecorded },
      eventCount: events.length,
      blobCount: blobs.length
    },
    bootstrap: keptBootstrap,
    events,
    blobs
  };
}
function collectReferencedHandleIds(events, bootstrapEvents) {
  const ids = /* @__PURE__ */ new Set();
  for (const event of events) {
    if (event.kind === "initialData" || bootstrapEvents.has(event)) continue;
    collectHandleStrings(event, ids);
  }
  return ids;
}
function collectHandleStrings(value, ids) {
  if (typeof value === "string" && /^[a-zA-Z][a-zA-Z-]*:\S+$/.test(value)) {
    ids.add(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const entry of value) collectHandleStrings(entry, ids);
    return;
  }
  if (value !== null && typeof value === "object") {
    for (const entry of Object.values(value)) collectHandleStrings(entry, ids);
  }
}
function collectBootstrapClosure(referenced, resources) {
  const byId = new Map(resources.map((resource) => [resource.handleId, resource]));
  const closure = /* @__PURE__ */ new Set();
  const pending = [...referenced];
  while (pending.length > 0) {
    const handleId = pending.pop();
    if (handleId === void 0 || closure.has(handleId)) continue;
    const resource = byId.get(handleId);
    if (resource === void 0) continue;
    closure.add(handleId);
    const dependencies = /* @__PURE__ */ new Set();
    collectHandleStrings(resource.create, dependencies);
    pending.push(...dependencies);
  }
  return closure;
}
function toJsonSafe(event) {
  return JSON.parse(JSON.stringify(event));
}
function toJsonRecord(event) {
  return JSON.parse(JSON.stringify(event));
}
function createdHandleId(event) {
  if (event.kind === "createTextureView") return event.resultHandleId;
  if (event.kind === "createCommandEncoder") return event.cmdHandleId;
  if (event.kind === "beginRenderPass" || event.kind === "beginComputePass") {
    return event.passHandleId;
  }
  if ((event.kind.startsWith("create") || event.kind === "getBindGroupLayout") && "handleId" in event)
    return event.handleId;
  return void 0;
}
function resourceKind(event) {
  switch (event.kind) {
    case "createBuffer":
      return "buffer";
    case "createTexture":
      return "texture";
    case "createQuerySet":
      return "query-set";
    case "createTextureView":
      return "texture-view";
    case "createSampler":
      return "sampler";
    case "createShaderModule":
      return "shader-module";
    case "createRenderPipeline":
    case "createComputePipeline":
      return "pipeline";
    case "createBindGroup":
    case "createBindGroupLayout":
    case "getBindGroupLayout":
    case "createPipelineLayout":
      return "binding";
    case "createCommandEncoder":
      return "encoder";
    default:
      return void 0;
  }
}

// src/recorder/closure.ts
function _collectFrameReferencedHandleIds(events) {
  const refs = /* @__PURE__ */ new Set();
  for (const e of events) {
    switch (e.kind) {
      case "writeBuffer":
      case "clearBuffer":
      // initialData seeds a pre-arm resource's bytes; its handleId must be
      // prefix-pulled so the resource's create* event lands in the bootstrap
      // closure (otherwise the tape references a handle with no create event ->
      // tape-invalid on deserialize).
      case "initialData": {
        const we = e;
        refs.add(we.handleId);
        break;
      }
      case "setVertexBuffer": {
        const we = e;
        refs.add(we.passHandleId);
        refs.add(we.bufferHandleId);
        break;
      }
      case "setIndexBuffer": {
        const we = e;
        refs.add(we.passHandleId);
        refs.add(we.bufferHandleId);
        break;
      }
      case "setPipeline": {
        const we = e;
        refs.add(we.passHandleId);
        refs.add(we.pipelineHandleId);
        break;
      }
      case "setComputePipeline": {
        const we = e;
        refs.add(we.passHandleId);
        refs.add(we.pipelineHandleId);
        break;
      }
      case "setBindGroup": {
        const we = e;
        refs.add(we.passHandleId);
        refs.add(we.bindGroupHandleId);
        break;
      }
      case "draw": {
        const we = e;
        refs.add(we.passHandleId);
        break;
      }
      case "drawIndexed": {
        const we = e;
        refs.add(we.passHandleId);
        break;
      }
      case "setViewport": {
        const we = e;
        refs.add(we.passHandleId);
        break;
      }
      case "setScissorRect": {
        const we = e;
        refs.add(we.passHandleId);
        break;
      }
      case "setBlendConstant": {
        const we = e;
        refs.add(we.passHandleId);
        break;
      }
      case "setStencilReference": {
        const we = e;
        refs.add(we.passHandleId);
        break;
      }
      case "drawIndirect": {
        const we = e;
        refs.add(we.passHandleId);
        refs.add(we.indirectBufferHandleId);
        break;
      }
      case "drawIndexedIndirect": {
        const we = e;
        refs.add(we.passHandleId);
        refs.add(we.indirectBufferHandleId);
        break;
      }
      case "passPushDebugGroup": {
        const we = e;
        refs.add(we.passHandleId);
        break;
      }
      case "passPopDebugGroup": {
        const we = e;
        refs.add(we.passHandleId);
        break;
      }
      case "passInsertDebugMarker": {
        const we = e;
        refs.add(we.passHandleId);
        break;
      }
      case "endRenderPass": {
        const we = e;
        refs.add(we.passHandleId);
        break;
      }
      case "dispatchWorkgroups": {
        const we = e;
        refs.add(we.passHandleId);
        break;
      }
      case "dispatchWorkgroupsIndirect": {
        const we = e;
        refs.add(we.passHandleId);
        refs.add(we.indirectBufferHandleId);
        break;
      }
      case "endComputePass": {
        const we = e;
        refs.add(we.passHandleId);
        break;
      }
      case "submit": {
        const we = e;
        for (const id of we.cmdHandleIds) refs.add(id);
        break;
      }
      case "beginRenderPass": {
        const we = e;
        refs.add(we.cmdHandleId);
        for (const vhId of we.colorAttachmentViewHandleIds) {
          if (vhId !== void 0) refs.add(vhId);
        }
        if (we.depthStencilViewHandleId !== void 0) refs.add(we.depthStencilViewHandleId);
        if (we.occlusionQuerySetHandleId !== void 0) refs.add(we.occlusionQuerySetHandleId);
        if (we.timestampQuerySetHandleId !== void 0) refs.add(we.timestampQuerySetHandleId);
        break;
      }
      case "beginComputePass": {
        const we = e;
        refs.add(we.cmdHandleId);
        if (we.timestampQuerySetHandleId !== void 0) refs.add(we.timestampQuerySetHandleId);
        break;
      }
      case "finish": {
        const we = e;
        refs.add(we.cmdHandleId);
        break;
      }
      case "pushDebugGroup":
      case "popDebugGroup":
      case "insertDebugMarker": {
        const we = e;
        refs.add(we.cmdHandleId);
        break;
      }
      case "writeTexture": {
        const we = e;
        refs.add(we.destination.textureHandleId);
        break;
      }
      case "copyExternalImageToTexture": {
        const we = e;
        refs.add(we.destination.textureHandleId);
        break;
      }
      case "copyBufferToBuffer": {
        const we = e;
        refs.add(we.sourceHandleId);
        refs.add(we.destinationHandleId);
        break;
      }
      case "copyBufferToTexture": {
        const we = e;
        refs.add(we.source.bufferHandleId);
        refs.add(we.destination.textureHandleId);
        break;
      }
      case "copyTextureToBuffer": {
        const we = e;
        refs.add(we.source.textureHandleId);
        refs.add(we.destination.bufferHandleId);
        break;
      }
      case "copyTextureToTexture": {
        const we = e;
        refs.add(we.source.textureHandleId);
        refs.add(we.destination.textureHandleId);
        break;
      }
      case "createBindGroup":
      case "getBindGroupLayout":
      case "createPipelineLayout":
      case "createRenderPipeline":
      case "createComputePipeline":
      case "createTextureView": {
        for (const ref of _getCreateEventReferencedHandleIds(e)) refs.add(ref);
        break;
      }
      case "destroyBuffer":
      case "destroyTexture":
      case "destroyQuerySet":
        refs.add(e.handleId);
        break;
      case "frameMark":
      case "createBuffer":
      case "createTexture":
      case "createQuerySet":
      case "createSampler":
      case "createBindGroupLayout":
      case "createShaderModule":
      case "createCommandEncoder":
        break;
      case "resolveQuerySet":
        refs.add(e.cmdHandleId);
        refs.add(e.querySetHandleId);
        refs.add(e.destinationHandleId);
        break;
      case "beginOcclusionQuery":
      case "endOcclusionQuery":
        refs.add(e.passHandleId);
        break;
    }
  }
  return refs;
}
function _getCreateEventReferencedHandleIds(event) {
  switch (event.kind) {
    case "createBindGroup": {
      const e = event;
      return [e.layoutHandleId, ...e.resourceHandleIds];
    }
    case "createPipelineLayout": {
      const e = event;
      return [...e.bglHandleIds];
    }
    case "createRenderPipeline": {
      const e = event;
      const refs = [];
      if (e.layoutHandleId !== "layout:auto") refs.push(e.layoutHandleId);
      if (e.vertexShaderModuleHandleId !== void 0) refs.push(e.vertexShaderModuleHandleId);
      if (e.fragmentShaderModuleHandleId !== void 0) refs.push(e.fragmentShaderModuleHandleId);
      return refs;
    }
    case "createComputePipeline": {
      const e = event;
      const refs = [];
      if (e.layoutHandleId !== "layout:auto") refs.push(e.layoutHandleId);
      if (e.computeShaderModuleHandleId !== void 0) refs.push(e.computeShaderModuleHandleId);
      return refs;
    }
    case "createTextureView": {
      const e = event;
      return [e.sourceHandleId];
    }
    case "getBindGroupLayout":
      return [event.pipelineHandleId];
    case "createBuffer":
    case "createTexture":
    case "createQuerySet":
    case "createSampler":
    case "createBindGroupLayout":
    case "createShaderModule":
    case "createCommandEncoder":
      return [];
    default:
      return [];
  }
}
function _computeClosure(seedHandleIds, bootstrapCreates, inFrameHandleIds) {
  const closure = new Set(seedHandleIds);
  const queue = [...seedHandleIds];
  while (queue.length > 0) {
    const current = queue.shift();
    if (current === void 0) break;
    const createEvent = bootstrapCreates.get(current);
    if (createEvent === void 0) {
      if (inFrameHandleIds.has(current)) continue;
      return { closure, missing: current };
    }
    const edges = _getCreateEventReferencedHandleIds(createEvent);
    for (const target of edges) {
      if (!closure.has(target)) {
        closure.add(target);
        queue.push(target);
      }
    }
  }
  return { closure, missing: null };
}
function _topoSortClosure(closure, bootstrapCreates) {
  const inDegree = /* @__PURE__ */ new Map();
  const dependents = /* @__PURE__ */ new Map();
  for (const hId of closure) {
    inDegree.set(hId, 0);
    dependents.set(hId, []);
  }
  for (const hId of closure) {
    const event = bootstrapCreates.get(hId);
    if (event === void 0) continue;
    const edges = _getCreateEventReferencedHandleIds(event);
    for (const target of edges) {
      if (closure.has(target)) {
        const current = dependents.get(target);
        if (current !== void 0) current.push(hId);
        inDegree.set(hId, (inDegree.get(hId) ?? 0) + 1);
      }
    }
  }
  const queue = [];
  for (const [hId, deg] of inDegree) {
    if (deg === 0) queue.push(hId);
  }
  const sorted = [];
  while (queue.length > 0) {
    const current = queue.shift();
    if (current === void 0) break;
    const event = bootstrapCreates.get(current);
    if (event !== void 0) sorted.push(event);
    const deps = dependents.get(current);
    if (deps !== void 0) {
      for (const dep of deps) {
        const newDeg = (inDegree.get(dep) ?? 1) - 1;
        inDegree.set(dep, newDeg);
        if (newDeg === 0) queue.push(dep);
      }
    }
  }
  return sorted;
}

// src/recorder/core.ts
var SNAPSHOT_TIMEOUT_MS = 3e4;
var BUFFER_USAGE_COPY_SRC = 4;
var BUFFER_USAGE_MAP_READ = 1;
var BUFFER_USAGE_MAP_WRITE = 2;
var TEXTURE_USAGE_COPY_SRC = 1;
var TEXTURE_USAGE_COPY_DST = 2;
var TEXTURE_USAGE_BINDING = 4;
var SNAPSHOT_RESOURCE_BATCH_SIZE = 32;
function isDepthOrStencilFormat(format) {
  return format !== void 0 && (format.startsWith("depth") || format.startsWith("stencil"));
}
function isSnapshottableTexture(format, _size, sampleCount) {
  if (isDepthOrStencilFormat(format) && format !== "depth32float") return false;
  if (sampleCount !== void 0 && sampleCount > 1) return false;
  return textureBlockLayout(format) !== void 0;
}
function promoteBufferUsage(usage) {
  if ((usage & (BUFFER_USAGE_MAP_READ | BUFFER_USAGE_MAP_WRITE)) !== 0) return usage;
  return usage | BUFFER_USAGE_COPY_SRC;
}
function isMappableBuffer(usage) {
  return (usage & (BUFFER_USAGE_MAP_READ | BUFFER_USAGE_MAP_WRITE)) !== 0;
}
var _nextHandleId = 0;
function allocHandleId(kind) {
  return `${kind}:${++_nextHandleId}`;
}
function storeBlob(state, data) {
  const hash = digestBytes(new Uint8Array(data));
  if (!state.blobPool.has(hash)) {
    state.blobPool.set(hash, data.slice(0));
  }
  return hash;
}
function snapshotStageOf(error) {
  const d = error.detail;
  if ("phase" in d && d.phase !== void 0) return d.phase;
  return "copy";
}
function snapshotTimeoutDetail(progress, timeoutMs) {
  const current = progress ?? {
    startedAt: Date.now(),
    stage: "queue-drain",
    totalResources: 0,
    completedResources: 0,
    skippedResources: 0,
    currentHandleId: null,
    currentKind: null,
    currentSizeBytes: null
  };
  return {
    stage: "snapshot",
    cause: "GPU readback did not complete before the bounded snapshot timeout",
    timeoutMs,
    progress: {
      snapshotStage: current.stage,
      totalResources: current.totalResources,
      completedResources: current.completedResources,
      skippedResources: current.skippedResources,
      currentHandleId: current.currentHandleId,
      currentKind: current.currentKind,
      currentSizeBytes: current.currentSizeBytes,
      elapsedMs: Math.max(0, Date.now() - current.startedAt)
    }
  };
}
function isRecordingActive(s) {
  return s.state === "armed" /* Armed */ || s.state === "recording" /* Recording */;
}
function retainsCaptureBootstrap(s) {
  return isRecordingActive(s) || s.state === "snapshotting" /* Snapshotting */;
}
function shouldRecord(s) {
  return !s._skipRecord && isRecordingActive(s);
}
function pushEvent(s, event) {
  if (!shouldRecord(s)) return;
  s.events.push(event);
}
function pushSnapshotEvent(s, event) {
  if (s._skipRecord || !isRecordingActive(s) && s.state !== "snapshotting" /* Snapshotting */) {
    return;
  }
  s.events.push(event);
}
function registerHandle(s, handle, kind, createEvent) {
  const hId = allocHandleId(kind);
  s.handleMap.set(handle, hId);
  if (createEvent !== void 0) {
    if ("handleId" in createEvent) Object.assign(createEvent, { handleId: hId });
    s.bootstrapCreates.set(hId, createEvent);
  }
  return hId;
}
function ensureTextureCreateEvent(s, texture, textureId, viewFormat) {
  const existing = s.bootstrapCreates.get(textureId);
  if (existing !== void 0) {
    if (viewFormat !== void 0 && existing.kind === "createTexture" && existing.origin === "swapchain") {
      addSwapchainViewFormat(existing, viewFormat);
    }
    return void 0;
  }
  const raw = texture;
  const width = raw.width;
  const height = raw.height;
  const depthOrArrayLayers = raw.depthOrArrayLayers ?? 1;
  const format = raw.format;
  const rawUsage = raw.usage;
  if (width === void 0 || height === void 0 || format === void 0 || rawUsage === void 0) {
    return createRhiDebugError("tape-invalid", {
      stage: "validate",
      cause: `swapchain texture '${textureId}' has unreadable dimensions (width=${width}, height=${height}, format=${format}, usage=${rawUsage})`,
      handleId: textureId,
      eventIndex: -1
    });
  }
  const event = {
    kind: "createTexture",
    handleId: textureId,
    origin: "swapchain",
    desc: {
      size: { width, height, depthOrArrayLayers },
      format,
      usage: rawUsage | TEXTURE_USAGE_COPY_SRC | TEXTURE_USAGE_COPY_DST,
      ...viewFormat === void 0 ? {} : { viewFormats: [viewFormat] }
    }
  };
  s.bootstrapCreates.set(textureId, event);
  pushEvent(s, event);
  return void 0;
}
function addSwapchainViewFormat(texture, viewFormat) {
  if (texture.desc.format === viewFormat || texture.origin !== "swapchain") return;
  const viewFormats = new Set(texture.desc.viewFormats ?? []);
  viewFormats.add(viewFormat);
  texture.desc = {
    ...texture.desc,
    viewFormats: [...viewFormats]
  };
}
function reconcileSwapchainViewFormats(s) {
  const events = [...s.events, ...s.bootstrapCreates.values()];
  for (const event of events) {
    if (event.kind !== "createTextureView" || event.desc.format === void 0) continue;
    const source = s.bootstrapCreates.get(event.sourceHandleId);
    if (source?.kind === "createTexture" && source.origin === "swapchain") {
      addSwapchainViewFormat(source, event.desc.format);
    }
  }
}
function hasBootstrapDependency(s, handleId) {
  for (const event of s.bootstrapCreates.values()) {
    if (_getCreateEventReferencedHandleIds(event).includes(handleId)) return true;
  }
  return false;
}
function getHandleId(s, handle, kind) {
  const id = s.handleMap.get(handle);
  if (id !== void 0) return id;
  const newId = registerHandle(s, handle, kind);
  if (kind === "texture") ensureTextureCreateEvent(s, handle, newId);
  return newId;
}

// src/recorder/shader.ts
function recordShaderModule(debugInst, result, desc) {
  if (!result.ok) return result;
  const hId = debugInst.pushExternalCreateEvent(result.value, "shaderModule", {
    kind: "createShaderModule",
    handleId: "",
    wgslCode: desc.code
  });
  debugInst.registerShaderModule(result.value, hId);
  return result;
}
function wrapCreateShaderModule(originalFn, debugInst) {
  return async function wrappedCreateShaderModule(device, desc) {
    const realDevice = device._realDevice ?? device;
    const result = await originalFn(realDevice, desc);
    return recordShaderModule(debugInst, result, desc);
  };
}

// src/recorder/pass.ts
function createRenderPassProxy(s, realPass, passHId) {
  return {
    setPipeline(pipeline) {
      const pid = getHandleId(s, pipeline, "renderPipeline");
      pushEvent(s, { kind: "setPipeline", passHandleId: passHId, pipelineHandleId: pid });
      realPass.setPipeline(pipeline);
    },
    setVertexBuffer(slot, buffer, offset, size) {
      const bid = getHandleId(s, buffer, "buffer");
      pushEvent(s, {
        kind: "setVertexBuffer",
        passHandleId: passHId,
        slot,
        bufferHandleId: bid,
        offset,
        size
      });
      realPass.setVertexBuffer(slot, buffer, offset, size);
    },
    setIndexBuffer(buffer, format, offset, size) {
      const bid = getHandleId(s, buffer, "buffer");
      pushEvent(s, {
        kind: "setIndexBuffer",
        passHandleId: passHId,
        bufferHandleId: bid,
        format,
        offset,
        size
      });
      realPass.setIndexBuffer(buffer, format, offset, size);
    },
    setBindGroup(index, bindGroup, ...rest) {
      const bgid = getHandleId(s, bindGroup, "bindGroup");
      let dynOffsets;
      if (rest[0] instanceof Uint32Array) {
        dynOffsets = Array.from(rest[0]);
        realPass.setBindGroup(index, bindGroup, ...rest);
      } else {
        const offsets = rest[0];
        dynOffsets = offsets === void 0 ? void 0 : Array.from(offsets);
        realPass.setBindGroup(index, bindGroup, offsets);
      }
      pushEvent(s, {
        kind: "setBindGroup",
        passHandleId: passHId,
        index,
        bindGroupHandleId: bgid,
        dynamicOffsets: dynOffsets
      });
    },
    draw(vertexCount, instanceCount, firstVertex, firstInstance) {
      pushEvent(s, {
        kind: "draw",
        passHandleId: passHId,
        vertexCount,
        instanceCount: instanceCount ?? 1,
        firstVertex: firstVertex ?? 0,
        firstInstance: firstInstance ?? 0
      });
      realPass.draw(vertexCount, instanceCount, firstVertex, firstInstance);
    },
    drawIndexed(indexCount, instanceCount, firstIndex, baseVertex, firstInstance) {
      pushEvent(s, {
        kind: "drawIndexed",
        passHandleId: passHId,
        indexCount,
        instanceCount: instanceCount ?? 1,
        firstIndex: firstIndex ?? 0,
        baseVertex: baseVertex ?? 0,
        firstInstance: firstInstance ?? 0
      });
      realPass.drawIndexed(indexCount, instanceCount, firstIndex, baseVertex, firstInstance);
    },
    // Pass-through methods (not in v1 event set, but must not break the proxy)
    setViewport(x, y, w, h, minDepth, maxDepth) {
      pushEvent(s, {
        kind: "setViewport",
        passHandleId: passHId,
        x,
        y,
        w,
        h,
        minDepth: minDepth ?? 0,
        maxDepth: maxDepth ?? 1
      });
      realPass.setViewport(x, y, w, h, minDepth, maxDepth);
    },
    setScissorRect(x, y, w, h) {
      pushEvent(s, {
        kind: "setScissorRect",
        passHandleId: passHId,
        x,
        y,
        w,
        h
      });
      realPass.setScissorRect(x, y, w, h);
    },
    setBlendConstant(color) {
      pushEvent(s, {
        kind: "setBlendConstant",
        passHandleId: passHId,
        color
      });
      realPass.setBlendConstant(color);
    },
    setStencilReference(reference) {
      pushEvent(s, {
        kind: "setStencilReference",
        passHandleId: passHId,
        reference
      });
      realPass.setStencilReference(reference);
    },
    drawIndirect(indirectBuffer, indirectOffset) {
      const ibId = getHandleId(s, indirectBuffer, "buffer");
      pushEvent(s, {
        kind: "drawIndirect",
        passHandleId: passHId,
        indirectBufferHandleId: ibId,
        indirectOffset
      });
      realPass.drawIndirect(indirectBuffer, indirectOffset);
    },
    drawIndexedIndirect(indirectBuffer, indirectOffset) {
      const ibId = getHandleId(s, indirectBuffer, "buffer");
      pushEvent(s, {
        kind: "drawIndexedIndirect",
        passHandleId: passHId,
        indirectBufferHandleId: ibId,
        indirectOffset
      });
      realPass.drawIndexedIndirect(indirectBuffer, indirectOffset);
    },
    pushDebugGroup(groupLabel) {
      pushEvent(s, {
        kind: "passPushDebugGroup",
        passHandleId: passHId,
        groupLabel
      });
      realPass.pushDebugGroup(groupLabel);
    },
    popDebugGroup() {
      pushEvent(s, { kind: "passPopDebugGroup", passHandleId: passHId });
      realPass.popDebugGroup();
    },
    insertDebugMarker(markerLabel) {
      pushEvent(s, {
        kind: "passInsertDebugMarker",
        passHandleId: passHId,
        markerLabel
      });
      realPass.insertDebugMarker(markerLabel);
    },
    executeBundles(bundles) {
      return realPass.executeBundles(bundles);
    },
    beginOcclusionQuery(queryIndex) {
      const result = realPass.beginOcclusionQuery(queryIndex);
      if (result.ok)
        pushEvent(s, { kind: "beginOcclusionQuery", passHandleId: passHId, queryIndex });
      return result;
    },
    endOcclusionQuery() {
      const result = realPass.endOcclusionQuery();
      if (result.ok) pushEvent(s, { kind: "endOcclusionQuery", passHandleId: passHId });
      return result;
    },
    end() {
      pushEvent(s, { kind: "endRenderPass", passHandleId: passHId });
      realPass.end();
    }
  };
}
function createComputePassProxy(s, realPass, passHId) {
  return {
    setPipeline(pipeline) {
      const pid = getHandleId(s, pipeline, "computePipeline");
      pushEvent(s, { kind: "setComputePipeline", passHandleId: passHId, pipelineHandleId: pid });
      realPass.setPipeline(pipeline);
    },
    setBindGroup(index, bindGroup, dynamicOffsets) {
      const bgid = getHandleId(s, bindGroup, "bindGroup");
      const recordedDynamicOffsets = dynamicOffsets === void 0 ? void 0 : Array.from(dynamicOffsets);
      pushEvent(s, {
        kind: "setBindGroup",
        passHandleId: passHId,
        index,
        bindGroupHandleId: bgid,
        dynamicOffsets: recordedDynamicOffsets
      });
      realPass.setBindGroup(index, bindGroup, dynamicOffsets);
    },
    dispatchWorkgroups(x, y, z) {
      pushEvent(s, {
        kind: "dispatchWorkgroups",
        passHandleId: passHId,
        x,
        y: y ?? 1,
        z: z ?? 1
      });
      realPass.dispatchWorkgroups(x, y, z);
    },
    dispatchWorkgroupsIndirect(indirectBuffer, indirectOffset) {
      const bufferHandleId = getHandleId(s, indirectBuffer, "buffer");
      pushEvent(s, {
        kind: "dispatchWorkgroupsIndirect",
        passHandleId: passHId,
        indirectBufferHandleId: bufferHandleId,
        indirectOffset
      });
      realPass.dispatchWorkgroupsIndirect(indirectBuffer, indirectOffset);
    },
    end() {
      pushEvent(s, { kind: "endComputePass", passHandleId: passHId });
      realPass.end();
    }
  };
}

// src/recorder/encoder.ts
function createCommandEncoderProxy(s, realEnc, cmdHId) {
  return {
    beginRenderPass(desc) {
      const passHId = allocHandleId("renderPass");
      const colorAttachmentViewHandleIds = [];
      const colorAttachmentResolveTargetHandleIds = [];
      for (const att of desc.colorAttachments) {
        if (att === null || att === void 0) {
          colorAttachmentViewHandleIds.push(void 0);
          colorAttachmentResolveTargetHandleIds.push(void 0);
        } else {
          const view = att.view;
          const id = view !== void 0 && view !== null ? s.handleMap.get(view) : void 0;
          colorAttachmentViewHandleIds.push(id);
          const resolveTarget = att.resolveTarget;
          const resolveTargetId = resolveTarget !== void 0 && resolveTarget !== null ? s.handleMap.get(resolveTarget) : void 0;
          colorAttachmentResolveTargetHandleIds.push(resolveTargetId);
        }
      }
      let depthStencilViewHandleId;
      if (desc.depthStencilAttachment !== void 0) {
        const dsView = desc.depthStencilAttachment.view;
        if (dsView !== void 0 && dsView !== null) {
          depthStencilViewHandleId = s.handleMap.get(dsView);
        }
      }
      pushEvent(s, {
        kind: "beginRenderPass",
        cmdHandleId: cmdHId,
        passHandleId: passHId,
        timestampQuerySetHandleId: desc?.timestampWrites === void 0 ? void 0 : getHandleId(s, desc.timestampWrites.querySet, "querySet"),
        desc: {
          colorAttachments: Array.from(desc.colorAttachments).map(
            (attachment) => attachment === null || attachment === void 0 ? attachment : { ...attachment }
          ),
          ...desc.depthStencilAttachment === void 0 ? {} : { depthStencilAttachment: { ...desc.depthStencilAttachment } },
          ...desc.timestampWrites === void 0 ? {} : { timestampWrites: recordTimestampWrites(desc.timestampWrites) },
          ...desc.maxDrawCount === void 0 ? {} : { maxDrawCount: desc.maxDrawCount }
        },
        colorAttachmentViewHandleIds,
        colorAttachmentResolveTargetHandleIds,
        depthStencilViewHandleId,
        ...desc.occlusionQuerySet === void 0 ? {} : {
          occlusionQuerySetHandleId: getHandleId(
            s,
            desc.occlusionQuerySet,
            "querySet"
          )
        }
      });
      const realPass = realEnc.beginRenderPass(desc);
      return createRenderPassProxy(s, realPass, passHId);
    },
    beginComputePass(desc) {
      const passHId = allocHandleId("computePass");
      pushEvent(s, {
        kind: "beginComputePass",
        cmdHandleId: cmdHId,
        passHandleId: passHId,
        timestampQuerySetHandleId: desc?.timestampWrites === void 0 ? void 0 : getHandleId(s, desc.timestampWrites.querySet, "querySet"),
        desc: desc === void 0 ? void 0 : {
          ...desc.label === void 0 ? {} : { label: desc.label },
          timestampWrites: recordTimestampWrites(desc.timestampWrites)
        }
      });
      const realPass = realEnc.beginComputePass(desc);
      return createComputePassProxy(s, realPass, passHId);
    },
    encodeEmptyComputePass(desc) {
      const passHId = allocHandleId("computePass");
      pushEvent(s, {
        kind: "beginComputePass",
        cmdHandleId: cmdHId,
        passHandleId: passHId,
        timestampQuerySetHandleId: desc?.timestampWrites === void 0 ? void 0 : getHandleId(s, desc.timestampWrites.querySet, "querySet"),
        desc: {
          ...desc.label === void 0 ? {} : { label: desc.label },
          timestampWrites: recordTimestampWrites(desc.timestampWrites)
        }
      });
      realEnc.encodeEmptyComputePass(desc);
      pushEvent(s, { kind: "endComputePass", passHandleId: passHId });
    },
    // Passthrough copy/clear methods (event recording added where types permit)
    copyBufferToBuffer(...args) {
      if (typeof args[1] === "number") {
        const sourceId = getHandleId(s, args[0], "buffer");
        const destinationId = getHandleId(s, args[2], "buffer");
        pushEvent(s, {
          kind: "copyBufferToBuffer",
          cmdHandleId: cmdHId,
          sourceHandleId: sourceId,
          sourceOffset: args[1],
          destinationHandleId: destinationId,
          destinationOffset: args[3],
          size: args[4]
        });
        realEnc.copyBufferToBuffer(...args);
      } else {
        const sourceId = getHandleId(s, args[0], "buffer");
        const destinationId = getHandleId(s, args[1], "buffer");
        const size = args[2];
        pushEvent(s, {
          kind: "copyBufferToBuffer",
          cmdHandleId: cmdHId,
          sourceHandleId: sourceId,
          sourceOffset: 0,
          destinationHandleId: destinationId,
          destinationOffset: 0,
          size: size ?? 0
        });
        realEnc.copyBufferToBuffer(args[0], args[1], size);
      }
    },
    copyBufferToTexture(source, destination, copySize) {
      const bufId = getHandleId(s, source.buffer, "buffer");
      const texId = getHandleId(
        s,
        destination.texture,
        "texture"
      );
      const dstPayload = { textureHandleId: texId };
      if (destination.mipLevel !== void 0) dstPayload.mipLevel = destination.mipLevel;
      if (destination.origin !== void 0) dstPayload.origin = destination.origin;
      if (destination.aspect !== void 0) dstPayload.aspect = destination.aspect;
      pushEvent(s, {
        kind: "copyBufferToTexture",
        cmdHandleId: cmdHId,
        source: {
          bufferHandleId: bufId,
          offset: source.offset ?? 0,
          bytesPerRow: source.bytesPerRow ?? 0,
          rowsPerImage: source.rowsPerImage ?? 0
        },
        destination: dstPayload,
        copySize
      });
      realEnc.copyBufferToTexture(source, destination, copySize);
    },
    copyTextureToBuffer(source, destination, copySize) {
      const texId = getHandleId(s, source.texture, "texture");
      const bufId = getHandleId(s, destination.buffer, "buffer");
      const srcPayload = { textureHandleId: texId };
      if (source.mipLevel !== void 0) srcPayload.mipLevel = source.mipLevel;
      if (source.origin !== void 0) srcPayload.origin = source.origin;
      if (source.aspect !== void 0) srcPayload.aspect = source.aspect;
      pushEvent(s, {
        kind: "copyTextureToBuffer",
        cmdHandleId: cmdHId,
        source: srcPayload,
        destination: {
          bufferHandleId: bufId,
          offset: destination.offset ?? 0,
          bytesPerRow: destination.bytesPerRow ?? 0,
          rowsPerImage: destination.rowsPerImage ?? 0
        },
        copySize
      });
      realEnc.copyTextureToBuffer(source, destination, copySize);
    },
    copyTextureToTexture(source, destination, copySize) {
      const srcTexId = getHandleId(s, source.texture, "texture");
      const dstTexId = getHandleId(
        s,
        destination.texture,
        "texture"
      );
      const srcPayload = { textureHandleId: srcTexId };
      if (source.mipLevel !== void 0) srcPayload.mipLevel = source.mipLevel;
      if (source.origin !== void 0) srcPayload.origin = source.origin;
      if (source.aspect !== void 0) srcPayload.aspect = source.aspect;
      const dstPayload = { textureHandleId: dstTexId };
      if (destination.mipLevel !== void 0) dstPayload.mipLevel = destination.mipLevel;
      if (destination.origin !== void 0) dstPayload.origin = destination.origin;
      if (destination.aspect !== void 0) dstPayload.aspect = destination.aspect;
      pushEvent(s, {
        kind: "copyTextureToTexture",
        cmdHandleId: cmdHId,
        source: srcPayload,
        destination: dstPayload,
        copySize
      });
      realEnc.copyTextureToTexture(source, destination, copySize);
    },
    clearBuffer(buffer, offset, size) {
      const bufId = getHandleId(s, buffer, "buffer");
      pushEvent(s, {
        kind: "clearBuffer",
        cmdHandleId: cmdHId,
        handleId: bufId,
        offset,
        size
      });
      realEnc.clearBuffer(buffer, offset, size);
    },
    resolveQuerySet(querySet, firstQuery, queryCount, destination, destinationOffset) {
      const result = realEnc.resolveQuerySet(
        querySet,
        firstQuery,
        queryCount,
        destination,
        destinationOffset
      );
      if (result.ok) {
        pushEvent(s, {
          kind: "resolveQuerySet",
          cmdHandleId: cmdHId,
          querySetHandleId: getHandleId(s, querySet, "querySet"),
          firstQuery,
          queryCount,
          destinationHandleId: getHandleId(s, destination, "buffer"),
          destinationOffset
        });
      }
      return result;
    },
    pushDebugGroup(groupLabel) {
      pushEvent(s, { kind: "pushDebugGroup", cmdHandleId: cmdHId, groupLabel });
      realEnc.pushDebugGroup(groupLabel);
    },
    popDebugGroup() {
      pushEvent(s, { kind: "popDebugGroup", cmdHandleId: cmdHId });
      realEnc.popDebugGroup();
    },
    insertDebugMarker(markerLabel) {
      pushEvent(s, { kind: "insertDebugMarker", cmdHandleId: cmdHId, markerLabel });
      realEnc.insertDebugMarker(markerLabel);
    },
    finish() {
      pushEvent(s, { kind: "finish", cmdHandleId: cmdHId });
      const res = realEnc.finish();
      if (res.ok) {
        s.handleMap.set(res.value, cmdHId);
      }
      return res;
    }
  };
}
function recordTimestampWrites(writes) {
  return writes === void 0 ? void 0 : {
    ...writes.beginningOfPassWriteIndex === void 0 ? {} : { beginningOfPassWriteIndex: writes.beginningOfPassWriteIndex },
    ...writes.endOfPassWriteIndex === void 0 ? {} : { endOfPassWriteIndex: writes.endOfPassWriteIndex }
  };
}

// src/recorder/pipeline.ts
function wrapPipeline(state, pipeline, pipelineHandleId) {
  const operation = pipeline.getBindGroupLayout;
  if (operation === void 0) return pipeline;
  const getLayout = operation.bind(pipeline);
  Object.defineProperty(pipeline, "getBindGroupLayout", {
    configurable: true,
    value: (index) => {
      const layout = getLayout(index);
      const event = {
        kind: "getBindGroupLayout",
        handleId: "",
        pipelineHandleId,
        index
      };
      registerHandle(state, layout, "bindGroupLayout", event);
      pushEvent(state, event);
      return layout;
    }
  });
  return pipeline;
}

// src/recorder/queue.ts
function createQueueProxy(s, realQueue) {
  return {
    writeBuffer(buffer, bufferOffset, data, dataOffset, size) {
      if (!shouldRecord(s)) {
        return realQueue.writeBuffer(buffer, bufferOffset, data, dataOffset, size);
      }
      const hId = getHandleId(s, buffer, "buffer");
      const raw = ArrayBuffer.isView(data) ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength) : new Uint8Array(data);
      const sz = size ?? raw.byteLength - (dataOffset ?? 0);
      const slice = raw.slice(dataOffset ?? 0, (dataOffset ?? 0) + sz);
      const dataHash = storeBlob(s, slice.buffer);
      pushEvent(s, {
        kind: "writeBuffer",
        handleId: hId,
        bufferOffset,
        dataHash,
        size: sz
      });
      return realQueue.writeBuffer(buffer, bufferOffset, data, dataOffset, size);
    },
    writeTexture(destination, data, dataLayout, copySize) {
      if (!shouldRecord(s)) {
        return realQueue.writeTexture(destination, data, dataLayout, copySize);
      }
      const hId = getHandleId(s, destination.texture, "texture");
      const raw = ArrayBuffer.isView(data) ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength) : new Uint8Array(data);
      const dataHash = storeBlob(s, raw.buffer);
      pushEvent(s, {
        kind: "writeTexture",
        destination: {
          textureHandleId: hId,
          mipLevel: destination.mipLevel,
          origin: destination.origin,
          aspect: destination.aspect
        },
        dataHash,
        dataLayout: {
          offset: dataLayout.offset,
          bytesPerRow: dataLayout.bytesPerRow,
          rowsPerImage: dataLayout.rowsPerImage
        },
        size: copySize
      });
      return realQueue.writeTexture(destination, data, dataLayout, copySize);
    },
    copyExternalImageToTexture(source, destination, copySize) {
      if (!shouldRecord(s)) {
        return realQueue.copyExternalImageToTexture(source, destination, copySize);
      }
      const hId = getHandleId(s, destination.texture, "texture");
      pushEvent(s, {
        kind: "copyExternalImageToTexture",
        source: { origin: source.origin, flipY: source.flipY },
        destination: {
          textureHandleId: hId,
          mipLevel: destination.mipLevel,
          origin: destination.origin,
          aspect: destination.aspect,
          colorSpace: destination.colorSpace,
          premultipliedAlpha: destination.premultipliedAlpha
        },
        copySize
      });
      return realQueue.copyExternalImageToTexture(source, destination, copySize);
    },
    submit(commandBuffers) {
      if (!shouldRecord(s)) {
        return realQueue.submit(commandBuffers);
      }
      const cmdHandleIds = commandBuffers.map(
        (cb) => getHandleId(s, cb, "commandBuffer")
      );
      pushEvent(s, { kind: "submit", cmdHandleIds });
      return realQueue.submit(commandBuffers);
    },
    onSubmittedWorkDone() {
      return realQueue.onSubmittedWorkDone();
    }
  };
}

// src/recorder/device.ts
function createDeviceProxy(s, realDevice) {
  const proxiedQueue = createQueueProxy(s, realDevice.queue);
  const d = {
    _realDevice: realDevice,
    get caps() {
      return realDevice.caps;
    },
    get features() {
      return realDevice.features;
    },
    get limits() {
      return realDevice.limits;
    },
    probeTextureFormatCapability() {
      return realDevice.probeTextureFormatCapability();
    },
    get queue() {
      return proxiedQueue;
    },
    get lost() {
      return realDevice.lost;
    },
    createBuffer(desc) {
      const promotedUsage = promoteBufferUsage(desc.usage ?? 0);
      const res = realDevice.createBuffer({ ...desc, usage: promotedUsage });
      if (!res.ok) return res;
      const event = {
        kind: "createBuffer",
        handleId: "",
        desc: {
          size: desc.size ?? 0,
          usage: promotedUsage,
          mappedAtCreation: desc.mappedAtCreation
        }
      };
      const bufResource = res.value;
      const bufHandleId = registerHandle(s, bufResource, "buffer", event);
      s.descriptorTable.set(bufHandleId, {
        kind: "buffer",
        size: desc.size ?? 0,
        usage: promotedUsage,
        resource: bufResource
      });
      pushEvent(s, event);
      return res;
    },
    createTexture(desc) {
      const promotedUsage = (desc.usage ?? 0) | TEXTURE_USAGE_COPY_SRC | TEXTURE_USAGE_COPY_DST | (isDepthOrStencilFormat(desc.format) ? TEXTURE_USAGE_BINDING : 0) | (desc.format === "depth32float" ? 16 : 0);
      const res = realDevice.createTexture({ ...desc, usage: promotedUsage });
      if (!res.ok) return res;
      const event = {
        kind: "createTexture",
        handleId: "",
        desc: {
          size: desc.size ?? { width: 1, height: 1 },
          mipLevelCount: desc.mipLevelCount,
          sampleCount: desc.sampleCount,
          dimension: desc.dimension,
          format: desc.format ?? "bgra8unorm",
          usage: promotedUsage,
          viewFormats: desc.viewFormats,
          textureBindingViewDimension: desc.textureBindingViewDimension
        }
      };
      const texResource = res.value;
      const texHandleId = registerHandle(s, texResource, "texture", event);
      s.descriptorTable.set(texHandleId, {
        kind: "texture",
        size: desc.size ?? { width: 1, height: 1 },
        format: desc.format ?? "bgra8unorm",
        ...desc.sampleCount !== void 0 ? { sampleCount: desc.sampleCount } : {},
        ...desc.mipLevelCount !== void 0 ? { mipLevelCount: desc.mipLevelCount } : {},
        usage: promotedUsage,
        resource: texResource
      });
      pushEvent(s, event);
      return res;
    },
    createTextureView(texture, desc) {
      const res = realDevice.createTextureView(texture, desc);
      if (!res.ok) return res;
      const srcId = getHandleId(s, texture, "texture");
      const textureError = ensureTextureCreateEvent(s, texture, srcId, desc.format);
      if (textureError !== void 0) {
        return err(
          new RhiError({
            code: "webgpu-runtime-error",
            expected: "texture-view creation to remain representable in the capture graph",
            hint: textureError.hint,
            detail: {
              error: {
                code: textureError.code,
                message: textureError.hint,
                name: "RhiDebugError"
              }
            }
          })
        );
      }
      const viewId = registerHandle(s, res.value, "textureView");
      s.textureViewHandleMap.set(res.value, viewId);
      const event = {
        kind: "createTextureView",
        sourceHandleId: srcId,
        resultHandleId: viewId,
        desc: {
          format: desc.format,
          dimension: desc.dimension,
          usage: desc.usage,
          aspect: desc.aspect,
          baseMipLevel: desc.baseMipLevel,
          mipLevelCount: desc.mipLevelCount,
          baseArrayLayer: desc.baseArrayLayer,
          arrayLayerCount: desc.arrayLayerCount
        }
      };
      s.bootstrapCreates.set(viewId, event);
      pushEvent(s, event);
      return res;
    },
    createSampler(desc) {
      const res = realDevice.createSampler(desc);
      if (!res.ok) return res;
      const event = {
        kind: "createSampler",
        handleId: "",
        desc
      };
      registerHandle(s, res.value, "sampler", event);
      pushEvent(s, event);
      return res;
    },
    createBindGroupLayout(desc) {
      const res = realDevice.createBindGroupLayout(desc);
      if (!res.ok) return res;
      const event = {
        kind: "createBindGroupLayout",
        handleId: "",
        desc: { label: desc.label, entries: desc.entries ?? [] }
      };
      registerHandle(s, res.value, "bindGroupLayout", event);
      pushEvent(s, event);
      return res;
    },
    createBindGroup(desc) {
      const res = realDevice.createBindGroup(desc);
      if (!res.ok) return res;
      const layoutId = getHandleId(s, desc.layout, "bindGroupLayout");
      const entries = Array.from(desc.entries);
      const resourceKinds = entries.map((e) => e.resource.kind);
      const resourceHandleIds = entries.map((e) => {
        const r = e.resource;
        switch (r.kind) {
          case "sampler":
            return getHandleId(s, r.value, "sampler");
          case "buffer":
            return getHandleId(s, r.value.buffer, "buffer");
          case "textureView":
            return getHandleId(s, r.value, "textureView");
          case "externalTexture":
            return "externalTexture:unknown";
        }
        return "externalTexture:unknown";
      });
      const event = {
        kind: "createBindGroup",
        handleId: "",
        layoutHandleId: layoutId,
        entries: entries.map((e, idx) => {
          const entry = {
            binding: e.binding,
            resourceKind: resourceKinds[idx]
          };
          if (e.resource.kind === "buffer") {
            const { offset, size } = e.resource.value;
            if (offset !== void 0) entry.bufferOffset = offset;
            if (size !== void 0) entry.bufferSize = size;
          }
          return entry;
        }),
        resourceHandleIds
      };
      registerHandle(s, res.value, "bindGroup", event);
      pushEvent(s, event);
      return res;
    },
    createPipelineLayout(desc) {
      const res = realDevice.createPipelineLayout(desc);
      if (!res.ok) return res;
      const bglIds = Array.from(desc.bindGroupLayouts).map(
        (bgl) => getHandleId(s, bgl, "bindGroupLayout")
      );
      const event = {
        kind: "createPipelineLayout",
        handleId: "",
        bglHandleIds: bglIds
      };
      registerHandle(s, res.value, "pipelineLayout", event);
      pushEvent(s, event);
      return res;
    },
    createRenderPipeline(desc) {
      const res = realDevice.createRenderPipeline(desc);
      if (!res.ok) return res;
      let layoutId;
      if (typeof desc.layout === "string") {
        layoutId = "layout:auto";
      } else {
        layoutId = getHandleId(s, desc.layout, "pipelineLayout");
      }
      let vertexShaderModuleHandleId;
      if (desc.vertex !== void 0) {
        vertexShaderModuleHandleId = getHandleId(s, desc.vertex.module, "shaderModule");
      }
      let fragmentShaderModuleHandleId;
      if (desc.fragment !== void 0) {
        fragmentShaderModuleHandleId = getHandleId(
          s,
          desc.fragment.module,
          "shaderModule"
        );
      }
      const { module: _vertexModule, constants: vertexConstants, ...vertexFields } = desc.vertex;
      const recordedVertex = vertexConstants === void 0 ? vertexFields : { ...vertexFields, constants: vertexConstants };
      const recordedFragment = desc.fragment === void 0 ? void 0 : (() => {
        const {
          module: _fragmentModule,
          constants: fragmentConstants,
          ...fragmentFields
        } = desc.fragment;
        return fragmentConstants === void 0 ? fragmentFields : { ...fragmentFields, constants: fragmentConstants };
      })();
      const event = {
        kind: "createRenderPipeline",
        handleId: "",
        desc: {
          vertex: recordedVertex,
          primitive: desc.primitive,
          depthStencil: desc.depthStencil,
          multisample: desc.multisample,
          ...recordedFragment === void 0 ? {} : { fragment: recordedFragment }
        },
        layoutHandleId: layoutId,
        vertexShaderModuleHandleId,
        fragmentShaderModuleHandleId
      };
      const pipelineId = registerHandle(s, res.value, "renderPipeline", event);
      pushEvent(s, event);
      return ok(wrapPipeline(s, res.value, pipelineId));
    },
    createComputePipeline(desc) {
      const res = realDevice.createComputePipeline(desc);
      if (!res.ok) return res;
      let layoutId;
      if (typeof desc.layout === "string") {
        layoutId = "layout:auto";
      } else {
        layoutId = getHandleId(s, desc.layout, "pipelineLayout");
      }
      const computeShaderModuleHandleId = getHandleId(
        s,
        desc.compute.module,
        "shaderModule"
      );
      const event = {
        kind: "createComputePipeline",
        handleId: "",
        desc: { compute: JSON.parse(JSON.stringify(desc.compute)) },
        layoutHandleId: layoutId,
        computeShaderModuleHandleId
      };
      const pipelineId = registerHandle(s, res.value, "computePipeline", event);
      pushEvent(s, event);
      return ok(wrapPipeline(s, res.value, pipelineId));
    },
    createQuerySet(desc) {
      const res = realDevice.createQuerySet(desc);
      if (!res.ok) return res;
      const event = {
        kind: "createQuerySet",
        handleId: "",
        desc: {
          ...desc.label === void 0 ? {} : { label: desc.label },
          type: desc.type ?? "occlusion",
          count: desc.count ?? 0
        }
      };
      registerHandle(s, res.value, "querySet", event);
      pushEvent(s, event);
      return res;
    },
    destroyBuffer(buf) {
      const hId = s.handleMap.get(buf);
      const res = realDevice.destroyBuffer(buf);
      if (!res.ok) return res;
      if (hId !== void 0) {
        s.descriptorTable.delete(hId);
        if (!retainsCaptureBootstrap(s) && !s.snapshotSeededHandles.has(hId) && !hasBootstrapDependency(s, hId)) {
          s.bootstrapCreates.delete(hId);
        }
        pushEvent(s, { kind: "destroyBuffer", handleId: hId });
      }
      return res;
    },
    destroyQuerySet(querySet) {
      const hId = s.handleMap.get(querySet);
      const res = realDevice.destroyQuerySet(querySet);
      if (!res.ok) return res;
      if (hId !== void 0) {
        if (!retainsCaptureBootstrap(s) && !s.snapshotSeededHandles.has(hId) && !hasBootstrapDependency(s, hId)) {
          s.bootstrapCreates.delete(hId);
        }
        pushEvent(s, { kind: "destroyQuerySet", handleId: hId });
      }
      return res;
    },
    destroyTexture(tex) {
      const hId = s.handleMap.get(tex);
      const res = realDevice.destroyTexture(tex);
      if (!res.ok) return res;
      if (hId !== void 0) {
        s.descriptorTable.delete(hId);
        if (!retainsCaptureBootstrap(s) && !s.snapshotSeededHandles.has(hId) && !hasBootstrapDependency(s, hId)) {
          s.bootstrapCreates.delete(hId);
        }
        pushEvent(s, { kind: "destroyTexture", handleId: hId });
      }
      return res;
    },
    createCommandEncoder(desc) {
      const res = realDevice.createCommandEncoder(desc);
      if (!res.ok) return res;
      if (!shouldRecord(s)) {
        return res;
      }
      const cmdId = allocHandleId("commandEncoder");
      pushEvent(s, {
        kind: "createCommandEncoder",
        cmdHandleId: cmdId,
        desc
      });
      const proxyEnc = createCommandEncoderProxy(s, res.value, cmdId);
      return ok(proxyEnc);
    }
  };
  return d;
}
function createRecorderLifecycle(s) {
  function arm(frames) {
    if (s.state === "armed" /* Armed */ || s.state === "snapshotting" /* Snapshotting */ || s.state === "recording" /* Recording */ || s.state === "finalizing" /* Finalizing */) {
      return err(
        createRhiDebugError("capture-busy", {
          stage: "capture",
          cause: "arm() called while the recorder is already capturing"
        })
      );
    }
    if (s.state === "error" /* Error */) {
      return err(
        createRhiDebugError("capture-unavailable", {
          stage: "capture",
          cause: "the recorder is in an error state; dispose the failed capture before re-arming"
        })
      );
    }
    s.state = "armed" /* Armed */;
    s._skipRecord = false;
    s.snapshotGeneration += 1;
    s.requestedFrames = frames;
    s.recordedFrames = 0;
    s.events = [];
    s.blobPool = /* @__PURE__ */ new Map();
    s.snapshotSeededHandles.clear();
    s.snapshotProgress = void 0;
    s.frameIdx = 0;
    s.bootstrap = true;
    s.valid = true;
    return ok(void 0);
  }
  function onFrameEnd() {
    if (s.state === "idle" /* Idle */) {
      s.frameIdx++;
      s.bootstrap = false;
      return;
    }
    if (s.state === "snapshotting" /* Snapshotting */) {
      s.bootstrap = false;
      return;
    }
    if (s.state === "armed" /* Armed */) {
      s.state = "recording" /* Recording */;
      s.bootstrap = false;
    }
    if (s.state === "recording" /* Recording */) {
      s.events.push({ kind: "frameMark", frameIdx: s.frameIdx });
      s.recordedFrames++;
      s.frameIdx++;
      if (s.recordedFrames >= s.requestedFrames) {
        s.state = "finalizing" /* Finalizing */;
        if (s.onFrameEndUnsubscribe) {
          s.onFrameEndUnsubscribe();
          s.onFrameEndUnsubscribe = void 0;
        }
        s.state = "idle" /* Idle */;
      }
      return;
    }
    s.frameIdx++;
  }
  function getTape() {
    if (s.events.length === 0) return void 0;
    reconcileSwapchainViewFormats(s);
    const inFrameHandleIds = /* @__PURE__ */ new Set();
    for (const e of s.events) {
      if (e.kind.startsWith("create") && "handleId" in e && typeof e.handleId === "string") {
        inFrameHandleIds.add(e.handleId);
      }
      if (e.kind === "createTextureView" && "resultHandleId" in e && typeof e.resultHandleId === "string") {
        inFrameHandleIds.add(e.resultHandleId);
      }
      if (e.kind === "createCommandEncoder" && "cmdHandleId" in e && typeof e.cmdHandleId === "string") {
        inFrameHandleIds.add(e.cmdHandleId);
      }
      if ((e.kind === "beginRenderPass" || e.kind === "beginComputePass") && "passHandleId" in e && typeof e.passHandleId === "string") {
        inFrameHandleIds.add(e.passHandleId);
      }
    }
    const allFrameHandleIds = _collectFrameReferencedHandleIds(s.events);
    const prefixSeedIds = /* @__PURE__ */ new Set();
    for (const hId of allFrameHandleIds) {
      if (!inFrameHandleIds.has(hId)) {
        prefixSeedIds.add(hId);
      }
    }
    const { closure, missing } = _computeClosure(
      prefixSeedIds,
      s.bootstrapCreates,
      inFrameHandleIds
    );
    if (missing !== null) {
      const referencingEventIndex = s.events.findIndex((event) => {
        try {
          return JSON.stringify(event).includes(missing);
        } catch {
          return false;
        }
      });
      const referencingEventKind = referencingEventIndex >= 0 ? s.events[referencingEventIndex]?.kind : void 0;
      const referencingCreate = [...s.bootstrapCreates.entries()].find(
        ([, event]) => _getCreateEventReferencedHandleIds(event).includes(missing)
      );
      return createRhiDebugError("tape-invalid", {
        stage: "validate",
        cause: `handleId '${missing}' has no create event in bootstrap table; referenced by event ${referencingEventIndex} (${referencingEventKind ?? "unknown"}) and bootstrap ${referencingCreate?.[0] ?? "unknown"} (${referencingCreate?.[1].kind ?? "unknown"})`,
        handleId: missing,
        eventIndex: referencingEventIndex
      });
    }
    const prefixEvents = _topoSortClosure(closure, s.bootstrapCreates);
    const dedupedPrefx = prefixEvents.filter((e) => {
      if ("handleId" in e && typeof e.handleId === "string") {
        return !inFrameHandleIds.has(e.handleId);
      }
      return true;
    });
    return {
      formatVersion: TAPE_FORMAT_VERSION,
      rhiCapsRecorded: s.recordedCaps ?? {
        canvasFormat: "bgra8unorm",
        rgba16floatRenderable: false,
        float32Filterable: false,
        textureCompressionBc: false,
        textureCompressionEtc2: false,
        textureCompressionAstc: false,
        storageBuffer: false,
        timestampQuery: false
      },
      events: [...dedupedPrefx, ...s.events],
      blobPool: s.blobPool
    };
  }
  function getState() {
    return s.state;
  }
  function getEvents() {
    return s.events;
  }
  function getBlobPool() {
    return s.blobPool;
  }
  function transitionToError() {
    if (s.state === "recording" /* Recording */ || s.state === "armed" /* Armed */ || s.state === "snapshotting" /* Snapshotting */) {
      s.state = "error" /* Error */;
      s.snapshotGeneration += 1;
      s._skipRecord = false;
      s.valid = false;
      if (s.onFrameEndUnsubscribe) {
        s.onFrameEndUnsubscribe();
        s.onFrameEndUnsubscribe = void 0;
      }
    }
  }
  function disposeError() {
    if (s.state === "error" /* Error */) {
      s.state = "idle" /* Idle */;
      s.snapshotGeneration += 1;
      s._skipRecord = false;
      s.events = [];
      s.blobPool = /* @__PURE__ */ new Map();
      s.valid = true;
      s.snapshotProgress = void 0;
    }
  }
  async function snapshotResource(handleId, snapshotGeneration) {
    const fail = (stage, _expected, hint) => err(
      createRhiDebugError("capture-snapshot-failed", {
        stage: "snapshot",
        cause: `${stage}: ${hint}`,
        handleId
      })
    );
    const entry = s.descriptorTable.get(handleId);
    if (entry === void 0) {
      return fail(
        "copy",
        "handleId present in descriptor registry",
        `no live resource registered for handleId '${handleId}'; it may have been destroyed or never created through the recorder proxy`
      );
    }
    const device = s.capturedDevice;
    if (device === void 0) {
      return fail(
        "copy",
        "a captured RhiDevice to drive GPU readback",
        "no device has been acquired through the recorder proxy yet; drive requestAdapter().requestDevice() before snapshotting"
      );
    }
    const realDevice = device._realDevice ?? device;
    const snapshotIsActive = () => snapshotGeneration === void 0 || s.state === "snapshotting" /* Snapshotting */ && s.snapshotGeneration === snapshotGeneration;
    const cancelled = () => err(
      createRhiDebugError("capture-snapshot-failed", {
        stage: "snapshot",
        cause: "snapshot was cancelled after a timeout or recorder error; discard this capture and retry",
        handleId
      })
    );
    let bytes;
    const prevSkip = s._skipRecord;
    s._skipRecord = true;
    try {
      if (entry.kind === "buffer") {
        const size = typeof entry.size === "number" ? entry.size : 0;
        const res = await readbackBufferBytes(realDevice, entry.resource, size);
        if (!res.ok) return fail(snapshotStageOf(res.error), res.error.expected, res.error.hint);
        if (!snapshotIsActive()) return cancelled();
        bytes = res.value;
      } else {
        const { width, height, layerCount } = projectTextureExtent(entry.size);
        const layout = computeTextureLayout(
          entry.format,
          width,
          height,
          layerCount,
          entry.mipLevelCount ?? 1
        );
        if (layout === void 0) {
          return fail(
            "copy",
            "a snapshottable color format with a known texel size",
            `format '${entry.format}' has no byte layout; the snapshot gate should have skipped it`
          );
        }
        try {
          const blob2 = new Uint8Array(layout.totalBytes);
          for (const slice of layout.slices) {
            if (!snapshotIsActive()) return cancelled();
            const sub = await readbackTexturePixels(
              realDevice,
              entry.resource,
              slice.width,
              slice.height,
              {
                bytesPerBlock: layout.bytesPerBlock,
                blockWidth: layout.blockWidth,
                blockHeight: layout.blockHeight,
                mipLevel: slice.mip,
                baseArrayLayer: slice.layer,
                ...entry.format === "depth32float" ? { aspect: "depth-only" } : {}
              }
            );
            if (!snapshotIsActive()) return cancelled();
            blob2.set(sub.subarray(0, slice.byteLength), slice.byteOffset);
          }
          bytes = blob2.buffer.slice(
            blob2.byteOffset,
            blob2.byteOffset + blob2.byteLength
          );
        } catch (e) {
          return fail(
            "copy",
            "texture GPU byte readback to succeed",
            `readbackTexturePixels failed: ${String(e)}`
          );
        }
      }
    } finally {
      if (snapshotGeneration === void 0 || s.snapshotGeneration === snapshotGeneration) {
        s._skipRecord = prevSkip;
      }
    }
    if (!snapshotIsActive()) return cancelled();
    let dataHash;
    try {
      dataHash = storeBlob(s, bytes);
    } catch (e) {
      return fail(
        "store",
        "storeBlob to hash + insert the snapshot bytes",
        `storeBlob failed: ${String(e)}`
      );
    }
    pushSnapshotEvent(s, { kind: "initialData", handleId, dataHash });
    s.snapshotSeededHandles.add(handleId);
    return ok({ handleId, dataHash });
  }
  async function snapshotAllLiveResources(timeoutMs = SNAPSHOT_TIMEOUT_MS) {
    if (s.state !== "armed" /* Armed */ && s.state !== "snapshotting" /* Snapshotting */) {
      return err(
        createRhiDebugError("capture-unavailable", {
          stage: "capture",
          cause: `snapshotAllLiveResources called while recorder is in '${s.state}' state; arm() before the frame-header snapshot`
        })
      );
    }
    const snapshotGeneration = s.snapshotGeneration;
    s.state = "snapshotting" /* Snapshotting */;
    const timeoutError = () => createRhiDebugError("capture-timeout", snapshotTimeoutDetail(s.snapshotProgress, timeoutMs));
    let timer;
    const timeoutResult = new Promise((resolve) => {
      timer = setTimeout(() => {
        if (s.state === "snapshotting" /* Snapshotting */ && s.snapshotGeneration === snapshotGeneration) {
          transitionToError();
        }
        resolve(err(timeoutError()));
      }, timeoutMs);
    });
    try {
      const result = await Promise.race([
        runSnapshotAllLiveResources(snapshotGeneration),
        timeoutResult
      ]);
      if (!result.ok && s.state === "snapshotting" /* Snapshotting */ && s.snapshotGeneration === snapshotGeneration) {
        transitionToError();
      }
      return result;
    } catch (error) {
      if (s.state === "snapshotting" /* Snapshotting */ && s.snapshotGeneration === snapshotGeneration) {
        transitionToError();
      }
      throw error;
    } finally {
      if (timer !== void 0) clearTimeout(timer);
    }
  }
  async function runSnapshotAllLiveResources(snapshotGeneration) {
    s.snapshotProgress = {
      startedAt: Date.now(),
      stage: "queue-drain",
      totalResources: s.descriptorTable.size,
      completedResources: 0,
      skippedResources: 0,
      currentHandleId: null,
      currentKind: null,
      currentSizeBytes: null
    };
    const device = s.capturedDevice;
    const realDevice = device === void 0 ? void 0 : device._realDevice ?? device;
    if (realDevice !== void 0) {
      const prevSkip = s._skipRecord;
      s._skipRecord = true;
      try {
        await realDevice.queue.onSubmittedWorkDone();
      } finally {
        if (s.snapshotGeneration === snapshotGeneration) s._skipRecord = prevSkip;
      }
      if (s.snapshotProgress !== void 0) {
        s.snapshotProgress = { ...s.snapshotProgress, stage: "resource-readback" };
      }
      if (s.state !== "snapshotting" /* Snapshotting */ || s.snapshotGeneration !== snapshotGeneration) {
        return err(
          createRhiDebugError("capture-snapshot-failed", {
            stage: "snapshot",
            cause: "snapshot was cancelled while queued GPU work was draining"
          })
        );
      }
    }
    const liveEntries = [...s.descriptorTable.entries()];
    const candidates = liveEntries.filter(([handleId, entry]) => {
      if (entry.kind === "buffer" && isMappableBuffer(entry.usage)) {
        if (s.snapshotProgress !== void 0) {
          s.snapshotProgress = {
            ...s.snapshotProgress,
            skippedResources: s.snapshotProgress.skippedResources + 1
          };
        }
        return false;
      }
      if (entry.kind === "texture" && !isSnapshottableTexture(entry.format, entry.size, entry.sampleCount)) {
        if (s.snapshotProgress !== void 0) {
          s.snapshotProgress = {
            ...s.snapshotProgress,
            skippedResources: s.snapshotProgress.skippedResources + 1
          };
        }
        return false;
      }
      if (entry.kind === "texture" && !s.descriptorTable.has(handleId)) {
        if (s.snapshotProgress !== void 0) {
          s.snapshotProgress = {
            ...s.snapshotProgress,
            skippedResources: s.snapshotProgress.skippedResources + 1
          };
        }
        return false;
      }
      return true;
    });
    const snapshotIsActive = () => s.state === "snapshotting" /* Snapshotting */ && s.snapshotGeneration === snapshotGeneration;
    const cancelledResult = () => err(
      createRhiDebugError("capture-snapshot-failed", {
        stage: "snapshot",
        cause: "snapshot was cancelled while live resources were being seeded"
      })
    );
    if (realDevice === void 0) {
      for (const [handleId, entry] of candidates) {
        if (s.snapshotProgress !== void 0) {
          s.snapshotProgress = {
            ...s.snapshotProgress,
            stage: "resource-readback",
            currentHandleId: handleId,
            currentKind: entry.kind,
            currentSizeBytes: entry.kind === "buffer" && typeof entry.size === "number" ? entry.size : null
          };
        }
        const result = await snapshotResource(handleId, snapshotGeneration);
        if (!result.ok) return result;
        if (s.snapshotProgress !== void 0) {
          s.snapshotProgress = {
            ...s.snapshotProgress,
            completedResources: s.snapshotProgress.completedResources + 1,
            currentHandleId: null,
            currentKind: null,
            currentSizeBytes: null
          };
        }
      }
    } else {
      let offset = 0;
      while (offset < candidates.length) {
        const first = candidates[offset];
        if (first === void 0) break;
        const kind = first[1].kind;
        const batchEntries = [];
        while (offset < candidates.length && batchEntries.length < SNAPSHOT_RESOURCE_BATCH_SIZE && candidates[offset]?.[1].kind === kind) {
          const candidate = candidates[offset];
          if (candidate !== void 0) batchEntries.push(candidate);
          offset += 1;
        }
        if (s.snapshotProgress !== void 0) {
          s.snapshotProgress = {
            ...s.snapshotProgress,
            stage: "resource-readback",
            currentHandleId: batchEntries[0]?.[0] ?? null,
            currentKind: kind,
            currentSizeBytes: kind === "buffer" && typeof batchEntries[0]?.[1].size === "number" ? batchEntries[0][1].size : null
          };
        }
        if (kind === "buffer") {
          const batch = await readbackBufferBytesBatch(
            realDevice,
            batchEntries.map(([handleId, entry]) => ({
              handleId,
              buffer: entry.resource,
              size: typeof entry.size === "number" ? entry.size : 0
            })),
            {
              onResourceStart: (handleId) => {
                const entry = s.descriptorTable.get(handleId);
                if (s.snapshotProgress !== void 0 && entry !== void 0) {
                  s.snapshotProgress = {
                    ...s.snapshotProgress,
                    currentHandleId: handleId,
                    currentKind: "buffer",
                    currentSizeBytes: typeof entry.size === "number" ? entry.size : null
                  };
                }
              },
              onResourceComplete: () => {
                if (s.snapshotProgress !== void 0) {
                  s.snapshotProgress = {
                    ...s.snapshotProgress,
                    completedResources: s.snapshotProgress.completedResources + 1,
                    currentHandleId: null,
                    currentKind: null,
                    currentSizeBytes: null
                  };
                }
              },
              isCancelled: () => !snapshotIsActive()
            }
          );
          if (!batch.ok) return batch;
          if (!snapshotIsActive()) return cancelledResult();
          for (const [handleId] of batchEntries) {
            const bytes = batch.value.get(handleId);
            if (bytes === void 0) {
              return err(
                createRhiDebugError("capture-snapshot-failed", {
                  stage: "snapshot",
                  cause: "the batched GPU readback returned no bytes for a live buffer",
                  handleId,
                  resourceKind: "buffer"
                })
              );
            }
            const dataHash = storeBlob(s, bytes);
            pushSnapshotEvent(s, { kind: "initialData", handleId, dataHash });
            s.snapshotSeededHandles.add(handleId);
          }
        } else {
          const requests = batchEntries.map(([handleId, entry]) => {
            const { width, height, layerCount } = projectTextureExtent(entry.size);
            const layout = computeTextureLayout(
              entry.format,
              width,
              height,
              layerCount,
              entry.mipLevelCount ?? 1
            );
            if (layout === void 0) {
              throw new Error(`texture '${handleId}' has no snapshottable byte layout`);
            }
            return {
              handleId,
              texture: entry.resource,
              ...entry.format === "depth32float" ? { aspect: "depth-only" } : {},
              bytesPerBlock: layout.bytesPerBlock,
              blockWidth: layout.blockWidth,
              blockHeight: layout.blockHeight,
              totalBytes: layout.totalBytes,
              slices: layout.slices
            };
          });
          const batch = await readbackTexturePixelsBatch(realDevice, requests, {
            onResourceStart: (handleId) => {
              if (s.snapshotProgress !== void 0) {
                s.snapshotProgress = {
                  ...s.snapshotProgress,
                  currentHandleId: handleId,
                  currentKind: "texture",
                  currentSizeBytes: null
                };
              }
            },
            isCancelled: () => !snapshotIsActive()
          });
          if (!batch.ok) return batch;
          if (!snapshotIsActive()) return cancelledResult();
          for (const [handleId] of batchEntries) {
            if (!s.descriptorTable.has(handleId)) {
              if (s.snapshotProgress !== void 0) {
                s.snapshotProgress = {
                  ...s.snapshotProgress,
                  skippedResources: s.snapshotProgress.skippedResources + 1,
                  currentHandleId: null,
                  currentKind: null,
                  currentSizeBytes: null
                };
              }
              continue;
            }
            const bytes = batch.value.get(handleId);
            if (bytes === void 0) {
              return err(
                createRhiDebugError("capture-snapshot-failed", {
                  stage: "snapshot",
                  cause: "the batched GPU readback returned no bytes for a live texture",
                  handleId,
                  resourceKind: "texture"
                })
              );
            }
            const dataHash = storeBlob(s, bytes);
            pushSnapshotEvent(s, { kind: "initialData", handleId, dataHash });
            s.snapshotSeededHandles.add(handleId);
            if (s.snapshotProgress !== void 0) {
              s.snapshotProgress = {
                ...s.snapshotProgress,
                completedResources: s.snapshotProgress.completedResources + 1,
                currentHandleId: null,
                currentKind: null,
                currentSizeBytes: null
              };
            }
          }
        }
        if (!snapshotIsActive()) return cancelledResult();
      }
    }
    if (s.snapshotProgress !== void 0) {
      s.snapshotProgress = {
        ...s.snapshotProgress,
        currentHandleId: null,
        currentKind: null,
        currentSizeBytes: null
      };
    }
    if (s.state !== "snapshotting" /* Snapshotting */ || s.snapshotGeneration !== snapshotGeneration) {
      return err(
        createRhiDebugError("capture-snapshot-failed", {
          stage: "snapshot",
          cause: "snapshot was cancelled before the full live-resource table was seeded"
        })
      );
    }
    s.state = "recording" /* Recording */;
    return ok(void 0);
  }
  return {
    arm,
    onFrameEnd,
    getTape,
    getState,
    getEvents,
    getBlobPool,
    transitionToError,
    disposeError,
    snapshotResource,
    snapshotAllLiveResources
  };
}

// src/recorder/wrap.ts
function wrap(instance) {
  const s = {
    state: "idle" /* Idle */,
    requestedFrames: 0,
    recordedFrames: 0,
    events: [],
    blobPool: /* @__PURE__ */ new Map(),
    handleMap: /* @__PURE__ */ new WeakMap(),
    textureViewHandleMap: /* @__PURE__ */ new WeakMap(),
    bootstrapCreates: /* @__PURE__ */ new Map(),
    snapshotSeededHandles: /* @__PURE__ */ new Set(),
    snapshotGeneration: 0,
    snapshotProgress: void 0,
    descriptorTable: /* @__PURE__ */ new Map(),
    _skipRecord: false,
    frameIdx: 0,
    bootstrap: true,
    recordedCaps: void 0,
    valid: true,
    capturedDevice: void 0
  };
  const lifecycle = createRecorderLifecycle(s);
  const {
    arm,
    onFrameEnd,
    getTape,
    getState,
    getEvents,
    getBlobPool,
    transitionToError,
    disposeError,
    snapshotResource,
    snapshotAllLiveResources
  } = lifecycle;
  const debugInst = {
    arm,
    onFrameEnd,
    getTape,
    getState,
    getEvents,
    getBlobPool,
    transitionToError,
    disposeError,
    snapshotResource,
    snapshotAllLiveResources,
    pushExternalEvent(event) {
      pushEvent(s, event);
    },
    registerShaderModule(handle, handleId) {
      s.handleMap.set(handle, handleId);
    },
    pushExternalCreateEvent(handle, kind, event) {
      const hId = registerHandle(s, handle, kind, event);
      pushEvent(s, event);
      return hId;
    },
    resetForDeviceLoss() {
      s.state = "idle" /* Idle */;
      s.requestedFrames = 0;
      s.recordedFrames = 0;
      s.events = [];
      s.blobPool = /* @__PURE__ */ new Map();
      s.handleMap = /* @__PURE__ */ new WeakMap();
      s.textureViewHandleMap = /* @__PURE__ */ new WeakMap();
      s.bootstrapCreates = /* @__PURE__ */ new Map();
      s.descriptorTable = /* @__PURE__ */ new Map();
      s.snapshotSeededHandles = /* @__PURE__ */ new Set();
      s.snapshotProgress = void 0;
      s.frameIdx = 0;
      s.bootstrap = true;
      s.recordedCaps = void 0;
      s.valid = true;
      s.capturedDevice = void 0;
    },
    valid() {
      return s.valid;
    },
    bootstrapCreatesSize() {
      return s.bootstrapCreates.size;
    },
    bootstrapEvents() {
      return Array.from(s.bootstrapCreates.values());
    },
    descriptorTable() {
      return s.descriptorTable;
    },
    async requestAdapter(opts, compatibleSurface) {
      const res = await instance.requestAdapter(opts, compatibleSurface);
      if (!res.ok) return res;
      const realAdapter = res.value;
      const proxyAdapter = {
        features: realAdapter.features,
        limits: realAdapter.limits,
        async requestDevice(devOpts) {
          const devRes = await realAdapter.requestDevice(devOpts);
          if (!devRes.ok) return devRes;
          const proxied = createDeviceProxy(s, devRes.value);
          s.capturedDevice = proxied;
          s.recordedCaps = {
            // RhiDevice does not own a canvas, so retain the existing tape
            // default for this informational field while deriving every
            // device-backed capability from the captured device.
            canvasFormat: "bgra8unorm",
            rgba16floatRenderable: proxied.caps.rgba16floatRenderable,
            float32Filterable: proxied.caps.float32Filterable,
            textureCompressionBc: proxied.caps.textureCompressionBc,
            textureCompressionEtc2: proxied.caps.textureCompressionEtc2,
            textureCompressionAstc: proxied.caps.textureCompressionAstc,
            storageBuffer: proxied.caps.storageBuffer,
            timestampQuery: proxied.caps.timestampQuery
          };
          return ok(proxied);
        }
      };
      return ok(proxyAdapter);
    }
  };
  return debugInst;
}

// src/recorder/proxy.ts
function createRecorderProxy(backend) {
  const recorder = wrap(backend.rhi);
  const wrappedCreateShaderModule = wrapCreateShaderModule(backend.createShaderModule, recorder);
  const originalCreateShaderModuleImmediate = backend.createShaderModuleImmediate;
  const wrappedCreateShaderModuleImmediate = originalCreateShaderModuleImmediate === void 0 ? void 0 : (device, desc) => {
    const realDevice = device._realDevice ?? device;
    const result = originalCreateShaderModuleImmediate(realDevice, desc);
    if (!result.ok) return result;
    const hId = recorder.pushExternalCreateEvent(result.value, "shaderModule", {
      kind: "createShaderModule",
      handleId: "",
      wgslCode: desc.code
    });
    recorder.registerShaderModule(result.value, hId);
    return result;
  };
  const acquireCanvasContext = backend.rhi.acquireCanvasContext;
  const rhi = {
    requestAdapter: recorder.requestAdapter.bind(recorder),
    createShaderModule: wrappedCreateShaderModule,
    ...wrappedCreateShaderModuleImmediate === void 0 ? {} : { createShaderModuleImmediate: wrappedCreateShaderModuleImmediate },
    ...acquireCanvasContext === void 0 ? {} : {
      acquireCanvasContext(canvas) {
        const result = acquireCanvasContext.call(backend.rhi, canvas);
        if (!result.ok) return result;
        const context = result.value;
        return ok({
          ...context,
          configure(configuration) {
            const device = configuration.device._realDevice;
            return context.configure({
              ...configuration,
              ...device === void 0 ? {} : { device }
            });
          }
        });
      }
    }
  };
  const wrappedBackend = {
    rhi,
    createShaderModule: wrappedCreateShaderModule,
    ...wrappedCreateShaderModuleImmediate === void 0 ? {} : { createShaderModuleImmediate: wrappedCreateShaderModuleImmediate },
    unwrapDeviceForSurface(device) {
      const raw = device._realDevice;
      if (raw !== void 0) return ok(raw);
      return err(
        createRhiDebugError("capture-unavailable", {
          stage: "capture",
          cause: "the recorder backend does not expose a surface device resolver"
        })
      );
    }
  };
  return { backend: wrappedBackend, recorder };
}

// src/recorder/resource-registry.ts
var ResourceRegistry = class {
  constructor(recorder) {
    this.recorder = recorder;
  }
  recorder;
  candidates() {
    return Array.from(this.recorder.descriptorTable(), ([handleId, descriptor]) => ({
      handleId,
      kind: descriptor.kind,
      estimatedBytes: estimateBytes2(descriptor)
    }));
  }
  estimateSnapshotBytes() {
    return this.candidates().reduce((total, candidate) => total + candidate.estimatedBytes, 0);
  }
  clearGeneration() {
    this.recorder.transitionToError();
    this.recorder.resetForDeviceLoss();
  }
};
function estimateBytes2(descriptor) {
  if (descriptor.kind === "buffer") {
    return typeof descriptor.size === "number" ? descriptor.size : 0;
  }
  if (descriptor.size === void 0 || typeof descriptor.size === "number") return 4;
  if (Array.isArray(descriptor.size)) {
    return Math.max(
      1,
      (descriptor.size[0] ?? 1) * (descriptor.size[1] ?? 1) * (descriptor.size[2] ?? 1) * 4
    );
  }
  if (!("width" in descriptor.size)) return 4;
  return Math.max(
    1,
    descriptor.size.width * (descriptor.size.height ?? 1) * (descriptor.size.depthOrArrayLayers ?? 1) * 4
  );
}
async function snapshotFrame(recorder, registry, options) {
  const estimatedBytes = registry.estimateSnapshotBytes();
  const requiredBytes = Math.max(1, estimatedBytes);
  if (requiredBytes > options.byteBudget) {
    return err(
      createRhiDebugError("capture-snapshot-failed", {
        stage: "snapshot",
        cause: `snapshot byte budget ${options.byteBudget} is smaller than the ${requiredBytes}-byte capture minimum`
      })
    );
  }
  try {
    const result = await recorder.snapshotAllLiveResources(options.snapshotTimeoutMs);
    if (result.ok) return ok(void 0);
    return err(result.error);
  } catch (cause) {
    return err(
      createRhiDebugError("capture-snapshot-failed", {
        stage: "snapshot",
        cause: String(cause)
      })
    );
  }
}

// src/recorder/session.ts
function attachRecorder(backend, options = {}) {
  const proxy = createRecorderProxy(backend);
  const registry = new ResourceRegistry(proxy.recorder);
  let phase = "idle";
  let generation = 0;
  let active;
  const fail = (code, cause) => err(createRhiDebugError(code, { stage: "capture", cause }));
  const settle = (result) => {
    const request = active;
    if (request === void 0) return;
    active = void 0;
    request.signal?.removeEventListener("abort", request.abortListener ?? (() => {
    }));
    if (!result.ok && proxy.recorder.getState() === "error") proxy.recorder.disposeError();
    phase = phase === "disposed" ? "disposed" : "idle";
    request.resolve(result);
  };
  const abort = () => {
    if (active === void 0) return;
    proxy.recorder.transitionToError();
    settle(fail("capture-unavailable", "capture request was aborted"));
  };
  const attachment = {
    backend: proxy.backend,
    captureFrame(captureOptions = {}) {
      if (phase === "disposed")
        return Promise.resolve(fail("capture-unavailable", "recorder is disposed"));
      if (active !== void 0)
        return Promise.resolve(fail("capture-busy", "another capture is active"));
      const signal = captureOptions.signal;
      if (signal?.aborted)
        return Promise.resolve(fail("capture-unavailable", "capture request was aborted"));
      const arm = proxy.recorder.arm(1);
      if (!arm.ok) return Promise.resolve(fail("capture-busy", arm.error.hint));
      phase = "armed";
      generation += 1;
      return new Promise((resolve) => {
        const request = {
          generation,
          options: captureOptions,
          resolve,
          ...signal === void 0 ? {} : { signal }
        };
        request.abortListener = abort;
        active = request;
        signal?.addEventListener("abort", abort, { once: true });
      });
    },
    async frameBoundary() {
      if (phase === "disposed" || active === void 0) return ok(void 0);
      const request = active;
      if (request.generation !== generation) return ok(void 0);
      if (phase === "armed") {
        phase = "snapshotting";
        const result2 = await snapshotFrame(proxy.recorder, registry, {
          snapshotTimeoutMs: request.options.snapshotTimeoutMs ?? options.snapshotTimeoutMs ?? 3e4,
          byteBudget: request.options.byteBudget ?? options.byteBudget ?? Number.MAX_SAFE_INTEGER
        });
        if (!result2.ok) {
          proxy.recorder.transitionToError();
          settle(err(result2.error));
          return err(result2.error);
        }
        phase = "recording";
        return ok(void 0);
      }
      if (phase !== "recording") return ok(void 0);
      proxy.recorder.onFrameEnd();
      if (proxy.recorder.getState() !== "idle") return ok(void 0);
      const result = assembleTape(proxy.recorder);
      settle(result);
      return result.ok ? ok(void 0) : err(result.error);
    },
    deviceLost() {
      generation += 1;
      registry.clearGeneration();
      if (active !== void 0) {
        phase = "idle";
        settle(fail("capture-unavailable", "device loss invalidated the active generation"));
      } else if (phase !== "disposed") {
        phase = "idle";
      }
    },
    async dispose() {
      if (phase === "disposed") return ok(void 0);
      if (active !== void 0) {
        proxy.recorder.transitionToError();
        settle(fail("capture-unavailable", "recorder was disposed during capture"));
      }
      proxy.recorder.disposeError();
      phase = "disposed";
      return ok(void 0);
    }
  };
  return ok(attachment);
}

// src/replay/device-request.ts
var RECORDED_CAPABILITY_FEATURES = [
  ["timestampQuery", "timestamp-query"],
  ["textureCompressionBc", "texture-compression-bc"],
  ["textureCompressionEtc2", "texture-compression-etc2"],
  ["textureCompressionAstc", "texture-compression-astc"],
  ["firstInstanceIndirect", "indirect-first-instance"],
  ["float32Filterable", "float32-filterable"],
  ["rg11b10ufloatRenderable", "rg11b10ufloat-renderable"]
];
function replayDeviceRequest(tape, adapterFeatures, adapterLimits) {
  const requiredFeatures = RECORDED_CAPABILITY_FEATURES.filter(
    ([capability, feature]) => tape.header.rhiCaps[capability] === true && adapterFeatures.has(feature)
  ).map(([, feature]) => feature);
  const limitEntries = Object.entries(adapterLimits).filter(
    ([, value]) => Number.isFinite(value) && value >= 0
  );
  const request = {};
  if (requiredFeatures.length > 0) request.requiredFeatures = requiredFeatures;
  if (limitEntries.length > 0) {
    request.requiredLimits = Object.fromEntries(limitEntries);
  }
  return request;
}
function eventRecord(event) {
  return JSON.parse(JSON.stringify(event));
}
function eventFailure(eventIndex, event, stage, cause) {
  return err(
    createRhiDebugError("replay-event-failed", {
      eventIndex,
      kind: event.kind,
      stage,
      cause: cause instanceof Error ? cause.message : String(cause)
    })
  );
}
function blob(tape, hash, event, eventIndex) {
  const found = tape.blobs.find((candidate) => candidate.hash === hash);
  return found === void 0 ? eventFailure(eventIndex, event, "lookup", `blob ${hash} is missing`) : ok(found.bytes);
}
function clearBuffer(context, event, eventIndex) {
  const encoder = requireResource(
    context,
    event.cmdHandleId,
    "encoder",
    eventIndex,
    event.kind,
    "command"
  );
  const buffer = requireResource(context, event.handleId, "buffer", eventIndex, event.kind);
  if (!encoder.ok) return encoder;
  if (!buffer.ok) return buffer;
  encoder.value.clearBuffer(buffer.value, event.offset, event.size);
  return ok(void 0);
}
function commandEncoderCall(context, event, eventIndex, call) {
  const encoder = requireResource(
    context,
    event.cmdHandleId,
    "encoder",
    eventIndex,
    event.kind,
    "command"
  );
  if (!encoder.ok) return encoder;
  call(encoder.value);
  return ok(void 0);
}
function finish(context, event, eventIndex) {
  const encoder = requireResource(
    context,
    event.cmdHandleId,
    "encoder",
    eventIndex,
    event.kind,
    "command"
  );
  if (!encoder.ok) return encoder;
  const result = encoder.value.finish();
  if (!result.ok) return eventFailure(eventIndex, event, "finish", result.error);
  return context.table.set(
    event.cmdHandleId,
    { kind: "encoder", role: "command-buffer", value: result.value },
    eventRecord(event)
  );
}
function endPass(context, event, eventIndex, role) {
  const pass = requireResource(
    context,
    event.passHandleId,
    "encoder",
    eventIndex,
    event.kind,
    role
  );
  if (!pass.ok) return pass;
  pass.value.end();
  context.table.delete(event.passHandleId);
  return ok(void 0);
}
function seedInitialData(context, event, eventIndex) {
  const entry = context.table.get(event.handleId);
  const bytes = blob(context.tape, event.dataHash, event, eventIndex);
  if (!bytes.ok) return bytes;
  if (entry?.resource.kind === "buffer") {
    const result = context.queue.writeBuffer(entry.resource.value, 0, bytes.value);
    return result.ok ? ok(void 0) : eventFailure(eventIndex, event, "write", result.error);
  }
  return eventFailure(
    eventIndex,
    event,
    "lookup",
    "initialData currently requires a buffer resource"
  );
}
function requireResource(context, resourceId, kind, eventIndex, eventKind, role) {
  const entry = context.table.get(resourceId);
  if (entry === void 0 || entry.resource.kind !== kind || role !== void 0 && entry.resource.role !== role) {
    return missingResource(
      eventIndex,
      { kind: eventKind },
      resourceId,
      `${kind}${role === void 0 ? "" : `/${role}`}`
    );
  }
  return ok(entry.resource.value);
}
function requireReplayResource(context, resourceId, kind, eventIndex, eventKind, role) {
  const entry = context.table.get(resourceId);
  if (entry === void 0 || entry.resource.kind !== kind || role !== void 0) {
    return missingResource(
      eventIndex,
      { kind: eventKind },
      resourceId,
      `${kind}${"" }`
    );
  }
  return ok(entry.resource);
}
function passCall(context, event, eventIndex, role, call) {
  const passId = "passHandleId" in event ? event.passHandleId : void 0;
  if (passId === void 0)
    return eventFailure(eventIndex, event, "lookup", "pass handle is missing");
  const entry = context.table.get(passId);
  const valid = entry?.resource.kind === "encoder" && (role === "pass" || entry.resource.role === role);
  if (!valid || entry === void 0 || entry.resource.kind !== "encoder") {
    return missingResource(eventIndex, event, passId, role);
  }
  return call(entry.resource.value);
}
function pipelineError(result, event, eventIndex) {
  return result.ok ? eventFailure(eventIndex, event, "lookup", "resource has the wrong role") : result;
}
function missingResource(eventIndex, event, resourceId, expected) {
  return eventFailure(eventIndex, event, "lookup", `resource ${resourceId} is not a ${expected}`);
}
function unsupportedEvent(eventIndex, event, cause) {
  return eventFailure(eventIndex, event, "lookup", cause);
}

// src/replay/texture-format.ts
var BYTES_PER_TEXEL = {
  r8unorm: 1,
  rg8unorm: 2,
  rgba8unorm: 4,
  "rgba8unorm-srgb": 4,
  bgra8unorm: 4,
  "bgra8unorm-srgb": 4,
  r16float: 2,
  rg16float: 4,
  rgba16float: 8,
  r32float: 4,
  r32uint: 4,
  rg32float: 8,
  rgba32float: 16,
  rgb10a2unorm: 4,
  rg11b10ufloat: 4
};
var DEPTH_FORMATS = /* @__PURE__ */ new Set([
  "depth16unorm",
  "depth24plus",
  "depth24plus-stencil8",
  "depth32float",
  "depth32float-stencil8"
]);
function isDepthTextureFormat(format) {
  return DEPTH_FORMATS.has(format);
}
function isDepthStencilTextureFormat(format) {
  return format.endsWith("-stencil8");
}
function getTextureReadbackPlan(descriptor) {
  if (descriptor.dimension === "3d") {
    return {
      supported: false,
      format: descriptor.format,
      reason: "3D texture volume readback is outside the v7 core matrix"
    };
  }
  if (/^(bc|etc2|eac|astc)-/.test(descriptor.format)) {
    return {
      supported: false,
      format: descriptor.format,
      reason: "compressed texture readback has no core decoder"
    };
  }
  if (DEPTH_FORMATS.has(descriptor.format)) {
    return {
      supported: true,
      format: descriptor.format,
      bytesPerTexel: 4,
      blockWidth: 1,
      blockHeight: 1
    };
  }
  const bytesPerTexel2 = BYTES_PER_TEXEL[descriptor.format];
  if (bytesPerTexel2 === void 0) {
    return {
      supported: false,
      format: descriptor.format,
      reason: "texture format is not in the v7 readback matrix"
    };
  }
  return {
    supported: true,
    format: descriptor.format,
    bytesPerTexel: bytesPerTexel2,
    blockWidth: 1,
    blockHeight: 1
  };
}
function textureBytesPerTexel(format) {
  return BYTES_PER_TEXEL[format] ?? (DEPTH_FORMATS.has(format) ? 4 : void 0);
}

// src/replay/execute.ts
async function executeEvent(context, event, eventIndex) {
  try {
    switch (event.kind) {
      case "frameMark":
        return ok(void 0);
      case "createBuffer":
        return createResource(context, eventIndex, event, context.device.createBuffer(event.desc), {
          kind: "buffer"
        });
      case "createTexture":
        return createResource(
          context,
          eventIndex,
          event,
          context.device.createTexture(replayTextureDescriptor(event.desc)),
          {
            kind: "texture"
          }
        );
      case "createQuerySet":
        return createResource(
          context,
          eventIndex,
          event,
          context.device.createQuerySet(event.desc),
          { kind: "query-set" }
        );
      case "destroyBuffer":
        return destroyResource(context, eventIndex, event, "buffer");
      case "destroyTexture":
        return destroyResource(context, eventIndex, event, "texture");
      case "destroyQuerySet":
        return destroyQuerySet(context, event, eventIndex);
      case "createTextureView": {
        const texture = requireResource(
          context,
          event.sourceHandleId,
          "texture",
          eventIndex,
          event.kind
        );
        if (!texture.ok) return texture;
        return createResource(
          context,
          eventIndex,
          event,
          context.device.createTextureView(texture.value, event.desc),
          { kind: "texture-view" },
          event.resultHandleId
        );
      }
      case "createSampler":
        return createResource(
          context,
          eventIndex,
          event,
          context.device.createSampler(event.desc),
          {
            kind: "sampler"
          }
        );
      case "createBindGroupLayout":
        return createResource(
          context,
          eventIndex,
          event,
          context.device.createBindGroupLayout(event.desc),
          { kind: "binding", role: "bind-group-layout" }
        );
      case "getBindGroupLayout": {
        const pipeline = requireReplayResource(
          context,
          event.pipelineHandleId,
          "pipeline",
          eventIndex,
          event.kind
        );
        if (!pipeline.ok) return pipeline;
        return createResource(
          context,
          eventIndex,
          event,
          ok(
            pipeline.value.value.getBindGroupLayout(event.index)
          ),
          { kind: "binding", role: "bind-group-layout" }
        );
      }
      case "createBindGroup":
        return createBindGroup(context, event, eventIndex);
      case "createPipelineLayout":
        return createPipelineLayout(context, event, eventIndex);
      case "createRenderPipeline":
        return createRenderPipeline(context, event, eventIndex);
      case "createComputePipeline":
        return createComputePipeline(context, event, eventIndex);
      case "createShaderModule":
        return createShaderModule(context, event, eventIndex);
      case "createCommandEncoder":
        return createResource(
          context,
          eventIndex,
          event,
          context.device.createCommandEncoder(event.desc),
          { kind: "encoder", role: "command" },
          event.cmdHandleId
        );
      case "writeBuffer":
        return writeBuffer(context, event, eventIndex);
      case "writeTexture":
        return writeTexture(context, event, eventIndex);
      case "copyExternalImageToTexture":
        return unsupportedEvent(eventIndex, event, "external image sources are not self-contained");
      case "submit":
        return submit(context, event, eventIndex);
      case "beginRenderPass":
        return beginRenderPass(context, event, eventIndex);
      case "beginComputePass":
        return beginComputePass(context, event, eventIndex);
      case "resolveQuerySet":
        return resolveQuerySet(context, event, eventIndex);
      case "beginOcclusionQuery":
        return passCall(context, event, eventIndex, "render-pass", (pass) => {
          const result = pass.beginOcclusionQuery(event.queryIndex);
          return result.ok ? ok(void 0) : eventFailure(eventIndex, event, "encode", result.error);
        });
      case "endOcclusionQuery":
        return passCall(context, event, eventIndex, "render-pass", (pass) => {
          const result = pass.endOcclusionQuery();
          return result.ok ? ok(void 0) : eventFailure(eventIndex, event, "encode", result.error);
        });
      case "copyBufferToBuffer":
        return copyBufferToBuffer(context, event, eventIndex);
      case "copyBufferToTexture":
        return copyBufferToTexture(context, event, eventIndex);
      case "copyTextureToBuffer":
        return copyTextureToBuffer(context, event, eventIndex);
      case "copyTextureToTexture":
        return copyTextureToTexture(context, event, eventIndex);
      case "clearBuffer":
        return clearBuffer(context, event, eventIndex);
      case "pushDebugGroup":
        return commandEncoderCall(
          context,
          event,
          eventIndex,
          (encoder) => encoder.pushDebugGroup(event.groupLabel)
        );
      case "popDebugGroup":
        return commandEncoderCall(context, event, eventIndex, (encoder) => encoder.popDebugGroup());
      case "insertDebugMarker":
        return commandEncoderCall(
          context,
          event,
          eventIndex,
          (encoder) => encoder.insertDebugMarker(event.markerLabel)
        );
      case "finish":
        return finish(context, event, eventIndex);
      case "setPipeline":
        return passCall(context, event, eventIndex, "render-pass", (pass) => {
          const pipeline = requireReplayResource(
            context,
            event.pipelineHandleId,
            "pipeline",
            eventIndex,
            event.kind
          );
          if (!pipeline.ok || pipeline.value.role !== "render")
            return pipelineError(pipeline, event, eventIndex);
          pass.setPipeline(pipeline.value.value);
          return ok(void 0);
        });
      case "setVertexBuffer":
        return passCall(context, event, eventIndex, "render-pass", (pass) => {
          const buffer = requireResource(
            context,
            event.bufferHandleId,
            "buffer",
            eventIndex,
            event.kind
          );
          if (!buffer.ok) return buffer;
          pass.setVertexBuffer(event.slot, buffer.value, event.offset, event.size);
          return ok(void 0);
        });
      case "setIndexBuffer":
        return passCall(context, event, eventIndex, "render-pass", (pass) => {
          const buffer = requireResource(
            context,
            event.bufferHandleId,
            "buffer",
            eventIndex,
            event.kind
          );
          if (!buffer.ok) return buffer;
          pass.setIndexBuffer(buffer.value, event.format, event.offset, event.size);
          return ok(void 0);
        });
      case "setBindGroup":
        return passCall(context, event, eventIndex, "pass", (pass) => {
          const bindGroup = requireReplayResource(
            context,
            event.bindGroupHandleId,
            "binding",
            eventIndex,
            event.kind
          );
          if (!bindGroup.ok || bindGroup.value.role !== "bind-group")
            return pipelineError(bindGroup, event, eventIndex);
          pass.setBindGroup(event.index, bindGroup.value.value, event.dynamicOffsets);
          return ok(void 0);
        });
      case "draw":
        return passCall(context, event, eventIndex, "render-pass", (pass) => {
          pass.draw(event.vertexCount, event.instanceCount, event.firstVertex, event.firstInstance);
          return ok(void 0);
        });
      case "drawIndexed":
        return passCall(context, event, eventIndex, "render-pass", (pass) => {
          pass.drawIndexed(
            event.indexCount,
            event.instanceCount,
            event.firstIndex,
            event.baseVertex,
            event.firstInstance
          );
          return ok(void 0);
        });
      case "setViewport":
        return passCall(context, event, eventIndex, "render-pass", (pass) => {
          pass.setViewport(event.x, event.y, event.w, event.h, event.minDepth, event.maxDepth);
          return ok(void 0);
        });
      case "setScissorRect":
        return passCall(context, event, eventIndex, "render-pass", (pass) => {
          pass.setScissorRect(event.x, event.y, event.w, event.h);
          return ok(void 0);
        });
      case "setStencilReference":
        return passCall(context, event, eventIndex, "render-pass", (pass) => {
          pass.setStencilReference(event.reference);
          return ok(void 0);
        });
      case "endRenderPass":
        return endPass(context, event, eventIndex, "render-pass");
      case "setBlendConstant":
        return passCall(context, event, eventIndex, "render-pass", (pass) => {
          pass.setBlendConstant(event.color);
          return ok(void 0);
        });
      case "drawIndirect":
        return passCall(context, event, eventIndex, "render-pass", (pass) => {
          const buffer = requireResource(
            context,
            event.indirectBufferHandleId,
            "buffer",
            eventIndex,
            event.kind
          );
          if (!buffer.ok) return buffer;
          pass.drawIndirect(buffer.value, event.indirectOffset);
          return ok(void 0);
        });
      case "drawIndexedIndirect":
        return passCall(context, event, eventIndex, "render-pass", (pass) => {
          const buffer = requireResource(
            context,
            event.indirectBufferHandleId,
            "buffer",
            eventIndex,
            event.kind
          );
          if (!buffer.ok) return buffer;
          pass.drawIndexedIndirect(buffer.value, event.indirectOffset);
          return ok(void 0);
        });
      case "passPushDebugGroup":
        return passCall(context, event, eventIndex, "pass", (pass) => {
          pass.pushDebugGroup(event.groupLabel);
          return ok(void 0);
        });
      case "passPopDebugGroup":
        return passCall(context, event, eventIndex, "pass", (pass) => {
          pass.popDebugGroup();
          return ok(void 0);
        });
      case "passInsertDebugMarker":
        return passCall(context, event, eventIndex, "pass", (pass) => {
          pass.insertDebugMarker(event.markerLabel);
          return ok(void 0);
        });
      case "setComputePipeline":
        return passCall(context, event, eventIndex, "compute-pass", (pass) => {
          const pipeline = requireReplayResource(
            context,
            event.pipelineHandleId,
            "pipeline",
            eventIndex,
            event.kind
          );
          if (!pipeline.ok || pipeline.value.role !== "compute")
            return pipelineError(pipeline, event, eventIndex);
          pass.setPipeline(pipeline.value.value);
          return ok(void 0);
        });
      case "dispatchWorkgroups":
        return passCall(context, event, eventIndex, "compute-pass", (pass) => {
          pass.dispatchWorkgroups(event.x, event.y, event.z);
          return ok(void 0);
        });
      case "dispatchWorkgroupsIndirect":
        return passCall(context, event, eventIndex, "compute-pass", (pass) => {
          const buffer = requireResource(
            context,
            event.indirectBufferHandleId,
            "buffer",
            eventIndex,
            event.kind
          );
          if (!buffer.ok) return buffer;
          pass.dispatchWorkgroupsIndirect(buffer.value, event.indirectOffset);
          return ok(void 0);
        });
      case "endComputePass":
        return endPass(context, event, eventIndex, "compute-pass");
      case "initialData":
        return seedInitialData(context, event, eventIndex);
      default:
        return unsupportedEvent(eventIndex, event, "event kind has no replay executor");
    }
  } catch (cause) {
    return eventFailure(eventIndex, event, "encode", cause);
  }
}
function replayTextureDescriptor(descriptor) {
  if (!isDepthTextureFormat(descriptor.format)) return descriptor;
  return {
    ...descriptor,
    // depth24plus* readback uses a package-owned depth-to-color blit and thus
    // needs the source texture to be bindable on a fresh replay device.
    usage: (descriptor.usage ?? 0) | 4
  };
}
function createResource(context, eventIndex, event, result, shape, resourceId) {
  if (!result.ok) return eventFailure(eventIndex, event, "create", result.error);
  const id = resourceId ?? ("handleId" in event ? event.handleId : void 0);
  if (id === void 0)
    return eventFailure(eventIndex, event, "lookup", "created resource has no handle id");
  const stored = context.table.set(id, { ...shape, value: result.value }, eventRecord(event));
  return stored.ok ? ok(void 0) : stored;
}
function destroyResource(context, eventIndex, event, kind) {
  const entry = context.table.get(event.handleId);
  if (entry === void 0 || entry.resource.kind !== kind)
    return missingResource(eventIndex, event, event.handleId, kind);
  const result = kind === "buffer" ? context.device.destroyBuffer(entry.resource.value) : context.device.destroyTexture(entry.resource.value);
  if (!result.ok) return eventFailure(eventIndex, event, "create", result.error);
  context.table.delete(event.handleId);
  return ok(void 0);
}
function destroyQuerySet(context, event, eventIndex) {
  const entry = context.table.get(event.handleId);
  if (entry?.resource.kind !== "query-set")
    return missingResource(eventIndex, event, event.handleId, "query-set");
  const result = context.device.destroyQuerySet(entry.resource.value);
  if (!result.ok) return eventFailure(eventIndex, event, "create", result.error);
  context.table.delete(event.handleId);
  return ok(void 0);
}
function resolveQuerySet(context, event, eventIndex) {
  const encoder = requireResource(
    context,
    event.cmdHandleId,
    "encoder",
    eventIndex,
    event.kind,
    "command"
  );
  const querySet = requireResource(
    context,
    event.querySetHandleId,
    "query-set",
    eventIndex,
    event.kind
  );
  const destination = requireResource(
    context,
    event.destinationHandleId,
    "buffer",
    eventIndex,
    event.kind
  );
  if (!encoder.ok) return encoder;
  if (!querySet.ok) return querySet;
  if (!destination.ok) return destination;
  const result = encoder.value.resolveQuerySet(
    querySet.value,
    event.firstQuery,
    event.queryCount,
    destination.value,
    event.destinationOffset
  );
  return result.ok ? ok(void 0) : eventFailure(eventIndex, event, "encode", result.error);
}
async function createShaderModule(context, event, eventIndex) {
  const result = await context.createShaderModule(context.device, { code: event.wgslCode });
  return createResource(context, eventIndex, event, result, { kind: "shader-module" });
}
function createBindGroup(context, event, eventIndex) {
  const layout = requireReplayResource(
    context,
    event.layoutHandleId,
    "binding",
    eventIndex,
    event.kind
  );
  if (!layout.ok || layout.value.role !== "bind-group-layout")
    return pipelineError(layout, event, eventIndex);
  const resources = [];
  for (const [index, entry] of event.entries.entries()) {
    const resourceId = event.resourceHandleIds[index];
    if (resourceId === void 0)
      return eventFailure(eventIndex, event, "lookup", "bind group resource handle is missing");
    const resolved = context.table.get(resourceId);
    if (resolved === void 0)
      return missingResource(eventIndex, event, resourceId, entry.resourceKind);
    if (entry.resourceKind === "buffer" && resolved.resource.kind === "buffer") {
      resources.push({
        kind: "buffer",
        value: {
          buffer: resolved.resource.value,
          ...entry.bufferOffset === void 0 ? {} : { offset: entry.bufferOffset },
          ...entry.bufferSize === void 0 ? {} : { size: entry.bufferSize }
        }
      });
    } else if (entry.resourceKind === "sampler" && resolved.resource.kind === "sampler") {
      resources.push({ kind: "sampler", value: resolved.resource.value });
    } else if (entry.resourceKind === "textureView" && resolved.resource.kind === "texture-view") {
      resources.push({ kind: "textureView", value: resolved.resource.value });
    } else {
      return missingResource(eventIndex, event, resourceId, entry.resourceKind);
    }
  }
  const descriptor = {
    layout: layout.value.value,
    entries: event.entries.map((entry, index) => ({
      binding: entry.binding,
      resource: resources[index]
    }))
  };
  return createResource(context, eventIndex, event, context.device.createBindGroup(descriptor), {
    kind: "binding",
    role: "bind-group"
  });
}
function createPipelineLayout(context, event, eventIndex) {
  const layouts = [];
  for (const id of event.bglHandleIds) {
    const layout = requireReplayResource(context, id, "binding", eventIndex, event.kind);
    if (!layout.ok || layout.value.role !== "bind-group-layout")
      return pipelineError(layout, event, eventIndex);
    layouts.push(layout.value.value);
  }
  return createResource(
    context,
    eventIndex,
    event,
    context.device.createPipelineLayout({ bindGroupLayouts: layouts }),
    { kind: "binding", role: "pipeline-layout" }
  );
}
function createRenderPipeline(context, event, eventIndex) {
  const layout = replayPipelineLayout(context, event, eventIndex);
  if (!layout.ok) return layout;
  const vertex = event.desc.vertex;
  const fragment = event.desc.fragment;
  const vertexShader = vertex === void 0 ? void 0 : shaderValue(context, event.vertexShaderModuleHandleId);
  const fragmentShader = fragment === void 0 ? void 0 : shaderValue(context, event.fragmentShaderModuleHandleId);
  const descriptor = {
    ...event.desc,
    layout: layout.value,
    ...vertex === void 0 ? {} : { vertex: { ...vertex, module: vertexShader } },
    ...fragment === void 0 ? {} : {
      fragment: {
        ...fragment,
        module: fragmentShader
      }
    }
  };
  if (vertex !== void 0 && vertexShader === void 0 || fragment !== void 0 && fragmentShader === void 0) {
    return eventFailure(
      eventIndex,
      event,
      "lookup",
      "render pipeline shader module handle is missing"
    );
  }
  return createResource(
    context,
    eventIndex,
    event,
    context.device.createRenderPipeline(descriptor),
    {
      kind: "pipeline",
      role: "render"
    }
  );
}
function createComputePipeline(context, event, eventIndex) {
  const layout = replayPipelineLayout(context, event, eventIndex);
  if (!layout.ok) return layout;
  const shader = shaderValue(context, event.computeShaderModuleHandleId);
  if (shader === void 0)
    return eventFailure(
      eventIndex,
      event,
      "lookup",
      "compute pipeline shader module handle is missing"
    );
  return createResource(
    context,
    eventIndex,
    event,
    context.device.createComputePipeline({
      ...event.desc,
      layout: layout.value,
      compute: { ...event.desc.compute, module: shader }
    }),
    { kind: "pipeline", role: "compute" }
  );
}
function replayPipelineLayout(context, event, eventIndex) {
  if (event.layoutHandleId === "layout:auto") return ok("auto");
  const layout = requireReplayResource(
    context,
    event.layoutHandleId,
    "binding",
    eventIndex,
    event.kind
  );
  if (!layout.ok) return layout;
  if (layout.value.role !== "pipeline-layout")
    return eventFailure(
      eventIndex,
      event,
      "lookup",
      "pipeline layout resource has the wrong binding role"
    );
  return ok(layout.value.value);
}
function shaderValue(context, id) {
  if (id === void 0) return void 0;
  const entry = context.table.get(id);
  if (entry?.resource.kind !== "shader-module") return void 0;
  return entry.resource.value;
}
function writeBuffer(context, event, eventIndex) {
  const buffer = requireResource(context, event.handleId, "buffer", eventIndex, event.kind);
  if (!buffer.ok) return buffer;
  const bytes = blob(context.tape, event.dataHash, event, eventIndex);
  if (!bytes.ok) return bytes;
  const result = context.queue.writeBuffer(
    buffer.value,
    event.bufferOffset,
    bytes.value,
    0,
    event.size
  );
  return result.ok ? ok(void 0) : eventFailure(eventIndex, event, "write", result.error);
}
function writeTexture(context, event, eventIndex) {
  const texture = requireResource(
    context,
    event.destination.textureHandleId,
    "texture",
    eventIndex,
    event.kind
  );
  if (!texture.ok) return texture;
  const bytes = blob(context.tape, event.dataHash, event, eventIndex);
  if (!bytes.ok) return bytes;
  const result = context.queue.writeTexture(
    {
      texture: texture.value,
      mipLevel: event.destination.mipLevel ?? 0,
      origin: event.destination.origin,
      aspect: event.destination.aspect
    },
    bytes.value,
    {
      offset: event.dataLayout.offset ?? 0,
      ...event.dataLayout.bytesPerRow === void 0 ? {} : { bytesPerRow: event.dataLayout.bytesPerRow },
      ...event.dataLayout.rowsPerImage === void 0 ? {} : { rowsPerImage: event.dataLayout.rowsPerImage }
    },
    event.size
  );
  return result.ok ? ok(void 0) : eventFailure(eventIndex, event, "write", result.error);
}
function submit(context, event, eventIndex) {
  const commandBuffers = [];
  for (const id of event.cmdHandleIds) {
    const entry = context.table.get(id);
    if (entry?.resource.kind !== "encoder" || entry.resource.role !== "command-buffer") {
      return missingResource(eventIndex, event, id, "encoder");
    }
    commandBuffers.push(entry.resource.value);
  }
  const result = context.queue.submit(commandBuffers);
  return result.ok ? ok(void 0) : eventFailure(eventIndex, event, "submit", result.error);
}
function beginRenderPass(context, event, eventIndex) {
  const encoder = requireResource(
    context,
    event.cmdHandleId,
    "encoder",
    eventIndex,
    event.kind,
    "command"
  );
  if (!encoder.ok) return encoder;
  const colors = Array.from(event.desc.colorAttachments).map((attachment, index) => {
    if (attachment === null || attachment === void 0) return attachment;
    const viewId = event.colorAttachmentViewHandleIds[index];
    const view = viewId === void 0 ? void 0 : context.table.get(viewId)?.resource;
    if (view?.kind !== "texture-view") throw new Error(`missing color attachment view ${viewId}`);
    const resolveId = event.colorAttachmentResolveTargetHandleIds?.[index];
    const resolve = resolveId === void 0 ? void 0 : context.table.get(resolveId)?.resource;
    return {
      ...attachment,
      view: view.value,
      ...resolve?.kind === "texture-view" ? { resolveTarget: resolve.value } : {}
    };
  });
  const depth = event.depthStencilViewHandleId === void 0 ? void 0 : context.table.get(event.depthStencilViewHandleId)?.resource;
  const querySet = event.occlusionQuerySetHandleId === void 0 ? void 0 : context.table.get(event.occlusionQuerySetHandleId)?.resource;
  if (event.occlusionQuerySetHandleId !== void 0 && querySet?.kind !== "query-set") {
    return missingResource(eventIndex, event, event.occlusionQuerySetHandleId, "query-set");
  }
  const timestamp = replayTimestampWrites(context, event, eventIndex);
  if (!timestamp.ok) return timestamp;
  const descriptor = {
    ...event.desc,
    ...timestamp.value === void 0 ? {} : { timestampWrites: timestamp.value },
    colorAttachments: colors,
    ...depth?.kind === "texture-view" ? {
      depthStencilAttachment: {
        ...event.desc.depthStencilAttachment,
        view: depth.value
      }
    } : {},
    ...querySet?.kind === "query-set" ? { occlusionQuerySet: querySet.value } : {}
  };
  const pass = encoder.value.beginRenderPass(descriptor);
  return context.table.set(
    event.passHandleId,
    { kind: "encoder", role: "render-pass", value: pass },
    eventRecord(event)
  );
}
function replayTimestampWrites(context, event, eventIndex) {
  if (event.desc?.timestampWrites === void 0) return ok(void 0);
  const handle = event.timestampQuerySetHandleId;
  if (handle === void 0)
    return missingResource(eventIndex, event, "timestamp-query-set", "query-set");
  const query = requireResource(
    context,
    handle,
    "query-set",
    eventIndex,
    event.kind
  );
  if (!query.ok) return query;
  return ok({
    ...event.desc.timestampWrites,
    querySet: query.value
  });
}
function beginComputePass(context, event, eventIndex) {
  const encoder = requireResource(
    context,
    event.cmdHandleId,
    "encoder",
    eventIndex,
    event.kind,
    "command"
  );
  if (!encoder.ok) return encoder;
  const timestamp = replayTimestampWrites(context, event, eventIndex);
  if (!timestamp.ok) return timestamp;
  const pass = encoder.value.beginComputePass({
    ...event.desc?.label === void 0 ? {} : { label: event.desc.label },
    ...timestamp.value === void 0 ? {} : { timestampWrites: timestamp.value }
  });
  return context.table.set(
    event.passHandleId,
    { kind: "encoder", role: "compute-pass", value: pass },
    eventRecord(event)
  );
}
function copyBufferToBuffer(context, event, eventIndex) {
  const encoder = requireResource(
    context,
    event.cmdHandleId,
    "encoder",
    eventIndex,
    event.kind,
    "command"
  );
  const source = requireResource(
    context,
    event.sourceHandleId,
    "buffer",
    eventIndex,
    event.kind
  );
  const destination = requireResource(
    context,
    event.destinationHandleId,
    "buffer",
    eventIndex,
    event.kind
  );
  if (!encoder.ok) return encoder;
  if (!source.ok) return source;
  if (!destination.ok) return destination;
  encoder.value.copyBufferToBuffer(
    source.value,
    event.sourceOffset,
    destination.value,
    event.destinationOffset,
    event.size
  );
  return ok(void 0);
}
function copyBufferToTexture(context, event, eventIndex) {
  const encoder = requireResource(
    context,
    event.cmdHandleId,
    "encoder",
    eventIndex,
    event.kind,
    "command"
  );
  const buffer = requireResource(
    context,
    event.source.bufferHandleId,
    "buffer",
    eventIndex,
    event.kind
  );
  const texture = requireResource(
    context,
    event.destination.textureHandleId,
    "texture",
    eventIndex,
    event.kind
  );
  if (!encoder.ok) return encoder;
  if (!buffer.ok) return buffer;
  if (!texture.ok) return texture;
  encoder.value.copyBufferToTexture(
    { ...event.source, buffer: buffer.value },
    { ...event.destination, texture: texture.value },
    event.copySize
  );
  return ok(void 0);
}
function copyTextureToBuffer(context, event, eventIndex) {
  const encoder = requireResource(
    context,
    event.cmdHandleId,
    "encoder",
    eventIndex,
    event.kind,
    "command"
  );
  const texture = requireResource(
    context,
    event.source.textureHandleId,
    "texture",
    eventIndex,
    event.kind
  );
  const buffer = requireResource(
    context,
    event.destination.bufferHandleId,
    "buffer",
    eventIndex,
    event.kind
  );
  if (!encoder.ok) return encoder;
  if (!texture.ok) return texture;
  if (!buffer.ok) return buffer;
  encoder.value.copyTextureToBuffer(
    { ...event.source, texture: texture.value },
    { ...event.destination, buffer: buffer.value },
    event.copySize
  );
  return ok(void 0);
}
function copyTextureToTexture(context, event, eventIndex) {
  const encoder = requireResource(
    context,
    event.cmdHandleId,
    "encoder",
    eventIndex,
    event.kind,
    "command"
  );
  const source = requireResource(
    context,
    event.source.textureHandleId,
    "texture",
    eventIndex,
    event.kind
  );
  const destination = requireResource(
    context,
    event.destination.textureHandleId,
    "texture",
    eventIndex,
    event.kind
  );
  if (!encoder.ok) return encoder;
  if (!source.ok) return source;
  if (!destination.ok) return destination;
  encoder.value.copyTextureToTexture(
    { ...event.source, texture: source.value },
    { ...event.destination, texture: destination.value },
    event.copySize
  );
  return ok(void 0);
}
var COPY_DST_MAP_READ2 = 9;
var GPU_MAP_MODE_READ = 1;
async function readReplayResource(device, table, resourceId, subresource, createShaderModule2) {
  const entry = table.get(resourceId);
  if (entry === void 0)
    return readbackFailure(`resource ${resourceId} is not present in the current generation`);
  let result;
  if (entry.resource.kind === "texture-view") {
    const sourceId = stringField2(entry.descriptor, "sourceHandleId");
    const source = sourceId === void 0 ? void 0 : table.get(sourceId);
    if (source === void 0 || source.resource.kind !== "texture") {
      return readbackFailure(`texture view ${resourceId} has no readable source texture`);
    }
    const sourceSubresource = resolveTextureViewSubresource(entry, source, subresource);
    if (!sourceSubresource.ok) return sourceSubresource;
    result = await readTexture(
      device,
      source,
      resourceId,
      sourceSubresource.value,
      createShaderModule2
    );
  } else if (entry.resource.kind === "texture") {
    result = await readTexture(device, entry, resourceId, subresource, createShaderModule2);
  } else if (entry.resource.kind === "buffer") {
    result = await readBuffer(device, entry, resourceId, subresource);
  } else {
    return readbackFailure(`resource ${resourceId} is not readable by the v7 core matrix`);
  }
  if (!result.ok) return result;
  return ok({
    ...result.value,
    provenance: {
      generation: table.generation,
      resourceId,
      subresource: subresource ?? null
    }
  });
}
function resolveTextureViewSubresource(view, source, requested) {
  if (isBufferRange(requested)) return ok(requested);
  const sourceDescriptor = recordField(source.descriptor, "desc");
  const sourceSize = textureSize(sourceDescriptor?.size);
  const sourceMipCount = numberField(sourceDescriptor, "mipLevelCount") ?? 1;
  const viewDescriptor = recordField(view.descriptor, "desc");
  const baseMipLevel = numberField(viewDescriptor, "baseMipLevel") ?? 0;
  const baseArrayLayer = numberField(viewDescriptor, "baseArrayLayer") ?? 0;
  const mipLevelCount = numberField(viewDescriptor, "mipLevelCount") ?? sourceMipCount - baseMipLevel;
  const arrayLayerCount = numberField(viewDescriptor, "arrayLayerCount") ?? sourceSize.depthOrArrayLayers - baseArrayLayer;
  const localMipLevel = requested?.mipLevel ?? 0;
  const localArrayLayer = requested?.arrayLayer ?? 0;
  if (!validIndex(baseMipLevel, sourceMipCount + 1) || !validIndex(baseArrayLayer, sourceSize.depthOrArrayLayers + 1) || !validIndex(localMipLevel, mipLevelCount) || !validIndex(localArrayLayer, arrayLayerCount) || baseMipLevel + mipLevelCount > sourceMipCount || baseArrayLayer + arrayLayerCount > sourceSize.depthOrArrayLayers) {
    return readbackFailure("texture view subresource is outside the recorded view extent");
  }
  return ok({
    ...requested,
    mipLevel: baseMipLevel + localMipLevel,
    arrayLayer: baseArrayLayer + localArrayLayer,
    aspect: requested?.aspect ?? (viewDescriptor?.aspect === "depth-only" || viewDescriptor?.aspect === "stencil-only" ? viewDescriptor.aspect : "all")
  });
}
async function readBuffer(device, entry, resourceId, subresource) {
  const size = numberField(recordField(entry.descriptor, "desc"), "size");
  if (size === void 0 || !Number.isSafeInteger(size) || size < 0)
    return readbackFailure(`buffer ${resourceId} has no valid recorded size`);
  const request = isBufferRange(subresource) ? subresource : void 0;
  const offset = request?.offset ?? 0;
  const requestedSize = request?.size ?? size - offset;
  if (!validRange(offset, requestedSize, size))
    return readbackFailure(
      `buffer range ${offset}:${requestedSize} escapes ${resourceId} (${size} bytes)`
    );
  const bytes = await copyBufferBytes(
    device,
    entry.resource.value,
    offset,
    requestedSize
  );
  if (!bytes.ok) return bytes;
  return ok({ resourceId, kind: "buffer", bytes: bytes.value });
}
async function readTexture(device, entry, resourceId, subresource, createShaderModule2) {
  const descriptor = recordField(entry.descriptor, "desc");
  const format = stringField2(descriptor, "format");
  const dimension = stringField2(descriptor, "dimension") ?? "2d";
  if (format === void 0) return readbackFailure(`texture ${resourceId} has no recorded format`);
  if ((numberField(descriptor, "sampleCount") ?? 1) > 1) {
    return readbackUnsupported(
      resourceId,
      format,
      "multisampled textures require a single-sample resolve target before readback"
    );
  }
  const plan = getTextureReadbackPlan({ format, dimension });
  if (!plan.supported) {
    return err(
      createRhiDebugError("readback-unsupported", {
        stage: "readback",
        resourceId,
        format,
        reason: plan.reason
      })
    );
  }
  const size = textureSize(recordField(descriptor, "size"));
  const mipLevel = textureSubresourceField(subresource, "mipLevel") ?? 0;
  const arrayLayer = textureSubresourceField(subresource, "arrayLayer") ?? 0;
  const mipCount = numberField(descriptor, "mipLevelCount") ?? 1;
  if (!validIndex(mipLevel, mipCount) || !Number.isInteger(arrayLayer) || arrayLayer < 0 || arrayLayer >= size.depthOrArrayLayers) {
    return readbackFailure(`texture subresource for ${resourceId} is outside the recorded extent`);
  }
  const width = Math.max(1, Math.floor(size.width / 2 ** mipLevel));
  const height = Math.max(1, Math.floor(size.height / 2 ** mipLevel));
  const requestedAspect = textureAspect(subresource);
  if (isDepthStencilTextureFormat(format)) {
    if (requestedAspect === "all") {
      return readbackUnsupported(
        resourceId,
        format,
        `${format} requires an explicit depth-only or stencil-only aspect`
      );
    }
    if (requestedAspect === "stencil-only") {
      const bytes2 = await copyTextureBytes(
        device,
        entry.resource.value,
        align256(width) * height,
        {
          mipLevel,
          arrayLayer,
          aspect: "stencil-only",
          width,
          height,
          bytesPerRow: align256(width),
          rowBytes: width
        }
      );
      if (!bytes2.ok) return bytes2;
      return ok({ resourceId, kind: "texture", format, width, height, bytes: bytes2.value });
    }
    if (format === "depth24plus-stencil8") {
      return blitDepth24PlusTexture(
        device,
        entry.resource.value,
        resourceId,
        format,
        width,
        height,
        mipLevel,
        arrayLayer,
        createShaderModule2
      );
    }
  }
  if (format === "depth24plus") {
    if (requestedAspect === "stencil-only") {
      return readbackUnsupported(resourceId, format, "depth24plus has no stencil aspect");
    }
    return blitDepth24PlusTexture(
      device,
      entry.resource.value,
      resourceId,
      format,
      width,
      height,
      mipLevel,
      arrayLayer,
      createShaderModule2
    );
  }
  const texelBytes = textureBytesPerTexel(format);
  if (texelBytes === void 0)
    return readbackFailure(`texture format ${format} has no byte layout`);
  const rowBytes = width * texelBytes;
  const bytesPerRow = align256(rowBytes);
  const bytes = await copyTextureBytes(
    device,
    entry.resource.value,
    bytesPerRow * height,
    {
      mipLevel,
      arrayLayer,
      aspect: directTextureAspect(format, requestedAspect),
      width,
      height,
      bytesPerRow,
      rowBytes
    }
  );
  if (!bytes.ok) return bytes;
  return ok({ resourceId, kind: "texture", format, width, height, bytes: bytes.value });
}
function readbackUnsupported(resourceId, format, reason) {
  return err(
    createRhiDebugError("readback-unsupported", {
      stage: "readback",
      resourceId,
      format,
      reason
    })
  );
}
function directTextureAspect(format, aspect) {
  if (isDepthTextureFormat(format) && !isDepthStencilTextureFormat(format)) {
    return "depth-only";
  }
  if (isDepthStencilTextureFormat(format) && aspect === "all") return "depth-only";
  return aspect;
}
var DEPTH_BLIT_SHADER = `
@group(0) @binding(0) var sourceDepth: texture_depth_2d;

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
};

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
  var positions = array<vec2<f32>, 3>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>( 3.0, -1.0),
    vec2<f32>(-1.0,  3.0),
  );
  var output: VertexOutput;
  output.position = vec4<f32>(positions[vertexIndex], 0.0, 1.0);
  return output;
}

@fragment
fn fs_main(@builtin(position) position: vec4<f32>) -> @location(0) vec4<f32> {
  let pixel = vec2<i32>(i32(position.x), i32(position.y));
  return vec4<f32>(textureLoad(sourceDepth, pixel, 0), 0.0, 0.0, 1.0);
}
`;
async function blitDepth24PlusTexture(device, source, resourceId, format, width, height, mipLevel, arrayLayer, createShaderModule2) {
  let output;
  let staging;
  let mapped;
  try {
    const sourceView = device.createTextureView(source, {
      dimension: "2d",
      baseMipLevel: mipLevel,
      mipLevelCount: 1,
      baseArrayLayer: arrayLayer,
      arrayLayerCount: 1,
      aspect: "depth-only"
    });
    if (!sourceView.ok)
      return readbackFailure(
        `depth readback source view creation failed: ${sourceView.error.code}`
      );
    const layout = device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: 2,
          texture: { sampleType: "depth", viewDimension: "2d", multisampled: false }
        }
      ]
    });
    if (!layout.ok)
      return readbackFailure(`depth readback bind group layout failed: ${layout.error.code}`);
    const pipelineLayout = device.createPipelineLayout({ bindGroupLayouts: [layout.value] });
    if (!pipelineLayout.ok)
      return readbackFailure(`depth readback pipeline layout failed: ${pipelineLayout.error.code}`);
    const shader = await createShaderModule2(device, {
      code: DEPTH_BLIT_SHADER,
      label: "rhi-debug-depth-readback"
    });
    if (!shader.ok) return readbackFailure(`depth readback shader failed: ${shader.error.code}`);
    const pipeline = device.createRenderPipeline({
      layout: pipelineLayout.value,
      vertex: { module: shader.value, entryPoint: "vs_main", buffers: [] },
      fragment: {
        module: shader.value,
        entryPoint: "fs_main",
        targets: [{ format: "rgba32float" }]
      },
      primitive: { topology: "triangle-list" }
    });
    if (!pipeline.ok)
      return readbackFailure(`depth readback pipeline failed: ${pipeline.error.code}`);
    const bindGroup = device.createBindGroup({
      layout: layout.value,
      entries: [{ binding: 0, resource: { kind: "textureView", value: sourceView.value } }]
    });
    if (!bindGroup.ok)
      return readbackFailure(`depth readback bind group failed: ${bindGroup.error.code}`);
    const outputResult = device.createTexture({
      size: { width, height, depthOrArrayLayers: 1 },
      format: "rgba32float",
      dimension: "2d",
      mipLevelCount: 1,
      sampleCount: 1,
      usage: 17
    });
    if (!outputResult.ok)
      return readbackFailure(`depth readback output texture failed: ${outputResult.error.code}`);
    output = outputResult.value;
    const outputView = device.createTextureView(output, { dimension: "2d" });
    if (!outputView.ok)
      return readbackFailure(`depth readback output view failed: ${outputView.error.code}`);
    const encoderResult = device.createCommandEncoder({});
    if (!encoderResult.ok)
      return readbackFailure(`depth readback encoder failed: ${encoderResult.error.code}`);
    const pass = encoderResult.value.beginRenderPass({
      colorAttachments: [
        {
          view: outputView.value,
          loadOp: "clear",
          storeOp: "store",
          clearValue: { r: 0, g: 0, b: 0, a: 1 }
        }
      ]
    });
    pass.setPipeline(pipeline.value);
    pass.setBindGroup(0, bindGroup.value);
    pass.draw(3, 1, 0, 0);
    pass.end();
    const bytesPerRow = align256(width * 16);
    const created = device.createBuffer({ size: bytesPerRow * height, usage: COPY_DST_MAP_READ2 });
    if (!created.ok)
      return readbackFailure(`depth readback staging buffer failed: ${created.error.code}`);
    staging = created.value;
    encoderResult.value.copyTextureToBuffer(
      { texture: output, aspect: "all" },
      { buffer: staging, offset: 0, bytesPerRow, rowsPerImage: height },
      { width, height, depthOrArrayLayers: 1 }
    );
    const finished = encoderResult.value.finish();
    if (!finished.ok)
      return readbackFailure(`depth readback finish failed: ${finished.error.code}`);
    const submitted = device.queue.submit([finished.value]);
    if (!submitted.ok)
      return readbackFailure(`depth readback submit failed: ${submitted.error.code}`);
    await device.queue.onSubmittedWorkDone();
    const mappedResult = await staging.mapAsync(GPU_MAP_MODE_READ);
    if (!mappedResult.ok)
      return readbackFailure(`depth readback map failed: ${mappedResult.error.code}`);
    mapped = mappedResult.value;
    const range = mapped.getMappedRange(0, bytesPerRow * height);
    if (!range.ok)
      return readbackFailure(`depth readback mapped range failed: ${range.error.code}`);
    const padded = new Uint8Array(range.value);
    const bytes = new Uint8Array(width * height * 4);
    for (let row = 0; row < height; row++) {
      for (let column = 0; column < width; column++) {
        const sourceOffset = row * bytesPerRow + column * 16;
        const targetOffset = (row * width + column) * 4;
        bytes.set(padded.subarray(sourceOffset, sourceOffset + 4), targetOffset);
      }
    }
    return ok({ resourceId, kind: "texture", format, width, height, bytes });
  } catch (cause) {
    return readbackFailure(`depth readback failed: ${messageOf(cause)}`);
  } finally {
    if (mapped !== void 0) mapped.unmap();
    if (staging !== void 0) device.destroyBuffer(staging);
    if (output !== void 0) device.destroyTexture(output);
  }
}
async function copyBufferBytes(device, source, sourceOffset, size) {
  let staging;
  let mapped;
  try {
    const alignedSourceOffset = sourceOffset - sourceOffset % 4;
    const leadingBytes = sourceOffset - alignedSourceOffset;
    const copySize = align4(leadingBytes + size);
    const created = device.createBuffer({ size: Math.max(4, copySize), usage: COPY_DST_MAP_READ2 });
    if (!created.ok)
      return readbackFailure(`staging buffer creation failed: ${created.error.code}`);
    staging = created.value;
    const encoderResult = device.createCommandEncoder({});
    if (!encoderResult.ok)
      return readbackFailure(`readback encoder creation failed: ${encoderResult.error.code}`);
    const encoder = encoderResult.value;
    encoder.copyBufferToBuffer(source, alignedSourceOffset, staging, 0, copySize);
    const finished = encoder.finish();
    if (!finished.ok)
      return readbackFailure(`readback encoder finish failed: ${finished.error.code}`);
    const submitted = device.queue.submit([finished.value]);
    if (!submitted.ok) return readbackFailure(`readback submit failed: ${submitted.error.code}`);
    await device.queue.onSubmittedWorkDone();
    const mappedResult = await staging.mapAsync(GPU_MAP_MODE_READ);
    if (!mappedResult.ok) return readbackFailure(`readback map failed: ${mappedResult.error.code}`);
    mapped = mappedResult.value;
    const range = mapped.getMappedRange(0, copySize);
    if (!range.ok) return readbackFailure(`readback mapped range failed: ${range.error.code}`);
    return ok(new Uint8Array(range.value).slice(leadingBytes, leadingBytes + size));
  } catch (cause) {
    return readbackFailure(`buffer readback failed: ${messageOf(cause)}`);
  } finally {
    if (mapped !== void 0) mapped.unmap();
    if (staging !== void 0) device.destroyBuffer(staging);
  }
}
async function copyTextureBytes(device, source, bufferSize, copy) {
  let staging;
  let mapped;
  try {
    const created = device.createBuffer({ size: bufferSize, usage: COPY_DST_MAP_READ2 });
    if (!created.ok)
      return readbackFailure(`staging buffer creation failed: ${created.error.code}`);
    staging = created.value;
    const encoderResult = device.createCommandEncoder({});
    if (!encoderResult.ok)
      return readbackFailure(`readback encoder creation failed: ${encoderResult.error.code}`);
    const encoder = encoderResult.value;
    encoder.copyTextureToBuffer(
      {
        texture: source,
        mipLevel: copy.mipLevel,
        origin: { x: 0, y: 0, z: copy.arrayLayer },
        aspect: copy.aspect
      },
      {
        buffer: staging,
        offset: 0,
        bytesPerRow: copy.bytesPerRow,
        rowsPerImage: copy.height
      },
      { width: copy.width, height: copy.height, depthOrArrayLayers: 1 }
    );
    const finished = encoder.finish();
    if (!finished.ok)
      return readbackFailure(`readback encoder finish failed: ${finished.error.code}`);
    const submitted = device.queue.submit([finished.value]);
    if (!submitted.ok) return readbackFailure(`readback submit failed: ${submitted.error.code}`);
    await device.queue.onSubmittedWorkDone();
    const mappedResult = await staging.mapAsync(GPU_MAP_MODE_READ);
    if (!mappedResult.ok) return readbackFailure(`readback map failed: ${mappedResult.error.code}`);
    mapped = mappedResult.value;
    const range = mapped.getMappedRange(0, bufferSize);
    if (!range.ok) return readbackFailure(`readback mapped range failed: ${range.error.code}`);
    const padded = new Uint8Array(range.value);
    const bytes = new Uint8Array(copy.rowBytes * copy.height);
    for (let row = 0; row < copy.height; row++) {
      bytes.set(
        padded.subarray(row * copy.bytesPerRow, row * copy.bytesPerRow + copy.rowBytes),
        row * copy.rowBytes
      );
    }
    return ok(bytes);
  } catch (cause) {
    return readbackFailure(`texture readback failed: ${messageOf(cause)}`);
  } finally {
    if (mapped !== void 0) mapped.unmap();
    if (staging !== void 0) device.destroyBuffer(staging);
  }
}
function readbackFailure(cause) {
  return err(createRhiDebugError("readback-failed", { stage: "readback", cause }));
}
function recordField(value, key) {
  const field = value?.[key];
  return field !== null && typeof field === "object" ? field : void 0;
}
function stringField2(value, key) {
  const field = value?.[key];
  return typeof field === "string" ? field : void 0;
}
function numberField(value, key) {
  const field = value?.[key];
  return typeof field === "number" ? field : void 0;
}
function textureSize(value) {
  if (Array.isArray(value)) {
    return {
      width: integerOr(value[0], 1),
      height: integerOr(value[1], integerOr(value[0], 1)),
      depthOrArrayLayers: integerOr(value[2], 1)
    };
  }
  const object = value !== null && typeof value === "object" ? value : void 0;
  return {
    width: integerOr(object?.width, 1),
    height: integerOr(object?.height, integerOr(object?.width, 1)),
    depthOrArrayLayers: integerOr(object?.depthOrArrayLayers, 1)
  };
}
function integerOr(value, fallback) {
  return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : fallback;
}
function textureSubresourceField(value, key) {
  if (value === void 0 || isBufferRange(value)) return void 0;
  return value[key];
}
function textureAspect(value) {
  if (value === void 0 || isBufferRange(value)) return "all";
  return value.aspect ?? "all";
}
function isBufferRange(value) {
  return value !== void 0 && "offset" in value;
}
function validRange(offset, size, total) {
  return Number.isSafeInteger(offset) && Number.isSafeInteger(size) && offset >= 0 && size >= 0 && offset + size <= total;
}
function validIndex(value, count) {
  return Number.isInteger(value) && value >= 0 && value < count;
}
function align256(value) {
  return Math.max(256, Math.ceil(value / 256) * 256);
}
function align4(value) {
  return Math.ceil(value / 4) * 4;
}
function messageOf(cause) {
  return cause instanceof Error ? cause.message : String(cause);
}
var ResourceTable = class {
  constructor(device, generation = 0) {
    this.device = device;
    this.currentGeneration = generation;
  }
  device;
  entries = /* @__PURE__ */ new Map();
  disposed = false;
  currentGeneration;
  get generation() {
    return this.currentGeneration;
  }
  get(resourceId) {
    return this.entries.get(resourceId);
  }
  set(resourceId, resource, descriptor) {
    if (this.disposed) {
      return err(
        createRhiDebugError("replay-position-invalid", {
          requested: this.generation,
          available: -1
        })
      );
    }
    this.entries.set(resourceId, {
      resourceId,
      generation: this.generation,
      resource,
      descriptor
    });
    return ok(void 0);
  }
  delete(resourceId) {
    this.entries.delete(resourceId);
  }
  values() {
    return this.entries.values();
  }
  reset() {
    const result = this.releaseAll();
    if (!result.ok) return result;
    this.entries.clear();
    this.currentGeneration += 1;
    return ok(void 0);
  }
  dispose() {
    if (this.disposed) return ok(void 0);
    const result = this.releaseAll();
    this.entries.clear();
    this.disposed = true;
    return result;
  }
  releaseAll() {
    let firstFailure;
    for (const entry of this.entries.values()) {
      if (entry.resource.kind === "buffer") {
        const result = this.device.destroyBuffer(entry.resource.value);
        if (!result.ok && firstFailure === void 0)
          firstFailure = resourceDisposeFailure(entry.resourceId, result.error.code);
      } else if (entry.resource.kind === "texture") {
        const result = this.device.destroyTexture(entry.resource.value);
        if (!result.ok && firstFailure === void 0)
          firstFailure = resourceDisposeFailure(entry.resourceId, result.error.code);
      } else if (entry.resource.kind === "query-set") {
        const result = this.device.destroyQuerySet(entry.resource.value);
        if (!result.ok && firstFailure === void 0)
          firstFailure = resourceDisposeFailure(entry.resourceId, result.error.code);
      }
    }
    return firstFailure ?? ok(void 0);
  }
};
function resourceDisposeFailure(resourceId, cause) {
  return err(
    createRhiDebugError("replay-event-failed", {
      eventIndex: -1,
      kind: `dispose:${resourceId}`,
      stage: "create",
      cause
    })
  );
}
var SEED_DEPTH = `
@group(0) @binding(0) var savedDepth: texture_2d<f32>;
@vertex fn vs(@builtin(vertex_index) index: u32) -> @builtin(position) vec4<f32> {
  let p = array<vec2<f32>, 3>(vec2<f32>(-1,-1), vec2<f32>(3,-1), vec2<f32>(-1,3));
  return vec4<f32>(p[index],0,1);
}
@fragment fn fs(@builtin(position) p: vec4<f32>) -> @builtin(frag_depth) f32 {
  return textureLoad(savedDepth, vec2<i32>(p.xy), 0).r;
}`;
async function seedDepthInitialData(context, texture, event, bytes, layout, bootstrapIndex) {
  const { device } = context;
  let upload;
  try {
    const extent = projectTextureExtent(event.desc.size);
    upload = device.createTexture({
      size: { width: extent.width, height: extent.height, depthOrArrayLayers: extent.layerCount },
      format: "r32float",
      mipLevelCount: event.desc.mipLevelCount ?? 1,
      usage: 6
    }).unwrap();
    const groupLayout = device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: 2,
          texture: { sampleType: "unfilterable-float", viewDimension: "2d", multisampled: false }
        }
      ]
    }).unwrap();
    const pipelineLayout = device.createPipelineLayout({ bindGroupLayouts: [groupLayout] }).unwrap();
    const shader = (await context.createShaderModule(device, { code: SEED_DEPTH, label: "rhi-debug-seed-depth" })).unwrap();
    const pipeline = device.createRenderPipeline({
      layout: pipelineLayout,
      vertex: { module: shader, entryPoint: "vs", buffers: [] },
      fragment: { module: shader, entryPoint: "fs", targets: [] },
      depthStencil: { format: "depth32float", depthWriteEnabled: true, depthCompare: "always" }
    }).unwrap();
    const encoder = device.createCommandEncoder({ label: "rhi-debug-seed-depth" }).unwrap();
    for (const slice of layout.slices) {
      device.queue.writeTexture(
        { texture: upload, mipLevel: slice.mip, origin: { x: 0, y: 0, z: slice.layer } },
        bytes.subarray(slice.byteOffset, slice.byteOffset + slice.byteLength),
        { bytesPerRow: slice.width * 4, rowsPerImage: slice.height },
        { width: slice.width, height: slice.height, depthOrArrayLayers: 1 }
      ).unwrap();
      const view = {
        dimension: "2d",
        baseMipLevel: slice.mip,
        mipLevelCount: 1,
        baseArrayLayer: slice.layer,
        arrayLayerCount: 1
      };
      const source = device.createTextureView(upload, view).unwrap();
      const destination = device.createTextureView(texture, { ...view, aspect: "depth-only" }).unwrap();
      const group = device.createBindGroup({
        layout: groupLayout,
        entries: [{ binding: 0, resource: { kind: "textureView", value: source } }]
      }).unwrap();
      const pass = encoder.beginRenderPass({
        colorAttachments: [],
        depthStencilAttachment: {
          view: destination,
          depthLoadOp: "clear",
          depthStoreOp: "store",
          depthClearValue: 0
        }
      });
      pass.setPipeline(pipeline);
      pass.setBindGroup(0, group);
      pass.draw(3);
      pass.end();
    }
    device.queue.submit([encoder.finish().unwrap()]).unwrap();
    await device.queue.onSubmittedWorkDone();
    return ok(void 0);
  } catch (cause) {
    return eventFailure(-bootstrapIndex - 1, event, "write", cause);
  } finally {
    if (upload !== void 0) device.destroyTexture(upload);
  }
}

// src/replay/session.ts
async function openReplay(tape, backend) {
  if (tape.header.formatVersion !== 7) {
    return err(
      createRhiDebugError("tape-version-unsupported", {
        foundVersion: tape.header.formatVersion,
        expectedVersion: 7
      })
    );
  }
  const capabilityFailure = checkCapabilities(tape, backend.device);
  if (capabilityFailure !== void 0) return err(capabilityFailure);
  const index = buildTapeIndex(tape);
  const model = buildFrameModel(tape);
  const table = new ResourceTable(backend.device, 0);
  let disposed = false;
  let prepared = false;
  const context = {
    device: backend.device,
    queue: backend.device.queue,
    tape,
    table,
    createShaderModule: backend.createShaderModule
  };
  const reset = async () => {
    const cleared = table.reset();
    if (!cleared.ok) return cleared;
    prepared = false;
    return ok(void 0);
  };
  const prepare = async () => {
    if (prepared) return ok(void 0);
    for (let index2 = 0; index2 < tape.bootstrap.length; index2++) {
      const resource = tape.bootstrap[index2];
      if (resource === void 0) continue;
      const created = await executeBootstrapResource(context, resource, index2);
      if (!created.ok) return created;
      const seeded = await seedBootstrapResource(context, resource, index2);
      if (!seeded.ok) return seeded;
    }
    prepared = true;
    return ok(void 0);
  };
  const session = {
    get generation() {
      return table.generation;
    },
    async inspectWork(workIndex, fields, signal) {
      if (disposed) return positionError(workIndex, index.works.length);
      if (signal?.aborted) return positionError(workIndex, index.works.length);
      const work = index.works[workIndex];
      const modelWork = model.works[workIndex];
      if (work === void 0) return positionError(workIndex, index.works.length);
      if (modelWork === void 0) return positionError(workIndex, index.works.length);
      const cleared = await reset();
      if (!cleared.ok) return cleared;
      const bootstrapped = await prepare();
      if (!bootstrapped.ok) return bootstrapped;
      const replayed = await replayThroughWork(context, index, work, signal);
      if (!replayed.ok) return replayed;
      const attachment = fields?.includes("pixels") ? await readWorkAttachment(context, index, work) : void 0;
      if (attachment !== void 0 && !attachment.ok) return attachment;
      const selectedAttachment = attachment?.ok === true ? {
        ...attachment.value,
        provenance: {
          ...attachment.value.provenance,
          selectedWorkIndex: work.workIndex
        }
      } : void 0;
      const baseInspection = {
        workIndex: work.workIndex,
        eventIndex: work.eventIndex,
        passIndex: work.passIndex,
        attachment: selectedAttachment
      };
      return ok({
        ...baseInspection,
        ...fields?.includes("pipeline") ? { pipeline: modelWork.pipeline } : {},
        ...fields?.includes("bindings") ? {
          bindings: modelWork.bindings,
          vertexBuffers: modelWork.vertexBuffers,
          indexBuffer: modelWork.indexBuffer,
          shaders: modelWork.pipeline.shaders,
          resourceIds: modelWork.bindings.map((binding) => binding.resourceId).filter((resourceId) => resourceId !== null)
        } : {}
      });
    },
    async readResource(resourceId, subresource, signal) {
      if (disposed) {
        return err(
          createRhiDebugError("replay-position-invalid", {
            requested: -1,
            available: 0
          })
        );
      }
      if (signal?.aborted) {
        return err(
          createRhiDebugError("readback-failed", {
            stage: "readback",
            cause: "readback was aborted"
          })
        );
      }
      const cleared = await reset();
      if (!cleared.ok) return cleared;
      const bootstrapped = await prepare();
      if (!bootstrapped.ok) return bootstrapped;
      return readReplayResource(
        backend.device,
        table,
        resourceId,
        subresource,
        backend.createShaderModule
      );
    },
    async readResourceAtWork(resourceId, workIndex, subresource, signal) {
      if (disposed) return positionError(workIndex, index.works.length);
      if (signal?.aborted) {
        return err(
          createRhiDebugError("readback-failed", {
            stage: "readback",
            cause: "readback was aborted"
          })
        );
      }
      const work = index.works[workIndex];
      if (work === void 0 || model.works[workIndex] === void 0) {
        return positionError(workIndex, index.works.length);
      }
      const cleared = await reset();
      if (!cleared.ok) return cleared;
      const bootstrapped = await prepare();
      if (!bootstrapped.ok) return bootstrapped;
      const replayed = await replayThroughWork(context, index, work, signal);
      if (!replayed.ok) return replayed;
      const read = await readReplayResource(
        backend.device,
        table,
        resourceId,
        subresource,
        backend.createShaderModule
      );
      if (!read.ok) return read;
      return ok({
        ...read.value,
        provenance: {
          ...read.value.provenance,
          selectedWorkIndex: work.workIndex
        }
      });
    },
    async dispose() {
      if (disposed) return ok(void 0);
      const result = table.dispose();
      disposed = true;
      prepared = false;
      return result;
    }
  };
  return ok(session);
}
function checkCapabilities(tape, device) {
  const recorded = tape.header.rhiCaps;
  const required = requiredReplayCapabilities(tape);
  const missing = Object.entries(recorded).filter(([key, value]) => {
    if (value !== true || !required.has(key) && isKnownReplayCapability(key)) return false;
    const target = device.caps[key];
    return target !== true;
  });
  if (missing.length === 0) return void 0;
  return createRhiDebugError("replay-capability-mismatch", {
    stage: "replay",
    cause: `missing capabilities: ${missing.map(([key]) => key).join(", ")}`
  });
}
var BC_TEXTURE_FORMATS = /* @__PURE__ */ new Set([
  "bc1-rgba-unorm",
  "bc1-rgba-unorm-srgb",
  "bc2-rgba-unorm",
  "bc2-rgba-unorm-srgb",
  "bc3-rgba-unorm",
  "bc3-rgba-unorm-srgb",
  "bc4-r-unorm",
  "bc4-r-snorm",
  "bc5-rg-unorm",
  "bc5-rg-snorm",
  "bc6h-rgb-ufloat",
  "bc6h-rgb-sfloat",
  "bc7-rgba-unorm",
  "bc7-rgba-unorm-srgb"
]);
var ETC2_TEXTURE_FORMATS = /* @__PURE__ */ new Set([
  "etc2-rgb8unorm",
  "etc2-rgb8unorm-srgb",
  "etc2-rgb8a1unorm",
  "etc2-rgb8a1unorm-srgb",
  "etc2-rgba8unorm",
  "etc2-rgba8unorm-srgb",
  "eac-r11unorm",
  "eac-r11snorm",
  "eac-rg11unorm",
  "eac-rg11snorm"
]);
var KNOWN_REPLAY_CAPABILITIES = /* @__PURE__ */ new Set([
  "rgba16floatRenderable",
  "float32Filterable",
  "textureCompressionBc",
  "textureCompressionEtc2",
  "textureCompressionAstc",
  "storageBuffer",
  "timestampQuery"
]);
function isKnownReplayCapability(key) {
  return KNOWN_REPLAY_CAPABILITIES.has(key);
}
function requiredReplayCapabilities(tape) {
  const required = /* @__PURE__ */ new Set();
  const events = [
    ...tape.bootstrap.map((resource) => resource.create),
    ...tape.events
  ];
  for (const event of events) {
    switch (event.kind) {
      case "createTexture": {
        const formats = [event.desc.format, ...event.desc.viewFormats ?? []];
        for (const format of formats) {
          if (BC_TEXTURE_FORMATS.has(format)) required.add("textureCompressionBc");
          if (ETC2_TEXTURE_FORMATS.has(format)) required.add("textureCompressionEtc2");
          if (format.startsWith("astc-")) required.add("textureCompressionAstc");
          if (format === "rgba16float") required.add("rgba16floatRenderable");
          if (format === "r32float" || format === "rg32float" || format === "rgba32float") {
            required.add("float32Filterable");
          }
        }
        break;
      }
      case "createBindGroupLayout":
        if (Array.from(event.desc.entries).some(
          (entry) => entry.buffer?.type === "storage" || entry.buffer?.type === "read-only-storage"
        )) {
          required.add("storageBuffer");
        }
        break;
      case "createBuffer":
        if ((event.desc.usage & 128) !== 0) required.add("storageBuffer");
        break;
    }
  }
  return required;
}
async function executeBootstrapResource(context, resource, bootstrapIndex) {
  const event = JSON.parse(JSON.stringify(resource.create));
  const replayEvent = event.kind === "createBuffer" && resource.initialData.length > 0 ? { ...event, desc: { ...event.desc, mappedAtCreation: true } } : event;
  const result = await executeEvent(context, replayEvent, -bootstrapIndex - 1);
  return result;
}
async function seedBootstrapResource(context, resource, bootstrapIndex) {
  if (resource.initialData.length === 0) return ok(void 0);
  const entry = context.table.get(resource.handleId);
  const event = JSON.parse(JSON.stringify(resource.create));
  if (entry?.resource.kind === "texture" && event.kind === "createTexture") {
    return seedTextureInitialData(context, entry.resource.value, event, resource, bootstrapIndex);
  }
  if (entry?.resource.kind !== "buffer") {
    return eventFailure(
      -bootstrapIndex - 1,
      event,
      "lookup",
      "bootstrap initialData requires a buffer or supported texture resource"
    );
  }
  const mapped = entry.resource.value;
  if (typeof mapped.getMappedRange !== "function" || typeof mapped.unmap !== "function") {
    if (context.device.caps.backendKind === "null") return ok(void 0);
    return eventFailure(
      -bootstrapIndex - 1,
      event,
      "write",
      "bootstrap buffer mapping is unavailable on the replay backend"
    );
  }
  try {
    const range = mapped.getMappedRange();
    if (!range.ok) return eventFailure(-bootstrapIndex - 1, event, "write", range.error);
    const target = new Uint8Array(range.value);
    for (const slice of resource.initialData) {
      const blob2 = context.tape.blobs.find((candidate) => candidate.hash === slice.hash);
      if (blob2 === void 0) {
        return eventFailure(-bootstrapIndex - 1, event, "lookup", `blob ${slice.hash} is missing`);
      }
      const end = slice.byteOffset + slice.byteLength;
      if (slice.byteOffset < 0 || slice.byteLength < 0 || end > blob2.bytes.byteLength) {
        return eventFailure(
          -bootstrapIndex - 1,
          event,
          "lookup",
          `blob ${slice.hash} does not contain initialData slice [${slice.byteOffset}, ${end})`
        );
      }
      if (slice.byteLength > target.byteLength) {
        return eventFailure(-bootstrapIndex - 1, event, "write", "initialData exceeds buffer size");
      }
      target.set(blob2.bytes.subarray(slice.byteOffset, end));
    }
  } finally {
    mapped.unmap();
  }
  return ok(void 0);
}
async function seedTextureInitialData(context, texture, event, resource, bootstrapIndex) {
  const extent = projectTextureExtent(event.desc.size);
  const layout = computeTextureLayout(
    event.desc.format,
    extent.width,
    extent.height,
    extent.layerCount,
    event.desc.mipLevelCount ?? 1
  );
  if (layout === void 0) {
    return eventFailure(
      -bootstrapIndex - 1,
      event,
      "lookup",
      `texture format '${event.desc.format}' has no known bootstrap byte layout`
    );
  }
  for (const slice of resource.initialData) {
    const blob2 = context.tape.blobs.find((candidate) => candidate.hash === slice.hash);
    if (blob2 === void 0) {
      return eventFailure(-bootstrapIndex - 1, event, "lookup", `blob ${slice.hash} is missing`);
    }
    const end = slice.byteOffset + slice.byteLength;
    if (slice.byteOffset < 0 || slice.byteLength < 0 || end > blob2.bytes.byteLength) {
      return eventFailure(
        -bootstrapIndex - 1,
        event,
        "lookup",
        `blob ${slice.hash} does not contain initialData slice [${slice.byteOffset}, ${end})`
      );
    }
    const bytes = blob2.bytes.subarray(slice.byteOffset, end);
    if (bytes.byteLength !== layout.totalBytes) {
      return eventFailure(
        -bootstrapIndex - 1,
        event,
        "lookup",
        `texture initialData has ${bytes.byteLength} bytes; expected ${layout.totalBytes}`
      );
    }
    if (event.desc.format === "depth32float") {
      const restored = await seedDepthInitialData(
        context,
        texture,
        event,
        bytes,
        layout,
        bootstrapIndex
      );
      if (!restored.ok) return restored;
      continue;
    }
    for (const subresource of layout.slices) {
      const rowBytes = Math.ceil(subresource.width / layout.blockWidth) * layout.bytesPerBlock;
      const rowCount = Math.ceil(subresource.height / layout.blockHeight);
      const subresourceBytes = bytes.subarray(
        subresource.byteOffset,
        subresource.byteOffset + subresource.byteLength
      );
      const written = context.queue.writeTexture(
        {
          texture,
          mipLevel: subresource.mip,
          origin: { x: 0, y: 0, z: subresource.layer },
          aspect: "all"
        },
        subresourceBytes,
        { offset: 0, bytesPerRow: rowBytes, rowsPerImage: rowCount },
        {
          width: Math.ceil(subresource.width / layout.blockWidth) * layout.blockWidth,
          height: Math.ceil(subresource.height / layout.blockHeight) * layout.blockHeight,
          depthOrArrayLayers: 1
        }
      );
      if (!written.ok) {
        return eventFailure(-bootstrapIndex - 1, event, "write", written.error);
      }
    }
  }
  return ok(void 0);
}
async function replayThroughWork(context, index, work, signal) {
  for (let eventIndex = 0; eventIndex <= work.eventIndex; eventIndex++) {
    const event = context.tape.events[eventIndex];
    if (event === void 0) break;
    if (signal?.aborted) {
      return eventFailure(eventIndex, event, "lookup", "inspectWork was aborted");
    }
    const result = await executeEvent(context, event, eventIndex);
    if (!result.ok) return result;
  }
  return finalizeWorkPass(context, index, work);
}
async function finalizeWorkPass(context, index, work) {
  const pass = index.passes.find((candidate) => candidate.passIndex === work.passIndex);
  if (pass === void 0) return ok(void 0);
  const begin = context.tape.events[pass.beginEventIndex];
  if (begin?.kind !== "beginRenderPass" && begin?.kind !== "beginComputePass") return ok(void 0);
  const entry = context.table.get(begin.passHandleId);
  if (entry?.resource.kind !== "encoder" || entry.resource.role !== "render-pass" && entry.resource.role !== "compute-pass") {
    return eventFailure(
      pass.beginEventIndex,
      begin,
      "lookup",
      `pass ${begin.passHandleId} is not open`
    );
  }
  const closed = closeReplayPass(context, entry, begin, pass, work.eventIndex);
  if (!closed.ok) return closed;
  const finishEventIndex = findNextEvent(
    context.tape.events,
    pass.beginEventIndex,
    "finish",
    begin.cmdHandleId
  );
  const encoder = context.table.get(begin.cmdHandleId);
  if (encoder?.resource.kind !== "encoder" || encoder.resource.role !== "command") {
    return eventFailure(
      finishEventIndex ?? work.eventIndex,
      begin,
      "lookup",
      `encoder ${begin.cmdHandleId} is not available`
    );
  }
  const closure = await replayCommandClosure(
    context,
    begin.cmdHandleId,
    (pass.endEventIndex ?? work.eventIndex) + 1,
    finishEventIndex ?? context.tape.events.length
  );
  if (!closure.ok) return closure;
  const groupsClosed = closeReplayDebugGroups(
    context,
    begin.cmdHandleId,
    work.eventIndex,
    encoder.resource.value
  );
  if (!groupsClosed.ok) return groupsClosed;
  const finished = encoder.resource.value.finish();
  const finishEvent = context.tape.events[finishEventIndex ?? work.eventIndex] ?? begin;
  if (!finished.ok)
    return eventFailure(finishEventIndex ?? work.eventIndex, finishEvent, "finish", finished.error);
  context.table.set(begin.cmdHandleId, {
    kind: "encoder",
    role: "command-buffer",
    value: finished.value
  });
  const submitEventIndex = findNextEvent(
    context.tape.events,
    finishEventIndex ?? pass.beginEventIndex,
    "submit",
    begin.cmdHandleId
  );
  const submitted = context.queue.submit([finished.value]);
  const submitEvent = context.tape.events[submitEventIndex ?? work.eventIndex] ?? begin;
  if (!submitted.ok)
    return eventFailure(
      submitEventIndex ?? work.eventIndex,
      submitEvent,
      "submit",
      submitted.error
    );
  await context.queue.onSubmittedWorkDone();
  return ok(void 0);
}
function closeReplayPass(context, entry, begin, pass, selectedEventIndex) {
  const activeQuery = activeOcclusionQuery(
    context.tape.events,
    begin.kind === "beginRenderPass" ? begin.passHandleId : void 0,
    pass.beginEventIndex,
    selectedEventIndex
  );
  if (!activeQuery.ok) return activeQuery;
  try {
    if (activeQuery.value !== void 0) {
      if (entry.resource.role !== "render-pass") {
        return eventFailure(
          activeQuery.value.eventIndex,
          activeQuery.value.event,
          "lookup",
          "an active occlusion query belongs to a non-render pass"
        );
      }
      const endedQuery = entry.resource.value.endOcclusionQuery();
      if (!endedQuery.ok) {
        return eventFailure(
          activeQuery.value.eventIndex,
          activeQuery.value.event,
          "encode",
          endedQuery.error
        );
      }
    }
    if (entry.resource.role === "render-pass") {
      const groupsClosed = closeReplayDebugGroups(
        context,
        begin.passHandleId,
        selectedEventIndex,
        entry.resource.value
      );
      if (!groupsClosed.ok) return groupsClosed;
    }
    entry.resource.value.end();
  } catch (cause) {
    return eventFailure(pass.endEventIndex ?? selectedEventIndex, begin, "encode", cause);
  }
  context.table.delete(begin.passHandleId);
  return ok(void 0);
}
function closeReplayDebugGroups(context, handleId, throughEventIndex, encoder) {
  const open = [];
  for (let eventIndex = 0; eventIndex <= throughEventIndex; eventIndex++) {
    const event = context.tape.events[eventIndex];
    if (event === void 0) continue;
    if (event.kind === "pushDebugGroup" && event.cmdHandleId === handleId || event.kind === "passPushDebugGroup" && event.passHandleId === handleId) {
      open.push({ event, eventIndex });
    } else if (event.kind === "popDebugGroup" && event.cmdHandleId === handleId || event.kind === "passPopDebugGroup" && event.passHandleId === handleId) {
      open.pop();
    }
  }
  for (let index = open.length - 1; index >= 0; index--) {
    const scope = open[index];
    if (scope === void 0) continue;
    try {
      encoder.popDebugGroup();
    } catch (cause) {
      return eventFailure(scope.eventIndex, scope.event, "encode", cause);
    }
  }
  return ok(void 0);
}
async function replayCommandClosure(context, cmdHandleId, start, end) {
  for (let eventIndex = start; eventIndex < end; eventIndex++) {
    const event = context.tape.events[eventIndex];
    if (event === void 0 || !isCommandClosureEvent(event)) continue;
    if (event.cmdHandleId !== cmdHandleId) continue;
    const result = await executeEvent(context, event, eventIndex);
    if (!result.ok) return result;
  }
  return ok(void 0);
}
function activeOcclusionQuery(events, passHandleId, beginEventIndex, selectedEventIndex) {
  if (passHandleId === void 0) return ok(void 0);
  let active;
  for (let eventIndex = beginEventIndex + 1; eventIndex <= selectedEventIndex; eventIndex++) {
    const event = events[eventIndex];
    if (event === void 0 || !("passHandleId" in event) || event.passHandleId !== passHandleId)
      continue;
    if (event.kind === "beginOcclusionQuery") {
      if (active !== void 0) {
        return eventFailure(
          eventIndex,
          event,
          "encode",
          "an occlusion query is already active for this render pass"
        );
      }
      active = { eventIndex, event };
    } else if (event.kind === "endOcclusionQuery") {
      if (active === void 0) {
        return eventFailure(
          eventIndex,
          event,
          "encode",
          "an occlusion query ended without a matching begin"
        );
      }
      active = void 0;
    }
  }
  return ok(active);
}
function isCommandClosureEvent(event) {
  switch (event.kind) {
    case "resolveQuerySet":
    case "copyBufferToBuffer":
    case "copyBufferToTexture":
    case "copyTextureToBuffer":
    case "copyTextureToTexture":
    case "clearBuffer":
      return true;
    default:
      return false;
  }
}
function findNextEvent(events, start, kind, commandId) {
  for (let index = start + 1; index < events.length; index++) {
    const event = events[index];
    if (event?.kind === "finish" && kind === "finish" && event.cmdHandleId === commandId)
      return index;
    if (event?.kind === "submit" && kind === "submit" && event.cmdHandleIds.includes(commandId))
      return index;
  }
  return void 0;
}
function positionError(requested, available) {
  return err(
    createRhiDebugError("replay-position-invalid", {
      requested,
      available
    })
  );
}
async function readWorkAttachment(context, index, work) {
  const pass = index.passes.find((candidate) => candidate.passIndex === work.passIndex);
  const begin = pass === void 0 ? void 0 : context.tape.events[pass.beginEventIndex];
  if (begin?.kind !== "beginRenderPass") {
    return err(
      createRhiDebugError("readback-unsupported", {
        stage: "readback",
        reason: "work has no color attachment"
      })
    );
  }
  const attachmentIndex = begin.colorAttachmentViewHandleIds.findIndex(
    (candidate) => candidate !== void 0
  );
  const viewId = begin.colorAttachmentResolveTargetHandleIds?.[attachmentIndex] ?? begin.colorAttachmentViewHandleIds[attachmentIndex];
  if (viewId === void 0) {
    return err(
      createRhiDebugError("readback-unsupported", {
        stage: "readback",
        reason: "render pass has no readable color attachment view"
      })
    );
  }
  return readReplayResource(
    context.device,
    context.table,
    viewId,
    void 0,
    context.createShaderModule
  );
}

// src/texel-decode.ts
function halfToFloat(h) {
  const sign = (h & 32768) >> 15;
  const exp = (h & 31744) >> 10;
  const frac = h & 1023;
  const s = sign === 0 ? 1 : -1;
  if (exp === 0) {
    return s * 2 ** -14 * (frac / 1024);
  }
  if (exp === 31) {
    return frac === 0 ? s * Number.POSITIVE_INFINITY : Number.NaN;
  }
  return s * 2 ** (exp - 15) * (1 + frac / 1024);
}
function smallUFloatToFloat(bits, mantissaBits) {
  const expBits = 5;
  const exp = bits >> mantissaBits & (1 << expBits) - 1;
  const mantMax = 1 << mantissaBits;
  const frac = bits & mantMax - 1;
  if (exp === 0) return 2 ** -14 * (frac / mantMax);
  if (exp === 31) return frac === 0 ? Number.POSITIVE_INFINITY : Number.NaN;
  return 2 ** (exp - 15) * (1 + frac / mantMax);
}
var clamp01 = (v) => v < 0 ? 0 : v > 1 ? 1 : v;
function toByte(v, channelType) {
  if (channelType === "uint" || channelType === "sint") {
    return Math.round(v < 0 ? 0 : v > 255 ? 255 : v);
  }
  return Math.round(clamp01(v) * 255);
}
function readTexel(view, off, info, channelBytes) {
  const out = [0, 0, 0, 1];
  if (info.packed === "rgb10a2unorm") {
    const word = view.getUint32(off, true);
    out[0] = (word & 1023) / 1023;
    out[1] = (word >> 10 & 1023) / 1023;
    out[2] = (word >> 20 & 1023) / 1023;
    out[3] = (word >> 30 & 3) / 3;
    return out;
  }
  if (info.packed === "rg11b10ufloat") {
    const word = view.getUint32(off, true);
    out[0] = smallUFloatToFloat(word & 2047, 6);
    out[1] = smallUFloatToFloat(word >> 11 & 2047, 6);
    out[2] = smallUFloatToFloat(word >> 22 & 1023, 5);
    out[3] = 1;
    return out;
  }
  for (let c = 0; c < info.channels; c++) {
    const co = off + c * channelBytes;
    let v;
    switch (info.channelType) {
      case "float":
        v = channelBytes === 2 ? halfToFloat(view.getUint16(co, true)) : view.getFloat32(co, true);
        break;
      case "unorm":
        v = channelBytes === 1 ? view.getUint8(co) / 255 : channelBytes === 2 ? view.getUint16(co, true) / 65535 : view.getUint32(co, true) / 4294967295;
        break;
      case "snorm": {
        const raw = channelBytes === 1 ? view.getInt8(co) : channelBytes === 2 ? view.getInt16(co, true) : view.getInt32(co, true);
        const denom = channelBytes === 1 ? 127 : channelBytes === 2 ? 32767 : 2147483647;
        v = Math.max(-1, raw / denom);
        break;
      }
      case "uint":
        v = channelBytes === 1 ? view.getUint8(co) : channelBytes === 2 ? view.getUint16(co, true) : view.getUint32(co, true);
        break;
      case "sint":
        v = channelBytes === 1 ? view.getInt8(co) : channelBytes === 2 ? view.getInt16(co, true) : view.getInt32(co, true);
        break;
      default:
        v = 0;
    }
    out[c] = v;
  }
  return out;
}
function decodeToRgba8(bytes, format, width, height, aspect = "all") {
  if (format.startsWith("depth")) {
    return decodeDepthToRgba8(bytes, format, width, height, aspect);
  }
  const info = formatInfo(format);
  const texBytes = bytesPerTexel(format);
  if (!info || texBytes === void 0) return null;
  const channelBytes = info.packed ? texBytes : texBytes / info.channels;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const out = new Uint8ClampedArray(new ArrayBuffer(width * height * 4));
  for (let i = 0; i < width * height; i++) {
    const [c0, c1, c2, c3] = readTexel(view, i * texBytes, info, channelBytes);
    const di = i * 4;
    if (info.channels === 1) {
      const g = toByte(c0, info.channelType);
      out[di] = g;
      out[di + 1] = g;
      out[di + 2] = g;
      out[di + 3] = 255;
    } else if (info.channels === 2) {
      out[di] = toByte(c0, info.channelType);
      out[di + 1] = toByte(c1, info.channelType);
      out[di + 2] = 0;
      out[di + 3] = 255;
    } else {
      const r = info.bgra ? c2 : c0;
      const b = info.bgra ? c0 : c2;
      out[di] = toByte(r, info.channelType);
      out[di + 1] = toByte(c1, info.channelType);
      out[di + 2] = toByte(b, info.channelType);
      out[di + 3] = info.channels === 4 ? toByte(c3, info.channelType) : 255;
    }
  }
  return out;
}
function decodeDepthToRgba8(bytes, format, width, height, aspect) {
  const combined = format.endsWith("-stencil8");
  if (combined && aspect === "all") return null;
  if (!combined && aspect === "stencil-only") return null;
  const stencil = aspect === "stencil-only";
  const bytesPerValue = stencil ? 1 : 4;
  const texelCount = width * height;
  if (bytes.byteLength < texelCount * bytesPerValue) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const out = new Uint8ClampedArray(new ArrayBuffer(texelCount * 4));
  for (let index = 0; index < texelCount; index++) {
    const value = stencil ? view.getUint8(index) : Math.round(clamp01(view.getFloat32(index * 4, true)) * 255);
    const target = index * 4;
    out[target] = value;
    out[target + 1] = value;
    out[target + 2] = value;
    out[target + 3] = 255;
  }
  return out;
}
function decodeTexelRaw(bytes, format, width, height, texelX, texelY) {
  if (texelX < 0 || texelX >= width || texelY < 0 || texelY >= height) return null;
  const info = formatInfo(format);
  const texBytes = bytesPerTexel(format);
  if (!info || texBytes === void 0) return null;
  const texelIdx = texelY * width + texelX;
  const byteOffset = texelIdx * texBytes;
  if (byteOffset + texBytes > bytes.byteLength) return null;
  const channelBytes = info.packed ? texBytes : texBytes / info.channels;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const channels = readTexel(view, byteOffset, info, channelBytes);
  if (info.channels === 1) {
    return [channels[0], channels[0], channels[0], 1];
  }
  if (info.channels === 2) {
    return [channels[0], channels[1], 0, 1];
  }
  const r = info.bgra ? channels[2] : channels[0];
  const b = info.bgra ? channels[0] : channels[2];
  const a = info.channels === 4 ? channels[3] : 1;
  return [r, channels[1], b, a];
}

export { EVENT_SEMANTICS, TAPE_MAGIC, TAPE_FORMAT_VERSION as V7_TAPE_FORMAT_VERSION, attachRecorder, buildFrameModel, buildResourceLifecycle, buildTapeIndex, bytesPerTexel, createRhiDebugError, decodeTape, decodeTexelRaw, decodeToRgba8, encodeTape, eventKinds, formatInfo, halfToFloat, isWorkEvent, openReplay, readbackTexturePixels, replayDeviceRequest, resourceKindForEvent, summarizeFrame, digestBytes as tapeDigest, workEventKinds };
