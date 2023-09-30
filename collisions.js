// Create a collision handler function
function handleCollisions(event) {
  const pairs = event.pairs;

  pairs.forEach((pair) => {
    const bodyA = pair.bodyA;
    const bodyB = pair.bodyB;

    const colorA = bodyA.render.fillStyle;
    const colorB = bodyB.render.fillStyle;

    // Check if the collision involves blob pairs that should be connected
    if (
      shouldConnect(colorA, colorB) &&
      countBlobConnections(bodyA) < 2 &&
      countBlobConnections(bodyB) < 2
    ) {
      const constraint = Constraint.create({
        bodyA: bodyA,
        bodyB: bodyB,
        length: 60,
        stiffness: 0.8,
      });
      World.add(world, constraint);
      chainConstraints.push(constraint);
    }
  });
}

// Function to check if two colors should be connected
function shouldConnect(colorA, colorB) {
  const allowedConnections = [
    { color1: "red", color2: "blue" },
    { color1: "blue", color2: "red" },
    { color1: "green", color2: "yellow" },
    { color1: "yellow", color2: "green" },
    // Add more allowed connections here
  ];

  // Check if the pair of colors is in the allowed connections
  return allowedConnections.some(
    (connection) =>
      (connection.color1 === colorA && connection.color2 === colorB) ||
      (connection.color1 === colorB && connection.color2 === colorA)
  );
}

// Function to count the number of connections for a blob
function countBlobConnections(blob) {
  return chainConstraints.filter(
    (constraint) => constraint.bodyA === blob || constraint.bodyB === blob
  ).length;
}
