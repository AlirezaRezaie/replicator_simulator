// Matter.js setup
const Engine = Matter.Engine;
const Render = Matter.Render;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Events = Matter.Events;
const Constraint = Matter.Constraint;

// Create an engine and world
const engine = Engine.create();
const world = engine.world;
const balls = [];
const replicators = [];
const blobColors = ["red", "blue", "green", "yellow"]; // Use CSS color names
const allowedConnections = generateAllowedConnections(blobColors);

var chainConstraints = [];
var inProgressChain = [];

console.log(allowedConnections);
// Disable gravity
engine.world.gravity.y = 0;

// Create a canvas
const render = Render.create({
  element: document.querySelector('.simulator'),
  engine: engine,
  options: {
    width: 1260,
    height: 600,
    wireframes: false,
  },
});

// Create boundary walls to keep balls within the canvas
const walls = [
  Bodies.rectangle(640, 0, 1260, 20, { isStatic: true }),
  Bodies.rectangle(640, 600, 1260, 20, { isStatic: true }),
  Bodies.rectangle(0, 300, 20, 600, { isStatic: true }),
  Bodies.rectangle(1260, 300, 20, 600, { isStatic: true }),
];

// Add the walls to the world
World.add(world, walls);

// Create multiple balls with random positions and add them to the world
for (let i = 0; i < 100; i++) {
  var blob = new simBlob();
  const ball = blob.body;
  balls.push(ball);
  World.add(world, ball);
}

createReplicator();
// Add a wind-like force to push balls randomly
Events.on(engine, "beforeUpdate", function () {
  balls.forEach((ball) => {
    const windForce = {
      x: 0.01 * (Math.random() - 0.5),
      y: 0.01 * (Math.random() - 0.5),
    };
    Matter.Body.applyForce(ball, ball.position, windForce);
  });
});

// Attach the collision handler to the engine's collisionStart event
Events.on(engine, "collisionStart", handleCollisions);
// Define a function to run on each frame
function onEachFrame() {
  const canvas = document.querySelector("canvas");
  const overlayCtx = canvas.getContext("2d");
  // Assuming you have an array of bodies
  bodies = world.bodies;
  for (let i = 0; i < bodies.length; i++) {
    const body = bodies[i];

    // Set the text style
    overlayCtx.fillStyle = "white";
    overlayCtx.font = "12px Arial";

    // Calculate the center position of the body
    const centerX = body.position.x;
    const centerY = body.position.y;

    // Draw the body's ID as text on the canvas
    overlayCtx.fillText(`ID: ${body.id}`, centerX - 15, centerY);
  }
  // Your code to run on each frame update goes here
  // This function will be called before each physics update frame.
}

// Attach the custom function to the beforeUpdate event
Events.on(engine, "beforeUpdate", onEachFrame);

// Run the engine
Engine.run(engine);
// Render the scene
Render.run(render);
