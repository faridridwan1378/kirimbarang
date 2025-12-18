let customers = JSON.parse(localStorage.getItem("customers")) || [];
let currentUser = null;

// Hardcoded users
const users = {
  admin: { password: "1234", role: "Admin" },
  staff: { password: "abcd", role: "Staff" }
};

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

// Login with password
document.getElementById("login-form").addEventListener("submit", e => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (users[username] && users[username].password === password) {
    currentUser = { username, role: users[username].role };
    document.getElementById("login-section").style.display = "none";
    document.getElementById("app").style.display = "block";
    document.getElementById("logoutBtn").style.display = "inline-block";
    showToast(`Welcome ${username} (${currentUser.role})`);
    renderTable();
  } else {
    showToast("Invalid login", "error");
  }
});

// Logout
function logout() {
  currentUser = null;
  document.getElementById("app").style.display = "none";
  document.getElementById("login-section").style.display = "block";
  document.getElementById("logoutBtn").style.display = "none";
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

// Print Label
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
  batch
