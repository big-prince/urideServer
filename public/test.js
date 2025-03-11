// import request from "supertest";
import app from "../src/app";
import supertest from "supertest"

const request = supertest(app)

describe("Testing root", () => {
    it("should return a response", async () => {
        const response = await request.get("/")
        expect(response.status).toBe(200)
        // expect(response.text).toBe("Hello there!");
    })
})

describe("uride app", () => {
	it("should respond to GET /ping with status 200", async () => {
		const res = await request.get("/ping");
		expect(res.statusCode).toEqual(200);
		expect(res.text).toBe("uRide Server is Up n Running");
	});

	it("should respond to GET / with status 200 and serve index.html", async () => {
		const res = await request.get("/");
		expect(res.statusCode).toEqual(200);
		expect(res.header["content-type"]).toContain("text/html");
	});

	it("should handle POST /submitPhoneNumber and respond with a success message", async () => {
		const res = await request
			.post("/submitPhoneNumber")
			.send({ phoneNumber: "1234567890" });
		expect(res.statusCode).toEqual(200);
		expect(res.body.message).toBe("Phone number received successfully");
	});

	it("should return 404 for unknown routes", async () => {
		const res = await request.get("/unknown-route");
		expect(res.statusCode).toEqual(404);
		expect(res.body.message).toBe("Not found");
	});
});


//This are just some sample tests