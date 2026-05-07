---
title: Collision Detection
description: Step-by-step guide to collision detection using PhysicsBodyComponent in Brine2D
---

# Collision Detection

This tutorial walks through adding collision detection to a scene using `PhysicsBodyComponent` and `Box2DPhysicsSystem`.

---

## Prerequisites

- Basic familiarity with scenes and the ECS (`Entity`, `Component`, `TransformComponent`)
- `AddPhysics()` called in your app startup (see [Collision System](../collision/system.md))

---

## 1. Register Physics

In `Program.cs` (or wherever you configure services):

```csharp
builder.Services.AddPhysics(opts =>
{
    opts.Gravity = new Vector2(0, 980); // Y-down, pixels per second squared
});
```

---

## 2. Add the System to Your Scene

```csharp
protected override void OnLoadAsync(IEntityWorld world)
{
    world.AddSystem<Box2DPhysicsSystem>();
}
```

---

## 3. Create a Static Floor

```csharp
var floor = world.CreateEntity("Floor");
floor.AddComponent<TransformComponent>(t => t.Position = new Vector2(400, 550));
floor.AddComponent<PhysicsBodyComponent>(b =>
{
    b.Shape    = new BoxShape(800, 20);
    b.BodyType = PhysicsBodyType.Static;
});
```

---

## 4. Create a Dynamic Box

```csharp
var box = world.CreateEntity("Box");
box.AddComponent<TransformComponent>(t => t.Position = new Vector2(400, 100));
box.AddComponent<PhysicsBodyComponent>(b =>
{
    b.Shape    = new BoxShape(32, 32);
    b.BodyType = PhysicsBodyType.Dynamic;
    b.Mass     = 1f;
    b.Material = PhysicsMaterial.Default;
});
```

The box will fall under gravity and land on the floor.

---

## 5. Respond to Collisions

Subscribe to events on the component before or after it is added:

```csharp
var boxBody = box.GetComponent<PhysicsBodyComponent>();

boxBody.OnCollisionEnter += (other, contact) =>
{
    Logger.LogInformation("Box hit {Other}! Normal: {Normal}",
        other.Entity?.Name, contact.Normal);
};

boxBody.OnCollisionExit += other =>
{
    Logger.LogInformation("Box separated from {Other}", other.Entity?.Name);
};
```

---

## 6. Triggers (Sensors)

A trigger overlaps other bodies but does not generate collision forces. Use them for pickups, damage zones, and area detection:

```csharp
var pickup = world.CreateEntity("CoinPickup");
pickup.AddComponent<TransformComponent>(t => t.Position = new Vector2(300, 400));
pickup.AddComponent<PhysicsBodyComponent>(b =>
{
    b.Shape     = new CircleShape(16);
    b.BodyType  = PhysicsBodyType.Static;
    b.IsTrigger = true;

    b.OnTriggerEnter += other =>
    {
        if (other.Entity?.Name == "Player")
        {
            CollectCoin();
            pickup.IsActive = false;
        }
    };
});
```

---

## 7. Collision Layers

Prevent enemies from colliding with each other while still colliding with terrain and the player:

```csharp
// In startup
services.AddPhysics()
        .AddPhysicsLayers(layers =>
        {
            layers.Register("Terrain", 0);
            layers.Register("Player",  1);
            layers.Register("Enemies", 2);
        });
```

```csharp
// On the enemy body
var layers = services.GetRequiredService<PhysicsLayerRegistry>();

enemyBody.Layer         = layers.GetLayer("Enemies");
enemyBody.CollisionMask = layers.GetMask("Terrain", "Player"); // Collides with terrain and player only
```

---

## 8. Compound Bodies (Sub-Shapes)

Attach an extra sensor hitbox to a body for attack range detection:

```csharp
entity.AddComponent<PhysicsBodyComponent>(b =>
{
    b.Shape = new CapsuleShape(new Vector2(0, -12), new Vector2(0, 12), 10);
});

var hitbox = body.AddSubShape(new CircleShape(32), isTrigger: true);

body.OnTriggerEnterWithShape += (other, contact, selfSubShape, otherSubShape) =>
{
    if (selfSubShape == hitbox)
        DealDamage(other.Entity);
};
```

---

## Next Steps

- [Shapes & Bodies](../collision/colliders.md) -- Full shape reference
- [Kinematic Character](../collision/kinematic-character.md) -- Platform character controller
- [Collision System](../collision/system.md) -- Layers, queries, world options
- [Building a Platformer](platformer.md)