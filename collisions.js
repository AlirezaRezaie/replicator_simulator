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

    // Check if the collision involves blob pairs that should be connected
    if (
      currentReplicator &&
      !isReplicatorChain(otherBody) &&
      isReplicator(bodyA) !== isReplicator(bodyB) &&
      countBlobConnections(replicatorBlob) ===
        checkReplicatorConnection(replicatorBlob)
    ) {
      // we should calculate the distance between the current blob that wants to attach the replicator
      // and the blob that has attached

      // Calculate the angle of the direction vector
      if (
        colorA === colorB &&
        isReplicator(bodyA) !== isReplicator(bodyB) &&
        replicators[currentReplicatorIndex].attachedBlobs.length < 4
      ) {
        var attachedBlob = null;
        var goodDistance = true;
        if (replicators[currentReplicatorIndex].attachedBlobs !== 3) {
          if (otherBody.render.fillStyle === "green") {
            attachedBlob = getAttachedBlobByColor(
              "blue",
              currentReplicatorIndex
            );
          } else if (otherBody.render.fillStyle === "blue") {
            attachedBlob = getAttachedBlobByColor(
              "green",
              currentReplicatorIndex
            );
          }
        }

        if (attachedBlob) {
          const xBlob = attachedBlob.position.x;
          const yBlob = attachedBlob.position.y;

          // Calculate the distance between the blob to attach and the current blob in the chain
          const distance = Math.sqrt(
            (xBlob - otherBody.position.x) ** 2 +
              (yBlob - otherBody.position.x) ** 2
          );

          // You can adjust this threshold to determine what's considered the same side
          const threshold = 230;
          console.log();
          if (distance <= threshold) {
            side = "left";

            console.log("f");
          } else {
            side = "right";
            console.log("g");
          }
        }

        if (goodDistance) {
          replicators[currentReplicatorIndex].attachedBlobs.push(otherBody);
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

        setTimeout(() => {
          if (
            replicators[currentReplicatorIndex].attachedBlobs.length === 4 &&
            replicators[currentReplicatorIndex].attachedBlobs.every(
              (blob) => countBlobConnections(blob) >= 2
            )
          ) {
            console.log("destroying the replicator attachments");
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

              if (
                replicators[currentReplicatorIndex].attachedBlobs.includes(
                  chain.bodyA
                ) &&
                replicators[currentReplicatorIndex].attachedBlobs.includes(
                  chain.bodyB
                )
              ) {
                console.log("removing chain");
                World.remove(world, chain);
                toRemove.push(chain);
              }
            });

            chainConstraints = chainConstraints.filter(
              (item) => !toRemove.includes(item)
            );

            replicators[currentReplicatorIndex].attachedBlobs = [];
          }
        }, 10);
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
        }
      }
    }
  });
}

function getAttachedBlobByColor(color, replicatorIndex) {
  var colorBlob = null;
  replicators[replicatorIndex].attachedBlobs.forEach((blob) => {
    if (blob.render.fillStyle === color) {
      colorBlob = blob;
    }
  });
  return colorBlob;
}
function getReplicatorBlobByColor(color, replicatorIndex) {
  var colorBlob = null;
  replicators[replicatorIndex].replicator.forEach((blob) => {
    if (blob.render.fillStyle === color) {
      colorBlob = blob;
    }
  });
  return colorBlob;
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
