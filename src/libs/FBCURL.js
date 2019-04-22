/* eslint-disable camelcase */
const request = require( "request-promise" );
const { URL } = require( "url" ),
  rq = request.defaults( {
    "headers": {
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36",
      "Origin": "https://www.facebook.com",
      "Referer": "https://www.facebook.com"
    },
    "timeout": 5000
  } );

class FBCURL {
  constructor( cookie, fb_dtsg, fb_dtsg_ag ) {
    this.cookie = cookie;
    this.fb_dtsg = fb_dtsg;
    this.fb_dtsg_ag = fb_dtsg_ag;
    this.user_id = cookie.match( /c_user=([0-9]+)/ )[ 1 ];
  }
  static async fromCookie( Cookie ) {
    const headers = { Cookie },
      html = await rq( "https://www.facebook.com/profile.php", { headers } ),
      fb_dtsg = html.match( /{"token":"(.+?)"/ )[ 1 ],
      fb_dtsg_ag = html.match( /async_get_token":"(.+?)"/ )[ 1 ];

    return new this( Cookie, fb_dtsg, fb_dtsg_ag );
  }

  async isLive() {
    const html = await this.curlMobile( "GET", "4" );

    return html.indexOf( "Mark Zuckerberg" ) > 0;
  }
  async curl( method, uri, data = {}, headers = {}, options = {} ) {
    const url = new URL( uri, "https://www.facebook.com/" );

    return await rq(
      Object.assign(
        {
          "url": url.toString(),
          method,
          // eslint-disable-next-line eqeqeq
          [ method == "GET" ? "qs" : "form" ]: Object.assign(
            {
              "__a": 1,
              "fb_dtsg": this.fb_dtsg,
              "fb_dtsg_ag": this.fb_dtsg_ag,
              "__user": this.user_id
            },
            data
          ),
          "headers": Object.assign( { "Cookie": this.cookie }, headers )
        },
        options
      )
    );
  }
  async curlMobile( method, uri, form = {}, headers = {}, options = {} ) {
    const url = new URL( uri, "https://mbasic.facebook.com/" );

    return await rq(
      Object.assign(
        {
          "url": url.toString(),
          method,
          // eslint-disable-next-line eqeqeq
          [ method == "GET" ? "qs" : "form" ]: Object.assign(
            {
              "__a": 1,
              "fb_dtsg": this.fb_dtsg,
              "fb_dtsg_ag": this.fb_dtsg_ag,
              "__user": this.user_id
            },
            form
          ),
          "headers": Object.assign(
            {
              "Cookie": this.cookie,
              "Referer": "https://mbasic.facebook.com",
              "Origin": "https://mbasic.facebook.com",
              "Content-Type": "application/x-www-form-urlencoded"
            },
            headers
          )
        },
        options
      )
    );
  }
}
exports.FBCURL = FBCURL;
