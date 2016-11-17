// app.js is simply for running HTML test file on Node using Express and Nodemon
var express = require( 'express' );
var app = express();
var path = require( 'path' );

app.use( express.static( __dirname ));

app.get( '/', function( req, res ) {
	res.sendFile( path.join(__dirname + '/index.htm' ) );
});


app.listen( 3000 );
console.log( 'Running on port 3000.' );
