import express from "express";
import { batteryInfo } from "./utils.js";
import { getSunnyHours, getWeatherForecast } from "./weather.js";
import { getCalendarObjects, getCalendars, getDataFromCalendarObject } from "./calendar.js";
import { makeImage } from "./image.js";

const router = express.Router();

let battery = "N/A";

router.get("/", async (req, res) => {
	res.status(200).json({ message: "OK" });
});

router.get("/toggleLights", async (req, res) => {
	const request = await fetch(`${process.env.HA_URL}/api/services/light/toggle`, {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${process.env.HA_TOKEN}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			entity_id: process.env.HA_ENTITY_ID,
		}),
	});
	if(request.status !== 200) {
		console.log("Error: " + request.status);
		return res.status(500).json({
			state: "error",
		})
	} else {
		let json = await request.json();
		let state = json[0].state;
		return res.status(200).json({
			state: state,
		})
	}
})

router.get("/setBattery", async (req, res) => {
	if(req.query.battery === undefined) {
		battery = "N/A";
		return;
	}
	battery = req.query.battery.toString();
	return res.status(200).json(true);
})

router.get("/getBattery", async (req, res) => {
	return res.status(200).json({...batteryInfo(battery)});
});

router.get("/forecast", async (req, res) => {
	const forecast = await getWeatherForecast();
	return res.status(200).json(forecast);
})
router.get("/sunnyHours", async (req, res) => {
	const sunHours = await getSunnyHours();
	return res.status(200).json(sunHours);
});

router.get("/calendars", async (req, res) => {
	const calendars = await getCalendars();
	return res.status(200).json(calendars);
})
router.get("/calendarsObjs", async (req, res) => {
	const calendarObj = await getCalendarObjects();
	return res.status(200).json(calendarObj);
});

router.get("/calendarParsed", async (req, res) => {
	const calendarObjs = await getCalendarObjects();
	const parsed = [];
	for(const calendarObj of calendarObjs) {
		for(const obj of calendarObj) {
			parsed.push(await getDataFromCalendarObject(obj));
		}
	}
	return res.status(200).json(parsed);
})

router.get("/puppeteer", async (req, res) => {
	makeImage();
	return res.status(200).json(true);
})

export default router;