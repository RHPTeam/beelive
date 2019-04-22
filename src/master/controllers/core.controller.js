/* eslint-disable strict */
const { LivesService } = require( "./live.services" );

module.exports = {
  "tests": async () => {},
  "status": async ( req, res ) => {
    res.json( { "err": false, "message": "Server online" } );
  },

  "new": async ( req, res ) => {
    try {
      const {
          cookie,
          link,
          description,
          target,
          text,
          logo,
          hd,
          title,
          place
        } = req.body,
        
        rs = await LivesService.live(
          cookie,
          link,
          target,
          text,
          logo,
          hd,
          place,
          { title, description }
        );

      res.json( rs );
    } catch ( e ) {
      res.json( e.message );
    }
  }
};
