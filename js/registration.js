// TEENSPACE 2026 - REGISTRATION & GOOGLE SHEETS INTEGRATION

// Paste your Google Web App URL here after deploying (e.g. https://script.google.com/macros/s/.../exec)
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx5pC5We1rbWxn_eQLzH3RqsZ_w_9DhIIkIP9fjgelcTrnjyti7EyeRssslCRMqwcSW/exec";

// Master Mapping Storage
let masterMapping = [];
let masterSchools = [];

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
  const submitBtn = regForm ? regForm.querySelector('button[type="submit"]') : null;

  // Synced Phone Checkbox Elements
  const sameAsStudent = document.getElementById('sameAsStudent');
  const studentPhone = document.getElementById('studentPhone');
  const parentPhone = document.getElementById('parentPhone');

  if (sameAsStudent && studentPhone && parentPhone) {
    sameAsStudent.addEventListener('change', () => {
      if (sameAsStudent.checked) {
        parentPhone.value = studentPhone.value;
        parentPhone.disabled = true;
        parentPhone.required = false;
      } else {
        parentPhone.disabled = false;
        parentPhone.required = true;
        parentPhone.value = '';
      }
    });

    studentPhone.addEventListener('input', () => {
      if (sameAsStudent.checked) {
        parentPhone.value = studentPhone.value;
      }
    });
  }

  // Fetch Organizational Mapping on Load
  loadMappingData();

  function loadMappingData() {
    const panchayathSelect = document.getElementById('studentPanchayath');
    if (!panchayathSelect) return;

    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL === "YOUR_GOOGLE_SCRIPT_URL_HERE") {
      panchayathSelect.innerHTML = '<option value="">Google URL not configured</option>';
      return;
    }

    fetch(`${GOOGLE_SCRIPT_URL}?action=get_mapping`)
      .then(response => response.json())
      .then(data => {
        masterMapping = data.mapping || [];
        masterSchools = data.schools || [];

        // Dynamic Autocomplete for Schools
        const schoolList = document.getElementById('schoolList');
        if (schoolList && masterSchools.length > 0) {
          schoolList.innerHTML = '';
          masterSchools.forEach(school => {
            const option = document.createElement('option');
            option.value = school;
            schoolList.appendChild(option);
          });
        }

        // Populate Panchayaths Dropdown
        const panchayaths = [...new Set(masterMapping.map(m => m.Panchayath))].sort();
        panchayathSelect.innerHTML = '<option value="">Select Panchayath</option>';
        panchayaths.forEach(p => {
          const opt = document.createElement('option');
          opt.value = p;
          opt.textContent = p;
          panchayathSelect.appendChild(opt);
        });

        // Add Change Listener to Panchayath Select
        panchayathSelect.addEventListener('change', (e) => {
          const selectedPanchayath = e.target.value;
          const wardSelect = document.getElementById('studentWard');
          
          if (!wardSelect) return;

          if (!selectedPanchayath) {
            wardSelect.innerHTML = '<option value="">Select Panchayath first</option>';
            wardSelect.disabled = true;
            return;
          }

          // Filter Wards
          const wards = masterMapping
            .filter(m => m.Panchayath === selectedPanchayath)
            .map(m => m.Ward)
            .sort();

          wardSelect.innerHTML = '<option value="">Select Ward</option>';
          wards.forEach(w => {
            const opt = document.createElement('option');
            opt.value = w;
            opt.textContent = w;
            wardSelect.appendChild(opt);
          });
          wardSelect.disabled = false;
        });
      })
      .catch(err => {
        console.error('Failed to load mapping:', err);
        panchayathSelect.innerHTML = '<option value="">Error loading Panchayaths</option>';
      });
  }

  // Handle Form Submit
  if (regForm) {
    regForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('studentName').value.trim();
      const phone = document.getElementById('studentPhone').value.trim();
      const parentMobile = document.getElementById('parentPhone').value.trim();
      const studentClass = document.getElementById('studentClass').value;
      const school = document.getElementById('studentSchool').value.trim() || 'N/A';
      const place = document.getElementById('studentPlace').value.trim();
      const panchayath = document.getElementById('studentPanchayath').value;
      const ward = document.getElementById('studentWard').value;

      if (!name || !phone || !parentMobile || !studentClass || !place || !panchayath || !ward) {
        alert('Please fill in all required fields.');
        return;
      }

      // Generate unique delegate ID
      const regId = 'TS26-' + Math.floor(10000 + Math.random() * 90000);

      // Perform background mapping to retrieve Unit and Zone
      let unit = "N/A";
      let zone = "N/A";
      const match = masterMapping.find(m => m.Panchayath === panchayath && m.Ward === ward);
      if (match) {
        unit = match.Unit || "N/A";
        zone = match.Zone || "N/A";
      }

      // Disable submit button and show loading state
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
      }

      // Save to localStorage
      const registrationData = { regId, name, phone, timestamp: new Date().toISOString() };
      localStorage.setItem('teenspace_reg_' + regId, JSON.stringify(registrationData));

      // Prep pass layout details safely
      const elRegId = document.getElementById('passRegId');
      const elName = document.getElementById('passName');
      const elPhone = document.getElementById('passPhone');

      if (elRegId) elRegId.textContent = regId;
      if (elName) elName.textContent = name;
      if (elPhone) elPhone.textContent = phone;
      generatePassQR(regId, name);

      // Send to Google Sheets if Web App URL is configured
      if (GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL !== "YOUR_GOOGLE_SCRIPT_URL_HERE") {
        const queryParams = new URLSearchParams({
          regId: regId,
          name: name,
          phone: phone,
          parentPhone: parentMobile,
          studentClass: studentClass,
          school: school,
          place: place,
          panchayath: panchayath,
          ward: ward,
          unit: unit,
          zone: zone
        }).toString();

        // Use Image beacon to bypass CORS blocks
        const beacon = new Image();
        const backupTimeout = setTimeout(() => {
          showTicketView();
        }, 2000);

        beacon.onload = beacon.onerror = () => {
          clearTimeout(backupTimeout);
          showTicketView();
        };

        beacon.src = `${GOOGLE_SCRIPT_URL}?${queryParams}`;
      } else {
        showTicketView();
      }
    });
  }

  function showTicketView() {
    if (regForm && ticketView) {
      regForm.style.display = 'none';
      ticketView.style.display = 'block';
    }
  }
});

function generatePassQR(regId, name) {
  const canvas = document.getElementById('passQrCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 100, 100);

  // Draw QR pattern
  ctx.fillStyle = '#0F172A';
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
          .ticket-grid { display: grid; grid-template-columns: 1fr; gap: 10px; text-align: left; margin: 20px 0; }
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
  const regForm = document.getElementById('registrationForm');
  const submitBtn = regForm ? regForm.querySelector('button[type="submit"]') : null;
  const parentPhone = document.getElementById('parentPhone');
  if (regForm) {
    regForm.reset();
    regForm.style.display = 'block';
    if (parentPhone) {
      parentPhone.disabled = false;
      parentPhone.required = true;
    }
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Complete Registration & Get Delegate Pass';
    }
  }
  document.getElementById('ticketPassView').style.display = 'none';
}
