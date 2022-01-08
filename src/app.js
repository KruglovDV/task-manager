const mongoose = require('mongoose');
const express = require('express');

const userRoutes = require('./routers/user');
const taskRoutes = require('./routers/task');

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json())
app.use(userRoutes);
app.use(taskRoutes);

const startApp = async () => {

    await mongoose.connect(process.env.MONGODB_URL);

    app.listen(PORT, () => {
        console.log(`application started on ${PORT}`);
    });
};

module.exports = { app, startApp };