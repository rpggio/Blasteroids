import { ShipController } from '../../core/ShipController';
import { Ship } from '../../entities/Ship';
import { GameWorld } from '../../core/GameWorld';
import { Vector2D } from '../../core/Vector2D';
import { EntityType } from '../../core/Entity';

describe('ShipController', () => {
  let ship: Ship;
  let world: GameWorld;
  let controller: ShipController;

  beforeEach(() => {
    world = new GameWorld({ worldWidth: 800, worldHeight: 600 });
    ship = new Ship('ship1', new Vector2D(400, 300));
    world.addEntity(ship);
  });

  describe('constructor', () => {
    it('should create controller with default fire rate', () => {
      controller = new ShipController(ship, world);
      expect(controller.canFire()).toBe(true);
    });

    it('should create controller with custom fire rate', () => {
      controller = new ShipController(ship, world, { fireRate: 10 });
      expect(controller.canFire()).toBe(true);
    });

    it('should start ready to fire', () => {
      controller = new ShipController(ship, world);
      expect(controller.canFire()).toBe(true);
    });
  });

  describe('fire', () => {
    beforeEach(() => {
      controller = new ShipController(ship, world, { fireRate: 5 });
    });

    it('should create a bullet when firing', () => {
      const bullet = controller.fire();
      expect(bullet).not.toBeNull();
      expect(bullet?.getType()).toBe(EntityType.BULLET);
    });

    it('should add bullet to game world', () => {
      const initialCount = world.getEntityCount();
      controller.fire();
      expect(world.getEntityCount()).toBe(initialCount + 1);
    });

    it('should create bullet at ship position', () => {
      const bullet = controller.fire();
      expect(bullet?.position).toEqual(ship.position);
    });

    it('should create bullet moving in ship direction', () => {
      ship.rotation = Math.PI / 2; // Point down
      const bullet = controller.fire();

      const expectedDirection = ship.getDirection();
      const bulletDirection = bullet!.velocity.normalize();

      expect(bulletDirection.x).toBeCloseTo(expectedDirection.x, 5);
      expect(bulletDirection.y).toBeCloseTo(expectedDirection.y, 5);
    });

    it('should respect fire rate limit', () => {
      const bullet1 = controller.fire();
      expect(bullet1).not.toBeNull();

      // Try to fire immediately again
      const bullet2 = controller.fire();
      expect(bullet2).toBeNull();
    });

    it('should allow firing after fire rate cooldown', () => {
      controller.fire();

      // Wait for cooldown (1/5 = 0.2 seconds at 5 shots/sec)
      controller.update(0.21);

      const bullet2 = controller.fire();
      expect(bullet2).not.toBeNull();
    });

    it('should use custom bullet config', () => {
      controller = new ShipController(ship, world, {
        bulletConfig: { speed: 300, lifetime: 5 },
      });

      const bullet = controller.fire();
      expect(bullet?.velocity.magnitude()).toBe(300);
      expect(bullet?.getRemainingLifetime()).toBe(5);
    });
  });

  describe('canFire', () => {
    beforeEach(() => {
      controller = new ShipController(ship, world, { fireRate: 5 });
    });

    it('should return true when ready to fire', () => {
      expect(controller.canFire()).toBe(true);
    });

    it('should return false immediately after firing', () => {
      controller.fire();
      expect(controller.canFire()).toBe(false);
    });

    it('should return true after cooldown', () => {
      controller.fire();
      controller.update(0.21);
      expect(controller.canFire()).toBe(true);
    });
  });

  describe('getTimeUntilNextShot', () => {
    beforeEach(() => {
      controller = new ShipController(ship, world, { fireRate: 5 });
    });

    it('should return 0 when ready to fire', () => {
      expect(controller.getTimeUntilNextShot()).toBe(0);
    });

    it('should return time until next shot after firing', () => {
      controller.fire();
      const timeUntilNext = controller.getTimeUntilNextShot();
      expect(timeUntilNext).toBeCloseTo(0.2, 5);
    });

    it('should decrease as time passes', () => {
      controller.fire();
      controller.update(0.1);

      const timeUntilNext = controller.getTimeUntilNextShot();
      expect(timeUntilNext).toBeCloseTo(0.1, 5);
    });

    it('should not go negative', () => {
      controller.update(1);
      expect(controller.getTimeUntilNextShot()).toBe(0);
    });
  });

  describe('update', () => {
    beforeEach(() => {
      controller = new ShipController(ship, world, { fireRate: 5 });
    });

    it('should update fire rate timer', () => {
      controller.fire();
      expect(controller.canFire()).toBe(false);

      controller.update(0.1);
      expect(controller.canFire()).toBe(false);

      controller.update(0.11);
      expect(controller.canFire()).toBe(true);
    });
  });

  describe('resetFireRateTimer', () => {
    beforeEach(() => {
      controller = new ShipController(ship, world, { fireRate: 5 });
    });

    it('should make ship ready to fire immediately', () => {
      controller.fire();
      expect(controller.canFire()).toBe(false);

      controller.resetFireRateTimer();
      expect(controller.canFire()).toBe(true);
    });
  });

  describe('fire rate variations', () => {
    it('should handle different fire rates correctly', () => {
      // 10 shots per second = 0.1 seconds between shots
      controller = new ShipController(ship, world, { fireRate: 10 });

      controller.fire();
      controller.update(0.05);
      expect(controller.canFire()).toBe(false);

      controller.update(0.06);
      expect(controller.canFire()).toBe(true);
    });

    it('should handle slow fire rate', () => {
      // 1 shot per second
      controller = new ShipController(ship, world, { fireRate: 1 });

      controller.fire();
      controller.update(0.5);
      expect(controller.canFire()).toBe(false);

      controller.update(0.6);
      expect(controller.canFire()).toBe(true);
    });
  });

  describe('multiple shots', () => {
    beforeEach(() => {
      controller = new ShipController(ship, world, { fireRate: 5 });
    });

    it('should create multiple bullets over time', () => {
      const initialCount = world.getEntityCount();

      controller.fire();
      controller.update(0.21);
      controller.fire();
      controller.update(0.21);
      controller.fire();

      expect(world.getEntityCount()).toBe(initialCount + 3);
    });

    it('should fire at consistent rate', () => {
      const fireTimestamps: number[] = [];
      let currentTime = 0;

      for (let i = 0; i < 5; i++) {
        if (controller.canFire()) {
          controller.fire();
          fireTimestamps.push(currentTime);
        }
        controller.update(0.05);
        currentTime += 0.05;
      }

      // Should have fired at least twice in 0.25 seconds at 5 shots/sec
      expect(fireTimestamps.length).toBeGreaterThanOrEqual(2);
    });
  });
});
