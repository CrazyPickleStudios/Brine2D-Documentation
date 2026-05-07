---
title: Collision System
description: Box2DPhysicsSystem setup, world configuration, physics layers, and queries in Brine2D
---

# Collision System

Brine2D wraps **Box2D 3.x** in the ECS through `Box2DPhysicsSystem`. The system runs on the fixed-update loop and handles body creation, simulation stepping, event dispatch, and transform sync.

---

## Registration

Register physics in your app startup:

```csharp
services.AddPhysics(opts =>
{
    opts.Gravity           = new Vector2(0, 980); // pixels/s^2, Y-down screen space
    opts.PixelsPerMeter    = 64f;                 // Tune for your art scale (default 64)
    opts.SubStepCount      = 4;                   // Box2D sub-steps per fixed tick (default 4)
});
```

!!! warning
    `PixelsPerMeter` maps to a **process-wide** Box2D global. All scenes must use the same value.

Add the simulation to a scene:

```csharp
protected override void OnLoadAsync(IEntityWorld world)
{
    world.AddSystem<Box2DPhysicsSystem>();

    // Optional debug overlay (draws shapes, AABBs, contacts)
    world.AddSystem<Box2DDebugDrawSystem>();
}
```

`PhysicsWorld` is scoped -- each scene gets its own instance, created and disposed automatically.

---

## Fixed Update Order

The physics system runs at a fixed timestep. The step sequence each tick is:

1. Tear down bodies for disabled entities.
2. Sync dirty `PhysicsBodyComponent` data into Box2D (shape changes, body type, material, etc.).
3. Apply lightweight property updates (filter, body type, material, trigger) on live bodies without a full rebuild.
4. Apply `GravityOverride` forces to dynamic bodies.
5. Push ECS transforms for kinematic bodies into Box2D (derives velocity from displacement).
6. Sync joint components.
7. **Step the Box2D world.**
8. Read back body positions and rotations into `TransformComponent`.
9. Dispatch collision, sensor, hit, and sleep/wake events.
10. Check joint break thresholds.

---

## Physics World Options

| Option | Default | Description |
|--------|---------|-------------|
| `Gravity` | `(0, 980)` | World gravity in pixels/s^2 |
| `PixelsPerMeter` | `64` | Art-scale calibration (process-wide) |
| `SubStepCount` | `4` | Box2D solver sub-steps per tick |
| `SleepingEnabled` | `true` | Allow idle bodies to sleep |
| `ContinuousEnabled` | `true` | CCD for fast-moving bodies |
| `ContactHitEventThreshold` | `null` | Minimum approach speed for `OnCollisionHit` |
| `RestitutionThreshold` | `null` | Minimum speed for bounce resolution |
| `MaxLinearSpeed` | `null` | Cap on body linear speed |

---

## Physics Layers

Layers use 64-bit bitmasks for O(1) collision filtering. Register names once at startup then use them everywhere:

```csharp
services.AddPhysics()
        .AddPhysicsLayers(layers =>
        {
            layers.Register("Default",  0);
            layers.Register("Player",   1);
            layers.Register("Enemies",  2);
            layers.Register("Terrain",  3);
            layers.Register("Triggers", 4);
        });
```

Inject `PhysicsLayerRegistry` to build filters:

```csharp
public class PlayerScene : Scene
{
    private readonly PhysicsLayerRegistry _layers;

    public PlayerScene(PhysicsLayerRegistry layers)
    {
        _layers = layers;
    }

    protected override void OnLoadAsync(IEntityWorld world)
    {
        var player = world.CreateEntity("Player");
        player.AddComponent<PhysicsBodyComponent>(b =>
        {
            b.Shape         = new CapsuleShape(new Vector2(0, -12), new Vector2(0, 12), 10);
            b.Layer         = _layers.GetLayer("Player");
            b.CollisionMask = _layers.GetMask("Terrain", "Enemies");
        });
    }
}
```

### Raw Bitmasks

You can also assign `Layer` (0--63 index) and `CollisionMask` (64-bit mask) directly:

```csharp
b.Layer         = 1;              // Layer index 1
b.CollisionMask = (1UL << 3);    // Only collides with layer 3

// Multi-category body (belongs to multiple layers at once)
b.CategoryBits  = (1UL << 1) | (1UL << 4);
```

---

## `PhysicsWorld` Queries

Inject `PhysicsWorld` to run overlap, raycast, and shape-cast queries:

```csharp
public class EnemySystem : FixedUpdateSystemBase
{
    private readonly PhysicsWorld _world;

    public EnemySystem(PhysicsWorld world) => _world = world;
}
```

### Overlap (Proximity Detection)

```csharp
// All bodies overlapping a circle
var hits = _world.OverlapCircle(center, radius: 64f, filter);

foreach (var hit in hits)
    DamageEnemy(hit.Body?.Entity);
```

### Raycast

```csharp
if (_world.Raycast(origin, direction, maxDistance, filter, out var hit))
{
    Logger.LogDebug("Hit {Entity} at {Point}", hit.Body?.Entity?.Name, hit.Point);
}
```

### Pair Ignoring

```csharp
// Suppress all collision between two specific bodies
_world.IgnoreCollision(playerBody, ownProjectileBody);

// Restore later
_world.RestoreCollision(playerBody, ownProjectileBody);
```

---

## Sleep and Wake Events

```csharp
body.OnBodySleep += b => Logger.LogDebug("{Name} went to sleep", b.Entity?.Name);
body.OnBodyWake  += b => Logger.LogDebug("{Name} woke up",       b.Entity?.Name);
```

---

## Related Topics

- [Shapes & Bodies](colliders.md)
- [Kinematic Character](kinematic-character.md)
- [Physics Overview](index.md)