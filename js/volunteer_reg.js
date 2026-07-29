// TEENSPACE 2026 - VOLUNTEER REGISTRATION SCRIPT
const SUPABASE_URL = "https://vnpiylttdjedglsggeea.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_DX7OM5MeL2cTveK0gybXfg_UFUL1Um1";

// Initialize Supabase
if (!window.supabaseClient && window.supabase) {
  window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
var supabase = window.supabaseClient;

let masterMapping = [];

// Load Mapping Options on Page Load
document.addEventListener('DOMContentLoaded', () => {
  loadMappingData();
});

async function loadMappingData() {
  try {
    if (!supabase) return;
    const { data, error } = await supabase.from('mapping').select('*');
    if (error) throw error;
    
    masterMapping = data || [];
    populatePanchayaths();
  } catch (err) {
    console.error("Error loading mapping details:", err);
  }
}

function populatePanchayaths() {
  const select = document.getElementById('volPanchayath');
  if (!select) return;

  const uniquePanchayaths = [...new Set(masterMapping.map(m => m.panchayath))].sort();
  uniquePanchayaths.forEach(p => {
    select.appendChild(new Option(p, p));
  });
}

function handlePanchayathChange() {
  const panchayathSelect = document.getElementById('volPanchayath');
  const wardSelect = document.getElementById('volWard');
  if (!panchayathSelect || !wardSelect) return;

  const selectedPanchayath = panchayathSelect.value;
  wardSelect.innerHTML = '<option value="">Select Ward</option>';

  if (!selectedPanchayath) return;

  const filteredWards = masterMapping
    .filter(m => m.panchayath === selectedPanchayath)
    .map(m => m.ward)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  filteredWards.forEach(w => {
    wardSelect.appendChild(new Option(w, w));
  });
}

// Form Submit Handler
const form = document.getElementById('volunteerRegForm');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';

    const name = document.getElementById('volName').value.trim();
    const phone = document.getElementById('volPhone').value.trim();
    const place = document.getElementById('volPlace').value.trim();
    const panchayath = document.getElementById('volPanchayath').value;
    const ward = document.getElementById('volWard').value;
    const role = document.getElementById('volRole').value;

    // Resolve Zone & Unit
    const matchedMapping = masterMapping.find(m => m.panchayath === panchayath && m.ward === ward);
    const unit = matchedMapping ? matchedMapping.unit : 'N/A';
    const zone = matchedMapping ? matchedMapping.zone : 'N/A';

    try {
      if (!supabase) {
        throw new Error("Database connection not ready. Please try again.");
      }

      // 1. Calculate next sequential ID starting from VOL101
      const { data: vols, error: fetchErr } = await supabase
        .from('volunteers')
        .select('volunteer_id');
        
      if (fetchErr) throw fetchErr;

      let nextNum = 101;
      if (vols && vols.length > 0) {
        const numericIds = vols.map(v => {
          const match = (v.volunteer_id || '').match(/VOL(\d+)/i);
          return match ? parseInt(match[1]) : null;
        }).filter(n => n !== null);
        
        if (numericIds.length > 0) {
          nextNum = Math.max(...numericIds) + 1;
        }
      }
      const volunteerId = `VOL${nextNum}`;

      // 2. Write to Supabase table
      const { error: insertErr } = await supabase
        .from('volunteers')
        .insert([{
          volunteer_id: volunteerId,
          name: name,
          phone: phone,
          place: place,
          panchayath: panchayath,
          ward: ward,
          unit: unit,
          zone: zone,
          role: role
        }]);

      if (insertErr) throw insertErr;

      // 3. Render Pass Card details
      document.getElementById('passVolId').textContent = volunteerId;
      document.getElementById('passVolName').textContent = name;
      document.getElementById('passVolRole').textContent = role;
      document.getElementById('passVolZone').textContent = zone;
      document.getElementById('passVolPhone').textContent = phone;

      // Toggle views
      document.getElementById('formContainer').style.display = 'none';
      document.getElementById('successContainer').style.display = 'block';

    } catch (err) {
      console.error("Volunteer registration error:", err);
      alert("Registration failed: " + err.message);
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Register as Volunteer';
    }
  });
}
