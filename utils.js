function choose(choices) {
  var index = Math.floor(Math.random() * choices.length);
  return choices[index];
}

function calculateDistance(pos1, pos2) {
  return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
}

function isPointAboveLine(
  replicator1Position,
  replicator2Position,
  targetBlobPosition
) {
  // Calculate the slope of the line
  const m =
    (replicator2Position.y - replicator1Position.y) /
    (replicator2Position.x - replicator1Position.x);

  // Calculate the expected y-coordinate (ey) for the given x-coordinate (px)
  const ey =
    m * (targetBlobPosition.x - replicator1Position.x) + replicator1Position.y;

  // Compare py with ey
  if (targetBlobPosition.y < ey) {
    return true; // The point is above the line
  } else if (targetBlobPosition.y > ey) {
    return false; // The point is below the line
  } else {
    return undefined; // The point is on the line
  }
}
