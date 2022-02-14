const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const ObjectId = require('mongodb').ObjectId;
var MongoClient = require('mongodb').MongoClient;
const SSLCommerzPayment = require('sslcommerz');
const { v4: uuidv4 } = require('uuid');
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())

var uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.c1ygv.mongodb.net:27017,cluster0-shard-00-01.c1ygv.mongodb.net:27017,cluster0-shard-00-02.c1ygv.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-10o2xl-shard-0&authSource=admin&retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function server() {
    try{
        await client.connect();
        const database = client.db('Drone_Squire');                         // Database Name
        const productsCollection = database.collection('products'); 
        const usersCollection = database.collection('user'); 
        console.log('Database Connected')  
        

        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({})
            const products = await cursor.toArray()
            res.json(products)
          })

          app.get('/product/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const movie = await productsCollection.findOne(query)
            res.json(movie)
          })

        app.put('/users', async(req, res) => {
            const {email, address, displayName, number, role } = req.body;
            const newUser = {
              email,
              address,
              displayName,
              number,
              role
            }
            const filter = { email: newUser.email };
            const options = { upsert: true};
            const updateDoc = {$set: newUser};
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result)
          })

          app.post('/users', async(req, res) => {
            const {email, displayName, address, number, role} = req.body;
            const query = {email, displayName, role, address, number: number};
            const cursor = await usersCollection.insertOne(query)
            res.json(cursor)
          })
        
    }
        finally{
            // await client.close();
        }
    }
    
server().catch(console.dir)
    
app.get('/', (req, res) => {
    res.send(`API Rinning On Port : ${port}`)
})
    
app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`)
})