// eslint-disable-next-line new-cap
const router = require( "express" ).Router();
const { json } = require( "body-parser" );

router.use( json() );
router.use( "/core", require( "./modules/core.route" ) );

module.exports = router;
