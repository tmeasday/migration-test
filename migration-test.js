if (! Meteor.isServer)
  return;
  
var Documents = new Mongo.Collection('documents');

// create some >4mb documents
if (Documents.find().count() === 0) {
  var bigStr = _.times(1024 * 1024, function() { return '01234'}).join();
  _.times(10, function() {
    Documents.insert({
      str: bigStr
    })
  });
}

Log("There are " + Documents.find().count() + " documents");

var i = 0;
Documents.find().forEach(function() {
  i += 1;
  // >10 minutes
  Meteor._sleepForMs(15 * 60 * 1000);
  Log(i);
});

Log("The loop ran " + i + " times");