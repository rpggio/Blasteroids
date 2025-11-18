/**
 * A 2D vector class for position, velocity, and acceleration calculations.
 * Immutable by default to prevent accidental mutations.
 */
export class Vector2D {
  constructor(public readonly x: number, public readonly y: number) {}

  /**
   * Add two vectors
   */
  add(other: Vector2D): Vector2D {
    return new Vector2D(this.x + other.x, this.y + other.y);
  }

  /**
   * Subtract another vector from this one
   */
  subtract(other: Vector2D): Vector2D {
    return new Vector2D(this.x - other.x, this.y - other.y);
  }

  /**
   * Multiply vector by a scalar
   */
  multiply(scalar: number): Vector2D {
    return new Vector2D(this.x * scalar, this.y * scalar);
  }

  /**
   * Divide vector by a scalar
   */
  divide(scalar: number): Vector2D {
    if (scalar === 0) {
      throw new Error('Cannot divide by zero');
    }
    return new Vector2D(this.x / scalar, this.y / scalar);
  }

  /**
   * Calculate the magnitude (length) of the vector
   */
  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * Calculate the squared magnitude (avoids sqrt for performance)
   */
  magnitudeSquared(): number {
    return this.x * this.x + this.y * this.y;
  }

  /**
   * Normalize the vector (make it unit length)
   */
  normalize(): Vector2D {
    const mag = this.magnitude();
    if (mag === 0) {
      return new Vector2D(0, 0);
    }
    return this.divide(mag);
  }

  /**
   * Calculate the dot product with another vector
   */
  dot(other: Vector2D): number {
    return this.x * other.x + this.y * other.y;
  }

  /**
   * Calculate the distance to another vector
   */
  distanceTo(other: Vector2D): number {
    return this.subtract(other).magnitude();
  }

  /**
   * Calculate the squared distance to another vector
   */
  distanceToSquared(other: Vector2D): number {
    return this.subtract(other).magnitudeSquared();
  }

  /**
   * Rotate the vector by an angle (in radians)
   */
  rotate(angle: number): Vector2D {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Vector2D(
      this.x * cos - this.y * sin,
      this.x * sin + this.y * cos
    );
  }

  /**
   * Get the angle of this vector (in radians)
   */
  angle(): number {
    return Math.atan2(this.y, this.x);
  }

  /**
   * Limit the magnitude of the vector
   */
  limit(max: number): Vector2D {
    const mag = this.magnitude();
    if (mag > max) {
      return this.normalize().multiply(max);
    }
    return this;
  }

  /**
   * Create a vector from an angle and magnitude
   */
  static fromAngle(angle: number, magnitude: number = 1): Vector2D {
    return new Vector2D(Math.cos(angle) * magnitude, Math.sin(angle) * magnitude);
  }

  /**
   * Zero vector constant
   */
  static get ZERO(): Vector2D {
    return new Vector2D(0, 0);
  }

  /**
   * Check if two vectors are approximately equal
   */
  equals(other: Vector2D, epsilon: number = 0.0001): boolean {
    return (
      Math.abs(this.x - other.x) < epsilon &&
      Math.abs(this.y - other.y) < epsilon
    );
  }

  /**
   * Create a copy of this vector
   */
  clone(): Vector2D {
    return new Vector2D(this.x, this.y);
  }

  toString(): string {
    return `Vector2D(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
  }
}
