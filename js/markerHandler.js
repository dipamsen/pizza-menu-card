let tableNo = null;

AFRAME.registerComponent("markerhandler", {
  init: async function () {
    if (tableNo === null) {
      this.askTableNo();
    }

    dishes = await this.getDishes();

    this.el.addEventListener("markerFound", () => {
      console.log("marker is found");
      if (tableNo !== null) {
        const markerId = this.el.id;
        this.handleMarkerFound(dishes, markerId);
      }
    });

    this.el.addEventListener("markerLost", () => {
      console.log("marker is lost");
      this.handleMarkerLost();
    });
  },
  handleMarkerFound: function (dishes, markerId) {
    // Changing button div visibility
    const todaysDate = new Date();
    const todaysDay = todaysDate.getDay();
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dish = dishes.filter((dish) => dish.id === markerId)[0];

    if (dish.unavailable_days.includes(days[todaysDay])) {
      swal({
        icon: "warning",
        title: dish.dish_name.toUpperCase(),
        text: "This dish is not available today.",
        timer: 2500,
        buttons: false,
      });
    } else {
      const model = document.querySelector(`#model-${dish.id}`);
      model.setAttribute("position", dish.model_geometry.position);
      model.setAttribute("rotation", dish.model_geometry.rotation);
      model.setAttribute("scale", dish.model_geometry.scale);

      model.setAttribute("visible", true);
      const ingrContainer = document.querySelector(`#mainplane-${dish.id}`);
      ingrContainer.setAttribute("visible", true);

      const buttonDiv = document.getElementById("button-div");

      buttonDiv.style.display = "flex";

      const ratingButton = document.getElementById("rating-button");
      const orderButtton = document.getElementById("order-button");
      const summaryButton = document.getElementById("summary-button");
      const payButton = document.getElementById("pay-button");

      // Handling Click Events
      ratingButton.addEventListener("click", () => {
        this.handleRating(dish);
      });

      orderButtton.addEventListener("click", () => {
        let tNo;
        tableNo <= 9 ? (tNo = `t0${tableNo}`) : (tNo = `t${tableNo}`);
        this.handleOrder(tNo, dish);
        swal({
          icon: "https://i.imgur.com/4NZ6uLY.jpg",
          title: "Thanks For Order!",
          text: "Your order will be served soon at your table!",
          timer: 2000,
          buttons: false,
        });
      });

      summaryButton.addEventListener("click", () => {
        this.handleOrderSummary();
      });

      payButton.addEventListener("click", () => {
        this.handlePayments();
      });

      const priceplane = document.querySelector(`#priceplane-${dish.id}`);
      priceplane.setAttribute("visible", true);
    }
  },

  handleMarkerLost: function () {
    // Changing button div visibility
    const buttonDiv = document.getElementById("button-div");
    buttonDiv.style.display = "none";
  },

  askTableNo() {
    const iconUrl =
      "https://raw.githubusercontent.com/whitehatjr/menu-card-app/main/hunger.png";
    swal({
      title: "Welcome to Hunger!",
      icon: iconUrl,
      content: {
        element: "input",
        attributes: {
          placeholder: "Type your Table No here",
          type: "number",
          min: 1,
        },
      },
      closeOnClickOutside: false,
    }).then((inputVal) => {
      tableNo = inputVal;
    });
  },

  handleOrder(tableNo, dish) {
    firebase
      .firestore()
      .collection("tables")
      .doc(tableNo)
      .get()
      .then((doc) => {
        const details = doc.data();
        if (details["current_orders"][dish.id]) {
          details["current_orders"][dish.id]["quantity"] += 1;
          const currQ = details["current_orders"][dish.id]["quantity"];
          details["current_orders"][dish.id]["sub_total"] = currQ * dish.price;
        } else {
          details["current_orders"][dish.id] = {
            item: dish.dish_name,
            price: dish.price,
            quantity: 1,
            sub_total: dish.price * 1,
          };
        }
        details.total_bill += dish.price;
        firebase.firestore().collection("tables").doc(doc.id).update(details);
      });
  },

  async handleRating(dish) {
    let tNo;
    tableNo <= 9 ? (tNo = `t0${tableNo}`) : (tNo = `t${tableNo}`);
    const orderSummary = await this.getOrderSummary(tNo);
    const currentOrders = Object.keys(orderSummary.current_orders);
    if (currentOrders.length > 0 && currentOrders == dish.id) {
      document.getElementById("rating-modal-div").style.display = "flex";
      document.getElementById("rating-input").value = "0";
      document.getElementById("feedback-input").value = "";
      const saveRtgBtn = document.getElementById("save-rating-button");
      saveRtgBtn.addEventListener("click", () => {
        document.getElementById("rating-modal-div").style.display = "none";
        const rating = document.getElementById("rating-input").value;
        const feedback = document.getElementById("feedback-input").value;

        firebase
          .firestore()
          .collection("dishes")
          .doc(dish.id)
          .update({
            last_review: feedback,
            last_rating: rating,
          })
          .then(() => {
            swal({
              icon: "success",
              title: "Thanks for rating",
              text: "We hope you liked the dish!",
              time: 2500,
              buttons: false,
            });
          });
      });
    } else {
      swal({
        icon: "warning",
        title: "Oops!",
        title: "Dish not found",
        timer: 2500,
        buttons: false,
      });
    }
  },

  async getDishes() {
    const db = firebase.firestore();
    return await db
      .collection("dishes")
      .get()
      .then((snapshot) => snapshot.docs.map((doc) => doc.data()));
  },

  async getOrderSummary(tNo) {
    return await firebase
      .firestore()
      .collection("tables")
      .doc(tNo)
      .get()
      .then((doc) => doc.data());
  },

  async handleOrderSummary() {
    let tNo;
    tableNo <= 9 ? (tNo = `t0${tableNo}`) : `t${tableNo}`;
    const summary = await this.getOrderSummary(tNo);

    const modalDiv = document.getElementById("modal-div");
    modalDiv.style.display = "flex";
    const tableBodyTag = document.getElementById("bill-table-body");
    tableBodyTag.innerHTML = "";

    const currOrders = Object.keys(summary.current_orders);
    currOrders.map((i) => {
      const tr = document.createElement("tr");
      const item = document.createElement("td");
      const price = document.createElement("td");
      const quantity = document.createElement("td");
      const subtotal = document.createElement("td");

      item.innerHTML = summary.current_orders[i].item;

      price.innerHTML = `$` + summary.current_orders[i].price;
      price.setAttribute("class", "text-center");

      quantity.innerHTML = summary.current_orders[i].quantity;
      quantity.setAttribute("class", "text-center");

      subtotal.innerHTML = `$` + summary.current_orders[i].sub_total;
      subtotal.setAttribute("class", "text-center");

      tr.appendChild(item);
      tr.appendChild(price);
      tr.appendChild(quantity);
      tr.appendChild(subtotal);

      tableBodyTag.appendChild(tr);
    });

    const totalTr = document.createElement("tr");
    const td1 = document.createElement("td");
    td1.setAttribute("class", "no-line");
    const td2 = document.createElement("td");
    td2.setAttribute("class", "no-line");
    const td3 = document.createElement("td");
    td1.setAttribute("class", "no-line text-center");

    const strongTag = document.createElement("strong");
    strongTag.innerHTML = "Total";
    td3.appendChild(strongTag);

    const td4 = document.createElement("td");
    td1.setAttribute("class", "no-line text-right");
    td4.innerHTML = "$" + summary.total_bill;

    totalTr.appendChild(td1);
    totalTr.appendChild(td2);
    totalTr.appendChild(td3);
    totalTr.appendChild(td4);

    tableBodyTag.appendChild(totalTr);
  },

  handlePayments() {
    document.getElementById("modal-div").style.display = "none";
    let tNo;
    tableNo <= 9 ? (tNo = `t0${tableNo}`) : (tNo = `t${tableNo}`);
    firebase
      .firestore()
      .collection("tables")
      .doc(tNo)
      .update({
        current_orders: {},
        total_bill: 0,
      })
      .then(() => {
        swal({
          icon: "success",
          title: "Thanks for Paying",
          text: "We hope you enjoyed your food!",
          timer: 2500,
          buttons: false,
        });
      });
  },
});
