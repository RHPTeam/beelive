/* eslint-disable strict */
const bodyParser = require( "body-parser" );
const config = require( "./src/configs/server" );
const cors = require( "cors" );
const express = require( "express" );
const logger = require( "morgan" );
const api = require( "./src/routes" );

app = express();
app.use( cors() );
app.use( bodyParser.json( { "limit": "500MB", "extended": true } ) );
app.use( bodyParser.urlencoded( { "limit": "500MB", "extended": true } ) );
app.use( logger( "tiny" ) );
app.use( "/api/v1", api );
app.use( "/", ( req, res ) => res.send( "API running!" ) );

app.listen( config.port );

