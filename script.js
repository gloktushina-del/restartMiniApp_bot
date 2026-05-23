// Инициализация Telegram
let tg = null;
if (window.Telegram && window.Telegram.WebApp) {
    tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
}

// МЕНЮ
const menuData = {
  "Супы": [
    { name: "Суп-пюре сырный с копчеными колбасками", price: 3.80 },
    { name: "Холодник со сметаной", price: 3.00 }
  ],
  "Гарниры": [
    { name: "Картофельное пюре", price: 2.50 },
    { name: "Спагетти со сливочным соусом", price: 2.80 }
  ],
  "Мясные блюда": [
    { name: "Биточек из свинины", price: 6.60 },
    { name: "Филе запеченное по-французски", price: 6.70 },
    { name: "Гнездышко с ветчиной и сыром", price: 6.80 },
    { name: "Гуляш из свинины", price: 6.80 }
  ],
  "Салаты": [
    { name: "Летний", price: 3.20 },
    { name: "Свежесть", price: 2.60 }
  ],
  "Фитнес бокс": [
    { name: "Фитнес бокс с курицей", price: 8.00 }
  ],
  "Пицца/Закуски": [
    { name: "Пицца на тосте", price: 3.00 },
    { name: "Конвертик из лаваша", price: 4.00 }
  ],
  "Хлеб": [
    { name: "Хлеб/Батон", price: 0.30 }
  ],
  "Напитки": [
    { name: "Сок в ассортименте", price: 1.50 },
    { name: "Кефир", price: 1.00 }
  ]
};

let cart = {};

function renderMenu() {
  const container = document.getElementById('menu');
  if (!container) return;
  container.innerHTML = '';
  
  for (const [cat, items] of Object.entries(menuData)) {
    const block = document.createElement('div');
    block.className = 'menu-category';
    block.innerHTML = `<div class="category-title">${cat}</div>`;
    
    for (const item of items) {
      const qty = cart[item.name]?.qty || 0;
      block.innerHTML += `
        <div class="menu-item">
          <div class="item-info">
            <div class="item-name">${item.name}</div>
          </div>
          <div class="item-price">${item.price.toFixed(2)}₽</div>
          <div class="item-controls">
            <button class="minus" data-name="${item.name}" data-price="${item.price}">➖</button>
            <span class="item-qty">${qty}</span>
            <button class="plus" data-name="${item.name}" data-price="${item.price}">➕</button>
          </div>
        </div>
      `;
    }
    container.appendChild(block);
  }
  
  // Обработчики
  document.querySelectorAll('.plus').forEach(btn => {
    btn.onclick = () => {
      const name = btn.dataset.name;
      const price = parseFloat(btn.dataset.price);
      if (cart[name]) cart[name].qty++;
      else cart[name] = { price, qty: 1 };
      renderMenu();
      renderCart();
      if (tg) tg.HapticFeedback.impactOccurred('light');
    };
  });
  
  document.querySelectorAll('.minus').forEach(btn => {
    btn.onclick = () => {
      const name = btn.dataset.name;
      if (cart[name]) {
        if (cart[name].qty > 1) cart[name].qty--;
        else delete cart[name];
        renderMenu();
        renderCart();
        if (tg) tg.HapticFeedback.impactOccurred('light');
      }
    };
  });
}

function renderCart() {
  const container = document.getElementById('cart');
  const totalSpan = document.getElementById('total');
  if (!container || !totalSpan) return;
  
  const items = Object.entries(cart);
  if (items.length === 0) {
    container.innerHTML = '<p>✨ Корзина пуста</p>';
    totalSpan.innerText = '0.00';
    return;
  }
  
  let total = 0;
  container.innerHTML = '';
  for (const [name, data] of items) {
    const sum = data.price * data.qty;
    total += sum;
    container.innerHTML += `
      <div class="cart-item">
        <span class="cart-item-name">${name} x${data.qty}</span>
        <span class="cart-item-price">${sum.toFixed(2)}₽</span>
        <button class="cart-remove" data-name="${name}">🗑</button>
      </div>
    `;
  }
  totalSpan.innerText = total.toFixed(2);
  
  document.querySelectorAll('.cart-remove').forEach(btn => {
    btn.onclick = () => {
      delete cart[btn.dataset.name];
      renderMenu();
      renderCart();
    };
  });
}

// ОФОРМЛЕНИЕ
function checkout() {
  const items = Object.entries(cart);
  if (items.length === 0) {
    if (tg) tg.showAlert("Корзина пуста");
    else alert("Корзина пуста");
    return;
  }
  
  let total = 0;
  let text = '';
  for (const [name, data] of items) {
    const sum = data.price * data.qty;
    total += sum;
    text += `${name} x${data.qty} = ${sum.toFixed(2)}₽\n`;
  }
  
  const order = {
    order: cart,
    total: total.toFixed(2),
    text: `🍽️ НОВЫЙ ЗАКАЗ!\n———————————\n${text}———————————\n🍽️ К оплате: ${total.toFixed(2)}₽`
  };
  
  if (tg) {
    tg.sendData(JSON.stringify(order));
    tg.showAlert("✅ Заказ оформлен!");
    setTimeout(() => tg.close(), 1000);
  } else {
    alert("Заказ:\n" + order.text);
  }
}

// ЗАПУСК
document.addEventListener('DOMContentLoaded', () => {
  renderMenu();
  renderCart();
  const btn = document.getElementById('checkoutBtn');
  if (btn) btn.onclick = checkout;
});
