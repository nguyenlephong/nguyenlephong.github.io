(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[9485],{55673:function(e,t,n){"use strict";function r(e,t){return(r=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}n.d(t,{Z:function(){return r}})},56152:function(e){"use strict";e.exports=function(e,t,n,r,o,i,a,s){if(!e){var u;if(void 0===t)u=new Error("Minified exception occurred; use the non-minified dev environment for the full error message and additional helpful warnings.");else{var c=[n,r,o,i,a,s],f=0;(u=new Error(t.replace(/%s/g,(function(){return c[f++]})))).name="Invariant Violation"}throw u.framesToPop=1,u}}},82035:function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e){return function(t,n,r,o,i){var a=r||"<<anonymous>>",s=i||n;if(null==t[n])return new Error("The "+o+" `"+s+"` is required to make `"+a+"` accessible for users of assistive technologies such as screen readers.");for(var u=arguments.length,c=Array(u>5?u-5:0),f=5;f<u;f++)c[f-5]=arguments[f];return e.apply(void 0,[t,n,r,o,i].concat(c))}},e.exports=t.default},27188:function(e,t,n){"use strict";n.d(t,{Z:function(){return dt}});var r=n(56376),o=n(68827),i=n(27010);function a(e,t){return e.contains?e.contains(t):e.compareDocumentPosition?e===t||!!(16&e.compareDocumentPosition(t)):void 0}var s=n(22771);function u(){var e=(0,s.useRef)(!0),t=(0,s.useRef)((function(){return e.current}));return(0,s.useEffect)((function(){return function(){e.current=!1}}),[]),t.current}function c(e){var t=function(e){var t=(0,s.useRef)(e);return t.current=e,t}(e);(0,s.useEffect)((function(){return function(){return t.current()}}),[])}var f=Math.pow(2,31)-1;function l(e,t,n){var r=n-Date.now();e.current=r<=f?setTimeout(t,r):setTimeout((function(){return l(e,t,n)}),f)}function p(){var e=u(),t=(0,s.useRef)();return c((function(){return clearTimeout(t.current)})),(0,s.useMemo)((function(){var n=function(){return clearTimeout(t.current)};return{set:function(r,o){void 0===o&&(o=0),e()&&(n(),o<=f?t.current=setTimeout(r,o):l(t,r,Date.now()+o))},clear:n}}),[])}var d=n(36448);function m(e){return e&&"setState"in e?d.findDOMNode(e):null!=e?e:null}var v=n(69484),h=n.n(v);n(56152);function g(e,t,n){var r=(0,s.useRef)(void 0!==e),o=(0,s.useState)(t),i=o[0],a=o[1],u=void 0!==e,c=r.current;return r.current=u,!u&&c&&i!==t&&a(t),[u?e:i,(0,s.useCallback)((function(e){for(var t=arguments.length,r=new Array(t>1?t-1:0),o=1;o<t;o++)r[o-1]=arguments[o];n&&n.apply(void 0,[e].concat(r)),a(e)}),[n])]}function y(){var e=this.constructor.getDerivedStateFromProps(this.props,this.state);null!==e&&void 0!==e&&this.setState(e)}function b(e){this.setState(function(t){var n=this.constructor.getDerivedStateFromProps(e,t);return null!==n&&void 0!==n?n:null}.bind(this))}function w(e,t){try{var n=this.props,r=this.state;this.props=e,this.state=t,this.__reactInternalSnapshotFlag=!0,this.__reactInternalSnapshot=this.getSnapshotBeforeUpdate(n,r)}finally{this.props=n,this.state=r}}y.__suppressDeprecationWarning=!0,b.__suppressDeprecationWarning=!0,w.__suppressDeprecationWarning=!0;var x=n(18258),O=n.n(x),E=n(93506),C=n.n(E);function k(){return(0,s.useState)(null)}var D=function(e){return e&&"function"!==typeof e?function(t){e.current=t}:e};var P=function(e,t){return(0,s.useMemo)((function(){return function(e,t){var n=D(e),r=D(t);return function(e){n&&n(e),r&&r(e)}}(e,t)}),[e,t])},Z="top",R="bottom",A="right",M="left",j="auto",T=[Z,R,A,M],_="start",S="end",L="viewport",B="popper",N=T.reduce((function(e,t){return e.concat([t+"-"+_,t+"-"+S])}),[]),W=[].concat(T,[j]).reduce((function(e,t){return e.concat([t,t+"-"+_,t+"-"+S])}),[]),H=["beforeRead","read","afterRead","beforeMain","main","afterMain","beforeWrite","write","afterWrite"];var q=function(e){var t=u();return[e[0],(0,s.useCallback)((function(n){if(t())return e[1](n)}),[t,e[1]])]};function F(e){return e.split("-")[0]}function U(e){var t=e.getBoundingClientRect();return{width:t.width,height:t.height,top:t.top,right:t.right,bottom:t.bottom,left:t.left,x:t.left,y:t.top}}function I(e){var t=U(e),n=e.offsetWidth,r=e.offsetHeight;return Math.abs(t.width-n)<=1&&(n=t.width),Math.abs(t.height-r)<=1&&(r=t.height),{x:e.offsetLeft,y:e.offsetTop,width:n,height:r}}function V(e){if(null==e)return window;if("[object Window]"!==e.toString()){var t=e.ownerDocument;return t&&t.defaultView||window}return e}function K(e){return e instanceof V(e).Element||e instanceof Element}function z(e){return e instanceof V(e).HTMLElement||e instanceof HTMLElement}function X(e){return"undefined"!==typeof ShadowRoot&&(e instanceof V(e).ShadowRoot||e instanceof ShadowRoot)}function Y(e,t){var n=t.getRootNode&&t.getRootNode();if(e.contains(t))return!0;if(n&&X(n)){var r=t;do{if(r&&e.isSameNode(r))return!0;r=r.parentNode||r.host}while(r)}return!1}function G(e){return e?(e.nodeName||"").toLowerCase():null}function J(e){return V(e).getComputedStyle(e)}function Q(e){return["table","td","th"].indexOf(G(e))>=0}function $(e){return((K(e)?e.ownerDocument:e.document)||window.document).documentElement}function ee(e){return"html"===G(e)?e:e.assignedSlot||e.parentNode||(X(e)?e.host:null)||$(e)}function te(e){return z(e)&&"fixed"!==J(e).position?e.offsetParent:null}function ne(e){for(var t=V(e),n=te(e);n&&Q(n)&&"static"===J(n).position;)n=te(n);return n&&("html"===G(n)||"body"===G(n)&&"static"===J(n).position)?t:n||function(e){var t=-1!==navigator.userAgent.toLowerCase().indexOf("firefox");if(-1!==navigator.userAgent.indexOf("Trident")&&z(e)&&"fixed"===J(e).position)return null;for(var n=ee(e);z(n)&&["html","body"].indexOf(G(n))<0;){var r=J(n);if("none"!==r.transform||"none"!==r.perspective||"paint"===r.contain||-1!==["transform","perspective"].indexOf(r.willChange)||t&&"filter"===r.willChange||t&&r.filter&&"none"!==r.filter)return n;n=n.parentNode}return null}(e)||t}function re(e){return["top","bottom"].indexOf(e)>=0?"x":"y"}var oe=Math.max,ie=Math.min,ae=Math.round;function se(e,t,n){return oe(e,ie(t,n))}function ue(e){return Object.assign({},{top:0,right:0,bottom:0,left:0},e)}function ce(e,t){return t.reduce((function(t,n){return t[n]=e,t}),{})}var fe={top:"auto",right:"auto",bottom:"auto",left:"auto"};function le(e){var t,n=e.popper,r=e.popperRect,o=e.placement,i=e.offsets,a=e.position,s=e.gpuAcceleration,u=e.adaptive,c=e.roundOffsets,f=!0===c?function(e){var t=e.x,n=e.y,r=window.devicePixelRatio||1;return{x:ae(ae(t*r)/r)||0,y:ae(ae(n*r)/r)||0}}(i):"function"===typeof c?c(i):i,l=f.x,p=void 0===l?0:l,d=f.y,m=void 0===d?0:d,v=i.hasOwnProperty("x"),h=i.hasOwnProperty("y"),g=M,y=Z,b=window;if(u){var w=ne(n),x="clientHeight",O="clientWidth";w===V(n)&&"static"!==J(w=$(n)).position&&(x="scrollHeight",O="scrollWidth"),w=w,o===Z&&(y=R,m-=w[x]-r.height,m*=s?1:-1),o===M&&(g=A,p-=w[O]-r.width,p*=s?1:-1)}var E,C=Object.assign({position:a},u&&fe);return s?Object.assign({},C,((E={})[y]=h?"0":"",E[g]=v?"0":"",E.transform=(b.devicePixelRatio||1)<2?"translate("+p+"px, "+m+"px)":"translate3d("+p+"px, "+m+"px, 0)",E)):Object.assign({},C,((t={})[y]=h?m+"px":"",t[g]=v?p+"px":"",t.transform="",t))}var pe={passive:!0};var de={left:"right",right:"left",bottom:"top",top:"bottom"};function me(e){return e.replace(/left|right|bottom|top/g,(function(e){return de[e]}))}var ve={start:"end",end:"start"};function he(e){return e.replace(/start|end/g,(function(e){return ve[e]}))}function ge(e){var t=V(e);return{scrollLeft:t.pageXOffset,scrollTop:t.pageYOffset}}function ye(e){return U($(e)).left+ge(e).scrollLeft}function be(e){var t=J(e),n=t.overflow,r=t.overflowX,o=t.overflowY;return/auto|scroll|overlay|hidden/.test(n+o+r)}function we(e){return["html","body","#document"].indexOf(G(e))>=0?e.ownerDocument.body:z(e)&&be(e)?e:we(ee(e))}function xe(e,t){var n;void 0===t&&(t=[]);var r=we(e),o=r===(null==(n=e.ownerDocument)?void 0:n.body),i=V(r),a=o?[i].concat(i.visualViewport||[],be(r)?r:[]):r,s=t.concat(a);return o?s:s.concat(xe(ee(a)))}function Oe(e){return Object.assign({},e,{left:e.x,top:e.y,right:e.x+e.width,bottom:e.y+e.height})}function Ee(e,t){return t===L?Oe(function(e){var t=V(e),n=$(e),r=t.visualViewport,o=n.clientWidth,i=n.clientHeight,a=0,s=0;return r&&(o=r.width,i=r.height,/^((?!chrome|android).)*safari/i.test(navigator.userAgent)||(a=r.offsetLeft,s=r.offsetTop)),{width:o,height:i,x:a+ye(e),y:s}}(e)):z(t)?function(e){var t=U(e);return t.top=t.top+e.clientTop,t.left=t.left+e.clientLeft,t.bottom=t.top+e.clientHeight,t.right=t.left+e.clientWidth,t.width=e.clientWidth,t.height=e.clientHeight,t.x=t.left,t.y=t.top,t}(t):Oe(function(e){var t,n=$(e),r=ge(e),o=null==(t=e.ownerDocument)?void 0:t.body,i=oe(n.scrollWidth,n.clientWidth,o?o.scrollWidth:0,o?o.clientWidth:0),a=oe(n.scrollHeight,n.clientHeight,o?o.scrollHeight:0,o?o.clientHeight:0),s=-r.scrollLeft+ye(e),u=-r.scrollTop;return"rtl"===J(o||n).direction&&(s+=oe(n.clientWidth,o?o.clientWidth:0)-i),{width:i,height:a,x:s,y:u}}($(e)))}function Ce(e,t,n){var r="clippingParents"===t?function(e){var t=xe(ee(e)),n=["absolute","fixed"].indexOf(J(e).position)>=0&&z(e)?ne(e):e;return K(n)?t.filter((function(e){return K(e)&&Y(e,n)&&"body"!==G(e)})):[]}(e):[].concat(t),o=[].concat(r,[n]),i=o[0],a=o.reduce((function(t,n){var r=Ee(e,n);return t.top=oe(r.top,t.top),t.right=ie(r.right,t.right),t.bottom=ie(r.bottom,t.bottom),t.left=oe(r.left,t.left),t}),Ee(e,i));return a.width=a.right-a.left,a.height=a.bottom-a.top,a.x=a.left,a.y=a.top,a}function ke(e){return e.split("-")[1]}function De(e){var t,n=e.reference,r=e.element,o=e.placement,i=o?F(o):null,a=o?ke(o):null,s=n.x+n.width/2-r.width/2,u=n.y+n.height/2-r.height/2;switch(i){case Z:t={x:s,y:n.y-r.height};break;case R:t={x:s,y:n.y+n.height};break;case A:t={x:n.x+n.width,y:u};break;case M:t={x:n.x-r.width,y:u};break;default:t={x:n.x,y:n.y}}var c=i?re(i):null;if(null!=c){var f="y"===c?"height":"width";switch(a){case _:t[c]=t[c]-(n[f]/2-r[f]/2);break;case S:t[c]=t[c]+(n[f]/2-r[f]/2)}}return t}function Pe(e,t){void 0===t&&(t={});var n=t,r=n.placement,o=void 0===r?e.placement:r,i=n.boundary,a=void 0===i?"clippingParents":i,s=n.rootBoundary,u=void 0===s?L:s,c=n.elementContext,f=void 0===c?B:c,l=n.altBoundary,p=void 0!==l&&l,d=n.padding,m=void 0===d?0:d,v=ue("number"!==typeof m?m:ce(m,T)),h=f===B?"reference":B,g=e.elements.reference,y=e.rects.popper,b=e.elements[p?h:f],w=Ce(K(b)?b:b.contextElement||$(e.elements.popper),a,u),x=U(g),O=De({reference:x,element:y,strategy:"absolute",placement:o}),E=Oe(Object.assign({},y,O)),C=f===B?E:x,k={top:w.top-C.top+v.top,bottom:C.bottom-w.bottom+v.bottom,left:w.left-C.left+v.left,right:C.right-w.right+v.right},D=e.modifiersData.offset;if(f===B&&D){var P=D[o];Object.keys(k).forEach((function(e){var t=[A,R].indexOf(e)>=0?1:-1,n=[Z,R].indexOf(e)>=0?"y":"x";k[e]+=P[n]*t}))}return k}function Ze(e,t,n){return void 0===n&&(n={x:0,y:0}),{top:e.top-t.height-n.y,right:e.right-t.width+n.x,bottom:e.bottom-t.height+n.y,left:e.left-t.width-n.x}}function Re(e){return[Z,A,R,M].some((function(t){return e[t]>=0}))}function Ae(e,t,n){void 0===n&&(n=!1);var r=$(t),o=U(e),i=z(t),a={scrollLeft:0,scrollTop:0},s={x:0,y:0};return(i||!i&&!n)&&(("body"!==G(t)||be(r))&&(a=function(e){return e!==V(e)&&z(e)?{scrollLeft:(t=e).scrollLeft,scrollTop:t.scrollTop}:ge(e);var t}(t)),z(t)?((s=U(t)).x+=t.clientLeft,s.y+=t.clientTop):r&&(s.x=ye(r))),{x:o.left+a.scrollLeft-s.x,y:o.top+a.scrollTop-s.y,width:o.width,height:o.height}}function Me(e){var t=new Map,n=new Set,r=[];function o(e){n.add(e.name),[].concat(e.requires||[],e.requiresIfExists||[]).forEach((function(e){if(!n.has(e)){var r=t.get(e);r&&o(r)}})),r.push(e)}return e.forEach((function(e){t.set(e.name,e)})),e.forEach((function(e){n.has(e.name)||o(e)})),r}function je(e){var t;return function(){return t||(t=new Promise((function(n){Promise.resolve().then((function(){t=void 0,n(e())}))}))),t}}var Te={placement:"bottom",modifiers:[],strategy:"absolute"};function _e(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return!t.some((function(e){return!(e&&"function"===typeof e.getBoundingClientRect)}))}function Se(e){void 0===e&&(e={});var t=e,n=t.defaultModifiers,r=void 0===n?[]:n,o=t.defaultOptions,i=void 0===o?Te:o;return function(e,t,n){void 0===n&&(n=i);var o={placement:"bottom",orderedModifiers:[],options:Object.assign({},Te,i),modifiersData:{},elements:{reference:e,popper:t},attributes:{},styles:{}},a=[],s=!1,u={state:o,setOptions:function(n){c(),o.options=Object.assign({},i,o.options,n),o.scrollParents={reference:K(e)?xe(e):e.contextElement?xe(e.contextElement):[],popper:xe(t)};var s=function(e){var t=Me(e);return H.reduce((function(e,n){return e.concat(t.filter((function(e){return e.phase===n})))}),[])}(function(e){var t=e.reduce((function(e,t){var n=e[t.name];return e[t.name]=n?Object.assign({},n,t,{options:Object.assign({},n.options,t.options),data:Object.assign({},n.data,t.data)}):t,e}),{});return Object.keys(t).map((function(e){return t[e]}))}([].concat(r,o.options.modifiers)));return o.orderedModifiers=s.filter((function(e){return e.enabled})),o.orderedModifiers.forEach((function(e){var t=e.name,n=e.options,r=void 0===n?{}:n,i=e.effect;if("function"===typeof i){var s=i({state:o,name:t,instance:u,options:r}),c=function(){};a.push(s||c)}})),u.update()},forceUpdate:function(){if(!s){var e=o.elements,t=e.reference,n=e.popper;if(_e(t,n)){o.rects={reference:Ae(t,ne(n),"fixed"===o.options.strategy),popper:I(n)},o.reset=!1,o.placement=o.options.placement,o.orderedModifiers.forEach((function(e){return o.modifiersData[e.name]=Object.assign({},e.data)}));for(var r=0;r<o.orderedModifiers.length;r++)if(!0!==o.reset){var i=o.orderedModifiers[r],a=i.fn,c=i.options,f=void 0===c?{}:c,l=i.name;"function"===typeof a&&(o=a({state:o,options:f,name:l,instance:u})||o)}else o.reset=!1,r=-1}}},update:je((function(){return new Promise((function(e){u.forceUpdate(),e(o)}))})),destroy:function(){c(),s=!0}};if(!_e(e,t))return u;function c(){a.forEach((function(e){return e()})),a=[]}return u.setOptions(n).then((function(e){!s&&n.onFirstUpdate&&n.onFirstUpdate(e)})),u}}var Le=Se({defaultModifiers:[{name:"hide",enabled:!0,phase:"main",requiresIfExists:["preventOverflow"],fn:function(e){var t=e.state,n=e.name,r=t.rects.reference,o=t.rects.popper,i=t.modifiersData.preventOverflow,a=Pe(t,{elementContext:"reference"}),s=Pe(t,{altBoundary:!0}),u=Ze(a,r),c=Ze(s,o,i),f=Re(u),l=Re(c);t.modifiersData[n]={referenceClippingOffsets:u,popperEscapeOffsets:c,isReferenceHidden:f,hasPopperEscaped:l},t.attributes.popper=Object.assign({},t.attributes.popper,{"data-popper-reference-hidden":f,"data-popper-escaped":l})}},{name:"popperOffsets",enabled:!0,phase:"read",fn:function(e){var t=e.state,n=e.name;t.modifiersData[n]=De({reference:t.rects.reference,element:t.rects.popper,strategy:"absolute",placement:t.placement})},data:{}},{name:"computeStyles",enabled:!0,phase:"beforeWrite",fn:function(e){var t=e.state,n=e.options,r=n.gpuAcceleration,o=void 0===r||r,i=n.adaptive,a=void 0===i||i,s=n.roundOffsets,u=void 0===s||s,c={placement:F(t.placement),popper:t.elements.popper,popperRect:t.rects.popper,gpuAcceleration:o};null!=t.modifiersData.popperOffsets&&(t.styles.popper=Object.assign({},t.styles.popper,le(Object.assign({},c,{offsets:t.modifiersData.popperOffsets,position:t.options.strategy,adaptive:a,roundOffsets:u})))),null!=t.modifiersData.arrow&&(t.styles.arrow=Object.assign({},t.styles.arrow,le(Object.assign({},c,{offsets:t.modifiersData.arrow,position:"absolute",adaptive:!1,roundOffsets:u})))),t.attributes.popper=Object.assign({},t.attributes.popper,{"data-popper-placement":t.placement})},data:{}},{name:"eventListeners",enabled:!0,phase:"write",fn:function(){},effect:function(e){var t=e.state,n=e.instance,r=e.options,o=r.scroll,i=void 0===o||o,a=r.resize,s=void 0===a||a,u=V(t.elements.popper),c=[].concat(t.scrollParents.reference,t.scrollParents.popper);return i&&c.forEach((function(e){e.addEventListener("scroll",n.update,pe)})),s&&u.addEventListener("resize",n.update,pe),function(){i&&c.forEach((function(e){e.removeEventListener("scroll",n.update,pe)})),s&&u.removeEventListener("resize",n.update,pe)}},data:{}},{name:"offset",enabled:!0,phase:"main",requires:["popperOffsets"],fn:function(e){var t=e.state,n=e.options,r=e.name,o=n.offset,i=void 0===o?[0,0]:o,a=W.reduce((function(e,n){return e[n]=function(e,t,n){var r=F(e),o=[M,Z].indexOf(r)>=0?-1:1,i="function"===typeof n?n(Object.assign({},t,{placement:e})):n,a=i[0],s=i[1];return a=a||0,s=(s||0)*o,[M,A].indexOf(r)>=0?{x:s,y:a}:{x:a,y:s}}(n,t.rects,i),e}),{}),s=a[t.placement],u=s.x,c=s.y;null!=t.modifiersData.popperOffsets&&(t.modifiersData.popperOffsets.x+=u,t.modifiersData.popperOffsets.y+=c),t.modifiersData[r]=a}},{name:"flip",enabled:!0,phase:"main",fn:function(e){var t=e.state,n=e.options,r=e.name;if(!t.modifiersData[r]._skip){for(var o=n.mainAxis,i=void 0===o||o,a=n.altAxis,s=void 0===a||a,u=n.fallbackPlacements,c=n.padding,f=n.boundary,l=n.rootBoundary,p=n.altBoundary,d=n.flipVariations,m=void 0===d||d,v=n.allowedAutoPlacements,h=t.options.placement,g=F(h),y=u||(g===h||!m?[me(h)]:function(e){if(F(e)===j)return[];var t=me(e);return[he(e),t,he(t)]}(h)),b=[h].concat(y).reduce((function(e,n){return e.concat(F(n)===j?function(e,t){void 0===t&&(t={});var n=t,r=n.placement,o=n.boundary,i=n.rootBoundary,a=n.padding,s=n.flipVariations,u=n.allowedAutoPlacements,c=void 0===u?W:u,f=ke(r),l=f?s?N:N.filter((function(e){return ke(e)===f})):T,p=l.filter((function(e){return c.indexOf(e)>=0}));0===p.length&&(p=l);var d=p.reduce((function(t,n){return t[n]=Pe(e,{placement:n,boundary:o,rootBoundary:i,padding:a})[F(n)],t}),{});return Object.keys(d).sort((function(e,t){return d[e]-d[t]}))}(t,{placement:n,boundary:f,rootBoundary:l,padding:c,flipVariations:m,allowedAutoPlacements:v}):n)}),[]),w=t.rects.reference,x=t.rects.popper,O=new Map,E=!0,C=b[0],k=0;k<b.length;k++){var D=b[k],P=F(D),S=ke(D)===_,L=[Z,R].indexOf(P)>=0,B=L?"width":"height",H=Pe(t,{placement:D,boundary:f,rootBoundary:l,altBoundary:p,padding:c}),q=L?S?A:M:S?R:Z;w[B]>x[B]&&(q=me(q));var U=me(q),I=[];if(i&&I.push(H[P]<=0),s&&I.push(H[q]<=0,H[U]<=0),I.every((function(e){return e}))){C=D,E=!1;break}O.set(D,I)}if(E)for(var V=function(e){var t=b.find((function(t){var n=O.get(t);if(n)return n.slice(0,e).every((function(e){return e}))}));if(t)return C=t,"break"},K=m?3:1;K>0;K--){if("break"===V(K))break}t.placement!==C&&(t.modifiersData[r]._skip=!0,t.placement=C,t.reset=!0)}},requiresIfExists:["offset"],data:{_skip:!1}},{name:"preventOverflow",enabled:!0,phase:"main",fn:function(e){var t=e.state,n=e.options,r=e.name,o=n.mainAxis,i=void 0===o||o,a=n.altAxis,s=void 0!==a&&a,u=n.boundary,c=n.rootBoundary,f=n.altBoundary,l=n.padding,p=n.tether,d=void 0===p||p,m=n.tetherOffset,v=void 0===m?0:m,h=Pe(t,{boundary:u,rootBoundary:c,padding:l,altBoundary:f}),g=F(t.placement),y=ke(t.placement),b=!y,w=re(g),x="x"===w?"y":"x",O=t.modifiersData.popperOffsets,E=t.rects.reference,C=t.rects.popper,k="function"===typeof v?v(Object.assign({},t.rects,{placement:t.placement})):v,D={x:0,y:0};if(O){if(i||s){var P="y"===w?Z:M,j="y"===w?R:A,T="y"===w?"height":"width",S=O[w],L=O[w]+h[P],B=O[w]-h[j],N=d?-C[T]/2:0,W=y===_?E[T]:C[T],H=y===_?-C[T]:-E[T],q=t.elements.arrow,U=d&&q?I(q):{width:0,height:0},V=t.modifiersData["arrow#persistent"]?t.modifiersData["arrow#persistent"].padding:{top:0,right:0,bottom:0,left:0},K=V[P],z=V[j],X=se(0,E[T],U[T]),Y=b?E[T]/2-N-X-K-k:W-X-K-k,G=b?-E[T]/2+N+X+z+k:H+X+z+k,J=t.elements.arrow&&ne(t.elements.arrow),Q=J?"y"===w?J.clientTop||0:J.clientLeft||0:0,$=t.modifiersData.offset?t.modifiersData.offset[t.placement][w]:0,ee=O[w]+Y-$-Q,te=O[w]+G-$;if(i){var ae=se(d?ie(L,ee):L,S,d?oe(B,te):B);O[w]=ae,D[w]=ae-S}if(s){var ue="x"===w?Z:M,ce="x"===w?R:A,fe=O[x],le=fe+h[ue],pe=fe-h[ce],de=se(d?ie(le,ee):le,fe,d?oe(pe,te):pe);O[x]=de,D[x]=de-fe}}t.modifiersData[r]=D}},requiresIfExists:["offset"]},{name:"arrow",enabled:!0,phase:"main",fn:function(e){var t,n=e.state,r=e.name,o=e.options,i=n.elements.arrow,a=n.modifiersData.popperOffsets,s=F(n.placement),u=re(s),c=[M,A].indexOf(s)>=0?"height":"width";if(i&&a){var f=function(e,t){return ue("number"!==typeof(e="function"===typeof e?e(Object.assign({},t.rects,{placement:t.placement})):e)?e:ce(e,T))}(o.padding,n),l=I(i),p="y"===u?Z:M,d="y"===u?R:A,m=n.rects.reference[c]+n.rects.reference[u]-a[u]-n.rects.popper[c],v=a[u]-n.rects.reference[u],h=ne(i),g=h?"y"===u?h.clientHeight||0:h.clientWidth||0:0,y=m/2-v/2,b=f[p],w=g-l[c]-f[d],x=g/2-l[c]/2+y,O=se(b,x,w),E=u;n.modifiersData[r]=((t={})[E]=O,t.centerOffset=O-x,t)}},effect:function(e){var t=e.state,n=e.options.element,r=void 0===n?"[data-popper-arrow]":n;null!=r&&("string"!==typeof r||(r=t.elements.popper.querySelector(r)))&&Y(t.elements.popper,r)&&(t.elements.arrow=r)},requires:["popperOffsets"],requiresIfExists:["preventOverflow"]}]}),Be=function(e){return{position:e,top:"0",left:"0",opacity:"0",pointerEvents:"none"}},Ne={name:"applyStyles",enabled:!1},We={name:"ariaDescribedBy",enabled:!0,phase:"afterWrite",effect:function(e){var t=e.state;return function(){var e=t.elements,n=e.reference,r=e.popper;if("removeAttribute"in n){var o=(n.getAttribute("aria-describedby")||"").split(",").filter((function(e){return e.trim()!==r.id}));o.length?n.setAttribute("aria-describedby",o.join(",")):n.removeAttribute("aria-describedby")}}},fn:function(e){var t,n=e.state.elements,r=n.popper,o=n.reference,i=null==(t=r.getAttribute("role"))?void 0:t.toLowerCase();if(r.id&&"tooltip"===i&&"setAttribute"in o){var a=o.getAttribute("aria-describedby");if(a&&-1!==a.split(",").indexOf(r.id))return;o.setAttribute("aria-describedby",a?a+","+r.id:r.id)}}},He=[];var qe=function(e,t,n){var i=void 0===n?{}:n,a=i.enabled,u=void 0===a||a,c=i.placement,f=void 0===c?"bottom":c,l=i.strategy,p=void 0===l?"absolute":l,d=i.modifiers,m=void 0===d?He:d,v=(0,o.Z)(i,["enabled","placement","strategy","modifiers"]),h=(0,s.useRef)(),g=(0,s.useCallback)((function(){var e;null==(e=h.current)||e.update()}),[]),y=(0,s.useCallback)((function(){var e;null==(e=h.current)||e.forceUpdate()}),[]),b=q((0,s.useState)({placement:f,update:g,forceUpdate:y,attributes:{},styles:{popper:Be(p),arrow:{}}})),w=b[0],x=b[1],O=(0,s.useMemo)((function(){return{name:"updateStateModifier",enabled:!0,phase:"write",requires:["computeStyles"],fn:function(e){var t=e.state,n={},r={};Object.keys(t.elements).forEach((function(e){n[e]=t.styles[e],r[e]=t.attributes[e]})),x({state:t,styles:n,attributes:r,update:g,forceUpdate:y,placement:t.placement})}}}),[g,y,x]);return(0,s.useEffect)((function(){h.current&&u&&h.current.setOptions({placement:f,strategy:p,modifiers:[].concat(m,[O,Ne])})}),[p,f,O,u]),(0,s.useEffect)((function(){if(u&&null!=e&&null!=t)return h.current=Le(e,t,(0,r.Z)({},v,{placement:f,strategy:p,modifiers:[].concat(m,[We,O])})),function(){null!=h.current&&(h.current.destroy(),h.current=void 0,x((function(e){return(0,r.Z)({},e,{attributes:{},styles:{popper:Be(p)}})})))}}),[u,e,t]),w},Fe=n(28939);var Ue=function(e){var t=(0,s.useRef)(e);return(0,s.useEffect)((function(){t.current=e}),[e]),t};function Ie(e){var t=Ue(e);return(0,s.useCallback)((function(){return t.current&&t.current.apply(t,arguments)}),[t])}var Ve=n(42002),Ke=function(){};var ze=function(e){return e&&("current"in e?e.current:e)};var Xe=function(e,t,n){var r=void 0===n?{}:n,o=r.disabled,i=r.clickTrigger,u=void 0===i?"click":i,c=(0,s.useRef)(!1),f=t||Ke,l=(0,s.useCallback)((function(t){var n,r=ze(e);h()(!!r,"RootClose captured a close event but does not have a ref to compare it to. useRootClose(), should be passed a ref that resolves to a DOM node"),c.current=!r||!!((n=t).metaKey||n.altKey||n.ctrlKey||n.shiftKey)||!function(e){return 0===e.button}(t)||!!a(r,t.target)}),[e]),p=Ie((function(e){c.current||f(e)})),d=Ie((function(e){27===e.keyCode&&f(e)}));(0,s.useEffect)((function(){if(!o&&null!=e){var t,n=window.event,r=(t=ze(e),(0,Ve.Z)(m(t))),i=(0,Fe.Z)(r,u,l,!0),a=(0,Fe.Z)(r,u,(function(e){e!==n?p(e):n=void 0})),s=(0,Fe.Z)(r,"keyup",(function(e){e!==n?d(e):n=void 0})),c=[];return"ontouchstart"in r.documentElement&&(c=[].slice.call(r.body.children).map((function(e){return(0,Fe.Z)(e,"mousemove",Ke)}))),function(){i(),a(),s(),c.forEach((function(e){return e()}))}}}),[e,o,u,l,p,d])},Ye=function(e){var t;return"undefined"===typeof document?null:null==e?(0,Ve.Z)().body:("function"===typeof e&&(e=e()),e&&"current"in e&&(e=e.current),null!=(t=e)&&t.nodeType&&e||null)};function Ge(e,t){var n=(0,s.useState)((function(){return Ye(e)})),r=n[0],o=n[1];if(!r){var i=Ye(e);i&&o(i)}return(0,s.useEffect)((function(){t&&r&&t(r)}),[t,r]),(0,s.useEffect)((function(){var t=Ye(e);t!==r&&o(t)}),[e,r]),r}function Je(e){var t,n,o,i,a,s=e.enabled,u=e.enableEvents,c=e.placement,f=e.flip,l=e.offset,p=e.fixed,d=e.containerPadding,m=e.arrowElement,v=e.popperConfig,h=void 0===v?{}:v,g=function(e){var t={};return Array.isArray(e)?(null==e||e.forEach((function(e){t[e.name]=e})),t):e||t}(h.modifiers);return(0,r.Z)({},h,{placement:c,enabled:s,strategy:p?"fixed":h.strategy,modifiers:(a=(0,r.Z)({},g,{eventListeners:{enabled:u},preventOverflow:(0,r.Z)({},g.preventOverflow,{options:d?(0,r.Z)({padding:d},null==(t=g.preventOverflow)?void 0:t.options):null==(n=g.preventOverflow)?void 0:n.options}),offset:{options:(0,r.Z)({offset:l},null==(o=g.offset)?void 0:o.options)},arrow:(0,r.Z)({},g.arrow,{enabled:!!m,options:(0,r.Z)({},null==(i=g.arrow)?void 0:i.options,{element:m})}),flip:(0,r.Z)({enabled:!!f},g.flip)}),void 0===a&&(a={}),Array.isArray(a)?a:Object.keys(a).map((function(e){return a[e].name=e,a[e]})))})}var Qe=s.forwardRef((function(e,t){var n=e.flip,i=e.offset,a=e.placement,u=e.containerPadding,c=void 0===u?5:u,f=e.popperConfig,l=void 0===f?{}:f,p=e.transition,m=k(),v=m[0],h=m[1],g=k(),y=g[0],b=g[1],w=P(h,t),x=Ge(e.container),O=Ge(e.target),E=(0,s.useState)(!e.show),C=E[0],D=E[1],Z=qe(O,v,Je({placement:a,enableEvents:!!e.show,containerPadding:c||5,flip:n,offset:i,arrowElement:y,popperConfig:l})),R=Z.styles,A=Z.attributes,M=(0,o.Z)(Z,["styles","attributes"]);e.show?C&&D(!1):e.transition||C||D(!0);var j=e.show||p&&!C;if(Xe(v,e.onHide,{disabled:!e.rootClose||e.rootCloseDisabled,clickTrigger:e.rootCloseEvent}),!j)return null;var T=e.children((0,r.Z)({},M,{show:!!e.show,props:(0,r.Z)({},A.popper,{style:R.popper,ref:w}),arrowProps:(0,r.Z)({},A.arrow,{style:R.arrow,ref:b})}));if(p){var _=e.onExit,S=e.onExiting,L=e.onEnter,B=e.onEntering,N=e.onEntered;T=s.createElement(p,{in:e.show,appear:!0,onExit:_,onExiting:S,onExited:function(){D(!0),e.onExited&&e.onExited.apply(e,arguments)},onEnter:L,onEntering:B,onEntered:N},T)}return x?d.createPortal(T,x):null}));Qe.displayName="Overlay",Qe.propTypes={show:C().bool,placement:C().oneOf(W),target:C().any,container:C().any,flip:C().bool,children:C().func.isRequired,containerPadding:C().number,popperConfig:C().object,rootClose:C().bool,rootCloseEvent:C().oneOf(["click","mousedown"]),rootCloseDisabled:C().bool,onHide:function(e){for(var t=arguments.length,n=new Array(t>1?t-1:0),r=1;r<t;r++)n[r-1]=arguments[r];var o;return e.rootClose?(o=C().func).isRequired.apply(o,[e].concat(n)):C().func.apply(C(),[e].concat(n))},transition:C().elementType,onEnter:C().func,onEntering:C().func,onEntered:C().func,onExit:C().func,onExiting:C().func,onExited:C().func};var $e=Qe;function et(e,t){return e.classList?!!t&&e.classList.contains(t):-1!==(" "+(e.className.baseVal||e.className)+" ").indexOf(" "+t+" ")}var tt=n(19492);function nt(e){var t=window.getComputedStyle(e);return{top:parseFloat(t.marginTop)||0,right:parseFloat(t.marginRight)||0,bottom:parseFloat(t.marginBottom)||0,left:parseFloat(t.marginLeft)||0}}var rt=n(37788),ot=["children","transition","popperConfig"],it=["props","arrowProps","show","update","forceUpdate","placement","state"],at={transition:rt.Z,rootClose:!1,show:!1,placement:"top"};function st(e){var t=e.children,n=e.transition,i=e.popperConfig,a=void 0===i?{}:i,u=(0,o.Z)(e,ot),c=(0,s.useRef)({}),f=function(){var e=(0,s.useRef)(null),t=(0,s.useRef)(null),n=(0,s.useRef)(null),r=(0,tt.vE)(void 0,"popover"),o=(0,tt.vE)(void 0,"dropdown-menu");return[(0,s.useCallback)((function(n){n&&(et(n,r)||et(n,o))&&(t.current=nt(n),n.style.margin="0",e.current=n)}),[r,o]),[(0,s.useMemo)((function(){return{name:"offset",options:{offset:function(e){var n=e.placement;if(!t.current)return[0,0];var r=t.current,o=r.top,i=r.left,a=r.bottom,s=r.right;switch(n.split("-")[0]){case"top":return[0,a];case"left":return[0,s];case"bottom":return[0,o];case"right":return[0,i];default:return[0,0]}}}}}),[t]),(0,s.useMemo)((function(){return{name:"arrow",options:{padding:function(){if(!n.current)return 0;var e=n.current,t=e.top,r=e.right,o=t||r;return{top:o,left:o,right:o,bottom:o}}}}}),[n]),(0,s.useMemo)((function(){return{name:"popoverArrowMargins",enabled:!0,phase:"main",requiresIfExists:["arrow"],effect:function(t){var o=t.state;if(e.current&&o.elements.arrow&&et(e.current,r)){if(o.modifiersData["arrow#persistent"]){var i=nt(o.elements.arrow),a=i.top,s=i.right,u=a||s;o.modifiersData["arrow#persistent"].padding={top:u,left:u,right:u,bottom:u}}else n.current=nt(o.elements.arrow);return o.elements.arrow.style.margin="0",function(){o.elements.arrow&&(o.elements.arrow.style.margin="")}}}}}),[r])]]}(),l=f[0],p=f[1],d=!0===n?rt.Z:n||null;return s.createElement($e,(0,r.Z)({},u,{ref:l,popperConfig:(0,r.Z)({},a,{modifiers:p.concat(a.modifiers||[])}),transition:d}),(function(e){var i,a=e.props,u=e.arrowProps,f=e.show,l=e.update,p=(e.forceUpdate,e.placement),d=e.state,v=(0,o.Z)(e,it);!function(e,t){var n=e.ref,r=t.ref;e.ref=n.__wrapped||(n.__wrapped=function(e){return n(m(e))}),t.ref=r.__wrapped||(r.__wrapped=function(e){return r(m(e))})}(a,u);var h=Object.assign(c.current,{state:d,scheduleUpdate:l,placement:p,outOfBoundaries:(null==d||null==(i=d.modifiersData.hide)?void 0:i.isReferenceHidden)||!1});return"function"===typeof t?t((0,r.Z)({},v,a,{placement:p,show:f},!n&&f&&{className:"show"},{popper:h,arrowProps:u})):s.cloneElement(t,(0,r.Z)({},v,a,{placement:p,arrowProps:u,popper:h,className:O()(t.props.className,!n&&f&&"show"),style:(0,r.Z)({},t.props.style,a.style)}))}))}st.defaultProps=at;var ut=st,ct=["trigger","overlay","children","popperConfig","show","defaultShow","onToggle","delay","placement","flip"],ft=function(e){function t(){return e.apply(this,arguments)||this}return(0,i.Z)(t,e),t.prototype.render=function(){return this.props.children},t}(s.Component);function lt(e,t,n){var r=t[0],o=r.currentTarget,i=r.relatedTarget||r.nativeEvent[n];i&&i===o||a(o,i)||e.apply(void 0,t)}function pt(e){var t=e.trigger,n=e.overlay,i=e.children,a=e.popperConfig,u=void 0===a?{}:a,c=e.show,f=e.defaultShow,l=void 0!==f&&f,d=e.onToggle,v=e.delay,h=e.placement,y=e.flip,b=void 0===y?h&&-1!==h.indexOf("auto"):y,w=(0,o.Z)(e,ct),x=(0,s.useRef)(null),O=p(),E=(0,s.useRef)(""),C=g(c,l,d),k=C[0],D=C[1],P=function(e){return e&&"object"===typeof e?e:{show:e,hide:e}}(v),Z="function"!==typeof i?s.Children.only(i).props:{},R=Z.onFocus,A=Z.onBlur,M=Z.onClick,j=(0,s.useCallback)((function(){return m(x.current)}),[]),T=(0,s.useCallback)((function(){O.clear(),E.current="show",P.show?O.set((function(){"show"===E.current&&D(!0)}),P.show):D(!0)}),[P.show,D,O]),_=(0,s.useCallback)((function(){O.clear(),E.current="hide",P.hide?O.set((function(){"hide"===E.current&&D(!1)}),P.hide):D(!1)}),[P.hide,D,O]),S=(0,s.useCallback)((function(){T();for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];null==R||R.apply(void 0,t)}),[T,R]),L=(0,s.useCallback)((function(){_();for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];null==A||A.apply(void 0,t)}),[_,A]),B=(0,s.useCallback)((function(){D(!k),M&&M.apply(void 0,arguments)}),[M,D,k]),N=(0,s.useCallback)((function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];lt(T,t,"fromElement")}),[T]),W=(0,s.useCallback)((function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];lt(_,t,"toElement")}),[_]),H=null==t?[]:[].concat(t),q={};return-1!==H.indexOf("click")&&(q.onClick=B),-1!==H.indexOf("focus")&&(q.onFocus=S,q.onBlur=L),-1!==H.indexOf("hover")&&(q.onMouseOver=N,q.onMouseOut=W),s.createElement(s.Fragment,null,"function"===typeof i?i((0,r.Z)({},q,{ref:x})):s.createElement(ft,{ref:x},(0,s.cloneElement)(i,q)),s.createElement(ut,(0,r.Z)({},w,{show:k,onHide:_,flip:b,placement:h,popperConfig:u,target:j}),n))}pt.defaultProps={defaultShow:!1,trigger:["hover","focus"]};var dt=pt},19492:function(e,t,n){"use strict";n.d(t,{vE:function(){return i}});var r=n(22771),o=r.createContext({});o.Consumer,o.Provider;function i(e,t){var n=(0,r.useContext)(o);return e||n[t]||t}},31185:function(e,t,n){"use strict";var r=n(56376),o=n(68827),i=n(18258),a=n.n(i),s=n(22771),u=(n(82035),n(19492)),c=["bsPrefix","placement","className","style","children","arrowProps","popper","show"],f=s.forwardRef((function(e,t){var n=e.bsPrefix,i=e.placement,f=e.className,l=e.style,p=e.children,d=e.arrowProps,m=(e.popper,e.show,(0,o.Z)(e,c));n=(0,u.vE)(n,"tooltip");var v=((null==i?void 0:i.split("-"))||[])[0];return s.createElement("div",(0,r.Z)({ref:t,style:l,role:"tooltip","x-placement":v,className:a()(f,n,"bs-tooltip-"+v)},m),s.createElement("div",(0,r.Z)({className:"arrow"},d)),s.createElement("div",{className:n+"-inner"},p))}));f.defaultProps={placement:"right"},f.displayName="Tooltip",t.Z=f},69484:function(e){"use strict";var t=function(){};e.exports=t}}]);