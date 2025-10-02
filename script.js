// Initialize Swiper
const swiper = new Swiper('.swiper', {
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
});

// Make text draggable
function makeDraggable(el) {
  let offsetX, offsetY, isDragging = false;

  el.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - el.offsetLeft;
    offsetY = e.clientY - el.offsetTop;
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      el.style.left = e.clientX - offsetX + "px";
      el.style.top = e.clientY - offsetY + "px";
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });
}

// Apply draggable to all text boxes
document.querySelectorAll(".text-box").forEach(makeDraggable);

// Add new text box
function addText() {
  const box = document.createElement("div");
  box.className = "text-box";
  box.contentEditable = "true";
  box.innerText = "New Text";
  document.querySelector(".frame").appendChild(box);
  makeDraggable(box);
}

// Font size controls
function getSelectedBox() {
  return document.activeElement.classList.contains("text-box")
    ? document.activeElement
    : null;
}

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
function changeFont(font) {
  const box = getSelectedBox();
  if (box) {
    box.style.fontFamily = font;
  }
}