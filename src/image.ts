import puppeteer from 'puppeteer';

export const makeImage = async () => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	const dsf = 2;
	await page.setViewport({
		width: 1072/dsf,
		height: 1448/dsf,
		deviceScaleFactor: dsf,
	})

	await page.goto('http://localhost:3000');

	await page.screenshot({path: 'example.png'});
}