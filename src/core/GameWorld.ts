import { Entity } from './Entity';
import { Vector2D } from './Vector2D';

/**
 * Game state enumeration
 */
export enum GameState {
  READY = 'READY',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
}

/**
 * Configuration for the game world
 */
export interface GameConfig {
  worldWidth: number;
  worldHeight: number;
  initialAsteroidCount?: number;
}

/**
 * The core game world that manages all entities and game state.
 * This class knows nothing about Phaser and can be tested in isolation.
 */
export class GameWorld {
  private entities: Map<string, Entity>;
  private entityIdCounter: number;
  private config: GameConfig;
  private currentState: GameState;
  private currentScore: number;
  private currentLevel: number;
  private mousePosition: Vector2D | null;

  constructor(config: GameConfig) {
    this.config = config;
    this.entities = new Map();
    this.entityIdCounter = 0;
    this.currentState = GameState.READY;
    this.currentScore = 0;
    this.currentLevel = 1;
    this.mousePosition = null;
  }

  /**
   * Get the current game state
   */
  get state(): GameState {
    return this.currentState;
  }

  /**
   * Get the current score
   */
  get score(): number {
    return this.currentScore;
  }

  /**
   * Get the current level
   */
  get level(): number {
    return this.currentLevel;
  }

  /**
   * Get world dimensions
   */
  get worldWidth(): number {
    return this.config.worldWidth;
  }

  get worldHeight(): number {
    return this.config.worldHeight;
  }

  /**
   * Add an entity to the world
   */
  addEntity(entity: Entity): void {
    this.entities.set(entity.id, entity);
  }

  /**
   * Remove an entity from the world
   */
  removeEntity(entityId: string): void {
    this.entities.delete(entityId);
  }

  /**
   * Get an entity by ID
   */
  getEntity(entityId: string): Entity | undefined {
    return this.entities.get(entityId);
  }

  /**
   * Get all entities of a specific type
   */
  getEntitiesByType<T extends Entity>(filterFn: (entity: Entity) => entity is T): T[] {
    const result: T[] = [];
    for (const entity of this.entities.values()) {
      if (filterFn(entity)) {
        result.push(entity);
      }
    }
    return result;
  }

  /**
   * Get all active entities
   */
  getAllEntities(): Entity[] {
    return Array.from(this.entities.values());
  }

  /**
   * Get count of entities
   */
  getEntityCount(): number {
    return this.entities.size;
  }

  /**
   * Generate a unique entity ID
   */
  generateEntityId(prefix: string = 'entity'): string {
    return `${prefix}_${this.entityIdCounter++}`;
  }

  /**
   * Set the mouse position for ship rotation
   */
  setMousePosition(position: Vector2D | null): void {
    this.mousePosition = position;
  }

  /**
   * Update all entities and handle game logic
   * @param deltaTime Time since last frame in seconds
   */
  update(deltaTime: number): void {
    if (this.currentState !== GameState.PLAYING) {
      return;
    }

    // Update all entities
    for (const entity of this.entities.values()) {
      if (entity.active) {
        // Pass mouse position to ship for rotation
        if (entity.getType() === 'SHIP') {
          (entity as any).update(deltaTime, this.mousePosition);
        } else {
          entity.update(deltaTime);
        }
      }
    }

    // Remove inactive entities
    this.removeInactiveEntities();

    // Handle collisions
    this.handleCollisions();
  }

  /**
   * Remove inactive entities from the world
   */
  private removeInactiveEntities(): void {
    const toRemove: string[] = [];
    for (const [id, entity] of this.entities.entries()) {
      if (!entity.active) {
        toRemove.push(id);
      }
    }
    for (const id of toRemove) {
      this.entities.delete(id);
    }
  }

  /**
   * Handle collisions between entities
   * Subclasses or external collision managers should override/use this
   */
  protected handleCollisions(): void {
    // Placeholder - meant to be called by external CollisionManager
  }

  /**
   * Set a custom collision handler
   */
  setCollisionHandler(handler: () => void): void {
    this.handleCollisions = handler;
  }

  /**
   * Start the game
   */
  startGame(): void {
    this.currentState = GameState.PLAYING;
    this.currentScore = 0;
    this.currentLevel = 1;
  }

  /**
   * Pause the game
   */
  pauseGame(): void {
    if (this.currentState === GameState.PLAYING) {
      this.currentState = GameState.PAUSED;
    }
  }

  /**
   * Resume the game
   */
  resumeGame(): void {
    if (this.currentState === GameState.PAUSED) {
      this.currentState = GameState.PLAYING;
    }
  }

  /**
   * End the game
   */
  gameOver(): void {
    this.currentState = GameState.GAME_OVER;
  }

  /**
   * Add points to the score
   */
  addScore(points: number): void {
    this.currentScore += points;
  }

  /**
   * Advance to next level
   */
  nextLevel(): void {
    this.currentLevel++;
  }

  /**
   * Reset the game world
   */
  reset(): void {
    this.entities.clear();
    this.entityIdCounter = 0;
    this.currentState = GameState.READY;
    this.currentScore = 0;
    this.currentLevel = 1;
  }

  /**
   * Get the center of the world
   */
  getWorldCenter(): Vector2D {
    return new Vector2D(this.config.worldWidth / 2, this.config.worldHeight / 2);
  }
}
