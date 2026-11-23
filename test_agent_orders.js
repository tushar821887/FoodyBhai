async function run() {
  try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'abhi@gmail.com', password: 'Abhi1234' })
    });
    const data = await res.json();
    console.log("Login:", res.status);
    
    if (data.accessToken) {
      const ordersRes = await fetch('http://localhost:3000/api/orders/admin/all', {
        headers: { 'Authorization': 'Bearer ' + data.accessToken }
      });
      const ordersData = await ordersRes.json();
      console.log("Orders:", ordersRes.status, ordersData.length || ordersData);
    }
  } catch(e) {
    console.log(e);
  }
}
run();
