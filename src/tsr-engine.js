import * as THREE from 'three';

const root = document.documentElement;
root.style.setProperty('--tsr-blue','#0877b6');
root.style.setProperty('--tsr-orange','#ff9518');

async function hydrateLogo(id, file) {
  const el = document.getElementById(id);
  if (!el) return;
  try {
    const text = await fetch(`/${file}`).then(r => r.text());
    const bytes = Uint8Array.from(atob(text.trim()), c => c.charCodeAt(0));
    const url = URL.createObjectURL(new Blob([bytes], { type: 'image/jpeg' }));
    el.src = url;
  } catch {}
}
hydrateLogo('navLogo','logo-primary.b64');
hydrateLogo('heroLogo','logo-primary.b64');
hydrateLogo('badgeLogo','logo-badge.b64');

// TSR source imagery: the original site's Open Plots, Duplex, Villa and Farmhouse images.
const tsrImages = [
  'https://www.tsrhome.com/pages/assets/img/open-plots.jpg',
  'https://www.tsrhome.com/pages/assets/img/duplex.jpg',
  'https://www.tsrhome.com/pages/assets/img/villa.jpg',
  'https://www.tsrhome.com/pages/assets/img/Farmhouse1.jpg'
];
const heroMedia = document.querySelector('.heroMedia');
if (heroMedia) heroMedia.style.backgroundImage = `linear-gradient(90deg,#07100fee 0%,#07100f99 48%,#07100f55 100%),url("${tsrImages[2]}")`;
const cardArts = document.querySelectorAll('.cardArt');
cardArts.forEach((el,i)=>{
  el.style.backgroundImage = `linear-gradient(0deg,#06100dbd,transparent 72%),url("${tsrImages[Math.min(i,tsrImages.length-1)]}")`;
  el.style.backgroundSize='cover';
  el.style.backgroundPosition='center';
  el.style.filter='saturate(.86) contrast(1.03)';
});

// Lightweight procedural Three.js master scene. It adds depth without taking over the real-estate photography.
const old = document.getElementById('scene');
if (old) {
  const canvas = document.createElement('canvas');
  canvas.id = 'tsr3d';
  canvas.setAttribute('aria-hidden','true');
  old.replaceWith(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true, powerPreference:'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.6));
  renderer.setSize(innerWidth,innerHeight,false);
  renderer.setClearColor(0x000000,0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38,innerWidth/innerHeight,.1,100);
  camera.position.set(0,4.6,13);
  scene.add(new THREE.AmbientLight(0x9bc5b5,1.25));
  const key = new THREE.DirectionalLight(0xd8b873,1.8); key.position.set(4,8,5); scene.add(key);
  const group = new THREE.Group(); scene.add(group);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(34,34,34,34),new THREE.MeshBasicMaterial({color:0x89a995,wireframe:true,transparent:true,opacity:.09}));
  ground.rotation.x=-Math.PI/2; ground.position.y=-2.25; group.add(ground);
  const wallMat=new THREE.MeshStandardMaterial({color:0x29453a,metalness:.25,roughness:.55});
  const roofMat=new THREE.MeshStandardMaterial({color:0xc6a66a,metalness:.5,roughness:.3,emissive:0x3b2a10,emissiveIntensity:.18});
  const makeHouse=(x,z,s=1)=>{const g=new THREE.Group();const base=new THREE.Mesh(new THREE.BoxGeometry(2.15*s,1.25*s,1.65*s),wallMat);base.position.y=-1.05;g.add(base);const roof=new THREE.Mesh(new THREE.ConeGeometry(1.55*s,1.1*s,4),roofMat);roof.rotation.y=Math.PI/4;roof.position.y=.12;g.add(roof);g.position.set(x,0,z);return g};
  [[-5,-2.3,.65],[-2.6,-1,.85],[2.5,-1,.9],[5,-2.7,.65],[0,-4.3,1.1]].forEach(v=>group.add(makeHouse(...v)));
  const pts=[];for(let i=0;i<650;i++)pts.push((Math.random()-.5)*24,(Math.random()-.5)*12,(Math.random()-.5)*18);
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));
  const stars=new THREE.Points(geo,new THREE.PointsMaterial({color:0xc6a66a,size:.025,transparent:true,opacity:.7}));scene.add(stars);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(5.7,.015,8,180),new THREE.MeshBasicMaterial({color:0xc6a66a,transparent:true,opacity:.45}));ring.rotation.x=Math.PI/2.4;group.add(ring);
  let mx=0,my=0,tx=0,ty=0;addEventListener('pointermove',e=>{tx=(e.clientX/innerWidth-.5)*.65;ty=(e.clientY/innerHeight-.5)*.35});
  const resize=()=>{renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()};addEventListener('resize',resize,{passive:true});
  const tick=()=>{mx+=(tx-mx)*.025;my+=(ty-my)*.025;group.rotation.y+=.0012;group.rotation.x=my*.12;camera.position.x+=(mx-camera.position.x)*.025;camera.position.y+=(4.6-my-camera.position.y)*.025;camera.lookAt(0,-.4,-2);stars.rotation.y-=.00025;ring.rotation.z+=.0008;renderer.render(scene,camera);requestAnimationFrame(tick)};tick();
}

// Smart Match conversion layer is already serverless and editable from index.html.
