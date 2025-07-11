// Redirect to login if not authenticated
if (!localStorage.getItem('token')) {
  window.location.href = '/login.html';
}

function logout() {
  localStorage.removeItem('token');
  window.location.href = '/login.html';
}

document.getElementById('generateForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const url = document.getElementById('url').value;
  const response = await fetch('/api/files/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ name, url }),
  });
  if (response.ok) {
    const data = await response.json();
    document.getElementById('downloads').innerHTML = `
      <a href="${data.qrCodeUrl}" download="${name}_qrcode.png">Download QR Code</a><br>
      <a href="${data.pdfUrl}" download="${name}_document.pdf">Download PDF</a><br>
      <a href="${data.pdfAsPngUrl}" download="${name}_document.png">Download PDF as PNG</a>
    `;
  } else {
    alert('Error generating files');
  }
});

document.getElementById('search').addEventListener('input', async (e) => {
  const searchTerm = e.target.value;
  const response = await fetch(`/api/files?search=${searchTerm}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
  if (response.ok) {
    const files = await response.json();
    document.getElementById('fileList').innerHTML = files.map(file => `
      <li>
        ${file.name} - <a href="${file.qrCodeUrl}" download>QR Code</a> |
        <a href="${file.pdfUrl}" download>PDF</a> |
        <a href="${file.pdfAsPngUrl}" download>PDF as PNG</a>
      </li>
    `).join('');
  } else {
    document.getElementById('fileList').innerHTML = '<li>Error loading files</li>';
  }
});

// Initial load of files
document.getElementById('search').dispatchEvent(new Event('input'));
