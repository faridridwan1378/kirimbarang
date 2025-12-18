let historyData = [];
let editIndex = -1;

const LOGO_URL = "./assets/logo.jpg"; // Pastikan logo VARSHA ada di folder assets

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
