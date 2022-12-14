import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";

it("has a route handler listening to /api/tickets fro post request", async () => {
  const response = await request(app).post("/api/tickets").send({});

  expect(response.status).not.toEqual(404);
});

it("can only be accessed if the user is signed in", async () => {
  const response = await request(app).post("/api/tickets").send({});
  expect(response.status).toEqual(401);
});

it("return status other than 401 if the user is signed in", async () => {
  const cookie = await global.signin();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({});
  expect(response.status).not.toEqual(401);
});

it("return an error if invalid title is provided", async () => {
  const cookie = await global.signin();
  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "",
      price: 10,
    })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      price: 10,
    })
    .expect(400);
});

it("return an error if invalid price is provided", async () => {
  const cookie = await global.signin();
  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "asdf",
      price: -10,
    })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      price: "dsfsdff",
    })
    .expect(400);
});

it("creates a ticket with valid inputs", async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  const cookie = await global.signin();
  const title = "asdf";
  const price = 10;

  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title,
      price,
    })
    .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);

  expect(tickets[0].title).toEqual(title);
  expect(tickets[0].price).toEqual(price);
});
