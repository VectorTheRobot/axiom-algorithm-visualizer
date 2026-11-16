const { Array2DTracer, LogTracer, Tracer } = require('algorithm-visualizer');

const board = new Array2DTracer('Board');
const pos = new Array2DTracer('Knight Position');
const console = new LogTracer('Console');

const N = 3;
const grid = new Array(N).fill(0).map(() => new Array(N).fill(-1));

board.set(grid);
pos.set([[-1, -1]]);
Tracer.delay();

const X = [2, 1, -1, -2, -2, -1, 1, 2];
const Y = [1, 2, 2, 1, -1, -2, -2, -1];

function isValid(x, y) {
    return (x >= 0 && x < N && y >= 0 && y < N && grid[x][y] === -1);
}

function knightTour(x, y, moveNum) {
    if (moveNum === N * N) return true;

    for (let i = 0; i < 8; i++) {
        const nextX = x + X[i];
        const nextY = y + Y[i];

        if (isValid(nextX, nextY)) {
            grid[nextX][nextY] = moveNum;
            board.patch(nextX, nextY, moveNum);
            pos.patch(0, 0, nextX);
            pos.patch(0, 1, nextY);
            console.println(`Move to ${nextX},${nextY}`);
            Tracer.delay();

            if (knightTour(nextX, nextY, moveNum + 1)) return true;

            grid[nextX][nextY] = -1;
            board.depatch(nextX, nextY);
            Tracer.delay();
        } else {
            console.println(`${nextX},${nextY} is not a valid move`);
            Tracer.delay();
        }
    }
    return false;
}

grid[0][0] = 0;
board.patch(0, 0, 0);
pos.patch(0, 0, 0);
pos.patch(0, 1, 0);
console.println("Move to 0,0");
Tracer.delay();

knightTour(0, 0, 1);