import { Asteroid, AsteroidSize } from '../../entities/Asteroid';
import { Vector2D } from '../../core/Vector2D';
import { EntityType } from '../../core/Entity';

describe('Asteroid', () => {
  describe('constructor', () => {
    it('should create asteroid with correct position', () => {
      const position = new Vector2D(100, 200);
      const velocity = new Vector2D(10, 5);
      const asteroid = new Asteroid('ast1', position, velocity, AsteroidSize.LARGE);

      expect(asteroid.position.x).toBe(100);
      expect(asteroid.position.y).toBe(200);
    });

    it('should set correct radius for large asteroid', () => {
      const asteroid = new Asteroid(
        'ast1',
        Vector2D.ZERO,
        Vector2D.ZERO,
        AsteroidSize.LARGE
      );
      expect(asteroid.radius).toBe(50);
    });

    it('should set correct radius for medium asteroid', () => {
      const asteroid = new Asteroid(
        'ast1',
        Vector2D.ZERO,
        Vector2D.ZERO,
        AsteroidSize.MEDIUM
      );
      expect(asteroid.radius).toBe(30);
    });

    it('should set correct radius for small asteroid', () => {
      const asteroid = new Asteroid(
        'ast1',
        Vector2D.ZERO,
        Vector2D.ZERO,
        AsteroidSize.SMALL
      );
      expect(asteroid.radius).toBe(15);
    });

    it('should have correct entity type', () => {
      const asteroid = new Asteroid(
        'ast1',
        Vector2D.ZERO,
        Vector2D.ZERO,
        AsteroidSize.LARGE
      );
      expect(asteroid.getType()).toBe(EntityType.ASTEROID);
    });

    it('should be active by default', () => {
      const asteroid = new Asteroid(
        'ast1',
        Vector2D.ZERO,
        Vector2D.ZERO,
        AsteroidSize.LARGE
      );
      expect(asteroid.active).toBe(true);
    });
  });

  describe('size and points', () => {
    it('should return correct size', () => {
      const asteroid = new Asteroid(
        'ast1',
        Vector2D.ZERO,
        Vector2D.ZERO,
        AsteroidSize.MEDIUM
      );
      expect(asteroid.getSize()).toBe(AsteroidSize.MEDIUM);
    });

    it('should have 20 points for large asteroid', () => {
      const asteroid = new Asteroid(
        'ast1',
        Vector2D.ZERO,
        Vector2D.ZERO,
        AsteroidSize.LARGE
      );
      expect(asteroid.getPoints()).toBe(20);
    });

    it('should have 50 points for medium asteroid', () => {
      const asteroid = new Asteroid(
        'ast1',
        Vector2D.ZERO,
        Vector2D.ZERO,
        AsteroidSize.MEDIUM
      );
      expect(asteroid.getPoints()).toBe(50);
    });

    it('should have 100 points for small asteroid', () => {
      const asteroid = new Asteroid(
        'ast1',
        Vector2D.ZERO,
        Vector2D.ZERO,
        AsteroidSize.SMALL
      );
      expect(asteroid.getPoints()).toBe(100);
    });
  });

  describe('update', () => {
    it('should not move asteroid (asteroids are now fixed)', () => {
      const position = new Vector2D(100, 100);
      const velocity = new Vector2D(10, 5);
      const asteroid = new Asteroid('ast1', position, velocity, AsteroidSize.LARGE);

      asteroid.update(1);

      // Asteroids are now fixed and don't move
      expect(asteroid.position.x).toBe(100);
      expect(asteroid.position.y).toBe(100);
    });

    it('should not rotate asteroid (asteroids are now fixed)', () => {
      const asteroid = new Asteroid(
        'ast1',
        Vector2D.ZERO,
        Vector2D.ZERO,
        AsteroidSize.LARGE,
        { rotationSpeed: 1 }
      );

      const initialRotation = asteroid.rotation;
      asteroid.update(1);

      // Asteroids are now fixed and don't rotate
      expect(asteroid.rotation).toBe(initialRotation);
    });

    it('should not update when inactive', () => {
      const position = new Vector2D(100, 100);
      const velocity = new Vector2D(10, 5);
      const asteroid = new Asteroid('ast1', position, velocity, AsteroidSize.LARGE);

      asteroid.destroy();
      asteroid.update(1);

      expect(asteroid.position.x).toBe(100);
      expect(asteroid.position.y).toBe(100);
    });
  });

  describe('splitting', () => {
    it('should return smaller size for large asteroid', () => {
      const asteroid = new Asteroid(
        'ast1',
        Vector2D.ZERO,
        Vector2D.ZERO,
        AsteroidSize.LARGE
      );
      expect(asteroid.getSmallerSize()).toBe(AsteroidSize.MEDIUM);
    });

    it('should return smaller size for medium asteroid', () => {
      const asteroid = new Asteroid(
        'ast1',
        Vector2D.ZERO,
        Vector2D.ZERO,
        AsteroidSize.MEDIUM
      );
      expect(asteroid.getSmallerSize()).toBe(AsteroidSize.SMALL);
    });

    it('should return null for small asteroid', () => {
      const asteroid = new Asteroid(
        'ast1',
        Vector2D.ZERO,
        Vector2D.ZERO,
        AsteroidSize.SMALL
      );
      expect(asteroid.getSmallerSize()).toBeNull();
    });

    it('should indicate large asteroid can split', () => {
      const asteroid = new Asteroid(
        'ast1',
        Vector2D.ZERO,
        Vector2D.ZERO,
        AsteroidSize.LARGE
      );
      expect(asteroid.canSplit()).toBe(true);
    });

    it('should indicate medium asteroid can split', () => {
      const asteroid = new Asteroid(
        'ast1',
        Vector2D.ZERO,
        Vector2D.ZERO,
        AsteroidSize.MEDIUM
      );
      expect(asteroid.canSplit()).toBe(true);
    });

    it('should indicate small asteroid cannot split', () => {
      const asteroid = new Asteroid(
        'ast1',
        Vector2D.ZERO,
        Vector2D.ZERO,
        AsteroidSize.SMALL
      );
      expect(asteroid.canSplit()).toBe(false);
    });
  });

  describe('static helpers', () => {
    it('should return correct radius for each size', () => {
      expect(Asteroid.getRadiusForSize(AsteroidSize.SMALL)).toBe(15);
      expect(Asteroid.getRadiusForSize(AsteroidSize.MEDIUM)).toBe(30);
      expect(Asteroid.getRadiusForSize(AsteroidSize.LARGE)).toBe(50);
    });

    it('should return correct points for each size', () => {
      expect(Asteroid.getPointsForSize(AsteroidSize.SMALL)).toBe(100);
      expect(Asteroid.getPointsForSize(AsteroidSize.MEDIUM)).toBe(50);
      expect(Asteroid.getPointsForSize(AsteroidSize.LARGE)).toBe(20);
    });

    it('should return correct speed range for small asteroids', () => {
      const range = Asteroid.getSpeedRangeForSize(AsteroidSize.SMALL);
      expect(range.min).toBe(80);
      expect(range.max).toBe(120);
    });

    it('should return correct speed range for medium asteroids', () => {
      const range = Asteroid.getSpeedRangeForSize(AsteroidSize.MEDIUM);
      expect(range.min).toBe(50);
      expect(range.max).toBe(80);
    });

    it('should return correct speed range for large asteroids', () => {
      const range = Asteroid.getSpeedRangeForSize(AsteroidSize.LARGE);
      expect(range.min).toBe(20);
      expect(range.max).toBe(50);
    });
  });

  describe('wrapping behavior', () => {
    it('should wrap around right edge', () => {
      const asteroid = new Asteroid(
        'ast1',
        new Vector2D(850, 300),
        Vector2D.ZERO,
        AsteroidSize.LARGE
      );

      asteroid.wrapAroundBounds(800, 600);
      expect(asteroid.position.x).toBe(0);
    });

    it('should wrap around left edge', () => {
      const asteroid = new Asteroid(
        'ast1',
        new Vector2D(-10, 300),
        Vector2D.ZERO,
        AsteroidSize.LARGE
      );

      asteroid.wrapAroundBounds(800, 600);
      expect(asteroid.position.x).toBe(800);
    });

    it('should wrap around top edge', () => {
      const asteroid = new Asteroid(
        'ast1',
        new Vector2D(400, -10),
        Vector2D.ZERO,
        AsteroidSize.LARGE
      );

      asteroid.wrapAroundBounds(800, 600);
      expect(asteroid.position.y).toBe(600);
    });

    it('should wrap around bottom edge', () => {
      const asteroid = new Asteroid(
        'ast1',
        new Vector2D(400, 650),
        Vector2D.ZERO,
        AsteroidSize.LARGE
      );

      asteroid.wrapAroundBounds(800, 600);
      expect(asteroid.position.y).toBe(0);
    });
  });

  describe('collision detection', () => {
    it('should detect collision with another asteroid', () => {
      const ast1 = new Asteroid(
        'ast1',
        new Vector2D(100, 100),
        Vector2D.ZERO,
        AsteroidSize.LARGE
      );
      const ast2 = new Asteroid(
        'ast2',
        new Vector2D(120, 100),
        Vector2D.ZERO,
        AsteroidSize.LARGE
      );

      expect(ast1.collidesWith(ast2)).toBe(true);
    });

    it('should not detect collision when far apart', () => {
      const ast1 = new Asteroid(
        'ast1',
        new Vector2D(100, 100),
        Vector2D.ZERO,
        AsteroidSize.LARGE
      );
      const ast2 = new Asteroid(
        'ast2',
        new Vector2D(300, 300),
        Vector2D.ZERO,
        AsteroidSize.LARGE
      );

      expect(ast1.collidesWith(ast2)).toBe(false);
    });
  });
});
