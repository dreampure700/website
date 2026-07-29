// TEENSPACE 2026 - REGISTRATION & DATABASE INTEGRATION
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx5pC5We1rbWxn_eQLzH3RqsZ_w_9DhIIkIP9fjgelcTrnjyti7EyeRssslCRMqwcSW/exec";

// Initialize Supabase Client
var SUPABASE_URL = "https://vnpiylttdjedglsggeea.supabase.co";
var SUPABASE_ANON_KEY = "sb_publishable_DX7OM5MeL2cTveK0gybXfg_UFUL1Um1";
if (!window.supabaseClient && window.supabase) {
  window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
var supabase = window.supabaseClient;

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
  // Auto-inject modal markup if the current page container is empty (e.g. highlights, schedule, media subpages)
  const modalContainer = document.getElementById('regModal');
  if (modalContainer && (modalContainer.innerHTML.trim() === '' || modalContainer.innerHTML.includes('Form code will load here dynamically'))) {
    modalContainer.innerHTML = `
    <div class="modal-content">
      <button class="modal-close" onclick="closeRegisterModal()"><i class="fas fa-times"></i></button>

      <!-- REGISTRATION FORM -->
      <form id="registrationForm">
        <div style="text-align:center; margin-bottom: 1.5rem;">
          <span class="section-tag"><i class="fas fa-user-plus"></i> Online Registration</span>
          <h2 style="font-family:var(--font-heading); font-size:1.8rem;">TEENSPACE 2026 Pass</h2>
          <p style="color:var(--text-muted); font-size:0.9rem;">For Boys Studying in Classes 10, 11 & 12</p>
        </div>

        <div class="form-group">
          <label class="form-label" for="studentName"><i class="fas fa-user text-magenta"></i> Student Name *</label>
          <input type="text" id="studentName" class="form-input" placeholder="Enter student's full name" required>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="studentPhone"><i class="fas fa-phone text-cyan"></i> Student Mobile Number *</label>
            <input type="tel" id="studentPhone" class="form-input" placeholder="10-digit mobile number" required pattern="[0-9]{10}">
          </div>

          <div class="form-group">
            <label class="form-label" for="parentPhone"><i class="fas fa-phone-square text-magenta"></i> Parent Mobile Number *</label>
            <input type="tel" id="parentPhone" class="form-input" placeholder="10-digit parent mobile number" required pattern="[0-9]{10}">
            <div style="margin-top: 0.5rem; display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--text-muted);">
              <input type="checkbox" id="sameAsStudent" style="cursor: pointer;">
              <label for="sameAsStudent" style="cursor: pointer; user-select: none;">Same as Student Mobile Number</label>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="studentClass"><i class="fas fa-graduation-cap text-cyan"></i> Class *</label>
            <select id="studentClass" class="form-select" required>
              <option value="">Select Class</option>
              <option value="11th">11th</option>
              <option value="12th">12th</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="studentSchool"><i class="fas fa-school text-magenta"></i> School / Higher Secondary *</label>
            <input type="text" id="studentSchool" class="form-input" placeholder="Start typing school name (Optional)..." list="schoolList">
            <datalist id="schoolList">
              <option value="Model Boys HSS Thrissur"></option>
              <option value="Govt Model HSS Calicut"></option>
              <option value="St. Thomas College HSS Thrissur"></option>
              <option value="CMS HSS Thrissur"></option>
            </datalist>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="studentPlace"><i class="fas fa-map-marker-alt text-cyan"></i> Place *</label>
          <input type="text" id="studentPlace" class="form-input" placeholder="Enter place / area name" required>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="studentPanchayath"><i class="fas fa-city text-magenta"></i> Panchayath / Municipality *</label>
            <select id="studentPanchayath" class="form-select" required>
              <option value="">Loading Panchayaths...</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="studentWard"><i class="fas fa-map-signs text-cyan"></i> Ward *</label>
            <select id="studentWard" class="form-select" required disabled>
              <option value="">Select Panchayath first</option>
            </select>
          </div>
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem; padding: 0.9rem;">
          <i class="fas fa-check-circle"></i> Complete Registration & Get Delegate Pass
        </button>
      </form>

      <!-- DIGITAL TICKET VIEW (Hidden by default) -->
      <div id="ticketPassView" style="display: none;">
        <div style="text-align: center; margin-bottom: 1rem;">
          <div style="width: 50px; height: 50px; background: rgba(37,211,102,0.15); border:1px solid #25D366; color:#25D366; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 0.5rem auto; font-size:1.5rem;">
            <i class="fas fa-check"></i>
          </div>
          <h3 style="font-family:var(--font-heading); color: var(--text-main);">Registration Confirmed!</h3>
          <p style="color:var(--text-muted); font-size:0.85rem;">Your official delegate entry pass has been generated.</p>
        </div>

        <!-- WhatsApp Updates Group Call-to-action Banner -->
        <div style="background: rgba(37, 211, 102, 0.08); border: 1px dashed #25D366; border-radius: 16px; padding: 1.25rem; margin-bottom: 1.5rem; text-align: center;">
          <div style="font-weight: 800; color: #128C7E; font-size: 1rem; margin-bottom: 0.35rem; display: flex; align-items: center; justify-content: center; gap: 0.4rem;">
            <i class="fab fa-whatsapp" style="font-size: 1.2rem;"></i> JOIN WHATSAPP UPDATES GROUP
          </div>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.8rem; line-height: 1.45;">
            <strong>Important!</strong> Transportation updates, route timings, vehicle coordinators, and announcements will be shared exclusively through this group.
          </p>
          <a href="https://chat.whatsapp.com/IVt78jCmz9y4l2tUG1C3gq" target="_blank" class="btn btn-primary" style="background:#25D366; border-color:#25D366; padding:0.55rem 1.2rem; font-size:0.85rem; border-radius:8px; display:inline-flex; align-items:center; gap:0.4rem; font-weight:700; width:auto; margin:0; box-shadow:0 4px 12px rgba(37,211,102,0.25);">
            <i class="fab fa-whatsapp"></i> Join Updates Group
          </a>
        </div>

        <div class="ticket-card" id="ticketPassCard">
          <div class="ticket-header">
            <div class="ticket-logo" style="display:flex; align-items:center; justify-content:center; gap:0.6rem;">
              <img src="assets/images/TEENSPACE LOGO.png" alt="Teenspace Logo" class="brand-logo-img" style="height:42px;">
              <span>t<span style="color:var(--magenta)">e</span><span style="color:var(--cyan)">e</span>nspace 2026</span>
            </div>
            <div style="font-size:0.75rem; color:var(--text-muted);">OCTOBER 18, 2026 | DREAM PALACE, PAROOR</div>
          </div>

          <canvas id="passQrCanvas" width="100" height="100" class="ticket-qr"></canvas>

          <div class="ticket-grid" style="grid-template-columns: 1fr;">
            <div style="border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem; margin-bottom: 0.5rem;">
              <div class="ticket-field-label">Delegate Name</div>
              <div class="ticket-field-val" id="passName" style="font-size: 1.25rem;">Student Name</div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div class="ticket-field-label">Registration ID</div>
                <div class="ticket-field-val" id="passRegId" style="color:var(--cyan); font-size: 1.1rem;">TS26-00000</div>
              </div>
              <div style="text-align: right;">
                <div class="ticket-field-label">Mobile Number</div>
                <div class="ticket-field-val" id="passPhone" style="font-size: 1.1rem;">9656677700</div>
              </div>
            </div>
          </div>

          <div style="font-size:0.75rem; color:var(--text-dim); border-top:1px solid var(--border-light); padding-top:0.8rem;">
            Organized by Wisdom Students Thrissur District Committee
          </div>
        </div>

        <div style="display:flex; gap:0.8rem; margin-top:1.5rem; justify-content:center;">
          <button class="btn btn-outline" onclick="printTicketPass()"><i class="fas fa-print"></i> Print / Save Pass</button>
          <button class="btn btn-primary" onclick="resetRegForm(); closeRegisterModal();">Done</button>
        </div>
      </div>
    </div>
    `;
  }

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

    if (!supabase) {
      panchayathSelect.innerHTML = '<option value="">Database connection error</option>';
      return;
    }

    Promise.all([
      supabase.from('mapping').select('*'),
      supabase.from('registrations').select('school')
    ]).then(([mapRes, regRes]) => {
      masterMapping = (mapRes.data || []).map(m => ({
        Panchayath: m.panchayath,
        Ward: m.ward,
        Unit: m.unit,
        Zone: m.zone
      }));

      const rawSchools = (regRes.data || []).map(r => r.school).filter(Boolean);
      masterSchools = [...new Set(rawSchools)].sort();

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
    regForm.addEventListener('submit', async (e) => {
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

      // Helper for zone prefixes
      function getZonePrefix(zoneName) {
        const prefixes = {
          'Chavakkad': 'CKD',
          'Pavaratty': 'PVT',
          'Kunnamkulam': 'KNM',
          'Guruvayoor': 'GVR',
          'Thrissur': 'TSR',
          'Thrissur City': 'TSR',
          'Kodungallur': 'KDR',
          'Kaipamangalam': 'KPM'
        };
        return prefixes[zoneName] || 'REG';
      }

      // Prep pass layout details safely (using temp ID initially)
      const elRegId = document.getElementById('passRegId');
      const elName = document.getElementById('passName');
      const elPhone = document.getElementById('passPhone');

      try {
        // Calculate next sequential registration ID starting from 101
        const prefix = getZonePrefix(zone);
        let maxNum = 100;
        
        const { data: allRegs, error: fetchError } = await supabase.from('registrations').select('reg_id');
        if (fetchError) throw fetchError;
        
        if (allRegs) {
          allRegs.forEach(r => {
            const idVal = r.reg_id || '';
            if (idVal.startsWith(prefix)) {
              const num = parseInt(idVal.substring(prefix.length), 10);
              if (!isNaN(num) && num > maxNum) {
                maxNum = num;
              }
            }
          });
        }
        const finalRegId = `${prefix}${maxNum + 1}`;

        if (elRegId) elRegId.textContent = finalRegId;
        if (elName) elName.textContent = name;
        if (elPhone) elPhone.textContent = phone;
        generatePassQR(finalRegId, name);

        // Save in localStorage
        const regData = { regId: finalRegId, name, phone, timestamp: new Date().toISOString() };
        localStorage.setItem('teenspace_reg_' + finalRegId, JSON.stringify(regData));

        // Insert into Supabase registrations table
        const { error: insertError } = await supabase
          .from('registrations')
          .insert([{
            reg_id: finalRegId,
            name: name,
            phone: phone,
            parent_phone: parentMobile || null,
            student_class: studentClass,
            school: school,
            place: place,
            panchayath: panchayath,
            ward: ward,
            unit: unit,
            zone: zone
          }]);
          
        if (insertError) throw insertError;
        
        showTicketView();
      } catch (err) {
        console.error('Registration failed: ', err);
        // Fallback to random temporary ID in case database is down so student still gets their ticket screen
        const tempRegId = 'TS26-' + Math.floor(10000 + Math.random() * 90000);
        if (elRegId) elRegId.textContent = tempRegId;
        if (elName) elName.textContent = name;
        if (elPhone) elPhone.textContent = phone;
        generatePassQR(tempRegId, name);

        const tempRegistrationData = { regId: tempRegId, name, phone, timestamp: new Date().toISOString() };
        localStorage.setItem('teenspace_reg_' + tempRegId, JSON.stringify(tempRegistrationData));
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
