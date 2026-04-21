(() => {
  // app/scripts/common/model/infinite-button.js
  var InfiniteButton = class extends HTMLElement {
    constructor() {
      super();
      this.isLoading = false;
      this.initEventHandler();
    }
    initEventHandler() {
      const handler = (cb) => {
        let self = this;
        return function(e) {
          let rect = self.getBoundingClientRect();
          let settings = self.getInfo();
          if (!self.isLoading && settings.nextPage && window.pageYOffset + 1e3 >= rect.y) {
            cb();
          }
        };
      };
      Object.assign(this, {
        unobserver: () => {
          window.removeEvent("scroll", this.scrollHandler);
          this.removeEvent("click", this.scrollHandler);
        },
        observer(cb) {
          this.scrollHandler = handler(cb);
          this.unobserver();
          window.addEvent("scroll", this.scrollHandler);
          this.addEvent("click", this.scrollHandler);
        }
      });
    }
    reset() {
      this.setAttribute("data-current-page", 1);
      this.setAttribute("data-next-page", 1);
    }
    setStatus(status) {
      switch (status) {
        case "hide":
          this.addClass("d-none");
          break;
        case "show":
          this.removeClass("d-none");
          break;
        case "loading":
          this.setAttribute("loading", "");
          this.isLoading = true;
          break;
        case "loaded":
          this.removeAttribute("loading");
          this.isLoading = false;
          break;
        case "reset":
          this.setAttribute("data-current-page", 1);
          this.setAttribute("data-next-page", 1);
          break;
      }
    }
    setInfo({ currentPage, nextPage }) {
      this.setAttribute("data-current-page", currentPage);
      this.setAttribute("data-next-page", nextPage);
    }
    getInfo() {
      return {
        currentPage: +this.getAttribute("data-current-page"),
        nextPage: +this.getAttribute("data-next-page")
      };
    }
  };

  // app/scripts/collection-page.js
  var CollectionDefault = {
    onLoad() {
      let { container } = this;
      this.elms = {
        sortBy: container.querySelectorAll(".select-sort-by"),
        productGridContainer: container.querySelector("#main-collection-product-grid"),
        maxlistMore: container.getElementsByClassName("maxlist-more"),
        maxlistLess: container.getElementsByClassName("maxlist-less"),
        productsShowing: container.querySelector("#products-showing"),
        infiniteButton: container.querySelector("infinite-button"),
        sidebarContainer: container.querySelector("#main-collection-filters"),
        collectionProductGridList: container.querySelector("#collection-product-grid-container"),
        paginationContainer: container.querySelectorAll(".pagination-container"),
        formFilter: container.querySelector("#collection-filters-form"),
        selectGroup: container.querySelector(".group-type-list-wrapper"),
        mobileFilterIcon: container.querySelector(".mobile-filter-icon"),
        jsSidebarClose: container.querySelector(".js-sidebar-close")
      };
      this.canceLoadProducts = false;
      this.filterData = {};
      this.settings = JSON.parse(this.container.querySelector("script[data-collection-settings]").innerHTML);
      this.filterActiveValues = [];
      if (this.settings.paginationType == "infinite") {
        this.loadProducts().then(() => this.initInfiniteButton());
      }
      this.initFilter();
      this.initFilterDrawerMobile();
      this.initSortBy();
      this.initGridList();
    },
    getQueryString() {
      let { formFilter } = this.elms;
      const formData = new FormData(formFilter);
      const query = new URLSearchParams(formData).toString();
      return query;
    },
    initFilterDrawerMobile() {
      let { mobileFilterIcon, jsSidebarClose } = this.elms;
      mobileFilterIcon.addEvent("click", function() {
        document.querySelector("html").classList.add("overflow-hidden");
        document.querySelector("body").classList.add("active-sidebar");
      });
      jsSidebarClose.addEvent("click", function() {
        document.querySelector("html").classList.remove("overflow-hidden");
        document.querySelector("body").classList.remove("active-sidebar");
      });
    },
    initSortBy() {
      if (this.settings.enableSort) {
        let { sortBy } = this.elms;
        sortBy && sortBy.forEach((elm) => {
          elm.addEvent("change", () => {
            sortBy.forEach((tmp) => {
              tmp.value = elm.value;
            });
            if (this.settings.paginationType == "infinite") {
              this.loadProducts("sort-by");
            } else {
              this.updatePage("sort-by");
            }
          });
        });
      }
    },
    initFilter() {
      let { formFilter } = this.elms;
      let _this = this;
      if (!formFilter) {
        return;
      }
      _this.initmaxlist();
      let checkboxContainer = document.querySelectorAll(".filter-group-display__list-item_checkbox");
      let submitBtn = document.querySelectorAll(".filter-group-display__submit input");
      submitBtn && submitBtn.forEach((btn) => {
        btn.addEvent("click", (e) => {
          e.preventDefault();
          _this.updatePage("filter");
        });
      });
      checkboxContainer.forEach((e) => {
        e.addEvent("change", function() {
          _this.updatePage("filter");
        });
      });
    },
    initmaxlist() {
      let { maxlistMore, maxlistLess } = this.elms;
      maxlistMore.forEach((e) => {
        e.addEvent("click", function() {
          let filterMax = this.closest(".filter-maxlist");
          this.addClass("d-none");
          this.closest(".filter-group_inner").addClass("maxlist-more-active");
          filterMax.querySelector(".maxlist-less").removeClass("d-none");
        });
      });
      maxlistLess.forEach((e) => {
        e.addEvent("click", function() {
          let filterMax = this.closest(".filter-maxlist");
          this.addClass("d-none");
          this.closest(".filter-group_inner").removeClass("maxlist-more-active");
          filterMax.querySelector(".maxlist-more").removeClass("d-none");
        });
      });
    },
    initInfiniteButton() {
      let { infiniteButton, paginationContainer } = this.elms;
      !customElements.get("infinite-button") && customElements.define("infinite-button", InfiniteButton);
      if (infiniteButton.getInfo().nextPage) {
        infiniteButton.observer(this.onInfiniteHandler.bind(this));
        paginationContainer && paginationContainer.forEach((elm) => {
          elm.removeClass("d-none");
        });
      }
    },
    onInfiniteHandler() {
      let { infiniteButton } = this.elms;
      let { nextPage, currentPage } = infiniteButton.getInfo();
      if (nextPage) {
        currentPage++;
        let searchParams = this.getSearchParams("infinite", currentPage);
        infiniteButton.setStatus("loading");
        this.updatePage("infinite", searchParams).then(() => infiniteButton.setStatus("loaded"));
      }
    },
    updateCart(value, isUpdate) {
      const attributes = value;
      fetch(window.Shopify.routes.root + "cart/update.js", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          "Content-Type": "application/json;"
        },
        body: JSON.stringify({
          attributes
        })
      }).then((e) => {
        e.json().then((e2) => {
          if (isUpdate) {
            this.updatePage("show-by");
          }
        });
      }).catch((e) => {
        console.log(e);
      });
    },
    async loadProducts(triggerAction) {
      let currentPage = +this.getPageNumber();
      for (let i = 1; i <= currentPage; i++) {
        let searchParams = this.getSearchParams("load-products", i);
        if (this.canceLoadProducts) {
          this.canceLoadProducts = false;
          break;
        }
        await this.updatePage("load-products", searchParams, i, triggerAction);
      }
    },
    async updatePage(action, searchParams, currentPage, triggerAction) {
      !searchParams && (searchParams = this.getSearchParams(action));
      return new Promise((res, rej) => {
        AT.queue.add(this.getPage(searchParams), (html) => {
          switch (action) {
            case "sort-by": {
              this.renderPage(html, action);
              this.updateURLHash(searchParams);
              break;
            }
            case "show-by": {
              this.renderPage(html, action);
              this.updateURLHash(searchParams);
              break;
            }
            case "filter": {
              this.renderPage(html, action);
              this.updateURLHash(searchParams);
              break;
            }
            case "load-products": {
              this.renderPage(html, action, currentPage, triggerAction);
              if (triggerAction == "sort-by") {
                this.updateURLHash(searchParams);
              }
              break;
            }
            case "infinite": {
              this.renderPage(html, action);
              this.updateURLHash(searchParams);
              break;
            }
          }
          res(1);
        });
      });
    },
    async renderPage(html, action, currentPage, triggerAction) {
      let { sidebarContainer, selectGroup, productGridContainer, paginationContainer, productsShowing, infiniteButton } = this.elms;
      switch (action) {
        case "sort-by":
          productGridContainer.innerHTML = html.querySelector("#main-collection-product-grid").innerHTML;
          if (this.settings.paginationType !== "infinite") {
            paginationContainer && paginationContainer.forEach((elm) => {
              elm.innerHTML = html.querySelector(".pagination-container").innerHTML.replace(/&view=ajax/g, "").replace(/&amp;view=ajax/g, "");
            });
          }
          break;
        case "show-by":
          productGridContainer.innerHTML = html.querySelector("#main-collection-product-grid").innerHTML;
          if (this.settings.paginationType !== "infinite") {
            paginationContainer && paginationContainer.forEach((elm) => {
              elm.innerHTML = html.querySelector(".pagination-container").innerHTML.replace(/&view=ajax/g, "").replace(/&amp;view=ajax/g, "");
            });
          }
          break;
        case "filter":
          productGridContainer.innerHTML = html.querySelector("#main-collection-product-grid").innerHTML;
          selectGroup.innerHTML = html.querySelector(".group-type-list-wrapper").innerHTML;
          sidebarContainer.addClass("active-ajax");
          this.initmaxlist();
          const parent = document.querySelector(".js-range-slider");
          if (parent) {
            const rangeS = parent.querySelectorAll('input[type="range"]'), numberS = parent.querySelectorAll('input[type="number"]');
            rangeS.forEach((el) => {
              el.setAttribute("value", Number(el.getAttribute("value")));
              el.setAttribute("max", Number(el.getAttribute("max")));
              el.oninput = () => {
                let slide1 = parseFloat(rangeS[0].value), slide2 = parseFloat(rangeS[1].value);
                if (slide1 > slide2) {
                  [slide1, slide2] = [slide2, slide1];
                }
                numberS[0].value = slide1;
                numberS[1].value = slide2;
              };
            });
            numberS.forEach((el) => {
              el.setAttribute("value", Number(el.getAttribute("value")));
              el.setAttribute("max", Number(el.getAttribute("max")));
              if (Number(numberS[1].value == 0)) {
                numberS[1].value = Number(numberS[1].getAttribute("max"));
              }
              el.oninput = () => {
                let number1 = parseFloat(numberS[0].value), number2 = parseFloat(numberS[1].value);
                if (number1 > number2) {
                  let tmp = number1;
                  numberS[0].value = number2;
                  numberS[1].value = tmp;
                }
                rangeS[0].value = number1;
                rangeS[1].value = number2;
              };
            });
            document.querySelector(".filter-price-button").addEvent("click", function() {
              let price_min = parent.querySelector(".field__input-min").value;
              let price_max = parent.querySelector(".field__input-max").value;
              document.querySelector(".main-range-slider .field__input-min").value = price_min;
              document.querySelector(".main-range-slider .field__input-max").value = price_max;
              document.querySelector(".filter-price-submit").click();
            });
            paginationContainer && paginationContainer.forEach((elm) => {
              elm.innerHTML = html.querySelector(".pagination-container").innerHTML.replace(/&view=ajax/g, "").replace(/&amp;view=ajax/g, "");
            });
          }
          break;
        case "infinite":
          !!productsShowing && (productsShowing.innerHTML = html.querySelector("#products-showing").innerHTML);
        case "load-products":
          if (triggerAction == "sort-by" && currentPage == 1) {
            productGridContainer.innerHTML = "";
          }
          html.querySelectorAll("product-card").forEach((productCard) => productGridContainer.append(productCard));
      }
      if (this.settings.paginationType === "infinite" && action != "load-products") {
        let { currentPage: currentPage2, nextPage } = html.querySelector("infinite-button").dataset;
        if (+nextPage) {
          paginationContainer.removeClass("d-none");
          infiniteButton.observer(this.onInfiniteHandler.bind(this));
        } else {
          paginationContainer.addClass("d-none");
          infiniteButton.unobserver();
        }
        infiniteButton.setInfo({ currentPage: currentPage2, nextPage });
      }
    },
    getSearchParams(action, pageNumber) {
      let { sortBy } = this.elms;
      let searchParams = [
        AT.getParameterByName("q") ? `q=${AT.getParameterByName("q")}` : "",
        ...Object.keys(this.filterActiveValues).reduce((accu, value) => {
          if (this.filterActiveValues[value].length) {
            accu.push(`${value}=${this.filterActiveValues[value].map(encodeURIComponent).join(",")}`);
          }
          return accu;
        }, []),
        !!sortBy ? `sort_by=${sortBy[0].value}` : ""
      ];
      switch (action) {
        case "sort-by":
          searchParams.unshift(`page=${this.getPageNumber()}`);
          break;
        case "show-by":
          searchParams.unshift(`page=1`);
          break;
        case "load-products":
          searchParams.unshift(`page=${pageNumber}`);
          break;
      }
      let query = this.getQueryString();
      searchParams.unshift(query);
      return searchParams.filter(Boolean).join("&");
    },
    getPage(searchParams) {
      let section_id = this.container.dataset.sectionId;
      let url = `${window.location.pathname}?${searchParams}&section_id=${section_id}`;
      return fetch(url, { dataType: "text" }).then((content) => {
        let div = document.createElement("div");
        div.innerHTML = content;
        this.filterData[url] = div.cloneNode(true);
        return div;
      });
    },
    getPageNumber() {
      return AT.getParameterByName("page") || 1;
    },
    updateURLHash(searchParams) {
      history.pushState({}, "", `${window.location.pathname}${searchParams && "?".concat(searchParams)}`);
    },
    initGridList() {
      let { collectionProductGridList } = this.elms;
      let modeView = collectionProductGridList.querySelector(".grid-list");
      if (modeView) {
        let gridView = collectionProductGridList.querySelectorAll(".grid");
        let _this = this;
        gridView.forEach(function(grid) {
          grid.addEvent("click", function() {
            let gridClass = this.getAttribute("data-grid");
            collectionProductGridList.className = "";
            collectionProductGridList.addClass(gridClass);
            _this.updateCart({ grid_view: gridClass }, false);
          });
        });
      }
    },
    getFilterActiveValues() {
      let filterActive = JSON.parse(this.container.querySelector("script[data-collection-filter-active-values]").innerHTML);
      window.location.search.replace("?", "").split("&").forEach((param) => {
        let [filterString, value] = param.split(/=(.+)/);
        if (filterString in filterActive && value) {
          !filterActive[filterString].includes(value) && filterActive[filterString].push(value);
        }
      });
      return filterActive;
    }
  };
  register("collection-template", CollectionDefault);
  load("collection-template");
  console.log("collection-page.js loaded");
})();
