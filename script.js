// Самый простой и надёжный код для Mini App
let tg = window.Telegram?.WebApp;

// Данные меню (скопировано из вашей таблицы)
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
  "Закуски": [
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

// Функция для отображения меню
function showMenu() {
  const menuDiv = document.getElementById('menu');
  if (!menuDiv) return;
  
  menuDiv.innerHTML = '';
  
  for (let category in menuData) {
    // Создаём блок категории
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'menu-category';
    categoryDiv.innerHTML = `<div class="category-title">🍽️ ${category}</div>`;
    
    const items = menuData[category];
    for (let item of items) {
      const qty = cart[item.name] ? cart[item.name].qty : 0;
      
      // Создаём строку товара
      const itemRow = document.createElement('div');
      itemRow.className = 'menu-item';
      itemRow.innerHTML = `
        <span class="item-name">${item.name}</span>
        <span class="item-price">${item.price.toFixed(2)} ₽</span>
        <div class="item-controls">
          <button class="btn-minus" data-name="${item.name}" data-price="${item.price}">-</button>
          <span class="item-qty">${qty}</span>
          <button class="btn-plus" data-name="${item.name}" data-price="${item.price}">+</button>
        </div>
      `;
      categoryDiv.appendChild(itemRow);
    }
    menuDiv.appendChild(categoryDiv);
  }
  
  // Добавляем обработчики для всех кнопок
  document.querySelectorAll('.btn-plus').forEach(btn => {
    btn.onclick = () => {
      const name = btn.dataset.name;
      const price = parseFloat(btn.dataset.price);
      if (cart[name]) cart[name].qty++;
      else cart[name] = { price: price, qty: 1 };
      showMenu();  // Перерисовываем
      showCart();  // Перерисовываем корзину
      updateCheckoutButton();
    };
  });
  
  document.querySelectorAll('.btn-minus').forEach(btn => {
    btn.onclick = () => {
      const name = btn.dataset.name;
      if (cart[name]) {
        if (cart[name].qty > 1) cart[name].qty--;
        else delete cart[name];
        showMenu();
        showCart();
        updateCheckoutButton();
      }
    };
  });
}

// Функция для отображения корзины
function showCart() {
  const cartDiv = document.getElementById('cart');
  if (!cartDiv) return;
  
  const items = Object.entries(cart);
  if (items.length === 0) {
    cartDiv.innerHTML = '<p>✨ Корзина пуста</p>';
    document.getElementById('total').innerText = '0.00';
    return;
  }
  
  let total = 0;
  let html = '';
  for (let [name, data] of items) {
    const sum = data.price * data.qty;
    total += sum;
    html += `
      <div class="cart-item">
        <span>${name} x${data.qty}</span>
        <span>${sum.toFixed(2)} ₽</span>
        <button class="cart-remove" data-name="${name}">🗑</button>
      </div>
    `;
  }
  cartDiv.innerHTML = html;
  document.getElementById('total').innerText = total.toFixed(2);
  
  // Обработчики для кнопок удаления из корзины
  document.querySelectorAll('.cart-remove').forEach(btn => {
    btn.onclick = () => {
      delete cart[btn.dataset.name];
      showMenu();
      showCart();
      updateCheckoutButton();
    };
  });
}

// Управление главной кнопкой Telegram
function updateCheckoutButton() {
  if (!tg) return;
  const items = Object.entries(cart);
  if (items.length === 0) {
    tg.MainButton.hide();
  } else {
    const total = items.reduce((sum, [_, data]) => sum + (data.price * data.qty), 0);
    tg.MainButton.setText(`Оформить заказ | ${total.toFixed(2)} ₽`);
    tg.MainButton.show();
  }
}

// Отправка заказа
function sendOrder() {
  const items = Object.entries(cart);
  if (items.length === 0) {
    if (tg) tg.showAlert("Корзина пуста");
    return;
  }
  
  let total = 0;
  let text = '';
  for (let [name, data] of items) {
    const sum = data.price * data.qty;
    total += sum;
    text += `${name} x${data.qty} = ${sum.toFixed(2)} ₽\n`;
  }
  
  const order = {
    order: cart,
    total: total.toFixed(2),
    text: `🍽️ НОВЫЙ ЗАКАЗ!\n${text}\n🍽️ К оплате: ${total.toFixed(2)} ₽`
  };
  
  if (tg) {
    tg.sendData(JSON.stringify(order));
    tg.showAlert("✅ Заказ отправлен!");
    cart = {};
    showMenu();
    showCart();
    updateCheckoutButton();
    tg.close();
  }
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  // Находим контейнеры
  const mainDiv = document.getElementById('menu');
  if (!mainDiv) {
    console.error("Ошибка: не найден контейнер #menu");
    return;
  }
  
  // Инициализация Telegram
  if (tg) {
    tg.ready();
    tg.expand();
    tg.MainButton.setText("Оформить заказ");
    tg.MainButton.onClick(sendOrder);
    tg.MainButton.hide();
  }
  
  // Показываем меню
  showMenu();
  showCart();
});
