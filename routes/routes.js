const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');
const fs = require('fs');


// image upload
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
});

var upload = multer({
    storage: storage,
}).single('image');

// Get all users route
router.get('/', (req, res) => {
    User.find().exec().then((users) => {
        res.render('index', {
            title: 'Home Page',
            users: users,
        });
    }).catch((err) => {
        res.json({ message: err.message });
    });
});

router.get('/add', (req, res) => {
    res.render('add_users', { title: "Add Users" })
});

// Insert an user into database route
router.post('/add', upload, (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename,
    });
    user.save().then((data) => {
        console.log(`THA USER DATA: ${data}`);
        req.session.message = {
            type: 'success',
            message: 'User added successfully!'
        };
        res.redirect("/");
    }).catch((err) => {
        res.json({ message: err.message, type: 'danger' });
    });
});

// Edit an user route
router.get('/edit/:id', (req, res) => {
    let id = req.params.id;
    User.findById(id).then((user) => {
        if (user == null) {
            res.redirect('/');
        } else {
            res.render('edit_users', {
                title: "Edit Users",
                user: user,
            })
        }
    }).catch((err) => {
        res.redirect('/');
    });
});

// update user route
router.post('/update/:id', upload, (req, res) => {
    let id = req.params.id;
    let new_image = '';

    if (req.file) {
        new_image = req.file.filename;
        try {
            fs.unlinkSync('./uploads/' + req.body.old_image);
        } catch (error) {
            console.log(error);
        }
    } else {
        new_image = req.body.old_image;
    }

    User.findByIdAndUpdate(id, {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: new_image
    }).then((user) => {
        req.session.message = {
            type: 'success',
            message: 'User updated successfully!'
        };
        res.redirect('/');
    }).catch((error) => {
        res.json({ message: error.message, type: 'danger' });
    });
});

// Delete user route
router.get('/delete/:id', (req, res) => {
    let id = req.params.id;
    User.findByIdAndRemove(id).then((user) => {
        if (user.image != '') {
            try {
                fs.unlinkSync('./uploads/' + user.image);
            } catch (error) {
                console.log(error);
            }
        }

        req.session.message = {
            type: 'info',
            message: 'User deleted successfully!',
        };
        res.redirect('/');
    }).catch((error) => {
        res.json({ message: error.message, type: 'danger' });
    });
});



module.exports = router;