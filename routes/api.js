/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {
  //connect to the database
  let issuesCollection;
  const client = new MongoClient(CONNECTION_STRING, { useNewUrlParser: true });

  client.connect(err => {
    if(err) throw err;
    issuesCollection = client.db("issuetracker").collection("issues");
    console.log('DB Connected');
  });
  
  app.route('/api/issues/:project')
  
    .get(function (req, res){
      const project = req.params.project;
      const queryObj = {project,...req.query};
      //find the issues in the collection
      issuesCollection.find(queryObj).toArray((err,issues)=>{
        //if there was an error
        if(err)return res.status(400).json({error:err});
        res.status(200).json(issues);
      })
    })
    
    .post(function (req, res){
      var project = req.params.project;
      //required parameters
      const issue_title=req.body.issue_title;
      const issue_text=req.body.issue_text;
      const created_by=req.body.created_by;
      //optional parameters. Blank if undefined
      const assigned_to=req.body.assigned_to ? req.body.assigned_to:'';
      const status_text=req.body.status_text ? req.body.status_text:'';

      /* Make sure the required params are included */
      if(!issue_title || !issue_text || !created_by){
        //initialize the error object
        let errString = '';
        //if there is no issue title
        if(!issue_title) errString += 'Issue Title is a required field.';
        //if there is no issue text
        if(!issue_text) errString += ' Issue Text is a required field.';
        //if there is no created by
        if(!created_by) errString += ' Created By is a required field.';
        res.status(400).send(errString);
      }
      else{
        //insert the new record into the database
        issuesCollection.insertOne({
          project,
          issue_title,
          issue_text,
          created_by,
          assigned_to,
          status_text,
          created_on:new Date(),
          updated_on:new Date(),
          open:true
        },(err,result)=>{
          if(err) res.status(400).send(err);
          res.status(200).json(result.ops[0]);
        });                                                   
      }

      
    })
    
    .put(function (req, res){
      //array of valid fields
      const fields = ['issue_title','issue_text','created_by','assigned_to','status_text'];
      //if there is no _id provided
      if(!req.body._id){
        //return error
        return res.status(400).send('Issue _id is required');
      }
      //store updated data
      let updateObj = {};
      //flag if the input includes valid fields
      let valid = false;
      //validate form input
      Object.keys(req.body).forEach(key=>{
        if(fields.includes(key)){
          valid = true;
          //add the value to the update object
          updateObj[key]=req.body[key];
        }
      })
      
      //if valid data was provided
      if(valid){
        //add the updated_on field
        updateObj.updated_on = new Date();
        //update the document in the database
        issuesCollection.updateOne({_id:ObjectId(req.body._id)},{$set:updateObj}).then(()=>{
          res.status(200).send('successfully updated');
        }).catch(()=>res.status(400).send(`could not update ${req.body._id}`));
      }
      //if valid data was not provided
      else{
        return res.status(400).send('no updated field sent');
      }
    })
    
    .delete(function (req, res){
      //if there is no id provided 
      if(!req.body._id){
        return res.status(400).send('_id error');
      }
      else{
        issuesCollection.deleteOne({_id:ObjectId(req.body._id)},err=>{
          if(err){
            return res.status(400).send(`could not delete ${req.body._id}`);
          }
          else{
            return res.status(200).send(`deleted ${req.body._id}`);
          }
        });
      }
    });
    
};
