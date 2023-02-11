import dotenv from "dotenv";

dotenv.config();

export const getLightStatus = async () => {
	let req = await fetch(`${process.env.HA_URL}/api/states/${process.env.HA_ENTITY_ID}`, {
		method: "GET",
		headers: {
			"Authorization": `Bearer ${process.env.HA_TOKEN}`,
			"Content-Type": "application/json",
		}
	});
	if (req.status !== 200) {
		console.log("Error: " + req.status);
		return false;
	}
	let data = await req.json();
	return data.state === "on";
};

export const toggleLight = async () => {
	const req = await fetch(`${process.env.HA_URL}/api/services/light/toggle`, {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${process.env.HA_TOKEN}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			entity_id: process.env.HA_ENTITY_ID,
		}),
	});
	if (req.status !== 200) {
		console.log("Error: " + req.status);
		return "error";
	} else {
		let json = await req.json();
		return json[0].state;
	}
};