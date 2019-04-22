/* eslint-disable camelcase */
const cote = require( "cote" );
const ffmpeg = require( "fluent-ffmpeg" );

class LiveStreamWorker {
  static async init() {
    this.responder = new cote.Responder( {
      "name": "LivestreamWorker-responder",
      "key": "rr"
    } );
    this.publisher = new cote.Publisher( {
      "name": "LivestreamWorker-publisher",
      "key": "ps"
    } );
    console.log( "Wait for ready" );
    this.responder.on( "live", async ( data ) => {
      try {
        await this.live( data );
      } catch ( e ) {
        console.log( e );
      }
    } );
    this.responder.on( "get_info", () => ( { "playing": this.playing } ) );
  }
  static async live( { video_id, rtmp_link, video_urls, logo, text } ) {
    await new Promise( ( success, err ) => {
      const onError = ( info ) => {
        this.publisher.emit( "ffmpeg-error", { video_id, info } );
        err();
      };
      let index = 0,
        from = "0:v",
        complexFilters = [];
      // eslint-disable-next-line one-var
      const task = ffmpeg( video_urls[ 0 ] ).native();

      if ( text ) {
        let options = [];

        for ( const key in text ) {
          options.push( `${key}=${text[ key ]}` );
        }
        complexFilters.push( {
          "filter": "drawtext",
          "inputs": [ from ],
          options,
          "outputs": "withText"
        } );
        from = "withText";
      }
      if ( logo ) {
        task.addInput( logo.url );
        index++;
        complexFilters.push( {
          "inputs": [ "1:v" ],
          "filter": "scale",
          "options": [ `${logo.height}x${logo.width}` ],
          "outputs": "scaledLogo"
        } );
        complexFilters.push( {
          "inputs": [ from, "scaledLogo" ],
          "filter": "overlay",
          "options": [ `${logo.x}:${logo.y}` ],
          "outputs": "logo"
        } );
        from = "logo";
      }
      if ( video_urls[ 1 ] ) {
        task.addInput( video_urls[ 1 ] );
        index++;
        task.addOption( `-map ${index}:a` );
      } else {
        task.addOption( "-map 0:a" );
      }
      task
        .complexFilter( complexFilters, [ from ] )
        .addOptions( [ "-bufsize 3000k", "-preset ultrafast", "-maxrate 3000k" ] )
        .format( "flv" )
        .videoCodec( "libx264" )
        .videoBitrate( "3000k" )
        .fps( 30 )
        .on( "codecData", ( data ) =>
          this.publisher.emit( "ffmpeg-codec-data", data )
        )
        .on( "progress", ( data ) => {
          success();
          this.publisher.emit( "ffmpeg-progress", { video_id, data } );
        } )
        .on( "stderr", console.log )
        .on( "error", onError )
        .on( "end", () => {
          this.playing--;
          this.publisher.emit( "ffmpeg-end", { video_id, err } );
        } )
        .on( "start", ( command ) =>
          console.log( `Ffmpeg started with command\n\n${command}\n\n\n` )
        )
        .save( rtmp_link );
    } );
    this.playing++;
  }
}
LiveStreamWorker.playing = 0;
LiveStreamWorker.init();
exports.LiveStreamWorker = LiveStreamWorker;
