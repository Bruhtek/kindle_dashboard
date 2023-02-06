export const getLightStatus = async () => {
	let req = await fetch(`${process.env.HA_URL}/api/states/${process.env.HA_ENTITY_ID}`, {
		method: "GET",
		headers: {
			"Authorization": `Bearer ${process.env.HA_TOKEN}`,
			"Content-Type": "application/json",
		}
	});
	if(req.status !== 200) {
		console.log("Error: " + req.status);
		return false;
	}
	let data = await req.json();
	return data.state === "on";

}

export const batteryInfo = (battery: string) => {
	const batteryLevel = battery === "N/A" ? -1 : parseInt(battery)
	// get level of 0 - 4
	const batteryIcon = batteryLevel === -1 ? "nf-md-battery_alert" : "nf-fa-battery_" + Math.round(batteryLevel / 25);
	return {
		battery,
		batteryIcon,
		batteryLevel,
	}
}
