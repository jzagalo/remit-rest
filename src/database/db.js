const { MongoClient } = require('mongodb');

const uri =
  'mongodb+srv://paulezaga:<78JSdm7UTHJt0al8>@cluster0.kjncde3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

let client;

const getDB = () => {
  if (!client) {
    console.log('Creating a new client!');
    client = new MongoClient(uri);
  } else {
    console.log('Reusing the old client');
  }

  const database = client.db('test');
  const products = database.collection('products');
  const orders = database.collection('orders');

  return {
    products,
    orders,
  };
};

module.exports = getDB;
