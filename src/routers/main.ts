import { Router } from "express";
import { getBattery, setBattery } from "./api";
import { getHourlyWeatherForecast, getSolarData, getWeatherForecast } from "../api/weather";
import { getLightStatus } from "../api/hass";
import { getCalendarEvents } from "../api/caldav";
import puppeteer from "puppeteer";
import dotenv from "dotenv";

dotenv.config();

const mainRouter = Router();

mainRouter.get("/", (req, res) => {
	return res.render("index");
});
mainRouter.get("/horizontal", (req, res) => {
	return res.render("horizontal");
});
mainRouter.get("/page/horizontal", async (req, res) => {
	return res.render("page/horizontal", {
		battery: getBattery(),
		forecast: await getHourlyWeatherForecast(),
		solarData: await getSolarData(),
		lights: await getLightStatus(),
	});
});
mainRouter.get("/vertical", (req, res) => {
	return res.render("vertical");
});

let cachedCalendar: any = {};

mainRouter.get("/page/vertical", async (req, res) => {
	try {
		if (!cachedCalendar.todayEvents) {
			cachedCalendar = await getCalendarEvents();
			setTimeout(() => {
				cachedCalendar = getCalendarEvents();
			}, 1000 * 60 * 50);
		}


		return res.render("page/vertical", {
			battery: getBattery(),
			forecast: await getHourlyWeatherForecast(),
			solarData: await getSolarData(),
			calendar: cachedCalendar,
		});
	} catch (e) {
		return res.render("page/vertical", {
			battery: getBattery(),
			forecast: await getHourlyWeatherForecast(),
			solarData: await getSolarData(),
			calendar: {},
		});
	}
});


mainRouter.get("/render/vertical", async (req, res) => {
	const battery = req.query.battery;
	if (battery) {
		setBattery(Number(battery));
	}

	try {
		const browser = await puppeteer.launch({
			defaultViewport: {
				width: 536,
				height: 724,
				deviceScaleFactor: 2,
			},
			executablePath: process.env.CHROME_BIN || "",
			headless: "new",
			args: [
				"--no-sandbox",
				"--disable-setuid-sandbox",
				"--disable-dev-shm-usage",
				"--disable-gpu",
				"--disable-audio-output",
				"--headless",
				"--single-process",
			],
		});

		const page = await browser.newPage();
		await page.goto("http://localhost:3000/page/vertical", {
			waitUntil: "networkidle0",
			timeout: 0,
		});
		const buffer = await page.screenshot({
			type: "png",
		});

		res.set("Content-Type", "image/png").send(buffer);

		await browser.close();
	} catch (e) {
		console.log(e);
		res.status(500).end();
	}
});

export default mainRouter;