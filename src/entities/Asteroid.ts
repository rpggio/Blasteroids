import { Entity, EntityType } from '../core/Entity';
import { Vector2D } from '../core/Vector2D';

/**
 * Asteroid size enumeration
 */
export enum AsteroidSize {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
}

/**
 * Configuration for asteroids
 */
export interface AsteroidConfig {
  minSpeed?: number;
  maxSpeed?: number;
  rotationSpeed?: number;
}

/**
 * Asteroid entity.
 * Different sizes have different radii and point values.
 */
export class Asteroid extends Entity {
  private size: AsteroidSize;
  private rotationSpeed: number;
  private points: number;

  constructor(
    id: string,
    position: Vector2D,
    velocity: Vector2D,
    size: AsteroidSize,
    config: AsteroidConfig = {}
  ) {
    const radius = Asteroid.getRadiusForSize(size);
    super(id, position, velocity, 0, radius);

    this.size = size;
    this.rotationSpeed = config.rotationSpeed ?? (Math.random() - 0.5) * 2;
    this.points = Asteroid.getPointsForSize(size);
  }

  getType(): EntityType {
    return EntityType.ASTEROID;
  }

  /**
   * Get the size of this asteroid
   */
  getSize(): AsteroidSize {
    return this.size;
  }

  /**
   * Get the point value of this asteroid
   */
  getPoints(): number {
    return this.points;
  }

  /**
   * Update asteroid position and rotation
   */
  update(deltaTime: number): void {
    if (!this.active) {
      return;
    }

    // Update position
    this.position = this.position.add(this.velocity.multiply(deltaTime));

    // Update rotation
    this.rotation += this.rotationSpeed * deltaTime;
  }

  /**
   * Get the smaller size when this asteroid splits
   */
  getSmallerSize(): AsteroidSize | null {
    switch (this.size) {
      case AsteroidSize.LARGE:
        return AsteroidSize.MEDIUM;
      case AsteroidSize.MEDIUM:
        return AsteroidSize.SMALL;
      case AsteroidSize.SMALL:
        return null; // Small asteroids don't split
    }
  }

  /**
   * Check if this asteroid can split into smaller ones
   */
  canSplit(): boolean {
    return this.size !== AsteroidSize.SMALL;
  }

  /**
   * Get radius for a given size
   */
  static getRadiusForSize(size: AsteroidSize): number {
    switch (size) {
      case AsteroidSize.SMALL:
        return 15;
      case AsteroidSize.MEDIUM:
        return 30;
      case AsteroidSize.LARGE:
        return 50;
    }
  }

  /**
   * Get point value for a given size
   */
  static getPointsForSize(size: AsteroidSize): number {
    switch (size) {
      case AsteroidSize.SMALL:
        return 100;
      case AsteroidSize.MEDIUM:
        return 50;
      case AsteroidSize.LARGE:
        return 20;
    }
  }

  /**
   * Get speed range for a given size (smaller = faster)
   */
  static getSpeedRangeForSize(size: AsteroidSize): { min: number; max: number } {
    switch (size) {
      case AsteroidSize.SMALL:
        return { min: 80, max: 120 };
      case AsteroidSize.MEDIUM:
        return { min: 50, max: 80 };
      case AsteroidSize.LARGE:
        return { min: 20, max: 50 };
    }
  }
}
