// Create a collision handler function
function handleCollisions(event) {
  const pairs = event.pairs;

  pairs.forEach((pair) => {
    const bodyA = pair.bodyA;
    const bodyB = pair.bodyB;

    const colorA = bodyA.render.fillStyle;
    const colorB = bodyB.render.fillStyle;
    var replicatorBlob = null;
    var currentReplicatorIndex = null;
    var currentReplicator = null;

    replicators.forEach((rpl) => {
      if (rpl.replicator.includes(bodyA) || rpl.replicator.includes(bodyB)) {
        currentReplicatorIndex = replicators.indexOf(rpl);
        currentReplicator = replicators[currentReplicatorIndex].replicator;
        replicatorBlob = isReplicator(bodyA) ? bodyA : bodyB;
      }
      const current = getReplicatorBasedOnAttachments(bodyA, bodyB);
      if (current) {
        currentReplicatorIndex = replicators.indexOf(current);
      }
    });
    const otherBody = replicatorBlob === bodyA ? bodyB : bodyA;

    if (currentReplicatorIndex === 1) {
      console.log(replicators[0]);
    }

    // Check if the collision involves blob pairs that should be connected
    if (
      currentReplicator &&
      !isReplicatorChain(otherBody) &&
      isReplicator(bodyA) !== isReplicator(bodyB) &&
      countBlobConnections(replicatorBlob) ===
        checkReplicatorConnection(replicatorBlob)
    ) {
      const replicatorPosition = replicatorBlob.position;
      const otherBodyPosition = otherBody.position;

      // add the other body to the list of attached blobs to the replicator

      const replicatorBlob1 = currentReplicator[0];
      const replicatorBlob2 = currentReplicator[3];

      const angle = replicatorBlob1.angle;
      const angle2 = replicatorBlob2.angle;

      const vector1 = { x: Math.cos(angle), y: Math.sin(angle) };
      const vector2 = { x: Math.cos(angle2), y: Math.sin(angle2) };

      side = splitArea(
        otherBodyPosition.x,
        otherBodyPosition.y,
        replicatorBlob1.position,
        replicatorBlob2.position,
        vector1,
        vector2
      );

      // Calculate the angle of the direction vector
      if (
        colorA === colorB &&
        isReplicator(bodyA) !== isReplicator(bodyB) &&
        replicators[currentReplicatorIndex].attachedBlobs.length < 4
      ) {
        replicators[currentReplicatorIndex].attachedBlobs.push(otherBody);
        console.log(replicators);
        const constraint = Constraint.create({
          bodyA: bodyA,
          bodyB: bodyB,
          length: 60,
          stiffness: 0.8,
        });
        World.add(world, constraint);
        chainConstraints.push(constraint);
      }
    }

    // connection between replicator blobs
    if (currentReplicatorIndex !== null) {
      if (
        replicators[currentReplicatorIndex].attachedBlobs.includes(bodyA) &&
        replicators[currentReplicatorIndex].attachedBlobs.includes(bodyB) &&
        shouldConnect(colorA, colorB)
      ) {
        const constraint = Constraint.create({
          bodyA: bodyA,
          bodyB: bodyB,
          length: 60,
          stiffness: 0.8,
        });
        World.add(world, constraint);
        chainConstraints.push(constraint);

        // check if it has made a complete replicator itself
        // so we should first check if the replicator blob list has made it full (4 blobs)
        // and also each attached blob has two connections (which means it also attached to its sister blob)
        // then we for each blob close its connection to its same color replicator blob (corresponding replicator blob)
        // and it will become a new replicator so we have to push it in the replicators list
        if (
          replicators[currentReplicatorIndex].attachedBlobs.length === 4 &&
          replicators[currentReplicatorIndex].attachedBlobs.every(
            (blob) =>
              countBlobConnections(blob) === checkReplicatorConnection1(blob)
          )
        ) {
          console.log(replicators[0]);

          console.log("replicator finished replicating time to detatch");
          var toRemove = [];

          chainConstraints.forEach((chain) => {
            if (
              replicators[currentReplicatorIndex].replicator.includes(
                chain.bodyA
              ) !==
                replicators[currentReplicatorIndex].replicator.includes(
                  chain.bodyB
                ) ||
              replicators[currentReplicatorIndex].replicator.includes(
                chain.bodyB
              ) !==
                replicators[currentReplicatorIndex].replicator.includes(
                  chain.bodyA
                )
            ) {
              console.log("removing chain");
              World.remove(world, chain);
              toRemove.push(chain);
            }
          });
          replicators.push({
            replicator: replicators[currentReplicatorIndex].attachedBlobs,
            attachedBlobs: [],
            name: "new rep",
          });

          chainConstraints = chainConstraints.filter(
            (item) => !toRemove.includes(item)
          );

          replicators[currentReplicatorIndex].attachedBlobs = [];

          console.log(replicators[0]);
        }
      }
    }
  });
}

function isReplicatorChain(blob) {
  for (let i = 0; i < replicators.length; i++) {
    replicator = replicators[i];
    const currentList = replicator.attachedBlobs;
    if (currentList.includes(blob)) {
      return true;
    }
  }
  return false; // Return null if not found
}

function getReplicatorBasedOnAttachments(attach1, attach2) {
  for (let i = 0; i < replicators.length; i++) {
    replicator = replicators[i];
    const currentList = replicator.attachedBlobs;
    if (currentList.includes(attach1) && currentList.includes(attach2)) {
      return replicator;
    }
  }
  return null; // Return null if not found
}

function splitArea(x, y, dot1, dot4, vector1, vector2) {
  // Calculate vectors from dot1 to the given point (x, y)
  const vectorToPoint = { x: x - dot1.x, y: y - dot1.y };

  // Calculate dot products
  const dotProduct1 = vectorToPoint.x * vector1.x + vectorToPoint.y * vector1.y;
  const dotProduct2 = vectorToPoint.x * vector2.x + vectorToPoint.y * vector2.y;

  // Check which side of the border the point is on
  if (dotProduct1 >= 0 && dotProduct2 >= 0) {
    // Point is in the red area
    return "red";
  } else {
    // Point is in the blue area
    return "blue";
  }
}

function checkReplicatorConnection(replicator) {
  if (
    replicator.render.fillStyle === "red" ||
    replicator.render.fillStyle === "yellow"
  ) {
    return 1;
  } else {
    return 2; // Change to 2 to allow a maximum of two connections for other replicators
  }
}

function checkReplicatorConnection1(replicator) {
  if (
    replicator.render.fillStyle === "red" ||
    replicator.render.fillStyle === "yellow"
  ) {
    return 2;
  } else {
    return 3; // Change to 2 to allow a maximum of two connections for other replicators
  }
}

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

// Function to check if two colors should be connected
function shouldConnect(colorA, colorB) {
  // Check if the pair of colors is in the allowed connections
  return allowedConnections.some(
    (connection) =>
      (connection.color1 === colorA && connection.color2 === colorB) ||
      (connection.color1 === colorB && connection.color2 === colorA)
  );
}
function isReplicator(body) {
  return replicators.some((rpl) =>
    rpl.replicator.some((blob) => blob === body)
  );
}

// Function to count the number of connections for a blob
function countBlobConnections(blob) {
  const count = chainConstraints.filter(
    (constraint) => constraint.bodyA === blob || constraint.bodyB === blob
  ).length;

  return count;
}
