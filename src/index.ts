import express from "express";
import { create } from "express-handlebars";
import dotenv from "dotenv";
import mainRouter from "./routers/main";
import apiRouter from "./routers/api";
import { getCalendarEvents } from "./api/caldav";

dotenv.config();

const app = express();
const handlebars = create({
	defaultLayout: false,
	extname: "hbs",
	partialsDir: "views",
	helpers: {
		times: (n: number, block: any) => {
			let accum = "";
			for (let i = 0; i < n; ++i)
				accum += block.fn(i);
			return accum;
		},
		batteryIcon: (battery: number) => {
			let level = Math.round(battery / 25);
			let levelMap = ["empty", "quarter", "half", "three-quarters", "full"];
			return "fas fa-battery-" + levelMap[level];
		},
		// value from 0 to 100
		moonPhaseName: (value: number) => {
			let moonPhaseMap = ["New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"];

			let phase = Math.round(value / 100 * 8);

			return moonPhaseMap[phase];
		},
		moonPhaseIcon: (value: number) => {
			const moonPhaseMap = ["new-moon", "waxing-crescent", "first-quarter", "waxing-gibbous", "full-moon", "waning-gibbous", "last-quarter", "waning-crescent"];

			// phase from 0 to 27, to have 28 phases for 28 icons
			let phase = Math.round((value / 100) * 27);
			// if the phase is 0, 7, 14 or 21, it's a new moon, first quarter, full moon or last quarter, these don't split, so we just return them
			if (phase == 0 || phase == 7 || phase == 14 || phase == 21) {
				return moonPhaseMap[(phase / 7) * 2];
			} else {
				let phaseMain = moonPhaseMap[Math.floor(phase / 7) * 2 + 1];
				let phaseCount = phase % 7;
				return phaseMain + "-" + phaseCount;
			}
		},
		getHour: (date: Date) => {
			const pad = (n: number) => (n < 10 ? "0" + n : n);
			return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
		},
		round: (value: number) => {
			return Math.round(value);
		},
		roundAndNotMinus: (value: number) => {
			return Math.max(Math.round(value), 0);
		},
		getDate: () => {
			const now = new Date();
			const pad = (n: number) => (n < 10 ? "0" + n : n);
			return now.toLocaleDateString("en-GB", {weekday: "long", year: "numeric", month: "long", day: "numeric"});
		},
		getTime: (value: string) => {
			const date = new Date(value);

			const pad = (n: number) => (n < 10 ? "0" + n : n);
			return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
		},
		noEvents: (events: any[], options: any) => {
			if (events.length == 0) {
				return options.fn(this);
			} else {
				return options.inverse(this);
			}
		}
	}
});

app.engine("hbs", handlebars.engine);
app.set("view engine", "hbs");
app.set("views", "views");

app.use(express.json());

app.use("/", mainRouter);
app.use("/api", apiRouter);

app.use(express.static("public"));

app.listen(process.env.PORT, () => {
	console.log(`Server started on port ${process.env.PORT}`);
});