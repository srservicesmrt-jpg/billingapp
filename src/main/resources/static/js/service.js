let services = [];
let filtered = [];
let page = 1;
let limit = 5;
let addServiceModal;

/* ------------------- MODAL INIT ------------------- */
document.addEventListener("DOMContentLoaded", () => {
    const modalEl = document.getElementById("addModalService");
    addServiceModal = new bootstrap.Modal(modalEl, {
        backdrop: 'static',
        keyboard: false
    });
});
function clearFilters() {
    document.getElementById("filterName").value = "";
    document.getElementById("filterHsn").value = "";
    document.getElementById("filterStatus").value = "";

    filtered = services;
    page = 1;
    renderTable();
}


document.getElementById("searchBox").addEventListener("input", function () {
    let q = this.value.toLowerCase();
    filtered = services.filter(c =>
        c.serviceName.toLowerCase().includes(q) ||
        c.hsnCode.toLowerCase().includes(q) ||
        c.rate.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)||
        c.status.toLowerCase().includes(q)
    );
    page = 1;
    renderTable();
});
function applyFilters() {

    let name = document.getElementById("filterName")?.value || "";
    let hsnCode = document.getElementById("filterHsn")?.value || "";
    let status = document.getElementById("filterStatus")?.value || "";

    let url = `/api/services?serviceName=${name}&hsnCode=${hsnCode}&status=${status}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            filtered = data;
            page = 1;
            renderTable();
        });
}
/* ------------------- LOAD SERVICES ------------------- */
function loadServices() {
    fetch("/api/services")
        .then(res => res.json())
        .then(data => {
            services = data;
            filtered = services;
            renderTable();
        });
}

/* ------------------- TABLE RENDER ------------------- */
function renderTable() {
    const start = (page - 1) * limit;
    const end = start + limit;
    const pageData = filtered.slice(start, end);

    document.getElementById("tableBody").innerHTML = pageData.map(c => `
        <tr>
            <td>${c.serviceId}</td>
            <td>${c.serviceName}</td>
            <td>${c.hsnCode}</td>
            <td>${c.rate}</td>
            <td>${c.description}</td>
            <td>${c.isActive ? 'Active' : 'DeActive'}</td>
            <td class="text-center">
                <button class="btn btn-warning btn-sm" onclick="openEdit(${c.serviceId})">
                    <i class="bi bi-pencil-square"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="confirmDelete(${c.serviceId})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join("");

    updatePagination();
}

/* ------------------- PAGINATION ------------------- */
function updatePagination() {
    const totalPages = Math.ceil(filtered.length / limit);
    document.getElementById("pageInfo").textContent = `Page ${page} of ${totalPages}`;
    document.getElementById("prevBtn").disabled = page === 1;
    document.getElementById("nextBtn").disabled = page === totalPages;
}

document.getElementById("prevBtn").onclick = () => { if (page > 1) { page--; renderTable(); }};
document.getElementById("nextBtn").onclick = () => { if (page * limit < filtered.length) { page++; renderTable(); }};

/* ------------------- RESET MODAL ------------------- */
function resetModal() {
    document.getElementById("serviceId").value = "";
    document.getElementById("serviceName").value = "";
    document.getElementById("hsnCode").value = "";
    document.getElementById("rate").value = "";
    document.getElementById("description").value = "";
    document.getElementById("status").selectedIndex = 0;
}

/* ------------------- OPEN ADD ------------------- */
function openAddModalService() {
    resetModal();
    document.getElementById("modalTitle").innerText = "Add Service";
    addServiceModal.show();
}

/* ------------------- OPEN EDIT ------------------- */
function openEdit(id) {
    resetModal();
    document.getElementById("modalTitle").innerText = "Edit Service";

    fetch(`/api/services/${id}`)
        .then(res => res.json())
        .then(c => {
            document.getElementById("serviceId").value = c.serviceId;
            document.getElementById("serviceName").value = c.serviceName;
            document.getElementById("hsnCode").value = c.hsnCode;
            document.getElementById("rate").value = c.rate;
            document.getElementById("description").value = c.description;
            document.getElementById("status").value = String(c.isActive);
            addServiceModal.show();
        });
}

/* ------------------- SAVE ------------------- */
function saveService() {
    const id = document.getElementById("serviceId").value;
    const status = document.getElementById("status");

//alert(status.value);
    const data = {
        serviceName: serviceName.value.trim(),
        hsnCode: hsnCode.value.trim(),
        rate: rate.value.trim(),
        description: description.value.trim(),
        isActive: status.value
    };
    console.log(JSON.stringify(data));
    const method = id ? "PUT" : "POST";
    const url = id ? `/api/services/${id}` : `/api/services`;

    fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(() => {
        addServiceModal.hide();
        loadServices();
        Swal.fire("Success", "Service saved successfully!", "success");
    });
}

/* ------------------- DELETE ------------------- */
function confirmDelete(id) {
    Swal.fire({
        title: "Delete Service?",
        icon: "warning",
        showCancelButton: true
    }).then(r => {
        if (r.isConfirmed) {
            fetch(`/api/services/${id}`, { method: "DELETE" })
                .then(() => loadServices());
        }
    });
}

/* ------------------- INIT ------------------- */
loadServices();
