import {describe,it,expect} from 'vitest';
import {defaults} from './model';
import {applySnapshot,validSnapshot,quoteStatus,lockSharedPrices,type Snapshot} from './market';
const stamp=new Date().toISOString(),date=stamp.slice(0,10);
const data:Snapshot={version:1,checkedAt:stamp,quotes:{etf:{value:72,currency:'TWD',date,source:'證交所測試',url:'https://example.com',fetchedAt:stamp},spy:{value:680,currency:'USD',date,source:'Yahoo 測試',url:'https://example.com',fetchedAt:stamp}},errors:{}};
describe('收盤資料',()=>{
 it('檢查數值、日期與幣別，拒絕零價及無效來源',()=>{expect(validSnapshot(data)).toBe(true);expect(validSnapshot({...data,quotes:{etf:{...data.quotes.etf,value:0}}})).toBe(false);expect(validSnapshot({...data,quotes:{spy:{...data.quotes.spy,currency:'TWD'}}})).toBe(false);expect(validSnapshot({...data,quotes:{etf:{...data.quotes.etf,date:'bogus'}}})).toBe(false);});
 it('自動更新 ETF，保留商品與手動／分享鎖價',()=>{expect(applySnapshot(defaults,data)).toMatchObject({etf:72,spy:680,lv:150000});const manual={...defaults,market:{etf:{mode:'manual' as const,source:'自訂',date:''}}};expect(applySnapshot(manual,data).etf).toBe(defaults.etf);expect(applySnapshot(lockSharedPrices(defaults),data).spy).toBe(defaults.spy);});
 it('缺少報價保留舊值，失敗與過期不冒充最新資料',()=>{const p=applySnapshot(defaults,data);expect(applySnapshot(p,{...data,quotes:{},errors:{etf:'failed'}}).etf).toBe(72);expect(quoteStatus(p,'etf',false,false)).toContain('離線');expect(quoteStatus(p,'etf',true,true)).toContain('更新失敗');expect(quoteStatus(p,'etf',true,false,Date.parse(date)+6*86400000)).toContain('過期');expect(quoteStatus(defaults,'etf',true,false)).toContain('示範值');});
});
