const request = require('supertest');

const { app } = require('../src/app');
const User = require('../src/models/user');
const { setupDatabase, userOne, userOneId } = require('./fixtures/db');

beforeEach(setupDatabase);

test('Should signup a new user', async () => {
  const userRequest = {
    name: 'Test user',
    email: 'testtest@example.com',
    password: 'testpass',
  };
  const response = await request(app)
    .post('/users')
    .send(userRequest)
    .expect(201);

  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();
  expect(response.body).toMatchObject({
    user: {
      name: userRequest.name,
      email: userRequest.email,
    },
    token: user.tokens[0].token,
  });
  expect(user.password).not.toBe(userRequest.password);
});

test('Should login existing user', async () => {
  const response = await request(app).post('/users/login').send({
    email: userOne.email,
    password: userOne.password,
  }).expect(200);

  const user = await User.findById(userOne._id);

  expect(response.body.token).toBe(user.tokens[1].token);
});

test('Should not login nonexistent user', async () => {
  await request(app).post('/users/login').send({
    email: 'unexistedmail@example.com',
    password: 'testpass',
  }).expect(400);
});

test('Should get profile fro user', async () => {
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test('Should not get profile for unauthenticated user', async () => {
  await request(app).get('/users/me').send().expect(401);
});

test('Should delete account for user', async () => {
  await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user).toBeNull();
});

test('Should not delete account for unauthenticated user', async () => {
  await request(app)
    .delete('/users/me')
    .send()
    .expect(401);
});

test('Should upload avatar image', async () => {
  await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/avatar.png');

  const user = await User.findById(userOneId);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test('Should update user', async () => {
  const updateUserRequest = { name: 'updated name' };
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send(updateUserRequest);

  const user = await User.findById(userOneId);
  expect(user.name).toBe(updateUserRequest.name);
});

test('Should not update invalid user fields', async () => {
  const updateUserRequest = { someField: 'some value' };
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send(updateUserRequest);

  const user = await User.findById(userOneId);
  expect(user.someField).toBe(undefined);
});
