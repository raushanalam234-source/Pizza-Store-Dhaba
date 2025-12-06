// -----------------------------
// Simple Pizzeria Frontend Demo
// All data stored in localStorage (frontend-only simulation)
// -----------------------------
const LS = {
  ITEMS: 'pizzademo_items',
  USERS: 'pizzademo_users',
  ORDERS: 'pizzademo_orders',
  SESSION: 'pizzademo_session'
};

// ---------- Helper ----------
function uid(prefix='id'){ return prefix + '_' + Math.random().toString(36).slice(2,9); }
function $(s){ return document.querySelector(s); }
function save(key, val){ localStorage.setItem(key, JSON.stringify(val)); }
function load(key, def){ const v = localStorage.getItem(key); return v? JSON.parse(v) : def; }

// ---------- Initial Data (only first time) ----------
function initData(){
  if(!localStorage.getItem(LS.ITEMS)){
    const items = [
      {id:uid('itm'), name:'Margherita', category:'Pizza', price:199, img:'https://i.imgur.com/eTmWoAN.png'},
      {id:uid('itm'), name:'Farmhouse', category:'Pizza', price:299, img:'https://i.imgur.com/o8cd4Rw.png'},
      {id:uid('itm'), name:'Veg Extravaganza', category:'Pizza', price:349, img:'https://i.imgur.com/7QGbJQp.png'},
      {id:uid('itm'), name:'Garlic Bread', category:'Sides', price:99, img:'https://i.imgur.com/4QfKuz1.png'},
      {id:uid('itm'), name:'Coke 500ml', category:'Beverages', price:49, img:'https://i.imgur.com/9H6V5vB.png'}
    ];
    save(LS.ITEMS, items);
  }
  if(!localStorage.getItem(LS.USERS)){
    // create one admin and one demo user
    const users = [
      {id:uid('usr'), name:'Owner Admin', email:'admin@pizza.com', password:'admin123', role:'admin'},
      {id:uid('usr'), name:'Demo User', email:'user@pizza.com', password:'user123', role:'user'}
    ];
    save(LS.USERS, users);
  }
  if(!localStorage.getItem(LS.ORDERS)){
    save(LS.ORDERS, []);
  }
}
initData();

// ---------- Session & Auth (frontend only) ----------
function currentSession(){ return load(LS.SESSION, null); }
function setSession(user){ save(LS.SESSION, user); renderAuthArea(); }
function clearSession(){ localStorage.removeItem(LS.SESSION); renderAuthArea(); }

// ---------- UI render helpers ----------
const app = $('#app');
const cart = { items: [], total: 0 };
function updateCartBadge(){ $('#cart-count').textContent = cart.items.length; }

// ---------- Nav buttons ----------
$('#nav-home').addEventListener('click', ()=>renderHome());
$('#nav-menu').addEventListener('click', ()=>renderMenu());
$('#nav-cart').addEventListener('click', ()=>renderCart());
$('#nav-orders').addEventListener('click', ()=>renderOrders());
$('#nav-admin').addEventListener('click', ()=>renderAdmin());

// ---------- Auth area ----------
function renderAuthArea(){
  const sess = currentSession();
  const area = $('#auth-area');
  if(!area) return;
  if(sess){
    area.innerHTML = `
      <span class="badge">Hi, ${sess.name}</span>
      <button id="logout-btn" style="margin-left:8px">Logout</button>
    `;
    $('#logout-btn').onclick = ()=>{ clearSession(); renderHome(); }
  } else {
    area.innerHTML = `
      <button id="login-btn">Login</button>
      <button id="signup-btn">SignUp</button>
    `;
    $('#login-btn').onclick = ()=>renderLogin();
    $('#signup-btn').onclick = ()=>renderSignup();
  }
}
renderAuthArea();

// ---------- Home ----------
function renderHome(){
  app.innerHTML = `
    <div class="card center">
      <h1>Welcome to Pizza Demo 🍕</h1>
      <p class="small">This is a frontend-only prototype. Admin and User operations are simulated using localStorage.</p>
      <div style="margin-top:14px">
        <button class="btn" id="go-menu">Explore Menu</button>
      </div>
    </div>
    <div style="margin-top:18px" id="highlights" class="grid"></div>
  `;
  $('#go-menu').onclick = ()=>renderMenu();

  // show categories highlights
  const items = load(LS.ITEMS, []);
  const cont = $('#highlights');
  cont.innerHTML = '';
  const cats = [...new Set(items.map(i=>i.category))];
  cats.forEach(cat=>{
    const div = document.createElement('div'); div.className='card center';
    div.innerHTML = `<h3>${cat}</h3><p class="small">Explore delicious ${cat.toLowerCase()}.</p>`;
    cont.appendChild(div);
  });
}
renderHome();

// ---------- Login / Signup ----------
function renderLogin(){
  app.innerHTML = `
    <div class="card form">
      <h2 class="center">Login</h2>
      <input id="li-email" placeholder="Email" />
      <input id="li-pass" placeholder="Password" type="password" />
      <button class="btn" id="li-submit">Login</button>
    </div>
  `;
  $('#li-submit').onclick = ()=>{
    const email = $('#li-email').value.trim(), pass = $('#li-pass').value;
    const users = load(LS.USERS, []);
    const user = users.find(u=>u.email===email && u.password===pass);
    if(user){ setSession(user); alert('Login successful'); renderHome(); }
    else alert('Invalid credentials');
  }
}

function renderSignup(){
  app.innerHTML = `
    <div class="card form">
      <h2 class="center">Sign Up</h2>
      <input id="su-name" placeholder="Full name" />
      <input id="su-email" placeholder="Email" />
      <input id="su-pass" placeholder="Password" type="password" />
      <button class="btn" id="su-submit">Register</button>
    </div>
  `;
  $('#su-submit').onclick = ()=>{
    const name = $('#su-name').value.trim(), email = $('#su-email').value.trim(), pass = $('#su-pass').value;
    if(!name || !email || !pass){ alert('Fill all'); return; }
    const users = load(LS.USERS, []);
    if(users.find(u=>u.email===email)){ alert('Email exists'); return; }
    const newu = {id:uid('usr'), name, email, password:pass, role:'user'};
    users.push(newu); save(LS.USERS, users); setSession(newu); alert('Registered'); renderHome();
  }
}

// ---------- Menu page ----------
function renderMenu(searchText=''){
  const items = load(LS.ITEMS, []);
  app.innerHTML = `
    <div class="card">
      <div style="display:flex;gap:8px;align-items:center">
        <h2 style="margin:0">Menu</h2>
        <input id="search" placeholder="Search items or category..." style="margin-left:12px;padding:8px;border-radius:6px;border:1px solid #ddd;flex:1"/>
        <select id="filter-cat" style="padding:8px;border-radius:6px;border:1px solid #ddd;margin-left:8px">
          <option value="">All Categories</option>
        </select>
      </div>
      <div id="menu-grid" class="grid" style="margin-top:12px"></div>
    </div>
  `;
  const cats = [...new Set(items.map(i=>i.category))];
  const sel = $('#filter-cat');
  cats.forEach(c=>{ const opt = document.createElement('option'); opt.value=c; opt.textContent=c; sel.appendChild(opt); });

  function renderGrid(filterCat, q){
    const grid = $('#menu-grid'); grid.innerHTML = '';
    let list = items.slice();
    if(filterCat) list = list.filter(i=>i.category===filterCat);
    if(q) { const s=q.toLowerCase(); list = list.filter(i=> i.name.toLowerCase().includes(s) || i.category.toLowerCase().includes(s)); }
    list.forEach(it=>{
      const d = document.createElement('div'); d.className='item card';
      d.innerHTML = `
        <img src="${it.img}" alt="${it.name}" />
        <div class="item-title">
          <strong>${it.name}</strong>
          <span>₹${it.price}</span>
        </div>
        <p class="small">${it.category}</p>
        <div style="margin-top:8px; display:flex; gap:8px">
          <button class="btn add-btn">Add</button>
          <button class="btn" style="background:#5d7cff" data-view="${it.id}">View</button>
        </div>
      `;
      d.querySelector('.add-btn').onclick = ()=>{ addToCart(it); };
      d.querySelector('[data-view]')?.addEventListener('click', ()=>alert(`${it.name} — ₹${it.price}\nCategory: ${it.category}`));
      grid.appendChild(d);
    });
  }

  $('#search').value = searchText;
  $('#search').oninput = ()=>renderGrid($('#filter-cat').value, $('#search').value);
  $('#filter-cat').onchange = ()=>renderGrid($('#filter-cat').value, $('#search').value);

  renderGrid('', searchText);
}

// ---------- Cart ----------
function addToCart(item){
  cart.items.push({...item, cartId: uid('c')});
  cart.total = cart.items.reduce((s,it)=> s + Number(it.price), 0);
  updateCartBadge();
  alert(`${item.name} added to cart`);
}

function renderCart(){
  app.innerHTML = `
    <div class="card">
      <h2>Cart</h2>
      <ul id="cart-list"></ul>
      <h3>Total: ₹<span id="cart-total">0</span></h3>
      <div style="margin-top:10px">
        <label>Delivery Mode:
          <select id="delivery-mode"><option value="delivery">Home Delivery</option><option value="pickup">Pickup</option></select>
        </label>
      </div>
      <div style="margin-top:10px; display:flex; gap:8px">
        <button class="btn" id="place-order">Place Order</button>
        <button id="clear-cart">Clear Cart</button>
      </div>
    </div>
  `;
  const list = $('#cart-list'); list.innerHTML = '';
  cart.items.forEach(ci=>{
    const li = document.createElement('li'); li.className='flex';
    li.innerHTML = `<div style="flex:1">${ci.name} — ₹${ci.price}</div>
      <div><button data-rm="${ci.cartId}">Remove</button></div>`;
    li.querySelector('button').onclick = ()=>{ cart.items = cart.items.filter(x=>x.cartId!==ci.cartId); cart.total = cart.items.reduce((s,it)=> s + Number(it.price), 0); renderCart(); updateCartBadge(); };
    list.appendChild(li);
  });
  $('#cart-total').textContent = cart.total;
  $('#place-order').onclick = ()=>placeOrder();
  $('#clear-cart').onclick = ()=>{ if(confirm('Clear cart?')){ cart.items=[]; cart.total=0; renderCart(); updateCartBadge(); } };
}

// ---------- Place Order ----------
function placeOrder(){
  const sess = currentSession();
  if(!sess){ if(!confirm('You are not logged in. Register / Login?')) return; renderLogin(); return; }
  if(cart.items.length===0){ alert('Cart is empty'); return; }

  const orders = load(LS.ORDERS, []);
  const order = {
    id: uid('ord'),
    userId: sess.id,
    userName: sess.name,
    items: cart.items.map(it=>({name:it.name, price:it.price})),
    total: cart.items.reduce((s,it)=> s + Number(it.price),0),
    status: 'PLACED',
    createdAt: new Date().toISOString(),
    deliveryMode: $('#delivery-mode') ? $('#delivery-mode').value : 'delivery'
  };
  orders.push(order); save(LS.ORDERS, orders);

  // clear cart
  cart.items = []; cart.total = 0; updateCartBadge();

  // show order status message (simulate popup/message microservice)
  alert(`Order placed! Order ID: ${order.id}\nStatus: ${order.status}`);
  renderOrders();
}

// ---------- My Orders (for user) ----------
function renderOrders(){
  const sess = currentSession();
  if(!sess){ renderLogin(); return; }
  const orders = load(LS.ORDERS, []);
  const my = orders.filter(o=> o.userId === sess.id);
  app.innerHTML = `<div class="card"><h2>My Orders (${my.length})</h2>
    <div id="orders-list"></div></div>`;
  const ol = $('#orders-list');
  if(my.length===0) ol.innerHTML = `<p class="small">No orders yet.</p>`;
  my.forEach(o=>{
    const d = document.createElement('div'); d.className='card';
    d.innerHTML = `<strong>Order: ${o.id}</strong> <span class="small">(${new Date(o.createdAt).toLocaleString()})</span>
      <p>${o.items.map(i=>i.name+' ₹'+i.price).join(', ')}</p>
      <p>Total: ₹${o.total} | Status: <strong>${o.status}</strong></p>
      <div style="display:flex;gap:8px">
        <button ${o.status!=='PLACED'?'disabled':''} class="btn cancel-btn">Cancel</button>
        <button class="btn" style="background:#5d7cff" data-bill="${o.id}">View Bill</button>
      </div>`;
    d.querySelector('.cancel-btn').onclick = ()=>{
      if(confirm('Cancel order?')){ updateOrderStatus(o.id,'CANCELLED'); renderOrders(); }
    };
    d.querySelector('[data-bill]').onclick = ()=> showBill(o);
    ol.appendChild(d);
  });
}

// ---------- Show bill (user view) ----------
function showBill(order){
  let billHtml = `Order ID: ${order.id}\nCustomer: ${order.userName}\n\nItems:\n`;
  order.items.forEach(it=> billHtml += `${it.name} — ₹${it.price}\n`);
  billHtml += `\nTotal: ₹${order.total}\nStatus: ${order.status}`;
  alert(billHtml);
}

// ---------- Admin area (simulate admin login check) ----------
function renderAdmin(){
  const sess = currentSession();
  if(!sess || sess.role !== 'admin'){
    const ok = confirm('Admin area — please login as admin. Use admin@pizza.com / admin123 to enter. Go to Login?');
    if(ok) renderLogin();
    return;
  }
  // admin panel
  app.innerHTML = `
    <div class="card">
      <h2>Admin Dashboard</h2>
      <div style="display:flex;gap:12px;align-items:center">
        <div><button id="add-item" class="btn">Add Item</button></div>
        <div><input id="admin-search" placeholder="Search items..." /></div>
        <div><button id="refresh-data">Refresh</button></div>
      </div>
      <div style="margin-top:12px">
        <h3>Menu Items</h3>
        <table class="table" id="admin-items-table"><thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Actions</th></tr></thead><tbody></tbody></table>
      </div>

      <div style="margin-top:16px">
        <h3>Orders</h3>
        <div id="admin-orders"></div>
      </div>

      <div style="margin-top:16px">
        <h3>Monthly Revenue (All time)</h3>
        <div id="revenue-area" class="notice"></div>
      </div>
    </div>
  `;

  $('#add-item').onclick = ()=>renderAddItemForm();
  $('#admin-search').oninput = ()=>renderAdminItems($('#admin-search').value.trim());
  $('#refresh-data').onclick = ()=>{ renderAdminItems(''); renderAdminOrders(); renderRevenue(); };

  renderAdminItems('');
  renderAdminOrders();
  renderRevenue();
}

function renderAdminItems(q=''){
  const items = load(LS.ITEMS, []);
  const tbody = document.querySelector('#admin-items-table tbody');
  tbody.innerHTML = '';
  items.filter(it=> !q || it.name.toLowerCase().includes(q.toLowerCase())).forEach(it=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${it.name}</td><td>${it.category}</td><td>₹${it.price}</td>
      <td>
        <button data-edit="${it.id}">Edit</button>
        <button data-del="${it.id}">Delete</button>
      </td>`;
    tr.querySelector('[data-edit]').onclick = ()=> renderEditItemForm(it.id);
    tr.querySelector('[data-del]').onclick = ()=>{ if(confirm('Delete item?')){ deleteItem(it.id); renderAdminItems(); } };
    tbody.appendChild(tr);
  });
}

function renderAddItemForm(){
  app.innerHTML = `
    <div class="card form">
      <h2>Add Menu Item</h2>
      <input id="it-name" placeholder="Name" />
      <input id="it-cat" placeholder="Category (Pizza / Sides / Beverages / Combo)" />
      <input id="it-price" placeholder="Price" type="number" />
      <input id="it-img" placeholder="Image URL (optional)" />
      <div style="display:flex;gap:8px">
        <button class="btn" id="it-save">Save</button>
        <button id="it-cancel">Cancel</button>
      </div>
    </div>
  `;
  $('#it-cancel').onclick = ()=>renderAdmin();
  $('#it-save').onclick = ()=>{
    const name = $('#it-name').value.trim(), cat = $('#it-cat').value.trim(), price = Number($('#it-price').value), img = $('#it-img').value.trim() || 'https://i.imgur.com/eTmWoAN.png';
    if(!name || !cat || !price){ alert('Fill all'); return; }
    const items = load(LS.ITEMS, []);
    items.push({id:uid('itm'), name, category:cat, price, img});
    save(LS.ITEMS, items);
    alert('Item added'); renderAdmin();
  }
}

function renderEditItemForm(id){
  const items = load(LS.ITEMS, []);
  const it = items.find(x=>x.id===id);
  if(!it) return alert('Item not found');
  app.innerHTML = `
    <div class="card form">
      <h2>Edit Item</h2>
      <input id="it-name" value="${it.name}" />
      <input id="it-cat" value="${it.category}" />
      <input id="it-price" value="${it.price}" type="number" />
      <input id="it-img" value="${it.img}" />
      <div style="display:flex;gap:8px">
        <button class="btn" id="it-save">Save</button>
        <button id="it-cancel">Cancel</button>
      </div>
    </div>
  `;
  $('#it-cancel').onclick = ()=>renderAdmin();
  $('#it-save').onclick = ()=>{
    it.name = $('#it-name').value.trim();
    it.category = $('#it-cat').value.trim();
    it.price = Number($('#it-price').value);
    it.img = $('#it-img').value.trim();
    save(LS.ITEMS, items);
    alert('Saved'); renderAdmin();
  }
}

function deleteItem(id){
  let items = load(LS.ITEMS, []);
  items = items.filter(i=> i.id !== id);
  save(LS.ITEMS, items);
}

// ---------- Orders admin ----------
function renderAdminOrders(){
  const orders = load(LS.ORDERS, []);
  const div = $('#admin-orders'); div.innerHTML = '';
  if(orders.length===0) div.innerHTML = '<p class="small">No orders yet.</p>';
  orders.slice().reverse().forEach(o=>{
    const d = document.createElement('div'); d.className='card';
    d.innerHTML = `<strong>${o.id}</strong> <span class="small">(${new Date(o.createdAt).toLocaleString()})</span>
      <p>${o.items.map(i=>i.name+' ₹'+i.price).join(', ')}</p>
      <p>Total: ₹${o.total} | Status: <strong>${o.status}</strong></p>
      <div style="display:flex;gap:8px">
        <button ${o.status!=='PLACED'?'disabled':''} data-accept="${o.id}" class="btn">Accept</button>
        <button ${o.status!=='PLACED'?'disabled':''} data-reject="${o.id}" class="btn" style="background:#aaa">Reject</button>
        <button data-msg="${o.id}">Send Message</button>
        <button data-bill="${o.id}">Generate Bill</button>
      </div>`;
    d.querySelector('[data-accept]')?.addEventListener('click', ()=>{ updateOrderStatus(o.id,'ACCEPTED'); renderAdminOrders(); });
    d.querySelector('[data-reject]')?.addEventListener('click', ()=>{ updateOrderStatus(o.id,'REJECTED'); renderAdminOrders(); });
    d.querySelector('[data-msg]')?.addEventListener('click', ()=>{ const msg = prompt('Message to user:','Your order status has changed'); if(msg) alert(`Message to ${o.userName}: ${msg}`); });
    d.querySelector('[data-bill]')?.addEventListener('click', ()=>{ alert(`Bill for ${o.userName}\nOrder: ${o.id}\nTotal: ₹${o.total}`); });
    div.appendChild(d);
  });
}

// ---------- Order status update helper ----------
function updateOrderStatus(orderId, status){
  const orders = load(LS.ORDERS, []);
  const idx = orders.findIndex(o=> o.id===orderId);
  if(idx===-1) return;
  orders[idx].status = status;
  save(LS.ORDERS, orders);

  // simulate notification to user
  const user = load(LS.USERS, []).find(u=> u.id === orders[idx].userId);
  if(user) {
    // Show a simple alert for demo — this simulates message microservice
    alert(`Notify ${user.name} (${user.email}): Your order ${orderId} is now ${status}`);
  }
}

// ---------- Revenue (simple sum of accepted orders) ----------
function renderRevenue(){
  const orders = load(LS.ORDERS, []);
  const accepted = orders.filter(o=> o.status === 'ACCEPTED' || o.status === 'PLACED' || o.status === 'COMPLETED');
  const total = accepted.reduce((s,o)=> s + Number(o.total), 0);
  $('#revenue-area').textContent = `Total revenue (all time from placed/accepted/completed orders): ₹${total}`;
}

// ---------- Init small demo helpers ----------
updateCartBadge();
// expose renderMenu for quick access (optional)
window.renderMenu = renderMenu;
