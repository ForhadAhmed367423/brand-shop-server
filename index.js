const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

// console.log(process.env.DB_USER)
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dnqomnb.mongodb.net/?retryWrites=true&w=majority`;
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

    const productCollection = client.db("productDB").collection("product");
    const cartCollection = client.db("productDB").collection("mycart");
    // const cartCollection = client.db("poductDB").collection("cart");

    app.get("/product", async (req, res) => {
      const cursor =await productCollection.find();

      const result = await cursor.toArray();
      res.send(result);
    });

    // Singel Product Details
    app.get("/singleProduct/:id", async (req, res) => {
      const id = req.params.id;

      // Checking if the product Exists
      try {
        const product = await productCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!product) {
          res.status(404).json({ message: "Product Not Found" });
        } else {
          res.status(200).json({
            success: true,
            product,
          });
        }
      } catch (error) {
        res.status(500).json({ message: "Server Error" });
      }
    });

    // Update Single Product
    app.patch("/updateProduct/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      console.log("update Route hit");

      // Get the updated product data from the request body
      const updatedData = req.body;

      console.log(updatedData);

      // Checking if the product Exists
      try {
        const product = await productCollection.updateOne(
          {
            _id: new ObjectId(id),
          },
          { $set: updatedData }
        );
        console.log(product);

        if (product.modifiedCount === 0) {
          res.status(404).json({ message: "Product Not Found" });
        } else {
          res.status(200).json({
            success: true,
            product,
          });
        }
      } catch (error) {
        res.status(500).json({ message: "Server Error" });
      }
    });

    app.post("/product", async (req, res) => {
      const newProduct = req.body;
      console.log(newProduct);
      const result = await productCollection.insertOne(newProduct);
      res.send(result);
    });

    // Cart APi's
    // Create a new route to add an item to the cart
    app.post("/addToCart", async (req, res) => {
      const newItem = req.body;
      console.log(newItem);

      const result = await cartCollection.insertOne(newItem);
      res.send(result);
    });

    app.get("/getCarts", async (req, res) => {
      const carts = cartCollection.find();

      const result = await carts.toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
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
  res.send("Brand shop is running ");
});

app.listen(port, () => {
  console.log(`Brand shop is running on port :  ${port}`);
});
