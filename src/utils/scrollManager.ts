class ScrollManager {
  private static instance: ScrollManager;
  private observer: IntersectionObserver;

  private constructor() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.saveLastVisibleProduct(entry.target.id.replace('product-', ''));
          }
        });
      },
      { threshold: 0.5 }
    );
  }

  static getInstance() {
    if (!ScrollManager.instance) {
      ScrollManager.instance = new ScrollManager();
    }
    return ScrollManager.instance;
  }

  observeProduct(element: Element) {
    this.observer.observe(element);
  }

  disconnectAll() {
    this.observer.disconnect();
  }

  saveLastVisibleProduct(productId: string) {
    localStorage.setItem('lastVisibleProduct', productId);
    localStorage.setItem('lastScrollPosition', window.scrollY.toString());
  }

  getLastPosition() {
    return {
      productId: localStorage.getItem('lastVisibleProduct'),
      scrollPosition: parseInt(localStorage.getItem('lastScrollPosition') || '0')
    };
  }

  clearPosition() {
    localStorage.removeItem('lastVisibleProduct');
    localStorage.removeItem('lastScrollPosition');
  }
}

export const scrollManager = ScrollManager.getInstance();
