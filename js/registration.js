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
    sessionStorage.setItem('reg_popup_closed', 'true');
  }
}

// Auto-open registration popup on site entry & bind close handlers
function initAutoRegistrationPopup() {
  const modal = document.getElementById('regModal');
  if (!modal) return;

  // 1. Close when clicking outside the modal content box (overlay click)
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeRegisterModal();
    }
  });

  // 2. Close when pressing Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeRegisterModal();
    }
  });

  // Program has concluded today. Clear any auto-open popup timer
  if (window.autoRegPopupTimer) {
    clearTimeout(window.autoRegPopupTimer);
    window.autoRegPopupTimer = null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Auto-inject modal markup if the current page container is empty (e.g. highlights, schedule, media subpages)
  const modalContainer = document.getElementById('regModal');
  if (modalContainer && (modalContainer.innerHTML.trim() === '' || modalContainer.innerHTML.includes('Form code will load here dynamically') || modalContainer.innerHTML.includes('registrationForm'))) {
    modalContainer.innerHTML = `
    <div class="modal-content" style="max-width: 540px; text-align: center; padding: 2.25rem 1.75rem; border-radius: 24px; position: relative;">
      <button class="modal-close" onclick="closeRegisterModal()"><i class="fas fa-times"></i></button>

      <!-- Event Concluded Icon -->
      <div style="width: 76px; height: 76px; margin: 0 auto 1.25rem; border-radius: 50%; background: linear-gradient(135deg, rgba(230, 0, 103, 0.12) 0%, rgba(0, 168, 232, 0.15) 100%); display: flex; align-items: center; justify-content: center; font-size: 2.2rem; color: var(--magenta); box-shadow: 0 10px 25px rgba(230, 0, 103, 0.15);">
        <i class="fas fa-flag-checkered"></i>
      </div>

      <!-- Badge -->
      <div style="margin-bottom: 0.75rem;">
        <span class="badge" style="background: rgba(230, 0, 103, 0.1); color: var(--magenta); font-weight: 700; padding: 0.4rem 1rem; border-radius: 50px; font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.5px; display: inline-flex; align-items: center; gap: 0.4rem;">
          <i class="fas fa-check-circle"></i> Event Concluded
        </span>
      </div>

      <!-- Title & Subtitle -->
      <h2 style="font-family: var(--font-heading); font-size: 1.85rem; color: var(--text-main); margin-bottom: 0.35rem; font-weight: 800; line-height: 1.2;">
        TEENSPACE 2026
      </h2>
      <p style="color: var(--cyan); font-weight: 700; font-size: 1.05rem; margin-bottom: 1.25rem;">
        Online Registration is Now Closed
      </p>

      <!-- Notification Content -->
      <div style="background: #F8FAFC; border: 1px solid var(--border-light); border-radius: 16px; padding: 1.25rem; margin-bottom: 1.5rem; text-align: left; font-size: 0.92rem; line-height: 1.6; color: var(--text-muted);">
        <p style="margin-bottom: 0.85rem; color: var(--text-main); font-weight: 500;">
          The grand <strong>TEENSPACE 2026</strong> state conference has successfully concluded on <strong>Sunday, October 18, 2026</strong> at Haritha Nagari, Thrissur. Online registrations are officially closed. We express our heartfelt gratitude to all delegates, parents, teachers, and well-wishers for making this summit a memorable milestone!
        </p>
        <div style="border-top: 1px dashed var(--border-light); padding-top: 0.75rem; font-size: 0.88rem; color: #334155;">
          ടീൻസ്പേസ് 2026 സംസ്ഥാന സമ്മേളനം ഒക്ടോബർ 18-ന് തൃശൂർ ഹരിത നഗരിയിൽ പ്രൗഢോജ്ജ്വലമായി സമാപിച്ചു. ഓൺലൈൻ രജിസ്ട്രേഷൻ അവസാനിച്ചിരിക്കുന്നു. പങ്കെടുത്ത മുഴുവൻ വിദ്യാർത്ഥികൾക്കും രക്ഷിതാക്കൾക്കും പ്രവർത്തകർക്കും ഹൃദയം നിറഞ്ഞ നന്ദി!
        </div>
      </div>

      <!-- Quick Action Buttons -->
      <div style="display: flex; flex-direction: column; gap: 0.65rem;">
        <a href="status.html" class="btn btn-primary" style="justify-content: center; padding: 0.85rem; font-size: 0.95rem; font-weight: 700;">
          <i class="fas fa-search"></i> Check Delegate / Attendance Status
        </a>
        <a href="media.html" class="btn btn-outline" style="justify-content: center; padding: 0.85rem; font-size: 0.95rem; font-weight: 600; border-color: var(--border-light); color: var(--text-main);">
          <i class="fas fa-photo-video text-cyan"></i> View Media & Highlights
        </a>
        <button type="button" class="btn btn-outline" onclick="closeRegisterModal()" style="justify-content: center; padding: 0.65rem; font-size: 0.88rem; color: var(--text-muted); border: none; background: transparent;">
          <i class="fas fa-times"></i> Close Notice
        </button>
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

  // Initialize auto registration popup on site entry & bind close triggers
  initAutoRegistrationPopup();

  function loadMappingData() {
    const panchayathSelect = document.getElementById('studentPanchayath');
    if (!panchayathSelect) return;

    if (!supabase) {
      panchayathSelect.innerHTML = '<option value="">Database connection error</option>';
      return;
    }

    Promise.all([
      supabase.from('mapping').select('*').range(0, 999),
      supabase.from('mapping').select('*').range(1000, 1999),
      supabase.from('registrations').select('school, reg_id, panchayath, ward, unit, zone, student_class').range(0, 4999)
    ]).then(([m1, m2, regRes]) => {
      const allMappingData = [...(m1.data || []), ...(m2.data || [])];
      let baseMapping = allMappingData.map(m => ({
        Panchayath: m.panchayath,
        Ward: m.ward,
        Unit: m.unit,
        Zone: m.zone
      }));

      // Apply SYS_MAP overrides from registrations table
      const sysMapRecs = (regRes.data || []).filter(d => d.reg_id && d.reg_id.startsWith('SYS_MAP_'));
      if (sysMapRecs.length > 0) {
        const mapOverrides = new Map();
        sysMapRecs.forEach(r => {
          const key = (r.panchayath || '').trim().toUpperCase() + '__' + (r.ward || '').trim().toUpperCase();
          mapOverrides.set(key, r);
        });

        const merged = [];
        baseMapping.forEach(m => {
          const key = (m.Panchayath || '').trim().toUpperCase() + '__' + (m.Ward || '').trim().toUpperCase();
          if (mapOverrides.has(key)) {
            const ov = mapOverrides.get(key);
            if (ov.student_class !== 'DELETED') {
              merged.push({
                Panchayath: ov.panchayath || m.Panchayath,
                Ward: ov.ward || m.Ward,
                Unit: ov.unit || m.Unit,
                Zone: ov.zone || m.Zone
              });
            }
            mapOverrides.delete(key);
          } else {
            merged.push(m);
          }
        });

        mapOverrides.forEach(ov => {
          if (ov.student_class !== 'DELETED') {
            merged.push({
              Panchayath: ov.panchayath,
              Ward: ov.ward,
              Unit: ov.unit,
              Zone: ov.zone
            });
          }
        });

        baseMapping = merged;
      }

      masterMapping = baseMapping;

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
      const match = masterMapping.find(m => 
        (m.Panchayath || '').trim().toLowerCase() === (panchayath || '').trim().toLowerCase() && 
        (m.Ward || '').trim().toLowerCase() === (ward || '').trim().toLowerCase()
      );
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
          'Guruvayur': 'GVR',
          'Thrissur': 'TSR',
          'Thrissur City': 'TSR',
          'Kodungallur': 'KDR',
          'Kaipamangalam': 'KPM'
        };
        const clean = (zoneName || '').trim();
        for (const [k, v] of Object.entries(prefixes)) {
          if (clean.toLowerCase() === k.toLowerCase()) return v;
        }
        return prefixes[zoneName] || 'REG';
      }

      // Prep pass layout details safely (using temp ID initially)
      const elRegId = document.getElementById('passRegId');
      const elName = document.getElementById('passName');
      const elPhone = document.getElementById('passPhone');

      try {
        // Calculate sequential registration IDs:
        // District ID starts from REG 101 ordered by count
        // Mandal ID starts from 101 with prefix code (e.g. KPM 101)
        const prefix = getZonePrefix(zone);

        const { data: allRegs, error: fetchError } = await supabase.from('registrations').select('reg_id, zone, timestamp');
        if (fetchError) throw fetchError;

        const activeRegs = (allRegs || []).filter(r => !r.reg_id || !r.reg_id.startsWith('SYS_'));
        
        // Continuous District sequential number (starts from REG 101)
        const districtNum = 101 + activeRegs.length;
        const districtRegId = `REG ${districtNum}`;

        // Continuous Mandal sequential number (starts from PREFIX 101)
        const mandalRegs = activeRegs.filter(r => {
          const zPref = getZonePrefix(r.zone);
          return zPref === prefix || (r.reg_id && r.reg_id.toUpperCase().startsWith(prefix));
        });
        const mandalNum = 101 + mandalRegs.length;
        const mandalRegId = `${prefix} ${mandalNum}`;

        // Unique DB ID
        let maxDbNum = 100;
        activeRegs.forEach(r => {
          const idVal = r.reg_id || '';
          if (idVal.startsWith(prefix)) {
            const num = parseInt(idVal.substring(prefix.length), 10);
            if (!isNaN(num) && num > maxDbNum) maxDbNum = num;
          }
        });
        const finalRegId = `${prefix}${Math.max(mandalNum, maxDbNum + 1)}`;

        if (elRegId) {
          elRegId.innerHTML = `<span style="background:#0F172A; color:#FFFFFF; padding:0.2rem 0.55rem; border-radius:6px; font-weight:800; font-size:0.92rem;" title="District ID">${districtRegId}</span> <span style="background:rgba(0,168,232,0.12); color:var(--cyan); border:1px solid rgba(0,168,232,0.3); padding:0.18rem 0.5rem; border-radius:6px; font-weight:800; font-size:0.92rem; margin-left:0.35rem;" title="Mandal ID">${mandalRegId}</span>`;
        }
        if (elName) elName.textContent = name;
        if (elPhone) elPhone.textContent = phone;
        generatePassQR(districtRegId, name);

        // Save in localStorage
        const nowIso = new Date().toISOString();
        const regData = { regId: finalRegId, districtRegId, mandalRegId, name, phone, timestamp: nowIso };
        localStorage.setItem('teenspace_reg_' + finalRegId, JSON.stringify(regData));

        // Insert into Supabase registrations table with both District ID and Zone ID
        const insertPayload = {
          reg_id: finalRegId,
          district_id: districtRegId,
          zone_id: mandalRegId,
          name: name,
          phone: phone,
          parent_phone: parentMobile || null,
          student_class: studentClass,
          school: school,
          place: place,
          panchayath: panchayath,
          ward: ward,
          unit: unit,
          zone: zone,
          timestamp: nowIso
        };

        let { error: insertError } = await supabase.from('registrations').insert([insertPayload]);
        if (insertError && insertError.message && (insertError.message.includes('district_id') || insertError.message.includes('zone_id'))) {
          // Backward compatibility fallback if migration hasn't been executed yet
          delete insertPayload.district_id;
          delete insertPayload.zone_id;
          const retry = await supabase.from('registrations').insert([insertPayload]);
          insertError = retry.error;
        }
          
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
      submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Submit Registration';
    }
  }
  document.getElementById('ticketPassView').style.display = 'none';
}

// ==========================================
// DONATE A CONTACT FEATURE
// ==========================================
let donatedStudentCardSeq = 0;

function openDonateContactModal() {
  if (window.autoRegPopupTimer) {
    clearTimeout(window.autoRegPopupTimer);
  }
  closeRegisterModal();

  const modal = document.getElementById('donateContactModal');
  if (!modal) return;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  const container = document.getElementById('donatedStudentsContainer');
  if (container && container.children.length === 0) {
    addDonatedStudentCard();
  }
}

function closeDonateContactModal() {
  const modal = document.getElementById('donateContactModal');
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

function updateDonatedStudentsBadge() {
  const container = document.getElementById('donatedStudentsContainer');
  const badge = document.getElementById('donatedStudentCountBadge');
  if (!container) return;
  const cards = container.querySelectorAll('.donated-student-card');
  const count = cards.length;
  if (badge) {
    badge.textContent = `${count} Student${count === 1 ? '' : 's'} Added`;
  }
  // Re-number labels and toggle remove button visibility
  cards.forEach((card, idx) => {
    const numSpan = card.querySelector('.student-card-num');
    if (numSpan) numSpan.textContent = `#${idx + 1}`;
    const removeBtn = card.querySelector('.student-card-remove-btn');
    if (removeBtn) {
      removeBtn.style.display = cards.length > 1 ? 'inline-flex' : 'none';
    }
  });
}

function addDonatedStudentCard() {
  const container = document.getElementById('donatedStudentsContainer');
  if (!container) return;

  donatedStudentCardSeq++;
  const cardId = `donated_card_${donatedStudentCardSeq}`;

  const card = document.createElement('div');
  card.className = 'donated-student-card';
  card.id = cardId;
  card.style.cssText = 'background: #FFFFFF; border: 1px solid rgba(15, 23, 42, 0.1); border-radius: 14px; padding: 1rem; box-shadow: 0 4px 15px rgba(0,0,0,0.03); transition: all 0.2s ease; position: relative;';

  card.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; border-bottom: 1px dashed rgba(15, 23, 42, 0.08); padding-bottom: 0.5rem;">
      <div style="font-weight: 700; color: var(--magenta); font-size: 0.88rem; display: flex; align-items: center; gap: 0.35rem;">
        <i class="fas fa-user-graduate"></i> Student <span class="student-card-num">#1</span> Details
      </div>
      <button type="button" class="student-card-remove-btn btn btn-outline btn-sm" onclick="removeDonatedStudentCard('${cardId}')" style="display: none; padding: 0.2rem 0.55rem; font-size: 0.75rem; color: #EF4444; border-color: rgba(239, 68, 68, 0.3); border-radius: 6px; background: rgba(239, 68, 68, 0.04);">
        <i class="fas fa-trash-alt"></i> Remove
      </button>
    </div>

    <div class="form-group" style="margin-bottom: 0.65rem;">
      <label class="form-label" style="font-size: 0.8rem; margin-bottom: 0.3rem;"><i class="fas fa-user text-magenta"></i> Student Name *</label>
      <input type="text" class="form-input donated-student-name" placeholder="Enter student's full name" required style="padding: 0.65rem 0.85rem; font-size: 0.9rem;">
    </div>

    <div class="form-row">
      <div class="form-group" style="margin-bottom: 0.35rem;">
        <label class="form-label" style="font-size: 0.8rem; margin-bottom: 0.3rem;"><i class="fas fa-phone text-cyan"></i> Student Mobile Number *</label>
        <input type="tel" class="form-input donated-student-phone" placeholder="10-digit mobile" required pattern="[0-9]{10}" style="padding: 0.65rem 0.85rem; font-size: 0.9rem;">
      </div>

      <div class="form-group" style="margin-bottom: 0.35rem;">
        <label class="form-label" style="font-size: 0.8rem; margin-bottom: 0.3rem;"><i class="fas fa-map-marker-alt text-magenta"></i> Place / Town *</label>
        <input type="text" class="form-input donated-student-place" placeholder="e.g. Chavakkad" required style="padding: 0.65rem 0.85rem; font-size: 0.9rem;">
      </div>
    </div>
  `;

  container.appendChild(card);
  updateDonatedStudentsBadge();

  // Scroll smoothly to newly added card if not first
  if (donatedStudentCardSeq > 1) {
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    const nameInput = card.querySelector('.donated-student-name');
    if (nameInput) setTimeout(() => nameInput.focus(), 250);
  }
}

function removeDonatedStudentCard(cardId) {
  const card = document.getElementById(cardId);
  if (card) {
    card.remove();
    updateDonatedStudentsBadge();
  }
}

function resetDonateForm() {
  const form = document.getElementById('donateContactForm');
  const donatorName = document.getElementById('donatorName');
  const donatorPhone = document.getElementById('donatorPhone');
  const container = document.getElementById('donatedStudentsContainer');
  const successView = document.getElementById('donateSuccessView');
  const submitBtn = document.getElementById('donateSubmitBtn');

  if (donatorName) donatorName.value = '';
  if (donatorPhone) donatorPhone.value = '';
  if (container) {
    container.innerHTML = '';
    donatedStudentCardSeq = 0;
    addDonatedStudentCard();
  }
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Contact(s)';
  }
  if (successView) successView.style.display = 'none';
  if (form) form.style.display = 'block';
}

function initDonateContactModal() {
  const modal = document.getElementById('donateContactModal');
  if (!modal) return;

  // 1. Close when clicking outside overlay
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeDonateContactModal();
    }
  });

  // 2. Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeDonateContactModal();
    }
  });

  // 3. Form Submit handling
  const form = document.getElementById('donateContactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const donatorName = (document.getElementById('donatorName')?.value || '').trim();
    const donatorPhone = (document.getElementById('donatorPhone')?.value || '').trim();
    const submitBtn = document.getElementById('donateSubmitBtn');

    if (!donatorName || !donatorPhone) {
      alert('Please enter your name and 10-digit mobile number.');
      return;
    }
    if (!/^[0-9]{10}$/.test(donatorPhone)) {
      alert('Please enter a valid 10-digit donator mobile number.');
      return;
    }

    const cards = document.querySelectorAll('#donatedStudentsContainer .donated-student-card');
    if (!cards || cards.length === 0) {
      alert('Please add at least 1 student contact detail.');
      return;
    }

    const students = [];
    let validationError = null;

    cards.forEach((card, idx) => {
      const name = (card.querySelector('.donated-student-name')?.value || '').trim();
      const phone = (card.querySelector('.donated-student-phone')?.value || '').trim();
      const place = (card.querySelector('.donated-student-place')?.value || '').trim();

      if (!name) {
        validationError = `Please enter the name for Student #${idx + 1}.`;
        return;
      }
      if (!phone || !/^[0-9]{10}$/.test(phone)) {
        validationError = `Please enter a valid 10-digit mobile number for Student #${idx + 1} (${name || 'Student'}).`;
        return;
      }
      if (!place) {
        validationError = `Please enter the place for Student #${idx + 1}.`;
        return;
      }

      students.push({ name, phone, place });
    });

    if (validationError) {
      alert(validationError);
      return;
    }

    // Build payload rows for Supabase registrations table
    const timestamp = new Date().toISOString();
    const rows = students.map((s, i) => {
      const uniqueSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      return {
        reg_id: `SYS_DON_${Date.now()}_${i + 1}_${uniqueSuffix}`,
        name: s.name,
        phone: s.phone,
        parent_phone: donatorPhone, // Keep donator phone accessible
        student_class: 'Donated Lead',
        school: `Referred by ${donatorName} (${donatorPhone})`,
        place: s.place,
        panchayath: '',
        ward: '',
        unit: donatorName, // Storing donator name here for fast filtering/identification
        zone: 'Donated',
        timestamp: timestamp
      };
    });

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting Contacts...';

    try {
      // 1. Direct fetch to Supabase REST API (bypasses SDK nuances & works 100% reliably)
      const res = await fetch(`${SUPABASE_URL}/rest/v1/registrations`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(rows)
      });

      if (!res.ok) {
        // Fallback to supabase SDK if direct fetch returns an error
        if (window.supabaseClient) {
          const { error: sbErr } = await window.supabaseClient.from('registrations').insert(rows);
          if (sbErr) throw sbErr;
        } else {
          const errText = await res.text();
          throw new Error(errText || 'Failed to submit contacts');
        }
      }

      // Success! Update success view
      document.getElementById('successDonatorName').textContent = donatorName;
      document.getElementById('successStudentCount').textContent = `${students.length} student${students.length > 1 ? 's' : ''}`;

      const listContainer = document.getElementById('successStudentsList');
      if (listContainer) {
        listContainer.innerHTML = students.map((s, idx) => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.45rem 0; border-bottom: ${idx < students.length - 1 ? '1px solid #E2E8F0' : 'none'}; font-size: 0.88rem;">
            <div>
              <strong style="color: var(--text-main);">${s.name}</strong>
              <div style="font-size: 0.78rem; color: var(--text-dim);"><i class="fas fa-map-marker-alt"></i> ${s.place}</div>
            </div>
            <div style="font-family: monospace; font-weight: 600; color: var(--cyan);">
              <i class="fas fa-phone-alt" style="font-size: 0.75rem;"></i> ${s.phone}
            </div>
          </div>
        `).join('');
      }

      // Toggle views
      form.style.display = 'none';
      const successView = document.getElementById('donateSuccessView');
      if (successView) successView.style.display = 'block';

    } catch (err) {
      console.error('Error submitting donated contacts:', err);
      alert('Error submitting contacts: ' + (err.message || 'Please check your internet connection and try again.'));
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Contact(s)';
    }
  });
}

// Direct URL link helpers
function getDonateDirectUrl() {
  const origin = window.location.origin;
  const path = window.location.pathname.replace(/[^/]*$/, '');
  return `${origin}${path}donate.html`;
}

function copyDonateDirectLink() {
  const url = getDonateDirectUrl();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      alert('🔗 Direct Link copied to clipboard:\n\n' + url + '\n\nYou can share this link directly on WhatsApp or social media!');
    }).catch(() => {
      prompt('Copy the Donate a Contact direct link below:', url);
    });
  } else {
    prompt('Copy the Donate a Contact direct link below:', url);
  }
}

function shareDonateWhatsAppLink() {
  const url = getDonateDirectUrl();
  const text = `🤝 *TEENSPACE 2026 - DONATE A STUDENT CONTACT* 🤝\n\nKnow a student studying in Class 8, 9, 10, 11, or 12? Help empower them by sharing their contact details so our team can invite and guide them for TEENSPACE 2026.\n\n👉 *Direct Link:* ${url}\n\n_Together, let's shape our teenagers' future!_ ✨`;
  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(waUrl, '_blank');
}

// Auto-open modal on direct deep link (#donate or ?donate)
function checkUrlDirectActions() {
  const hash = (window.location.hash || '').toLowerCase();
  const params = new URLSearchParams(window.location.search || '');

  if (hash === '#donate' || hash === '#donate-contact' || hash === '#donatecontact' || params.has('donate')) {
    if (window.autoRegPopupTimer) {
      clearTimeout(window.autoRegPopupTimer);
    }
    closeRegisterModal();
    setTimeout(() => {
      openDonateContactModal();
      const donateSec = document.getElementById('donate');
      if (donateSec) donateSec.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  } else if (hash === '#register' || params.has('register')) {
    // Registrations officially closed - no auto popup on direct URL entry
  }
}

window.addEventListener('hashchange', checkUrlDirectActions);

// Auto-initialize when document loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initDonateContactModal();
    checkUrlDirectActions();
  });
} else {
  initDonateContactModal();
  checkUrlDirectActions();
}

