async function run() {
  try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'abhi@gmail.com', password: 'Abhi1234' })
    });
    const data = await res.json();
    console.log(res.status, data);
  } catch(e) {
    console.log(e);
  }
}
run();
