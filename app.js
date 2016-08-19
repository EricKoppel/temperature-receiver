var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var config = require('./config');
var pool = mysql.createPool({
	connectionLimit: 10,
	host: config.db.host,
	user: config.db.username,
	password: config.db.password,
	database: config.db.database
});

var app = express();
app.use(bodyParser.json());
app.post('/', function(req, resp) {
  console.log(req.body);	
  pool.getConnection(function(err, connection) {
    if (err) {
      console.log(err);
      resp.status(500).send("Error acquiring database connection");
    } else {
        var query = connection.query('INSERT INTO temperature_data(time, temperature) SELECT ?, ? FROM dual WHERE NOT EXISTS (SELECT * FROM temperature_data WHERE time = (SELECT MAX(time) FROM temperature_data) AND temperature = ?)', [req.body.time, req.body.temperature, req.body.temperature], function(err, result) {
	  console.log("Inserted " + result.affectedRows + " rows.");
	  connection.release();
	  if (err) {
	    resp.status(500).send("Error inserting data");
	  } else {
	    resp.status(201).send();
	  }
	  resp.end();
	});

	console.log(query.sql);
      }
  });
});

app.get('/temperature', function(req, res, next) {
  pool.getConnection(function(err, connection) {
    if (err) {
      console.log(err);
      res.status(500).send("Error acquiring database connection");
    } else {
      var query = connection.query('SELECT * FROM temperature_data WHERE time = (SELECT MAX(time) FROM temperature_data)', function(err, result) {
        connection.release();
        if (err) {
          console.log(err);
          res.status(500).send("Error fetching data").end();
        } else {
          console.log(result);
          res.send(result).end();
        }
      });
    }
  });
});

app.get('/temperature/:year', function(req, res, next) {
  pool.getConnection(function(err, connection) {
    if (err) {
      console.log(err);
      res.status(500).send("Error acquiring database connection");
    } else {
      var query = connection.query('SELECT * FROM temperature_data WHERE YEAR(time) = ?', [req.params.year], function(err, result) {
        connection.release();
        if (err) {
          console.log(err);
          res.status(500).send("Error fetching data").end();
        } else {
          console.log(result);
          res.send(result).end();
        }
      });
    }
  });
});

app.get('/temperature/:year/:month', function(req, res, next) {
  pool.getConnection(function(err, connection) {
    if (err) {
      console.log(err);
      res.status(500).send("Error acquiring database connection");
    } else {
      var query = connection.query('SELECT * FROM temperature_data WHERE YEAR(time) = ? AND MONTH(time) = ?', [req.params.year, req.params.month], function(err, result) {
        connection.release();
        if (err) {
          console.log(err);
          res.status(500).send("Error fetching data").end();
        } else {
          console.log(result);
          res.send(result).end();
        }
      });
    }
  });
});

app.get('/temperature/:year/:month/:day', function(req, res, next) {
  pool.getConnection(function(err, connection) {
    if (err) {
      console.log(err);
      res.status(500).send("Error acquiring database connection");
    } else {
      var query = connection.query('SELECT * FROM temperature_data WHERE YEAR(time) = ? AND MONTH(time) = ? AND DAY(time) = ?', [req.params.year, req.params.month, req.params.day], function(err, result) {
        connection.release();
        if (err) {
          console.log(err);
          res.status(500).send("Error fetching data").end();
        } else {
          console.log(result);
          res.send(result).end();
        }
      });
    }
  });
});

app.listen(3000);
