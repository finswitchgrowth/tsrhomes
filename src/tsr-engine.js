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

// Replace the decorative canvas with a lightweight interactive Three.js master scene.
const old = document.getElementById('scene');
if (old) {
  const canvas = document.createElement('canvas');
  canvas.id = 'tsr3d';
  canvas.setAttribute('aria-hidden','true');
  old.replaceWith(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true, powerPreference:'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, innerWidth/innerHeight, .1, 100);
  camera.position.set(0, 5.4, 14);
  const group = new THREE.Group();
  scene.add(group);
  scene.add(new THREE.AmbientLight(0x7bbde8, 1.4));
  const key = new THREE.DirectionalLight(0xffb04a, 2.2); key.position.set(4,8,6); scene.add(key);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(34,34,34,34),
    new THREE.MeshBasicMaterial({ color:0x0b3347, wireframe:true, transparent:true, opacity:.22 })
  );
  ground.rotation.x = -Math.PI/2; ground.position.y = -2.15; group.add(ground);

  const houseMat = new THREE.MeshStandardMaterial({ color:0x0877b6, emissive:0x03263d, metalness:.45, roughness:.35 });
  const goldMat = new THREE.MeshStandardMaterial({ color:0xff9518, emissive:0x6b2500, emissiveIntensity:.55, metalness:.6, roughness:.28 });
  const greenMat = new THREE.MeshStandardMaterial({ color:0x78c43d, emissive:0x163b05, emissiveIntensity:.25 });
  const makeHouse = (x,z,s=1) => {
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(2.1*s,1.35*s,1.7*s), houseMat); base.position.y=-1.1; g.add(base);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.62*s,1.15*s,4), goldMat); roof.rotation.y=Math.PI/4; roof.position.y=.12; g.add(roof);
    const door = new THREE.Mesh(new THREE.BoxGeometry(.35*s,.7*s,.04*s), greenMat); door.position.set(0,-1.35*s,.88*s); g.add(door);
    g.position.set(x,0,z); return g;
  };
  [[-5,-2.4,.65],[-2.6,-1,.85],[2.6,-1,.9],[5,-2.7,.65],[0,-4.5,1.15]].forEach(v=>group.add(makeHouse(...v)));

  const pts=[];
  for(let i=0;i<900;i++) pts.push((Math.random()-.5)*24, (Math.random()-.5)*12, (Math.random()-.5)*18);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));
  const stars = new THREE.Points(geo,new THREE.PointsMaterial({color:0x73c9f2,size:.025,transparent:true,opacity:.8})); scene.add(stars);

  const ring = new THREE.Mesh(new THREE.TorusGeometry(5.7,.018,8,180),new THREE.MeshBasicMaterial({color:0xff9518,transparent:true,opacity:.55}));
  ring.rotation.x=Math.PI/2.5; ring.rotation.z=.35; group.add(ring);

  let mx=0,my=0,tx=0,ty=0;
  addEventListener('pointermove',e=>{tx=(e.clientX/innerWidth-.5)*.8;ty=(e.clientY/innerHeight-.5)*.45});
  const resize=()=>{renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()};
  addEventListener('resize',resize,{passive:true});
  const tick=()=>{
    mx+=(tx-mx)*.025; my+=(ty-my)*.025;
    group.rotation.y += .0017; group.rotation.x = my*.16; group.rotation.z = mx*.035;
    camera.position.x += (mx*1.3-camera.position.x)*.025; camera.position.y += (5.4-my*1.2-camera.position.y)*.025; camera.lookAt(0,-.4,-2);
    stars.rotation.y -= .0003; ring.rotation.z += .001;
    renderer.render(scene,camera); requestAnimationFrame(tick);
  }; tick();
}

// Smart property-match engine: converts buyer intent into a transparent score.
const matcherMarkup = `
<section class="smart-match" id="matcher">
  <div class="wrap">
    <div class="match-intro"><div><span class="kicker">TSR SMART MATCH™</span><h2>Tell us what you're building.</h2></div><p>Not a generic enquiry form. The matcher scores your preferences across property type, budget, purpose, location intent and purchase horizon, then turns the result into a useful conversation starter.</p></div>
    <div class="match-panel">
      <div class="match-controls">
        <label>I'm looking for<select id="mType"><option value="plot">Open Plot</option><option value="villa">Villa</option><option value="duplex">Duplex</option><option value="farm">Farmhouse</option></select></label>
        <label>Primary purpose<select id="mPurpose"><option value="home">Own Home</option><option value="investment">Investment</option><option value="family">Family / Future</option><option value="mixed">Home + Investment</option></select></label>
        <label>Budget<select id="mBudget"><option value="low">Under ₹25L</option><option value="mid">₹25L–₹50L</option><option value="high">₹50L–₹1Cr</option><option value="premium">₹1Cr+</option></select></label>
        <label>When are you planning?<select id="mTime"><option value="now">0–3 months</option><option value="soon">3–6 months</option><option value="later">6–12 months</option><option value="explore">Just exploring</option></select></label>
      </div>
      <div class="match-result"><div class="score-ring"><strong id="mScore">--</strong><span>match</span></div><div><span class="kicker">Recommended conversation</span><h3 id="mTitle">Choose your preferences</h3><p id="mText">We'll calculate a transparent fit score and prepare your next step.</p><button class="btn primary" id="mCta">Use this match for my enquiry →</button></div></div>
    </div>
  </div>
</section>`;
const contact = document.getElementById('contact');
if (contact && !document.getElementById('matcher')) contact.insertAdjacentHTML('beforebegin', matcherMarkup);

const profile = {
  plot:{title:'Plot-led discovery',text:'A plot-first conversation focused on location, size, current availability and your intended build timeline.'},
  villa:{title:'Villa-led discovery',text:'A home-first conversation focused on villa configuration, community experience, location and visit planning.'},
  duplex:{title:'Duplex-led discovery',text:'A family-home conversation focused on layout, neighbourhood, space requirements and site visit.'},
  farm:{title:'Farmhouse-led discovery',text:'A larger-land conversation focused on use case, access, surroundings and suitability.'}
};
const calc=()=>{
  const type=document.getElementById('mType')?.value, purpose=document.getElementById('mPurpose')?.value, budget=document.getElementById('mBudget')?.value, time=document.getElementById('mTime')?.value;
  if(!type) return;
  let score=62;
  if((type==='villa'||type==='duplex')&&(purpose==='home'||purpose==='family')) score+=13;
  if(type==='plot'&&(purpose==='investment'||purpose==='mixed')) score+=13;
  if(type==='farm'&&purpose==='family') score+=8;
  if((budget==='high'||budget==='premium')&&(type==='villa'||type==='duplex')) score+=7;
  if(budget==='low'&&type==='plot') score+=5;
  if(time==='now') score+=8; else if(time==='soon') score+=5; else if(time==='explore') score-=2;
  score=Math.max(45,Math.min(97,score));
  document.getElementById('mScore').textContent=score+'%';
  document.getElementById('mTitle').textContent=profile[type].title;
  document.getElementById('mText').textContent=profile[type].text+` Your current intent scores ${score}%.`;
};
['mType','mPurpose','mBudget','mTime'].forEach(id=>document.addEventListener('change',e=>{if(e.target.id===id)calc()}));
setTimeout(calc,50);

document.getElementById('mCta')?.addEventListener('click',()=>{
  const type=document.getElementById('mType').value, budget=document.getElementById('mBudget').value;
  const need=document.getElementById('need'); if(need) need.value=`Smart Match: ${profile[type].title}; Budget: ${budget}. Please share current availability and suitable site-visit options.`;
  document.getElementById('contact')?.scrollIntoView({behavior:'smooth'});
});

// Web3Forms + WhatsApp conversion layer.
window.sendLead = async function(event){
  event.preventDefault();
  const form=event.target, status=document.getElementById('formStatus');
  const data={name:document.getElementById('name')?.value||'',phone:document.getElementById('phone')?.value||'',email:document.getElementById('email')?.value||'',message:document.getElementById('need')?.value||'',budget:document.getElementById('budget')?.value||''};
  if(!data.name||!data.phone){if(status)status.textContent='Please add your name and phone number.';return;}
  const key=window.TSR_WEB3FORMS_KEY||'YOUR_WEB3FORMS_ACCESS_KEY';
  if(key==='YOUR_WEB3FORMS_ACCESS_KEY'){
    const text=`Hi TSR Homes, I am ${data.name}. Phone: ${data.phone}. Requirement: ${data.message||'Property enquiry'}. Budget: ${data.budget||'Not specified'}.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`,'_blank','noopener');
    if(status)status.textContent='Web3Forms key is not configured yet — WhatsApp enquiry opened instead.';
    return;
  }
  try{
    if(status)status.textContent='Sending your enquiry…';
    const body=new FormData(); body.append('access_key',key); body.append('subject','TSR Homes — New Property Enquiry'); Object.entries(data).forEach(([k,v])=>body.append(k,v));
    const res=await fetch('https://api.web3forms.com/submit',{method:'POST',body}); const json=await res.json();
    if(!json.success) throw new Error('Web3Forms rejected the submission');
    form.reset(); if(status)status.textContent='Enquiry sent. TSR Homes can now follow up with you.';
  }catch(err){
    const text=`Hi TSR Homes, I am ${data.name}. Phone: ${data.phone}. Requirement: ${data.message||'Property enquiry'}. Budget: ${data.budget||'Not specified'}.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`,'_blank','noopener');
    if(status)status.textContent='Form delivery was unavailable, so we opened WhatsApp as a fallback.';
  }
};

// Add premium interaction layer without a framework.
document.querySelectorAll('.projectCard,.miniCard,.heritage,.feature').forEach(card=>{
  card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect();card.style.transform=`perspective(900px) rotateX(${-(e.clientY-r.top-r.height/2)/32}deg) rotateY(${(e.clientX-r.left-r.width/2)/32}deg) translateY(-4px)`});
  card.addEventListener('pointerleave',()=>card.style.transform='');
});
