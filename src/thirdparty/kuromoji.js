export const kuromoji=function(t){var e={};function n(r){if(e[r])return e[r].exports;var i=e[r]={i:r,l:!1,exports:{}};return t[r].call(i.exports,i,i.exports,n),i.l=!0,i.exports}return n.m=t,n.c=e,n.d=function(t,e,r){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:r})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var i in t)n.d(r,i,function(e){return t[e]}.bind(null,i));return r},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=11)}([function(t,e,n){const r=n(1);t.exports=class{constructor(){this.dictionary=new r(10485760),this.target_map={},this.pos_buffer=new r(10485760)}buildDictionary(t){const e={};return t.forEach(t=>{if(t.length<4)return;const[n,r,i,o]=t,s=t.slice(4).join(",");Number.isFinite(+r)&&Number.isFinite(+i)&&Number.isFinite(+o)||console.log(t);const a=this.put(r,i,o,n,s);e[a]=n}),this.dictionary.shrink(),this.pos_buffer.shrink(),e}put(t,e,n,r,i){const o=this.dictionary.position,s=this.pos_buffer.position;return this.dictionary.putShort(t),this.dictionary.putShort(e),this.dictionary.putShort(n),this.dictionary.putInt(s),this.pos_buffer.putString(`${r},${i}`),o}addMapping(t,e){const n=this.target_map[t]||[];n.push(e),this.target_map[t]=n}targetMapToBuffer(){const t=new r,e=Object.keys(this.target_map).length;t.putInt(e);for(const e in this.target_map){const n=this.target_map[e],r=n.length;t.putInt(parseInt(e,10)),t.putInt(r);for(let e=0;e<n.length;e+=1)t.putInt(n[e])}return t.shrink()}loadDictionary(t){return this.dictionary=new r(t),this}loadPosVector(t){return this.pos_buffer=new r(t),this}loadTargetMap(t){const e=new r(t);for(e.position=0,this.target_map={},e.readInt();!(e.buffer.length<e.position+1);){const t=e.readInt(),n=e.readInt();for(let r=0;r<n;r+=1){const n=e.readInt();this.addMapping(t,n)}}return this}getFeatures(t){const e=parseInt(t,10);if(Number.isNaN(e))return"";const n=this.dictionary.getInt(e+6);return this.pos_buffer.getString(n)}}},function(t,e){t.exports=class{constructor(t){let e;if(null==t)e=1048576;else{if("number"!=typeof t){if(t instanceof Uint8Array)return this.buffer=t,void(this.position=0);throw new Error(typeof t+" is invalid parameter type for ByteBuffer constructor")}e=t}this.buffer=new Uint8Array(e),this.position=0}size(){return this.buffer.length}reallocate(){const t=new Uint8Array(2*this.buffer.length);t.set(this.buffer),this.buffer=t}shrink(){return this.buffer=this.buffer.subarray(0,this.position),this.buffer}put(t){this.buffer.length<this.position+1&&this.reallocate(),this.buffer[this.position]=t,this.position+=1}get(t){return null==t&&(t=this.position,this.position+=1),this.buffer.length<t+1?0:this.buffer[t]}putShort(t){if(t>65535)throw new Error(t+" is over short value");const e=255&t,n=(65280&t)>>8;this.put(e),this.put(n)}getShort(t){if(null==t&&(t=this.position,this.position+=2),this.buffer.length<t+2)return 0;const e=this.buffer[t];let n=(this.buffer[t+1]<<8)+e;return 32768&n&&(n=-(n-1^65535)),n}putInt(t){if(t>4294967295)throw new Error(t+" is over integer value");const e=255&t,n=(65280&t)>>8,r=(16711680&t)>>16,i=(4278190080&t)>>24;this.put(e),this.put(n),this.put(r),this.put(i)}getInt(t){if(null==t&&(t=this.position,this.position+=4),this.buffer.length<t+4)return 0;const e=this.buffer[t],n=this.buffer[t+1],r=this.buffer[t+2];return(this.buffer[t+3]<<24)+(r<<16)+(n<<8)+e}readInt(){const t=this.position;return this.position+=4,this.getInt(t)}putString(t){(t=>new TextEncoder("utf-8").encode(t))(t).forEach(t=>this.put(t)),this.put(0)}getString(t){const e=[];let n;for(null==t&&(t=this.position);!(this.buffer.length<t+1)&&(n=this.get(t++),0!==n);)e.push(n);return this.position=t,(t=>{const e=new Uint8Array(t);return(new TextDecoder).decode(e)})(e)}}},function(t,e){t.exports=function(t,e,n,r,i,o,s,a){this.name=t,this.cost=e,this.start_pos=n,this.length=r,this.left_id=o,this.right_id=s,this.prev=null,this.surface_form=a,this.shortest_cost="BOS"===i?0:Number.MAX_VALUE,this.type=i}},function(t,e){class n{constructor(t){this.str=t,this.index_mapping=[];for(let e=0;e<t.length;e+=1){const r=t.charAt(e);this.index_mapping.push(e),n.isSurrogatePair(r)&&(e+=1)}this.length=this.index_mapping.length}slice(t){if(this.index_mapping.length<=t)return"";const e=this.index_mapping[t];return this.str.slice(e)}charAt(t){if(this.str.length<=t)return"";const e=this.index_mapping[t],n=this.index_mapping[t+1];return null==n?this.str.slice(e):this.str.slice(e,n)}charCodeAt(t){if(this.index_mapping.length<=t)return NaN;const e=this.index_mapping[t],n=this.str.charCodeAt(e);if(n>=55296&&n<=56319&&e<this.str.length){const t=this.str.charCodeAt(e+1);if(t>=56320&&t<=57343)return 1024*(n-55296)+t-56320+65536}return n}toString(){return this.str}static isSurrogatePair(t){const e=t.charCodeAt(0);return e>=55296&&e<=56319}}t.exports=n},function(t,e,n){const r=n(5),i=n(0),o=n(6),s=n(7);t.exports=class{constructor(t,e,n,a){this.trie=null!=t?t:r.builder(0).build([{k:"",v:1}]),this.token_info_dictionary=null!=e?e:new i,this.connection_costs=null!=n?n:new o(0,0),this.unknown_dictionary=null!=a?a:new s}loadTrie(t,e){return this.trie=r.load(t,e),this}loadTokenInfoDictionaries(t,e,n){return this.token_info_dictionary.loadDictionary(t),this.token_info_dictionary.loadPosVector(e),this.token_info_dictionary.loadTargetMap(n),this}loadConnectionCosts(t){return this.connection_costs.loadConnectionCosts(t),this}loadUnknownDictionaries(t,e,n,r,i,o){return this.unknown_dictionary.loadUnknownDictionaries(t,e,n,r,i,o),this}}},function(t,e,n){!function(){"use strict";var e=function(t){null==t&&(t=1024);var e=function(t,e,n){for(var r=e;r<n;r++)t[r]=1-r;if(0<a.array[a.array.length-1]){for(var i=a.array.length-2;0<a.array[i];)i--;t[e]=-i}},n=function(t,e,n){for(var r=e;r<n;r++)t[r]=-r-1},r=function(t){var r=2*t,o=i(s.signed,s.bytes,r);e(o,s.array.length,r),o.set(s.array),s.array=null,s.array=o;var h=i(a.signed,a.bytes,r);n(h,a.array.length,r),h.set(a.array),a.array=null,a.array=h},o=1,s={signed:!0,bytes:4,array:i(!0,4,t)},a={signed:!0,bytes:4,array:i(!0,4,t)};return s.array[0]=1,a.array[0]=0,e(s.array,1,s.array.length),n(a.array,1,a.array.length),{getBaseBuffer:function(){return s.array},getCheckBuffer:function(){return a.array},loadBaseBuffer:function(t){return s.array=t,this},loadCheckBuffer:function(t){return a.array=t,this},size:function(){return Math.max(s.array.length,a.array.length)},getBase:function(t){return s.array.length-1<t?1-t:s.array[t]},getCheck:function(t){return a.array.length-1<t?-t-1:a.array[t]},setBase:function(t,e){s.array.length-1<t&&r(t),s.array[t]=e},setCheck:function(t,e){a.array.length-1<t&&r(t),a.array[t]=e},setFirstUnusedNode:function(t){o=t},getFirstUnusedNode:function(){return o},shrink:function(){for(var t=this.size()-1;!(0<=a.array[t]);)t--;s.array=s.array.subarray(0,t+2),a.array=a.array.subarray(0,t+2)},calc:function(){for(var t=0,e=a.array.length,n=0;n<e;n++)a.array[n]<0&&t++;return{all:e,unused:t,efficiency:(e-t)/e}},dump:function(){var t,e="",n="";for(t=0;t<s.array.length;t++)e=e+" "+this.getBase(t);for(t=0;t<a.array.length;t++)n=n+" "+this.getCheck(t);return console.log("base:"+e),console.log("chck:"+n),"base:"+e+" chck:"+n}}};function n(t){this.bc=e(t),this.keys=[]}function r(t){this.bc=t,this.bc.shrink()}n.prototype.append=function(t,e){return this.keys.push({k:t,v:e}),this},n.prototype.build=function(t,e){if(null==t&&(t=this.keys),null==t)return new r(this.bc);null==e&&(e=!1);var n=t.map((function(t){return{k:s(t.k+"\0"),v:t.v}}));return this.keys=e?n:n.sort((function(t,e){for(var n=t.k,r=e.k,i=Math.min(n.length,r.length),o=0;o<i;o++)if(n[o]!==r[o])return n[o]-r[o];return n.length-r.length})),n=null,this._build(0,0,0,this.keys.length),new r(this.bc)},n.prototype._build=function(t,e,n,r){var i=this.getChildrenInfo(e,n,r),o=this.findAllocatableBase(i);this.setBC(t,i,o);for(var s=0;s<i.length;s+=3){var a=i[s];if(0!==a){var h=i[s+1],c=i[s+2],u=o+a;this._build(u,e+1,h,c)}}},n.prototype.getChildrenInfo=function(t,e,n){var r=this.keys[e].k[t],i=0,o=new Int32Array(3*n);o[i++]=r,o[i++]=e;for(var s=e,a=e;s<e+n;s++){var h=this.keys[s].k[t];r!==h&&(o[i++]=s-a,o[i++]=h,o[i++]=s,r=h,a=s)}return o[i++]=s-a,o=o.subarray(0,i)},n.prototype.setBC=function(t,e,n){var r,i=this.bc;for(i.setBase(t,n),r=0;r<e.length;r+=3){var o=e[r],s=n+o,a=-i.getBase(s),h=-i.getCheck(s);s!==i.getFirstUnusedNode()?i.setCheck(a,-h):i.setFirstUnusedNode(h),i.setBase(h,-a);var c=t;if(i.setCheck(s,c),0===o){var u=e[r+1],l=this.keys[u].v;null==l&&(l=0);var f=-l-1;i.setBase(s,f)}}},n.prototype.findAllocatableBase=function(t){for(var e,n=this.bc,r=n.getFirstUnusedNode();;)if((e=r-t[0])<0)r=-n.getCheck(r);else{for(var i=!0,o=0;o<t.length;o+=3){var s=e+t[o];if(!this.isUnusedNode(s)){r=-n.getCheck(r),i=!1;break}}if(i)return e}},n.prototype.isUnusedNode=function(t){var e=this.bc.getCheck(t);return 0!==t&&e<0},r.prototype.contain=function(t){for(var e=this.bc,n=s(t+="\0"),r=0,i=-1,o=0;o<n.length;o++){var a=n[o];if(-1===(i=this.traverse(r,a)))return!1;if(e.getBase(i)<=0)return!0;r=i}return!1},r.prototype.lookup=function(t){for(var e=s(t+="\0"),n=0,r=-1,i=0;i<e.length;i++){var o=e[i];if(-1===(r=this.traverse(n,o)))return-1;n=r}var a=this.bc.getBase(r);return a<=0?-a-1:-1},r.prototype.commonPrefixSearch=function(t){for(var e=s(t),n=0,r=-1,i=[],h=0;h<e.length;h++){var c=e[h];if(-1===(r=this.traverse(n,c)))break;n=r;var u=this.traverse(r,0);if(-1!==u){var l=this.bc.getBase(u),f={};l<=0&&(f.v=-l-1),f.k=a(o(e,0,h+1)),i.push(f)}}return i},r.prototype.traverse=function(t,e){var n=this.bc.getBase(t)+e;return this.bc.getCheck(n)===t?n:-1},r.prototype.size=function(){return this.bc.size()},r.prototype.calc=function(){return this.bc.calc()},r.prototype.dump=function(){return this.bc.dump()};var i=function(t,e,n){if(t)switch(e){case 1:return new Int8Array(n);case 2:return new Int16Array(n);case 4:return new Int32Array(n);default:throw new RangeError("Invalid newArray parameter element_bytes:"+e)}else switch(e){case 1:return new Uint8Array(n);case 2:return new Uint16Array(n);case 4:return new Uint32Array(n);default:throw new RangeError("Invalid newArray parameter element_bytes:"+e)}},o=function(t,e,n){var r=new ArrayBuffer(n),i=new Uint8Array(r,0,n),o=t.subarray(e,n);return i.set(o),i},s=function(t){for(var e=new Uint8Array(new ArrayBuffer(4*t.length)),n=0,r=0;n<t.length;){var i,o=t.charCodeAt(n++);if(o>=55296&&o<=56319){var s=o,a=t.charCodeAt(n++);if(!(a>=56320&&a<=57343))return null;i=1024*(s-55296)+65536+(a-56320)}else i=o;i<128?e[r++]=i:i<2048?(e[r++]=i>>>6|192,e[r++]=63&i|128):i<65536?(e[r++]=i>>>12|224,e[r++]=i>>6&63|128,e[r++]=63&i|128):i<1<<21&&(e[r++]=i>>>18|240,e[r++]=i>>12&63|128,e[r++]=i>>6&63|128,e[r++]=63&i|128)}return e.subarray(0,r)},a=function(t){for(var e,n,r,i,o="",s=0;s<t.length;)(e=(n=t[s++])<128?n:n>>5==6?(31&n)<<6|63&t[s++]:n>>4==14?(15&n)<<12|(63&t[s++])<<6|63&t[s++]:(7&n)<<18|(63&t[s++])<<12|(63&t[s++])<<6|63&t[s++])<65536?o+=String.fromCharCode(e):(r=55296|(e-=65536)>>10,i=56320|1023&e,o+=String.fromCharCode(r,i));return o},h={builder:function(t){return new n(t)},load:function(t,n){var i=e(0);return i.loadBaseBuffer(t),i.loadCheckBuffer(n),new r(i)}};t.exports=h}()},function(t,e){t.exports=class{constructor(t,e){this.forward_dimension=t,this.backward_dimension=e,this.buffer=new Int16Array(t*e+2),this.buffer[0]=t,this.buffer[1]=e}put(t,e,n){const r=t*this.backward_dimension+e+2;if(this.buffer.length<r+1)throw new Error("ConnectionCosts buffer overflow");this.buffer[r]=n}get(t,e){const n=t*this.backward_dimension+e+2;if(this.buffer.length<n+1)throw new Error("ConnectionCosts buffer overflow");return this.buffer[n]}loadConnectionCosts(t){[this.forward_dimension,this.backward_dimension]=t,this.buffer=t}}},function(t,e,n){const r=n(0),i=n(8),o=n(1);t.exports=class extends r{constructor(){super(),this.dictionary=new o(10485760),this.target_map={},this.pos_buffer=new o(10485760),this.character_definition=null}characterDefinition(t){return this.character_definition=t,this}lookup(t){return this.character_definition.lookup(t)}lookupCompatibleCategory(t){return this.character_definition.lookupCompatibleCategory(t)}loadUnknownDictionaries(t,e,n,r,o,s){this.loadDictionary(t),this.loadPosVector(e),this.loadTargetMap(n),this.character_definition=i.load(r,o,s)}}},function(t,e,n){const r=n(9),i=n(10),o=n(3);class s{constructor(){this.character_category_map=new Uint8Array(65536),this.compatible_category_map=new Uint32Array(65536),this.invoke_definition_map=null}initCategoryMappings(t){let e;if(null!=t)for(let n=0;n<t.length;n+=1){const r=t[n],i=r.end||r.start;for(e=r.start;e<=i;e+=1){let t;this.character_category_map[e]=this.invoke_definition_map.lookup(r.default);for(let n=0;n<r.compatible.length;n+=1){t=this.compatible_category_map[e];const i=r.compatible[n];if(null==i)continue;const o=this.invoke_definition_map.lookup(i);if(null==o)continue;t|=1<<o,this.compatible_category_map[e]=t}}}const n=this.invoke_definition_map.lookup("DEFAULT");if(null!=n)for(e=0;e<this.character_category_map.length;e+=1)0===this.character_category_map[e]&&(this.character_category_map[e]=1<<n)}lookupCompatibleCategory(t){const e=[],n=t.charCodeAt(0);let r;if(n<this.compatible_category_map.length&&(r=this.compatible_category_map[n]),null==r||0===r)return e;for(let t=0;t<32;t+=1)if(r<<31-t>>>31==1){const n=this.invoke_definition_map.getCharacterClass(t);if(null==n)continue;e.push(n)}return e}lookup(t){let e;const n=t.charCodeAt(0);return o.isSurrogatePair(t)?e=this.invoke_definition_map.lookup("DEFAULT"):n<this.character_category_map.length&&(e=this.character_category_map[n]),null==e&&(e=this.invoke_definition_map.lookup("DEFAULT")),this.invoke_definition_map.getCharacterClass(e)}static load(t,e,n){const i=new s;return i.character_category_map=t,i.compatible_category_map=e,i.invoke_definition_map=r.load(n),i}static parseCharCategory(t,e){const n=e[1],r=parseInt(e[2],10),o=parseInt(e[3],10),s=parseInt(e[4],10);if(!Number.isFinite(r)||0!==r&&1!==r)return console.log("char.def parse error. INVOKE is 0 or 1 in:",r),null;if(!Number.isFinite(o)||0!==o&&1!==o)return console.log("char.def parse error. GROUP is 0 or 1 in:",o),null;if(!Number.isFinite(s)||s<0)return console.log("char.def parse error. LENGTH is 1 to n:",s),null;return new i(t,n,1===r,1===o,s)}static parseCategoryMapping(t){const e=parseInt(t[1],16),n=t[2],r=t.length>3?t.slice(3):[];return(!Number.isFinite(e)||e<0||e>65535)&&console.log("char.def parse error. CODE is invalid:",e),{start:e,default:n,compatible:r}}static parseRangeCategoryMapping(t){const e=parseInt(t[1],16),n=parseInt(t[2],16),r=t[3],i=t.length>4?t.slice(4):[];return(!Number.isFinite(e)||e<0||e>65535)&&console.log("char.def parse error. CODE is invalid:",e),(!Number.isFinite(n)||n<0||n>65535)&&console.log("char.def parse error. CODE is invalid:",n),{start:e,end:n,default:r,compatible:i}}}t.exports=s},function(t,e,n){const r=n(1),i=n(10);class o{constructor(){this.map=[],this.lookup_table={}}static load(t){const e=new o,n=[],s=new r(t);for(;s.position+1<s.size();){const t=n.length,e=s.get(),r=s.get(),o=s.getInt(),a=s.getString();n.push(new i(t,a,e,r,o))}return e.init(n),e}init(t){if(null!=t)for(let e=0;e<t.length;e+=1){const n=t[e];this.map[e]=n,this.lookup_table[n.class_name]=e}}getCharacterClass(t){return this.map[t]}lookup(t){const e=this.lookup_table[t];return null==e?null:e}toBuffer(){const t=new r;for(let e=0;e<this.map.length;e+=1){const n=this.map[e];t.put(n.is_always_invoke),t.put(n.is_grouping),t.putInt(n.max_length),t.putString(n.class_name)}return t.shrink(),t.buffer}}t.exports=o},function(t,e){t.exports=function(t,e,n,r,i){this.class_id=t,this.class_name=e,this.is_always_invoke=n,this.is_grouping=r,this.max_length=i}},function(t,e,n){const r=n(12),i=n(28),o={builder:t=>new r(t),dictionaryBuilder:()=>new i};t.exports=o},function(t,e,n){const r=n(13),i=n(18);t.exports=class{constructor(t={}){this.dic_path=t.dicPath||"dict/"}build(){return new i(this.dic_path).load().then(t=>new r(t))}}},function(t,e,n){const r=n(14),i=n(16),o=n(17),s=/、|。/;class a{constructor(t){this.token_info_dictionary=t.token_info_dictionary,this.unknown_dictionary=t.unknown_dictionary,this.viterbi_builder=new r(t),this.viterbi_searcher=new i(t.connection_costs),this.formatter=new o}tokenize(t){const e=a.splitByPunctuation(t),n=[];return e.forEach(t=>{this.tokenizeForSentence(t,n)}),n}tokenizeForSentence(t,e=[]){const n=this.getLattice(t),r=this.viterbi_searcher.search(n),i=e.length?e[e.length-1].word_position:0;return r.forEach(t=>{let n=[],r=null;if("KNOWN"===t.type){const e=this.token_info_dictionary.getFeatures(t.name);e&&(n=e.split(",")),r=this.formatter.formatEntry(t.name,i+t.start_pos,t.type,n)}else if("UNKNOWN"===t.type){n=this.unknown_dictionary.getFeatures(t.name).split(","),r=this.formatter.formatUnknownEntry(t.name,i+t.start_pos,t.type,n,t.surface_form)}else r=this.formatter.formatEntry(t.name,i+t.start_pos,t.type,[]);e.push(r)}),e}getLattice(t){return this.viterbi_builder.build(t)}static splitByPunctuation(t){const e=[];let n=t;for(;""!==n;){const t=n.search(s);if(t<0){e.push(n);break}e.push(n.substring(0,t+1)),n=n.substring(t+1)}return e}}t.exports=a},function(t,e,n){const r=n(2),i=n(15),o=n(3);t.exports=class{constructor(t){this.trie=t.trie,this.token_info_dictionary=t.token_info_dictionary,this.unknown_dictionary=t.unknown_dictionary}build(t){const e=new i,n=new o(t);for(let t=0;t<n.length;t+=1){const i=n.slice(t),s=this.trie.commonPrefixSearch(i);s.forEach(n=>{const{v:i,k:o}=n;this.token_info_dictionary.target_map[i].forEach(n=>{const i=parseInt(n,10),s=this.token_info_dictionary.dictionary.getShort(i),a=this.token_info_dictionary.dictionary.getShort(i+2),h=this.token_info_dictionary.dictionary.getShort(i+4);e.append(new r(i,h,t+1,o.length,"KNOWN",s,a,o))})});const a=new o(i),h=new o(a.charAt(0)),c=this.unknown_dictionary.lookup(h.toString());if(null==s||0===s.length||1===c.is_always_invoke){let n=h;if(1===c.is_grouping&&a.length>1)for(let t=1;t<a.length;t+=1){const e=a.charAt(t),r=this.unknown_dictionary.lookup(e);if(c.class_name!==r.class_name)break;n+=e}const i=this.unknown_dictionary.target_map[c.class_id];for(let o=0;o<i.length;o+=1){const s=parseInt(i[o],10),a=this.unknown_dictionary.dictionary.getShort(s),h=this.unknown_dictionary.dictionary.getShort(s+2),c=this.unknown_dictionary.dictionary.getShort(s+4);e.append(new r(s,c,t+1,n.length,"UNKNOWN",a,h,n.toString()))}}}return e.appendEos(),e}}},function(t,e,n){const r=n(2);t.exports=class{constructor(){this.nodes_end_at=[],this.nodes_end_at[0]=[new r(-1,0,0,0,"BOS",0,0,"")],this.eos_pos=1}append(t){const e=t.start_pos+t.length-1;this.eos_pos<e&&(this.eos_pos=e);const n=this.nodes_end_at[e]||[];n.push(t),this.nodes_end_at[e]=n}appendEos(){const t=this.nodes_end_at.length;this.eos_pos+=1,this.nodes_end_at[t]=[new r(-1,0,this.eos_pos,0,"EOS",0,0,"")]}}},function(t,e){t.exports=class{constructor(t){this.connection_costs=t}search(t){const e=this.forward(t);return this.backward(e)}forward(t){for(let e=1;e<=t.eos_pos;e+=1){const n=t.nodes_end_at[e];if(null!=n)for(let e=0;e<n.length;e+=1){const r=n[e];let i,o=Number.MAX_VALUE;const s=t.nodes_end_at[r.start_pos-1];if(null!=s){for(let t=0;t<s.length;t+=1){const e=s[t];let n;null==r.left_id||null==e.right_id?(console.log("Left or right is null"),n=0):n=this.connection_costs.get(e.right_id,r.left_id);const a=e.shortest_cost+n+r.cost;a<o&&(i=e,o=a)}r.prev=i,r.shortest_cost=o}}}return t}backward(t){const e=[];let n=t.nodes_end_at[t.nodes_end_at.length-1][0].prev;if(null==n)return[];for(;"BOS"!==n.type;){if(e.push(n),null==n.prev)return[];n=n.prev}return e.reverse()}}},function(t,e){t.exports=class{formatEntry(t,e,n,r){const i={};return i.word_id=t,i.word_type=n,i.word_position=e,[i.surface_form,i.pos,i.pos_detail_1,i.pos_detail_2,i.pos_detail_3,i.conjugated_type,i.conjugated_form,i.basic_form,i.reading,i.pronunciation]=r,i}formatUnknownEntry(t,e,n,r,i){const o={};return o.word_id=t,o.word_type=n,o.word_position=e,o.surface_form=i,[,o.pos,o.pos_detail_1,o.pos_detail_2,o.pos_detail_3,o.conjugated_type,o.conjugated_form,o.basic_form]=r,o}}},function(t,e,n){const r=n(19);t.exports=class extends r{loadArrayBuffer(t){return fetch(t).then(t=>t.arrayBuffer())}}},function(t,e,n){const r=n(20),i=n(4);t.exports=class{constructor(t=""){this.dic=new i,this.dic_path=t,this.dic_path.endsWith("/")||(this.dic_path+="/")}loadFiles(t){const{dic_path:e}=this;return Promise.all(t.map(t=>{const n=r.resolve(e,t);return this.loadArrayBuffer(n)}))}loadTrie(){return this.loadFiles(["base.dat","check.dat"]).then(([t,e])=>{const n=new Int32Array(t),r=new Int32Array(e);this.dic.loadTrie(n,r)})}loadToken(){return this.loadFiles(["tid.dat","tid_pos.dat","tid_map.dat"]).then(([t,e,n])=>{const r=new Uint8Array(t),i=new Uint8Array(e),o=new Uint8Array(n);this.dic.loadTokenInfoDictionaries(r,i,o)})}loadCostMatrix(){return this.loadFiles(["cc.dat"]).then(([t])=>{const e=new Int16Array(t);this.dic.loadConnectionCosts(e)})}loadUnknownDictionaries(){return this.loadFiles(["unk.dat","unk_pos.dat","unk_map.dat","unk_char.dat","unk_compat.dat","unk_invoke.dat"]).then(([t,e,n,r,i,o])=>{const s=new Uint8Array(t),a=new Uint8Array(e),h=new Uint8Array(n),c=new Uint8Array(r),u=new Uint8Array(i),l=new Uint8Array(o);this.dic.loadUnknownDictionaries(s,a,h,c,u,l)})}load(){return Promise.all([this.loadTrie(),this.loadToken(),this.loadCostMatrix(),this.loadUnknownDictionaries()]).then(()=>this.dic)}}},function(t,e,n){"use strict";var r=n(21),i=n(24);function o(){this.protocol=null,this.slashes=null,this.auth=null,this.host=null,this.port=null,this.hostname=null,this.hash=null,this.search=null,this.query=null,this.pathname=null,this.path=null,this.href=null}e.parse=b,e.resolve=function(t,e){return b(t,!1,!0).resolve(e)},e.resolveObject=function(t,e){return t?b(t,!1,!0).resolveObject(e):e},e.format=function(t){i.isString(t)&&(t=b(t));return t instanceof o?t.format():o.prototype.format.call(t)},e.Url=o;var s=/^([a-z0-9.+-]+:)/i,a=/:[0-9]*$/,h=/^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,c=["{","}","|","\\","^","`"].concat(["<",">",'"',"`"," ","\r","\n","\t"]),u=["'"].concat(c),l=["%","/","?",";","#"].concat(u),f=["/","?","#"],p=/^[+a-z0-9A-Z_-]{0,63}$/,d=/^([+a-z0-9A-Z_-]{0,63})(.*)$/,g={javascript:!0,"javascript:":!0},y={javascript:!0,"javascript:":!0},_={http:!0,https:!0,ftp:!0,gopher:!0,file:!0,"http:":!0,"https:":!0,"ftp:":!0,"gopher:":!0,"file:":!0},m=n(25);function b(t,e,n){if(t&&i.isObject(t)&&t instanceof o)return t;var r=new o;return r.parse(t,e,n),r}o.prototype.parse=function(t,e,n){if(!i.isString(t))throw new TypeError("Parameter 'url' must be a string, not "+typeof t);var o=t.indexOf("?"),a=-1!==o&&o<t.indexOf("#")?"?":"#",c=t.split(a);c[0]=c[0].replace(/\\/g,"/");var b=t=c.join(a);if(b=b.trim(),!n&&1===t.split("#").length){var v=h.exec(b);if(v)return this.path=b,this.href=b,this.pathname=v[1],v[2]?(this.search=v[2],this.query=e?m.parse(this.search.substr(1)):this.search.substr(1)):e&&(this.search="",this.query={}),this}var w=s.exec(b);if(w){var k=(w=w[0]).toLowerCase();this.protocol=k,b=b.substr(w.length)}if(n||w||b.match(/^\/\/[^@\/]+@[^@\/]+/)){var C="//"===b.substr(0,2);!C||w&&y[w]||(b=b.substr(2),this.slashes=!0)}if(!y[w]&&(C||w&&!_[w])){for(var x,A,I=-1,U=0;U<f.length;U++){-1!==(O=b.indexOf(f[U]))&&(-1===I||O<I)&&(I=O)}-1!==(A=-1===I?b.lastIndexOf("@"):b.lastIndexOf("@",I))&&(x=b.slice(0,A),b=b.slice(A+1),this.auth=decodeURIComponent(x)),I=-1;for(U=0;U<l.length;U++){var O;-1!==(O=b.indexOf(l[U]))&&(-1===I||O<I)&&(I=O)}-1===I&&(I=b.length),this.host=b.slice(0,I),b=b.slice(I),this.parseHost(),this.hostname=this.hostname||"";var j="["===this.hostname[0]&&"]"===this.hostname[this.hostname.length-1];if(!j)for(var S=this.hostname.split(/\./),N=(U=0,S.length);U<N;U++){var B=S[U];if(B&&!B.match(p)){for(var E="",F=0,D=B.length;F<D;F++)B.charCodeAt(F)>127?E+="x":E+=B[F];if(!E.match(p)){var P=S.slice(0,U),M=S.slice(U+1),T=B.match(d);T&&(P.push(T[1]),M.unshift(T[2])),M.length&&(b="/"+M.join(".")+b),this.hostname=P.join(".");break}}}this.hostname.length>255?this.hostname="":this.hostname=this.hostname.toLowerCase(),j||(this.hostname=r.toASCII(this.hostname));var q=this.port?":"+this.port:"",L=this.hostname||"";this.host=L+q,this.href+=this.host,j&&(this.hostname=this.hostname.substr(1,this.hostname.length-2),"/"!==b[0]&&(b="/"+b))}if(!g[k])for(U=0,N=u.length;U<N;U++){var R=u[U];if(-1!==b.indexOf(R)){var z=encodeURIComponent(R);z===R&&(z=escape(R)),b=b.split(R).join(z)}}var K=b.indexOf("#");-1!==K&&(this.hash=b.substr(K),b=b.slice(0,K));var V=b.indexOf("?");if(-1!==V?(this.search=b.substr(V),this.query=b.substr(V+1),e&&(this.query=m.parse(this.query)),b=b.slice(0,V)):e&&(this.search="",this.query={}),b&&(this.pathname=b),_[k]&&this.hostname&&!this.pathname&&(this.pathname="/"),this.pathname||this.search){q=this.pathname||"";var $=this.search||"";this.path=q+$}return this.href=this.format(),this},o.prototype.format=function(){var t=this.auth||"";t&&(t=(t=encodeURIComponent(t)).replace(/%3A/i,":"),t+="@");var e=this.protocol||"",n=this.pathname||"",r=this.hash||"",o=!1,s="";this.host?o=t+this.host:this.hostname&&(o=t+(-1===this.hostname.indexOf(":")?this.hostname:"["+this.hostname+"]"),this.port&&(o+=":"+this.port)),this.query&&i.isObject(this.query)&&Object.keys(this.query).length&&(s=m.stringify(this.query));var a=this.search||s&&"?"+s||"";return e&&":"!==e.substr(-1)&&(e+=":"),this.slashes||(!e||_[e])&&!1!==o?(o="//"+(o||""),n&&"/"!==n.charAt(0)&&(n="/"+n)):o||(o=""),r&&"#"!==r.charAt(0)&&(r="#"+r),a&&"?"!==a.charAt(0)&&(a="?"+a),e+o+(n=n.replace(/[?#]/g,(function(t){return encodeURIComponent(t)})))+(a=a.replace("#","%23"))+r},o.prototype.resolve=function(t){return this.resolveObject(b(t,!1,!0)).format()},o.prototype.resolveObject=function(t){if(i.isString(t)){var e=new o;e.parse(t,!1,!0),t=e}for(var n=new o,r=Object.keys(this),s=0;s<r.length;s++){var a=r[s];n[a]=this[a]}if(n.hash=t.hash,""===t.href)return n.href=n.format(),n;if(t.slashes&&!t.protocol){for(var h=Object.keys(t),c=0;c<h.length;c++){var u=h[c];"protocol"!==u&&(n[u]=t[u])}return _[n.protocol]&&n.hostname&&!n.pathname&&(n.path=n.pathname="/"),n.href=n.format(),n}if(t.protocol&&t.protocol!==n.protocol){if(!_[t.protocol]){for(var l=Object.keys(t),f=0;f<l.length;f++){var p=l[f];n[p]=t[p]}return n.href=n.format(),n}if(n.protocol=t.protocol,t.host||y[t.protocol])n.pathname=t.pathname;else{for(var d=(t.pathname||"").split("/");d.length&&!(t.host=d.shift()););t.host||(t.host=""),t.hostname||(t.hostname=""),""!==d[0]&&d.unshift(""),d.length<2&&d.unshift(""),n.pathname=d.join("/")}if(n.search=t.search,n.query=t.query,n.host=t.host||"",n.auth=t.auth,n.hostname=t.hostname||t.host,n.port=t.port,n.pathname||n.search){var g=n.pathname||"",m=n.search||"";n.path=g+m}return n.slashes=n.slashes||t.slashes,n.href=n.format(),n}var b=n.pathname&&"/"===n.pathname.charAt(0),v=t.host||t.pathname&&"/"===t.pathname.charAt(0),w=v||b||n.host&&t.pathname,k=w,C=n.pathname&&n.pathname.split("/")||[],x=(d=t.pathname&&t.pathname.split("/")||[],n.protocol&&!_[n.protocol]);if(x&&(n.hostname="",n.port=null,n.host&&(""===C[0]?C[0]=n.host:C.unshift(n.host)),n.host="",t.protocol&&(t.hostname=null,t.port=null,t.host&&(""===d[0]?d[0]=t.host:d.unshift(t.host)),t.host=null),w=w&&(""===d[0]||""===C[0])),v)n.host=t.host||""===t.host?t.host:n.host,n.hostname=t.hostname||""===t.hostname?t.hostname:n.hostname,n.search=t.search,n.query=t.query,C=d;else if(d.length)C||(C=[]),C.pop(),C=C.concat(d),n.search=t.search,n.query=t.query;else if(!i.isNullOrUndefined(t.search)){if(x)n.hostname=n.host=C.shift(),(j=!!(n.host&&n.host.indexOf("@")>0)&&n.host.split("@"))&&(n.auth=j.shift(),n.host=n.hostname=j.shift());return n.search=t.search,n.query=t.query,i.isNull(n.pathname)&&i.isNull(n.search)||(n.path=(n.pathname?n.pathname:"")+(n.search?n.search:"")),n.href=n.format(),n}if(!C.length)return n.pathname=null,n.search?n.path="/"+n.search:n.path=null,n.href=n.format(),n;for(var A=C.slice(-1)[0],I=(n.host||t.host||C.length>1)&&("."===A||".."===A)||""===A,U=0,O=C.length;O>=0;O--)"."===(A=C[O])?C.splice(O,1):".."===A?(C.splice(O,1),U++):U&&(C.splice(O,1),U--);if(!w&&!k)for(;U--;U)C.unshift("..");!w||""===C[0]||C[0]&&"/"===C[0].charAt(0)||C.unshift(""),I&&"/"!==C.join("/").substr(-1)&&C.push("");var j,S=""===C[0]||C[0]&&"/"===C[0].charAt(0);x&&(n.hostname=n.host=S?"":C.length?C.shift():"",(j=!!(n.host&&n.host.indexOf("@")>0)&&n.host.split("@"))&&(n.auth=j.shift(),n.host=n.hostname=j.shift()));return(w=w||n.host&&C.length)&&!S&&C.unshift(""),C.length?n.pathname=C.join("/"):(n.pathname=null,n.path=null),i.isNull(n.pathname)&&i.isNull(n.search)||(n.path=(n.pathname?n.pathname:"")+(n.search?n.search:"")),n.auth=t.auth||n.auth,n.slashes=n.slashes||t.slashes,n.href=n.format(),n},o.prototype.parseHost=function(){var t=this.host,e=a.exec(t);e&&(":"!==(e=e[0])&&(this.port=e.substr(1)),t=t.substr(0,t.length-e.length)),t&&(this.hostname=t)}},function(t,e,n){(function(t,r){var i;/*! https://mths.be/punycode v1.4.1 by @mathias */!function(o){e&&e.nodeType,t&&t.nodeType;var s="object"==typeof r&&r;s.global!==s&&s.window!==s&&s.self;var a,h=2147483647,c=/^xn--/,u=/[^\x20-\x7E]/,l=/[\x2E\u3002\uFF0E\uFF61]/g,f={overflow:"Overflow: input needs wider integers to process","not-basic":"Illegal input >= 0x80 (not a basic code point)","invalid-input":"Invalid input"},p=Math.floor,d=String.fromCharCode;function g(t){throw new RangeError(f[t])}function y(t,e){for(var n=t.length,r=[];n--;)r[n]=e(t[n]);return r}function _(t,e){var n=t.split("@"),r="";return n.length>1&&(r=n[0]+"@",t=n[1]),r+y((t=t.replace(l,".")).split("."),e).join(".")}function m(t){for(var e,n,r=[],i=0,o=t.length;i<o;)(e=t.charCodeAt(i++))>=55296&&e<=56319&&i<o?56320==(64512&(n=t.charCodeAt(i++)))?r.push(((1023&e)<<10)+(1023&n)+65536):(r.push(e),i--):r.push(e);return r}function b(t){return y(t,(function(t){var e="";return t>65535&&(e+=d((t-=65536)>>>10&1023|55296),t=56320|1023&t),e+=d(t)})).join("")}function v(t,e){return t+22+75*(t<26)-((0!=e)<<5)}function w(t,e,n){var r=0;for(t=n?p(t/700):t>>1,t+=p(t/e);t>455;r+=36)t=p(t/35);return p(r+36*t/(t+38))}function k(t){var e,n,r,i,o,s,a,c,u,l,f,d=[],y=t.length,_=0,m=128,v=72;for((n=t.lastIndexOf("-"))<0&&(n=0),r=0;r<n;++r)t.charCodeAt(r)>=128&&g("not-basic"),d.push(t.charCodeAt(r));for(i=n>0?n+1:0;i<y;){for(o=_,s=1,a=36;i>=y&&g("invalid-input"),((c=(f=t.charCodeAt(i++))-48<10?f-22:f-65<26?f-65:f-97<26?f-97:36)>=36||c>p((h-_)/s))&&g("overflow"),_+=c*s,!(c<(u=a<=v?1:a>=v+26?26:a-v));a+=36)s>p(h/(l=36-u))&&g("overflow"),s*=l;v=w(_-o,e=d.length+1,0==o),p(_/e)>h-m&&g("overflow"),m+=p(_/e),_%=e,d.splice(_++,0,m)}return b(d)}function C(t){var e,n,r,i,o,s,a,c,u,l,f,y,_,b,k,C=[];for(y=(t=m(t)).length,e=128,n=0,o=72,s=0;s<y;++s)(f=t[s])<128&&C.push(d(f));for(r=i=C.length,i&&C.push("-");r<y;){for(a=h,s=0;s<y;++s)(f=t[s])>=e&&f<a&&(a=f);for(a-e>p((h-n)/(_=r+1))&&g("overflow"),n+=(a-e)*_,e=a,s=0;s<y;++s)if((f=t[s])<e&&++n>h&&g("overflow"),f==e){for(c=n,u=36;!(c<(l=u<=o?1:u>=o+26?26:u-o));u+=36)k=c-l,b=36-l,C.push(d(v(l+k%b,0))),c=p(k/b);C.push(d(v(c,0))),o=w(n,_,r==i),n=0,++r}++n,++e}return C.join("")}a={version:"1.4.1",ucs2:{decode:m,encode:b},decode:k,encode:C,toASCII:function(t){return _(t,(function(t){return u.test(t)?"xn--"+C(t):t}))},toUnicode:function(t){return _(t,(function(t){return c.test(t)?k(t.slice(4).toLowerCase()):t}))}},void 0===(i=function(){return a}.call(e,n,e,t))||(t.exports=i)}()}).call(this,n(22)(t),n(23))},function(t,e){t.exports=function(t){return t.webpackPolyfill||(t.deprecate=function(){},t.paths=[],t.children||(t.children=[]),Object.defineProperty(t,"loaded",{enumerable:!0,get:function(){return t.l}}),Object.defineProperty(t,"id",{enumerable:!0,get:function(){return t.i}}),t.webpackPolyfill=1),t}},function(t,e){var n;n=function(){return this}();try{n=n||new Function("return this")()}catch(t){"object"==typeof window&&(n=window)}t.exports=n},function(t,e,n){"use strict";t.exports={isString:function(t){return"string"==typeof t},isObject:function(t){return"object"==typeof t&&null!==t},isNull:function(t){return null===t},isNullOrUndefined:function(t){return null==t}}},function(t,e,n){"use strict";e.decode=e.parse=n(26),e.encode=e.stringify=n(27)},function(t,e,n){"use strict";function r(t,e){return Object.prototype.hasOwnProperty.call(t,e)}t.exports=function(t,e,n,o){e=e||"&",n=n||"=";var s={};if("string"!=typeof t||0===t.length)return s;var a=/\+/g;t=t.split(e);var h=1e3;o&&"number"==typeof o.maxKeys&&(h=o.maxKeys);var c=t.length;h>0&&c>h&&(c=h);for(var u=0;u<c;++u){var l,f,p,d,g=t[u].replace(a,"%20"),y=g.indexOf(n);y>=0?(l=g.substr(0,y),f=g.substr(y+1)):(l=g,f=""),p=decodeURIComponent(l),d=decodeURIComponent(f),r(s,p)?i(s[p])?s[p].push(d):s[p]=[s[p],d]:s[p]=d}return s};var i=Array.isArray||function(t){return"[object Array]"===Object.prototype.toString.call(t)}},function(t,e,n){"use strict";var r=function(t){switch(typeof t){case"string":return t;case"boolean":return t?"true":"false";case"number":return isFinite(t)?t:"";default:return""}};t.exports=function(t,e,n,a){return e=e||"&",n=n||"=",null===t&&(t=void 0),"object"==typeof t?o(s(t),(function(s){var a=encodeURIComponent(r(s))+n;return i(t[s])?o(t[s],(function(t){return a+encodeURIComponent(r(t))})).join(e):a+encodeURIComponent(r(t[s]))})).join(e):a?encodeURIComponent(r(a))+n+encodeURIComponent(r(t)):""};var i=Array.isArray||function(t){return"[object Array]"===Object.prototype.toString.call(t)};function o(t,e){if(t.map)return t.map(e);for(var n=[],r=0;r<t.length;r++)n.push(e(t[r],r));return n}var s=Object.keys||function(t){var e=[];for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&e.push(n);return e}},function(t,e,n){const r=n(5),i=n(4),o=n(0),s=n(29),a=n(30),h=n(7);t.exports=class{constructor(){this.tid_entries=[],this.unk_entries=[],this.cc_builder=new s,this.cd_builder=new a}addTokenInfoDictionary(t){const e=t.split(",");return this.tid_entries.push(e),this}putCostMatrixLine(t){return this.cc_builder.putLine(t),this}putCharDefLine(t){return this.cd_builder.putLine(t),this}putUnkDefLine(t){return this.unk_entries.push(t.split(",")),this}build(){const t=this.buildTokenInfoDictionary(),e=this.buildUnknownDictionary();return new i(t.trie,t.token_info_dictionary,this.cc_builder.build(),e)}buildTokenInfoDictionary(){const t=new o,e=t.buildDictionary(this.tid_entries),n=this.buildDoubleArray();for(const r in e){const i=e[r],o=n.lookup(i);t.addMapping(o,r)}return{trie:n,token_info_dictionary:t}}buildUnknownDictionary(){const t=new h,e=t.buildDictionary(this.unk_entries),n=this.cd_builder.build();t.characterDefinition(n);for(const r in e){const i=e[r],o=n.invoke_definition_map.lookup(i);t.addMapping(o,r)}return t}buildDoubleArray(){const t=this.tid_entries.map((t,e)=>{const[n]=t;return{k:n,v:e}});return r.builder(1048576).build(t)}}},function(t,e,n){const r=n(6);t.exports=class{constructor(){this.lines=0,this.connection_cost=null}putLine(t){if(0===this.lines){const e=t.split(" "),n=e[0],i=e[1];if(n<0||i<0)throw new Error("Parse error of matrix.def");return this.connection_cost=new r(n,i),this.lines+=1,this}const e=t.split(" ");if(3!==e.length)return this;const n=parseInt(e[0],10),i=parseInt(e[1],10),o=parseInt(e[2],10);if(n<0||i<0||!Number.isFinite(n)||!Number.isFinite(i)||this.connection_cost.forward_dimension<=n||this.connection_cost.backward_dimension<=i)throw new Error("Parse error of matrix.def");return this.connection_cost.put(n,i,o),this.lines+=1,this}build(){return this.connection_cost}}},function(t,e,n){const r=n(8),i=n(9),o=/^(\w+)\s+(\d)\s+(\d)\s+(\d)/,s=/^(0x[0-9A-F]{4})(?:\s+([^#\s]+))(?:\s+([^#\s]+))*/,a=/^(0x[0-9A-F]{4})\.\.(0x[0-9A-F]{4})(?:\s+([^#\s]+))(?:\s+([^#\s]+))*/;t.exports=class{constructor(){this.char_def=new r,this.char_def.invoke_definition_map=new i,this.character_category_definition=[],this.category_mapping=[]}putLine(t){const e=o.exec(t);if(null!=e){const t=this.character_category_definition.length,n=r.parseCharCategory(t,e);if(null==n)return;return void this.character_category_definition.push(n)}const n=s.exec(t);if(null!=n){const t=r.parseCategoryMapping(n);this.category_mapping.push(t)}const i=a.exec(t);if(null!=i){const t=r.parseRangeCategoryMapping(i);this.category_mapping.push(t)}}build(){return this.char_def.invoke_definition_map.init(this.character_category_definition),this.char_def.initCategoryMappings(this.category_mapping),this.char_def}}}]);
