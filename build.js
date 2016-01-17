var scraper = require('website-scraper');
var spawn = require('child_process').spawn;
var replace = require("replace");
var glob = require("glob");

function scrapeIt(process) {
  scraper.scrape({
    urls: [
      'http://localhost:8765/',
    ],
    directory: __dirname + '/build',
    subdirectories: [
      {directory: 'img', extensions: ['.jpg', '.png', '.svg']},
      {directory: 'js', extensions: ['.js']},
      {directory: 'css', extensions: ['.css']}
    ],
    sources: [
      {selector: 'img', attr: 'src'},
      {selector: 'link[rel="stylesheet"]', attr: 'href'},
      {selector: 'script', attr: 'src'}
    ],
    request: {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 4.2.1; en-us; Nexus 4 Build/JOP40D) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19'
      }
    }
  }).then(function (result) {
    glob(__dirname + '/build/**/*.js', {}, function (er, files) {
      replace({
        regex: /[\u200B-\u200D\uFEFF  ]/g,
        replacement: ' ',
        paths: files,
        recursive: true,
        silent: true,
      });
    });

    if (process) {
      process.kill();
    }
    
  }).catch(function(err){
    console.log(err);

    if (process) {
      process.kill();
    }
  });
}

if (/^win/.test(process.platform)) {
  console.log('You will need to manually run `meteor run -p 8765`');

  scrapeIt();
} else {
  // launch meteor
  var start = spawn('meteor', ['run', '-p', '8765'], {
    cwd: __dirname + '/src'
  });
  start.stdout.pipe(process.stdout);
  start.stdout.on('data', function (data) {
    if (data.indexOf('localhost:8765') !== -1) {
      // Then crawl the website for all the assets
      scrapeIt(start);
    }
  });
}