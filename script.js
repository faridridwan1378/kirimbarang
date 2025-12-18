let historyData = [];
let editIndex = -1;

document.getElementById("customerForm").addEventListener("submit", function(e) {
  e.preventDefault();
  
  const nama = document.getElementById("nama").value;
  const alamat = document.getElementById("alamat").value;
  const telepon = document.getElementById("telepon").value;
  const barang = document.getElementById("barang").value;
  const jumlah = document.getElementById("jumlah").value;

  const data = { nama, alamat, telepon, barang, jumlah };

  if (editIndex === -1) {
    historyData.push(data);
  } else {
    historyData[editIndex] = data;
    editIndex = -1;
  }

  renderTable();
  this.reset();
});

function renderTable() {
  const tbody = document.querySelector("#historyTable tbody");
  tbody.innerHTML = "";

  historyData.forEach((item, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${item.nama}</td>
      <td>${item.alamat}</td>
      <td>${item.telepon}</td>
      <td>${item.barang}</td>
      <td>${item.jumlah}</td>
      <td>
        <button onclick="editData(${index})">Edit</button>
        <button onclick="deleteData(${index})">Delete</button>
      </td>
    `;

    tbody.appendChild(row);
  });
}

function editData(index) {
  const item = historyData[index];
  document.getElementById("nama").value = item.nama;
  document.getElementById("alamat").value = item.alamat;
  document.getElementById("telepon").value = item.telepon;
  document.getElementById("barang").value = item.barang;
  document.getElementById("jumlah").value = item.jumlah;
  editIndex = index;
}

function deleteData(index) {
  historyData.splice(index, 1);
  renderTable();
}

function printForm() {
  window.print();
}

function exportJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(historyData, null, 2));
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", "backup_pelanggan.json");
  dlAnchor.click();
}
