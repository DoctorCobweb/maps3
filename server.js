//
// server.js: the node backend for polling booths web app
//



// load modules & define vars
var applicationRoot = __dirname,
    path = require('path'),
    express = require('express'),
    jade = require('jade'),
    CLIENT_APP_DIR = 'dist',
    PORT = process.env.PORT || 5000;



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
    render();

    function render () {
        jade.renderFile('./views/index.jade', cb);

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
