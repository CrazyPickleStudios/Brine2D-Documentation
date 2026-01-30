---
title: Entity Component System
description: Understanding Brine2D's flexible hybrid ECS - beginner-friendly with optional performance optimization
---

# Entity Component System

Brine2D features a **hybrid ECS** that combines the best of object-oriented and data-oriented design. Start simple with Unity-style components, then optimize with systems when needed.

## Overview

**Hybrid ECS** means you have **three flexible options**:

| Approach | When to Use | Complexity |
|----------|-------------|------------|
| **Components with logic** | Most games, prototyping, learning | ⭐ Beginner-friendly |
| **Entity inheritance** | Specialized game objects, behaviors | ⭐⭐ Intermediate |
| **Systems (data-oriented)** | Performance-critical code, batching | ⭐⭐⭐ Advanced |

**Core principle:** Composition over inheritance, with optional performance optimization.

**Benefits:**
- ✅ Beginner-friendly (Unity-style components with methods)
- ✅ Flexible entity composition
- ✅ Optional data-oriented optimization (systems)
- ✅ Scoped EntityWorld per scene (automatic cleanup!)

---

## The Hybrid Approach

### Traditional ECS (Pure)

~~~csharp
// ❌ Traditional "pure" ECS - rigid rules
// Components = ONLY data (no methods allowed)
// Systems = ONLY logic (batch processing required)
// Result: Steep learning curve for beginners

public class HealthComponent : IComponent
{
    public int Current { get; set; }
    // ❌ Can't add methods - must use systems for ALL logic
}

public class HealthSystem : ISystem
{
    // ❌ MUST write systems even for simple logic
}
~~~

### Brine2D Hybrid ECS

~~~csharp
// ✅ Brine2D - flexible hybrid approach
// Components CAN have methods (beginner-friendly)
// Systems OPTIONAL (use when you need performance)
// Result: Easy to learn, optimize when needed

public class HealthComponent : Component
{
    public int Current { get; set; }
    public int Max { get; set; }
    
    // ✅ Methods allowed! Just like Unity
    public void TakeDamage(int amount)
    {
        Current = Math.Max(0, Current - amount);
    }
    
    // ✅ Lifecycle methods available
    protected internal override void OnUpdate(GameTime gameTime)
    {
        // Optional per-frame logic
    }
}

// ✅ Systems are OPTIONAL - use for performance optimization
public class HealthSystem : GameSystem
{
    // Use when you want data-oriented batch processing
}
~~~

---

## Entities

### What is an Entity?

An entity is a **container for components** with optional lifecycle methods:

~~~csharp
public class Entity
{
    public Guid Id { get; } = Guid.NewGuid();
    public string Name { get; set; }
    public bool IsActive { get; set; } = true;
    public IEntityWorld? World { get; internal set; }
    
    // Component storage
    private readonly Dictionary<Type, Component> _components = new();
    
    // ✅ Lifecycle methods (override in derived classes)
    public virtual void OnInitialize() { }
    public virtual void OnUpdate(GameTime gameTime) 
    {
        // ✅ Automatically calls OnUpdate on all components!
        foreach (var component in _components.Values)
        {
            if (component.IsEnabled)
            {
                component.OnUpdate(gameTime);
            }
        }
    }
    public virtual void OnRender(IRenderer renderer) { }
    public virtual void OnDestroy() { }
}
~~~

**Pattern:** Entity is a component container with optional behavior.

---

### Creating Entities (Simple Approach)

~~~csharp
using Brine2D.ECS;
using System.Numerics;

public class GameScene : Scene
{
    protected override Task OnLoadAsync(CancellationToken ct)
    {
        // World is available automatically (scoped per scene!)
        
        // Create player entity
        var player = World.CreateEntity("Player");
        
        // Add components
        var transform = player.AddComponent<TransformComponent>();
        transform.Position = new Vector2(400, 300);
        
        var sprite = player.AddComponent<SpriteComponent>();
        sprite.Width = 32;
        sprite.Height = 32;
        
        // ✅ Component with logic
        var health = player.AddComponent<HealthComponent>();
        health.Max = 100;
        health.Current = 100;
        
        // Tag component
        player.AddTag("Player");
        
        return Task.CompletedTask;
    }
    
    protected override void OnUpdate(GameTime gameTime)
    {
        // ✅ World automatically calls OnUpdate on all entities
        // Which automatically calls OnUpdate on all components!
        // No systems required for simple games!
    }
}
~~~

**Pattern:** Entities are composed by adding components.

---

### Entity Inheritance (OOP Approach)

You can **derive from Entity** for specialized game objects:

~~~csharp
// ✅ Custom entity class (Unity GameObject pattern)
public class PlayerEntity : Entity
{
    private TransformComponent? _transform;
    private HealthComponent? _health;
    private SpriteComponent? _sprite;
    
    public override void OnInitialize()
    {
        // Cache component references
        _transform = AddComponent<TransformComponent>();
        _transform.Position = new Vector2(400, 300);
        
        _health = AddComponent<HealthComponent>();
        _health.Max = 100;
        _health.Current = 100;
        
        _sprite = AddComponent<SpriteComponent>();
        _sprite.Width = 32;
        _sprite.Height = 32;
        
        AddTag("Player");
    }
    
    public override void OnUpdate(GameTime gameTime)
    {
        // Custom player logic here
        HandleInput();
        
        // ✅ Still calls base to update components
        base.OnUpdate(gameTime);
    }
    
    private void HandleInput()
    {
        // Player-specific logic
    }
}

// Usage
var player = World.CreateEntity<PlayerEntity>("Player");
~~~

**Pattern:** Derive from Entity for specialized behavior.

---

### Entity Factories (Best Practice)

~~~csharp
public static class EntityFactory
{
    public static Entity CreatePlayer(IEntityWorld world, Vector2 position)
    {
        var entity = world.CreateEntity("Player");
        
        var transform = entity.AddComponent<TransformComponent>();
        transform.Position = position;
        
        var sprite = entity.AddComponent<SpriteComponent>();
        sprite.Width = 32;
        sprite.Height = 32;
        
        var health = entity.AddComponent<HealthComponent>();
        health.Max = 100;
        health.Current = 100;
        
        entity.AddTag("Player");
        
        return entity;
    }
    
    public static Entity CreateEnemy(IEntityWorld world, Vector2 position)
    {
        var entity = world.CreateEntity("Enemy");
        
        var transform = entity.AddComponent<TransformComponent>();
        transform.Position = position;
        
        var sprite = entity.AddComponent<SpriteComponent>();
        sprite.Width = 32;
        sprite.Height = 32;
        
        var ai = entity.AddComponent<AIComponent>();
        ai.Type = AIType.Patrol;
        
        entity.AddTag("Enemy");
        
        return entity;
    }
}

// Usage
var player = EntityFactory.CreatePlayer(World, new Vector2(400, 300));
var enemy = EntityFactory.CreateEnemy(World, new Vector2(600, 200));
~~~

**Pattern:** Factory methods encapsulate entity creation.

---

## Components

### Components with Logic (Recommended)

Components **can have methods** - this is the recommended approach for most games:

~~~csharp
// ✅ Component with logic (Unity pattern)
public class HealthComponent : Component
{
    public int Current { get; set; }
    public int Max { get; set; }
    
    public bool IsDead => Current <= 0;
    
    // ✅ Methods allowed!
    public void TakeDamage(int amount)
    {
        Current = Math.Max(0, Current - amount);
        
        if (IsDead)
        {
            Logger.LogInformation("{Entity} died!", EntityName);
        }
    }
    
    public void Heal(int amount)
    {
        Current = Math.Min(Max, Current + amount);
    }
    
    // ✅ Lifecycle methods
    protected internal override void OnAdded()
    {
        Logger.LogDebug("HealthComponent added to {Entity}", EntityName);
    }
    
    protected internal override void OnUpdate(GameTime gameTime)
    {
        // Optional per-frame logic
        // Example: regenerate health over time
        if (Current < Max)
        {
            Current += (int)(10 * gameTime.DeltaTime); // Regen 10 HP/sec
            Current = Math.Min(Current, Max);
        }
    }
}

// Usage - simple and intuitive!
var health = entity.GetComponent<HealthComponent>();
health.TakeDamage(25);
~~~

**Pattern:** Components can have methods and lifecycle hooks (Unity-style).

---

### Component Lifecycle

Components have rich lifecycle hooks:

~~~csharp
public class MyComponent : Component
{
    // ✅ Called when component is added to entity
    protected internal override void OnAdded()
    {
        Logger.LogInformation("Component added to {Entity}", EntityName);
    }
    
    // ✅ Called when component is removed from entity
    protected internal override void OnRemoved()
    {
        Logger.LogInformation("Component removed from {Entity}", EntityName);
    }
    
    // ✅ Called when component is enabled
    protected internal override void OnEnabled()
    {
        Logger.LogInformation("Component enabled");
    }
    
    // ✅ Called when component is disabled
    protected internal override void OnDisabled()
    {
        Logger.LogInformation("Component disabled");
    }
    
    // ✅ Called every frame (if component is enabled)
    protected internal override void OnUpdate(GameTime gameTime)
    {
        // Per-frame logic here
    }
}
~~~

---

### Component Helpers

Components have convenient helper methods:

~~~csharp
public class MyComponent : Component
{
    protected internal override void OnUpdate(GameTime gameTime)
    {
        // ✅ Get sibling component (same entity)
        var transform = GetComponent<TransformComponent>();
        
        // ✅ Get required component (throws if missing)
        var sprite = GetRequiredComponent<SpriteComponent>();
        
        // ✅ Try get component (safe)
        if (TryGetComponent<HealthComponent>(out var health))
        {
            health.TakeDamage(10);
        }
        
        // ✅ Get component in children (hierarchy)
        var childHealth = GetComponentInChildren<HealthComponent>();
        
        // ✅ Get component in parent (hierarchy)
        var parentTransform = GetComponentInParent<TransformComponent>();
        
        // ✅ Access entity properties
        Logger.LogDebug("Entity: {Name}, Tags: {Tags}", EntityName, EntityTags);
        
        // ✅ Shortcut for transform
        var pos = Transform?.Position;
        
        // ✅ Remove this component
        if (shouldRemove)
        {
            Destroy();
        }
    }
}
~~~

---

### Built-in Components

Brine2D provides common components (all have lifecycle methods):

~~~csharp
// Transform (position, rotation, scale)
public class TransformComponent : Component
{
    public Vector2 Position { get; set; }
    public float Rotation { get; set; }
    public Vector2 Scale { get; set; } = Vector2.One;
    
    // ✅ Helper properties
    public Vector2 Right => new Vector2(MathF.Cos(Rotation), MathF.Sin(Rotation));
    public Vector2 Up => new Vector2(-MathF.Sin(Rotation), MathF.Cos(Rotation));
}

// Sprite (visual representation)
public class SpriteComponent : Component
{
    public ITexture? Texture { get; set; }
    public int Width { get; set; }
    public int Height { get; set; }
    public Color Tint { get; set; } = Color.White;
    public Rectangle? SourceRect { get; set; }
}
~~~

---

## Systems (Optional Performance Optimization)

Systems are **optional** - use them when you need **data-oriented batch processing** for performance:

### When to Use Systems

| Use Components | Use Systems |
|----------------|-------------|
| ✅ Learning/prototyping | ✅ 1000+ entities to process |
| ✅ Simple games | ✅ Performance-critical code |
| ✅ Unique entity behavior | ✅ Batch processing (physics, particles) |
| ✅ Intuitive code | ✅ Data-oriented design |

---

### System Example (Advanced)

~~~csharp
// ✅ Optional: Use systems for performance-critical batch processing
public class MovementSystem : GameSystem
{
    public override void OnUpdate(GameTime gameTime)
    {
        var deltaTime = (float)gameTime.DeltaTime;
        
        // Query entities with Transform and Velocity
        // ✅ Process in batch for better cache performance
        var entities = World.GetEntitiesWithComponents<TransformComponent, VelocityComponent>();
        
        foreach (var entity in entities)
        {
            var transform = entity.GetComponent<TransformComponent>();
            var velocity = entity.GetComponent<VelocityComponent>();
            
            if (transform != null && velocity != null)
            {
                // Update position
                transform.Position += velocity.Value * deltaTime;
            }
        }
    }
}

// Register system (if using systems)
// Note: Most games DON'T need to register systems!
public class GameScene : Scene
{
    protected override Task OnInitializeAsync(CancellationToken ct)
    {
        // ✅ Optional: Register systems for performance
        // Most games don't need this - components handle logic automatically!
        
        // Only register systems if you need data-oriented optimization
        // World.RegisterSystem<MovementSystem>();
        
        return Task.CompletedTask;
    }
}
~~~

---

## EntityWorld (Scoped Per Scene!)

**Each scene gets its own isolated EntityWorld** - this is huge!

~~~csharp
public class GameScene : Scene
{
    // ✅ World is automatically available (scoped per scene!)
    
    protected override Task OnLoadAsync(CancellationToken ct)
    {
        // World is fresh and empty when scene loads
        var player = World.CreateEntity("Player");
        var enemy = World.CreateEntity("Enemy");
        
        Logger.LogInformation("Created {Count} entities", World.Entities.Count); // 2
        
        return Task.CompletedTask;
    }
    
    protected override void OnUpdate(GameTime gameTime)
    {
        // ✅ World automatically calls OnUpdate on all entities
        // Which automatically calls OnUpdate on all components
        // No manual system management required!
    }

    protected override Task OnUnloadAsync(CancellationToken ct)
    {
        // ✅ No cleanup needed!
        // When scene ends, World is disposed automatically
        // All entities destroyed, no memory leaks!
        
        return Task.CompletedTask;
    }
}
~~~

**Benefits:**

| Traditional (Shared World) | Scoped World (Brine2D) |
|----------------------------|------------------------|
| ❌ Manual cleanup required | ✅ Automatic cleanup |
| ❌ Memory leaks possible | ✅ No memory leaks |
| ❌ Scenes interfere | ✅ Complete isolation |
| ❌ Stale entities | ✅ Fresh slate per scene |

**Pattern:** This matches ASP.NET's request scope - each scene gets its own isolated EntityWorld!

---

## Querying Entities

### Basic Queries

~~~csharp
// Get entity by name
var player = World.GetEntityByName("Player");

// Get entity by ID
var enemy = World.GetEntityById(enemyId);

// Get entities with tag
var enemies = World.GetEntitiesByTag("Enemy");

// Get entities with component
var damageable = World.GetEntitiesWithComponent<HealthComponent>();

// Get entities with multiple components
var movable = World.GetEntitiesWithComponents<TransformComponent, VelocityComponent>();
~~~

---

### Advanced Queries

~~~csharp
// Find first entity matching predicate
var player = World.FindEntity(e => e.Tags.Contains("Player") && e.IsActive);

// Filter by component data
var lowHealth = World.GetEntitiesWithComponent<HealthComponent>()
    .Where(e => e.GetComponent<HealthComponent>()!.Current < 20);

// Get all entities
foreach (var entity in World.Entities)
{
    Logger.LogDebug("Entity: {Name}, Tags: {Tags}", entity.Name, string.Join(", ", entity.Tags));
}
~~~

---

## Complete Example

### Simple Game (Component-Based)

~~~csharp
using Brine2D.Core;
using Brine2D.ECS;
using Brine2D.ECS.Components;
using Brine2D.Engine;
using Brine2D.Input;
using System.Numerics;

// ✅ Simple component with logic (beginner-friendly)
public class PlayerMovementComponent : Component
{
    public float Speed { get; set; } = 200f;
    private IInputContext? _input;
    
    protected internal override void OnAdded()
    {
        // Get input from DI
        _input = Entity?.World?.ServiceProvider.GetService<IInputContext>();
    }
    
    protected internal override void OnUpdate(GameTime gameTime)
    {
        if (_input == null) return;
        
        var transform = GetRequiredComponent<TransformComponent>();
        var deltaTime = (float)gameTime.DeltaTime;
        
        // Handle movement
        var movement = Vector2.Zero;
        if (_input.IsKeyDown(Key.W)) movement.Y -= 1;
        if (_input.IsKeyDown(Key.S)) movement.Y += 1;
        if (_input.IsKeyDown(Key.A)) movement.X -= 1;
        if (_input.IsKeyDown(Key.D)) movement.X += 1;
        
        if (movement != Vector2.Zero)
        {
            movement = Vector2.Normalize(movement);
            transform.Position += movement * Speed * deltaTime;
        }
    }
}

public class HealthComponent : Component
{
    public int Current { get; set; } = 100;
    public int Max { get; set; } = 100;
    
    public bool IsDead => Current <= 0;
    
    public void TakeDamage(int amount)
    {
        Current = Math.Max(0, Current - amount);
        
        if (IsDead)
        {
            Logger.LogInformation("{Entity} died!", EntityName);
            Entity?.World?.DestroyEntity(Entity);
        }
    }
}

public class GameScene : Scene
{
    protected override Task OnLoadAsync(CancellationToken ct)
    {
        // World is available automatically!
        
        // Create player
        var player = World.CreateEntity("Player");
        
        var transform = player.AddComponent<TransformComponent>();
        transform.Position = new Vector2(400, 300);
        
        var sprite = player.AddComponent<SpriteComponent>();
        sprite.Width = 32;
        sprite.Height = 32;
        
        // ✅ Component with logic - handles movement automatically!
        var movement = player.AddComponent<PlayerMovementComponent>();
        movement.Speed = 250f;
        
        var health = player.AddComponent<HealthComponent>();
        health.Max = 100;
        health.Current = 100;
        
        player.AddTag("Player");
        
        Logger.LogInformation("Player created");
        
        return Task.CompletedTask;
    }
    
    protected override void OnUpdate(GameTime gameTime)
    {
        // ✅ That's it! Components handle everything automatically
        // No systems required for simple games!
    }
}
~~~

---

## Hybrid ECS vs Traditional ECS

### Traditional Pure ECS

~~~csharp
// ❌ Traditional "pure" ECS - steep learning curve

// Components are ONLY data
public struct HealthComponent : IComponent
{
    public int Current;
    public int Max;
    // ❌ No methods allowed!
}

// ALL logic must be in systems
public class HealthSystem : ISystem
{
    public void Update(World world)
    {
        // Query all health components
        foreach (var entity in world.Query<HealthComponent>())
        {
            // Process every entity's health here
            // ❌ Even for simple operations!
        }
    }
}

// Problems:
// - Steep learning curve
// - Verbose (systems required for everything)
// - Less intuitive for beginners
// - Optimization comes first, simplicity second
~~~

---

### Brine2D Hybrid ECS

~~~csharp
// ✅ Brine2D hybrid - easy to learn, optimize later

// Components CAN have logic
public class HealthComponent : Component
{
    public int Current { get; set; }
    public int Max { get; set; }
    
    // ✅ Methods allowed! Simple and intuitive
    public void TakeDamage(int amount)
    {
        Current = Math.Max(0, Current - amount);
    }
    
    // ✅ Optional lifecycle
    protected internal override void OnUpdate(GameTime gameTime)
    {
        // Optional per-frame logic
    }
}

// Systems OPTIONAL (use for performance optimization)
public class HealthSystem : GameSystem
{
    // Only needed if you want data-oriented batch processing
    public override void OnUpdate(GameTime gameTime)
    {
        // Batch process thousands of entities for performance
    }
}

// Benefits:
// - Easy to learn (Unity-style)
// - Intuitive component methods
// - Optional systems for optimization
// - Simplicity first, performance when needed
~~~

---

## Hybrid ECS vs Traditional OOP

### Traditional Inheritance

~~~csharp
// ❌ Traditional OOP - rigid hierarchy
public abstract class GameObject
{
    public Vector2 Position { get; set; }
    public abstract void Update(GameTime gameTime);
}

public class Player : GameObject
{
    public int Health { get; set; }
    public float Speed { get; set; }
    
    public override void Update(GameTime gameTime) { }
}

public class Enemy : GameObject
{
    public int Health { get; set; }  // ❌ Duplicate!
    public float Speed { get; set; }  // ❌ Duplicate!
    public AIState State { get; set; }
    
    public override void Update(GameTime gameTime) { }
}

// Problems:
// - Duplicate code (Health, Speed repeated)
// - Hard to add new behaviors
// - Deep inheritance hierarchies
// - Multiple inheritance not possible
~~~

---

### Brine2D Composition

~~~csharp
// ✅ Brine2D - flexible composition
public class TransformComponent : Component
{
    public Vector2 Position { get; set; }
}

public class HealthComponent : Component
{
    public int Current { get; set; }
    public int Max { get; set; }
    
    // ✅ Methods allowed!
    public void TakeDamage(int amount) 
    { 
        Current = Math.Max(0, Current - amount); 
    }
}

public class VelocityComponent : Component
{
    public float Speed { get; set; }
}

// Player = Transform + Health + Velocity + PlayerMovement
var player = World.CreateEntity("Player");
player.AddComponent<TransformComponent>();
player.AddComponent<HealthComponent>();
player.AddComponent<VelocityComponent>();
player.AddComponent<PlayerMovementComponent>();

// Enemy = Transform + Health + Velocity + AI
var enemy = World.CreateEntity("Enemy");
enemy.AddComponent<TransformComponent>();
enemy.AddComponent<HealthComponent>();  // ✅ Reused!
enemy.AddComponent<VelocityComponent>();  // ✅ Reused!
enemy.AddComponent<AIComponent>();

// Benefits:
// - No duplication (components reused)
// - Easy to add new behaviors (add component)
// - Flexible composition (mix and match)
// - Components can have methods (intuitive!)
~~~

---

## Best Practices

### ✅ DO (Recommended Patterns)

**1. Use components with methods (beginner-friendly)**

~~~csharp
// ✅ Good - component with logic (most games)
public class HealthComponent : Component
{
    public int Current { get; set; }
    public int Max { get; set; }
    
    // ✅ Methods make code intuitive!
    public void TakeDamage(int amount)
    {
        Current = Math.Max(0, Current - amount);
    }
    
    public void Heal(int amount)
    {
        Current = Math.Min(Max, Current + amount);
    }
}

// Usage - simple and clear
var health = entity.GetComponent<HealthComponent>();
health.TakeDamage(25);
~~~

**2. Use lifecycle methods**

~~~csharp
// ✅ Good - use lifecycle hooks
public class MyComponent : Component
{
    protected internal override void OnAdded()
    {
        Logger.LogInformation("Component added to {Entity}", EntityName);
    }
    
    protected internal override void OnUpdate(GameTime gameTime)
    {
        // Per-frame logic here
    }
}
~~~

**3. Use entity factories**

~~~csharp
// ✅ Good - encapsulate entity creation
public static class EntityFactory
{
    public static Entity CreatePlayer(IEntityWorld world, Vector2 position)
    {
        var entity = world.CreateEntity("Player");
        entity.AddComponent<TransformComponent>().Position = position;
        entity.AddComponent<SpriteComponent>().Width = 32;
        // ... add more components
        return entity;
    }
}
~~~

**4. Use component helpers**

~~~csharp
// ✅ Good - use component helper methods
public class MyComponent : Component
{
    protected internal override void OnUpdate(GameTime gameTime)
    {
        // Get sibling component
        var transform = GetRequiredComponent<TransformComponent>();
        
        // Try get component (safe)
        if (TryGetComponent<HealthComponent>(out var health))
        {
            health.TakeDamage(10);
        }
    }
}
~~~

**5. Let World cleanup happen automatically**

~~~csharp
// ✅ Good - no cleanup needed!
protected override Task OnUnloadAsync(CancellationToken ct)
{
    // ✅ All entities destroyed automatically when scene ends
    return Task.CompletedTask;
}
~~~

---

### ❌ DON'T (Anti-Patterns)

**1. Don't avoid methods in components (unnecessary restriction)**

~~~csharp
// ❌ Bad - avoiding methods for no reason
public class HealthComponent : Component
{
    public int Current { get; set; }
    // ❌ Missing methods makes code harder to use!
}

// Usage becomes verbose and error-prone
var health = entity.GetComponent<HealthComponent>();
health.Current = Math.Max(0, health.Current - 25);  // ❌ Verbose!

// ✅ Good - use methods for clarity
public class HealthComponent : Component
{
    public int Current { get; set; }
    
    public void TakeDamage(int amount)
    {
        Current = Math.Max(0, Current - amount);
    }
}

// Usage is clear and safe
health.TakeDamage(25);  // ✅ Clear intent!
~~~

**2. Don't store entity references (use IDs)**

~~~csharp
// ❌ Bad - storing entity reference
public class FollowComponent : Component
{
    public Entity? Target { get; set; }  // ❌ Can become invalid!
}

// ✅ Good - use entity ID
public class FollowComponent : Component
{
    public Guid TargetId { get; set; }
    
    protected internal override void OnUpdate(GameTime gameTime)
    {
        var target = Entity?.World?.GetEntityById(TargetId);
        if (target != null)
        {
            // Follow target
        }
    }
}
~~~

**3. Don't manually cleanup World**

~~~csharp
// ❌ Bad - manual cleanup (not needed!)
protected override Task OnUnloadAsync(CancellationToken ct)
{
    foreach (var entity in World.Entities.ToList())  // ❌ Not needed!
    {
        World.DestroyEntity(entity);
    }
    return Task.CompletedTask;
}

// ✅ Good - automatic cleanup
protected override Task OnUnloadAsync(CancellationToken ct)
{
    // ✅ World disposed automatically - no cleanup needed!
    return Task.CompletedTask;
}
~~~

---

## When to Use Systems

Systems are **optional** - only use them when you need data-oriented optimization:

| Scenario | Use Components | Use Systems |
|----------|----------------|-------------|
| Learning/prototyping | ✅ Yes | ❌ No |
| Simple games (< 500 entities) | ✅ Yes | ❌ No |
| Unique entity behavior | ✅ Yes | ❌ No |
| Performance-critical (1000+ entities) | ❌ No | ✅ Yes |
| Batch processing (physics, particles) | ❌ No | ✅ Yes |
| Data-oriented optimization | ❌ No | ✅ Yes |

**Rule of thumb:** Start with components, add systems only if profiling shows a performance problem.

---

## Summary

**Brine2D's Hybrid ECS:**

| Feature | Description |
|---------|-------------|
| **Entities** | Component containers with optional lifecycle methods |
| **Components** | Can have methods and lifecycle hooks (Unity-style) |
| **Systems** | Optional data-oriented batch processing for performance |
| **Scoped World** | Each scene gets isolated EntityWorld - automatic cleanup! |
| **Flexible** | Start simple (components), optimize later (systems) |

**Key benefits:**

| Benefit | Description |
|---------|-------------|
| **Beginner-friendly** | Unity-style components with methods |
| **Flexible** | Composition over inheritance |
| **Performance** | Optional systems for data-oriented optimization |
| **Automatic cleanup** | Scoped World per scene - no memory leaks! |
| **Intuitive** | Code reads naturally with component methods |

**Common patterns:**

| Pattern | Usage |
|---------|-------|
| **Component methods** | Recommended for most games |
| **Entity factories** | Encapsulate entity creation |
| **Lifecycle hooks** | OnUpdate, OnAdded, OnEnabled, etc. |
| **Scoped World** | Automatic cleanup per scene |
| **Optional systems** | Use only for performance optimization |

---

## Next Steps

- **[ECS Getting Started](../guides/ecs/getting-started.md)** - Practical ECS tutorial
- **[Components Guide](../guides/ecs/components.md)** - Deep dive into components
- **[Systems Guide](../guides/ecs/systems.md)** - When and how to use systems
- **[Entities Guide](../guides/ecs/entities.md)** - Entity management patterns
- **[Queries Guide](../guides/ecs/queries.md)** - Advanced entity queries

---

## Quick Reference

~~~csharp
// Create entity
var entity = World.CreateEntity("Player");

// Add components (with methods!)
var health = entity.AddComponent<HealthComponent>();
health.Max = 100;
health.Current = 100;
health.TakeDamage(25);  // ✅ Methods allowed!

// Get component
var transform = entity.GetComponent<TransformComponent>();

// Get required component (throws if missing)
var sprite = entity.GetRequiredComponent<SpriteComponent>();

// Check component
if (entity.HasComponent<HealthComponent>())
{
    var health = entity.GetComponent<HealthComponent>();
}

// Remove component
entity.RemoveComponent<VelocityComponent>();

// Component with lifecycle
public class MyComponent : Component
{
    public int Value { get; set; }
    
    // ✅ Methods allowed!
    public void DoSomething()
    {
        Logger.LogInformation("Doing something with {Value}", Value);
    }
    
    // ✅ Lifecycle hooks
    protected internal override void OnAdded() { }
    protected internal override void OnUpdate(GameTime gameTime) { }
    protected internal override void OnRemoved() { }
}

// Query entities
var players = World.GetEntitiesByTag("Player");
var damageable = World.GetEntitiesWithComponent<HealthComponent>();
var movable = World.GetEntitiesWithComponents<TransformComponent, VelocityComponent>();
~~~

---

**Remember:** Brine2D's hybrid ECS is designed to be **beginner-friendly** with **optional performance optimization**. Start simple with components that have methods, then add systems only when profiling shows you need them! 🎮