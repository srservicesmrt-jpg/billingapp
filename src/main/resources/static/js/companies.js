/** --------------------------------------------------
 *  Global Variables
 * -------------------------------------------------- */
let customers = [];
let filtered = [];
let page = 1;
let limit = 5;

/** --------------------------------------------------
 *  Load All Customers
 * -------------------------------------------------- */
function loadCustomers() {
    fetch("/api/customers")
        .then(res => res.json())
        .then(data => {
            customers = data;
            filtered = customers;
            renderTable();
        })
        .catch(err => console.error("Load Error:", err));
}

/** --------------------------------------------------
 *  Render Table
 * -------------------------------------------------- */
function renderTable() {
    const start = (page - 1) * limit;
    const end = start + limit;
    const pageData = filtered.slice(start, end);

    let html = pageData
        .map(c => `
            <tr>
                <td>${c.customerId}</td>
                <td>${c.customerName}</td>
                <td>${c.gstin}</td>
                <td>${c.stateName}</td>
                <td>${c.contact}</td>
                <td class="text-center">
                    <button class="btn btn-warning btn-sm me-1" onclick="openEdit(${c.customerId})">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="confirmDelete(${c.customerId})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join("");

    document.getElementById("tableBody").innerHTML = html;
    updatePagination();
}

/** --------------------------------------------------
 *  Pagination
 * -------------------------------------------------- */
function updatePagination() {
    let totalPages = Math.ceil(filtered.length / limit);
    document.getElementById("pageInfo").textContent = `Page ${page} of ${totalPages}`;

    document.getElementById("prevBtn").disabled = page === 1;
    document.getElementById("nextBtn").disabled = page === totalPages;
}

document.getElementById("prevBtn").onclick = () => {
    if (page > 1) { page--; renderTable(); }
};
document.getElementById("nextBtn").onclick = () => {
    if (page * limit < filtered.length) { page++; renderTable(); }
};

/** --------------------------------------------------
 *  Search (Realtime)
 * -------------------------------------------------- */
document.getElementById("searchBox").addEventListener("input", function () {
    let q = this.value.toLowerCase();
    filtered = customers.filter(c =>
        c.customerName.toLowerCase().includes(q) ||
        c.gstin.toLowerCase().includes(q) ||
        c.stateName.toLowerCase().includes(q) ||
        c.contact.toLowerCase().includes(q)
    );
    page = 1;
    renderTable();
});

/** --------------------------------------------------
 *  Reset Modal Fields
 * -------------------------------------------------- */
function resetModal() {
    document.getElementById("customerId").value = "";
    document.getElementById("customerName").value = "";
    document.getElementById("address").value = "";
    document.getElementById("gstin").value = "";
    document.getElementById("stateName").value = "";
    document.getElementById("stateCode").value = "";
    document.getElementById("contact").value = "";

    document.querySelectorAll(".text-danger").forEach(e => e.classList.add("d-none"));
}

function openAddModal() {
    resetModal();
    document.getElementById("modalTitle").innerText = "Add Customer";
    new bootstrap.Modal(document.getElementById("addModal")).show();
}

/** --------------------------------------------------
 *  Save (Add + Update)
 * -------------------------------------------------- */
function saveCustomer() {
    const id = document.getElementById("customerId").value;

    let data = {
        customerName: document.getElementById("customerName").value.trim(),
        address: document.getElementById("address").value.trim(),
        gstin: document.getElementById("gstin").value.trim(),
        stateName: document.getElementById("stateName").value.trim(),
        stateCode: document.getElementById("stateCode").value.trim(),
        contact: document.getElementById("contact").value.trim()
    };

    let errors = validateAll();

    if (errors.length > 0) {
        Swal.fire({
            icon: "error",
            title: "Validation Error",
            html: errors.join("<br>")
        });
        return;
    }

    let method = id ? "PUT" : "POST";
    let url = id ? `/api/customers/${id}` : `/api/customers`;

    fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
        .then(async res => {
            if (res.status === 409) {
                Swal.fire("Duplicate GSTIN", await res.text(), "error");
                throw new Error("Duplicate GSTIN");
            }
            return res.json();
        })
        .then(() => {
            Swal.fire("Success", "Customer saved successfully!", "success");
            loadCustomers();
            bootstrap.Modal.getInstance(document.getElementById("addModal")).hide();
        })
        .catch(err => console.error("Save Error:", err));
}

document.addEventListener('hidden.bs.modal', function () {
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('padding-right');
});


/** --------------------------------------------------
 *  Load For Edit
 * -------------------------------------------------- */
function openEdit(id) {
    resetModal();

    fetch(`/api/customers/${id}`)
        .then(res => res.json())
        .then(c => {
            document.getElementById("modalTitle").innerText = "Edit Customer";

            document.getElementById("customerId").value = c.customerId;
            document.getElementById("customerName").value = c.customerName;
            document.getElementById("address").value = c.address;
            document.getElementById("gstin").value = c.gstin;
            document.getElementById("stateName").value = c.stateName;
            document.getElementById("stateCode").value = c.stateCode;
            document.getElementById("contact").value = c.contact;

            new bootstrap.Modal(document.getElementById("addModal")).show();
        });
}

/** --------------------------------------------------
 *  Delete Customer
 * -------------------------------------------------- */
function confirmDelete(id) {
    Swal.fire({
        title: "Delete Customer?",
        text: "This action cannot be undone!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Delete"
    }).then(r => {
        if (r.isConfirmed) deleteCustomer(id);
    });
}

function deleteCustomer(id) {
    fetch(`/api/customers/${id}`, { method: "DELETE" })
        .then(() => {
            Swal.fire("Deleted!", "Customer removed", "success");
            loadCustomers();
        });
}

/** --------------------------------------------------
 *  VALIDATION
 * -------------------------------------------------- */
function validateAll() {
    let errors = [];

    if (!/^[A-Za-z ]+$/.test(customerName.value.trim()))
        errors.push("Name is invalid.");

    if (address.value.trim() === "")
        errors.push("Address is required.");

    if (gstin.value.length !== 15)
        errors.push("GSTIN must be 15 characters.");

    if (!/^[A-Za-z ]+$/.test(stateName.value.trim()))
        errors.push("State Name is invalid.");

    if (!/^[0-9]+$/.test(stateCode.value))
        errors.push("State Code must be numeric.");

    if (!/^[0-9]{10}$/.test(contact.value))
        errors.push("Contact must be 10 digits.");

    return errors;
}
function applyFilters() {

    let name = document.getElementById("filterName")?.value || "";
    let gstin = document.getElementById("filterGSTIN")?.value || "";
    let state = document.getElementById("filterState")?.value || "";
    let contact = document.getElementById("filterContact")?.value || "";

    let url = `/api/customers?name=${name}&gstin=${gstin}&state=${state}&contact=${contact}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            filtered = data;
            page = 1;
            renderTable();
        });
}
function clearFilters() {
    document.getElementById("filterName").value = "";
    document.getElementById("filterGSTIN").value = "";
    document.getElementById("filterState").value = "";
    document.getElementById("filterContact").value = "";

    filtered = customers;
    page = 1;
    renderTable();
}


/** --------------------------------------------------
 *  Initial Load
 * -------------------------------------------------- */
loadCustomers();
