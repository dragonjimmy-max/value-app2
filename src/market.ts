import {type Prices,type MarketKey} from './model';
export type Quote={value:number;currency:'TWD'|'USD';date:string;source:string;url:string;fetchedAt:string};
export type Snapshot={version:1;checkedAt:string|null;quotes:Partial<Record<MarketKey,Quote>>;errors:Partial<Record<MarketKey,string>>};
export const marketKeys=['etf','spy','fx'] as const;
export function validSnapshot(x:unknown):x is Snapshot{
 if(!x||typeof x!=='object')return false;const d=x as Snapshot;
 if(d.version!==1||(d.checkedAt!==null && (typeof d.checkedAt!=='string'||!Number.isFinite(Date.parse(d.checkedAt))))||!d.quotes||typeof d.quotes!=='object'||!d.errors||typeof d.errors!=='object')return false;
 return Object.entries(d.quotes).every(([key,q])=>marketKeys.includes(key as MarketKey)&&q&&typeof q.value==='number'&&Number.isFinite(q.value)&&q.value>0&&q.value<=1e15&&q.currency===(key==='spy'?'USD':'TWD')&&typeof q.date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(q.date)&&Number.isFinite(Date.parse(q.date))&&Date.parse(q.date)<=Date.now()+86400000&&typeof q.source==='string'&&q.source.length<=100&&typeof q.url==='string'&&/^https:\/\//.test(q.url)&&q.url.length<=500&&typeof q.fetchedAt==='string'&&Number.isFinite(Date.parse(q.fetchedAt)))&&Object.entries(d.errors).every(([key,e])=>marketKeys.includes(key as MarketKey)&&typeof e==='string'&&e.length<=300);
}
export function applySnapshot(prices:Prices,data:Snapshot):Prices{
 const next={...prices,market:{...prices.market}};
 for(const key of marketKeys){if(prices.market?.[key]?.mode==='manual'||prices.market?.[key]?.mode==='shared')continue;const quote=data.quotes[key];if(quote){next[key]=quote.value;next.market[key]={mode:'auto',source:quote.source,date:quote.date};}}
 return next;
}
export function lockSharedPrices(p:Prices):Prices{const next={...p,market:{...p.market}};for(const key of marketKeys){const old=p.market?.[key];next.market[key]={mode:'shared',source:old?.source??'分享連結指定參考價',date:old?.date??''};}return next;}
export function quoteStatus(p:Prices,key:MarketKey,online:boolean,failed:boolean,now=Date.now()):string{
 const meta=p.market?.[key];if(meta?.mode==='manual')return '手動參考價';if(meta?.mode==='shared')return '分享指定價格（已鎖定）';
 if(!meta?.date)return '尚無收盤資料，請更新或自行設定（目前示範值）';
 if(!online)return '離線／使用已儲存資料';if(failed)return '更新失敗／使用上次成功資料（可能過期）';
 return now-Date.parse(meta.date+'T00:00:00Z')>4*86400000?'資料過期／使用上次成功資料':key==='fx'?'每日參考匯率（非即時）':'收盤參考價（非即時）';
}
