/* eslint-disable camelcase */
/* eslint-disable strict */
const querystring = require( "querystring" );
const ffmpeg = require( "fluent-ffmpeg" );
const Sleep = require( "../helpers/Sleep" ),
  or = ( a, b ) => ( a === undefined ? b : a );

class FBLiveStream {
  constructor( client, options ) {
    this.client = client;
    this.options = options;
  }
  async getRTMPInfo() {
    const qs = {
        "app_id": "273465416184080",
        "target_id": or( this.options.target, this.client.user_id ),
        "enable_content_protection": or(
          this.options.enable_content_protection,
          false
        ),
        "is_360_broadcast": or( this.options.is_360_broadcast, false ),
        "is_rehearsal": or( this.options.is_rehearsal, false ),
        "av": this.client.user_id
      },
      body = {
        "video_broadcast_infra_type": "RTMP",
        "__dyn":
          "7AgNe-UOByK5A9UkKG8F8CC5EWq2uWyaF3ozzkC-CHxG7Uqzob4q6oG8yWCHxC7oG5VEeqyEKbmbx2uEnGi4FpeuUG4Xze3KFU9EggHzobp94rzLgix11yuiaAz8gCxm2e2W4qKm8yEqx61cxl0z",
        "__req": 39,
        "__be": 1,
        "__pc": "PHASED:ufi_home_page_pkg",
        "dpr": 1,
        "__rev": 1000576132,
        "jazoest": 22008,
        "__comet_req": false
      },
      rs = await this.client.curl(
        "POST",
        `create_broadcast/create?${querystring.stringify( qs )}`,
        body
      );

    return JSON.parse( rs.slice( 9, rs.length ) ).payload;
  }
  async publicLiveStream( broadcast_id ) {
    const qs = {
        broadcast_id,
        "av": this.client.user_id
      },
      form = {
        "attribution_app_id": "",
        "video_broadcast_status": "LIVE",
        "is_continuous": or( this.options.is_continuous, false ),
        "is_embeddable": or( this.options.is_embeddable, false ),
        "should_expire_after_live": or(
          this.options.should_expire_after_live,
          false
        ),
        "should_show_graphic_content_warning": or(
          this.options.should_show_graphic_content_warning,
          false
        ),
        "is_rewind_enabled": or( this.options.is_rewind_enabled, false ),
        "share_with_owning_business": or(
          this.options.share_with_owning_business,
          false
        ),
        "is_commentating_disabled": or(
          this.options.is_commentating_disabled,
          false
        ),
        "is_episode": or( this.options.is_episode, false ),
        "season_id": "",
        "description": this.options.description,
        "is_explicit_place": or( this.options.is_explicit_place, false ),
        "place": this.options.place,
        "direct_share_status": this.options.direct_share_status,
        "sponsor_relationship": this.options.sponsor_relationship,
        "og_object_id": this.options.og_object_id,
        "og_action_type_id": this.options.og_action_type_id,
        "privacyx": this.options.privacyx,
        "with_tags": this.options.with_tags,
        "title": this.options.title,
        "__comet_req": false
      };

    await this.client.curl(
      "POST",
      `https://www.facebook.com/video_broadcast/update?${querystring.stringify(
        qs
      )}`,
      form
    );
  }
  async liveFromPath(
    urls,
    rtmp,
    onCodecData = () => {},
    onCompleted = () => {}
  ) {
    await new Promise( ( success, err ) => {
      const task = ffmpeg();

      for ( const url of urls ) {
        task.addInput( url );
      }
      task
        .native()
        .addOptions( [ "-bufsize 200k", "-preset ultrafast", "-maxrate 3000k" ] )
        .format( "flv" )
        .videoCodec( "libx264" )
        .videoBitrate( "3000k" )
        .fps( 30 )
        .on( "codecData", onCodecData )
        .on( "progress", () => {
          success();
        } )
        .on( "error", err )
        .on( "end", onCompleted )
        .save( rtmp );
    } );
  }
  async waitForLive( videoId ) {
    while ( !( await this.getLiveStatus( videoId ) ) ) {
      await Sleep.sleep( 3000 );
    }
  }
  async getLiveStatus( videoId ) {
    const body = {
        "av": this.client.user_id,
        "fb_api_caller_class": "RelayModern",
        "fb_api_req_friendly_name":
          "LiveVideoBroadcastPreviewBodyInputStreamRefetchQuery",
        "variables": JSON.stringify( { "video_id": videoId } ),
        "doc_id": 2121290074582452
      },
      rs = JSON.parse(
        await this.client.curl(
          "POST",
          "https://www.facebook.com/api/graphql",
          body
        )
      );
      
    return rs.data.video.input_streams.nodes[ 0 ].is_stream_active;
  }
  async stopLive( videoId ) {
    const url = "https://www.facebook.com/api/graphql/",
      form = {
        "av": this.client.user_id,
        "fb_api_caller_class": "RelayModern",
        "fb_api_req_friendly_name": "ModernLiveVideoEndMutation",
        "variables": JSON.stringify( {
          "input": {
            "client_mutation_id": 4,
            "actor_id": this.client.user_id,
            "video_id": videoId
          }
        } ),
        "doc_id": 2187315861333358
      };

    return await this.client.curl( "POST", url, form );
  }
}
exports.FBLiveStream = FBLiveStream;
