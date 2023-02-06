//https://api.met.no/weatherapi/locationforecast/2.0/complete.json?lat=50.025097&lon=19.916730

// Path: src\weather.ts

import dotenv from "dotenv";
dotenv.config();

const lat = process.env.LAT;
const lon = process.env.LON;
const identity = process.env.IDENTITY;

export const getWeatherForecast = async () => {
	const req = await fetch(`https://api.met.no/weatherapi/locationforecast/2.0/complete.json?lat=${lat}&lon=${lon}`, {
		method: "GET",
		headers: {
			"User-Agent": identity ?? "Dashboard",
		}
	});

	if(req.status !== 200) {
		console.log("Error: " + req.status);
		return false;
	}

	let data = await req.json();

	let now = new Date();
	now.setMinutes(0);
	now.setSeconds(0);
	now.setMilliseconds(0);

	// find 5 elements separated by 6 hours
	let forecast: WeatherForecast[] = [];
	for(let i = 0; i < data.properties.timeseries.length && forecast.length < 5; i++) {
		let time = new Date(data.properties.timeseries[i].time);
		if(time.getTime() === now.getTime()) {
			forecast.push({
				hour: time.toLocaleTimeString("pl-PL", {
					hour: "2-digit",
				}).split(":")[0],
				plusDay: now.getDate() !== time.getDate(),
				symbol_code: data.properties.timeseries[i].data.next_6_hours.summary.symbol_code,
				temperature: data.properties.timeseries[i].data.instant.details.air_temperature,
				min_temperature: data.properties.timeseries[i].data.next_6_hours.details.air_temperature_min,
				max_temperature: data.properties.timeseries[i].data.next_6_hours.details.air_temperature_max,
				percipitation: data.properties.timeseries[i].data.next_6_hours.details.precipitation_amount,
			});
			now.setHours(now.getHours() + 6);
		}
	}
	forecast = forecast.slice(0, 5);

	return forecast;
}

export const getSunnyHours = async () => {
	const now = new Date();
	const pad = (n: number) => n < 10 ? `0${n}` : n;
	const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
	const offset = -(now.getTimezoneOffset() / 60);
	const formattedOffset = offset < 0 ? `${pad(offset)}:00` : `+${pad(offset)}:00`;
	const urlEncodedOffset = encodeURIComponent(formattedOffset);
	const req = await fetch(`https://api.met.no/weatherapi/sunrise/2.0/.json?date=${date}&days=0&lat=${lat}&lon=${lon}&offset=${urlEncodedOffset}`, {
		method: "GET",
		headers: {
			"Accept": "application/json",
			"User-Agent": identity ?? "Dashboard",
		}
	});

	if(req.status !== 200) {
		console.log("Error: " + req.status);
		return false;
	}

	let data = await req.json();

	let sunrise = new Date(data.location.time[0].sunrise.time);
	let sunset = new Date(data.location.time[0].sunset.time);
	let noon = new Date(data.location.time[0].solarnoon.time);

	let sunHours = (sunset.getTime() - sunrise.getTime()) / 1000 / 60 / 60;
	let sunHoursLeft = (sunset.getTime() - now.getTime()) / 1000 / 60 / 60;

	return {
		sunHours,
		sunHoursLeft,
		sunrise,
		sunset,
		noon,
	}
}

type WeatherForecast = {
	hour: string,
	// is the forecast for the next day
	plusDay: boolean,
	temperature: number,
	min_temperature: number,
	max_temperature: number,
	symbol_code: string,
	percipitation: number,
}