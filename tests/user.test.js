const request = require('supertest');
const mongoose = require('mongoose');

const { app } = require('../src/app');
const User = require('../src/models/user');

const userOne = {
    name: 'Test user',
    email: 'test@example.com',
    password: 'testpass'
}

beforeAll(async () => {
    const CONNECTION_URL = process.env.MONGODB_URL;
    await mongoose.connect(CONNECTION_URL);
});

beforeEach(async () => {
    await User.deleteMany();
    await new User(userOne).save();
});

test('Should signup a new user', async () => {
    await request(app).post('/users').send({
        name: 'Test user',
        email: 'testtest@example.com',
        password: 'testpass',
    }).expect(201);
});

test('Should login existing user', async () => {
   await request(app).post('/users/login').send({
      email: userOne.email,
      password: userOne.password
   }).expect(200);
});

test('Should not login nonexistent user', async () => {
   await request(app).post('/users/login').send({
       email: 'unexistedmail@example.com',
       password: 'testpass'
   }).expect(400)
});