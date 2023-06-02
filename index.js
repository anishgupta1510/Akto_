require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');

const mongoURI = process.env.MONGO_URL;

// MongoDB connection
mongoose.connect(mongoURI, { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to DataBase');
});

// Schema definition for the data
const piiSchema = new mongoose.Schema({
  name: String,
  regexPattern: String,
  sensitive: Boolean,
  onKey: Boolean
}, { strict: false });

// Model definition for the data
const PiiModel = mongoose.model('Pii', piiSchema);

const CronFetchAndUpdate = async () => {

  try {
    // Data fetching from a specific file in GitHub
    const owner = 'anishgupta1510';
    const repo = 'Akto';
    const path = 'data.json';
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const token = process.env.GITHUB_TOKEN;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
    const parsedContent = JSON.parse(content);
    const data = parsedContent.types;

    //checking if the data format obtained is correct or not
    if (!Array.isArray(data)) {
        throw new Error('Unsupported data format');
    }

    // Getting existing documents from the collection
    const existingDocuments = await PiiModel.find({});

    // Declaring a set to store existingEntryNames
    let existingEntryNames = new Set(existingDocuments.map(existingEntry => existingEntry.name));

    // Finding new entries 
    const newEntries = data.filter(newEntry => !existingEntryNames.has(newEntry.name));      

    //Finding updated entries
    const updatedEntries = data.filter(updatedEntry => existingEntryNames.has(updatedEntry.name));

    //Clearing the set for further use
    existingEntryNames.clear();

    //Adding names of entries from the mongodb in the set
    existingEntryNames = new Set(data.map(newEntry => newEntry.name));

    // Delete documents for deleted entries
    const deletedEntries = existingDocuments.filter(existingEntry => !existingEntryNames.has(existingEntry.name));

    // Deleting entries from mongodb
    for (const deletedEntry of deletedEntries) {
      await PiiModel.deleteOne({ _id: deletedEntry._id });
    }

    // Inserting new entries in mongodb
    for (const newEntry of newEntries) {
      const entry = new PiiModel(newEntry);
      await entry.save();
    }

    // Update existing entries in mongodb
    for (const updatedEntry of updatedEntries) {
      const existingEntry = existingDocuments.find(existingEntry => existingEntry.name === updatedEntry.name);
      existingEntry.onKey = updatedEntry.onKey;
      existingEntry.regexPattern = updatedEntry.regexPattern;
      existingEntry.sensitive = updatedEntry.sensitive;
      await existingEntry.save();
    }

    console.log('Data updation successfull');
  } catch (error) {
    console.error('An error was found', error.message);
    throw error
  }
};

//Setting a time interval for running the function
const timeInterval = 5*1000;

//Calling the function
CronFetchAndUpdate();

//Using setInterval to call the function after every timeInterval
setInterval(CronFetchAndUpdate,timeInterval);
