# Akto_assignment

This script is designed to fetch data from a specific file in a GitHub repository, update a MongoDB database with the fetched data, and perform regular updates at specified intervals. It is primarily used for updating Personally Identifiable Information (PII) data in the database.

## Prerequisites

Before running this script, ensure that you have the following:

- Node.js installed on your machine
- Access to a MongoDB database
- GitHub repository with the data file to be fetched
- GitHub Personal Access Token (PAT) with appropriate permissions

## Installation

1. Clone the repository or download the script file to your local machine.
2. Install the required dependencies by running the following command in the project directory:

   ```shell
   npm install
   ```
### Configuration MongoDb

1. Set Up A MongoDb Cluster
2. Obtain the MongoDb Connection URI and use it for the variable {mongoURI} in the code.

### Configuration GitHub
1. Use the account name for the variable {`owner`} in the code (In my case it is 'anishgupta1510')
2. Use the repositry name name for the variable {`repo`} in the code (In my case it is 'repo')
3. Use the path to the file and make sure it is a valid JSON File and use it for the variable {`path`} (In My case it is data.json)

### Running the SCript 
To run the Script , use the following command
If you have nodemon installed
```bash
   nodemon index.js
```
OR
```bash
   node index.js
```

The Script will connect to the MongoDb and will give output in the console as `Connected to DataBase`
And , When the DataFetching and updation is complete the console will give output as `Data updation successfull`

### Script Behavior
- Establishes a connection to the MongoDB database using the provided mongoURI.
- Defines a schema and model for the data to be stored in the database.
- Fetches the data from the specified file in the GitHub repository using the provided owner, repo, path, and token.
- Parses the fetched content and validates the data format.
- Compares the fetched data with the existing data in the MongoDB collection.
- Identifies new entries, updated entries, and deleted entries.
- Deletes the documents for deleted entries from the database.
- Inserts new entries into the database.
- Updates existing entries in the database.
- Logs the success message upon successful data updating.

Any errors encountered during the execution of the script will be logged and thrown as exceptions.

The script is configured to run at regular intervals using the setInterval function. By default, the interval is set to every 10 minutes (timeInterval = 10 * 60 * 1000). You can adjust the interval as per your requirements by modifying the timeInterval variable in the code.