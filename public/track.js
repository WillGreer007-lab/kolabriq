/**
 * Adswish Tracking & Conversion Script
 * Emulates enterprise pixel logic (e.g. Meta Pixel, TikTok Pixel).
 */
(function() {
  const ENDPOINT = '/api/pixel/ping';
  const CONVERSION_ENDPOINT = '/api/track/conversion';
  
  const Adswish = {
    businessId: null,
    
    // Parse URL parameters
    getParam: function(name) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(name);
    },
    
    // Set a first-party cookie
    setCookie: function(name, value, days) {
      let expires = "";
      if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
      }
      // Set to current domain to act as a true 1st-party cookie
      document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
    },
    
    // Get a cookie
    getCookie: function(name) {
      const nameEQ = name + "=";
      const ca = document.cookie.split(';');
      for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
      }
      return null;
    },
    
    // Initialization (Ping Heartbeat & Check URL for adswish_ref)
    init: function(id) {
      this.businessId = id;
      
      // 1. Check for edge redirect JWT (adswish_ref)
      const refToken = this.getParam('adswish_ref');
      if (refToken) {
        // By default, store for 30 days. The backend verified JWT will determine exact attribution window during checkout webhook
        this.setCookie('adswish_ref', refToken, 30); 
      }
      
      // 2. Ping Heartbeat immediately to keep Business Pixel green
      this.ping();
      
      // 3. Setup interval to ping every 5 minutes while user is on page
      setInterval(() => this.ping(), 5 * 60 * 1000);
    },
    
    ping: function() {
      if (!this.businessId) return;
      // In a real environment, this might use navigator.sendBeacon
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: this.businessId })
      }).catch(e => console.error('Adswish Ping Failed', e));
    },
    
    // Trigger Conversion Event
    track: function(eventName, data) {
      if (eventName !== 'purchase') return; // We only track purchases for now
      
      const refToken = this.getCookie('adswish_ref');
      if (!refToken) {
        console.log("Adswish: No valid tracking cookie found. Sale is organic.");
        return;
      }
      
      fetch(CONVERSION_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: refToken,
          businessId: this.businessId,
          orderId: data.order_id,
          amount: data.value,
          currency: data.currency || 'USD'
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          console.log("Adswish: Conversion tracked successfully.");
        }
      })
      .catch(e => console.error("Adswish: Conversion tracking failed", e));
    }
  };

  // Process the queue
  const queueName = 'kq';
  const queue = window[queueName] && window[queueName].q ? window[queueName].q : [];
  
  // Replace the queue function with direct execution
  window[queueName] = function() {
    const args = arguments;
    const command = args[0];
    
    if (command === 'init') {
      Adswish.init(args[1]);
    } else if (command === 'track') {
      Adswish.track(args[1], args[2]);
    }
  };
  
  // Execute pre-loaded queue
  for (let i = 0; i < queue.length; i++) {
    window[queueName].apply(null, queue[i]);
  }
})();
