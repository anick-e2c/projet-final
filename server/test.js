// testConnect.js
import connectDB from './database/db.js';

const test = async () => {
  const ok = await connectDB();
  console.log('Connexion réussie ?', ok);
  
};

test();
// testConnect.js
// This script is used to test the database connection independently.   


// It imports the connectDB function from the database module and calls it.
// If the connection is successful, it logs a success message; otherwise, it logs an error
// message and indicates that the server will run in mock mode without a database.
// This is useful for debugging and ensuring that the database connection works as expected.
// To run this script, use the command: node server/test.js
