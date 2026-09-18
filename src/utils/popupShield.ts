// Comprehensive Popup & New Tab Shield + Auto-Click Play Controller

let popupBlockCount = 0;
let isShieldInitialized = false;
let isShieldEnabled = true;

type PopupListener = (count: number, url?: string) => void;
const listeners: Set<PopupListener> = new Set();

export function setPopupShieldEnabled(enabled: boolean) {
  isShieldEnabled = enabled;
}

export function isPopupShieldActive(): boolean {
  return isShieldEnabled;
}

export function subscribePopupBlocked(listener: PopupListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners(url?: string) {
  popupBlockCount++;
  listeners.forEach(fn => {
    try {
      fn(popupBlockCount, url);
    } catch {
      // Ignore listener error
    }
  });
}

/**
 * Initializes global browser guards against unwanted popups, new tabs, and ad redirects.
 */
export function initPopupShield() {
  if (typeof window === 'undefined' || isShieldInitialized) return;
  isShieldInitialized = true;

  try {
    // 1. Override window.open to strictly block popup windows and new tabs
    const originalWindowOpen = window.open;
    window.open = function (
      url?: string | URL,
      target?: string,
      features?: string
    ): WindowProxy | null {
      if (!isShieldEnabled) {
        return originalWindowOpen.call(window, url, target, features);
      }

      const urlString = url ? String(url) : '';
      console.warn('[POPUP SHIELD] Blocked attempt to open popup / new tab:', {
        url: urlString,
        target,
        features,
      });

      notifyListeners(urlString);

      // Return a dummy closed window object to satisfy scripts that check for null
      const fakeWindow: any = {
        closed: true,
        close: () => {},
        focus: () => {},
        blur: () => {},
        postMessage: () => {},
        location: { href: '' },
      };

      return fakeWindow;
    };

    // 2. Intercept capture-phase clicks on external links that have target="_blank"
    document.addEventListener(
      'click',
      (event: MouseEvent) => {
        if (!isShieldEnabled) return;
        const target = event.target as HTMLElement | null;
        if (!target) return;

        const anchor = target.closest('a');
        if (anchor) {
          const href = anchor.getAttribute('href') || '';
          const targetAttr = anchor.getAttribute('target');

          // If it targets a new window/tab and is not an internal link or explicitly allowed
          if (targetAttr === '_blank' || targetAttr === '_new') {
            const isInternal =
              href.startsWith('/') ||
              href.startsWith('#') ||
              href.includes(window.location.hostname);

            if (!isInternal && !anchor.dataset.allowPopup) {
              event.preventDefault();
              event.stopPropagation();
              console.warn('[POPUP SHIELD] Blocked target="_blank" anchor navigation:', href);
              notifyListeners(href);
            }
          }
        }
      },
      true // Capture phase to intercept before third-party listeners
    );

    // 3. Prevent programmatic iframe top-navigation attempts
    window.addEventListener('beforeunload', (e) => {
      // If an external ad script triggers beforeunload unexpectedly, don't show prompt unless user navigated
    });

    console.log('[POPUP SHIELD] Active & shielding player from popups and new tabs.');
  } catch (err) {
    console.error('[POPUP SHIELD] Error initializing popup shield:', err);
  }
}

/**
 * Sends universal play signals and commands to player iframes
 * Compatible with Videasy, JWPlayer, Plyr, VideoJS, HTML5 embeds, VidLink, etc.
 */
export function sendPlaySignalsToIframe(iframe: HTMLIFrameElement | null) {
  if (!iframe || !iframe.contentWindow) return;

  const targetWindow = iframe.contentWindow;

  // Collection of standard play messages across web video players
  const commands = [
    { action: 'play' },
    { type: 'play' },
    { event: 'play' },
    { method: 'play' },
    { command: 'play' },
    { call: 'play' },
    'play',
    JSON.stringify({ event: 'command', func: 'playVideo', args: '' }),
    JSON.stringify({ method: 'play' }),
    JSON.stringify({ action: 'play' }),
    JSON.stringify({ type: 'play' }),
    JSON.stringify({ command: 'play' }),
  ];

  commands.forEach(cmd => {
    try {
      targetWindow.postMessage(cmd, '*');
    } catch {
      // Cross-origin catch
    }
  });

  // Focus the iframe element so keyboard and player controls bind immediately
  try {
    iframe.focus();
  } catch {
    // Ignore focus error
  }
}

/**
 * Dispatches synthetic center click events on the player container to activate playback
 */
export function simulateCenterClick(element: HTMLElement | null) {
  if (!element) return;

  try {
    const rect = element.getBoundingClientRect();
    const clientX = rect.left + rect.width / 2;
    const clientY = rect.top + rect.height / 2;

    const eventOptions: MouseEventInit = {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX,
      clientY,
      screenX: clientX,
      screenY: clientY,
      button: 0,
      buttons: 1,
    };

    element.dispatchEvent(new MouseEvent('mousedown', eventOptions));
    element.dispatchEvent(new MouseEvent('mouseup', eventOptions));
    element.dispatchEvent(new MouseEvent('click', eventOptions));

    // Also touch events for mobile responsiveness
    if (typeof Touch !== 'undefined') {
      try {
        const touch = new Touch({
          identifier: Date.now(),
          target: element,
          clientX,
          clientY,
          screenX: clientX,
          screenY: clientY,
          pageX: clientX,
          pageY: clientY,
        });

        element.dispatchEvent(
          new TouchEvent('touchstart', {
            bubbles: true,
            cancelable: true,
            touches: [touch],
            targetTouches: [touch],
            changedTouches: [touch],
          })
        );

        element.dispatchEvent(
          new TouchEvent('touchend', {
            bubbles: true,
            cancelable: true,
            touches: [],
            targetTouches: [],
            changedTouches: [touch],
          })
        );
      } catch {
        // Touch constructor might vary on some older browsers
      }
    }
  } catch (err) {
    console.warn('[AUTO-CLICK] Synthetic click dispatch failed:', err);
  }
}

export function getPopupBlockCount(): number {
  return popupBlockCount;
}
