import { Ship } from '../../entities/Ship';
import { Vector2D } from '../../core/Vector2D';
import { EntityType } from '../../core/Entity';

describe('Ship', () => {
  let ship: Ship;
  const startPosition = new Vector2D(400, 300);

  beforeEach(() => {
    ship = new Ship('ship1', startPosition, {
      maxSpeed: 300,
      acceleration: 200,
      drag: 0.98,
    });
  });

  describe('constructor', () => {
    it('should create ship with initial position', () => {
      expect(ship.position.x).toBe(400);
      expect(ship.position.y).toBe(300);
    });

    it('should initialize with zero velocity', () => {
      expect(ship.velocity.x).toBe(0);
      expect(ship.velocity.y).toBe(0);
    });

    it('should be active by default', () => {
      expect(ship.active).toBe(true);
    });

    it('should have correct entity type', () => {
      expect(ship.getType()).toBe(EntityType.SHIP);
    });

    it('should not be accelerating initially', () => {
      expect(ship.isCurrentlyAccelerating()).toBe(false);
    });
  });

  describe('acceleration', () => {
    it('should start accelerating towards target position', () => {
      const target = new Vector2D(500, 300);
      ship.accelerateTowards(target);
      expect(ship.isCurrentlyAccelerating()).toBe(true);
      expect(ship.getTargetPosition()).toEqual(target);
    });

    it('should stop accelerating when told', () => {
      const target = new Vector2D(500, 300);
      ship.accelerateTowards(target);
      ship.stopAccelerating();
      expect(ship.isCurrentlyAccelerating()).toBe(false);
      expect(ship.getTargetPosition()).toBe(null);
    });

    it('should gain velocity when accelerating', () => {
      const target = new Vector2D(500, 300);
      ship.accelerateTowards(target);
      ship.update(1);
      expect(ship.getSpeed()).toBeGreaterThan(0);
    });

    it('should accelerate in direction of target', () => {
      const target = new Vector2D(500, 300); // Right of ship
      ship.accelerateTowards(target);
      ship.update(0.1);

      // Ship should have positive x velocity (moving right)
      expect(ship.velocity.x).toBeGreaterThan(0);
      // Y velocity should be near zero (target is horizontally aligned)
      expect(Math.abs(ship.velocity.y)).toBeLessThan(1);
    });

    it('should rotate to face direction of movement', () => {
      const target = new Vector2D(500, 300); // Right of ship
      ship.accelerateTowards(target);
      ship.update(0.5);

      // Ship should be facing right (rotation near 0)
      expect(Math.abs(ship.rotation)).toBeLessThan(0.1);
    });
  });

  describe('physics', () => {
    it('should apply drag to velocity', () => {
      ship.setVelocity(new Vector2D(100, 0));
      const initialSpeed = ship.getSpeed();
      ship.update(1);
      const finalSpeed = ship.getSpeed();
      expect(finalSpeed).toBeLessThan(initialSpeed);
    });

    it('should limit maximum speed', () => {
      const target = new Vector2D(1000, 300);
      ship.accelerateTowards(target);

      // Accelerate for a long time
      for (let i = 0; i < 100; i++) {
        ship.update(0.1);
      }

      // Speed should be at or below max
      expect(ship.getSpeed()).toBeLessThanOrEqual(300);
    });

    it('should update position based on velocity', () => {
      ship.setVelocity(new Vector2D(10, 0));
      const initialX = ship.position.x;
      ship.update(1);
      expect(ship.position.x).toBeGreaterThan(initialX);
    });

    it('should not move when velocity is zero', () => {
      const initialPos = ship.position;
      ship.update(1);
      expect(ship.position.x).toBe(initialPos.x);
      expect(ship.position.y).toBe(initialPos.y);
    });
  });

  describe('movement over time', () => {
    it('should continuously accelerate towards moving target', () => {
      let target = new Vector2D(500, 300);
      ship.accelerateTowards(target);

      ship.update(0.5);
      const speed1 = ship.getSpeed();

      // Update target position
      target = new Vector2D(600, 400);
      ship.accelerateTowards(target);

      ship.update(0.5);
      const speed2 = ship.getSpeed();

      expect(speed2).toBeGreaterThan(0);
    });

    it('should gradually slow down when not accelerating', () => {
      ship.setVelocity(new Vector2D(100, 0));
      const speeds: number[] = [];

      for (let i = 0; i < 10; i++) {
        ship.update(0.1);
        speeds.push(ship.getSpeed());
      }

      // Each speed should be less than the previous (due to drag)
      for (let i = 1; i < speeds.length; i++) {
        expect(speeds[i]).toBeLessThan(speeds[i - 1]);
      }
    });
  });

  describe('getDirection', () => {
    it('should return unit vector in direction ship is facing', () => {
      ship.rotation = 0; // Facing right
      const dir = ship.getDirection();
      expect(dir.x).toBeCloseTo(1, 5);
      expect(dir.y).toBeCloseTo(0, 5);
    });

    it('should return correct direction for 90 degrees', () => {
      ship.rotation = Math.PI / 2; // Facing down
      const dir = ship.getDirection();
      expect(dir.x).toBeCloseTo(0, 5);
      expect(dir.y).toBeCloseTo(1, 5);
    });
  });

  describe('reset', () => {
    it('should reset ship to initial state', () => {
      const target = new Vector2D(500, 300);
      ship.accelerateTowards(target);
      ship.update(1);

      const newPosition = new Vector2D(100, 100);
      ship.reset(newPosition);

      expect(ship.position).toEqual(newPosition);
      expect(ship.velocity).toEqual(Vector2D.ZERO);
      expect(ship.rotation).toBe(0);
      expect(ship.active).toBe(true);
      expect(ship.isCurrentlyAccelerating()).toBe(false);
    });
  });

  describe('wrapping around world bounds', () => {
    it('should wrap around right edge', () => {
      ship.position = new Vector2D(850, 300);
      ship.wrapAroundBounds(800, 600);
      expect(ship.position.x).toBe(0);
    });

    it('should wrap around left edge', () => {
      ship.position = new Vector2D(-10, 300);
      ship.wrapAroundBounds(800, 600);
      expect(ship.position.x).toBe(800);
    });

    it('should wrap around top edge', () => {
      ship.position = new Vector2D(400, -10);
      ship.wrapAroundBounds(800, 600);
      expect(ship.position.y).toBe(600);
    });

    it('should wrap around bottom edge', () => {
      ship.position = new Vector2D(400, 650);
      ship.wrapAroundBounds(800, 600);
      expect(ship.position.y).toBe(0);
    });
  });

  describe('consistent behavior', () => {
    it('should have consistent drag application', () => {
      const ship1 = new Ship('ship1', startPosition);
      const ship2 = new Ship('ship2', startPosition);

      // Both start with same velocity, no acceleration
      ship1.setVelocity(new Vector2D(100, 0));
      ship2.setVelocity(new Vector2D(100, 0));

      // Ship 1: one large update
      ship1.update(1);

      // Ship 2: ten small updates
      for (let i = 0; i < 10; i++) {
        ship2.update(0.1);
      }

      // With framerate-independent drag, results should be very close
      expect(ship1.velocity.x).toBeCloseTo(ship2.velocity.x, 1);
      expect(ship1.velocity.y).toBeCloseTo(ship2.velocity.y, 1);
    });
  });
});
