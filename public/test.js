// test/app.test.js
import request from "supertest";
import app from "../src/app";

describe("uride app", () => {
	it("should respond to GET /ping with status 200", async () => {
		const res = await request(app).get("/ping");
		expect(res.statusCode).toEqual(200);
		expect(res.text).toBe("uRide Server is Up n Running");
	});

	it("should respond to GET / with status 200 and serve index.html", async () => {
		const res = await request(app).get("/");
		expect(res.statusCode).toEqual(200);
		expect(res.header["content-type"]).toContain("text/html");
	});

	it("should handle POST /submitPhoneNumber and respond with a success message", async () => {
		const res = await request(app)
			.post("/submitPhoneNumber")
			.send({ phoneNumber: "1234567890" });
		expect(res.statusCode).toEqual(200);
		expect(res.body.message).toBe("Phone number received successfully");
	});

	it("should return 404 for unknown routes", async () => {
		const res = await request(app).get("/unknown-route");
		expect(res.statusCode).toEqual(404);
		expect(res.body.message).toBe("Not found");
	});
});
