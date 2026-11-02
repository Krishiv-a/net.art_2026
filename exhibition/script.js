const rainbow = ["#ff3333", "#ff9900", "#ffff00", "#33ff33", "#33ccff", "#cc66ff", "#ff66cc"];
const title = document.getElementById("title");
const words = title.textContent;
title.textContent = "";
let n = 0;
for (const ch of words) {
  const s = document.createElement("span");
  s.textContent = ch;
  if (ch !== " ") {
    s.style.color = rainbow[n % rainbow.length];
    n += 1;
  }
  title.appendChild(s);
}
title.setAttribute("aria-label", words);

const tiles = [
  ["#ffccdd", "#ff6699"], ["#ffffcc", "#cc9900"], ["#ccffcc", "#339966"],
  ["#ccddff", "#3366cc"], ["#ffdddd", "#cc0000"], ["#eeccff", "#9933cc"],
  ["#ddffff", "#009999"], ["#ffeecc", "#ff6600"], ["#eeeeee", "#666666"]
];

const room = document.getElementById("love-room");
const pos = document.getElementById("love-pos");
let lx = 1;
let ly = 1;

function drawRoom() {
  const [a, b] = tiles[ly * 3 + lx];
  room.style.backgroundColor = a;
  room.style.backgroundImage = `radial-gradient(${b} 2px, transparent 3px)`;
  pos.textContent = `room ${lx + 1}, ${ly + 1}`;
}

document.querySelectorAll(".love-nav button").forEach((btn) => {
  btn.addEventListener("click", () => {
    lx = Math.min(2, Math.max(0, lx + Number(btn.dataset.dx)));
    ly = Math.min(2, Math.max(0, ly + Number(btn.dataset.dy)));
    drawRoom();
  });
});

drawRoom();

const framesStage = document.getElementById("frames");
let frameCount = 0;

function makeFrame() {
  frameCount += 1;
  const f = document.createElement("div");
  f.className = "frame";
  f.textContent = `frame ${frameCount}`;
  f.addEventListener("click", splitFrame);
  return f;
}

function splitFrame(e) {
  const f = e.currentTarget;
  if (f.classList.contains("split") || frameCount >= 24) return;
  e.stopPropagation();
  const depth = Number(f.dataset.depth || 0);
  f.removeEventListener("click", splitFrame);
  f.textContent = "";
  f.classList.add("split", depth % 2 === 0 ? "row" : "col");
  for (let i = 0; i < 2; i += 1) {
    const child = makeFrame();
    child.dataset.depth = depth + 1;
    f.appendChild(child);
  }
}

framesStage.appendChild(makeFrame());

const form = document.getElementById("formart");
const cols = 13;
const rows = 7;

for (let r = 0; r < rows; r += 1) {
  for (let c = 0; c < cols; c += 1) {
    const d = Math.abs(c - 6) + Math.abs(r - 3);
    const box = document.createElement("input");
    if (d === 3 || d === 6) {
      box.type = "radio";
      box.name = `row${r}`;
    } else {
      box.type = "checkbox";
      box.checked = d < 3;
    }
    form.appendChild(box);
  }
  form.appendChild(document.createElement("br"));
}

for (let i = 0; i < 5; i += 1) {
  const b = document.createElement("button");
  b.type = "button";
  b.addEventListener("click", () => {
    form.querySelectorAll("input[type=checkbox]").forEach((box) => {
      box.checked = !box.checked;
    });
  });
  form.appendChild(b);
}
