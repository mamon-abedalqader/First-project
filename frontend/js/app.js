const API = `http://${window.location.hostname}:3000/api/expenses`;
let allExpenses = [];

document.addEventListener('DOMContentLoaded', fetchExpenses);

async function fetchExpenses() {
  showSpinner(true);
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error('Server error');
    allExpenses = await res.json();
    updateSummary(allExpenses);
    renderTable(allExpenses);
    showAlert('', '');
  } catch (err) {
    showAlert('Cannot connect to the server. Make sure it is running.', 'danger');
  } finally {
    showSpinner(false);
  }
}

function renderTable(expenses) {
  const body = document.getElementById('expense-body');
  body.innerHTML = '';

  expenses.forEach(exp => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${exp.title}</td>
      <td>$${parseFloat(exp.amount).toFixed(2)}</td>
      <td><span class="badge badge-${exp.category}">${exp.category}</span></td>
      <td>${exp.date}</td>
      <td>
        <button class="btn btn-sm btn-warning me-1" onclick="openEdit(${exp.id})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteExpense(${exp.id})">Delete</button>
      </td>
    `;
    body.appendChild(tr);
  });

  document.getElementById('expense-table').classList.remove('d-none');
}

function updateSummary(expenses) {
  const amounts = expenses.map(e => parseFloat(e.amount));
  document.getElementById('total').textContent   = '$' + amounts.reduce((a, b) => a + b, 0).toFixed(2);
  document.getElementById('count').textContent   = expenses.length;
  document.getElementById('highest').textContent = '$' + (amounts.length ? Math.max(...amounts).toFixed(2) : '0.00');
}

async function addExpense() {
  const title    = document.getElementById('title').value.trim();
  const amount   = document.getElementById('amount').value;
  const category = document.getElementById('category').value;
  const date     = document.getElementById('date').value;
  const errorEl  = document.getElementById('form-error');

  if (!title)              return showFormError(errorEl, 'Title is required');
  if (!amount || amount <= 0) return showFormError(errorEl, 'Amount must be greater than 0');
  if (!category)           return showFormError(errorEl, 'Please select a category');
  if (!date)               return showFormError(errorEl, 'Date is required');

  errorEl.classList.add('d-none');

  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, amount: parseFloat(amount), category, date })
    });
    const data = await res.json();
    if (!res.ok) return showFormError(errorEl, data.message);

    document.getElementById('title').value    = '';
    document.getElementById('amount').value   = '';
    document.getElementById('category').value = '';
    document.getElementById('date').value     = '';

    await fetchExpenses();
  } catch (err) {
    showFormError(errorEl, 'Cannot connect to the server');
  }
}

async function deleteExpense(id) {
  try {
    const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error();
    await fetchExpenses();
  } catch (err) {
    showAlert('Failed to delete expense', 'danger');
  }
}

function openEdit(id) {
  const exp = allExpenses.find(e => e.id === id);
  if (!exp) return;

  document.getElementById('edit-id').value       = exp.id;
  document.getElementById('edit-title').value    = exp.title;
  document.getElementById('edit-amount').value   = exp.amount;
  document.getElementById('edit-category').value = exp.category;
  document.getElementById('edit-date').value     = exp.date;
  document.getElementById('edit-error').classList.add('d-none');

  new bootstrap.Modal(document.getElementById('editModal')).show();
}

async function saveEdit() {
  const id       = document.getElementById('edit-id').value;
  const title    = document.getElementById('edit-title').value.trim();
  const amount   = document.getElementById('edit-amount').value;
  const category = document.getElementById('edit-category').value;
  const date     = document.getElementById('edit-date').value;
  const errorEl  = document.getElementById('edit-error');

  if (!title)              return showFormError(errorEl, 'Title is required');
  if (!amount || amount <= 0) return showFormError(errorEl, 'Amount must be greater than 0');
  if (!date)               return showFormError(errorEl, 'Date is required');

  errorEl.classList.add('d-none');

  try {
    const res = await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, amount: parseFloat(amount), category, date })
    });
    const data = await res.json();
    if (!res.ok) return showFormError(errorEl, data.message);

    bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
    await fetchExpenses();
  } catch (err) {
    showFormError(errorEl, 'Cannot connect to the server');
  }
}

function filterExpenses() {
  const val = document.getElementById('filter').value;
  renderTable(val === 'All' ? allExpenses : allExpenses.filter(e => e.category === val));
}

function showSpinner(show) {
  document.getElementById('spinner').classList.toggle('d-none', !show);
  if (show) document.getElementById('expense-table').classList.add('d-none');
}

function showAlert(msg, type) {
  const box = document.getElementById('alert-box');
  box.innerHTML = msg ? `<div class="alert alert-${type}">${msg}</div>` : '';
}

function showFormError(el, msg) {
  el.textContent = msg;
  el.classList.remove('d-none');
}