---
title: Entity Component System
description: Understanding Brine2D's hybrid ECS architecture
---

# Entity Component System

Brine2D features a **hybrid object-based ECS** that combines the flexibility of traditional object-oriented programming with the performance benefits of component-based architecture. Unlike pure data-oriented ECS frameworks, Brine2D's approach is designed for rapid game development while still offering optimization paths when needed.

## What is Hybrid ECS?

Brine2D's ECS is "hybrid" because it bridges two worlds:

**Traditional OOP:**
- Components are classes (not structs)
- Components can contain logic
- Easy to learn and prototype with

**Performance-Oriented ECS:**
- Optional systems for batch processing
- Entity queries for efficient lookups
- Component-based composition
- **Automatic system execution** via lifecycle hooks

Think of it as **"ASP.NET for game entities"** - familiar patterns with performance when you need it.

---

## Core Concepts

### Entities

**Entities are containers** for components. They're like game objects but lightweight.

~~~csharp
// Create an entity
var player = world.CreateEntity("Player");
player.Tags.Add("Player");

// Entities have:
// - Id (unique identifier)
// - Name (for debugging)
// - Tags (for querying)
// - Components (the data and behavior)
~~~

**Think of entities as:**
- Rows in a database
- Game objects in Unity
- Containers that hold components

### Components

**Components are classes** that inherit from `Component` and can contain both data and logic.

~~~csharp
using Brine2D.Core;
using Brine2D.ECS;

// Simple data component
public class HealthComponent : Component
{
    public float Current { get; set; }
    public float Max { get; set; }
    
    public float Percentage => Current / Max;
}

// Component with logic
public class LifetimeComponent : Component
{
    public float Lifetime { get; set; }
    
    protected internal override void OnUpdate(GameTime gameTime)
    {
        Lifetime -= (float)gameTime.DeltaTime;
        if (Lifetime <= 0) Entity?.Destroy();
    }
}
~~~

**Key features:**
- Inherit from `Component` base class
- Can override lifecycle methods (`OnUpdate`, `OnAdded`, etc.)
- Access other components via `Entity`
- Can be enabled/disabled
- **Update automatically** via `SceneManager`

### Systems (Optional)

**Systems are performance optimizations** that batch-process many entities with specific components.

~~~csharp
using Brine2D.ECS.Systems;

public class VelocitySystem : IUpdateSystem
{
    private readonly IEntityWorld _world;
    public int UpdateOrder => 100;
    
    public void Update(GameTime gameTime)
    {
        // Process ALL entities with Transform + Velocity efficiently
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
~~~

**When to use:**
- 50+ entities need the same processing
- Performance is critical
- Explicit execution order needed

Once registered via `ConfigureSystemPipelines()`, systems **run automatically** via lifecycle hooks!

---

## Architecture Comparison

### Traditional OOP (Unity-style)

\`\`\`mermaid
graph TD
    GO1["GameObject: Player"] --> C1["Health: 100"]
    GO1 --> C2["Movement Script"]
    GO1 --> C3["Render Script"]
    
    GO2["GameObject: Enemy"] --> C4["Health: 50"]
    GO2 --> C5["AI Script"]
    GO2 --> C6["Render Script"]

    style GO1 fill:#264f78,stroke:#4fc1ff,stroke-width:2px,color:#fff
    style GO2 fill:#264f78,stroke:#4fc1ff,stroke-width:2px,color:#fff
    style C1 fill:#2d5016,stroke:#4ec9b0,stroke-width:2px,color:#fff
    style C2 fill:#2d5016,stroke:#4ec9b0,stroke-width:2px,color:#fff
    style C3 fill:#2d5016,stroke:#4ec9b0,stroke-width:2px,color:#fff
    style C4 fill:#2d5016,stroke:#4ec9b0,stroke-width:2px,color:#fff
    style C5 fill:#2d5016,stroke:#4ec9b0,stroke-width:2px,color:#fff
    style C6 fill:#2d5016,stroke:#4ec9b0,stroke-width:2px,color:#fff
\`\`\`

**Characteristics:**
- Components update individually
- Easy to write and understand
- Can be slow with many objects

### Brine2D Hybrid ECS

\`\`\`mermaid
graph TD
    subgraph "Entities"
        E1["Entity: Player"]
        E2["Entity: Enemy"]
    end
    
    subgraph "Components (Data + Logic)"
        E1 --> C1["Transform"]
        E1 --> C2["Health"]
        E1 --> C3["PlayerController"]
        
        E2 --> C4["Transform"]
        E2 --> C5["Health"]
        E2 --> C6["AIController"]
    end
    
    subgraph "Systems (Optional Performance)"
        S1["VelocitySystem"] -.processes.-> C1
        S1 -.processes.-> C4
        S2["RenderSystem"] -.processes.-> C1
        S2 -.processes.-> C4
    end
    
    subgraph "Automatic Execution"
        SM["SceneManager"] -.runs automatically.-> S1
        SM -.runs automatically.-> S2
    end

    style E1 fill:#264f78,stroke:#4fc1ff,stroke-width:2px,color:#fff
    style E2 fill:#264f78,stroke:#4fc1ff,stroke-width:2px,color:#fff
    style C1 fill:#2d5016,stroke:#4ec9b0,stroke-width:2px,color:#fff
    style C2 fill:#2d5016,stroke:#4ec9b0,stroke-width:2px,color:#fff
    style C3 fill:#2d5016,stroke:#4ec9b0,stroke-width:2px,color:#fff
    style C4 fill:#2d5016,stroke:#4ec9b0,stroke-width:2px,color:#fff
    style C5 fill:#2d5016,stroke:#4ec9b0,stroke-width:2px,color:#fff
    style C6 fill:#2d5016,stroke:#4ec9b0,stroke-width:2px,color:#fff
    style S1 fill:#1e3a5f,stroke:#569cd6,stroke-width:2px,color:#fff
    style S2 fill:#1e3a5f,stroke:#569cd6,stroke-width:2px,color:#fff
    style SM fill:#4a2d4a,stroke:#c586c0,stroke-width:2px,color:#fff
\`\`\`

**Characteristics:**
- Components can update themselves (rapid prototyping)
- Systems available for performance (batch processing)
- **Systems run automatically** via lifecycle hooks
- Best of both worlds

---

## Practical Example: Building a Game

Let's build a simple game to see how everything works together.

### Step 1: Define Components

~~~csharp
// Position in world
public class TransformComponent : Component
{
    public Vector2 Position { get; set; }
    public float Rotation { get; set; }
}

// Movement velocity (processed by VelocitySystem)
public class VelocityComponent : Component
{
    public Vector2 Velocity { get; set; }
    public float MaxSpeed { get; set; } = 200f;
}

// Player input (processed by PlayerControllerSystem)
public class PlayerControllerComponent : Component
{
    public float MoveSpeed { get; set; } = 200f;
}

// Auto-destroy (self-contained logic)
public class LifetimeComponent : Component
{
    public float Lifetime { get; set; }
    
    protected internal override void OnUpdate(GameTime gameTime)
    {
        Lifetime -= (float)gameTime.DeltaTime;
        if (Lifetime <= 0) Entity?.Destroy();
    }
}
~~~

### Step 2: Create Entities

~~~csharp
// Create player
var player = world.CreateEntity("Player");
player.Tags.Add("Player");

player.AddComponent<TransformComponent>().Position = new Vector2(400, 300);
player.AddComponent<VelocityComponent>();
player.AddComponent<PlayerControllerComponent>();

// Create bullet (with lifetime)
var bullet = world.CreateEntity("Bullet");
bullet.AddComponent<TransformComponent>().Position = player.GetComponent<TransformComponent>()!.Position;
bullet.AddComponent<VelocityComponent>().Velocity = new Vector2(500, 0);
bullet.AddComponent<LifetimeComponent>().Lifetime = 3f; // Auto-destroy after 3 seconds
~~~

### Step 3: Register Systems (Optional)

~~~csharp
// In Program.cs
builder.Services.ConfigureSystemPipelines(pipelines =>
{
    pipelines.AddSystem<PlayerControllerSystem>();  // Read input
    pipelines.AddSystem<VelocitySystem>();          // Apply movement
    pipelines.AddSystem<SpriteRenderingSystem>();   // Draw sprites
});
~~~

**Systems run automatically** via lifecycle hooks - no manual calls needed!

### Step 4: Use in Scene

~~~csharp
public class GameScene : Scene
{
    private readonly IEntityWorld _world;
    private readonly IRenderer _renderer;
    
    protected override void OnInitialize()
    {
        _renderer.ClearColor = new Color(40, 40, 60);
        
        // Create entities
        var player = _world.CreateEntity("Player");
        player.AddComponent<TransformComponent>();
        player.AddComponent<VelocityComponent>();
        player.AddComponent<PlayerControllerComponent>();
    }
    
    protected override void OnUpdate(GameTime gameTime)
    {
        // Just scene-specific logic
        CheckWinCondition();
        
        // Systems run automatically!
        // Component OnUpdate() runs automatically!
    }
    
    protected override void OnRender(GameTime gameTime)
    {
        // Frame management automatic!
        // Sprites already rendered by SpriteRenderingSystem!
        
        // Just draw UI
        _renderer.DrawText($"Score: {_score}", 10, 10, Color.White);
    }
}
~~~

**Notice:** No manual `_updatePipeline.Execute()` or `_world.Update()` calls needed!

---

## Component Lifecycle

Components have several lifecycle hooks:

\`\`\`mermaid
sequenceDiagram
    participant E as Entity
    participant C as Component
    participant SM as SceneManager
    
    E->>C: AddComponent()
    C->>C: OnAdded()
    Note over C: Initialize component
    
    loop Every Frame (Automatic)
        SM->>C: OnUpdate(gameTime)
        Note over C: Component logic runs automatically
    end
    
    E->>C: IsEnabled = false
    C->>C: OnDisabled()
    
    E->>C: IsEnabled = true
    C->>C: OnEnabled()
    
    E->>C: RemoveComponent()
    C->>C: OnRemoved()
    Note over C: Cleanup
\`\`\`

~~~csharp
public class MyComponent : Component
{
    protected internal override void OnAdded()
    {
        // Called when added to entity
        Logger.LogInformation("Component added!");
    }
    
    protected internal override void OnUpdate(GameTime gameTime)
    {
        // Called every frame if enabled
        // Runs automatically via SceneManager!
    }
    
    protected internal override void OnEnabled()
    {
        // Called when component is enabled
    }
    
    protected internal override void OnDisabled()
    {
        // Called when component is disabled
    }
    
    protected internal override void OnRemoved()
    {
        // Called when removed from entity
        // Cleanup here
    }
}
~~~

---

## Design Patterns

### Composition Over Inheritance

Build complex entities by combining simple components:

~~~csharp
// Flying enemy = Transform + AI + Flying behavior
var flyingEnemy = world.CreateEntity("FlyingEnemy");
flyingEnemy.AddComponent<TransformComponent>();
flyingEnemy.AddComponent<VelocityComponent>();
flyingEnemy.AddComponent<AIControllerComponent>();
flyingEnemy.AddComponent<FlyingMovementComponent>();
flyingEnemy.AddComponent<SpriteComponent>();

// Boss = Everything above + special abilities
var boss = world.CreateEntity("Boss");
boss.AddComponent<TransformComponent>();
boss.AddComponent<VelocityComponent>();
boss.AddComponent<AIControllerComponent>();
boss.AddComponent<FlyingMovementComponent>();
boss.AddComponent<SpriteComponent>();
boss.AddComponent<BossAbilitiesComponent>(); // Unique!
boss.AddComponent<HealthComponent>().Max = 1000; // Lots of health
~~~

No inheritance hierarchy needed!

### Using Prefabs

Reuse entity templates:

~~~csharp
// Create prefab once
var enemyPrefab = new EntityPrefab("Enemy");
enemyPrefab.AddComponent<TransformComponent>();
enemyPrefab.AddComponent<VelocityComponent>();
enemyPrefab.AddComponent<AIControllerComponent>(ai =>
{
    ai.Behavior = AIBehavior.Chase;
    ai.MoveSpeed = 100f;
});

// Register prefab
prefabLibrary.Register(enemyPrefab);

// Instantiate many times
for (int i = 0; i < 10; i++)
{
    var enemy = enemyPrefab.Instantiate(world, new Vector2(i * 100, 200));
}
~~~

### Component Communication

Components can interact:

~~~csharp
public class DamageOnContactComponent : Component
{
    public float Damage { get; set; } = 10f;
    
    protected internal override void OnUpdate(GameTime gameTime)
    {
        // Get other components on same entity
        var collider = Entity?.GetComponent<ColliderComponent>();
        if (collider == null) return;
        
        // Check collisions
        foreach (var other in GetCollidingEntities())
        {
            var health = other.GetComponent<HealthComponent>();
            if (health != null)
            {
                health.Current -= Damage;
            }
        }
    }
}
~~~

---

## When to Use What

### Use Component Logic When:

✅ Few entities (<50) with this behavior  
✅ Simple, self-contained logic  
✅ Rapid prototyping  
✅ Unique per-entity behavior  

**Example:**
~~~csharp
public class FollowMouseComponent : Component
{
    protected internal override void OnUpdate(GameTime gameTime)
    {
        var input = Entity?.World?.Services.GetService<IInputService>();
        var transform = Entity?.GetComponent<TransformComponent>();
        
        if (input != null && transform != null)
        {
            transform.Position = input.MousePosition;
        }
    }
}
~~~

### Use Systems When:

✅ Many entities (50+) need same processing  
✅ Performance is critical  
✅ Cross-entity queries needed  
✅ Specific execution order required  

**Example:**
~~~csharp
public class VelocitySystem : IUpdateSystem
{
    public int UpdateOrder => 100;
    
    public void Update(GameTime gameTime)
    {
        // Efficiently process all moving entities
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
~~~

**Remember:** Once registered, systems **run automatically** via lifecycle hooks!

---

## ASP.NET Parallels

Brine2D's ECS mirrors ASP.NET patterns:

| ASP.NET | Brine2D ECS | Purpose |
|---------|-------------|---------|
| `Controller` | `Entity` | Container for logic |
| `Service` | `Component` | Specific functionality |
| `Middleware` | `System` | Processing pipeline |
| `IOptions<T>` | Component properties | Configuration |
| `ILogger<T>` | Component events | Diagnostics |
| DI Container | `IEntityWorld` | Service location |
| **Auto-execution** | **Lifecycle hooks** | **Automatic behavior** |

**Example:**

~~~csharp
// ASP.NET Controller
public class PlayerController : ControllerBase
{
    private readonly IPlayerService _player;
    public PlayerController(IPlayerService player) { }
}

// Brine2D Entity
var player = world.CreateEntity("Player");
player.AddComponent<TransformComponent>();
player.AddComponent<PlayerControllerComponent>();
~~~

Both use dependency injection and composition!

---

## Performance Characteristics

### Component Updates

- Components update in order they were added
- Skipped if `IsEnabled = false`
- **Run automatically** via `SceneManager`
- Good for <50 entities per component type

### System Processing

- Batch processes all matching entities
- Explicit execution order (`UpdateOrder`)
- **Run automatically** via lifecycle hooks
- Efficient for 50+ entities

### Querying

~~~csharp
// Fast - uses internal indexing
var players = world.GetEntitiesByTag("Player");
var moving = world.GetEntitiesWithComponents<TransformComponent, VelocityComponent>();

// Slower - linear search
var specific = world.FindEntity(e => e.Name == "Boss" && e.IsActive);
~~~

---

## Quick Reference

### Entity Operations

~~~csharp
var entity = world.CreateEntity("Name");
entity.Tags.Add("Player");
entity.IsActive = false; // Disable
world.DestroyEntity(entity);
~~~

### Component Operations

~~~csharp
var health = entity.AddComponent<HealthComponent>();
health.Current = 100;

var health = entity.GetComponent<HealthComponent>();
bool has = entity.HasComponent<HealthComponent>();
entity.RemoveComponent<HealthComponent>();

health.IsEnabled = false; // Disable component
~~~

### Querying

~~~csharp
var all = world.Entities;
var tagged = world.GetEntitiesByTag("Enemy");
var withHealth = world.GetEntitiesWithComponent<HealthComponent>();
var moving = world.GetEntitiesWithComponents<TransformComponent, VelocityComponent>();
var player = world.FindEntity(e => e.Name == "Player");
~~~

---

## Next Steps

Now that you understand the concepts, start building:

**[ECS Getting Started](../guides/ecs/getting-started.md)** - Build your first ECS game in 15 minutes  
**[Components Guide](../guides/ecs/components.md)** - Learn component design patterns  
**[Systems Guide](../guides/ecs/systems.md)** - Create efficient systems for performance  
**[Scene Management](scenes.md)** - See how automatic execution works

---

**Remember:** Brine2D's hybrid ECS gives you flexibility. Start with component logic for rapid development, add systems when you need performance. Systems and component updates **run automatically** via lifecycle hooks - no manual calls needed! Choose what fits your needs!