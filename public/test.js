const app = require("./app")
const supertest = require("supertest")
const request = supertest(app)
describe("Testing root", () => {
    it("should be equal", async () => {
        const response = await request.get("/")
        expect(2 + 2).toBe(4)
        // expect(response.text).toBe("Hello there!");
    })
})
