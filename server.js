//
// server.js: the node backend for polling booths web app
//



// load modules & define vars
var applicationRoot = __dirname,
    path = require('path'),
    express = require('express'),
    jade = require('jade'),
    CLIENT_APP_DIR = 'dist',
    PORT = process.env.PORT || 5000,
    fs = require('fs'),
    csv = require('csv');



// create express app
var app = express();

// use jade templating engine
app.set('view engine', 'jade'),
app.set('views', applicationRoot + '/views'),
app.set('view options', {layout: false});




// ------ EXPRESS MIDDLEWARE SETUP -----------------------------

// configure the server
app.configure(function () {
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.query());
    app.use(express.cookieParser('GSSdfsdgjjiuy^gG5F399X aa FD!2#RvSDFGHssdhA'));
    app.use(app.router);
    //app.use(express.static(path.join(applicationRoot, CLIENT_APP_DIR)));
    app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
});




// ------- HTTP ROUTES DEFINITIONS --------------------
app.get('/', function (req, res) {
    console.log('in GET / route handler');

    var gps_coords = [],
        LAT_INDEX = 8,  //hard code index for now
        LONG_INDEX = 9; //hard code index for now
    

    csv()
      .from.path(__dirname + '/polling_booth_updated_ANDRE_EDIT_2.csv', {delimiter: ','})
      .transform(function (row) {
        //console.log('row is: ');
        //console.log(row);
        return row;
      })
      .on('record', function (row, index) {
        //console.log(row);
        //console.log('#'+ index + ' ' + JSON.stringify(row));
        gps_coords.push({latitude: row[LAT_INDEX], longitude: row[LONG_INDEX]});

      })
      .on('end', function () {
        console.log('END EVENT fired. finished parsing content');
        //console.dir(gps_coords.slice(1));
        console.log('number of elements: ' + gps_coords.slice(1).length); //305 booths

        //start the render of content after we've got the gps coordinates
        render();
      })
      .on('error', function (error) {
        console.log(error.message);
      });


    function render () {
        jade.renderFile('./views/index.jade', {booths: gps_coords.slice(1)}, cb);

        function cb (err, html) {
            if (err) throw err;
            return res.send(html);
        }
    }
});





// ------- START THE SERVER --------------------------------

app.listen(PORT, function () {
    console.log('HTTP express server listening on port %d in %s mode',
        PORT, app.settings.env);
    console.log('Serving client app from: ' + applicationRoot + '/' + CLIENT_APP_DIR);
});





// -------- HELPER FUNCTIONS -----------------------------

function loggedInAsAdmin (req, res, next) {
    console.log('in loggedInAsAdmin middleware');
    if (!!req.session.authenticated) {
        console.log('user is authenticated.');
        console.log(req.session);
        next();
    } else {
        return res.render('unauthorizedAccess');
    }
}
