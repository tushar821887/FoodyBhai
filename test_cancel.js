const http = require('http');

const data = JSON.stringify({
  email: 'rohit@gmail.com',
  password: '123'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log("Login res:", body);
  });
});
req.write(data);
req.end();
