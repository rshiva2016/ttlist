//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://ss3099848:adithya@cluster00.flgezhj.mongodb.net/todoListDB",{useNewUrlParser : true});
const iitems={
  name:String
};

const Item = mongoose.model("Item",iitems);

const item1 = new Item({
  name : "welcome",
});

const item2 = new Item({
  name : "type + to add your task",
});

const item3 = new Item({
  name : "<---hit  this to delete",
});

defaultProduct = [item1,item2,item3];

const listSchema = {
  name : String,
  items : [iitems],
}
const List = mongoose.model("List",listSchema);

app.get("/", async function(req, res) {
    
  const allItems = await Item.find();
  if(allItems.length === 0)
  {
    Item.insertMany(defaultProduct)
      .then(function () {
        console.log("Successfully saved defult items to DB");
      })
      .catch(function (err) {
        console.log(err);
      }); 
      res.redirect("/");
  }
  else{
    res.render("list", {listTitle: "Today", newListItems: allItems});
  }
});


app.get("/:customListName",async function(req,res){
  const nname = _.capitalize(req.params.customListName);
  const nitems = await List.findOne({name : nname});
  if(!nitems)
  {
    const list1 = new List({
      name : nname,
      items: defaultProduct,
    });
    list1.save();
    res.redirect("/"+nname);
  }
  else
  {
    res.render("list", {listTitle: nitems.name, newListItems: nitems.items});
  }
});

app.post("/", async function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name : itemName
  });

  if (listName === "Today")
  {
    item.save();
    res.redirect("/");
  }else{
      const foundList = await List.findOne({name : listName});
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
  }
});

app.post("/delete" , async ( req , res ) =>{
  const itemId = req.body.checkbox;
  const nameOflist = req.body.listName;

  if(nameOflist === "Today")
  {
    await Item.findOneAndRemove({_id: itemId});
    console.log("Deleted!");
    res.redirect("/");
  }
  else{
    await List.findOneAndUpdate({name:nameOflist},{$pull:{items:{_id:itemId}}});
    res.redirect("/"+nameOflist);
  }
})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
