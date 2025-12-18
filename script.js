// State
let historyData = [];
let editIndex = -1;

// Constants
const LOGO_URL = "assets/logo.jpg"; // Pastikan logo VARSHA di-upload ke path ini

// Init: load LocalStorage & bind events
window.addEventListener("DOMContentLoaded", () => {
  loadFromLocalStorage();
  bindUI();
  renderTable();
  updateFilters();
});

function bindUI() {
  document.getElementById("customerForm").addEventListener("submit", onSubmit);
  document.getElementById("btnPrintForm").addEventListener("click", printForm);
  document.getElementById("btnExport").addEventListener("click", exportJSON);
  document.getElementById("btnImport").addEventListener("click", importJSON);
  document.getElementById("searchInput").addEventListener("input", applyFilters);
  document.getElementById("filterBarang").addEventListener("change", applyFilters);
  document.getElementById("filterJumlah").addEventListener("change", applyFilters);
  document.getElementById("btnPrintAllLabels").addEventListener("click", printAllLabels);
}

// Form submit
function onSubmit(e) {
  e.preventDefault();

  const nama = document.getElementById("nama").value.trim();
  const alamat = document.getElementById("alamat").value.trim();
  const telepon = document.getElementById("telepon").value.trim();
  const barang = document.getElementById("barang").value.trim();
  const jumlah = document.getElementById("jumlah").value.trim();

  if (!nama || !alamat || !telepon || !barang || !jumlah) {
    alert("Semua field wajib diisi!");
    return;
  }

  const data = { nama, alamat, telepon, barang, jumlah };

  if (editIndex === -1) {
    historyData.push(data);
    showToast("Data pelanggan disimpan.");
  } else {
    historyData[editIndex] = data;
    editIndex = -1;
    showToast("Data pelanggan diperbarui.");
  }

  saveToLocalStorage();
  renderTable();
  updateFilters();
  e.target.reset();
}

// Render table
function renderTable() {
  const tbody = document.querySelector("#historyTable tbody");
  tbody.innerHTML = "";

  const list = getFilteredData();

  list.forEach((item, indexOnFiltered) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${escapeHTML(item.nama)}</td>
      <td>${escapeHTML(item.alamat)}</td>
      <td>${escapeHTML(item.telepon)}</td>
      <td>${escapeHTML(item.barang)}</td>
      <td>${escapeHTML(item.jumlah)}</td>
      <td>
        <button type="button" class="edit" data-action="edit">Edit</button>
        <button type="button" class="delete" data-action="delete">Delete</button>
        <button type="button" class="print" data-action="print">Cetak Label</button>
      </td>
    `;

    tr.querySelector('[data-action="edit"]').addEventListener("click", () => {
      const realIndex = findRealIndex(item);
      editData(realIndex);
    });
    tr.querySelector('[data-action="delete"]').addEventListener("click", () => {
      const realIndex = findRealIndex(item);
      deleteData(realIndex);
    });
    tr.querySelector('[data-action="print"]').addEventListener("click", () => {
      const realIndex = findRealIndex(item);
      printLabel(realIndex);
    });

    tbody.appendChild(tr);
  });
}

// Map filtered item back to original index
function findRealIndex(item) {
  return historyData.findIndex(d =>
    d.nama === item.nama &&
    d.alamat === item.alamat &&
    d.telepon === item.telepon &&
    d.barang === item.barang &&
    String(d.jumlah) === String(item.jumlah)
  );
}

// Filters
function updateFilters() {
  const barangSet = new Set(historyData.map(i => i.barang));
  const jumlahSet = new Set(historyData.map(i => String(i.jumlah)));

  const filterBarang = document.getElementById("filterBarang");
  const filterJumlah = document.getElementById("filterJumlah");

  const selectedBarang = filterBarang.value;
  const selectedJumlah = filterJumlah.value;

  filterBarang.innerHTML = '<option value="">-- Semua --</option>';
  barangSet.forEach(b => {
    const opt = document.createElement("option");
    opt.value = b;
    opt.textContent = b;
    filterBarang.appendChild(opt);
  });

  filterJumlah.innerHTML = '<option value="">-- Semua --</option>';
  jumlahSet.forEach(j => {
    const opt = document.createElement("option");
    opt.value = j;
    opt.textContent = j;
    filterJumlah.appendChild(opt);
  });

  if ([...barangSet].includes(selectedBarang)) filterBarang.value = selectedBarang;
  if ([...jumlahSet].includes(selectedJumlah)) filterJumlah.value = selectedJumlah;
}

function applyFilters() {
  renderTable();
}

function getFilteredData() {
  const keyword = document.getElementById("searchInput").value.toLowerCase();
  const barangFilter = document.getElementById("filterBarang").value;
  const jumlahFilter = document.getElementById("filterJumlah").value;

  return historyData.filter(item =>
    (item.nama.toLowerCase().includes(keyword) ||
     item.alamat.toLowerCase().includes(keyword) ||
     item.barang.toLowerCase().includes(keyword)) &&
    (barangFilter === "" || item.barang === barangFilter) &&
    (jumlahFilter === "" || String(item.jumlah) === String(jumlahFilter))
  );
}

// Edit/Delete
function editData(index) {
  const item = historyData[index];
  document.getElementById("nama").value = item.nama;
  document.getElementById("alamat").value = item.alamat;
  document.getElementById("telepon").value = item.telepon;
  document.getElementById("barang").value = item.barang;
  document.getElementById("jumlah").value = item.jumlah;
  editIndex = index;
  showToast("Mode edit diaktifkan.");
}

function deleteData(index) {
  if (!confirm("Yakin hapus data ini?")) return;
  historyData.splice(index, 1);
  saveToLocalStorage();
  renderTable();
  updateFilters();
  showToast("Data berhasil dihapus.");
}

// Print actions
function printForm() {
  window.print();
}

function printLabel(index) {
  const item = historyData[index];
  const qrData = encodeURIComponent(`${item.nama} - ${item.telepon}`);
  const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${qrData}`;

  const labelHTML = `
    <div style="border:2px solid #333; padding:15px; width:360px; font-family:Arial; margin:20px; background-color:#f9f9f9; page-break-inside:avoid;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <img src="${LOGO_URL}" alt="Logo" style="width:80px; height:80px; object-fit:contain;">
        <img src="${qrURL}" alt="QR Code" style="width:100px; height:100px;">
      </div>
      <h3 style="text-align:center; margin:12px 0 8px; color:#333;">Label Pengiriman</h3>
      <p><strong>Nama:</strong> ${escapeHTML(item.nama)}</p>
      <p><strong>Alamat:</strong> ${escapeHTML(item.alamat)}</p>
      <p><strong>Telepon:</strong> ${escapeHTML(item.telepon)}</p>
      <p><strong>Barang:</strong> ${escapeHTML(item.barang)}</p>
      <p><strong>Jumlah:</strong> ${escapeHTML(item.jumlah)}</p>
    </div>
  `;

  const w = window.open("", "", "width=520,height=720");
  w.document.write("<html><head><title>Label Pengiriman</title></head><body>");
  w.document.write(labelHTML);
  w.document.write("</body></html>");
  w.document.close();
  w.focus();
  w.print();
  showToast(`Label untuk ${item.nama} dicetak.`);
}

function printAllLabels() {
  if (historyData.length === 0) {
    alert("Tidak ada data untuk dicetak!");
    return;
  }

  let labelsHTML = "";
  historyData.forEach(item => {
    const qrData = encodeURIComponent(`${item.nama} - ${item.telepon}`);
    const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${qrData}`;

    labelsHTML += `
      <div style="border:2px solid #333; padding:15px; width:360px; font-family:Arial; margin:20px; background-color:#f9f9f9; page-break
