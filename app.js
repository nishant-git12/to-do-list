//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-nishant:test123@cluster0.ioyfwmy.mongodb.net/todolistDB",{useNewUrlParser: true, useUnifiedTopology : true}).then(function(){
  console.log("connected to mongodb database")
});

const itemsSchema =  new mongoose.Schema({
  name : String
});

const Task =  mongoose.model("Task", itemsSchema);

const item1 = new Task({
  name :"Welcome to your to-do-list" 
});
const item2 = new Task({
  name : "Hit + to add new item"
});
const item3 = new Task({
  name : "<-- to delete an item"
});
const defaultItems = [item1, item2,item3];

const listSchema ={
  name : String,
  items : [itemsSchema]
};

const List = mongoose.model("List", listSchema);


// const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];
 
app.get("/", function(req, res) {
  
  Task.find().then(function(founditems){

    if(founditems.length==0)
    {
      Task.insertMany(defaultItems).then(function(){
        console.log("successfully inserted all items");
      });
      res.redirect("/");
    }
    else
    res.render("list", {listTitle: "Today", newListItems: founditems});

  });
  

});

app.post("/", function(req, res){

  const newName = req.body.newItem;
   const newlist = req.body.list;
  const newItem= new Task({
    name : newName
  });

  if(newlist === "Today")
  {
    newItem.save();
    res.redirect("/");
  }
  else
  List.findOne({name: newlist}).then(function(foundlist){
     foundlist.items.push(newItem);
     foundlist.save();
     res.redirect("/" + newlist);
  })

});

app.post("/delete",function(req,res){
 const checked =req.body.checkbox;
 const listName = req.body.listName;

 if( listName=== "Today")
 {
  Task.findByIdAndRemove(checked).then(function(){
    console.log("deleted successfully");
   })
   res.redirect("/");
  }
  else{
    List.findOneAndUpdate({ name : listName},{$pull: {items: {_id: checked}}}).then(function(foundlist){
      res.redirect("/" + listName);
    });
  }
  });
 



app.get("/:parameters", function(req,res){
  const customlistname = _.capitalize(req.params.parameters) ;
 
  List.findOne( {name: customlistname}).then(function(foundlist){
   
    if(!foundlist)
    {
      const list = new List({
        name : customlistname,
        items: defaultItems
       });
      
       list.save();
       res.redirect("/" + customlistname);
    }
    else{
      res.render("list",{listTitle: foundlist.name , newListItems: foundlist.items});
    }
  })
 
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
