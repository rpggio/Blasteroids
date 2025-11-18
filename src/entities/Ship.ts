import { Entity, EntityType } from '../core/Entity';
import { Vector2D } from '../core/Vector2D';

/**
 * Configuration for the ship
 */
export interface ShipConfig {
  maxSpeed?: number;
  acceleration?: number;
  rotationSpeed?: number;
  drag?: number;
}

/**
 * The player's ship entity.
 * Handles movement physics and rotation.
 */
export class Ship extends Entity {
  private maxSpeed: number;
  private accelerationMagnitude: number;
  private rotationSpeed: number;
  private drag: number;
  private isAccelerating: boolean;
  private targetPosition: Vector2D | null;

  constructor(
    id: string,
    position: Vector2D,
    config: ShipConfig = {}
  ) {
    super(id, position, Vector2D.ZERO, 0, 15);

    this.maxSpeed = config.maxSpeed ?? 300;
    this.accelerationMagnitude = config.acceleration ?? 200;
    this.rotationSpeed = config.rotationSpeed ?? 3;
    this.drag = config.drag ?? 0.98;
    this.isAccelerating = false;
    this.targetPosition = null;
  }

  getType(): EntityType {
    return EntityType.SHIP;
  }

  /**
   * Start accelerating towards a target position (right-click)
   */
  accelerateTowards(targetPosition: Vector2D): void {
    this.targetPosition = targetPosition;
    this.isAccelerating = true;
  }

  /**
   * Stop accelerating
   */
  stopAccelerating(): void {
    this.isAccelerating = false;
    this.targetPosition = null;
  }

  /**
   * Update ship physics
   */
  update(deltaTime: number, mousePosition?: Vector2D): void {
    if (!this.active) {
      return;
    }

    // Rotate ship to face mouse position if provided
    if (mousePosition) {
      const directionToMouse = mousePosition.subtract(this.position);
      const targetRotation = directionToMouse.angle();

      // Smoothly rotate towards target at the limit of rotation speed
      let rotationDiff = targetRotation - this.rotation;

      // Normalize rotation difference to [-PI, PI]
      while (rotationDiff > Math.PI) rotationDiff -= Math.PI * 2;
      while (rotationDiff < -Math.PI) rotationDiff += Math.PI * 2;

      // Apply rotation at the limit of rotation speed
      const maxRotationThisFrame = this.rotationSpeed * deltaTime;
      if (Math.abs(rotationDiff) <= maxRotationThisFrame) {
        this.rotation = targetRotation;
      } else {
        this.rotation += Math.sign(rotationDiff) * maxRotationThisFrame;
      }
    }

    // Handle acceleration towards target
    if (this.isAccelerating && this.targetPosition) {
      // Calculate direction to target
      const directionToTarget = this.targetPosition.subtract(this.position).normalize();

      // Apply acceleration
      const acceleration = directionToTarget.multiply(this.accelerationMagnitude * deltaTime);
      this.velocity = this.velocity.add(acceleration);
    }

    // Apply drag (framerate-independent exponential decay)
    this.velocity = this.velocity.multiply(Math.pow(this.drag, deltaTime));

    // Limit speed
    if (this.velocity.magnitude() > this.maxSpeed) {
      this.velocity = this.velocity.normalize().multiply(this.maxSpeed);
    }

    // Update position
    this.position = this.position.add(this.velocity.multiply(deltaTime));
  }

  /**
   * Get the current speed
   */
  getSpeed(): number {
    return this.velocity.magnitude();
  }

  /**
   * Get the direction the ship is facing as a unit vector
   */
  getDirection(): Vector2D {
    return Vector2D.fromAngle(this.rotation);
  }

  /**
   * Check if ship is currently accelerating
   */
  isCurrentlyAccelerating(): boolean {
    return this.isAccelerating;
  }

  /**
   * Get the position the ship is accelerating towards
   */
  getTargetPosition(): Vector2D | null {
    return this.targetPosition;
  }

  /**
   * Set the ship's velocity directly (useful for testing)
   */
  setVelocity(velocity: Vector2D): void {
    this.velocity = velocity;
  }

  /**
   * Reset the ship to initial state
   */
  reset(position: Vector2D): void {
    this.position = position;
    this.velocity = Vector2D.ZERO;
    this.rotation = 0;
    this.active = true;
    this.isAccelerating = false;
    this.targetPosition = null;
  }
}
