const mongoose = require('mongoose');

const mongoURI = 'mongodb://localhost:27017/saas_db';

console.log('Attempting to connect to MongoDB...');

// Define a simple schema
const testSchema = new mongoose.Schema({
  name: String,
});

const TestModel = mongoose.model('Test', testSchema);

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
}).then(() => {
  console.log('Connected to MongoDB');
  mongoose.connection.close();
}).catch(err => {
  console.error('MongoDB connection error:', err.message);
});