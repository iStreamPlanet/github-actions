(()=>{var e={351:function(e,t,r){"use strict";var n=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(e!=null)for(var r in e)if(Object.hasOwnProperty.call(e,r))t[r]=e[r];t["default"]=e;return t};Object.defineProperty(t,"__esModule",{value:true});const i=n(r(87));const a=r(278);function issueCommand(e,t,r){const n=new Command(e,t,r);process.stdout.write(n.toString()+i.EOL)}t.issueCommand=issueCommand;function issue(e,t=""){issueCommand(e,{},t)}t.issue=issue;const s="::";class Command{constructor(e,t,r){if(!e){e="missing.command"}this.command=e;this.properties=t;this.message=r}toString(){let e=s+this.command;if(this.properties&&Object.keys(this.properties).length>0){e+=" ";let t=true;for(const r in this.properties){if(this.properties.hasOwnProperty(r)){const n=this.properties[r];if(n){if(t){t=false}else{e+=","}e+=`${r}=${escapeProperty(n)}`}}}}e+=`${s}${escapeData(this.message)}`;return e}}function escapeData(e){return a.toCommandValue(e).replace(/%/g,"%25").replace(/\r/g,"%0D").replace(/\n/g,"%0A")}function escapeProperty(e){return a.toCommandValue(e).replace(/%/g,"%25").replace(/\r/g,"%0D").replace(/\n/g,"%0A").replace(/:/g,"%3A").replace(/,/g,"%2C")}},186:function(e,t,r){"use strict";var n=this&&this.__awaiter||function(e,t,r,n){function adopt(e){return e instanceof r?e:new r((function(t){t(e)}))}return new(r||(r=Promise))((function(r,i){function fulfilled(e){try{step(n.next(e))}catch(e){i(e)}}function rejected(e){try{step(n["throw"](e))}catch(e){i(e)}}function step(e){e.done?r(e.value):adopt(e.value).then(fulfilled,rejected)}step((n=n.apply(e,t||[])).next())}))};var i=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(e!=null)for(var r in e)if(Object.hasOwnProperty.call(e,r))t[r]=e[r];t["default"]=e;return t};Object.defineProperty(t,"__esModule",{value:true});const a=r(351);const s=r(717);const o=r(278);const u=i(r(87));const c=i(r(622));var f;(function(e){e[e["Success"]=0]="Success";e[e["Failure"]=1]="Failure"})(f=t.ExitCode||(t.ExitCode={}));function exportVariable(e,t){const r=o.toCommandValue(t);process.env[e]=r;const n=process.env["GITHUB_ENV"]||"";if(n){const t="_GitHubActionsFileCommandDelimeter_";const n=`${e}<<${t}${u.EOL}${r}${u.EOL}${t}`;s.issueCommand("ENV",n)}else{a.issueCommand("set-env",{name:e},r)}}t.exportVariable=exportVariable;function setSecret(e){a.issueCommand("add-mask",{},e)}t.setSecret=setSecret;function addPath(e){const t=process.env["GITHUB_PATH"]||"";if(t){s.issueCommand("PATH",e)}else{a.issueCommand("add-path",{},e)}process.env["PATH"]=`${e}${c.delimiter}${process.env["PATH"]}`}t.addPath=addPath;function getInput(e,t){const r=process.env[`INPUT_${e.replace(/ /g,"_").toUpperCase()}`]||"";if(t&&t.required&&!r){throw new Error(`Input required and not supplied: ${e}`)}return r.trim()}t.getInput=getInput;function setOutput(e,t){process.stdout.write(u.EOL);a.issueCommand("set-output",{name:e},t)}t.setOutput=setOutput;function setCommandEcho(e){a.issue("echo",e?"on":"off")}t.setCommandEcho=setCommandEcho;function setFailed(e){process.exitCode=f.Failure;error(e)}t.setFailed=setFailed;function isDebug(){return process.env["RUNNER_DEBUG"]==="1"}t.isDebug=isDebug;function debug(e){a.issueCommand("debug",{},e)}t.debug=debug;function error(e){a.issue("error",e instanceof Error?e.toString():e)}t.error=error;function warning(e){a.issue("warning",e instanceof Error?e.toString():e)}t.warning=warning;function info(e){process.stdout.write(e+u.EOL)}t.info=info;function startGroup(e){a.issue("group",e)}t.startGroup=startGroup;function endGroup(){a.issue("endgroup")}t.endGroup=endGroup;function group(e,t){return n(this,void 0,void 0,(function*(){startGroup(e);let r;try{r=yield t()}finally{endGroup()}return r}))}t.group=group;function saveState(e,t){a.issueCommand("save-state",{name:e},t)}t.saveState=saveState;function getState(e){return process.env[`STATE_${e}`]||""}t.getState=getState},717:function(e,t,r){"use strict";var n=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(e!=null)for(var r in e)if(Object.hasOwnProperty.call(e,r))t[r]=e[r];t["default"]=e;return t};Object.defineProperty(t,"__esModule",{value:true});const i=n(r(747));const a=n(r(87));const s=r(278);function issueCommand(e,t){const r=process.env[`GITHUB_${e}`];if(!r){throw new Error(`Unable to find environment variable for file command ${e}`)}if(!i.existsSync(r)){throw new Error(`Missing file at path: ${r}`)}i.appendFileSync(r,`${s.toCommandValue(t)}${a.EOL}`,{encoding:"utf8"})}t.issueCommand=issueCommand},278:(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:true});function toCommandValue(e){if(e===null||e===undefined){return""}else if(typeof e==="string"||e instanceof String){return e}return JSON.stringify(e)}t.toCommandValue=toCommandValue},417:e=>{"use strict";e.exports=balanced;function balanced(e,t,r){if(e instanceof RegExp)e=maybeMatch(e,r);if(t instanceof RegExp)t=maybeMatch(t,r);var n=range(e,t,r);return n&&{start:n[0],end:n[1],pre:r.slice(0,n[0]),body:r.slice(n[0]+e.length,n[1]),post:r.slice(n[1]+t.length)}}function maybeMatch(e,t){var r=t.match(e);return r?r[0]:null}balanced.range=range;function range(e,t,r){var n,i,a,s,o;var u=r.indexOf(e);var c=r.indexOf(t,u+1);var f=u;if(u>=0&&c>0){n=[];a=r.length;while(f>=0&&!o){if(f==u){n.push(f);u=r.indexOf(e,f+1)}else if(n.length==1){o=[n.pop(),c]}else{i=n.pop();if(i<a){a=i;s=c}c=r.indexOf(t,f+1)}f=u<c&&u>=0?u:c}if(n.length){o=[a,s]}}return o}},850:(e,t,r)=>{var n=r(891);var i=r(417);e.exports=expandTop;var a="\0SLASH"+Math.random()+"\0";var s="\0OPEN"+Math.random()+"\0";var o="\0CLOSE"+Math.random()+"\0";var u="\0COMMA"+Math.random()+"\0";var c="\0PERIOD"+Math.random()+"\0";function numeric(e){return parseInt(e,10)==e?parseInt(e,10):e.charCodeAt(0)}function escapeBraces(e){return e.split("\\\\").join(a).split("\\{").join(s).split("\\}").join(o).split("\\,").join(u).split("\\.").join(c)}function unescapeBraces(e){return e.split(a).join("\\").split(s).join("{").split(o).join("}").split(u).join(",").split(c).join(".")}function parseCommaParts(e){if(!e)return[""];var t=[];var r=i("{","}",e);if(!r)return e.split(",");var n=r.pre;var a=r.body;var s=r.post;var o=n.split(",");o[o.length-1]+="{"+a+"}";var u=parseCommaParts(s);if(s.length){o[o.length-1]+=u.shift();o.push.apply(o,u)}t.push.apply(t,o);return t}function expandTop(e){if(!e)return[];if(e.substr(0,2)==="{}"){e="\\{\\}"+e.substr(2)}return expand(escapeBraces(e),true).map(unescapeBraces)}function identity(e){return e}function embrace(e){return"{"+e+"}"}function isPadded(e){return/^-?0\d/.test(e)}function lte(e,t){return e<=t}function gte(e,t){return e>=t}function expand(e,t){var r=[];var a=i("{","}",e);if(!a||/\$$/.test(a.pre))return[e];var s=/^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(a.body);var u=/^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(a.body);var c=s||u;var f=a.body.indexOf(",")>=0;if(!c&&!f){if(a.post.match(/,.*\}/)){e=a.pre+"{"+a.body+o+a.post;return expand(e)}return[e]}var p;if(c){p=a.body.split(/\.\./)}else{p=parseCommaParts(a.body);if(p.length===1){p=expand(p[0],false).map(embrace);if(p.length===1){var l=a.post.length?expand(a.post,false):[""];return l.map((function(e){return a.pre+p[0]+e}))}}}var h=a.pre;var l=a.post.length?expand(a.post,false):[""];var d;if(c){var m=numeric(p[0]);var g=numeric(p[1]);var v=Math.max(p[0].length,p[1].length);var b=p.length==3?Math.abs(numeric(p[2])):1;var y=lte;var _=g<m;if(_){b*=-1;y=gte}var w=p.some(isPadded);d=[];for(var x=m;y(x,g);x+=b){var S;if(u){S=String.fromCharCode(x);if(S==="\\")S=""}else{S=String(x);if(w){var C=v-S.length;if(C>0){var E=new Array(C+1).join("0");if(x<0)S="-"+E+S.slice(1);else S=E+S}}}d.push(S)}}else{d=n(p,(function(e){return expand(e,false)}))}for(var O=0;O<d.length;O++){for(var M=0;M<l.length;M++){var j=h+d[O]+l[M];if(!t||c||j)r.push(j)}}return r}},891:e=>{e.exports=function(e,r){var n=[];for(var i=0;i<e.length;i++){var a=r(e[i],i);if(t(a))n.push.apply(n,a);else n.push(a)}return n};var t=Array.isArray||function(e){return Object.prototype.toString.call(e)==="[object Array]"}},973:(e,t,r)=>{e.exports=minimatch;minimatch.Minimatch=Minimatch;var n={sep:"/"};try{n=r(622)}catch(e){}var i=minimatch.GLOBSTAR=Minimatch.GLOBSTAR={};var a=r(850);var s={"!":{open:"(?:(?!(?:",close:"))[^/]*?)"},"?":{open:"(?:",close:")?"},"+":{open:"(?:",close:")+"},"*":{open:"(?:",close:")*"},"@":{open:"(?:",close:")"}};var o="[^/]";var u=o+"*?";var c="(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?";var f="(?:(?!(?:\\/|^)\\.).)*?";var p=charSet("().*{}+?[]^$\\!");function charSet(e){return e.split("").reduce((function(e,t){e[t]=true;return e}),{})}var l=/\/+/;minimatch.filter=filter;function filter(e,t){t=t||{};return function(r,n,i){return minimatch(r,e,t)}}function ext(e,t){e=e||{};t=t||{};var r={};Object.keys(t).forEach((function(e){r[e]=t[e]}));Object.keys(e).forEach((function(t){r[t]=e[t]}));return r}minimatch.defaults=function(e){if(!e||!Object.keys(e).length)return minimatch;var t=minimatch;var r=function minimatch(r,n,i){return t.minimatch(r,n,ext(e,i))};r.Minimatch=function Minimatch(r,n){return new t.Minimatch(r,ext(e,n))};return r};Minimatch.defaults=function(e){if(!e||!Object.keys(e).length)return Minimatch;return minimatch.defaults(e).Minimatch};function minimatch(e,t,r){if(typeof t!=="string"){throw new TypeError("glob pattern string required")}if(!r)r={};if(!r.nocomment&&t.charAt(0)==="#"){return false}if(t.trim()==="")return e==="";return new Minimatch(t,r).match(e)}function Minimatch(e,t){if(!(this instanceof Minimatch)){return new Minimatch(e,t)}if(typeof e!=="string"){throw new TypeError("glob pattern string required")}if(!t)t={};e=e.trim();if(n.sep!=="/"){e=e.split(n.sep).join("/")}this.options=t;this.set=[];this.pattern=e;this.regexp=null;this.negate=false;this.comment=false;this.empty=false;this.make()}Minimatch.prototype.debug=function(){};Minimatch.prototype.make=make;function make(){if(this._made)return;var e=this.pattern;var t=this.options;if(!t.nocomment&&e.charAt(0)==="#"){this.comment=true;return}if(!e){this.empty=true;return}this.parseNegate();var r=this.globSet=this.braceExpand();if(t.debug)this.debug=console.error;this.debug(this.pattern,r);r=this.globParts=r.map((function(e){return e.split(l)}));this.debug(this.pattern,r);r=r.map((function(e,t,r){return e.map(this.parse,this)}),this);this.debug(this.pattern,r);r=r.filter((function(e){return e.indexOf(false)===-1}));this.debug(this.pattern,r);this.set=r}Minimatch.prototype.parseNegate=parseNegate;function parseNegate(){var e=this.pattern;var t=false;var r=this.options;var n=0;if(r.nonegate)return;for(var i=0,a=e.length;i<a&&e.charAt(i)==="!";i++){t=!t;n++}if(n)this.pattern=e.substr(n);this.negate=t}minimatch.braceExpand=function(e,t){return braceExpand(e,t)};Minimatch.prototype.braceExpand=braceExpand;function braceExpand(e,t){if(!t){if(this instanceof Minimatch){t=this.options}else{t={}}}e=typeof e==="undefined"?this.pattern:e;if(typeof e==="undefined"){throw new TypeError("undefined pattern")}if(t.nobrace||!e.match(/\{.*\}/)){return[e]}return a(e)}Minimatch.prototype.parse=parse;var h={};function parse(e,t){if(e.length>1024*64){throw new TypeError("pattern is too long")}var r=this.options;if(!r.noglobstar&&e==="**")return i;if(e==="")return"";var n="";var a=!!r.nocase;var c=false;var f=[];var l=[];var d;var m=false;var g=-1;var v=-1;var b=e.charAt(0)==="."?"":r.dot?"(?!(?:^|\\/)\\.{1,2}(?:$|\\/))":"(?!\\.)";var y=this;function clearStateChar(){if(d){switch(d){case"*":n+=u;a=true;break;case"?":n+=o;a=true;break;default:n+="\\"+d;break}y.debug("clearStateChar %j %j",d,n);d=false}}for(var _=0,w=e.length,x;_<w&&(x=e.charAt(_));_++){this.debug("%s\t%s %s %j",e,_,n,x);if(c&&p[x]){n+="\\"+x;c=false;continue}switch(x){case"/":return false;case"\\":clearStateChar();c=true;continue;case"?":case"*":case"+":case"@":case"!":this.debug("%s\t%s %s %j <-- stateChar",e,_,n,x);if(m){this.debug("  in class");if(x==="!"&&_===v+1)x="^";n+=x;continue}y.debug("call clearStateChar %j",d);clearStateChar();d=x;if(r.noext)clearStateChar();continue;case"(":if(m){n+="(";continue}if(!d){n+="\\(";continue}f.push({type:d,start:_-1,reStart:n.length,open:s[d].open,close:s[d].close});n+=d==="!"?"(?:(?!(?:":"(?:";this.debug("plType %j %j",d,n);d=false;continue;case")":if(m||!f.length){n+="\\)";continue}clearStateChar();a=true;var S=f.pop();n+=S.close;if(S.type==="!"){l.push(S)}S.reEnd=n.length;continue;case"|":if(m||!f.length||c){n+="\\|";c=false;continue}clearStateChar();n+="|";continue;case"[":clearStateChar();if(m){n+="\\"+x;continue}m=true;v=_;g=n.length;n+=x;continue;case"]":if(_===v+1||!m){n+="\\"+x;c=false;continue}if(m){var C=e.substring(v+1,_);try{RegExp("["+C+"]")}catch(e){var E=this.parse(C,h);n=n.substr(0,g)+"\\["+E[0]+"\\]";a=a||E[1];m=false;continue}}a=true;m=false;n+=x;continue;default:clearStateChar();if(c){c=false}else if(p[x]&&!(x==="^"&&m)){n+="\\"}n+=x}}if(m){C=e.substr(v+1);E=this.parse(C,h);n=n.substr(0,g)+"\\["+E[0];a=a||E[1]}for(S=f.pop();S;S=f.pop()){var O=n.slice(S.reStart+S.open.length);this.debug("setting tail",n,S);O=O.replace(/((?:\\{2}){0,64})(\\?)\|/g,(function(e,t,r){if(!r){r="\\"}return t+t+r+"|"}));this.debug("tail=%j\n   %s",O,O,S,n);var M=S.type==="*"?u:S.type==="?"?o:"\\"+S.type;a=true;n=n.slice(0,S.reStart)+M+"\\("+O}clearStateChar();if(c){n+="\\\\"}var j=false;switch(n.charAt(0)){case".":case"[":case"(":j=true}for(var $=l.length-1;$>-1;$--){var P=l[$];var k=n.slice(0,P.reStart);var A=n.slice(P.reStart,P.reEnd-8);var T=n.slice(P.reEnd-8,P.reEnd);var q=n.slice(P.reEnd);T+=q;var I=k.split("(").length-1;var R=q;for(_=0;_<I;_++){R=R.replace(/\)[+*?]?/,"")}q=R;var G="";if(q===""&&t!==h){G="$"}var L=k+A+q+G+T;n=L}if(n!==""&&a){n="(?=.)"+n}if(j){n=b+n}if(t===h){return[n,a]}if(!a){return globUnescape(e)}var N=r.nocase?"i":"";try{var V=new RegExp("^"+n+"$",N)}catch(e){return new RegExp("$.")}V._glob=e;V._src=n;return V}minimatch.makeRe=function(e,t){return new Minimatch(e,t||{}).makeRe()};Minimatch.prototype.makeRe=makeRe;function makeRe(){if(this.regexp||this.regexp===false)return this.regexp;var e=this.set;if(!e.length){this.regexp=false;return this.regexp}var t=this.options;var r=t.noglobstar?u:t.dot?c:f;var n=t.nocase?"i":"";var a=e.map((function(e){return e.map((function(e){return e===i?r:typeof e==="string"?regExpEscape(e):e._src})).join("\\/")})).join("|");a="^(?:"+a+")$";if(this.negate)a="^(?!"+a+").*$";try{this.regexp=new RegExp(a,n)}catch(e){this.regexp=false}return this.regexp}minimatch.match=function(e,t,r){r=r||{};var n=new Minimatch(t,r);e=e.filter((function(e){return n.match(e)}));if(n.options.nonull&&!e.length){e.push(t)}return e};Minimatch.prototype.match=match;function match(e,t){this.debug("match",e,this.pattern);if(this.comment)return false;if(this.empty)return e==="";if(e==="/"&&t)return true;var r=this.options;if(n.sep!=="/"){e=e.split(n.sep).join("/")}e=e.split(l);this.debug(this.pattern,"split",e);var i=this.set;this.debug(this.pattern,"set",i);var a;var s;for(s=e.length-1;s>=0;s--){a=e[s];if(a)break}for(s=0;s<i.length;s++){var o=i[s];var u=e;if(r.matchBase&&o.length===1){u=[a]}var c=this.matchOne(u,o,t);if(c){if(r.flipNegate)return true;return!this.negate}}if(r.flipNegate)return false;return this.negate}Minimatch.prototype.matchOne=function(e,t,r){var n=this.options;this.debug("matchOne",{this:this,file:e,pattern:t});this.debug("matchOne",e.length,t.length);for(var a=0,s=0,o=e.length,u=t.length;a<o&&s<u;a++,s++){this.debug("matchOne loop");var c=t[s];var f=e[a];this.debug(t,c,f);if(c===false)return false;if(c===i){this.debug("GLOBSTAR",[t,c,f]);var p=a;var l=s+1;if(l===u){this.debug("** at the end");for(;a<o;a++){if(e[a]==="."||e[a]===".."||!n.dot&&e[a].charAt(0)===".")return false}return true}while(p<o){var h=e[p];this.debug("\nglobstar while",e,p,t,l,h);if(this.matchOne(e.slice(p),t.slice(l),r)){this.debug("globstar found match!",p,o,h);return true}else{if(h==="."||h===".."||!n.dot&&h.charAt(0)==="."){this.debug("dot detected!",e,p,t,l);break}this.debug("globstar swallow a segment, and continue");p++}}if(r){this.debug("\n>>> no match, partial?",e,p,t,l);if(p===o)return true}return false}var d;if(typeof c==="string"){if(n.nocase){d=f.toLowerCase()===c.toLowerCase()}else{d=f===c}this.debug("string match",c,f,d)}else{d=f.match(c);this.debug("pattern match",c,f,d)}if(!d)return false}if(a===o&&s===u){return true}else if(a===o){return r}else if(s===u){var m=a===o-1&&e[a]==="";return m}throw new Error("wtf?")};function globUnescape(e){return e.replace(/\\(.)/g,"$1")}function regExpEscape(e){return e.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&")}},747:e=>{"use strict";e.exports=require("fs")},87:e=>{"use strict";e.exports=require("os")},622:e=>{"use strict";e.exports=require("path")}};var t={};function __nccwpck_require__(r){var n=t[r];if(n!==undefined){return n.exports}var i=t[r]={exports:{}};var a=true;try{e[r].call(i.exports,i,i.exports,__nccwpck_require__);a=false}finally{if(a)delete t[r]}return i.exports}(()=>{__nccwpck_require__.r=e=>{if(typeof Symbol!=="undefined"&&Symbol.toStringTag){Object.defineProperty(e,Symbol.toStringTag,{value:"Module"})}Object.defineProperty(e,"__esModule",{value:true})}})();if(typeof __nccwpck_require__!=="undefined")__nccwpck_require__.ab=__dirname+"/";var r={};(()=>{"use strict";__nccwpck_require__.r(r);var e=__nccwpck_require__(186);var t=__nccwpck_require__(747);const n=require("readline");var i=__nccwpck_require__(973);var a=undefined&&undefined.__awaiter||function(e,t,r,n){function adopt(e){return e instanceof r?e:new r((function(t){t(e)}))}return new(r||(r=Promise))((function(r,i){function fulfilled(e){try{step(n.next(e))}catch(e){i(e)}}function rejected(e){try{step(n["throw"](e))}catch(e){i(e)}}function step(e){e.done?r(e.value):adopt(e.value).then(fulfilled,rejected)}step((n=n.apply(e,t||[])).next())}))};var s=undefined&&undefined.__asyncValues||function(e){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var t=e[Symbol.asyncIterator],r;return t?t.call(e):(e=typeof __values==="function"?__values(e):e[Symbol.iterator](),r={},verb("next"),verb("throw"),verb("return"),r[Symbol.asyncIterator]=function(){return this},r);function verb(t){r[t]=e[t]&&function(r){return new Promise((function(n,i){r=e[t](r),settle(n,i,r.done,r.value)}))}}function settle(e,t,r,n){Promise.resolve(n).then((function(t){e({value:t,done:r})}),t)}};const o=(0,e.getInput)("path",{required:true});const u=(0,e.getInput)("codeowners",{required:true});run(u);function run(r){var u,c;return a(this,void 0,void 0,(function*(){const a=(0,t.createReadStream)(r);console.log("Getting owners for the following paths:");console.log(`${o.split(",").join("\n")}`);const f=n.createInterface({input:a,crlfDelay:Infinity});let p=new Set;try{for(var l=s(f),h;h=yield l.next(),!h.done;){let e=h.value;e=e.trim();if(e.length===0||e.startsWith("#")){continue}const[t,...r]=e.split(" ");if(r.length===0){continue}for(let e in o.split(",")){if(i(e,t)){r.forEach((e=>p.add(e)))}}}}catch(e){u={error:e}}finally{try{if(h&&!h.done&&(c=l.return))yield c.call(l)}finally{if(u)throw u.error}}(0,e.setOutput)("owners",[...p])}))}})();module.exports=r})();