const express = require("express");
const path = require("path");
const fs = require("fs/promises");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", async (req, res) => {
  try {
    const json = await fs.readFile("items.json", "utf-8");
    const data = JSON.parse(json);
    res.render("index", { title: "Item Page", items: data });
  } catch (error) {
    console.log(error);
  }
});

app.get("/:id", async (req, res) => {
  try {
    const json = await fs.readFile("items.json", "utf-8");
    const data = JSON.parse(json);
    const id = parseInt(req.params.id);
    const index = data.findIndex((item) => item.id === id);
    res.render("detail", { title: "Detail Page", items: data[index] });
  } catch (error) {
    console.log(error);
  }
});

app.get("/add", async (req, res) => {
  const json = await fs.readFile("items.json", "utf-8");
  const data = JSON.parse(json);
  let nextId = 1;
  const usedIds = new Set(data.map((item) => item.id));
  while (usedIds.has(nextId)) {
    nextId++;
  }
  res.render("add", { title: "Add Item", id: nextId });
});

app.post("/add", async (req, res) => {
  try {
    const { title, price } = req.body;
    const json = await fs.readFile("items.json", "utf-8");
    const data = JSON.parse(json);
    let nextId = 1;
    const usedIds = new Set(data.map((item) => item.id));
    while (usedIds.has(nextId)) {
      nextId++;
    }
    const newItem = { id: nextId, title, price: parseFloat(price) };
    data.push(newItem);
    await fs.writeFile("items.json", JSON.stringify(data, null, 2));
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.get("/delete/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const json = await fs.readFile("items.json", "utf-8");
    const data = JSON.parse(json);
    const index = data.findIndex((item) => item.id === id);
    if (index === -1) {
      return res.status(404).send("Item not found");
    }
    data.splice(index, 1);
    await fs.writeFile("items.json", JSON.stringify(data, null, 2));
    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});

app.get("/update/:id", async (req, res) => {
  try {
    const id = parseFloat(req.params.id);
    const json = await fs.readFile("items.json", "utf-8");
    const data = JSON.parse(json);
    const index = data.find((item) => item.id === id);
    res.render("update", {
      title: "Update Item",
      id: index.id,
      itemTitle: index.title,
      price: index.price,
    });
  } catch (error) {
    console.log(error);
  }
});

app.post("/update/:id", async (req, res) => {
  try {
    const { title, price } = req.body;
    const id = parseFloat(req.params.id);
    const json = await fs.readFile("items.json", "utf-8");
    const data = JSON.parse(json);
    const index = data.findIndex((item) => item.id === id);
    if (index === -1) {
      return res.status(404).send("Item not found");
    }
    data[index] = {
      id: id,
      title: title,
      price: parseFloat(price),
    };
    await fs.writeFile("items.json", JSON.stringify(data, null, 2));
    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
