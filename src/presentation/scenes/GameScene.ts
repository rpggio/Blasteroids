import Phaser from 'phaser';
import { GameManager } from '../../core/GameManager';
import { Ship } from '../../entities/Ship';
import { Asteroid } from '../../entities/Asteroid';
import { Bullet } from '../../entities/Bullet';
import { Vector2D } from '../../core/Vector2D';
import { GameState } from '../../core/GameWorld';

/**
 * Main game scene - acts as a thin presentation layer over the game logic.
 * Follows the architectural pattern: Phaser reads from game state and updates visuals.
 */
export class GameScene extends Phaser.Scene {
  private gameManager!: GameManager;
  private graphics!: Phaser.GameObjects.Graphics;
  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private gameOverText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // Get viewport dimensions
    const viewportWidth = this.scale.width;
    const viewportHeight = this.scale.height;

    // Make world 5x larger than viewport
    const worldWidth = viewportWidth * 5;
    const worldHeight = viewportHeight * 5;

    // Initialize game manager
    this.gameManager = new GameManager({
      worldWidth,
      worldHeight,
    });

    // Set world bounds for camera
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

    // Create graphics object for drawing
    this.graphics = this.add.graphics();

    // Create UI text - fixed to camera
    this.scoreText = this.add.text(16, 16, 'SCORE: 0', {
      fontSize: '20px',
      color: '#ffffff',
    });
    this.scoreText.setScrollFactor(0);

    this.livesText = this.add.text(16, 46, 'LIVES: 3', {
      fontSize: '20px',
      color: '#ffffff',
    });
    this.livesText.setScrollFactor(0);

    this.levelText = this.add.text(16, 76, 'LEVEL: 1', {
      fontSize: '20px',
      color: '#ffffff',
    });
    this.levelText.setScrollFactor(0);

    // Set up mouse input
    this.input.on('pointerdown', this.handlePointerDown, this);
    this.input.on('pointerup', this.handlePointerUp, this);
    this.input.on('pointermove', this.handlePointerMove, this);

    // Prevent context menu on right-click
    this.input.mouse?.disableContextMenu();

    // Start new game
    this.gameManager.startNewGame();
  }

  update(_time: number, delta: number): void {
    const deltaSeconds = delta / 1000;

    // Update game logic
    this.gameManager.update(deltaSeconds);

    // Update camera to follow ship
    const ship = this.gameManager.getShip();
    if (ship && ship.active) {
      this.cameras.main.centerOn(ship.position.x, ship.position.y);
    }

    // Render everything
    this.render();

    // Update UI
    this.updateUI();

    // Check for game over
    if (this.gameManager.isGameOver() && !this.gameOverText) {
      this.showGameOver();
    }
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    // Convert screen position to world position
    const worldPosition = new Vector2D(pointer.worldX, pointer.worldY);

    if (pointer.leftButtonDown()) {
      this.gameManager.handleMouseDown('left', worldPosition);
    } else if (pointer.rightButtonDown()) {
      this.gameManager.handleMouseDown('right', worldPosition);
    }
  }

  private handlePointerUp(pointer: Phaser.Input.Pointer): void {
    if (pointer.button === 2) {
      // Right button
      this.gameManager.handleMouseUp('right');
    }
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer): void {
    // Update mouse position in world coordinates
    const worldPosition = new Vector2D(pointer.worldX, pointer.worldY);
    this.gameManager.updateMousePosition(worldPosition);
  }

  private render(): void {
    this.graphics.clear();

    const entities = this.gameManager.getWorld().getAllEntities();

    // Render all entities
    for (const entity of entities) {
      if (!entity.active) continue;

      if (entity instanceof Ship) {
        this.renderShip(entity);
      } else if (entity instanceof Asteroid) {
        this.renderAsteroid(entity);
      } else if (entity instanceof Bullet) {
        this.renderBullet(entity);
      }
    }
  }

  private renderShip(ship: Ship): void {
    const { x, y } = ship.position;
    const rotation = ship.rotation;

    this.graphics.lineStyle(2, 0x00ff00);

    // Ship is a triangle
    const points: Phaser.Math.Vector2[] = [
      new Phaser.Math.Vector2(15, 0),
      new Phaser.Math.Vector2(-10, -8),
      new Phaser.Math.Vector2(-10, 8),
    ];

    // Rotate and translate points
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const transformedPoints = points.map((p) => {
      return new Phaser.Math.Vector2(
        p.x * cos - p.y * sin + x,
        p.x * sin + p.y * cos + y
      );
    });

    // Draw ship
    this.graphics.beginPath();
    this.graphics.moveTo(transformedPoints[0].x, transformedPoints[0].y);
    for (let i = 1; i < transformedPoints.length; i++) {
      this.graphics.lineTo(transformedPoints[i].x, transformedPoints[i].y);
    }
    this.graphics.closePath();
    this.graphics.strokePath();

    // Draw thrust indicator if accelerating
    if (ship.isCurrentlyAccelerating()) {
      this.graphics.lineStyle(2, 0xff8800);
      const thrustPoints = [
        new Phaser.Math.Vector2(-10, -4),
        new Phaser.Math.Vector2(-16, 0),
        new Phaser.Math.Vector2(-10, 4),
      ];

      const transformedThrust = thrustPoints.map((p) => {
        return new Phaser.Math.Vector2(
          p.x * cos - p.y * sin + x,
          p.x * sin + p.y * cos + y
        );
      });

      this.graphics.beginPath();
      this.graphics.moveTo(transformedThrust[0].x, transformedThrust[0].y);
      for (let i = 1; i < transformedThrust.length; i++) {
        this.graphics.lineTo(transformedThrust[i].x, transformedThrust[i].y);
      }
      this.graphics.strokePath();
    }
  }

  private renderAsteroid(asteroid: Asteroid): void {
    const { x, y } = asteroid.position;
    const rotation = asteroid.rotation;
    const radius = asteroid.radius;

    this.graphics.lineStyle(2, 0xffffff);

    // Draw asteroid as irregular polygon
    const points = 8;
    const vertices: Phaser.Math.Vector2[] = [];

    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2 + rotation;
      // Add some randomness to radius (using position as seed for consistency)
      const r = radius + (Math.sin(x + y + i) * radius * 0.3);
      vertices.push(
        new Phaser.Math.Vector2(x + Math.cos(angle) * r, y + Math.sin(angle) * r)
      );
    }

    this.graphics.beginPath();
    this.graphics.moveTo(vertices[0].x, vertices[0].y);
    for (let i = 1; i < vertices.length; i++) {
      this.graphics.lineTo(vertices[i].x, vertices[i].y);
    }
    this.graphics.closePath();
    this.graphics.strokePath();
  }

  private renderBullet(bullet: Bullet): void {
    const { x, y } = bullet.position;

    this.graphics.fillStyle(0xffff00);
    this.graphics.fillCircle(x, y, bullet.radius);
  }

  private updateUI(): void {
    this.scoreText.setText(`SCORE: ${this.gameManager.getScore()}`);
    this.livesText.setText(`LIVES: ${this.gameManager.getLives()}`);
    this.levelText.setText(`LEVEL: ${this.gameManager.getLevel()}`);
  }

  private showGameOver(): void {
    // Get center of viewport
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    this.gameOverText = this.add.text(centerX, centerY, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setScrollFactor(0);

    const restartText = this.add.text(centerX, centerY + 70, 'Click to restart', {
      fontSize: '24px',
      color: '#ffffff',
    });
    restartText.setOrigin(0.5);
    restartText.setScrollFactor(0);

    this.input.once('pointerdown', () => {
      this.scene.restart();
    });
  }
}
