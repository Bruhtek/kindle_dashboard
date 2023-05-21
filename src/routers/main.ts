import { Router } from "express";
import { getBattery } from "./api";
import { getHourlyWeatherForecast, getSolarData, getWeatherForecast } from "../api/weather";
import { getLightStatus } from "../api/hass";
import { getCalendarEvents } from "../api/caldav";

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


mainRouter.get("/page/vertical", async (req, res) => {

	return res.render("page/vertical", {
		battery: getBattery(),
		forecast: await getHourlyWeatherForecast(),
		solarData: await getSolarData(),
		calendar: await getCalendarEvents(),
	});
});

export default mainRouter;