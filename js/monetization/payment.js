// ============================================
// NOVA - PAYMENT.JS (To'lov tizimi)
// ============================================

(function() {
    "use strict";
    
    const PAYMENT_METHODS = [
        { id: 'click', name: 'Click', icon: 'fas fa-credit-card', color: '#00aaff' },
        { id: 'payme', name: 'Payme', icon: 'fas fa-mobile-alt', color: '#00ccff' },
        { id: 'visa', name: 'Visa/Mastercard', icon: 'fab fa-cc-visa', color: '#1a1a8a' },
        { id: 'crypto', name: 'Crypto (USDT)', icon: 'fab fa-bitcoin', color: '#f7931a' }
    ];
    
    // ===== PROCESS PAYMENT =====
    window.processPayment = function(amount, currency, itemName, callback) {
        let modal = document.getElementById('paymentMethodModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'paymentMethodModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 450px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-credit-card"></i> To'lov usulini tanlang</h3>
                        <button class="close-modal" id="closePaymentMethodModal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div id="paymentMethodsContainer" style="display: flex; flex-direction: column; gap: 10px;"></div>
                        <div id="paymentForm" style="display: none; margin-top: 20px;"></div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            document.getElementById('closePaymentMethodModal').onclick = () => modal.style.display = 'none';
        }
        
        const methodsContainer = document.getElementById('paymentMethodsContainer');
        methodsContainer.innerHTML = PAYMENT_METHODS.map(method => `
            <div class="payment-method" data-method="${method.id}" style="
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 15px;
                background: #1a1a1a;
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.2s;
                border: 1px solid transparent;
            ">
                <div style="width: 45px; height: 45px; background: ${method.color}; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    <i class="${method.icon}" style="font-size: 20px; color: #fff;"></i>
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: 600;">${method.name}</div>
                    <div style="font-size: 11px; color: #888;">Tez va xavfsiz to'lov</div>
                </div>
                <i class="fas fa-chevron-right" style="color: #888;"></i>
            </div>
        `).join('');
        
        document.querySelectorAll('.payment-method').forEach(el => {
            el.onclick = () => {
                const method = el.dataset.method;
                showPaymentForm(method, amount, currency, itemName, callback);
                modal.style.display = 'none';
            };
        });
        
        modal.style.display = 'flex';
    };
    
    function showPaymentForm(method, amount, currency, itemName, callback) {
        let modal = document.getElementById('paymentFormModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'paymentFormModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 450px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-credit-card"></i> To'lov ma'lumotlari</h3>
                        <button class="close-modal" id="closePaymentFormModal">&times;</button>
                    </div>
                    <div class="modal-body" id="paymentFormBody"></div>
                </div>
            `;
            document.body.appendChild(modal);
            document.getElementById('closePaymentFormModal').onclick = () => modal.style.display = 'none';
        }
        
        const body = document.getElementById('paymentFormBody');
        
        if (method === 'click' || method === 'payme') {
            body.innerHTML = `
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="background: ${PAYMENT_METHODS.find(m => m.id === method).color}; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                        <i class="${PAYMENT_METHODS.find(m => m.id === method).icon}" style="font-size: 24px; color: #fff;"></i>
                    </div>
                    <h3 style="margin: 15px 0;">${PAYMENT_METHODS.find(m => m.id === method).name}</h3>
                    <p style="color: #888;">To'lov summasi: ${amount} ${currency}</p>
                    <p style="color: #888; font-size: 12px;">Mahsulot: ${itemName}</p>
                </div>
                <input type="text" id="cardNumber" placeholder="Karta raqami" class="form-input" style="margin-bottom: 10px;">
                <div style="display: flex; gap: 10px;">
                    <input type="text" id="expiryDate" placeholder="MM/YY" class="form-input" style="flex: 1;">
                    <input type="text" id="cvv" placeholder="CVV" class="form-input" style="flex: 1;">
                </div>
                <button id="processPaymentBtn" class="btn btn-primary" style="margin-top: 20px;">To'lovni amalga oshirish</button>
            `;
            
            document.getElementById('processPaymentBtn').onclick = () => {
                simulatePayment(method, amount, currency, itemName, callback);
                modal.style.display = 'none';
            };
        } else if (method === 'crypto') {
            body.innerHTML = `
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="background: #f7931a; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                        <i class="fab fa-bitcoin" style="font-size: 30px; color: #fff;"></i>
                    </div>
                    <h3 style="margin: 15px 0;">Crypto to'lov</h3>
                    <p>To'lov summasi: ${amount} ${currency}</p>
                    <div style="background: #1a1a1a; padding: 15px; border-radius: 12px; margin: 15px 0;">
                        <p style="font-size: 12px;">USDT (TRC20) manzili:</p>
                        <p style="font-family: monospace; word-break: break-all;">TKyXd9fJqQZ9qZ9qZ9qZ9qZ9qZ9qZ9qZ</p>
                    </div>
                    <button id="confirmCryptoBtn" class="btn btn-primary">To'lovni tasdiqlash</button>
                </div>
            `;
            
            document.getElementById('confirmCryptoBtn').onclick = () => {
                simulatePayment(method, amount, currency, itemName, callback);
                modal.style.display = 'none';
            };
        }
        
        modal.style.display = 'flex';
    }
    
    function simulatePayment(method, amount, currency, itemName, callback) {
        window.showLoader();
        
        setTimeout(() => {
            window.hideLoader();
            
            // Send to Mirfayz
            const chequeData = {
                userId: window.appState.currentUser.id,
                userName: window.appState.currentUser.name,
                amount: amount,
                currency: currency,
                item: itemName,
                method: method,
                timestamp: new Date().toISOString()
            };
            
            console.log('💰 Chek yuborildi:', chequeData);
            
            window.showToast(`💰 To'lov amalga oshirildi! Chek Mirfayzga yuborildi.`);
            
            if (callback) callback();
        }, 2000);
    }
    
    window.log("Payment.js loaded");
})();
