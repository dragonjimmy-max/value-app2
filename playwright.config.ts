import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./e2e',use:{baseURL:process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:4173',launchOptions:{executablePath:'/usr/bin/chromium',args:['--no-sandbox']},permissions:['clipboard-read','clipboard-write']},workers:1});
