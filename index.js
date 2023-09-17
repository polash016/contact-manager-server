const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
const port = process.env.PORT || 5000;

app.use(cors());
// app.use(express())
app.use(express.json());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Contact Manager server Running");
});

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bioniru.mongodb.net/?retryWrites=true&w=majority`;
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

    const contactsCollection = client.db("todoDB").collection("contacts");

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    app.get("/api/contacts", async (req, res) => {
      const result = await contactsCollection.find().toArray();
      res.send(result);
    });

    app.get('/api/contacts/:searchText', async (req, res) => {
      const searchText = req.params.searchText;
      const query = {
      $or: [
        { name: { $regex: searchText, $options: 'i' } }, 
        { email: { $regex: searchText, $options: 'i' } },
      ],
    };
      const result = await contactsCollection.find(query).toArray();
      res.send(result);
    })

    app.get('/api/contacts/sort/:sort', async (req, res) => {
      const sort = req.params.sort;
      console.log(sort)
      let sortOption = {};
      if (sort === 'asc') {
        sortOption = { name: 1 }; 
      }
      else if (sort === 'desc') {
        sortOption = { name: -1 };
      }
  
      const result = await contactsCollection
      .find({})
      .sort(sortOption)
      .toArray();

    if (sort === 'asc') {
      result.sort((a, b) => a.name.localeCompare(b.name, 'en'));
    } else if (sort === 'desc') {
      result.sort((a, b) => b.name.localeCompare(a.name, 'en'));
    }
        res.send(result);
    })

    app.post("/api/contacts", async (req, res) => {
      const data = req.body;
      const result = await contactsCollection.insertOne(data);
      res.send(result);
    });
    app.put("/api/contacts/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const query = { _id: new ObjectId(id) };
      const result = await contactsCollection.updateOne(query, { $set: data });
      res.send(result);
    });
   

    // app.all("*", (req, res) => {
    //   res.status(404).send("Not Found");
    // });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server Running on Port ${port}`);
});
