// ===============================================
// 🧠 4.1. تعريف المتغيرات الرئيسية والبيانات
// ===============================================

// عناصر واجهة المستخدم (DOM Elements)
const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');
const posApp = document.getElementById('pos-app');
const messageDisplay = document.getElementById('message');
const productGrid = document.getElementById('product-grid');
const orderList = document.getElementById('order-list');
const orderTotalSpan = document.querySelector('#order-total span');
const numpadDisplay = document.getElementById('numpad');
const paymentModal = document.getElementById('payment-modal');
const modalTotalDisplay = document.getElementById('modal-total-display');
const amountReceivedInput = document.getElementById('amount-received');
const changeDueSpan = document.getElementById('change-due');
const filterButtons = document.querySelectorAll('.filter-btn');

// بيانات تطبيق نقطة البيع (POS Data)
const products = [
    // --- الخبز الكلاسيكي (PAIN CLASSIQUE) ---
    { id: 101, name: "BAGUETTE TRADITION", price: 5.00, category: "bread" },
    { id: 102, name: "PAIN DE CAMPAGNE", price: 15.00, category: "bread" },
    { id: 103, name: "PAIN COMPLET", price: 7.00, category: "bread" },
    // --- الفطائر (VIENNOISERIES) ---
    { id: 201, name: "CROISSANT", price: 9.00, category: "viennoiserie" },
    { id: 202, name: "PAIN AU CHOCOLAT", price: 12.00, category: "viennoiserie" },
    { id: 203, name: "CHINOIS", price: 18.00, category: "viennoiserie" },
    // --- الحلويات (PÂTISSERIES) ---
    { id: 301, name: "TARTE AU CITRON", price: 35.00, category: "patisserie" },
    { id: 302, name: "ÉCLAIR CHOCOLAT", price: 25.00, category: "patisserie" },
    { id: 303, name: "MILLEFEUILLE", price: 28.00, category: "patisserie" },
    // --- المشروبات (BOISSONS) ---
    { id: 401, name: "CAFÉ EXPRESS", price: 15.00, category: "drink" },
    { id: 402, name: "THÉ VERT", price: 12.00, category: "drink" },
];

let currentOrder = [];
let selectedOrderItemIndex = -1; // لتحديد العنصر المختار لـ Numpad
let currentNumpadValue = ""; // القيمة التي يتم إدخالها بلوحة الأرقام
let currentFilter = "all"; // الفلتر الحالي للمنتجات

// ===============================================
// 🔑 4.2. وظائف التسجيل والدخول (Authentication)
// ===============================================

// الانتقال بين شاشتي الدخول والتسجيل
document.getElementById('switch-link')?.addEventListener('click', () => {
    loginSection.classList.add('hidden');
    registerSection.classList.remove('hidden');
    messageDisplay.textContent = '';
});

document.getElementById('switch-link-to-login')?.addEventListener('click', () => {
    registerSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
    messageDisplay.textContent = '';
});

// 4.2.1. دالة تسجيل مستخدم جديد
document.getElementById('register-btn')?.addEventListener('click', function() {
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;

    if (!username || !password) {
        messageDisplay.style.color = 'red';
        messageDisplay.textContent = 'الرجاء إدخال اسم المستخدم وكلمة المرور.';
        return;
    }

    if (localStorage.getItem('posUser_' + username)) {
         messageDisplay.style.color = 'red';
         messageDisplay.textContent = 'هذا المستخدم مسجل مسبقاً.';
         return; 
    }

    localStorage.setItem('posUser_' + username, password);
    
    messageDisplay.style.color = 'green';
    messageDisplay.textContent = 'تم التسجيل بنجاح! يمكنك الآن تسجيل الدخول.';

    registerSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
    document.getElementById('reg-username').value = '';
    document.getElementById('reg-password').value = '';
});

// 4.2.2. دالة تسجيل الدخول
document.getElementById('login-btn')?.addEventListener('click', function() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const storedPassword = localStorage.getItem('posUser_' + username);

    if (storedPassword && storedPassword === password) {
        messageDisplay.style.color = 'green';
        messageDisplay.textContent = 'تم تسجيل الدخول بنجاح! جاري التحويل...';
        
        document.querySelector('.auth-container').classList.add('hidden');
        posApp.classList.remove('hidden');
        
        // تحميل واجهة الـ POS
        renderProducts(currentFilter); 
        setupPOSButtons();
        setupNumpad();

    } else {
        messageDisplay.style.color = 'red';
        messageDisplay.textContent = 'اسم المستخدم أو كلمة المرور غير صحيحين.';
    }
});

// 4.2.3. دالة تسجيل الخروج (مستدعاة مباشرة من HTML)
function logout() {
    if (confirm("هل أنت متأكد من تسجيل الخروج؟")) {
        posApp.classList.add('hidden');
        document.querySelector('.auth-container').classList.remove('hidden');
        document.getElementById('login-username').value = '';
        document.getElementById('login-password').value = '';
        currentOrder = []; 
        updateOrderDisplay();
        messageDisplay.textContent = 'تم تسجيل الخروج.';
    }
}


// ===============================================
// 🛒 4.3. وظائف تطبيق نقطة البيع (POS Core Functions)
// ===============================================

// 4.3.1. عرض المنتجات على الشاشة وتطبيق الفلترة
function renderProducts(filter = 'all') {
    if (!productGrid) return;
    
    productGrid.innerHTML = '';
    
    const filteredProducts = products.filter(product => {
        return filter === 'all' || product.category === filter;
    });

    filteredProducts.forEach(product => {
        const button = document.createElement('button');
        button.className = `product-button ${product.category}`;
        button.innerHTML = `
            ${product.name}<br>
            <small>${product.price.toFixed(2)} د.م.</small>
        `;
        button.onclick = () => addToOrder(product);
        productGrid.appendChild(button);
    });
    
    // تحديث حالة أزرار الفلترة
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === filter) {
            btn.classList.add('active');
        }
    });
}

// 4.3.2. إضافة المنتج إلى الفاتورة
function addToOrder(product, quantity = 1) {
    const existingItem = currentOrder.find(item => item.id === product.id && !item.isCustomPrice);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        currentOrder.push({ ...product, quantity: quantity, tempPrice: product.price, isCustomPrice: false });
    }
    selectedOrderItemIndex = -1;
    updateOrderDisplay();
}

// 4.3.3. تحديث واجهة الفاتورة والإجمالي
function updateOrderDisplay() {
    if (!orderList || !orderTotalSpan) return;
    
    orderList.innerHTML = '';
    let total = 0;

    currentOrder.forEach((item, index) => {
        const itemPrice = item.isCustomPrice ? item.tempPrice : item.price;
        const itemTotal = itemPrice * item.quantity;
        total += itemTotal;

        const li = document.createElement('li');
        li.className = `order-item ${index === selectedOrderItemIndex ? 'selected' : ''}`;
        li.onclick = () => selectOrderItem(index);

        li.innerHTML = `
            <span class="item-details">
                ${item.name} 
                <span style="font-size: 0.9em; color: #777;">(${itemPrice.toFixed(2)} x ${item.quantity})</span>
            </span>
            <span class="item-controls">
                <button class="item-btn" onclick="updateItemQuantity(${index}, 1)">+</button>
                <button class="item-btn" onclick="updateItemQuantity(${index}, -1)">-</button>
                <button class="item-btn red" onclick="removeItem(${index})">X</button>
                <span style="font-weight: bold; margin-right: 10px;">${itemTotal.toFixed(2)} د.م.</span>
            </span>
        `;
        orderList.appendChild(li);
    });

    orderTotalSpan.textContent = total.toFixed(2);
    currentNumpadValue = "";
}

// 4.3.4. تحديد عنصر من الفاتورة للـ Numpad
function selectOrderItem(index) {
    selectedOrderItemIndex = index;
    updateOrderDisplay();
}

// 4.3.5. تحديث كمية العنصر
function updateItemQuantity(index, change) {
    currentOrder[index].quantity += change;
    if (currentOrder[index].quantity <= 0) {
        removeItem(index);
    } else {
        updateOrderDisplay();
    }
}

// 4.3.6. حذف عنصر من الفاتورة
function removeItem(index) {
    currentOrder.splice(index, 1);
    selectedOrderItemIndex = -1;
    updateOrderDisplay();
}

// 4.3.7. إضافة منتج بسعر مخصص
document.getElementById('custom-price-btn')?.addEventListener('click', function() {
    const price = parseFloat(prompt("أدخل السعر المخصص للمنتج:"));
    if (!isNaN(price) && price > 0) {
        currentOrder.push({
            id: Date.now(),
            name: "منتج مخصص",
            price: price, 
            tempPrice: price, 
            quantity: 1,
            isCustomPrice: true,
            category: "special"
        });
        updateOrderDisplay();
    } else if (price !== null) {
        alert("السعر المدخل غير صالح.");
    }
});


// ===============================================
// 4.4. وظائف الـ Numpad
// ===============================================

function setupNumpad() {
    numpadDisplay?.querySelectorAll('.numpad-btn').forEach(button => {
        button.addEventListener('click', () => handleNumpadInput(button.dataset.value, button.dataset.action));
    });
}

function handleNumpadInput(value, action) {
    // إدخال رقم
    if (!action) {
        if (currentNumpadValue === "" && value === ".") {
            currentNumpadValue = "0.";
        } else if (value === "." && currentNumpadValue.includes(".")) {
            return; 
        } else {
            currentNumpadValue += value;
        }
        console.log("Numpad Input:", currentNumpadValue);
        return;
    }
    
    // التعامل مع الأوامر
    const numValue = parseFloat(currentNumpadValue);
    
    if (action === "C") {
        currentNumpadValue = "";
        selectedOrderItemIndex = -1;
        updateOrderDisplay();
    } 
    else if (selectedOrderItemIndex === -1) {
        alert("الرجاء اختيار عنصر من الفاتورة أولاً لتعديله.");
        currentNumpadValue = "";
        return;
    } 
    else if (action === "QTY") {
        if (numValue > 0) {
            currentOrder[selectedOrderItemIndex].quantity = numValue;
            selectedOrderItemIndex = -1;
            updateOrderDisplay();
        } else {
            alert("الكمية يجب أن تكون أكبر من صفر.");
        }
        currentNumpadValue = "";
    } 
    else if (action === "PRICE") {
        if (numValue > 0) {
            currentOrder[selectedOrderItemIndex].tempPrice = numValue;
            currentOrder[selectedOrderItemIndex].isCustomPrice = true;
            selectedOrderItemIndex = -1;
            updateOrderDisplay();
        } else {
            alert("السعر يجب أن يكون أكبر من صفر.");
        }
        currentNumpadValue = "";
    } 
    else if (action === "DEL") {
        removeItem(selectedOrderItemIndex);
        currentNumpadValue = "";
    }
}


// ===============================================
// 4.5. وظائف الإجراءات والدفع
// ===============================================

function setupPOSButtons() {
    // 🔗 زر الإلغاء
    document.getElementById('cancel-btn')?.addEventListener('click', function() {
        if (confirm("هل أنت متأكد من إلغاء الطلب الحالي؟")) {
            currentOrder = []; 
            updateOrderDisplay(); 
            alert("تم إلغاء الطلب بنجاح.");
        }
    });

    // 🔗 زر الدفع (يفتح النافذة المنبثقة)
    document.getElementById('pay-btn')?.addEventListener('click', function() {
        if (currentOrder.length === 0) {
            alert("لا يوجد طلب للدفع.");
            return;
        }
        const total = parseFloat(orderTotalSpan.textContent);
        modalTotalDisplay.textContent = total.toFixed(2) + " د.م.";
        amountReceivedInput.value = total.toFixed(2);
        changeDueSpan.textContent = "0.00 د.م.";
        paymentModal.classList.remove('hidden');
    });
    
    // 🔗 وظيفة حساب الباقي
    amountReceivedInput?.addEventListener('input', function() {
        const total = parseFloat(orderTotalSpan.textContent);
        const received = parseFloat(this.value) || 0;
        const change = received - total;
        changeDueSpan.textContent = change >= 0 ? change.toFixed(2) + " د.م." : "0.00 د.م. (ناقص)";
        document.getElementById('complete-payment-btn').disabled = change < 0;
    });
    
    // 🔗 إتمام الدفع
    document.getElementById('complete-payment-btn')?.addEventListener('click', function() {
        const total = parseFloat(orderTotalSpan.textContent);
        const received = parseFloat(amountReceivedInput.value);
        const change = received - total;
        
        alert(`
        عملية دفع ناجحة!
        الإجمالي: ${total.toFixed(2)} د.م.
        المستلَم: ${received.toFixed(2)} د.م.
        الباقي: ${change.toFixed(2)} د.م.
        `);
        
        currentOrder = []; 
        updateOrderDisplay(); 
        paymentModal.classList.add('hidden');
    });

    // 🔗 إغلاق نافذة الدفع
    document.getElementById('close-modal-btn')?.addEventListener('click', function() {
        paymentModal.classList.add('hidden');
    });

    // 🔗 زر الطباعة
    document.getElementById('print-btn')?.addEventListener('click', function() {
        if (currentOrder.length > 0) {
            alert("جاري طباعة الفاتورة...");
        } else {
             alert("لا يوجد عناصر لطباعتها.");
        }
    });
    
    // 🔗 ربط أزرار الفلترة
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            currentFilter = this.dataset.category;
            renderProducts(currentFilter);
        });
    });
}

// ===============================================
// 🚀 4.6. تهيئة التطبيق عند التحميل
// ===============================================

// لضمان تحميل الدوال عند نهاية تحميل الصفحة
document.addEventListener('DOMContentLoaded', (event) => {
    setupPOSButtons();
    setupNumpad();
});