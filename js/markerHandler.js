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

      // Handling Click Events
      if (tableNo !== null) {
        ratingButton.addEventListener("click", function () {
          swal({
            icon: "warning",
            title: "Rate Dish",
            text: "Work In Progress",
          });
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
      }

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

  handleOrderSummary() {
    let tNo;
    tableNo <= 9 ? (tNo = `t0${tableNo}`) : (tNo = `t${tableNo}`);
    const summary = this.getOrderSummary(tNo);
  },
});
