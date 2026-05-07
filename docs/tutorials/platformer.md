---
title: Building a Platformer
description: Build a 2D platformer with gravity, jumping, moving platforms, and one-way floors in Brine2D
---

# Building a Platformer

This tutorial builds a complete platformer scene using `KinematicCharacterBody`, `Box2DPhysicsSystem`, and the input system.

---

## Prerequisites

- `AddPhysics()` registered at startup
- Basic familiarity with scenes and the ECS

---

## 1. Register Physics and Kinematic Systems

```csharp
// Program.cs
builder.Services.AddPhysics(opts =>
{
    opts.Gravity = new Vector2(0, 980);
});
```

```csharp
// In your scene
protected override void OnLoadAsync(IEntityWorld world)
{
    world.AddSystem<Box2DPhysicsSystem>();
    world.AddSystem<PrePhysicsKinematicCharacterSystem>();
    world.AddSystem<PostPhysicsKinematicCharacterSystem>();
}
```

---

## 2. Create the Player

```csharp
var player = world.CreateEntity("Player");
player.AddComponent<TransformComponent>(t => t.Position = new Vector2(200, 300));
player.AddComponent<PhysicsBodyComponent>(b =>
{
    b.Shape         = new CapsuleShape(new Vector2(0, -14), new Vector2(0, 14), 10);
    b.BodyType      = PhysicsBodyType.Kinematic;
    b.FixedRotation = true;
    b.Layer         = _layers.GetLayer("Player");
    b.CollisionMask = _layers.GetMask("Terrain", "Platforms");
});
player.AddComponent<KinematicCharacterBody>(c =>
{
    c.SnapDistance = 8f;
    c.StopOnSlope  = true;
    c.PushForce    = 400f;
});
```

---

## 3. Player Movement

Handle movement in a scene or a dedicated component:

```csharp
private const float MoveSpeed  = 250f;
private const float JumpForce  = 550f;
private const float Gravity    = 1200f;
private float _verticalVelocity;

protected override void OnFixedUpdate(GameTime fixedTime)
{
    var character = _playerEntity.GetComponent<KinematicCharacterBody>();
    var dt        = (float)fixedTime.DeltaTime;

    // Horizontal
    float horizontal = 0;
    if (Input.IsKeyDown(Key.A)) horizontal -= 1;
    if (Input.IsKeyDown(Key.D)) horizontal += 1;

    // Vertical / gravity
    if (character.IsGrounded)
    {
        _verticalVelocity = 0;

        if (Input.IsKeyPressed(Key.Space))
            _verticalVelocity = -JumpForce;
    }
    else
    {
        _verticalVelocity += Gravity * dt;
    }

    character.MoveAndSlide(new Vector2(horizontal * MoveSpeed, _verticalVelocity));
}
```

---

## 4. Create Terrain

```csharp
var ground = world.CreateEntity("Ground");
ground.AddComponent<TransformComponent>(t => t.Position = new Vector2(400, 560));
ground.AddComponent<PhysicsBodyComponent>(b =>
{
    b.Shape    = new BoxShape(800, 32);
    b.BodyType = PhysicsBodyType.Static;
    b.Layer    = _layers.GetLayer("Terrain");
});
```

For smooth curved terrain use a `ChainShape`:

```csharp
var terrain = world.CreateEntity("Terrain");
terrain.AddComponent<TransformComponent>(t => t.Position = Vector2.Zero);
terrain.AddComponent<PhysicsBodyComponent>(b =>
{
    var points = new Vector2[] { new(0, 560), new(200, 540), new(400, 560), new(600, 530) };
    b.Shape    = new ChainShape(points);
    b.BodyType = PhysicsBodyType.Static;
    b.Layer    = _layers.GetLayer("Terrain");
});
```

---

## 5. One-Way Platforms

```csharp
var platform = world.CreateEntity("Platform");
platform.AddComponent<TransformComponent>(t => t.Position = new Vector2(300, 400));
platform.AddComponent<PhysicsBodyComponent>(b =>
{
    b.Shape                   = new BoxShape(128, 12);
    b.BodyType                = PhysicsBodyType.Static;
    b.Layer                   = _layers.GetLayer("Platforms");
    b.IsOneWayPlatform        = true;
    b.PlatformNormalDirection = new Vector2(0, -1); // Solid from above
});
```

---

## 6. Moving Platforms

```csharp
var movingPlatform = world.CreateEntity("MovingPlatform");
movingPlatform.AddComponent<TransformComponent>(t => t.Position = new Vector2(500, 350));
movingPlatform.AddComponent<PhysicsBodyComponent>(b =>
{
    b.Shape    = new BoxShape(120, 16);
    b.BodyType = PhysicsBodyType.Kinematic;
    b.Layer    = _layers.GetLayer("Platforms");
    b.IsOneWayPlatform        = true;
    b.PlatformNormalDirection = new Vector2(0, -1);
});
```

Drive it in `OnFixedUpdate`:

```csharp
var t = movingPlatform.GetComponent<TransformComponent>();
t.Position = new Vector2(500 + MathF.Sin((float)_time * 1.5f) * 120f, 350);
_time += fixedTime.DeltaTime;
```

`KinematicCharacterBody` automatically rides moving platforms and exposes `PlatformVelocity`.

---

## 7. Landing and Airborne Events

```csharp
var character = _playerEntity.GetComponent<KinematicCharacterBody>();
character.OnLanded   += _ => PlayLandingSound();
character.OnAirborne += _ => StartFallParticles();
```

---

## Next Steps

- [Shapes & Bodies](../collision/colliders.md) -- Full shape and body property reference
- [Kinematic Character](../collision/kinematic-character.md) -- Full `KinematicCharacterBody` reference
- [Input Actions](../input/actions.md) -- Rebindable controls