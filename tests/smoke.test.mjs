import assert from 'node:assert/strict';
import {GET, POST} from '../api/analyze.js';
import {CURRICULUM, getTopic} from '../shared/curriculum.js';
import {DEMOS} from '../shared/demo.js';

for(const grade of [6,7,8,9]){
  assert.equal(CURRICULUM[grade].length,3);
  assert.equal(DEMOS[grade].length,3);
  for(const item of DEMOS[grade])assert.ok(getTopic(grade,item.topicId));
}
const cleanKey=process.env.GEMINI_API_KEY;
delete process.env.GEMINI_API_KEY;
assert.equal((await (await GET()).json()).configured,false);
const noKey=await POST(new Request('https://example.invalid/api/analyze',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({grade:9,mode:'challenge'})}));
assert.equal(noKey.status,503);
process.env.GEMINI_API_KEY='TEST_KEY_FAKE';
process.env.GEMINI_MODEL='gemini-3.5-flash-lite';
const realFetch=global.fetch;
let totalCalls=0;
global.fetch=async(_url,params)=>{
  totalCalls++;
  const p=JSON.parse(params.body);
  assert.ok(p.systemInstruction.parts[0].text.includes('Bạn là trợ lý'));
  const task=p.contents[0].parts[0].text;
  const result=task.includes('Đánh giá nhận định sai')?{valid:true,reason:''}:
    task.includes('Ảnh do người học chụp')?{
      usable:true,topicId:'refraction',scene:'Cốc nước và bút chì',
      claim:'Tớ nghĩ bút chì gãy thật khi chạm vào nước.',prompt:'Cậu chứng minh thế nào?',
      hint:'Ánh sáng truyền qua nước và không khí.',experiment:'Rút bút ra khỏi cốc nhựa.',
      truth:'Ánh sáng khúc xạ khi đi xiên từ nước ra không khí, bút không gãy.'
    }:{reply:'Ôi, cậu có lý! Khi ánh sáng khúc xạ, ảnh bút bị lệch.',verdict:'solved',followUp:'Cậu thấy bút có nguyên vẹn không?',insight:'Hãy quan sát.'};
  return new Response(JSON.stringify({candidates:[{content:{parts:[{text:JSON.stringify(result)}]}}]}),{status:200,headers:{'content-type':'application/json'}});
};
const post=body=>POST(new Request('https://example.invalid/api/analyze',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)}));
const image='A'.repeat(240);
const ch=await (await post({mode:'challenge',grade:9,topicId:'auto',image})).json();
assert.equal(ch.result.usable,true);
assert.equal(ch.result.topicId,'refraction');
assert.equal(totalCalls,2,'challenge + validator');
const fbResponse=await post({mode:'feedback',grade:9,challenge:ch.result,answer:'Bút vẫn nguyên, vì ánh sáng bị khúc xạ',history:[]});
const fb=await fbResponse.json();
assert.equal(fb.result.verdict,'solved');
assert.equal(totalCalls,3);
const out=await (await post({mode:'challenge',grade:8,topicId:'auto',image})).json();
assert.equal(out.result.usable,false,'Rejects topic outside of grade');
const invalid=await post({mode:'feedback',grade:10,answer:'hello',challenge:{topicId:'x'}});
assert.equal(invalid.status,400);
global.fetch=realFetch;
if(cleanKey)process.env.GEMINI_API_KEY=cleanKey;else delete process.env.GEMINI_API_KEY;
console.log('PASS: curriculum, demo, missing key, verified challenge, multi-turn feedback, wrong-grade rejection');
