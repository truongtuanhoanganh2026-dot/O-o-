const express = require('express');
const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');
const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '20kb' }));
const server = http.createServer(app);
const io = new Server(server, { maxHttpBufferSize: 2e4 });
const HTML = "<!DOCTYPE html>\n<html lang=\"vi\"><head><meta charset=\"UTF-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no\">\n<title>Chat</title>\n<style>\n:root{--bg:#0b0b10;--p:#16161f;--ink:#fff;--mut:#9a9aab;--line:#2b2b38;--pink:#fe2c55;--cyan:#25f4ee;--ok:#34d27b}\n*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}\nhtml,body{height:100%;margin:0;overflow:hidden}\nbody{background:var(--bg);color:var(--ink);font:15px/1.4 system-ui,-apple-system,\"Segoe UI\",sans-serif;padding:env(safe-area-inset-top) 0 env(safe-area-inset-bottom)}\nbutton,input,textarea{font:inherit;color:inherit}\nbutton{background:#ffffff14;border:1px solid var(--line);border-radius:12px;padding:8px 12px;cursor:pointer}\ninput,textarea{background:#ffffff10;border:1px solid var(--line);border-radius:14px;padding:11px 13px;outline:0;min-width:0}\n.hide{display:none!important}.mut{color:var(--mut);font-size:13px}\n.go{background:linear-gradient(135deg,var(--pink),#ff6b8a);border:0;font-weight:800}\n.logo{font-size:42px;font-weight:900;letter-spacing:-2px;text-shadow:3px 3px 0 var(--pink),-3px -3px 0 var(--cyan)}\n#login{height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:12px;padding:24px;text-align:center}\n#login>*{max-width:320px;width:100%}\n.big{width:100%;padding:13px;border-radius:30px;font-weight:700}\n#fbb{background:#1877f2;border:0}\n#app{height:100%;display:flex;flex-direction:column;max-width:600px;margin:auto}\n#top{display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--p);border-bottom:1px solid var(--line)}\n#top b{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.pane{flex:1;min-height:0;display:flex;flex-direction:column}\n#nav{display:flex;background:var(--p);border-top:1px solid var(--line)}\n#nav button{flex:1;border:0;border-radius:0;background:none;padding:11px 0;font-size:13px;position:relative;color:var(--mut)}\n#nav button.on{color:#fff;font-weight:700;box-shadow:inset 0 2px 0 var(--pink)}\n.bd{position:absolute;top:4px;margin-left:4px;background:var(--pink);border-radius:10px;padding:0 6px;font-size:11px;color:#fff}\n.av{border-radius:50%;overflow:hidden;display:grid;place-items:center;font-weight:800;color:#000;flex:none;position:relative}.av img{width:100%;height:100%;object-fit:cover}\n.av.on::after{content:\"\";position:absolute;right:0;bottom:0;width:30%;height:30%;border-radius:50%;background:var(--ok);border:2px solid var(--p)}\n/* tin nhắn */\n#tabs{display:flex;gap:6px;overflow-x:auto;padding:8px;background:var(--p);border-bottom:1px solid var(--line)}\n.tb{display:flex;align-items:center;gap:6px;padding:5px 8px 5px 5px;border-radius:20px;background:#ffffff12;border:1px solid transparent;white-space:nowrap;flex:none;cursor:pointer;font-size:13px}\n.tb.on{border-color:var(--pink);background:#fe2c5522}.tb .x{opacity:.6;padding:0 3px}\n#convList{overflow-y:auto;flex:1}\n.row{display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid #ffffff0d}\n.row .g{flex:1;min-width:0}.row .g div{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n#msgs{flex:1;overflow-y:auto;padding:10px;display:flex;flex-direction:column;gap:6px}\n.m{max-width:80%;padding:7px 12px;border-radius:16px;background:#ffffff1c;overflow-wrap:anywhere;align-self:flex-start;white-space:pre-wrap}\n.m.me{align-self:flex-end;background:linear-gradient(135deg,var(--pink),#ff6b8a)}\n.m i{display:block;font-size:10px;opacity:.6;font-style:normal;margin-top:2px}\n.cmp{display:flex;gap:8px;padding:8px 10px;background:var(--p);border-top:1px solid var(--line)}.cmp input{flex:1}\n/* bạn bè */\n#fl{overflow-y:auto;flex:1}\n.sec{padding:12px 12px 4px;color:var(--mut);font-size:12px;font-weight:700;text-transform:uppercase}\n.mini{padding:6px 10px;font-size:13px;border-radius:10px}\n.fb{display:flex;gap:6px}\n#bc{position:sticky;bottom:0;padding:8px;background:var(--p);border-top:1px solid var(--line)}\n.ov{position:fixed;inset:0;background:#000b;display:grid;place-items:center;z-index:9;padding:18px}.ov>div{background:var(--p);border:1px solid var(--line);border-radius:18px;padding:16px;width:100%;max-width:420px}\ntextarea{width:100%;resize:none}\n/* phòng tiktok */\n#stage{flex:1;min-height:0;position:relative;overflow:auto;background:#000}\n#emb{padding:6px;display:flex;justify-content:center}#emb blockquote{margin:0!important}\n#fallback{padding:8px;text-align:center;color:var(--mut);font-size:13px}#fallback a{color:var(--cyan)}\n#chat{position:absolute;left:0;bottom:0;width:78%;max-height:44%;display:flex;flex-direction:column;justify-content:flex-end;pointer-events:none;padding:8px;gap:5px;overflow:hidden;-webkit-mask-image:linear-gradient(transparent,#000 28%);mask-image:linear-gradient(transparent,#000 28%)}\n.rm{align-self:flex-start;padding:5px 11px;border-radius:16px;background:#000a;font-size:14px;overflow-wrap:anywhere}.rm b{margin-right:6px}\n.rm.hl{background:linear-gradient(135deg,#ffb23d,#fe2c55);font-weight:600;box-shadow:0 0 14px #fe2c5599}\n.rm.pin{background:linear-gradient(135deg,#7c5cff,#25f4ee);color:#06121a;font-weight:700}\n#pinb{position:absolute;left:8px;right:8px;top:8px;z-index:3;border-radius:14px;padding:8px 12px;background:linear-gradient(135deg,#7c5cff,#25f4ee);color:#06121a;font-weight:700;overflow:hidden}#pinb i{position:absolute;left:0;bottom:0;height:3px;background:#06121a99;width:100%}\n#hearts{position:absolute;right:8px;bottom:0;width:60px;height:60%;pointer-events:none;overflow:hidden}\n.h{position:absolute;bottom:0;font-size:26px;animation:fl 2.2s ease-out forwards}@keyframes fl{to{transform:translate(var(--dx),-300px) scale(1.4);opacity:0}}\n.tiers{display:flex;gap:6px;padding:8px 10px 0;background:var(--p)}.tiers button{flex:1;font-size:12.5px;padding:7px 4px}\n.tiers button.on{border-color:transparent;font-weight:800}.tiers [data-t=normal].on{background:#ffffff33}.tiers [data-t=hl].on{background:linear-gradient(135deg,#ffb23d,#fe2c55)}.tiers [data-t=pin].on{background:linear-gradient(135deg,#7c5cff,#25f4ee);color:#06121a}.tiers button:disabled{opacity:.45}\n#err,#ferr{color:#ff8da1;font-size:12px;min-height:14px;padding:2px 12px}\n</style></head><body>\n<div id=\"login\">\n <div class=\"logo\">Chat</div><div class=\"mut\">Đăng nhập để kết bạn, theo dõi và nhắn tin nhiều người cùng lúc.</div>\n <div id=\"gbtn\" style=\"display:flex;justify-content:center\"></div>\n <button id=\"fbb\" class=\"big hide\">Tiếp tục với Facebook</button>\n <div id=\"guest\" class=\"hide\"><div class=\"mut\" style=\"margin-bottom:6px\">Chưa gắn Google/Facebook — đăng nhập thử:</div><input id=\"gn\" placeholder=\"Tên của bạn\" maxlength=\"20\" style=\"width:100%;margin-bottom:8px\"><button class=\"big go\" id=\"gb\">Vào thử</button></div>\n <div id=\"lerr\" style=\"color:#ff8da1;font-size:13px\"></div>\n</div>\n<div id=\"app\" class=\"hide\">\n <div id=\"top\"><div id=\"meav\"></div><b id=\"mename\"></b><span class=\"mut\" id=\"mehandle\"></span><button class=\"mini\" id=\"out\">Thoát</button></div>\n <div id=\"p-msg\" class=\"pane\"><div id=\"tabs\"></div><div id=\"convList\"></div>\n  <div id=\"conv\" class=\"pane hide\"><div id=\"msgs\"></div><div class=\"cmp\"><input id=\"mt\" placeholder=\"Nhắn tin…\" maxlength=\"500\" autocomplete=\"off\"><button id=\"ms\" class=\"go\">Gửi</button></div></div></div>\n <div id=\"p-fr\" class=\"pane hide\"><div class=\"cmp\" style=\"border:0;border-bottom:1px solid var(--line)\"><input id=\"sq\" placeholder=\"🔍 Tìm người theo tên hoặc ID…\" autocapitalize=\"none\"></div><div id=\"fl\"></div><div id=\"ferr\"></div>\n  <div id=\"bc\" class=\"hide\"><button class=\"go\" style=\"width:100%;padding:12px\" id=\"bcb\"></button></div></div>\n <div id=\"p-room\" class=\"pane hide\">\n  <div id=\"rin\" class=\"cmp\"><input id=\"uid\" placeholder=\"@tên_tiktok\" autocapitalize=\"none\"><button class=\"go\" id=\"renter\">Vào phòng</button></div>\n  <div id=\"rbox\" class=\"pane hide\"><div id=\"rbar\" class=\"cmp\" style=\"padding:6px 10px\"><b id=\"rid\" style=\"flex:1\"></b><span class=\"mut\">👁 <span id=\"vw\">1</span> · ❤ <span id=\"lk\">0</span></span></div>\n   <div id=\"stage\"><div id=\"emb\"></div><div id=\"fallback\"></div><div id=\"pinb\" class=\"hide\"><span id=\"pint\"></span><i id=\"pini\"></i></div><div id=\"chat\"></div><div id=\"hearts\"></div></div>\n   <div class=\"tiers\"><button data-t=\"normal\" class=\"on\">💬 Thường</button><button data-t=\"hl\" data-n=\"1\">✨ Nổi bật</button><button data-t=\"pin\" data-n=\"1\">📌 Ghim 30s</button></div>\n   <div class=\"cmp\"><input id=\"rt\" placeholder=\"Nhắn cho cả phòng…\" maxlength=\"150\" autocomplete=\"off\"><button id=\"rs\" class=\"go\">Gửi</button><button id=\"like\" style=\"border:0;background:none;font-size:26px\">❤️</button></div><div id=\"err\"></div></div></div>\n <div id=\"nav\"><button data-p=\"msg\" class=\"on\">💬 Tin nhắn<span class=\"bd hide\" id=\"ubd\"></span></button><button data-p=\"fr\">👥 Bạn bè</button><button data-p=\"room\">📺 Phòng TikTok</button></div>\n</div>\n<div id=\"bov\" class=\"ov hide\"><div><b id=\"bt\"></b><div class=\"mut\" id=\"bto\" style=\"margin:4px 0 8px\"></div><textarea id=\"bm\" rows=\"3\" maxlength=\"500\" placeholder=\"Nội dung gửi cho tất cả…\"></textarea><div class=\"fb\" style=\"margin-top:10px\"><button style=\"flex:1\" id=\"bx\">Hủy</button><button class=\"go\" style=\"flex:1\" id=\"bg\">Gửi cho tất cả</button></div></div></div>\n<script src=\"/socket.io/socket.io.js\"></script>\n<script>\nconst $=s=>document.querySelector(s),el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};\nconst hue=s=>{let h=0;for(const c of String(s))h=(h*31+c.charCodeAt(0))%360;return`hsl(${h} 80% 70%)`};\nlet T=localStorage.getItem('tk')||'',sock,me=null,F={following:[],followers:[],friends:[],recents:[]},UC={},open=[],act=null,M={},unread={},sel=new Set(),pane='msg',res=null,tier='normal',room='',cd={hl:0,pin:0},pinT=0;\nfunction av(u,sz=40,on=false){const d=el('div','av'+(on&&u.online?' on':''));d.style.width=d.style.height=sz+'px';if(u.pic){const i=el('img');i.src=u.pic;i.referrerPolicy='no-referrer';i.alt='';d.appendChild(i)}else{d.textContent=(u.name||'?')[0].toUpperCase();d.style.background=hue(u.name)}return d}\n/* ---------- đăng nhập ---------- */\nasync function post(kind,body){$('#lerr').textContent='';try{const r=await fetch('/api/auth/'+kind,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}),j=await r.json();if(!r.ok)throw new Error(j.error);T=j.token;localStorage.setItem('tk',T);start()}catch(e){$('#lerr').textContent=e.message}}\nasync function boot(){\n  if(T)return start();\n  const c=await(await fetch('/api/config')).json();\n  if(c.google){const s=el('script');s.src='https://accounts.google.com/gsi/client';s.async=true;s.onload=()=>{google.accounts.id.initialize({client_id:c.google,callback:r=>post('google',{credential:r.credential})});google.accounts.id.renderButton($('#gbtn'),{theme:'filled_black',size:'large',shape:'pill',text:'continue_with',width:280})};document.body.appendChild(s)}\n  if(c.fb){$('#fbb').classList.remove('hide');window.fbAsyncInit=()=>FB.init({appId:c.fb,version:'v19.0',cookie:false});const s=el('script');s.src='https://connect.facebook.net/vi_VN/sdk.js';s.async=true;document.body.appendChild(s);\n    $('#fbb').onclick=()=>FB.login(r=>r.authResponse&&post('facebook',{accessToken:r.authResponse.accessToken}),{scope:'public_profile'})}\n  if(c.guest)$('#guest').classList.remove('hide');\n}\n$('#gb').onclick=()=>post('guest',{name:$('#gn').value});\nfunction logout(){localStorage.removeItem('tk');location.reload()}$('#out').onclick=logout;\n/* ---------- kết nối ---------- */\nfunction start(){\n  $('#login').classList.add('hide');$('#app').classList.remove('hide');\n  sock=io({auth:{token:T}});\n  sock.on('connect_error',e=>{if(e.message==='unauthorized')logout()});\n  sock.on('me',u=>{me=u;$('#meav').replaceChildren(av(u,34));$('#mename').textContent=u.name;$('#mehandle').textContent='@'+u.handle});\n  sock.on('lists',d=>{F=d;[...d.following,...d.followers,...d.recents.map(r=>r.u)].forEach(u=>UC[u.id]=u);renderFr();renderConvList();renderTabs()});\n  sock.on('pres',p=>{['following','followers'].forEach(k=>F[k].forEach(u=>{if(u.id===p.id)u.online=p.online}));F.recents.forEach(r=>{if(r.u.id===p.id)r.u.online=p.online});renderFr();renderConvList();renderTabs()});\n  sock.on('dm',onDm);\n  sock.on('hist',d=>{$('#chat').replaceChildren();d.msgs.forEach(rmsg);rsys('Bạn đã vào phòng @'+room);$('#vw').textContent=d.viewers;$('#lk').textContent=d.likes;pin(d.pin)});\n  sock.on('rmsg',rmsg);sock.on('pin',pin);sock.on('viewers',n=>$('#vw').textContent=n);\n  sock.on('like',d=>{$('#lk').textContent=d.total;for(let i=0;i<Math.min(d.n,3);i++)heart()});\n  sock.on('connect',()=>room&&sock.emit('join',{room}));\n}\n/* ---------- điều hướng ---------- */\ndocument.querySelectorAll('#nav [data-p]').forEach(b=>b.onclick=()=>go(b.dataset.p));\nfunction go(p){pane=p;document.querySelectorAll('#nav [data-p]').forEach(b=>b.classList.toggle('on',b.dataset.p===p));['msg','fr','room'].forEach(x=>$('#p-'+x).classList.toggle('hide',x!==p));if(p==='msg'&&act)unread[act]=0;badges()}\nfunction badges(){const n=Object.values(unread).reduce((a,b)=>a+b,0),b=$('#ubd');b.textContent=n;b.classList.toggle('hide',!n)}\n/* ---------- tin nhắn nhiều cuộc cùng lúc ---------- */\nfunction rtime(t){return new Date(t).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}\nfunction openChat(id){\n  if(!open.includes(id)){open.push(id);if(open.length>8){const o=open.shift();if(o===act)act=null}}\n  act=id;unread[id]=0;go('msg');renderTabs();showConv();\n  if(!M[id])sock.emit('hist',id,d=>{if(!d)return;UC[id]=d.u;M[id]=d.msgs;renderTabs();if(act===id)showConv()});\n}\nfunction closeChat(id){open=open.filter(x=>x!==id);if(act===id)act=null;renderTabs();showConv()}\nfunction renderTabs(){const t=$('#tabs');t.replaceChildren();\n  const plus=el('div','tb'+(act?'':' on'),'☰ Gần đây');plus.onclick=()=>{act=null;renderTabs();showConv()};t.appendChild(plus);\n  open.forEach(id=>{const u=UC[id]||{name:'…',id},d=el('div','tb'+(act===id?' on':''));d.appendChild(av(u,24,true));d.appendChild(el('span',null,u.name));\n    if(unread[id])d.appendChild(el('span','bd',unread[id])).style.position='static';\n    const x=el('span','x','✕');x.onclick=e=>{e.stopPropagation();closeChat(id)};d.appendChild(x);d.onclick=()=>{act=id;unread[id]=0;renderTabs();showConv();badges()};t.appendChild(d)});badges()}\nfunction renderConvList(){const c=$('#convList');c.replaceChildren();\n  if(!F.recents.length){c.appendChild(el('div','sec','Chưa có cuộc trò chuyện nào'));c.appendChild(el('div','mut','Vào tab Bạn bè → theo dõi một người → bấm 💬 để nhắn. Có thể mở nhiều cuộc trò chuyện cùng lúc.')).style.padding='0 12px';return}\n  c.appendChild(el('div','sec','Gần đây'));\n  F.recents.forEach(r=>{const w=el('div','row');w.appendChild(av(r.u,44,true));const g=el('div','g');g.appendChild(el('div',null,r.u.name)).style.fontWeight='700';g.appendChild(el('div','mut',(r.mine?'Bạn: ':'')+r.text));w.appendChild(g);w.appendChild(el('div','mut',rtime(r.t)));w.onclick=()=>openChat(r.u.id);c.appendChild(w)})}\nfunction showConv(){const on=!!act;$('#conv').classList.toggle('hide',!on);$('#convList').classList.toggle('hide',on);if(!on)return;drawMsgs()}\nfunction drawMsgs(){const b=$('#msgs');b.replaceChildren();(M[act]||[]).forEach(addBubble);b.scrollTop=b.scrollHeight}\nfunction addBubble(m){const d=el('div','m'+(m.from===me.id?' me':''),m.text);d.appendChild(el('i',null,rtime(m.t)));$('#msgs').appendChild(d)}\nfunction onDm(m){const o=m.from===me.id?m.to:m.from;if(m.u)UC[m.from]=m.u;\n  if(!open.includes(o)){open.push(o);if(open.length>8)open.shift()}\n  if(M[o])M[o].push(m);\n  if(o===act&&pane==='msg'){addBubble(m);$('#msgs').scrollTop=1e9}else if(m.from!==me.id){unread[o]=(unread[o]||0)+1;if(!act&&!M[o])sock.emit('hist',o,d=>{if(d){M[o]=d.msgs}})}\n  renderTabs()}\nfunction sendDm(){const t=$('#mt').value.trim();if(!t||!act)return;sock.emit('dm',{to:act,text:t},r=>{if(r&&r.ok)$('#mt').value='';else alert(r&&r.err||'Không gửi được')})}\n$('#ms').onclick=sendDm;$('#mt').onkeydown=e=>e.key==='Enter'&&sendDm();\n/* ---------- bạn bè / theo dõi / nhắn nhiều người ---------- */\nlet sTimer;$('#sq').oninput=e=>{clearTimeout(sTimer);const q=e.target.value.trim();if(q.length<2){res=null;return renderFr()}sTimer=setTimeout(()=>sock.emit('search',q,r=>{res=r;renderFr()}),250)};\nfunction frow(u,flags){const w=el('div','row');\n  const ck=el('input');ck.type='checkbox';ck.checked=sel.has(u.id);ck.style.cssText='width:18px;height:18px';ck.disabled=!flags.following;ck.title=flags.following?'Chọn để nhắn nhiều người':'Theo dõi để chọn';ck.onchange=()=>{ck.checked?sel.add(u.id):sel.delete(u.id);renderBc()};w.appendChild(ck);\n  w.appendChild(av(u,42,true));const g=el('div','g');g.appendChild(el('div',null,u.name)).style.fontWeight='700';g.appendChild(el('div','mut','@'+u.handle+(flags.friend?' · bạn bè':flags.followsMe?' · đang theo dõi bạn':'')));w.appendChild(g);\n  const b=el('div','fb');\n  if(flags.following){const c=el('button','mini go','💬');c.onclick=()=>openChat(u.id);b.appendChild(c);const f=el('button','mini','Bỏ theo dõi');f.onclick=()=>{sel.delete(u.id);sock.emit('unfollow',u.id)};b.appendChild(f)}\n  else{const f=el('button','mini go',flags.followsMe?'Theo dõi lại':'Theo dõi');f.onclick=()=>sock.emit('follow',u.id,()=>{if(res)sock.emit('search',$('#sq').value.trim(),r=>{res=r;renderFr()})});b.appendChild(f)}\n  w.appendChild(b);return w}\nfunction renderFr(){const l=$('#fl');l.replaceChildren();if(!me)return;const fs=new Set(F.friends),fo=new Set(F.following.map(u=>u.id)),fw=new Set(F.followers.map(u=>u.id));\n  if(res){l.appendChild(el('div','sec','Kết quả tìm kiếm'));if(!res.length)l.appendChild(el('div','mut','Không có ai khớp.')).style.padding='0 12px';res.forEach(u=>l.appendChild(frow(u,{following:u.following,friend:u.following&&u.followsMe,followsMe:u.followsMe})));return renderBc()}\n  const fr=F.following.filter(u=>fs.has(u.id)),onlyFo=F.following.filter(u=>!fs.has(u.id)),onlyFw=F.followers.filter(u=>!fo.has(u.id));\n  l.appendChild(el('div','sec','Bạn bè ('+fr.length+')'));fr.forEach(u=>l.appendChild(frow(u,{following:1,friend:1})));\n  l.appendChild(el('div','sec','Đang theo dõi ('+onlyFo.length+')'));onlyFo.forEach(u=>l.appendChild(frow(u,{following:1})));\n  l.appendChild(el('div','sec','Người theo dõi bạn ('+onlyFw.length+')'));onlyFw.forEach(u=>l.appendChild(frow(u,{following:0,followsMe:1})));\n  if(!F.following.length&&!F.followers.length)l.appendChild(el('div','mut','Gõ tên hoặc ID vào ô tìm kiếm để tìm người và theo dõi.')).style.padding='8px 12px';renderBc()}\nfunction renderBc(){[...sel].forEach(i=>{if(!F.following.some(u=>u.id===i))sel.delete(i)});const b=$('#bc');b.classList.toggle('hide',!sel.size);$('#bcb').textContent='📣 Nhắn '+sel.size+' người cùng lúc'}\n$('#bcb').onclick=()=>{$('#bt').textContent='Nhắn '+sel.size+' người cùng lúc';$('#bto').textContent=[...sel].map(i=>(UC[i]||{}).name).join(', ');$('#bm').value='';$('#bov').classList.remove('hide')};\n$('#bx').onclick=()=>$('#bov').classList.add('hide');\n$('#bg').onclick=()=>{const t=$('#bm').value.trim();if(!t)return;sock.emit('dm',{to:[...sel],text:t},r=>{if(r&&r.ok){$('#bov').classList.add('hide');sel.clear();renderFr();$('#ferr').textContent='Đã gửi cho '+r.sent+' người ✔'+(r.skipped?` (bỏ qua ${r.skipped})`:'');setTimeout(()=>$('#ferr').textContent='',4000)}else alert(r&&r.err||'Không gửi được')})};\n/* ---------- phòng TikTok ---------- */\nconst norm=s=>String(s||'').toLowerCase().replace(/^@/,'').replace(/[^a-z0-9._]/g,'').slice(0,24);\nfunction enter(id){id=norm(id);if(!id)return;room=id;$('#rin').classList.add('hide');$('#rbox').classList.remove('hide');$('#rid').textContent='@'+id;$('#chat').replaceChildren();\n  $('#emb').innerHTML=`<blockquote class=\"tiktok-embed\" cite=\"https://www.tiktok.com/@${id}\" data-unique-id=\"${id}\" data-embed-type=\"creator\" style=\"max-width:780px;min-width:288px\"><section><a target=\"_blank\" rel=\"noopener\" href=\"https://www.tiktok.com/@${id}?refer=creator_embed\">@${id}</a></section></blockquote>`;\n  $('#fallback').innerHTML=`Không hiện trang? <a target=\"_blank\" rel=\"noopener\" href=\"https://www.tiktok.com/@${id}\">Mở @${id} trên TikTok</a> · <a target=\"_blank\" rel=\"noopener\" href=\"https://www.tiktok.com/@${id}/live\">📺 Xem LIVE</a> · <a href=\"#\" id=\"rleave\">Rời phòng</a>`;\n  $('#rleave').onclick=e=>{e.preventDefault();sock.emit('leave');room='';$('#emb').replaceChildren();$('#rin').classList.remove('hide');$('#rbox').classList.add('hide')};\n  const o=document.getElementById('tkjs');if(o)o.remove();const s=el('script');s.id='tkjs';s.async=true;s.src='https://www.tiktok.com/embed.js';document.body.appendChild(s);\n  sock.emit('join',{room:id,name:me&&me.name})}\n$('#renter').onclick=()=>enter($('#uid').value);$('#uid').onkeydown=e=>e.key==='Enter'&&enter($('#uid').value);\nfunction rmsg(m){const c=$('#chat'),d=el('div','rm '+(m.tier==='normal'?'':m.tier)),b=el('b',null,m.name);if(m.tier==='normal')b.style.color=hue(m.name);d.appendChild(b);d.appendChild(document.createTextNode(m.text));c.appendChild(d);while(c.children.length>40)c.firstChild.remove()}\nfunction rsys(t){const d=el('div','rm',t);d.style.cssText='background:none;color:var(--mut);font-size:12px';$('#chat').appendChild(d)}\nfunction pin(p){clearInterval(pinT);const b=$('#pinb');if(!p||p.until<=Date.now()){b.classList.add('hide');return}b.classList.remove('hide');$('#pint').textContent='📌 '+p.name+': '+p.text;const tot=p.until-Date.now();pinT=setInterval(()=>{const l=p.until-Date.now();if(l<=0){b.classList.add('hide');clearInterval(pinT)}else $('#pini').style.width=l/tot*100+'%'},200)}\nfunction heart(){const h=el('div','h',['❤️','💖','💗','🧡','💜'][Math.random()*5|0]);h.style.left=Math.random()*30+'px';h.style.setProperty('--dx',(Math.random()*40-20)+'px');$('#hearts').appendChild(h);setTimeout(()=>h.remove(),2300)}\ndocument.querySelectorAll('.tiers button').forEach(b=>b.onclick=()=>{if(b.disabled)return;tier=b.dataset.t;document.querySelectorAll('.tiers button').forEach(x=>x.classList.toggle('on',x===b))});\nfunction rsend(){const t=$('#rt').value.trim();if(!t||!room)return;$('#err').textContent='';sock.emit('msg',{text:t,tier},r=>{if(!r)return;if(r.ok){$('#rt').value='';if(r.cd)cd[tier]=Date.now()+r.cd}else{$('#err').textContent=r.err||'';if(r.wait)cd[tier]=Date.now()+r.wait}})}\n$('#rs').onclick=rsend;$('#rt').onkeydown=e=>e.key==='Enter'&&rsend();\nlet lt=0;$('#like').onclick=()=>{const n=Date.now();if(n-lt<120)return;lt=n;heart();sock&&sock.emit('like')};\nsetInterval(()=>document.querySelectorAll('.tiers button[data-n]').forEach(b=>{const l=cd[b.dataset.t]-Date.now();b.disabled=l>0;b.textContent=l>0?`⏳ ${Math.ceil(l/1000)}s`:(b.dataset.t==='hl'?'✨ Nổi bật':'📌 Ghim 30s');if(l>0&&tier===b.dataset.t){tier='normal';document.querySelector('.tiers [data-t=normal]').classList.add('on');b.classList.remove('on')}}),500);\nboot();\n</script></body></html>\n";

const GOOGLE_ID = process.env.GOOGLE_CLIENT_ID || '';
const FB_ID = process.env.FB_APP_ID || '', FB_SECRET = process.env.FB_APP_SECRET || '';
const GUEST = !GOOGLE_ID && !FB_ID ? true : process.env.ALLOW_GUEST === '1';

/* ================= Lưu trữ (file JSON; bản Render miễn phí sẽ mất khi khởi động lại → nên dùng database) ================= */
const FILE = path.join(__dirname, 'db.json');
let DB = { users: {}, sessions: {}, dms: {} };
try { DB = Object.assign(DB, JSON.parse(fs.readFileSync(FILE, 'utf8'))); } catch {}
let st; const save = () => { clearTimeout(st); st = setTimeout(() => fs.writeFile(FILE, JSON.stringify(DB), () => {}), 600); };
const pub = (u) => ({ id: u.id, name: u.name, pic: u.pic || '', handle: u.handle });
const slug = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase().replace(/[^a-z0-9]/g, '');
function mkHandle(name) {
  const b = (slug(name).slice(0, 12) || 'user'); let h;
  do { h = b + Math.floor(100 + Math.random() * 900); } while (Object.values(DB.users).some((u) => u.handle === h));
  return h;
}
function upsert(kind, ext, name, pic) {
  const id = kind + ':' + ext;
  name = String(name || 'Người dùng').replace(/[<>]/g, '').slice(0, 30);
  const u = DB.users[id] || (DB.users[id] = { id, name, pic: '', handle: mkHandle(name), follows: [] });
  u.name = name; if (pic && /^https:\/\//.test(pic)) u.pic = pic.slice(0, 400);
  save(); return u;
}
function session(uid) { const t = crypto.randomBytes(24).toString('hex'); DB.sessions[t] = uid; save(); return t; }

/* ================= Xác minh đăng nhập ================= */
const b64 = (s) => Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
function verifyJwt(tok, keys, aud) {   // RS256 do Google ký
  const [h, p, sig] = String(tok).split('.');
  if (!sig) throw new Error('Token sai.');
  const head = JSON.parse(b64(h)), pay = JSON.parse(b64(p));
  const key = keys.find((k) => k.kid === head.kid);
  if (!key || head.alg !== 'RS256') throw new Error('Khóa không hợp lệ.');
  const ok = crypto.verify('RSA-SHA256', Buffer.from(h + '.' + p), crypto.createPublicKey({ key, format: 'jwk' }), b64(sig));
  if (!ok || !['accounts.google.com', 'https://accounts.google.com'].includes(pay.iss) || pay.aud !== aud || pay.exp * 1000 < Date.now()) throw new Error('Token không hợp lệ.');
  return pay;
}
let certs = null, certsT = 0;
async function googleKeys() {
  if (certs && Date.now() - certsT < 36e5) return certs;
  certs = (await (await fetch('https://www.googleapis.com/oauth2/v3/certs')).json()).keys; certsT = Date.now(); return certs;
}
async function verifyFacebook(tok) {
  const dbg = await (await fetch(`https://graph.facebook.com/debug_token?input_token=${encodeURIComponent(tok)}&access_token=${encodeURIComponent(FB_ID + '|' + FB_SECRET)}`)).json();
  if (!dbg.data || !dbg.data.is_valid || dbg.data.app_id !== FB_ID) throw new Error('Token Facebook không hợp lệ.');
  return (await fetch(`https://graph.facebook.com/me?fields=id,name,picture.type(large)&access_token=${encodeURIComponent(tok)}`)).json();
}
const ah = {};
const authLimited = (ip) => { const n = Date.now(); ah[ip] = (ah[ip] || []).filter((t) => t > n - 6e4); if (ah[ip].length >= 15) return true; ah[ip].push(n); return false; };
const authRoute = (fn) => async (req, res) => {
  if (authLimited(req.ip)) return res.status(429).json({ error: 'Thử lại sau ít phút.' });
  try { const u = await fn(req.body || {}); res.json({ token: session(u.id) }); }
  catch (e) { res.status(400).json({ error: e.message || 'Đăng nhập thất bại.' }); }
};
app.get('/', (req, res) => res.type('html').send(HTML));
app.get('/health', (req, res) => res.send('ok'));
app.get('/api/config', (req, res) => res.json({ google: GOOGLE_ID || null, fb: FB_ID && FB_SECRET ? FB_ID : null, guest: GUEST }));
app.post('/api/auth/google', authRoute(async (b) => {
  if (!GOOGLE_ID) throw new Error('Chưa cấu hình Google.');
  const p = verifyJwt(b.credential, await googleKeys(), GOOGLE_ID);
  return upsert('g', p.sub, p.name || (p.email || '').split('@')[0], p.picture);
}));
app.post('/api/auth/facebook', authRoute(async (b) => {
  if (!FB_ID || !FB_SECRET) throw new Error('Chưa cấu hình Facebook.');
  const me = await verifyFacebook(String(b.accessToken || ''));
  if (!me.id) throw new Error('Không lấy được hồ sơ Facebook.');
  return upsert('f', me.id, me.name, me.picture && me.picture.data && me.picture.data.url);
}));
app.post('/api/auth/guest', authRoute(async (b) => {
  if (!GUEST) throw new Error('Đăng nhập thử đang tắt.');
  const name = String(b.name || '').trim().slice(0, 20);
  if (!name) throw new Error('Nhập tên của bạn.');
  return upsert('x', crypto.randomBytes(6).toString('hex'), name, '');
}));

/* ================= Danh sách, theo dõi, tin nhắn ================= */
const room = (id) => 'u:' + id;
const isOnline = (id) => (io.sockets.adapter.rooms.get(room(id)) || { size: 0 }).size > 0;
const convKey = (a, b) => [a, b].sort().join('|');
const view = (u) => ({ ...pub(u), online: isOnline(u.id) });
function lists(uid) {
  const me = DB.users[uid];
  const following = me.follows.map((i) => DB.users[i]).filter(Boolean);
  const followers = Object.values(DB.users).filter((u) => u.follows.includes(uid));
  const fset = new Set(me.follows);
  const friends = followers.filter((u) => fset.has(u.id)).map((u) => u.id);
  const recents = Object.keys(DB.dms).filter((k) => k.split('|').includes(uid)).map((k) => {
    const arr = DB.dms[k], last = arr[arr.length - 1], other = DB.users[k.split('|').find((x) => x !== uid)];
    return other && last ? { u: view(other), text: last.text, t: last.t, mine: last.from === uid } : null;
  }).filter(Boolean).sort((a, b) => b.t - a.t).slice(0, 30);
  return { following: following.map(view), followers: followers.map(view), friends, recents };
}
const push = (uid) => DB.users[uid] && io.to(room(uid)).emit('lists', lists(uid));
const clean = (s, n) => String(s || '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f<>]/g, '').trim().slice(0, n);
function presence(uid, on) {
  const me = DB.users[uid]; if (!me) return;
  const rel = new Set([...me.follows, ...Object.values(DB.users).filter((u) => u.follows.includes(uid)).map((u) => u.id)]);
  rel.forEach((id) => io.to(room(id)).emit('pres', { id: uid, online: on }));
}

/* ================= Phòng chat TikTok (khách vẫn vào được) ================= */
const TIERS = { normal: { cd: 2000, max: 150 }, hl: { cd: 20000, max: 120 }, pin: { cd: 90000, max: 100 } };
const PIN_MS = 30000, rooms = new Map();
const norm = (s) => String(s || '').toLowerCase().replace(/^@/, '').replace(/[^a-z0-9._]/g, '').slice(0, 24);
const getRoom = (id) => { if (!rooms.has(id)) rooms.set(id, { msgs: [], pin: null, likes: 0 }); return rooms.get(id); };
const viewers = (id) => (io.sockets.adapter.rooms.get('r:' + id) || { size: 0 }).size;
function leaveRoom(s) {
  if (!s.room) return; const id = s.room; s.leave('r:' + id); s.room = null;
  io.to('r:' + id).emit('viewers', viewers(id));
  if (!viewers(id)) setTimeout(() => { if (!viewers(id)) rooms.delete(id); }, 6e5);
}

io.use((s, next) => { const uid = DB.sessions[(s.handshake.auth || {}).token]; s.uid = uid && DB.users[uid] ? uid : null; next(); });

io.on('connection', (s) => {
  s.cd = { hl: 0, pin: 0 }; s.stamps = []; s.likeT = 0; s.dmStamps = [];
  const uid = s.uid, need = (cb) => { if (!uid) { typeof cb === 'function' && cb({ ok: false, err: 'Cần đăng nhập.' }); return false; } return true; };
  if (uid) {
    s.join(room(uid));
    s.emit('me', pub(DB.users[uid])); s.emit('lists', lists(uid));
    if (io.sockets.adapter.rooms.get(room(uid)).size === 1) presence(uid, true);
  }

  s.on('search', (q, cb) => {
    if (!need(cb) || typeof cb !== 'function') return;
    q = slug(q); if (q.length < 2) return cb([]);
    const me = DB.users[uid];
    cb(Object.values(DB.users).filter((u) => u.id !== uid && (u.handle.startsWith(q) || slug(u.name).includes(q))).slice(0, 12)
      .map((u) => ({ ...view(u), following: me.follows.includes(u.id), followsMe: u.follows.includes(uid) })));
  });
  s.on('follow', (id, cb) => {
    if (!need(cb)) return; const me = DB.users[uid];
    if (!DB.users[id] || id === uid) return cb && cb({ ok: false });
    if (!me.follows.includes(id) && me.follows.length < 500) me.follows.push(id);
    save(); push(uid); push(id); cb && cb({ ok: true });
  });
  s.on('unfollow', (id, cb) => {
    if (!need(cb)) return; const me = DB.users[uid];
    me.follows = me.follows.filter((x) => x !== id); save(); push(uid); push(id); cb && cb({ ok: true });
  });
  s.on('hist', (id, cb) => {
    if (!need(cb) || typeof cb !== 'function' || !DB.users[id]) return;
    cb({ u: view(DB.users[id]), msgs: (DB.dms[convKey(uid, id)] || []).slice(-100) });
  });
  s.on('dm', (p, cb) => {
    const reply = typeof cb === 'function' ? cb : () => {};
    if (!need(reply) || !p) return;
    const to = [...new Set(Array.isArray(p.to) ? p.to : [p.to])].filter((x) => typeof x === 'string' && x !== uid).slice(0, 10);
    const text = clean(p.text, 500);
    if (!to.length || !text) return reply({ ok: false, err: 'Thiếu người nhận hoặc nội dung.' });
    const now = Date.now(); s.dmStamps = s.dmStamps.filter((t) => t > now - 10000);
    if (s.dmStamps.length + to.length > 20) return reply({ ok: false, err: 'Bạn nhắn nhanh quá, chờ chút nhé.' });
    const me = DB.users[uid]; let sent = 0;
    for (const id of to) {
      if (!DB.users[id] || !me.follows.includes(id)) continue;   // chỉ nhắn người mình đang theo dõi / bạn bè
      const m = { id: now + '-' + Math.random().toString(36).slice(2, 7), from: uid, to: id, text, t: now };
      const k = convKey(uid, id), arr = DB.dms[k] || (DB.dms[k] = []);
      arr.push(m); if (arr.length > 200) arr.shift();
      const out = { ...m, u: pub(me) };
      io.to(room(uid)).to(room(id)).emit('dm', out);
      push(id); sent++; s.dmStamps.push(now);
    }
    if (sent) { save(); push(uid); }
    reply(sent ? { ok: true, sent, skipped: to.length - sent } : { ok: false, err: 'Hãy theo dõi người đó trước khi nhắn.' });
  });

  /* ---- phòng TikTok ---- */
  s.on('join', (p) => {
    const id = norm(p && p.room); if (!id) return; leaveRoom(s);
    s.room = id; s.join('r:' + id);
    s.nick = uid ? DB.users[uid].name : (clean(p.name, 16) || 'Khách' + (100 + Math.floor(Math.random() * 900)));
    const r = getRoom(id); if (r.pin && r.pin.until <= Date.now()) r.pin = null;
    s.emit('hist', { msgs: r.msgs.slice(-30), pin: r.pin, viewers: viewers(id), likes: r.likes });
    io.to('r:' + id).emit('viewers', viewers(id));
  });
  s.on('msg', (p, ack) => {
    const reply = typeof ack === 'function' ? ack : () => {};
    if (!s.room || !p) return reply({ ok: false, err: 'Chưa vào phòng.' });
    const tier = TIERS[p.tier] ? p.tier : 'normal', T = TIERS[tier], now = Date.now();
    s.stamps = s.stamps.filter((t) => t > now - 6000);
    if (s.stamps.length >= 5) return reply({ ok: false, err: 'Bạn nhắn nhanh quá, chậm lại chút nhé.' });
    if (tier !== 'normal' && s.cd[tier] > now) return reply({ ok: false, err: 'Mức này đang hồi chiêu.', wait: s.cd[tier] - now });
    if (tier === 'normal' && s.stamps.length && now - s.stamps[s.stamps.length - 1] < 800) return reply({ ok: false, err: 'Đợi một chút nhé.' });
    const text = clean(p.text, T.max); if (!text) return reply({ ok: false, err: 'Tin nhắn trống.' });
    s.stamps.push(now); if (tier !== 'normal') s.cd[tier] = now + T.cd;
    const m = { id: now + '-' + Math.random().toString(36).slice(2, 6), name: s.nick, text, tier, t: now }, r = getRoom(s.room);
    r.msgs.push(m); if (r.msgs.length > 60) r.msgs.shift();
    io.to('r:' + s.room).emit('rmsg', m);
    if (tier === 'pin') {
      r.pin = { ...m, until: now + PIN_MS }; io.to('r:' + s.room).emit('pin', r.pin);
      const id = s.room, pid = m.id;
      setTimeout(() => { const rr = rooms.get(id); if (rr && rr.pin && rr.pin.id === pid) { rr.pin = null; io.to('r:' + id).emit('pin', null); } }, PIN_MS);
    }
    reply({ ok: true, cd: tier === 'normal' ? 0 : T.cd });
  });
  s.on('like', () => {
    if (!s.room) return; const n = Date.now(); if (n - s.likeT < 100) return; s.likeT = n;
    const r = getRoom(s.room); r.likes++;
    io.to('r:' + s.room).except(s.id).emit('like', { n: 1, total: r.likes }); s.emit('like', { n: 0, total: r.likes });
  });
  s.on('leave', () => leaveRoom(s));
  s.on('disconnect', () => { leaveRoom(s); if (uid && !isOnline(uid)) presence(uid, false); });
});

const PORT = process.env.PORT || 3000;
if (require.main === module) server.listen(PORT, () => console.log('Chat chạy tại cổng ' + PORT));
else module.exports = { verifyJwt, slug };
