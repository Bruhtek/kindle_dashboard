import { Router } from "express";
import { toggleLight } from "../api/hass";
import dotenv from "dotenv";

dotenv.config();

const apiRouter = Router();

let battery = 100;
export const getBattery = () => battery;
export const setBattery = (value: number) => {
	battery = value;
};

apiRouter.get("/", (req, res) => {
	return res.json("200 OK");
});
apiRouter.get("/battery", (req, res) => {
	return res.json(battery);
});
apiRouter.get("/setBattery", (req, res) => {
	const value = req.query.battery;
	if (value) {
		setBattery(Number(value));
		console.log(new Date().toISOString() + " Battery: " + battery);
		return res.json(battery);
	} else {
		console.log("Bad Battery Request");
		return res.json("400 Bad Request");
	}
});
apiRouter.get("/toggleLight", async (req, res) => {
	console.log("Get toggleLight");
	const result = await toggleLight();
	console.log(result);
	return res.json({status: result});
});
export default apiRouter;