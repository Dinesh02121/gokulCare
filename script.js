// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCHY2RSmHmME_wLbBzibuIMP4VFG-Vy9Fo",
    authDomain: "milk-product-7609c.firebaseapp.com",
    databaseURL: "https://milk-product-7609c-default-rtdb.firebaseio.com",
    projectId: "milk-product-7609c",
    storageBucket: "milk-product-7609c.firebasestorage.app",
    messagingSenderId: "893060028667",
    appId: "1:893060028667:web:1a21b7152ca46aa955385e",
    measurementId: "G-X2XMLQ6Z79"
};

// WhatsApp Configuration
const WHATSAPP_NUMBER = "918008425005";

// Initialize Firebase
let db;
let productsRef;
let firebaseInitialized = false;

function initializeFirebase() {
    try {
        if (typeof firebase !== 'undefined' && !firebaseInitialized) {
            firebase.initializeApp(firebaseConfig);
            db = firebase.database();
            productsRef = db.ref('products');
            firebaseInitialized = true;
            console.log('✅ Firebase initialized successfully');
            
            // Listen for real-time updates from Firebase
            productsRef.on('value', (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    products = Object.keys(data).map(key => ({
                        ...data[key],
                        id: parseInt(key) || data[key].id
                    }));
                    renderProducts();
                    console.log('✅ Products loaded from Firebase:', products.length);
                } else {
                    products = [];
                    renderProducts();
                    console.log('ℹ️ No products in database');
                }
            }, (error) => {
                console.error('❌ Firebase read error:', error);
            });
        } else {
            console.log('⚠️ Firebase not available');
        }
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
    }
}

// Global State
let isAdmin = false;
let editingProductId = null;
let currentProduct = null;
let mainImageFile = null;
let labelImageFile = null;
let additionalImageFiles = [];
let products = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing application...');
    initializeFirebase();
    setTimeout(() => {
        renderProducts();
        updateNavigation();
    }, 1000);
});

// Loading screen logic
window.addEventListener('load', function() {
    setTimeout(function() {
        const loadingScreen = document.getElementById('loading-screen');
        const mainContent = document.getElementById('main-content');
        
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
        
        if (mainContent) {
            setTimeout(function() {
                mainContent.classList.add('visible');
            }, 300);
        }
    }, 1500);
});

// Fallback timeout
setTimeout(function() {
    const loadingScreen = document.getElementById('loading-screen');
    const mainContent = document.getElementById('main-content');
    
    if (mainContent && !mainContent.classList.contains('visible')) {
        if (loadingScreen) loadingScreen.classList.add('hidden');
        mainContent.classList.add('visible');
        console.log('Loading screen timeout reached - forcing content display');
    }
}, 5000);

// WhatsApp Functions
function inquireProduct() {
    if (!currentProduct) return;
    
    const productName = currentProduct.name || 'Product';
    const productPrice = currentProduct.price || 'N/A';
    const productVolume = currentProduct.volume || '';
    const message = `Hello Gokul Vet Care! 👋\n\nI'm interested in:\n📦 *${productName}*${productVolume ? `\n📏 Size: ${productVolume}` : ''}\n💰 Price: ₹${productPrice}\n\nCould you please provide more details?`;
    
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

function handleContactSubmit() {
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const phone = document.getElementById('contactPhone').value.trim();
    const message = document.getElementById('contactMessage').value.trim();
    
    if (!name || !email || !message) {
        alert('❌ Please fill in all required fields (Name, Email, Message)');
        return;
    }
    
    const whatsappMessage = `*New Contact Query* 📬\n\n*Name:* ${name}\n*Email:* ${email}\n*Phone:* ${phone || 'Not provided'}\n\n*Message:*\n${message}`;
    
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, '_blank');
    
    // Clear form
    document.getElementById('contactName').value = '';
    document.getElementById('contactEmail').value = '';
    document.getElementById('contactPhone').value = '';
    document.getElementById('contactMessage').value = '';
    
    alert('✅ Redirecting to WhatsApp...');
}

// Compress and convert image to Base64
function compressImage(file, maxWidth = 600, quality = 0.6) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                const base64 = canvas.toDataURL('image/jpeg', quality);
                resolve(base64);
            };
            
            img.onerror = reject;
        };
        
        reader.onerror = reject;
    });
}

// Save products to Firebase Database
async function saveProductsToStorage() {
    if (!firebaseInitialized || !productsRef) {
        alert('❌ Firebase not connected. Please check your internet connection.');
        return false;
    }
    
    try {
        const productsObj = {};
        products.forEach(product => {
            productsObj[product.id] = product;
        });
        await productsRef.set(productsObj);
        console.log('✅ Products saved to Firebase:', products.length);
        return true;
    } catch (error) {
        console.error('❌ Firebase save error:', error);
        alert('❌ Error saving to Firebase: ' + error.message);
        return false;
    }
}

// Page Navigation
function showPage(pageName) {
    const pages = document.querySelectorAll('.page');
    if (!pages || pages.length === 0) {
        console.error('❌ No pages found');
        return;
    }
    
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    const targetPage = document.getElementById(pageName + 'Page');
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageName) {
            link.classList.add('active');
        }
    });
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Mobile Menu
function toggleMobileMenu() {
    const mobileNav = document.getElementById('mobileNav');
    const menuIcon = document.getElementById('menuIcon');
    
    if (!mobileNav || !menuIcon) return;
    
    mobileNav.classList.toggle('active');
    menuIcon.textContent = mobileNav.classList.contains('active') ? '✕' : '☰';
}

// Scroll to Products
function scrollToProducts() {
    const section = document.getElementById('productsSection');
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Admin Functions
function toggleAdminLogin() {
    if (isAdmin) {
        handleLogout();
    } else {
        const modal = document.getElementById('adminModal');
        if (modal) {
            modal.classList.add('active');
        }
    }
}

function closeAdminModal() {
    const modal = document.getElementById('adminModal');
    const passwordInput = document.getElementById('adminPassword');
    
    if (modal) modal.classList.remove('active');
    if (passwordInput) passwordInput.value = '';
}

function handleEnterKey(event) {
    if (event.key === 'Enter') {
        handleAdminLogin();
    }
}

function handleAdminLogin() {
    const passwordInput = document.getElementById('adminPassword');
    if (!passwordInput) return;
    
    const password = passwordInput.value;
    
    if (password === 'admin123') {
        isAdmin = true;
        closeAdminModal();
        updateAdminUI();
        alert('✅ Admin login successful! You can now add products.');
    } else {
        alert('❌ Incorrect password');
    }
}

function handleLogout() {
    isAdmin = false;
    editingProductId = null;
    updateAdminUI();
    clearForm();
    alert('✅ Admin logged out');
}

function updateAdminUI() {
    const adminForm = document.getElementById('adminForm');
    const adminBtn = document.getElementById('adminBtn');
    const adminBtnMobile = document.getElementById('adminBtnMobile');
    
    if (isAdmin) {
        if (adminForm) adminForm.style.display = 'block';
        if (adminBtn) {
            adminBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
            adminBtn.style.background = '#ef4444';
        }
        if (adminBtnMobile) {
            adminBtnMobile.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout Admin';
            adminBtnMobile.style.background = '#ef4444';
        }
    } else {
        if (adminForm) adminForm.style.display = 'none';
        if (adminBtn) {
            adminBtn.innerHTML = '<i class="fas fa-lock"></i> Admin';
            adminBtn.style.background = '#10b981';
        }
        if (adminBtnMobile) {
            adminBtnMobile.innerHTML = '<i class="fas fa-lock"></i> Admin Login';
            adminBtnMobile.style.background = '#10b981';
        }
    }
    
    renderProducts();
}

// Product Functions
function calculateDiscount(price, originalPrice) {
    if (!originalPrice || originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
}

function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) {
        console.warn('⚠️ Products grid not found');
        return;
    }
    
    grid.innerHTML = '';
    
    if (products.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <p class="empty-title">No products available yet</p>
                <p class="empty-subtitle">${isAdmin ? 'Add your first product using the form above' : 'Admin: Login to add products'}</p>
            </div>
        `;
        return;
    }
    
    products.forEach(product => {
        const card = createProductCard(product);
        grid.appendChild(card);
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const discount = product.discount || 0;
    const features = product.features || [];
    const tag = product.tag || 'New';
    const image = product.image || 'https://via.placeholder.com/400x300?text=No+Image';
    const name = product.name || 'Unnamed Product';
    const volume = product.volume || '';
    const price = product.price || 0;
    const originalPrice = product.originalPrice || price;
    const inStock = product.inStock !== false;
    
    const discountHTML = discount > 0 ? `
        <div class="product-discount">
            <div class="discount-percent">${discount}%</div>
            <div class="discount-text">Off</div>
        </div>
    ` : '';
    
    const featuresHTML = features.slice(0, 4).map(feature => `
        <div class="feature-item">
            <span class="feature-check"><i class="fas fa-check-circle"></i></span>
            <span>${feature}</span>
        </div>
    `).join('');
    
    const adminActionsHTML = isAdmin ? `
        <div class="product-admin-actions">
            <button class="btn-edit" onclick="handleEditProduct(${product.id})">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn-delete" onclick="handleDeleteProduct(${product.id})">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    ` : '';
    
    card.innerHTML = `
        <div class="product-image-container">
            ${discountHTML}
            <div class="product-tag"><i class="fas fa-tag"></i> ${tag}</div>
            <img src="${image}" alt="${name}" class="product-image" onerror="this.src='https://via.placeholder.com/400x300?text=Image+Not+Found'">
        </div>
        <div class="product-details">
            <h3 class="product-name">${name}</h3>
            <p class="product-volume"><i class="fas fa-box"></i> ${volume}</p>
            <div class="product-pricing">
                <span class="product-price">₹${price}</span>
                ${originalPrice > price ? `<span class="product-original-price">₹${originalPrice}</span>` : ''}
            </div>
            <p class="product-stock ${inStock ? 'in-stock' : 'out-of-stock'}">
                <i class="fas ${inStock ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                ${inStock ? 'In Stock' : 'Out of Stock'}
            </p>
            <button class="btn-view" onclick="viewProductDetails(${product.id})">
                <i class="fas fa-eye"></i> View Details
            </button>
            ${adminActionsHTML}
        </div>
        ${features.length > 0 ? `<div class="product-features">${featuresHTML}</div>` : ''}
    `;
    
    return card;
}

function viewProductDetails(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    currentProduct = product;
    
    const name = product.name || 'Unnamed Product';
    const description = product.description || '';
    const features = product.features || [];
    const images = product.images || (product.image ? [product.image] : []);
    const volume = product.volume || '';
    const price = product.price || 0;
    const originalPrice = product.originalPrice || price;
    
    const nameEl = document.getElementById('detailProductName');
    const descEl = document.getElementById('detailProductDescription');
    
    if (nameEl) nameEl.textContent = name;
    if (descEl) descEl.textContent = description;
    
    const mainImage = document.getElementById('mainProductImage');
    if (mainImage) {
        mainImage.src = images[0] || 'https://via.placeholder.com/400?text=No+Image';
        mainImage.alt = name;
        mainImage.onerror = function() {
            this.src = 'https://via.placeholder.com/400?text=Image+Not+Found';
        };
    }
    
    const thumbnailContainer = document.getElementById('thumbnailImages');
    if (thumbnailContainer) {
        thumbnailContainer.innerHTML = '';
        
        images.forEach((img, index) => {
            const thumbnail = document.createElement('div');
            thumbnail.className = `thumbnail-image ${index === 0 ? 'active' : ''}`;
            thumbnail.innerHTML = `<img src="${img}" alt="${name}" onerror="this.src='https://via.placeholder.com/80?text=No+Image'">`;
            thumbnail.onclick = () => changeMainImage(img, thumbnail);
            thumbnailContainer.appendChild(thumbnail);
        });
    }
    
    const featuresContainer = document.getElementById('detailFeatures');
    if (featuresContainer) {
        featuresContainer.innerHTML = '';
        features.forEach(feature => {
            const featureDiv = document.createElement('div');
            featureDiv.className = 'detail-feature-item';
            featureDiv.innerHTML = `
                <span class="detail-feature-icon"><i class="fas fa-check-circle"></i></span>
                <span>${feature}</span>
            `;
            featuresContainer.appendChild(featureDiv);
        });
    }
    
    const priceEl = document.getElementById('detailPrice');
    const originalPriceEl = document.getElementById('detailOriginalPrice');
    const volumeEl = document.getElementById('detailVolume');
    
    if (priceEl) priceEl.textContent = `₹${price}`;
    if (originalPriceEl) originalPriceEl.textContent = originalPrice > price ? `₹${originalPrice}` : '';
    if (volumeEl) volumeEl.textContent = volume;
    
    renderCompositionTable(product.composition);
    renderDosageInfo(product.dosage);
    renderLabelImage(product.labelImage);
    
    showPage('productDetail');
}

function changeMainImage(imageSrc, thumbnailElement) {
    const mainImage = document.getElementById('mainProductImage');
    if (mainImage) {
        mainImage.src = imageSrc;
    }
    
    document.querySelectorAll('.thumbnail-image').forEach(thumb => {
        thumb.classList.remove('active');
    });
    
    if (thumbnailElement) {
        thumbnailElement.classList.add('active');
    }
}

function renderCompositionTable(composition) {
    const table = document.getElementById('nutritionTable');
    if (!table) return;
    
    table.innerHTML = '';
    
    if (!composition) {
        table.innerHTML = '<tr><td colspan="2" style="text-align: center; padding: 2rem; color: #6b7280;">No composition information available</td></tr>';
        return;
    }
    
    const compositionData = [
        { label: 'Calcium', value: composition.calcium },
        { label: 'Phosphorus', value: composition.phosphorus },
        { label: 'Vitamin A', value: composition.vitaminA },
        { label: 'Vitamin B12', value: composition.vitaminB12 },
        { label: 'Vitamin D3', value: composition.vitaminD3 },
        { label: 'Vitamin H', value: composition.vitaminH },
        { label: 'Ch. Chromium', value: composition.chChromium },
        { label: 'Ch. Cobalt', value: composition.chCobalt },
        { label: 'Ch. Copper', value: composition.chCopper },
        { label: 'Iodine', value: composition.iodine },
        { label: 'Potassium', value: composition.potassium },
        { label: 'Jivanti', value: composition.jivanti },
        { label: 'Shatavari', value: composition.shatavari },
        { label: 'Wheat Lecithin', value: composition.wheatLecithin },
        { label: 'Dextrose', value: composition.dextrose },
        { label: 'Herbal Extracts', value: composition.herbalExtracts },
        { label: 'Color', value: composition.color }
    ];
    
    compositionData.forEach(item => {
        if (item.value) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.label}</td>
                <td>${item.value}</td>
            `;
            table.appendChild(row);
        }
    });
}

function renderDosageInfo(dosage) {
    const dosageDiv = document.getElementById('dosageInfo');
    if (!dosageDiv) return;
    
    if (!dosage) {
        dosageDiv.innerHTML = '<p style="color: #6b7280;">No dosage information available</p>';
        return;
    }
    
    dosageDiv.innerHTML = `
        <div style="background: #f0fdf4; padding: 1.5rem; border-radius: 0.5rem; margin-top: 1rem;">
            ${dosage.cowBuffalo ? `
                <div style="margin-bottom: 1rem;">
                    <h4 style="color: #065f46; margin-bottom: 0.5rem;"><i class="fas fa-horse"></i> Cow / Buffalo / Horse</h4>
                    <p style="color: #374151;">${dosage.cowBuffalo}</p>
                </div>
            ` : ''}
            ${dosage.sheepGoat ? `
                <div style="margin-bottom: 1rem;">
                    <h4 style="color: #065f46; margin-bottom: 0.5rem;"><i class="fas fa-paw"></i> Calf / Sheep / Pig</h4>
                    <p style="color: #374151;">${dosage.sheepGoat}</p>
                </div>
            ` : ''}
            ${dosage.dogCat ? `
                <div style="margin-bottom: 1rem;">
                    <h4 style="color: #065f46; margin-bottom: 0.5rem;"><i class="fas fa-dog"></i> Dog / Cat</h4>
                    <p style="color: #374151;">${dosage.dogCat}</p>
                </div>
            ` : ''}
            ${dosage.note ? `
                <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #d1fae5;">
                    <p style="color: #059669; font-weight: 500;"><strong><i class="fas fa-info-circle"></i> Note:</strong> ${dosage.note}</p>
                </div>
            ` : ''}
            <div style="margin-top: 1rem; padding: 0.75rem; background: #fef3c7; border-radius: 0.5rem; border-left: 4px solid #f59e0b;">
                <p style="color: #92400e; font-size: 0.875rem;"><i class="fas fa-exclamation-triangle"></i> <strong>Important:</strong> Dosage should be administered as directed by the Veterinarian. Protect from heat & direct sunlight.</p>
            </div>
        </div>
    `;
}

function renderLabelImage(labelImage) {
    const labelImg = document.getElementById('labelImageFull');
    const labelDisplay = document.getElementById('labelImageDisplay');
    
    if (!labelImg || !labelDisplay) return;
    
    if (labelImage) {
        labelImg.src = labelImage;
        labelImg.style.display = 'block';
        labelImg.onerror = function() {
            this.style.display = 'none';
            labelDisplay.innerHTML = '<p style="color: #6b7280; text-align: center;"><i class="fas fa-image"></i> Label image not available</p>';
        };
    } else {
        labelImg.style.display = 'none';
        labelDisplay.innerHTML = '<p style="color: #6b7280; text-align: center;"><i class="fas fa-image"></i> No label image available</p>';
    }
}

function showTab(tabName) {
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const targetTab = document.getElementById(tabName + 'Tab');
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    if (event && event.target) {
        event.target.classList.add('active');
    }
}

// Image Upload Functions
function previewMainImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
        alert('⚠️ Image is too large! Please use an image smaller than 2MB for best results.');
        event.target.value = '';
        return;
    }
    
    mainImageFile = file;
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const preview = document.getElementById('mainImagePreview');
        if (preview) {
            preview.innerHTML = `
                <div class="preview-image-container">
                    <img src="${e.target.result}" alt="Preview" class="preview-image">
                    <button type="button" class="remove-image-btn" onclick="removeMainImage()">×</button>
                    <p style="font-size: 0.75rem; color: #6b7280; margin-top: 0.5rem;">Size: ${(file.size / 1024).toFixed(0)}KB</p>
                </div>
            `;
        }
    };
    
    reader.readAsDataURL(file);
}

function removeMainImage() {
    mainImageFile = null;
    const fileInput = document.getElementById('productImage');
    const preview = document.getElementById('mainImagePreview');
    
    if (fileInput) fileInput.value = '';
    if (preview) preview.innerHTML = '';
}

function previewLabelImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
        alert('⚠️ Image is too large! Please use an image smaller than 2MB for best results.');
        event.target.value = '';
        return;
    }
    
    labelImageFile = file;
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const preview = document.getElementById('labelImagePreview');
        if (preview) {
            preview.innerHTML = `
                <div class="preview-image-container">
                    <img src="${e.target.result}" alt="Label Preview" class="preview-image">
                    <button type="button" class="remove-image-btn" onclick="removeLabelImage()">×</button>
                    <p style="font-size: 0.75rem; color: #6b7280; margin-top: 0.5rem;">Size: ${(file.size / 1024).toFixed(0)}KB</p>
                </div>
            `;
        }
    };
    
    reader.readAsDataURL(file);
}

function removeLabelImage() {
    labelImageFile = null;
    const fileInput = document.getElementById('labelImage');
    const preview = document.getElementById('labelImagePreview');
    
    if (fileInput) fileInput.value = '';
    if (preview) preview.innerHTML = '';
}

function previewAdditionalImages(event) {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    
    const oversizedFiles = files.filter(f => f.size > 2 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
        alert('⚠️ Some images are too large! Please use images smaller than 2MB each.');
        event.target.value = '';
        return;
    }
    
    additionalImageFiles = files;
    const preview = document.getElementById('additionalImagesPreview');
    if (!preview) return;
    
    preview.innerHTML = '';
    
    files.forEach((file, index) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const container = document.createElement('div');
            container.className = 'preview-image-container';
            container.innerHTML = `
                <img src="${e.target.result}" alt="Preview ${index + 1}" class="preview-image">
                <button type="button" class="remove-image-btn" onclick="removeAdditionalImage(${index})">×</button>
            `;
            preview.appendChild(container);
        };
        
        reader.readAsDataURL(file);
    });
}

function removeAdditionalImage(index) {
    additionalImageFiles.splice(index, 1);
    
    const dataTransfer = new DataTransfer();
    additionalImageFiles.forEach(file => dataTransfer.items.add(file));
    
    const fileInput = document.getElementById('productImages');
    if (fileInput) {
        fileInput.files = dataTransfer.files;
    }
    
    const preview = document.getElementById('additionalImagesPreview');
    if (!preview) return;
    
    preview.innerHTML = '';
    
    additionalImageFiles.forEach((file, idx) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const container = document.createElement('div');
            container.className = 'preview-image-container';
            container.innerHTML = `
                <img src="${e.target.result}" alt="Preview ${idx + 1}" class="preview-image">
                <button type="button" class="remove-image-btn" onclick="removeAdditionalImage(${idx})">×</button>
            `;
            preview.appendChild(container);
        };
        reader.readAsDataURL(file);
    });
}

async function handleProductSubmit() {
    const name = document.getElementById('productName').value.trim();
    const volume = document.getElementById('productVolume').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value);
    const originalPrice = parseFloat(document.getElementById('productOriginalPrice').value) || price;
    const tag = document.getElementById('productTag').value.trim() || 'New Product';
    const description = document.getElementById('productDescription').value.trim();
    const features = document.getElementById('productFeatures').value.trim()
        .split(',')
        .map(f => f.trim())
        .filter(f => f);
    const inStock = document.getElementById('productInStock').checked;
    
    const composition = {
        calcium: document.getElementById('calcium').value.trim(),
        phosphorus: document.getElementById('phosphorus').value.trim(),
        vitaminA: document.getElementById('vitaminA').value.trim(),
        vitaminB12: document.getElementById('vitaminB12').value.trim(),
        vitaminD3: document.getElementById('vitaminD3').value.trim(),
        vitaminH: document.getElementById('vitaminH').value.trim(),
        chChromium: document.getElementById('chChromium').value.trim(),
        chCobalt: document.getElementById('chCobalt').value.trim(),
        chCopper: document.getElementById('chCopper').value.trim(),
        iodine: document.getElementById('iodine').value.trim(),
        potassium: document.getElementById('potassium').value.trim(),
        jivanti: document.getElementById('jivanti').value.trim(),
        shatavari: document.getElementById('shatavari').value.trim(),
        wheatLecithin: document.getElementById('wheatLecithin').value.trim(),
        dextrose: document.getElementById('dextrose').value.trim(),
        herbalExtracts: document.getElementById('herbalExtracts').value.trim(),
        color: document.getElementById('color').value.trim()
    };
    
    const dosage = {
        cowBuffalo: document.getElementById('cowBuffaloDose').value.trim(),
        sheepGoat: document.getElementById('sheepGoatDose').value.trim(),
        dogCat: document.getElementById('dogCatDose').value.trim(),
        note: document.getElementById('dosageNote').value.trim()
    };
    
    if (!name || !price) {
        alert('❌ Please fill in product name and price');
        return;
    }
    
    if (!firebaseInitialized) {
        alert('❌ Firebase not connected! Please check your internet connection and refresh the page.');
        return;
    }
    
    const submitBtn = document.getElementById('submitBtn');
    if (!submitBtn) return;
    
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitBtn.disabled = true;
    
    try {
        let mainImage = null;
        let labelImage = null;
        let images = [];
        
        if (mainImageFile) {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Compressing main image...';
            mainImage = await compressImage(mainImageFile, 600, 0.6);
            images.push(mainImage);
        } else if (editingProductId) {
            const existingProduct = products.find(p => p.id === editingProductId);
            mainImage = existingProduct.image;
            images = existingProduct.images || [mainImage];
        }
        
        if (labelImageFile) {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Compressing label image...';
            labelImage = await compressImage(labelImageFile, 600, 0.7);
        } else if (editingProductId) {
            const existingProduct = products.find(p => p.id === editingProductId);
            labelImage = existingProduct.labelImage;
        }
        
        if (additionalImageFiles.length > 0) {
            for (let i = 0; i < additionalImageFiles.length; i++) {
                submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Compressing image ${i + 1}/${additionalImageFiles.length}...`;
                const compressed = await compressImage(additionalImageFiles[i], 600, 0.6);
                images.push(compressed);
            }
        } else if (!mainImageFile && editingProductId) {
            const existingProduct = products.find(p => p.id === editingProductId);
            images = existingProduct.images || [mainImage];
        }
        
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving product...';
        
        const discount = calculateDiscount(price, originalPrice);
        const productId = editingProductId || Date.now();
        
        if (editingProductId) {
            const index = products.findIndex(p => p.id === editingProductId);
            products[index] = {
                id: editingProductId,
                name,
                volume,
                price,
                originalPrice,
                discount,
                image: mainImage,
                labelImage,
                tag,
                description,
                features,
                images,
                composition,
                dosage,
                inStock
            };
        } else {
            const newProduct = {
                id: productId,
                name,
                volume,
                price,
                originalPrice,
                discount,
                image: mainImage,
                labelImage,
                tag,
                description,
                features,
                images,
                composition,
                dosage,
                inStock
            };
            products.push(newProduct);
        }
        
        const saved = await saveProductsToStorage();
        
        if (saved) {
            clearForm();
            renderProducts();
            alert(editingProductId ? '✅ Product updated successfully!' : '✅ Product added successfully!');
        } else {
            alert('❌ Failed to save product. Please try again.');
        }
        
    } catch (error) {
        console.error('Error saving product:', error);
        alert('❌ Error: ' + error.message);
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function handleEditProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    editingProductId = id;
    
    document.getElementById('productName').value = product.name || '';
    document.getElementById('productVolume').value = product.volume || '';
    document.getElementById('productPrice').value = product.price || '';
    document.getElementById('productOriginalPrice').value = product.originalPrice || '';
    document.getElementById('productTag').value = product.tag || '';
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productFeatures').value = (product.features || []).join(', ');
    document.getElementById('productInStock').checked = product.inStock !== false;
    
    document.getElementById('productImage').value = '';
    document.getElementById('labelImage').value = '';
    document.getElementById('productImages').value = '';
    mainImageFile = null;
    labelImageFile = null;
    additionalImageFiles = [];
    
    const mainPreview = document.getElementById('mainImagePreview');
    if (mainPreview && product.image) {
        mainPreview.innerHTML = `
            <div class="preview-image-container">
                <img src="${product.image}" alt="Current Image" class="preview-image" onerror="this.src='https://via.placeholder.com/200?text=Image+Error'">
                <p style="margin-top: 0.5rem; font-size: 0.875rem; color: #6b7280;">Current image (upload new to replace)</p>
            </div>
        `;
    }
    
    const labelPreview = document.getElementById('labelImagePreview');
    if (labelPreview && product.labelImage) {
        labelPreview.innerHTML = `
            <div class="preview-image-container">
                <img src="${product.labelImage}" alt="Current Label" class="preview-image" onerror="this.src='https://via.placeholder.com/200?text=Label+Error'">
                <p style="margin-top: 0.5rem; font-size: 0.875rem; color: #6b7280;">Current label (upload new to replace)</p>
            </div>
        `;
    }
    
    const additionalPreview = document.getElementById('additionalImagesPreview');
    if (additionalPreview) {
        additionalPreview.innerHTML = '';
        
        const images = product.images || [];
        if (images.length > 1) {
            images.slice(1).forEach((img, index) => {
                const container = document.createElement('div');
                container.className = 'preview-image-container';
                container.innerHTML = `
                    <img src="${img}" alt="Current Image ${index + 1}" class="preview-image" onerror="this.src='https://via.placeholder.com/120?text=Error'">
                `;
                additionalPreview.appendChild(container);
            });
        }
    }
    
    const composition = product.composition || {};
    document.getElementById('calcium').value = composition.calcium || '';
    document.getElementById('phosphorus').value = composition.phosphorus || '';
    document.getElementById('vitaminA').value = composition.vitaminA || '';
    document.getElementById('vitaminB12').value = composition.vitaminB12 || '';
    document.getElementById('vitaminD3').value = composition.vitaminD3 || '';
    document.getElementById('vitaminH').value = composition.vitaminH || '';
    document.getElementById('chChromium').value = composition.chChromium || '';
    document.getElementById('chCobalt').value = composition.chCobalt || '';
    document.getElementById('chCopper').value = composition.chCopper || '';
    document.getElementById('iodine').value = composition.iodine || '';
    document.getElementById('potassium').value = composition.potassium || '';
    document.getElementById('jivanti').value = composition.jivanti || '';
    document.getElementById('shatavari').value = composition.shatavari || '';
    document.getElementById('wheatLecithin').value = composition.wheatLecithin || '';
    document.getElementById('dextrose').value = composition.dextrose || '';
    document.getElementById('herbalExtracts').value = composition.herbalExtracts || '';
    document.getElementById('color').value = composition.color || '';
    
    const dosage = product.dosage || {};
    document.getElementById('cowBuffaloDose').value = dosage.cowBuffalo || '';
    document.getElementById('sheepGoatDose').value = dosage.sheepGoat || '';
    document.getElementById('dogCatDose').value = dosage.dogCat || '';
    document.getElementById('dosageNote').value = dosage.note || '';
    
    const formTitle = document.getElementById('formTitleText');
    const formIcon = document.getElementById('formIcon');
    const submitBtn = document.getElementById('submitBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    
    if (formTitle) formTitle.textContent = 'Edit Product';
    if (formIcon) formIcon.textContent = '✏️';
    if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Product';
    if (cancelBtn) cancelBtn.style.display = 'block';
    
    const adminForm = document.getElementById('adminForm');
    if (adminForm) {
        adminForm.scrollIntoView({ behavior: 'smooth' });
    }
}

async function handleDeleteProduct(id) {
    if (confirm('⚠️ Are you sure you want to delete this product? This action cannot be undone.')) {
        products = products.filter(p => p.id !== id);
        await saveProductsToStorage();
        renderProducts();
        alert('✅ Product deleted successfully!');
    }
}

function cancelEdit() {
    clearForm();
}

function clearForm() {
    editingProductId = null;
    
    const fields = [
        'productName', 'productVolume', 'productPrice', 'productOriginalPrice',
        'productImage', 'labelImage', 'productTag', 'productDescription',
        'productFeatures', 'productImages', 'calcium', 'phosphorus',
        'vitaminA', 'vitaminB12', 'vitaminD3', 'vitaminH',
        'chChromium', 'chCobalt', 'chCopper', 'iodine',
        'potassium', 'jivanti', 'shatavari', 'wheatLecithin',
        'dextrose', 'herbalExtracts', 'color', 'cowBuffaloDose',
        'sheepGoatDose', 'dogCatDose', 'dosageNote'
    ];
    
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.value = '';
    });
    
    const inStockField = document.getElementById('productInStock');
    if (inStockField) inStockField.checked = true;
    
    const previews = ['mainImagePreview', 'labelImagePreview', 'additionalImagesPreview'];
    previews.forEach(previewId => {
        const preview = document.getElementById(previewId);
        if (preview) preview.innerHTML = '';
    });
    
    mainImageFile = null;
    labelImageFile = null;
    additionalImageFiles = [];
    
    const formTitle = document.getElementById('formTitleText');
    const formIcon = document.getElementById('formIcon');
    const submitBtn = document.getElementById('submitBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    
    if (formTitle) formTitle.textContent = 'Add New Product';
    if (formIcon) formIcon.textContent = '➕';
    if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Product';
    if (cancelBtn) cancelBtn.style.display = 'none';
}

function updateNavigation() {
    const currentPage = document.querySelector('.page.active');
    if (!currentPage) return;
    
    const pageName = currentPage.id.replace('Page', '');
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageName) {
            link.classList.add('active');
        }
    });
}