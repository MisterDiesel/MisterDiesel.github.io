/**
 * REDLINE COLLECTIVE - JavaScript Application Logic
 * Implements: Cart management, interactive modals, responsive menu toggles,
 * catalog filtering, scroll effects, and order simulation.
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. STATE & LOCAL STORAGE INITIALIZATION
    // ==========================================
    let cart = JSON.parse(localStorage.getItem('redline_cart')) || [];

    // ==========================================
    // 2. DOM ELEMENT REFERENCES
    // ==========================================
    // Header & Navigation
    const header = document.getElementById('main-header');
    const scrollIndicator = document.getElementById('scroll-indicator');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNavClose = document.getElementById('mobile-nav-close');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    const navLinks = document.querySelectorAll('.nav-link');

    // Cart Elements
    const cartToggleBtn = document.getElementById('cart-toggle-btn');
    const cartCloseBtn = document.getElementById('cart-close-btn');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartBadge = document.getElementById('cart-badge');
    const cartDrawerCount = document.getElementById('cart-drawer-count');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartEmptyState = document.getElementById('cart-empty');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const checkoutBtn = document.getElementById('checkout-btn');

    // Store Catalog Filtering
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    // Checkout Modal Elements
    const checkoutModal = document.getElementById('checkout-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const checkoutForm = document.getElementById('checkout-form');
    const checkoutSummaryItems = document.getElementById('checkout-summary-items');
    const summarySubtotal = document.getElementById('summary-subtotal');
    const summaryTotal = document.getElementById('summary-total');

    // Success Modal Elements
    const successModal = document.getElementById('success-modal');
    const successCloseBtn = document.getElementById('success-close-btn');
    const successRef = document.getElementById('success-ref');
    const successEmail = document.getElementById('success-email');

    // Contact/Join Form
    const joinForm = document.getElementById('join-form');

    // ==========================================
    // 3. SCROLL PROGRESS & HEADER STYLING
    // ==========================================
    window.addEventListener('scroll', () => {
        // Update top progress bar
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        scrollIndicator.style.width = scrolled + '%';

        // Header glassmorphism trigger
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Highlight active nav link on scroll
        highlightActiveLink();
    });

    function highlightActiveLink() {
        const sections = document.querySelectorAll('section');
        let scrollPosition = window.scrollY + 120; // offset header height

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // ==========================================
    // 4. MOBILE NAVIGATION DRAWER
    // ==========================================
    mobileMenuBtn.addEventListener('click', () => {
        mobileNav.classList.add('open');
        document.body.style.overflow = 'hidden'; // prevent scroll
    });

    const closeMobileMenu = () => {
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
    };

    mobileNavClose.addEventListener('click', closeMobileMenu);
    
    // Close mobile nav when clicking a link
    mobileLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // ==========================================
    // 5. EVENT RSVP
    // ==========================================
    window.rsvpEvent = (eventName) => {
        alert(`Awesome! You have RSVP'd for "${eventName}". We've added you to the event roster. See you there!`);
    };

    // ==========================================
    // 6. STORE CATALOG FILTERING
    // ==========================================
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Toggle active filter button style
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            productCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                // Add exit animation class first, then filter
                card.style.opacity = '0';
                card.style.transform = 'scale(0.95)';
                
                setTimeout(() => {
                    if (filterValue === 'all' || category === filterValue) {
                        card.style.display = 'flex';
                        // Re-trigger entrance transition
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'scale(1)';
                        }, 50);
                    } else {
                        card.style.display = 'none';
                    }
                }, 300);
            });
        });
    });

    // ==========================================
    // 7. CART DRAWER MANAGEMENT
    // ==========================================
    const openCart = () => {
        cartDrawer.classList.add('open');
        cartOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    };

    const closeCart = () => {
        cartDrawer.classList.remove('open');
        cartOverlay.classList.remove('open');
        document.body.style.overflow = '';
    };

    cartToggleBtn.addEventListener('click', openCart);
    cartCloseBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    // ==========================================
    // 8. CORE SHOPPING CART LOGIC
    // ==========================================
    
    // Update Cart UI, storage, badges
    function updateCartUI() {
        // Save current state
        localStorage.setItem('redline_cart', JSON.stringify(cart));

        // Count totals
        const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
        cartBadge.textContent = totalItemsCount;
        cartDrawerCount.textContent = totalItemsCount;

        // Render Cart Items
        cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            cartEmptyState.style.display = 'flex';
            cartItemsContainer.style.display = 'none';
            checkoutBtn.disabled = true;
            cartSubtotal.textContent = '$0.00';
        } else {
            cartEmptyState.style.display = 'none';
            cartItemsContainer.style.display = 'flex';
            checkoutBtn.disabled = false;

            let subtotal = 0;

            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                subtotal += itemTotal;

                const sizeDisplay = item.size ? `<span class="cart-item-size">Size: ${item.size}</span>` : '';
                
                const itemHTML = `
                    <div class="cart-item">
                        <img src="${item.img}" alt="${item.name}" class="cart-item-img">
                        <div class="cart-item-details">
                            <div>
                                <h4 class="cart-item-title">${item.name}</h4>
                                ${sizeDisplay}
                            </div>
                            <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                            <div class="cart-item-quantity">
                                <button class="qty-btn" onclick="adjustItemQty('${item.id}', '${item.size || ''}', -1)">-</button>
                                <span class="qty-val">${item.quantity}</span>
                                <button class="qty-btn" onclick="adjustItemQty('${item.id}', '${item.size || ''}', 1)">+</button>
                            </div>
                        </div>
                        <button class="remove-item-btn" onclick="removeItemFromCart('${item.id}', '${item.size || ''}')" aria-label="Remove Item">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                `;
                cartItemsContainer.insertAdjacentHTML('beforeend', itemHTML);
            });

            cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
        }
    }

    // Add Item Event Listeners
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.getAttribute('data-id');
            const name = btn.getAttribute('data-name');
            const price = parseFloat(btn.getAttribute('data-price'));
            const img = btn.getAttribute('data-img');
            const hasSize = btn.getAttribute('data-has-size') === 'true';
            
            let size = null;
            if (hasSize) {
                // Find selector relative to card
                const selectElement = btn.parentElement.querySelector('.product-size-select');
                size = selectElement ? selectElement.value : 'M';
            }

            addItemToCart(id, name, price, img, size);
            
            // Visual bounce feedback on the cart icon button
            cartToggleBtn.style.transform = 'scale(1.2)';
            setTimeout(() => {
                cartToggleBtn.style.transform = 'scale(1)';
            }, 200);
        });
    });

    function addItemToCart(id, name, price, img, size) {
        const existingItemIndex = cart.findIndex(item => item.id === id && item.size === size);

        if (existingItemIndex > -1) {
            // Increment quantity
            cart[existingItemIndex].quantity += 1;
        } else {
            // Push new item
            cart.push({
                id,
                name,
                price,
                img,
                size,
                quantity: 1
            });
        }

        updateCartUI();
        openCart(); // Auto-open cart drawer on add
    }

    // Accessible globally since they are embedded in inline HTML strings
    window.adjustItemQty = (id, size, change) => {
        const itemIndex = cart.findIndex(item => item.id === id && (item.size || '') === size);
        
        if (itemIndex > -1) {
            cart[itemIndex].quantity += change;
            
            if (cart[itemIndex].quantity <= 0) {
                cart.splice(itemIndex, 1);
            }
            
            updateCartUI();
        }
    };

    window.removeItemFromCart = (id, size) => {
        cart = cart.filter(item => !(item.id === id && (item.size || '') === size));
        updateCartUI();
    };

    // ==========================================
    // 9. SIMULATED CHECKOUT MODAL FLOW
    // ==========================================
    checkoutBtn.addEventListener('click', () => {
        closeCart();
        openCheckoutModal();
    });

    function openCheckoutModal() {
        checkoutModal.classList.add('open');
        document.body.style.overflow = 'hidden';

        // Populate Summary
        checkoutSummaryItems.innerHTML = '';
        let subtotal = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;

            const sizeLabel = item.size ? ` (${item.size})` : '';
            const summaryHTML = `
                <div class="summary-item">
                    <span class="summary-item-name">${item.name}${sizeLabel} <span class="text-muted">x${item.quantity}</span></span>
                    <span class="summary-item-price">$${itemTotal.toFixed(2)}</span>
                </div>
            `;
            checkoutSummaryItems.insertAdjacentHTML('beforeend', summaryHTML);
        });

        summarySubtotal.textContent = `$${subtotal.toFixed(2)}`;
        summaryTotal.textContent = `$${subtotal.toFixed(2)}`;
    }

    const closeCheckoutModal = () => {
        checkoutModal.classList.remove('open');
        document.body.style.overflow = '';
    };

    modalCloseBtn.addEventListener('click', closeCheckoutModal);

    // ==========================================
    // 10. ORDER FORM SUBMISSION SIMULATION
    // ==========================================
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Retrieve customer details
        const email = document.getElementById('checkout-email').value;
        const firstName = document.getElementById('checkout-first-name').value;
        const lastName = document.getElementById('checkout-last-name').value;

        // Generate random reference ID
        const randomRefNum = Math.floor(10000 + Math.random() * 90000);
        const refId = `#RL-${randomRefNum}`;

        // Close checkout modal
        closeCheckoutModal();

        // Populate Success Modal Details
        successRef.textContent = refId;
        successEmail.textContent = email;

        // Reset Cart State
        cart = [];
        updateCartUI();

        // Trigger Success Modal display
        setTimeout(() => {
            successModal.classList.add('open');
            document.body.style.overflow = 'hidden';
        }, 300);
    });

    // Close Success Modal
    successCloseBtn.addEventListener('click', () => {
        successModal.classList.remove('open');
        document.body.style.overflow = '';
    });

    // ==========================================
    // 11. CLUB JOIN FORM SUBMISSION
    // ==========================================
    joinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('form-name').value;
        const vehicle = document.getElementById('form-vehicle').value;
        const email = document.getElementById('form-email').value;
        const message = document.getElementById('form-message').value;

        const subject = encodeURIComponent(`REDLINE Collective Club Join Request - ${name}`);
        const bodyText = `Hello REDLINE Collective,

I would like to join the collective and stay updated on meets, cruises, and events in Medicine Hat!

My Details:
------------------------------------------
Name: ${name}
Email: ${email}
Vehicle: ${vehicle}

About my passion / build:
${message ? message : 'Not provided.'}

------------------------------------------
Looking forward to the next meet!`;

        const body = encodeURIComponent(bodyText);
        
        // Trigger default mail client
        window.location.href = `mailto:redlinecollectiveco@gmail.com?subject=${subject}&body=${body}`;
        
        // Give brief confirmation feedback
        alert(`Opening your email client to send your join request. Thank you, ${name}!`);
        joinForm.reset();
    });

    // ==========================================
    // INITIALIZATION RUN
    // ==========================================
    updateCartUI();
});
