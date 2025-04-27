async function fetchGeminiContent(prompt) {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5001/api/generate-content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ prompt })
  });

  const data = await response.json();
  if (response.ok) {
    return data.text; // The generated content from Gemini
  } else {
    throw new Error(data.error || 'Failed to generate content');
  }
}

export { fetchGeminiContent };