// eslint-disable-next-line new-cap
const router = require( "express" ).Router();

router.use( "/core", require( "./modules/core.route" ) );

module.exports = router;
