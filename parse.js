//Libraries
var FeedParser = require('feedparser');
var request = require('request');
var TurndownService = require('turndown');
var fs = require('fs');
var dateFormat = require('dateformat');

//Create Turndown service object
var turndownService = new TurndownService();

function parseFeed(name, url) {
  var req = request(url)
  var feedparser = new FeedParser([]);

  req.on('error', function (error) {
    // handle any request errors
  });
 
  req.on('response', function (res) {
  var stream = this; // `this` is `req`, which is a stream

  if (res.statusCode !== 200) {
      this.emit('error', new Error('Bad status code'));
  }
  else {
      stream.pipe(feedparser);
  }
  });

  feedparser.on('error', function (error) {
  // always handle errors
  });

  feedparser.on('readable', function () {
  // This is where the action is!
  var stream = this; // `this` is `feedparser`, which is a stream
  var meta = this.meta; // **NOTE** the "meta" is always available in the context of the feedparser instance
  var item;

  while (item = stream.read()) {
      let filename = item.title.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      let title = "\""+name+": "+item.title.replace(/[^a-zA-Z0-9 ]/g, "")+"\"";
      let content = turndownService.turndown(item.description);
      let date = Date.parse(item.pubDate);
      let dateTz = dateFormat(date, "o");
      console.log(dateTz);
      dateTz = dateTz.slice(0,dateTz.length-2)+":"+dateTz.slice(dateTz.length-2, 
dateTz.length);
      let formattedDate = dateFormat(date, "yyyy-mm-dd'T'HH:mm:ss")+dateTz;
      console.log('Got article (%s) [%s]: %s', filename, formattedDate, item.title);
      let header = "---\ntitle: "+title+"\ndate: "+formattedDate+"\n---\n";
	  let readmore = "\n\n[Lees meer bij "+name+"&raquo;]("+item.link+")";
      fs.writeFile("output/"+name.toLowerCase()+"-"+filename+".md", header+content+readmore, function(err) {});
  }
  });
}

parseFeed('Tkkrlab', 'https://tkkrlab.nl/wordpress/feed');
parseFeed('Hack42','https://hack42.nl/blog/feed');
