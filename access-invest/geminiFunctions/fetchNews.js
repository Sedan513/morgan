async function fetchNews(ticker) {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5001/api/news', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ ticker })
  });
  const data = await response.json();
  if (response.ok) {
    return JSON.parse(data.news); // Array of news items
  } else {
    throw new Error(data.error || 'Failed to fetch news');
  }
}

// // Usage example:
// fetchNews('AAPL').then(newsArray => {
//   console.log(newsArray);
// });

export { fetchNews };