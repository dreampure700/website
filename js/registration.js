// TEENSPACE 2026 - REGISTRATION & DIGITAL TICKET PASS GENERATOR (WHITE THEME)

function openRegisterModal() {
  const modal = document.getElementById('regModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeRegisterModal() {
  const modal = document.getElementById('regModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const regForm = document.getElementById('registrationForm');
  const ticketView = document.getElementById('ticketPassView');

  if (regForm) {
    regForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('studentName').value.trim();
      const studentClass = document.getElementById('studentClass').value;
      const place = document.getElementById('studentPlace').value.trim();
      const phone = document.getElementById('studentPhone').value.trim();
      const school = document.getElementById('studentSchool').value.trim() || 'Thrissur District';

      if (!name || !studentClass || !place || !phone) {
        alert('Please fill in all required fields.');
        return;
      }

      // Generate unique delegate ID
      const regId = 'TS26-' + Math.floor(10000 + Math.random() * 90000);

      // Populate Ticket View
      document.getElementById('passRegId').textContent = regId;
      document.getElementById('passName').textContent = name;
      document.getElementById('passClass').textContent = 'Class ' + studentClass;
      document.getElementById('passPlace').textContent = place;
      document.getElementById('passPhone').textContent = phone;
      document.getElementById('passSchool').textContent = school;

      // Draw QR Code on Canvas
      generatePassQR(regId, name);

      // Swap views
      regForm.style.display = 'none';
      ticketView.style.display = 'block';

      // Save to localStorage
      const registrationData = { regId, name, studentClass, place, phone, school, timestamp: new Date().toISOString() };
      localStorage.setItem('teenspace_reg_' + regId, JSON.stringify(registrationData));
    });
  }
});

function generatePassQR(regId, name) {
  const canvas = document.getElementById('passQrCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 100, 100);

  // Draw QR pattern for white theme
  ctx.fillStyle = '#0F172A';
  // Outer corners
  ctx.fillRect(10, 10, 25, 25);
  ctx.fillRect(65, 10, 25, 25);
  ctx.fillRect(10, 65, 25, 25);

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(15, 15, 15, 15);
  ctx.fillRect(70, 15, 15, 15);
  ctx.fillRect(15, 70, 15, 15);

  ctx.fillStyle = '#E60067';
  ctx.fillRect(19, 19, 7, 7);
  ctx.fillRect(74, 19, 7, 7);
  ctx.fillRect(19, 74, 7, 7);

  // Random code matrix dots
  ctx.fillStyle = '#00A8E8';
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 6; j++) {
      if ((i + j) % 2 === 0) {
        ctx.fillRect(40 + i * 5, 20 + j * 10, 4, 4);
      }
    }
  }
}

function printTicketPass() {
  const printContent = document.getElementById('ticketPassCard').innerHTML;
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>TEENSPACE 2026 - Official Delegate Entry Pass</title>
        <style>
          body { font-family: 'Plus Jakarta Sans', sans-serif; background: #F8FAFC; color: #0F172A; padding: 20px; text-align: center; }
          .ticket-card { border: 2px dashed #E60067; padding: 25px; border-radius: 16px; background: #FFFFFF; max-width: 500px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
          .ticket-logo { font-size: 24px; font-weight: bold; margin-bottom: 15px; color: #0F172A; }
          .ticket-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; text-align: left; margin: 20px 0; }
          .ticket-field-label { font-size: 11px; color: #64748B; text-transform: uppercase; font-weight: bold; }
          .ticket-field-val { font-size: 15px; font-weight: bold; color: #0F172A; }
          .btn-print { display: none; }
        </style>
      </head>
      <body>
        <div class="ticket-card">${printContent}</div>
        <script>window.onload = function() { window.print(); window.close(); }</script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

function resetRegForm() {
  document.getElementById('registrationForm').reset();
  document.getElementById('registrationForm').style.display = 'block';
  document.getElementById('ticketPassView').style.display = 'none';
}
