const $=id=>document.getElementById(id);
let session,stream,mode='camera',busy=false,drawing=false,revision=0,photo=null,starting=false,modelLoading=true,lastCapture=null,captureNumber=0;
const draw=$('draw'),dc=draw.getContext('2d'),raw=document.createElement('canvas'),rc=raw.getContext('2d',{willReadFrequently:true}),norm=document.createElement('canvas');
raw.width=raw.height=200;norm.width=norm.height=28;
const nc=norm.getContext('2d',{willReadFrequently:true}),pc=$('preview').getContext('2d');
const originalContext=$('originalCrop').getContext('2d');
const storageKey='digit-lens-manual-tests-v1';
let tests=[];try{const saved=JSON.parse(localStorage.getItem(storageKey)||'[]');if(Array.isArray(saved))tests=saved}catch{}
function updateControls(){
 const available=mode==='draw'||(mode==='photo'&&photo)||(mode==='camera'&&stream&&$('video').readyState>=2);
 $('capture').disabled=!session||busy||!available;
 $('record').disabled=busy||!lastCapture||lastCapture.recorded||$('actual').value==='';
 $('photoFile').disabled=busy;$('cameraTab').disabled=busy;$('drawTab').disabled=busy;$('clear').disabled=busy;
 $('start').disabled=busy||starting||!!stream;$('stop').disabled=busy||!stream;
}
function clearResult(text='Waiting for a capture'){
 lastCapture=null;$('digit').textContent='—';$('confidence').textContent=text;
 $('scores').innerHTML=Array.from({length:10},(_,i)=>`<div class="score"><span>${i}</span><div class="track"><div class="bar"></div></div><output>—</output></div>`).join('');
 pc.fillStyle='#111c16';pc.fillRect(0,0,28,28);updateControls();
}
function clear(){revision++;dc.fillStyle='white';dc.fillRect(0,0,400,400);$('drawHint').hidden=false;clearResult();$('captureInfo').textContent='Draw one digit, then Capture & classify.';}
function stop(){revision++;stream?.getTracks().forEach(t=>t.stop());stream=null;$('video').srcObject=null;$('guide').style.display=mode==='photo'?'block':'none';$('welcome').hidden=mode!=='camera';$('sourceState').textContent=mode==='camera'?'CAMERA OFF':mode==='photo'?'SAVED PHOTO':'DRAWING PAD';updateControls();}
function switchMode(next){stop();mode=next;photo=null;revision++;$('welcome').hidden=next!=='camera';draw.hidden=next!=='draw';$('photoView').hidden=true;$('video').hidden=next==='draw';$('drawHint').hidden=next!=='draw';$('stop').hidden=next!=='camera';$('clear').hidden=next!=='draw';$('thresholdLabel').hidden=next!=='camera';$('cameraTab').classList.toggle('active',next==='camera');$('drawTab').classList.toggle('active',next==='draw');$('sourceState').textContent=next==='camera'?'CAMERA OFF':'DRAWING PAD';$('guide').style.display='none';clearResult();if(next==='draw')clear();$('message').textContent=session?'Model ready. '+(next==='draw'?'Draw one digit, then Capture & classify.':'Enable the camera or use a saved photo.'):'No model loaded. '+(modelLoading?'Loading mnist-12.onnx…':'Check the model-loading error, then reload.');updateControls();}
$('cameraTab').onclick=()=>switchMode('camera');$('drawTab').onclick=()=>switchMode('draw');$('clear').onclick=clear;$('stop').onclick=()=>{stop();$('message').textContent='Camera stopped. The last capture and its result remain available.'};
$('threshold').oninput=()=>{$('thresholdValue').value=$('threshold').value;revision++;};
$('start').onclick=async()=>{const token=++revision;starting=true;updateControls();try{if(!navigator.mediaDevices?.getUserMedia)throw new Error('Camera access requires HTTPS or localhost. Use a saved photo, or open this app on localhost.');const obtained=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1280},height:{ideal:720}},audio:false});if(mode!=='camera'||token!==revision){obtained.getTracks().forEach(t=>t.stop());return;}stream=obtained;$('video').srcObject=stream;await $('video').play();$('welcome').hidden=true;$('guide').style.display='block';$('sourceState').textContent='● LIVE';$('message').textContent='Keep dark ink and white paper inside the guide. Press Capture & classify when ready.';stream.getVideoTracks()[0].onended=()=>stop();}catch(e){stop();$('message').textContent=e.name==='NotAllowedError'?'Camera permission was denied. Allow access in your browser, or choose Use a saved photo below.':e.name==='NotFoundError'?'No camera was found. Connect a camera or choose Use a saved photo below.':e.message;}finally{starting=false;updateControls()}};
$('video').addEventListener('loadeddata',updateControls);
$('photoFile').onchange=async()=>{const file=$('photoFile').files[0];if(!file)return;stop();const token=++revision;photo=null;clearResult();const url=URL.createObjectURL(file);try{const img=new Image();img.src=url;await img.decode();if(token!==revision)return;photo=img;mode='photo';$('photoView').src=img.src; // Keep a decoded copy after the temporary URL is revoked.
 $('photoView').src=await new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.readAsDataURL(file)});
 $('photoView').hidden=false;$('video').hidden=true;draw.hidden=true;$('welcome').hidden=true;$('drawHint').hidden=true;$('guide').style.display='block';$('stop').hidden=false;$('clear').hidden=true;$('thresholdLabel').hidden=false;$('cameraTab').classList.remove('active');$('drawTab').classList.remove('active');$('sourceState').textContent='SAVED PHOTO';$('message').textContent='Photo ready. The same square guide defines the crop. Press Capture & classify.';}catch(e){$('message').textContent='Could not read the photo. Choose a supported JPG or PNG. '+e.message;}finally{URL.revokeObjectURL(url);$('photoFile').value='';updateControls()}};
function point(e){const r=draw.getBoundingClientRect();return [(e.clientX-r.left)*400/r.width,(e.clientY-r.top)*400/r.height];}
draw.onpointerdown=e=>{if(busy)return;drawing=true;draw.setPointerCapture(e.pointerId);$('drawHint').hidden=true;dc.beginPath();dc.moveTo(...point(e));dc.lineWidth=24;dc.lineCap='round';dc.lineJoin='round';dc.strokeStyle='black';dc.lineTo(point(e)[0]+.1,point(e)[1]+.1);dc.stroke();revision++;};
draw.onpointermove=e=>{if(!drawing||busy)return;dc.lineTo(...point(e));dc.stroke();revision++;};
draw.onpointerup=draw.onpointercancel=()=>{drawing=false;};
function preprocess(){
 // Copy the source synchronously once. All processing and inference use this frozen crop.
 if(mode==='camera'){const v=$('video');if(!stream||v.readyState<2)return null;const stage=document.querySelector('.stage');const scale=Math.max(stage.clientWidth/v.videoWidth,stage.clientHeight/v.videoHeight);const side=stage.clientWidth*.6/scale;rc.drawImage(v,(v.videoWidth-side)/2,(v.videoHeight-side)/2,side,side,0,0,200,200);}
 else if(mode==='photo'){if(!photo)return null;const stage=document.querySelector('.stage');const scale=Math.max(stage.clientWidth/photo.naturalWidth,stage.clientHeight/photo.naturalHeight);const side=stage.clientWidth*.6/scale;rc.drawImage(photo,(photo.naturalWidth-side)/2,(photo.naturalHeight-side)/2,side,side,0,0,200,200);}
 else rc.drawImage(draw,0,0,200,200);
 originalContext.drawImage(raw,0,0);
 const im=rc.getImageData(0,0,200,200);
 const isolated=segmentInk(im.data,200,mode!=='draw'?Number($('threshold').value):140);
 if(!isolated)return null;
 const {x0,y0,x1,y1}=isolated;im.data.set(isolated.data);
 rc.putImageData(im,0,0);nc.fillStyle='black';nc.fillRect(0,0,28,28);const w=x1-x0+1,h=y1-y0+1,s=20/Math.max(w,h);nc.drawImage(raw,x0,y0,w,h,(28-w*s)/2,(28-h*s)/2,w*s,h*s);
 const pre=nc.getImageData(0,0,28,28);let mass=0,mx=0,my=0;for(let i=0;i<784;i++){const v=pre.data[i*4];mass+=v;mx+=i%28*v;my+=Math.floor(i/28)*v;}nc.fillRect(0,0,28,28);const temp=document.createElement('canvas');temp.width=temp.height=28;temp.getContext('2d').putImageData(pre,0,0);nc.drawImage(temp,Math.round(13.5-mx/mass),Math.round(13.5-my/mass));pc.drawImage(norm,0,0);const data=nc.getImageData(0,0,28,28).data;return Float32Array.from({length:784},(_,i)=>data[i*4]/255);}
async function captureAndClassify(){
 if(!session){$('message').textContent='No model loaded. Wait for mnist-12.onnx to load, or check the loading error and reload.';return}
 if(busy)return;
 busy=true;clearResult('Classifying this capture…');updateControls();
 const capture={id:crypto.randomUUID(),number:++captureNumber,version:$('version').value,threshold:mode==='draw'?140:Number($('threshold').value),source:mode,recorded:false};
 let tensor,outputs;
 try{
  const data=preprocess();
  if(!data){clearResult('No clear digit detected');$('captureInfo').textContent=`Capture ${capture.number} · ${capture.version} · no digit`; $('message').textContent='Blank crop or no clear isolated digit detected. Frame one digit and capture again.';return}
  tensor=new ort.Tensor('float32',data,[1,1,28,28]);outputs=await session.run({[session.inputNames[0]]:tensor});
  const logits=Array.from(outputs[session.outputNames[0]].data);
  if(logits.length!==10||!logits.every(Number.isFinite))throw new Error('The model did not return ten finite scores.');
  const max=Math.max(...logits),exps=logits.map(x=>Math.exp(x-max)),sum=exps.reduce((a,b)=>a+b,0),scores=exps.map((v,i)=>({digit:i,p:v/sum}));
  const best=scores.reduce((a,b)=>b.p>a.p?b:a);
  lastCapture={...capture,predicted_digit:best.digit,score:best.p,scores};
  $('digit').textContent=best.digit;$('confidence').textContent=`${(best.p*100).toFixed(1)}% confidence${best.p<.7?' · uncertain':''}`;
  $('scores').innerHTML=scores.map(s=>`<div class="score"><span>${s.digit}</span><div class="track"><div class="bar" style="width:${s.p*100}%"></div></div><output>${(s.p*100).toFixed(1)}%</output></div>`).join('');
  $('captureInfo').textContent=`Capture ${capture.number} · ${capture.version} · ${capture.source} · sensitivity ${capture.threshold}. These pixels and scores stay frozen until the next capture.`;
  $('message').textContent='Capture classified. Choose the actual digit and Record test. A high score can still be wrong.';
  $('recordMessage').textContent='Ready to record this capture once.';
 }catch(e){clearResult('Classification failed');$('message').textContent='Recognition failed: '+e.message}
 finally{tensor?.dispose();if(outputs)Object.values(outputs).forEach(t=>t.dispose());busy=false;updateControls()}
}
$('capture').onclick=captureAndClassify;$('actual').onchange=updateControls;
$('version').onchange=()=>{if(lastCapture)$('recordMessage').textContent=`The displayed capture belongs to ${lastCapture.version}. The new version label applies to your next capture.`};
function renderTests(){
 $('testCount').textContent=`${tests.length} RECORDED`;
 $('testRows').replaceChildren(...tests.map(r=>{const tr=document.createElement('tr');[r.version,r.trial,r.actual_digit,r.predicted_digit,(r.score*100).toFixed(2)+'%',r.correct?'Yes':'No'].forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.append(td)});return tr}));
}
$('record').onclick=()=>{
 if(!lastCapture||lastCapture.recorded||$('actual').value==='')return;
 const actual=Number($('actual').value);
 const row={version:lastCapture.version,trial:tests.filter(t=>t.version===lastCapture.version).length+1,actual_digit:actual,predicted_digit:lastCapture.predicted_digit,score:lastCapture.score,correct:actual===lastCapture.predicted_digit,capture_id:lastCapture.id,threshold:lastCapture.threshold};
 tests.push(row);lastCapture.recorded=true;let saved=true;try{localStorage.setItem(storageKey,JSON.stringify(tests))}catch{saved=false}
 renderTests();updateControls();$('recordMessage').textContent=`Recorded ${row.version} trial ${row.trial}: ${row.correct?'correct':'incorrect (kept in the record)'}.`+(saved?'':' Browser storage is unavailable; download your CSV before closing.');
};
$('export').onclick=()=>{
 const fields=['version','trial','actual_digit','predicted_digit','score','correct'];
 const csv=[fields,...tests.map(r=>fields.map(f=>r[f]))].map(row=>row.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n')+'\r\n';
 const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='digit-tests.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);
};
clear();$('drawHint').hidden=true;clearResult();renderTests();window.addEventListener('pagehide',stop);
(async()=>{try{if(!window.ort)throw new Error('The recognition runtime could not load. Check your internet connection and reload.');ort.env.wasm.numThreads=1;ort.env.wasm.wasmPaths='https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.1/dist/';session=await ort.InferenceSession.create('./mnist-12.onnx',{executionProviders:['wasm']});$('modelState').textContent='MODEL READY';$('message').textContent='Model ready. Enable the camera, choose a saved photo or draw a digit, then Capture & classify.';}catch(e){$('modelState').textContent='LOAD ERROR';$('message').textContent='No model loaded. '+e.message;}finally{modelLoading=false;updateControls()}})();
