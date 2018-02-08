
/*
 * GET home page.
 */

exports.index = function(req, res){
  //res.render('index', { title: 'Express' });
	
  res.writeHead(200, {"Content-Type": "application/json"});
  res.end(JSON.stringify({
    "state" : "success",
    "info" : "Welcome to Taiwan CDC Open Data API Service.", 
    "data" : "Please follow the correct API instruction or contact the administator."
  }))
};