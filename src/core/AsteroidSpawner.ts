import { Asteroid, AsteroidSize } from '../entities/Asteroid';
import { Vector2D } from './Vector2D';
import { GameWorld } from './GameWorld';

/**
 * Configuration for asteroid spawner
 */
export interface AsteroidSpawnerConfig {
  minDistanceFromShip?: number;
  splitCount?: number; // How many asteroids to create when one splits
}

/**
 * Manages asteroid creation and splitting
 */
export class AsteroidSpawner {
  private gameWorld: GameWorld;
  private config: AsteroidSpawnerConfig;

  constructor(gameWorld: GameWorld, config: AsteroidSpawnerConfig = {}) {
    this.gameWorld = gameWorld;
    this.config = {
      minDistanceFromShip: config.minDistanceFromShip ?? 150,
      splitCount: config.splitCount ?? 2,
    };
  }

  /**
   * Spawn a single asteroid with random position - asteroids are now fixed
   */
  spawnAsteroid(size: AsteroidSize, avoidPosition?: Vector2D): Asteroid {
    const position = this.getRandomPosition(avoidPosition);
    const velocity = Vector2D.ZERO; // Asteroids are now fixed

    const id = this.gameWorld.generateEntityId('asteroid');
    const asteroid = new Asteroid(id, position, velocity, size, { rotationSpeed: 0 });

    this.gameWorld.addEntity(asteroid);
    return asteroid;
  }

  /**
   * Spawn multiple asteroids
   */
  spawnMultipleAsteroids(count: number, size: AsteroidSize, avoidPosition?: Vector2D): Asteroid[] {
    const asteroids: Asteroid[] = [];
    for (let i = 0; i < count; i++) {
      asteroids.push(this.spawnAsteroid(size, avoidPosition));
    }
    return asteroids;
  }

  /**
   * Split an asteroid into smaller asteroids
   * @returns Array of new smaller asteroids, or empty array if asteroid can't split
   */
  splitAsteroid(asteroid: Asteroid): Asteroid[] {
    if (!asteroid.canSplit()) {
      return [];
    }

    const smallerSize = asteroid.getSmallerSize();
    if (!smallerSize) {
      return [];
    }

    const newAsteroids: Asteroid[] = [];

    for (let i = 0; i < this.config.splitCount!; i++) {
      // Create position offset from original asteroid
      const angle = (Math.PI * 2 * i) / this.config.splitCount! + Math.random() * 0.5;
      const offsetDistance = Asteroid.getRadiusForSize(asteroid.getSize()) * 0.5;
      const offset = Vector2D.fromAngle(angle, offsetDistance);
      const position = asteroid.position.add(offset);

      const id = this.gameWorld.generateEntityId('asteroid');
      const newAsteroid = new Asteroid(
        id,
        position,
        Vector2D.ZERO, // Asteroids are now fixed
        smallerSize,
        { rotationSpeed: 0 }
      );

      this.gameWorld.addEntity(newAsteroid);
      newAsteroids.push(newAsteroid);
    }

    return newAsteroids;
  }

  /**
   * Get a random position for asteroid spawning
   */
  private getRandomPosition(avoidPosition?: Vector2D): Vector2D {
    const { worldWidth, worldHeight } = this.gameWorld;
    let position: Vector2D;
    let attempts = 0;
    const maxAttempts = 50;

    do {
      position = new Vector2D(
        Math.random() * worldWidth,
        Math.random() * worldHeight
      );
      attempts++;

      if (!avoidPosition || attempts >= maxAttempts) {
        break;
      }
    } while (
      position.distanceTo(avoidPosition) < this.config.minDistanceFromShip!
    );

    return position;
  }

  /**
   * Get a random velocity for an asteroid of given size
   */
  private getRandomVelocity(size: AsteroidSize): Vector2D {
    const angle = Math.random() * Math.PI * 2;
    const speed = this.getRandomSpeed(size);
    return Vector2D.fromAngle(angle, speed);
  }

  /**
   * Get a random speed appropriate for the asteroid size
   */
  private getRandomSpeed(size: AsteroidSize): number {
    const range = Asteroid.getSpeedRangeForSize(size);
    return range.min + Math.random() * (range.max - range.min);
  }

  /**
   * Spawn initial asteroids for a level
   */
  spawnLevelAsteroids(level: number, shipPosition?: Vector2D): Asteroid[] {
    // More asteroids as level increases
    const count = 3 + level;
    return this.spawnMultipleAsteroids(count, AsteroidSize.LARGE, shipPosition);
  }
}
