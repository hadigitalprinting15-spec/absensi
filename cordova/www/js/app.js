const API_BASE = 'http://localhost:3000/api';
const ADMIN_PASSWORD_DEFAULT = 'adminlimopancer';

let html5QrcodeScanner = null;
let isProcessing = false;
let isAdminLoggedIn = false;
let deleteEmployeeId = null;

let localEmployees = [
    { id: 1, barcode_id: "EMP-1001", name: "Budi Santoso", department: "Tukang Batu/Sipil" },
    { id: 2, barcode_id: "EMP-1002", name: "Siti Rahma", department: "Tukang Kayu" },
    { id: 3, barcode_id: "EMP-1003", name: "Deni Pratama", department: "Tukang Listrik (Elektrikal)" }
];

let localLogs = [
    { id: 1, employee_id: 1, name: "Budi Santoso", date: new Date().toISOString().split('T')[0], time_in: "07:50:12", time_out: "17:05:00", status: "PRESENT" },
    { id: 2, employee_id: 2, name: "Siti Rahma", date: new Date().toISOString().split('T')[0], time_in: "08:15:40", time_out: null, status: "LATE" }
];

// Tunggu Cordova siap
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    console.log('Cordova is ready!');
    lucide.createIcons();
    initScanner();
    fetchEmployees();
    fetchLogs();
}

// Fallback jika tidak dalam Cordova
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.cordova) {
            console.log('Running in browser mode');
            lucide.createIcons();
            initScanner();
            fetchEmployees();
            fetchLogs();
        }
    });
} else {
    if (!window.cordova) {
        lucide.createIcons();
        initScanner();
        fetchEmployees();
        fetchLogs();
    }
}

function togglePasswordVisibility() {
    const passInput = document.getElementById('admin-password');
    const eyeIcon = document.getElementById('eye-icon');

    if (passInput.type === 'password') {
        passInput.type = 'text';
        eyeIcon.setAttribute('data-lucide', 'eye-off');
    } else {
        passInput.type = 'password';
        eyeIcon.setAttribute('data-lucide', 'eye');
    }
    lucide.createIcons();
}

function switchTab(tab) {
    if (tab === 'admin' && !isAdminLoggedIn) {
        document.getElementById('login-modal').classList.remove('hidden');
        document.getElementById('login-modal').classList.add('flex');
        document.getElementById('admin-password').focus();
        return;
    }

    const viewScanner = document.getElementById('view-scanner');
    const viewAdmin = document.getElementById('view-admin');
    const btnScanner = document.getElementById('btn-tab-scanner');
    const btnAdmin = document.getElementById('btn-tab-admin');

    if (tab === 'scanner') {
        viewScanner.classList.remove('hidden');
        viewAdmin.classList.add('hidden');
        btnScanner.className = 'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all bg-blue-600 text-white shadow-md';
        btnAdmin.className = 'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all text-slate-400 hover:text-white';
    } else {
        viewScanner.classList.add('hidden');
        viewAdmin.classList.remove('hidden');
        btnAdmin.className = 'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all bg-blue-600 text-white shadow-md';
        btnScanner.className = 'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all text-slate-400 hover:text-white';
    }
}

function handleAdminLogin(e) {
    e.preventDefault();
    const pass = document.getElementById('admin-password').value;
    const errorText = document.getElementById('login-error');

    if (pass === ADMIN_PASSWORD_DEFAULT) {
        isAdminLoggedIn = true;
        errorText.classList.add('hidden');
        closeLoginModal();
        document.getElementById('btn-logout').classList.remove('hidden');
        switchTab('admin');
    } else {
        errorText.classList.remove('hidden');
    }
}

function logoutAdmin() {
    isAdminLoggedIn = false;
    document.getElementById('btn-logout').classList.add('hidden');
    document.getElementById('admin-password').value = '';
    switchTab('scanner');
    alert('Admin berhasil logout.');
}

function closeLoginModal() {
    document.getElementById('login-modal').classList.add('hidden');
    document.getElementById('login-modal').classList.remove('flex');
    document.getElementById('login-error').classList.add('hidden');
}

function initScanner() {
    html5QrcodeScanner = new Html5QrcodeScanner(
        "reader", 
        { fps: 10, qrbox: { width: 220, height: 220 }, aspectRatio: 1.0 },
        false
    );
    html5QrcodeScanner.render(onScanSuccess);
}

function updateStatus(message, type = 'default') {
    const card = document.getElementById('status-card');
    const text = document.getElementById('status-text');

    card.className = 'mt-4 p-4 rounded-xl border transition-all ';
    if (type === 'success') card.className += 'bg-emerald-950/60 border-emerald-500 text-emerald-400';
    else if (type === 'error') card.className += 'bg-red-950/60 border-red-500 text-red-400';
    else if (type === 'loading') card.className += 'bg-amber-950/60 border-amber-500 text-amber-400';
    else card.className += 'bg-slate-900 border-slate-700 text-slate-300';

    text.innerText = message;
}

function onScanSuccess(decodedText) {
    if (isProcessing) return;
    isProcessing = true;

    updateStatus(`Memproses ID: ${decodedText}...`, 'loading');

    fetch(`${API_BASE}/attendance/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode_id: decodedText })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) updateStatus(`✅ ${data.message}`, 'success');
        else updateStatus(`❌ ${data.message}`, 'error');
        
        fetchLogs();
        setTimeout(() => { isProcessing = false; updateStatus('Siap melakukan pemindaian...'); }, 3000);
    })
    .catch(() => {
        handleLocalScan(decodedText);
    });
}

function handleLocalScan(code) {
    const emp = localEmployees.find(e => e.barcode_id === code);
    if (!emp) {
        updateStatus('❌ Barcode / QR ID tidak terdaftar!', 'error');
    } else {
        const today = new Date().toISOString().split('T')[0];
        const now = new Date().toTimeString().split(' ')[0];
        let log = localLogs.find(l => l.employee_id === emp.id && l.date === today);

        if (!log) {
            localLogs.push({
                id: localLogs.length + 1,
                employee_id: emp.id,
                name: emp.name,
                date: today,
                time_in: now,
                time_out: null,
                status: now > "08:00:00" ? 'LATE' : 'PRESENT'
            });
            updateStatus(`✅ Berhasil Absen Masuk: ${emp.name}`, 'success');
        } else if (!log.time_out) {
            log.time_out = now;
            updateStatus(`✅ Berhasil Absen Keluar: ${emp.name}`, 'success');
        } else {
            updateStatus(`⚠️ ${emp.name} sudah selesai absen hari ini.`, 'error');
        }
        renderLogs(localLogs);
    }

    setTimeout(() => { isProcessing = false; updateStatus('Siap melakukan pemindaian...'); }, 3000);
}

function fetchEmployees() {
    fetch(`${API_BASE}/admin/employees`)
        .then(res => res.json())
        .then(res => renderEmployees(res.data || localEmployees))
        .catch(() => renderEmployees(localEmployees));
}

function fetchLogs() {
    fetch(`${API_BASE}/admin/logs`)
        .then(res => res.json())
        .then(res => renderLogs(res.data || localLogs))
        .catch(() => renderLogs(localLogs));
}

function renderEmployees(data) {
    localEmployees = data;
    const container = document.getElementById('employee-card-list');
    document.getElementById('stat-total-emp').innerText = data.length;

    container.innerHTML = data.map(emp => `
        <div class="bg-slate-900/60 border border-slate-700/50 p-3 rounded-xl flex items-center justify-between">
            <div>
                <h4 class="font-semibold text-sm text-white">${emp.name}</h4>
                <p class="text-xs text-slate-400">${emp.department}</p>
                <span class="inline-block mt-1 font-mono text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                    ${emp.barcode_id}
                </span>
            </div>
            <div class="flex flex-col gap-1">
                <button onclick="showQrModal('${emp.name}', '${emp.department}', '${emp.barcode_id}')" 
                    class="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 p-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1">
                    <i data-lucide="qr-code" class="w-4 h-4 text-emerald-400"></i>
                    <span>Cetak</span>
                </button>
                <button onclick="showDeleteModal(${emp.id}, '${emp.name}')" 
                    class="bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/30 p-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                    <span>Hapus</span>
                </button>
            </div>
        </div>
    `).join('');

    lucide.createIcons();
}

function renderLogs(logs) {
    localLogs = logs;
    const tbody = document.getElementById('attendance-table-body');
    
    document.getElementById('stat-present').innerText = logs.filter(l => l.status === 'PRESENT').length;
    document.getElementById('stat-late').innerText = logs.filter(l => l.status === 'LATE').length;
    document.getElementById('stat-checkout').innerText = logs.filter(l => l.time_out !== null).length;

    if (logs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-slate-500">Belum ada absensi terrekam.</td></tr>`;
        return;
    }

    tbody.innerHTML = logs.map(log => `
        <tr class="hover:bg-slate-800/40 transition-colors">
            <td class="p-3.5 font-semibold text-white">${log.name}</td>
            <td class="p-3.5 text-slate-400 text-xs">${log.date}</td>
            <td class="p-3.5 text-emerald-400 font-mono text-xs">${log.time_in || '-'}</td>
            <td class="p-3.5 text-purple-400 font-mono text-xs">${log.time_out || '-'}</td>
            <td class="p-3.5 text-center">
                ${log.status === 'PRESENT' 
                    ? `<span class="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-semibold">Tepat Waktu</span>`
                    : `<span class="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs px-2.5 py-1 rounded-full font-semibold">Terlambat</span>`}
            </td>
        </tr>
    `).join('');
}

function handleAddEmployee(e) {
    e.preventDefault();
    const name = document.getElementById('input-name').value;
    const department = document.getElementById('input-dept').value;

    const newEmp = {
        id: localEmployees.length + 1,
        barcode_id: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        name,
        department
    };

    fetch(`${API_BASE}/admin/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, department })
    })
    .then(res => res.json())
    .then(res => {
        fetchEmployees();
        document.getElementById('form-add-employee').reset();
    })
    .catch(() => {
        localEmployees.push(newEmp);
        renderEmployees(localEmployees);
        document.getElementById('form-add-employee').reset();
    });
}

function filterLogs() {
    const query = document.getElementById('search-log').value.toLowerCase();
    renderLogs(localLogs.filter(l => l.name.toLowerCase().includes(query)));
}

function showQrModal(name, dept, code) {
    document.getElementById('modal-emp-name').innerText = name;
    document.getElementById('modal-emp-dept').innerText = dept;
    document.getElementById('modal-emp-code').innerText = code;

    const qrBox = document.getElementById('qrcode-box');
    qrBox.innerHTML = '';
    new QRCode(qrBox, { text: code, width: 140, height: 140, colorDark: "#0f172a", colorLight: "#ffffff" });

    document.getElementById('qr-modal').classList.remove('hidden');
    document.getElementById('qr-modal').classList.add('flex');
}

function closeModal() {
    document.getElementById('qr-modal').classList.add('hidden');
    document.getElementById('qr-modal').classList.remove('flex');
}

function showDeleteModal(empId, empName) {
    deleteEmployeeId = empId;
    document.getElementById('delete-emp-name').innerText = empName;
    document.getElementById('delete-modal').classList.remove('hidden');
    document.getElementById('delete-modal').classList.add('flex');
}

function closeDeleteModal() {
    document.getElementById('delete-modal').classList.add('hidden');
    document.getElementById('delete-modal').classList.remove('flex');
    deleteEmployeeId = null;
}

function confirmDelete() {
    if (deleteEmployeeId === null) return;

    fetch(`${API_BASE}/admin/employees/${deleteEmployeeId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.json())
    .then(res => {
        closeDeleteModal();
        fetchEmployees();
        fetchLogs();
    })
    .catch(() => {
        localEmployees = localEmployees.filter(emp => emp.id !== deleteEmployeeId);
        localLogs = localLogs.filter(log => log.employee_id !== deleteEmployeeId);
        closeDeleteModal();
        renderEmployees(localEmployees);
        renderLogs(localLogs);
    });
}