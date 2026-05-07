---
title: Physics & Collision
description: Box2D-powered physics and collision detection in Brine2D
---

# Physics & Collision

Brine2D uses **Box2D 3.x** as its physics engine, wrapped in the ECS through `PhysicsBodyComponent`. Bodies, shapes, events, and queries all work in **pixel coordinates**.

---

## Quick Start

```csharp
// 1. Register physics in your app startup
services.AddPhysics(opts =>
{
    opts.Gravity = new Vector2(0, 980); // pixels per second squared (Y-down)
});

// 2. Add the simulation system to your scene
protected override void OnLoadAsync(IEntityWorld world)
{
    world.AddSystem<Box2DPhysicsSystem>();
}

// 3. Attach PhysicsBodyComponent to an entity
var entity = world.CreateEntity("Box");
entity.AddComponent<TransformComponent>(t => t.Position = new Vector2(400, 100));
entity.AddComponent<PhysicsBodyComponent>(b =>
{
    b.Shape    = new BoxShape(32, 32);
    b.BodyType = PhysicsBodyType.Dynamic;
});
```

---

## Topics

| Guide | Description |
|-------|-------------|
| **[Collision System](system.md)** | `Box2DPhysicsSystem`, world setup, layers |
| **[Shapes & Bodies](colliders.md)** | Shape types, `PhysicsBodyComponent` properties |
| **[Kinematic Character](kinematic-character.md)** | `KinematicCharacterBody` -- platformers & top-down |

---

## Body Types

| Type | Behaviour |
|------|-----------|
| `PhysicsBodyType.Dynamic` | Fully simulated -- affected by gravity, forces, and collisions. Default. |
| `PhysicsBodyType.Static` | Never moves -- walls, floors, terrain. |
| `PhysicsBodyType.Kinematic` | Moved by your code each frame; pushes dynamic bodies out of the way. |

---

## Collision Events

Subscribe to events on `PhysicsBodyComponent`:

```csharp
entity.AddComponent<PhysicsBodyComponent>(b =>
{
    b.Shape = new CircleShape(16);

    b.OnCollisionEnter += (other, contact) =>
        Logger.LogInformation("Hit {Other}!", other.Entity?.Name);

    b.OnCollisionExit  += other =>
        Logger.LogInformation("Separated from {Other}", other.Entity?.Name);

    b.OnCollisionStay  += (other, contact) => { };

    // Trigger (sensor) events when IsTrigger = true
    b.OnTriggerEnter += other => Logger.LogInformation("Entered trigger");
    b.OnTriggerExit  += other => Logger.LogInformation("Exited trigger");
});
```

---

## Triggers (Sensors)

Set `IsTrigger = true` to make a body report overlaps without generating collision forces:

```csharp
entity.AddComponent<PhysicsBodyComponent>(b =>
{
    b.Shape     = new CircleShape(64);
    b.IsTrigger = true;
    b.BodyType  = PhysicsBodyType.Static;

    b.OnTriggerEnter += other => GrantPowerup(other.Entity);
});
```

---

## Collision Layers

```csharp
// Register named layers at startup (call once before building bodies)
services.AddPhysics()
        .AddPhysicsLayers(layers =>
        {
            layers.Register("Default",  0);
            layers.Register("Player",   1);
            layers.Register("Enemies",  2);
            layers.Register("Terrain",  3);
            layers.Register("Triggers", 4);
        });

// Assign layer and mask on bodies
entity.AddComponent<PhysicsBodyComponent>(b =>
{
    b.Shape         = new CapsuleShape(new Vector2(0, -8), new Vector2(0, 8), 8);
    b.Layer         = layers.GetLayer("Player");
    b.CollisionMask = layers.GetMask("Terrain", "Enemies");
});
```

---

## Related Topics

- [Collision System](system.md)
- [Shapes & Bodies](colliders.md)
- [Kinematic Character](kinematic-character.md)
- [Tutorials: Collision Detection](../tutorials/collision.md)