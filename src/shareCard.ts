import QRCode from 'qrcode';
import {items,price,format,displayQuantity,type Shared,type Mood} from './model';

export const APP_NAME='Worth it？珍的嗎';
// A short canonical website URL keeps the QR readable. The copy-link action carries complete results.
export const APP_URL='https://dragonjimmy-max.github.io/value-app2/';
export const QR_SIZE=240;
export type ShareStyle='fortune'|'milkTea'|'night';
export const shareStyles:{id:ShareStyle;name:string;description:string}[]=[
 {id:'fortune',name:'招財喜氣',description:'彩紙、金幣與來財文案'},
 {id:'milkTea',name:'珍奶日常',description:'奶茶泡泡與療癒文案'},
 {id:'night',name:'財富星空',description:'星光夜色與宇宙文案'},
];
function theme(style:ShareStyle,mood:Mood){
 const gain=mood==='gain';
 if(style==='milkTea')return {top:gain?'#8ed8c7':'#c9b4dc',bottom:gain?'#ffd8e6':'#f4e5f3',paper:'#fff9fc',ink:'#54394b',accent:gain?'#cf4f7b':'#80609a',soft:gain?'#d8f1e9':'#eadcf0',rowA:gain?'#e1f5ef':'#f2e8f5',rowB:gain?'#ffe7ef':'#eadff0',kicker:'珍奶日常 · 把心情換成一杯甜',title:gain?'今天甜到冒泡！':'今天有點苦苦的…',line:gain?'快樂加珍珠，財富也加倍。':'先喝口珍奶，再抱抱荷包。',section:gain?'這份甜，可以換成…':'這份小難過，等於…',scan:'掃一下，看看你的購買力！'};
 if(style==='night')return {top:gain?'#15264b':'#29233f',bottom:gain?'#4b376a':'#554264',paper:'#fffaff',ink:'#4d3b63',accent:gain?'#e29b31':'#8d72b5',soft:'#e9def4',rowA:'#f6effc',rowB:'#eee4f7',kicker:'財富宇宙 · 今晚的等值星球',title:gain?'財富值正在發光 ✦':'荷包星球暫時失聯',line:gain?'把今天的好運，送上宇宙。':'訊號微弱，但可愛依然在線。',section:gain?'這道星光，可以換成…':'這顆流星，等於飛走了…',scan:'掃一下，探索你的財富宇宙！'};
 return {top:gain?'#ffead4':'#e9e2fc',bottom:gain?'#fff9ec':'#f8f5ff',paper:gain?'#fffaf0':'#fffaff',ink:gain?'#6f4c32':'#6e567e',accent:gain?'#c96d20':'#8871b4',soft:gain?'#f7e2c2':'#e9ddf8',rowA:gain?'#f8ecda':'#f0e8fa',rowB:gain?'#fff7e9':'#f9f4ff',kicker:gain?'來財日記 · 牛市小確幸':'QQ 日記 · 今天需要抱抱',title:gain?'今天賺了！':'今天虧了… QQ',line:gain?'不是炫富，是快樂換了個單位。':'錢錢先去旅行了，快來安慰我。',section:gain?'這筆快樂，可以換成…':'這筆心痛，等於失去了…',scan:gain?'掃一下，換你曬快樂！':'掃一下，一起 QQ 一下。'};
}

async function mascot():Promise<HTMLImageElement>{
 const image=new Image();image.src=new URL(`${import.meta.env.BASE_URL}mascot.webp`,location.href).href;
 await image.decode();return image;
}
function rounded(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number,fill:string){ctx.fillStyle=fill;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
function fitted(ctx:CanvasRenderingContext2D,text:string,size:number,width:number){
 ctx.font=`600 ${size}px -apple-system, "Noto Sans TC", sans-serif`;
 while(ctx.measureText(text).width>width && size>14){size-=1;ctx.font=`600 ${size}px -apple-system, "Noto Sans TC", sans-serif`;}
}
function coin(ctx:CanvasRenderingContext2D,x:number,y:number,r:number){ctx.fillStyle='#ffd768';ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#e3a73c';ctx.lineWidth=4;ctx.stroke();ctx.fillStyle='#b77323';ctx.textAlign='center';ctx.font=`bold ${r}px sans-serif`;ctx.fillText('$',x,y+r*.35);}
function face(ctx:CanvasRenderingContext2D,mood:Mood){
 rounded(ctx,720,165,235,200,75,mood==='gain'?'#fff2d2':'#f0ebff');
 ctx.fillStyle='#4b3839';for(const x of [790,885]){ctx.beginPath();ctx.ellipse(x,245,11,16,0,0,Math.PI*2);ctx.fill();}
 ctx.strokeStyle='#4b3839';ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();
 if(mood==='gain'){
  // Friendly bull ears/horns and a broad smile.
  ctx.arc(838,272,32,0,Math.PI);ctx.stroke();ctx.fillStyle='#dfb785';
  for(const x of [740,927]){ctx.beginPath();ctx.moveTo(x,196);ctx.quadraticCurveTo(x-35,148,x+8,137);ctx.quadraticCurveTo(x-4,168,x+24,178);ctx.fill();}
  ctx.fillStyle='#f7ad9a';ctx.beginPath();ctx.ellipse(773,278,15,9,0,0,7);ctx.ellipse(902,278,15,9,0,0,7);ctx.fill();
 }else{
  ctx.arc(838,305,28,Math.PI,Math.PI*2);ctx.stroke();
  ctx.fillStyle='#8bb7ec';for(const x of [790,885]){ctx.beginPath();ctx.moveTo(x,265);ctx.bezierCurveTo(x-23,290,x-13,323,x,323);ctx.bezierCurveTo(x+13,323,x+23,290,x,265);ctx.fill();}
 }
}
export async function createShareCard(data:Shared,style:ShareStyle='fortune'):Promise<HTMLCanvasElement>{
 const mood=data.mood??'gain',gain=mood==='gain';
 const look=theme(style,mood);
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1000+data.rows.length*78;
 const ctx=canvas.getContext('2d');if(!ctx)throw Error('無法建立圖片');
 const bg=ctx.createLinearGradient(0,0,1080,canvas.height);bg.addColorStop(0,look.top);bg.addColorStop(1,look.bottom);ctx.fillStyle=bg;ctx.fillRect(0,0,1080,canvas.height);
 // Decorative confetti/raindrops are deterministic artwork, never simulated price data.
 for(let i=0;i<22;i++){const x=25+(i*157)%1030,y=30+(i*97)%430;ctx.fillStyle=style==='night'?['#ffd786','#b9d8ff','#d9bff2'][i%3]:style==='milkTea'?['#ef9b79','#ffe0a8','#8b533e'][i%3]:(gain?['#f29b71','#ffc951','#dd8e90'][i%3]:['#b5a0db','#b5c9ef','#d0bee6'][i%3]);ctx.globalAlpha=style==='night'?.85:.7;ctx.beginPath();ctx.arc(x,y,style==='milkTea'?5+(i%3)*3:4+(i%2)*3,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
 rounded(ctx,54,54,972,canvas.height-108,38,look.paper);
 ctx.textAlign='left';ctx.fillStyle=look.accent;ctx.font='600 24px sans-serif';ctx.fillText(look.kicker,98,116);
 ctx.fillStyle=look.ink;ctx.font='bold 64px sans-serif';ctx.fillText(look.title,98,210);
 const total=data.value*price(data.rows[data.source],data.prices);
 const amount=`${gain?'+':'−'} NT$ ${format(total)}`;fitted(ctx,amount,64,570);ctx.fillStyle=look.accent;ctx.fillText(amount,98,294);
 ctx.font='27px sans-serif';ctx.fillStyle=look.ink;ctx.fillText(look.line,98,350);
 face(ctx,mood);
 const image=await mascot();ctx.save();ctx.beginPath();ctx.roundRect(98,392,150,150,34);ctx.clip();ctx.drawImage(image,98,392,150,150);ctx.restore();
 if(gain){coin(ctx,964,412,20);coin(ctx,928,466,14);}else{ctx.fillStyle='#a895c8';ctx.font='bold 31px sans-serif';ctx.fillText('QQ',937,433);}
 ctx.textAlign='left';ctx.fillStyle=look.ink;ctx.font='600 30px sans-serif';ctx.fillText(look.section,280,450);
 ctx.font='23px sans-serif';ctx.fillStyle='#9b8996';ctx.fillText(gain?'等值換算，今天你最富！':'等值換算，今天你最負˃ ˄ ˂̥̥',280,496);
 const start=590;
 data.rows.forEach((id,i)=>{
  const item=items.find(x=>x.id===id)!,shown=displayQuantity(id,total/price(id,data.prices));const y=start+i*78;
  rounded(ctx,94,y-40,892,66,18,i%2?look.rowB:look.rowA);
  ctx.textAlign='left';ctx.fillStyle=look.ink;fitted(ctx,item.name,27,380);ctx.fillText(item.name,120,y);
  ctx.textAlign='right';const number=`${format(shown.value)} ${shown.unit}`;fitted(ctx,number,30,465);ctx.fillText(number,958,y);
 });
 const footerY=start+data.rows.length*78+36;
 rounded(ctx,94,footerY,892,300,26,look.soft);
 const qr=document.createElement('canvas');await QRCode.toCanvas(qr,APP_URL,{width:QR_SIZE,margin:4,errorCorrectionLevel:'M',color:{dark:'#241e2b',light:'#ffffff'}});
 ctx.drawImage(qr,716,footerY+30,QR_SIZE,QR_SIZE);
 ctx.textAlign='left';ctx.fillStyle=look.ink;ctx.font='bold 39px sans-serif';ctx.fillText(APP_NAME,120,footerY+70);
 ctx.font='25px sans-serif';ctx.fillText(look.scan,120,footerY+116);
 ctx.font='19px sans-serif';ctx.fillText('dragonjimmy-max.github.io/value-app2/',120,footerY+158);
 ctx.font='19px sans-serif';ctx.fillStyle='#887e8a';const dates=['etf','spy'].map(key=>`${key==='etf'?'0050':'SPY'} ${data.prices.market?.[key as 'etf'|'spy']?.date||'手動／示範'}`).join(' · ');fitted(ctx,dates,18,570);ctx.fillText(dates,120,footerY+210);
 fitted(ctx,`價格設定：${data.prices.updated}`,18,570);ctx.fillText(`價格設定：${data.prices.updated}`,120,footerY+250);
 return canvas;
}
