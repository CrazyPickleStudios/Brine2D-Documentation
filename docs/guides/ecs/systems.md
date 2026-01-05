---
title: ECS Systems
description: Create efficient systems for processing entities in Brine2D
---

# ECS Systems

Systems are **optional performance optimizations** in Brine2D's hybrid ECS. While components can contain logic via `OnUpdate()`, systems let you batch-process many entities efficiently. Think of them as specialized processors that run on specific component combinations.

## When to Use Systems

### Use Systems When:

- ✅ **Many entities** (50+) need the same processing
- ✅ **Performance matters** - batching is faster than individual updates
- ✅ **Execution order is critical** - systems have explicit ordering
- ✅ **Cross-entity queries** - need to compare/interact multiple entities

### Stick with Component Logic When:

- ✅ **Few entities** (<50) with this behavior
- ✅ **Simple, self-contained** logic (timers, lifetime, etc.)
- ✅ **Rapid prototyping** - faster to write than systems
- ✅ **Unique per entity** - not batched processing

```csharp
// ✅ Good for component logic
public class LifetimeComponent : Component
{
    public float Lifetime { get; set; }
    
    protected internal override void OnUpdate(GameTime gameTime)
    {
        Lifetime -= (float)gameTime.DeltaTime;
        if (Lifetime <= 0) Entity?.Destroy();
    }
}

// ✅ Better as a system (many entities)
public class VelocitySystem : IUpdateSystem
{
    public int UpdateOrder => 100;
    
    public void Update(GameTime gameTime)
    {
        var entities = _world.GetEntitiesWithComponents<TransformComponent, VelocityComponent>();
        var deltaTime = (float)gameTime.DeltaTime;
        
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

## System Types

Brine2D supports two types of systems:

### Update Systems (IUpdateSystem)

Run during the update phase (game logic):

```csharp
using Brine2D.Core;
using Brine2D.ECS;
using Brine2D.ECS.Systems;

public class VelocitySystem : IUpdateSystem
{
    private readonly IEntityWorld _world;
    
    public int UpdateOrder => 100; // Lower = earlier
    
    public VelocitySystem(IEntityWorld world)
    {
        _world = world;
    }
    
    public void Update(GameTime gameTime)
    {
        var deltaTime = (float)gameTime.DeltaTime;
        var entities = _world.GetEntitiesWithComponents<TransformComponent, VelocityComponent>();
        
        foreach (var entity in entities)
        {
            var transform = entity.GetComponent<TransformComponent>()!;
            var velocity = entity.GetComponent<VelocityComponent>()!;
            
            // Apply velocity
            transform.Position += velocity.Velocity * deltaTime;
            
            // Apply friction
            if (velocity.Friction > 0)
            {
                var speed = velocity.Velocity.Length();
                if (speed > 0)
                {
                    var newSpeed = Math.Max(0, speed - velocity.Friction * deltaTime);
                    velocity.Velocity *= newSpeed / speed;
                }
            }
        }
    }
}
```

### Render Systems (IRenderSystem)

Run during the render phase (drawing):

```csharp
using Brine2D.ECS.Systems;
using Brine2D.Rendering;
using Brine2D.Rendering.ECS;

public class SpriteRenderingSystem : IRenderSystem
{
    private readonly IEntityWorld _world;
    private readonly ITextureLoader _textureLoader;
    private readonly Dictionary<string, ITexture> _textureCache = new();
    
    public int RenderOrder => 0; // Lower = drawn first (background)
    
    public SpriteRenderingSystem(IEntityWorld world, ITextureLoader textureLoader)
    {
        _world = world;
        _textureLoader = textureLoader;
    }
    
    public void Render(IRenderer renderer)
    {
        var entities = _world.GetEntitiesWithComponents<TransformComponent, SpriteComponent>();
        
        foreach (var entity in entities)
        {
            var transform = entity.GetComponent<TransformComponent>()!;
            var sprite = entity.GetComponent<SpriteComponent>()!;
            
            if (!sprite.IsEnabled) continue;
            
            // Load texture if needed
            if (!_textureCache.ContainsKey(sprite.TexturePath))
            {
                // Handle async loading here
            }
            
            var texture = _textureCache.GetValueOrDefault(sprite.TexturePath);
            if (texture == null) continue;
            
            // Draw sprite
            renderer.DrawTexture(
                texture,
                transform.Position.X,
                transform.Position.Y,
                texture.Width,
                texture.Height
            );
        }
    }
}
```

### Hybrid Systems (Both Update and Render)

Systems can implement both interfaces:

```csharp
public class ParticleSystem : IUpdateSystem, IRenderSystem
{
    private readonly IEntityWorld _world;
    
    public int UpdateOrder => 200;
    public int RenderOrder => 500; // Draw on top
    
    public ParticleSystem(IEntityWorld world)
    {
        _world = world;
    }
    
    public void Update(GameTime gameTime)
    {
        // Update particle physics
        var emitters = _world.GetEntitiesWithComponent<ParticleEmitterComponent>();
        
        foreach (var entity in emitters)
        {
            var emitter = entity.GetComponent<ParticleEmitterComponent>()!;
            if (!emitter.IsEnabled) continue;
            
            // Spawn particles, update lifetimes, etc.
            UpdateParticles(emitter, gameTime);
        }
    }
    
    public void Render(IRenderer renderer)
    {
        // Render particles
        var emitters = _world.GetEntitiesWithComponent<ParticleEmitterComponent>();
        
        foreach (var entity in emitters)
        {
            var emitter = entity.GetComponent<ParticleEmitterComponent>()!;
            var transform = entity.GetComponent<TransformComponent>();
            
            RenderParticles(renderer, emitter, transform);
        }
    }
    
    private void UpdateParticles(ParticleEmitterComponent emitter, GameTime gameTime) { /* ... */ }
    private void RenderParticles(IRenderer renderer, ParticleEmitterComponent emitter, TransformComponent? transform) { /* ... */ }
}
```

---

## System Execution Order

Systems run in **priority order** based on `UpdateOrder` or `RenderOrder`:

### Update Pipeline Order

```csharp
builder.Services.ConfigureSystemPipelines(pipelines =>
{
    // Order matters! Lower numbers run first
    pipelines.AddSystem<PlayerControllerSystem>();  // UpdateOrder: 10  (input)
    pipelines.AddSystem<AISystem>();                // UpdateOrder: 50  (AI decisions)
    pipelines.AddSystem<VelocitySystem>();          // UpdateOrder: 100 (apply movement)
    pipelines.AddSystem<PhysicsSystem>();           // UpdateOrder: 200 (collision)
    pipelines.AddSystem<CameraSystem>();            // UpdateOrder: 400 (camera follow)
    pipelines.AddSystem<AudioSystem>();             // UpdateOrder: 300 (audio)
});
```

**Execution:**
1. Input systems read controls
2. AI systems make decisions
3. Movement systems apply velocity
4. Physics systems resolve collisions
5. Audio systems play sounds
6. Camera systems update view

### Render Pipeline Order

```csharp
builder.Services.ConfigureSystemPipelines(pipelines =>
{
    // Lower = background, Higher = foreground
    pipelines.AddSystem<BackgroundSystem>();      // RenderOrder: -100
    pipelines.AddSystem<SpriteRenderingSystem>(); // RenderOrder: 0
    pipelines.AddSystem<ParticleSystem>();        // RenderOrder: 500
    pipelines.AddSystem<DebugRenderer>();         // RenderOrder: 1000
});
```

**Rendering:**
1. Background layer
2. Sprites (entities)
3. Particle effects
4. Debug overlays (on top)

---

## Registering Systems

### Method 1: ASP.NET-Style Pipeline Configuration

The recommended approach - clean and declarative:

```csharp
using Brine2D.ECS;
using Brine2D.ECS.Systems;
using Brine2D.Rendering.ECS;
using Brine2D.Input.ECS;

var builder = GameApplication.CreateBuilder(args);

// Register ECS
builder.Services.AddObjectECS();
builder.Services.AddECSRendering();
builder.Services.AddECSInput();

// Configure system pipelines (like ASP.NET middleware!)
builder.Services.ConfigureSystemPipelines(pipelines =>
{
    // Update systems
    pipelines.AddSystem<PlayerControllerSystem>();
    pipelines.AddSystem<AISystem>();
    pipelines.AddSystem<VelocitySystem>();
    pipelines.AddSystem<PhysicsSystem>();
    
    // Render systems
    pipelines.AddSystem<SpriteRenderingSystem>();
    pipelines.AddSystem<ParticleSystem>(); // Auto-added to both pipelines!
    
    // Custom systems
    pipelines.AddSystem<MyCustomSystem>();
});

var game = builder.Build();
await game.RunAsync<MyScene>();
```

### Method 2: Manual Injection in Scene

For more control or dynamic systems:

```csharp
public class MyScene : Scene
{
    private readonly UpdatePipeline _updatePipeline;
    private readonly RenderPipeline _renderPipeline;
    private readonly IEntityWorld _world;
    
    public MyScene(
        UpdatePipeline updatePipeline,
        RenderPipeline renderPipeline,
        IEntityWorld world,
        ILogger<MyScene> logger
    ) : base(logger)
    {
        _updatePipeline = updatePipeline;
        _renderPipeline = renderPipeline;
        _world = world;
    }
    
    protected override void OnUpdate(GameTime gameTime)
    {
        // Execute all registered update systems
        _updatePipeline.Execute(gameTime);
        
        // Then update component logic
        _world.Update(gameTime);
    }
    
    protected override void OnRender(GameTime gameTime)
    {
        _renderer.BeginFrame();
        
        // Execute all registered render systems
        _renderPipeline.Execute(_renderer);
        
        _renderer.EndFrame();
    }
}
```

---

## Built-in Systems

Brine2D provides several pre-built systems:

### VelocitySystem

Applies velocity to transform positions with friction:

```csharp
// Automatically registered with AddObjectECS()
// UpdateOrder: 100

// Usage: Just add components!
var entity = world.CreateEntity();
entity.AddComponent<TransformComponent>().Position = new Vector2(100, 100);
entity.AddComponent<VelocityComponent>().Velocity = new Vector2(50, 0);
```

### PhysicsSystem

Handles collision detection and response:

```csharp
// UpdateOrder: 200

var entity = world.CreateEntity();
entity.AddComponent<TransformComponent>();
entity.AddComponent<VelocityComponent>();
entity.AddComponent<ColliderComponent>().Shape = new BoxCollider(32, 32);
```

### AISystem

Processes AI behaviors (chase, patrol, flee):

```csharp
// UpdateOrder: 50

var enemy = world.CreateEntity();
enemy.AddComponent<TransformComponent>();
enemy.AddComponent<VelocityComponent>();

var ai = enemy.AddComponent<AIControllerComponent>();
ai.Behavior = AIBehavior.Chase;
ai.TargetTag = "Player";
ai.MoveSpeed = 100f;
```

### PlayerControllerSystem

Handles player input and applies to velocity:

```csharp
// Requires: Brine2D.Input.ECS
// UpdateOrder: 10

var player = world.CreateEntity();
player.AddComponent<TransformComponent>();
player.AddComponent<VelocityComponent>();

var controller = player.AddComponent<PlayerControllerComponent>();
controller.MoveSpeed = 200f;
controller.InputMode = InputMode.KeyboardAndGamepad;
```

### SpriteRenderingSystem

Renders sprites efficiently:

```csharp
// Requires: Brine2D.Rendering.ECS
// RenderOrder: 0

var entity = world.CreateEntity();
entity.AddComponent<TransformComponent>();

var sprite = entity.AddComponent<SpriteComponent>();
sprite.TexturePath = "assets/player.png";
sprite.Tint = Color.White;
```

### CameraSystem

Updates camera to follow entities:

```csharp
// UpdateOrder: 400

var player = world.CreateEntity();
player.AddComponent<TransformComponent>();

var cameraFollow = player.AddComponent<CameraFollowComponent>();
cameraFollow.CameraName = "main";
cameraFollow.Smoothing = 5f;
```

### AudioSystem

Plays sounds and music from components:

```csharp
// Requires: Brine2D.Audio.ECS
// UpdateOrder: 300

var entity = world.CreateEntity();

var audio = entity.AddComponent<AudioSourceComponent>();
audio.SoundEffect = jumpSound;
audio.Volume = 1.0f;
audio.TriggerPlay = true; // Play now!
```

---

## Creating Custom Systems

### Update System Example

```csharp
using Brine2D.Core;
using Brine2D.ECS;
using Brine2D.ECS.Systems;
using System.Numerics;

public class GravitySystem : IUpdateSystem
{
    private readonly IEntityWorld _world;
    
    public int UpdateOrder => 150; // After input, before physics
    
    public GravitySystem(IEntityWorld world)
    {
        _world = world;
    }
    
    public void Update(GameTime gameTime)
    {
        var deltaTime = (float)gameTime.DeltaTime;
        
        // Get all entities affected by gravity
        var entities = _world.GetEntitiesWithComponents<VelocityComponent, GravityComponent>();
        
        foreach (var entity in entities)
        {
            var velocity = entity.GetComponent<VelocityComponent>()!;
            var gravity = entity.GetComponent<GravityComponent>()!;
            
            if (!gravity.IsEnabled) continue;
            
            // Apply gravity force
            velocity.Velocity += new Vector2(0, gravity.Force) * deltaTime;
        }
    }
}

// Supporting component
public class GravityComponent : Component
{
    public float Force { get; set; } = 980f; // Pixels per second squared
}
```

### Render System Example

```csharp
using Brine2D.ECS.Systems;
using Brine2D.Rendering;
using Brine2D.Rendering.ECS;

public class HealthBarSystem : IRenderSystem
{
    private readonly IEntityWorld _world;
    
    public int RenderOrder => 100; // After sprites, before UI
    
    public HealthBarSystem(IEntityWorld world)
    {
        _world = world;
    }
    
    public void Render(IRenderer renderer)
    {
        var entities = _world.GetEntitiesWithComponents<TransformComponent, HealthComponent>();
        
        foreach (var entity in entities)
        {
            var transform = entity.GetComponent<TransformComponent>()!;
            var health = entity.GetComponent<HealthComponent>()!;
            
            if (!health.IsEnabled) continue;
            
            // Draw health bar above entity
            var barWidth = 32f;
            var barHeight = 4f;
            var barX = transform.Position.X - barWidth / 2;
            var barY = transform.Position.Y - 20;
            
            // Background (red)
            renderer.DrawRectangle(barX, barY, barWidth, barHeight, new Color(255, 0, 0));
            
            // Foreground (green)
            var fillWidth = barWidth * health.Percentage;
            renderer.DrawRectangle(barX, barY, fillWidth, barHeight, new Color(0, 255, 0));
        }
    }
}
```

### Hybrid System Example

```csharp
public class DamageNumberSystem : IUpdateSystem, IRenderSystem
{
    private readonly IEntityWorld _world;
    private readonly List<DamageNumber> _activeNumbers = new();
    
    public int UpdateOrder => 250;
    public int RenderOrder => 200;
    
    public DamageNumberSystem(IEntityWorld world)
    {
        _world = world;
        
        // Subscribe to damage events
        var eventBus = world.Services.GetService<EventBus>();
        eventBus?.Subscribe<DamageEvent>(OnDamage);
    }
    
    private void OnDamage(DamageEvent evt)
    {
        if (evt.Target == null) return;
        
        var transform = evt.Target.GetComponent<TransformComponent>();
        if (transform == null) return;
        
        _activeNumbers.Add(new DamageNumber
        {
            Position = transform.Position,
            Amount = evt.Amount,
            Lifetime = 1f
        });
    }
    
    public void Update(GameTime gameTime)
    {
        var deltaTime = (float)gameTime.DeltaTime;
        
        // Update damage numbers
        for (int i = _activeNumbers.Count - 1; i >= 0; i--)
        {
            var number = _activeNumbers[i];
            
            number.Lifetime -= deltaTime;
            number.Position.Y -= 30 * deltaTime; // Float upward
            
            if (number.Lifetime <= 0)
            {
                _activeNumbers.RemoveAt(i);
            }
        }
    }
    
    public void Render(IRenderer renderer)
    {
        foreach (var number in _activeNumbers)
        {
            var alpha = (byte)(255 * (number.Lifetime / 1f));
            var color = new Color(255, 255, 255, alpha);
            
            renderer.DrawText(
                $"-{number.Amount:F0}",
                number.Position.X,
                number.Position.Y,
                color
            );
        }
    }
    
    private class DamageNumber
    {
        public Vector2 Position;
        public float Amount;
        public float Lifetime;
    }
}
```

---

## System Patterns

### Query Caching

Cache entity queries for better performance:

```csharp
public class OptimizedSystem : IUpdateSystem
{
    private readonly IEntityWorld _world;
    private List<Entity>? _cachedEntities;
    private bool _needsRefresh = true;
    
    public int UpdateOrder => 100;
    
    public OptimizedSystem(IEntityWorld world)
    {
        _world = world;
        
        // Refresh cache when entities change
        _world.OnEntityCreated += _ => _needsRefresh = true;
        _world.OnEntityDestroyed += _ => _needsRefresh = true;
        _world.OnComponentAdded += (_, _) => _needsRefresh = true;
        _world.OnComponentRemoved += (_, _) => _needsRefresh = true;
    }
    
    public void Update(GameTime gameTime)
    {
        if (_needsRefresh || _cachedEntities == null)
        {
            _cachedEntities = _world
                .GetEntitiesWithComponents<TransformComponent, VelocityComponent>()
                .ToList();
            _needsRefresh = false;
        }
        
        // Process cached entities
        foreach (var entity in _cachedEntities)
        {
            // ...
        }
    }
}
```

### System Communication

Systems can communicate via events:

```csharp
// Event definition
public class CollisionEvent
{
    public Entity Entity1 { get; set; }
    public Entity Entity2 { get; set; }
}

// System 1: Detects collisions
public class CollisionDetectionSystem : IUpdateSystem
{
    private readonly IEntityWorld _world;
    private readonly EventBus _eventBus;
    
    public int UpdateOrder => 200;
    
    public void Update(GameTime gameTime)
    {
        // Detect collisions...
        
        if (collision)
        {
            _eventBus.Publish(new CollisionEvent
            {
                Entity1 = entityA,
                Entity2 = entityB
            });
        }
    }
}

// System 2: Responds to collisions
public class CollisionResponseSystem : IUpdateSystem
{
    public int UpdateOrder => 201; // After detection
    
    public CollisionResponseSystem(EventBus eventBus)
    {
        eventBus.Subscribe<CollisionEvent>(OnCollision);
    }
    
    private void OnCollision(CollisionEvent evt)
    {
        // Handle collision response
    }
    
    public void Update(GameTime gameTime) { }
}
```

### System State

Systems can maintain state:

```csharp
public class WaveSpawnerSystem : IUpdateSystem
{
    private readonly IEntityWorld _world;
    private int _currentWave = 1;
    private float _timeSinceLastWave = 0;
    private int _enemiesRemaining = 0;
    
    public int UpdateOrder => 300;
    
    public void Update(GameTime gameTime)
    {
        _timeSinceLastWave += (float)gameTime.DeltaTime;
        
        // Count remaining enemies
        _enemiesRemaining = _world.GetEntitiesByTag("Enemy").Count();
        
        // Spawn new wave if ready
        if (_enemiesRemaining == 0 && _timeSinceLastWave > 5f)
        {
            SpawnWave(_currentWave);
            _currentWave++;
            _timeSinceLastWave = 0;
        }
    }
    
    private void SpawnWave(int waveNumber)
    {
        int enemyCount = waveNumber * 5;
        // Spawn enemies...
    }
}
```

---

## Performance Tips

### Minimize Component Lookups

```csharp
// ❌ Slow - multiple lookups per entity
public void Update(GameTime gameTime)
{
    var entities = _world.GetEntitiesWithComponent<TransformComponent>();
    
    foreach (var entity in entities)
    {
        if (entity.HasComponent<VelocityComponent>()) // Lookup 1
        {
            var transform = entity.GetComponent<TransformComponent>(); // Lookup 2
            var velocity = entity.GetComponent<VelocityComponent>(); // Lookup 3
            // ...
        }
    }
}

// ✅ Fast - query for both components, single lookup each
public void Update(GameTime gameTime)
{
    var entities = _world.GetEntitiesWithComponents<TransformComponent, VelocityComponent>();
    
    foreach (var entity in entities)
    {
        var transform = entity.GetComponent<TransformComponent>()!; // Lookup 1
        var velocity = entity.GetComponent<VelocityComponent>()!;   // Lookup 2
        // ...
    }
}
```

### Use Enabled Flags

Skip disabled components:

```csharp
public void Update(GameTime gameTime)
{
    var entities = _world.GetEntitiesWithComponent<MyComponent>();
    
    foreach (var entity in entities)
    {
        var component = entity.GetComponent<MyComponent>()!;
        
        if (!component.IsEnabled) continue; // Skip disabled
        
        // Process component
    }
}
```

### Batch Processing

Process entities in batches for cache efficiency:

```csharp
public void Update(GameTime gameTime)
{
    var entities = _world.GetEntitiesWithComponents<TransformComponent, VelocityComponent>();
    var deltaTime = (float)gameTime.DeltaTime;
    
    // Batch process all positions
    foreach (var entity in entities)
    {
        var transform = entity.GetComponent<TransformComponent>()!;
        var velocity = entity.GetComponent<VelocityComponent>()!;
        
        transform.Position += velocity.Velocity * deltaTime;
    }
}
```

---

## Testing Systems

Systems are easy to test in isolation:

```csharp
[Test]
public void VelocitySystem_AppliesVelocityToPosition()
{
    // Arrange
    var world = new EntityWorld();
    var system = new VelocitySystem(world);
    
    var entity = world.CreateEntity();
    var transform = entity.AddComponent<TransformComponent>();
    transform.Position = new Vector2(0, 0);
    
    var velocity = entity.AddComponent<VelocityComponent>();
    velocity.Velocity = new Vector2(100, 0);
    
    // Act
    system.Update(new GameTime(TimeSpan.FromSeconds(1), TimeSpan.FromSeconds(1)));
    
    // Assert
    Assert.AreEqual(new Vector2(100, 0), transform.Position);
}

[Test]
public void AISystem_ChasesTarget()
{
    var world = new EntityWorld();
    var system = new AISystem(world);
    
    // Create player
    var player = world.CreateEntity("Player");
    player.Tags.Add("Player");
    player.AddComponent<TransformComponent>().Position = new Vector2(200, 0);
    
    // Create enemy
    var enemy = world.CreateEntity("Enemy");
    var enemyTransform = enemy.AddComponent<TransformComponent>();
    enemyTransform.Position = new Vector2(0, 0);
    
    var ai = enemy.AddComponent<AIControllerComponent>();
    ai.Behavior = AIBehavior.Chase;
    ai.TargetTag = "Player";
    ai.MoveSpeed = 100f;
    
    var velocity = enemy.AddComponent<VelocityComponent>();
    
    // Act
    system.Update(new GameTime(TimeSpan.FromSeconds(1), TimeSpan.FromSeconds(1)));
    
    // Assert
    Assert.IsTrue(velocity.Velocity.X > 0); // Moving toward player
}
```

---

## Quick Reference

### System Checklist

When creating a system, consider:

- ✅ Does it implement `IUpdateSystem` or `IRenderSystem`?
- ✅ Is the `UpdateOrder`/`RenderOrder` appropriate?
- ✅ Does it query the right component combination?
- ✅ Are component lookups minimized?
- ✅ Are disabled components skipped?
- ✅ Can it be tested in isolation?

### System Order Guidelines

| Order Range | Purpose | Examples |
|-------------|---------|----------|
| **0-50** | Input & AI | `PlayerControllerSystem`, `AISystem` |
| **50-150** | Physics Setup | `GravitySystem`, `ForceSystem` |
| **150-200** | Movement | `VelocitySystem` |
| **200-300** | Collision | `PhysicsSystem`, `CollisionSystem` |
| **300-500** | Effects | `AudioSystem`, `ParticleSystem` |
| **500+** | Camera & UI | `CameraSystem` |

---

## Next Steps

Now that you understand systems, explore related topics:

<div class="grid cards" markdown>

-   **Components Guide**

    ---

    Learn when to use component logic vs systems

    [:octicons-arrow-right-24: Components Guide](components.md)

-   **Entities Guide**

    ---

    Master entity queries and management

    [:octicons-arrow-right-24: Entities Guide](entities.md)

-   **ECS Concepts**

    ---

    Deep dive into ECS architecture

    [:octicons-arrow-right-24: ECS Concepts](../../concepts/entity-component-system.md)

</div>

---

**Remember:** Systems are **optional performance optimizations** in Brine2D's hybrid ECS. Use them when you need to batch-process many entities efficiently. For simple behaviors, component logic is often simpler and faster to develop!