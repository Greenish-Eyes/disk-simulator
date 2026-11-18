/* core.js: helpers, disk database, T(I/O) and R(I/O) calculator, tabs */

const $=id=>document.getElementById(id),f=(n,d=3)=>(+(+n).toFixed(d)).toLocaleString();
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
$("cx").textContent=`1) One rotation = 60,000 ms / ${d.rpm} RPM = ${f(full)} ms\n2) Avg rotational delay = half a rotation = ${f(r.rot)} ms\n3) Avg seek (given) = ${f(d.seek)} ms\n\nRANDOM (${$("rsz").value} KB)\n   T_transfer = ${$("rsz").value} KB / 1024 / ${d.rate} MB/s x 1000 = ${f(r.tr,4)} ms\n   T_I/O = T_seek + T_rotation + T_transfer = ${f(r.seek)} + ${f(r.rot)} + ${f(r.tr,4)} = ${f(r.T)} ms\n   R_I/O = Size / T_I/O = ${f($("rsz").value/1024,4)} MB / ${f(r.T/1000,5)} s = ${f(r.R)} MB/s\n\nSEQUENTIAL (${$("ssz").value} MB, one seek + one rotation)\n   T_transfer = ${$("ssz").value} MB / ${d.rate} MB/s = ${f(s.tr)} ms\n   T_I/O = ${f(s.seek)} + ${f(s.rot)} + ${f(s.tr)} = ${f(s.T)} ms\n   R_I/O = ${$("ssz").value} MB / ${f(s.T/1000,4)} s = ${f(s.R)} MB/s\n\nSequential is ${f(s.R/r.R,1)}x faster than random: use disks sequentially.`;
raid();extras()}
$("dsel").onchange=load;["rpm","seek","rate","cap","rsz","ssz"].forEach(i=>$(i).oninput=calc);
$("bAdd").onclick=()=>{const n=$("nn").value.trim();if(!n)return alert("Enter a name for the new disk.");const d=D();custom.push({n,rpm:d.rpm,seek:d.seek,rate:d.rate,cap:+$("cap").value||0,i:"custom"});try{localStorage.setItem("cdisks",JSON.stringify(custom))}catch(e){}fillSel(all().length-1);$("nn").value=""};
$("bDel").onclick=()=>{const i=+$("dsel").value;if(i<SEED.length)return alert("Built-in disks can’t be deleted.");custom.splice(i-SEED.length,1);try{localStorage.setItem("cdisks",JSON.stringify(custom))}catch(e){}fillSel(0)};

/* Tabs */
["3D Disk","Calculator","RAID","More sims","Journal · LFS · SSD"].forEach((t,i)=>{const b=document.createElement("button");b.textContent=t;b.onclick=()=>{document.querySelectorAll(".sec").forEach((s,j)=>s.classList.toggle("on",i==j));[...$("nav").children].forEach((c,j)=>c.classList.toggle("on",i==j));if(i==0)resize()};if(!i)b.className="on";$("nav").appendChild(b)});
