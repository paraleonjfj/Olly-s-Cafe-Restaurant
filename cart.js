document.addEventListener("DOMContentLoaded", function () {

    const cards = document.querySelectorAll(".menu-card");
    if (cards.length === 0) return;

    const STORAGE_KEY = "ollysCart";
    let cart = [];

    try {
        cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
        cart = [];
    }

    function saveCart() {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch (e) {}
    }

    function formatMoney(n) {
        return "₱" + Number(n).toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function toNumber(text) {
        const m = String(text || "").replace(/,/g, "").match(/\d+(\.\d+)?/);
        return m ? Number(m[0]) : 0;
    }

    // ---------- PRODUCT DETAILS ----------
    function getProduct(card) {
        const name = card.querySelector("h3").textContent.trim();
        const select = card.querySelector(".cake-size");
        const priceEl = card.querySelector(".product-price");

        if (select && priceEl) {
            const variant = select.value;
            const price = variant === "Whole"
                ? toNumber(priceEl.dataset.wholePrice)
                : toNumber(priceEl.dataset.slicePrice);
            return { name, variant, price };
        }

        const span = card.querySelector(".menu-bottom span");
        return { name, variant: "", price: toNumber(span ? span.textContent : 0) };
    }

    // Cake: change price when Slice/Whole is chosen
    document.querySelectorAll(".cake-size").forEach(function (select) {
        select.addEventListener("change", function () {
            const card = select.closest(".menu-card");
            card.querySelector(".product-price").textContent =
                formatMoney(getProduct(card).price);
        });
    });

    // Make sure every card has an ADD TO CART button
    cards.forEach(function (card) {
        const bottom = card.querySelector(".menu-bottom");
        if (bottom && !bottom.querySelector(".add-cart-btn")) {
            const b = document.createElement("button");
            b.type = "button";
            b.className = "add-cart-btn";
            b.textContent = "ADD TO CART";
            bottom.appendChild(b);
        }
    });

    // ---------- BUILD CART UI ----------
    const cartButton = document.createElement("button");
    cartButton.type = "button";
    cartButton.className = "cart-floating-button";
    cartButton.innerHTML = 'CART <span id="cart-count">0</span>';
    document.body.appendChild(cartButton);

    const overlay = document.createElement("div");
    overlay.className = "cart-overlay";
    overlay.innerHTML = `
        <div class="cart-panel">
            <div class="cart-header">
                <h2>Your Cart</h2>
                <button type="button" class="cart-close">&times;</button>
            </div>

            <div id="cart-items"></div>

            <div class="cart-summary">
                <div class="cart-total-row">
                    <span>Subtotal</span>
                    <strong id="cart-subtotal">₱0.00</strong>
                </div>
                <div class="cart-total-row grand-total-row">
                    <span>Total</span>
                    <strong id="cart-total">₱0.00</strong>
                </div>
            </div>

            <div class="payment-section">
                <h3>Payment</h3>

                <label for="payment-method">Mode of Payment</label>
                <select id="payment-method">
                    <option value="Cash">Cash</option>
                    <option value="GCash">GCash</option>
                    <option value="Maya">Maya</option>
                    <option value="Credit/Debit Card">Credit / Debit Card</option>
                </select>

                <div id="cash-fields">
                    <label for="payment-amount">Amount Received (₱)</label>
                    <input type="number" id="payment-amount" min="0" step="0.01"
                           placeholder="Enter amount received">

                    <div class="cart-total-row">
                        <span>Change</span>
                        <strong id="payment-change">₱0.00</strong>
                    </div>
                </div>

                <button type="button" id="checkout-button">PLACE ORDER</button>
                <p class="payment-note">Demo checkout only. No actual payment is processed.</p>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    const countEl = document.getElementById("cart-count");
    const itemsEl = document.getElementById("cart-items");
    const subtotalEl = document.getElementById("cart-subtotal");
    const totalEl = document.getElementById("cart-total");
    const methodEl = document.getElementById("payment-method");
    const cashFields = document.getElementById("cash-fields");
    const amountEl = document.getElementById("payment-amount");
    const changeEl = document.getElementById("payment-change");
    const checkoutBtn = document.getElementById("checkout-button");

    function getTotal() {
        return cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    }

    function updateChange() {
        const total = getTotal();
        const paid = Number(amountEl.value);
        changeEl.textContent =
            (amountEl.value === "" || paid < total) ? "₱0.00" : formatMoney(paid - total);
    }

    // Show amount/change only for Cash
    methodEl.addEventListener("change", function () {
        cashFields.style.display = methodEl.value === "Cash" ? "block" : "none";
    });

    // ---------- DISPLAY CART ----------
    function displayCart() {
        itemsEl.innerHTML = "";

        countEl.textContent = cart.reduce((s, i) => s + i.quantity, 0);

        if (cart.length === 0) {
            itemsEl.innerHTML = '<p class="empty-cart">Your cart is empty.</p>';
        }

        cart.forEach(function (item, index) {
            const row = document.createElement("div");
            row.className = "cart-item";
            row.innerHTML = `
                <div>
                    <h4>${item.name}</h4>
                    ${item.variant ? "<p>" + item.variant + "</p>" : ""}
                    <p>${formatMoney(item.price)} each</p>
                </div>
                <strong>${formatMoney(item.price * item.quantity)}</strong>
                <div class="cart-item-bottom">
                    <div class="cart-item-controls">
                        <button type="button" data-action="minus" data-index="${index}">−</button>
                        <span>${item.quantity}</span>
                        <button type="button" data-action="plus" data-index="${index}">+</button>
                    </div>
                    <button type="button" class="remove-cart-item"
                            data-action="remove" data-index="${index}">Remove</button>
                </div>
            `;
            itemsEl.appendChild(row);
        });

        const total = getTotal();
        subtotalEl.textContent = formatMoney(total);
        totalEl.textContent = formatMoney(total);
        updateChange();
    }

    // + / − / Remove buttons inside the cart
    itemsEl.addEventListener("click", function (e) {
        const btn = e.target.closest("button[data-action]");
        if (!btn) return;

        const i = Number(btn.dataset.index);
        const action = btn.dataset.action;

        if (action === "plus") cart[i].quantity++;
        if (action === "minus") {
            cart[i].quantity > 1 ? cart[i].quantity-- : cart.splice(i, 1);
        }
        if (action === "remove") cart.splice(i, 1);

        saveCart();
        displayCart();
    });

    // ---------- ADD TO CART ----------
    document.addEventListener("click", function (e) {
        const btn = e.target.closest(".add-cart-btn");
        if (!btn) return;

        const product = getProduct(btn.closest(".menu-card"));

        if (!product.price) {
            alert("Sorry, the product price could not be read.");
            return;
        }

        const existing = cart.find(i =>
            i.name === product.name && i.variant === product.variant);

        if (existing) {
            existing.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        saveCart();
        displayCart();

        cartButton.classList.add("cart-added");
        setTimeout(() => cartButton.classList.remove("cart-added"), 250);
    });

    // ---------- OPEN / CLOSE CART ----------
    cartButton.addEventListener("click", () => overlay.classList.add("show"));
    overlay.querySelector(".cart-close").addEventListener("click",
        () => overlay.classList.remove("show"));
    overlay.addEventListener("click", function (e) {
        if (e.target === overlay) overlay.classList.remove("show");
    });
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") overlay.classList.remove("show");
    });

    amountEl.addEventListener("input", updateChange);

    // ---------- CHECKOUT ----------
    checkoutBtn.addEventListener("click", function () {
        if (cart.length === 0) {
            alert("Your cart is empty.");
            return;
        }

        const total = getTotal();
        const method = methodEl.value;
        let message = "Thank you for your order!\n\n" +
                      "Total: " + formatMoney(total) + "\n" +
                      "Payment Method: " + method;

        if (method === "Cash") {
            const paid = Number(amountEl.value);

            if (amountEl.value === "" || paid <= 0) {
                alert("Please enter the amount received.");
                amountEl.focus();
                return;
            }
            if (paid < total) {
                alert("Insufficient payment. Please enter a higher amount.");
                amountEl.focus();
                return;
            }
            message += "\nAmount Received: " + formatMoney(paid) +
                       "\nChange: " + formatMoney(paid - total);
        }

        alert(message);

        cart = [];
        saveCart();
        amountEl.value = "";
        displayCart();
        overlay.classList.remove("show");
    });

    displayCart();
});