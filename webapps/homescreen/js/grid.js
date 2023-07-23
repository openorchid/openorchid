const Grid = {
  gridColumns: 4,
  gridRows: 5,
  HIDDEN_ROLES: ["homescreen", "system", "theme"],

  gridElement: document.getElementById("grid"),
  dropIndicatorElement: document.getElementById("drop-indicator"),
  apps: [],
  positions: {},

  isHolding: false,
  isDragging: false,
  draggedIcon: null,
  startX: 0,
  startY: 0,
  startTranslateX: 0,
  startTranslateY: 0,
  currentPageIndex: 0,

  savePositions: function () {
    var icons = document.getElementsByClassName("icon");
    for (var i = 0; i < icons.length; i++) {
      var icon = icons[i];
      this.positions[icon.id] = {
        transform: icon.style.transform,
      };
    }
    localStorage.setItem("positions", JSON.stringify(this.positions));
  },

  restorePositions: function () {
    var savedPositions = JSON.parse(localStorage.getItem("positions"));
    if (savedPositions) {
      for (var id in savedPositions) {
        if (savedPositions.hasOwnProperty(id)) {
          var icon = document.getElementById(id);
          if (icon) {
            icon.style.transform = savedPositions[id].transform;
          }
        }
      }
    }
  },

  init: function () {
    this.gridElement.style.setProperty("--grid-columns", this.gridColumns);
    this.gridElement.style.setProperty("--grid-rows", this.gridRows);

    var apps = navigator.api.appManager.readAppList();
    apps.then((data) => {
      this.apps = data;
      this.createIcons();
    });

    document.addEventListener("mousemove", this.dragMove);
    document.addEventListener("touchmove", this.dragMove);
    document.addEventListener("mouseup", this.dragEnd);
    document.addEventListener("touchend", this.dragEnd);

    // Restore positions
    this.restorePositions();
  },

  createIcons: function () {
    var index = 0;
    this.apps.forEach(app => {
      if (this.HIDDEN_ROLES.indexOf(app.manifest.role) !== -1) {
        return;
      }

      var icon = document.createElement("div");
      icon.id = `appicon${index}`;
      icon.classList.add("icon");
      var x = ((window.innerWidth - 20) / this.gridColumns) * (index % this.gridColumns);
      var y = 80 * (parseInt(index / this.gridColumns) % this.gridRows);
      icon.style.transform = `translate(${x}px, ${y}px)`;
      if (app.type == 'widget') {
        icon.classList.add(`widget-${app.size[0]}x${app.size[1]}`);
      }
      this.gridElement.appendChild(icon);

      var iconHolder = document.createElement("div");
      iconHolder.classList.add("icon-holder");
      icon.appendChild(iconHolder);

      var iconContainer = document.createElement("img");
      iconContainer.crossOrigin = 'anonymous';
      iconContainer.src = app.manifest.icons[45];
      iconHolder.appendChild(iconContainer);

      var name = document.createElement("div");
      name.classList.add("name");
      name.textContent = app.manifest.name;
      icon.appendChild(name);

      // Add event listeners for long press and drag
      icon.addEventListener("mousedown", this.longPressStart);
      icon.addEventListener("mouseup", () => this.longPressEnd(app));
      icon.addEventListener("touchstart", this.longPressStart);
      icon.addEventListener("touchend", () => this.longPressEnd(app));

      index++;
    });
  },

  longPressStart: function (event) {
    event.preventDefault();
    Grid.draggedIcon = this;
    Grid.isDragging = false;
    Grid.isHolding = true;
    Grid.startX = event.clientX || event.touches[0].clientX;
    Grid.startY = event.clientY || event.touches[0].clientY;

    // Get the existing translate values of the icon
    Grid.startTranslateX = Grid.draggedIcon.getBoundingClientRect().left - 10;
    Grid.startTranslateY = Grid.draggedIcon.getBoundingClientRect().top;

    setTimeout(function () {
      if (!Grid.isDragging && Grid.isHolding) {
        Grid.dragStart();
      }
    }, 500);
  },

  longPressEnd: function (app) {
    Grid.isHolding = false;

    var x = Grid.draggedIcon.getBoundingClientRect().left;
    var y = Grid.draggedIcon.getBoundingClientRect().top;
    var width = Grid.draggedIcon.offsetWidth;
    var height = Grid.draggedIcon.offsetHeight;

    let langCode;
    try {
      langCode = navigator.mozL10n.language.code || 'en-US';
    } catch (error) {
      // If an error occurs, set a default value for langCode
      langCode = 'en-US';
    }

    let manifestUrl;
    if (app.manifestUrl[langCode]) {
      manifestUrl = app.manifestUrl[langCode];
    } else {
      manifestUrl = app.manifestUrl['en-US'];
    }

    if (!Grid.isDragging) {
      // Dispatch the custom event with the manifest URL
      navigator.ipcRenderer.send('message', {
        type: 'launch',
        manifestUrl: manifestUrl,
        icon_x: x,
        icon_y: y,
        icon_width: width,
        icon_height: height
      });
    }
  },

  dragStart: function () {
    Grid.isDragging = true;
    Grid.draggedIcon.classList.add("dragging");
    Grid.draggedIcon.style.zIndex = "9999";

    Grid.dropIndicatorElement.classList.add("visible");

    var currentPage = Grid.draggedIcon.closest(".page");
    Grid.currentPageIndex = Array.from(Grid.gridElement.children).indexOf(currentPage);
  },

  dragMove: function (event) {
    if (Grid.isDragging) {
      event.preventDefault();
      var clientX = event.clientX || event.touches[0].clientX;
      var clientY = event.clientY || event.touches[0].clientY;
      var deltaX = clientX - Grid.startX;
      var deltaY = clientY - Grid.startY;

      // Calculate the new position based on initial position and delta values
      var newPositionX = Grid.startTranslateX + deltaX;
      var newPositionY = Grid.startTranslateY + deltaY;

      // Calculate the closest grid position
      var gridX = Math.round(newPositionX / ((window.innerWidth - 20) / Grid.gridColumns));
      var gridY = Math.round((newPositionY - 40) / ((window.innerHeight - 130) / Grid.gridRows));

      // Snap the icon to the grid position
      var snappedX = gridX * ((window.innerWidth - 20) / Grid.gridColumns);
      var snappedY = gridY * ((window.innerHeight - 130) / Grid.gridRows);

      // Update the transform with the new position
      Grid.draggedIcon.style.transform = `translate(${newPositionX}px, ${newPositionY}px)`;

      // Update the drop indicator position
      Grid.dropIndicatorElement.style.transform = `translate(${10 + snappedX}px, ${40 + snappedY}px)`;
      Grid.dropIndicatorElement.style.width = `${Grid.draggedIcon.offsetWidth}px`;
      Grid.dropIndicatorElement.style.height = `${Grid.draggedIcon.offsetHeight}px`;

      // Move icons within the grid
      Grid.moveIconsOutOfTheWay(gridX, gridY, Grid.draggedIcon);
    }
  },

  dragEnd: function (event) {
    if (Grid.isDragging) {
      Grid.isDragging = false;
      Grid.draggedIcon.classList.remove("dragging");
      Grid.dropIndicatorElement.classList.remove("visible");
      Grid.draggedIcon.style.zIndex = "";
      var clientX = event.clientX || event.touches[0].clientX;
      var clientY = event.clientY || event.touches[0].clientY;
      var deltaX = clientX - Grid.startX;
      var deltaY = clientY - Grid.startY;

      // Calculate the new position based on initial position and delta values
      var newPositionX = Grid.startTranslateX + deltaX;
      var newPositionY = Grid.startTranslateY + deltaY;

      // Calculate the closest grid position
      var gridX = Math.round(newPositionX / ((window.innerWidth - 20) / Grid.gridColumns));
      var gridY = Math.round((newPositionY - 40) / ((window.innerHeight - 130) / Grid.gridRows));

      // Snap the icon to the grid position
      var snappedX = gridX * ((window.innerWidth - 20) / Grid.gridColumns);
      var snappedY = gridY * ((window.innerHeight - 130) / Grid.gridRows);

      Grid.draggedIcon.style.transform = `translate(${10 + snappedX}px, ${snappedY}px)`;
      Grid.savePositions();
    }
  },

  moveIconsOutOfTheWay: function (gridX, gridY, draggedIcon) {
    var icons = Array.from(document.getElementsByClassName("icon"));
    icons.forEach((icon) => {
      if (icon !== draggedIcon) {
        var iconRect = icon.getBoundingClientRect();
        var iconGridX = Math.round(iconRect.left / (window.innerWidth / Grid.gridColumns));
        var iconGridY = Math.round((iconRect.top - 40) / ((window.innerHeight - 130) / Grid.gridRows));

        if (iconGridX === gridX && iconGridY === gridY) {
          // Move the icon out of the way
          var newGridX = iconGridX;
          var newGridY = iconGridY;

          if (gridX < Grid.gridColumns - 1) {
            newGridX++;
          } else {
            newGridX--;
          }

          // Calculate the new position
          var newPositionX = newGridX * ((window.innerWidth - 20) / Grid.gridColumns);
          var newPositionY = newGridY * ((window.innerHeight - 130) / Grid.gridRows) + 40;
          icon.style.transform = `translate(${10 + newPositionX}px, ${newPositionY}px)`;
        }
      }
    });
  },
};

document.addEventListener('DOMContentLoaded', function () {
  Grid.init();
});
