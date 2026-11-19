/* core.js: helpers, disk database, T(I/O) and R(I/O) calculator, tabs */

const stepsHTML=l=>l.map((s,i)=>`<div class="st"><span class="n">${i+1}</span><div><div class="t">${s.t}</div><div class="fm">${s.f||""}</div><div class="vl">${s.v}</div></div></div>`).join("");
const $=id=>document.getElementById(id),f=(n,d=3)=>(+(+n).toFixed(d)).toLocaleString();
document.querySelectorAll('input[type="number"]').forEach(x=>{if(!x.hasAttribute("min"))x.min="0"});
document.addEventListener("input",e=>{const x=e.target;if(x.matches('input[type="number"]')&&x.value!==""){const n=Number(x.value),min=x.min===""?0:Number(x.min),max=x.max===""?Infinity:Number(x.max);if(Number.isFinite(n)&&(n<min||n>max))x.value=String(Math.max(min,Math.min(max,n)))}});
["qs","pd","cb","cb2","fw","lo"].forEach(id=>$(id).addEventListener("input",e=>{e.target.value=e.target.value.replace(/-\s*\d+(?:\.\d+)?/g,"0")}));
const SEED=[["Seagate Cheetah 15K.5",15000,4,125,300,"SCSI"],["Seagate Barracuda (7.2K)",7200,9,105,1000,"SATA"],["OSTEP example disk",10000,7,50,100,"–"],["Typical 5400 RPM laptop",5400,12,80,500,"SATA"],["Typical 7200 RPM desktop",7200,8.5,150,2000,"SATA"],["Typical 10K enterprise",10000,4.5,150,600,"SAS"]].map(a=>({n:a[0],rpm:a[1],seek:a[2],rate:a[3],cap:a[4],i:a[5]}));
let custom=[];try{custom=JSON.parse(localStorage.getItem("cdisks")||"[]")}catch(e){}
const all=()=>SEED.concat(custom);
function fillSel(v){$("dsel").innerHTML=all().map((d,i)=>`<option value="${i}">${d.n}${i>=SEED.length?" (custom)":""}</option>`).join("");$("dsel").value=v??0;load()}
function load(){$("st1").textContent=all().length;const d=all()[$("dsel").value];$("rpm").value=d.rpm;$("seek").value=d.seek;$("rate").value=d.cap&&d.rate;$("rate").value=d.rate;$("cap").value=d.cap;$("rc").value=d.cap;calc()}
function D(){return{rpm:+$("rpm").value||1,seek:+$("seek").value||0,rate:+$("rate").value||1}}
function io(kb){const d=D(),rot=60000/d.rpm/2,tr=kb/1024/d.rate*1000,T=d.seek+rot+tr;return{seek:d.seek,rot,tr,T,R:kb/1024/(T/1000)}}
function calc(){const d=D(),r=io(+$("rsz").value||4),s=io((+$("ssz").value||100)*1024),full=60000/d.rpm;
const sel=all()[$("dsel").value],edited=!sel||sel.rpm!=$("rpm").value||sel.seek!=$("seek").value||sel.rate!=$("rate").value;
$("mode").textContent=edited?"Manual mode: values differ from the database entry, results are not saved.":"Using database entry.";
$("tR").textContent=f(r.T)+" ms";$("bars").innerHTML=[["Seek",r.seek,"#f97316"],["Rotation",r.rot,"#0ea5e9"],["Transfer",r.tr,"#10b981"]].map(([n,v,c])=>`<div class="bar"><span>${n}</span><i><u style="width:${Math.max(1,v/r.T*100)}%;background:${c}"></u></i><b>${f(v,2)} ms</b></div>`).join("");$("rR").textContent=f(r.R)+" MB/s ("+f(1000/r.T,1)+" IOPS)";$("tS").textContent=f(s.T)+" ms";$("rS").textContent=f(s.R)+" MB/s";
const kb=+$("rsz").value||4,mb=+$("ssz").value||100,st=(t,fm,v)=>({t:t,f:fm,v:v});
const rows=(sz,x,unit,div)=>[st("Transfer time","size ÷ rate",`${f(sz,2)} ${unit} ${div} ÷ ${d.rate} MB/s × 1,000 = <b>${f(x.tr,4)} ms</b>`),st("T<sub>I/O</sub>","seek + rotation + transfer",`${f(x.seek)} + ${f(x.rot)} + ${f(x.tr,4)} = <b>${f(x.T)} ms</b>`),st("R<sub>I/O</sub>","size ÷ T<sub>I/O</sub>",`${f(unit=="KB"?sz/1024:sz,4)} MB ÷ ${f(x.T/1000,5)} s = <b>${f(x.R)} MB/s</b>`)];
$("cx").innerHTML=`<div class="cols"><div class="grp"><h4>Disk basics</h4>`+stepsHTML([st("One rotation","60,000 ms ÷ RPM",`60,000 ÷ ${d.rpm} = <b>${f(full)} ms</b>`),st("Average rotational delay","half a rotation",`${f(full)} ÷ 2 = <b>${f(r.rot)} ms</b>`),st("Average seek","manufacturer figure",`<b>${f(d.seek)} ms</b>`)])+`</div><div class="grp"><h4>Random request <em>${kb} KB = ${f(kb*1024,0)} bytes</em></h4>`+stepsHTML(rows(kb,r,"KB","÷ 1,024"))+`<div class="out">${f(r.T)} ms · ${f(r.R)} MB/s · ${f(1000/r.T,1)} IOPS</div></div><div class="grp"><h4>Sequential <em>${mb} MB, one seek + one rotation</em></h4>`+stepsHTML(rows(mb,s,"MB",""))+`<div class="out">${f(s.T)} ms · ${f(s.R)} MB/s</div></div></div><div class="note">Sequential is <b>${f(s.R/r.R,1)}×</b> faster than random: use disks sequentially.</div>`;
$("tR2").textContent=`${f(r.T*1000,0)} µs · ${f(r.T/1000,5)} s`;$("tS2").textContent=`${f(s.T*1000,0)} µs · ${f(s.T/1000,4)} s`;$("rR2").textContent=`${f(r.R*1024,1)} KB/s · ${f(r.R*1048576,0)} B/s`;$("rS2").textContent=`${f(s.R*1024,0)} KB/s · ${f(s.R*1048576,0)} B/s`;
raid();extras()}
$("dsel").onchange=load;["rpm","seek","rate","cap","rsz","ssz"].forEach(i=>$(i).oninput=calc);
$("bAdd").onclick=()=>{const n=$("nn").value.trim();if(!n)return alert("Enter a name for the new disk.");const d=D();custom.push({n,rpm:d.rpm,seek:d.seek,rate:d.rate,cap:+$("cap").value||0,i:"custom"});try{localStorage.setItem("cdisks",JSON.stringify(custom))}catch(e){}fillSel(all().length-1);$("nn").value=""};
$("bDel").onclick=()=>{const i=+$("dsel").value;if(i<SEED.length)return alert("Built-in disks can’t be deleted.");custom.splice(i-SEED.length,1);try{localStorage.setItem("cdisks",JSON.stringify(custom))}catch(e){}fillSel(0)};

/* Tabs */
["3D Disk","Calculator","RAID","More sims","Journal · LFS · SSD"].forEach((t,i)=>{const b=document.createElement("button");b.textContent=t;b.onclick=()=>{document.querySelectorAll(".sec").forEach((s,j)=>s.classList.toggle("on",i==j));[...$("nav").children].forEach((c,j)=>c.classList.toggle("on",i==j));if(i==0)resize()};if(!i)b.className="on";$("nav").appendChild(b)});
