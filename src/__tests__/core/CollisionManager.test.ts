import { CollisionManager } from '../../core/CollisionManager';
import { GameWorld } from '../../core/GameWorld';
import { AsteroidSpawner } from '../../core/AsteroidSpawner';
import { Ship } from '../../entities/Ship';
import { Bullet } from '../../entities/Bullet';
import { Asteroid, AsteroidSize } from '../../entities/Asteroid';
import { Vector2D } from '../../core/Vector2D';

describe('CollisionManager', () => {
  let world: GameWorld;
  let spawner: AsteroidSpawner;
  let collisionManager: CollisionManager;

  beforeEach(() => {
    world = new GameWorld({ worldWidth: 800, worldHeight: 600 });
    spawner = new AsteroidSpawner(world);
  });

  describe('constructor', () => {
    it('should create collision manager', () => {
      collisionManager = new CollisionManager(world, spawner);
      expect(collisionManager).toBeDefined();
    });

    it('should accept event handlers', () => {
      const onShipDestroyed = jest.fn();
      const onAsteroidDestroyed = jest.fn();

      collisionManager = new CollisionManager(world, spawner, {
        onShipDestroyed,
        onAsteroidDestroyed,
      });

      expect(collisionManager).toBeDefined();
    });
  });

  describe('bullet-asteroid collisions', () => {
    beforeEach(() => {
      collisionManager = new CollisionManager(world, spawner);
    });

    it('should detect collision between bullet and asteroid', () => {
      const bullet = new Bullet(
        'bullet1',
        new Vector2D(100, 100),
        new Vector2D(1, 0)
      );
      const asteroid = new Asteroid(
        'ast1',
        new Vector2D(110, 100),
        Vector2D.ZERO,
        AsteroidSize.SMALL
      );

      world.addEntity(bullet);
      world.addEntity(asteroid);

      collisionManager.checkCollisions();

      expect(bullet.active).toBe(false);
      expect(asteroid.active).toBe(false);
    });

    it('should not detect collision when entities are far apart', () => {
      const bullet = new Bullet(
        'bullet1',
        new Vector2D(100, 100),
        new Vector2D(1, 0)
      );
      const asteroid = new Asteroid(
        'ast1',
        new Vector2D(300, 300),
        Vector2D.ZERO,
        AsteroidSize.SMALL
      );

      world.addEntity(bullet);
      world.addEntity(asteroid);

      collisionManager.checkCollisions();

      expect(bullet.active).toBe(true);
      expect(asteroid.active).toBe(true);
    });

    it('should destroy both bullet and asteroid on collision', () => {
      const bullet = new Bullet(
        'bullet1',
        new Vector2D(100, 100),
        new Vector2D(1, 0)
      );
      const asteroid = new Asteroid(
        'ast1',
        new Vector2D(105, 100),
        Vector2D.ZERO,
        AsteroidSize.SMALL
      );

      world.addEntity(bullet);
      world.addEntity(asteroid);

      collisionManager.checkCollisions();

      expect(bullet.active).toBe(false);
      expect(asteroid.active).toBe(false);
    });

    it('should award points when asteroid is destroyed', () => {
      const bullet = new Bullet(
        'bullet1',
        new Vector2D(100, 100),
        new Vector2D(1, 0)
      );
      const asteroid = new Asteroid(
        'ast1',
        new Vector2D(105, 100),
        Vector2D.ZERO,
        AsteroidSize.SMALL
      );

      world.addEntity(bullet);
      world.addEntity(asteroid);

      const initialScore = world.score;
      collisionManager.checkCollisions();

      expect(world.score).toBe(initialScore + asteroid.getPoints());
    });

    it('should split large asteroid into medium asteroids', () => {
      const bullet = new Bullet(
        'bullet1',
        new Vector2D(100, 100),
        new Vector2D(1, 0)
      );
      const asteroid = new Asteroid(
        'ast1',
        new Vector2D(120, 100),
        Vector2D.ZERO,
        AsteroidSize.LARGE
      );

      world.addEntity(bullet);
      world.addEntity(asteroid);

      collisionManager.checkCollisions();

      // Check that 2 new medium asteroids were created
      const allEntities = world.getAllEntities();
      const mediumAsteroids = allEntities.filter(
        (e): e is Asteroid => e instanceof Asteroid && e.getSize() === AsteroidSize.MEDIUM && e.active
      );

      expect(mediumAsteroids.length).toBe(2);
    });

    it('should split medium asteroid into small asteroids', () => {
      const bullet = new Bullet(
        'bullet1',
        new Vector2D(100, 100),
        new Vector2D(1, 0)
      );
      const asteroid = new Asteroid(
        'ast1',
        new Vector2D(115, 100),
        Vector2D.ZERO,
        AsteroidSize.MEDIUM
      );

      world.addEntity(bullet);
      world.addEntity(asteroid);

      collisionManager.checkCollisions();

      const allEntities = world.getAllEntities();
      const smallAsteroids = allEntities.filter(
        (e): e is Asteroid => e instanceof Asteroid && e.getSize() === AsteroidSize.SMALL
      );

      expect(smallAsteroids.length).toBe(2);
    });

    it('should not split small asteroids', () => {
      const bullet = new Bullet(
        'bullet1',
        new Vector2D(100, 100),
        new Vector2D(1, 0)
      );
      const asteroid = new Asteroid(
        'ast1',
        new Vector2D(105, 100),
        Vector2D.ZERO,
        AsteroidSize.SMALL
      );

      world.addEntity(bullet);
      world.addEntity(asteroid);

      collisionManager.checkCollisions();

      // Both entities destroyed, no new asteroids created
      const allEntities = world.getAllEntities();
      const activeSmallAsteroids = allEntities.filter(
        (e): e is Asteroid => e instanceof Asteroid && e.getSize() === AsteroidSize.SMALL && e.active
      );

      expect(activeSmallAsteroids.length).toBe(0);
    });

    it('should trigger onAsteroidDestroyed event', () => {
      const onAsteroidDestroyed = jest.fn();
      collisionManager = new CollisionManager(world, spawner, {
        onAsteroidDestroyed,
      });

      const bullet = new Bullet(
        'bullet1',
        new Vector2D(100, 100),
        new Vector2D(1, 0)
      );
      const asteroid = new Asteroid(
        'ast1',
        new Vector2D(105, 100),
        Vector2D.ZERO,
        AsteroidSize.SMALL
      );

      world.addEntity(bullet);
      world.addEntity(asteroid);

      collisionManager.checkCollisions();

      expect(onAsteroidDestroyed).toHaveBeenCalledTimes(1);
      expect(onAsteroidDestroyed).toHaveBeenCalledWith(asteroid);
    });

    it('should handle multiple bullet-asteroid collisions in one check', () => {
      const bullet1 = new Bullet(
        'bullet1',
        new Vector2D(100, 100),
        new Vector2D(1, 0)
      );
      const bullet2 = new Bullet(
        'bullet2',
        new Vector2D(200, 200),
        new Vector2D(1, 0)
      );
      const asteroid1 = new Asteroid(
        'ast1',
        new Vector2D(105, 100),
        Vector2D.ZERO,
        AsteroidSize.SMALL
      );
      const asteroid2 = new Asteroid(
        'ast2',
        new Vector2D(205, 200),
        Vector2D.ZERO,
        AsteroidSize.SMALL
      );

      world.addEntity(bullet1);
      world.addEntity(bullet2);
      world.addEntity(asteroid1);
      world.addEntity(asteroid2);

      collisionManager.checkCollisions();

      expect(bullet1.active).toBe(false);
      expect(bullet2.active).toBe(false);
      expect(asteroid1.active).toBe(false);
      expect(asteroid2.active).toBe(false);
    });
  });

  describe('ship-asteroid collisions', () => {
    beforeEach(() => {
      collisionManager = new CollisionManager(world, spawner);
    });

    it('should detect collision between ship and asteroid', () => {
      const ship = new Ship('ship1', new Vector2D(100, 100));
      const asteroid = new Asteroid(
        'ast1',
        new Vector2D(120, 100),
        Vector2D.ZERO,
        AsteroidSize.LARGE
      );

      world.addEntity(ship);
      world.addEntity(asteroid);

      collisionManager.checkCollisions();

      expect(ship.active).toBe(false);
    });

    it('should not detect collision when ship and asteroid are far apart', () => {
      const ship = new Ship('ship1', new Vector2D(100, 100));
      const asteroid = new Asteroid(
        'ast1',
        new Vector2D(300, 300),
        Vector2D.ZERO,
        AsteroidSize.LARGE
      );

      world.addEntity(ship);
      world.addEntity(asteroid);

      collisionManager.checkCollisions();

      expect(ship.active).toBe(true);
    });

    it('should destroy ship on collision with asteroid', () => {
      const ship = new Ship('ship1', new Vector2D(100, 100));
      const asteroid = new Asteroid(
        'ast1',
        new Vector2D(120, 100),
        Vector2D.ZERO,
        AsteroidSize.LARGE
      );

      world.addEntity(ship);
      world.addEntity(asteroid);

      collisionManager.checkCollisions();

      expect(ship.active).toBe(false);
    });

    it('should trigger onShipDestroyed event', () => {
      const onShipDestroyed = jest.fn();
      collisionManager = new CollisionManager(world, spawner, {
        onShipDestroyed,
      });

      const ship = new Ship('ship1', new Vector2D(100, 100));
      const asteroid = new Asteroid(
        'ast1',
        new Vector2D(120, 100),
        Vector2D.ZERO,
        AsteroidSize.LARGE
      );

      world.addEntity(ship);
      world.addEntity(asteroid);

      collisionManager.checkCollisions();

      expect(onShipDestroyed).toHaveBeenCalledTimes(1);
    });

    it('should not destroy asteroid when ship collides with it', () => {
      const ship = new Ship('ship1', new Vector2D(100, 100));
      const asteroid = new Asteroid(
        'ast1',
        new Vector2D(120, 100),
        Vector2D.ZERO,
        AsteroidSize.LARGE
      );

      world.addEntity(ship);
      world.addEntity(asteroid);

      collisionManager.checkCollisions();

      // Ship destroyed, asteroid remains
      expect(ship.active).toBe(false);
      expect(asteroid.active).toBe(true);
    });
  });

  describe('getAsteroidCount', () => {
    beforeEach(() => {
      collisionManager = new CollisionManager(world, spawner);
    });

    it('should return 0 when no asteroids exist', () => {
      expect(collisionManager.getAsteroidCount()).toBe(0);
    });

    it('should return correct count of active asteroids', () => {
      const ast1 = new Asteroid(
        'ast1',
        Vector2D.ZERO,
        Vector2D.ZERO,
        AsteroidSize.LARGE
      );
      const ast2 = new Asteroid(
        'ast2',
        Vector2D.ZERO,
        Vector2D.ZERO,
        AsteroidSize.MEDIUM
      );

      world.addEntity(ast1);
      world.addEntity(ast2);

      expect(collisionManager.getAsteroidCount()).toBe(2);
    });

    it('should not count inactive asteroids', () => {
      const ast1 = new Asteroid(
        'ast1',
        Vector2D.ZERO,
        Vector2D.ZERO,
        AsteroidSize.LARGE
      );
      const ast2 = new Asteroid(
        'ast2',
        Vector2D.ZERO,
        Vector2D.ZERO,
        AsteroidSize.MEDIUM
      );

      world.addEntity(ast1);
      world.addEntity(ast2);

      ast1.destroy();

      expect(collisionManager.getAsteroidCount()).toBe(1);
    });
  });

  describe('isLevelComplete', () => {
    beforeEach(() => {
      collisionManager = new CollisionManager(world, spawner);
    });

    it('should return true when no asteroids exist', () => {
      expect(collisionManager.isLevelComplete()).toBe(true);
    });

    it('should return false when asteroids exist', () => {
      const asteroid = new Asteroid(
        'ast1',
        Vector2D.ZERO,
        Vector2D.ZERO,
        AsteroidSize.LARGE
      );
      world.addEntity(asteroid);

      expect(collisionManager.isLevelComplete()).toBe(false);
    });

    it('should return true when all asteroids are destroyed', () => {
      const asteroid = new Asteroid(
        'ast1',
        Vector2D.ZERO,
        Vector2D.ZERO,
        AsteroidSize.LARGE
      );
      world.addEntity(asteroid);
      asteroid.destroy();

      expect(collisionManager.isLevelComplete()).toBe(true);
    });
  });

  describe('no collisions', () => {
    beforeEach(() => {
      collisionManager = new CollisionManager(world, spawner);
    });

    it('should not trigger events when no collisions occur', () => {
      const onShipDestroyed = jest.fn();
      const onAsteroidDestroyed = jest.fn();

      collisionManager = new CollisionManager(world, spawner, {
        onShipDestroyed,
        onAsteroidDestroyed,
      });

      const ship = new Ship('ship1', new Vector2D(100, 100));
      const bullet = new Bullet(
        'bullet1',
        new Vector2D(200, 200),
        new Vector2D(1, 0)
      );
      const asteroid = new Asteroid(
        'ast1',
        new Vector2D(400, 400),
        Vector2D.ZERO,
        AsteroidSize.LARGE
      );

      world.addEntity(ship);
      world.addEntity(bullet);
      world.addEntity(asteroid);

      collisionManager.checkCollisions();

      expect(onShipDestroyed).not.toHaveBeenCalled();
      expect(onAsteroidDestroyed).not.toHaveBeenCalled();
    });
  });
});
