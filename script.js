const productsGrid = document.getElementById('products-grid');
const cartIcon = document.getElementById('cart-icon');
const cartModal = document.getElementById('cart-modal');
const cartItems = document.getElementById('cart-items');
const cartTotalPrice = document.getElementById('cart-total-price');
const cartCount = document.querySelector('.cart-count');
const closeBtn = document.querySelector('.close-btn');

// Данные
let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Загрузка товаров
async function loadProducts() {
  try {
    const response = await fetch('products.json');
    products = await response.json();
    renderProducts(products);
  } catch (error) {
    console.error('Ошибка загрузки товаров:', error);
  }
}

// Отображение товаров
function renderProducts(products) {
  productsGrid.innerHTML = products
    .map(
      (product) => `
            <div class="product-card">
                <img src="images/products/${product.images[0]}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-price">${product.price} ₽</p>
                    <button class="add-to-cart" onclick="addToCart(${product.id})">В корзину</button>
                </div>
            </div>
        `,
    )
    .join('');
}

// Добавление в корзину
function addToCart(productId) {
  const product = products.find((p) => p.id === productId);

  if (!product) return;

  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  updateCart();
  showNotification(`${product.name} добавлен в корзину!`);
}

// Обновление корзины
function updateCart() {
  // Обновляем иконку корзины
  cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Сохраняем в localStorage
  localStorage.setItem('cart', JSON.stringify(cart));

  // Обновляем модальное окно
  renderCart();
}

// Отрисовка содержимого корзины
function renderCart() {
  cartItems.innerHTML = cart
    .map(
      (item) => `
            <div class="cart-item">
                <div>
                    <h4>${item.name}</h4>
                    <p>${item.price} ₽ × ${item.quantity}</p>
                </div>
                <div>
                    <span>${item.price * item.quantity} ₽</span>
                    <button class="remove-item" onclick="removeFromCart(${
                      item.id
                    })">✕</button>
                </div>
            </div>
        `,
    )
    .join('');

  // Обновляем итоговую сумму
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotalPrice.textContent = total;
}

// Удаление из корзины
function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  updateCart();
}

// Показ уведомления
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('show');
  }, 10);

  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  updateCart();

  // Открытие/закрытие корзины
  cartIcon.addEventListener('click', () => {
    cartModal.style.display = 'flex';
  });

  closeBtn.addEventListener('click', () => {
    cartModal.style.display = 'none';
  });

  // Закрытие по клику вне области
  window.addEventListener('click', (e) => {
    if (e.target === cartModal) {
      cartModal.style.display = 'none';
    }
  });
});

async function loadProducts() {
  try {
    // Загружаем список товаров
    const productsResponse = await fetch('./content/products.json');
    const productsData = await productsResponse.json();

    // Для каждого товара загружаем его контент
    const products = await Promise.all(
      productsData.map(async (product) => {
        const res = await fetch(product.url);
        return await res.json();
      }),
    );

    renderProducts(products);
  } catch (error) {
    console.error('Ошибка загрузки товаров:', error);
    productsGrid.innerHTML = `
        <div class="error">
          <p>Товары временно недоступны</p>
          <p>Попробуйте обновить страницу</p>
        </div>
      `;
  }
}
