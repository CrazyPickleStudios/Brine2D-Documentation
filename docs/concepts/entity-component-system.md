---
title: Entity Component System
description: Understanding ECS architecture - composition over inheritance in Brine2D
---

# Entity Component System

Learn how Brine2D's Entity Component System (ECS) enables flexible, performant game architecture through composition.

## Overview

ECS is an architectural pattern that separates data from logic:

- **Entities** - Unique identifiers (just IDs)
- **Components** - Pure data (no logic)
- **Systems** - Pure logic (no data)

**Core principle:** Composition over inheritance.

**Benefits:**
- Flexible entity composition
- Better performance (data-oriented)
- Easy to test and maintain
- Scalable architecture

---

## ECS Architecture

### The Three Pillars

~~~mermaid
graph TB
    subgraph Entities
        E1[Entity 1<br/>ID: 1]
        E2[Entity 2<br/>ID: 2]
        E3[Entity 3<br/>ID: 3]
    end
    
    subgraph Components
        C1[TransformComponent<br/>Position, Rotation]
        C2[SpriteComponent<br/>Texture, Color]
        C3[VelocityComponent<br/>Speed, Direction]
        C4[HealthComponent<br/>Current, Max]
    end
    
    subgraph Systems
        S1[MovementSystem<br/>Updates Position]
        S2[RenderSystem<br/>Draws Sprites]
        S3[HealthSystem<br/>Manages Health]
    end
    
    E1 --> C1
    E1 --> C2
    E1 --> C3
    
    E2 --> C1
    E2 --> C2
    E2 --> C4
    
    E3 --> C1
    E3 --> C4
    
    S1 -.->|Queries| C1
    S1 -.->|Queries| C3
    S2 -.->|Queries| C1
    S2 -.->|Queries| C2
    S3 -.->|Queries| C4
    
    style E1 fill:#264f78,stroke:#4fc1ff,stroke-width:2px,color:#fff
    style E2 fill:#264f78,stroke:#4fc1ff,stroke-width:2px,color:#fff
    style E3 fill:#264f78,stroke:#4fc1ff,stroke-width:2px,color:#fff
    style C1 fill:#2d5016,stroke:#4ec9b0,stroke-width:2px,color:#fff
    style C2 fill:#2d5016,stroke:#4ec9b0,stroke-width:2px,color:#fff
    style C3 fill:#2d5016,stroke:#4ec9b0,stroke-width:2px,color:#fff
    style C4 fill:#2d5016,stroke:#4ec9b0,stroke-width:2px,color:#fff
    style S1 fill:#4a2d4a,stroke:#c586c0,stroke-width:2px,color:#fff
    style S2 fill:#4a2d4a,stroke:#c586c0,stroke-width:2px,color:#fff
    style S3 fill:#4a2d4a,stroke:#c586c0,stroke-width:2px,color:#fff
~~~

**Key concept:** Entities are composed of components, systems operate on entities with specific component combinations.

---

## Entities

### What is an Entity?

An entity is just a unique identifier - nothing more:

~~~csharp
public class Entity
{
    public int Id { get; }
    public string Name { get; set; }
    
    private readonly Dictionary<Type, Component> _components = new();
    
    // Add component
    public void AddComponent<T>(T component) where T : Component
    {
        _components[typeof(T)] = component;
    }
    
    // Get component
    public T? GetComponent<T>() where T : Component
    {
        return _components.TryGetValue(typeof(T), out var component) 
            ? (T)component 
            : null;
    }
    
    // Check if has component
    public bool HasComponent<T>() where T : Component
    {
        return _components.ContainsKey(typeof(T));
    }
    
    // Remove component
    public void RemoveComponent<T>() where T : Component
    {
        _components.Remove(typeof(T));
    }
}
~~~

**Pattern:** Entity is a container for components.

---

### Creating Entities

~~~csharp
using Brine2D.ECS;

public class GameScene : Scene
{
    private readonly World _world;
    
    protected override void OnInitialize()
    {
        // Create player entity
        var player = _world.CreateEntity("Player");
        
        // Add components
        player.AddComponent(new TransformComponent
        {
            Position = new Vector2(400, 300)
        });
        
        player.AddComponent(new SpriteComponent
        {
            Texture = _playerTexture,
            Width = 64,
            Height = 64
        });
        
        player.AddComponent(new VelocityComponent
        {
            Speed = 200f
        });
        
        player.AddComponent(new PlayerComponent()); // Tag component
    }
}
~~~

**Pattern:** Entities are composed by adding components.

---

### Entity Builder Pattern

~~~csharp
public static class EntityFactory
{
    public static Entity CreatePlayer(World world, Vector2 position)
    {
        var entity = world.CreateEntity("Player");
        
        entity.AddComponent(new TransformComponent { Position = position });
        entity.AddComponent(new SpriteComponent { Width = 64, Height = 64 });
        entity.AddComponent(new VelocityComponent { Speed = 200f });
        entity.AddComponent(new HealthComponent { Current = 100, Max = 100 });
        entity.AddComponent(new PlayerComponent());
        
        return entity;
    }
    
    public static Entity CreateEnemy(World world, Vector2 position)
    {
        var entity = world.CreateEntity("Enemy");
        
        entity.AddComponent(new TransformComponent { Position = position });
        entity.AddComponent(new SpriteComponent { Width = 32, Height = 32 });
        entity.AddComponent(new VelocityComponent { Speed = 100f });
        entity.AddComponent(new HealthComponent { Current = 50, Max = 50 });
        entity.AddComponent(new AIComponent());
        
        return entity;
    }
    
    public static Entity CreateProjectile(World world, Vector2 position, Vector2 direction)
    {
        var entity = world.CreateEntity("Projectile");
        
        entity.AddComponent(new TransformComponent { Position = position });
        entity.AddComponent(new SpriteComponent { Width = 8, Height = 8 });
        entity.AddComponent(new VelocityComponent 
        { 
            Speed = 500f,
            Direction = direction
        });
        entity.AddComponent(new ProjectileComponent { Damage = 10 });
        
        return entity;
    }
}

// Usage
var player = EntityFactory.CreatePlayer(_world, new Vector2(400, 300));
var enemy = EntityFactory.CreateEnemy(_world, new Vector2(600, 200));
~~~

**Pattern:** Factory methods encapsulate entity creation.

---

## Components

### What is a Component?

A component is pure data - no logic:

~~~csharp
public abstract class Component
{
    public Entity? Owner { get; internal set; }
}

// Transform component
public class TransformComponent : Component
{
    public Vector2 Position { get; set; }
    public float Rotation { get; set; }
    public Vector2 Scale { get; set; } = Vector2.One;
}

// Sprite component
public class SpriteComponent : Component
{
    public ITexture? Texture { get; set; }
    public int Width { get; set; }
    public int Height { get; set; }
    public Color Tint { get; set; } = Color.White;
    public Rectangle? SourceRect { get; set; }
}

// Velocity component
public class VelocityComponent : Component
{
    public Vector2 Velocity { get; set; }
    public float Speed { get; set; }
    public Vector2 Direction { get; set; }
}

// Health component
public class HealthComponent : Component
{
    public int Current { get; set; }
    public int Max { get; set; }
    public bool IsDead => Current <= 0;
}
~~~

**Rule:** Components only have data (properties), no methods.

---

### Component Types

**1. Data Components** - Hold gameplay data:

~~~csharp
public class HealthComponent : Component
{
    public int Current { get; set; }
    public int Max { get; set; }
}

public class WeaponComponent : Component
{
    public int Damage { get; set; }
    public float FireRate { get; set; }
    public int Ammo { get; set; }
}
~~~

**2. Tag Components** - Mark entities (no data):

~~~csharp
public class PlayerComponent : Component { }
public class EnemyComponent : Component { }
public class ProjectileComponent : Component { }
~~~

**3. Relationship Components** - Link entities:

~~~csharp
public class ParentComponent : Component
{
    public Entity? Parent { get; set; }
}

public class ChildrenComponent : Component
{
    public List<Entity> Children { get; } = new();
}
~~~

---

### Built-in Components

Brine2D provides common components:

~~~csharp
// Transform (position, rotation, scale)
public class TransformComponent : Component
{
    public Vector2 Position { get; set; }
    public float Rotation { get; set; }
    public Vector2 Scale { get; set; } = Vector2.One;
}

// Sprite (visual representation)
public class SpriteComponent : Component
{
    public ITexture? Texture { get; set; }
    public int Width { get; set; }
    public int Height { get; set; }
    public Color Tint { get; set; } = Color.White;
}

// Rigidbody (physics simulation)
public class RigidbodyComponent : Component
{
    public Vector2 Velocity { get; set; }
    public float Mass { get; set; } = 1.0f;
    public float Drag { get; set; } = 0.1f;
    public bool UseGravity { get; set; }
}

// Collider (collision detection)
public class ColliderComponent : Component
{
    public ColliderType Type { get; set; }
    public Vector2 Offset { get; set; }
    public Vector2 Size { get; set; }
    public bool IsTrigger { get; set; }
}
~~~

---

## Systems

### What is a System?

A system is pure logic - processes entities with specific components:

~~~csharp
public interface IUpdateSystem
{
    string Name { get; }
    int UpdateOrder { get; }
    void Update(GameTime gameTime);
}

public interface IRenderSystem
{
    string Name { get; }
    int RenderOrder { get; }
    void Render(GameTime gameTime);
}
~~~

**Rule:** Systems have logic (methods), query for components they need.

---

### Update Systems

Process game logic:

~~~csharp
public class MovementSystem : IUpdateSystem
{
    private readonly World _world;
    
    public string Name => "MovementSystem";
    public int UpdateOrder => 100;
    
    public MovementSystem(World world)
    {
        _world = world;
    }
    
    public void Update(GameTime gameTime)
    {
        var deltaTime = (float)gameTime.DeltaTime;
        
        // Query entities with Transform and Velocity
        var entities = _world.QueryEntities()
            .With<TransformComponent>()
            .With<VelocityComponent>();
        
        foreach (var entity in entities)
        {
            var transform = entity.GetComponent<TransformComponent>();
            var velocity = entity.GetComponent<VelocityComponent>();
            
            if (transform != null && velocity != null)
            {
                // Update position based on velocity
                transform.Position += velocity.Velocity * deltaTime;
            }
        }
    }
}
~~~

---

### Render Systems

Draw entities:

~~~csharp
public class SpriteRenderSystem : IRenderSystem
{
    private readonly World _world;
    private readonly IRenderer _renderer;
    
    public string Name => "SpriteRenderSystem";
    public int RenderOrder => 100;
    
    public SpriteRenderSystem(World world, IRenderer renderer)
    {
        _world = world;
        _renderer = renderer;
    }
    
    public void Render(GameTime gameTime)
    {
        // Query entities with Transform and Sprite
        var entities = _world.QueryEntities()
            .With<TransformComponent>()
            .With<SpriteComponent>();
        
        foreach (var entity in entities)
        {
            var transform = entity.GetComponent<TransformComponent>();
            var sprite = entity.GetComponent<SpriteComponent>();
            
            if (transform != null && sprite != null && sprite.Texture != null)
            {
                _renderer.DrawTexture(
                    sprite.Texture,
                    transform.Position.X - sprite.Width / 2,
                    transform.Position.Y - sprite.Height / 2,
                    sprite.Width,
                    sprite.Height);
            }
        }
    }
}
~~~

---

### System Examples

**Physics System:**

~~~csharp
public class PhysicsSystem : IUpdateSystem
{
    private readonly World _world;
    private const float Gravity = 980f; // pixels per second squared
    
    public string Name => "PhysicsSystem";
    public int UpdateOrder => 50; // Run before movement
    
    public void Update(GameTime gameTime)
    {
        var deltaTime = (float)gameTime.DeltaTime;
        
        var entities = _world.QueryEntities()
            .With<TransformComponent>()
            .With<RigidbodyComponent>();
        
        foreach (var entity in entities)
        {
            var rigidbody = entity.GetComponent<RigidbodyComponent>();
            
            if (rigidbody != null)
            {
                // Apply gravity
                if (rigidbody.UseGravity)
                {
                    rigidbody.Velocity.Y += Gravity * deltaTime;
                }
                
                // Apply drag
                rigidbody.Velocity *= (1.0f - rigidbody.Drag * deltaTime);
            }
        }
    }
}
~~~

**Health System:**

~~~csharp
public class HealthSystem : IUpdateSystem
{
    private readonly World _world;
    private readonly EventBus _eventBus;
    
    public string Name => "HealthSystem";
    public int UpdateOrder => 200;
    
    public void Update(GameTime gameTime)
    {
        var entities = _world.QueryEntities()
            .With<HealthComponent>();
        
        var deadEntities = new List<Entity>();
        
        foreach (var entity in entities)
        {
            var health = entity.GetComponent<HealthComponent>();
            
            if (health != null)
            {
                // Clamp health
                health.Current = Math.Clamp(health.Current, 0, health.Max);
                
                // Check if dead
                if (health.IsDead && !deadEntities.Contains(entity))
                {
                    deadEntities.Add(entity);
                }
            }
        }
        
        // Destroy dead entities
        foreach (var entity in deadEntities)
        {
            _eventBus.Publish(new EntityDiedEvent { Entity = entity });
            _world.DestroyEntity(entity);
        }
    }
}
~~~

**Collision System:**

~~~csharp
public class CollisionSystem : IUpdateSystem
{
    private readonly World _world;
    
    public string Name => "CollisionSystem";
    public int UpdateOrder => 150;
    
    public void Update(GameTime gameTime)
    {
        var entities = _world.QueryEntities()
            .With<TransformComponent>()
            .With<ColliderComponent>()
            .ToList();
        
        // Check all pairs
        for (int i = 0; i < entities.Count; i++)
        {
            for (int j = i + 1; j < entities.Count; j++)
            {
                CheckCollision(entities[i], entities[j]);
            }
        }
    }
    
    private void CheckCollision(Entity a, Entity b)
    {
        var transformA = a.GetComponent<TransformComponent>();
        var colliderA = a.GetComponent<ColliderComponent>();
        var transformB = b.GetComponent<TransformComponent>();
        var colliderB = b.GetComponent<ColliderComponent>();
        
        if (transformA != null && colliderA != null &&
            transformB != null && colliderB != null)
        {
            // Perform collision check based on collider types
            if (IsColliding(transformA, colliderA, transformB, colliderB))
            {
                HandleCollision(a, b);
            }
        }
    }
}
~~~

---

## World

### What is a World?

The World manages entities and systems:

~~~csharp
public class World
{
    private readonly List<Entity> _entities = new();
    private readonly List<IUpdateSystem> _updateSystems = new();
    private readonly List<IRenderSystem> _renderSystems = new();
    private int _nextEntityId = 1;
    
    // Entity management
    public Entity CreateEntity(string name = "Entity")
    {
        var entity = new Entity(_nextEntityId++, name);
        _entities.Add(entity);
        return entity;
    }
    
    public void DestroyEntity(Entity entity)
    {
        _entities.Remove(entity);
    }
    
    public IEnumerable<Entity> GetAllEntities()
    {
        return _entities;
    }
    
    // Query entities
    public EntityQuery QueryEntities()
    {
        return new EntityQuery(_entities);
    }
    
    // System management
    public void AddUpdateSystem(IUpdateSystem system)
    {
        _updateSystems.Add(system);
        _updateSystems.Sort((a, b) => a.UpdateOrder.CompareTo(b.UpdateOrder));
    }
    
    public void AddRenderSystem(IRenderSystem system)
    {
        _renderSystems.Add(system);
        _renderSystems.Sort((a, b) => a.RenderOrder.CompareTo(b.RenderOrder));
    }
    
    // Update all systems
    public void Update(GameTime gameTime)
    {
        foreach (var system in _updateSystems)
        {
            system.Update(gameTime);
        }
    }
    
    // Render all systems
    public void Render(GameTime gameTime)
    {
        foreach (var system in _renderSystems)
        {
            system.Render(gameTime);
        }
    }
}
~~~

---

### Using World in Scenes

~~~csharp
public class GameScene : Scene
{
    private readonly World _world;
    private readonly IRenderer _renderer;
    
    public GameScene(
        IRenderer renderer,
        ILogger<GameScene> logger) : base(logger)
    {
        _renderer = renderer;
        _world = new World();
    }
    
    protected override void OnInitialize()
    {
        // Register systems
        _world.AddUpdateSystem(new PhysicsSystem(_world));
        _world.AddUpdateSystem(new MovementSystem(_world));
        _world.AddUpdateSystem(new CollisionSystem(_world));
        _world.AddUpdateSystem(new HealthSystem(_world));
        
        _world.AddRenderSystem(new SpriteRenderSystem(_world, _renderer));
        
        // Create entities
        CreatePlayer();
        CreateEnemies();
    }
    
    protected override void OnUpdate(GameTime gameTime)
    {
        _world.Update(gameTime);
    }
    
    protected override void OnRender(GameTime gameTime)
    {
        _world.Render(gameTime);
    }
    
    private void CreatePlayer()
    {
        var player = _world.CreateEntity("Player");
        player.AddComponent(new TransformComponent { Position = new Vector2(400, 300) });
        player.AddComponent(new SpriteComponent { Width = 64, Height = 64 });
        player.AddComponent(new VelocityComponent { Speed = 200f });
        player.AddComponent(new HealthComponent { Current = 100, Max = 100 });
        player.AddComponent(new PlayerComponent());
    }
}
~~~

---

## Queries

### Entity Queries

Query entities by components:

~~~csharp
public class EntityQuery
{
    private IEnumerable<Entity> _entities;
    
    public EntityQuery(IEnumerable<Entity> entities)
    {
        _entities = entities;
    }
    
    public EntityQuery With<T>() where T : Component
    {
        _entities = _entities.Where(e => e.HasComponent<T>());
        return this;
    }
    
    public EntityQuery Without<T>() where T : Component
    {
        _entities = _entities.Where(e => !e.HasComponent<T>());
        return this;
    }
    
    public IEnumerable<Entity> ToList()
    {
        return _entities.ToList();
    }
    
    public IEnumerator<Entity> GetEnumerator()
    {
        return _entities.GetEnumerator();
    }
}

// Usage
var movingEntities = _world.QueryEntities()
    .With<TransformComponent>()
    .With<VelocityComponent>();

foreach (var entity in movingEntities)
{
    // Process entity
}
~~~

---

### Advanced Queries

~~~csharp
// Entities with health but not dead
var livingEntities = _world.QueryEntities()
    .With<HealthComponent>()
    .Where(e => !e.GetComponent<HealthComponent>()!.IsDead);

// Entities with player tag
var players = _world.QueryEntities()
    .With<PlayerComponent>();

// Entities with sprite but no velocity (static objects)
var staticSprites = _world.QueryEntities()
    .With<SpriteComponent>()
    .Without<VelocityComponent>();

// Count enemies
var enemyCount = _world.QueryEntities()
    .With<EnemyComponent>()
    .Count();
~~~

---

## Complete Example

### Platformer with ECS

~~~csharp
using Brine2D.Core;
using Brine2D.ECS;
using Brine2D.Engine;
using Brine2D.Input;
using Brine2D.Rendering;
using Microsoft.Extensions.Logging;
using System.Numerics;

public class PlatformerScene : Scene
{
    private readonly World _world;
    private readonly IRenderer _renderer;
    private readonly IInputService _input;
    
    public PlatformerScene(
        IRenderer renderer,
        IInputService input,
        ILogger<PlatformerScene> logger) : base(logger)
    {
        _renderer = renderer;
        _input = input;
        _world = new World();
    }
    
    protected override void OnInitialize()
    {
        // Register systems (order matters!)
        _world.AddUpdateSystem(new PlayerInputSystem(_world, _input));
        _world.AddUpdateSystem(new PhysicsSystem(_world));
        _world.AddUpdateSystem(new MovementSystem(_world));
        _world.AddUpdateSystem(new CollisionSystem(_world));
        
        _world.AddRenderSystem(new SpriteRenderSystem(_world, _renderer));
        
        // Create entities
        CreatePlayer();
        CreatePlatforms();
        CreateEnemies();
    }
    
    protected override void OnUpdate(GameTime gameTime)
    {
        _world.Update(gameTime);
    }
    
    protected override void OnRender(GameTime gameTime)
    {
        _renderer.Clear(new Color(135, 206, 235)); // Sky blue
        _world.Render(gameTime);
    }
    
    private void CreatePlayer()
    {
        var player = _world.CreateEntity("Player");
        
        player.AddComponent(new TransformComponent 
        { 
            Position = new Vector2(100, 400) 
        });
        
        player.AddComponent(new SpriteComponent 
        { 
            Width = 32, 
            Height = 48,
            Tint = Color.Blue 
        });
        
        player.AddComponent(new RigidbodyComponent 
        { 
            Mass = 1.0f,
            UseGravity = true 
        });
        
        player.AddComponent(new ColliderComponent 
        { 
            Type = ColliderType.Box,
            Size = new Vector2(32, 48) 
        });
        
        player.AddComponent(new PlayerComponent 
        { 
            JumpForce = 500f,
            MoveSpeed = 200f 
        });
    }
    
    private void CreatePlatforms()
    {
        // Ground platform
        var ground = _world.CreateEntity("Ground");
        ground.AddComponent(new TransformComponent { Position = new Vector2(400, 550) });
        ground.AddComponent(new SpriteComponent { Width = 800, Height = 50, Tint = Color.Green });
        ground.AddComponent(new ColliderComponent { Type = ColliderType.Box, Size = new Vector2(800, 50) });
        ground.AddComponent(new PlatformComponent());
        
        // Floating platform
        var platform = _world.CreateEntity("Platform");
        platform.AddComponent(new TransformComponent { Position = new Vector2(300, 400) });
        platform.AddComponent(new SpriteComponent { Width = 200, Height = 20, Tint = Color.Brown });
        platform.AddComponent(new ColliderComponent { Type = ColliderType.Box, Size = new Vector2(200, 20) });
        platform.AddComponent(new PlatformComponent());
    }
    
    private void CreateEnemies()
    {
        for (int i = 0; i < 3; i++)
        {
            var enemy = _world.CreateEntity($"Enemy{i}");
            
            enemy.AddComponent(new TransformComponent 
            { 
                Position = new Vector2(300 + i * 150, 500) 
            });
            
            enemy.AddComponent(new SpriteComponent 
            { 
                Width = 32, 
                Height = 32,
                Tint = Color.Red 
            });
            
            enemy.AddComponent(new RigidbodyComponent 
            { 
                UseGravity = true 
            });
            
            enemy.AddComponent(new ColliderComponent 
            { 
                Type = ColliderType.Box,
                Size = new Vector2(32, 32) 
            });
            
            enemy.AddComponent(new AIComponent 
            { 
                Type = AIType.Patrol,
                PatrolSpeed = 50f 
            });
            
            enemy.AddComponent(new HealthComponent 
            { 
                Current = 50, 
                Max = 50 
            });
        }
    }
}

// Component definitions
public class PlayerComponent : Component
{
    public float JumpForce { get; set; }
    public float MoveSpeed { get; set; }
    public bool IsGrounded { get; set; }
}

public class PlatformComponent : Component { }

public class AIComponent : Component
{
    public AIType Type { get; set; }
    public float PatrolSpeed { get; set; }
    public Vector2 PatrolStart { get; set; }
    public Vector2 PatrolEnd { get; set; }
}

public enum AIType
{
    Idle,
    Patrol,
    Chase
}

// System definitions
public class PlayerInputSystem : IUpdateSystem
{
    private readonly World _world;
    private readonly IInputService _input;
    
    public string Name => "PlayerInputSystem";
    public int UpdateOrder => 10;
    
    public PlayerInputSystem(World world, IInputService input)
    {
        _world = world;
        _input = input;
    }
    
    public void Update(GameTime gameTime)
    {
        var players = _world.QueryEntities()
            .With<PlayerComponent>()
            .With<RigidbodyComponent>();
        
        foreach (var player in players)
        {
            var playerComp = player.GetComponent<PlayerComponent>();
            var rigidbody = player.GetComponent<RigidbodyComponent>();
            
            if (playerComp != null && rigidbody != null)
            {
                // Horizontal movement
                var moveX = 0f;
                if (_input.IsKeyDown(Keys.A) || _input.IsKeyDown(Keys.Left))
                    moveX = -1;
                if (_input.IsKeyDown(Keys.D) || _input.IsKeyDown(Keys.Right))
                    moveX = 1;
                
                rigidbody.Velocity.X = moveX * playerComp.MoveSpeed;
                
                // Jump
                if (_input.IsKeyPressed(Keys.Space) && playerComp.IsGrounded)
                {
                    rigidbody.Velocity.Y = -playerComp.JumpForce;
                    playerComp.IsGrounded = false;
                }
            }
        }
    }
}
~~~

---

## ECS vs Traditional OOP

### Traditional Inheritance

~~~csharp
// ❌ Traditional OOP - rigid hierarchy
public abstract class GameObject
{
    public Vector2 Position { get; set; }
    public abstract void Update(GameTime gameTime);
    public abstract void Render(IRenderer renderer);
}

public class Player : GameObject
{
    public int Health { get; set; }
    public float Speed { get; set; }
    
    public override void Update(GameTime gameTime) { }
    public override void Render(IRenderer renderer) { }
}

public class Enemy : GameObject
{
    public int Health { get; set; }
    public float Speed { get; set; }
    public AIState State { get; set; }
    
    public override void Update(GameTime gameTime) { }
    public override void Render(IRenderer renderer) { }
}

// Problem: Player and Enemy duplicate Health and Speed
// Problem: Hard to add new behaviors
// Problem: Multiple inheritance not possible
~~~

---

### ECS Composition

~~~csharp
// ✅ ECS - flexible composition
public class TransformComponent : Component
{
    public Vector2 Position { get; set; }
}

public class HealthComponent : Component
{
    public int Current { get; set; }
    public int Max { get; set; }
}

public class VelocityComponent : Component
{
    public float Speed { get; set; }
}

public class AIComponent : Component
{
    public AIState State { get; set; }
}

// Player = Transform + Health + Velocity + PlayerTag
var player = world.CreateEntity();
player.AddComponent(new TransformComponent());
player.AddComponent(new HealthComponent());
player.AddComponent(new VelocityComponent());
player.AddComponent(new PlayerComponent());

// Enemy = Transform + Health + Velocity + AI
var enemy = world.CreateEntity();
enemy.AddComponent(new TransformComponent());
enemy.AddComponent(new HealthComponent());
enemy.AddComponent(new VelocityComponent());
enemy.AddComponent(new AIComponent());

// Benefits:
// - No duplication (components are reused)
// - Easy to add new behaviors (add component)
// - Flexible composition (mix and match)
~~~

---

## Performance

### Data-Oriented Design

ECS enables cache-friendly, data-oriented processing:

~~~csharp
// ✅ Good - processes components sequentially
public class MovementSystem : IUpdateSystem
{
    public void Update(GameTime gameTime)
    {
        var entities = _world.QueryEntities()
            .With<TransformComponent>()
            .With<VelocityComponent>();
        
        // All transforms and velocities are processed together
        // CPU cache-friendly access pattern
        foreach (var entity in entities)
        {
            var transform = entity.GetComponent<TransformComponent>();
            var velocity = entity.GetComponent<VelocityComponent>();
            
            transform.Position += velocity.Velocity * (float)gameTime.DeltaTime;
        }
    }
}
~~~

**Performance benefits:**
- Components stored contiguously in memory
- Better CPU cache utilization
- Systems process similar data together
- Easy to parallelize (future optimization)

---

## Best Practices

### DO

1. **Keep components data-only**
   ~~~csharp
   // ✅ Good - pure data
   public class HealthComponent : Component
   {
       public int Current { get; set; }
       public int Max { get; set; }
       public bool IsDead => Current <= 0; // Computed property OK
   }
   
   // ❌ Bad - has logic
   public class HealthComponent : Component
   {
       public void TakeDamage(int amount)
       {
           Current -= amount;
       }
   }
   ~~~

2. **Put all logic in systems**
   ~~~csharp
   // ✅ Good - logic in system
   public class HealthSystem : IUpdateSystem
   {
       public void Update(GameTime gameTime)
       {
           var entities = _world.QueryEntities().With<HealthComponent>();
           
           foreach (var entity in entities)
           {
               var health = entity.GetComponent<HealthComponent>();
               // Process health logic here
           }
       }
   }
   ~~~

3. **Use entity factories**
   ~~~csharp
   // ✅ Good - encapsulated creation
   public static Entity CreatePlayer(World world, Vector2 position)
   {
       var entity = world.CreateEntity("Player");
       entity.AddComponent(new TransformComponent { Position = position });
       // ... add more components
       return entity;
   }
   ~~~

4. **Order systems correctly**
   ~~~csharp
   // ✅ Good - explicit ordering
   _world.AddUpdateSystem(new InputSystem(_world) { UpdateOrder = 10 });
   _world.AddUpdateSystem(new PhysicsSystem(_world) { UpdateOrder = 50 });
   _world.AddUpdateSystem(new MovementSystem(_world) { UpdateOrder = 100 });
   _world.AddUpdateSystem(new CollisionSystem(_world) { UpdateOrder = 150 });
   ~~~

5. **Use tag components for categories**
   ~~~csharp
   // ✅ Good - tag components
   public class PlayerComponent : Component { }
   public class EnemyComponent : Component { }
   public class ProjectileComponent : Component { }
   
   // Easy to query
   var enemies = _world.QueryEntities().With<EnemyComponent>();
   ~~~

### DON'T

1. **Don't put logic in components**
   ~~~csharp
   // ❌ Bad
   public class HealthComponent : Component
   {
       public void Heal(int amount) { ... }
       public void TakeDamage(int amount) { ... }
   }
   ~~~

2. **Don't store references between entities in components**
   ~~~csharp
   // ❌ Bad - tight coupling
   public class FollowComponent : Component
   {
       public Entity Target { get; set; }
   }
   
   // ✅ Good - use entity ID
   public class FollowComponent : Component
   {
       public int TargetId { get; set; }
   }
   ~~~

3. **Don't make systems stateful**
   ~~~csharp
   // ❌ Bad - system has state
   public class MovementSystem : IUpdateSystem
   {
       private float _totalTime; // Wrong!
   }
   
   // ✅ Good - state in component or world
   public class GameStateComponent : Component
   {
       public float TotalTime { get; set; }
   }
   ~~~

4. **Don't query in tight loops**
   ~~~csharp
   // ❌ Bad - queries every iteration
   for (int i = 0; i < 1000; i++)
   {
       var enemies = _world.QueryEntities().With<EnemyComponent>();
   }
   
   // ✅ Good - query once
   var enemies = _world.QueryEntities().With<EnemyComponent>().ToList();
   for (int i = 0; i < 1000; i++)
   {
       // Use cached list
   }
   ~~~

---

## Troubleshooting

### Problem: Component not found

**Symptom:**

~~~csharp
var health = entity.GetComponent<HealthComponent>(); // Returns null
~~~

**Solutions:**

1. **Check component was added:**
   ~~~csharp
   if (entity.HasComponent<HealthComponent>())
   {
       var health = entity.GetComponent<HealthComponent>();
   }
   ~~~

2. **Verify component type matches:**
   ~~~csharp
   // ✅ Correct
   entity.AddComponent(new HealthComponent());
   var health = entity.GetComponent<HealthComponent>();
   
   // ❌ Wrong - different type
   entity.AddComponent(new HealthComponent());
   var player = entity.GetComponent<PlayerComponent>(); // null
   ~~~

---

### Problem: System not running

**Symptom:** System's Update method never called.

**Solutions:**

1. **Check system is registered:**
   ~~~csharp
   _world.AddUpdateSystem(new MovementSystem(_world));
   ~~~

2. **Verify World.Update is called:**
   ~~~csharp
   protected override void OnUpdate(GameTime gameTime)
   {
       _world.Update(gameTime); // Must call this!
   }
   ~~~

3. **Check system order:**
   ~~~csharp
   // Systems run in order of UpdateOrder
   public int UpdateOrder => 100; // Lower runs first
   ~~~

---

### Problem: Entities not found in query

**Symptom:** Query returns no entities.

**Solutions:**

1. **Verify components exist:**
   ~~~csharp
   var entities = _world.QueryEntities()
       .With<TransformComponent>()
       .With<VelocityComponent>();
   
   // Check entities have both components
   foreach (var entity in _world.GetAllEntities())
   {
       Logger.LogDebug($"{entity.Name}: Has Transform={entity.HasComponent<TransformComponent>()}, Has Velocity={entity.HasComponent<VelocityComponent>()}");
   }
   ~~~

2. **Check query order:**
   ~~~csharp
   // Both are equivalent
   var query1 = _world.QueryEntities().With<TransformComponent>().With<VelocityComponent>();
   var query2 = _world.QueryEntities().With<VelocityComponent>().With<TransformComponent>();
   ~~~

---

## Summary

**ECS concepts:**

| Concept | Description | Rule |
|---------|-------------|------|
| **Entity** | Unique identifier | Just an ID + components |
| **Component** | Pure data | No logic, only properties |
| **System** | Pure logic | Queries entities, processes components |
| **World** | Container | Manages entities and systems |

**Key benefits:**

| Benefit | Description |
|---------|-------------|
| **Flexibility** | Compose entities from components |
| **Reusability** | Components shared across entities |
| **Performance** | Data-oriented, cache-friendly |
| **Maintainability** | Separation of data and logic |
| **Testability** | Easy to test systems independently |

**Common patterns:**

| Pattern | Usage |
|---------|-------|
| **Entity Factory** | Encapsulate entity creation |
| **Tag Components** | Mark entity types (no data) |
| **System Ordering** | Control update sequence |
| **Component Queries** | Find entities with specific components |

---

## Next Steps

- **[ECS Getting Started](../guides/ecs/getting-started.md)** - Practical ECS implementation
- **[Components Guide](../guides/ecs/components.md)** - Deep dive into components
- **[Systems Guide](../guides/ecs/systems.md)** - Creating custom systems
- **[Entities Guide](../guides/ecs/entities.md)** - Entity management
- **[Queries Guide](../guides/ecs/queries.md)** - Advanced querying

---

## Quick Reference

~~~csharp
// Create entity
var entity = world.CreateEntity("Player");

// Add components
entity.AddComponent(new TransformComponent { Position = new Vector2(100, 100) });
entity.AddComponent(new SpriteComponent { Width = 32, Height = 32 });

// Get component
var transform = entity.GetComponent<TransformComponent>();

// Check component
if (entity.HasComponent<HealthComponent>())
{
    var health = entity.GetComponent<HealthComponent>();
}

// Remove component
entity.RemoveComponent<VelocityComponent>();

// Create system
public class MovementSystem : IUpdateSystem
{
    public string Name => "MovementSystem";
    public int UpdateOrder => 100;
    
    public void Update(GameTime gameTime)
    {
        var entities = _world.QueryEntities()
            .With<TransformComponent>()
            .With<VelocityComponent>();
        
        foreach (var entity in entities)
        {
            // Process entities
        }
    }
}

// Register system
world.AddUpdateSystem(new MovementSystem(world));

// Query entities
var movingEntities = world.QueryEntities()
    .With<TransformComponent>()
    .With<VelocityComponent>()
    .Without<StaticComponent>();
~~~

---

Ready to implement ECS in your game? Check out [ECS Getting Started](../guides/ecs/getting-started.md)!