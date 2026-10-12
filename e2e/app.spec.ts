import jsQR from 'jsqr';
import {PNG} from 'pngjs';
import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{await page.route('**/market-prices.json',route=>route.fulfill({json:{version:1,checkedAt:null,quotes:{},errors:{}}}));});
const amounts=(page:any)=>page.locator('.amount input');
test('新版版面、十列換算、價格與分享儲存',async({page})=>{
 await page.goto('/');const inputs=amounts(page);
 await expect(inputs).toHaveCount(10);await expect(page.getByRole('region',{name:'計算機'})).toHaveCount(0);await expect(page.getByRole('button',{name:'新增換算列'})).toHaveCount(0);await expect(page.getByText('等值購買力',{exact:true})).toHaveCount(0);await expect(page.getByRole('button',{name:'賺 🐮',exact:true})).toHaveAttribute('aria-pressed','true');await expect(page.getByRole('heading',{name:/Worth it？珍的嗎/})).toBeVisible();
 expect(await page.locator('.rows select').evaluateAll(xs=>xs.map(x=>(x as HTMLSelectElement).value))).toEqual(['twd','usd','rice','tea','bigmac','0050','spy','iphone','lv','gold']);
 for(const [i,expected] of [1,32,50,65,85,60,19200,39900,150000,1000000].entries()){await inputs.nth(i).fill('2');if(i!==0)await expect(inputs.nth(0)).toHaveValue(new Intl.NumberFormat('zh-TW').format(expected*2));}
 await inputs.nth(0).fill('1,000');await expect(inputs.nth(2)).toHaveValue('20');await expect(inputs.nth(9)).toHaveValue('0.001');
 await inputs.nth(1).fill('100');await expect(inputs.nth(0)).toHaveValue('3,200');await expect(inputs.nth(6)).toHaveValue('0.166667');
 await inputs.nth(6).fill('2');await expect(inputs.nth(0)).toHaveValue('38,400');
 await inputs.nth(0).fill('1000');await page.getByRole('button',{name:'價格設定',exact:true}).click();await page.getByLabel('滷肉飯每碗價格（台幣）').fill('40');await page.getByRole('button',{name:'儲存價格'}).click();await expect(inputs.nth(0)).toHaveValue('1000');await expect(inputs.nth(2)).toHaveValue('25');
 await page.getByLabel('第 2 列項目',{exact:true}).selectOption('gold');await expect(inputs.nth(0)).toHaveValue('1000');await expect(inputs.nth(1)).toHaveValue('0.001');
 await inputs.nth(0).fill('');await expect(inputs.nth(2)).toHaveValue('0');await inputs.nth(0).fill('0.000000001');await expect(inputs.nth(2)).toHaveValue('2.500000e-11');await inputs.nth(0).fill('0.');await expect(inputs.nth(0)).toHaveValue('0.');await inputs.nth(0).fill('abc');await expect(page.getByRole('alert')).toBeVisible();
 await inputs.nth(0).fill('1000');await page.getByRole('button',{name:'複製結果連結'}).click();const url=await page.evaluate(()=>navigator.clipboard.readText());await page.goto(url);await expect(amounts(page).nth(2)).toHaveValue('25');
 await page.getByRole('button',{name:'分享結果圖片'}).click();await expect(page.getByRole('dialog')).toContainText('分享今天的戰績');const download=page.waitForEvent('download');await page.getByRole('button',{name:'下載分享圖'}).click();expect((await download).suggestedFilename()).toContain('.png');await page.getByRole('button',{name:'關閉面板'}).click();
 await page.getByRole('button',{name:'切換主題'}).click();await page.reload();await expect(page.locator('html')).toHaveAttribute('data-theme','light');await expect(amounts(page).nth(2)).toHaveValue('25');
 await page.getByRole('button',{name:'加入主畫面',exact:true}).click();await expect(page.getByRole('dialog')).toContainText('iPhone');await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).not.toBeVisible();
 await page.goto('/#data=bad');await expect(page.getByRole('alert')).toContainText('分享連結格式無效');
});
test('0050 張股切換、張數輸入、價格修改與分享還原',async({page})=>{
 await page.goto('/');const inputs=amounts(page),units=page.locator('.amount > span');
 await inputs.nth(0).fill('60000');await expect(inputs.nth(5)).toHaveValue('1,000');await expect(units.nth(5)).toHaveText('股');
 await inputs.nth(0).fill('60060');await expect(inputs.nth(5)).toHaveValue('1.001');await expect(units.nth(5)).toHaveText('張');
 await inputs.nth(0).fill('150000');await expect(inputs.nth(5)).toHaveValue('2.5');await inputs.nth(5).fill('3');await expect(inputs.nth(0)).toHaveValue('180,000');await expect(units.nth(5)).toHaveText('張');
 await page.getByRole('button',{name:'價格設定',exact:true}).click();await page.getByLabel('0050自動使用定期資料').uncheck();await page.getByLabel('0050 每股價格（台幣）').fill('70');await page.getByRole('button',{name:'儲存價格'}).click();await expect(inputs.nth(5)).toHaveValue('3');await expect(inputs.nth(0)).toHaveValue('210,000');
 await page.getByRole('button',{name:'複製結果連結'}).click();const url=await page.evaluate(()=>navigator.clipboard.readText());await page.goto(url);await expect(inputs.nth(5)).toHaveValue('3');await expect(units.nth(5)).toHaveText('張');await expect(inputs.nth(0)).toHaveValue('210,000');
 await inputs.nth(5).fill('0.5');await inputs.nth(5).press('Enter');await expect(inputs.nth(5)).toHaveValue('500');await expect(units.nth(5)).toHaveText('股');await expect(inputs.nth(0)).toHaveValue('35,000');
 await inputs.nth(5).fill('1500');await inputs.nth(5).press('Enter');await expect(inputs.nth(5)).toHaveValue('1.5');await expect(units.nth(5)).toHaveText('張');await expect(inputs.nth(0)).toHaveValue('105,000');
});
test('手機與桌面無溢出；離線重新載入可換算',async({page,context})=>{
 await page.goto('/');for(const width of [360,390,1280]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await page.reload();await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
 await context.setOffline(true);await page.reload();await expect(page.locator('.status')).toContainText('離線');await amounts(page).nth(9).fill('1');await expect(amounts(page).nth(0)).toHaveValue('1,000,000');
 await context.setOffline(false);await page.setViewportSize({width:390,height:1500});await page.screenshot({path:'/tmp/value-app2-mobile.png',fullPage:true});
});

test('手機品牌列與加入主畫面箭頭正確顯示',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 await expect(page.getByText('＋ 加到手機主頁，方便隨時比較')).toBeVisible();
 const layout=await page.locator('.brand-mark').evaluate(mark=>{const image=mark.querySelector('img')!.getBoundingClientRect(),copy=mark.querySelector('.brand-copy')!.getBoundingClientRect(),title=mark.querySelector('h1')!.getBoundingClientRect(),eyebrow=mark.querySelector('.eyebrow')!.getBoundingClientRect(),box=mark.getBoundingClientRect(),tool=document.querySelector('.tools button')!.getBoundingClientRect();return {src:(mark.querySelector('img') as HTMLImageElement).currentSrc,imageCenter:(image.top+image.bottom)/2,boxCenter:(box.top+box.bottom)/2,titleWidth:title.width,eyebrowWidth:eyebrow.width,imageHeight:image.height,copyHeight:copy.height,toolHeight:tool.height};});
 expect(layout.src).toContain('logo.webp');expect(Math.abs(layout.imageCenter-layout.boxCenter)).toBeLessThan(1);expect(Math.abs(layout.titleWidth-layout.eyebrowWidth)).toBeLessThan(1);expect(layout.imageHeight).toBeGreaterThanOrEqual(layout.toolHeight);expect(layout.copyHeight).toBeGreaterThanOrEqual(layout.toolHeight);
 await page.getByRole('button',{name:'加入主畫面'}).click();await expect(page.getByRole('note',{name:'箭頭指向瀏覽器右下角三點選單'})).toBeVisible();
 const arrow=await page.locator('.browser-menu-guide').evaluate(el=>{const box=el.getBoundingClientRect();return {right:innerWidth-box.right,bottom:innerHeight-box.bottom};});expect(arrow.right).toBeLessThanOrEqual(10);expect(arrow.bottom).toBeLessThanOrEqual(10);
});

test('LV 包包、賺虧狀態、兩種分享圖與 QR Code 可掃描',async({page})=>{
 await page.goto('/');const inputs=amounts(page);
 await inputs.nth(8).fill('1');await expect(inputs.nth(0)).toHaveValue('150,000');
 for(const mood of ['gain','loss'] as const){
  await page.getByRole('button',{name:mood==='gain'?'賺 🐮':'虧 QQ',exact:true}).click();
  await page.getByRole('button',{name:'分享結果圖片'}).click();
  await expect(page.getByRole('dialog').getByRole('img')).toHaveAttribute('alt',new RegExp(mood==='gain'?'賺錢來財':'虧錢 QQ'));
  const event=page.waitForEvent('download');await page.getByRole('button',{name:'下載分享圖'}).click();const download=await event;const path=`/tmp/value-share-${mood}.png`;await download.saveAs(path);
  const png=PNG.sync.read(await import('node:fs/promises').then(fs=>fs.readFile(path)));expect(png.width).toBe(1080);
  const size=240,x=716,y=656+10*78;const pixels=new Uint8ClampedArray(size*size*4);
  for(let row=0;row<size;row++)pixels.set(png.data.subarray(((y+row)*png.width+x)*4,((y+row)*png.width+x+size)*4),row*size*4);
  expect(jsQR(pixels,size,size)?.data).toBe('https://dragonjimmy-max.github.io/value-app2/');
  await page.getByRole('button',{name:'關閉面板'}).click();
 }
 await page.getByRole('button',{name:'複製結果連結'}).click();const link=await page.evaluate(()=>navigator.clipboard.readText());await page.goto(link);await expect(page.getByRole('button',{name:'虧 QQ',exact:true})).toHaveAttribute('aria-pressed','true');await expect(amounts(page).nth(0)).toHaveValue('150,000');await page.reload();await expect(page.getByRole('button',{name:'虧 QQ',exact:true})).toHaveAttribute('aria-pressed','true');
});

test('分享圖片提供三種背景與文案版型',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'分享結果圖片'}).click();
 const styles=page.locator('.share-style-picker button');await expect(styles).toHaveCount(3);
 for(const name of ['招財喜氣','珍奶日常','財富星空']){const button=page.getByRole('button',{name:new RegExp(name)});await button.click();await expect(button).toHaveAttribute('aria-pressed','true');await expect(page.locator('.share-preview img')).toHaveAttribute('alt',new RegExp(name));}
});

test('LV 可自訂、收盤價更新與手動覆寫、分享鎖價',async({page})=>{
 const date=new Date().toISOString().slice(0,10),fetchedAt=new Date().toISOString();
 const quote=(value:number,currency:string,source:string)=>({value,currency,source,date,fetchedAt,url:'https://example.com/price'});
 await page.route('**/market-prices.json',route=>route.fulfill({json:{version:1,checkedAt:fetchedAt,quotes:{etf:quote(75,'TWD','證交所測試來源'),spy:quote(650,'USD','Yahoo 測試來源'),fx:quote(31,'TWD','匯率測試來源')},errors:{}}}));
 await page.goto('/');await expect(page.locator('.market-summary')).toContainText(date);await expect(page.locator('.market-summary')).toContainText('0050');await expect(page.locator('.market-summary')).toContainText('SPY');await expect(page.locator('.market-summary')).toContainText('收盤參考價');await expect(page.getByText('日期每天自動更新一次')).toBeVisible();
 await page.getByRole('button',{name:'價格設定',exact:true}).click();await expect(page.getByLabel('0050 每股價格（台幣）')).toHaveValue('75');await expect(page.getByLabel('SPY 每股價格（美元）')).toHaveValue('650');await expect(page.getByLabel('美元兌台幣匯率（1 美元＝台幣）')).toHaveValue('31');
 await page.getByLabel('LV 包包價格（台幣）').fill('200000');await page.getByLabel('0050自動使用定期資料').uncheck();await page.getByLabel('0050 每股價格（台幣）').fill('80');await page.getByRole('button',{name:'儲存價格'}).click();
 await amounts(page).nth(8).fill('1');await expect(amounts(page).nth(0)).toHaveValue('200,000');await expect(amounts(page).nth(5)).toHaveValue('2.5');
 await page.getByRole('button',{name:'複製結果連結'}).click();const link=await page.evaluate(()=>navigator.clipboard.readText());
 await page.route('**/market-prices.json',route=>route.fulfill({json:{version:1,checkedAt:fetchedAt,quotes:{etf:quote(90,'TWD','新證交所來源'),spy:quote(700,'USD','新 Yahoo 來源'),fx:quote(30,'TWD','新匯率來源')},errors:{}}}));
 await page.goto(link);await page.reload();await page.getByRole('button',{name:'價格設定',exact:true}).click();await expect(page.getByLabel('0050 每股價格（台幣）')).toHaveValue('80');await expect(page.getByLabel('SPY 每股價格（美元）')).toHaveValue('650');await expect(page.getByLabel('LV 包包價格（台幣）')).toHaveValue('200000');await expect(page.getByRole('dialog')).toContainText('分享指定價格');
});
