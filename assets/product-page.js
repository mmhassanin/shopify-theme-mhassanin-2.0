(() => {
  // app/scripts/common/section/related-products.js
  var RelatedProducts = {
    onLoad() {
      let { container } = this;
      try {
        AT.detectVisible({
          element: container,
          rootMargin: "0px",
          callback: () => {
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

  // app/scripts/common/section/product-default.js
  var ProductDefault = {
    onLoad: function() {
      let container = this.container;
      this.product = theme.product;
      this.elms = {
        priceCompareElement: container.querySelector(".js-price-compare"),
        priceElement: container.querySelector(".js-price"),
        skuElement: container.querySelector(".js-sku"),
        inventoryElement: container.querySelector(".js-inventory"),
        mediaMain: document.getElementById("product-media-main"),
        mediaThumnails: document.getElementById("product-media-thumnails"),
        selectMaster: container.querySelector("#select-master"),
        addToCartButton: container.querySelector(".js-atc-btn"),
        formElement: container.querySelector("form[action*='/cart/add']"),
        labelSaveContainer: container.querySelector(".js-product-label-save"),
        swatchContainer: container.querySelector("swatch-component"),
        findStoreButton: container.querySelector(".js-find-store-btn"),
        quantityInputContainer: container.querySelector(".js-product-quantity"),
        subscribeForm: container.querySelector("#contact-notify-when-available"),
        dynamicCheckoutContainer: container.querySelector(".js-product-dymanic-checkout")
      };
      this.settings = JSON.parse(this.container.querySelector("[data-settings]").innerHTML);
      let shippingTime = document.querySelector(".shipping-time");
      if (shippingTime) {
        this.initOrderDeadLine();
        this.initOrderShipping();
      }
      let checkbundledAddToCart = document.querySelector("#bundledAddToCart");
      if (checkbundledAddToCart) {
        this.initProductItemEvents();
        this.initMultiVariantEvents();
      }
      this.initSliderMedia();
      this.initInventory();
      this.initFormAddToCart();
      linkOptions(this.elms.swatchContainer, this.product, this.handleVariantChange.bind(this));
      this.initScrollToReviews();
      initTabPanel(container);
      if (AT.getParameterByName("contact_posted")) {
        this.switchVariantById(AT.cookie.get("subscribe-variant-id"));
        AT.cookie.delete("subscribe-variant-id");
        let searchParams = window.location.search.replace("?", "").split("&").filter((param) => !param.includes("contact_posted")).filter(Boolean).join("&");
        window.history.replaceState({}, "", `${window.location.pathname}?${searchParams}`);
      }
    },
    initProductItemEvents() {
      let productItemElements = document.querySelectorAll(".js-input-quantity");
      this.initAddToCartFormEvent();
    },
    initAddToCartFormEvent(element) {
      let form = document.querySelector(".js-bundledAddToCart");
      let submitButton = form.querySelector(".js-btn-add-to-cart");
      form.addEvent("submit", (e) => {
        e.preventDefault();
        let inputElements = form.querySelectorAll("input[name='quantity']");
        let items = [...inputElements].reduce((accu, input) => {
          if (+input.value > 0) {
            accu.push({ id: +input.dataset.variantId, quantity: +input.value });
          }
          return accu;
        }, []);
        if (items.length) {
          if (!submitButton.hasClass("has-pending")) {
            submitButton.insertAdjacentHTML("beforeend", '<svg class="svg-loading" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; background: none; shape-rendering: auto;" width="28px" height="28px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"><circle cx="50" cy="50" fill="none" stroke="var(--main-color)" stroke-width="5" r="35" stroke-dasharray="164.93361431346415 56.97787143782138">  <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" values="0 50 50;360 50 50" keyTimes="0;1"></animateTransform></circle></svg>');
          }
          submitButton.addClass("pending", "has-pending");
          Cart.addMutiple(items).then((data) => {
          }).finally(() => {
            submitButton.removeClass("pending");
            window.location.href = "/cart";
          });
        }
      });
    },
    initMultiVariantEvents() {
      let selectMaster = document.querySelectorAll(".select-master-bundle");
      let bundledCheckbox = document.querySelectorAll(".bundled-checkbox");
      let totalBundledPriceHtml = document.querySelector(".js-bundled-total-price");
      let totalBundledPrice = Number(document.querySelector(".bundled-total-price").getAttribute("data-bundled-total-price"));
      bundledCheckbox.forEach(function(button) {
        button.addEventListener("change", function() {
          let bundled_item = this.closest(".bundled-item");
          let bundled_item_qty_id = this.getAttribute("data-id");
          let bundled_item_price = Number(this.getAttribute("data-price"));
          if (this.checked) {
            totalBundledPrice = totalBundledPrice + bundled_item_price;
            bundled_item.querySelector(".js-input-quantity").value = "1";
            document.querySelector("#" + bundled_item_qty_id).removeClass("d-none");
            if (bundled_item.querySelector(".select-group-bundle").hasClass("select-multi-variants")) {
              bundled_item.querySelector(".select-group-bundle").removeClass("d-none");
            }
          } else {
            totalBundledPrice = totalBundledPrice - bundled_item_price;
            bundled_item.querySelector(".js-input-quantity").value = "0";
            document.querySelector("#" + bundled_item_qty_id).addClass("d-none");
            if (bundled_item.querySelector(".select-group-bundle").hasClass("select-multi-variants")) {
              bundled_item.querySelector(".select-group-bundle").addClass("d-none");
            }
          }
          totalBundledPriceHtml.innerHTML = totalBundledPrice.toCurrency();
          document.querySelector(".bundled-total-price").setAttribute("data-bundled-total-price", totalBundledPrice);
          totalBundledPrice = Number(document.querySelector(".bundled-total-price").getAttribute("data-bundled-total-price"));
        });
      });
      selectMaster.forEach(function(select) {
        select.addEventListener("change", function() {
          let selectid = this.getAttribute("id");
          let bundled_item = this.closest(".bundled-item");
          let select_option_price = Number(this.options[this.selectedIndex].getAttribute("data-option-price"));
          let select_option_data_price = Number(bundled_item.querySelector(".bundled-checkbox").setAttribute("data-price", select_option_price));
          bundled_item.querySelector(".js-input-quantity").setAttribute("id", this.value);
          bundled_item.querySelector(".js-input-quantity").setAttribute("data-variant-id", this.value);
          document.querySelector("." + selectid).innerHTML = select_option_price.toCurrency();
          let totalBundledPriceSelect = 0;
          let bundledCheckbox2 = document.querySelectorAll(".bundled-checkbox");
          bundledCheckbox2.forEach(function(button) {
            if (button.checked) {
              let bundled_item_price = Number(button.getAttribute("data-price"));
              totalBundledPriceSelect = totalBundledPriceSelect + bundled_item_price;
            }
          });
          totalBundledPriceHtml.innerHTML = totalBundledPriceSelect.toCurrency();
          document.querySelector(".bundled-total-price").setAttribute("data-bundled-total-price", totalBundledPriceSelect);
          totalBundledPrice = Number(document.querySelector(".bundled-total-price").getAttribute("data-bundled-total-price"));
        });
      });
    },
    initOrderDeadLine() {
      let _deadline_time = parseInt(document.querySelector(".shipping-time").getAttribute("data-deadline"));
      let _deadline_html = document.querySelector(".deadline");
      let _currentDate = new Date();
      let _dueDate = new Date(_currentDate.getFullYear(), _currentDate.getMonth(), _currentDate.getDate());
      _dueDate.setHours(_deadline_time);
      if (_currentDate >= _dueDate) {
        _deadline_html.innerHTML = theme.strings.product.order_until + " <strong>" + _deadline_time + ":00 " + theme.strings.product.tomorrow + "</strong>";
      } else {
        _deadline_html.innerHTML = theme.strings.product.order_today_until + " <strong>" + _deadline_time + ":00</strong>";
      }
    },
    initOrderShipping() {
      let today = new Date();
      let business_days = parseInt(document.querySelector(".shipping-time").getAttribute("data-deliverytime"));
      let deliveryDate = today;
      let total_days = business_days;
      for (let days = 1; days <= total_days; days++) {
        deliveryDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1e3);
        if (deliveryDate.getDay() == 0 || deliveryDate.getDay() == 6) {
          total_days++;
        }
      }
      let weekday = new Array(7);
      weekday[0] = theme.strings.date_formats.sunday;
      weekday[1] = theme.strings.date_formats.monday;
      weekday[2] = theme.strings.date_formats.tuesday;
      weekday[3] = theme.strings.date_formats.wednesday;
      weekday[4] = theme.strings.date_formats.thursday;
      weekday[5] = theme.strings.date_formats.friday;
      weekday[6] = theme.strings.date_formats.saturday;
      let _day = weekday[deliveryDate.getDay()];
      let month = new Array();
      month[0] = theme.strings.date_formats.january;
      month[1] = theme.strings.date_formats.february;
      month[2] = theme.strings.date_formats.march;
      month[3] = theme.strings.date_formats.april;
      month[4] = theme.strings.date_formats.may;
      month[5] = theme.strings.date_formats.june;
      month[6] = theme.strings.date_formats.july;
      month[7] = theme.strings.date_formats.august;
      month[8] = theme.strings.date_formats.september;
      month[9] = theme.strings.date_formats.october;
      month[10] = theme.strings.date_formats.november;
      month[11] = theme.strings.date_formats.december;
      let _month = month[deliveryDate.getMonth()];
      document.querySelector(".dt-time").innerHTML = _day + ",&nbsp;" + deliveryDate.getDate() + "&nbsp;" + _month;
    },
    initSliderMedia: function() {
      let { mediaMain, mediaThumnails } = this.elms;
      this.mainSlider = mediaMain.init({ gutter: 12 });
      this.mediaSlider = mediaThumnails.init();
      mediaThumnails.init();
    },
    handleVariantChange: function(variant) {
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
      this.updateURLHash(variant);
      variant.available ? mediaMain.removeClass("product-sold-out") : mediaMain.addClass("product-sold-out");
      if (skuElement) {
        !!variant.sku ? (skuElement.innerHTML = variant.sku) && skuElement.closest(".product-details_sku").removeClass("d-none") : skuElement.closest(".product-details_sku").addClass("d-none");
      }
      if (!!variant.featured_media) {
        this.mainSlider.goTo(variant.featured_media.position - 1);
        this.mediaSlider.goTo(variant.featured_media.position - 1);
      }
      selectMaster.value = variant.id;
    },
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
    },
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
        addToCartButton.querySelector("span").innerHTML = theme.strings.product.unavailable;
        document.querySelector(".product-wishlist-compare").addClass("d-none");
        document.querySelector(".people-in-cart").addClass("d-none");
        document.querySelector(".shipping-time").addClass("d-none");
        this.inventory.setStatus("out-stock");
      }
    },
    updateDynamicCheckout(variantAvailable) {
      let { dynamicCheckoutContainer } = this.elms;
      if (dynamicCheckoutContainer) {
        variantAvailable ? dynamicCheckoutContainer.removeClass("d-none") : dynamicCheckoutContainer.addClass("d-none");
      }
    },
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
    },
    updateAddToCartButton(variant) {
      let { addToCartButton, quantityInputContainer } = this.elms;
      if (variant.available) {
        addToCartButton.disabled = false;
        addToCartButton.querySelector("span").innerHTML = variant.inventory_quantity == 0 && variant.inventory_policy == "continue" ? theme.strings.product.preorder : theme.strings.product.addToCart;
        this.settings.enableSubscribe && quantityInputContainer.removeClass("d-none");
        if (document.querySelector(".product-wishlist-compare")) {
          document.querySelector(".product-wishlist-compare").removeClass("d-none");
        }
        if (document.querySelector(".people-in-cart")) {
          document.querySelector(".people-in-cart").removeClass("d-none");
        }
        if (document.querySelector(".shipping-time")) {
          document.querySelector(".shipping-time").removeClass("d-none");
        }
        if (document.querySelector(".product-countdown-detail")) {
          document.querySelector(".product-countdown-detail").removeClass("d-none");
        }
      } else {
        addToCartButton.disabled = true;
        addToCartButton.querySelector("span").innerHTML = theme.strings.product.soldOut;
        this.settings.enableSubscribe && quantityInputContainer.addClass("d-none");
        if (document.querySelector(".product-wishlist-compare")) {
          document.querySelector(".product-wishlist-compare").addClass("d-none");
        }
        if (document.querySelector(".people-in-cart")) {
          document.querySelector(".people-in-cart").addClass("d-none");
        }
        if (document.querySelector(".shipping-time")) {
          document.querySelector(".shipping-time").addClass("d-none");
        }
        if (document.querySelector(".product-countdown-detail")) {
          document.querySelector(".product-countdown-detail").addClass("d-none");
        }
      }
    },
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
    },
    initFormAddToCart() {
      let { formElement, addToCartButton } = this.elms;
      formElement.addEvent("submit", (e) => {
        e.preventDefault();
        if (!addToCartButton.hasClass("has-pending")) {
          addToCartButton.insertAdjacentHTML("beforeend", '<svg class="svg-loading" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; background: none; shape-rendering: auto;" width="28px" height="28px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"><circle cx="50" cy="50" fill="none" stroke="var(--main-color)" stroke-width="5" r="35" stroke-dasharray="164.93361431346415 56.97787143782138">  <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" values="0 50 50;360 50 50" keyTimes="0;1"></animateTransform></circle></svg>');
        }
        addToCartButton.addClass("pending", "has-pending");
        Cart.add(formElement).catch((error) => {
          AT.loadPopupMessage().then(() => {
            Popups.closeAll();
            PopupMessage.open(error.description);
          });
        }).finally(() => {
          addToCartButton.removeClass("pending");
        });
      });
    },
    initScrollToReviews() {
      let reviewsWidget = document.querySelector("#product-reviews-widget");
      let reviewsBadge = document.querySelector("#product-review-badge");
      if (reviewsBadge) {
        reviewsBadge.addEvent("click", () => AT.scrollTo(reviewsWidget, 1e3, reviewsWidget.click()));
      }
    },
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
    },
    updatePrice(variant) {
      let { priceCompareElement, priceElement } = this.elms;
      if (!!variant.compare_at_price) {
        priceCompareElement.innerHTML = variant.compare_at_price.toCurrency();
        priceCompareElement.removeClass("d-none");
      } else {
        priceCompareElement.addClass("d-none");
      }
      priceElement.innerHTML = variant.price.toCurrency();
    },
    updateURLHash(variant) {
      let searchParams = window.location.search.replace("?", "").split("&").filter(Boolean);
      window.history.replaceState({}, "", AT.getParameterByName("variant") ? `${window.location.pathname}?${searchParams.map((param) => param.includes("variant") ? "variant=" + variant.id : param).join("&")}` : (searchParams.unshift("variant=" + variant.id), `${window.location.pathname}?${searchParams.join("&")}`));
    },
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

  // app/scripts/product-page.js
  (() => {
    theme.sectionRegister.forEach((item) => {
      switch (item) {
        case "product-template":
          register(item, ProductDefault);
          break;
        case "related-products":
          register(item, RelatedProducts);
          break;
      }
    });
    load("*");
    console.log("product-page.js loaded");
  })();
})();
