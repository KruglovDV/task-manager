const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../../src/models/user');
const Task = require('../../src/models/task');

const userOneId = new mongoose.Types.ObjectId();

const userOne = {
  _id: userOneId,
  name: 'Test user',
  email: 'test@example.com',
  password: 'testpass',
  tokens: [{
    token: jwt.sign({ _id: userOneId }, process.env.SECRET_KEY),
  }],
};

const userTwoId = new mongoose.Types.ObjectId();

const userTwo = {
  _id: userTwoId,
  name: 'Test user 2',
  email: 'test2@example.com',
  password: 'testpass',
  tokens: [{
    token: jwt.sign({ _id: userTwoId }, process.env.SECRET_KEY),
  }],
};

const taskOne = {
  _id: new mongoose.Types.ObjectId(),
  description: 'Test task description',
  completed: false,
  owner: userOne._id,
};

const taskTwo = {
  _id: new mongoose.Types.ObjectId(),
  description: 'Test task two description',
  completed: true,
  owner: userOne._id,
};

const taskThree = {
  _id: new mongoose.Types.ObjectId(),
  description: 'Test task three description',
  completed: true,
  owner: userTwo._id,
};

const setupDatabase = async () => {
  await mongoose.connect(process.env.MONGODB_URL);
  await User.deleteMany();
  await Task.deleteMany();
  await new User(userOne).save();
  await new User(userTwo).save();
  await new Task(taskOne).save();
  await new Task(taskTwo).save();
  await new Task(taskThree).save();
};

module.exports = {
  setupDatabase,
  userOne,
  userOneId,
  userTwo,
  userTwoId,
  taskOne,
  taskTwo,
  taskThree,
};
