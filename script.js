let customers = JSON.parse(localStorage.getItem("customers")) || [];
let currentUser = null;

// Auto-save
function saveToStorage() {
  localStorage.setItem("customers", JSON.stringify(customers));
}

// Toast
function showToast(msg, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = type;
  setTimeout(() => {
    toast.textContent = "";
    toast.className = "";
  }, 3000);
}

// Render Table
function renderTable(list = customers) {
  const tbody = document.querySelector("#customer-table tbody");
  tbody.innerHTML = "";
  list.forEach((c, i) => {
    const row = `<tr>
      <td>${c.name}</td>
      <td>${c.address}</td>
      <td>${c.email}</td>
      <td>${c.phone}</td>
      <td>${c.shippingMethod}</td>
      <td>
        <button onclick="printLabel(${i})">🖨️</button>
        ${currentUser && currentUser.role === "Admin"
          ? `<button onclick="deleteCustomer(${i})">❌</button>`
          : ""}
      </td>
    </tr>`;
    tbody.innerHTML += row;
  });
}

// Login
document.getElementById("login-form").addEventListener("submit", e => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const role = document.getElementById("role").value;

  if (username && role) {
    currentUser = { username, role };
    document.getElementById("login-section").style.display = "none";
    document.getElementById("app").style.display = "block";
    showToast(`Welcome ${username} (${role})`);
    renderTable();
  } else {
    showToast("Please enter username and select role", "error");
  }
});

// Logout
function logout() {
  currentUser = null;
  document.getElementById("app").style.display = "none";
  document.getElementById("login-section").style.display = "block";
  showToast("Logged out");
}

// Permission Check
function checkPermission(action) {
  if (currentUser.role !== "Admin" && action === "delete") {
    showToast("Permission denied", "error");
    return false;
  }
  return true;
}

// Add Customer
document.getElementById("customer-form").addEventListener("submit", e => {
  e.preventDefault();
  const customer = {
    name: document.getElementById("name").value,
    address: document.getElementById("address").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    shippingMethod: document.getElementById("shippingMethod").value
  };
  customers.push(customer);
  saveToStorage();
  renderTable();
  showToast("Customer saved!");
  e.target.reset();
});

// Delete Customer
function deleteCustomer(i) {
  if (!checkPermission("delete")) return;
  customers.splice(i, 1);
  saveToStorage();
  renderTable();
  showToast("Customer deleted", "error");
}

// Print Label (single)
function printLabel(i) {
  const c = customers[i];
  const labelWindow = window.open('', '', 'width=400,height=600');
  labelWindow.document.write(`
    <html>
      <head>
        <title>Shipping Label</title>
        <style>
          body { font-family: Arial, sans-serif; margin:20px; }
          .label { border:1px solid #000; padding:15px; width:300px; }
          h2 { text-align:center; margin-bottom:20px; }
          .qr { text-align:center; margin-top:20px; }
          .sender { margin-top:20px; font-weight:bold; text-align:center; }
        </style>
      </head>
      <body>
        <div class="label">
          <h2>📦 Shipping Label</h2>
          <p><strong>Name:</strong> ${c.name}</p>
          <p><strong>Address:</strong> ${c.address}</p>
          <p><strong>Email:</strong> ${c.email}</p>
          <p><strong>Phone:</strong> ${c.phone}</p>
          <p><strong>Method:</strong> ${c.shippingMethod}</p>
          <div class="qr">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(c.name + '|' + c.address)}" alt="QR Code">
          </div>
          <div class="sender">Pengirim: Versha Fruits & Goods</div>
        </div>
      </body>
    </html>
  `);
  labelWindow.document.close();
  labelWindow.focus();
  labelWindow.print();
  labelWindow.close();
}

// Batch Print
document.getElementById("printBatch").addEventListener("click", () => {
  const batchWindow = window.open('', '', 'width=600,height=800');
  batchWindow.document.write('<html><head><title>Batch Labels</title></head><body><h2>Batch Shipping Labels</h2>');
  customers.forEach(c => {
    batchWindow.document.write(`
      <div style="margin-bottom:20px; border:1px solid #000; padding:10px; width:300px;">
        <p><strong>Name:</strong> ${c.name}</p>
        <p><strong>Address:</strong> ${c.address}</p>
        <p><strong>Email:</strong> ${c.email}</p>
        <p><strong>Phone:</strong> ${c.phone}</p>
        <p><strong>Method:</strong> ${c.shippingMethod}</p>
        <p style="font-weight:bold; text-align:center;">Pengirim: Versha Fruits & Goods</p>
      </div>
    `);
  });
  batchWindow.document.write('</body></html>');
  batchWindow.document.close();
  batchWindow.focus();
  batchWindow.print();
  batchWindow.close();
});

// Export JSON
document.getElementById("export").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(customers, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "customers.json";
  a.click();
  showToast("Exported JSON!");
});

// Import JSON
document.getElementById("import").addEventListener("change", e => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    customers = JSON.parse(reader.result);
    saveToStorage();
    renderTable();
    showToast("Imported JSON!");
  };
  reader.readAsText(file);
});

// Search
document.getElementById("search").addEventListener("input", e => {
  const q = e.target.value.toLowerCase();
  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.address.toLowerCase().includes(q) ||
    c.email.toLowerCase().includes(q)
  );
  renderTable(filtered);
});
