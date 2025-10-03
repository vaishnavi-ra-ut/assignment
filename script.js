// Basic Swiper init (if present)
if (typeof window.Swiper !== "undefined") {
  new Swiper('.swiper', {
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  });
}

/* -------------------
   State / controls
   ------------------- */
const addTextBtn = document.getElementById('addTextBtn');
const fontSelector = document.getElementById('fontSelector');
const colorPicker = document.getElementById('colorPicker');
const increaseFontBtn = document.getElementById('increaseFont');
const decreaseFontBtn = document.getElementById('decreaseFont');
const deleteBtn = document.getElementById('deleteBtn');

const frame = document.querySelector('.frame');

// Keep current defaults for newly created boxes
let currentFont = fontSelector.value || 'Arial';
let currentColor = colorPicker.value || '#000000';
let currentFontSize = 20; // px default for new boxes

// Active (selected) box reference
let activeBox = null;

/* -------------------
   Utility functions
   ------------------- */
function setActiveBox(box) {
  // remove active from previous
  document.querySelectorAll('.text-box').forEach(b => {
    b.classList.remove('active');
  });
  activeBox = box || null;
  if (activeBox) {
    activeBox.classList.add('active');
    // reflect active's properties in controls
    const fs = window.getComputedStyle(activeBox).fontFamily.replace(/"/g,'');
    fontSelector.value = (fs.includes(',') ? fs.split(',')[0] : fs) || currentFont;
    colorPicker.value = rgbToHex(window.getComputedStyle(activeBox).color) || currentColor;
    currentFontSize = parseInt(window.getComputedStyle(activeBox).fontSize) || currentFontSize;
  }
}

// helper to convert rgb() to hex
function rgbToHex(rgb) {
  const m = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!m) return '#000000';
  return "#" + [1,2,3].map(i => parseInt(m[i]).toString(16).padStart(2,'0')).join('');
}

/* -------------------
   Creation + setup
   ------------------- */
function createTextBox(text = 'New Text', left = 40, top = 40) {
  const box = document.createElement('div');
  box.className = 'text-box';
  box.setAttribute('data-editing','false'); // editing off by default
  box.setAttribute('tabindex','0');
  box.style.left = left + 'px';
  box.style.top = top + 'px';
  box.style.fontFamily = currentFont;
  box.style.color = currentColor;
  box.style.fontSize = currentFontSize + 'px';
  box.innerText = text;

  // add resize handle
  const handle = document.createElement('div');
  handle.className = 'resize-handle';
  box.appendChild(handle);

  frame.appendChild(box);
  setupBoxInteractions(box);
  setActiveBox(box);
  return box;
}

/* -------------------
   Interactions per box:
   - drag (when not editing and not clicking handle)
   - resize by handle (no dragging while resizing)
   - double-click to enter edit mode
   - blur to exit edit mode
   - single click selects
   ------------------- */
function setupBoxInteractions(box) {
  // ensure editing disabled initially
  box.contentEditable = false;
  box.classList.remove('editing');

  // state
  let isDragging = false;
  let dragOffsetX = 0, dragOffsetY = 0;
  let isResizing = false;

  const handle = box.querySelector('.resize-handle');

  // Drag start
  box.addEventListener('mousedown', (e) => {
    // if clicked on handle, skip (resize will start)
    if (e.target === handle) return;
    // if currently editing (contentEditable true), don't drag
    if (box.getAttribute('data-editing') === 'true') return;

    isDragging = true;
    dragOffsetX = e.clientX - box.offsetLeft;
    dragOffsetY = e.clientY - box.offsetTop;
    box.style.zIndex = 100;
    setActiveBox(box);
    e.preventDefault();
  });

  // Drag move
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const frameRect = frame.getBoundingClientRect();
    let nx = e.clientX - dragOffsetX;
    let ny = e.clientY - dragOffsetY;

    // constrain inside frame
    nx = Math.max(0, Math.min(frameRect.width - box.offsetWidth, nx));
    ny = Math.max(0, Math.min(frameRect.height - box.offsetHeight, ny));

    box.style.left = nx + 'px';
    box.style.top = ny + 'px';
  });

  // Drag end
  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      box.style.zIndex = 10;
    }
  });

  // Resize start (on handle)
  handle.addEventListener('mousedown', (e) => {
    isResizing = true;
    box.style.zIndex = 200;
    e.stopPropagation();
    e.preventDefault();
  });

  // Resize move
  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    const frameRect = frame.getBoundingClientRect();
    // compute width/height relative to frame coords
    const bx = box.offsetLeft;
    const by = box.offsetTop;
    let newW = e.clientX - (frameRect.left + bx);
    let newH = e.clientY - (frameRect.top + by);

    // min sizes
    newW = Math.max(30, newW);
    newH = Math.max(20, newH);

    // constrain to frame
    newW = Math.min(newW, frameRect.width - bx);
    newH = Math.min(newH, frameRect.height - by);

    box.style.width = newW + 'px';
    box.style.height = newH + 'px';
  });

  // Resize end
  document.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      box.style.zIndex = 10;
    }
  });

  // Single click -> select (but do not enable editing)
  box.addEventListener('click', (e) => {
    // If clicking handle, ignore
    if (e.target === handle) return;
    setActiveBox(box);
  });

  // Double-click -> enter edit mode
  box.addEventListener('dblclick', (e) => {
    // enable editing
    box.setAttribute('data-editing','true');
    box.contentEditable = true;
    box.classList.add('editing');
    box.focus();

    // place caret at end
    const range = document.createRange();
    range.selectNodeContents(box);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  });

  // When editing finishes (blur), turn off contentEditable so we can drag again
  box.addEventListener('blur', () => {
    if (box.getAttribute('data-editing') === 'true') {
      box.setAttribute('data-editing','false');
      box.contentEditable = false;
      box.classList.remove('editing');

      // if user changed font/color/size while editing caret-less, reflect style vars
      // update active state
      setActiveBox(box);
    }
  });

  // keyboard: Enter to finish editing (prevent newline)
  box.addEventListener('keydown', (e) => {
    if (box.getAttribute('data-editing') === 'true' && e.key === 'Enter') {
      e.preventDefault();
      box.blur(); // finish editing
    }
  });

  // double-click on handle shouldn't enable edit (stop propagation)
  handle.addEventListener('dblclick', (e)=> e.stopPropagation());
}

/* -------------------
   Controls wiring
   ------------------- */

// Add text: new box inherits current settings
addTextBtn.addEventListener('click', () => {
  createTextBox('New Text', 30, 30);
});

// Font change: applies to active box, and sets default for new boxes
fontSelector.addEventListener('change', (e) => {
  currentFont = e.target.value;
  if (activeBox) activeBox.style.fontFamily = currentFont;
});

// Color change
colorPicker.addEventListener('input', (e) => {
  currentColor = e.target.value;
  if (activeBox) activeBox.style.color = currentColor;
});

// Increase font
increaseFontBtn.addEventListener('click', () => {
  if (activeBox) {
    let size = parseInt(window.getComputedStyle(activeBox).fontSize) || currentFontSize;
    size = size + 2;
    activeBox.style.fontSize = size + 'px';
    currentFontSize = size;
  }
});

// Decrease font
decreaseFontBtn.addEventListener('click', () => {
  if (activeBox) {
    let size = parseInt(window.getComputedStyle(activeBox).fontSize) || currentFontSize;
    size = Math.max(8, size - 2);
    activeBox.style.fontSize = size + 'px';
    currentFontSize = size;
  }
});

// Delete selected box
deleteBtn.addEventListener('click', () => {
  if (!activeBox) return;
  activeBox.remove();
  activeBox = null;
});

/* -------------------
   Initialize: apply to existing boxes in DOM
   ------------------- */
document.querySelectorAll('.text-box').forEach(box => {
  // read existing style to set defaults
  currentFont = box.style.fontFamily || currentFont;
  currentColor = box.style.color || currentColor;
  currentFontSize = parseInt(box.style.fontSize) || currentFontSize;
  setupBoxInteractions(box);
});
