/* extras.js: scheduling, amortization, checksums, SSD ratio */
/* Extras */
function extras(){
const q=$("qs").value.split(",").map(x=>Math.max(0,Math.min(99,+x||0))),h=+$("hs").value||0,pol=$("pol").value;let o=[],rest=q.slice(),c=h;
if(pol=="FIFO")o=q;else if(pol=="SSTF"){while(rest.length){let j=0;rest.forEach((x,i)=>{if(Math.abs(x-c)<Math.abs(rest[j]-c))j=i});c=rest.splice(j,1)[0];o.push(c)}}
else{const up=q.filter(x=>x>=h).sort((a,b)=>a-b),dn=q.filter(x=>x<h).sort((a,b)=>a-b);o=pol=="SCAN"?up.concat(dn.reverse()):up.concat(dn)}
let path=[h].concat(o),dist=0;if(pol=="C-SCAN"&&q.some(x=>x<h)){path=[h].concat(q.filter(x=>x>=h).sort((a,b)=>a-b),[99,0],q.filter(x=>x<h).sort((a,b)=>a-b))}
for(let i=1;i<path.length;i++)dist+=Math.abs(path[i]-path[i-1]);
$("sv").innerHTML=`<svg viewBox="0 0 400 130" width="100%" style="max-height:200px"><polyline fill="none" stroke="var(--ac)" stroke-width="2" points="${path.map((t,i)=>`${10+i*380/Math.max(1,path.length-1)},${120-t*1.1}`).join(" ")}"/>${path.map((t,i)=>`<circle cx="${10+i*380/Math.max(1,path.length-1)}" cy="${120-t*1.1}" r="3" fill="var(--ok)"/>`).join("")}</svg>`;
$("sr").textContent=`Service order: ${o.join(" → ")}\nHead path: ${path.join(" → ")}\nTotal seek distance = ${dist} tracks\nSeek time = ${dist} × ${$("mt").value} ms = ${f(dist*$("mt").value)} ms`;
const F=+$("af").value,P=+$("ap").value,Rk=+$("ar").value,Dm=F/(1-F)*Rk*P/1000;
$("ac").textContent=`D = F/(1−F) × R_peak × T_position\n  = ${f(F)}/(${f(1-F)}) × ${Rk} MB/s × ${P/1000} s = ${f(Dm)} MB\nTo spend ${f(F*100,1)}% of time transferring, write/read chunks of ${f(Dm)} MB (${f(Dm*1024,1)} KB) per positioning. This is why LFS buffers whole segments and FFS spreads large files in big chunks.`;
const bs=s=>s.split(",").map(x=>(+x)&255),ck=a=>{let s=0,x=0,s1=0,s2=0;a.forEach(v=>{s=(s+v)&255;x^=v;s1=(s1+v)%255;s2=(s2+s1)%255});return{add:s,xor:x,fl:(s2<<8)|s1,s1,s2}},a=ck(bs($("cb").value)),b=ck(bs($("cb2").value));
$("cr").textContent=`Input A: additive=${a.add}  XOR=${a.xor}  Fletcher(s1=${a.s1}, s2=${a.s2})=0x${a.fl.toString(16)}\nInput B: additive=${b.add}  XOR=${b.xor}  Fletcher(s1=${b.s1}, s2=${b.s2})=0x${b.fl.toString(16)}\nAdditive/XOR ignore order; Fletcher’s second sum (s2) is position-sensitive, so reordering changes it. Overhead: an 8-byte checksum per 4 KB block = ${f(8/4096*100,2)}% space.`;
const hr=+$("hr").value||1,sr=+$("sr2").value||0;$("ssr").textContent=`SSD random is ${f(sr/hr,1)}x faster than the HDD here.\nFlash ops: read ~10s of µs, program ~100s of µs, erase ~ms per block, so SSDs use a log-structured FTL (garbage collection, wear leveling) to hide erase costs.`}
["qs","hs","mt","pol","af","ap","ar","cb","cb2","hr","sr2"].forEach(i=>$(i).oninput=extras);
