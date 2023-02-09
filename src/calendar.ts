import { DAVClient, DAVObject } from "tsdav";
import dotenv from "dotenv";
import ical from "ical";

dotenv.config();

const client = new DAVClient({
	serverUrl: process.env.CALDAV_URL || "",
	credentials: {
		username: process.env.CALDAV_USERNAME,
		password: process.env.CALDAV_PASSWORD,
	},
	authMethod: "Basic",
	defaultAccountType: "caldav",
})

export async function getCalendars() {
	await client.login();
	const calendars = await client.fetchCalendars();
	console.log(calendars);
	return calendars;
}

export async function getCalendarObjects() {
	await client.login();
	const calendars = await client.fetchCalendars();
	let events = [];
	for(const calendar of calendars) {
		const objects = await client.fetchCalendarObjects({calendar});
		console.log(objects);
		events.push(objects);
	}
	return events;
}

export async function getDataFromCalendarObject(object: DAVObject) {
	let parsed = ical.parseICS(object.data);
	return parsed;
}