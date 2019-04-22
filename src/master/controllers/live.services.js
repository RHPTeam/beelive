const FBCURL = require( "../../libs/FBCURL" );
const FBLiveStream = require( "../../libs/FBLiveStream" );
const GetLink = require( "../../libs/GetLink" );
const cote = require( "cote" );

let playing = new Set();

class LivesService {




  static async init() {
    this.requester = new cote.Requester( {
      "name": "LivestreamMaster-requester",
      "key": "rr"
    } );
    this.subscriber = new cote.Subscriber( {
      "name": "LivestreamMaster-subscriber",
      "key": "ps"
    } );
    this.subscriber.on( "ffmpeg-end", ( data ) => {
      playing.delete( data.video_id );
    } );
    this.subscriber.on( "ffmpeg-error", ( ...data ) => console.log( data ) );
    this.subscriber.on( "ffmpeg-progress", ( ...data ) => {
      console.log( data );
    } );
  }
  static async live(
    cookie,
    url,
    target = null,
    text,
    logo,
    hd = false,
    opts = { "title": "", "description": "" }
  ) {
    const client = await FBCURL.FBCURL.fromCookie( cookie ),
      fb = new FBLiveStream.FBLiveStream(
        client,
        Object.assign(
          {
            "target": target ? target : client.user_id,
            "privacyx": "300645083384735"
          },
          opts
        )
      ),
      RTMPInfo = await fb.getRTMPInfo(),
      videoUrls = await GetLink.GetLink.get( url, hd );

    await this.requester.send( {
      "type": "live",
      "rtmp_link": RTMPInfo.stream_url,
      "video_urls": videoUrls,
      "video_id": RTMPInfo.video_id,
      logo,
      text
    } );
    await fb.waitForLive( RTMPInfo.video_id );
    await fb.publicLiveStream( RTMPInfo.id );
    playing.add( RTMPInfo.video_id );
    return RTMPInfo;
  }

  getPlaylist() {
    return [ ...playing ];
  }
}
LivesService.init();
exports.LivesService = LivesService;
