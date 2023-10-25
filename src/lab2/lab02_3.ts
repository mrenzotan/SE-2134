import http, { IncomingMessage, ServerResponse } from 'node:http';
import { Pool } from 'pg';

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

  if (url === '/apply-loan') {
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
    } catch (error) {
      response.writeHead(500).end('Internal Server Error');
    }
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
        const loanAmount = formData.get('loan_amount');
        const reason = formData.get('reason');

        const client = await pool.connect();
        try {
          const insertQuery = `
              INSERT INTO loans (name, email, phone, loan_amount, reason)
              VALUES ($1, $2, $3, $4, $5)
            `;
          await client.query(insertQuery, [name, email, phone, loanAmount, reason]);

          const tableHTML = `
            <table border="1">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Loan Amount</th>
                <th>Reason</th>
              </tr>
              <tr>
                <td>${name}</td>
                <td>${email}</td>
                <td>${phone}</td>
                <td>${loanAmount}</td>
                <td>${reason}</td>
              </tr>
            </table>
          `;

          response.writeHead(200, { 'Content-Type': 'text/html' });
          response.end('Form submitted successfully!\n\n' + tableHTML);
        } finally {
          client.release();
        }
      });
    } catch (error) {
      response.writeHead(500).end('Internal Server Error');
    }
  } else {
    response.writeHead(200).end('You sent me:' + url);
  }
}

const server = http.createServer(handleRequest);

server.listen(3000, () => {
  console.log('Server started at http://localhost:3000/');
});
