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
const chainConstraints = [];
const balls = [];
const replicators = [];
const blobColors = ["red", "blue", "green", "yellow"]; // Use CSS color names
const allowedConnections = generateAllowedConnections(blobColors);
console.log(allowedConnections);
// Disable gravity
engine.world.gravity.y = 0;

// Create a canvas
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width: 800,
    height: 600,
    wireframes: false,
  },
});

// Create boundary walls to keep balls within the canvas
const walls = [
  Bodies.rectangle(400, 0, 800, 20, { isStatic: true }),
  Bodies.rectangle(400, 600, 800, 20, { isStatic: true }),
  Bodies.rectangle(0, 300, 20, 600, { isStatic: true }),
  Bodies.rectangle(800, 300, 20, 600, { isStatic: true }),
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

// Run the engine
Engine.run(engine);
// Render the scene
Render.run(render);
