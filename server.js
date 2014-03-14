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
    csv = require('csv'),
    MAIN_POLLING_DATA_FILE = '/polling_booth_updated_ANDRE_EDIT_2.csv';


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
    app.use(express.static(path.join(applicationRoot, CLIENT_APP_DIR)));
    app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
});


// helper function: scan through a row, looking for something which satisfies predicate
// function pred
function takeWhile(a, pred) {
  var result = [];
  var index = undefined;

  for (var i = 0, n = a.length; i < n; i++) {
    if (pred(a[i], i)) {
      index = i;
      break;
    }
    //result[i] = i;
  }
  //return result;
  return index;
}


// finds the indexes for columns we need from .csv file
function getColIndexes (row) {
      var indexes = {};

  indexes['latitude'] = takeWhile(row, function (n) {
    return n === 'LATITUDE';
  }); 

  indexes['longitude'] = takeWhile(row, function (n) {
    return n === 'LONGITUDE';
  }); 

  indexes['greens_perc_2010'] = takeWhile(row, function (n) {
    return n === 'GREENS_PERC_2010';
  }); 
      
  indexes['greens_perc_2006'] = takeWhile(row, function (n) {
    return n === 'GREENS_PERC_2006';
  }); 

  console.log(JSON.stringify(indexes));
  return indexes;
}


function parsePollingFile(cb) {
  var gps_coords = [],
      DATA_ROWS_START = undefined,
      indexes = {};

  csv()
    .from.path(__dirname + MAIN_POLLING_DATA_FILE, {delimiter: ','})
    .transform(function (row) {
      //console.log('row is: ');
      //console.log(row);
      return row;
    })
    .on('record', function (row, index) {
      if (DATA_ROWS_START) {
        gps_coords.push({
          'latitude': row[indexes.latitude],
          'longitude': row[indexes.longitude],
          'greens_perc_2010': row[indexes.greens_perc_2010],
          'greens_perc_2006': row[indexes.greens_perc_2006],
          'weight': parseFloat(row[indexes.greens_perc_2010], 10) - parseFloat(row[indexes.greens_perc_2006], 10)
        });
      }
      
      if (row[0] === 'BOOTH_NAME') {
        DATA_ROWS_START = index + 1;
        indexes = getColIndexes(row);
      }

    })
    .on('end', function () {
      console.log('END EVENT fired. finished parsing content');
      console.log('number of elements: ' + gps_coords.length); //305 booths

      //start the render of content after we've got the gps coordinates
      cb(gps_coords);
    })
    .on('error', function (error) {
      console.log(error.message);
    });
}



// ------- HTTP ROUTES DEFINITIONS --------------------
app.get('/', function (req, res) {
    console.log('in GET / route handler');

    parsePollingFile(function (gps_coords) {
      jade.renderFile('./views/index.jade', {booths: gps_coords}, fn);

      function fn (err, html) {
          if (err) throw err;
          return res.send(html);
      }
    });
});


app.get('/polling-booth-locations', function (req, res) {
    console.log('in GET /polling-booth-locations route handler');

    parsePollingFile(function (gps_coords) {
      jade.renderFile('./views/pollingBoothLocations.jade', {booths: gps_coords}, fn);

      function fn (err, html) {
          if (err) throw err;
          return res.send(html);
      }
    });
});


app.get('/greens/gain', function (req, res) {
    console.log('in GET /greens/gain route handler');

    parsePollingFile(function (gps_coords) {
      jade.renderFile('./views/greensGain.jade', {booths: gps_coords}, fn);

      function fn (err, html) {
          if (err) throw err;
          return res.send(html);
      }
    });
});


app.get('/greens/lose', function (req, res) {
    console.log('in GET /greens/lose route handler');

    parsePollingFile(function (gps_coords) {
      jade.renderFile('./views/greensLose.jade', {booths: gps_coords}, fn);

      function fn (err, html) {
          if (err) throw err;
          return res.send(html);
      }
    });
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
