let currentUser = null;
let currentMonth = 'January';

function showSignin() {
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('signin-form').style.display = 'block';
}

function showSignup() {
    document.getElementById('signin-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'block';
}

function signup() {
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;
    if (username && password) {
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        if (users[username]) {
            alert('Username already exists');
            return;
        }
        users[username] = { password };
        localStorage.setItem('users', JSON.stringify(users));
        alert('Account created successfully');
        showSignin();
    } else {
        alert('Please fill in all fields');
    }
}

function signin() {
    const username = document.getElementById('signin-username').value;
    const password = document.getElementById('signin-password').value;
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[username] && users[username].password === password) {
        currentUser = username;
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        loadBudget();
    } else {
        alert('Invalid credentials');
    }
}

function logout() {
    currentUser = null;
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('auth-container').style.display = 'flex';
    document.getElementById('signin-form').style.display = 'block';
    document.getElementById('signup-form').style.display = 'none';
}

function loadBudget() {
    const budgetData = JSON.parse(localStorage.getItem(`budget_${currentUser}`) || '{}');
    const monthData = budgetData[currentMonth] || { expenses: [], income: [], transactions: [] };

    // Load expenses
    const expenseTbody = document.getElementById('budget-body');
    expenseTbody.innerHTML = '';
    monthData.expenses.forEach((category, index) => {
        addCategoryRow(category.category, category.goal, category.actual, index);
    });

    // Load income
    const incomeTbody = document.getElementById('income-body');
    incomeTbody.innerHTML = '';
    monthData.income.forEach((income, index) => {
        addIncomeRow(income.source, income.amount, index);
    });

    // Load transactions
    const transactionTbody = document.getElementById('transactions-body');
    transactionTbody.innerHTML = '';
    monthData.transactions.forEach((transaction, index) => {
        addTransactionRow(transaction.date, transaction.description, transaction.amount, transaction.type, transaction.category, index);
    });

    updateTotals();
}

function addIncome() {
    addIncomeRow('', 0);
}

function addIncomeRow(source = '', amount = 0, index = null) {
    const tbody = document.getElementById('income-body');
    const row = tbody.insertRow(index !== null ? index : tbody.rows.length);
    row.innerHTML = `
        <td><input type="text" value="${source}" onchange="updateIncomeSource(this, ${row.rowIndex - 1})"></td>
        <td><input type="number" value="${amount}" onchange="updateIncomeAmount(this, ${row.rowIndex - 1})"></td>
        <td><button class="delete-btn" onclick="deleteIncome(${row.rowIndex - 1})">Delete</button></td>
    `;
}

function updateIncomeSource(input, index) {
    // Source updated, no calculation needed
}

function updateIncomeAmount(input, index) {
    updateTotals();
}

function deleteIncome(index) {
    const tbody = document.getElementById('income-body');
    tbody.deleteRow(index);
    updateTotals();
}

function addTransaction() {
    const date = new Date().toISOString().split('T')[0]; // Today's date
    addTransactionRow(date, '', 0, 'Expense', '');
}

function addTransactionRow(date = '', description = '', amount = 0, type = 'Expense', category = '', index = null) {
    const tbody = document.getElementById('transactions-body');
    const row = tbody.insertRow(index !== null ? index : tbody.rows.length);
    row.innerHTML = `
        <td><input type="date" value="${date}" onchange="updateTransactionDate(this, ${row.rowIndex - 1})"></td>
        <td><input type="text" value="${description}" onchange="updateTransactionDescription(this, ${row.rowIndex - 1})"></td>
        <td><input type="number" value="${amount}" onchange="updateTransactionAmount(this, ${row.rowIndex - 1})"></td>
        <td>
            <select onchange="updateTransactionType(this, ${row.rowIndex - 1})">
                <option value="Income" ${type === 'Income' ? 'selected' : ''}>Income</option>
                <option value="Expense" ${type === 'Expense' ? 'selected' : ''}>Expense</option>
            </select>
        </td>
        <td><input type="text" value="${category}" onchange="updateTransactionCategory(this, ${row.rowIndex - 1})"></td>
        <td><button class="delete-btn" onclick="deleteTransaction(${row.rowIndex - 1})">Delete</button></td>
    `;
}

function updateTransactionDate(input, index) {
    // Date updated
}

function updateTransactionDescription(input, index) {
    // Description updated
}

function updateTransactionAmount(input, index) {
    // Amount updated
}

function updateTransactionType(select, index) {
    // Type updated
}

function updateTransactionCategory(input, index) {
    // Category updated
}

function deleteTransaction(index) {
    const tbody = document.getElementById('transactions-body');
    tbody.deleteRow(index);
}

function addCategory() {
    addCategoryRow('', 0, 0);
}

function addCategoryRow(category = '', goal = 0, actual = 0, index = null) {
    const tbody = document.getElementById('budget-body');
    const row = tbody.insertRow(index !== null ? index : tbody.rows.length);
    row.innerHTML = `
        <td><input type="text" value="${category}" onchange="updateCategory(this, ${row.rowIndex - 1})"></td>
        <td><input type="number" value="${goal}" onchange="updateGoal(this, ${row.rowIndex - 1})"></td>
        <td>
            <input type="number" value="${actual}" onchange="updateActual(this, ${row.rowIndex - 1})">
            <button class="plus-btn" onclick="addToActual(${row.rowIndex - 1})">+</button>
        </td>
        <td id="difference-${row.rowIndex - 1}">${goal - actual}</td>
        <td><button class="delete-btn" onclick="deleteCategory(${row.rowIndex - 1})">Delete</button></td>
    `;
}

function updateCategory(input, index) {
    // Category name updated, no calculation needed
}

function updateGoal(input, index) {
    const goal = parseFloat(input.value) || 0;
    const actual = parseFloat(document.querySelector(`#budget-body tr:nth-child(${index + 1}) td:nth-child(3) input`).value) || 0;
    document.getElementById(`difference-${index}`).textContent = goal - actual;
    updateTotals();
}

function updateActual(input, index) {
    const actual = parseFloat(input.value) || 0;
    const goal = parseFloat(document.querySelector(`#budget-body tr:nth-child(${index + 1}) td:nth-child(2) input`).value) || 0;
    document.getElementById(`difference-${index}`).textContent = goal - actual;
    updateTotals();
}

let promptCallback = null;

function addToActual(index) {
    showCustomPrompt('Enter amount to add:', function(value) {
        const input = document.querySelector(`#budget-body tr:nth-child(${index + 1}) td:nth-child(3) input`);
        const currentValue = parseFloat(input.value) || 0;
        const addAmount = parseFloat(value) || 0;
        input.value = currentValue + addAmount;
        updateActual(input, index);
    });
}

function showCustomPrompt(message, callback) {
    document.getElementById('prompt-message').textContent = message;
    document.getElementById('prompt-input').value = '';
    document.getElementById('custom-prompt').style.display = 'flex';
    promptCallback = callback;
}

function confirmPrompt() {
    const value = document.getElementById('prompt-input').value;
    document.getElementById('custom-prompt').style.display = 'none';
    if (promptCallback) {
        promptCallback(value);
        promptCallback = null;
    }
}

function cancelPrompt() {
    document.getElementById('custom-prompt').style.display = 'none';
    promptCallback = null;
}

function deleteCategory(index) {
    const tbody = document.getElementById('budget-body');
    tbody.deleteRow(index);
    updateTotals();
}

function updateTotals() {
    // Update income total
    const incomeRows = document.querySelectorAll('#income-body tr');
    let totalIncome = 0;
    incomeRows.forEach(row => {
        const amount = parseFloat(row.cells[1].querySelector('input').value) || 0;
        totalIncome += amount;
    });
    document.getElementById('total-income').textContent = totalIncome.toFixed(2);

    // Update expense totals
    const expenseRows = document.querySelectorAll('#budget-body tr');
    let totalGoal = 0;
    let totalActual = 0;
    expenseRows.forEach(row => {
        const goal = parseFloat(row.cells[1].querySelector('input').value) || 0;
        const actual = parseFloat(row.cells[2].querySelector('input').value) || 0;
        totalGoal += goal;
        totalActual += actual;
    });
    document.getElementById('total-goal').textContent = totalGoal.toFixed(2);
    document.getElementById('total-actual').textContent = totalActual.toFixed(2);
    document.getElementById('total-difference').textContent = (totalGoal - totalActual).toFixed(2);

    // Update net amount
    const net = totalIncome - totalActual;
    document.getElementById('net-amount').textContent = net.toFixed(2);

    // Calculate savings: Income - Expenses (actual)
    const savings = totalIncome - totalActual;
    document.getElementById('savings-amount').textContent = savings.toFixed(2);
}

function saveChanges() {
    const budgetData = JSON.parse(localStorage.getItem(`budget_${currentUser}`) || '{}');
    const monthData = { expenses: [], income: [], transactions: [] };

    // Save expenses
    const expenseRows = document.querySelectorAll('#budget-body tr');
    expenseRows.forEach(row => {
        const category = row.cells[0].querySelector('input').value;
        const goal = parseFloat(row.cells[1].querySelector('input').value) || 0;
        const actual = parseFloat(row.cells[2].querySelector('input').value) || 0;
        if (category.trim()) {
            monthData.expenses.push({ category, goal, actual });
        }
    });

    // Save income
    const incomeRows = document.querySelectorAll('#income-body tr');
    incomeRows.forEach(row => {
        const source = row.cells[0].querySelector('input').value;
        const amount = parseFloat(row.cells[1].querySelector('input').value) || 0;
        if (source.trim()) {
            monthData.income.push({ source, amount });
        }
    });

    // Save transactions
    const transactionRows = document.querySelectorAll('#transactions-body tr');
    transactionRows.forEach(row => {
        const date = row.cells[0].querySelector('input').value;
        const description = row.cells[1].querySelector('input').value;
        const amount = parseFloat(row.cells[2].querySelector('input').value) || 0;
        const type = row.cells[3].querySelector('select').value;
        const category = row.cells[4].querySelector('input').value;
        if (description.trim() || amount > 0) {
            monthData.transactions.push({ date, description, amount, type, category });
        }
    });

    budgetData[currentMonth] = monthData;
    localStorage.setItem(`budget_${currentUser}`, JSON.stringify(budgetData));
    alert('Changes saved successfully');
}



// Load current month on change
document.getElementById('month-select').addEventListener('change', function() {
    currentMonth = this.value;
    loadBudget();
});

// Initialize with current month
document.addEventListener('DOMContentLoaded', function() {
    currentMonth = document.getElementById('month-select').value;
});
