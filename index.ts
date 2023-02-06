import express from 'express';
import { create } from 'express-handlebars';
import dotenv from 'dotenv';
import router from "./src/apiRouter.js";

dotenv.config();

import { clockHelper } from "./helpers/clock.js";
import { getLightStatus } from "./src/utils.js";
import { getSunnyHours, getWeatherForecast } from "./src/weather.js";

const app = express();
const handlebars = create({
	helpers: {
		round: (value: number) => Math.round(value),
		...clockHelper,
	}
});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('views', 'views');

app.use(express.json());

app.get("/page", async (req, res) => {
	const lightStatus = await getLightStatus();
	const now = new Date();
	const date = now.toLocaleDateString("pl-PL", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	});
	const forecast = await getWeatherForecast();
	const sunHours = await getSunnyHours();
	const name = process.env.NAME;
	const timezone = process.env.TIMEZONE;
	res.render("page", { name, timezone, date, lightStatus, forecast, sunHours });
})
app.get("/", (req, res) => {
	res.render("index");
})

app.use("/api", router);
app.use(express.static("public"));

app.listen(3000, () => {
	console.log("Server running on port 3000");
});