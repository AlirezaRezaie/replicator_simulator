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

function pointInPolygon(point, vertices) {
  var x = point.x;
  var y = point.y;

  var inside = false;
  for (var i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    var xi = vertices[i].x;
    var yi = vertices[i].y;
    var xj = vertices[j].x;
    var yj = vertices[j].y;

    var intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}

function arePointsOnSameSide(lineStart, lineEnd, point1, point2) {
  // Calculate the vectors representing the line segment and the two points
  const lineVector = {
    x: lineEnd.x - lineStart.x,
    y: lineEnd.y - lineStart.y,
  };
  const vector1 = {
    x: point1.x - lineStart.x,
    y: point1.y - lineStart.y,
  };
  const vector2 = {
    x: point2.x - lineStart.x,
    y: point2.y - lineStart.y,
  };

  // Calculate the dot products
  const dotProduct1 = lineVector.x * vector1.x + lineVector.y * vector1.y;
  const dotProduct2 = lineVector.x * vector2.x + lineVector.y * vector2.y;

  // If the dot products have the same sign, the points are on the same side
  return dotProduct1 * dotProduct2 > 0;
}
