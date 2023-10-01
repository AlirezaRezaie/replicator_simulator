// Create a collision handler function
function handleCollisions(event) {
  const pairs = event.pairs;

  pairs.forEach((pair) => {
    const bodyA = pair.bodyA;
    const bodyB = pair.bodyB;

    const colorA = bodyA.render.fillStyle;
    const colorB = bodyB.render.fillStyle;
    var replicator = null;

    [bodyA, bodyB].forEach((element) => {
      if (isReplicator(element)) {
        replicator = element;
      }
    });

    // Check if the collision involves blob pairs that should be connected
    if (
      colorA === colorB &&
      isReplicator(bodyA) !== isReplicator(bodyB) &&
      countBlobConnections(replicator) <= checkReplicatorConnection(replicator)
    ) {
      // Get the position of the replicator and the other body
      const replicatorPosition = replicator.position;
      const otherBodyPosition =
        replicator === bodyA ? bodyB.position : bodyA.position;

      // Calculate the direction vector from the replicator to the other body
      const directionVector = Matter.Vector.sub(
        otherBodyPosition,
        replicatorPosition
      );

      // Calculate the angle of the direction vector
      const angle = Matter.Vector.angle(directionVector);

      // Determine which side of the replicator the other body is on based on the angle
      let side = null;
      if (angle >= -Math.PI / 4 && angle < Math.PI / 4) {
        side = "right";
      } else if (angle >= Math.PI / 4 && angle < (3 * Math.PI) / 4) {
        side = "bottom";
      } else if (angle >= (3 * Math.PI) / 4 || angle < -(3 * Math.PI) / 4) {
        side = "left";
      } else {
        side = "top";
      }

      console.log(side);

      // Check if the replicator side is already connected
      if (!isReplicatorSideConnected(replicator, side)) {
        const constraint = Constraint.create({
          bodyA: replicator,
          bodyB: bodyA === replicator ? bodyB : bodyA,
          length: 60,
          stiffness: 0.8,
        });
        World.add(world, constraint);
        chainConstraints.push(constraint);

        // Mark the replicator side as connected
        markReplicatorSideAsConnected(replicator, side);
      }
    }
  });
}

// Keep track of connected sides of replicators
const replicatorSidesConnected = new Map();

// Function to generate allowed connections
// Function to generate allowed connections based on vicinity
function generateAllowedConnections(colors) {
  const allowedConnections = [];

  // Generate connections for adjacent colors
  for (let i = 0; i < colors.length - 1; i++) {
    allowedConnections.push({ color1: colors[i], color2: colors[i + 1] });
    allowedConnections.push({ color1: colors[i + 1], color2: colors[i] });
  }

  return allowedConnections;
}
function markReplicatorSideAsConnected(replicator, side) {
  if (!replicatorSidesConnected.has(replicator)) {
    replicatorSidesConnected.set(replicator, []);
  }

  replicatorSidesConnected.get(replicator).push(side);
}

function isReplicatorSideConnected(replicator, side) {
  if (replicatorSidesConnected.has(replicator)) {
    return replicatorSidesConnected.get(replicator).includes(side);
  }

  return false;
}

function checkReplicatorConnection(replicator) {
  if (
    replicator.render.fillStyle === "red" ||
    replicator.render.fillStyle === "yellow"
  ) {
    return 1;
  } else {
    return 3;
  }
}

// Function to count the number of connections for a blob
function countBlobConnections(blob) {
  return chainConstraints.filter(
    (constraint) => constraint.bodyA === blob || constraint.bodyB === blob
  ).length;
}

// Function to check if a body is a replicator
function isReplicator(body) {
  return replicators.includes(body);
}
