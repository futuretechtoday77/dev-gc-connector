/**
 * GC Modal - GlobalControl Popup Modal System
 * v2.0.0 - Works with dev-gc-connector API
 */

(function(global) {
  'use strict';

  const GCModal = {
    config: {
      apiUrl: 'https://dev-gc-connector.vercel.app',
      popupId: null,
      autoShow: true,
      showDelay: 2000,
      exitIntent: false
    },

    popup: null,
    shown: false,

    init: function(options) {
      this.config = { ...this.config, ...options };
      
      if (!this.config.popupId) {
        console.error('GCModal: popupId is required');
        return;
      }

      this.loadPopup();
    },

    loadPopup: async function() {
      try {
        const response = await fetch(`${this.config.apiUrl}/api/popups?id=${this.config.popupId}`);
        const data = await response.json();
        
        if (data.popup) {
          this.popup = data.popup;
          this.injectStyles();
          this.attachEvents();
          
          if (this.config.autoShow) {
            setTimeout(() => this.show(), this.config.showDelay);
          }
        } else {
          console.error('GCModal: Popup not found:', this.config.popupId);
        }
      } catch (error) {
        console.error('GCModal: Failed to load popup:', error);
      }
    },

    injectStyles: function() {
      const styles = `
        .gc-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: none;
          align-items: center;
          justify-content: center;
          z-index: 999999;
          padding: 1rem;
        }
        .gc-modal-overlay.active {
          display: flex;
        }
        .gc-modal {
          background: white;
          border-radius: 12px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          animation: gc-modal-slide-in 0.3s ease-out;
        }
        @keyframes gc-modal-slide-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .gc-modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(0, 0, 0, 0.1);
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.25rem;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }
        .gc-modal-close:hover {
          background: rgba(0, 0, 0, 0.2);
        }
        .gc-modal-content {
          display: flex;
          flex-direction: column;
        }
        .gc-modal-layout-side-by-side {
          flex-direction: row;
        }
        @media (max-width: 600px) {
          .gc-modal-layout-side-by-side {
            flex-direction: column;
          }
        }
        .gc-modal-image {
          flex: 1;
          min-height: 200px;
          background-size: cover;
          background-position: center;
          border-radius: 12px 0 0 12px;
        }
        @media (max-width: 600px) {
          .gc-modal-image {
            border-radius: 12px 12px 0 0;
            min-height: 150px;
          }
        }
        .gc-modal-body {
          flex: 1;
          padding: 2rem;
        }
        .gc-modal-variant-green {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }
        .gc-modal-variant-green .gc-modal-body {
          color: white;
        }
        .gc-modal-variant-purple {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          color: white;
        }
        .gc-modal-variant-purple .gc-modal-body {
          color: white;
        }
        .gc-modal-variant-teal {
          background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
          color: white;
        }
        .gc-modal-variant-teal .gc-modal-body {
          color: white;
        }
        .gc-modal-headline {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
          line-height: 1.3;
        }
        .gc-modal-subheadline {
          font-size: 1rem;
          margin-bottom: 1rem;
          opacity: 0.9;
        }
        .gc-modal-body-copy {
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
          opacity: 0.9;
          line-height: 1.5;
        }
        .gc-modal-form {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .gc-modal-input {
          padding: 0.75rem 1rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 6px;
          font-size: 1rem;
          background: rgba(255, 255, 255, 0.15);
          color: white;
        }
        .gc-modal-input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }
        .gc-modal-input:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.6);
          background: rgba(255, 255, 255, 0.2);
        }
        .gc-modal-button {
          padding: 0.875rem 1.5rem;
          background: white;
          color: #333;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .gc-modal-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        .gc-modal-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
        .gc-modal-success {
          text-align: center;
          padding: 2rem;
        }
        .gc-modal-success h3 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }
      `;

      const styleSheet = document.createElement('style');
      styleSheet.textContent = styles;
      document.head.appendChild(styleSheet);
    },

    attachEvents: function() {
      if (this.config.exitIntent) {
        document.addEventListener('mouseout', (e) => {
          if (e.clientY < 10 && !this.shown) {
            this.show();
          }
        });
      }
    },

    show: function() {
      if (this.shown || !this.popup) return;
      
      const modal = this.createModal();
      document.body.appendChild(modal);
      this.shown = true;
    },

    hide: function() {
      const overlay = document.querySelector('.gc-modal-overlay');
      if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
      }
    },

    createModal: function() {
      const { design, fields } = this.popup;
      const overlay = document.createElement('div');
      overlay.className = 'gc-modal-overlay';
      
      const layoutClass = design.layout === 'side-by-side' ? 'gc-modal-layout-side-by-side' : '';
      const variantClass = `gc-modal-variant-${design.variant || 'green'}`;
      
      overlay.innerHTML = `
        <div class="gc-modal ${variantClass}">
          <button class="gc-modal-close" onclick="GCModal.hide()">&times;</button>
          <div class="gc-modal-content ${layoutClass}">
            ${design.image?.url ? `
              <div class="gc-modal-image" style="background-image: url('${design.image.url}')"></div>
            ` : ''}
            <div class="gc-modal-body">
              <h2 class="gc-modal-headline">${design.headline}</h2>
              ${design.subheadline ? `<p class="gc-modal-subheadline">${design.subheadline}</p>` : ''}
              ${design.bodyCopy ? `<p class="gc-modal-body-copy">${design.bodyCopy}</p>` : ''}
              <form class="gc-modal-form" onsubmit="GCModal.handleSubmit(event)">
                ${fields.includes('firstName') ? `
                  <input type="text" name="firstName" class="gc-modal-input" placeholder="First Name" required>
                ` : ''}
                <input type="email" name="email" class="gc-modal-input" placeholder="Email Address" required>
                ${fields.includes('phone') ? `
                  <input type="tel" name="phone" class="gc-modal-input" placeholder="Phone Number" required>
                ` : ''}
                <button type="submit" class="gc-modal-button">${design.buttonText}</button>
              </form>
            </div>
          </div>
        </div>
      `;

      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.hide();
      });

      // Show with animation
      setTimeout(() => overlay.classList.add('active'), 10);

      return overlay;
    },

    handleSubmit: async function(event) {
      event.preventDefault();
      const form = event.target;
      const submitBtn = form.querySelector('.gc-modal-button');
      
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      const formData = new FormData(form);
      const data = {
        popupId: GCModal.config.popupId,
        email: formData.get('email'),
        firstName: formData.get('firstName') || '',
        phone: formData.get('phone') || ''
      };

      try {
        const response = await fetch(`${GCModal.config.apiUrl}/api/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
          form.innerHTML = `
            <div class="gc-modal-success">
              <h3>✓ Success!</h3>
              <p>Thank you for your submission.</p>
            </div>
          `;
          setTimeout(() => GCModal.hide(), 2000);
        } else {
          throw new Error(result.error || 'Submission failed');
        }
      } catch (error) {
        console.error('GCModal: Submit error:', error);
        submitBtn.disabled = false;
        submitBtn.textContent = GCModal.popup.design.buttonText;
        alert('Something went wrong. Please try again.');
      }
    }
  };

  // Expose to global scope
  global.GCModal = GCModal;

})(window);
