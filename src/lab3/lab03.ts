import http, { IncomingMessage, ServerResponse } from 'node:http';
import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'SE2134-Lab3',
  password: '1234554321',
  port: 5433, // Change if your PostgreSQL server is running on a different port
});

async function handleRequest(request: IncomingMessage, response: ServerResponse) {
  const url = request.url;
  const method = request.method;
  const client = await pool.connect();

  console.log('Debugging -- url is', url, 'while method is', method);

  // PATIENT FORM
  if (url?.startsWith('/patients')) {
    console.log('Generating "patient form" html...');
    try {
      const patientHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Patient Form</title>
        </head>
        <body>
        <h1>Animal Patient Form</h1>
        <form action="/add-patient" method="POST">
            Name: <input type="text" name="name" /><br />
            Species: <input type="text" name="species" /><br />
            Age: <input type="number" name="age" /><br />
            Sickness: <input type="text" name="sickness" /><br />

            <button type="submit">Submit</button><br />
        </form>

        <form action="/update-patient-form">
        <h2>Update Existing Patient</h2>
        <p>Please provide patient name: <input type="text" name="name" /></p>
          <button type="submit">Submit</button>
        </form>
        </body>
        </html>`;

      response.writeHead(200, { 'Content-Type': 'text/html' });
      response.end(patientHTML);
      console.log('Patient form successfully generated.');
    } catch (error) {
      console.log(error);
      response.writeHead(500).end('Internal Server Error');
    }
  } else if (method === 'POST' && url?.startsWith('/add-patient')) {
    // Handle POST request for adding a new patient
    // Retrieve form data from the request body and perform necessary actions
    console.log('Handling POST request to add a new patient');

    try {
      let body: string = '';
      request.on('data', (chunk) => {
        body += chunk.toString();
      });

      request.on('end', async () => {
        const formData = new URLSearchParams(body);
        const name: string | null = formData.get('name');
        const species: string | null = formData.get('species');
        const age: number | null = Number(formData.get('age'));
        const sickness: string | null = formData.get('sickness');
        const result = await client.query('SELECT NOW() AS time');
        const createdAt = result.rows[0].time;
        const updatedAt = createdAt;
        console.log('created at: ', createdAt);
        console.log('updated at: ', updatedAt);

        try {
          // Loan Results HTML template
          const resultHTML = `
              <!DOCTYPE html>
              <html lang="en">
              <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Patient Form</title>
              </head>
              <body>
                <h1>Patient added successfully</h1>
                  <form action="/patients">
                    Name: ${name} <br />
                    Species: ${species} <br />
                    Age: ${age} <br />
                    Sickness: ${sickness} <br />
                    Created at: ${createdAt} <br />

                    <button type="submit">Go Back</button>
                  </form>
              </body>
              </html>
            `;

          const insertQuery: string = `
            INSERT INTO patients ("name", "species", "age", "sickness", "created at", "updated at")
            VALUES ($1, $2, $3, $4, $5, $6)`;

          const values: (string | number | Date)[] = [name, species, age, sickness, createdAt, updatedAt];

          await client.query(insertQuery, values);

          console.log('Generating results html...');
          response.writeHead(200, { 'Content-Type': 'text/html' });
          response.end(resultHTML);
        } finally {
          // Release the client back to the connection pool
          client.release();
        }
      });
    } catch (error) {
      console.log(error);
      response.writeHead(500).end('Internal Server Error');
    }
  } else if (url?.startsWith('/update-patient-form')) {
    console.log('Rendering "update patient form" html...');

    try {
      const nameToUpdate = request?.url?.split('=')[1];

      if (!nameToUpdate) {
        response.writeHead(400).end('Error: Patient name not provided');
        return;
      }

      // Check if the patient with the provided name exists in the database
      const checkResult = await client.query('SELECT * FROM patients WHERE name = $1', [nameToUpdate]);

      if (checkResult.rows.length === 0) {
        response.writeHead(404).end('Error: Patient name not found');
        return;
      }

      const updatePatientHTML = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Update Patient Form</title>
            </head>
            <body>
                <h2>Update Patient</h2>
                <form action="/update-success" method="POST">
                    <input type="hidden" name="_method" value="PATCH">
                    <input type="hidden" name="name" value="${nameToUpdate}" />
                    Name: ${nameToUpdate} (Cannot be modified) <br />
                    Species: <input type="text" name="species" /><br />
                    Age: <input type="number" name="age" /><br />
                    Sickness: <input type="text" name="sickness" /><br />
                    <button type="submit">Submit Update</button>
                </form>
                <form action="/patients">
                    <button type="submit">Cancel</button>
                </form>
                <form action="/delete-patient" method="POST">
                    <input type="hidden" name="_method" value="DELETE">
                    <input type="hidden" name="name" value="${nameToUpdate}" />
                    <button type="submit">Delete Patient</button>
                </form>
            </body>
            </html>
        `;

      response.writeHead(200, { 'Content-Type': 'text/html' });
      response.end(updatePatientHTML);
      console.log('Update patient form successfully generated.');
    } catch (error) {
      console.log(error);
      response.writeHead(500).end('Internal Server Error');
    }
  } else if (method === 'POST' && (url?.startsWith('/update-success') || url?.startsWith('/delete-patient'))) {
    try {
      let body: string = '';
      request.on('data', (chunk) => {
        body += chunk.toString();
      });

      request.on('end', async () => {
        const formData = new URLSearchParams(body);
        const nameToUpdate: string | null = formData.get('name');

        if (url?.startsWith('/update-success')) {
          console.log('Handling PATCH request to update an existing patient');
          const species: string | null = formData.get('species');
          const age: number | null = Number(formData.get('age'));
          const sickness: string | null = formData.get('sickness');
          const result = await client.query('SELECT NOW() AS time');
          const updatedAt = result.rows[0].time;

          // Update the patient record in the database
          const updateQuery: string = `
            UPDATE patients
            SET "species" = $1, "age" = $2, "sickness" = $3, "updated at" = $4
            WHERE name = $5
          `;

          const updateValues: (string | number | null)[] = [species, age, sickness, updatedAt, nameToUpdate];
          await client.query(updateQuery, updateValues);

          console.log('Patient record updated successfully.');
        } else if (url?.startsWith('/delete-patient')) {
          console.log('Handling DELETE request to delete an existing patient');

          // Delete the patient record from the database
          const deleteQuery: string = `
            DELETE FROM patients
            WHERE name = $1
          `;

          const deleteValues: (string | null)[] = [nameToUpdate];
          await client.query(deleteQuery, deleteValues);

          console.log('Patient record deleted successfully.');
        }

        // Redirect to a confirmation page or send a response
        const successHTML = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Update/Delete Successful</title>
            </head>
            <body>
                <h1>Operation Successful</h1>
                <form action="/patients">
                    <button type="submit">Go Back</button>
                </form>
            </body>
            </html>
          `;

        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(successHTML);

        // Release the client back to the connection pool
        client.release();
      });
    } catch (error) {
      console.log(error);
      response.writeHead(500).end('Internal Server Error');
    }
  }
}

const server = http.createServer(handleRequest);

server.listen(3000, () => {
  console.log('Server started at http://localhost:3000/patients');
});
