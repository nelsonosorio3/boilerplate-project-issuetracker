'use strict';
const mongoose = require("mongoose");
const mySecret = process.env['DB'];
var ObjectId = require('mongodb').ObjectID;
mongoose.connect(mySecret, {userNewUrlParser: true, useUnifiedTopology: true});

const Schema = mongoose.Schema;

const issueSchema = new Schema({
  project: {type: String, required: true},
  issue_title: {type: String, required: true},
  issue_text: {type: String, required: true},
  created_by: {type: String, required: true},
  assigned_to: {type: String, required: false, default: ""},
  open: {type: Boolean, required: true, default: true},
  status_text: {type: String, required: false, default: ""}
}, {timestamps: {createdAt: "created_on", updatedAt: "updated_on"}});


const Issue = mongoose.model("Issue", issueSchema);

const getAllIssuesProject = async project =>{
  const issues = await Issue.find({project},(err, data)=>{
    if (err) console.log(err);
    return data;
  });
  return issues;
};

const filterIssues = async (id, project, issue_title, issue_text, created_on, updated_on, created_by, assigned_to, open, status_text) =>{
  const issues = await getAllIssuesProject(project);
  let issues_filtered = issues;
  if(issue_title) issues_filtered = issues_filtered.filter(issue=> issue.issuse_title.includes(issue_title));
  if(issue_text) issues_filtered = issues_filtered.filter(issue=> issue.issuse_text.includes(issuse_text));
  if(created_on) issues_filtered = issues_filtered.filter(issue=> issue.created_on.includes(created_on));
  if(updated_on) issues_filtered = issues_filtered.filter(issue=> issue.updated_on.includes(updated_on));
  if(created_by) issues_filtered = issues_filtered.filter(issue=> issue.created_by === created_by);
  if(assigned_to) issues_filtered = issues_filtered.filter(issue=> issue.assigned_to === assigned_to);
  if(open) issues_filtered = issues_filtered.filter(issue=> issue.open.toString() === open);
  if(status_text) issues_filtered = issues_filtered.filter(issue=> issue.status_text.includes(status_text));
  if(id) issues_filtered = issues_filtered.filter(issue=> issue["_id"] == id);
  
  return issues_filtered;
};

const createIssue = async (project, issue_title, issue_text, created_by, assigned_to, status_text) =>{
  const issue = await Issue.create({project, issue_title, issue_text, created_by, assigned_to, open: true, status_text});
  return issue;
};

const updateIssue = async (id, open, issue_title, issue_text, created_by, assigned_to, status_text ) =>{
  if(!ObjectId.isValid(id)) return false;
  
  if(issue_title === "") issue_title = undefined;
  if(issue_text === "") issue_text = undefined;
  if(created_by === "") created_by = undefined;
  if(assigned_to === "") assigned_to = undefined;
  if(status_text === "") status_text = undefined;

  const issue = await Issue.findByIdAndUpdate(id, {open, issue_title, issue_text, created_by, assigned_to, status_text}, {omitUndefined: true});
  console.log("before", issue)
  // if(issue){
  //   issue.updated_on = new Date();
  //   issue.issue_text = issue_text;
  //   issue.update();
  //   }
  //   if(issue_title) issue.issue_title = issue_title;
  //   if(issue_text) issue.issue_text = issue_text;
  //   if(created_by) issue.issue_text = created_by;
  //   if(assigned_to) issue.assigned_to = assigned_to;
  //   if(status_text) issue.status_text = status_text;
    
  //   issue.update();
  // }
  const issue2 = await Issue.findById(id);
  return issue2;
};

const deleteIssue = async id => {
  if(!ObjectId.isValid(id)) return false;
  const found = await Issue.findById(id);
  if(!found) return false;
  await Issue.findByIdAndDelete(id);
  return true;
};

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(async function (req, res){
      let project = req.params.project;
      let {_id, issue_title, issue_text, created_on, updated_on, created_by, assigned_to, open, status_text} = req.query;
      if(Object.keys(req.query).length = 0){
        const all = await getAllIssuesProject(project);
        return res.json(all);
      }
      const issues = await filterIssues(_id, project, issue_title, issue_text, created_on, updated_on, created_by, assigned_to, open, status_text);
      res.json(issues);
    })
    
    .post(async function (req, res){
      let project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;
      if(!issue_title || !issue_text || !created_by) return res.json({error: 'required field(s) missing'});
      const issue = await createIssue(project, issue_title, issue_text, created_by, assigned_to, status_text );
      res.json(issue);
    })
    
    .put(async function (req, res){
      let project = req.params.project;
      console.log(req.body);
      let {_id, issue_title, issue_text, created_by, assigned_to, status_text, open} = req.body;
      if(!_id) return res.json({error: 'missing _id'});
      if(!issue_title && !issue_text && !created_by && !assigned_to && !status_text && !open) return res.json({error: 'no update field(s) sent', '_id': _id});
      // if(open === undefined) open = true;
      const issue = await updateIssue(_id, open, issue_title, issue_text, created_by, assigned_to, status_text);
      console.log("PUT",issue)
      if(!issue) return res.json({error: 'could not update', '_id': _id});

      return res.json({result: 'successfully updated', '_id': _id});
      
    })
    
    .delete(async function (req, res){
      let project = req.params.project;
      const id = req.body["_id"];
      if(!id) return res.json({error: 'missing _id'});
      const found = await deleteIssue(id);
      if(!found) return res.json({error: "could not delete", "_id":id})
      return res.json({result: "successfully deleted", "_id": id});
    });
    
};
