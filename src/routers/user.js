const express = require('express');
const multer = require('multer');
const sharp = require('sharp');

const User = require('../models/user');
const auth = require('../middleware/auth');

const router = new express.Router();


router.post('/users', async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
});

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
});

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
        await req.user.save();
        res.send();
    } catch (error) {
        res.status(500).send();
    }
});

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send();
    } catch (error) {
        res.status(500).send();
    }
});

router.get('/users/me', auth, async (req, res) => {
   res.send(req.user);
});

router.patch('/users/me', auth, async (req, res) => {
    try {
        Object.assign(req.user, req.body);
        await req.user.save();
        res.send(req.user);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

router.delete('/users/me', auth, async (req, res) => {
    try {
        req.user.remove();
        res.send(req.user);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

const upload = multer({
    limits: { fileSize: 1000000 },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('File format unsupported'));
        }
        cb(undefined, true);
    }
});

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    req.user.avatar = await sharp(req.file.buffer)
        .resize({ width: 250, height: 250 }).png().toBuffer();

    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
});

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
});

router.get('/users/:id/avatar', async (req, res) => {
   try {
        const user = await User.findById(req.params.id);

        if (!user || !user.avatar) {
            throw new Error();
        }

        res.set('Content-Type', 'image/png').send(user.avatar);
   } catch (error) {
       res.status(404).send();
   }
});

module.exports = router;