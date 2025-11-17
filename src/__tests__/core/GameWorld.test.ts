import { GameWorld, GameState, GameConfig } from '../../core/GameWorld';
import { Entity, EntityType } from '../../core/Entity';
import { Vector2D } from '../../core/Vector2D';

// Mock entity for testing
class MockEntity extends Entity {
  update(deltaTime: number): void {
    this.position = this.position.add(this.velocity.multiply(deltaTime));
  }

  getType(): EntityType {
    return EntityType.ASTEROID;
  }
}

describe('GameWorld', () => {
  let config: GameConfig;
  let world: GameWorld;

  beforeEach(() => {
    config = {
      worldWidth: 800,
      worldHeight: 600,
    };
    world = new GameWorld(config);
  });

  describe('constructor', () => {
    it('should initialize with READY state', () => {
      expect(world.state).toBe(GameState.READY);
    });

    it('should initialize with score 0', () => {
      expect(world.score).toBe(0);
    });

    it('should initialize with level 1', () => {
      expect(world.level).toBe(1);
    });

    it('should store world dimensions', () => {
      expect(world.worldWidth).toBe(800);
      expect(world.worldHeight).toBe(600);
    });
  });

  describe('entity management', () => {
    it('should add entity to world', () => {
      const entity = new MockEntity('test1', new Vector2D(100, 100));
      world.addEntity(entity);
      expect(world.getEntity('test1')).toBe(entity);
    });

    it('should remove entity from world', () => {
      const entity = new MockEntity('test1', new Vector2D(100, 100));
      world.addEntity(entity);
      world.removeEntity('test1');
      expect(world.getEntity('test1')).toBeUndefined();
    });

    it('should return undefined for non-existent entity', () => {
      expect(world.getEntity('nonexistent')).toBeUndefined();
    });

    it('should get all entities', () => {
      const entity1 = new MockEntity('test1', new Vector2D(100, 100));
      const entity2 = new MockEntity('test2', new Vector2D(200, 200));
      world.addEntity(entity1);
      world.addEntity(entity2);
      const entities = world.getAllEntities();
      expect(entities).toHaveLength(2);
      expect(entities).toContain(entity1);
      expect(entities).toContain(entity2);
    });

    it('should count entities correctly', () => {
      expect(world.getEntityCount()).toBe(0);
      world.addEntity(new MockEntity('test1', new Vector2D(100, 100)));
      expect(world.getEntityCount()).toBe(1);
      world.addEntity(new MockEntity('test2', new Vector2D(200, 200)));
      expect(world.getEntityCount()).toBe(2);
    });

    it('should generate unique entity IDs', () => {
      const id1 = world.generateEntityId('test');
      const id2 = world.generateEntityId('test');
      expect(id1).not.toBe(id2);
      expect(id1).toContain('test');
      expect(id2).toContain('test');
    });
  });

  describe('game state management', () => {
    it('should start game', () => {
      world.startGame();
      expect(world.state).toBe(GameState.PLAYING);
    });

    it('should pause game when playing', () => {
      world.startGame();
      world.pauseGame();
      expect(world.state).toBe(GameState.PAUSED);
    });

    it('should not pause game when not playing', () => {
      world.pauseGame();
      expect(world.state).toBe(GameState.READY);
    });

    it('should resume game when paused', () => {
      world.startGame();
      world.pauseGame();
      world.resumeGame();
      expect(world.state).toBe(GameState.PLAYING);
    });

    it('should not resume game when not paused', () => {
      world.resumeGame();
      expect(world.state).toBe(GameState.READY);
    });

    it('should end game', () => {
      world.startGame();
      world.gameOver();
      expect(world.state).toBe(GameState.GAME_OVER);
    });

    it('should reset game state and score when starting', () => {
      world.addScore(100);
      world.nextLevel();
      world.startGame();
      expect(world.score).toBe(0);
      expect(world.level).toBe(1);
    });
  });

  describe('score management', () => {
    it('should add points to score', () => {
      world.addScore(10);
      expect(world.score).toBe(10);
      world.addScore(20);
      expect(world.score).toBe(30);
    });

    it('should advance level', () => {
      expect(world.level).toBe(1);
      world.nextLevel();
      expect(world.level).toBe(2);
    });
  });

  describe('update', () => {
    it('should not update entities when not playing', () => {
      const entity = new MockEntity(
        'test1',
        new Vector2D(100, 100),
        new Vector2D(10, 0)
      );
      world.addEntity(entity);
      world.update(1);
      expect(entity.position.x).toBe(100);
    });

    it('should update entities when playing', () => {
      const entity = new MockEntity(
        'test1',
        new Vector2D(100, 100),
        new Vector2D(10, 0)
      );
      world.addEntity(entity);
      world.startGame();
      world.update(1);
      expect(entity.position.x).toBe(110);
    });

    it('should remove inactive entities', () => {
      const entity = new MockEntity('test1', new Vector2D(100, 100));
      world.addEntity(entity);
      world.startGame();
      entity.destroy();
      world.update(1);
      expect(world.getEntity('test1')).toBeUndefined();
      expect(world.getEntityCount()).toBe(0);
    });

    it('should not update inactive entities', () => {
      const entity = new MockEntity(
        'test1',
        new Vector2D(100, 100),
        new Vector2D(10, 0)
      );
      world.addEntity(entity);
      world.startGame();
      entity.destroy();
      world.update(1);
      expect(entity.position.x).toBe(100); // Position shouldn't change
    });
  });

  describe('reset', () => {
    it('should clear all entities', () => {
      world.addEntity(new MockEntity('test1', new Vector2D(100, 100)));
      world.addEntity(new MockEntity('test2', new Vector2D(200, 200)));
      world.reset();
      expect(world.getEntityCount()).toBe(0);
    });

    it('should reset game state', () => {
      world.startGame();
      world.reset();
      expect(world.state).toBe(GameState.READY);
    });

    it('should reset score and level', () => {
      world.addScore(100);
      world.nextLevel();
      world.reset();
      expect(world.score).toBe(0);
      expect(world.level).toBe(1);
    });
  });

  describe('getWorldCenter', () => {
    it('should return center of world', () => {
      const center = world.getWorldCenter();
      expect(center.x).toBe(400);
      expect(center.y).toBe(300);
    });
  });
});
