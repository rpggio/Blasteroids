import { Entity, EntityType } from '../core/Entity';
import { Vector2D } from '../core/Vector2D';

/**
 * Configuration for bullets
 */
export interface BulletConfig {
  speed?: number;
  lifetime?: number; // in seconds
  radius?: number;
}

/**
 * Bullet entity fired by the ship.
 * Travels in a straight line and has a limited lifetime.
 */
export class Bullet extends Entity {
  private speed: number;
  private lifetime: number;
  private age: number;

  constructor(
    id: string,
    position: Vector2D,
    direction: Vector2D,
    config: BulletConfig = {}
  ) {
    const speed = config.speed ?? 500;
    const velocity = direction.normalize().multiply(speed);

    super(id, position, velocity, 0, config.radius ?? 3);

    this.speed = speed;
    this.lifetime = config.lifetime ?? 2; // 2 seconds default
    this.age = 0;
  }

  getType(): EntityType {
    return EntityType.BULLET;
  }

  /**
   * Update bullet position and check lifetime
   */
  update(deltaTime: number): void {
    if (!this.active) {
      return;
    }

    // Update position
    this.position = this.position.add(this.velocity.multiply(deltaTime));

    // Update age and check lifetime
    this.age += deltaTime;
    if (this.age >= this.lifetime) {
      this.destroy();
    }
  }

  /**
   * Get the current age of the bullet
   */
  getAge(): number {
    return this.age;
  }

  /**
   * Get the remaining lifetime of the bullet
   */
  getRemainingLifetime(): number {
    return Math.max(0, this.lifetime - this.age);
  }

  /**
   * Check if bullet has expired
   */
  hasExpired(): boolean {
    return this.age >= this.lifetime;
  }
}
