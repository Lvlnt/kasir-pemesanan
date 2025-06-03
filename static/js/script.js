const imageBasePath = "/static/images/";

let orderItems = {};
let totalItems = 0;
let totalPrice = 0;
let lastActiveCategory = null;
let orderNumber = localStorage.getItem('lastOrderNumber') ? parseInt(localStorage.getItem('lastOrderNumber')) : 16;
let orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];

// ====================== DATE & TIME FUNCTIONS ======================

function updateDateTime() {
    const options = { 
        timeZone: 'Asia/Makassar',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    
    const now = new Date();
    const dateTimeStr = now.toLocaleDateString('id-ID', options);
    document.getElementById('current-date-time').textContent = dateTimeStr;
}

// ====================== ORDER NUMBER FUNCTIONS ======================

function getNextOrderNumber() {
    orderNumber++;
    localStorage.setItem('lastOrderNumber', orderNumber);
    return orderNumber;
}

function updateOrderNumberDisplay() {
    document.querySelector('.order-number').textContent = `Order No.${orderNumber}`;
}

// ====================== MENU & ORDER FUNCTIONS ======================

function selectCategory(element, categoryId) {
    document.querySelectorAll('.category-item').forEach(item => item.classList.remove('active'));
    element.classList.add('active');

    document.querySelectorAll('.menu-section').forEach(section => section.classList.remove('active'));
    const section = document.getElementById(categoryId);
    section.classList.add('active');

    lastActiveCategory = categoryId;
}

function isOrderEmpty() {
    return Object.keys(orderItems).length === 0;
}

function addToOrder(itemName, price, imageName) {
    // Hapus baris berikut yang memaksa ekstensi .png
    // const correctedImageName = imageName.replace('.jpg', '.png');
    
    const emptyState = document.querySelector('#order-items-container .empty-state');
    if (emptyState) emptyState.remove();

    if (orderItems[itemName]) {
        orderItems[itemName].quantity++;
    } else {
        orderItems[itemName] = {
            price: price,
            quantity: 1,
            image: imageName // Gunakan imageName asli tanpa modifikasi
        };
    }

    updateOrderDisplay();
    showFeedback(itemName + ' ditambahkan');
}

function showFeedback(message) {
    const feedback = document.createElement('div');
    feedback.textContent = message;
    feedback.style.position = 'fixed';
    feedback.style.bottom = '20px';
    feedback.style.left = '50%';
    feedback.style.transform = 'translateX(-50%)';
    feedback.style.backgroundColor = '#1a73e8';
    feedback.style.color = 'white';
    feedback.style.padding = '10px 20px';
    feedback.style.borderRadius = '20px';
    feedback.style.zIndex = '100';
    document.body.appendChild(feedback);

    setTimeout(() => {
        feedback.style.opacity = '0';
        feedback.style.transition = 'opacity 0.5s';
        setTimeout(() => document.body.removeChild(feedback), 500);
    }, 1500);
}

function updateOrderDisplay() {
    const orderContainer = document.getElementById('order-items-container');
    orderContainer.innerHTML = '';

    totalItems = 0;
    totalPrice = 0;

    if (isOrderEmpty()) {
        orderContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🛒</div>
                <div>Your order is empty</div>
                <div>Select items from the menu</div>
            </div>`;
        document.getElementById('total-items-count').textContent = '0 items';
        document.getElementById('total-price').textContent = 'Rp.0';
        return;
    }

    for (const [itemName, details] of Object.entries(orderItems)) {
        const itemTotal = details.price * details.quantity;
        totalItems += details.quantity;
        totalPrice += itemTotal;

        const formattedPrice = formatCurrency(details.price);

        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.innerHTML = `
            <img class="order-item-image" src="${imageBasePath}${details.image}" alt="${itemName}">
            <div class="order-item-details">
                <div class="order-item-title">${itemName}</div>
                <div class="order-item-price">Rp. ${formattedPrice}</div>
                <div class="quantity-control">
                    <button class="quantity-btn" onclick="decreaseQuantity('${itemName}')">-</button>
                    <input class="quantity-input" type="text" value="${details.quantity}" readonly>
                    <button class="quantity-btn" onclick="increaseQuantity('${itemName}')">+</button>
                </div>
            </div>`;
        orderContainer.appendChild(orderItem);
    }

    document.getElementById('total-items-count').textContent = `${totalItems} items`;
    document.getElementById('total-price').textContent = `Rp.${formatCurrency(totalPrice)}`;
}

function increaseQuantity(itemName) {
    if (orderItems[itemName]) {
        orderItems[itemName].quantity++;
        updateOrderDisplay();
    }
}

function decreaseQuantity(itemName) {
    if (orderItems[itemName]) {
        orderItems[itemName].quantity--;
        if (orderItems[itemName].quantity <= 0) {
            delete orderItems[itemName];
        }
        updateOrderDisplay();
    }
}

// ====================== MODAL FUNCTIONS ======================

function openModal() {
    if (isOrderEmpty()) {
        showFeedback("Silakan pilih makanan/minuman terlebih dahulu!");
        return;
    }

    const modal = document.getElementById("totalPesananModal");
    const orderDetails = document.getElementById("orderDetails");

    orderDetails.innerHTML = "";
    let itemCount = 0;
    let totalPrice = 0;

    for (const [itemName, details] of Object.entries(orderItems)) {
        const lineTotal = details.price * details.quantity;
        itemCount += details.quantity;
        totalPrice += lineTotal;

        orderDetails.innerHTML += `
            <div style="margin-bottom: 5px;">
                ${itemName} (x${details.quantity}) - Rp.${formatCurrency(lineTotal)}
            </div>`;
    }

    orderDetails.innerHTML = `
        <div class="order-header"><div>Item</div><div>#${itemCount}</div></div>
        ${orderDetails.innerHTML}
        <div style="margin-top: 10px; font-weight: bold;">Total: Rp.${formatCurrency(totalPrice)}</div>
    `;

    modal.style.display = "flex";
}

function closeModal() {
    document.getElementById("totalPesananModal").style.display = "none";
}

function closePaymentModal() {
    document.getElementById("paymentMethodModal").style.display = "none";
}

function closeCashInputModal() {
    document.getElementById("cashInputModal").style.display = "none";
}

function closeQrisModal() {
    document.getElementById("qrisModal").style.display = "none";
}

function closeSuccessModal() {
    document.getElementById("successModal").style.display = "none";
}

function closeHistoryModal() {
    document.getElementById("historyModal").style.display = "none";
}

function closeAboutModal() {
    document.getElementById("aboutModal").style.display = "none";
}

function editOrder() {
    closeModal();
}

function payOrder() {
    closeModal();
    document.getElementById("paymentMethodModal").style.display = "flex";
}

// ====================== PAYMENT FUNCTIONS ======================

function handlePayment(method) {
    document.getElementById("paymentMethodModal").style.display = "none";

    if (method === "TUNAI") {
        document.getElementById("cashInputModal").style.display = "flex";
    } else if (method === "QRIS") {
        document.getElementById("qrisModal").style.display = "flex";
    }
}

function confirmCashPayment() {
    const cash = parseInt(document.getElementById("cashAmountInput").value);
    if (isNaN(cash) || cash < totalPrice) {
        alert("Uang tidak mencukupi atau belum diisi!");
        return;
    }
    const kembalian = cash - totalPrice;
    
    // Save to history
    saveOrderToHistory(totalPrice, cash, kembalian);
    
    showSuccessModal(cash, kembalian);
    closeCashInputModal();
}

function confirmQrisPayment() {
    // Save to history
    saveOrderToHistory(totalPrice, totalPrice, 0);
    
    showSuccessModal(totalPrice, 0);
    closeQrisModal();
}

function saveOrderToHistory(total, cash, change) {
    const now = new Date();
    const options = { 
        timeZone: 'Asia/Makassar',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    
    const order = {
        id: orderNumber,
        date: now.toLocaleDateString('id-ID', options),
        items: {...orderItems},
        total: total,
        cash: cash,
        change: change
    };
    
    orderHistory.unshift(order);
    localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
}

// ====================== SUCCESS MODAL FUNCTIONS ======================

function showSuccessModal(cashAmount, changeAmount) {
    const currentOrderNumber = orderNumber;
    document.getElementById("successModal").style.display = "flex";
    document.getElementById("paymentTotal").textContent = "Rp." + formatCurrency(totalPrice);
    document.getElementById("paymentCash").textContent = "Rp." + formatCurrency(cashAmount);
    document.getElementById("paymentChange").textContent = "Rp." + formatCurrency(changeAmount);
    document.getElementById("orderNumber").textContent = "#" + currentOrderNumber;
    
    getNextOrderNumber();
    updateOrderNumberDisplay();
    
    orderItems = {};
    updateOrderDisplay();
}

function formatCurrency(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function printReceipt() {
    window.print();
}

function goHome() {
    window.location.href = "/";
}

// ====================== HISTORY FUNCTIONS ======================

function showHistoryModal() {
    const modal = document.getElementById("historyModal");
    const historyContent = document.getElementById("historyContent");
    
    historyContent.innerHTML = "";
    
    if (orderHistory.length === 0) {
        historyContent.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #666;">
                Tidak ada riwayat pesanan
            </div>`;
    } else {
        orderHistory.forEach(order => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div>
                    <div>Order #${order.id}</div>
                    <div class="history-item-date">${order.date}</div>
                </div>
                <div class="history-item-total">Rp.${formatCurrency(order.total)}</div>
            `;
            historyItem.onclick = () => showHistoryDetail(order);
            historyContent.appendChild(historyItem);
        });
    }
    
    modal.style.display = "flex";
    closeDropdownMenu();
}

function showHistoryDetail(order) {
    const historyContent = document.getElementById("historyContent");
    
    historyContent.innerHTML = `
        <div style="margin-bottom: 15px;">
            <h3>Order #${order.id}</h3>
            <div style="color: #666; font-size: 14px;">${order.date}</div>
        </div>
        <div style="margin-bottom: 10px; font-weight: bold; border-bottom: 1px solid #eee; padding-bottom: 5px;">
            Items:
        </div>
        <div style="margin-bottom: 15px;">
            ${Object.entries(order.items).map(([name, item]) => `
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <div>${name} (x${item.quantity})</div>
                    <div>Rp.${formatCurrency(item.price * item.quantity)}</div>
                </div>
            `).join('')}
        </div>
        <div style="border-top: 1px solid #eee; padding-top: 10px; margin-bottom: 5px;">
            <div style="display: flex; justify-content: space-between;">
                <div>Total:</div>
                <div>Rp.${formatCurrency(order.total)}</div>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <div>Uang:</div>
                <div>Rp.${formatCurrency(order.cash)}</div>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <div>Kembalian:</div>
                <div>Rp.${formatCurrency(order.change)}</div>
            </div>
        </div>
        <div class="button-group" style="margin-top: 20px;">
            <button onclick="showHistoryModal()" style="width: 100%;">Kembali</button>
        </div>
    `;
}

// ====================== ABOUT FUNCTIONS ======================

function showAboutModal() {
    document.getElementById("aboutModal").style.display = "flex";
    closeDropdownMenu();
}

// ====================== DROPDOWN MENU FUNCTIONS ======================

function toggleDropdownMenu() {
    const menu = document.getElementById("dropdown-menu");
    if (menu.style.display === "block") {
        menu.style.display = "none";
    } else {
        menu.style.display = "block";
    }
}

function closeDropdownMenu() {
    document.getElementById("dropdown-menu").style.display = "none";
}

// ====================== SEARCH FUNCTIONS ======================

document.getElementById('search-input').addEventListener('input', function (e) {
    const searchTerm = e.target.value.toLowerCase();
    const suggestionBox = document.getElementById('search-suggestions');
    const clearBtn = document.getElementById('clear-search');

    clearBtn.style.display = searchTerm ? 'inline' : 'none';

    const allSections = document.querySelectorAll('.menu-section');
    const allItems = document.querySelectorAll('.menu-item');
    const matches = [];

    if (searchTerm) {
        allSections.forEach(section => section.classList.add('active'));
    } else {
        allSections.forEach(section => section.classList.remove('active'));
        if (lastActiveCategory) {
            document.getElementById(lastActiveCategory).classList.add('active');
        }
    }

    allItems.forEach(item => {
        const title = item.querySelector('.menu-item-title').textContent;
        const isMatch = title.toLowerCase().includes(searchTerm);
        item.style.display = isMatch || !searchTerm ? 'flex' : 'none';
        if (isMatch) matches.push(title);
    });

    suggestionBox.innerHTML = '';
    if (searchTerm && matches.length > 0) {
        matches.forEach(name => {
            const li = document.createElement('li');
            li.textContent = name;
            li.onclick = () => {
                document.getElementById('search-input').value = name;
                filterByExactName(name);
                suggestionBox.style.display = 'none';
            };
            suggestionBox.appendChild(li);
        });
        suggestionBox.style.display = 'block';
    } else {
        suggestionBox.style.display = 'none';
    }
});

function filterByExactName(name) {
    document.querySelectorAll('.menu-item').forEach(item => {
        const title = item.querySelector('.menu-item-title').textContent;
        item.style.display = title === name ? 'flex' : 'none';
    });
}

document.getElementById('clear-search').addEventListener('click', () => {
    const suggestionBox = document.getElementById('search-suggestions');
    document.getElementById('search-input').value = '';
    suggestionBox.style.display = 'none';
    document.getElementById('clear-search').style.display = 'none';

    document.querySelectorAll('.menu-item').forEach(item => {
        item.style.display = 'flex';
    });

    document.querySelectorAll('.menu-section').forEach(section => section.classList.remove('active'));
    if (lastActiveCategory) {
        document.getElementById(lastActiveCategory).classList.add('active');
    }
});

// ====================== INITIALIZATION ======================

window.onload = function () {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    updateOrderNumberDisplay();
    
    const firstCategoryItem = document.querySelector('.category-item');
    if (firstCategoryItem) {
        firstCategoryItem.classList.add('active');
        lastActiveCategory = firstCategoryItem.getAttribute('data-category');
    }
    
    // Setup menu toggle
    document.getElementById('menu-toggle').addEventListener('click', toggleDropdownMenu);
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        const menu = document.getElementById('dropdown-menu');
        const menuToggle = document.getElementById('menu-toggle');
        
        if (menu.style.display === 'block' && 
            !menu.contains(event.target) && 
            !menuToggle.contains(event.target)) {
            menu.style.display = 'none';
        }
    });
};