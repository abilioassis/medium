/**
 * Represents the different types of a maze cell.
 */
const CELL_TYPE = {
    START: "SP",
    FINISH: "FP",
    WALL: "XX",
    EMPTY: "  "
};

/**
 * Represents a position in the maze that is defined by the pair (row, col).
 * A position also stores all adjacent positions (children) that can be generated from it when traversing the maze.
 * The father property defines the position that gave rise to this one.
 * Example: startPosition = { id: 'SP', row: 3, col: 2, father: null, children: ['01', '02', '03'] }
 */
class Pos {
    constructor(row, col, father, id) {
        this.row = row;
        this.col = col;
        this.father = father;
        this.id = id;
        this.children = [];
    }

    /**
     * Produces true if two positions are equal.
     * Two positions are the same if they have the same location (row, col) in the maze.
     */
    equal(pos) {
        return (this.row === pos.row && this.col === pos.col);
    }

    /**
     * Returns a new position above the current one
     */
    above() {
        return new Pos(this.row - 1, this.col, this);
    }

    /**
     * Returns a new position rigth the current one
     */
    rigth() {
        return new Pos(this.row, this.col + 1, this);
    }

    /**
     * Returns a new position bellow the current one
     */
    bellow() {
        return new Pos(this.row + 1, this.col, this);
    }

    /**
     * Returns a new position left the current one
     */
    left() {
        return new Pos(this.row, this.col - 1, this);
    }

    /**
     * Adds a child position to the current position.
     */
    addChild(pos) {
        this.children.push(pos);
    }

    setId(id) {
        this.id = (id < 10) ? '0' + id : id.toString();
    }

}

/**
 * The maze is a matrix with n rows (row) and m columns (col).
 */
class Maze {
    constructor(nrow, ncol) {
        this.nrow = nrow;
        this.ncol = ncol;
        this.matrix = this.createMatrix();
    }

    createMatrix() {
        // first, we create an array
        let matrix = [];
        for (let i = 0; i < this.nrow; i++) {
            // Then, for each row in the array, we add a second array
            matrix[i] = [];
            for (let j = 0; j < this.ncol; j++) {
                // all cells are marked as empty
                matrix[i][j] = CELL_TYPE.EMPTY;
            }
        }
        return matrix;
    }

    /**
     * Taking just one step, what would be the next possible moves to be made from the current position?
     * Produces a list of possible clockwise moves.
     */
    nextPositions(currentPosition) {
        const nextPositions = [];
        if (this.movingUpIsOK(currentPosition)) nextPositions.push(currentPosition.above());
        if (this.movingRightIsOK(currentPosition)) nextPositions.push(currentPosition.rigth());
        if (this.movingBellowIsOK(currentPosition)) nextPositions.push(currentPosition.bellow());
        if (this.movingLeftIsOK(currentPosition)) nextPositions.push(currentPosition.left());
        return nextPositions;
    }

    /**
     * From the current position, it produces true if upward movement is possible.
     */
    movingUpIsOK(currentPosition) {
        return currentPosition.above().row >= 0 &&
            this.getCell(currentPosition.above()) == CELL_TYPE.EMPTY;
    }

    /**
     * From the current position, it produces true if right movement is possible.
     */
    movingRightIsOK(currentPosition) {
        return (
            currentPosition.rigth().col <= this.ncol - 1 &&
            this.getCell(currentPosition.rigth()) == CELL_TYPE.EMPTY
        );
    }

    /**
     * From the current position, it produces true if bellow movement is possible.
     */
    movingBellowIsOK(currentPosition) {
        return (
            currentPosition.bellow().row <= this.nrow - 1 &&
            this.getCell(currentPosition.bellow()) == CELL_TYPE.EMPTY
        );
    }

    /**
     * From the current position, it produces true if left movement is possible.
     */
    movingLeftIsOK(currentPosition) {
        return (
            currentPosition.left().col >= 0 &&
            this.getCell(currentPosition.left()) == CELL_TYPE.EMPTY
        );
    }

    /**
     * Given a position set the value of a maze cell.
     */
    setCell(position) {
        if (position.row <= this.nrow && position.col <= this.ncol) {
            this.matrix[position.row][position.col] = position.id;
        }
    }

    /**
     * * Given a position get the value of a maze cell.
     */
    getCell(position) {
        if (position.row <= this.nrow && position.col <= this.ncol) {
            return this.matrix[position.row][position.col];
        }
    }

    /**
     * Print the maze on the console
     */
    print() {
        console.log(this.matrix.join("\n"));
        console.log('--------------');
    }

    /**
    * Cycle through the graph and update the positions in the maze.
    * Prints the maze in the console.
    */
    setMaze(posRoot) {
        this.setCell(posRoot);
        for (const child of posRoot.children) {
            this.setMaze(child);
        }
        return this;
    }
}

class BFS {
    /**
    * It traverses the maze and builds the graph that represents the exploration
    * done by the breadth-first search algorithm through the maze.
    */
    static solve(maze, start, finish) {
        let id = 0; // identificador da posição
        let itr = 0; // identificador da iteração
        // adiciono a posição inicial à fila
        const posRoot = new Pos(start.row, start.col, null, start.id);
        let toBeVisited = [posRoot];
        // há posições na fila?
        while (toBeVisited.length > 0) {
            console.log('ITERATION:', ++itr);
            // retiro a primeira posição da fila
            const pos = toBeVisited.shift();
            // atualizo a matriz com a posição
            maze.setCell(pos);
            // gero filhos da posição
            for (const child of maze.nextPositions(pos)) {
                // algum filho é a posição final desejada?
                if (child.equal(finish)) { // sim
                    // crio o Id da posição final
                    child.setId('FP');
                    // atualizo o grafo com a posição final
                    pos.addChild(child);
                    // atualizo a matriz com a posição final
                    maze.setCell(child);
                    // imprimo o labirinto
                    maze.print();
                    // retorno o grafo
                    return posRoot;
                } else { // não
                    // crio o Id do filho
                    child.setId(++id);
                    // atualizo o grafo com o filho
                    pos.addChild(child);
                    // atualizo a matriz com o filho
                    maze.setCell(child);
                    // adiciono o filho ao final da fila       
                    toBeVisited.push(child);
                    // imprimo o labirinto
                    maze.print();
                }
            }
        }
        return 'NOT FOUND';
    }
}

/**
 * Tests
 */
const maze = new Maze(6, 5);
maze.matrix = [
    ['  ', 'XX', '  ', 'XX', '  '],
    ['XX', '  ', '04', '10', 'XX'],
    ['  ', 'XX', '01', '  ', '  '],
    ['  ', '03', 'SP', 'XX', 'XX'],
    ['  ', '  ', '02', '  ', '  '],
    ['FP', '  ', 'XX', '  ', 'XX']
];
QUnit.module("Maze Class Tests");
QUnit.test("movingUpIsOK", function (assert) {
    assert.deepEqual(maze.movingUpIsOK(new Pos(3, 1)), false);
    assert.deepEqual(maze.movingUpIsOK(new Pos(0, 2)), false);
    assert.deepEqual(maze.movingUpIsOK(new Pos(2, 3)), false);
    assert.deepEqual(maze.movingUpIsOK(new Pos(1, 2)), true);
});

QUnit.test("movingRightIsOK", function (assert) {
    assert.deepEqual(maze.movingRightIsOK(new Pos(3, 2)), false);
    assert.deepEqual(maze.movingRightIsOK(new Pos(2, 4)), false);
    assert.deepEqual(maze.movingRightIsOK(new Pos(4, 1)), false);
    assert.deepEqual(maze.movingRightIsOK(new Pos(2, 2)), true);
});

QUnit.test("movingBellowIsOK", function (assert) {
    assert.deepEqual(maze.movingBellowIsOK(new Pos(5, 1)), false);
    assert.deepEqual(maze.movingBellowIsOK(new Pos(2, 3)), false);
    assert.deepEqual(maze.movingBellowIsOK(new Pos(3, 2)), false);
    assert.deepEqual(maze.movingBellowIsOK(new Pos(1, 3)), true);
});

QUnit.test("movingLeftIsOK", function (assert) {
    assert.deepEqual(maze.movingLeftIsOK(new Pos(2, 0)), false);
    assert.deepEqual(maze.movingLeftIsOK(new Pos(3, 2)), false);
    assert.deepEqual(maze.movingLeftIsOK(new Pos(2, 2)), false);
    assert.deepEqual(maze.movingLeftIsOK(new Pos(1, 2)), true);
});

QUnit.test("nextPositions", function (assert) {
    assert.deepEqual(maze.nextPositions(new Pos(3, 2)), []);
    assert.deepEqual(maze.nextPositions(new Pos(1, 1)), []);
    assert.deepEqual(maze.nextPositions(new Pos(2, 3)), [new Pos(2, 4, new Pos(2, 3))]);
    assert.deepEqual(maze.nextPositions(new Pos(3, 0)),
        [new Pos(2, 0, new Pos(3, 0)), new Pos(4, 0, new Pos(3, 0))]);
    assert.deepEqual(maze.nextPositions(new Pos(4, 1)),
        [new Pos(5, 1, new Pos(4, 1)), new Pos(4, 0, new Pos(4, 1))]);
});

QUnit.module("BFS Class Tests");
QUnit.test("solve", function (assert) {
    const maze = new Maze(6, 5);
    maze.matrix = [
        ['  ', 'XX', '  ', 'XX', '  '],
        ['XX', '  ', '  ', '  ', 'XX'],
        ['  ', 'XX', '  ', '  ', '  '],
        ['  ', '  ', '  ', 'XX', 'XX'],
        ['  ', '  ', '  ', '  ', '  '],
        ['  ', '  ', 'XX', '  ', 'XX']
    ];
    const start = new Pos(3, 2, null, 'SP');
    const finish = new Pos(5, 0, null, 'FP');

    // construction of the graph returned by the method
    const posSP = new Pos(3, 2, null, 'SP');
    const pos01 = new Pos(2, 2, posSP, '01');
    const pos02 = new Pos(4, 2, posSP, '02');
    const pos03 = new Pos(3, 1, posSP, '03');
    const pos04 = new Pos(1, 2, pos01, '04');
    const pos05 = new Pos(2, 3, pos01, '05');
    const pos06 = new Pos(4, 3, pos02, '06');
    const pos07 = new Pos(4, 1, pos02, '07');
    const pos08 = new Pos(3, 0, pos03, '08');
    const pos09 = new Pos(0, 2, pos04, '09');
    const pos10 = new Pos(1, 3, pos04, '10');
    const pos11 = new Pos(1, 1, pos04, '11');
    const pos12 = new Pos(2, 4, pos05, '12');
    const pos13 = new Pos(4, 4, pos06, '13');
    const pos14 = new Pos(5, 3, pos06, '14');
    const pos15 = new Pos(5, 1, pos07, '15');
    const pos16 = new Pos(4, 0, pos07, '16');
    const pos17 = new Pos(2, 0, pos08, '17');
    const posFP = new Pos(5, 0, pos15, 'FP');
    posSP.children = [pos01, pos02, pos03];
    pos01.children = [pos04, pos05];
    pos02.children = [pos06, pos07];
    pos03.children = [pos08];
    pos04.children = [pos09, pos10, pos11];
    pos05.children = [pos12];
    pos06.children = [pos13, pos14];
    pos07.children = [pos15, pos16];
    pos08.children = [pos17];
    pos15.children = [posFP];
    // method call
    console.log('BFS ALGORITHM');
    assert.deepEqual(BFS.solve(maze, start, finish), posSP);
});

QUnit.module("DFS Class Tests");
QUnit.test("solve", function (assert) {
    const maze = new Maze(6, 5);
    maze.matrix = [
        ['  ', 'XX', '  ', 'XX', '  '],
        ['XX', '  ', '  ', '  ', 'XX'],
        ['  ', 'XX', '  ', '  ', '  '],
        ['  ', '  ', '  ', 'XX', 'XX'],
        ['  ', '  ', '  ', '  ', '  '],
        ['  ', '  ', 'XX', '  ', 'XX']
    ];
    const start = new Pos(3, 2, null, 'SP');
    const finish = new Pos(5, 0, null, 'FP');

    // construction of the graph returned by the method
    const posSP = new Pos(3, 2, null, 'SP');
    const pos01 = new Pos(2, 2, posSP, '01');
    const pos02 = new Pos(4, 2, posSP, '02');
    const pos03 = new Pos(3, 1, posSP, '03');
    const pos04 = new Pos(1, 2, pos01, '04');
    const pos05 = new Pos(2, 3, pos01, '05');
    const pos06 = new Pos(0, 2, pos04, '06');
    const pos07 = new Pos(1, 3, pos04, '07');
    const pos08 = new Pos(1, 1, pos04, '08');
    const pos09 = new Pos(2, 4, pos05, '09');
    const pos10 = new Pos(4, 3, pos02, '10');
    const pos11 = new Pos(4, 1, pos02, '11');
    const pos12 = new Pos(4, 4, pos10, '12');
    const pos13 = new Pos(5, 3, pos10, '13');
    const pos14 = new Pos(5, 1, pos11, '14');
    const pos15 = new Pos(4, 0, pos11, '15');
    const posFP = new Pos(5, 0, pos14, 'FP');
    posSP.children = [pos01, pos02, pos03];
    pos01.children = [pos04, pos05];
    pos02.children = [pos10, pos11];
    pos04.children = [pos06, pos07, pos08];
    pos05.children = [pos09];
    pos10.children = [pos12, pos13];
    pos11.children = [pos14, pos15];
    pos14.children = [posFP];
    // method call
    console.log('DFS ALGORITHM');
    assert.deepEqual(DFS.solve(maze, start, finish), posSP);
});