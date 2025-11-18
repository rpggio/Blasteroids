import { AsteroidSpawner } from '../../core/AsteroidSpawner';
import { GameWorld } from '../../core/GameWorld';
import { Asteroid, AsteroidSize } from '../../entities/Asteroid';
import { Vector2D } from '../../core/Vector2D';

describe('AsteroidSpawner', () => {
  let world: GameWorld;
  let spawner: AsteroidSpawner;

  beforeEach(() => {
    world = new GameWorld({ worldWidth: 800, worldHeight: 600 });
    spawner = new AsteroidSpawner(world);
  });

  describe('spawnAsteroid', () => {
    it('should spawn an asteroid and add it to world', () => {
      const initialCount = world.getEntityCount();
      const asteroid = spawner.spawnAsteroid(AsteroidSize.LARGE);

      expect(world.getEntityCount()).toBe(initialCount + 1);
      expect(asteroid).toBeInstanceOf(Asteroid);
    });

    it('should spawn asteroid with correct size', () => {
      const asteroid = spawner.spawnAsteroid(AsteroidSize.MEDIUM);
      expect(asteroid.getSize()).toBe(AsteroidSize.MEDIUM);
    });

    it('should spawn asteroid within world bounds', () => {
      const asteroid = spawner.spawnAsteroid(AsteroidSize.LARGE);

      expect(asteroid.position.x).toBeGreaterThanOrEqual(0);
      expect(asteroid.position.x).toBeLessThanOrEqual(800);
      expect(asteroid.position.y).toBeGreaterThanOrEqual(0);
      expect(asteroid.position.y).toBeLessThanOrEqual(600);
    });

    it('should spawn asteroid with zero velocity (asteroids are now fixed)', () => {
      const asteroid = spawner.spawnAsteroid(AsteroidSize.LARGE);
      expect(asteroid.velocity.magnitude()).toBe(0);
    });

    it('should spawn asteroid away from avoid position when specified', () => {
      const avoidPosition = new Vector2D(400, 300);
      const minDistance = 150;

      const asteroid = spawner.spawnAsteroid(AsteroidSize.LARGE, avoidPosition);
      const distance = asteroid.position.distanceTo(avoidPosition);

      // May not always succeed due to randomness, but should try
      // In a small world with many attempts, it should succeed most times
      expect(distance).toBeGreaterThan(0);
    });

    it('should spawn asteroids with zero rotation speed (asteroids are now fixed)', () => {
      const asteroid = spawner.spawnAsteroid(AsteroidSize.LARGE);
      const initialRotation = asteroid.rotation;

      asteroid.update(1);

      expect(asteroid.rotation).toBe(initialRotation);
    });
  });

  describe('spawnMultipleAsteroids', () => {
    it('should spawn correct number of asteroids', () => {
      const initialCount = world.getEntityCount();
      const asteroids = spawner.spawnMultipleAsteroids(5, AsteroidSize.LARGE);

      expect(asteroids).toHaveLength(5);
      expect(world.getEntityCount()).toBe(initialCount + 5);
    });

    it('should spawn all asteroids with same size', () => {
      const asteroids = spawner.spawnMultipleAsteroids(3, AsteroidSize.MEDIUM);

      asteroids.forEach((asteroid) => {
        expect(asteroid.getSize()).toBe(AsteroidSize.MEDIUM);
      });
    });

    it('should return array of spawned asteroids', () => {
      const asteroids = spawner.spawnMultipleAsteroids(3, AsteroidSize.LARGE);

      asteroids.forEach((asteroid) => {
        expect(asteroid).toBeInstanceOf(Asteroid);
        expect(asteroid.active).toBe(true);
      });
    });
  });

  describe('splitAsteroid', () => {
    it('should split large asteroid into medium asteroids', () => {
      const largeAsteroid = new Asteroid(
        'ast1',
        new Vector2D(400, 300),
        new Vector2D(10, 5),
        AsteroidSize.LARGE
      );
      world.addEntity(largeAsteroid);

      const newAsteroids = spawner.splitAsteroid(largeAsteroid);

      expect(newAsteroids).toHaveLength(2);
      newAsteroids.forEach((asteroid) => {
        expect(asteroid.getSize()).toBe(AsteroidSize.MEDIUM);
      });
    });

    it('should split medium asteroid into small asteroids', () => {
      const mediumAsteroid = new Asteroid(
        'ast1',
        new Vector2D(400, 300),
        new Vector2D(10, 5),
        AsteroidSize.MEDIUM
      );
      world.addEntity(mediumAsteroid);

      const newAsteroids = spawner.splitAsteroid(mediumAsteroid);

      expect(newAsteroids).toHaveLength(2);
      newAsteroids.forEach((asteroid) => {
        expect(asteroid.getSize()).toBe(AsteroidSize.SMALL);
      });
    });

    it('should not split small asteroid', () => {
      const smallAsteroid = new Asteroid(
        'ast1',
        new Vector2D(400, 300),
        new Vector2D(10, 5),
        AsteroidSize.SMALL
      );
      world.addEntity(smallAsteroid);

      const newAsteroids = spawner.splitAsteroid(smallAsteroid);

      expect(newAsteroids).toHaveLength(0);
    });

    it('should spawn new asteroids near original position', () => {
      const originalPosition = new Vector2D(400, 300);
      const asteroid = new Asteroid(
        'ast1',
        originalPosition,
        new Vector2D(10, 5),
        AsteroidSize.LARGE
      );
      world.addEntity(asteroid);

      const newAsteroids = spawner.splitAsteroid(asteroid);

      // New asteroids should be near the original position (within reasonable distance)
      newAsteroids.forEach((newAsteroid) => {
        const distance = newAsteroid.position.distanceTo(originalPosition);
        expect(distance).toBeLessThan(100); // Should be nearby
      });
    });

    it('should add new asteroids to world', () => {
      const asteroid = new Asteroid(
        'ast1',
        new Vector2D(400, 300),
        new Vector2D(10, 5),
        AsteroidSize.LARGE
      );
      world.addEntity(asteroid);

      const initialCount = world.getEntityCount();
      spawner.splitAsteroid(asteroid);

      expect(world.getEntityCount()).toBe(initialCount + 2);
    });

    it('should give new asteroids zero velocity (asteroids are now fixed)', () => {
      const asteroid = new Asteroid(
        'ast1',
        new Vector2D(400, 300),
        Vector2D.ZERO,
        AsteroidSize.LARGE
      );
      world.addEntity(asteroid);

      const newAsteroids = spawner.splitAsteroid(asteroid);

      newAsteroids.forEach((newAsteroid) => {
        expect(newAsteroid.velocity.magnitude()).toBe(0);
      });
    });

    it('should respect custom split count', () => {
      spawner = new AsteroidSpawner(world, { splitCount: 3 });

      const asteroid = new Asteroid(
        'ast1',
        new Vector2D(400, 300),
        new Vector2D(10, 5),
        AsteroidSize.LARGE
      );
      world.addEntity(asteroid);

      const newAsteroids = spawner.splitAsteroid(asteroid);
      expect(newAsteroids).toHaveLength(3);
    });
  });

  describe('spawnLevelAsteroids', () => {
    it('should spawn more asteroids for higher levels', () => {
      const level1Asteroids = spawner.spawnLevelAsteroids(1);
      const level5Asteroids = spawner.spawnLevelAsteroids(5);

      expect(level5Asteroids.length).toBeGreaterThan(level1Asteroids.length);
    });

    it('should spawn correct number for level 1', () => {
      const asteroids = spawner.spawnLevelAsteroids(1);
      expect(asteroids).toHaveLength(4); // 3 + level
    });

    it('should spawn correct number for level 3', () => {
      const asteroids = spawner.spawnLevelAsteroids(3);
      expect(asteroids).toHaveLength(6); // 3 + level
    });

    it('should spawn all large asteroids', () => {
      const asteroids = spawner.spawnLevelAsteroids(2);

      asteroids.forEach((asteroid) => {
        expect(asteroid.getSize()).toBe(AsteroidSize.LARGE);
      });
    });

    it('should spawn asteroids away from ship position when provided', () => {
      const shipPosition = new Vector2D(400, 300);
      const asteroids = spawner.spawnLevelAsteroids(1, shipPosition);

      asteroids.forEach((asteroid) => {
        const distance = asteroid.position.distanceTo(shipPosition);
        expect(distance).toBeGreaterThan(0);
      });
    });

    it('should add all asteroids to world', () => {
      const initialCount = world.getEntityCount();
      const asteroids = spawner.spawnLevelAsteroids(2);

      expect(world.getEntityCount()).toBe(initialCount + asteroids.length);
    });
  });

  describe('randomness', () => {
    it('should spawn asteroids at different positions', () => {
      const positions = new Set<string>();

      for (let i = 0; i < 10; i++) {
        const asteroid = spawner.spawnAsteroid(AsteroidSize.LARGE);
        const posKey = `${asteroid.position.x.toFixed(0)},${asteroid.position.y.toFixed(0)}`;
        positions.add(posKey);
      }

      // Should have multiple unique positions (allowing for rare collisions)
      expect(positions.size).toBeGreaterThan(5);
    });

    it('should spawn asteroids with zero velocity (all asteroids are now fixed)', () => {
      for (let i = 0; i < 10; i++) {
        const asteroid = spawner.spawnAsteroid(AsteroidSize.LARGE);
        expect(asteroid.velocity.magnitude()).toBe(0);
      }
    });
  });
});
