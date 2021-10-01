let tableNo = null;

AFRAME.registerComponent("markerhandler", {
  init: async function () {
    if (tableNo === null) {
      this.askTableNo();
    }

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

      // Handling Click Events
      ratingButton.addEventListener("click", function () {
        swal({
          icon: "warning",
          title: "Rate Dish",
          text: "Work In Progress",
        });
      });

      orderButtton.addEventListener("click", () => {
        swal({
          icon: "https://i.imgur.com/4NZ6uLY.jpg",
          title: "Thanks For Order!",
          text: "Your order will be served soon at your table!",
        });
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
});
