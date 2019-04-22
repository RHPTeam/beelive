const request = require( "request-promise" );
const YoutubeDownloader = require( "youtube-dl" ),
  headers = {
    "User-Agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36"
  };

class GetLink {
  static async get( link, hd = false ) {

    if ( link.match( /facebook\.com/ ) ) {
      return await this.getFacebook( link, hd );
    }
    if ( link.match( /youtube\.com/ ) ) {
      return await this.getYoutube( link, hd );
    }
    return [ link ];
  }
  static async getFacebook( link, hd ) {
    const html = await request( link, { headers } ),
      hdSearch = html.match( /hd_src:"(https.+?)"/m ),
      sdSearch = html.match( /sd_src:"(https.+?)"/m );

    if ( !hdSearch && !sdSearch ) {
      return null;
    }
    if ( hd && hdSearch ) {
      return [ hdSearch[ 1 ] ];
    }
    if ( sdSearch ) {
      return [ sdSearch[ 1 ] ];
    }
    return null;
  }
  static async getYoutube( link, hd ) {
    let format = [
      `--format=${
        hd ? "298/302/136/247/" : ""
      }394/395/133/243/396/134/244/135/397`
    ];

    try {
      const videoInfo = await new Promise( ( success, reject ) => {
        YoutubeDownloader.getInfo( link, format, {}, ( err, data ) =>
          err ? reject( err ) : success( data )
        );
      } );

      return [ videoInfo.url, videoInfo.formats[ 0 ].url ];
    } catch ( e ) {
      return null;
    }
  }
}
exports.GetLink = GetLink;
