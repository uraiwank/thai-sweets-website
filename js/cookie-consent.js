/**
 * GDPR-Compliant Cookie Consent Manager for Thai Sweets
 * Manages user consent for Google Tag Manager tracking
 */

(function() {
  'use strict';

  const CONSENT_KEY = 'thaisweets_cookie_consent';
  const GTM_ID = 'GTM-N8ND93C7';

  // Consent states
  const CONSENT_STATUS = {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
    PARTIAL: 'partial'
  };

  /**
   * Get current consent status from localStorage
   */
  function getConsentStatus() {
    try {
      const consent = localStorage.getItem(CONSENT_KEY);
      return consent ? JSON.parse(consent) : null;
    } catch (e) {
      console.error('Error reading consent:', e);
      return null;
    }
  }

  /**
   * Save consent status to localStorage
   */
  function saveConsentStatus(status, preferences = {}) {
    try {
      const consentData = {
        status: status,
        timestamp: new Date().toISOString(),
        preferences: preferences
      };
      localStorage.setItem(CONSENT_KEY, JSON.stringify(consentData));
      return true;
    } catch (e) {
      console.error('Error saving consent:', e);
      return false;
    }
  }

  /**
   * Load Google Tag Manager
   */
  function loadGTM() {
    // Prevent multiple loads
    if (window.gtmLoaded) return;
    window.gtmLoaded = true;

    // GTM script injection
    (function(w,d,s,l,i){
      w[l]=w[l]||[];
      w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
      var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
      j.async=true;
      j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
      f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer',GTM_ID);

    // Update GTM consent mode
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'event': 'consent_update',
      'consent_status': 'granted'
    });
  }

  /**
   * Initialize GTM with default consent (denied)
   */
  function initializeGTMConsent() {
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}

    // Set default consent to denied (GDPR compliant)
    gtag('consent', 'default', {
      'analytics_storage': 'denied',
      'ad_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied',
      'functionality_storage': 'denied',
      'personalization_storage': 'denied',
      'security_storage': 'granted'
    });
  }

  /**
   * Update GTM consent based on user choices
   * @param {Object} userChoices - Object with consent preferences
   * @param {boolean} userChoices.analytics - Analytics consent
   * @param {boolean} userChoices.advertising - Advertising consent
   * @param {boolean} userChoices.functional - Functional consent
   * @param {boolean} userChoices.personalization - Personalization consent
   */
  window.updateGTMConsent = function(userChoices) {
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}

    gtag('consent', 'update', {
      'ad_storage': userChoices.advertising ? 'granted' : 'denied',
      'ad_user_data': userChoices.advertising ? 'granted' : 'denied',
      'ad_personalization': userChoices.advertising ? 'granted' : 'denied',
      'analytics_storage': userChoices.analytics ? 'granted' : 'denied',
      'functionality_storage': userChoices.functional ? 'granted' : 'denied',
      'personalization_storage': userChoices.personalization ? 'granted' : 'denied'
    });

    // Push event to dataLayer for tracking
    window.dataLayer.push({
      'event': 'consent_update',
      'consent_analytics': userChoices.analytics,
      'consent_advertising': userChoices.advertising,
      'consent_functional': userChoices.functional,
      'consent_personalization': userChoices.personalization
    });
  };

  /**
   * Show the cookie consent banner
   */
  function showConsentBanner() {
    const banner = document.getElementById('cookie-consent-banner');
    if (!banner) {
      // Banner doesn't exist on this page, skip
      return;
    }

    banner.classList.remove('hidden');
    banner.setAttribute('aria-hidden', 'false');

    // Set focus to banner for accessibility
    setTimeout(() => {
      const acceptBtn = document.getElementById('accept-cookies');
      if (acceptBtn) acceptBtn.focus();
    }, 100);
  }

  /**
   * Hide the cookie consent banner
   */
  function hideConsentBanner() {
    const banner = document.getElementById('cookie-consent-banner');
    if (banner) {
      banner.classList.add('hidden');
      banner.setAttribute('aria-hidden', 'true');
    }
  }

  /**
   * Accept all cookies
   */
  function acceptAllCookies() {
    const preferences = {
      analytics: true,
      advertising: true,
      functional: true,
      personalization: true
    };

    saveConsentStatus(CONSENT_STATUS.ACCEPTED, preferences);

    loadGTM();
    window.updateGTMConsent(preferences);
    hideConsentBanner();

    // Trigger event for other scripts
    window.dispatchEvent(new CustomEvent('cookieConsentAccepted'));
  }

  /**
   * Reject all cookies (except essential)
   */
  function rejectAllCookies() {
    const preferences = {
      analytics: false,
      advertising: false,
      functional: false,
      personalization: false
    };

    saveConsentStatus(CONSENT_STATUS.REJECTED, preferences);

    window.updateGTMConsent(preferences);
    hideConsentBanner();

    // Trigger event for other scripts
    window.dispatchEvent(new CustomEvent('cookieConsentRejected'));
  }

  /**
   * Save custom preferences
   */
  function saveCustomPreferences(preferences) {
    saveConsentStatus(CONSENT_STATUS.PARTIAL, preferences);

    // Load GTM if analytics or advertising is enabled
    if (preferences.analytics || preferences.advertising) {
      loadGTM();
    }

    // Update GTM consent with granular preferences
    window.updateGTMConsent(preferences);

    hideConsentBanner();
    hidePreferencesModal();

    // Trigger event for other scripts
    window.dispatchEvent(new CustomEvent('cookieConsentUpdated', {
      detail: preferences
    }));
  }

  /**
   * Show preferences modal
   */
  function showPreferencesModal() {
    const modal = document.getElementById('cookie-preferences-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      // Load current preferences
      const consent = getConsentStatus();
      if (consent && consent.preferences) {
        const prefAnalytics = document.getElementById('pref-analytics');
        const prefAdvertising = document.getElementById('pref-advertising');
        const prefFunctional = document.getElementById('pref-functional');
        const prefPersonalization = document.getElementById('pref-personalization');

        if (prefAnalytics) prefAnalytics.checked = consent.preferences.analytics || false;
        if (prefAdvertising) prefAdvertising.checked = consent.preferences.advertising || false;
        if (prefFunctional) prefFunctional.checked = consent.preferences.functional || false;
        if (prefPersonalization) prefPersonalization.checked = consent.preferences.personalization || false;
      }
    }
  }

  /**
   * Hide preferences modal
   */
  function hidePreferencesModal() {
    const modal = document.getElementById('cookie-preferences-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  /**
   * Initialize cookie consent system
   */
  function initializeCookieConsent() {
    // Initialize GTM consent mode first (always)
    initializeGTMConsent();

    // Check if user has already given consent
    const consent = getConsentStatus();

    if (!consent) {
      // No consent given yet - show banner
      showConsentBanner();
    } else if (consent.status === CONSENT_STATUS.ACCEPTED ||
               (consent.status === CONSENT_STATUS.PARTIAL &&
                (consent.preferences.analytics || consent.preferences.advertising || consent.preferences.marketing))) {
      // Consent given - load GTM and update consent
      loadGTM();

      // Normalize preferences (handle old 'marketing' and new 'advertising')
      const normalizedPrefs = {
        analytics: consent.preferences.analytics || false,
        advertising: consent.preferences.advertising || consent.preferences.marketing || false,
        functional: consent.preferences.functional || false,
        personalization: consent.preferences.personalization || false
      };
      window.updateGTMConsent(normalizedPrefs);
    } else if (consent.status === CONSENT_STATUS.REJECTED) {
      // Consent rejected - ensure it stays denied
      window.updateGTMConsent({
        analytics: false,
        advertising: false,
        functional: false,
        personalization: false
      });
    }

    // Set up event listeners
    setupEventListeners();
  }

  /**
   * Set up event listeners for consent buttons
   */
  function setupEventListeners() {
    // Only set up listeners if the banner exists on this page
    const banner = document.getElementById('cookie-consent-banner');
    if (!banner) {
      return; // No consent UI on this page
    }

    // Accept All button
    const acceptBtn = document.getElementById('accept-cookies');
    if (acceptBtn) {
      acceptBtn.addEventListener('click', acceptAllCookies);
    }

    // Reject All button
    const rejectBtn = document.getElementById('reject-cookies');
    if (rejectBtn) {
      rejectBtn.addEventListener('click', rejectAllCookies);
    }

    // Manage Preferences button
    const manageBtn = document.getElementById('manage-cookies');
    if (manageBtn) {
      manageBtn.addEventListener('click', showPreferencesModal);
    }

    // Close preferences modal
    const closeModalBtn = document.getElementById('close-preferences-modal');
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', hidePreferencesModal);
    }

    // Save preferences button
    const savePrefsBtn = document.getElementById('save-preferences');
    if (savePrefsBtn) {
      savePrefsBtn.addEventListener('click', function() {
        const prefAnalytics = document.getElementById('pref-analytics');
        const prefAdvertising = document.getElementById('pref-advertising');
        const prefFunctional = document.getElementById('pref-functional');
        const prefPersonalization = document.getElementById('pref-personalization');

        const preferences = {
          analytics: prefAnalytics ? prefAnalytics.checked : false,
          advertising: prefAdvertising ? prefAdvertising.checked : false,
          functional: prefFunctional ? prefFunctional.checked : false,
          personalization: prefPersonalization ? prefPersonalization.checked : false
        };
        saveCustomPreferences(preferences);
      });
    }

    // Close modal on background click
    const modal = document.getElementById('cookie-preferences-modal');
    if (modal) {
      modal.addEventListener('click', function(e) {
        if (e.target === modal) {
          hidePreferencesModal();
        }
      });
    }

    // Keyboard accessibility - ESC to close modal
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        const modal = document.getElementById('cookie-preferences-modal');
        if (modal && !modal.classList.contains('hidden')) {
          hidePreferencesModal();
        }
      }
    });
  }

  /**
   * Public API
   */
  window.CookieConsent = {
    accept: acceptAllCookies,
    reject: rejectAllCookies,
    showPreferences: showPreferencesModal,
    getStatus: getConsentStatus,
    revoke: function() {
      localStorage.removeItem(CONSENT_KEY);
      window.location.reload();
    }
  };

  function scheduleInit() {
    var run = function () {
      try {
        initializeCookieConsent();
      } catch (error) {
        console.error('Cookie consent initialization error:', error);
      }
    };
    // Defer past first paint / LCP so the banner does not compete with Home hero work.
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(run, { timeout: 2000 });
    } else {
      window.setTimeout(run, 1);
    }
  }

  // Initialize when DOM is ready (then idle)
  try {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', scheduleInit);
    } else {
      scheduleInit();
    }
  } catch (error) {
    console.error('Cookie consent setup error:', error);
    // Fail silently to not break the page
  }

})();
