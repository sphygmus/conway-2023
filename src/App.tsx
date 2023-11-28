import React, { useEffect, useRef } from "react";
import "./App.css";

type Grid = boolean[][];

class Game {
	static count = 0;
	instanceID;
	cellSize;
	grid;
	width;
	height;
	ctx;

	timeStamp;
	playing;
	elapsed;

	constructor(canvas: HTMLCanvasElement, cellSize = 2) {
		this.instanceID = ++Game.count;

		this.grid = [] as Grid;
		this.cellSize = cellSize;
		this.width = Math.floor(canvas.width / cellSize);
		this.height = Math.floor(canvas.height / cellSize);
		this.ctx = canvas.getContext("2d");
		this.ctx!.fillStyle = "#333";
		
		this.timeStamp = 0;
		this.elapsed = 0;
		this.playing = false;

		this.resetGrid(true);
	}

	changeGameState(playing: boolean) {
		this.playing = playing;
		if (playing === true)
			this.handleLogic(this.timeStamp);
	}

	resetGrid(init = false) {
		if (!init)
			this.grid = [];

		for (let y = 0; y < this.height; y++)
			this.grid.push(Array.from(Array(this.width), () => Math.random() > 0.5));
	}

	calculateSize(width: number, height: number) {
		this.width = Math.floor(width / this.cellSize);
		this.height = Math.floor(height / this.cellSize);
	}

	handleLogic(timeStamp = 0) {
		const deltaTime = timeStamp - this.timeStamp;
		this.timeStamp = timeStamp;
		this.elapsed += deltaTime;

		if (this.elapsed > 50) {
			const oldGrid = structuredClone(this.grid);
	
			for (let y = 0; y < this.height; y++) {
				for (let x = 0; x < this.width; x++) {
					let neighbors = 0;
					for (let dy = -1; dy <= 1; dy++) {
						for (let dx = -1; dx <= 1; dx++) {
							let nx = (x + dx);
							let ny = (y + dy);
	
							if (!(dx === 0 && dy === 0) && nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
								neighbors += oldGrid[ny][nx] ? 1 : 0;
							}
						}
					}
	
					if (neighbors < 2 || neighbors > 3)
						this.grid[y][x] = false;
					else if (oldGrid[y][x] === false && neighbors === 3)
						this.grid[y][x] = true;
				}
			}
	
			this.render();
			this.elapsed = 0;
		}

		if (this.playing)
			requestAnimationFrame(this.handleLogic.bind(this));
	}

	render() {
		if (this.ctx !== null) {
			this.ctx.beginPath();
			this.ctx.fillStyle = "#333";
			for (let y = 0; y < this.height; y++) {
				for (let x = 0; x < this.width; x++) {
					if (this.grid[y][x])
						this.ctx.rect(x * (this.cellSize), y * (this.cellSize), this.cellSize, this.cellSize);
				}
			}

			this.clearCanvas();
			this.ctx.fill();
		}
	}

	clearCanvas() {
		this.ctx!.clearRect(0, 0, this.width * (this.cellSize + 1), this.height * (this.cellSize + 1));
	}
}

function App() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	let game: Game | undefined;

	useEffect(() => {
		const resizeWindow = () => {
			canvasRef.current!.width = window.innerWidth - canvasRef.current!.offsetLeft;
			canvasRef.current!.height = window.innerHeight;
			game?.calculateSize(canvasRef.current!.width, canvasRef.current!.height);
		}

		window.addEventListener("resize", resizeWindow);
		resizeWindow();

		if (!game)
			game = new Game(canvasRef.current!);
	}, []);

	return (
		<div id="app">
			<div id="sidebar">
				<button onClick={() => { game?.changeGameState(!game?.playing) }}>play / pause</button>
				<button onClick={() => game?.resetGrid()}>randomize</button>
			</div>
			<canvas ref={canvasRef} id="game-window"></canvas>
		</div>
	);
}

export default App;
