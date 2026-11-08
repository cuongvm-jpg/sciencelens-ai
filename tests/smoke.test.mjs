import assert from 'node:assert/strict';
import {GET,POST} from '../api/analyze.js';
import {DEMOS} from '../shared/demo.js';

assert.ok(DEMOS.length>=3);
for(const item of DEMOS){
  for(const key of ['topicTitle','scene','claim','prompt','hint','experiment','truth'])assert.ok(item[key]);
}
const originalKey=process.env.GEMINI_API_KEY;
const originalModel=process.env.GEMINI_MODEL;
delete process.env.GEMINI_API_KEY;
const check=await (await GET()).json();
assert.equal(check.configured,false);
assert.equal(check.version,'3.2.0');
assert.equal(check.topicRestriction,false);
const req=body=>new Request('https://example.invalid/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
assert.equal((await POST(req({mode:'challenge',image:'A'.repeat(240)}))).status,503);

process.env.GEMINI_API_KEY='TEST_KEY_FAKE';
process.env.GEMINI_MODEL='gemini-test-model';
const originalFetch=global.fetch;
let calls=[];
global.fetch=async(url,options)=>{
  const p=JSON.parse(options.body);
  assert.ok(p.systemInstruction?.parts?.[0]?.text.includes('không có danh sách chủ đề giới hạn'));
  const task=p.contents[0].parts[0].text;
  calls.push({url,task,parts:p.contents[0].parts});
  const out=task.includes('Kiểm tra tính nhất quán')?{valid:true,reason:'đúng'}:
    task.includes('Quan sát ảnh vừa được gửi')?{
      usable:true,topicTitle:'Sinh học thực vật',scene:'Một chiếc lá',observation:'Chiếc lá xanh trên cành',icon:'🌿',
      claim:'Tớ nghĩ lá cây không cần ánh sáng để tạo chất dinh dưỡng!',
      prompt:'Cậu có đồng ý không?',hint:'Ánh sáng quan trọng thế nào?',
      experiment:'Quan sát cây ở nơi nhiều ánh sáng và ít ánh sáng; không làm hại cây.',
      truth:'Lá cây cần ánh sáng để quang hợp và tạo chất hữu cơ.'
    }:{reply:'Ồ, cậu nói đúng về quang hợp!',verdict:'solved',followUp:'Nếu thiếu ánh sáng, cây sẽ thế nào?',insight:'Thử quan sát cây thật.'};
  return new Response(JSON.stringify({candidates:[{content:{parts:[{text:JSON.stringify(out)}]}}]}),{status:200,headers:{'Content-Type':'application/json'}});
};
const image='A'.repeat(240);
const generated=await (await POST(req({mode:'challenge',image}))).json();
assert.equal(generated.result.usable,true);
assert.equal(generated.result.topicTitle,'Sinh học thực vật');
assert.equal(calls.length,2,'Một lượt tạo và một lượt kiểm duyệt');
assert.equal(calls[0].parts[1].inline_data.data,image);
assert.ok(!calls[0].task.includes('lớp 8'), 'Không đưa lớp vào prompt');
const feedback=await (await POST(req({mode:'feedback',challenge:generated.result,answer:'Lá cây quang hợp nhờ ánh sáng.',history:[]}))).json();
assert.equal(feedback.result.verdict,'solved');
assert.equal(calls.length,3);
assert.equal(calls[2].parts.length,1,'Lượt phản hồi không gửi lại ảnh');
const feedbackSolved=await (await POST(req({mode:'feedback',challenge:generated.result,alreadySolved:true,answer:'Còn nước thì sao?',history:[]}))).json();
assert.equal(feedbackSolved.result.verdict,'solved');
assert.equal((await POST(req({mode:'challenge',image:'invalid@'}))).status,400);
assert.equal((await POST(req({mode:'feedback',challenge:generated.result,answer:'',history:[]}))).status,400);

global.fetch=originalFetch;
if(originalKey)process.env.GEMINI_API_KEY=originalKey;else delete process.env.GEMINI_API_KEY;
if(originalModel)process.env.GEMINI_MODEL=originalModel;else delete process.env.GEMINI_MODEL;
console.log('PASS: không chọn lớp/chủ đề; ảnh đa lĩnh vực; tạo + kiểm duyệt; phản hồi nhiều lượt; không gửi lại ảnh; validation.');
