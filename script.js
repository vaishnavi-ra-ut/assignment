// Initialize Swiper
const swiper = new Swiper('.swiper', {
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
});

// Drag and drop logic
function makeDraggable(el) {
  let offsetX, offsetY, isDragging = false;

  el.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - el.offsetLeft;
    offsetY = e.clientY - el.offsetTop;
    el.style.zIndex = 20; // bring to front while dragging
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      let x = e.clientX - offsetX;
      let y = e.clientY - offsetY;

      // Constrain inside frame
      const frame = document.querySelector('.frame');
      x = Math.max(0, Math.min(frame.clientWidth - el.offsetWidth, x));
      y = Math.max(0, Math.min(frame.clientHeight - el.offsetHeight, y));

      el.style.left = x + "px";
      el.style.top = y + "px";
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    el.style.zIndex = 10;
  });
}

// Apply draggable to all existing text boxes
document.querySelectorAll(".text-box").forEach(makeDraggable);

// Add new text box
function addText() {
  const box = document.createElement("div");
  box.className = "text-box";
  box.contentEditable = "true";
  box.innerText = "New Text";
  document.querySelector(".frame").appendChild(box);
  makeDraggable(box);
  box.focus();
}

// Get selected/focused text box
function getSelectedBox() {
  return document.activeElement.classList.contains("text-box")
    ? document.activeElement
    : null;
}

// Font size controls
function increaseFont() {
  const box = getSelectedBox();
  if (box) {
    let size = parseInt(window.getComputedStyle(box).fontSize);
    box.style.fontSize = size + 2 + "px";
  }
}

function decreaseFont() {
  const box = getSelectedBox();
  if (box) {
    let size = parseInt(window.getComputedStyle(box).fontSize);
    box.style.fontSize = size - 2 + "px";
  }
}

// Change font family
function changeFont(font) {
  const box = getSelectedBox();
  if (box) box.style.fontFamily = font;
}

// Change text color
function changeColor(color) {
  const box = getSelectedBox();
  if (box) box.style.color = color;
}
