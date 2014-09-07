/**
 * Created by kavi707 on 9/6/14.
 * @author Kavimal Wijewardana <kavi707@gmail.com>
 */

var mongo_connection = require('../utils/mongoose_connection');
var connectionObj = mongo_connection.createMongooseConnection();

var mongoose = connectionObj.mongooseObj;
var entity = connectionObj.entityObj;

module.exports.saveRelationToDb = function (req, res) {
    var firstEntity = req.params.firstEntity;
    var secondEntity = req.params.secondEntity;
    var firstIdentifier = req.params.firstIdentifier;
    var secondIdentifier = req.params.secondIdentifier;
    var relationType = req.params.relationType;

    //create collection object for relations
    var entity_relations = mongoose.model('entity_relations', entity);

    /*********** check first entity existance **********/
    var checkCollection = mongoose.model(firstEntity, entity);
    checkCollection.find({_id: firstIdentifier}, function (firstErr, firstRecords) {
        if (firstErr) {
            console.error(firstErr);
            res.send("Error occured at first entity database check: " + firstErr);
        }
        else {
            if (firstRecords.length != 0) {
                /********* check second entity existance **********/
                var checkSecondCollection = mongoose.model(secondEntity, entity);
                checkSecondCollection.find({_id: secondIdentifier}, function (secondErr, secondRecords) {
                    if (secondErr) {
                        console.error(secondErr);
                        res.send("Error occured at second entity database check: " + secondErr);
                    } else {
                        if (secondRecords.length != 0) {

                            /******* check relation existance ********/
                            var checkRelationCollection = mongoose.model('entity_relations', entity);
                            checkRelationCollection.find({"data.firstIdentifier": firstIdentifier,
                                    "data.secondIdentifier": secondIdentifier, "data.relationType": relationType},
                                function (relationExistanceErr, relationRecords) {
                                    if (relationExistanceErr) {
                                        console.error(relationExistanceErr);
                                        res.send("Error occured at entity_relations entity database check: " + relationExistanceErr);
                                    } else {
                                        if (relationRecords.length == 0) {
                                            dbObject = {
                                                "firstEntity": firstEntity,
                                                "firstIdentifier": firstIdentifier,
                                                "relationType": relationType,
                                                "secondEntity": secondEntity,
                                                "secondIdentifier": secondIdentifier
                                            };
                                            console.log("Database object: " + JSON.stringify(dbObject));
                                            var newEntry = new entity_relations({data: dbObject});
                                            newEntry.save(function (err, savedRelationship) {
                                                if (err) {
                                                    console.error(err);
                                                    res.send("Error occured at database insertion: " + err);
                                                } else {
                                                    res.send(savedRelationship);
                                                }
                                            });
                                        } else {
                                            res.send("Given relation is already exists");
                                        }
                                    }
                                });
                            /******* check relation existance ********/

                        } else {
                            res.send("Given second entity is not available in the database");
                        }
                    }
                });
                /********* check second entity existance **********/
            } else {
                res.send("Given first entity is not available in the database");
            }
        }
    });
    /*********** check first entity existance **********/
};