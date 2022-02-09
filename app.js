//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
});

const itemSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemSchema);

const doHomework = new Item({
  name: "Welcome To The To Do List",
});

const washClothes = new Item({
  name: "Hit The + Button To Add New Item",
});

const readBooks = new Item({
  name: "<-- Hit The Checkbox To Delete The Item",
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema],
});

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find(function (err, items1) {
    if (err) {
      console.log(err);
    } else {
      if (items1.length === 0) {
        Item.insertMany([doHomework, washClothes, readBooks], function (err) {
          if (err) {
            console.log(err);
          } else {
            console.log("All documents inserted in the collection");
          }
        });
        res.redirect("/");
      } else {
        res.render("list", { listTitle: "Today", newListItems: items1 });
      }
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const verifier = req.body.list;
  const item2 = new Item({
    name: itemName,
  });

  if (verifier === "Today") {
    item2.save();

    res.redirect("/");
  } else {
    List.findOne({ name: verifier }, function (err, foundIt) {
      if (err) {
        console.log(err);
      } else {
        foundIt.items.push(item2);

        foundIt.save();

        res.redirect("/" + verifier);
      }
    });
  }
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (!err) {
        console.log("Successfully deleted checked item ");
        res.redirect("/");
      } else {
        console.log(err);
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      function (err, docs) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.get("/:variable", function (req, res) {
  const customListName = _.upperCase(req.params.variable);

  List.find({ name: customListName }, function (err, listitems) {
    if (err) {
      console.log(err);
    } else {
      if (listitems.length === 0) {
        //create a new list
        const list = new List({
          name: customListName,
          items: [doHomework, washClothes, readBooks],
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        //show a new list
        res.render("list", {
          listTitle: listitems[0].name,
          newListItems: listitems[0].items,
        });
      }
    }
  });
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
