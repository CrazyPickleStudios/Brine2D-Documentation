---
title: ECS Getting Started
description: Get started with Entity Component System in Brine2D - build your first ECS game
---

# ECS Getting Started

Build your first game using Brine2D's Entity Component System - from setup to a complete working example.

## Overview

This guide takes you from zero to a working ECS game in 15 minutes. You'll learn:

- Setting up ECS in a scene
- Creating entities and components
- Building your first systems
- Running an ECS-powered game

**Prerequisites:**
- Completed [Quick Start](../../getting-started/quickstart.md)
- Basic C# knowledge
- Understanding of [ECS Concepts](../../concepts/entity-component-system.md)

**What you'll build:**
A simple game with player, enemies, and projectiles using pure ECS.

---

## Project Setup

### Step 1: Create Project

Create a new Brine2D project:

~~~sh
dotnet new console -n ECSDemo
cd ECSDemo
dotnet add package Brine2D --version 0.9.0-beta
dotnet add package Brine2D.SDL --version 0.9.0-beta
~~~

---

### Step 2: Basic Program Setup

Create `Program.cs`:

~~~csharp
using Brine2D.Hosting;
using Brine2D.SDL;
using ECSDemo;
using Microsoft.Extensions.DependencyInjection;

var builder = GameApplication.CreateBuilder(args);

builder.Services.AddSDL3Rendering(options =>
{
    options.WindowTitle = "ECS Demo";
    options.WindowWidth = 800;
    options.WindowHeight = 600;
});

builder.Services.AddSDL3Input();
builder.Services.AddScene<GameScene>();

var game = builder.Build();
await game.RunAsync<GameScene>();
~~~

---

## Creating Components

### Step 3: Define Your Components

Components are pure data - no logic:

Create `Components/TransformComponent.cs`:

~~~csharp
using Brine2D.ECS;
using System.Numerics;

namespace ECSDemo.Components;

public class TransformComponent : Component
{
    public Vector2 Position { get; set; }
    public float Rotation { get; set; }
    public Vector2 Scale { get; set; } = Vector2.One;
}
~~~

Create `Components/VelocityComponent.cs`:

~~~csharp
using Brine2D.ECS;
using System.Numerics;

namespace ECSDemo.Components;

public class VelocityComponent : Component
{
    public Vector2 Velocity { get; set; }
    public float Speed { get; set; }
}
~~~

Create `Components/SpriteComponent.cs`:

~~~csharp
using Brine2D.Core;
using Brine2D.ECS;

namespace ECSDemo.Components;

public class SpriteComponent : Component
{
    public int Width { get; set; }
    public int Height { get; set; }
    public Color Color { get; set; } = Color.White;
}
~~~

Create `Components/HealthComponent.cs`:

~~~csharp
using Brine2D.ECS;

namespace ECSDemo.Components;

public class HealthComponent : Component
{
    public int Current { get; set; }
    public int Max { get; set; }
    public bool IsDead => Current <= 0;
}
~~~

Create `Components/TagComponents.cs`:

~~~csharp
using Brine2D.ECS;

namespace ECSDemo.Components;

// Tag components - no data, just markers
public class PlayerComponent : Component { }
public class EnemyComponent : Component { }
public class ProjectileComponent : Component { }
~~~

---

## Creating Systems

### Step 4: Movement System

Systems contain logic - no data:

Create `Systems/MovementSystem.cs`:

~~~csharp
using Brine2D.Core;
using Brine2D.ECS;
using ECSDemo.Components;

namespace ECSDemo.Systems;

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

**What this does:**
1. Queries all entities with Transform and Velocity
2. Updates each entity's position based on velocity
3. Uses deltaTime for frame-rate independence

---

### Step 5: Render System

Create `Systems/SpriteRenderSystem.cs`:

~~~csharp
using Brine2D.Core;
using Brine2D.ECS;
using Brine2D.Rendering;
using ECSDemo.Components;

namespace ECSDemo.Systems;

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
            
            if (transform != null && sprite != null)
            {
                _renderer.DrawRectangleFilled(
                    transform.Position.X - sprite.Width / 2,
                    transform.Position.Y - sprite.Height / 2,
                    sprite.Width,
                    sprite.Height,
                    sprite.Color);
            }
        }
    }
}
~~~

---

### Step 6: Player Input System

Create `Systems/PlayerInputSystem.cs`:

~~~csharp
using Brine2D.Core;
using Brine2D.ECS;
using Brine2D.Input;
using ECSDemo.Components;
using System.Numerics;

namespace ECSDemo.Systems;

public class PlayerInputSystem : IUpdateSystem
{
    private readonly World _world;
    private readonly IInputService _input;
    
    public string Name => "PlayerInputSystem";
    public int UpdateOrder => 10; // Run before movement
    
    public PlayerInputSystem(World world, IInputService input)
    {
        _world = world;
        _input = input;
    }
    
    public void Update(GameTime gameTime)
    {
        // Find player entity
        var players = _world.QueryEntities()
            .With<PlayerComponent>()
            .With<VelocityComponent>();
        
        foreach (var player in players)
        {
            var velocity = player.GetComponent<VelocityComponent>();
            
            if (velocity != null)
            {
                // Calculate movement direction
                var direction = Vector2.Zero;
                
                if (_input.IsKeyDown(Keys.W) || _input.IsKeyDown(Keys.Up))
                    direction.Y -= 1;
                if (_input.IsKeyDown(Keys.S) || _input.IsKeyDown(Keys.Down))
                    direction.Y += 1;
                if (_input.IsKeyDown(Keys.A) || _input.IsKeyDown(Keys.Left))
                    direction.X -= 1;
                if (_input.IsKeyDown(Keys.D) || _input.IsKeyDown(Keys.Right))
                    direction.X += 1;
                
                // Normalize and apply speed
                if (direction != Vector2.Zero)
                {
                    direction = Vector2.Normalize(direction);
                }
                
                velocity.Velocity = direction * velocity.Speed;
            }
        }
    }
}
~~~

---

### Step 7: Enemy AI System

Create `Systems/EnemyAISystem.cs`:

~~~csharp
using Brine2D.Core;
using Brine2D.ECS;
using ECSDemo.Components;
using System.Numerics;

namespace ECSDemo.Systems;

public class EnemyAISystem : IUpdateSystem
{
    private readonly World _world;
    
    public string Name => "EnemyAISystem";
    public int UpdateOrder => 20; // After input, before movement
    
    public EnemyAISystem(World world)
    {
        _world = world;
    }
    
    public void Update(GameTime gameTime)
    {
        // Find player position
        var players = _world.QueryEntities().With<PlayerComponent>();
        var playerPosition = Vector2.Zero;
        var hasPlayer = false;
        
        foreach (var player in players)
        {
            var transform = player.GetComponent<TransformComponent>();
            if (transform != null)
            {
                playerPosition = transform.Position;
                hasPlayer = true;
                break;
            }
        }
        
        if (!hasPlayer) return;
        
        // Move enemies toward player
        var enemies = _world.QueryEntities()
            .With<EnemyComponent>()
            .With<TransformComponent>()
            .With<VelocityComponent>();
        
        foreach (var enemy in enemies)
        {
            var transform = enemy.GetComponent<TransformComponent>();
            var velocity = enemy.GetComponent<VelocityComponent>();
            
            if (transform != null && velocity != null)
            {
                // Calculate direction to player
                var direction = playerPosition - transform.Position;
                
                if (direction.Length() > 50f) // Keep distance
                {
                    direction = Vector2.Normalize(direction);
                    velocity.Velocity = direction * velocity.Speed;
                }
                else
                {
                    velocity.Velocity = Vector2.Zero;
                }
            }
        }
    }
}
~~~

---

### Step 8: Collision System

Create `Systems/CollisionSystem.cs`:

~~~csharp
using Brine2D.Core;
using Brine2D.ECS;
using ECSDemo.Components;
using Microsoft.Extensions.Logging;
using System.Numerics;

namespace ECSDemo.Systems;

public class CollisionSystem : IUpdateSystem
{
    private readonly World _world;
    private readonly ILogger<CollisionSystem> _logger;
    
    public string Name => "CollisionSystem";
    public int UpdateOrder => 150; // After movement
    
    public CollisionSystem(World world, ILogger<CollisionSystem> logger)
    {
        _world = world;
        _logger = logger;
    }
    
    public void Update(GameTime gameTime)
    {
        // Get all collidable entities
        var entities = _world.QueryEntities()
            .With<TransformComponent>()
            .With<SpriteComponent>()
            .ToList();
        
        // Check player vs enemies
        var players = _world.QueryEntities().With<PlayerComponent>();
        
        foreach (var player in players)
        {
            var playerTransform = player.GetComponent<TransformComponent>();
            var playerSprite = player.GetComponent<SpriteComponent>();
            var playerHealth = player.GetComponent<HealthComponent>();
            
            if (playerTransform == null || playerSprite == null) continue;
            
            var enemies = _world.QueryEntities().With<EnemyComponent>();
            
            foreach (var enemy in enemies)
            {
                var enemyTransform = enemy.GetComponent<TransformComponent>();
                var enemySprite = enemy.GetComponent<SpriteComponent>();
                
                if (enemyTransform == null || enemySprite == null) continue;
                
                // Simple circle collision
                var distance = Vector2.Distance(
                    playerTransform.Position, 
                    enemyTransform.Position);
                
                var collisionDistance = (playerSprite.Width + enemySprite.Width) / 2f;
                
                if (distance < collisionDistance)
                {
                    _logger.LogInformation("Player hit by enemy!");
                    
                    if (playerHealth != null)
                    {
                        playerHealth.Current -= 10;
                    }
                    
                    // Push player back
                    var pushDirection = Vector2.Normalize(
                        playerTransform.Position - enemyTransform.Position);
                    playerTransform.Position += pushDirection * 10f;
                }
            }
        }
    }
}
~~~

---

### Step 9: Cleanup System

Create `Systems/CleanupSystem.cs`:

~~~csharp
using Brine2D.Core;
using Brine2D.ECS;
using ECSDemo.Components;

namespace ECSDemo.Systems;

public class CleanupSystem : IUpdateSystem
{
    private readonly World _world;
    
    public string Name => "CleanupSystem";
    public int UpdateOrder => 200; // Run last
    
    public CleanupSystem(World world)
    {
        _world = world;
    }
    
    public void Update(GameTime gameTime)
    {
        // Remove dead entities
        var entities = _world.QueryEntities()
            .With<HealthComponent>();
        
        var toRemove = new List<Entity>();
        
        foreach (var entity in entities)
        {
            var health = entity.GetComponent<HealthComponent>();
            
            if (health != null && health.IsDead)
            {
                toRemove.Add(entity);
            }
        }
        
        foreach (var entity in toRemove)
        {
            _world.DestroyEntity(entity);
        }
        
        // Remove off-screen entities
        var allEntities = _world.QueryEntities()
            .With<TransformComponent>();
        
        foreach (var entity in allEntities)
        {
            var transform = entity.GetComponent<TransformComponent>();
            
            if (transform != null)
            {
                // Remove if far off screen
                if (transform.Position.X < -100 || transform.Position.X > 900 ||
                    transform.Position.Y < -100 || transform.Position.Y > 700)
                {
                    if (!entity.HasComponent<PlayerComponent>()) // Don't remove player
                    {
                        _world.DestroyEntity(entity);
                    }
                }
            }
        }
    }
}
~~~

---

## Entity Factories

### Step 10: Create Entity Factory

Create `EntityFactory.cs`:

~~~csharp
using Brine2D.Core;
using Brine2D.ECS;
using ECSDemo.Components;
using System.Numerics;

namespace ECSDemo;

public static class EntityFactory
{
    public static Entity CreatePlayer(World world, Vector2 position)
    {
        var entity = world.CreateEntity("Player");
        
        entity.AddComponent(new TransformComponent 
        { 
            Position = position 
        });
        
        entity.AddComponent(new VelocityComponent 
        { 
            Speed = 200f 
        });
        
        entity.AddComponent(new SpriteComponent 
        { 
            Width = 32, 
            Height = 32, 
            Color = Color.Blue 
        });
        
        entity.AddComponent(new HealthComponent 
        { 
            Current = 100, 
            Max = 100 
        });
        
        entity.AddComponent(new PlayerComponent());
        
        return entity;
    }
    
    public static Entity CreateEnemy(World world, Vector2 position)
    {
        var entity = world.CreateEntity("Enemy");
        
        entity.AddComponent(new TransformComponent 
        { 
            Position = position 
        });
        
        entity.AddComponent(new VelocityComponent 
        { 
            Speed = 100f 
        });
        
        entity.AddComponent(new SpriteComponent 
        { 
            Width = 24, 
            Height = 24, 
            Color = Color.Red 
        });
        
        entity.AddComponent(new HealthComponent 
        { 
            Current = 50, 
            Max = 50 
        });
        
        entity.AddComponent(new EnemyComponent());
        
        return entity;
    }
    
    public static Entity CreateProjectile(World world, Vector2 position, Vector2 direction)
    {
        var entity = world.CreateEntity("Projectile");
        
        entity.AddComponent(new TransformComponent 
        { 
            Position = position 
        });
        
        entity.AddComponent(new VelocityComponent 
        { 
            Velocity = direction * 400f,
            Speed = 400f 
        });
        
        entity.AddComponent(new SpriteComponent 
        { 
            Width = 8, 
            Height = 8, 
            Color = Color.Yellow 
        });
        
        entity.AddComponent(new ProjectileComponent());
        
        return entity;
    }
}
~~~

**Pattern:** Factory methods encapsulate entity creation logic.

---

## Putting It All Together

### Step 11: Create Game Scene

Create `GameScene.cs`:

~~~csharp
using Brine2D.Core;
using Brine2D.ECS;
using Brine2D.Engine;
using Brine2D.Input;
using Brine2D.Rendering;
using ECSDemo.Components;
using ECSDemo.Systems;
using Microsoft.Extensions.Logging;
using System.Numerics;

namespace ECSDemo;

public class GameScene : Scene
{
    private readonly World _world;
    private readonly IRenderer _renderer;
    private readonly IInputService _input;
    private readonly IGameContext _gameContext;
    
    private float _enemySpawnTimer = 0f;
    private const float EnemySpawnInterval = 2.0f;

    public GameScene(
        IRenderer renderer,
        IInputService input,
        IGameContext gameContext,
        ILogger<GameScene> logger) : base(logger)
    {
        _renderer = renderer;
        _input = input;
        _gameContext = gameContext;
        _world = new World();
    }

    protected override void OnInitialize()
    {
        Logger.LogInformation("Initializing ECS Demo");
        
        // Register systems (order matters!)
        _world.AddUpdateSystem(new PlayerInputSystem(_world, _input));
        _world.AddUpdateSystem(new EnemyAISystem(_world));
        _world.AddUpdateSystem(new MovementSystem(_world));
        _world.AddUpdateSystem(new CollisionSystem(_world, 
            LoggerFactory.CreateLogger<CollisionSystem>()));
        _world.AddUpdateSystem(new CleanupSystem(_world));
        
        _world.AddRenderSystem(new SpriteRenderSystem(_world, _renderer));
        
        // Create initial entities
        CreatePlayer();
        CreateInitialEnemies();
    }

    protected override void OnUpdate(GameTime gameTime)
    {
        // Exit on Escape
        if (_input.IsKeyPressed(Keys.Escape))
        {
            _gameContext.RequestExit();
            return;
        }
        
        // Spawn enemies periodically
        _enemySpawnTimer += (float)gameTime.DeltaTime;
        if (_enemySpawnTimer >= EnemySpawnInterval)
        {
            SpawnRandomEnemy();
            _enemySpawnTimer = 0f;
        }
        
        // Update all systems
        _world.Update(gameTime);
    }

    protected override void OnRender(GameTime gameTime)
    {
        _renderer.Clear(new Color(20, 20, 30));
        
        // Render all systems
        _world.Render(gameTime);
        
        // Draw HUD
        DrawHUD();
    }

    private void CreatePlayer()
    {
        EntityFactory.CreatePlayer(_world, new Vector2(400, 300));
    }

    private void CreateInitialEnemies()
    {
        EntityFactory.CreateEnemy(_world, new Vector2(100, 100));
        EntityFactory.CreateEnemy(_world, new Vector2(700, 100));
        EntityFactory.CreateEnemy(_world, new Vector2(100, 500));
        EntityFactory.CreateEnemy(_world, new Vector2(700, 500));
    }

    private void SpawnRandomEnemy()
    {
        var random = new Random();
        
        // Spawn at random edge
        var side = random.Next(4);
        var position = side switch
        {
            0 => new Vector2(random.Next(50, 750), -50),        // Top
            1 => new Vector2(random.Next(50, 750), 650),        // Bottom
            2 => new Vector2(-50, random.Next(50, 550)),        // Left
            3 => new Vector2(850, random.Next(50, 550)),        // Right
            _ => new Vector2(400, 300)
        };
        
        EntityFactory.CreateEnemy(_world, position);
    }

    private void DrawHUD()
    {
        // Draw player health
        var players = _world.QueryEntities()
            .With<PlayerComponent>()
            .With<HealthComponent>();
        
        foreach (var player in players)
        {
            var health = player.GetComponent<HealthComponent>();
            if (health != null)
            {
                _renderer.DrawText($"Health: {health.Current}/{health.Max}", 
                    10, 10, Color.White);
            }
        }
        
        // Draw entity count
        var entityCount = _world.GetAllEntities().Count();
        _renderer.DrawText($"Entities: {entityCount}", 10, 30, Color.White);
        
        // Draw instructions
        _renderer.DrawText("WASD: Move | ESC: Quit", 10, 570, Color.Gray);
    }
}
~~~

---

## Run Your Game

### Step 12: Test It

Run your ECS game:

~~~sh
dotnet run
~~~

**You should see:**
1. Blue player square in center
2. Red enemy squares around edges
3. Enemies move toward player
4. Player health decreases on collision
5. New enemies spawn every 2 seconds
6. Dead entities are removed
7. Off-screen entities are cleaned up

**Success!** You've built your first ECS game.

---

## Architecture Diagram

~~~mermaid
graph TB
    subgraph "Game Scene"
        A[GameScene]
    end
    
    subgraph "ECS World"
        B[World]
        B --> B1[Entity List]
        B --> B2[Update Systems]
        B --> B3[Render Systems]
    end
    
    subgraph "Update Systems"
        C1[PlayerInputSystem<br/>Order: 10]
        C2[EnemyAISystem<br/>Order: 20]
        C3[MovementSystem<br/>Order: 100]
        C4[CollisionSystem<br/>Order: 150]
        C5[CleanupSystem<br/>Order: 200]
    end
    
    subgraph "Render Systems"
        D1[SpriteRenderSystem<br/>Order: 100]
    end
    
    subgraph "Entities"
        E1[Player Entity]
        E2[Enemy Entities]
        E3[Projectile Entities]
    end
    
    subgraph "Components"
        F1[Transform]
        F2[Velocity]
        F3[Sprite]
        F4[Health]
        F5[Tags]
    end
    
    A --> B
    
    B2 --> C1
    B2 --> C2
    B2 --> C3
    B2 --> C4
    B2 --> C5
    
    B3 --> D1
    
    B1 --> E1
    B1 --> E2
    B1 --> E3
    
    E1 --> F1
    E1 --> F2
    E1 --> F3
    E1 --> F4
    E1 --> F5
    
    E2 --> F1
    E2 --> F2
    E2 --> F3
    E2 --> F4
    E2 --> F5
    
    C1 -.->|Queries| E1
    C2 -.->|Queries| E2
    C3 -.->|Queries| E1
    C3 -.->|Queries| E2
    C4 -.->|Queries| E1
    C4 -.->|Queries| E2
    D1 -.->|Queries| E1
    D1 -.->|Queries| E2
    
    style B fill:#2d5016,stroke:#4ec9b0,stroke-width:2px,color:#fff
    style C1 fill:#4a2d4a,stroke:#c586c0,stroke-width:2px,color:#fff
    style C2 fill:#4a2d4a,stroke:#c586c0,stroke-width:2px,color:#fff
    style C3 fill:#4a2d4a,stroke:#c586c0,stroke-width:2px,color:#fff
    style C4 fill:#4a2d4a,stroke:#c586c0,stroke-width:2px,color:#fff
    style C5 fill:#4a2d4a,stroke:#c586c0,stroke-width:2px,color:#fff
    style D1 fill:#4a3d1f,stroke:#ce9178,stroke-width:2px,color:#fff
~~~

**Execution order:**
1. PlayerInputSystem (10) - Process player input
2. EnemyAISystem (20) - Calculate enemy AI
3. MovementSystem (100) - Update positions
4. CollisionSystem (150) - Check collisions
5. CleanupSystem (200) - Remove dead entities
6. SpriteRenderSystem (100) - Draw everything

---

## Enhancements

### Add Shooting

Add shooting to `PlayerInputSystem`:

~~~csharp
public void Update(GameTime gameTime)
{
    var players = _world.QueryEntities()
        .With<PlayerComponent>()
        .With<TransformComponent>();
    
    foreach (var player in players)
    {
        var transform = player.GetComponent<TransformComponent>();
        
        // Shoot projectile on Space
        if (_input.IsKeyPressed(Keys.Space) && transform != null)
        {
            // Shoot upward
            EntityFactory.CreateProjectile(_world, 
                transform.Position, 
                new Vector2(0, -1));
        }
        
        // ... existing movement code
    }
}
~~~

Add projectile vs enemy collision to `CollisionSystem`:

~~~csharp
// Check projectiles vs enemies
var projectiles = _world.QueryEntities()
    .With<ProjectileComponent>()
    .With<TransformComponent>();

foreach (var projectile in projectiles)
{
    var projTransform = projectile.GetComponent<TransformComponent>();
    if (projTransform == null) continue;
    
    var enemies = _world.QueryEntities().With<EnemyComponent>();
    
    foreach (var enemy in enemies)
    {
        var enemyTransform = enemy.GetComponent<TransformComponent>();
        var enemyHealth = enemy.GetComponent<HealthComponent>();
        
        if (enemyTransform == null) continue;
        
        var distance = Vector2.Distance(
            projTransform.Position, 
            enemyTransform.Position);
        
        if (distance < 20f)
        {
            if (enemyHealth != null)
            {
                enemyHealth.Current -= 25;
            }
            
            _world.DestroyEntity(projectile);
            break;
        }
    }
}
~~~

---

### Add Score System

Create `Components/ScoreComponent.cs`:

~~~csharp
public class ScoreComponent : Component
{
    public int Score { get; set; }
}
~~~

Add to player:

~~~csharp
entity.AddComponent(new ScoreComponent());
~~~

Update score in collision system:

~~~csharp
if (enemyHealth != null && enemyHealth.IsDead)
{
    var playerScore = player.GetComponent<ScoreComponent>();
    if (playerScore != null)
    {
        playerScore.Score += 10;
    }
}
~~~

Display in HUD:

~~~csharp
var score = player.GetComponent<ScoreComponent>();
if (score != null)
{
    _renderer.DrawText($"Score: {score.Score}", 10, 50, Color.White);
}
~~~

---

### Add Particle Effects

Create `Components/ParticleComponent.cs`:

~~~csharp
public class ParticleComponent : Component
{
    public float Lifetime { get; set; }
    public float MaxLifetime { get; set; }
}
~~~

Create particle system:

~~~csharp
public class ParticleSystem : IUpdateSystem
{
    public string Name => "ParticleSystem";
    public int UpdateOrder => 180;
    
    public void Update(GameTime gameTime)
    {
        var particles = _world.QueryEntities()
            .With<ParticleComponent>();
        
        foreach (var particle in particles)
        {
            var particleComp = particle.GetComponent<ParticleComponent>();
            
            if (particleComp != null)
            {
                particleComp.Lifetime -= (float)gameTime.DeltaTime;
                
                if (particleComp.Lifetime <= 0)
                {
                    _world.DestroyEntity(particle);
                }
                
                // Fade out
                var sprite = particle.GetComponent<SpriteComponent>();
                if (sprite != null)
                {
                    var alpha = (byte)(255 * (particleComp.Lifetime / particleComp.MaxLifetime));
                    sprite.Color = new Color(sprite.Color.R, sprite.Color.G, sprite.Color.B, alpha);
                }
            }
        }
    }
}
~~~

---

## Best Practices

### DO

1. **Keep components simple**
   ~~~csharp
   // ✅ Good - just data
   public class HealthComponent : Component
   {
       public int Current { get; set; }
       public int Max { get; set; }
   }
   ~~~

2. **Use factories for creation**
   ~~~csharp
   // ✅ Good - encapsulated
   var player = EntityFactory.CreatePlayer(_world, position);
   ~~~

3. **Order systems explicitly**
   ~~~csharp
   // ✅ Good - clear order
   _world.AddUpdateSystem(new InputSystem(_world) { UpdateOrder = 10 });
   _world.AddUpdateSystem(new PhysicsSystem(_world) { UpdateOrder = 50 });
   _world.AddUpdateSystem(new MovementSystem(_world) { UpdateOrder = 100 });
   ~~~

4. **Query once per frame**
   ~~~csharp
   // ✅ Good - query once
   var entities = _world.QueryEntities()
       .With<TransformComponent>()
       .With<VelocityComponent>()
       .ToList();
   
   foreach (var entity in entities)
   {
       // Process
   }
   ~~~

5. **Use tag components**
   ~~~csharp
   // ✅ Good - easy to query
   public class PlayerComponent : Component { }
   
   var players = _world.QueryEntities().With<PlayerComponent>();
   ~~~

### DON'T

1. **Don't put logic in components**
   ~~~csharp
   // ❌ Bad - logic in component
   public class HealthComponent : Component
   {
       public void TakeDamage(int amount) { ... }
   }
   ~~~

2. **Don't query inside loops**
   ~~~csharp
   // ❌ Bad - queries every iteration
   for (int i = 0; i < 100; i++)
   {
       var enemies = _world.QueryEntities().With<EnemyComponent>();
   }
   ~~~

3. **Don't forget deltaTime**
   ~~~csharp
   // ❌ Bad - frame-rate dependent
   transform.Position += velocity.Velocity;
   
   // ✅ Good - frame-rate independent
   transform.Position += velocity.Velocity * deltaTime;
   ~~~

4. **Don't create entities in tight loops**
   ~~~csharp
   // ❌ Bad - creates 1000 entities per frame!
   protected override void OnUpdate(GameTime gameTime)
   {
       for (int i = 0; i < 1000; i++)
       {
           EntityFactory.CreateEnemy(_world, position);
       }
   }
   ~~~

---

## Troubleshooting

### Problem: Entities not moving

**Symptom:** Entities are created but don't move.

**Solutions:**

1. **Check World.Update is called:**
   ~~~csharp
   protected override void OnUpdate(GameTime gameTime)
   {
       _world.Update(gameTime); // Must call this!
   }
   ~~~

2. **Verify systems are registered:**
   ~~~csharp
   _world.AddUpdateSystem(new MovementSystem(_world));
   ~~~

3. **Check component exists:**
   ~~~csharp
   if (entity.HasComponent<VelocityComponent>())
   {
       Logger.LogDebug("Entity has velocity");
   }
   ~~~

---

### Problem: Nothing renders

**Symptom:** Window is black, no entities visible.

**Solutions:**

1. **Check World.Render is called:**
   ~~~csharp
   protected override void OnRender(GameTime gameTime)
   {
       _renderer.Clear(Color.Black);
       _world.Render(gameTime); // Must call this!
   }
   ~~~

2. **Verify render system registered:**
   ~~~csharp
   _world.AddRenderSystem(new SpriteRenderSystem(_world, _renderer));
   ~~~

3. **Check entity has required components:**
   ~~~csharp
   entity.AddComponent(new TransformComponent());
   entity.AddComponent(new SpriteComponent()); // Both needed!
   ~~~

---

### Problem: Systems run in wrong order

**Symptom:** Collisions detect before movement, etc.

**Solution:** Set UpdateOrder correctly:

~~~csharp
// ✅ Correct ordering
public class InputSystem : IUpdateSystem
{
    public int UpdateOrder => 10; // First
}

public class MovementSystem : IUpdateSystem
{
    public int UpdateOrder => 100; // After input
}

public class CollisionSystem : IUpdateSystem
{
    public int UpdateOrder => 150; // After movement
}
~~~

**Rule:** Lower order runs first.

---

### Problem: Performance issues

**Symptom:** Game runs slowly with many entities.

**Solutions:**

1. **Cache query results:**
   ~~~csharp
   // ✅ Good - query once
   var entities = _world.QueryEntities()
       .With<TransformComponent>()
       .ToList();
   ~~~

2. **Remove unused entities:**
   ~~~csharp
   // Clean up off-screen entities
   if (transform.Position.Y > 1000)
   {
       _world.DestroyEntity(entity);
   }
   ~~~

3. **Use spatial partitioning:**
   - Divide world into grid
   - Only check collisions in same cell

---

## Summary

**What you built:**

| Feature | Implementation |
|---------|----------------|
| **Components** | Transform, Velocity, Sprite, Health, Tags |
| **Systems** | PlayerInput, EnemyAI, Movement, Collision, Cleanup |
| **Entities** | Player, Enemies (via factories) |
| **Game Loop** | Update systems → Render systems |

**Key concepts:**

| Concept | Usage |
|---------|-------|
| **Component** | Pure data (no logic) |
| **System** | Pure logic (queries components) |
| **Entity** | Composition of components |
| **World** | Manages entities and systems |
| **Factory** | Encapsulates entity creation |

**System ordering:**

| Order | System | Purpose |
|-------|--------|---------|
| 10 | PlayerInputSystem | Process input |
| 20 | EnemyAISystem | Calculate AI |
| 100 | MovementSystem | Update positions |
| 150 | CollisionSystem | Check collisions |
| 200 | CleanupSystem | Remove dead entities |

---

## Next Steps

Now that you understand ECS basics, explore advanced topics:

- **[Components Guide](components.md)** - Deep dive into component design
- **[Systems Guide](systems.md)** - Advanced system patterns
- **[Entities Guide](entities.md)** - Entity management and factories
- **[Queries Guide](queries.md)** - Advanced entity queries
- **[ECS Concepts](../../concepts/entity-component-system.md)** - Architectural deep dive

**Try these challenges:**

1. Add different enemy types (fast, slow, strong)
2. Implement power-ups that modify player stats
3. Add particle effects for explosions
4. Create a wave-based spawning system
5. Add a scoring and high score system
6. Implement different weapon types

---

## Quick Reference

~~~csharp
// Create World
var world = new World();

// Register systems
world.AddUpdateSystem(new MovementSystem(world) { UpdateOrder = 100 });
world.AddRenderSystem(new SpriteRenderSystem(world, renderer));

// Create entity
var entity = world.CreateEntity("Player");

// Add components
entity.AddComponent(new TransformComponent { Position = new Vector2(100, 100) });
entity.AddComponent(new VelocityComponent { Speed = 200f });
entity.AddComponent(new SpriteComponent { Width = 32, Height = 32 });

// Query entities
var entities = world.QueryEntities()
    .With<TransformComponent>()
    .With<VelocityComponent>();

// Update and render
protected override void OnUpdate(GameTime gameTime)
{
    world.Update(gameTime);
}

protected override void OnRender(GameTime gameTime)
{
    world.Render(gameTime);
}
~~~

---

Ready to learn more about components? Check out [Components Guide](components.md)!