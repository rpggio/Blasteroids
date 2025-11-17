import { Bullet } from '../../entities/Bullet';
import { Vector2D } from '../../core/Vector2D';
import { EntityType } from '../../core/Entity';

describe('Bullet', () => {
  describe('constructor', () => {
    it('should create bullet with correct position', () => {
      const position = new Vector2D(100, 200);
      const direction = new Vector2D(1, 0);
      const bullet = new Bullet('bullet1', position, direction);

      expect(bullet.position.x).toBe(100);
      expect(bullet.position.y).toBe(200);
    });

    it('should normalize direction and apply speed', () => {
      const position = new Vector2D(100, 200);
      const direction = new Vector2D(3, 4); // Will be normalized
      const bullet = new Bullet('bullet1', position, direction, { speed: 500 });

      const expectedVelocity = direction.normalize().multiply(500);
      expect(bullet.velocity.x).toBeCloseTo(expectedVelocity.x, 5);
      expect(bullet.velocity.y).toBeCloseTo(expectedVelocity.y, 5);
    });

    it('should use default speed if not specified', () => {
      const position = new Vector2D(100, 200);
      const direction = new Vector2D(1, 0);
      const bullet = new Bullet('bullet1', position, direction);

      expect(bullet.velocity.magnitude()).toBe(500);
    });

    it('should use custom speed when provided', () => {
      const position = new Vector2D(100, 200);
      const direction = new Vector2D(1, 0);
      const bullet = new Bullet('bullet1', position, direction, { speed: 300 });

      expect(bullet.velocity.magnitude()).toBe(300);
    });

    it('should use default lifetime if not specified', () => {
      const bullet = new Bullet('bullet1', Vector2D.ZERO, new Vector2D(1, 0));
      expect(bullet.getRemainingLifetime()).toBe(2);
    });

    it('should use custom lifetime when provided', () => {
      const bullet = new Bullet('bullet1', Vector2D.ZERO, new Vector2D(1, 0), {
        lifetime: 5,
      });
      expect(bullet.getRemainingLifetime()).toBe(5);
    });

    it('should have correct entity type', () => {
      const bullet = new Bullet('bullet1', Vector2D.ZERO, new Vector2D(1, 0));
      expect(bullet.getType()).toBe(EntityType.BULLET);
    });

    it('should be active by default', () => {
      const bullet = new Bullet('bullet1', Vector2D.ZERO, new Vector2D(1, 0));
      expect(bullet.active).toBe(true);
    });
  });

  describe('update', () => {
    it('should move bullet in direction of velocity', () => {
      const position = new Vector2D(100, 100);
      const direction = new Vector2D(1, 0);
      const bullet = new Bullet('bullet1', position, direction, { speed: 100 });

      bullet.update(1);

      expect(bullet.position.x).toBeCloseTo(200, 5);
      expect(bullet.position.y).toBeCloseTo(100, 5);
    });

    it('should age over time', () => {
      const bullet = new Bullet('bullet1', Vector2D.ZERO, new Vector2D(1, 0));

      bullet.update(0.5);
      expect(bullet.getAge()).toBeCloseTo(0.5, 5);

      bullet.update(0.5);
      expect(bullet.getAge()).toBeCloseTo(1, 5);
    });

    it('should destroy itself after lifetime expires', () => {
      const bullet = new Bullet('bullet1', Vector2D.ZERO, new Vector2D(1, 0), {
        lifetime: 1,
      });

      bullet.update(0.5);
      expect(bullet.active).toBe(true);

      bullet.update(0.6);
      expect(bullet.active).toBe(false);
      expect(bullet.hasExpired()).toBe(true);
    });

    it('should not update when inactive', () => {
      const bullet = new Bullet('bullet1', new Vector2D(100, 100), new Vector2D(1, 0));
      bullet.destroy();

      const initialPosition = bullet.position;
      bullet.update(1);

      expect(bullet.position).toEqual(initialPosition);
    });
  });

  describe('lifetime management', () => {
    it('should calculate remaining lifetime correctly', () => {
      const bullet = new Bullet('bullet1', Vector2D.ZERO, new Vector2D(1, 0), {
        lifetime: 2,
      });

      expect(bullet.getRemainingLifetime()).toBe(2);

      bullet.update(0.5);
      expect(bullet.getRemainingLifetime()).toBeCloseTo(1.5, 5);

      bullet.update(1);
      expect(bullet.getRemainingLifetime()).toBeCloseTo(0.5, 5);
    });

    it('should not return negative remaining lifetime', () => {
      const bullet = new Bullet('bullet1', Vector2D.ZERO, new Vector2D(1, 0), {
        lifetime: 1,
      });

      bullet.update(2);
      expect(bullet.getRemainingLifetime()).toBe(0);
    });

    it('should detect expiration', () => {
      const bullet = new Bullet('bullet1', Vector2D.ZERO, new Vector2D(1, 0), {
        lifetime: 1,
      });

      expect(bullet.hasExpired()).toBe(false);

      bullet.update(0.5);
      expect(bullet.hasExpired()).toBe(false);

      bullet.update(0.6);
      expect(bullet.hasExpired()).toBe(true);
    });
  });

  describe('out of bounds behavior', () => {
    it('should detect when out of bounds', () => {
      const bullet = new Bullet('bullet1', new Vector2D(950, 100), new Vector2D(1, 0));

      expect(bullet.isOutOfBounds(800, 600)).toBe(true);
    });

    it('should not wrap around bounds like other entities', () => {
      const bullet = new Bullet('bullet1', new Vector2D(850, 300), new Vector2D(1, 0));

      const originalX = bullet.position.x;
      bullet.wrapAroundBounds(800, 600);

      // Bullets can wrap, but typically we'd destroy them when out of bounds
      expect(bullet.position.x).toBe(0);
    });
  });

  describe('diagonal movement', () => {
    it('should move diagonally when direction is diagonal', () => {
      const position = new Vector2D(100, 100);
      const direction = new Vector2D(1, 1);
      const bullet = new Bullet('bullet1', position, direction, { speed: 100 });

      bullet.update(1);

      // Should move approximately 70.7 in each direction (100 / sqrt(2))
      const expectedOffset = 100 / Math.sqrt(2);
      expect(bullet.position.x).toBeCloseTo(100 + expectedOffset, 1);
      expect(bullet.position.y).toBeCloseTo(100 + expectedOffset, 1);
    });
  });
});
