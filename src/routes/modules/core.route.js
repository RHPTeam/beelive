const router = require( "express-promise-router" )();
const core = require( "../../controllers/core.controller" );

router.route( "/tests" ).get( core.tests );

module.exports = router;
