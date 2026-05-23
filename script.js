// ===================== НАСТОЯЩЕЕ TELEGRAM MINI APP =====================

// Инициализация
let tg = window.Telegram?.WebApp;
let user = null;

if (tg) {
    tg.ready();                     // Сообщаем Telegram, что приложение загружено
    tg.expand();                    // Разворачиваем на весь экран
    tg.enableClosingConfirmation(); // Спрашиваем подтверждение при закрытии
    
    // Получаем данные пользователя (ВОТ ЭТО ГЛАВНОЕ!)
    user = tg.initDataUnsafe?.user;
    if (user) {
        console.log(`👤 Пользователь: ${user.first_name} ${user.last_name || ''} (@${user.username || 'нет'}) ID: ${user.id}`);
    } else {
        console.log("👤 Гость (вне Telegram)");
    }
    
    // Включаем тактильную обратную связь
    tg.HapticFeedback.impactOccurred('light');
    
} else {
    console.log("⚠️ Приложение открыто вне Telegram");
}

// ===================== МЕНЮ =====================
const menuData = {
  "🍜 СУПЫ": [
    { name: "Суп-пюре сырный с копчеными колбасками", price: 3.80 },
    { name: "Холодник со сметаной", price: 3.00 }
  ],
  "🍚 ГАРНИРЫ": [
    { name: "Картофельное пюре", price: 2.50 },
    { name: "Спагетти со сливочным соусом", price: 2.80 }
  ],
  "🍖 МЯСНЫЕ БЛЮДА": [
    { name: "Биточек из свинины", price: 6.60 },
    { name: "Филе запеченное по-французски", price: 6.70 },
    { name: "Гнездышко с ветчиной и сыром", price: 6.80 },
    { name: "Гуляш из свинины", price: 6.80 }
  ],
  "🥗 САЛАТЫ": [
    { name: "Летний", price: 3.20 },
    { name: "Свежесть", price: 2.60 }
  ],
  "🥙 ФИТНЕС БОКС": [
    { name: "Фитнес бокс с курицей", price: 8.00 }
  ],
  "🍕 ПИЦЦА/ЗАКУСКИ": [
    { name: "Пицца на тосте", price: 3.00 },
    { name: "Конвертик из лаваша", price: 4.00 }
  ],
  "🍞 ХЛЕБ": [
    { name: "Хлеб/Батон", price: 0.30 }
  ],
  "🥤 НАПИТКИ": [
    { name: "Сок в ассортименте", price: 1.50 },
    { name: "Кефир", price: 1.00 }
  ]
};

let cart = {};

// ===================== ОТРИСОВКА =====================
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
  
  // Обработчики с вибрацией
  document.querySelectorAll('.plus').forEach(btn => {
    btn.onclick = () => {
      const name = btn.dataset.name;
      const price = parseFloat(btn.dataset.price);
      if (cart[name]) cart[name].qty++;
      else cart[name] = { price, qty: 1 };
      renderMenu();
      renderCart();
      updateMainButton();
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
        updateMainButton();
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
      updateMainButton();
      if (tg) tg.HapticFeedback.impactOccurred('light');
    };
  });
}

// ===================== ГЛАВНАЯ КНОПКА TELEGRAM =====================
function updateMainButton() {
  if (!tg) return;
  
  const items = Object.entries(cart);
  if (items.length === 0) {
    tg.MainButton.hide();
  } else {
    const total = items.reduce((sum, [_, data]) => sum + (data.price * data.qty), 0);
    tg.MainButton.setText(`✅ ОФОРМИТЬ ЗАКАЗ | ${total.toFixed(2)}₽`);
    tg.MainButton.show();
  }
}

// ===================== ОФОРМЛЕНИЕ ЗАКАЗА =====================
function checkout() {
  const items = Object.entries(cart);
  if (items.length === 0) {
    if (tg) {
      tg.showPopup({
        title: "🛒 Корзина пуста",
        message: "Добавьте товары перед оформлением заказа",
        buttons: [{ type: "ok" }]
      });
    } else {
      alert("Корзина пуста");
    }
    return;
  }
  
  let total = 0;
  let text = '';
  for (const [name, data] of items) {
    const sum = data.price * data.qty;
    total += sum;
    text += `${name} x${data.qty} = ${sum.toFixed(2)}₽\n`;
  }
  
  // Добавляем информацию о пользователе (если есть)
  let userInfo = '';
  if (user) {
    userInfo = `👤 ${user.first_name} ${user.last_name || ''} (@${user.username || 'нет'})`;
  }
  
  const order = {
    order: cart,
    total: total.toFixed(2),
    text: `🍽️ НОВЫЙ ЗАКАЗ!\n———————————\n${text}———————————\n🍽️ К оплате: ${total.toFixed(2)}₽\n${userInfo}`
  };
  
  if (tg) {
    // Отправляем заказ боту
    tg.sendData(JSON.stringify(order));
    
    // Показываем нативный попап
    tg.showPopup({
      title: "✅ ЗАКАЗ ОФОРМЛЕН!",
      message: `Сумма: ${total.toFixed(2)}₽\n\nСпасибо за заказ!`,
      buttons: [{ type: "ok" }]
    });
    
    // Закрываем приложение через 1.5 секунды
    setTimeout(() => tg.close(), 1500);
  } else {
    alert("Заказ:\n" + order.text);
  }
}

// ===================== ЗАПУСК =====================
document.addEventListener('DOMContentLoaded', () => {
  renderMenu();
  renderCart();
  
  // Настраиваем главную кнопку Telegram
  if (tg) {
    tg.MainButton.setText("ОФОРМИТЬ ЗАКАЗ");
    tg.MainButton.onClick(checkout);
    updateMainButton();
    
    // Приветственный попап с именем пользователя
    if (user) {
      setTimeout(() => {
        tg.showPopup({
          title: "🍽️ Добро пожаловать!",
          message: `${user.first_name}, выбирайте блюда и оформляйте заказ.`,
          buttons: [{ type: "ok" }]
        });
      }, 500);
    }
  }
  
  // Для обратной совместимости с HTML-кнопкой (если есть)
  const oldBtn = document.getElementById('checkoutBtn');
  if (oldBtn) oldBtn.style.display = 'none';
});
