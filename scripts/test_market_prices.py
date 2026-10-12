import unittest
from datetime import datetime, timezone
from update_market_prices import twse_quote, spy_quote, positive

class MarketTests(unittest.TestCase):
    def test_twse_roc_date_and_per_share(self):
        q=twse_quote([{'Code':'0050','Date':'1151012','ClosingPrice':'74.25'}])
        self.assertEqual(q['date'],'2026-10-12')
        self.assertEqual(q['value'],74.25)
        self.assertEqual(q['currency'],'TWD')
    def test_spy_excludes_unfinished_session(self):
        now=datetime(2026,10,12,17,tzinfo=timezone.utc)
        d={'chart':{'result':[{'meta':{'symbol':'SPY','currency':'USD','currentTradingPeriod':{'regular':{'end':1791835200}}},'timestamp':[int(datetime(2026,10,9,13,30,tzinfo=timezone.utc).timestamp()),int(datetime(2026,10,12,13,30,tzinfo=timezone.utc).timestamp())],'indicators':{'quote':[{'close':[678.25,699.0]}]}}]}}
        self.assertEqual(spy_quote(d,now)['value'],678.25)
    def test_invalid_quotes(self):
        for x in [0,-1,'NaN','Infinity','--']:
            with self.assertRaises(ValueError):positive(x)

if __name__=='__main__':unittest.main()
