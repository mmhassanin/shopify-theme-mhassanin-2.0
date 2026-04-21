(() => {
  // app/scripts/common/define.js
  Object.assign(NodeList.prototype, {
    removeClass: function() {
      for (const item of this) {
        item.classList.remove(...arguments);
      }
    },
    addClass: function() {
      for (const item of this) {
        item.classList.add(...arguments);
      }
    },
    addEvents: function(...args) {
      for (const item of this) {
        item.addEvent(...args);
      }
    },
    removeEvents: function(...args) {
      for (const item of this) {
        item.removeEvent(...args);
      }
    }
  });
  Object.assign(HTMLCollection.prototype, {
    removeClass: function() {
      for (const item of this) {
        item.classList.remove(...arguments);
      }
    },
    addClass: function() {
      for (const item of this) {
        item.classList.add(...arguments);
      }
    },
    addEvents: function(...args) {
      for (const item of this) {
        item.addEventListener(...args);
      }
    },
    removeEvents: function(...args) {
      for (const item of this) {
        item.removeEventListener(...args);
      }
    },
    forEach: Array.prototype.forEach
  });
  Object.assign(HTMLElement.prototype, {
    removeClass: function(...args) {
      this.classList.remove(...args);
      return this;
    },
    addClass: function(...args) {
      this.classList.add(...args);
      return this;
    },
    hasClass: function(className) {
      return this.classList.contains(className);
    },
    css(key, value) {
      this.style[key] = value;
    }
  });
  Object.assign(Number.prototype, {
    toCurrency: moneyFormat
  });
  Object.assign(String.prototype, {
    toCurrency: moneyFormat,
    convertToSlug
  });
  function convertToSlug() {
    let str = this;
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, "");
    str = str.replace(/\u02C6|\u0306|\u031B/g, "");
    return str.toLowerCase().replace(/-/g, " ").trim().replace(/[\(\)\[\]'"]/g, "").replace(/[^\w]+/g, "-");
  }
  var moneyFormatString = theme.currency.format;
  function moneyFormat(format) {
    let cents = this;
    if (cents instanceof String) {
      cents = cents.replace(".", "");
    }
    var value = "";
    var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    var formatString = format || moneyFormatString;
    function formatWithDelimiters(number, precision, thousands, decimal) {
      thousands = thousands || ",";
      decimal = decimal || ".";
      if (isNaN(number) || number === null) {
        return 0;
      }
      number = (number / 100).toFixed(precision);
      var parts = number.split(".");
      var dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + thousands);
      var centsAmount = parts[1] ? decimal + parts[1] : "";
      return dollarsAmount + centsAmount;
    }
    switch (formatString.match(placeholderRegex)[1]) {
      case "amount":
        value = formatWithDelimiters(cents, 2);
        break;
      case "amount_no_decimals":
        value = formatWithDelimiters(cents, 0);
        break;
      case "amount_with_comma_separator":
        value = formatWithDelimiters(cents, 2, ".", ",");
        break;
      case "amount_no_decimals_with_comma_separator":
        value = formatWithDelimiters(cents, 0, ".", ",");
        break;
      case "amount_no_decimals_with_space_separator":
        value = formatWithDelimiters(cents, 0, " ");
        break;
      case "amount_with_apostrophe_separator":
        value = formatWithDelimiters(cents, 2, "'");
        break;
    }
    return formatString.replace(placeholderRegex, value);
  }
  (function() {
    let nativeFetch = window.fetch;
    window.fetch = function(...agrs) {
      let dataType = !!agrs[1] ? agrs[1].dataType : "";
      return nativeFetch(...agrs).then(async (res) => {
        if (!res.ok && res.type === "basic") {
          throw await res.json();
        }
        switch (dataType) {
          case "json": {
            return res.json();
          }
          case "text": {
            return res.text();
          }
          default:
            return res;
        }
      });
    };
  })();

  // node_modules/@shopify/theme-sections/section.js
  var SECTION_ID_ATTR = "data-section-id";
  function Section(container, properties) {
    this.container = validateContainerElement(container);
    this.id = container.getAttribute(SECTION_ID_ATTR);
    this.extensions = [];
    Object.assign(this, validatePropertiesObject(properties));
    this.onLoad();
  }
  Section.prototype = {
    onLoad: Function.prototype,
    onUnload: Function.prototype,
    onSelect: Function.prototype,
    onDeselect: Function.prototype,
    onBlockSelect: Function.prototype,
    onBlockDeselect: Function.prototype,
    extend: function extend(extension) {
      this.extensions.push(extension);
      var extensionClone = Object.assign({}, extension);
      delete extensionClone.init;
      Object.assign(this, extensionClone);
      if (typeof extension.init === "function") {
        extension.init.apply(this);
      }
    }
  };
  function validateContainerElement(container) {
    if (!(container instanceof Element)) {
      throw new TypeError("Theme Sections: Attempted to load section. The section container provided is not a DOM element.");
    }
    if (container.getAttribute(SECTION_ID_ATTR) === null) {
      throw new Error("Theme Sections: The section container provided does not have an id assigned to the " + SECTION_ID_ATTR + " attribute.");
    }
    return container;
  }
  function validatePropertiesObject(value) {
    if (typeof value !== "undefined" && typeof value !== "object" || value === null) {
      throw new TypeError("Theme Sections: The properties object provided is not a valid");
    }
    return value;
  }
  if (typeof Object.assign != "function") {
    Object.defineProperty(Object, "assign", {
      value: function assign(target) {
        "use strict";
        if (target == null) {
          throw new TypeError("Cannot convert undefined or null to object");
        }
        var to = Object(target);
        for (var index = 1; index < arguments.length; index++) {
          var nextSource = arguments[index];
          if (nextSource != null) {
            for (var nextKey in nextSource) {
              if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                to[nextKey] = nextSource[nextKey];
              }
            }
          }
        }
        return to;
      },
      writable: true,
      configurable: true
    });
  }

  // node_modules/@shopify/theme-sections/theme-sections.js
  var SECTION_TYPE_ATTR = "data-section-type";
  var SECTION_ID_ATTR2 = "data-section-id";
  window.Shopify = window.Shopify || {};
  window.Shopify.theme = window.Shopify.theme || {};
  window.Shopify.theme.sections = window.Shopify.theme.sections || {};
  var registered = window.Shopify.theme.sections.registered = window.Shopify.theme.sections.registered || {};
  var instances = window.Shopify.theme.sections.instances = window.Shopify.theme.sections.instances || [];
  function register(type, properties) {
    if (typeof type !== "string") {
      throw new TypeError("Theme Sections: The first argument for .register must be a string that specifies the type of the section being registered");
    }
    if (typeof registered[type] !== "undefined") {
      throw new Error('Theme Sections: A section of type "' + type + '" has already been registered. You cannot register the same section type twice');
    }
    function TypedSection(container) {
      Section.call(this, container, properties);
    }
    TypedSection.constructor = Section;
    TypedSection.prototype = Object.create(Section.prototype);
    TypedSection.prototype.type = type;
    return registered[type] = TypedSection;
  }
  function load(types, containers) {
    types = normalizeType(types);
    if (typeof containers === "undefined") {
      containers = document.querySelectorAll("[" + SECTION_TYPE_ATTR + "]");
    }
    containers = normalizeContainers(containers);
    types.forEach(function(type) {
      var TypedSection = registered[type];
      if (typeof TypedSection === "undefined") {
        return;
      }
      containers = containers.filter(function(container) {
        if (isInstance(container)) {
          return false;
        }
        if (container.getAttribute(SECTION_TYPE_ATTR) === null) {
          return false;
        }
        if (container.getAttribute(SECTION_TYPE_ATTR) !== type) {
          return true;
        }
        instances.push(new TypedSection(container));
        return false;
      });
    });
  }
  function unload(selector) {
    var instancesToUnload = getInstances(selector);
    instancesToUnload.forEach(function(instance) {
      var index = instances.map(function(e) {
        return e.id;
      }).indexOf(instance.id);
      instances.splice(index, 1);
      instance.onUnload();
    });
  }
  function getInstances(selector) {
    var filteredInstances = [];
    if (NodeList.prototype.isPrototypeOf(selector) || Array.isArray(selector)) {
      var firstElement = selector[0];
    }
    if (selector instanceof Element || firstElement instanceof Element) {
      var containers = normalizeContainers(selector);
      containers.forEach(function(container) {
        filteredInstances = filteredInstances.concat(instances.filter(function(instance) {
          return instance.container === container;
        }));
      });
    } else if (typeof selector === "string" || typeof firstElement === "string") {
      var types = normalizeType(selector);
      types.forEach(function(type) {
        filteredInstances = filteredInstances.concat(instances.filter(function(instance) {
          return instance.type === type;
        }));
      });
    }
    return filteredInstances;
  }
  function getInstanceById(id) {
    var instance;
    for (var i = 0; i < instances.length; i++) {
      if (instances[i].id === id) {
        instance = instances[i];
        break;
      }
    }
    return instance;
  }
  function isInstance(selector) {
    return getInstances(selector).length > 0;
  }
  function normalizeType(types) {
    if (types === "*") {
      types = Object.keys(registered);
    } else if (typeof types === "string") {
      types = [types];
    } else if (types.constructor === Section) {
      types = [types.prototype.type];
    } else if (Array.isArray(types) && types[0].constructor === Section) {
      types = types.map(function(TypedSection) {
        return TypedSection.prototype.type;
      });
    }
    types = types.map(function(type) {
      return type.toLowerCase();
    });
    return types;
  }
  function normalizeContainers(containers) {
    if (NodeList.prototype.isPrototypeOf(containers) && containers.length > 0) {
      containers = Array.prototype.slice.call(containers);
    } else if (NodeList.prototype.isPrototypeOf(containers) && containers.length === 0) {
      containers = [];
    } else if (containers === null) {
      containers = [];
    } else if (!Array.isArray(containers) && containers instanceof Element) {
      containers = [containers];
    }
    return containers;
  }
  if (window.Shopify.designMode) {
    document.addEventListener("shopify:section:load", function(event) {
      var id = event.detail.sectionId;
      var container = event.target.querySelector("[" + SECTION_ID_ATTR2 + '="' + id + '"]');
      if (container !== null) {
        load(container.getAttribute(SECTION_TYPE_ATTR), container);
      }
    });
    document.addEventListener("shopify:section:unload", function(event) {
      var id = event.detail.sectionId;
      var container = event.target.querySelector("[" + SECTION_ID_ATTR2 + '="' + id + '"]');
      var instance = getInstances(container)[0];
      if (typeof instance === "object") {
        unload(container);
      }
    });
    document.addEventListener("shopify:section:select", function(event) {
      var instance = getInstanceById(event.detail.sectionId);
      if (typeof instance === "object") {
        instance.onSelect(event);
      }
    });
    document.addEventListener("shopify:section:deselect", function(event) {
      var instance = getInstanceById(event.detail.sectionId);
      if (typeof instance === "object") {
        instance.onDeselect(event);
      }
    });
    document.addEventListener("shopify:block:select", function(event) {
      var instance = getInstanceById(event.detail.sectionId);
      if (typeof instance === "object") {
        instance.onBlockSelect(event);
      }
    });
    document.addEventListener("shopify:block:deselect", function(event) {
      var instance = getInstanceById(event.detail.sectionId);
      if (typeof instance === "object") {
        instance.onBlockDeselect(event);
      }
    });
  }

  // node_modules/@shopify/theme-images/images.js
  function getSizedImageUrl(src, size) {
    if (size === null) {
      return src;
    }
    if (size === "master") {
      return removeProtocol(src);
    }
    const match = src.match(/\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif)(\?v=\d+)?$/i);
    if (match) {
      const prefix = src.split(match[0]);
      const suffix = match[0];
      return removeProtocol(`${prefix[0]}_${size}${suffix}`);
    } else {
      return null;
    }
  }
  function removeProtocol(path) {
    return path.replace(/http(s)?:/, "");
  }

  // app/scripts/common/model/cart.js
  var Cart2 = class {
    constructor() {
      this.settings = { ...theme.settings.cart };
      this.get();
    }
    addMutiple(items) {
      return fetch(theme.routes.cartAdd, {
        method: "post",
        headers: new Headers({ "Content-type": "application/json" }),
        body: JSON.stringify({ items: [...items] }),
        dataType: "json"
      }).then((data) => {
        return this.get().then(async () => {
          let { items: items2 } = data;
          if (this.settings.type === "drawer") {
            if (!this.drawer) {
              return data;
            }
            if (this.drawer.isLoaded) {
              document.dispatchEvent(new CustomEvent("cart-add", { detail: data }));
              this.get().then((res) => document.dispatchEvent(new CustomEvent("cart-change", { detail: res })));
            } else {
              await this.drawer.load();
            }
            return data;
          }
        });
      }).catch((res) => {
        res.then((data) => {
          if (!!this.drawer && this.drawer.isOpen) {
            this.drawer.close();
            alert(data.description);
          } else {
            alert(data.description);
          }
        });
        return res;
      });
    }
    add(form) {
      let formData = new FormData(form);
      if (theme.template == "cart") {
        formData.append("sections", "cart-template");
        formData.append("sections_url", theme.routes.searchUrl);
      } else {
        formData.append("sections", "ajax-cart");
      }
      return fetch(theme.routes.cartAdd, {
        method: "post",
        headers: new Headers({ "X-Requested-With": "XMLHttpRequest" }),
        body: formData,
        dataType: "json"
      }).then((data) => {
        this.get().then((res) => {
          let addedItem = res.items.find((item) => item.id == parseInt(formData.get("id")));
          let addedItemData = Object.assign(addedItem, { sections: data["sections"] });
          document.dispatchEvent(new CustomEvent("cart-add", { detail: addedItemData }));
          document.dispatchEvent(new CustomEvent("cart-change", { detail: res }));
        });
      });
    }
    get() {
      return fetch(theme.routes.cartGet, { dataType: "json" }).then((res) => Object.assign(this, res));
    }
    clear() {
      return fetch(theme.routes.cartClear, { dataType: "json" }).then((res) => {
        this.value = res;
        return res;
      });
    }
    change(id, quantity) {
      return fetch(theme.routes.cartChange, {
        method: "post",
        body: JSON.stringify({ id, quantity }),
        headers: { "Content-Type": "application/json" },
        dataType: "json"
      }).then((res) => {
        this.value = res;
        return res;
      });
    }
    remove(id) {
      return fetch(theme.routes.cartChange, {
        method: "post",
        headers: new Headers({ "Content-Type": "application/json" }),
        dataType: "json",
        body: JSON.stringify({ id, quantity: 0 })
      }).then((res) => {
        this.value = res;
        document.dispatchEvent(new CustomEvent("cart-change", { detail: res }));
        return res;
      });
    }
  };

  // app/scripts/common/model/product-card.js
  var ProductCard = class extends HTMLElement {
    constructor() {
      super();
      this.elms = {
        form: this.querySelector("form"),
        atcButton: this.querySelector(".js-atc-btn"),
        quickViewButton: this.querySelector(".js-product-card-quick-view")
      };
      this.initATC();
      this.initQuickView();
    }
    initATC() {
      let { form, atcButton } = this.elms;
      if (typeof form != "undefined") {
        form.addEvent("submit", (e) => {
          e.preventDefault();
          if (!atcButton.hasClass("has-pending")) {
            atcButton.insertAdjacentHTML("beforeend", '<svg class="svg-loading" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; background: none; shape-rendering: auto;" width="28px" height="28px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"><circle cx="50" cy="50" fill="none" stroke="var(--main-color)" stroke-width="5" r="35" stroke-dasharray="164.93361431346415 56.97787143782138">  <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" values="0 50 50;360 50 50" keyTimes="0;1"></animateTransform></circle></svg>');
          }
          atcButton.addClass("pending", "has-pending");
          Cart.add(form).finally(() => {
            atcButton.removeClass("pending");
          });
        });
      }
    }
    initQuickView() {
      let { quickViewButton } = this.elms;
      quickViewButton && quickViewButton.addEvent("click", function() {
        let { productHandle } = this.dataset;
        this.addClass("pending");
        let arrPromise = [];
        arrPromise.push(AT.loadPopupQuickView());
        arrPromise.push(AT.productsViewedQuickly[productHandle] ? AT.productsViewedQuickly[productHandle] : fetch(`/products/${productHandle}?view=ajax-quick-view`, { dataType: "text" }));
        Promise.all(arrPromise).then((res) => {
          if (res[0]) {
            PopupQuickView.open(res[1]);
            AT.productsViewedQuickly[productHandle] = res[1];
          } else {
            console.log("An error occurred while loading quick view");
          }
        }).finally(() => this.removeClass("pending"));
      });
    }
  };

  // app/scripts/common/model/slider-component.js
  var SliderComponent = class extends HTMLElement {
    constructor() {
      super();
      this.sliderContainer = this.querySelector(".js-slider-container");
      this.config = Object.assign(JSON.parse(this.querySelector("[data-tns-config]").innerHTML), {
        onInit: () => {
          this.sliderContainer.addClass("slider-initialized");
        }
      });
    }
    init(config = {}) {
      try {
        return this.slider = tns(Object.assign({ ...this.config }, config));
      } catch (error) {
        console.log(this);
        console.error(error);
      }
    }
    destroy() {
      this.slider.destroy();
    }
    goTo(index) {
      try {
        this.slider.goTo(index);
      } catch (error) {
        console.log(this);
        console.warn(error);
      }
    }
    play() {
      try {
        this.slider.play();
      } catch (error) {
        console.log(this);
        console.warn(error);
      }
    }
    pause() {
      try {
        this.slider.pause();
      } catch (error) {
        console.log(this);
        console.warn(error);
      }
    }
    getConfig() {
      return this.config;
    }
  };

  // app/scripts/common/model/collapse.js
  var CollapsePanel = class extends HTMLElement {
    constructor() {
      super();
      this.elms = {
        triggerElement: this.querySelector("collapse-panel-header"),
        expansionElement: this.querySelector("collapse-panel-content")
      };
      this.initEvent();
      this.initContentObserverEventHandler();
    }
    initEvent() {
      let { triggerElement, expansionElement } = this.elms;
      if (this.hasAttribute("open")) {
        expansionElement.css("height", expansionElement.firstElementChild.offsetHeight + "px");
      }
      triggerElement.addEvent("click", () => {
        if (this.hasAttribute("open")) {
          this.close();
        } else {
          this.open();
        }
      });
    }
    open() {
      let { expansionElement } = this.elms;
      this.setAttribute("open", "");
      let height = expansionElement.firstElementChild.offsetHeight;
      expansionElement.css("height", height + "px");
    }
    close() {
      let { expansionElement } = this.elms;
      this.removeAttribute("open");
      expansionElement.css("height", "");
    }
    initContentObserverEventHandler() {
      let { expansionElement } = this.elms;
      let observer = new MutationObserver(this.open.bind(this));
      observer.observe(expansionElement, { childList: true, subtree: true });
      window.addEvent("resize", this.open.bind(this));
    }
  };

  // app/scripts/common/model/quantity-input.js
  var QuantityInput = class extends HTMLElement {
    constructor() {
      super();
      let minusButton = this.querySelector("quantity-input-minus");
      let plusButton = this.querySelector("quantity-input-plus");
      let input = this.querySelector("input[name='quantity']");
      let min = +input.min;
      minusButton.addEvent("click", () => {
        let { value } = input;
        --value;
        value > 1 ? input.value = value : input.value = 1;
        input.dispatchEvent(new Event("input"));
      });
      plusButton.addEvent("click", () => {
        let { value } = input;
        if (input.max) {
          let max = Number(input.max);
          input.value = ++value;
          if (input.value > max) {
            input.value = max;
            alert(theme.strings.allItemsAreInCart);
          }
        } else {
          input.value = ++value;
        }
        input.dispatchEvent(new Event("input"));
      });
      input.addEvent("input", AT.debounce(() => {
        if (typeof this.callback === "function" && input.value >= min) {
          this.callback(input.value);
        }
      }, 500));
    }
    onChange(cb) {
      this.callback = cb;
    }
  };

  // app/scripts/common/model/popups.js
  var Popups2 = class {
    constructor() {
      this.list = {};
    }
    open(id) {
      this.list[id] && this.list[id].open();
    }
    close(id) {
      this.list[id] && this.list[id].close();
    }
    closeAll() {
      Object.keys(this.list).forEach((key) => this.list[key].close());
    }
    push(name, element) {
      this.list[name] = element;
    }
    get(name) {
      return this.list[name];
    }
  };

  // app/scripts/common/model/popup-component.js
  var PopupComponent = class extends HTMLElement {
    constructor() {
      super();
      this.getElementsByClassName("js-popup-close").addEvents("click", this.close.bind(this));
    }
    close() {
      this.removeClass("is-open");
      AT.enableScroll();
    }
    open() {
      this.addClass("is-open");
      AT.disableScroll();
    }
  };

  // app/scripts/common/model/popup-message.js
  var PopupMessage2 = class extends PopupComponent {
    constructor() {
      super();
    }
    open(message) {
      this.addClass("is-open");
      this.querySelector(".js-message").innerHTML = message;
      AT.disableScroll();
    }
  };

  // app/scripts/common/section/announcement-bar.js
  var AnnouncementBar = {
    onLoad() {
      let { container } = this;
      try {
        this.slider = container.querySelector("slider-component").init();
      } catch (error) {
        console.log(container);
        console.warn(error);
      }
    }
  };

  // app/scripts/common/section/featured-collection.js
  var FeaturedCollection = {
    onLoad() {
      let { container } = this;
      try {
        AT.detectVisible({
          element: container,
          rootMargin: "0px",
          callback() {
            let sliderComponent = container.querySelector("slider-component");
            sliderComponent.init();
          }
        });
      } catch (error) {
        console.log(container);
        console.error(error);
      }
    }
  };

  // app/scripts/common/section/logo-list.js
  var LogoList = {
    onLoad() {
      let { container } = this;
      try {
        AT.detectVisible({
          element: container,
          rootMargin: "0px",
          callback() {
            let sliderComponent = container.querySelector("slider-component");
            sliderComponent.init();
          }
        });
      } catch (error) {
        console.log(container);
        console.error(error);
      }
    }
  };

  // app/scripts/common/section/featured-blog.js
  var FeaturedBlog = {
    onLoad() {
      let { container } = this;
      try {
        AT.detectVisible({
          element: container,
          rootMargin: "0px",
          callback() {
            let sliderComponent = container.querySelectorAll("slider-component");
            sliderComponent.forEach(function(item) {
              item.init();
            });
          }
        });
      } catch (error) {
        console.log(container);
        console.error(error);
      }
    }
  };

  // app/scripts/common/section/header.js
  var Header = {
    onLoad() {
      let { container } = this;
      this.config = {
        sticky: container.dataset.sticky === "true"
      };
      this.elms = {
        mobileDrawerInput: this.container.querySelector("#mobile-drawer-input"),
        dropdownCartTemplate: this.container.querySelector("#dropdown-cart-template"),
        headerCartIconDesktop: this.container.getElementsByClassName("js-header-cart-icon--desktop"),
        headerCartIconMobile: this.container.querySelector(".js-header-cart-icon--mobile")
      };
      if (container.dataset.sticky === "true") {
        this.initSticky();
      }
      this.inittoggleMenu();
      this.initVerticalDropdown();
      this.initDrawer();
      this.initCartIcons();
      this.initDropdownCart();
      this.initChangeImage();
      this.initCountdown();
    },
    initVerticalDropdown() {
      let verticalDropdown = document.querySelector(".vertical-menu-head");
      if (!verticalDropdown) {
        return;
      }
      verticalDropdown.addEvent("click", (e) => {
        if (verticalDropdown.hasClass("open")) {
          verticalDropdown.removeClass("open");
          document.querySelector(".header-vertical-menu").removeClass("open");
        } else {
          verticalDropdown.addClass("open");
          document.querySelector(".header-vertical-menu").addClass("open");
        }
      });
    },
    inittoggleMenu() {
      let toggleMenu = document.querySelector(".off-canvas-navigation-wrapper");
      let toggleMenuClose = document.querySelector("#main-content");
      if (!toggleMenu) {
        return;
      }
      toggleMenu.addEvent("click", (e) => {
        toggleMenu.addClass("toggled");
        document.querySelector("body").addClass("off-canvas-active");
      });
      toggleMenuClose.addEvent("click", (e) => {
        toggleMenu.removeClass("toggled");
        document.querySelector("body").removeClass("off-canvas-active");
      });
    },
    initDropdownCart() {
      let { headerCartIconDesktop, headerCartIconMobile, dropdownCartTemplate } = this.elms;
      if (!dropdownCartTemplate) {
        return;
      }
      this.dropdownCart = {
        inserted: false,
        container: dropdownCartTemplate.content.firstElementChild
      };
      Object.assign(this.dropdownCart, {
        elms: {
          lineItemListContainer: this.dropdownCart.container.querySelector(".js-cart-line-item-list"),
          cartTotal: this.dropdownCart.container.querySelector(".js-cart-total")
        },
        setItemCount(count) {
          this.container.setAttribute("data-cart-item-count", count);
        },
        highlightNewAddedItem(data) {
          let { lineItemListContainer } = this.elms;
          let newAddedLineItem = [...lineItemListContainer.children].find((item) => item.dataset.id == data.id);
          if (newAddedLineItem) {
            newAddedLineItem.addClass("line-item--highlight");
            lineItemListContainer.scrollTo(0, newAddedLineItem.offsetTop);
            AT.debounce(() => newAddedLineItem.removeClass("line-item--highlight"), 1e3)();
          }
        }
      });
      this.dropdownCart.container.querySelector(".js-btn-close").addEvent("click", () => {
        this.dropdownCart.container.closest(".header-cart").removeClass("active");
        document.querySelector("body").removeClass("cart-active");
      });
      if (document.querySelector("body").hasClass("cart-type-drawer")) {
        this.dropdownCart.container.querySelector(".btn-close-cart").addEvent("click", (e) => {
          this.dropdownCart.container.closest(".header-cart").removeClass("active");
          document.querySelector("body").removeClass("cart-active");
        });
      }
      this.dropdownCart.container.querySelectorAll(".js-cart-line-item").forEach(this.initDropdownCartLineItem.bind(this));
      window.addEvent("resize", async () => {
        if (this.dropdownCart.inserted) {
          if (window.innerWidth >= 992) {
            insertDropdownCart.call(this, headerCartIconDesktop[0]);
          } else {
          }
        }
      });
      if (headerCartIconDesktop.length) {
        initheaderCartIconDesktop.call(this);
      } else {
        document.addEvent("desktop-lazyloaded", () => initheaderCartIconDesktop.bind(this), { once: true });
      }
      document.addEvent("click", (e) => {
        if (window.innerWidth >= 992 && !this.dropdownCart.container.contains(e.target) && this.dropdownCart.inserted) {
          this.dropdownCart.container.closest(".header-cart").removeClass("active");
          document.querySelector("body").removeClass("cart-active");
        }
      });
      document.addEvent("cart-add", ({ detail }) => {
        if (!this.dropdownCart.inserted) {
          insertDropdownCart.call(this, window.innerWidth >= 992 ? headerCartIconDesktop[0] : headerCartIconMobile);
        }
        this.updateDropdownCart("add", detail);
        if (window.innerWidth < 992) {
          document.querySelector("#cart-message").addClass("is-open");
        } else {
          if (document.querySelector(".js-header-cart-icon--desktop").hasClass("effect-popup")) {
            document.querySelector("#cart-message").addClass("is-open");
          } else {
            document.querySelector(".js-header-cart-icon--desktop").click();
          }
        }
      });
      
      function insertDropdownCart(cartItemElement) {
        if (!this.dropdownCart.inserted) {
          this.dropdownCart.inserted = true;
        }
        cartItemElement.insertAdjacentElement("afterend", this.dropdownCart.container);
      }
      function initheaderCartIconDesktop() {
        headerCartIconDesktop[0].addEvent("click", (e) => {
          if (document.querySelector("body").hasClass("cart-type-page")) {
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          if (!this.dropdownCart.inserted) {
            insertDropdownCart.call(this, headerCartIconDesktop[0]);
          }
          this.dropdownCart.container.closest(".header-cart").addClass("active");
          document.querySelector("body").addClass("cart-active");
        });
      }
    },
    updateDropdownCart(action, data) {
      let { lineItemListContainer, cartTotal } = this.dropdownCart.elms;
      switch (action) {
        case "remove": {
          this.dropdownCart.container.setAttribute("data-cart-item-count", data.item_count);
          this.dropdownCart.container.setAttribute("data-cart-item-count", data.item_count);
          cartTotal.innerHTML = data.total_price.toCurrency();
          break;
        }
        case "add": {
          let { sections, ...lineItem } = data;
          let div = document.createElement("div");
          div.innerHTML = sections["ajax-cart"];
          let cartJSON = JSON.parse(div.querySelector("[data-cart-json]").innerHTML);
          let newlineItem = [...div.querySelectorAll(".js-cart-line-item")].find((item) => item.dataset.id == lineItem.id);
          if (![...lineItemListContainer.children].find((item) => {
            if (item.dataset.id == lineItem.id) {
              item.querySelector(".js-line-item-qty").innerHTML = lineItem.quantity;
              item.querySelector(".js-line-item-price").innerHTML = lineItem.final_line_price.toCurrency();
              return true;
            }
          })) {
            this.initDropdownCartLineItem(newlineItem);
            lineItemListContainer.prepend(newlineItem);
          }
          cartTotal.innerHTML = cartJSON.total_price.toCurrency();
          this.dropdownCart.setItemCount(cartJSON.item_count);
          break;
        }
      }
    },
    initDropdownCartLineItem(lineItemElement) {
      let removeButton = lineItemElement.querySelector(".js-btn-remove");
      let { id } = lineItemElement.dataset;
      removeButton.addEvent("click", (e) => {
        e.preventDefault();
        removeButton.innerHTML = theme.strings.header.dropdownCart.removing;
        Cart.remove(id).then((res) => {
          lineItemElement.remove();
          this.updateDropdownCart("remove", res);
        });
      });
    },
    initSticky() {
      let { container } = this;
      let offsetHeight = container.offsetHeight;
      let height = container.offsetHeight;
      document.documentElement.style.setProperty("--header-height", height + "px");
      if (window.pageYOffset > offsetHeight) {
        container.addClass("header-sticky");
        container.css("height", height + "px");
      }
      window.addEvent("scroll", () => {
        if (window.pageYOffset > offsetHeight) {
          container.addClass("header-sticky");
          container.css("height", height + "px");
        } else if (window.pageYOffset <= container.offsetTop) {
          container.removeClass("header-sticky");
          container.css("height", "");
        }
      });
      window.addEvent("resize", () => {
        height = container.offsetHeight;
        offsetHeight = container.offsetHeight;
        document.documentElement.style.setProperty("--header-height", height + "px");
        document.dispatchEvent(new CustomEvent("header-height-change", { detail: height + "px" }));
      });
    },
    initDrawer() {
      let { mobileDrawerInput } = this.elms;
      let mobileDrawerTemplate = this.container.querySelector("#header-mobile-drawer-wrapper");
      let div = document.createElement("div");
      div.innerHTML = mobileDrawerTemplate.innerHTML;
      mobileDrawerInput.addEvent("input", () => {
        mobileDrawerTemplate.insertAdjacentElement("beforebegin", div.firstElementChild);
        mobileDrawerTemplate.remove();
      }, { once: true });
      mobileDrawerInput.addEvent("input", function() {
        this.checked ? AT.disableScroll() : AT.enableScroll();
        if (this.checked) {
          document.querySelector("body").addClass("mobile-menu-active");
        } else {
          document.querySelector("body").removeClass("mobile-menu-active");
        }
        let menuCheckboxMobile = document.querySelectorAll(".menu-checkbox-mobile");
        menuCheckboxMobile.forEach(function(item) {
          item.addEventListener("change", function() {
            if (this.checked) {
              this.closest(".menu-mobile-item").addClass("active");
              document.querySelector(".menu-mobile-list").addClass("sub-open");
            } else {
              this.closest(".menu-mobile-item").removeClass("active");
              document.querySelector(".menu-mobile-list").removeClass("sub-open");
            }
          });
        });
        let menuCheckboxMobile2 = document.querySelectorAll(".menu-checkbox-mobile-2");
        menuCheckboxMobile2.forEach(function(item2) {
          item2.addEventListener("change", function() {
            if (this.checked) {
              this.closest(".menu-mobile-item-2").addClass("active");
              this.closest(".menu-mobile-list--lv1").addClass("sub-open");
            } else {
              this.closest(".menu-mobile-item-2").removeClass("active");
              this.closest(".menu-mobile-list--lv1").removeClass("sub-open");
            }
          });
        });
      });
      let _template_id = document.querySelectorAll(".mega-menu-item");
      _template_id.forEach(function(temp) {
        temp.addEventListener("mouseover", function() {
          let __this = this.querySelector(".temp-id");
          if (__this) {
            let div2 = document.createElement("div");
            div2.innerHTML = __this.innerHTML;
            __this.insertAdjacentElement("afterend", div2.firstElementChild);
            __this.remove();
          }
          let _menu_item = document.querySelectorAll(".menu-item");
          _menu_item.forEach(function(menuItem) {
            menuItem.addEventListener("mouseover", function() {
              this.addClass("open");
            });
            menuItem.addEventListener("mouseleave", function() {
              this.removeClass("open");
            });
          });
        });
        temp.addEventListener("shopify:block:select", function() {
          this.addClass("open");
        });
        temp.addEventListener("shopify:block:deselect", function() {
          this.removeClass("open");
        });
      });
    },
    initCartIcons() {
      let cartItemCount = this.container.getElementsByClassName("js-cart-item-count");
      let cartItemTotal = this.container.getElementsByClassName("js-cart-item-total");
      document.addEvent("cart-change", ({ detail }) => {
        [...cartItemCount].forEach((item) => item.innerHTML = detail.item_count);
        [...cartItemTotal].forEach((item) => item.innerHTML = detail.total_price.toCurrency());
      });
      window.addEvent("resize", () => {
        [...cartItemCount].forEach((item) => item.innerHTML = Cart.item_count);
        [...cartItemTotal].forEach((item) => item.innerHTML = Cart.total_price.toCurrency());
      });
    },
    initChangeImage() {
      let specialItemThumbImage = document.querySelectorAll(".img-swt-temp");
      if (!specialItemThumbImage) {
        return;
      }
      specialItemThumbImage.forEach(function(thumb) {
        thumb.addEvent("click", function() {
          let imgsrcset = thumb.querySelector("img").getAttribute("srcset");
          let imgdatasrcset = thumb.querySelector("img").getAttribute("data-srcset");
          let parent = thumb.closest(".product-card");
          let imgElem = parent.querySelector(".wrap-image img");
          imgElem.setAttribute("data-srcset", imgdatasrcset);
          imgElem.setAttribute("srcset", imgsrcset);
        });
      });
    },
    initCountdown() {
      let productCountdown = document.querySelectorAll(".product-countdown");
      if (!productCountdown) {
        return;
      }
      productCountdown.forEach(function(countdown) {
        let _dueDate_year = countdown.getAttribute("data-duedate-year");
        let _dueDate_month = countdown.getAttribute("data-duedate-month");
        let _dueDate_day = countdown.getAttribute("data-duedate-day");
        let _countDownDate = new Date(_dueDate_year, _dueDate_month - 1, _dueDate_day).getTime();
        let _x = setInterval(function() {
          let now = new Date().getTime();
          let distance = _countDownDate - now;
          let days = Math.floor(distance / (1e3 * 60 * 60 * 24));
          let hours = Math.floor(distance % (1e3 * 60 * 60 * 24) / (1e3 * 60 * 60));
          let minutes = Math.floor(distance % (1e3 * 60 * 60) / (1e3 * 60));
          let seconds = Math.floor(distance % (1e3 * 60) / 1e3);
          if (days > 0) {
            countdown.querySelector(".countdown-html").innerHTML = "<span class='countdown-section'><span class='countdown-value'>" + days + "</span><span class='countdown-text'>Days</span></span> <span class='countdown-section'><span class='countdown-value'>" + hours + "</span><span class='countdown-text'>Hours</span></span> <span class='countdown-section'><span class='countdown-value'>" + minutes + "</span><span class='countdown-text'>Minutes</span></span> <span class='countdown-section'><span class='countdown-value'>" + seconds + "</span><span class='countdown-text'>Seconds</span></span>";
          } else {
            countdown.querySelector(".countdown-html").innerHTML = "<span class='countdown-section'><span class='countdown-value'>" + hours + "</span><span class='countdown-text'>Hours</span></span> <span class='countdown-section'><span class='countdown-value'>" + minutes + "</span><span class='countdown-text'>Minutes</span></span> <span class='countdown-section'><span class='countdown-value'>" + seconds + "</span><span class='countdown-text'>Seconds</span></span>";
          }
          if (distance < 0) {
            clearInterval(_x);
            countdown.closest(".product-countdown").addClass("d-none");
          }
        }, 1e3);
      });
    }
  };

  // app/scripts/common/function/detectVisible.js
  var detectVisible = ({ element, rootMargin, callback, threshold = 0 }) => {
    if (typeof IntersectionObserver === "undefined") {
      callback();
      return;
    }
    let observer = new IntersectionObserver((entries, observer2) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback();
          observer2.unobserve(element);
        }
      });
    }, { rootMargin });
    observer.observe(element);
  };

  // app/scripts/common/function/initTabPanel.js
  var initTabPanel = (container) => {
    try {
      let tabControls = container.querySelector(".js-tab-controls");
      let tabContents = container.querySelector(".js-tab-contents");
      [...tabControls.children].forEach((item) => {
        let target = tabContents.querySelector(item.dataset.target);
        item.addEvent("click", () => {
          if (item.hasClass("active")) {
            return;
          }
          tabControls.children.removeClass("active");
          tabContents.children.removeClass("active");
          item.addClass("active");
          target.addClass("active");
        });
      });
    } catch (error) {
      console.warn("Has an error from Tab Panel function:", error);
      console.log(container);
    }
  };

  // app/scripts/common/function/disableScroll.js
  function disableScroll() {
    let paddingRight = window.innerWidth - document.documentElement.offsetWidth + "px";
    document.documentElement.style.paddingRight = paddingRight;
    document.documentElement.addClass("overflow-hidden");
  }

  // app/scripts/common/function/enableScroll.js
  function enableScroll() {
    document.documentElement.style.paddingRight = "";
    document.documentElement.removeClass("overflow-hidden");
  }

  // app/scripts/common/function/debounce.js
  var debounce = (func, wait) => {
    let timeout;
    return function(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // app/scripts/common/function/loadScript.js
  var loadScript = (url, cb) => {
    let script = document.createElement("script");
    script.src = url;
    !!cb && (script.onload = cb);
    script.onError = () => {
      console.warn("Has an error when loading script:", url);
    };
    document.body.append(script);
  };

  // app/scripts/common/function/loadCss.js
  var loadCss = (url, cb) => {
    let link = document.createElement("link");
    link.href = url;
    link.rel = "stylesheet";
    link.as = "style";
    !!cb && (link.onload = cb);
    link.onError = () => {
      console.warn("Has an error when loading link:", url);
    };
    document.head.append(link);
  };

  // app/scripts/common/function/loadSearch.js
  var loadSearch = function() {
    return new Promise((resolve, reject) => {
      if (AT.searchLoaded) {
        reject(0);
      } else {
        AT.loadScript(theme.assets.search, () => {
          AT.searchLoaded = true;
          resolve(1);
        });
      }
    });
  };

  // app/scripts/common/function/queue.js
  var Queue = class {
    constructor() {
      this.queue = [];
      this.running = false;
    }
    add(promise, callback) {
      this.queue.push([promise, callback]);
      if (!this.running) {
        this.next();
      }
    }
    next() {
      this.running = false;
      if (this.test) {
        return;
      }
      let [promise, callback] = this.queue.shift() || [void 0, void 0];
      if (!promise) {
        return;
      }
      if (typeof promise.then === "function") {
        this.running = true;
        return promise.then((data) => {
          !!callback && callback(data);
          this.next();
          return data;
        });
      } else {
        this.running = true;
        return new Promise((res, rej) => res(promise)).then((data) => {
          !!callback && callback(data);
          this.next();
          return data;
        });
      }
    }
  };

  // app/scripts/common/function/getParameterByName.js
  function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"), results = regex.exec(url);
    if (!results)
      return null;
    if (!results[2])
      return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  // app/scripts/common/function/scrollTo.js
  function scrollTo(element, duration, minus = 0) {
    return new Promise((resolve, reject) => {
      var startingY = window.pageYOffset;
      var elementY = getElementY(element) - minus;
      var targetY = document.body.scrollHeight - elementY < window.innerHeight ? document.body.scrollHeight - window.innerHeight : elementY;
      var diff = targetY - startingY;
      var easing = function(t) {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
      };
      var start;
      if (!diff)
        return resolve(1);
      window.requestAnimationFrame(function step(timestamp) {
        if (!start)
          start = timestamp;
        var time = timestamp - start;
        var percent = Math.min(time / duration, 1);
        percent = easing(percent);
        window.scrollTo(0, startingY + diff * percent);
        if (time < duration) {
          window.requestAnimationFrame(step);
        } else {
          resolve(1);
        }
      });
    });
  }
  function getElementY(query) {
    return typeof query == "number" ? query : window.pageYOffset + query.getBoundingClientRect().top;
  }

  // app/scripts/common/function/backToTop.js
  function initBackToTop() {
    let backToTopButton = document.getElementById("back-to-top");
    backToTopButton.addEvent("click", () => {
      AT.scrollTo(0, 1e3);
    });
    window.addEvent("scroll", () => {
      if (window.pageYOffset > window.innerHeight * 1.5) {
        backToTopButton.addClass("show");
      } else {
        backToTopButton.removeClass("show");
      }
    });
  }

  // app/scripts/common/function/cookie.js
  var cookie = {
    get: function(key) {
      var keyValue = document.cookie.match("(^|;) ?" + key + "=([^;]*)(;|$)");
      return keyValue ? JSON.parse(keyValue[2]) : null;
    },
    set: function(key, value, expiry) {
      var expires = new Date();
      expires.setTime(expires.getTime() + expiry * 24 * 60 * 60 * 1e3);
      document.cookie = key + "=" + JSON.stringify(value) + ";expires=" + expires.toUTCString() + ";path=/";
    },
    delete: function(key) {
      var keyValue = this.get(key);
      this.set(key, keyValue, "-1");
    }
  };

  // app/scripts/common/function/loadPopupMessage.js
  function loadPopupMessage() {
    return new Promise((resolve, reject) => {
      if (typeof window.PopupMessage != "undefined") {
        resolve(1);
        return;
      }
      let template = document.getElementById("popup-container");
      let popupMessage = template.content.querySelector("popup-message");
      if (popupMessage) {
        template.insertAdjacentElement("beforebegin", popupMessage);
        customElements.define("popup-message", PopupMessage2);
        window.PopupMessage = popupMessage;
        Popups.push("popup-message", window.PopupMessage);
        return resolve(1);
      }
      return reject(0);
    });
  }

  // app/scripts/common/function/loadPopupQuickView.js
  function loadPopupQuickView() {
    return new Promise((resolve, reject) => {
      if (typeof window.PopupQuickView != "undefined") {
        return resolve(1);
      }
      AT.loadScript(theme.assets.popupQuickView, () => {
        resolve(1);
      });
    });
  }

  // app/scripts/common/function/loadPopupStoreLocation.js
  function loadPopupStoreLocation() {
    let arrPromise = [
      new Promise((res, rej) => {
        AT.loadCss(theme.assets.mapboxCss, () => {
          res(1);
        });
      }),
      new Promise((res, rej) => {
        AT.loadScript(theme.assets.mapboxJs, () => {
          res(1);
        });
      }),
      new Promise((res, rej) => {
        AT.loadScript(theme.assets.storeLocationPopup, () => {
          res(1);
        });
      })
    ];
    return Promise.all(arrPromise);
  }

  // app/scripts/common.js
  Object.assign(window, {
    load,
    register,
    Cart: new Cart2(),
    AT: {
      searchLoaded: false,
      detectVisible,
      initTabPanel,
      disableScroll,
      enableScroll,
      debounce,
      loadScript,
      loadCss,
      loadSearch,
      getParameterByName,
      getSizedImageUrl,
      scrollTo,
      queue: new Queue(),
      cookie,
      loadPopupMessage,
      loadPopupQuickView,
      loadPopupStoreLocation,
      initCustomElements(name) {
        switch (name) {
          case "slider-component":
            customElements.define(name, SliderComponent);
            break;
          case "collapse-panel":
            customElements.define(name, CollapsePanel);
        }
      },
      productsViewedQuickly: {}
    }
  });
  window.Popups = new Popups2();
  window.PopupComponent = PopupComponent;
  theme.customElementsList && [...new Set(theme.customElementsList)].forEach((name) => {
    switch (name) {
      case "slider-component":
        customElements.define(name, SliderComponent);
        break;
      case "collapse-panel":
        customElements.define(name, CollapsePanel);
    }
  });
  customElements.define("product-card", ProductCard);
  customElements.define("quantity-input", QuantityInput);
  customElements.define("popup-component", PopupComponent);
  register("header", Header);
  theme.sectionRegister && theme.sectionRegister.forEach((name) => {
    switch (name) {
      case "announcement-bar":
        register("announcement-bar", AnnouncementBar);
        break;
      case "featured-collection":
        register("featured-collection", FeaturedCollection);
        break;
      case "logo-list":
        register("logo-list", LogoList);
        break;
      case "featured-blog":
        register("featured-blog", FeaturedBlog);
        break;
    }
  });
  load("*");
  document.querySelectorAll("input[name='q']").addEvents("click", () => AT.loadSearch(), { once: true });
  console.log("global.js loaded");
  document.dispatchEvent(new CustomEvent("global.js loaded"));
  initBackToTop();
})();
