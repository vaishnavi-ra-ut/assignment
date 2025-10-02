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
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      let x = e.clientX - offsetX;
      let y = e.clientY - offsetY;

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

  // Ensure box is editable
  el.setAttribute("contentEditable", "true");
}

// Add new text box
function addText() {
  const box = document.createElement("div");
  box.className = "text-box";
  box.innerText = "New Text";
  document.querySelector(".frame").appendChild(box);
  makeDraggable(box);

  box.focus(); // select new box immediately
}

// Get selected/focused text box
function getSelectedBox() {
  const active = document.activeElement;
  if (active && active.classList.contains("text-box")) {
    return active;
  }
  return null;
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

// Apply draggable to existing text boxes on load
document.querySelectorAll(".text-box").forEach(makeDraggable);
