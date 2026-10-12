import {describe,expect,it} from 'vitest';
import {validMeasurementId} from './analytics';

describe('GA4 設定',()=>{
 it('只接受 G- 開頭的公開評估 ID',()=>{
  expect(validMeasurementId('G-ABC12345')).toBe(true);
  expect(validMeasurementId('UA-123456-1')).toBe(false);
  expect(validMeasurementId('G-XXXXXXXXXX ')).toBe(false);
  expect(validMeasurementId(undefined)).toBe(false);
 });
});
