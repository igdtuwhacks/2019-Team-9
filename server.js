/*jshint esversion: 6 */

// Importing modules
var express = require('express'),
    passport = require('passport'),
    mongoose = require('mongoose'),
    LocalStrategy = require("passport-local"),
    bodyParser = require("body-parser"),
    nodemailer = require('nodemailer'),
    app = express(),
    async = require('async'),
    passportLocalMongoose = require("passport-local-mongoose");
multer = require('multer');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, (Date.now() + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]).toString());
    }
});

const upload = multer({
    storage: storage
});

// Importing models
var User = require('./models/user');
var Organization = require('./models/organization');
var Subject = require('./models/subject');
var Course = require('./models/course');
var Material = require('./models/material');

var authRoutes = require('./routes/auth');

// Connecting to MongoDB via mongoose
// mongoose.connect("mongodb://localhost:27017/hp_intern", {
//     reconnectTries: Number.MAX_VALUE,
//     reconnectInterval: 1000,
//     useCreateIndex: true,
//     useNewUrlParser: true
// });

mongoose.connect("mongodb://hackthon:igdtuw1@ds263856.mlab.com:63856/hackathon", {
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 1000,
    useCreateIndex: true,
    useNewUrlParser: true
});

// For session
app.use(require("express-session")({
    secret: "Rusty is the cutest",
    resave: false,
    saveUninitialized: false,
}));

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Using external routes 
app.use('/auth', authRoutes);

app.get("/", function(req, res) {
    res.render('home');
});

app.get('/profile', isLoggedIn, function(req, res) {
    User.findById(req.user._id, function(err, user) {
        if (!err) {
            res.render('profile', { user })
        }
    });
});

app.get('/selectOrganizationStudent', isLearnerLoggedIn, function(req, res) {
    Organization.find({}, function(err, orgs) {
        if (!err) {
            var orgArr = [];
            orgs.forEach((b) => {
                orgArr.push(b);
            });
            res.render('selectOrganization', { orgArr, req });
        }
    });
});

app.get('/selectCourseStudent', isLearnerLoggedIn, function(req, res) {
    Organization.findById(req.user.organization, function(err, org) {
        if (!err) {
            var orgArr = [],
                i = 0;
            if (org.courses.length === 0) {
                return res.render('selectCourse', { orgArr })
            }
            org.courses.forEach((e, index) => {
                Course.findById(e, function(er, sub) {
                    if (!er) {
                        orgArr.push(sub);
                        if (org.courses.length === index + 1) {
                            setTimeout(() => {
                                res.render('selectCourse', { orgArr });
                            }, 100);
                        }
                    }
                });
            });
        }
    });
});

app.get('/selectOrgStudent/:id', isLearnerLoggedIn, function(req, res) {
    User.findByIdAndUpdate(req.user._id, { organization: req.params.id }, function(err, usr) {
        if (!err) {
            res.redirect('/selectCourseStudent');
        }
    });
});

app.get('/addSubject', isAdminLoggedIn, function(req, res) {
    res.render('addSubject', req.user);
});

app.get('/addCourse', isAdminLoggedIn, function(req, res) {
    Organization.findById(req.user.organization, function(err, org) {
        if (!err) {
            var subArr = [],
                i = 0;
            if (org.subjects.length === 0) {
                return res.render('addCourse', { subArr })
            }
            org.subjects.forEach((e, index) => {
                Subject.findById(e, function(er, sub) {
                    if (!er) {
                        subArr.push(sub);
                        if (org.subjects.length === index + 1) {
                            setTimeout(() => {
                                res.render('addCourse', { subArr });
                            }, 100);
                        }
                    }
                });
            });
        }
    });
});

app.post('/addSubject', isAdminLoggedIn, function(req, res) {
    var subject = new Subject({
        compulsory: req.body.compulsory,
        name: req.body.name,
        credits: req.body.credits
    });

    subject.save(function(err, sub) {
        if (!err) {
            Organization.findByIdAndUpdate(req.user.organization, { $push: { subjects: sub._id } }, function(er, r) {
                if (!er) {
                    res.status(200).send('Done');
                }
            });
        }
    });
});

app.post('/addCourse', isAdminLoggedIn, function(req, res) {
    var course = new Course({
        name: req.body.name,
        semesters: req.body.semesters,
        description: req.body.description,
        subjects: req.body.x
    });

    course.save(function(err, sub) {
        if (!err) {
            Organization.findByIdAndUpdate(req.user.organization, { $push: { courses: sub._id } }, function(er, r) {
                if (!er) {
                    res.status(200).send('Done');
                }
            });
        }
    });
});

app.post('/addCourse', isAdminLoggedIn, function(req, res) {
    var course = new Course({
        name: req.body.name,
        description: req.body.description,
        credits: req.body.credits
    });

    subject.save(function(err, sub) {
        if (!err) {
            Organization.findByIdAndUpdate(req.user.organization, { $push: { subjects: sub._id } }, function(er, r) {
                if (!er) {
                    res.status(200).send('Done');
                }
            });
        }
    });
});

app.get('/subjects', isAdminLoggedIn, function(req, res) {
    Organization.findById(req.user.organization, function(err, org) {
        if (!err) {
            var subArr = [],
                i = 0;
            if (org.subjects.length === 0) {
                return res.render('subjects', { subArr })
            }
            org.subjects.forEach((e, index) => {
                Subject.findById(e, function(er, sub) {
                    if (!er) {
                        subArr.push(sub);
                        if (org.subjects.length === index + 1) {
                            setTimeout(() => {
                                res.render('subjects', { subArr });
                            }, 100);
                        }
                    }
                });
            });
        }
    });
});

app.get('/courses', isAdminLoggedIn, function(req, res) {
    Organization.findById(req.user.organization, function(err, org) {
        if (!err) {
            var subArr = [],
                i = 0;
            if (org.courses.length === 0) {
                return res.render('courses', { subArr })
            }
            org.courses.forEach((e, index) => {
                Course.findById(e, function(er, sub) {
                    if (!er) {
                        subArr.push(sub);
                        if (org.courses.length === index + 1) {
                            setTimeout(() => {
                                res.render('courses', { subArr });
                            }, 100);
                        }
                    }
                });
            });
        }
    });
});

app.get('/selCourseStudent/:id', isLearnerLoggedIn, function(req, res, next) {
    async.waterfall([
        function(done) {
            Organization.findById(req.user.organization, function(err, org) {
                if (!err) {
                    User.findById(org.admin, function(err, user) {
                        if (!user) {
                            return res.redirect('back');
                        }
                        done(err, user);
                    });
                }
            });
        },
        function(user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'sendGrid',
                auth: {
                    user: 'apikey',
                    pass: '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'
                }
            });
            var mailOptions = {
                to: user.username,
                from: 'bitbots@igdtu.com',
                subject: 'New trainee',
                text: 'Hello,\n\n' +
                    'This is a confirmation that a new trainee has joined. \nEmail: ' + req.user.username + '\nVerify using the link: ' + 'http://' + req.headers.host + '/course/verify/' + req.user._id + '/' + req.params.id
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                done(err);
            });
        }
    ], function(err) {
        res.redirect('/');
    });
});

app.get('/selectOrgTeacher/:id', isTrainerLoggedIn, function(req, res, next) {
    async.waterfall([
        function(done) {
            Organization.findById(req.params.id, function(err, org) {
                if (!err) {
                    User.findById(org.admin, function(err, user) {
                        if (!user) {
                            return res.redirect('back');
                        }
                        done(err, user);
                    });
                }
            });
        },
        function(user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'sendGrid',
                auth: {
                    user: 'apikey',
                    pass: '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'
                }
            });
            var mailOptions = {
                to: user.username,
                from: 'bitbots@igdtu.com',
                subject: 'New trainer',
                text: 'Hello,\n\n' +
                    'This is a confirmation that a new trainer has joined. \nEmail: ' + req.user.username + '\nVerify using the link: ' + 'http://' + req.headers.host + '/verify/' + req.user._id
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                done(err);
            });
        }
    ], function(err) {
        res.redirect('/');
    });
});

app.post('/uploadCourseMaterial', isTrainerLoggedIn, upload.single('file'), function(req, res) {
    var material = new Material({
        file: req.file.filename,
        name: req.body.name,
        guidelines: req.body.guidelines,
        organization: req.user.organization
    });

    material.save(function(err, mat) {
        if (!err) {
            res.redirect('/panel');
        }
    });
});

app.post('/uploadAssignment', isTrainerLoggedIn, upload.single('file'), function(req, res) {
    var material = new Material({
        file: req.file.filename,
        name: req.body.name,
        guidelines: req.body.guidelines,
        organization: req.user.organization,
        assignment: true
    });

    material.save(function(err, mat) {
        if (!err) {
            res.redirect('/panel');
        }
    });
});

app.get('/downloadCourseMaterial', isLearnerLoggedIn, function(req, res) {
    Material.find({ assignment: false }, function(err, docs) {
        if (!err) {
            var arr = [];
            docs.forEach(e => {
                arr.push(e);
            });
            res.render('downloadCourse', { req, arr });
        }
    });
});

app.get('/rateTrainer', isLearnerLoggedIn, function(req, res) {
    User.find({ role: 'trainer' }, function(err, docs) {
        if (!err) {
            var arr = [];
            docs.forEach(e => {
                arr.push(e);
            });
            res.render('rateTrainer', { req, arr });
        }
    });
});

app.get('/downloadAssignment', isLearnerLoggedIn, function(req, res) {
    Material.find({ assignment: true }, function(err, docs) {
        if (!err) {
            var arr = [];
            docs.forEach(e => {
                arr.push(e);
            });
            res.render('downloadAssignment', { req, arr });
        }
    });
});

app.get('/panel', function(req, res) {
    res.render('panel', { req });
});

app.get('/uploadCourseMaterial', isTrainerLoggedIn, function(req, res) {
    res.render('uploadCourseMaterial');
});

app.get('/uploadAssignment', isTrainerLoggedIn, function(req, res) {
    res.render('uploadAssignment');
});

app.get('/viewCourse', isLoggedIn, function(req, res) {
    if (req.user.role === 'admin') {
        res.redirect('/');
    } else {
        res.render('viewCourse', { req });
    }
});

app.get('/verify/:id', isAdminLoggedIn, function(req, res) {
    User.findOneAndUpdate({ _id: req.params.id, verified: false }, { verified: true }, function(err, usr) {
        res.redirect('/');
    });
});

app.get('/course/verify/:userid/:courseid', isAdminLoggedIn, function(req, res) {
    User.findOneAndUpdate({ _id: req.params.userid, verified: false }, { course: req.params.courseid, verified: true }, function(err, doc) {
        if (!err) {
            res.redirect('/');
        }
    });
});

app.get('/registerOrganization', isAdminLoggedIn, function(req, res) {
    res.render('registerOrganization');
});

app.get('/viewOrganization', isAdminLoggedIn, function(req, res) {
    if (typeof req.user.organization === 'undefined') {
        return res.redirect('/registerOrganization');
    }
    Organization.findById(req.user.organization, function(err, org) {
        if (!err) {
            res.render('viewOrganization', { req, org });
        }
    });
});

app.post('/registerOrganization', isAdminLoggedIn, upload.single('logo'), function(req, res) {
    var org = new Organization({
        logo: req.file.filename,
        description: req.body.description,
        name: req.body.name,
        address: req.body.address,
        admin: req.user._id
    });

    org.save(function(err, organization) {
        if (!err) {
            User.findByIdAndUpdate(req.user._id, { organization: organization._id }, function(err, usr) {
                if (!err) {
                    res.redirect('/addSubject');
                }
            });
        }
    });
});

app.get('/priorities', isTrainerLoggedIn, function(req, res) {

});

app.get('/selectOrganizationTeacher', isTrainerLoggedIn, function(req, res) {
    if (req.user.verfied === true) {
        return res.redirect('/priorities');
    }
    Organization.find({}, function(err, orgs) {
        if (!err) {
            var orgArr = [];
            orgs.forEach((b) => {
                orgArr.push(b);
            });
            res.render('selectOrganizationTeacher', { orgArr, req });
        }
    });
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.render('unauthorizedError');
}

function isLearnerLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        if (req.user.role === 'learner') {
            return next();
        }
    }
    res.render('unauthorizedError');
}

function isTrainerLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        if (req.user.role === 'trainer') {
            return next();
        }
    }
    res.render('unauthorizedError');
}

function isAdminLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        if (req.user.role === 'admin') {
            return next();
        }
    }
    res.render('unauthorizedError');
}

var port = 4000 || process.env.PORT;
app.listen(port, function() {
    console.log("Serving on port", port);
});