"use strict";

/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */

var mongoose = require('mongoose');
var async = require('async');


// Load the Mongoose schema for User, Photo, and SchemaInfo
var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var SchemaInfo = require('./schema/schemaInfo.js');
var fs = require("fs");
var express = require('express');
var app = express();

var session = require('express-session');
var bodyParser = require('body-parser');
var multer = require('multer');
var processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');

// XXX - Your submission should work without this line
//var cs142models = require('./modelData/photoApp.js').cs142models;

mongoose.connect('mongodb://localhost/cs142project6');

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));
app.use(session({secret: 'secretKey', resave: false, saveUninitialized: false}));
app.use(bodyParser.json());


app.get('/', function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

app.post('/admin/login', function(request, response) {
    var login_name = request.body.login_name;
    var password = request.body.password;
    console.log("in post");
    User.findOne( {login_name: login_name}, function(err, user) {
        if (!user) {
            console.log("cant find user");
            response.status(400).end("No such user");
            return;
        }
        if (err) {
            console.error("Doing /admin/login error:", err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (request.body.password !== user.password) {
            console.log(password);
            console.log(user.password);
            console.log("incorrect password");
            return;
        }
        console.log(user);
        request.session.user_id = user._id;
        request.session.login_name = user.login_name;
        var result = {_id: user._id, login_name: user.login_name, first_name: user.first_name};
      response.status(200).end(JSON.stringify(result));
    });
});

app.post("/admin/logout", function (request, response) {
    if (request.session.login_name === undefined || request.session.login_name ==="") {
        console.log("tried to log out without being logged in");
        response.status(400).end();
    }
    request.session.destroy();
    response.status(200).end("log out successful");
});

app.post("/commentsOfPhoto/:photo_id", function(request, response) {
    var commentText= request.body.comment;
    var login_name = request.session.login_name;
    var photoId = request.params.photo_id;
    var userId= request.session.user_id;
    if (login_name === undefined) {
        console.log("login name undefined");
        response.status(401).end("Unauthorized: No user logged in");
        return;
    }
    if (commentText === '' || commentText === undefined) {
        console.log("coment empty");
        response.status(400).end("Bad Request: empty comment");
    }

    Photo.findOne({_id: photoId}, function(err, pic) {
        if (!pic) {
            console.log("couldn't find picture");
            response.status(400).send("Object not found");
            return;
        }
        if (err) {
            console.log("some other err");
            response.status(400).send(JSON.stringify(err));
            return;
        }
        pic.comments = pic.comments.concat({comment: commentText, date_time: new Date(), user_id: userId});
        pic.save();
    });
});

app.post('/photos/new', function(request, response) {
    console.log("IN POST__________________");
    var login_name = request.session.login_name;
    console.log("login_name " + login_name);
    processFormBody(request, response, function (err) {
        if (err || !request.file) {
            console.log("Error with file");
            response.status(500).send(JSON.stringify(err));
            return;
        }
        var timestamp = new Date().valueOf();
        var filename = 'U' +  String(timestamp) + request.file.originalname;

        fs.writeFile("./images/" + filename, request.file.buffer, function (err) {
            var photoData = {file_name: filename, date_time: new Date(), user_id: request.session.user_id, comments: []};
            console.log("create new photo data");
            Photo.create({file_name: filename, date_time: new Date(), user_id: request.session.user_id, comments: [], likes: []}, function(err, new_photo) {
                if(err) {
                    console.log("error creating new photo");
                    response.status(400).end(JSON.stringify(err));
                    return;
                }
                response.send(JSON.stringify(new_photo));
            });
            console.log("problem not here");
        });
    });
});

app.post('/like/:photo_id', function(request, response) {
    var login_name = request.session.login_name;
    var photoId = request.params.photo_id;
    if (login_name === "" || login_name === undefined) {
        response.status(400).send("Not logged in");
        return;
    }
    User.findOne({login_name: login_name}, function(err, user) {
        if (!user) {
            response.status(400).send("No user found");
            return;
        }
        if (err) {
            response.status(400).send(JSON.stringify(err));
            return;
        }
        Photo.findOne({_id: photoId}, function(err, pic) {
            if (!pic) {
                response.status(400).send("No picture found");
                return;
            }
            if (err) {
                response.status(400).send(JSON.stringify(err));
                return;
            }
            var userLogin = user.login_name;
            for (var k = 0; k< pic.likes.length; k ++) {
                if (pic.likes[k] === userLogin) {
                    response.status(200).send("Already liked photo");
                    return;
                }
            }
            pic.likes = pic.likes.concat(userLogin);
            pic.save();
            var result = {user: login_name, photo_id: photoId, likes: pic.likes, login_name: login_name};
            response.send(JSON.stringify(result));
        });
    });
});

app.post('/unlike/:photo_id', function(request, response) {
    var login_name = request.session.login_name;
    var photoId = request.params.photo_id;
    if (login_name === "" || login_name === undefined) {
        response.status(400).send("Not logged in");
        return;
    }
    User.findOne({login_name: login_name}, function(err, user) {
        if (err) {
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (!user) {
            response.status(400).send("No user found");
            return;
        }
        Photo.findOne({_id: photoId}, function(err, pic) {
            if (!pic) {
                response.status(400).send("No picture found");
                return;
            }
            if (err) {
                response.status(400).send(JSON.stringify(err));
                return;
            }
            for (var i =0; i < pic.likes.length; i ++) {
                if (pic.likes[i] === login_name) {
                    pic.likes.splice(i, 1);
                }
            }
            pic.save();
            var result = {user: login_name, photo_id: photoId, likes: pic.likes, login_name: login_name};
            response.send(JSON.stringify(result));

        });
    });
});

app.post("/user", function(request, response) {
    var login_name = request.body.login_name;
    var password = request.body.password;
    var first_name = request.body.first_name;
    var last_name = request.body.last_name;

    User.findOne({login_name: login_name}, function (err, profile) {
        if (profile) {
            console.log("User exists already");
            response.status(400).send(JSON.stringify("user already exists"));
            return;
        }
        if (err) {
            response.status(500).send(JSON.stringify(err));
            return;
        }
        User.create({first_name: first_name, last_name: last_name, location: request.body.location, description: request.body.description, occupation: request.body.occupation, login_name: login_name, password: password}, function(err, newProfile) {
                if (err) {
                    console.log("Failed to create a new user");
                    response.status(400).send(JSON.stringify(err));
                    return;
                }
                response.send(JSON.stringify(newProfile));
                console.log("Created new user");
        });
    });
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get('/test/:p1', function (request, response) {
    // Express parses the ":p1" from the URL and returns it in the request.params objects.
    console.log('/test called with param1 = ', request.params.p1);

    var param = request.params.p1 || 'info';

    if (param === 'info') {
        // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
        SchemaInfo.find({}, function (err, info) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(500).send('Missing SchemaInfo');
                return;
            }

            // We got the object - return it in JSON format.
            console.log('SchemaInfo', info[0]);
            response.end(JSON.stringify(info[0]));
        });
    } else if (param === 'counts') {
        // In order to return the counts of all the collections we need to do an async
        // call to each collections. That is tricky to do so we use the async package
        // do the work.  We put the collections into array and use async.each to
        // do each .count() query.
        var collections = [
            {name: 'user', collection: User},
            {name: 'photo', collection: Photo},
            {name: 'schemaInfo', collection: SchemaInfo}
        ];
        async.each(collections, function (col, done_callback) {
            col.collection.count({}, function (err, count) {
                col.count = count;
                done_callback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                var obj = {};
                for (var i = 0; i < collections.length; i++) {
                    obj[collections[i].name] = collections[i].count;
                }
                response.end(JSON.stringify(obj));

            }
        });
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad param ' + param);
    }
});

/*
 * URL /user/list - Return all the User object.
 */
app.get('/user/list', function (request, response) {
    console.log('/user/list called');
    User.find({}, function (err, users) {
        if (err) {
            console.error("Doing /user/info error:", err);
            response.status(500).send(JSON.stringify(err));
            return;
        }
        if (users.length === 0) {
            response.status(500).send("Missing users");
            return;
        }
        var results = [];
        for (var i = 0; i < users.length; i ++) {
            var temp = users[i];
            results[i] = {_id: temp._id, first_name: temp.first_name, last_name: temp.last_name};
        }
        response.send(JSON.stringify(results));
    });
});

/*
 * URL /user/:id - Return the information for User (id)
 */
app.get('/user/:id', function (request, response) {
    var id = request.params.id;
    User.findOne({_id:id}, function(err, user) {
        if (err) {
            console.error("Error finding user/:id", err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (user.length === 0) {
            response.status(500).send("couldn't find user by id");
            return;
        }
        //console.log("User: " + user);
        Photo.find({user_id: id}, function(err, pic) {
            if (err) {
                console.log("ErROR in photo find");
                response.status(500).send(JSON.stringify(err));
                return;
            }
            pic.sort(function(a, b){  //most comments
                return (b.comments.length - a.comments.length);
            });
            var mostCommented = '';
            if (pic && pic.length >0) {
                mostCommented = pic[0];
            }
            pic.sort(function(a, b) {
                return (b.date_time - a.date_time);
            });
            var recentPhoto = '';
            if (pic && pic.length !== 0) {
                recentPhoto = pic[0];
            }
            var resultsID = {_id: user._id, first_name: user.first_name, last_name: user.last_name, location: user.location, occupation: user.occupation, description: user.description, most_recent: recentPhoto, most_commented: mostCommented};
            //console.log("RESULTS" + JSON.stringify(resultsID));
            response.send(JSON.stringify(resultsID));
        });
    });
    //response.status(200).send(user);
});

/*
 * URL /User/:id - Return the Photos for User (id)
 */
app.get('/photosOfUser/:id', function (request, response) {
    var id = request.params.id;
    var results = [];
    var userLocal = "";
    Photo.find({user_id: id}, function(err, photos) {
        photos = JSON.parse(JSON.stringify(photos));

        async.each(photos, function (photo, done_callback) {
            var commentsObject = photo.comments;
            var commentArray = [];
            async.each(commentsObject, function (commentObj, callback) {
                User.findOne({_id: commentObj.user_id}, function(err, user) {
                    userLocal = user;
                    if (user.length === 0) {
                        response.status(400).send("no user in comment");
                        return;
                    }
                    if (err) {
                        console.error("Error finding user within comment");
                        response.status(400).send(JSON.stringify(err));
                        return;
                    }
                    var foundUser = {_id: user._id, first_name: user.first_name, last_name: user.last_name};
                    commentArray.push({date_time: commentObj.date_time, _id: commentObj.id, comment: commentObj.comment, user: foundUser});
                    callback(err);
                });

            },
            function (err, com) {
                if (err) {
                    console.error("Error within final comment step");
                    response.status(400).send(JSON.stringify(err));
                    return;
                }
                results.push({_id:photo._id, user_id:photo.user_id, file_name: photo.file_name, date_time: photo.date_time, likes: photo.likes, comments: commentArray, favorites: userLocal.favorites});
                results.sort(function(a, b) {
                    if (b.likes.length > a.likes.length) {return 1;}
                    if (a.likes.length > b.likes.length) {return -1;}
                    if (b.date_time > a.date_time) {return 1;}
                    if (a.date_time > b.date_time) {return 1;}
                    return 1;
                });
                done_callback();
            });
        }, function (err) {
            if (err) {
                console.error("Error within final comment step");
                response.status(400).send(JSON.stringify(err));
                return;
            }
            response.end(JSON.stringify(results));
        });
    });
});

app.get("/favoriteSecond", function(request, response) {
    var login_name = request.session.login_name;
    if (login_name === "" || login_name === undefined) {
        response.status(400).send("Not logged in");
        return;
    }
    User.findOne({login_name: login_name}, function(err, user) {
        if (!user) {
            response.status(400).send("No user found");
            return;
        }
        if (err) {
            response.status(400).send(JSON.stringify(err));
            return;
        }
        var userProfile = user.favorites;
        response.send(JSON.stringify(userProfile));
    });
});

app.post("/favorite/:photo_id", function(request, response) {
    var login_name = request.session.login_name;
    var photoId = request.params.photo_id;
    if (login_name === "" || login_name === undefined) {
        response.status(400).send("Not logged in");
        return;
    }
    User.findOne({login_name: login_name}, function(err, user) {
        if (!user) {
            response.status(400).send("No user found");
            return;
        }
        if (err) {
            response.status(400).send(JSON.stringify(err));
            return;
        }
        var userProfile = user.favorites;
        Photo.findOne({_id: photoId}, function(err, pic) {
            if (!pic) {
                response.status(400).send("No picture found");
                return;
            }
            if (err) {
                response.status(400).send(JSON.stringify(err));
                return;
            }
            for (var i = 0; i < user.favorites.length; i ++) {
                if (user.favorites[i] === pic) {
                    response.status(400).send("Photo has already been added to favorites");
                    return;
                }
            }
            user.favorites = user.favorites.concat(pic);
            user.save();
            userProfile = user.favorites;
            var result = {user: login_name, photo_id: photoId, favorites: user.favorites, user_profile: userProfile};
            response.send(JSON.stringify(result));
        });
    });
});

app.post("/unfavorite/:photo_id", function(request, response) {
    var login_name = request.session.login_name;
    var photoId = request.params.photo_id;
    if (login_name === "" || login_name === undefined) {
        response.status(400).send("Not logged in");
        return;
    }
     User.findOne({login_name: login_name}, function(err, user) {
        if (!user) {
            response.status(400).send("No user found");
            return;
        }
        if (err) {
            response.status(400).send(JSON.stringify(err));
            return;
        }
        for (var i = 0; i < user.favorites.length; i ++) {
            if (user.favorites[i]._id.equals(photoId)) {
                user.favorites.splice(i, 1);
                user.save();
                break;
            }
        }
        response.send(JSON.stringify(user));
    });
});

app.get("/getCurrUser", function(request,response) {
    var login_name = request.session.login_name;
    response.send(JSON.stringify({login_name: login_name}));
});

var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});


