if (Meteor.isServer) {
  var Flips = new Meteor.Collection('flips');
  var Responses = new Meteor.Collection('responses');
  var Comments = new Meteor.Collection('comments');

  var onePerRecord = function(cursor, name, fn) {
    if (! _.isFunction(fn))
      throw "Must pass function into `onePerRecord`";

    var count = cursor.count();
    Log('Updating ' + count + ' ' + name + 's');

    var i = 0;
    cursor.forEach(function(record) {
      i += 1;
      if (i % 100 === 0)
        Log('Up to the ' + i + 'th ' + name);
  
      return fn(record);
    });

    Log('Completed updating ' + + i + ' - ' + count + ' ' + name + 's');
  }
  
  Migrations.add({
    name: 'Set flip.lastActivity',
    version: 1,
    up: function() {

      onePerRecord(Flips.find({lastActivity: {$exists: false}}), 'flip', function(flip) {
  
        var lastResponse = Responses.findOne({flipId: flip._id}, {sort: {createdAt: -1}});
  
        var selector = {responseId: {$in: Responses.find({flipId: flip._id}).map(function(r) {return r._id;})}};
        var lastComment = Comments.findOne(selector, {sort: {createdAt: -1}});

        var activity;
        if (lastResponse && (! lastComment || lastResponse.createdAt > lastComment.createdAt)) {
          activity = {
            type: 'added-response',
            id: lastResponse._id,
            text: lastResponse.body,
            userId: lastResponse.studentId,
            at: lastResponse.createdAt
          }
        } else if (lastComment) {
          activity = {
            type: 'added-comment',
            id: lastComment._id,
            text: lastComment.body,
            userId: lastComment.commenterId,
            at: lastComment.createdAt
          }
        } else {
          activity = {
            type: 'added-flip',
            id: flip._id,
            text: flip.title,
            userId: flip.teacherId,
            at: flip.createdAt
          }
        }

        Flips.update({_id: flip._id, lastActivity: {$exists: false}},
          {$set: {lastActivity: activity}});
      });
    }
  });
  
  Meteor.startup(function () {
    console.log("RUNNING MIGRATION FROM WITHIN THE APP");
    Migrations.migrateTo('1,rerun');
  });
}
