import express from "express";
import { batteryInfo } from "./utils.js";
import { getSunnyHours, getWeatherForecast } from "./weather.js";

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

export default router;