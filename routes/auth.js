/*jshint esversion: 6 */
var express = require("express");
var nodemailer = require('nodemailer');
var async = require('async');
var router = express.Router();
var crypto = require('crypto');
var passport = require("passport");
var User = require('../models/user');

// Registration form
router.get("/register", function(req, res) {
    if (req.user) { //check if alredy logged in
        return res.redirect("/");
    }
    res.render("register");
});

// User Register
router.post("/register", function(req, res) {
    User.register(new User({ name: req.body.name, username: req.body.username, phone: req.body.phone, role: req.body.role }), req.body.password, function(err, user) {
        if (err) {
            return res.render("registrationError", { err });
        }
        passport.authenticate("local")(req, res, function() {
            if (req.body.role === 'admin') {
                return res.redirect('/viewOrganization');
            } else if (req.body.role === 'trainer') {
                return res.redirect('/selectOrganizationTeacher');
            } else if (req.body.role === 'learner') {
                return res.redirect('/selectOrganizationStudent');
            }
            res.redirect('/');
        });
    });
});

// Login form
router.get("/login", function(req, res) {
    if (req.user) { //check if alredy logged in
        return res.redirect("/");
    }
    res.render("login");
});

// User Login
router.post("/login", passport.authenticate("local", {
        failureRedirect: "/auth/login"
    }),
    function(req, res) {
        if (req.query.next != undefined) {
            res.redirect(`${req.query.next}`);
        } else {
            if (req.user.role === 'admin') {
                return res.redirect('/viewOrganization');
            } else if (req.user.role === 'trainer') {
                if (req.user.verified === true) {
                    return res.redirect('/panel')
                }
                return res.redirect('/selectOrganizationTeacher');
            } else if (req.user.role === 'learner') {
                if (req.user.verified === true) {
                    return res.redirect('/panel')
                }
                return res.redirect('/selectOrganizationStudent');
            }
            res.redirect('/');
        }
    });

// User Logout
router.get("/logout", function(req, res) {
    req.logout(); ///destroying user session
    req.user = undefined;
    res.redirect("/");
});

router.get('/forgot', function(req, res) {
    res.render('forgot');
});

router.post('/forgot', function(req, res, next) {
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            User.findOne({ username: req.body.username }, function(err, user) {
                if (!user) {
                    var er = 'No account with that email address exists.';
                    return res.render('error', { er });
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function(err) {
                    done(err, token, user);
                });
            });
        },
        function(token, user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: 'apikey',
                    pass: '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'
                }
            });
            var mailOptions = {
                to: user.username,
                from: 'bitbots@igdtu.com',
                subject: 'Password Reset Link for the portal',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/auth/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                done(err, 'done');
            });
        }
    ], function(err) {
        if (err) return next(err);
        res.redirect('/auth/emailSent');
    });
});

router.get('/emailSent', function(req, res) {
    res.render('emailSent');
});

router.get('/reset/:token', function(req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
            return res.redirect('/auth/forgot');
        }
        res.render('createPassword', {
            token: req.params.token
        });
    });
});

router.post('/reset/:token', function(req, res, next) {
    async.waterfall([
        function(done) {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
                if (!user) {
                    return res.redirect('back');
                }

                user.setPassword(req.body.password, function(err) {
                    user.resetPasswordToken = undefined;
                    user.resetPasswordExpires = undefined;

                    user.save(function(err) {
                        req.logIn(user, function(err) {
                            done(err, user);
                        });
                    });
                });
            });
        },
        function(user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: 'apikey',
                    pass: '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'
                }
            });
            var mailOptions = {
                to: user.username,
                from: 'bitbots@igdtu.com',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.username + ' has just been changed.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                done(err);
            });
        }
    ], function(err) {
        res.redirect('/auth/passwordChangeSuccess');
    });
});

router.get('/passwordChangeSuccess', function(req, res) {
    res.render('passwordChangeSuccess');
})

module.exports = router;