var MongoClient = require('mongodb').MongoClient;

// with this timeout the loop reports a single document
var TIMEOUT = 15 * 60 * 1000;
// with this timeout the loop reports 10 documents
// var TIMEOUT = 0;

MongoClient.connect("mongodb://localhost:3001/meteor", function(err, db) {
  if (err)
    return console.log(err);
  
  var collection = db.collection('documents');
  var cursor = collection.find({}, {});
  
  var i = 0;
  var go = function() {
    cursor.nextObject(function(error, doc) {
      if (err)
        return console.log(err);

      if (doc) {
        i += 1;
        console.log(i, 'got a doc');
        setTimeout(function() {
          go();
        }, TIMEOUT);
      } else {
        console.log('done!');
        db.close();
      }
    })
  }
  go();
});


