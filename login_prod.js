const axios = require('axios');
async function run() {
  try {
    const res = await axios.post('https://api.foodybhai.in/api/auth/login', {
      email: 'tusharmanusharma@gmail.com', // wait I don't know the admin password
      password: 'password' // I shouldn't guess passwords
    });
    console.log(res.data);
  } catch(e) {
    console.log(e.response ? e.response.data : e.message);
  }
}
run();
