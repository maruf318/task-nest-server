const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

//middlewares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ox9wd7x.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const taskCollection = client.db("taskManagementDB").collection("tasks");

    //task related api
    app.post("/tasks", async (req, res) => {
      const newTask = req.body;
      const result = await taskCollection.insertOne(newTask);
      res.send(result);
    });
    //getting some data of a certain user
    app.get("/tasks", async (req, res) => {
      console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
        query = { userEmail: req.query.email };
      }
      const result = await taskCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/task/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await taskCollection.findOne(query);
      res.send(result);
    });

    app.patch("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const { category } = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          category: category,
        },
      };
      const result = await taskCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    app.patch("/task/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };

      const updatedTask = req.body;
      console.log(id, updatedTask);
      const task = {
        $set: {
          title: updatedTask.title,
          priority: updatedTask.priority,
          description: updatedTask.description,
          deadline: updatedTask.deadline,
          userEmail: updatedTask.userEmail,
          category: updatedTask.category,
        },
      };
      const result = await taskCollection.updateOne(filter, task);
      res.send(result);
    });

    app.delete("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await taskCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("task is running");
});

app.listen(port, () => {
  console.log(`task is sitting on port ${port}`);
});
