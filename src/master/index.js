const express = require( "express" ),
  app = express();
const router = require( "./routes/index" );

app.use( router );
app.listen( 3333 );
console.log( "App start at 3000" );
