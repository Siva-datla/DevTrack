import { Router } from "express";

export const testingRoute = Router();

testingRoute.get("/", (req, res) => {
    res.send("Testing route");
});

export default testingRoute; 