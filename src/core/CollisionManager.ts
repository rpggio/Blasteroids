import { Entity } from './Entity';
import { Ship } from '../entities/Ship';
import { Bullet } from '../entities/Bullet';
import { Asteroid } from '../entities/Asteroid';
import { GameWorld } from './GameWorld';
import { AsteroidSpawner } from './AsteroidSpawner';

/**
 * Event handler type for collision events
 */
export type CollisionHandler = (entity1: Entity, entity2: Entity) => void;

/**
 * Manages collision detection and response for all entities
 */
export class CollisionManager {
  private gameWorld: GameWorld;
  private asteroidSpawner: AsteroidSpawner;
  private onShipDestroyed?: () => void;
  private onAsteroidDestroyed?: (asteroid: Asteroid) => void;

  constructor(
    gameWorld: GameWorld,
    asteroidSpawner: AsteroidSpawner,
    handlers: {
      onShipDestroyed?: () => void;
      onAsteroidDestroyed?: (asteroid: Asteroid) => void;
    } = {}
  ) {
    this.gameWorld = gameWorld;
    this.asteroidSpawner = asteroidSpawner;
    this.onShipDestroyed = handlers.onShipDestroyed;
    this.onAsteroidDestroyed = handlers.onAsteroidDestroyed;
  }

  /**
   * Check and handle all collisions in the game world
   */
  checkCollisions(): void {
    const entities = this.gameWorld.getAllEntities();

    // Get specific entity types
    const ships = entities.filter((e): e is Ship => e instanceof Ship && e.active);
    const bullets = entities.filter((e): e is Bullet => e instanceof Bullet && e.active);
    const asteroids = entities.filter((e): e is Asteroid => e instanceof Asteroid && e.active);

    // Check bullet-asteroid collisions
    for (const bullet of bullets) {
      for (const asteroid of asteroids) {
        if (bullet.collidesWith(asteroid)) {
          this.handleBulletAsteroidCollision(bullet, asteroid);
        }
      }
    }

    // Check ship-asteroid collisions
    for (const ship of ships) {
      for (const asteroid of asteroids) {
        if (ship.collidesWith(asteroid)) {
          this.handleShipAsteroidCollision(ship, asteroid);
        }
      }
    }
  }

  /**
   * Handle collision between bullet and asteroid
   */
  private handleBulletAsteroidCollision(bullet: Bullet, asteroid: Asteroid): void {
    // Destroy bullet
    bullet.destroy();

    // Award points
    this.gameWorld.addScore(asteroid.getPoints());

    // Split or destroy asteroid
    if (asteroid.canSplit()) {
      this.asteroidSpawner.splitAsteroid(asteroid);
    }

    // Destroy asteroid
    asteroid.destroy();

    // Trigger event
    if (this.onAsteroidDestroyed) {
      this.onAsteroidDestroyed(asteroid);
    }
  }

  /**
   * Handle collision between ship and asteroid
   */
  private handleShipAsteroidCollision(ship: Ship, asteroid: Asteroid): void {
    // Destroy ship
    ship.destroy();

    // Trigger event
    if (this.onShipDestroyed) {
      this.onShipDestroyed();
    }
  }

  /**
   * Get count of active asteroids
   */
  getAsteroidCount(): number {
    return this.gameWorld
      .getAllEntities()
      .filter((e): e is Asteroid => e instanceof Asteroid && e.active).length;
  }

  /**
   * Check if level is complete (no asteroids remaining)
   */
  isLevelComplete(): boolean {
    return this.getAsteroidCount() === 0;
  }
}
