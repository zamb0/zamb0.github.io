let x; // Mass position
let v; // Velocity of the mass
let a; // Acceleration of the mass

let x0 = 200; // Initial position
let v0 = 0; // Initial velocity

// Initial parameters
let m = 1; // Mass of the object
let k = 10; // Elastic constant
let c = 0.5; // Damping constant

let t = 0.01; // Time step

// Canvas size
canvasX = 800;
canvasY = 400;

// Input fields
let mInput, kInput, cInput;

// Canvas and origin position
let originX; // X coordinate of the origin
let dampingFactor = 0.99; // Damping factor to avoid instability

// Graphs history
let xHistory = [];
let vHistory = [];
let tHistory = [];
xHistory.push(x0);
vHistory.push(v0);
tHistory.push(0);

let maxHistory = 200;

// Play/pause state
let isPlaying = true;
let playPauseButton;

function setup() {
    canvas = createCanvas(canvasX, canvasY);
    let canvasPos = canvas.position();
    originX = width / 2;

    createP("x0:").position(canvasPos.x + 650, canvasPos.y + height + 100);
    x0Input = createInput(x0, "number").position(canvasPos.x + 700, canvasPos.y + height + 100);
    x0Input.style("width", "50px");

    createP("v0:").position(canvasPos.x + 650, canvasPos.y + height + 125);
    v0Input = createInput(v0, "number").position(canvasPos.x + 700, canvasPos.y + height + 125);
    v0Input.style("width", "50px");

    resetSimulation();

    x = x0;
    v = v0;

    // Create input fields
    createP("Mass (m):").position(canvasPos.x + 350, canvasPos.y + height + 100)
    mInput = createInput(m, "number").position(canvasPos.x + 550, canvasPos.y + height + 100);
    mInput.style("width", "50px");

    createP("Damping (c):").position(canvasPos.x + 350, canvasPos.y + height + 125);
    cInput = createInput(c, "number").position(canvasPos.x + 550, canvasPos.y + height + 125);
    cInput.style("width", "50px");

    createP("Elastic Constant (k):").position(canvasPos.x + 350, canvasPos.y + height + 150);
    kInput = createInput(k, "number").position(canvasPos.x + 550, canvasPos.y + height + 150);
    kInput.style("width", "50px");

    // Create play/pause button
    playPauseButton = createButton("> Pause");
    playPauseButton.position(canvasPos.x + 850, canvasPos.y + height + 100);
    playPauseButton.mousePressed(togglePlayPause); // Attach toggle function

    // Create reset button
    resetButton = createButton("> Reset")
    resetButton.position(canvasPos.x + 850, canvasPos.y + height + 150);
    resetButton.mousePressed(resetSimulation); // Attach reset function to button
    resetButton

    // Create impulse button
    impulseButton = createButton("> Impulse");
    impulseButton.position(canvasPos.x + 850, canvasPos.y + height + 125);
    impulseButton.mousePressed(applyImpulse); // Attach impulse function to button

}

function draw() {
    background(240);

    // Only update simulation if playing
    if (isPlaying) {
        // Update parameters from input fields
        m = mInput.value();
        c = cInput.value();
        k = kInput.value();

        // Calculate the force acting on the mass: F = -kx - cv
        let force = -k * x - c * v;

        // Calculate the acceleration: a = F / m
        a = force / m;

        // Integrate the acceleration to obtain the velocity and the position
        v += a * t;
        x += v * t;

        // Numerical damping
        v *= dampingFactor;

        // Store the position and velocity in the history
        xHistory.push(x);
        vHistory.push(v);
        tHistory.push(tHistory[tHistory.length - 1] + t);
        if (xHistory.length > maxHistory) xHistory.shift();
        if (vHistory.length > maxHistory) vHistory.shift();
        if (tHistory.length > maxHistory) tHistory.shift();
    }

    // Draw the spring
    stroke(0);
    strokeWeight(2);
    line(originX, height / 2, originX + x, height / 2); // Line for the spring
    fill(150, 100, 255);
    ellipse(originX + x, height / 2, 40, 40); // Mass as a circle

    // Draw graphs
    drawGraphs();

    // Draw the text
    fill(0);
    noStroke();
    text(`x: ${x.toFixed(2)} \nv: ${v.toFixed(2)}\na: ${a.toFixed(2)}`, 20, height - 50);
}

function drawGraphs() {
    m = mInput.value();
    c = cInput.value();   
    k = kInput.value();

    push();
    translate(10, 10);

    // Draw the axes
    stroke(0);
    line(0, 50, maxHistory, 50); // X axis
    line(0, 150, maxHistory, 150); // V axis

    // Draw x-axis ticks and numbers
    for (let i = 0; i <= maxHistory; i += 20) {
        line(i, 48, i, 52); // Ticks for position graph
        line(i, 148, i, 152); // Ticks for velocity graph
    }

    // Draw the graph of the position
    stroke(0, 0, 255);
    noFill();
    beginShape();
    for (let i = 0; i < xHistory.length; i++) {
        let y = map(xHistory[i], -300, 300, 100, 0); // Scale the position vertically
        vertex(i, y);
    }
    endShape();

    // Draw the graph of the velocity
    stroke(255, 0, 0);
    noFill();
    beginShape();
    for (let i = 0; i < vHistory.length; i++) {
        let y = map(vHistory[i], -300, 300, 200, 100); // Scale the velocity vertically
        vertex(i, y);
    }
    endShape();

    // Draw the labels
    noStroke();
    fill(0);
    text("Position (x)", 10, 10);
    text("Velocity (v)", 10, 110);

    pop();
}

function resetSimulation() {
    // Reset initial conditions
    x = Number(x0Input.value());
    v = Number(v0Input.value());
    a = 0; // Reset acceleration
    xHistory = [];
    vHistory = [];
    tHistory = [];
}

function applyImpulse() {
    // Apply an impulse by changing the velocity
    v += 100; // Add a sudden velocity change (tune this value as needed)
}

function togglePlayPause() {
    isPlaying = !isPlaying;
    playPauseButton.html(isPlaying ? "> Pause" : "> Play");
}
