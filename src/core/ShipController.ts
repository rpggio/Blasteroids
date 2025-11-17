import { Ship } from '../entities/Ship';
import { Bullet, BulletConfig } from '../entities/Bullet';
import { Vector2D } from './Vector2D';
import { GameWorld } from './GameWorld';

/**
 * Configuration for ship controller
 */
export interface ShipControllerConfig {
  fireRate?: number; // bullets per second
  bulletConfig?: BulletConfig;
}

/**
 * Controller for ship input and actions.
 * Handles shooting and manages fire rate.
 */
export class ShipController {
  private ship: Ship;
  private gameWorld: GameWorld;
  private fireRate: number;
  private timeSinceLastShot: number;
  private bulletConfig: BulletConfig;

  constructor(
    ship: Ship,
    gameWorld: GameWorld,
    config: ShipControllerConfig = {}
  ) {
    this.ship = ship;
    this.gameWorld = gameWorld;
    this.fireRate = config.fireRate ?? 5; // 5 shots per second
    this.timeSinceLastShot = 1 / this.fireRate; // Start ready to fire
    this.bulletConfig = config.bulletConfig ?? {};
  }

  /**
   * Update the controller (handles fire rate timing)
   */
  update(deltaTime: number): void {
    this.timeSinceLastShot += deltaTime;
  }

  /**
   * Attempt to fire a bullet from the ship
   * @returns The created bullet, or null if fire rate prevents shooting
   */
  fire(): Bullet | null {
    const minTimeBetweenShots = 1 / this.fireRate;

    if (this.timeSinceLastShot < minTimeBetweenShots) {
      return null; // Fire rate limit
    }

    // Create bullet at ship's position
    const bulletId = this.gameWorld.generateEntityId('bullet');
    const bulletPosition = this.ship.position.clone();
    const bulletDirection = this.ship.getDirection();

    const bullet = new Bullet(
      bulletId,
      bulletPosition,
      bulletDirection,
      this.bulletConfig
    );

    this.gameWorld.addEntity(bullet);
    this.timeSinceLastShot = 0;

    return bullet;
  }

  /**
   * Check if ship can fire (respecting fire rate)
   */
  canFire(): boolean {
    const minTimeBetweenShots = 1 / this.fireRate;
    return this.timeSinceLastShot >= minTimeBetweenShots;
  }

  /**
   * Get time until next shot is available
   */
  getTimeUntilNextShot(): number {
    const minTimeBetweenShots = 1 / this.fireRate;
    return Math.max(0, minTimeBetweenShots - this.timeSinceLastShot);
  }

  /**
   * Reset the fire rate timer (makes ship ready to fire immediately)
   */
  resetFireRateTimer(): void {
    this.timeSinceLastShot = 1 / this.fireRate;
  }
}
