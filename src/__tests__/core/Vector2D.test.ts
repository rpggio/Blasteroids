import { Vector2D } from '../../core/Vector2D';

describe('Vector2D', () => {
  describe('constructor', () => {
    it('should create a vector with x and y components', () => {
      const v = new Vector2D(3, 4);
      expect(v.x).toBe(3);
      expect(v.y).toBe(4);
    });
  });

  describe('add', () => {
    it('should add two vectors correctly', () => {
      const v1 = new Vector2D(1, 2);
      const v2 = new Vector2D(3, 4);
      const result = v1.add(v2);
      expect(result.x).toBe(4);
      expect(result.y).toBe(6);
    });

    it('should not mutate the original vectors', () => {
      const v1 = new Vector2D(1, 2);
      const v2 = new Vector2D(3, 4);
      v1.add(v2);
      expect(v1.x).toBe(1);
      expect(v1.y).toBe(2);
    });
  });

  describe('subtract', () => {
    it('should subtract two vectors correctly', () => {
      const v1 = new Vector2D(5, 7);
      const v2 = new Vector2D(2, 3);
      const result = v1.subtract(v2);
      expect(result.x).toBe(3);
      expect(result.y).toBe(4);
    });
  });

  describe('multiply', () => {
    it('should multiply vector by scalar', () => {
      const v = new Vector2D(3, 4);
      const result = v.multiply(2);
      expect(result.x).toBe(6);
      expect(result.y).toBe(8);
    });

    it('should handle negative scalars', () => {
      const v = new Vector2D(3, 4);
      const result = v.multiply(-1);
      expect(result.x).toBe(-3);
      expect(result.y).toBe(-4);
    });
  });

  describe('divide', () => {
    it('should divide vector by scalar', () => {
      const v = new Vector2D(6, 8);
      const result = v.divide(2);
      expect(result.x).toBe(3);
      expect(result.y).toBe(4);
    });

    it('should throw error when dividing by zero', () => {
      const v = new Vector2D(3, 4);
      expect(() => v.divide(0)).toThrow('Cannot divide by zero');
    });
  });

  describe('magnitude', () => {
    it('should calculate magnitude correctly', () => {
      const v = new Vector2D(3, 4);
      expect(v.magnitude()).toBe(5);
    });

    it('should return 0 for zero vector', () => {
      const v = Vector2D.ZERO;
      expect(v.magnitude()).toBe(0);
    });
  });

  describe('magnitudeSquared', () => {
    it('should calculate squared magnitude correctly', () => {
      const v = new Vector2D(3, 4);
      expect(v.magnitudeSquared()).toBe(25);
    });
  });

  describe('normalize', () => {
    it('should create a unit vector', () => {
      const v = new Vector2D(3, 4);
      const normalized = v.normalize();
      expect(normalized.magnitude()).toBeCloseTo(1, 5);
    });

    it('should maintain direction', () => {
      const v = new Vector2D(3, 4);
      const normalized = v.normalize();
      expect(normalized.x).toBeCloseTo(0.6, 5);
      expect(normalized.y).toBeCloseTo(0.8, 5);
    });

    it('should return zero vector when normalizing zero vector', () => {
      const v = Vector2D.ZERO;
      const normalized = v.normalize();
      expect(normalized.x).toBe(0);
      expect(normalized.y).toBe(0);
    });
  });

  describe('dot', () => {
    it('should calculate dot product correctly', () => {
      const v1 = new Vector2D(2, 3);
      const v2 = new Vector2D(4, 5);
      expect(v1.dot(v2)).toBe(23); // 2*4 + 3*5 = 23
    });

    it('should return 0 for perpendicular vectors', () => {
      const v1 = new Vector2D(1, 0);
      const v2 = new Vector2D(0, 1);
      expect(v1.dot(v2)).toBe(0);
    });
  });

  describe('distanceTo', () => {
    it('should calculate distance between two vectors', () => {
      const v1 = new Vector2D(0, 0);
      const v2 = new Vector2D(3, 4);
      expect(v1.distanceTo(v2)).toBe(5);
    });
  });

  describe('distanceToSquared', () => {
    it('should calculate squared distance between two vectors', () => {
      const v1 = new Vector2D(0, 0);
      const v2 = new Vector2D(3, 4);
      expect(v1.distanceToSquared(v2)).toBe(25);
    });
  });

  describe('rotate', () => {
    it('should rotate vector by 90 degrees', () => {
      const v = new Vector2D(1, 0);
      const rotated = v.rotate(Math.PI / 2);
      expect(rotated.x).toBeCloseTo(0, 5);
      expect(rotated.y).toBeCloseTo(1, 5);
    });

    it('should rotate vector by 180 degrees', () => {
      const v = new Vector2D(1, 0);
      const rotated = v.rotate(Math.PI);
      expect(rotated.x).toBeCloseTo(-1, 5);
      expect(rotated.y).toBeCloseTo(0, 5);
    });
  });

  describe('angle', () => {
    it('should return correct angle for unit vector pointing right', () => {
      const v = new Vector2D(1, 0);
      expect(v.angle()).toBe(0);
    });

    it('should return correct angle for unit vector pointing up', () => {
      const v = new Vector2D(0, 1);
      expect(v.angle()).toBeCloseTo(Math.PI / 2, 5);
    });
  });

  describe('limit', () => {
    it('should limit magnitude when exceeding max', () => {
      const v = new Vector2D(3, 4); // magnitude = 5
      const limited = v.limit(3);
      expect(limited.magnitude()).toBeCloseTo(3, 5);
    });

    it('should not change vector when under limit', () => {
      const v = new Vector2D(3, 4); // magnitude = 5
      const limited = v.limit(10);
      expect(limited.x).toBe(3);
      expect(limited.y).toBe(4);
    });
  });

  describe('fromAngle', () => {
    it('should create unit vector from angle', () => {
      const v = Vector2D.fromAngle(0);
      expect(v.x).toBeCloseTo(1, 5);
      expect(v.y).toBeCloseTo(0, 5);
    });

    it('should create vector with specified magnitude', () => {
      const v = Vector2D.fromAngle(Math.PI / 2, 5);
      expect(v.x).toBeCloseTo(0, 5);
      expect(v.y).toBeCloseTo(5, 5);
    });
  });

  describe('ZERO', () => {
    it('should return zero vector', () => {
      const zero = Vector2D.ZERO;
      expect(zero.x).toBe(0);
      expect(zero.y).toBe(0);
    });
  });

  describe('equals', () => {
    it('should return true for equal vectors', () => {
      const v1 = new Vector2D(1, 2);
      const v2 = new Vector2D(1, 2);
      expect(v1.equals(v2)).toBe(true);
    });

    it('should return true for approximately equal vectors', () => {
      const v1 = new Vector2D(1, 2);
      const v2 = new Vector2D(1.00001, 2.00001);
      expect(v1.equals(v2)).toBe(true);
    });

    it('should return false for different vectors', () => {
      const v1 = new Vector2D(1, 2);
      const v2 = new Vector2D(3, 4);
      expect(v1.equals(v2)).toBe(false);
    });
  });

  describe('clone', () => {
    it('should create a copy of the vector', () => {
      const v1 = new Vector2D(3, 4);
      const v2 = v1.clone();
      expect(v2.x).toBe(3);
      expect(v2.y).toBe(4);
      expect(v2).not.toBe(v1);
    });
  });
});
