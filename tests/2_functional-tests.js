const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);
let id = "";
suite('Functional Tests', function() {
  //post
  test("Create an issue with every field: POST request to /api/issues/{project}", done=>{
    chai
      .request(server)
      .post("/api/issues/apitest")
      .send({
    "issue_title": "Fix error in posting data",
    "issue_text": "When we post data it has an error.",
    "created_by": "Joe",
    "assigned_to": "Joe",
    "status_text": "In QA"})
      .end((err, res)=>{
        assert.equal(res.body.assigned_to, "Joe");
        assert.equal(res.body.status_text, 'In QA');
        assert.equal(res.body.open, true);
        assert.equal(res.body.issue_title, "Fix error in posting data");
        assert.equal(res.body.created_by, "Joe");
        assert.equal(res.body.issue_text, "When we post data it has an error.");
        id = res.body["_id"];
        done();

      });
  });
  test("Create an issue with only required fields: POST request to /api/issues/{project}", done=>{
    chai
      .request(server)
      .post("/api/issues/apitest")
      .send({
    "issue_title": "Fix error in posting data",
    "issue_text": "When we post data it has an error.",
    "created_by": "Joe"})
      .end((err, res)=>{
        assert.equal(res.body.assigned_to, "");
        assert.equal(res.body.status_text, "");
        assert.equal(res.body.open, true);
        assert.equal(res.body.issue_title, "Fix error in posting data");
        assert.equal(res.body.created_by, "Joe");
        assert.equal(res.body.issue_text, "When we post data it has an error.")
        done();
      });
  });
  test("Create an issue with missing required fields: POST request to /api/issues/{project}", done=>{
    chai
      .request(server)
      .post("/api/issues/apitest")
      .send({
    "issue_text": "When we post data it has an error.",
    "created_by": "Joe",
    "assigned_to": "Joe",
    "status_text": "In QA"})
      .end((err, res)=>{
        assert.equal(res.body.error, "required field(s) missing");
        done();
      });
  });
  //get
  test("View issues on a project: GET request to /api/issues/{project}", done=>{
    chai
      .request(server)
      .get("/api/issues/apitest")
      .end((err, res)=>{
        assert.isArray(res.body);
        done();
      });
  });
  test("View issues on a project with one filter: GET request to /api/issues/{project}", done=>{
    chai
      .request(server)
      .get("/api/issues/apitest?status_text=In QA")
      .end((err, res)=>{
        assert.isArray(res.body);
        done();
      });
  });
  test("View issues on a project with multiple filters: GET request to /api/issues/{project}", done=>{
    chai
      .request(server)
      .get("/api/issues/apitest?created_by=Joe&status_text=In QA")
      .end((err, res)=>{
        assert.isArray(res.body);
        done();
      });
  });
  //put
  test("Update one field on an issue: PUT request to /api/issues/{project}", done=>{
    chai
      .request(server)
      .put("/api/issues/apitest")
      .send({
    "_id": id,
    "issue_title": "new title"})
      .end((err, res)=>{
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body["_id"], id);
        done();
      });
  });
  test("Update multiple fields on an issue: PUT request to /api/issues/{project}", done=>{
    chai
      .request(server)
      .put("/api/issues/apitest")
      .send({
    "_id": id,
    "issue_title": "new title",
    "issue_text": "new text",
    "created_by": "aldo",
    "assigned_to": "aldo",
    "status_text": "almost"})
      .end((err, res)=>{
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body["_id"], id);
        done();
      });
  });
  test("Update an issue with missing _id: PUT request to /api/issues/{project}", done=>{
    chai
      .request(server)
      .put("/api/issues/apitest")
      .send({
    "issue_title": "new title",
    "issue_text": "new text",
    "created_by": "aldo",
    "assigned_to": "aldo",
    "status_text": "almost"})
      .end((err, res)=>{
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });
  test("Update an issue with no fields to update: PUT request to /api/issues/{project}", done=>{
    chai
      .request(server)
      .put("/api/issues/apitest")
      .send({
        "_id": id})
      .end((err, res)=>{
        assert.equal(res.body.error, 'no update field(s) sent');
        assert.equal(res.body["_id"], id);
        done();
      });
  });
  test("Update an issue with an invalid _id: PUT request to /api/issues/{project}", done=>{
    chai
      .request(server)
      .put("/api/issues/apitest")
      .send({
        "_id": "242354252",
        "created_by": "aldo",
        })
      .end((err, res)=>{
        assert.equal(res.body.error, 'could not update');
        assert.equal(res.body["_id"], "242354252");
        done();
      });
  });
  //delete
  test("Delete an issue: DELETE request to /api/issues/{project}", done=>{
    chai
      .request(server)
      .delete("/api/issues/apitest")
      .send({
        "_id": id,
        })
      .end((err, res)=>{
        assert.equal(res.body.result, 'successfully deleted');
        assert.equal(res.body["_id"], id);
        done();
      });
  });
  test("Delete an issue with an invalid _id: DELETE request to /api/issues/{project}", done=>{
    chai
      .request(server)
      .delete("/api/issues/apitest")
      .send({
        "_id": id,
        })
      .end((err, res)=>{
        assert.equal(res.body.error, 'could not delete');
        assert.equal(res.body["_id"], id);
        done();
      });
  });
  test("Delete an issue with missing _id: DELETE request to /api/issues/{project}", done=>{
    chai
      .request(server)
      .delete("/api/issues/apitest")
      .send({
       
        })
      .end((err, res)=>{
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });
});
