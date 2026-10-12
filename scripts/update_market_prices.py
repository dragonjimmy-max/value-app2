"""Refresh public closing references. No credentials, no invented fallback prices."""
import json
import csv
import io
import math
import sys
import time
import urllib.request
from datetime import datetime, timezone, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

OUTPUT = Path(__file__).resolve().parents[1] / 'public' / 'market-prices.json'
TWSE = 'https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL'
YAHOO = 'https://query1.finance.yahoo.com/v8/finance/chart/SPY?interval=1d&range=1mo'
FX = 'https://open.er-api.com/v6/latest/USD'


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (compatible; value-app2 closing-reference updater)', 'Accept': 'application/json'})
    with urllib.request.urlopen(req, timeout=30) as response:
        return json.load(response)


def positive(value):
    n = float(str(value).replace(',', ''))
    if not math.isfinite(n) or n <= 0 or n > 1e15:
        raise ValueError('Invalid or missing positive price')
    return n


def twse_quote(data):
    row = next(x for x in data if x.get('Code') == '0050')
    raw = str(row['Date']).replace('/', '').replace('-', '')
    if len(raw) == 7:
        date = f'{int(raw[:3]) + 1911}-{raw[3:5]}-{raw[5:7]}'
    elif len(raw) == 8:
        date = f'{raw[:4]}-{raw[4:6]}-{raw[6:8]}'
    else:
        raise ValueError('Unrecognized TWSE trading date')
    datetime.strptime(date, '%Y-%m-%d')
    return {'value': positive(row['ClosingPrice']), 'currency': 'TWD', 'date': date, 'source': '臺灣證券交易所收盤資料', 'url': TWSE}


def spy_quote(data, now):
    result = data['chart']['result'][0]
    meta = result['meta']
    if meta.get('symbol') != 'SPY' or meta.get('currency') != 'USD':
        raise ValueError('Unexpected symbol or currency')
    ny = ZoneInfo('America/New_York')
    today = now.astimezone(ny).date()
    session_end = meta.get('currentTradingPeriod', {}).get('regular', {}).get('end')
    bars = zip(result['timestamp'], result['indicators']['quote'][0]['close'])
    for timestamp, close in reversed(list(bars)):
        day = datetime.fromtimestamp(timestamp, timezone.utc).astimezone(ny).date()
        if day > today or close is None:
            continue
        # Reject the current, still-open daily bar; do not label intraday quotes as closing prices.
        if day == today and (not session_end or now.timestamp() < session_end + 1200):
            continue
        return {'value': round(positive(close), 4), 'currency': 'USD', 'date': day.isoformat(), 'source': 'Yahoo Finance 日線收盤價', 'url': 'https://finance.yahoo.com/quote/SPY/history/'}
    raise ValueError('No completed SPY daily bar available')


def fx_quote(data):
    if data.get('result') != 'success' or data.get('base_code') != 'USD':
        raise ValueError('Unexpected exchange-rate response')
    timestamp = positive(data['time_last_update_unix'])
    date = datetime.fromtimestamp(timestamp, timezone.utc).date().isoformat()
    return {'value': positive(data['rates']['TWD']), 'currency': 'TWD', 'date': date, 'source': 'ExchangeRate-API 美元參考匯率', 'url': 'https://www.exchangerate-api.com/'}


def fetch_spy(now):
    errors=[]
    for host in ['query1.finance.yahoo.com','query2.finance.yahoo.com']:
        try:
            return spy_quote(fetch(YAHOO.replace('query1.finance.yahoo.com',host)),now)
        except Exception as error:
            errors.append(str(error))
    # Public historical daily CSV, with a disclosed adjusted-price fallback.
    url='https://stooq.com/q/d/l/?s=spy.us&i=d'
    req=urllib.request.Request(url,headers={'User-Agent':'value-app2/1.0'})
    with urllib.request.urlopen(req,timeout=30) as response:
        rows=list(csv.DictReader(io.StringIO(response.read().decode('utf-8'))))
    local=now.astimezone(ZoneInfo('America/New_York'))
    for row in reversed(rows):
        day=datetime.strptime(row['Date'],'%Y-%m-%d').date()
        if day>local.date() or (day==local.date() and (local.hour*60+local.minute)<980):
            continue
        return {'value':positive(row['Close']),'currency':'USD','date':day.isoformat(),'source':'Stooq 日線參考收盤（可能經股息調整）','url':'https://stooq.com/q/?s=spy.us'}
    raise ValueError('SPY providers unavailable: '+ '; '.join(errors))


def fetch_twse(now):
    try:
        return twse_quote(fetch(TWSE))
    except Exception:
        month=now.date().replace(day=1)
        for day in [month,month-timedelta(days=1)]:
            url='https://www.twse.com.tw/rwd/zh/afterTrading/STOCK_DAY?stockNo=0050&response=json&date='+day.strftime('%Y%m01')
            data=fetch(url)
            rows=data.get('data',[])
            if rows:
                row=rows[-1]
                quote=twse_quote([{'Code':'0050','Date':row[0],'ClosingPrice':row[6]}])
                quote['url']=url
                return quote
        raise ValueError('TWSE closing references unavailable')


def main():
    now = datetime.now(timezone.utc)
    stamp = now.isoformat(timespec='seconds')
    try:
        previous = json.loads(OUTPUT.read_text())
        quotes = previous.get('quotes', {}) if previous.get('version') == 1 else {}
    except (FileNotFoundError, ValueError):
        quotes = {}
    errors = {}
    jobs = {'etf': lambda: fetch_twse(now), 'spy': lambda: fetch_spy(now), 'fx': lambda: fx_quote(fetch(FX))}
    for key, job in jobs.items():
        try:
            quote = job()
            if datetime.strptime(quote['date'], '%Y-%m-%d').date() > now.date():
                raise ValueError('Future-dated reference rejected')
            quote['fetchedAt'] = stamp
            quotes[key] = quote
            print(f"{key}: {quote['value']} {quote['currency']} ({quote['date']})")
        except Exception as error:
            # Retain the last successful quote and its original date/time.
            errors[key] = f'{type(error).__name__}: {error}'[:200]
            print(f'{key}: update failed; retained previous reference: {errors[key]}', file=sys.stderr)
    OUTPUT.write_text(json.dumps({'version': 1, 'checkedAt': stamp, 'quotes': quotes, 'errors': errors}, ensure_ascii=False, indent=2) + '\n')
    return 1 if errors else 0


if __name__ == '__main__':
    sys.exit(main())
