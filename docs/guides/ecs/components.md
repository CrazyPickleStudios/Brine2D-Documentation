---
title: ECS Components
description: Design and implement effective components for your Brine2D games
---

# ECS Components

Components are the **building blocks** of Brine2D's Entity Component System. Unlike pure data-oriented ECS frameworks, Brine2D uses a **hybrid approach** where components can contain both data and logic, giving you flexibility for typical game development with optional performance optimization through systems.

## What Are Components?

**Components are classes** that inherit from `Component` and represent characteristics, behaviors, or attributes of entities. They can hold state AND logic.

```csharp
using Brine2D.Core;
using Brine2D.ECS;
using System.Numerics;

// ✅ Simple data component
public class TransformComponent : Component
{
    public Vector2 Position { get; set; }
    public float Rotation { get; set; }
    public Vector2 Scale { get; set; } = Vector2.One;
}

// ✅ Component with logic (perfectly fine!)
public class LifetimeComponent : Component
{
    public float Lifetime { get; set; }
    public bool AutoDestroy { get; set; } = true;
    
    protected internal override void OnUpdate(GameTime gameTime)
    {
        if (!IsEnabled) return;
        
        Lifetime -= (float)gameTime.DeltaTime;
        
        if (Lifetime <= 0 && AutoDestroy)
        {
            Entity?.Destroy();
        }
    }
}
```

**Key principle:** Components can be **simple data containers** or **self-contained behaviors** - use what makes sense for your game!

---

## Basic Component Structure

### Minimal Component

The simplest component inherits from `Component`:

```csharp
using Brine2D.ECS;

public class HealthComponent : Component
{
    public float Current { get; set; }
    public float Max { get; set; }
    
    public float Percentage => Current / Max;
    public bool IsDead => Current <= 0;
}
```

### Component Lifecycle

Components have several lifecycle hooks you can override:

```csharp
public class MyComponent : Component
{
    protected internal override void OnAdded()
    {
        // Called when component is added to an entity
        Logger.LogInformation("Component added!");
    }
    
    protected internal override void OnRemoved()
    {
        // Called when component is removed
        Logger.LogInformation("Component removed!");
    }
    
    protected internal override void OnEnabled()
    {
        // Called when component is enabled
        Logger.LogInformation("Component enabled!");
    }
    
    protected internal override void OnDisabled()
    {
        // Called when component is disabled
        Logger.LogInformation("Component disabled!");
    }
    
    protected internal override void OnUpdate(GameTime gameTime)
    {
        // Called every frame if enabled
        // Your logic here!
    }
}
```

### Using Components

```csharp
// Add component
var health = entity.AddComponent<HealthComponent>();
health.Current = 100;
health.Max = 100;

// Get component
var health = entity.GetComponent<HealthComponent>();
if (health != null)
{
    Console.WriteLine($"Health: {health.Current}/{health.Max}");
}

// Check if entity has component
if (entity.HasComponent<HealthComponent>())
{
    // ...
}

// Remove component
entity.RemoveComponent<HealthComponent>();

// Enable/disable component
health.IsEnabled = false; // Component won't update
health.IsEnabled = true;  // Component resumes updating
```

---

## Component Types

### Data-Only Components

**Purpose:** Store state with no logic (processed by systems)

```csharp
// Simple position/rotation
public class TransformComponent : Component
{
    public Vector2 Position { get; set; }
    public float Rotation { get; set; }
    public Vector2 Scale { get; set; } = Vector2.One;
}

// Movement velocity
public class VelocityComponent : Component
{
    public Vector2 Velocity { get; set; }
    public float MaxSpeed { get; set; }
    public float Friction { get; set; }
    
    public void SetDirection(Vector2 direction, float speed)
    {
        Velocity = direction * speed;
    }
}

// Sprite rendering data
public class SpriteComponent : Component
{
    public string TexturePath { get; set; } = string.Empty;
    public Color Tint { get; set; } = Color.White;
    public Vector2 Origin { get; set; } = Vector2.Zero;
}
```

**When to use:** When you want systems to process multiple entities efficiently.

### Behavior Components

**Purpose:** Self-contained logic that updates every frame

```csharp
// Timer that fires events
public class TimerComponent : Component
{
    public float Duration { get; set; }
    public float Elapsed { get; private set; }
    public bool IsComplete { get; private set; }
    
    public event Action? OnComplete;
    
    protected internal override void OnUpdate(GameTime gameTime)
    {
        if (!IsEnabled || IsComplete) return;
        
        Elapsed += (float)gameTime.DeltaTime;
        
        if (Elapsed >= Duration)
        {
            IsComplete = true;
            OnComplete?.Invoke();
        }
    }
}

// Auto-destroy after time
public class LifetimeComponent : Component
{
    public float Lifetime { get; set; }
    public bool AutoDestroy { get; set; } = true;
    
    protected internal override void OnUpdate(GameTime gameTime)
    {
        if (!IsEnabled) return;
        
        Lifetime -= (float)gameTime.DeltaTime;
        
        if (Lifetime <= 0 && AutoDestroy)
        {
            Entity?.Destroy();
        }
    }
}

// Follow another entity
public class FollowComponent : Component
{
    public Entity? Target { get; set; }
    public float Speed { get; set; } = 5f;
    public float MinDistance { get; set; } = 10f;
    
    protected internal override void OnUpdate(GameTime gameTime)
    {
        if (!IsEnabled || Target == null) return;
        
        var myTransform = Entity?.GetComponent<TransformComponent>();
        var targetTransform = Target.GetComponent<TransformComponent>();
        
        if (myTransform == null || targetTransform == null) return;
        
        var direction = targetTransform.Position - myTransform.Position;
        var distance = direction.Length();
        
        if (distance > MinDistance)
        {
            direction = Vector2.Normalize(direction);
            myTransform.Position += direction * Speed * (float)gameTime.DeltaTime;
        }
    }
}
```

**When to use:** For simple, self-contained behaviors that don't need optimization.

### Controller Components

**Purpose:** Handle input or AI for entities

```csharp
// Player input controller
public class PlayerControllerComponent : Component
{
    public float MoveSpeed { get; set; } = 200f;
    public InputMode InputMode { get; set; } = InputMode.Keyboard;
    public int GamepadIndex { get; set; } = 0;
    public bool NormalizeDiagonals { get; set; } = true;
    
    public Vector2 InputDirection { get; set; }
    
    // Logic is in PlayerControllerSystem for performance
}

// AI controller
public class AIControllerComponent : Component
{
    public AIBehavior Behavior { get; set; }
    public float MoveSpeed { get; set; } = 100f;
    public string TargetTag { get; set; } = "Player";
    public float DetectionRange { get; set; } = 300f;
    public float StopDistance { get; set; } = 50f;
    
    // Logic is in AISystem for performance
}

public enum AIBehavior
{
    Idle,
    Patrol,
    Chase,
    Flee,
    Attack
}
```

**When to use:** When you need systems to process many entities efficiently (pathfinding, AI, etc.).

### Reference Components

**Purpose:** Hold references to external objects or other entities

```csharp
// Camera follow
public class CameraFollowComponent : Component
{
    public string CameraName { get; set; } = "main";
    public float Smoothing { get; set; } = 5f;
    public Vector2 Offset { get; set; }
}

// Collision detection
public class ColliderComponent : Component
{
    public ICollider? Shape { get; set; }
    public bool IsTrigger { get; set; }
}

// Audio source
public class AudioSourceComponent : Component
{
    public ISoundEffect? SoundEffect { get; set; }
    public IMusic? Music { get; set; }
    public float Volume { get; set; } = 1.0f;
    public int LoopCount { get; set; } = 0;
    public bool PlayOnEnable { get; set; }
    
    public bool TriggerPlay { get; set; }
    public bool TriggerStop { get; set; }
    public bool IsPlaying { get; set; }
}
```

---

## When to Use Components vs Systems

### Use Component Logic When:

- ✅ Behavior is simple and self-contained
- ✅ Only a few entities have this component
- ✅ Logic is unique to each entity (timers, follow targets)
- ✅ You want quick prototyping without creating systems

```csharp
// Perfect for component logic
public class RotateComponent : Component
{
    public float Speed { get; set; } = 1f;
    
    protected internal override void OnUpdate(GameTime gameTime)
    {
        var transform = Entity?.GetComponent<TransformComponent>();
        if (transform != null)
        {
            transform.Rotation += Speed * (float)gameTime.DeltaTime;
        }
    }
}
```

### Use Systems When:

- ✅ Many entities (10+) need the same processing
- ✅ Logic can be batched for performance
- ✅ Complex queries across multiple entities
- ✅ You need specific execution order

```csharp
// Better as a system for performance
public class VelocitySystem : IUpdateSystem
{
    private readonly IEntityWorld _world;
    public int UpdateOrder => 100;
    
    public void Update(GameTime gameTime)
    {
        var deltaTime = (float)gameTime.DeltaTime;
        
        // Process ALL entities with Transform + Velocity efficiently
        var entities = _world.GetEntitiesWithComponents<TransformComponent, VelocityComponent>();
        
        foreach (var entity in entities)
        {
            var transform = entity.GetComponent<TransformComponent>()!;
            var velocity = entity.GetComponent<VelocityComponent>()!;
            
            transform.Position += velocity.Velocity * deltaTime;
        }
    }
}
```

---

## Design Patterns

### Composition Over Inheritance

Combine components for flexible behavior:

```csharp
// Create a player
var player = world.CreateEntity("Player");
player.AddComponent<TransformComponent>();
player.AddComponent<SpriteComponent>();
player.AddComponent<PlayerControllerComponent>();
player.AddComponent<HealthComponent>();

// Create a flying enemy
var flyingEnemy = world.CreateEntity("FlyingEnemy");
flyingEnemy.AddComponent<TransformComponent>();
flyingEnemy.AddComponent<SpriteComponent>();
flyingEnemy.AddComponent<AIControllerComponent>();
flyingEnemy.AddComponent<HealthComponent>();
flyingEnemy.AddComponent<FlyingMovementComponent>();

// Create a boss (reuse + extend)
var boss = world.CreateEntity("Boss");
boss.AddComponent<TransformComponent>();
boss.AddComponent<SpriteComponent>();
boss.AddComponent<AIControllerComponent>();
boss.AddComponent<HealthComponent>();
boss.AddComponent<FlyingMovementComponent>();
boss.AddComponent<BossAbilitiesComponent>(); // Unique behavior
```

### Component Communication

Components can interact with each other:

```csharp
public class DamageOnContactComponent : Component
{
    public float Damage { get; set; } = 10f;
    public string TargetTag { get; set; } = "Player";
    
    protected internal override void OnUpdate(GameTime gameTime)
    {
        if (!IsEnabled) return;
        
        var collider = Entity?.GetComponent<ColliderComponent>();
        if (collider == null) return;
        
        // Check collision (simplified)
        foreach (var other in GetNearbyEntities())
        {
            if (other.Tags.Contains(TargetTag))
            {
                var health = other.GetComponent<HealthComponent>();
                if (health != null)
                {
                    health.Current -= Damage;
                }
            }
        }
    }
}
```

### Using Events

Components can fire events:

```csharp
public class HealthComponent : Component
{
    private float _current;
    
    public float Current
    {
        get => _current;
        set
        {
            var oldValue = _current;
            _current = value;
            
            if (_current <= 0 && oldValue > 0)
            {
                OnDeath?.Invoke();
            }
        }
    }
    
    public float Max { get; set; }
    
    public event Action? OnDeath;
    public event Action<float>? OnDamageTaken;
    
    public void TakeDamage(float amount)
    {
        Current -= amount;
        OnDamageTaken?.Invoke(amount);
    }
}

// Subscribe to events
var health = entity.GetComponent<HealthComponent>();
health.OnDeath += () => Logger.LogInformation("Entity died!");
health.OnDamageTaken += (amount) => Logger.LogInformation($"Took {amount} damage!");
```

---

## Built-in Components

Brine2D provides several utility components:

### TransformComponent

```csharp
var transform = entity.AddComponent<TransformComponent>();
transform.Position = new Vector2(100, 200);
transform.Rotation = MathF.PI / 4; // 45 degrees
transform.Scale = new Vector2(2, 2); // 2x scale

// Parent-child hierarchy
childEntity.SetParent(parentEntity);
childEntity.SetParent(null); // Unparent
```

### TimerComponent

```csharp
var timer = entity.AddComponent<TimerComponent>();
timer.Duration = 3f; // 3 seconds
timer.OnComplete += () => Logger.LogInformation("Timer finished!");
```

### LifetimeComponent

```csharp
var lifetime = entity.AddComponent<LifetimeComponent>();
lifetime.Lifetime = 5f; // Auto-destroy after 5 seconds
lifetime.AutoDestroy = true;
```

### TweenComponent

```csharp
var tween = entity.AddComponent<TweenComponent>();
tween.Type = TweenType.Position;
tween.StartPosition = new Vector2(0, 0);
tween.EndPosition = new Vector2(100, 100);
tween.Duration = 1f;
tween.Easing = EasingType.EaseInOutQuad;
tween.Loop = false;
tween.PingPong = false;
```

### VelocityComponent

```csharp
var velocity = entity.AddComponent<VelocityComponent>();
velocity.MaxSpeed = 200f;
velocity.Friction = 5f;
velocity.SetDirection(Vector2.UnitX, 100f); // Move right at 100 pixels/sec
```

---

## Performance Considerations

### Component Updates

Components update in the order they were added. If you have many entities:

```csharp
// ⚠️ Acceptable for <50 entities
public class SimpleComponent : Component
{
    protected internal override void OnUpdate(GameTime gameTime)
    {
        // Simple logic here
    }
}

// ✅ Better for 50+ entities - use a system instead
public class OptimizedComponent : Component
{
    // Just data, no OnUpdate
    public float Value { get; set; }
}

public class OptimizedSystem : IUpdateSystem
{
    public int UpdateOrder => 100;
    
    public void Update(GameTime gameTime)
    {
        // Batch process all entities
        var entities = _world.GetEntitiesWithComponent<OptimizedComponent>();
        foreach (var entity in entities)
        {
            // Process efficiently
        }
    }
}
```

### Enable/Disable Components

Disable components to skip updates:

```csharp
// Temporarily disable without removing
component.IsEnabled = false;

// Re-enable later
component.IsEnabled = true;
```

---

## Testing Components

Components are easy to test:

```csharp
[Test]
public void Timer_CompletesAfterDuration()
{
    var entity = new Entity();
    var timer = entity.AddComponent<TimerComponent>();
    timer.Duration = 1f;
    
    bool completed = false;
    timer.OnComplete += () => completed = true;
    
    // Simulate 1 second of updates
    for (int i = 0; i < 60; i++)
    {
        timer.OnUpdate(new GameTime(TimeSpan.FromSeconds(1), TimeSpan.FromSeconds(1f/60f)));
    }
    
    Assert.IsTrue(completed);
}

[Test]
public void Lifetime_DestroysEntity()
{
    var world = new EntityWorld();
    var entity = world.CreateEntity();
    
    var lifetime = entity.AddComponent<LifetimeComponent>();
    lifetime.Lifetime = 0.5f;
    lifetime.AutoDestroy = true;
    
    // Simulate time passing
    lifetime.OnUpdate(new GameTime(TimeSpan.FromSeconds(1), TimeSpan.FromSeconds(1)));
    
    Assert.IsFalse(world.Entities.Contains(entity));
}
```

---

## Quick Reference

### Component Checklist

When designing a component, ask:

- ✅ Is it a class inheriting from `Component`?
- ✅ Does it represent one concept? (single responsibility)
- ✅ Is the logic simple enough for `OnUpdate()`? (or should it be a system?)
- ✅ Does it use lifecycle hooks appropriately?
- ✅ Can it be tested easily?

### Common Component Types

| Type | Example | Use Case |
|------|---------|----------|
| **Data-Only** | `TransformComponent` | Processed by systems |
| **Behavior** | `LifetimeComponent` | Self-contained logic |
| **Controller** | `PlayerControllerComponent` | Input/AI (used by systems) |
| **Reference** | `AudioSourceComponent` | External objects |
| **Utility** | `TimerComponent` | Reusable helpers |

---

## Next Steps

Now that you understand components, learn how to process them efficiently:

<div class="grid cards" markdown>

-   **Systems Guide**

    ---

    Learn to create systems for performance-critical logic

    [:octicons-arrow-right-24: Systems Guide](systems.md)

-   **Entities Guide**

    ---

    Master entity creation and management

    [:octicons-arrow-right-24: Entities Guide](entities.md)

-   **ECS Concepts**

    ---

    Deeper dive into ECS architecture

    [:octicons-arrow-right-24: ECS Concepts](../../concepts/entity-component-system.md)

</div>

---

**Remember:** Brine2D's hybrid ECS gives you flexibility - use component logic for simplicity, systems for performance. Choose what fits your needs!