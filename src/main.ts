// main.ts
// @ts-nocheck
const period = 5000;
const condensedSize = 300;
const additionalSize = 150;

interface Triangle {
    vertices: [number, number][];
    color: number;
}

function drawTriangles(triangles: Triangle[], transformStrength: number) {
    let canvas = document.getElementById("output") as HTMLCanvasElement;
    let ctx = canvas.getContext("2d")!;

    ctx.clearRect(0, 0, condensedSize + additionalSize * 2, condensedSize + additionalSize * 2);
    for (let triangle of triangles) {
        let transformedTriangle = transformTriangle(triangle.vertices, transformStrength);
        ctx.fillStyle = '#' + triangle.color.toString(16);
        ctx.beginPath();
        ctx.moveTo(...transformedTriangle[0].map(toCanvasCoordinates));
        ctx.lineTo(...transformedTriangle[1].map(toCanvasCoordinates));
        ctx.lineTo(...transformedTriangle[2].map(toCanvasCoordinates));
        ctx.fill();
    }
}

function generateTriangles(targetCount: number): Triangle[] {
    let result: [number, number][][] = [
        [[-1, -1], [-1, 1], [1, -1]],
        [[1, 1], [-1, 1], [1, -1]],
    ];
    while (result.length < targetCount) {
        result = [
            ...result.slice(1),
            ...splitTriangle(result[0]),
        ];
    }

    return result.map(vertices => ({
        vertices,
        color: Math.floor(0x1000000 * Math.random())
    }));
}

function main() {
    let triangles = generateTriangles(20);

    setInterval(() => {
        let timeInPeriods = (new Date()).getTime() / period;
        let periodFraction = timeInPeriods - Math.floor(timeInPeriods);
        let transformStrength = Math.abs(2 * (periodFraction - 0.5));

        drawTriangles(triangles, transformStrength);
    }, 25);
}

function splitLine(line: [number, number][]): [number, number] {
    let x = 0.25 * (Math.random() + Math.random() + Math.random() + Math.random());

    return [line[0][0] * x + line[1][0] * (1 - x), line[0][1] * x + line[1][1] * (1 - x)];
}

function splitTriangle(triangle: [number, number][]): [number, number][][] {
    let commonOldVertexIndex = Math.floor(Math.random() * 3);
    let lineToSplit = triangle.filter((_, index) => index !== commonOldVertexIndex);
    let newVertex = splitLine(lineToSplit);

    return lineToSplit.map(splitLineVertex => [
        triangle[commonOldVertexIndex],
        newVertex,
        splitLineVertex,
    ]);
}

function toCanvasCoordinates(value: number): number {
    return (additionalSize + 0.5 * (value + 1) * condensedSize);
}

function transformTriangle(triangle: [number, number][], transformStrength: number): [number, number][] {
    let originalCenter: [number, number] = [
        (triangle[0][0] + triangle[1][0] + triangle[2][0]) / 3,
        (triangle[0][1] + triangle[1][1] + triangle[2][1]) / 3,
    ];

    let transformCoefficient = 2 * transformStrength * additionalSize / condensedSize;
    let transformVector: [number, number] = [originalCenter[0] * transformCoefficient, originalCenter[1] * transformCoefficient];

    return triangle.map(vertex => [
        vertex[0] + transformVector[0],
        vertex[1] + transformVector[1],
    ]);
}