import React, { useEffect, useRef, useState } from "react";
import "./App.css";

type Grid = boolean[][];

class Game {
	static count = 0;
	instanceID;

	cellSize;
	grid;
	width;
	height;

	canvas;
	ctx;

	playing;
	timeStamp;
	elapsed;
	frameTime;

	gradient;

	constructor(canvas: HTMLCanvasElement, cellSize = 2) {
		this.instanceID = ++Game.count;

		this.cellSize = cellSize;
		this.grid = [] as Grid;
		this.width = Math.floor(canvas.width / cellSize);
		this.height = Math.floor(canvas.height / cellSize);

		this.canvas = canvas;
		this.ctx = this.canvas.getContext("2d");
		this.ctx!.fillStyle = "#333";

		this.playing = false;
		this.timeStamp = 0;
		this.elapsed = 0;
		this.frameTime = 50;

		this.gradient = false;

		this.resetGrid(true);
	}

	changeGameState(playing: boolean) {
		this.playing = playing;
		if (playing === true)
			this.handleLogic(this.timeStamp);
	}

	changeFrameTime(time: number) {
		this.frameTime = time;
	}

	changeGridSize(size: number) {
		this.cellSize = size;
		this.calculateSize(this.canvas.width, this.canvas.height);
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
		this.resetGrid();
	}

	handleLogic(timeStamp = 0) {
		const deltaTime = timeStamp - this.timeStamp;
		this.timeStamp = timeStamp;
		this.elapsed += deltaTime;

		if (this.elapsed > this.frameTime) {
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

			if (this.gradient) {
				const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
				gradient.addColorStop(0, "#ff0000");
				gradient.addColorStop(0.5, "#00ff00");
				gradient.addColorStop(1, "#0000ff");
				this.ctx.fillStyle = gradient;
			} else {
				this.ctx.fillStyle = "#333";
			}

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
		this.ctx!.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
}

function App() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const gameRef = useRef<Game>();

	const [playing, setPlaying] = useState(false);
	const [gradient, setGradient] = useState(false);
	const [gameSpeed, setGameSpeed] = useState(50);
	const [gridSize, setGridSize] = useState(2);

	useEffect(() => {
		const resizeWindow = () => {
			if (canvasRef.current && gameRef.current) {
				canvasRef.current.width = window.innerWidth;
				canvasRef.current.height = window.innerHeight - canvasRef.current.offsetTop;
				gameRef.current.calculateSize(canvasRef.current.width, canvasRef.current.height);
			}
		}

		window.addEventListener("resize", resizeWindow);
		setTimeout(resizeWindow, 500);

		if (!gameRef.current)
			gameRef.current = new Game(canvasRef.current!);
	}, []);

	const GameSpeedButton: React.FC<{ speed: number }> = ({ speed }) => (
		<button className={speed === gameSpeed ? "btn-toggled" : undefined} onClick={() => {
			gameRef.current?.changeFrameTime(speed);
			setGameSpeed(speed);
		}}>{speed}ms</button>
	)

	const GridSizeButton: React.FC<{ size: number }> = ({ size }) => (
		<button className={size === gridSize ? "btn-toggled" : undefined} onClick={() => {
			gameRef.current?.changeGridSize(size);
			setGridSize(size);
		}}>{size}px</button>
	)

	return (
		<div id="app">
			<div id="sidebar">
				<div className="header-section">
					<h4>conwei</h4>
					<button className={playing ? "btn-toggled" : undefined} onClick={() => {
						setPlaying(prev => {
							gameRef.current?.changeGameState(!prev);
							return !prev;
						})
					}}>{playing ? "pause" : "play"}</button>
					<button onClick={() => gameRef.current?.resetGrid()}>randomize</button>
					<button className={gradient ? "btn-toggled" : undefined} onClick={() => {
						setGradient(prev => {
							if (gameRef.current)
								gameRef.current.gradient = !prev;
							return !prev;
						})
					}}><span className={gradient ? "gradient" : undefined}>gradientify</span></button>
				</div>

				<div className="header-section">
					<span className="header-text">speeds:</span>
					<GameSpeedButton speed={10} />
					<GameSpeedButton speed={25} />
					<GameSpeedButton speed={50} />
					<GameSpeedButton speed={100} />
					<GameSpeedButton speed={250} />
					<GameSpeedButton speed={500} />
				</div>

				<div className="header-section">
					<span className="header-text">cell size:</span>
					<GridSizeButton size={1} />
					<GridSizeButton size={2} />
					<GridSizeButton size={5} />
					<GridSizeButton size={10} />
					<GridSizeButton size={25} />
					<GridSizeButton size={50} />
				</div>
			</div>
			<canvas ref={canvasRef} id="game-window"></canvas>
		</div>
	);
}

export default App;
