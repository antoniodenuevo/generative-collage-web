let myFont;         // Global font variable
let cutoutsData;    // Will hold the data from cutouts.json
let textData;       // Will hold the data from text.json

function preload() {
  // Load the font (adjust the path if needed)
  myFont = loadFont('assets/Arial.ttf');
  // Load JSON files with your asset paths and text snippets.
  cutoutsData = loadJSON("cutouts.json");
  textData = loadJSON("product_texts.json");
}

const flatColors = ["#000000"];
let canvasElement, canvasWidth, canvasHeight;
let layerCount = 0; // Counts total layers added

function setup() {
  canvasHeight = window.innerHeight;
  // Using full window width here.
  canvasWidth = window.innerWidth;
  canvasElement = createCanvas(canvasWidth, canvasHeight, WEBGL);
  perspective(PI / 3, canvasWidth / canvasHeight, 0.1, 10000);
  // Disable depth test so drawing order determines stacking.
  drawingContext.disable(drawingContext.DEPTH_TEST);
  background(random(flatColors));
  noStroke();
  textFont(myFont);
  createCollage();
}

function windowResized() {
  // For this automatic collage, we keep the canvas size fixed after setup.
}

async function createCollage() {
  while (true) {
    createFlatColorBackground();
    // Pick a random number of images (20 to 27) for this cycle.
    let numCutouts = floor(random(8)) + 14;
    for (let i = 0; i < numCutouts; i++) {
      await addCutout();
      layerCount++;
      // Every 4 layers, add a random text snippet.
      if (layerCount % 4 === 0) {
        await addRandomText();
      }
      await sleep(220);
    }
  }
}

function createFlatColorBackground() {
  let colorChoice = random(flatColors);
  background(colorChoice);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Updated fetchCutout() uses the JSON data.
async function fetchCutout() {
  let arr = cutoutsData.cutouts;
  return random(arr);  // Pick a random image path from the array.
}

// Updated fetchText() to use the text JSON.
async function fetchText() {
  let arr = textData.texts;
  return random(arr);  // Pick a random text snippet.
}

function loadImagePromise(url) {
  return new Promise((resolve, reject) => {
    loadImage(
      url,
      (img) => (img ? resolve(img) : reject(new Error("Image load error"))),
      reject
    );
  });
}

async function addCutout() {
  const cutoutUrl = await fetchCutout();
  if (!cutoutUrl) {
    console.log("No cutout URL returned.");
    return;
  }
  try {
    const img = await loadImagePromise(cutoutUrl);
    const dpr = window.devicePixelRatio || 1;
    const origWidth = img.width / dpr;
    const origHeight = img.height / dpr;
    
    // Randomize scale between 0.1 and 1.6.
    const scaleFactor = random(0.1, 1.6);
    const finalWidth = origWidth * scaleFactor;
    const finalHeight = origHeight * scaleFactor;
    
    // Compute a random center position in WEBGL's centered coordinate system,
    // ensuring the entire scaled image remains visible.
    const cx = random(-canvasWidth / 2 + finalWidth / 2, canvasWidth / 2 - finalWidth / 2);
    const cy = random(-canvasHeight / 2 + finalHeight / 2, canvasHeight / 2 - finalHeight / 2);
    
    // Assign a random Y-axis rotation between -88° and 88°.
    const angle = random(radians(-88), radians(88));
    
    push();
      translate(cx, cy, 0);
      rotateY(angle);
      imageMode(CENTER);
      image(img, 0, 0, finalWidth, finalHeight);
    pop();
    
    console.log("Cutout added from URL:", cutoutUrl,
                "Scale factor:", scaleFactor,
                "Rotation (deg):", degrees(angle));
  } catch (error) {
    console.error("Error loading image:", error);
  }
}

async function addRandomText() {
  const randomText = await fetchText();
  if (!randomText) return;
  
  // Choose a random font size between 50 and 400 pixels.
  const fontSize = floor(random(50, 400));
  // Choose a random position in WEBGL's centered coordinate system.
  const tx = random(-canvasWidth / 2, canvasWidth / 2);
  const ty = random(-canvasHeight / 2, canvasHeight / 2);
  
  push();
    textAlign(CENTER, CENTER);
    textSize(fontSize);
    fill(255); // Draw text in white.
    text(randomText, tx, ty);
  pop();
  
  console.log("Text added:", randomText, "Font size:", fontSize);
}

function keyPressed() {
  if (key.toLowerCase() === "s") saveRender();
}

function saveRender() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `render_${timestamp}.png`;
  canvasElement.elt.toBlob((blob) => {
    const formData = new FormData();
    formData.append("image", blob, fileName);
    fetch("http://127.0.0.1:5000/save_render", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => console.log("Saved:", data))
      .catch((error) => console.error("Error saving:", error));
  }, "image/png");
}
