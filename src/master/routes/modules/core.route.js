const router = require( "express-promise-router" )();
const core = require( "../../controllers/core.controller" );

router.route( "/tests" ).get( core.tests );
router.route( "/live/status" ).get( core.status );
router.route( "/live/new" ).post( core.new );

module.exports = router;
