let h; // Water level
let hRate; // Rate of change of water level (dh/dt)
let Ar = 0.08; // Area of the tank base
let Au = 0.000043; // Acceleration
let u = 0; // Inflow rate
let g = 9.81; // Gravity
let hu = -0.095; // Height of the inflow

// Initial conditions
let h0 = 50; // Initial water level
let dh0 = 0; // Initial rate of change

// Canvas size
canvasX = 800;
canvasY = 400;

t=5

// Input fields
let AInput, kInput;

// Graphs history
let hHistory = [h0];
let tHistory = [0];
let maxHistory = 200;

// Play/pause state
let isPlaying = true;
let playPauseButton;

let isStepInput = false;

function setup() {
    canvas = createCanvas(canvasX, canvasY);
    let canvasPos = canvas.position();

    createP("h0:").position(canvasPos.x + 650, canvasPos.y + height + 100);
    h0Input = createInput(h0, "number").position(canvasPos.x + 700, canvasPos.y + height + 100);
    h0Input.style("width", "50px");

    resetSimulation();

    h = h0;
    hRate = dh0;

    // Create input fields
    createP("Tank Area (Ar):").position(canvasPos.x + 350, canvasPos.y + height + 100);
    ArInput = createInput(Ar, "number").position(canvasPos.x + 550, canvasPos.y + height + 100);

    createP("Outflow Coef. (Au):").position(canvasPos.x + 350, canvasPos.y + height + 125);
    AuInput = createInput(Au, "number").position(canvasPos.x + 550, canvasPos.y + height + 125);

    createP("Inflow Rate (u):").position(canvasPos.x + 350, canvasPos.y + height + 150);
    uInput = createInput(u, "number").position(canvasPos.x + 550, canvasPos.y + height + 150);

    // Create play/pause button
    playPauseButton = createButton("> Pause");
    playPauseButton.position(canvasPos.x + 850, canvasPos.y + height + 100);
    playPauseButton.mousePressed(togglePlayPause); // Attach toggle function

    // Create reset button
    resetButton = createButton("> Reset")
    resetButton.position(canvasPos.x + 850, canvasPos.y + height + 150);
    resetButton.mousePressed(resetSimulation); // Attach reset function to button

    // Create impulse button
    stepButton = createButton("> Step Input");
    stepButton.position(canvasPos.x + 850, canvasPos.y + height + 125);
    stepButton.mousePressed(applyStep); 
}

function draw() {
    background(240);

    // Only update simulation if playing
    if (isPlaying) {
        // Update parameters from input fields
        Ar = ArInput.value();
        Au = AuInput.value();

        // Calculate rate of change of water level
        hRate = 1 / Ar * (u - Au * Math.sqrt(2*g*(h-hu)));

        // Integrate to find the new water level
        h += hRate * t; // 0.1 is the time step

        h = max(0, h); // Water level can't be negative

        if (isStepInput) {
            u = Number(uInput.value());
        } else {
            u = 0;
        }

        // Store the water level in the history
        hHistory.push(h);
        if (hHistory.length > maxHistory) hHistory.shift();
        tHistory.push(tHistory[tHistory.length - 1] + t);
        if (tHistory.length > maxHistory) tHistory.shift();
    }

    // Draw the tank
    drawTank();

    // Draw the graph
    drawGraph();

    // Display information
    fill(0);
    noStroke();
    text(`Water Level (h): ${h.toFixed(2)}\nRate of Change (dh/dt): ${hRate.toFixed(2)}`, 20, height - 50);
}

function drawTank() {

    hscaled = map(h, 0, 75, 0, 200);
    push();
    translate(width / 2 - 100, height / 2 + 50);

    // Draw tank outline
    noFill();
    stroke(0);
    rect(0, -200, 200, 200);

    // Draw water level
    fill(100, 150, 255);
    noStroke();
    rect(0, -hscaled, 200, hscaled);

    // Draw inflow and outflow
    fill(0);
    text("Inflow", -50, -hscaled - 10);
    text("Outflow", 220, 0);

    pop();
}

function drawGraph() {
    push();
    translate(10, 10);

    // Draw the axes
    stroke(0);
    line(0, 100, maxHistory, 100); // X axis

    // Draw x-axis ticks and numbers
    for (let i = 0; i <= maxHistory; i += 20) {
        line(i, 98, i, 102); // Ticks for position graph
    }

    // Draw the graph of the water level
    stroke(0, 0, 255);
    noFill();
    beginShape();
    for (let i = 0; i < hHistory.length; i++) {
        let y = map(hHistory[i], 0, 200, 100, 0); // Scale the water level vertically
        vertex(i, y);
    }
    endShape();

    // Draw the labels
    noStroke();
    fill(0);
    text("Water Level (h)", 10, 20);

    pop();
}

function resetSimulation() {
    // Reset initial conditions
    h = Number(h0Input.value());
    hRate = 0;
    hHistory = [h];
    tHistory = [0];
}

function applyStep() {
    isStepInput = !isStepInput;
    stepButton.html(isStepInput ? "> Remove Input" : "> Apply Input"); 
}

function togglePlayPause() {
    isPlaying = !isPlaying;
    playPauseButton.html(isPlaying ? "> Pause" : "> Play");
}
