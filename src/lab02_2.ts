import http, { IncomingMessage, ServerResponse } from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';

async function handleRequest(request: IncomingMessage, response: ServerResponse) {
  const url = request.url;
  const method = request.method;

  console.log('Debugging -- url is', url, 'while method is', method);

  if (url === '/apply-loan') {
    try {
      const filePath = path.resolve(__dirname, '../apply-loan.html');
      const contents = await fs.readFile(filePath, 'utf-8');
      response.writeHead(200, { 'Content-Type': 'text/html' }).end(contents.toString());
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
