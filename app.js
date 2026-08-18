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

    // Colour variant image swapper for product cards
    window.swapVariant = (imgId, newSrc, clickedSwatch) => {
        // Swap the displayed image
        const imgEl = document.getElementById(imgId);
        if (imgEl) {
            imgEl.src = newSrc;
        }

        // Update the cart button's data-img so the correct variant goes into cart
        const card = clickedSwatch.closest('.product-card');
        if (card) {
            const cartBtn = card.querySelector('.add-to-cart-btn');
            if (cartBtn) {
                cartBtn.setAttribute('data-img', newSrc);
            }
        }

        // Highlight the active swatch
        const allSwatches = clickedSwatch.closest('.variant-swatches').querySelectorAll('.swatch');
        allSwatches.forEach(s => s.classList.remove('active'));
        clickedSwatch.classList.add('active');
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

        const submitBtn = joinForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;

        // Change button to loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending...';

        // -------------------------------------------------------------
        // Web3Forms Configuration:
        // Paste your Access Key from web3forms.com between the quotes below
        // -------------------------------------------------------------
        const accessKey = "cdd9b7ac-3289-46f5-9d60-362905685b30"; 

        const formData = {
            access_key: accessKey,
            subject: `New REDLINE Collective Sign-up: ${name}`,
            from_name: "REDLINE Website Contact Form",
            name: name,
            email: email,
            vehicle: vehicle,
            message: message || "No message details provided."
        };

        // Send API request in the background
        fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(async (response) => {
            let json = await response.json();
            if (response.status == 200) {
                // Success feedback
                alert(`Thanks for joining, ${name}! Your request has been sent. We'll email you at ${email} before our next local Medicine Hat meet!`);
                joinForm.reset();
            } else {
                // Handle API error codes
                console.error("Web3Forms error response:", json);
                if (accessKey === "YOUR_ACCESS_KEY_HERE") {
                    alert("Form setup is incomplete! Please replace 'YOUR_ACCESS_KEY_HERE' in app.js with your free access key from web3forms.com to receive submissions.");
                } else {
                    alert(json.message || "There was an error sending your submission. Please try again.");
                }
            }
        })
        .catch(error => {
            console.error("Network error during form submission:", error);
            alert("A network error occurred. Please check your internet connection and try again.");
        })
        .finally(() => {
            // Restore button text and state
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        });
    });

    // ==========================================
    // INITIALIZATION RUN
    // ==========================================
    updateCartUI();
});
