import { DEMOS } from '../shared/demo.js';

const $=id=>document.getElementById(id);
const show=(id,value)=>$(id)?.classList.toggle('hidden',!value);
const text=(id,value)=>{if($(id))$(id).textContent=String(value??'')};
const idleMs=15*60*1000;
const state={
  mode:'camera', photo:'',stream:null,
  current:null, demo:true,messages:[],solved:false,sparks:0,hintSeen:false,
  busy:false,abort:null,idleTimer:null,toastTimer:null,roundCounter:0
};
function toast(message,ms=3700){
  clearTimeout(state.toastTimer);text('toast',message);show('toast',true);
  state.toastTimer=setTimeout(()=>show('toast',false),ms);
}
function touch(){clearTimeout(state.idleTimer);state.idleTimer=setTimeout(()=>reset(true,'Phiên tạm đã được xóa sau 15 phút.'),idleMs)}
function stopCamera(){
  if(state.stream){state.stream.getTracks().forEach(track=>track.stop());state.stream=null}
  const video=$('cameraVideo');try{video.pause()}catch{}video.srcObject=null;
  show('cameraVideo',false);show('cameraLive',false);
}
function clearPhoto(){
  state.photo='';const preview=$('photoPreview');preview.removeAttribute('src');
  show('photoPreview',false);show('cameraPlaceholder',true);$('photoFile').value='';
  show('retakePhoto',false);show('openCamera',true);show('snapPhoto',false);
  $('createMission').disabled=true;
}
function reset(announce=false,message='Đã kết thúc và xóa nội dung phiên trên ứng dụng.'){
  if(state.abort){state.abort.abort();state.abort=null}
  stopCamera();clearPhoto();$('missionPicture').removeAttribute('src');show('missionPicture',false);state.current=null;state.messages=[];state.solved=false;
  state.sparks=0;state.hintSeen=false;state.busy=false;
  $('messageInput').value='';show('chatNotice',false);show('winBanner',false);
  show('gameScreen',false);show('homeScreen',true);
  renderMode();renderDemos();
  window.scrollTo({top:0,behavior:'instant'});
  touch();if(announce)toast(message);
}
function renderMode(){
  const demo=state.mode==='demo';
  show('demoPanel',demo);show('cameraPanel',!demo);
  $('tabDemo').classList.toggle('active',demo);$('tabCamera').classList.toggle('active',!demo);
  $('tabDemo').setAttribute('aria-selected',String(demo));$('tabCamera').setAttribute('aria-selected',String(!demo));
}
function renderDemos(){
  const grid=$('demoGrid');grid.replaceChildren();
  DEMOS.forEach((d,i)=>{
    const btn=document.createElement('button');btn.className='demo-card';btn.type='button';
    btn.setAttribute('aria-label','Thử thách mẫu: '+d.scene);
    const a=document.createElement('span');a.className='emoji';a.textContent=d.icon;
    const b=document.createElement('span');b.className='demo-name';b.textContent=d.scene;
    const c=document.createElement('span');c.className='start-arrow';c.textContent='↗';
    btn.append(a,b,c);btn.addEventListener('click',()=>beginDemo(i));grid.append(btn);
  });
}
function changeMode(mode){
  if(state.busy)return;stopCamera();clearPhoto();state.mode=mode;renderMode();touch();
}
// Khung ngắm 16:9 đồng nhất với ảnh camera gửi AI.
// Với ảnh chọn từ thư viện: giữ TOÀN BỘ ảnh trong khung (contain) để không cắt mất hiện tượng.
function imageFromSource(source,width,height,{crop=false}={}){
  const desired=16/9;const ratio=width/height;
  const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=720;
  const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw Error('Không xử lý được ảnh trên thiết bị này.');
  ctx.fillStyle='#f8fafc';ctx.fillRect(0,0,canvas.width,canvas.height);
  if(crop){
    let sx=0,sy=0,sw=width,sh=height;
    if(ratio>desired){sw=height*desired;sx=(width-sw)/2}
    else{sh=width/desired;sy=(height-sh)/2}
    ctx.drawImage(source,sx,sy,sw,sh,0,0,canvas.width,canvas.height);
  }else{
    const scale=Math.min(canvas.width/width,canvas.height/height);
    const dw=Math.round(width*scale),dh=Math.round(height*scale);
    ctx.drawImage(source,0,0,width,height,(canvas.width-dw)/2,(canvas.height-dh)/2,dw,dh);
  }
  const data=canvas.toDataURL('image/jpeg',.72);canvas.width=1;canvas.height=1;
  if(data.length>2_100_000)throw Error('Ảnh quá lớn, hãy thử lại.');return data;
}
function usePhoto(data){
  stopCamera();state.photo=data;$('photoPreview').src=data;
  show('cameraPlaceholder',false);show('photoPreview',true);
  show('retakePhoto',true);show('openCamera',false);show('snapPhoto',false);
  $('createMission').disabled=false;touch();
}
async function openCamera(){
  touch();if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia){toast('Vui lòng dùng HTTPS hoặc chọn ảnh từ thiết bị.');return}
  stopCamera();clearPhoto();
  try{
    const stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720},aspectRatio:{ideal:16/9}}});
    state.stream=stream;const video=$('cameraVideo');video.srcObject=stream;
    await video.play();show('cameraPlaceholder',false);show('photoPreview',false);
    show('cameraVideo',true);show('cameraLive',true);
    show('openCamera',false);show('snapPhoto',true);
  }catch{stopCamera();toast('Chưa mở được camera. Hãy cấp quyền camera hoặc chọn ảnh có sẵn.')}
}
function takePhoto(){
  const video=$('cameraVideo');if(!video.videoWidth||!video.videoHeight){toast('Camera chưa sẵn sàng.');return}
  try{usePhoto(imageFromSource(video,video.videoWidth,video.videoHeight,{crop:true}))}
  catch(e){toast(e.message||'Không chụp được ảnh.')}
}
async function chooseFile(event){
  const file=event.target.files?.[0];if(!file)return;
  if(!file.type.startsWith('image/')){toast('Hãy chọn tệp hình ảnh.');return}
  const url=URL.createObjectURL(file);const img=new Image();
  try{img.src=url;await img.decode();usePhoto(imageFromSource(img,img.naturalWidth,img.naturalHeight))}
  catch(e){toast(e.message||'Không đọc được ảnh.')}
  finally{img.removeAttribute('src');URL.revokeObjectURL(url)}
}
async function callAPI(payload){
  const ctrl=new AbortController();state.abort=ctrl;
  try{
    const res=await fetch('/api/analyze',{
      method:'POST',headers:{'Content-Type':'application/json','Cache-Control':'no-store'},
      credentials:'omit',cache:'no-store',signal:ctrl.signal,
      body:JSON.stringify(payload)
    });
    const data=await res.json().catch(()=>({error:'Máy chủ chưa phản hồi đúng định dạng.'}));
    if(!res.ok)throw Error(data.error||'Không thể gọi AI.');
    if(!data.result)throw Error('AI không có kết quả.');return data.result;
  }finally{if(state.abort===ctrl)state.abort=null}
}
function setMissionBusy(isBusy){
  state.busy=isBusy;$('createMission').disabled=isBusy||!state.photo;
  const label=$('createMission').querySelector('.cta-label');
  if(label)label.textContent=isBusy?'Mây đang tạo thử thách...':'Tạo thử thách từ ảnh';
}
async function createMission(){
  if(!state.photo||state.busy)return;
  const original=state.photo;setMissionBusy(true);touch();
  try{
    const result=await callAPI({mode:'challenge',image:original.split(',')[1]});
    if(!result.usable){toast(result.reason||'Ảnh chưa rõ để tìm được thử thách khoa học.',6500);return}
    setMissionBusy(false); // Tránh bong bóng 'đang nhập' tồn tại sau khi vào hội thoại.
    beginChallenge(result,false);
  }catch(e){if(e.name!=='AbortError')toast(e.message||'Không tạo được thử thách.',6200)}
  finally{setMissionBusy(false)}
}
function beginDemo(index){
  touch();const d=DEMOS[index];if(!d)return;
  beginChallenge({...d,usable:true},true);
}
function beginChallenge(challenge,isDemo){
  stopCamera();state.current=challenge;state.demo=isDemo;state.messages=[];
  state.solved=false;state.sparks=0;state.hintSeen=false;state.roundCounter++;
  if(!isDemo && state.photo){$('missionPicture').src=state.photo;show('missionPicture',true);show('missionAvatar',false)}
  else{$('missionPicture').removeAttribute('src');show('missionPicture',false);show('missionAvatar',true)}
  text('roundLabel',isDemo?'CHƠI THỬ':'KHÁM PHÁ TỪ ẢNH');
  text('missionTopic',challenge.topicTitle||'Khoa học quanh em');
  text('missionScene',challenge.scene);text('missionAvatar',challenge.icon||'🔬');
  text('experimentText',challenge.experiment);show('experimentText',false);
  $('toggleExperiment').setAttribute('aria-expanded','false');
  text('chatStatus',isDemo?'Hội thoại mẫu · không gọi AI':'Từ ảnh thật · đối thoại với AI');
  text('sparkCount','0');show('winBanner',false);show('chatNotice',false);
  $('messageInput').value='';show('homeScreen',false);show('gameScreen',true);
  state.messages.push({role:'bot',head:'MÂY KHẲNG ĐỊNH',text:`${challenge.claim}\n\n${challenge.prompt}`});
  renderConversation();progress('start');window.scrollTo({top:0,behavior:'instant'});touch();
}
function progress(kind){
  const flags=[kind==='start',kind==='thinking'||kind==='solved',kind==='solved'];
  ['stepOne','stepTwo','stepThree'].forEach((id,i)=>$(id).classList.toggle('active',i===0||flags[i]));
  text('missionGoal',kind==='solved'?'Đã sửa được lỗi! Tiếp tục hỏi đáp nhé.':kind==='thinking'?'Hãy tìm bằng chứng thuyết phục Mây.':'Nghe Mây → Phản biện → Tìm bằng chứng');
}
function renderConversation(){
  const box=$('conversation');box.replaceChildren();
  state.messages.forEach(msg=>{
    const row=document.createElement('div');row.className='msg '+(msg.role==='user'?'user':'bot');
    const avatar=document.createElement('div');avatar.className='msg-avatar';avatar.textContent=msg.role==='user'?'✎':'✳';
    const body=document.createElement('div');body.className='msg-body';
    const bubble=document.createElement('div');bubble.className='bubble';
    if(msg.head){const head=document.createElement('span');head.className='msg-lead';head.textContent=msg.head;bubble.append(head)}
    const content=document.createElement('span');content.textContent=msg.text;bubble.append(content);
    body.append(bubble);row.append(avatar,body);box.append(row);
  });
  if(state.busy){
    const row=document.createElement('div');row.className='msg bot';row.id='typingBubble';
    const avatar=document.createElement('div');avatar.className='msg-avatar';avatar.textContent='✳';
    const b=document.createElement('div');b.className='bubble typing-bubble';
    for(let i=0;i<3;i++)b.append(document.createElement('span'));
    row.append(avatar,b);box.append(row);
  }
  requestAnimationFrame(()=>{box.scrollTop=box.scrollHeight});
}
function addBot(textValue,head=''){state.messages.push({role:'bot',text:textValue,head});renderConversation()}
function showHint(){
  if(!state.current||state.busy)return;
  if(state.hintSeen){toast('Mây đã đưa gợi ý. Hãy thử dùng một bằng chứng nhé.');return}
  state.hintSeen=true;addBot(`🔍 Tớ mách một chút: ${state.current.hint}`,'GỢI Ý NHỎ');touch();
}
function normalize(s){return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
function demoRespond(answer){
  const d=state.current,clean=normalize(answer),keys=(d.keys||[]).map(normalize);
  const evidence=keys.filter(k=>clean.includes(k)).length;
  if(state.solved){
    return {reply:'Tớ thích cách cậu đặt câu hỏi tiếp! Với chủ đề này, hãy đối chiếu lại bằng chứng quan sát được nhé.',verdict:'solved',followUp:'Cậu còn cách kiểm chứng nào khác không?'};
  }
  if(evidence>0 && answer.trim().length>=18){
    return {reply:`A ha! Cậu đã đưa ra một lập luận liên quan đến hiện tượng. Tớ sửa lại nhận định nhé: ${d.truth}`,verdict:'solved',followUp:'Nếu đổi một điều kiện của thí nghiệm, cậu dự đoán kết quả thế nào?'};
  }
  if(answer.length<14 || /^(sai|dung|khong|co|đúng|không|sai rồi)[.!\s]*$/i.test(answer.trim())){
    return {reply:'Ồ, cậu không đồng ý với tớ à? Nhưng tớ cần nghe LÍ DO để tin cơ!',verdict:'explore',followUp:'Em quan sát được điều gì làm bằng chứng?'};
  }
  return {reply:'Lập luận thú vị đấy! Nhưng tớ chưa hiểu nó bác bỏ phần nào trong nhận định của tớ.',verdict:'almost',followUp:`Hãy thử liên hệ với kiến thức ${String(d.topicTitle||'khoa học').toLowerCase()} nhé.`};
}
function setChatBusy(value){
  state.busy=value;$('sendMessage').disabled=value||$('messageInput').value.trim().length<2;
  $('messageInput').disabled=value;document.querySelectorAll('.tool-chip').forEach(btn=>btn.disabled=value);
}
async function sendAnswer(){
  const answer=$('messageInput').value.trim();if(answer.length<2||state.busy||!state.current)return;
  touch();show('chatNotice',false);
  const history=state.messages.slice(-10).map(m=>({role:m.role,text:m.text}));
  state.messages.push({role:'user',text:answer});$('messageInput').value='';
  setChatBusy(true);renderConversation();progress(state.solved?'solved':'thinking');
  try{
    const result=state.demo?demoRespond(answer):await callAPI({
      mode:'feedback',challenge:state.current,alreadySolved:state.solved,
      answer,history
    });
    // Demo chạy không gọi mạng nhưng dùng cùng cơ chế phản hồi nhiều lượt.
    const botText=result.reply+(result.followUp?'\n\n'+result.followUp:'');
    const justSolved=result.verdict==='solved'&&!state.solved;
    if(justSolved){state.sparks+=20;state.solved=true;text('sparkCount',state.sparks);show('winBanner',true)}
    else if(result.verdict==='almost'&&!state.solved){state.sparks+=5;text('sparkCount',state.sparks)}
    state.busy=false;state.messages.push({role:'bot',text:botText,head:justSolved?'MÂY ĐÃ HIỂU! ✦':''});
    renderConversation();progress(state.solved?'solved':'thinking');
  }catch(e){
    state.messages.pop();$('messageInput').value=answer;
    text('chatNotice',e.name==='AbortError'?'Đã hủy yêu cầu.':(e.message||'Không gửi được câu trả lời. Hãy thử lại.'));
    show('chatNotice',true);
  }finally{setChatBusy(false);renderConversation();touch()}
}

// Event wiring
$('resetTop').addEventListener('click',()=>reset(true));
$('brandLink').addEventListener('click',e=>{e.preventDefault();reset(true)});
$('backHome').addEventListener('click',()=>reset(true,'Đã xóa phiên cũ. Chọn hiện tượng mới nhé!'));
$('tabDemo').addEventListener('click',()=>changeMode('demo'));
$('tabCamera').addEventListener('click',()=>changeMode('camera'));
$('openCamera').addEventListener('click',openCamera);$('snapPhoto').addEventListener('click',takePhoto);
$('retakePhoto').addEventListener('click',openCamera);
$('choosePhoto').addEventListener('click',()=>$('photoFile').click());
$('photoFile').addEventListener('change',chooseFile);
$('createMission').addEventListener('click',createMission);
$('toggleExperiment').addEventListener('click',()=>{
  const open=$('experimentText').classList.contains('hidden');show('experimentText',open);
  $('toggleExperiment').setAttribute('aria-expanded',String(open));touch();
});
$('suggestDisagree').addEventListener('click',()=>{$('messageInput').value='Tớ không đồng ý vì ';$('messageInput').focus();touch();setChatBusy(false)});
$('suggestEvidence').addEventListener('click',()=>{$('messageInput').value='Nếu quan sát kĩ, tớ thấy ';$('messageInput').focus();touch();setChatBusy(false)});
$('askHint').addEventListener('click',showHint);
$('messageInput').addEventListener('input',()=>{$('sendMessage').disabled=state.busy||$('messageInput').value.trim().length<2;touch()});
$('messageInput').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing&&window.innerWidth>650){e.preventDefault();sendAnswer()}});
$('sendMessage').addEventListener('click',sendAnswer);
window.addEventListener('pagehide',()=>{reset(false);clearTimeout(state.idleTimer)});
window.addEventListener('pageshow',e=>{if(e.persisted)reset(false)});
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopCamera();if(!state.photo){show('cameraPlaceholder',true);show('openCamera',true);show('snapPhoto',false)}}});
renderMode();renderDemos();touch();
