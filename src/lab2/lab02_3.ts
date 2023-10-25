import http, { IncomingMessage, ServerResponse } from 'node:http';
import { Pool } from 'pg';
import crypto from 'crypto';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'SE2134-Lab2',
  password: '1234554321',
  port: 5433, // Change if your PostgreSQL server is running on a different port
});

async function handleRequest(request: IncomingMessage, response: ServerResponse) {
  const url = request.url;
  const method = request.method;

  console.log('Debugging -- url is', url, 'while method is', method);

  // LOAN APPLICATION FORM
  if (url === '/apply-loan') {
    console.log('Generating loan form html...');
    try {
      const dynamicHTML = `
        <form action="/apply-loan-success" method="post">
          Name: <input type="text" name="name" /><br />
          Email: <input type="text" name="email" /><br />
          Phone: <input type="text" name="phone" /><br />
          Loan Amount: <input type="text" name="loan_amount" /><br />
          Reason: <textarea name="reason"></textarea><br />
    
          <label><input type="checkbox" name="agree" />I agree to the terms and conditions</label><br />
    
          <button type="submit">Submit</button>
        </form>
        `;

      response.writeHead(200, { 'Content-Type': 'text/html' });
      response.end(dynamicHTML);
      console.log('Loan form successfully generated.');
    } catch (error) {
      response.writeHead(500).end('Internal Server Error');
    }
    // LOAN DETAILS
  } else if (url === '/apply-loan-success' && method === 'POST') {
    try {
      let body: string = '';
      request.on('data', (chunk) => {
        body += chunk.toString();
      });
      request.on('end', async () => {
        const formData = new URLSearchParams(body);
        const name = formData.get('name');
        const email = formData.get('email');
        const phone = formData.get('phone');
        const loanAmount = Number(formData.get('loan_amount'));
        const reason = formData.get('reason');
        let status = 'APPLIED';
        const token = crypto.randomBytes(32).toString('base64url');

        const client = await pool.connect();

        const query = 'SELECT NOW() AS time';
        const result = await client.query(query);
        const dueDate: Date = result.rows[0].time;
        dueDate.setMinutes(dueDate.getMinutes() + 3);
        const nearDueDate = new Date(dueDate.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 days before the deadline
        const isPastDue = new Date() > dueDate;
        const isNearDue = new Date() > nearDueDate;
        const repaymentAmount = loanAmount * 1.2; // 5-6 scheme

        try {
          const insertQuery = `
          INSERT INTO loans (name, email, phone, loan_amount, reason, status, due_date, tokens)
          VALUES (\$1, \$2, \$3, \$4, \$5, \$6, \$7, \$8)
      `;
          await client.query(insertQuery, [name, email, phone, loanAmount, reason, status, dueDate, token]);

          const resultHTML = `
          <h1>Loan Application Result</h1>
          <p>Name: ${name}</p>
          <p>Email: ${email}</p>
          <p>Phone: ${phone}</p>
          <p>Loan Amount: ${loanAmount}</p>
          <p>Reason: ${reason}</p>
          <p>Repayment Amount: ${repaymentAmount}</p>
          <p>Status: ${status}</p>
          <p>Is Past Due: ${isPastDue}</p>
          <p>Is Near Due: ${isNearDue}</p>
        `;

          response.writeHead(200, { 'Content-Type': 'text/html' });
          response.end('Form submitted successfully!\n\n' + resultHTML);
        } finally {
          client.release();
        }
      });
    } catch (error) {
      response.writeHead(500).end('Internal Server Error');
    }
    // LOAN STATUS
  } else if (url === '/loan-status') {
    let urlString = request.url;

    if (urlString) {
      const url = new URL(urlString, `http://${request.headers.host}`);
      const token = url.searchParams.get('token');
      const client = await pool.connect();
      const res = await client.query('SELECT * FROM loans WHERE token = $1', [token]);
      if (res.rowCount > 0) {
        const loan = res.rows[0];
        const statusHTML = `
          <h1>Loan Status</h1>
          <p>Name: ${loan.name}</p>
          <p>Status: ${loan.status}</p>
        `;
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(statusHTML);
      } else {
        response.writeHead(400).end('Bad Request: URL is missing');
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
