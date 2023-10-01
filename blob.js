class simBlob {
  constructor() {
    this.body = Bodies.circle(Math.random() * 800, Math.random() * 600, 20, {
      render: {
        fillStyle: choose(blobColors), // Set the fill color based on the color array
      },
    });
    this.lifespan = 10 * 1000; // seconds
    // setTimeout(() => {
    //   if (countBlobConnections(this.body) <= 0) World.remove(world, this.body);
    // }, this.lifespan);
  }
}

function createReplicator() {
  let chainBlobs = [];
  // create the initial replicator
  for (let i = 0; i < 4; i++) {
    const x = 400 + i * 50;
    const y = 300;
    const blob = Bodies.circle(x, y, 20, {
      render: {
        fillStyle: blobColors[i], // Set the fill color based on the color array
      },
    });
    chainBlobs.push(blob);
  }
  // Create constraints only between blobs with the same color
  for (let i = 0; i < chainBlobs.length - 1; i++) {
    const constraint = Constraint.create({
      bodyA: chainBlobs[i],
      bodyB: chainBlobs[i + 1],
      length: 60,
      stiffness: 0.8,
    });
    chainConstraints.push(constraint);
  }
  World.add(world, [...chainBlobs, ...chainConstraints]);
  replicators.push(chainBlobs);
}
