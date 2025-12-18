// Firebase Config (replace with your project keys)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Init Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let customers = JSON.parse(localStorage.getItem("customers")) || [];
let currentUser = null;

// Auto-save
function saveToStorage() {
  localStorage.setItem("customers", JSON.stringify(customers));
}

// Toast
function showToast(msg, type="success") {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = type;
  setTimeout(() => toast.textContent = "", 3000);
}

// Render Table
function renderTable(list=customers) {
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
        ${currentUser && currentUser.role === "admin" 
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
  const username = document.getElementById("username").value;
  const role = document.getElementById("role").value;
  currentUser = {username, role};
  document.getElementById("login-section").style.display = "none";
  document.getElementById("app").style.display = "block";
  showToast(`Welcome ${username} (${role})`);
  renderTable();
});

// Permission Check
function checkPermission(action) {
  if (currentUser.role !== "admin" && action === "delete") {
    showToast("Permission denied","error");
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

// Delete (restricted to admin)
function deleteCustomer(i) {
  if (!checkPermission("delete")) return;
  customers.splice(i,1);
  saveToStorage();
  renderTable();
  showToast("Customer deleted","error");
}

// Print Label
function printLabel(i) {
  const c = customers[i];
  const label = `
    Name: ${c.name}\n
    Address: ${c.address}\n
    Method: ${c.shippingMethod}
  `;
  alert("Printing Label:\n" + label);
}

// Batch Print
document.getElementById("printBatch").addEventListener("click", () => {
  customers.forEach((c,i) => printLabel(i));
});

// Export
document.getElementById("export").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(customers,null,2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "customers.json";
  a.click();
  showToast("Exported JSON!");
});

// Import
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

// Cloud Sync
document.getElementById("syncCloud").addEventListener("click", async () => {
  try {
    for (let c of customers) {
      await db.collection("customers").add(c);
    }
    showToast("Synced to Cloud!");
  } catch (err) {
    showToast("Cloud sync failed","error");
  }
});
