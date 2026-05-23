// ===================== МЕНЮ =====================
const menuData = {
  "Супы": [
    { name: "Суп-пюре сырный с копчеными колбасками", price: 3.80, desc: "Нежный сырный суп с ароматными колбасками 🔥" },
    { name: "Холодник со сметаной", price: 3.00, desc: "Освежающий летний суп на кефире 🌿" }
  ],
  "Гарниры": [
    { name: "Картофельное пюре", price: 2.50, desc: "Нежное, с маслом" },
    { name: "Спагетти со сливочным соусом", price: 2.80, desc: "Паста аль денте" }
  ],
  "Мясные блюда": [
    { name: "Биточек из свинины", price: 6.60, desc: "Сочный, румяный 🔥" },
    { name: "Филе запеченное по-французски", price: 6.70, desc: "Под сырной корочкой ⭐" },
    { name: "Гнездышко с ветчиной и сыром", price: 6.80, desc: "Запеченное блюдо" },
    { name: "Гуляш из свинины", price: 6.80, desc: "Тушеная свинина в подливе" }
  ],
  "Салаты": [
    { name: "Летний", price: 3.20, desc: "Свежие овощи 🌿" },
    { name: "Свежесть", price: 2.60, desc: "Капуста, огурец, зелень" }
  ],
  "Фитнес бокс": [
    { name: "Фитнес бокс с курицей", price: 8.00, desc: "Сбалансированный обед" }
  ],
  "Пицца/Закуски": [
    { name: "Пицца на тосте", price: 3.00, desc: "" },
    { name: "Конвертик из лаваша", price: 4.00, desc: "" }
  ],
  "Хлеб": [
    { name: "Хлеб/Батон", price: 0.30, desc: "" }
  ],
  "Напитки": [
    { name: "Сок в ассортименте", price: 1.50, desc: "" },
    { name: "Кефир", price: 1.00, desc: "Полезный" }
  ]
};

// Корзина: { "название": { price, quantity } }
let cart = {};

// Инициализация Telegram WebApp
let tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand(); // Разворачиваем на весь экран
}

// ===================== ОТРИСОВКА МЕНЮ =====================
function renderMenu() {
  const menuContainer = document.getElementById('menu');
  menuContainer.innerHTML = '';
  
  for (const [category, items] of Object.entries(menuData)) {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'menu-category';
    
    const categoryTitle = document.createElement('div');
    categoryTitle.className = 'category-title';
    categoryTitle.textContent = category;
    categoryDiv.appendChild(categoryTitle);
    
    for (const item of items) {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'menu-item';
      
      const qty = cart[item.name]?.quantity || 0;
      
      itemDiv.innerHTML = `
        <div class="item-info">
          <div class="item-name">${item.name}</div>
          <div class="item-desc">${item.desc || ''}</div>
        </div>
        <div class="item-price">${item.price.toFixed(2)}₽</div>
        <div class="item-controls">
          <button class="btn-minus" data-name="${item.name}" data-price="${item.price}">➖</button>
          <span class="item-qty">${qty}</span>
          <button class="btn-plus" data-name="${item.name}" data-price="${item.price}">➕</button>
        </div>
      `;
      
      categoryDiv.appendChild(itemDiv);
    }
    
    menuContainer.appendChild(categoryDiv);
  }
  
  // Добавляем обработчики после отрисовки
  document.querySelectorAll('.btn-plus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const name = btn.dataset.name;
      const price = parseFloat(btn.dataset.price);
      addToCart(name, price);
    });
  });
  
  document.querySelectorAll('.btn-minus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const name = btn.dataset.name;
      removeFromCart(name);
    });
  });
}

// ===================== КОРЗИНА =====================
function addToCart(name, price) {
  if (cart[name]) {
    cart[name].quantity++;
  } else {
    cart[name] = { price, quantity: 1 };
  }
  renderCart();
  renderMenu(); // обновляем кнопки с количеством
  if (tg) tg.HapticFeedback.impactOccurred('light');
}

function removeFromCart(name) {
  if (cart[name]) {
    if (cart[name].quantity > 1) {
      cart[name].quantity--;
    } else {
      delete cart[name];
    }
    renderCart();
    renderMenu();
    if (tg) tg.HapticFeedback.impactOccurred('light');
  }
}

function getTotal() {
  let total = 0;
  for (const [name, data] of Object.entries(cart)) {
    total += data.price * data.quantity;
  }
  return total;
}

function renderCart() {
  const cartContainer = document.getElementById('cart');
  const totalSpan = document.getElementById('total');
  
  const cartItems = Object.entries(cart);
  
  if (cartItems.length === 0) {
    cartContainer.innerHTML = '<p>✨ Корзина пуста</p>';
    totalSpan.textContent = '0.00';
    return;
  }
  
  cartContainer.innerHTML = '';
  for (const [name, data] of cartItems) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';
    itemDiv.innerHTML = `
      <span class="cart-item-name">${name} x${data.quantity}</span>
      <span class="cart-item-price">${(data.price * data.quantity).toFixed(2)}₽</span>
      <button class="cart-item-remove" data-name="${name}">🗑</button>
    `;
    cartContainer.appendChild(itemDiv);
  }
  
  // Обработчики удаления из корзины
  document.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      delete cart[btn.dataset.name];
      renderCart();
      renderMenu();
    });
  });
  
  totalSpan.textContent = getTotal().toFixed(2);
}

// ===================== ОФОРМЛЕНИЕ ЗАКАЗА =====================
function checkout() {
  const cartItems = Object.entries(cart);
  if (cartItems.length === 0) {
    alert('🛒 Корзина пуста');
    return;
  }
  
  const total = getTotal();
  let itemsText = '';
  for (const [name, data] of cartItems) {
    itemsText += `${name} x${data.quantity} = ${(data.price * data.quantity).toFixed(2)}₽\n`;
  }
  
  const orderText = `🍽️ НОВЫЙ ЗАКАЗ!\n———————————\n${itemsText}———————————\n🍽️ К оплате: ${total.toFixed(2)}₽`;
  
  // Отправляем заказ в Telegram бота
  if (tg) {
    tg.sendData(JSON.stringify({
      order: cart,
      total: total.toFixed(2),
      text: orderText
    }));
    tg.close();
  } else {
    // Для теста вне Telegram
    alert('Заказ:\n\n' + orderText + '\n\n(В Telegram заказ уйдёт боту)');
  }
}

// ===================== ИНИЦИАЛИЗАЦИЯ =====================
renderMenu();
renderCart();

// Кнопка оформления
document.getElementById('checkoutBtn').addEventListener('click', checkout);