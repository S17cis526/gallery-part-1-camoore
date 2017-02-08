"use strict";

/**
 * server.js
 * This file defines the server for a
 * simple photo gallery web app.
 */
var http = require('http');
var fs = require('fs');//filesystem
var port = 2000;
var stylesheet = fs.readFileSync('gallery.css');
var imageNames = ['/ace.jpg', '/bubble.jpg', '/chess.jpg', '/fern.jpg', '/mobile.jpg'];
var config = JSON.parse(fs.readFileSync('config.json'));
var url  = require('url');

function getImageNames(callback){
  fs.readdir('images/', function(err, fileNames){
    if(err) callback(err, undefined);
    else callback(false, fileNames);
  });
}

function imageNamesToTags(fileNames){
  return fileNames.map(function(fileName){
    return `<img src="${fileName}" alt="${fileName}">`;
  });
}

function serveImage(filename, req, res) {
  var body = fs.readFile('images/' + filename, function(err, body) {
    if(err) {
      console.error(err);
      res.statusCode = 404;
      res.statusMessage = "Resources not found";
      res.end("Silly me");
      return;
    }
    res.setHeader("Content-Type", "image/jpeg");
    res.end(body)
  });
}

function uploadImage(req,res){
  var body='';
  req.on('error', function(){
    res.statusCode = 500;
    res.end();
  });
  req.on('data', function(data){
    body+=data;
  });
  req.on('end', function(){
    fs.writeFile('filename', data, function(err){
      if(err){
        console.error(err);
        res.statusCode=500;
        res.end();
        return;
      }
      serveGallery(req, res);
    });
  });

}
function buildGallery(imageTags){
  var html = '<!doctype html>';
      html += '<head>';
      html += '  <title>' + config.title + '</title>';
      html += '  <link href ="gallery.css" rel ="stylesheet" type="text/css">';
      html += '</head>';
      html += '<body>';
      html += '  <h1>' + config.title + '</h1>';
      html += ' <form action="">';
      html += '   <input type="text" name="title">';
      html += '   <input type="submit" value="Change Gallery title">';
      html += ' </form>';
      html += imageNamesToTags(imageTags).join('');
      html += ' <form action="" method="POST" enctype="multipart/form-data">';
      html += '   <input type="file" name="image">';
      html += '   <input type="submit" value="Upload Image">';
      html += ' </form>';
      html += '  <h1>Hello.</h1> Time is ' + Date.now();
      html += '</body>';
    return html;
}
function serveGallery(req, res){
  getImageNames(function(err, imageNames){
    if(err){
      console.error(err);
      res.statusCode = 500;
      res.statusMessage = 'Server error';
      res.end();
      return;
    }
    res.setHeader('Content-Type', 'text/html');
    res.end(buildGallery(imageNames));
  });

}



var server = http.createServer(function(req, res){
  //at most the url should have two parts -
  // a resource and a querystring seperated by a ?
  var urlParts = url.parse(req.url);

  if(urlParts.query){
    var matches =/title=(.+)($|&)/.exec(urlParts.query);
    if(matches && matches[1]){
      config.title = decodeURIComponent(matches[1]);
      fs.writeFile('config.json', JSON.stringify(config));
    }
  }

  switch(urlParts.pathname) {
    case '/':
    case '/gallery':
      if(req.method == 'GET'){
        serveGallery(req, res);
      }else if(req.method =='POST'){
        uploadImage(req,res);
      }


     break;
    case '/gallery.css':
      res.setHeader('Content-Type', 'text/css');
      res.end(stylesheet);
      break;
    default:
      serveImage(req.url, req, res);
  }
});//creates a server(lambda style)

server.listen(port, () => {
  console.log("listening on Port " + port);
});//listening to port
