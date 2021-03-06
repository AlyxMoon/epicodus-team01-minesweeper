export class GameBoard {
  constructor (rowNum, colNum, bombNum) {
    this.rowNum = rowNum;
    this.colNum = colNum;
    this.bombNum = bombNum;
    this.flagPlanted = 0;
    this.initialize();
  }

  initialize () {
    this.board = [];
    this.numOfNonBombCells = this.rowNum * this.colNum - this.bombNum;
    this.numofOpenCells = 0;
    this.flagPlanted = 0;
    this.generateBoard();

    this.state = 'playing';
  }

  // tested
  generateBoard () {
    // this will create a board with dimension rowNum by colNum of default cells
    for (let r = 0; r < this.rowNum + 2; r++) {
      const temp = [];
      this.board.push(temp);
      for (let c = 0; c < this.colNum + 2; c++) {
        this.board[r].push(new Cell());
      }
    }

    // this will place bombs at random locations
    for (let i = 1; i <= this.bombNum; i++) {
      const row = 1 + Math.floor(Math.random() * this.rowNum);
      const col = 1 + Math.floor(Math.random() * this.colNum);
      if (this.board[row][col].isBomb === true) {
        i--;
      } else {
        this.board[row][col].isBomb = true;
      }
    }

    this.bombDetector();
  }

  // tested
  getNeighbors (r, c) {
    const neighbors = [];

    const isCellOnBorder = (row, col) => {
      return (
        row < 1 ||
        col < 1 ||
        row > this.rowNum ||
        col > this.colNum
      );
    };

    const isCurrentCell = (row, col) => {
      return row === r && col === c;
    };

    for (let row = r - 1; row <= r + 1; row++) {
      for (let col = c - 1; col <= c + 1; col++) {
        if (isCurrentCell(row, col) || isCellOnBorder(row, col)) {
          continue;
        }

        neighbors.push([this.board[row][col], row, col]);
      }
    }

    return neighbors;
  }

  // tested
  bombDetector () {
    for (let r = 1; r <= this.rowNum; r++) {
      for (let c = 1; c <= this.colNum; c++) {
        if (this.board[r][c].isBomb === false) continue;

        this.getNeighbors(r, c).forEach(neighbor => {
          neighbor[0].adjacentBombs++;
        });
      }
    }
  }

  // tested
  clearing (r, c) {
    const neighborCells = this.getNeighbors(r, c);

    neighborCells.forEach((element) => { // [c,c,c,c,c]
      if (element[0].isVisible === false) {
        element[0].isVisible = true;
        this.numOfNonBombCells--;
        element[0].hasQuestionMark = false;

        this.numofOpenCells++;
        if (element[0].adjacentBombs === 0) {
          this.clearing(element[1], element[2]);
        }
      }
    });
  }

  checkCell (r, c) {
    if (this.board[r][c].isVisible === false && this.board[r][c].hasFlag === false) {
      this.board[r][c].isVisible = true;
      if (this.checkLoseGame(r, c) === true) {
        return;
      }

      this.numofOpenCells++;
      this.numOfNonBombCells--;

      if (this.board[r][c].adjacentBombs === 0) {
        this.clearing(r, c);
      }

      this.checkWinGame();
    }
  }

  markCell (r, c) {
    if (this.board[r][c].isVisible === false) {
      if (this.board[r][c].hasFlag === true) {
        console.log('flag working?');
        this.board[r][c].hasFlag = false;
        this.board[r][c].hasQuestionMark = true;
        this.flagPlanted--;
      } else if (this.board[r][c].hasQuestionMark === true) {
        this.board[r][c].hasQuestionMark = false;
        console.log('questionmark working?');
      } else {
        this.board[r][c].hasFlag = true;
        this.flagPlanted++;
        console.log(this.flagPlanted);
      }
    }
  }

  checkWinGame () {
    if (this.numOfNonBombCells === 0) {
      this.state = 'won';
    }
  }

  checkLoseGame (r, c) {
    if (this.board[r][c].isBomb === true) {
      this.state = 'lose';
      return true;
    }
  }
}

export class Cell {
  constructor () {
    this.isBomb = false;
    this.hasFlag = false;
    this.hasQuestionMark = false;
    this.adjacentBombs = 0;
    this.isVisible = false;
  }
}
