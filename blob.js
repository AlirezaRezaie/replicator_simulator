class simBlob {
  constructor() {
    this.body = Bodies.circle(Math.random() * 800, Math.random() * 600, 20, {
      render: {
        fillStyle: choose(blobColors), // Set the fill color based on the color array
      },
    });
    this.lifespan = 10 * 1000; // seconds
    setTimeout(() => {
      if (countBlobConnections(this.body) <= 0) World.remove(world, this.body);
    }, this.lifespan);
  }
}
