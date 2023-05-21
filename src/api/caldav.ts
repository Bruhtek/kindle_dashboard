import { KalenderEvents } from "kalender-events";
import dotenv from "dotenv";

dotenv.config();

const caldavURL = process.env.CALDAV_URL || "";
const caldavUser = process.env.CALDAV_USER || "";
const caldavPass = process.env.CALDAV_PASS || "";

export const fetchEventsForDay = async (dayOffset: number) => {
	const kalenderEvents = new KalenderEvents({
		url: caldavURL,
		username: caldavUser,
		password: caldavPass
	});

	const currentTime = new Date();
	const startTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate() + dayOffset, 0, 0, 0);

	return await kalenderEvents.getEvents({
		type: "caldav",
		pastview: 0,
		pastviewUnits: "days",
		now: startTime,
		preview: 1,
		previewUnits: "days",
	});
};

export async function getCalendarEvents() {
	console.log("Starting calendar operations!");

	const todayEvents = await fetchEventsForDay(0);
	const tommorowEvents = await fetchEventsForDay(1);

	return {
		todayEvents,
		tommorowEvents
	};
}