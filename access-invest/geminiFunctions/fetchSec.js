async function fetchSecFiling(ticker, type) {
  const token = localStorage.getItem('token'); // Your JWT token from login
  const response = await fetch('http://localhost:5001/api/sec-filings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ ticker, type })
  });

  const data = await response.json();
  if (response.ok) {
    // data.data contains the HTML or "N/A"
    return data.data;
  } else {
    throw new Error(data.error || 'Failed to fetch SEC filing');
  }
}

async function fetchPrices(ticker) {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5001/api/prices', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ ticker })
  });

  const data = await response.json();
  if (response.ok) {
    return data.prices;
  } else {
    throw new Error(data.error || 'Failed to fetch prices');
  }
}
export { fetchPrices };

// // Usage example:
// fetchSecFiling('AAPL', '10K')
//   .then(html => {
//     // Do something with the HTML, e.g., display it in a modal or iframe
//     console.log(html);
//   })
//   .catch(err => {
//     alert(err.message);
//   });

export { fetchSecFiling };
