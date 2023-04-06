import dotenv from "dotenv";

dotenv.config();

const lat = process.env.LAT;
const lon = process.env.LON;
const identifier = process.env.IDENTIFIER;

const getWeatherLegend = async () => {
	const req = await fetch("https://api.met.no/weatherapi/weathericon/2.0/legends", {
		method: "GET",
		headers: {
			"User-Agent": identifier ?? "Generic",
		}
	});

	if (req.status !== 200) {
		console.log("Error: " + req.status);
		return {};
	}

	return await req.json();
};

export const getHourlyWeatherForecast = async () => {
	const res = await fetch(`https://api.met.no/weatherapi/locationforecast/2.0/complete.json?lat=${lat}&lon=${lon}`, {
		method: "GET",
		headers: {
			"User-Agent": identifier ?? "Generic",
		}
	});

	if (res.status !== 200) {
		console.log("Error: " + res.status);
		return false;
	}

	let data = await res.json();

	let now = new Date();
	now.setMinutes(0);
	now.setSeconds(0);
	now.setMilliseconds(0);

	// find 5 elements separated by 6 hours
	let forecast: WeatherForecast[] = [];
	for (let i = 0; i < data.properties.timeseries.length && forecast.length < 10; i++) {
		let time = new Date(data.properties.timeseries[i].time);
		if (time.getTime() === now.getTime()) {
			forecast.push({
				hour: time.toLocaleTimeString("pl-PL", {
					timeZone: process.env.TIMEZONE,
					hour: "2-digit",
				}).split(":")[0],
				plusDay: new Date().getDate() !== time.getDate(),
				symbol_code: data.properties.timeseries[i].data.next_1_hours.summary.symbol_code,
				temperature: data.properties.timeseries[i].data.instant.details.air_temperature,
				precipitation: data.properties.timeseries[i].data.next_1_hours.details.precipitation_amount,
				wind_speed: data.properties.timeseries[i].data.instant.details.wind_speed,
				description: "",
				humidity: data.properties.timeseries[i].data.instant.details.relative_humidity,
				wind_direction: data.properties.timeseries[i].data.instant.details.wind_from_direction,
			});
			now.setHours(now.getHours() + 1);
		}
	}
	forecast = forecast.slice(0, 10);

	const legend = await getWeatherLegend();
	for (let i = 0; i < forecast.length; i++) {
		let symbol_code = forecast[i].symbol_code.split("_")[0];
		if (legend[symbol_code]) {
			forecast[i].description = legend[symbol_code].desc_en;
			continue;
		}
		forecast[i].description = "Error";
	}

	return forecast;
};

export const getWeatherForecast = async () => {
	const res = await fetch(`https://api.met.no/weatherapi/locationforecast/2.0/complete.json?lat=${lat}&lon=${lon}`, {
		method: "GET",
		headers: {
			"User-Agent": identifier ?? "Generic",
		}
	});

	if (res.status !== 200) {
		console.log("Error: " + res.status);
		return false;
	}

	let data = await res.json();

	let now = new Date();
	now.setMinutes(0);
	now.setSeconds(0);
	now.setMilliseconds(0);

	// find 5 elements separated by 6 hours
	let forecast: WeatherForecast[] = [];
	for (let i = 0; i < data.properties.timeseries.length && forecast.length < 5; i++) {
		let time = new Date(data.properties.timeseries[i].time);
		if (time.getTime() === now.getTime()) {
			forecast.push({
				hour: time.toLocaleTimeString("pl-PL", {
					timeZone: process.env.TIMEZONE,
					hour: "2-digit",
				}).split(":")[0],
				plusDay: new Date().getDate() !== time.getDate(),
				symbol_code: data.properties.timeseries[i].data.next_6_hours.summary.symbol_code,
				temperature: data.properties.timeseries[i].data.instant.details.air_temperature,
				precipitation: data.properties.timeseries[i].data.next_6_hours.details.precipitation_amount,
				wind_speed: data.properties.timeseries[i].data.instant.details.wind_speed,
				description: "",
				humidity: data.properties.timeseries[i].data.instant.details.relative_humidity,
				wind_direction: data.properties.timeseries[i].data.instant.details.wind_from_direction,
			});
			now.setHours(now.getHours() + 6);
		}
	}
	forecast = forecast.slice(0, 5);

	const legend = await getWeatherLegend();
	for (let i = 0; i < forecast.length; i++) {
		let symbol_code = forecast[i].symbol_code.split("_")[0];
		if (legend[symbol_code]) {
			forecast[i].description = legend[symbol_code].desc_en;
			continue;
		}
		forecast[i].description = "Error";
	}

	return forecast;
};


export const getSolarData = async () => {
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
			"User-Agent": identifier ?? "Dashboard",
		}
	});

	if (req.status !== 200) {
		console.log("Error: " + req.status);
		return false;
	}

	let data = await req.json();

	let sunrise = new Date(data.location.time[0].sunrise.time);
	let sunset = new Date(data.location.time[0].sunset.time);
	let noon = new Date(data.location.time[0].solarnoon.time);
	let moonphase = data.location.time[0].moonphase.value;

	let sunHours = (sunset.getTime() - sunrise.getTime()) / 1000 / 60 / 60;
	let sunHoursLeft = (sunset.getTime() - now.getTime()) / 1000 / 60 / 60;

	return {
		sunHours,
		sunHoursLeft,
		sunrise,
		sunset,
		noon,
		moonphase,
	};
};

type WeatherForecast = {
	hour: string,
	// is the forecast for the next day
	plusDay: boolean,
	temperature: number,
	symbol_code: string,
	precipitation: number,
	wind_speed: number,
	description: string,
	humidity: number,
	wind_direction: number,
}