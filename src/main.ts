// main.ts
// @ts-nocheck

const period = 5000;
const condensedSize = 400;
const additionalSize = 100;

interface Polygon {
    vertices: number[][];
    color: number;
}

function drawPolygons(polygons:Polygon[], transformStrength:number) {
    let canvas = document.getElementById("output");
    let ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, condensedSize + additionalSize * 2, condensedSize + additionalSize * 2);
    for (let polygon of polygons) {
        let transformedPolygon = transformPolygon(polygon, transformStrength);
        ctx.fillStyle = '#' + polygon.color.toString(16);
        ctx.beginPath();
        ctx.moveTo(...toCanvasCoordinates(transformedPolygon[0]));
        for (let point of transformedPolygon.slice(1)) {
            ctx.lineTo(...toCanvasCoordinates(point));
        }
        ctx.fill();
    }
}

function generatePolygons(linesCount:number) {
    let result = [getSquare()];
    let square = getSquare();
    for (let i = 0; i < linesCount; i++) {
        let newResult = [];
        let firstSideIndex = Math.floor(4 * Math.random());
        let secondSideIndex = (firstSideIndex + 1 + Math.floor(3 * Math.random())) % 4;
        let cutterPoints = [
            splitLine([square[firstSideIndex], square[(firstSideIndex + 1) % 4]]),
            splitLine([square[secondSideIndex], square[(secondSideIndex + 1) % 4]]),
        ];
        let cutterCoefficients = getLineCoefficients(cutterPoints);

        for (let polygon of result) {
            let intersections = {};
            for (let index in polygon) {

                let side = [polygon[index], polygon[(Number(index) + 1) % polygon.length]];
                let sideCoefficients = getLineCoefficients(side);
                let intersectionPoint = getIntersection(cutterCoefficients, sideCoefficients);

                if (intersectionPoint[0] < Math.min(side[0][0], side[1][0])) {
                    continue;
                }
                if (intersectionPoint[0] > Math.max(side[0][0], side[1][0])) {
                    continue;
                }
                if (intersectionPoint[1] < Math.min(side[0][1], side[1][1])) {
                    continue;
                }
                if (intersectionPoint[1] > Math.max(side[0][1], side[1][1])) {
                    continue;
                }
                intersections[index] = intersectionPoint;
            }
            if (Object.values(intersections).length < 2) {
                newResult.push(polygon);
            } else {
                newResult.push(...splitPolygon(polygon, intersections));
            }
        }
        result = newResult;
    }

    return result;
}

function getIntersection(coefficients1:number, coefficients2:number) {

    let x = (coefficients1[1] - coefficients2[1]) / (coefficients2[0] - coefficients1[0]);

    return [x, coefficients1[0] * x + coefficients1[1]];
}

function getLineCoefficients(linePoints:number[][]) {
    let a = (linePoints[0][1] - linePoints[1][1]) / (linePoints[0][0] - linePoints[1][0]);

    return [a, linePoints[1][1] - a * linePoints[1][0]];
}

function getSquare() {
    return [
        [0, 1],
        [1, 0],
        [0, -1],
        [-1, 0],
    ];
}

function main() {
    let polygons = generatePolygons(10);

    paintPolygons(polygons);

    setInterval(() => {
        let timeInPeriods = (new Date()).getTime() / period;
        let periodFraction = timeInPeriods - Math.floor(timeInPeriods);
        let transformStrength = Math.abs(2 * (periodFraction - 0.5));

        drawPolygons(polygons, transformStrength)
    }, 10);
}

function paintPolygons(polygons:Polygon[]) {
    for (let polygon of polygons) {
        polygon.color = Math.floor(0x1000000 * Math.random());
    }
}

function rotate45andScale(point:number[]) {
    return [point[0] - point[1], point[0] + point[1]];
}

function splitLine(linePoints:number[][]) {
    let x = Math.random();
    return [linePoints[0][0] * x + linePoints[1][0] * (1 - x), linePoints[0][1] * x + linePoints[1][1] * (1 - x)];
}

function splitPolygon(polygon:Polygon, intersections:{ [key: number]: number[] }) {
    let result = [[], []];
    let currentPolygonIndex = 0;
    for (let vertexIndex in polygon) {
        result[currentPolygonIndex].push(polygon[vertexIndex]);
        if (vertexIndex in intersections) {
            result[currentPolygonIndex].push(intersections[vertexIndex]);
            currentPolygonIndex = (1 - currentPolygonIndex);
            result[currentPolygonIndex].push(intersections[vertexIndex]);
        }
    }

    return result;
}

function toCanvasCoordinates(point:number[]) {
    return rotate45andScale(point).map(value => (additionalSize + 0.5 * (value + 1) * condensedSize));
}

function transformPolygon(polygon:Polygon, transformStrength:number) {
    let originalCenter = [0, 0];
    for (const point of polygon) {
        originalCenter[0] += point[0];
        originalCenter[1] += point[1];
    }
    originalCenter[0] /= polygon.length;
    originalCenter[1] /= polygon.length;

    let transformCoefficient = 2 * transformStrength * additionalSize / condensedSize;
    let transformVector = [originalCenter[0] * transformCoefficient, originalCenter[1] * transformCoefficient];

    return polygon.map(vertex => [
        vertex[0] + transformVector[0],
        vertex[1] + transformVector[1],
    ]);
}