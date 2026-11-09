const stage = document.getElementById("stage");
const trail = document.getElementById("trail");

const rows = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
const shapeForRow = ["ring", "zigzag", "block"];
const waveForRow = ["sine", "triangle", "square"];
const octaveForRow = [2, 1, 0.5];
const scale = [220, 246.94, 277.18, 329.63, 369.99];
const sizes = {
  ring: [110, 110],
  zigzag: [60, 170],
  block: [80, 80]
};
const palettes = [
  { bg: "#1f3d2b", inks: ["#f4a259", "#f2e8cf", "#bc4b51", "#8cb369"] },
  { bg: "#2b1a4a", inks: ["#ff6fb5", "#7ee8fa", "#fdf5a6", "#b388ff"] },
  { bg: "#ff6b57", inks: ["#1b1b3a", "#fff3e0", "#3ddc97", "#ffd23f"] },
  { bg: "#0f8b8d", inks: ["#ffd166", "#ffffff", "#073b4c", "#ef476f"] },
  { bg: "#f4efe6", inks: ["#2643e9", "#ef476f", "#111111", "#f7a072"] },
  { bg: "#14213d", inks: ["#fca311", "#e5e5e5", "#61e8e1", "#f25f5c"] }
];

const guides = [];
let paletteIndex = 0;
let history = [];
let audio = null;

function random(min, max) {
  return min + Math.random() * (max - min);
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function place(element, row, col, wobble) {
  const x = 14 + row * 4 + col * 8 + random(-wobble, wobble);
  const y = 25 + row * 25 + random(-wobble * 2, wobble * 2);
  element.style.left = x + "%";
  element.style.top = y + "%";
}

function buildGuides() {
  for (let row = 0; row < rows.length; row++) {
    guides.push([]);
    for (let col = 0; col < rows[row].length; col++) {
      const guide = document.createElement("span");
      guide.className = "guide";
      guide.textContent = rows[row][col];
      place(guide, row, col, 0);
      stage.appendChild(guide);
      guides[row].push(guide);
    }
  }
}

function noteFor(row, col) {
  const step = scale[col % scale.length];
  const lift = col >= scale.length ? 2 : 1;
  return step * lift * octaveForRow[row];
}

function playNote(frequency, wave) {
  if (!audio) {
    audio = new AudioContext();
  }
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  const volume = wave === "square" ? 0.08 : 0.25;
  osc.type = wave;
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.8);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start();
  osc.stop(audio.currentTime + 0.8);
}

function makeZigzag() {
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  const line = document.createElementNS(svgNS, "polyline");
  svg.setAttribute("viewBox", "0 0 60 170");
  line.setAttribute("points", "8,8 52,40 8,72 52,104 8,136 52,164");
  svg.appendChild(line);
  return svg;
}

function drawShape(row, col) {
  const type = shapeForRow[row];
  const shape = type === "zigzag" ? makeZigzag() : document.createElement("div");
  const grow = random(0.6, 1.5);
  shape.classList.add("shape", type);
  shape.style.width = sizes[type][0] * grow + "px";
  shape.style.height = sizes[type][1] * grow + "px";
  shape.style.setProperty("--shape-color", pick(palettes[paletteIndex].inks));
  shape.style.animationDuration = random(0.7, 1.6) + "s";
  place(shape, row, col, 3);
  stage.appendChild(shape);
  shape.addEventListener("animationend", function () {
    shape.remove();
  });
}

function flash(row, col) {
  guides[row][col].animate(
    [
      { opacity: 1, transform: "translate(-50%, -50%) scale(2)" },
      { opacity: 0.25, transform: "translate(-50%, -50%) scale(1)" }
    ],
    { duration: 500, easing: "ease-out" }
  );
}

function remember(label) {
  history.push(label);
  if (history.length > 16) {
    history.shift();
  }
  trail.innerHTML = "";
  history.forEach(function (item) {
    const li = document.createElement("li");
    li.textContent = item;
    trail.appendChild(li);
  });
}

function usePalette(index) {
  paletteIndex = index;
  document.body.style.setProperty("--bg", palettes[index].bg);
  document.body.style.setProperty("--ink", palettes[index].inks[0]);
}

function randomPalette() {
  let next = Math.floor(Math.random() * palettes.length);
  while (next === paletteIndex) {
    next = Math.floor(Math.random() * palettes.length);
  }
  usePalette(next);
}

function trigger(row, col) {
  drawShape(row, col);
  flash(row, col);
  playNote(noteFor(row, col), waveForRow[row]);
  remember(rows[row][col]);
}

document.addEventListener("keydown", function (event) {
  if (event.repeat) {
    return;
  }
  const key = event.key.toLowerCase();
  if (key === " ") {
    event.preventDefault();
    randomPalette();
    remember("_");
    return;
  }
  for (let row = 0; row < rows.length; row++) {
    const col = rows[row].indexOf(key);
    if (col !== -1) {
      trigger(row, col);
      return;
    }
  }
});

stage.addEventListener("click", function (event) {
  const y = (event.clientY / window.innerHeight) * 100;
  const row = Math.min(2, Math.max(0, Math.round((y - 25) / 25)));
  const x = (event.clientX / window.innerWidth) * 100;
  const col = Math.min(rows[row].length - 1, Math.max(0, Math.round((x - 14 - row * 4) / 8)));
  trigger(row, col);
});

usePalette(Math.floor(Math.random() * palettes.length));
buildGuides();
