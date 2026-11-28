const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = p => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');

const app = read('app.js');
const cloud = read('mfit-cloud.js');
const push = read('supabase/functions/push-notifications/index.ts');
const privacy = read('privacy.html');

assert.match(app, /mfit_push_device_token/);
assert.match(app, /deviceToken\s*\}/);
assert.match(app, /await syncMfitPushSettings\(subscription\);[\s\S]*action:'unsubscribe'/);
assert.match(app, /async function clearMfitLocalData\(\)[\s\S]*await disableMfitPush\(\)/);
assert.match(cloud, /mfitCloudSignOut[\s\S]*await window\.disableMfitPush\(\)/);
assert.match(cloud, /mfitCloudDeleteAccount[\s\S]*await window\.disableMfitPush\(\)/);

assert.match(push, /x-mfit-cron-secret/);
assert.match(push, /req\.headers\.get\("x-mfit-cron-secret"\) !== expected/);
assert.match(push, /async function hashDeviceToken/);
assert.match(push, /device_token_hash/);
assert.match(push, /existing\.device_token_hash !== tokenHash/);
assert.match(push, /delete\(\)\.eq\("endpoint", body\.endpoint\)\.eq\("device_token_hash", tokenHash\)/);
assert.match(push, /\.or\(job\.field \+ "\.is\.null," \+ job\.field \+ "\.neq\." \+ clock\.date\)/);
assert.match(push, /timeZone, year: "numeric"/);
assert.match(privacy, /gerätebezogene Berechtigung/);
assert.match(privacy, /dich abmeldest, dein Konto löschst/);

const vienna = date => new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Vienna', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
}).format(new Date(date));
assert.equal(vienna('2026-01-15T12:00:00Z'), '13:00', 'Vienna winter offset should be UTC+1');
assert.equal(vienna('2026-07-15T12:00:00Z'), '14:00', 'Vienna summer offset should be UTC+2');

console.log('PASS: push authorization, device ownership, unsubscribe lifecycle, duplicate-dispatch guard, privacy notice and Vienna DST checks.');
