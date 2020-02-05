'use strict'

function Square  (props){

	  return (
		<button className="square"
		onClick={() => {props.onClick()}}
		>
			{props.value}
		</button>
	  );
  }
  
  class Board extends React.Component {

	renderSquare(i) {
	  return (
	  <Square 
	  value={this.props.squares[i]}
	  onClick={() => {this.props.onClick(i)}}
	  />
	  )
	}
	
	render() {
	function getIndex(r,c) {            
		return c + 3*(r%3);
	}
	  return (
		 
          
		<div>            
			{[...Array(3)].map((x, i) =>
			<div className="board-row" key={"row_" + i}>
				{[...Array(3)].map((y, j) =>
				<span 
					key={"row_" + i + "_col_" + j}>
					{this.renderSquare(getIndex(i,j))}
				</span>
				)}
			</div>
			)}
		</div>
	  );
	}
  }
  
  class Game extends React.Component {

	constructor(props){
		super(props)
		this.state = {
			history: [{
				squares: Array(9).fill(null)
			}],
			xIsNext:true,
			stepNumber: 0
		}
	}


	handleClick(i){
		const history = this.state.history.slice(0, this.state.stepNumber+1)
		const current = history[history.length-1]
		const squares =current.squares.slice()

		if (calculateWinner(squares) || squares[i])
			return 

		squares[i] = this.state.xIsNext? 'X':'O'
		this.setState({
			history: history.concat([{squares:squares}]),
			xIsNext: !this.props.xIsNext,
			stepNumber: history.length,
			xIsNext: !this.state.xIsNext
		})
	}

	jumpTo(step){
		this.setState({
			stepNumber: step,
			xIsNext: (step%2)===0
		})
	}


	render() {
		const history = this.state.history
		const current = history[this.state.stepNumber]
		const winner = calculateWinner(current.squares)

		const moves = history.map((step, move) => {
			const desc = move?
			'Go to move #'+move:
			'Go to game start'

			return (
				<li key={move}>
					<button onClick={() => this.jumpTo(move)}>{desc}</button>
				</li>
			)
		})



		let status

		if (winner){
			status = 'Winner: '+winner
		}
		else{
			status = 'Next player: ' + (this.state.xIsNext ? 'X':'O' )
		}



	  	return (
		<div className="game">
		  <div className="game-board">
			<Board squares={current.squares}
			onClick={i => this.handleClick(i)} />
		  </div>
		  <div className="game-info">
			<div>{status}</div>
			<ol>{moves}</ol>
		  </div>
		</div>
	  );
	}
  }
  
  function calculateWinner(squares) {
	const lines = [
	  [0, 1, 2],
	  [3, 4, 5],
	  [6, 7, 8],
	  [0, 3, 6],
	  [1, 4, 7],
	  [2, 5, 8],
	  [0, 4, 8],
	  [2, 4, 6],
	];
	for (let i = 0; i < lines.length; i++) {
	  const [a, b, c] = lines[i];
	  if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
		return squares[a];
	  }
	}
	return null;
  }
  // ========================================
  
  ReactDOM.render(
	<Game />,
	document.getElementById('root')
  );
  
