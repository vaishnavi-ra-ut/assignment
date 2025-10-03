// Initialize Swiper only if Swiper is defined
if (typeof window.Swiper !== "undefined") {
  new window.Swiper('.swiper', {
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  });
}

// Drag and drop logic (drag only when not editing text)
function makeDraggable(el) {
  let offsetX, offsetY, isDragging = false;

  el.addEventListener("mousedown", (e) => {
    // Skip drag if clicking inside selected text
    if (document.activeElement === el && window.getSelection().toString()) return;

    isDragging = true;
    offsetX = e.clientX - el.offsetLeft;
    offsetY = e.clientY - el.offsetTop;
    el.style.zIndex = 20;
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

  el.setAttribute("contentEditable", "true");
  el.setAttribute("tabindex", "0"); // Make focusable

  // Double-click to delete
  el.addEventListener("dblclick", () => {
    if (confirm("Delete this text box?")) {
      el.remove();
    }
  });
}

// Add new text box
function addText() {
  // This function will be overridden after DOMContentLoaded
}

// Get selected/focused box
function getSelectedBox() {
  const active = document.activeElement;
  return active && active.classList.contains("text-box") ? active : null;
}

// Font size
function increaseFont() {
  const box = getSelectedBox();
  if (box) box.style.fontSize = (parseInt(window.getComputedStyle(box).fontSize) + 2) + "px";
}

function decreaseFont() {
  const box = getSelectedBox();
  if (box) box.style.fontSize = (parseInt(window.getComputedStyle(box).fontSize) - 2) + "px";
}

// Font family
function changeFont(font) {
  const box = getSelectedBox();
  if (box) box.style.fontFamily = font;
}

// Text color
function changeColor(color) {
  const box = getSelectedBox();
  if (box) {
    box.style.color = color;
    // Remove previous selection highlight if any
    document.querySelectorAll(".text-box").forEach(b => b.classList.remove("selected-color"));
    box.classList.add("selected-color");
  }
}

// Apply draggable to existing text boxes
document.querySelectorAll(".text-box").forEach(makeDraggable);

// Attach color picker event to change color of selected text box
document.addEventListener("DOMContentLoaded", () => {
  const colorInput = document.getElementById("colorPicker");
  if (colorInput) {
    colorInput.addEventListener("input", (e) => {
      changeColor(e.target.value);
    });
  }

  let currentFont = "Arial"; // Default font

  // Listen for font selection changes (assuming a <select id="fontPicker"> exists)
  const fontInput = document.getElementById("fontPicker");
  if (fontInput) {
    fontInput.addEventListener("change", (e) => {
      currentFont = e.target.value;
      changeFont(currentFont);
    });
  }

  // Override addText to use currentFont
  window.addText = function() {
    const box = document.createElement("div");
    box.className = "text-box";
    box.innerText = "New Text";
    box.style.color = document.getElementById("colorPicker") ? document.getElementById("colorPicker").value : "#000000";
    box.style.fontFamily = currentFont;
    document.querySelector(".frame").appendChild(box);
    makeDraggable(box);
    box.focus();
  };
// Ensure font change applies to all selected/focused text boxes
if (fontInput) {
    fontInput.addEventListener("change", (e) => {
        currentFont = e.target.value;
        // Change font for all selected text boxes
        document.querySelectorAll(".text-box.selected-color, .text-box:focus").forEach(box => {
            box.style.fontFamily = currentFont;
        });
    });
}
});
