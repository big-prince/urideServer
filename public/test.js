import app from "../src/app"
import supertest from "supertest"

const request = supertest(app)

describe("Testing root", () => {
    it("should return a response", async () => {
        const response = await request.get("/")
        expect(response.status).toBe(200)
        // expect(response.text).toBe("Hello there!");
    })
})
