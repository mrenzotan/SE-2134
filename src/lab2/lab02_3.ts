import http, { IncomingMessage, ServerResponse } from 'node:http';
import { Pool } from 'pg';
import crypto from 'node:crypto';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'SE2134-Lab2',
  password: '1234554321',
  port: 5433, // Change if your PostgreSQL server is running on a different port
});

//INITIAL VALUES
let dueDateSet: boolean = false;
let nearDueDateSet: boolean = false;
let dueDate: Date | null = null;
let nearDueDate: Date | null = null;
let isPastDue: boolean;
let isNearDue: boolean;

async function handleRequest(request: IncomingMessage, response: ServerResponse) {
  const url = request.url;
  const method = request.method;
  const client = await pool.connect();

  console.log('Debugging -- url is', url, 'while method is', method);

  // LOAN APPLICATION FORM
  if (url === '/apply-loan') {
    console.log('Generating loan form html...');
    try {
      const dynamicHTML = `
          <form action="/apply-loan-success">
            Name: <input type="text" name="name" /><br />
            Email: <input type="text" name="email" /><br />
            Phone: <input type="text" name="phone" /><br />
            Loan Amount: <input type="text" name="loan_amount" /><br />
            Reason: <textarea name="reason"></textarea><br />
      
            <label><input type="checkbox" name="agree" />I agree to the terms and conditions</label><br />
      
            <button type="submit">Submit</button>
          </form>

          <form action="/loan-status">
          Check Loan Status: <input type="text" name="token" /><br />
          <button type="submit">Check</button>
          </form>
          `;

      response.writeHead(200, { 'Content-Type': 'text/html' });
      response.end(dynamicHTML);
      console.log('Loan form successfully generated.');
    } catch (error) {
      response.writeHead(500).end('Internal Server Error');
    }
    // LOAN DETAILS
  } else if (url?.startsWith('/apply-loan-success')) {
    try {
      const myURL = new URL(url, 'http://localhost:3000');
      console.log(myURL);

      const name: string | null = myURL.searchParams.get('name');
      const email: string | null = myURL.searchParams.get('email');
      const phone: string | null = myURL.searchParams.get('phone');
      const loanAmount: number | null = Number(myURL.searchParams.get('loan_amount'));
      const reason: string | null = myURL.searchParams.get('reason');
      let status: string = 'APPLIED';
      const token: string = crypto.randomBytes(32).toString('base64url');

      try {
        // Set due date and time only if not already set
        if (!dueDateSet) {
          const result = await client.query('SELECT NOW() AS time');
          dueDate = result.rows[0].time;
          dueDate!.setMinutes(dueDate!.getMinutes() + 3); // Sets due date to 'current time + 3 minutes'
          dueDateSet = true;
        }
        console.log('duedate', dueDate);

        // Set NEAR due date and time only if not already set
        if (!nearDueDateSet) {
          nearDueDate = new Date(dueDate!.getTime());
          nearDueDate.setMinutes(nearDueDate.getMinutes() - 2); // Sets due date to 'due date - 2 minutes'
          nearDueDateSet = true;
        }
        console.log('nearduedate', nearDueDate);

        isPastDue = Number(new Date()) > Number(dueDate); // True if current date is over due date and time
        isNearDue = Number(new Date()) > Number(nearDueDate); // True if current date is over near due date and time
        const repaymentAmount = loanAmount * 1.2; // Add 20% interest

        // Loan Results HTML template
        const resultHTML = `
        <h1>Loan Application Result</h1>
        <p>Name: ${name}</p>
        <p>Email: ${email}</p>
        <p>Phone: ${phone}</p>
        <p>Loan Amount: ${loanAmount}</p>
        <p>Reason: ${reason}</p>
        <p>Repayment Amount: ${repaymentAmount}</p>
        <p>Status: ${status}</p>
        <p>Due Date: ${dueDate}</p>
        <p>Is Past Due: ${isPastDue}</p>
        <p>Is Near Due: ${isNearDue}</p>
        <p>Date and Time right now: ${new Date().toLocaleString()}</p>
      `;

        // Checks if loan data already exists, if not, inserts new data into the database
        const checkExistingQuery = `
        SELECT 1 FROM loans WHERE name = $1 AND email = $2;
      `;

        const checkExistingValues: (string | number)[] = [name!, email!];
        const existingResult = await client.query(checkExistingQuery, checkExistingValues);

        if (existingResult.rows.length > 0) {
          console.log('Data is the same.');
        } else {
          // Data does not exist, proceed with insertion
          const insertQuery = `
          INSERT INTO loans (name, email, phone, loan_amount, reason, status, due_date, tokens)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
        `;

          const values: (string | number | Date)[] = [
            name!,
            email!,
            phone!,
            loanAmount!,
            reason!,
            status,
            dueDate!,
            token,
          ];

          await client.query(insertQuery, values);
          console.log('due date after query', dueDate);
        }

        console.log('Generating results html...');
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(resultHTML);
      } finally {
        // Release the client back to the connection pool
        client.release();
      }
    } catch (error) {
      response.writeHead(500).end('Internal Server Error');
    }

    // LOAN STATUS
  } else if (url?.startsWith('/loan-status')) {
    console.log('Generating loan status html...');

    if (url) {
      try {
        const myUrl = new URL(url, `http://localhost:3000`);
        const token: string | null = myUrl.searchParams.get('token');
        const res = await client.query('SELECT * FROM loans WHERE tokens = $1', [token]);

        if (res.rowCount > 0) {
          isPastDue = Number(new Date()) > Number(dueDate); // True if current date is over due date and time
          isNearDue = Number(new Date()) > Number(nearDueDate); // True if current date is over near due date and time
          const loan = res.rows[0];

          const statusHTML = `
                <h1>Loan Status</h1>
                <p>Name: ${loan.name}</p>
                <p>Loan Amount: ${loan.loan_amount}</p>
                <p>Status: ${loan.status}</p>
                <p>Due Date: ${loan.due_date}</p>
                <p>Is Past Due: ${isPastDue}</p>
                <p>Is Near Due: ${isNearDue}</p>
                <p>Date and Time right now: ${new Date().toLocaleString()}</p>
              `;

          response.writeHead(200, { 'Content-Type': 'text/html' });
          response.end(statusHTML);
        } else {
          response.writeHead(400).end('Bad Request: URL is missing');
        }
      } catch (error) {
        response.writeHead(500).end('Internal Server Error');
      }
    } else {
      response.writeHead(404).end('Loan not found');
    }
  } else {
    response.writeHead(200).end('You sent me:' + url);
  }
}

const server = http.createServer(handleRequest);

server.listen(3000, () => {
  console.log('Server started at http://localhost:3000/');
});
