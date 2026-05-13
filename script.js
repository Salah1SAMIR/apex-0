let isDark = true;
let charts = {};
let globalEmployees = [];
let globalInvoices = [];
let globalProducts = [];



function navTo(page, el) {
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  if(el) el.classList.add('active');
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const pg = document.getElementById('page-' + page);
  if(pg) pg.classList.add('active');
  if(page === 'dashboard') setTimeout(initCharts, 50);
  document.getElementById('notifPanel').classList.remove('open');
}

function toggleSidebar() {
  if (window.innerWidth <= 900) {
    document.getElementById('sidebar').classList.toggle('mobile-open');
    document.getElementById('sidebarBackdrop').classList.toggle('active');
  } else {
    document.getElementById('sidebar').classList.toggle('collapsed');
  }
}

function toggleTheme() {
  isDark = !isDark;
  document.documentElement.setAttribute('data-theme', isDark ? '' : 'light');
  document.getElementById('themeIcon').className = isDark ? 'fas fa-moon' : 'fas fa-sun';
  
  const settingToggle = document.getElementById('settingThemeToggle');
  if(settingToggle) {
    if(isDark) settingToggle.classList.add('on');
    else settingToggle.classList.remove('on');
  }
  
  setTimeout(initCharts, 100);
}

function toggleNotif() {
  document.getElementById('notifPanel').classList.toggle('open');
}

document.addEventListener('click', function(e) {
  const p = document.getElementById('notifPanel');
  if(!e.target.closest('.tb-btn') && !e.target.closest('.notif-panel')) p.classList.remove('open');
});

document.querySelectorAll('.section-tabs').forEach(tabs => {
  tabs.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // Inline onclicks will handle the logic, but for generic tabs without inline onclicks,
      // we can do basic active toggling here if we want. But since we are wiring everything
      // with switchTab, we can actually just let switchTab handle everything.
      // We will keep this empty or just active toggle for fallback.
      tabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
});

// Generic Tab Switching Logic
function switchTab(groupClass, tabId, btnElement) {
  // Update active state on buttons in the closest container
  const tabsContainer = btnElement.parentElement;
  if(tabsContainer) {
    tabsContainer.querySelectorAll(btnElement.tagName).forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');
  }
  
  // Hide all contents in this group
  document.querySelectorAll('.' + groupClass).forEach(content => {
    content.style.display = 'none';
  });
  
  // Show selected tab content
  const selectedTab = document.getElementById(tabId);
  if (selectedTab) {
    selectedTab.style.display = 'block';
  }
}

function initCharts() {
  const dark = isDark;
  const gridColor = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const textColor = dark ? '#8b90a7' : '#5a6080';
  Chart.defaults.font.family = "'IBM Plex Sans Arabic', sans-serif";

  if(charts.revenue) { charts.revenue.destroy(); charts.revenue = null; }
  if(charts.donut) { charts.donut.destroy(); charts.donut = null; }

  const rc = document.getElementById('revenueChart');
  const dc = document.getElementById('donutChart');
  if(!rc || !dc) return;

  charts.revenue = new Chart(rc, {
    type: 'bar',
    data: {
      labels: ['سبتمبر','أكتوبر','نوفمبر','ديسمبر','يناير','فبراير','مارس','أبريل'],
      datasets: [
        { label: 'الإيرادات', data: [180,220,195,310,245,280,320,410], backgroundColor: 'rgba(79,124,255,0.75)', borderRadius: 6, borderSkipped: false },
        { label: 'المصروفات', data: [90,105,88,140,118,130,145,180], backgroundColor: 'rgba(167,139,250,0.55)', borderRadius: 6, borderSkipped: false }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: textColor, font:{size:12}, usePointStyle:true } } },
      scales: {
        x: { grid:{color:gridColor}, ticks:{color:textColor} },
        y: { grid:{color:gridColor}, ticks:{color:textColor, callback: v => v+'K'} }
      }
    }
  });

  charts.donut = new Chart(dc, {
    type: 'doughnut',
    data: {
      labels: ['إلكترونيات','ملحقات','مكتبية','هواتف'],
      datasets: [{ data:[42,28,18,12], backgroundColor:['#4f7cff','#22d3a0','#ffaa30','#a78bfa'], borderWidth:0, hoverOffset:8 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '68%',
      plugins: { legend: { position:'bottom', labels:{ color:textColor, font:{size:12}, usePointStyle:true, padding:12 } } }
    }
  });
}

// --- API Integration ---
// --- Smart Demo Mode Configuration ---
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
let useMock = !isLocal; 

const MOCK_DATA = {
  employees: [
    {id:1, name:'م. صلاح سمير', role:'مدير النظام · تقنية المعلومات', salary:22000, attendance:98, initials:'SS', color1:'#4f7cff', color2:'#a78bfa'},
    {id:2, name:'أحمد محمود', role:'مطور برمجيات · تقنية المعلومات', salary:18500, attendance:95, initials:'AM', color1:'#22d3a0', color2:'#4f7cff'},
    {id:3, name:'سارة محمد', role:'أخصائية تسويق · التسويق', salary:12500, attendance:92, initials:'SM', color1:'#ff4f6a', color2:'#a78bfa'}
  ],
  invoices: [
    {id:'INV-0245', client:'شركة جرير للتسويق', issue_date:'10 مايو 2026', due_date:'25 مايو 2026', amount:125000, status:'pending', payment_method:'تحويل بنكي'},
    {id:'INV-0244', client:'مجموعة العليان', issue_date:'9 مايو 2026', due_date:'20 مايو 2026', amount:84000, status:'success', payment_method:'فيزا'}
  ],
  products: [
    {id:1, name:'آيفون 15 برو ماكس', category:'هواتف ذكية', quantity:25, min_quantity:5, price:5499, status:'success'},
    {id:2, name:'سامسونج جالكسي S24 ألترا', category:'هواتف ذكية', quantity:18, min_quantity:5, price:4899, status:'success'},
    {id:3, name:'ماك بوك برو M3 شاشة 14"', category:'حواسيب محمولة', quantity:12, min_quantity:3, price:8200, status:'success'},
    {id:4, name:'شاحن متنقل أنكر 737', category:'ملحقات', quantity:80, min_quantity:20, price:550, status:'success'}
  ],
  orders: [
    {id:'#ORD-4825', client:'مكتبة جرير', items_count:45, amount:185000, status:'success', date:'10 مايو'}
  ],
  expenses: [
    {id:1, description:'إيجار المقر الرئيسي', category:'تشغيلية', amount:25000, date:'1 مايو 2026'}
  ],
  customers: [
    {id:1, name:'شركة النور المحدودة', email:'info@alnoor.sa', phone:'0501234567', total_orders:12, total_spent:45000, status:'active'},
    {id:2, name:'مؤسسة البيان التجارية', email:'contact@albayan.com', phone:'0559876543', total_orders:8, total_spent:22400, status:'active'}
  ],
  leaves: []
};

// Helper to handle API calls with Demo Fallback
async function apiCall(action, method = 'GET', body = null) {
  if (useMock) {
    const getStorage = (key) => JSON.parse(localStorage.getItem('apex_' + key)) || MOCK_DATA[key];
    const setStorage = (key, data) => localStorage.setItem('apex_' + key, JSON.stringify(data));

    return new Promise((resolve) => {
      setTimeout(() => {
        if (action === 'employees' || action === 'get_employees') resolve(getStorage('employees'));
        else if (action === 'products' || action === 'get_products') resolve(getStorage('products'));
        else if (action === 'customers' || action === 'get_customers') resolve(getStorage('customers'));
        else if (action === 'invoices' || action === 'get_invoices') resolve(getStorage('invoices'));
        else if (action === 'expenses' || action === 'get_expenses') resolve(getStorage('expenses'));
        else if (action === 'orders' || action === 'get_orders') resolve(getStorage('orders'));
        
        else if (action === 'add_employee') {
          const emps = getStorage('employees');
          const newId = Math.floor(Math.random() * 1000);
          const newEmp = { ...body, id: newId, initials: body.name.substring(0,2).toUpperCase() };
          emps.push(newEmp);
          setStorage('employees', emps);
          resolve({ success: true, id: newId });
        }
        else if (action === 'delete_employee') {
          let emps = getStorage('employees');
          emps = emps.filter(e => e.id != body.id);
          setStorage('employees', emps);
          resolve({ success: true });
        }
        else if (action === 'add_product') {
          const items = getStorage('products');
          const newItem = { ...body, id: Date.now() };
          items.push(newItem);
          setStorage('products', items);
          resolve({ success: true });
        }
        else if (action === 'add_customer') {
          const items = getStorage('customers');
          const newItem = { ...body, id: Date.now() };
          items.push(newItem);
          setStorage('customers', items);
          resolve({ success: true });
        }
        else if (action === 'add_invoice') {
          const items = getStorage('invoices');
          items.unshift(body); // Use body directly as we generate ID in submit
          setStorage('invoices', items);
          resolve({ success: true });
        }
        else if (action === 'add_order') {
          let prods = getStorage('products');
          if(body.product_id) {
            const p = prods.find(x => x.id == body.product_id);
            if(p) p.quantity -= body.items_count;
            setStorage('products', prods);
          }
          const orders = getStorage('orders');
          orders.unshift(body);
          setStorage('orders', orders);
          resolve({ success: true });
        }
        else resolve({ success: true });
      }, 400);
    });
  }

  try {
    const options = { method };
    if (body) {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = JSON.stringify(body);
    }
    const res = await fetch(`api/index.php?action=${action}`, options);
    if (!res.ok) throw new Error('Offline');
    return await res.json();
  } catch (err) {
    console.warn('API Error, switching to Persistent Demo Mode');
    useMock = true;
    return apiCall(action, method, body);
  }
}

// Customer Modal Functions
function openAddCustomerModal() { document.getElementById('addCustomerModalOverlay').classList.add('active'); }
function closeAddCustomerModal() { document.getElementById('addCustomerModalOverlay').classList.remove('active'); }
async function submitAddCustomer() {
  const name = document.getElementById('newCustName').value;
  const email = document.getElementById('newCustEmail').value;
  const phone = document.getElementById('newCustPhone').value;
  const total_orders = document.getElementById('newCustOrders').value;
  const total_spent = document.getElementById('newCustSpent').value;
  
  if(!name || !email) return alert('أكمل البيانات المطلوبة');
  
  await apiCall('add_customer', 'POST', { name, email, phone, total_orders, total_spent, status: 'active' });
  closeAddCustomerModal();
  fetchCustomers();
  setTimeout(updateDashboardStats, 100);
}

async function deleteEmployee(id) {
  if(!confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;
  try {
    const result = await apiCall('delete_employee', 'POST', { id });
    if(result.success) {
      fetchEmployees();
    }
  } catch (e) {
    console.error(e);
  }
}

function updateDashboardStats() {
  // Update Total Employees
  const empEl = document.getElementById('dashTotalEmployees');
  if(empEl) empEl.textContent = globalEmployees.length;

  // Update Stock Value
  const stockEl = document.getElementById('dashStockValue');
  if(stockEl) {
    const totalVal = globalProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    stockEl.textContent = (totalVal / 1000).toFixed(1) + 'K';
  }

  // Update Total Revenue
  const revEl = document.getElementById('dashTotalRevenue');
  if(revEl) {
    const totalRev = globalInvoices.reduce((sum, inv) => inv.status === 'success' ? sum + parseFloat(inv.amount) : sum, 0);
    revEl.textContent = (totalRev / 1000000).toFixed(1) + 'M';
  }
}

async function fetchEmployees() {
  try {
    const employees = await apiCall('employees');
    globalEmployees = employees;
    updateDashboardStats();
    const grid = document.getElementById('employeesGrid');
    const settingsTable = document.getElementById('settingsUsersTableBody');
    
    // Clear Grid
    const cards = grid.querySelectorAll('.emp-card:not(.add-emp-btn)');
    cards.forEach(c => c.remove());
    
    // Clear Settings Table
    if(settingsTable) settingsTable.innerHTML = '';
    
    employees.forEach(emp => {
      // Grid Card
      const card = document.createElement('div');
      card.className = 'emp-card';
      card.innerHTML = `
        <div class="emp-avatar" style="background:linear-gradient(135deg,${emp.color1},${emp.color2})">${emp.initials}</div>
        <div class="emp-name">${emp.name}</div>
        <div class="emp-role">${emp.role}</div>
        <div class="emp-stats">
          <div class="emp-stat"><div class="emp-stat-val">${emp.attendance}%</div><div class="emp-stat-lbl">الحضور</div></div>
          <div class="emp-stat"><div class="emp-stat-val">${parseInt(emp.salary).toLocaleString('en-US')}</div><div class="emp-stat-lbl">الراتب</div></div>
        </div>
        <div class="emp-actions">
          <button class="btn-delete" onclick="deleteEmployee(${emp.id})"><i class="fas fa-trash"></i></button>
        </div>
      `;
      grid.insertBefore(card, grid.lastElementChild);

      // Settings Table Row
      if(settingsTable) {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td><div style="display:flex;align-items:center;gap:8px">
            <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,${emp.color1},${emp.color2});display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:700">${emp.initials}</div>
            <div><div class="td-name">${emp.name}</div><div style="font-size:11px;color:var(--text-muted)">${emp.role}</div></div>
          </div></td>
          <td><span class="td-badge info">${emp.role.includes('مدير') ? 'مدير نظام' : 'مستخدم'}</span></td>
          <td>12 مايو 2026</td>
          <td><span class="td-badge success">نشط</span></td>
        `;
        settingsTable.appendChild(row);
      }
    });
    
    renderAttendance();
    renderLeaves();
    renderSalaries();
    
    // Populate employee dropdown for leaves
    const leaveEmpSelect = document.getElementById('newLeaveEmp');
    if(leaveEmpSelect) {
      leaveEmpSelect.innerHTML = '';
      globalEmployees.forEach(emp => {
        const opt = document.createElement('option');
        opt.value = emp.name;
        opt.textContent = emp.name;
        leaveEmpSelect.appendChild(opt);
      });
    }
  } catch (err) {
    console.error('Error fetching employees:', err);
  }
}

async function fetchInvoices() {
  try {
    const invoices = await apiCall('invoices');
    globalInvoices = invoices;
    updateDashboardStats();
    const tbody = document.getElementById('invoicesTableBody');
    if(tbody) tbody.innerHTML = '';
    
    const allTbody = document.getElementById('allInvoicesTableBody');
    if(allTbody) allTbody.innerHTML = '';
    
    invoices.forEach(inv => {
      let badgeClass = inv.status;
      let badgeText = inv.status === 'success' ? 'مدفوعة' : 
                      inv.status === 'info' ? 'مرسلة' : 
                      inv.status === 'pending' ? 'معلق' : 'ملغاة';
                      
      let colorStyle = inv.status === 'success' ? 'color:var(--green);font-weight:600' :
                       inv.status === 'cancelled' ? 'color:var(--red);font-weight:600' : 'font-weight:600';
                       
      const tr = document.createElement('tr');
      tr.style.cursor = 'pointer';
      tr.innerHTML = `
        <td class="td-name">${inv.id}</td>
        <td>${inv.client}</td>
        <td>${inv.issue_date}</td>
        <td>${inv.due_date}</td>
        <td style="${colorStyle}">${parseInt(inv.amount).toLocaleString('en-US')} ر.س</td>
        <td><span class="td-badge ${badgeClass}">${badgeText}</span></td>
      `;
      
      tr.addEventListener('click', function() {
        openInvoiceModal(inv.id, inv.client, inv.issue_date, inv.due_date, inv.amount, `<span class="td-badge ${badgeClass}">${badgeText}</span>`, inv.payment_method);
      });
      
      if(tbody) tbody.appendChild(tr);
      
      // Clone for the all invoices tab
      if(allTbody) {
        const trClone = tr.cloneNode(true);
        trClone.addEventListener('click', function() {
          openInvoiceModal(inv.id, inv.client, inv.issue_date, inv.due_date, inv.amount, `<span class="td-badge ${badgeClass}">${badgeText}</span>`, inv.payment_method);
        });
        allTbody.appendChild(trClone);
      }
    });
    
    // Update P&L whenever invoices are fetched to reflect new revenues
    updatePandLNumbers();
  } catch (err) {
    console.error('Error fetching invoices:', err);
  }
}

// Invoice Modal Logic
function openInvoiceModal(id, client, date, dueDate, amount, statusHtml) {
  document.getElementById('modalInvoiceId').textContent = id;
  document.getElementById('modalInvoiceStatus').innerHTML = statusHtml;
  document.getElementById('modalClientName').textContent = client;
  document.getElementById('modalDate').textContent = date;
  document.getElementById('modalDueDate').textContent = dueDate;
  document.getElementById('modalPaymentMethod').textContent = arguments[6] || 'غير محدد';
  document.getElementById('modalTotalAmount').textContent = amount.toLocaleString('en-US') + ' ر.س';
  
  const totalNum = parseFloat(amount);
  if(!isNaN(totalNum)) {
     const subtotal = totalNum / 1.15;
     const tax = totalNum - subtotal;
     document.getElementById('modalSubtotal').textContent = subtotal.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2}) + ' ر.س';
     document.getElementById('modalTax').textContent = tax.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2}) + ' ر.س';
  }
  
  let itemsHtml = `
    <tr><td>تطوير وتصميم واجهات النظام</td><td>1</td><td>${(totalNum * 0.6).toLocaleString('en-US')} ر.س</td><td>${(totalNum * 0.6).toLocaleString('en-US')} ر.س</td></tr>
    <tr><td>استضافة ودعم فني سنوي</td><td>1</td><td>${(totalNum * 0.4).toLocaleString('en-US')} ر.س</td><td>${(totalNum * 0.4).toLocaleString('en-US')} ر.س</td></tr>
  `;
  document.getElementById('modalInvoiceItems').innerHTML = itemsHtml;
  
  document.getElementById('btnMarkPaid').onclick = () => markInvoicePaid(id);
  document.getElementById('invoiceModalOverlay').classList.add('active');
}


// Removed the old setTimeOut for hardcoded table events since they are generated dynamically now.

function closeInvoiceModal() {
  document.getElementById('invoiceModalOverlay').classList.remove('active');
}

function printInvoice() {
  window.print();
}

function downloadInvoice() {
  alert('جاري إنشاء وتحميل الفاتورة بصيغة PDF...');
}

async function markInvoicePaid(id) {
  try {
    const result = await apiCall('mark_invoice_paid', 'POST', { id: id });
    if(result.success) {
      document.getElementById('modalInvoiceStatus').innerHTML = '<span class="td-badge success">مدفوعة</span>';
      fetchInvoices(); // Refresh table
    }
  } catch (e) {
    console.error(e);
  }
}


// --- Add Employee Modal Logic ---
function openAddEmployeeModal() {
  document.getElementById('newEmpName').value = '';
  document.getElementById('newEmpRole').value = '';
  document.getElementById('newEmpSalary').value = '';
  document.getElementById('newEmpAttendance').value = '100';
  document.getElementById('addEmployeeModalOverlay').classList.add('active');
}

function closeAddEmployeeModal() {
  document.getElementById('addEmployeeModalOverlay').classList.remove('active');
}

async function submitAddEmployee() {
  const name = document.getElementById('newEmpName').value;
  const role = document.getElementById('newEmpRole').value;
  const salary = document.getElementById('newEmpSalary').value;
  const attendance = document.getElementById('newEmpAttendance').value;
  
  if(!name || !role || !salary) {
    alert('الرجاء إدخال جميع البيانات المطلوبة');
    return;
  }
  
  const parts = name.split(' ');
  let initials = parts[0].charAt(0);
  if(parts.length > 1) {
    initials += parts[1].charAt(0);
  } else {
    initials += parts[0].length > 1 ? parts[0].charAt(1) : '';
  }
  initials = initials.toUpperCase();
  
  const colors = ['#4f7cff', '#a78bfa', '#22d3a0', '#ffaa30', '#ff4f6a'];
  const c1 = colors[Math.floor(Math.random()*colors.length)];
  let c2 = colors[Math.floor(Math.random()*colors.length)];
  while(c1 === c2) c2 = colors[Math.floor(Math.random()*colors.length)];
  
  try {
    const result = await apiCall('add_employee', 'POST', {
        name, role, salary, attendance, initials, color1: c1, color2: c2
    });
    
    if(result.success) {
      closeAddEmployeeModal();
      fetchEmployees(); // Refresh the grid
    }
  } catch (err) {
    console.error('Error adding employee:', err);
  }
}

// --- HR Tabs Logic ---
function switchHrTab(tabId, btnElement) {
  // Update buttons
  const tabsContainer = btnElement.closest('.section-tabs');
  tabsContainer.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  btnElement.classList.add('active');
  
  // Hide all HR tab contents
  document.querySelectorAll('.hr-tab-content').forEach(content => {
    content.style.display = 'none';
  });
  
  // Show selected tab content
  const selectedTab = document.getElementById(tabId);
  if (selectedTab) {
    selectedTab.style.display = tabId === 'emp-grid' ? 'grid' : 'block';
  }
}

// --- New Features Logic ---

function renderAttendance() {
  const tbody = document.getElementById('attendanceTableBody');
  if(!tbody) return;
  tbody.innerHTML = '';
  
  globalEmployees.forEach(emp => {
    // Generate realistic random times based on attendance %
    const isLate = Math.random() * 100 > parseInt(emp.attendance);
    const inTime = isLate ? '09:' + Math.floor(Math.random()*45+15) + ' AM' : '08:' + Math.floor(Math.random()*45+10) + ' AM';
    const outTime = '05:' + Math.floor(Math.random()*30) + ' PM';
    
    const statusClass = isLate ? 'pending' : 'success';
    const statusText = isLate ? 'تأخير' : 'حاضر';
    const rowColor = isLate ? 'color:var(--amber);font-weight:600;' : 'color:var(--green);font-weight:600;';
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="td-name"><div style="display:flex;align-items:center;gap:8px;"><div class="emp-avatar" style="width:28px;height:28px;font-size:11px;background:linear-gradient(135deg,${emp.color1},${emp.color2})">${emp.initials}</div>${emp.name}</div></td>
      <td>${emp.role.split('·')[1] || emp.role}</td>
      <td style="${rowColor}">${inTime}</td>
      <td>${outTime}</td>
      <td><span class="td-badge ${statusClass}">${statusText}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function renderLeaves() {
  const tbody = document.getElementById('leavesTableBody');
  if(!tbody) return;
  tbody.innerHTML = '';
  
  globalEmployees.forEach(emp => {
    const totalLeaves = 30; // 30 days default
    const availableLeaves = Math.round(totalLeaves * (parseInt(emp.attendance) / 100));
    
    let statusClass = 'success';
    let statusText = 'متاح للتقديم';
    if(availableLeaves < 10) {
      statusClass = 'cancelled';
      statusText = 'رصيد منخفض';
    }
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="td-name">${emp.name}</td>
      <td>${emp.attendance}%</td>
      <td>${totalLeaves}</td>
      <td style="font-weight:600">${availableLeaves}</td>
      <td><span class="td-badge ${statusClass}">${statusText}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

let globalExpenses = [];
async function fetchPandL() {
  try {
    const expenses = await apiCall('expenses');
    globalExpenses = expenses;
    
    const tbody = document.getElementById('plExpensesTableBody');
    if(tbody) {
      tbody.innerHTML = '';
      expenses.forEach(exp => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="td-name">${exp.description}</td>
          <td><span class="td-badge info">${exp.category}</span></td>
          <td>${exp.date}</td>
          <td style="color:var(--red);font-weight:600">${parseInt(exp.amount).toLocaleString('en-US')} ر.س</td>
        `;
        tbody.appendChild(tr);
      });
    }
    updatePandLNumbers();
  } catch (err) {
    console.error('Error fetching expenses:', err);
  }
}

function updatePandLNumbers() {
  let totalRevenue = 0;
  globalInvoices.forEach(inv => {
    if(inv.status === 'success') {
      totalRevenue += parseInt(inv.amount);
    }
  });
  
  let totalExpenses = 0;
  globalExpenses.forEach(exp => {
    totalExpenses += parseInt(exp.amount);
  });
  
  const net = totalRevenue - totalExpenses;
  
  const elRev = document.getElementById('plRevenue');
  const elExp = document.getElementById('plExpenses');
  const elNet = document.getElementById('plNet');
  
  if(elRev) elRev.textContent = totalRevenue.toLocaleString('en-US');
  if(elExp) elExp.textContent = totalExpenses.toLocaleString('en-US');
  if(elNet) elNet.textContent = net.toLocaleString('en-US');
}

// --- Dynamic Tables & Modals Logic ---

async function fetchProducts() {
  try {
    const products = await apiCall('products');
    globalProducts = products;
    updateDashboardStats();
    const tbody = document.getElementById('productsTableBody');
    if(tbody) {
      tbody.innerHTML = '';
      products.forEach(p => {
        let badge = p.status === 'success' ? 'success' : p.status === 'pending' ? 'pending' : 'cancelled';
        let statusText = p.status === 'success' ? 'متوفر' : p.status === 'pending' ? 'تحذير' : 'منخفض';
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="td-name">${p.name}</td>
          <td>${p.category}</td>
          <td>${p.quantity}</td>
          <td>${p.min_quantity}</td>
          <td style="font-weight:600">${parseInt(p.price).toLocaleString('en-US')} ر.س</td>
          <td><span class="td-badge ${badge}">${statusText}</span></td>
        `;
        tbody.appendChild(tr);
      });
    }
    renderSalesProducts(products);
  } catch (err) { console.error(err); }
}

function renderSalesProducts(products) {
  const tbody = document.getElementById('salesProductsTableBody');
  if(!tbody) return;
  tbody.innerHTML = '';
  products.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="td-name">${p.name}</td>
      <td>${p.category}</td>
      <td style="font-weight:600">${parseInt(p.price).toLocaleString('en-US')} ر.س</td>
      <td>${p.quantity}</td>
      <td><span class="td-badge ${p.status === 'success' ? 'success' : 'pending'}">${p.status === 'success' ? 'متوفر' : 'منخفض'}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

async function fetchCustomers() {
  try {
    const customers = await apiCall('customers');
    const tbody = document.getElementById('salesCustomersTableBody');
    if(!tbody) return;
    tbody.innerHTML = '';
    
    customers.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="td-name">${c.name}</td>
        <td>${c.email}</td>
        <td>${c.phone}</td>
        <td>${c.total_orders}</td>
        <td style="font-weight:600;color:var(--green)">${parseInt(c.total_spent).toLocaleString('en-US')} ر.س</td>
        <td><span class="td-badge ${c.status === 'active' ? 'success' : 'pending'}">${c.status === 'active' ? 'نشط' : 'غير نشط'}</span></td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) { console.error(err); }
}

async function fetchOrders() {
  try {
    const orders = await apiCall('orders');
    const tbody = document.getElementById('ordersTableBody');
    if(!tbody) return;
    tbody.innerHTML = '';
    
    orders.forEach(o => {
      let badge = o.status;
      let statusText = badge === 'success' ? 'مكتمل' : badge === 'pending' ? 'معلق' : badge === 'info' ? 'قيد المعالجة' : 'ملغي';
      let amtStyle = badge === 'success' ? 'color:var(--green);font-weight:600' : badge === 'cancelled' ? 'color:var(--red);font-weight:600' : 'font-weight:600';
      
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="td-name">${o.id}</td>
        <td>${o.client}</td>
        <td>${o.items_count} منتجات</td>
        <td style="${amtStyle}">${parseInt(o.amount).toLocaleString('en-US')} ر.س</td>
        <td><span class="td-badge ${badge}">${statusText}</span></td>
        <td>${o.date}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) { console.error(err); }
}

function renderSalaries() {
  const tbody = document.getElementById('salariesTableBody');
  if(!tbody) return;
  tbody.innerHTML = '';
  
  globalEmployees.forEach(emp => {
    const base = parseInt(emp.salary);
    const att = parseInt(emp.attendance);
    const deduction = att < 100 ? base * ((100 - att)/100) : 0;
    const net = base - deduction;
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="td-name">${emp.name}</td>
      <td style="font-weight:600">${base.toLocaleString('en-US')} ر.س</td>
      <td style="color:var(--red)">${deduction > 0 ? '-' + deduction.toLocaleString('en-US') + ' ر.س' : 'لا يوجد'}</td>
      <td style="color:var(--green);font-weight:600">${net.toLocaleString('en-US')} ر.س</td>
      <td><span class="td-badge success">معتمد</span></td>
    `;
    tbody.appendChild(tr);
  });
}

// Invoice Form
function openAddInvoiceModal() { document.getElementById('addInvoiceModalOverlay').classList.add('active'); }
function closeAddInvoiceModal() { document.getElementById('addInvoiceModalOverlay').classList.remove('active'); }
async function submitAddInvoice() {
  const client = document.getElementById('newInvClient').value;
  const amount = document.getElementById('newInvAmount').value;
  const dueDate = document.getElementById('newInvDueDate').value;
  const status = document.getElementById('newInvStatus').value;
  const paymentMethod = document.getElementById('newInvPaymentMethod').value;
  if(!client || !amount || !dueDate) return alert('أكمل البيانات');
  
  const id = 'INV-0' + Math.floor(Math.random()*1000+250);
  
  // Format date like '10 مايو 2026'
  const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  const now = new Date();
  const date = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  
  // Format due date safely
  let dd = new Date(dueDate);
  if (isNaN(dd.getTime())) {
    dd = new Date();
    dd.setDate(dd.getDate() + 30); // Default 30 days if invalid
  }
  const formattedDueDate = `${dd.getDate()} ${months[dd.getMonth()]} ${dd.getFullYear()}`;
  
  await apiCall('add_invoice', 'POST', {id, client, issue_date: date, due_date: formattedDueDate, amount: parseInt(amount), status, payment_method: paymentMethod});
  closeAddInvoiceModal();
  fetchInvoices();
  setTimeout(updateDashboardStats, 100); // Force dashboard update
}

// Product Form
function openAddProductModal() { document.getElementById('addProductModalOverlay').classList.add('active'); }
function closeAddProductModal() { document.getElementById('addProductModalOverlay').classList.remove('active'); }
async function submitAddProduct() {
  const name = document.getElementById('newProdName').value;
  const category = document.getElementById('newProdCategory').value;
  const price = document.getElementById('newProdPrice').value;
  const qty = document.getElementById('newProdQty').value;
  const minQty = document.getElementById('newProdMinQty').value;
  if(!name || !price || !qty) return alert('أكمل البيانات');
  
  const status = parseInt(qty) > parseInt(minQty) ? 'success' : 'cancelled';
  
  await apiCall('add_product', 'POST', {name, category, quantity: qty, min_quantity: minQty, price, status});
  closeAddProductModal();
  fetchProducts();
  setTimeout(updateDashboardStats, 100);
}

// Order Form
async function openAddOrderModal() { 
  document.getElementById('addOrderModalOverlay').classList.add('active'); 
  const select = document.getElementById('newOrdProduct');
  if (select) {
    select.innerHTML = '<option value="">اختر منتجاً...</option>';
    const products = await apiCall('products');
    globalProducts = products;
    products.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.name} (المتوفر: ${p.quantity})`;
      select.appendChild(opt);
    });
  }
}
function closeAddOrderModal() { document.getElementById('addOrderModalOverlay').classList.remove('active'); }
async function submitAddOrder() {
  const client = document.getElementById('newOrdClient').value;
  const product_id = document.getElementById('newOrdProduct').value;
  const items_count = document.getElementById('newOrdItems').value;
  const amount = document.getElementById('newOrdAmount').value;
  if(!client || !amount || !product_id) return alert('أكمل البيانات');
  
  const id = '#ORD-' + Math.floor(Math.random()*1000+4825);
  const date = new Date().toLocaleDateString('ar-SA', {month:'long', day:'numeric'});
  
  await apiCall('add_order', 'POST', {id, client, product_id, items_count: parseInt(items_count), amount: parseInt(amount), status:'pending', date});
  closeAddOrderModal();
  fetchOrders();
  fetchProducts(); // Refresh inventory to see stock reduction
}

// Expense Form
function openAddExpenseModal() { document.getElementById('addExpenseModalOverlay').classList.add('active'); }
function closeAddExpenseModal() { document.getElementById('addExpenseModalOverlay').classList.remove('active'); }
async function submitAddExpense() {
  const description = document.getElementById('newExpDesc').value;
  const amount = document.getElementById('newExpAmount').value;
  const category = document.getElementById('newExpCategory').value;
  if(!description || !amount) return alert('أكمل البيانات');
  
  const date = new Date().toLocaleDateString('ar-SA', {year:'numeric', month:'long', day:'numeric'});
  
  await apiCall('add_expense', 'POST', {description, category, amount, date});
  closeAddExpenseModal();
  fetchPandL();
}

// Leave Form
function openAddLeaveModal() { document.getElementById('addLeaveModalOverlay').classList.add('active'); }
function closeAddLeaveModal() { document.getElementById('addLeaveModalOverlay').classList.remove('active'); }
async function submitAddLeave() {
  const emp_name = document.getElementById('newLeaveEmp').value;
  const days = document.getElementById('newLeaveDays').value;
  if(!emp_name || !days) return alert('أكمل البيانات');
  
  await apiCall('add_leave', 'POST', {emp_name, days});
  closeAddLeaveModal();
  alert('تم تقديم الطلب بنجاح، بانتظار الموافقة.');
}

async function saveSettings() {
  const btn = event.currentTarget;
  const originalText = btn.innerHTML;
  
  // UI Feedback
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
  btn.disabled = true;
  
  try {
    const data = {
      name: document.getElementById('setCompanyName').value,
      reg: document.getElementById('setRegNumber').value,
      email: document.getElementById('setCompanyEmail').value,
      phone: document.getElementById('setCompanyPhone').value,
      address: document.getElementById('setCompanyAddress').value
    };
    
    const result = await apiCall('update_settings', 'POST', data);
    
    if(result.success) {
      setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-check"></i> تم الحفظ بنجاح';
        btn.style.background = 'var(--green)';
        
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.background = '';
          btn.disabled = false;
        }, 2000);
      }, 800);
    }
  } catch (err) {
    console.error(err);
    btn.innerHTML = 'خطأ في الحفظ';
    btn.disabled = false;
  }
}

// Start
setTimeout(initCharts, 200); // Wait for DOM to settle
fetchEmployees();
fetchInvoices();
fetchPandL();
fetchProducts();
fetchOrders();
fetchCustomers();
