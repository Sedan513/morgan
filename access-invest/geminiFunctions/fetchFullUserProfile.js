
async function fetchFullUserProfile() {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5001/api/full-profile', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (response.ok) {
    return data.user;
  } else {
    throw new Error(data.error || 'Failed to fetch user profile');
  }
}

// // Usage example:
// fetchFullUserProfile()
//   .then(user => {
//     console.log(user); // Use user info in your React component
//   })

export { fetchFullUserProfile };