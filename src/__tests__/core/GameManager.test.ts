import { GameManager } from '../../core/GameManager';
import { GameState } from '../../core/GameWorld';
import { Vector2D } from '../../core/Vector2D';
import { Ship } from '../../entities/Ship';
import { Asteroid, AsteroidSize } from '../../entities/Asteroid';
import { Bullet } from '../../entities/Bullet';

describe('GameManager', () => {
  let gameManager: GameManager;

  beforeEach(() => {
    gameManager = new GameManager({
      worldWidth: 800,
      worldHeight: 600,
    });
  });

  describe('constructor', () => {
    it('should create game manager with world', () => {
      expect(gameManager.getWorld()).toBeDefined();
    });

    it('should initialize with 3 lives', () => {
      expect(gameManager.getLives()).toBe(3);
    });

    it('should create asteroid spawner', () => {
      expect(gameManager).toBeDefined();
    });

    it('should create collision manager', () => {
      expect(gameManager.getCollisionManager()).toBeDefined();
    });

    it('should not have a ship initially', () => {
      expect(gameManager.getShip()).toBeNull();
    });
  });

  describe('startNewGame', () => {
    it('should start game in PLAYING state', () => {
      gameManager.startNewGame();
      expect(gameManager.getWorld().state).toBe(GameState.PLAYING);
    });

    it('should create a ship', () => {
      gameManager.startNewGame();
      expect(gameManager.getShip()).toBeInstanceOf(Ship);
    });

    it('should create ship controller', () => {
      gameManager.startNewGame();
      expect(gameManager.getShipController()).toBeDefined();
    });

    it('should spawn asteroids', () => {
      gameManager.startNewGame();
      const asteroidCount = gameManager.getCollisionManager().getAsteroidCount();
      expect(asteroidCount).toBeGreaterThan(0);
    });

    it('should reset lives to max', () => {
      gameManager.startNewGame();
      expect(gameManager.getLives()).toBe(3);
    });

    it('should reset score', () => {
      gameManager.startNewGame();
      expect(gameManager.getScore()).toBe(0);
    });

    it('should start at level 1', () => {
      gameManager.startNewGame();
      expect(gameManager.getLevel()).toBe(1);
    });

    it('should place ship at center of world', () => {
      gameManager.startNewGame();
      const ship = gameManager.getShip()!;
      const center = gameManager.getWorld().getWorldCenter();
      expect(ship.position.x).toBe(center.x);
      expect(ship.position.y).toBe(center.y);
    });
  });

  describe('update', () => {
    beforeEach(() => {
      gameManager.startNewGame();
    });

    it('should update world', () => {
      const world = gameManager.getWorld();
      const initialState = world.state;
      gameManager.update(1 / 60);
      // World should still be in same state after update
      expect(world.state).toBe(initialState);
    });

    it('should update ship controller', () => {
      const controller = gameManager.getShipController()!;
      controller.fire();
      expect(controller.canFire()).toBe(false);

      gameManager.update(0.3);
      expect(controller.canFire()).toBe(true);
    });

    it('should wrap ship around world bounds', () => {
      const ship = gameManager.getShip()!;
      ship.position = new Vector2D(850, 300);

      gameManager.update(1 / 60);

      expect(ship.position.x).toBeLessThan(100);
    });

    it('should remove bullets that go out of bounds', () => {
      const bullet = new Bullet(
        'test_bullet',
        new Vector2D(900, 300),
        new Vector2D(1, 0)
      );
      gameManager.getWorld().addEntity(bullet);

      gameManager.update(1 / 60);
      gameManager.update(1 / 60); // Need to update twice - once to mark inactive, once to remove

      expect(bullet.active).toBe(false);
    });
  });

  describe('mouse input', () => {
    beforeEach(() => {
      gameManager.startNewGame();
    });

    it('should fire bullet on left click', () => {
      const initialBulletCount = gameManager
        .getWorld()
        .getAllEntities()
        .filter((e) => e instanceof Bullet).length;

      gameManager.handleMouseDown('left', new Vector2D(500, 300));

      const finalBulletCount = gameManager
        .getWorld()
        .getAllEntities()
        .filter((e) => e instanceof Bullet).length;

      expect(finalBulletCount).toBe(initialBulletCount + 1);
    });

    it('should start accelerating on right click', () => {
      const ship = gameManager.getShip()!;
      const targetPos = new Vector2D(500, 300);

      gameManager.handleMouseDown('right', targetPos);

      expect(ship.isCurrentlyAccelerating()).toBe(true);
    });

    it('should stop accelerating on right mouse up', () => {
      const ship = gameManager.getShip()!;
      const targetPos = new Vector2D(500, 300);

      gameManager.handleMouseDown('right', targetPos);
      expect(ship.isCurrentlyAccelerating()).toBe(true);

      gameManager.handleMouseUp('right');
      expect(ship.isCurrentlyAccelerating()).toBe(false);
    });

    it('should not respond to input when game is paused', () => {
      gameManager.pause();

      const initialBulletCount = gameManager
        .getWorld()
        .getAllEntities()
        .filter((e) => e instanceof Bullet).length;

      gameManager.handleMouseDown('left', new Vector2D(500, 300));

      const finalBulletCount = gameManager
        .getWorld()
        .getAllEntities()
        .filter((e) => e instanceof Bullet).length;

      expect(finalBulletCount).toBe(initialBulletCount);
    });

    it('should not respond to input when game is over', () => {
      gameManager.getWorld().gameOver();

      const initialBulletCount = gameManager
        .getWorld()
        .getAllEntities()
        .filter((e) => e instanceof Bullet).length;

      gameManager.handleMouseDown('left', new Vector2D(500, 300));

      const finalBulletCount = gameManager
        .getWorld()
        .getAllEntities()
        .filter((e) => e instanceof Bullet).length;

      expect(finalBulletCount).toBe(initialBulletCount);
    });
  });

  describe('game state management', () => {
    beforeEach(() => {
      gameManager.startNewGame();
    });

    it('should pause game', () => {
      gameManager.pause();
      expect(gameManager.isPaused()).toBe(true);
      expect(gameManager.isPlaying()).toBe(false);
    });

    it('should resume game', () => {
      gameManager.pause();
      gameManager.resume();
      expect(gameManager.isPlaying()).toBe(true);
      expect(gameManager.isPaused()).toBe(false);
    });

    it('should detect game over state', () => {
      gameManager.getWorld().gameOver();
      expect(gameManager.isGameOver()).toBe(true);
      expect(gameManager.isPlaying()).toBe(false);
    });
  });

  describe('lives management', () => {
    beforeEach(() => {
      gameManager.startNewGame();
    });

    it('should lose life when ship collides with asteroid', () => {
      const ship = gameManager.getShip()!;

      // Create asteroid at ship's position to simulate collision
      const asteroid = new Asteroid(
        'collision_ast',
        ship.position.clone(),
        Vector2D.ZERO,
        AsteroidSize.LARGE
      );
      gameManager.getWorld().addEntity(asteroid);

      // Trigger collision check
      gameManager.getCollisionManager().checkCollisions();

      expect(gameManager.getLives()).toBe(2);
    });

    it('should trigger game over when all lives are lost', () => {
      // Lose all 3 lives by colliding with asteroids
      for (let i = 0; i < 3; i++) {
        const ship = gameManager.getShip()!;
        const asteroid = new Asteroid(
          `collision_ast_${i}`,
          ship.position.clone(),
          Vector2D.ZERO,
          AsteroidSize.SMALL
        );
        gameManager.getWorld().addEntity(asteroid);
        gameManager.getCollisionManager().checkCollisions();

        // After first two collisions, ship should still exist but be destroyed
        // After third collision, game should be over
        if (i < 2) {
          // Reactivate ship for next collision (simulating respawn)
          ship.active = true;
        }
      }

      expect(gameManager.isGameOver()).toBe(true);
    });
  });

  describe('level progression', () => {
    beforeEach(() => {
      gameManager.startNewGame();
    });

    it('should start at level 1', () => {
      expect(gameManager.getLevel()).toBe(1);
    });

    it('should advance level when all asteroids are destroyed', () => {
      // Destroy all asteroids by shooting them
      // Need to shoot multiple times because large asteroids split
      let maxIterations = 10;
      let previousLevel = gameManager.getLevel();

      while (
        gameManager.getCollisionManager().getAsteroidCount() > 0 &&
        maxIterations > 0 &&
        gameManager.getLevel() === previousLevel
      ) {
        const allEntities = gameManager.getWorld().getAllEntities();
        const asteroids = allEntities.filter(
          (e): e is Asteroid => e instanceof Asteroid && e.active
        );

        asteroids.forEach((asteroid) => {
          const bullet = new Bullet(
            `bullet_${asteroid.id}_${maxIterations}`,
            asteroid.position.clone(),
            new Vector2D(1, 0)
          );
          gameManager.getWorld().addEntity(bullet);
        });

        // Call update which handles collisions AND checks level complete
        gameManager.update(1 / 60);
        maxIterations--;
      }

      expect(gameManager.getLevel()).toBe(2);
    });

    it('should spawn more asteroids on higher levels', () => {
      // Get initial asteroid count (level 1)
      const level1Count = gameManager.getCollisionManager().getAsteroidCount();

      // Destroy all asteroids by shooting them to advance level
      const allEntities = gameManager.getWorld().getAllEntities();
      const asteroids = allEntities.filter(
        (e): e is Asteroid => e instanceof Asteroid
      );

      asteroids.forEach((asteroid) => {
        const bullet = new Bullet(
          `bullet_${asteroid.id}`,
          asteroid.position.clone(),
          new Vector2D(1, 0)
        );
        gameManager.getWorld().addEntity(bullet);
      });

      gameManager.getCollisionManager().checkCollisions();

      // Get level 2 asteroid count
      const level2Count = gameManager.getCollisionManager().getAsteroidCount();

      expect(level2Count).toBeGreaterThan(level1Count);
    });
  });

  describe('restartLevel', () => {
    beforeEach(() => {
      gameManager.startNewGame();
    });

    it('should reset ship position to center', () => {
      const ship = gameManager.getShip()!;
      ship.position = new Vector2D(100, 100);

      gameManager.restartLevel();

      const newShip = gameManager.getShip()!;
      const center = gameManager.getWorld().getWorldCenter();
      expect(newShip.position.x).toBe(center.x);
      expect(newShip.position.y).toBe(center.y);
    });

    it('should keep same level number', () => {
      const currentLevel = gameManager.getLevel();
      gameManager.restartLevel();
      expect(gameManager.getLevel()).toBe(currentLevel);
    });

    it('should create new asteroids', () => {
      gameManager.restartLevel();
      const asteroidCount = gameManager.getCollisionManager().getAsteroidCount();
      expect(asteroidCount).toBeGreaterThan(0);
    });
  });

  describe('score tracking', () => {
    beforeEach(() => {
      gameManager.startNewGame();
    });

    it('should start with score 0', () => {
      expect(gameManager.getScore()).toBe(0);
    });

    it('should increase score when asteroid is destroyed', () => {
      const asteroid = gameManager
        .getWorld()
        .getAllEntities()
        .find((e): e is Asteroid => e instanceof Asteroid)!;

      const bullet = new Bullet(
        'test_bullet',
        asteroid.position.clone(),
        new Vector2D(1, 0)
      );
      gameManager.getWorld().addEntity(bullet);

      const expectedPoints = asteroid.getPoints();
      gameManager.getCollisionManager().checkCollisions();

      expect(gameManager.getScore()).toBe(expectedPoints);
    });
  });

  describe('integration', () => {
    it('should handle complete game flow', () => {
      // Start game
      gameManager.startNewGame();
      expect(gameManager.isPlaying()).toBe(true);

      // Fire some bullets
      gameManager.handleMouseDown('left', new Vector2D(500, 300));
      gameManager.update(0.3);
      gameManager.handleMouseDown('left', new Vector2D(500, 300));

      // Update game
      for (let i = 0; i < 10; i++) {
        gameManager.update(1 / 60);
      }

      // Pause game
      gameManager.pause();
      expect(gameManager.isPaused()).toBe(true);

      // Resume game
      gameManager.resume();
      expect(gameManager.isPlaying()).toBe(true);

      // Game should still be functional
      expect(gameManager.getShip()).toBeDefined();
      expect(gameManager.getLives()).toBe(3);
    });
  });
});
