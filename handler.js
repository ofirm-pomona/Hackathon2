var request = require('request');
var AWS = require('aws-sdk');

AWS.config.update({
  region: "us-west-1"
});

'use strict';

var docClient = new AWS.DynamoDB.DocumentClient();
var table = "hackathon2";

module.exports.fetch = (event, context, callback) => {
  const response = {
    statusCode: 200,
    headers: {
    "Access-Control-Allow-Origin" : "*"
    },
    body: JSON.stringify({
      message: 'OK',
      input: event,
    }),
  };

  	var params = {
    	TableName: table
	};
	docClient.delete(params, function(err, data) {
		if (callback) {
        fetchBusInformation();
      }
  });

  callback(null, response);
};

module.exports.query = (event, context, callback) => {
   var params = {
    TableName: table
	};
	docClient.scan(params, function(err, data) {
		if (callback) {
        const responseOk = {
          statusCode: 200,
          headers: {
	        "Access-Control-Allow-Origin" : "*"
	        },
          body: JSON.stringify(data.Items),
        };
        callback(null, responseOk);  
      }
  });
};

function fetchBusInformation() {
	request({
		url: 'https://rqato4w151.execute-api.us-west-1.amazonaws.com/dev/info',
		json: true
		}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
		  for (var i = 0; i < body.length; i++) {
		    var object = body[i]
		    putItem(object.id, object.logo, object.lat, object.lng, object.route)
		  }
		} 
	});
}

function putItem(id, logo, lat, lng, route) {
  var params = {
      TableName:table,
      Item:{
          "id": id,
          "logo": logo,
          "lat": lat,
          "lng": lng,
          "route": route,
          "timestamp": Date.now()
      }
  };

  docClient.put(params, function(err, data) {
      if (err) {
          console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
      } else {
          console.log("Added item:", JSON.stringify(data, null, 2));
      }
  });       
}