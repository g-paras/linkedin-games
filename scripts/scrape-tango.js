import puppeteer from 'puppeteer';

import { getOrCreateGameLevelConfig } from './firebase-utils.js';


console.log('Launching browser...')
const browser = await puppeteer.launch({ headless: false });
const page = await browser.newPage();

console.log('Going to LinkedIn Tango...')
await page.goto('https://www.linkedin.com/games/view/tango/desktop/');

await page.setViewport({
    width: 1280,
    height: 800,
});

console.log('Waiting for the start button to load...')
const button = await page.waitForSelector('#launch-footer-start-button', { timeout: 5000 });

const gameNumberEl = await page.waitForSelector('span.launch-footer__score-text', {timeout: 5000});
if (!gameNumberEl) {
    throw new Error('Cannt find game title');
}
const gameNumber = Number((await gameNumberEl.evaluate(el => el.textContent)).trim().slice(3)); // Ignore 'NO.
console.log('Found game', gameNumber);

button?.click();

// console.log('Closing tutorial...')
// const closeButton = await page.waitForSelector('#ember44', { timeout: 5000 });
// closeButton?.click();


const computeCellValue = async (cellContentSVG, idx) => {
    if (!cellContentSVG) {
        throw new Error(`Cell content SVG not found at index ${idx}`);
    }
    const ariaLabel = (await cellContentSVG.evaluate((el) => el.getAttribute('aria-label'))).trim();

    switch (ariaLabel) {
        case 'Empty':
            return 0;
        case 'Sun':
            return 1;
        case 'Moon':
            return 2;
        default:
            throw new Error(`Unknown content aria-label: ${ariaLabel} at index ${idx}`);
    }
}

const parseRelation = async (edge, idx) => {
    if (!edge) {
        return 0; // no relation
    }
    const ariaLabel = (await edge.evaluate((el) => el.getAttribute('aria-label'))).trim();

    switch (ariaLabel) {
        case 'Equal':
            return 1;
        case 'Cross':
            return 2;
        default:
            throw new Error(`Unknown edge aria-label: ${ariaLabel} at index ${idx}`);
    }
}

console.log('Parsing game grid...')
const gameLevel = {};
for (let i = 0; i < 36; i++) {
    console.log('Parsing Cell', i);
    const gridCell = await page.waitForSelector(`#lotka-cell-${i}`, { timeout: 5000 });
    const cellContent = await gridCell?.$('div.lotka-cell-content svg');
    const rightEdge = await gridCell?.$('.lotka-cell-edge--right svg');
    const bottomEdge = await gridCell?.$('.lotka-cell-edge--down svg');
    gameLevel[i] = {
        type: await computeCellValue(cellContent, i),
        rightRelation: await parseRelation(rightEdge, i),
        bottomRelation: await parseRelation(bottomEdge, i),
    };
}

// Write document to firestore
const today = new Date();
const id = today.toISOString().split('T')[0];
const data = {
    grid: gameLevel,
    nCols: 6,
    nRows: 6,
    gameNumber: gameNumber,
    isActive: true,
}

await getOrCreateGameLevelConfig('linkedin-tango', id, data);

console.log(gameLevel)
console.log('Parsing Complete closing browser...')
await browser.close();
