const assert = require('node:assert/strict');
const fs = require('node:fs');
const read = p => fs.readFileSync(p, 'utf8');
const html = read('index.html');
const js = read('mfit-v193.js');
const css = read('mfit-v193.css');
const sw = read('sw.js');
const manifest = read('manifest.webmanifest');
const i18n = read('i18n.js');
const advanced = read('mfit-advanced.js');
const meal = read('mfit-v165.js');
const extras = read('mfit-extras.js');
const next = read('mfit-next.js');

for (const title of [
 'Dein Tag & Schnellzugriff','Kalorien & Makros heute','Wochen- & Monatsauswertung',
 'Performance-Coach & Ernährungstipps','Lebensmittel & Mahlzeiten-Favoriten',
 'Trainingsauswertung','Erholung & Check-in','Körper & Gewicht',
 'Ziele, Level & Meilensteine','Darstellung & App-Design',
 'Daten, Datenschutz & Backup','Timer-Werkzeuge','Kalender & Trainingsplanung'
]) assert.ok(js.includes(title), 'Missing consolidated section: '+title);
assert.match(js,/mfit193-merged-section/);
assert.doesNotMatch(js,/mfit165Barcode|mfit165ExerciseLibrary/);
assert.match(js,/privacyCenter.*privacy-danger-zone.*remove/);
assert.doesNotMatch(js,/localStorage\.(?:removeItem|clear)\(/,'Consolidation must not delete user storage');
assert.match(advanced,/mfit_weekly_training_goal_v192/);
assert.match(meal,/mfit_weekly_training_goal_v192/);
assert.match(html,/mfit-version" content="194"/);
assert.match(html,/mfit-v193\.js\?v=194/);
assert.match(html,/mfit-v193\.css\?v=194/);
assert.match(sw,/mfit-performance-v194/);
assert.match(sw,/\.\/mfit-v193\.js/);
assert.match(sw,/\.\/mfit-v193\.css/);
assert.match(manifest,/v=194/);
assert.match(i18n,/Dein Tag & Schnellzugriff/);
assert.match(i18n,/Kalender & Trainingsplanung/);
assert.match(css,/\.mfit193-merged-card/);
assert.doesNotMatch(html,/quick-start-card|mfitAchievementList/);
assert.doesNotMatch(meal,/mfit165Barcode|mfit165ExerciseLibrary|mfit165WorkoutGoal/);
assert.doesNotMatch(extras,/mfitThemeStudio|mfitChooseAccent/);
assert.doesNotMatch(advanced,/mfitAdvancedPreferences/);
assert.doesNotMatch(next,/mfitNextMuscles/);

console.log('PASS: MFit v193 Part B consolidation, translations, offline assets and non-destructive storage checks.');
