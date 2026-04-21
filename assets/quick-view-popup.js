(() => {
  // app/scripts/common/function/linkOptions.js
  var linkOptions = (container, product, cb) => {
    let optionsMap = {};
    if (!container) {
      return;
    }
    let statusWhenVariantSoldOut = container.dataset.statusSoldOut;
    let optionElements = container.getElementsByClassName("js-option-item");
    if (product.variants.length < 2) {
      return;
    }
    optionElements.addEvents("change", function() {
      container.dispatchEvent(new CustomEvent("swatch-change", { detail: { position: +this.dataset.optionPosition, optionValue: this.value } }));
    });
    container.addEvent("swatch-change", function({ detail: { position, optionValue } }) {
      container.querySelector(`[data-selected-option='option${position}']`).innerHTML = optionValue;
      switch (position) {
        case 1:
          if (product.options.length > 1) {
            updateOptionsInSelector(2);
          } else {
            cb(findVariantFromOption(getValueOptions()));
          }
          break;
        case 2:
          if (product.options.length === 3) {
            updateOptionsInSelector(3);
          } else {
            cb(findVariantFromOption(getValueOptions()));
          }
          break;
        case 3:
          cb(findVariantFromOption(getValueOptions()));
          break;
      }
    });
    product.variants.forEach((variant) => {
      if (variant.available) {
        optionsMap["root"] = optionsMap["root"] || [];
        optionsMap["root"].push(variant.option1);
        optionsMap["root"] = optionsMap["root"].reduce((accu, currentvalue) => {
          if (!accu.includes(currentvalue)) {
            accu.push(currentvalue);
          }
          return accu;
        }, []);
        if (product.options.length > 1) {
          var key = variant.option1;
          optionsMap[key] = optionsMap[key] || [];
          optionsMap[key].push(variant.option2);
          optionsMap[key] = optionsMap[key].reduce((accu, currentvalue) => {
            if (!accu.includes(currentvalue)) {
              accu.push(currentvalue);
            }
            return accu;
          }, []);
        }
        if (product.options.length === 3) {
          var key = variant.option1 + " / " + variant.option2;
          optionsMap[key] = optionsMap[key] || [];
          optionsMap[key].push(variant.option3);
          optionsMap[key] = optionsMap[key].reduce((accu, currentvalue) => {
            if (!accu.includes(currentvalue)) {
              accu.push(currentvalue);
            }
            return accu;
          }, []);
        }
      }
    });
    updateOptionsInSelector(1);
    function updateOptionsInSelector(position) {
      let optionValues = getValueOptions();
      let key, selector;
      switch (position) {
        case 1:
          key = "root";
          selector = container.querySelector(".js-swatch-item[data-position='1']");
          break;
        case 2:
          key = optionValues.option1;
          selector = container.querySelector(".js-swatch-item[data-position='2']");
          break;
        case 3:
          key = optionValues.option1 + " / " + optionValues.option2;
          selector = container.querySelector(".js-swatch-item[data-position='3']");
          break;
      }
      switch (selector.dataset.style) {
        case "select": {
          let selectElement = selector.getElementsByClassName("js-option-item")[0];
          let oldValue2 = selectElement.value;
          switch (statusWhenVariantSoldOut) {
            case "hide": {
              selectElement.innerHTML = optionsMap[key].map((optionValue) => `<option value="${optionValue}">${optionValue}</option>`).join("");
              if (optionsMap[key].includes(oldValue2)) {
                selectElement.value = oldValue2;
              }
              break;
            }
            case "disable": {
              [...selectElement.options].forEach((option) => {
                if (optionsMap[key].includes(option.value)) {
                  option.disabled = false;
                } else {
                  option.disabled = true;
                  option.selected = false;
                }
              });
              [...selectElement.options].find((option) => option.disabled == false && (option.selected = true));
              break;
            }
          }
          break;
        }
        case "color":
        case "image":
        case "button":
          let inputsElement = selector.getElementsByClassName("js-option-item");
          let oldValue = [...inputsElement].find((input) => input.checked).value;
          switch (statusWhenVariantSoldOut) {
            case "hide":
              inputsElement.forEach((input) => {
                if (optionsMap[key].includes(input.value)) {
                  input.closest(".swatch-group_wrapper").removeClass("d-none");
                } else {
                  input.closest(".swatch-group_wrapper").addClass("d-none");
                  oldValue === input.value && (input.checked = false, inputsElement[0].checked = true);
                }
              });
              break;
            case "disable": {
              inputsElement.forEach((input) => {
                if (optionsMap[key].includes(input.value)) {
                  input.disabled = false;
                } else {
                  input.disabled = true;
                  oldValue === input.value && (input.checked = false, inputsElement[0].checked = true);
                }
              });
              break;
            }
          }
          break;
      }
      container.dispatchEvent(new CustomEvent("swatch-change", { detail: { position, optionValue: optionValues[`option${position}`] } }));
    }
    function getValueOptions() {
      return [...container.getElementsByClassName("js-swatch-item")].reduce((accu, element) => {
        switch (element.dataset.style) {
          case "select":
            let select = element.querySelector("select.single-option-selector");
            accu[select.name] = select.value;
            break;
          case "color":
          case "image":
          case "button":
            let inputsElements = element.querySelectorAll("input[data-single-option-selector]");
            accu[inputsElements[0].name] = [...inputsElements].find((input) => input.checked).value;
            break;
        }
        return accu;
      }, {});
    }
    function findVariantFromOption(options) {
      return product.variants.find((variant) => {
        return Object.keys(options).every((optionKey) => variant[optionKey] === options[optionKey]);
      });
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

  // app/scripts/quick-view-popup.js
  var PopupQuickView2 = class extends PopupComponent {
    constructor() {
      super();
    }
    open(html) {
      this.querySelector(".js-popup-box-inner").innerHTML = html;
      this.elms = {
        priceCompareElement: this.querySelector(".js-price-compare"),
        priceElement: this.querySelector(".js-price"),
        skuElement: this.querySelector(".js-sku"),
        inventoryElement: this.querySelector(".js-inventory"),
        mediaMain: this.querySelector("#quick-view-product-media-main"),
        mediaThumnails: this.querySelector("#quick-view-product-media-thumnails"),
        selectMaster: this.querySelector("#select-master"),
        addToCartButton: this.querySelector(".js-atc-btn"),
        formElement: this.querySelector("form[action*='/cart/add']"),
        labelSaveContainer: this.querySelector(".js-product-label-save"),
        swatchContainer: this.querySelector("swatch-component"),
        quantityInputContainer: this.querySelector(".js-product-quantity"),
        subscribeForm: this.querySelector("#contact-notify-when-available"),
        dynamicCheckoutContainer: this.querySelector(".js-product-dymanic-checkout")
      };
      this.settings = JSON.parse(this.querySelector("[data-settings]").innerHTML);
      this.product = JSON.parse(this.querySelector("[data-product-json]").innerHTML);
      this.variantsInventory = JSON.parse(this.querySelector("[data-variants-inventory-json]").innerHTML);
      Object.keys(this.variantsInventory).forEach((variantId) => {
        this.product.variants.find((variant) => variant.id == variantId && Object.assign(variant, this.variantsInventory[variantId]));
      });
      this.initSliderMedia();
      this.initInventory();
      this.initFormAddToCart();
      linkOptions(this.elms.swatchContainer, this.product, this.handleVariantChange.bind(this));
      switch (theme.settings.shop.reviewApp) {
        case "shopify":
          if (window.SPR) {
            window.SPR.initDomEls();
            window.SPR.loadBadges();
          }
          break;
      }
      AT.debounce(() => {
        this.addClass("is-open");
        AT.disableScroll();
      }, 50)();
    }
    initSliderMedia() {
      let { mediaMain, mediaThumnails } = this.elms;
      !customElements.get("slider-component") && AT.initCustomElements("slider-component");
      this.mainSlider = mediaMain.init({ gutter: 12 });
      mediaThumnails.init();
    }
    handleVariantChange(variant) {
      let { skuElement, selectMaster, mediaMain } = this.elms;
      if (!variant) {
        this.updateVariantStatus();
        mediaMain.addClass("product-sold-out");
        return;
      }
      this.currentVariant = variant;
      this.updateLabelSave(variant);
      this.updateVariantStatus(variant);
      this.updatePrice(variant);
      variant.available ? mediaMain.removeClass("product-sold-out") : mediaMain.addClass("product-sold-out");
      if (skuElement) {
        !!variant.sku ? (skuElement.innerHTML = variant.sku) && skuElement.closest(".product-details_sku").removeClass("d-none") : skuElement.closest(".product-details_sku").addClass("d-none");
      }
      if (!!variant.featured_media) {
        this.mainSlider.goTo(variant.featured_media.position - 1);
      }
      selectMaster.value = variant.id;
    }
    initInventory() {
      let { inventoryElement } = this.elms;
      this.inventory = {
        setStatus: (status, variant) => {
          if (!this.settings.showInventory) {
            return;
          }
          inventoryElement.setAttribute("data-status", status);
          switch (status) {
            case "low-stock": {
              inventoryElement.querySelector(".inventory_low-stock").innerHTML = (variant.inventory_quantity > 1 ? theme.strings.product.itemsLowStock : theme.strings.product.itemLowStock).replace("{{quantity}}", variant.inventory_quantity);
              break;
            }
            case "items-stock": {
              inventoryElement.querySelector(".inventory_items-stock").innerHTML = (variant.inventory_quantity > 1 ? theme.strings.product.itemsStock : theme.strings.product.itemStock).replace("{{quantity}}", variant.inventory_quantity);
              break;
            }
          }
        }
      };
    }
    updateVariantStatus(variant) {
      let { addToCartButton } = this.elms;
      if (variant) {
        if (this.settings.enableSubscribe) {
          this.updateDynamicCheckout(variant.available);
          this.updateSubscribeForm(variant);
        }
        this.updateAddToCartButton(variant);
        this.updateInventory(variant);
      } else {
        addToCartButton.disabled = true;
        addToCartButton.querySelector("span").innerHTML = theme.strings.product.soldOut;
        this.inventory.setStatus("out-stock");
      }
    }
    updateDynamicCheckout(variantAvailable) {
      let { dynamicCheckoutContainer } = this.elms;
      if (dynamicCheckoutContainer) {
        variantAvailable ? dynamicCheckoutContainer.removeClass("d-none") : dynamicCheckoutContainer.addClass("d-none");
      }
    }
    updateSubscribeForm(variant) {
      let { subscribeForm } = this.elms;
      let inputBody = subscribeForm.querySelector("input[name='contact[body]']");
      let subscribeFormWrapper = subscribeForm.querySelector(".js-product-subscribe");
      !AT.getParameterByName("contact_posted") && subscribeFormWrapper.removeClass("posted-successfully");
      inputBody.value = inputBody.dataset.value.replace("{{product_name}}", variant.name);
      variant.available ? subscribeFormWrapper.addClass("d-none") : subscribeFormWrapper.removeClass("d-none");
      subscribeForm.addEvent("submit", () => {
        AT.cookie.set("subscribe-variant-id", this.currentVariant.id);
      });
    }
    updateAddToCartButton(variant) {
      let { addToCartButton, quantityInputContainer } = this.elms;
      if (variant.available) {
        addToCartButton.disabled = false;
        addToCartButton.querySelector("span").innerHTML = variant.inventory_quantity == 0 && variant.incoming ? theme.strings.product.preorder : theme.strings.product.addToCart;
        this.settings.enableSubscribe && quantityInputContainer.removeClass("d-none");
      } else {
        addToCartButton.disabled = true;
        addToCartButton.querySelector("span").innerHTML = theme.strings.product.soldOut;
        this.settings.enableSubscribe && quantityInputContainer.addClass("d-none");
      }
    }
    updateInventory(variant) {
      if (variant.available) {
        if (variant.inventory_management) {
          if (variant.inventory_policy == "continue" && variant.inventory_quantity < 1) {
            this.inventory.setStatus("pre-order", variant);
          } else {
            variant.inventory_quantity <= this.settings.inventoryThreshold ? this.inventory.setStatus("low-stock", variant) : this.inventory.setStatus("items-stock", variant);
          }
        } else {
          this.inventory.setStatus("in-stock");
        }
      } else {
        this.inventory.setStatus("out-stock");
      }
    }
    initFormAddToCart() {
      let { formElement, addToCartButton } = this.elms;
      formElement.addEvent("submit", (e) => {
        if (!addToCartButton.hasClass("has-pending")) {
          addToCartButton.insertAdjacentHTML("beforeend", '<svg class="svg-loading" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; background: none; shape-rendering: auto;" width="28px" height="28px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"><circle cx="50" cy="50" fill="none" stroke="var(--main-color)" stroke-width="5" r="35" stroke-dasharray="164.93361431346415 56.97787143782138">  <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" values="0 50 50;360 50 50" keyTimes="0;1"></animateTransform></circle></svg>');
        }
        e.preventDefault();
        addToCartButton.addClass("pending", "has-pending");
        Cart.add(formElement).then(() => {
          this.close();
        }).catch((error) => {
          AT.loadPopupMessage().then(() => {
            Popups.closeAll();
            PopupMessage.open(error.description);
          });
        }).finally(() => {
          addToCartButton.removeClass("pending");
        });
      });
    }
    updateLabelSave(variant) {
      let { labelSaveContainer } = this.elms;
      let percentElement = labelSaveContainer.querySelector(".js-percent");
      let moneySaved = labelSaveContainer.querySelector(".js-money-saved");
      let { compare_at_price, price } = variant;
      if (compare_at_price > price) {
        moneySaved.innerHTML = (compare_at_price - price).toCurrency();
        percentElement.innerHTML = Math.round((compare_at_price - price) / compare_at_price * 100);
        labelSaveContainer.removeClass("d-none");
      } else {
        labelSaveContainer.addClass("d-none");
      }
    }
    updatePrice(variant) {
      let { priceCompareElement, priceElement } = this.elms;
      if (!!variant.compare_at_price) {
        priceCompareElement.innerHTML = variant.compare_at_price.toCurrency();
        priceCompareElement.removeClass("d-none");
      } else {
        priceCompareElement.addClass("d-none");
      }
      priceElement.innerHTML = variant.price.toCurrency();
    }
    switchVariantById(variantId) {
      let { swatchContainer } = this.elms;
      let variantFound = theme.product.variants.find((i) => i.id == variantId);
      if (!variantFound) {
        return;
      }
      variantFound.options.forEach((option, index) => {
        [...swatchContainer.querySelectorAll(`[name='option${index + 1}']`)].find((element) => {
          switch (element.tagName) {
            case "INPUT":
              element.value == option && (element.checked = true, element.dispatchEvent(new Event("change")));
              break;
            case "SELECT":
              element.value = option;
              element.dispatchEvent(new Event("change"));
              break;
          }
        });
      });
    }
  };
  var template = document.getElementById("popup-container");
  var popupQuickView = template.content.querySelector("popup-quick-view");
  if (popupQuickView) {
    template.insertAdjacentElement("beforebegin", popupQuickView);
    customElements.define("popup-quick-view", PopupQuickView2);
    window.PopupQuickView = popupQuickView;
    Popups.push("popup-quick-view", window.PopupQuickView);
  }
  console.log("popup-quick-view script loaded");
})();
