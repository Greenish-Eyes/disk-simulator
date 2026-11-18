/* disk3d.js: realistic 3D hard-disk model (Three.js r128).
   PBR metals + generated studio environment reflections, soft shadows, cast chassis,
   mirror platters with servo spokes, E-block actuator, voice-coil motor, flex cable, PCB. */
const INFO={
chassis:["Cast chassis","A precision-cast aluminium base keeps every rotating and moving part aligned. Stiff ribs suppress vibration while the sealed enclosure keeps the air particle-free."],
platter:["Magnetic platters","Rigid coated disks store bits as magnetic domains along concentric tracks. Glass or aluminium substrates carry ultra-thin magnetic and carbon layers; several surfaces share one spindle."],
track:["Tracks & sectors","Data lives in concentric tracks divided into 512-byte sectors (green wedge). Servo spokes between sectors tell the head where it is. Outer tracks hold more sectors (multi-zoned drives)."],
spindle:["Spindle motor","A fluid-dynamic bearing motor rotates the whole platter stack at constant RPM. Average rotational latency is half a revolution: 30,000 ÷ RPM ms."],
arm:["Actuator assembly","A lightweight arm stack (E-block) positions one head over every recording surface. It accelerates, coasts, decelerates and settles during the seek."],
head:["Read / write head","A microscopic slider flies nanometres above the surface on an air bearing and converts magnetism to data. T(I/O) = seek + rotation + transfer."],
voice:["Voice-coil motor","A copper coil between permanent magnets turns current into fast, controlled arm motion. A flex cable carries signals to the controller; servo data keeps the head on track."],
filter:["Recirculation filter","Internal airflow carries microscopic contamination through a fine filter, protecting the head-to-platter gap. A separate breather equalises outside pressure."],
board:["Controller PCB","Mounted underneath: SoC, DRAM cache (8–32 MB), motor driver and the SATA/SAS connector. It decodes signals, corrects errors, and can reorder requests (SPTF) because it knows head position."]};
let sc,cam,rd,root,PV,plats=[],arms=[],shaft,clamp,spin=true,seekOn=false,exOn=false,flip=false,ex=0,th=.75,ph=1.05,tth=.75,tph=1.05,dist=15,ok=false,t0=0,moved=0,pdn=null;
const T0=-.574;
const S=(c,m,r,x)=>new THREE.MeshStandardMaterial(Object.assign({color:c,metalness:m,roughness:r},x||{}));
const BX=(w,h,d)=>new THREE.BoxGeometry(w,h,d),CY=(r,h,s)=>new THREE.CylinderGeometry(r,r,h,s||32);
function M(g,m,p,par,pos){const o=new THREE.Mesh(g,m);o.userData.part=p;o.castShadow=o.receiveShadow=true;(par||root).add(o);if(pos)o.position.set(pos[0],pos[1],pos[2]);return o}
function rrect(w,h,r,s){s=s||new THREE.Shape();const x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s}
function cv(n){const c=document.createElement("canvas");c.width=c.height=n;return c}
function envTex(){const c=document.createElement("canvas");c.width=512;c.height=256;const g=c.getContext("2d"),gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,"#d6e6f2");gr.addColorStop(.5,"#4a5864");gr.addColorStop(1,"#0b1015");g.fillStyle=gr;g.fillRect(0,0,512,256);g.fillStyle="#fff";[[50,30,120,26],[250,25,100,20],[410,55,70,30]].forEach(a=>g.fillRect(a[0],a[1],a[2],a[3]));g.fillStyle="#ffb36b";g.fillRect(330,95,60,14);const t=new THREE.CanvasTexture(c);t.mapping=THREE.EquirectangularReflectionMapping;t.encoding=THREE.sRGBEncoding;return t}
function noiseTex(){const c=cv(256),g=c.getContext("2d"),d=g.createImageData(256,256);for(let i=0;i<d.data.length;i+=4){const v=120+Math.random()*110;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255}g.putImageData(d,0,0);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(.35,.35);return t}
function platTex(){const n=1024,m=n/2,c=cv(n),g=c.getContext("2d");g.fillStyle="#aab5bb";g.fillRect(0,0,n,n);
if(g.createConicGradient){const cg=g.createConicGradient(.4,m,m);[0,.1,.22,.33,.5,.6,.72,.85,1].forEach((s,i)=>cg.addColorStop(s,i%2?"#eef3f5":"#76838b"));g.fillStyle=cg;g.beginPath();g.arc(m,m,m,0,7);g.fill()}
for(let r=90;r<m;r+=5){g.strokeStyle="rgba(20,30,40,"+(r%40?.12:.3)+")";g.lineWidth=r%40?.5:1.4;g.beginPath();g.arc(m,m,r,0,7);g.stroke()}
g.fillStyle="#232b31";g.beginPath();g.arc(m,m,m*.12,0,7);g.arc(m,m,m*.23,0,7,true);g.fill("evenodd");
const t=new THREE.CanvasTexture(c);t.anisotropy=8;t.encoding=THREE.sRGBEncoding;return t}
function spokeTex(){const n=1024,m=n/2,c=cv(n),g=c.getContext("2d");g.translate(m,m);g.strokeStyle="rgba(255,255,255,.17)";g.lineWidth=2;for(let i=0;i<48;i++){g.rotate(Math.PI/24);g.beginPath();g.moveTo(m*.26,0);g.lineTo(m*.98,0);g.stroke()}
g.setTransform(1,0,0,1,0,0);g.translate(m,m);g.fillStyle="rgba(52,211,153,.38)";g.beginPath();g.arc(0,0,m*.98,0,.38);g.arc(0,0,m*.26,.38,0,true);g.closePath();g.fill();return new THREE.CanvasTexture(c)}

function build(){const nz=noiseTex(),pt=platTex(),sk=spokeTex();
M(new THREE.PlaneGeometry(40,40).rotateX(-Math.PI/2),S(0x0d1319,.2,.95),"floor",root,[0,-1.2,0]).castShadow=false;
/* cast chassis: floor plate + walled rim */
const O=rrect(8.4,6.8,.5),H=rrect(7.8,6.2,.35,new THREE.Path());O.holes.push(H);
const wall=new THREE.ExtrudeGeometry(O,{depth:1,bevelEnabled:true,bevelSize:.05,bevelThickness:.05,bevelSegments:3,curveSegments:16}).rotateX(-Math.PI/2);
M(wall,S(0xaab4ba,.9,.42,{bumpMap:nz,bumpScale:.8,roughnessMap:nz}),"chassis",root,[.2,-.15,0]);
M(new THREE.ExtrudeGeometry(rrect(8.4,6.8,.5),{depth:.15,bevelEnabled:false,curveSegments:16}).rotateX(-Math.PI/2),S(0x56626a,.85,.5,{bumpMap:nz,bumpScale:.5}),"chassis",root,[.2,-.15,0]);
[[-3.85,-3.25],[-3.85,3.25],[4.25,-3.25],[4.25,3.25],[.2,-3.25],[.2,3.25]].forEach(p=>{const s=M(CY(.13,.05,20),S(0x29343b,.95,.25),"chassis",root,[p[0],.93,p[1]]);M(BX(.17,.03,.035),S(0x0c1216,.5,.5),"chassis",s,[0,.03,0])});
/* spindle + platter stack */
const SP=new THREE.Group();SP.position.set(-.6,0,0);root.add(SP);
M(CY(.8,.14,48),S(0x1d252b,.7,.4),"spindle",SP,[0,.07,0]);
shaft=M(CY(.5,1.45,48),S(0xc9d1d6,.95,.2),"spindle",SP,[0,.83,0]);
clamp=M(CY(.55,.07,48),S(0xdfe5e8,.98,.16),"spindle",SP,[0,1.58,0]);
for(let i=0;i<6;i++){const a=i/6*6.283;M(CY(.055,.03,12),S(0x2a343b,.9,.3),"spindle",clamp,[Math.cos(a)*.38,.04,Math.sin(a)*.38])}
M(CY(.2,.05,32),S(0x2a343b,.9,.3),"spindle",clamp,[0,.04,0]);
[.5,1,1.5].forEach((y,i)=>{const g=new THREE.Group();g.position.y=y;g.userData.by=y;g.userData.lv=1+2*i;SP.add(g);
M(new THREE.CylinderGeometry(2.5,2.5,.04,128),[S(0xb8c2c8,.9,.3),S(0xffffff,.92,.22,{map:pt}),S(0xffffff,.92,.22,{map:pt})],"platter",g);
const ov=new THREE.Mesh(new THREE.CircleGeometry(2.48,64).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:sk,transparent:true,depthWrite:false}));ov.position.y=.022;ov.raycast=function(){};const og=new THREE.Group();og.add(ov);g.add(og);plats.push({g:g,og:og})});
/* actuator: pivot post, 4 tapered arms, suspensions, sliders */
PV=new THREE.Group();PV.position.set(2.5,0,2);root.add(PV);
M(CY(.24,2.4,32),S(0xa9b3b9,.95,.25),"arm",PV,[0,1.2,0]);M(CY(.3,.1,32),S(0x2a343b,.9,.3),"arm",PV,[0,.05,0]);
const L=3,sh=new THREE.Shape();sh.moveTo(.5,.3);sh.lineTo(.5,-.3);sh.lineTo(-.1,-.27);sh.lineTo(-L,-.07);sh.lineTo(-L,.07);sh.lineTo(-.1,.27);sh.closePath();
[[-1,.42],[-1.9,.3]].forEach(a=>{const h=new THREE.Path();h.absellipse(a[0],0,a[1],.09,0,6.283,true);sh.holes.push(h)});
const ag=new THREE.ExtrudeGeometry(sh,{depth:.045,bevelEnabled:false,curveSegments:24}).rotateX(-Math.PI/2);
[.25,.75,1.25,1.75].forEach((y,k)=>{const g=new THREE.Group();g.position.y=y;g.userData.by=y;g.userData.lv=2*k;PV.add(g);arms.push(g);
M(ag,S(0xd3d9dc,.95,.26),"arm",g,[0,-.022,0]);M(BX(1,.012,.1),S(0xe6eaec,.9,.3),"arm",g,[-L+.5,0,0]);
[k>0?-1:0,k<3?1:0].forEach(s=>{if(!s)return;M(CY(.015,.2,8),S(0xe6eaec,.9,.3),"arm",g,[-L+.12,s*.1,0]);M(BX(.3,.05,.19),S(0x1a2228,.5,.35),"head",g,[-L+.02,s*.2,0])})});
/* voice-coil motor: copper coil + fixed magnet plates + flex cable */
const cs=new THREE.Shape();cs.moveTo(.35,-.3);cs.lineTo(1.5,-.62);cs.lineTo(1.5,.62);cs.lineTo(.35,.3);cs.closePath();const ch=new THREE.Path();ch.moveTo(.7,-.12);ch.lineTo(1.2,-.28);ch.lineTo(1.2,.28);ch.lineTo(.7,.12);ch.closePath();cs.holes.push(ch);
M(new THREE.ExtrudeGeometry(cs,{depth:.22,bevelEnabled:true,bevelSize:.03,bevelThickness:.03,bevelSegments:2}).rotateX(-Math.PI/2),S(0xc4682a,.85,.3),"voice",PV,[0,.9,0]);
const MG=new THREE.Group();MG.position.copy(PV.position);MG.rotation.y=T0+.46;root.add(MG);
const ms=new THREE.Shape();ms.absarc(0,0,1.75,-.6,.6,false);ms.absarc(0,0,.6,.6,-.6,true);ms.closePath();
const mg=new THREE.ExtrudeGeometry(ms,{depth:.1,bevelEnabled:false,curveSegments:24}).rotateX(-Math.PI/2);
[.58,1.34].forEach(y=>M(mg,S(0x6b777f,.9,.35),"voice",MG,[0,y,0]));
M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(2.55,1.2,2.1),new THREE.Vector3(3.2,1.55,2.4),new THREE.Vector3(3.9,1.05,2.7),new THREE.Vector3(4.1,.3,2.6)]),24,.07,8),S(0xd98a2b,.2,.5),"voice");
/* recirculation filter */
M(BX(.7,.45,.5),S(0xf1ecdf,0,.95),"filter",root,[3.5,.22,-2.6]);M(BX(.5,.05,.3),S(0xcfc8b8,0,.9),"filter",root,[3.5,.47,-2.6]);
/* controller PCB (underside) */
const pb=new THREE.Group();pb.position.set(.2,-.25,0);root.add(pb);M(BX(8,.08,5.8),S(0x15664a,.15,.5),"board",pb);
const chip=(x,z,w,d,c)=>M(BX(w,.12,d),S(c||0x12171a,.4,.4),"board",pb,[x,-.1,z]);
chip(-1.2,.4,1.4,1.4);chip(1.2,.8,1.2,.9);chip(1.2,-.4,1.2,.9);chip(-2.8,-1.5,.8,.8,0x1f262b);chip(2.8,-1.8,.9,.6);chip(-.2,-1.8,.7,.5);
for(let i=0;i<22;i++)M(BX(.5,.02,.08),S(0xd8b45a,.9,.25),"board",pb,[3.7,-.05,-1.6+i*.15]);
for(let i=0;i<12;i++)M(CY(.09,.12,12),S(0x2b3339,.6,.35),"board",pb,[-3.2+i*.45,-.1,2.3])}

function init(){if(ok||!window.THREE)return;ok=true;const el=$("cv");
sc=new THREE.Scene();sc.background=new THREE.Color(0x0a0f14);sc.fog=new THREE.Fog(0x0a0f14,24,42);cam=new THREE.PerspectiveCamera(38,1,.1,100);
rd=new THREE.WebGLRenderer({antialias:true});rd.shadowMap.enabled=true;rd.shadowMap.type=THREE.PCFSoftShadowMap;rd.outputEncoding=THREE.sRGBEncoding;rd.toneMapping=THREE.ACESFilmicToneMapping;rd.toneMappingExposure=1.15;rd.setPixelRatio(Math.min(window.devicePixelRatio||1,2));el.appendChild(rd.domElement);
sc.environment=new THREE.PMREMGenerator(rd).fromEquirectangular(envTex()).texture;
sc.add(new THREE.HemisphereLight(0xcfe8ff,0x192028,.5));const key=new THREE.DirectionalLight(0xffffff,2.2);key.position.set(6,11,5);key.castShadow=true;key.shadow.mapSize.set(2048,2048);const sc2=key.shadow.camera;sc2.left=sc2.bottom=-7;sc2.right=sc2.top=7;sc2.near=1;sc2.far=30;key.shadow.bias=-.0006;sc.add(key);
const rim=new THREE.PointLight(0x66aaff,1.2,24);rim.position.set(-6,4,-5);sc.add(rim);const wm=new THREE.PointLight(0xff9c55,.9,16);wm.position.set(5,3,5);sc.add(wm);
root=new THREE.Group();sc.add(root);build();
$("pb").innerHTML="";Object.keys(INFO).forEach(k=>{const b=document.createElement("button");b.className="btn";b.textContent=INFO[k][0];b.onclick=()=>pick(k);$("pb").appendChild(b)});
el.onpointerdown=e=>{pdn={x:e.clientX,y:e.clientY};moved=0;try{el.setPointerCapture(e.pointerId)}catch(x){}};
el.onpointerup=()=>{pdn=null};
el.onpointermove=e=>{if(!pdn)return;const dx=e.clientX-pdn.x,dy=e.clientY-pdn.y;if(Math.abs(dx)+Math.abs(dy)>3)moved=1;tth=th=th-dx*.008;tph=ph=Math.max(.15,Math.min(2.7,ph-dy*.006));pdn={x:e.clientX,y:e.clientY}};
el.addEventListener("wheel",e=>{e.preventDefault();dist=Math.max(7,Math.min(24,dist+e.deltaY*.01))},{passive:false});
el.onclick=e=>{if(moved)return;const r=rd.domElement.getBoundingClientRect(),v=new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),rc=new THREE.Raycaster();rc.setFromCamera(v,cam);const h=rc.intersectObjects(root.children,true).find(x=>INFO[x.object.userData.part]);if(h)pick(h.object.userData.part)};
$("bSeek").onclick=()=>seekOn=!seekOn;$("bEx").onclick=()=>exOn=!exOn;$("bFlip").onclick=()=>{flip=!flip;tph=flip?2.45:1.05;$("bFlip").textContent=flip?"Flip back to top":"Flip to controller PCB"};
$("bSpin").onclick=e=>{spin=!spin;e.target.textContent=spin?"Pause spin":"Resume spin"};
window.onresize=resize;resize();loop()}
function pick(k){$("pt").innerHTML="<b>"+INFO[k][0]+"</b><br>"+INFO[k][1];root.traverse(o=>{if(!o.material||!o.userData.part)return;(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{if(m.emissive)m.emissive.setHex(o.userData.part==k?0x6a2a08:0)})})}
function resize(){if(!rd)return;const w=$("cv").clientWidth||600,h=$("cv").clientHeight||460;rd.setSize(w,h);cam.aspect=w/h;cam.updateProjectionMatrix()}
function loop(){requestAnimationFrame(loop);if(!$("s0").classList.contains("on"))return;t0+=.016;
const sp=D().rpm/15000*.3;ex+=((exOn?1:0)-ex)*.08;th+=(tth-th)*.1;ph+=(tph-ph)*.1;
plats.forEach(p=>{if(spin)p.og.rotation.y+=sp;p.g.position.y=p.g.userData.by+ex*p.g.userData.lv*.4});
arms.forEach(a=>a.position.y=a.userData.by+ex*a.userData.lv*.4);
shaft.scale.y=1+ex*1.7;shaft.position.y=.1+.725*shaft.scale.y;clamp.position.y=1.58+ex*2;
PV.rotation.y=T0+.46+(seekOn?.16*Math.sin(t0*1.6):0);
cam.position.set(dist*Math.sin(ph)*Math.sin(th),dist*Math.cos(ph),dist*Math.sin(ph)*Math.cos(th));cam.lookAt(.2,.6,0);rd.render(sc,cam)}
