/*
 * author : jiankaiwang
 * env :
 * |- redis : version 3.2.9
 * |- nodejs : version 6.9.1
 */

var url = require("url"),
	querystring = require('querystring'), 
	request = require('request'),
	common = require('../public/seed/Common.js'),
	redisBackend = require("./redis_backend.js");

var apiService = {
	 "dengue" : ["a1", "a2"],
	 "influlinechart" : ["a1"],
	 "enterovirus" : ["a1"],
	 "hivbc" : ["a1"],
	 "diarrheapiechart" : ["a1"]
  };

var __redisInfo = {
	"host" : "host",
	"port" : "port",
	"pwd" : "password"
};

/*
 * desc : response the result 
 */
function responseResult(state, info, data) {
	return(JSON.stringify({ "state" : state, "info" : info, "data" : data }));
}

/*
 * desc : response the result
 */
function respondJsonFormat(res, state, info, data) {
	res.end(responseResult(state, info, data));
}

/*
 * desc : format the value 
 */
function __formatMDHMS(getValue) {
    return (getValue < 10 ? '0' + getValue : getValue);
}

/*
 * desc : parse and response a get request 
 * inpt :
 * |- s : service, e.g. user, ...
 * |- v : version, e.g. a1, a2, ...
 */
function __parseGetReqRes(req, res) {
	  var query = url.parse(req.url).query;
	  var allQueries = querystring.parse(query);
	  var allQueriesParas = common.getDictionaryKeyList(allQueries);
	  var allServices = common.getDictionaryKeyList(apiService);	  
	  	  
	  redisBackend.setRedisConf({
		  "host" : __redisInfo["host"],
		  "port" : __redisInfo["port"],
		  "pwd" : __redisInfo["pwd"]
	  });
	  
	  if(allQueriesParas.length > 0 && allQueriesParas.indexOf('s') > -1 && allQueriesParas.indexOf('v') > -1) {
		  if(allServices.indexOf(allQueries['s']) > -1 && apiService[allQueries['s']].indexOf(allQueries['v']) > -1) {
			  
			  var searchKey = "opendataplatform" + "_" + allQueries['s'] + "_" + allQueries['v'];
			  redisBackend.getRedisPair(searchKey, function(data) {
				  var rawRes = JSON.parse(data);
				  if(rawRes['state'] == "success") {
					  res.end(JSON.parse(rawRes['data']));
				  } else {
					  respondJsonFormat(res, rawRes['state'], rawRes['info'], rawRes['data']);
				  }
			  });
			 
		  } else {
			  respondJsonFormat(res, "failure", "the service or version of api is unavailable","");
		  }
	  } else {
		  redisBackend.getRedisPair("alive", function(reply) {
			  var rawData = JSON.parse(reply);
			  if(rawData['data'] == "true") {
				  respondJsonFormat(res, "success", "Redis api is working.","");
			  } else {
				  respondJsonFormat(res, "failure", "Redis api is not working.", rawData['data']);
			  }
		  });
	  }
}

/*
 * desc : export as the nodejs module
 * e.g. : 
 * var frontredis = require("frontredis"); 
 */
exports.list = function(req, res){  
  // Website you wish to allow to connect
  res.header('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
	
  res.writeHead(200, {"Content-Type": "application/json"});

  switch(req.method.toLocaleLowerCase()) {
	default:
	case "get":
		__parseGetReqRes(req, res);
		break;
  }
};



