/** --------------------------------------------------
 *  Global Variables
 * -------------------------------------------------- */
let total = [];
let filtered = [];
let page = 1;
let limit = 5;
let selectedCompanyId = null;


/** --------------------------------------------------
 *  Load All Customers
 * -------------------------------------------------- */
function loadTable() {
    fetch("/api/companies")
        .then(res => res.json())
        .then(Data => {
            total = Data;
            filtered = total;
            renderTable();
        })
        .catch(err => console.error("Load Error:", err));
}

/** --------------------------------------------------
 *  Render Table
 * -------------------------------------------------- */
function renderTable() {
    const start = (page - 1) * limit;
    const end   = start + limit;
    const pageData = filtered.slice(start, end);

    let html = "";

    pageData.forEach((c, index) => {
        html += `
        <tr>
            <td class="text-center"> <button class="btn btn-warning btn-sm me-1" onclick="openEdit(${c.companyId})"> <i class="bi bi-pencil-square"></i> </button> <button class="btn btn-danger btn-sm" onclick="confirmDelete(${c.companyId})"> <i class="bi bi-trash"></i> </button> <button class="btn btn-primary btn-sm " onclick="openSettings(${c.companyId})"> <i class="bi bi-gear"></i></button></td>
            <td>${c.companyId}</td>
            <td>${c.companyName}</td>
            <td>${c.contactPerson}</td>
            <td>${c.gstNumber}</td>
            <td>${c.email}</td>

            <td class="text-center">
                <span class="expand-btn" onclick="toggleRow(${index})">+</span>
            </td>
        </tr>

        <tr class="expand-row" id="expand-${index}">
            <td colspan="6">
                <div class="detail-grid">
                    <div><b>Mobile</b><span>${c.mobile}</span></div>
                    <div><b>Address</b><span>${c.address}</span></div>
                    <div><b>City</b><span>${c.city}</span></div>
                    <div><b>State</b><span>${c.state}</span></div>
                    <div><b>Pin Code</b><span>${c.pincode}</span></div>
                    <div><b>Status</b><span>${c.isActive}</span></div>
                </div>
            </td>
        </tr>
        `;
    });

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
    filtered = total.filter(c =>
        c.companyName.toLowerCase().includes(q) ||
        c.contactPerson.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.gstNumber.toLowerCase().includes(q)||
        c.state.toLowerCase().includes(q)

    );
    page = 1;
    renderTable();
});

/** --------------------------------------------------
 *  Reset Modal Fields
 * -------------------------------------------------- */
function resetModal() {
    document.getElementById("companyId").value = "";
    document.getElementById("companyName").value = "";
    document.getElementById("contactPerson").value = "";
    document.getElementById("gstnumber").value = "";
    document.getElementById("email").value = "";
    document.getElementById("mobile").value = "";
    document.getElementById("address").value = "";
    document.getElementById("city").value = "";
    document.getElementById("stateName").value = "";
    document.getElementById("pincode").value = "";
    document.getElementById("isactive").value = "";


    document.querySelectorAll(".text-danger").forEach(e => e.classList.add("d-none"));
}

function openAddModal() {
    resetModal();
    document.getElementById("modalTitle").innerText = "Add Companies";
    new bootstrap.Modal(document.getElementById("addModal")).show();
}

/** --------------------------------------------------
 *  Save (Add + Update)
 * -------------------------------------------------- */
function saveCompany() {
    const id = document.getElementById("companyId").value;

    let data = {
        companyName: document.getElementById("companyName").value.trim(),
        contactPerson: document.getElementById("contactPerson").value.trim(),
        gstnumber: document.getElementById("gstnumber").value.trim(),
        email: document.getElementById("email").value.trim(),
        mobile: document.getElementById("mobile").value.trim(),
        address: document.getElementById("address").value.trim(),
        city: document.getElementById("city").value.trim(),
        state: document.getElementById("stateName").value.trim(),
        pincode: document.getElementById("pincode").value.trim(),
        isactive: document.getElementById("isactive").value.trim(),

    };
console.log(JSON.stringify(data));
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
    let url = id ? `/api/companies/${id}` : `/api/companies`;

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
            Swal.fire("Success", "Companies saved successfully!", "success");
            loadTable();
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

    fetch(`/api/companies/${id}`)
        .then(res => res.json())
        .then(c => {
            document.getElementById("modalTitle").innerText = "Edit Companies";

            document.getElementById("companyId").value = c.companyId;
            document.getElementById("companyName").value = c.companyName;
            document.getElementById("contactPerson").value = c.contactPerson;
            document.getElementById("gstnumber").value = c.gstnumber;
            document.getElementById("email").value = c.email;
            document.getElementById("mobile").value = c.mobile;
            document.getElementById("address").value = c.address;
            document.getElementById("city").value = c.city;
            document.getElementById("stateName").value = c.stateName;
            document.getElementById("pincode").value = c.pincode;
            document.getElementById("isactive").value = c.isactive;


            new bootstrap.Modal(document.getElementById("addModal")).show();
        });
}

/** --------------------------------------------------
 *  Delete Customer
 * -------------------------------------------------- */
function confirmDelete(id) {
    Swal.fire({
        title: "Delete Companies?",
        text: "This action cannot be undone!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Delete"
    }).then(r => {
        if (r.isConfirmed) deleteCompanies(id);
    });
}

function deleteCompanies(id) {
    fetch(`/api/companies/${id}`, { method: "DELETE" })
        .then(() => {
            Swal.fire("Deleted!", "Companies removed", "success");
            loadTable();
        });
}

/** --------------------------------------------------
 *  VALIDATION
 * -------------------------------------------------- */
function validateAll() {
    let errors = [];

    if (!/^[A-Za-z ]+$/.test(companyName.value.trim()))
        errors.push("Name is invalid.");

    if (contactPerson.value.trim() === "")
        errors.push("contact Person is required.");

    if (gstnumber.value.length !== 15)
        errors.push("gstnumber must be 15 characters.");

    if (!/^[A-Za-z ]+$/.test(stateName.value.trim()))
        errors.push("State Name is invalid.");

    if (email.value.trim()==='')
        errors.push("Email id can't be Empty");
    if (address.value.trim()==='')
        errors.push("Address can't be Empty");
    if (city.value.trim()==='')
        errors.push("City can't be Empty");

    if (!/^[0-9]{10}$/.test(mobile.value))
        errors.push("Mobile must be 10 digits.");

    if (!/^[0-9]{6}$/.test(pincode.value))
        errors.push("PinCode must be 6 digits.");

    return errors;


       
}
function applyFilters() {

    let companyName = document.getElementById("filterCompanyName")?.value || "";
    let contactPerson = document.getElementById("filterContactPerson")?.value || "";
    let email = document.getElementById("filterEmail")?.value || "";
    let gstnumber = document.getElementById("filterGstNumber")?.value || "";
    let state = document.getElementById("filterState")?.value || "";


    let url = `/api/companies?companyName=${companyName}&contactPerson=${contactPerson}&email=${email}&gstnumber=${gstnumber}&state=${state}`;
console.log(url);
    fetch(url)
        .then(res => res.json())
        .then(Data => {
            filtered = Data;
            page = 1;
            renderTable();
        });
}
function clearFilters() {
     document.getElementById("filterCompanyName")?.value || "";
     document.getElementById("filterContactPerson")?.value || "";
     document.getElementById("filterEmail")?.value || "";
     document.getElementById("filterGstNumber")?.value || "";
     document.getElementById("filterState")?.value || "";

    filtered = total;
    page = 1;
    renderTable();
}

function toggleRow(index){
    const row = document.getElementById("expand-" + index);
    const btn = row.previousElementSibling.querySelector(".expand-btn");

    if(row.style.display === "table-row"){
        row.style.display = "none";
        btn.innerText = "+";
    }else{
        row.style.display = "table-row";
        btn.innerText = "−";
    }
}
function openSettings(id) {
    // alert(id);
    selectedCompanyId = id;
    document.getElementById("newPassword").value = "";
    new bootstrap.Modal(document.getElementById("passwordModal")).show();

}

function updateCompanyPassword() {

    const newPassword = document.getElementById("newPassword").value.trim();

    if (newPassword.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
    }

    fetch(`/api/companies/${selectedCompanyId}/password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `newPassword=${encodeURIComponent(newPassword)}`
    })
        .then(res => res.text())
        .then(msg => {
            console.log(msg)
            alert(msg);
            document.getElementById("newPassword").value = "";
            document.getElementById("passwordModalClose").click(); // close modal
        })
        .catch(err => {
            console.error("Password update failed:", err);
            alert("Error updating password");
        });
}

/** --------------------------------------------------
 *  Initial Load
 * -------------------------------------------------- */
loadTable();
