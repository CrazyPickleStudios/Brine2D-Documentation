---
title: Shapes & Bodies
description: PhysicsBodyComponent, shape types, materials, triggers, sub-shapes, and compound bodies in Brine2D
---

# Shapes & Bodies

All physics in Brine2D goes through `PhysicsBodyComponent`. Attach it to any entity alongside a `TransformComponent` and the `Box2DPhysicsSystem` will build and maintain the underlying Box2D body automatically.

---

## Basic Setup

```csharp
var entity = world.CreateEntity("Crate");
entity.AddComponent<TransformComponent>(t => t.Position = new Vector2(400, 100));
entity.AddComponent<PhysicsBodyComponent>(b =>
{
    b.Shape    = new BoxShape(32, 32);
    b.BodyType = PhysicsBodyType.Dynamic;
    b.Mass     = 2f;
    b.Material = PhysicsMaterial.Wood;
});
```

---

## Shape Types

All shapes derive from `ShapeDefinition`. Assign any subtype to `PhysicsBodyComponent.Shape`.

!!! note
    Shape definitions are **immutable records**. To resize a shape at runtime, reassign `Shape` with a new record. The physics system rebuilds the body on the next tick and resets shape IDs.

### `CircleShape`

```csharp
b.Shape = new CircleShape(Radius: 16f);

// With local offset
b.Shape = new CircleShape(16f) { Offset = new Vector2(0, -4) };
```

### `BoxShape`

```csharp
b.Shape = new BoxShape(Width: 32, Height: 48);

// Rotated box
b.Shape = new BoxShape(32, 16) { Angle = MathF.PI / 4f }; // 45 degrees
```

### `CapsuleShape`

Two circle centers connected by a rectangle. Ideal for characters.

```csharp
// Vertical capsule: top at (0,-12), bottom at (0,12), radius 10
b.Shape = new CapsuleShape(new Vector2(0, -12), new Vector2(0, 12), Radius: 10f);
```

### `PolygonShape`

Convex polygon with up to 8 vertices. Box2D computes the convex hull of the supplied points.

```csharp
var vertices = new Vector2[]
{
    new(-16, 16),
    new(  0, -16),
    new( 16, 16),
};
b.Shape = new PolygonShape(vertices);
```

!!! warning
    Vertices must form a **convex** outline. Concave shapes must be decomposed into multiple
    convex sub-shapes via `AddSubShape`. In DEBUG builds, non-convex input throws immediately.

### `ChainShape`

Smooth static terrain with connected line segments. Only valid on `Static` bodies.

```csharp
var points = new Vector2[] { new(0,0), new(200,0), new(400,-30), new(600,0) };
b.Shape    = new ChainShape(points);
b.BodyType = PhysicsBodyType.Static;

// Closed loop
b.Shape = new ChainShape(points, isLoop: true);

// Per-segment materials
b.Shape = new ChainShape(points)
{
    SegmentMaterials = new[]
    {
        PhysicsMaterial.Ice,
        PhysicsMaterial.Rubber,
        PhysicsMaterial.Default,
    }
};
```

!!! note
    `ChainShape` does not support `IsTrigger`, `IsBullet`, or non-Static `BodyType`.

---

## Body Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `BodyType` | `PhysicsBodyType` | `Dynamic` | Static / Dynamic / Kinematic |
| `Mass` | `float` | `1` | Mass in simulation units (Dynamic only) |
| `GravityScale` | `float` | `1` | Multiplier on world gravity |
| `GravityOverride` | `Vector2?` | `null` | Custom gravity direction/magnitude for this body |
| `LinearDamping` | `float` | `0` | Drag on linear velocity |
| `AngularDamping` | `float` | `0` | Drag on angular velocity |
| `FixedRotation` | `bool` | `false` | Prevent rotation (common for characters) |
| `FreezePositionX` | `bool` | `false` | Zero X velocity every tick |
| `FreezePositionY` | `bool` | `false` | Zero Y velocity every tick |
| `IsBullet` | `bool` | `false` | Continuous collision detection for fast objects |
| `SleepThreshold` | `float` | `0` | Speed below which the body may sleep (0 = Box2D default) |
| `IsSimulationEnabled` | `bool` | `true` | Remove from simulation without destroying |
| `Offset` | `Vector2` | `Zero` | Body origin offset relative to `TransformComponent.Position` |

### Initial Velocity

```csharp
b.InitialLinearVelocity  = new Vector2(300, -200); // Applied at creation only
b.InitialAngularVelocity = MathF.PI;               // Radians per second
```

---

## Materials

Apply a preset `PhysicsMaterial` to set friction and restitution together:

```csharp
b.Material = PhysicsMaterial.Bouncy;
// Equivalent to:
b.SurfaceFriction = 0.4f;
b.Restitution     = 0.9f;
```

| Preset | Friction | Restitution |
|--------|----------|-------------|
| `Default` | 0.6 | 0 |
| `Ice` | 0.05 | 0 |
| `Bouncy` | 0.4 | 0.9 |
| `Metal` | 0.2 | 0.1 |
| `Wood` | 0.8 | 0.05 |
| `Rubber` | 0.9 | 0.7 |

Material changes on a live body apply immediately without a full rebuild.

---

## Triggers (Sensors)

```csharp
b.IsTrigger = true; // Overlaps are reported but no collision forces are generated

b.OnTriggerEnter += other => GivePickup(other.Entity);
b.OnTriggerExit  += other => RemoveAura(other.Entity);
b.OnTriggerStay  += other => ApplyHeat(other.Entity);
```

!!! note
    Two bodies that both have `IsTrigger = true` do not fire trigger events with each other.
    A sensor must overlap a non-sensor to generate events.

---

## Collision Events

```csharp
b.OnCollisionEnter += (other, contact) =>
{
    Logger.LogDebug("Normal: {Normal}, Depth: {Depth}", contact.Normal, contact.Depth);
};

b.OnCollisionStay += (other, contact) => { };

b.OnCollisionExit += other => { };

// High-speed impact event (requires EnableHitEvents = true, which is the default)
b.OnCollisionHit += (other, contact) =>
{
    var volume = Math.Clamp(contact.ImpactSpeed / 500f, 0f, 1f);
    PlayImpactSound(volume);
};
```

### `CollisionContact`

| Property | Description |
|----------|-------------|
| `Normal` | Surface normal pointing away from the other body toward this body |
| `Depth` | Penetration depth along `Normal` |
| `ContactPoint` | Approximate world-space contact point |
| `ContactPoint2` | Second contact point when present (edge-on-face contacts) |
| `ContactPointCount` | 0, 1, or 2 |
| `ImpactSpeed` | Approach speed -- only reliable in `OnCollisionHit` |

### Sub-Shape Events

When using compound bodies, use the `*WithShape` event variants to identify which sub-shape was involved:

```csharp
b.OnCollisionEnterWithShape += (other, contact, selfSubShape, otherSubShape) =>
{
    if (selfSubShape == _swordHitbox)
        DealDamage(other.Entity);
};
```

---

## Sub-Shapes (Compound Bodies)

Attach additional shapes to the same Box2D body:

```csharp
var body = entity.AddComponent<PhysicsBodyComponent>(b =>
{
    b.Shape = new CapsuleShape(new Vector2(0, -12), new Vector2(0, 12), 10); // Body
});

// Attach a sensor hitbox as a sub-shape
var hitbox = body.AddSubShape(
    new CircleShape(20),
    isTrigger: true,
    friction: null,
    restitution: null);

hitbox.OnTriggerEnter via body.OnTriggerEnterWithShape...
```

### Updating a Sub-Shape at Runtime

```csharp
// Same type -- lightweight update, no rebuild
hitbox.UpdateDefinition(new CircleShape(30));

// Different type -- triggers a full body rebuild
hitbox.UpdateDefinition(new BoxShape(40, 20));
```

### Sub-Shape Collision Mask Override

```csharp
hitbox.CollisionMask = (1UL << 2); // Only collides with layer 2
```

---

## One-Way Platforms

```csharp
entity.AddComponent<PhysicsBodyComponent>(b =>
{
    b.Shape                 = new BoxShape(200, 16);
    b.BodyType              = PhysicsBodyType.Static;
    b.IsOneWayPlatform      = true;
    b.PlatformNormalDirection = new Vector2(0, -1); // Solid from above (Y-down)
});
```

The physics system installs a Box2D pre-solve callback automatically when any body in the scene has `IsOneWayPlatform = true`, and removes it when none do.

---

## Custom Collision Filter

Use `ShouldCollide` for per-body programmatic filtering (e.g. team-based collisions):

```csharp
b.ShouldCollide = other =>
{
    var otherTeam = other.Entity?.GetComponent<TeamComponent>();
    return otherTeam?.Team != _myTeam; // Don't collide with teammates
};
```

Both bodies in a pair are checked; either can veto the contact. Keep the callback allocation-free -- it runs on the simulation thread inside the Box2D broad-phase.

---

## Teleporting

To move a body to an arbitrary position without generating phantom velocity:

```csharp
body.Teleport(new Vector2(100, 200));
```

`Teleport` resets the kinematic previous-position record so no impulse is derived from the jump.

---

## Related Topics

- [Collision System](system.md)
- [Kinematic Character](kinematic-character.md)
- [Physics Overview](index.md)