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

// Login (username + dropdown role)
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
  const label = `
    Name: ${c.name}
    Address: ${c.address}
    Method: ${c.shippingMethod}
  `;
  alert("Printing Label:\n" + label);
}

// Batch Print
document.getElementById("printBatch").addEventListener("click", () => {
  customers.forEach((_, i) => printLabel(i));
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
