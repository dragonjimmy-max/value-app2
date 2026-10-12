export const items = [
 {id:'twd',name:'台幣',unit:'元',icon:'🇹🇼'},
 {id:'usd',name:'美元/USDT',unit:'USD/USDT',icon:'🇺🇸'},
 {id:'rice',name:'滷肉飯',unit:'碗',icon:'🍚'},
 {id:'tea',name:'珍奶',unit:'杯',icon:'🧋'},
 {id:'bigmac',name:'大麥克',unit:'個',icon:'🍔'},
 {id:'0050',name:'0050 元大台灣50',unit:'股',icon:'📈'},
 {id:'spy',name:'標普500（SPY）',unit:'股',icon:'🌎'},
 {id:'iphone',name:'iPhone 18',unit:'支',icon:'📱'},
 {id:'lv',name:'LV 包包',unit:'個',icon:'👜'},
 {id:'gold',name:'一桶金',unit:'桶',icon:'💰'},
] as const;
export type Id = typeof items[number]['id'];
export type MarketKey='etf'|'spy'|'fx';
export type PriceMeta={mode:'auto'|'manual'|'shared';source:string;date:string};
export type Prices = {lv?:number;market?:Partial<Record<MarketKey,PriceMeta>>;fx:number;iphone:number;bigmac:number;etf:number;spy:number;rice:number;tea:number;model:string;capacity:string;updated:string};
export const defaults:Prices = {lv:150000,fx:32,iphone:39900,bigmac:85,etf:60,spy:600,rice:50,tea:65,model:'iPhone 18（示範規格）',capacity:'256 GB',updated:'示範值，尚未設定'};
export const isId = (x:unknown):x is Id => items.some(i=>i.id===x);
export function validPrices(x:unknown):x is Prices {
 if(!x || typeof x!=='object') return false;
 const p=x as Prices;
 return (p.lv===undefined || (typeof p.lv==='number' && Number.isFinite(p.lv) && p.lv>=1e-12 && p.lv<=1e15)) && (p.market===undefined || validMarketMeta(p.market)) && ['fx','iphone','bigmac','etf','spy','rice','tea'].every(k=>typeof p[k as keyof Prices]==='number' && Number.isFinite(p[k as keyof Prices]) && Number(p[k as keyof Prices])>=1e-12 && Number(p[k as keyof Prices])<=1e15) && [p.model,p.capacity,p.updated].every(s=>typeof s==='string' && s.length<=100);
}
export function validMarketMeta(m:unknown):boolean{if(!m||typeof m!=='object'||Array.isArray(m))return false;return Object.entries(m).every(([key,meta])=>['etf','spy','fx'].includes(key)&&meta&&typeof meta==='object'&&['auto','manual','shared'].includes(meta.mode)&&typeof meta.source==='string'&&meta.source.length<=100&&typeof meta.date==='string'&&(meta.date===''||(/^\d{4}-\d{2}-\d{2}$/.test(meta.date)&&Number.isFinite(Date.parse(meta.date)))));}
export function price(id:Id,p:Prices):number {return ({twd:1,usd:p.fx,iphone:p.iphone,bigmac:p.bigmac,'0050':p.etf,spy:p.spy*p.fx,rice:p.rice,tea:p.tea,gold:1000000,lv:p.lv??150000})[id];}
export function parseNumber(s:string):number|null {
 const clean=s.replace(/,/g,'').trim();
 if(!/^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(clean)) return null;
 const n=Number(clean); return Number.isFinite(n)&&n>=0&&n<=1e15?n:null;
}
export function format(n:number) {return n===0?'0': Math.abs(n)<0.000001 || Math.abs(n)>=1e12?n.toExponential(6):new Intl.NumberFormat('zh-TW',{maximumFractionDigits:6}).format(n);}
// Canonical ETF quantities remain shares; only presentation changes to lots.
export function displayQuantity(id:Id,quantity:number) {
 const item=items.find(i=>i.id===id)!;
 const multiplier=id==='0050' && quantity>1000 ? 1000 : 1;
 return {value:quantity/multiplier,unit:multiplier===1000?'張':item.unit,multiplier};
}
export type Mood='gain'|'loss';
export type Shared={v:1;rows:Id[];source:number;value:number;prices:Prices;mood?:Mood};
export function validateShared(x:unknown):x is Shared {if(!x||typeof x!=='object')return false;const d=x as Shared;return (d.mood===undefined || d.mood==='gain' || d.mood==='loss')&&d.v===1&&Array.isArray(d.rows)&&d.rows.length>0&&d.rows.length<=20&&d.rows.every(isId)&&Number.isInteger(d.source)&&d.source>=0&&d.source<d.rows.length&&typeof d.value==='number'&&Number.isFinite(d.value)&&d.value>=0&&d.value<=1e100&&validPrices(d.prices);}
export function encode(d:Shared){return btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(d))));}
export function decode(s:string):Shared {if(s.length>12000)throw Error('分享資料過長');const d=JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(s),c=>c.charCodeAt(0))));if(!validateShared(d))throw Error('分享連結格式無效');return {...d,prices:{...defaults,...d.prices}};}
