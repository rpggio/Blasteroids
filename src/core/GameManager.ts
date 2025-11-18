import { GameWorld, GameState } from './GameWorld';
import { Ship } from '../entities/Ship';
import { ShipController } from './ShipController';
import { AsteroidSpawner } from './AsteroidSpawner';
import { CollisionManager } from './CollisionManager';
import { Vector2D } from './Vector2D';
import { Bullet } from '../entities/Bullet';

/**
 * Configuration for the game manager
 */
export interface GameManagerConfig {
  worldWidth?: number;
  worldHeight?: number;
  shipConfig?: any;
  shipControllerConfig?: any;
  asteroidSpawnerConfig?: any;
}

/**
 * Main game manager that orchestrates all game systems.
 * This is the primary interface between the game logic and presentation layers.
 */
export class GameManager {
  private world: GameWorld;
  private ship: Ship | null;
  private shipController: ShipController | null;
  private asteroidSpawner: AsteroidSpawner;
  private collisionManager: CollisionManager;
  private lives: number;
  private maxLives: number;

  constructor(config: GameManagerConfig = {}) {
    const worldWidth = config.worldWidth ?? 800;
    const worldHeight = config.worldHeight ?? 600;

    this.world = new GameWorld({ worldWidth, worldHeight });
    this.ship = null;
    this.shipController = null;
    this.asteroidSpawner = new AsteroidSpawner(
      this.world,
      config.asteroidSpawnerConfig
    );
    this.collisionManager = new CollisionManager(
      this.world,
      this.asteroidSpawner,
      {
        onShipDestroyed: () => this.handleShipDestroyed(),
      }
    );

    this.lives = 3;
    this.maxLives = 3;

    // Set collision handler in world
    this.world.setCollisionHandler(() => this.collisionManager.checkCollisions());
  }

  /**
   * Get the game world
   */
  getWorld(): GameWorld {
    return this.world;
  }

  /**
   * Get the player ship
   */
  getShip(): Ship | null {
    return this.ship;
  }

  /**
   * Get the ship controller
   */
  getShipController(): ShipController | null {
    return this.shipController;
  }

  /**
   * Get current lives
   */
  getLives(): number {
    return this.lives;
  }

  /**
   * Get collision manager
   */
  getCollisionManager(): CollisionManager {
    return this.collisionManager;
  }

  /**
   * Start a new game
   */
  startNewGame(): void {
    this.world.reset();
    this.lives = this.maxLives;
    this.world.startGame();
    this.startLevel(1);
  }

  /**
   * Start a specific level
   */
  private startLevel(level: number): void {
    // Clear existing entities
    this.ship = null;
    this.shipController = null;

    // Create ship at center
    const shipPosition = this.world.getWorldCenter();
    this.ship = new Ship(this.world.generateEntityId('ship'), shipPosition);
    this.world.addEntity(this.ship);

    // Create ship controller
    this.shipController = new ShipController(this.ship, this.world);

    // Spawn asteroids for this level
    this.asteroidSpawner.spawnLevelAsteroids(level, shipPosition);
  }

  /**
   * Restart current level
   */
  restartLevel(): void {
    const currentLevel = this.world.level;

    // Clear all entities
    const allEntities = this.world.getAllEntities();
    allEntities.forEach(entity => entity.destroy());

    // Start the same level
    this.startLevel(currentLevel);
  }

  /**
   * Handle ship destruction
   */
  private handleShipDestroyed(): void {
    this.lives--;

    if (this.lives <= 0) {
      this.world.gameOver();
    }
  }

  /**
   * Check if level is complete and advance if so
   */
  private checkLevelComplete(): void {
    if (this.collisionManager.isLevelComplete() && this.world.state === GameState.PLAYING) {
      this.advanceLevel();
    }
  }

  /**
   * Advance to the next level
   */
  private advanceLevel(): void {
    this.world.nextLevel();
    this.startLevel(this.world.level);
  }

  /**
   * Update the game state
   */
  update(deltaTime: number): void {
    // Update world (which updates all entities and handles collisions)
    this.world.update(deltaTime);

    // Update ship controller
    if (this.shipController && this.world.state === GameState.PLAYING) {
      this.shipController.update(deltaTime);
    }

    // Handle world wrapping for ship
    if (this.ship && this.ship.active) {
      this.ship.wrapAroundBounds(this.world.worldWidth, this.world.worldHeight);
    }

    // Handle world wrapping for asteroids
    const allEntities = this.world.getAllEntities();
    allEntities.forEach(entity => {
      if (entity.active && entity.getType() !== 'BULLET') {
        entity.wrapAroundBounds(this.world.worldWidth, this.world.worldHeight);
      }
    });

    // Remove bullets that are out of bounds
    allEntities.forEach(entity => {
      if (entity instanceof Bullet && entity.active) {
        if (entity.isOutOfBounds(this.world.worldWidth, this.world.worldHeight)) {
          entity.destroy();
        }
      }
    });

    // Check if level is complete (do this once per update, after all collision processing)
    this.checkLevelComplete();
  }

  /**
   * Handle mouse button down (for shooting and acceleration)
   */
  handleMouseDown(button: 'left' | 'right', worldPosition: Vector2D): void {
    if (!this.ship || !this.shipController || this.world.state !== GameState.PLAYING) {
      return;
    }

    if (button === 'left') {
      // Left click = fire
      this.shipController.fire();
    } else if (button === 'right') {
      // Right click = accelerate towards position
      this.ship.accelerateTowards(worldPosition);
    }
  }

  /**
   * Handle mouse button up
   */
  handleMouseUp(button: 'left' | 'right'): void {
    if (!this.ship || this.world.state !== GameState.PLAYING) {
      return;
    }

    if (button === 'right') {
      // Stop accelerating
      this.ship.stopAccelerating();
    }
  }

  /**
   * Pause the game
   */
  pause(): void {
    this.world.pauseGame();
  }

  /**
   * Resume the game
   */
  resume(): void {
    this.world.resumeGame();
  }

  /**
   * Check if game is over
   */
  isGameOver(): boolean {
    return this.world.state === GameState.GAME_OVER;
  }

  /**
   * Check if game is playing
   */
  isPlaying(): boolean {
    return this.world.state === GameState.PLAYING;
  }

  /**
   * Check if game is paused
   */
  isPaused(): boolean {
    return this.world.state === GameState.PAUSED;
  }

  /**
   * Get current score
   */
  getScore(): number {
    return this.world.score;
  }

  /**
   * Get current level
   */
  getLevel(): number {
    return this.world.level;
  }
}
