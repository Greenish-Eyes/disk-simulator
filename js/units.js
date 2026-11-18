/* units.js: data-size and time unit converter */
const UD=["byte","KB","MB","GB","TB"],UT=["µs","ms","s","min"],TS={"µs":1e-6,ms:1e-3,s:1,min:60};
function fmtN(x){if(!x)return"0";const a=Math.abs(x);return a>=1e13||a<1e-4?x.toExponential(4):(+x.toPrecision(12)).toLocaleString(undefined,{maximumFractionDigits:6})}
function conv(){const v=+$("cvv").value||0,u=$("cvu").value,b=+$("cvb").value,t=UT.includes(u);let L,note;
if(t){const s=v*TS[u];L=UT.map(k=>[k,s/TS[k]]);note="1 s = 1,000 ms = 1,000,000 µs · 1 min = 60 s"}
else{const by=v*Math.pow(b,UD.indexOf(u));L=UD.map((k,i)=>[k,by/Math.pow(b,i)]);note=`1 KB = ${fmtN(b)} bytes · 1 MB = ${fmtN(b*b)} bytes · 1 GB = ${fmtN(Math.pow(b,3))} bytes`}
$("cvb").disabled=t;$("cvo").innerHTML=`<div class="chips">${L.map(x=>`<div class="${x[0]==u?"on":""}"><small>${x[0]}</small><b>${fmtN(x[1])}</b></div>`).join("")}</div><div class="mu" style="margin-top:8px">${note}</div>`}
["cvv","cvu","cvb"].forEach(i=>$(i).oninput=conv);
$("cvd").onclick=()=>{$("cvv").value=$("cap").value;$("cvu").value="GB";conv()};
$("cvt").onclick=()=>{$("cvv").value=+io(+$("rsz").value||4).T.toFixed(4);$("cvu").value="ms";conv()};
conv();
