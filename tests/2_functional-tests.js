/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
chai.use(require('chai-datetime'));
var assert = chai.assert;
var expect = chai.expect;
var server = require('../server');

//store a sample _id for later reuse
let sampleId = '';

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
    suite('POST /api/issues/{project} => object with issue data', function() {
      
      test('Every field filled in', function(done) {
        //store time to compare created_on and updated_on
        const startTime = new Date();
       chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res){
          //store returned time
          const endTime = new Date();
          assert.equal(res.status, 200);
          assert.equal(res.body.project,'test');
          assert.equal(res.body.issue_title,'Title');
          assert.equal(res.body.issue_text,'text');
          assert.equal(res.body.created_by,'Functional Test - Every field filled in');
          assert.equal(res.body.assigned_to,'Chai and Mocha');
          assert.equal(res.body.status_text, 'In QA');
          assert.equal(res.body.open,true);
          //make sure the created on and updated on fields are correct
          expect(new Date(res.body.created_on)).to.be.withinTime(startTime,endTime);
          expect(new Date(res.body.updated_on)).to.be.withinTime(startTime,endTime);

          //store the _id as a sample
          sampleId = res.body._id;
          done();
        });
      });
      
      test('Required fields filled in', function(done) {
        //store time to compare created_on and updated_on
        const startTime = new Date();
        chai.request(server).post('/api/issues/test').send({
          issue_title:'Title',
          issue_text:'text',
          created_by:'Chai'
        }).end(function(err,res){
          //store returned time
          const endTime = new Date();
          assert.equal(res.status,200);
          assert.equal(res.body.project,'test');
          assert.equal(res.body.issue_title,'Title');
          assert.equal(res.body.issue_text,'text');
          assert.equal(res.body.created_by,'Chai');
          assert.equal(res.body.assigned_to,'');
          assert.equal(res.body.status_text, '');
          assert.equal(res.body.open,true);
          //make sure the created on and updated on fields are correct
          expect(new Date(res.body.created_on)).to.be.withinTime(startTime,endTime);
          expect(new Date(res.body.updated_on)).to.be.withinTime(startTime,endTime);
          done();
        })
      });
      
      test('Missing required fields', function(done) {
        chai.request(server).post('/api/issues/test').send({}).end(function(err,res){
          assert.equal(res.status,400);
          assert.equal(res.text,'Issue Title is a required field. Issue Text is a required field. Created By is a required field.');
          done();
        });
      });
      
    });
    
    suite('PUT /api/issues/{project} => text', function() {
      
      test('No body', function(done) {
        chai.request(server).put('/api/issues/test').send({_id:sampleId}).end(function(err,res){
          assert.equal(res.status,400);
          assert.equal(res.text,'no updated field sent');
          done();
        })
      });
      
      test('One field to update', function(done) {
        chai.request(server).put('/api/issues/test').send({_id:sampleId,issue_title:'Test Title Updated'}).end(function(err,res){
          assert.equal(res.status,200);
          assert.equal(res.text,'successfully updated');
          done();
        })
      });
      
      test('Multiple fields to update', function(done) {
        chai.request(server).put('/api/issues/test').send({_id:sampleId,issue_title:'Test Title Updated Again',issue_text:'Issue text updated'}).end(function(err,res){
          assert.equal(res.status,200);
          assert.equal(res.text,'successfully updated');
          done();
        })
      });
      
    });
    
    suite('GET /api/issues/{project} => Array of objects with issue data', function() {
      
      test('No filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });
      
      test('One filter', function(done) {
        chai.request(server).get('/api/issues/test').query({issue_title:'Test Title Updated Again'}).end((err,res)=>{
          assert.equal(res.status,200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          assert.equal(res.body[0]['issue_title'],'Test Title Updated Again');
          done();
        })
      });
      
      test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
        chai.request(server).get('/api/issues/test').query({issue_title:'Test Title Updated Again',issue_text:'Issue text updated'}).end((err,res)=>{
          assert.equal(res.status,200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          assert.equal(res.body[0]['issue_title'],'Test Title Updated Again');
          assert.equal(res.body[0]['issue_text'],'Issue text updated');
          done();
        })
      });
      
    });
    
    suite('DELETE /api/issues/{project} => text', function() {
            test('No _id', function(done) {
              chai.request(server).delete('/api/issues/test').send({}).end((err,res)=>{
                assert.equal(res.status,400);
                assert.equal(res.error.text, '_id error');
                done()
              })
              });
      
      test('Valid _id', function(done) {
        chai.request(server).delete('/api/issues/test').send({_id:sampleId}).end((err,res)=>{
          assert.equal(res.status,200);
          done();
        })
      });
      
    });

});
