(() => {
  // app/scripts/common/model/store-location.js
  var StoreLocation = class {
    constructor(container, mapID) {
      let { mapKey } = container.dataset;
      let stores = JSON.parse(container.querySelector("[data-location-list-json]").innerHTML);
      stores.features.forEach((store, i) => {
        store.properties.id = i;
      });
      mapboxgl.accessToken = mapKey;
      this.map = new mapboxgl.Map({
        container: mapID,
        style: "mapbox://styles/mapbox/streets-v11",
        center: stores.features[0].geometry.coordinates,
        zoom: 9
      });
      this.map.on("load", () => {
        this.buildLocationList(container, stores);
        this.addMarkers(stores);
        this.createPopup(stores.features[0]);
      });
      this.initFilterStore(container);
      this.handlerSelectedStoreLOcation(stores, container);
    }
    createPopup({ geometry, properties }) {
      const popUps = document.getElementsByClassName("mapboxgl-popup");
      if (popUps[0])
        popUps[0].remove();
      new mapboxgl.Popup({ offset: 25, closeOnClick: false }).setLngLat(geometry.coordinates).setText(properties["Full Address"]).addTo(this.map);
    }
    buildLocationList(container, stores) {
      let listings = container.querySelector(".js-find-store-location-list");
      listings.children.forEach((li) => {
        let { lat, long } = li.dataset;
        li.addEvent("click", () => {
          let store = stores.features.find(({ properties: { Latitude, Longitude } }) => {
            return Latitude == lat && Longitude == long;
          });
          AT.cookie.set("arn-selected-store-location", JSON.stringify(store), 14);
          document.dispatchEvent(new CustomEvent("store-location-change"));
          this.map.jumpTo({
            center: store.geometry.coordinates
          });
          this.createPopup(store);
        });
      });
    }
    addMarkers(stores) {
      for (const marker of stores.features) {
        const el = document.querySelector(".marker.template").cloneNode(true);
        el.removeClass("d-none", "template");
        el.id = `marker-${marker.properties.id}`;
        new mapboxgl.Marker(el).setLngLat(marker.geometry.coordinates).addTo(this.map);
        el.addEventListener("click", (e) => {
          this.createPopup(marker);
        });
      }
    }
    initFilterStore(container) {
      let countrySelect = container.querySelector(".js-find-store-location-country");
      let citySelect = container.querySelector(".js-find-store-location-city");
      let storeList = container.querySelector(".js-find-store-location-list");
      countrySelect.addEvent("change", function() {
        let cities = JSON.parse(this.options[this.selectedIndex].dataset.cities);
        citySelect.innerHTML = citySelect.options[0].outerHTML;
        cities.forEach((city) => {
          let option = document.createElement("option");
          option.innerText = city;
          option.value = city;
          citySelect.appendChild(option);
        });
      });
      citySelect.addEvent("change", function() {
        let countrySelected = countrySelect.value;
        storeList.children.forEach((li) => {
          let { city, country } = li.dataset;
          if (countrySelected == country && city == this.value) {
            li.removeClass("d-none");
          } else {
            li.addClass("d-none");
          }
        });
      });
    }
    handlerSelectedStoreLOcation(stores, container) {
      let selectedStore = JSON.parse(AT.cookie.get("arn-selected-store-location"));
      if (!selectedStore) {
        return;
      }
      let { Country, City, Latitude, Longitude } = selectedStore.properties;
      let countrySelect = container.querySelector(".js-find-store-location-country");
      let citySelect = container.querySelector(".js-find-store-location-city");
      let storeList = container.querySelector(".js-find-store-location-list");
      countrySelect.value = Country;
      countrySelect.dispatchEvent(new Event("change"));
      citySelect.value = City;
      citySelect.dispatchEvent(new Event("change"));
      let li = [...storeList.children].find((li2) => li2.dataset.lat == Latitude && li2.dataset.long == Longitude);
      console.log(li);
      li && li.click();
    }
  };

  // app/scripts/store-location-popup.js
  var PopupStoreLocation = class extends PopupComponent {
    constructor() {
      super();
      let storesJSON = JSON.parse(this.querySelector("[data-location-list-json]").innerHTML);
      let storeListContainer = this.querySelector(".js-find-store-location-list");
      let storeItemTemplate = storeListContainer.firstElementChild;
      let countrySelect = this.querySelector(".js-find-store-location-country");
      storesJSON.features.forEach(({ properties }) => {
        let li = storeItemTemplate.cloneNode(true);
        li.removeClass("d-none", "template");
        li.querySelector(".js-name").innerHTML = properties["Store Name"];
        li.querySelector(".js-address").innerHTML = properties["Full Address"];
        li.setAttribute("data-country", properties["Country"]);
        li.setAttribute("data-city", properties["City"]);
        li.setAttribute("data-lat", properties["Latitude"]);
        li.setAttribute("data-long", properties["Longitude"]);
        storeListContainer.append(li);
      });
      let countries = storesJSON.features.reduce((acc, { properties }) => {
        acc[properties["Country"]] = [...acc[properties["Country"]] || [], properties["City"]];
        return acc;
      }, {});
      Object.keys(countries).forEach((country) => {
        let option = document.createElement("option");
        option.innerText = country;
        option.dataset.cities = JSON.stringify(countries[country]);
        countrySelect.append(option);
      });
      this.querySelectorAll(".js-popup-close").addEvents("click", this.close.bind(this));
      document.addEvent("store-location-popup-open", this.open.bind(this));
      document.addEvent("store-location-popup-open", () => new StoreLocation(this, "popup-map"), { once: true });
    }
  };
  var popupTemplate = document.getElementById("popup-container");
  var storeLocationPopup = popupTemplate.content.querySelector(".popup-store-location");
  popupTemplate.insertAdjacentElement("beforebegin", storeLocationPopup);
  customElements.define("popup-store-location", PopupStoreLocation);
  Popups.push("popup-store-location", storeLocationPopup);
  console.log("store-location-popup.js loaded");
})();
