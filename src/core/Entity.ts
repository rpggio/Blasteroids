import { Vector2D } from './Vector2D';

/**
 * Entity type enumeration
 */
export enum EntityType {
  SHIP = 'SHIP',
  BULLET = 'BULLET',
  ASTEROID = 'ASTEROID',
}

/**
 * Base class for all game entities.
 * Contains position, velocity, and common properties.
 */
export abstract class Entity {
  public id: string;
  public position: Vector2D;
  public velocity: Vector2D;
  public rotation: number; // in radians
  public radius: number; // for collision detection
  public active: boolean;

  constructor(
    id: string,
    position: Vector2D,
    velocity: Vector2D = Vector2D.ZERO,
    rotation: number = 0,
    radius: number = 10
  ) {
    this.id = id;
    this.position = position;
    this.velocity = velocity;
    this.rotation = rotation;
    this.radius = radius;
    this.active = true;
  }

  /**
   * Update the entity's state for one frame
   * @param deltaTime Time since last frame in seconds
   */
  abstract update(deltaTime: number): void;

  /**
   * Get the entity type
   */
  abstract getType(): EntityType;

  /**
   * Check if this entity collides with another entity
   */
  collidesWith(other: Entity): boolean {
    if (!this.active || !other.active) {
      return false;
    }
    const distance = this.position.distanceTo(other.position);
    return distance < (this.radius + other.radius);
  }

  /**
   * Deactivate this entity (mark for removal)
   */
  destroy(): void {
    this.active = false;
  }

  /**
   * Check if entity is out of bounds
   */
  isOutOfBounds(worldWidth: number, worldHeight: number, margin: number = 100): boolean {
    return (
      this.position.x < -margin ||
      this.position.x > worldWidth + margin ||
      this.position.y < -margin ||
      this.position.y > worldHeight + margin
    );
  }

  /**
   * Wrap entity around world bounds (for asteroids and ship)
   */
  wrapAroundBounds(worldWidth: number, worldHeight: number): void {
    let newX = this.position.x;
    let newY = this.position.y;

    if (this.position.x < 0) {
      newX = worldWidth;
    } else if (this.position.x > worldWidth) {
      newX = 0;
    }

    if (this.position.y < 0) {
      newY = worldHeight;
    } else if (this.position.y > worldHeight) {
      newY = 0;
    }

    this.position = new Vector2D(newX, newY);
  }
}
