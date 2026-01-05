---
title: ECS Getting Started
description: Build your first game with Brine2D's Entity Component System
---

# Getting Started with ECS

Learn how to build games with Brine2D's hybrid Entity Component System (ECS) in this hands-on guide. We'll create a simple game with a player that can move around and collect coins.

## Prerequisites

- Completed the [Quick Start](../../getting-started/quickstart.md) guide
- Basic understanding of C# and .NET
- Brine2D installed (see [Installation](../../getting-started/installation.md))

**Recommended:** Read [ECS Concepts](../../concepts/entity-component-system.md) first to understand the architecture.

---

## What You'll Build

By the end of this guide, you'll have:

- ✅ A player entity controlled with WASD
- ✅ Collectible coin entities  
- ✅ Score tracking
- ✅ Simple rendering
- ✅ Understanding of Brine2D's hybrid ECS

**Estimated time:** 15-20 minutes

---

## Understanding Brine2D's Hybrid ECS

Brine2D uses a **hybrid object-based ECS** that gives you flexibility:

- **Components are classes** (not structs) that can contain logic
- **Components can self-update** via `OnUpdate()` for simple behaviors
- **Systems are optional** - use them when you need performance for many entities
- **Familiar object-oriented patterns** - easier to learn than pure data-oriented ECS

```csharp
// ✅ Simple component with logic (perfectly fine!)
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

// ✅ Data-only component (processed by systems for performance)
public class VelocityComponent : Component
{
    public Vector2 Velocity { get; set; }
    public float MaxSpeed { get; set; }
}
```

---

## Step 1: Install ECS Package

First, add the ECS package to your project:

```bash
dotnet add package Brine2D.ECS
```

!!! info "Desktop Package Includes ECS"
    If you installed `Brine2D.Desktop`, you already have ECS included!

---

## Step 2: Define Components

Components are **classes** that inherit from `Component`.

Create a new file `Components.cs`:

```csharp
using System.Numerics;
using Brine2D.Core;
using Brine2D.ECS;

// Position in the world (data-only, processed by VelocitySystem)
public class TransformComponent : Component
{
    public Vector2 Position { get; set; }
    public float Rotation { get; set; }
    public Vector2 Scale { get; set; } = Vector2.One;
}

// Movement velocity (data-only, processed by VelocitySystem)
public class VelocityComponent : Component
{
    public Vector2 Velocity { get; set; }
    public float MaxSpeed { get; set; } = 200f;
    public float Friction { get; set; } = 5f;
}

// Input controller (data-only, processed by PlayerControllerSystem)
public class PlayerControllerComponent : Component
{
    public float MoveSpeed { get; set; } = 200f;
    public Vector2 InputDirection { get; set; }
}

// Score tracking
public class ScoreComponent : Component
{
    public int Current { get; set; }
}

// Coin marker (we'll use this to identify coins)
public class CoinComponent : Component
{
    public int Value { get; set; } = 10;
}

// Auto-destroy after time (has logic!)
public class LifetimeComponent : Component
{
    public float Remaining { get; set; }
    
    protected internal override void OnUpdate(GameTime gameTime)
    {
        if (!IsEnabled) return;
        
        Remaining -= (float)gameTime.DeltaTime;
        
        if (Remaining <= 0)
        {
            Entity?.Destroy();
        }
    }
}
```

!!! tip "Component Design Tips"
    - ✅ Inherit from `Component` base class
    - ✅ Use properties for data
    - ✅ Override `OnUpdate()` for simple behaviors
    - ✅ Use systems for processing many entities efficiently

---

## Step 3: Create Simple Game Logic

For this tutorial, we'll use **component logic** for simplicity. In production, you'd use systems for better performance.

Add player movement logic:

```csharp
// Player input handling (self-contained component)
public class SimplePlayerController : Component
{
    public float MoveSpeed { get; set; } = 200f;
    private IInputService? _input;
    
    protected internal override void OnAdded()
    {
        // Get input service from entity's world
        _input = Entity?.World?.Services.GetService<IInputService>();
    }
    
    protected internal override void OnUpdate(GameTime gameTime)
    {
        if (!IsEnabled || _input == null) return;
        
        var transform = Entity?.GetComponent<TransformComponent>();
        if (transform == null) return;
        
        // Read input
        var movement = Vector2.Zero;
        if (_input.IsKeyDown(Keys.W)) movement.Y -= 1;
        if (_input.IsKeyDown(Keys.S)) movement.Y += 1;
        if (_input.IsKeyDown(Keys.A)) movement.X -= 1;
        if (_input.IsKeyDown(Keys.D)) movement.X += 1;
        
        // Apply movement
        if (movement != Vector2.Zero)
        {
            movement = Vector2.Normalize(movement);
            transform.Position += movement * MoveSpeed * (float)gameTime.DeltaTime;
        }
    }
}

// Coin collection logic
public class CoinCollectorComponent : Component
{
    public float CollectionRadius { get; set; } = 30f;
    
    protected internal override void OnUpdate(GameTime gameTime)
    {
        if (!IsEnabled) return;
        
        var myTransform = Entity?.GetComponent<TransformComponent>();
        var myScore = Entity?.GetComponent<ScoreComponent>();
        
        if (myTransform == null || myScore == null) return;
        
        // Find all coins
        var world = Entity?.World;
        if (world == null) return;
        
        var coins = world.GetEntitiesWithComponent<CoinComponent>();
        var coinsToRemove = new List<Entity>();
        
        foreach (var coin in coins)
        {
            var coinTransform = coin.GetComponent<TransformComponent>();
            var coinComponent = coin.GetComponent<CoinComponent>();
            
            if (coinTransform == null || coinComponent == null) continue;
            
            // Check distance
            var distance = Vector2.Distance(myTransform.Position, coinTransform.Position);
            
            if (distance < CollectionRadius)
            {
                myScore.Current += coinComponent.Value;
                coinsToRemove.Add(coin);
            }
        }
        
        // Remove collected coins
        foreach (var coin in coinsToRemove)
        {
            world.DestroyEntity(coin);
        }
    }
}
```

---

## Step 4: Create the Game Scene

Now let's put it all together in a scene:

```csharp
using Brine2D.Core;
using Brine2D.ECS;
using Brine2D.Input;
using Brine2D.Rendering;
using Microsoft.Extensions.Logging;
using System.Numerics;

public class ECSGameScene : Scene
{
    private readonly IRenderer _renderer;
    private readonly IInputService _input;
    private readonly IGameContext _gameContext;
    private readonly IEntityWorld _world;
    
    private Entity? _player;
    
    public ECSGameScene(
        IRenderer renderer,
        IInputService input,
        IGameContext gameContext,
        IEntityWorld world,
        ILogger<ECSGameScene> logger
    ) : base(logger)
    {
        _renderer = renderer;
        _input = input;
        _gameContext = gameContext;
        _world = world;
    }
    
    protected override void OnInitialize()
    {
        Logger.LogInformation("Initializing ECS Game");
        
        // Create player
        _player = _world.CreateEntity("Player");
        _player.Tags.Add("Player");
        
        var playerTransform = _player.AddComponent<TransformComponent>();
        playerTransform.Position = new Vector2(400, 300);
        
        _player.AddComponent<SimplePlayerController>().MoveSpeed = 200f;
        _player.AddComponent<CoinCollectorComponent>();
        _player.AddComponent<ScoreComponent>();
        
        Logger.LogInformation("Player created");
        
        // Create coins in a grid
        for (int x = 0; x < 5; x++)
        {
            for (int y = 0; y < 4; y++)
            {
                var coin = _world.CreateEntity($"Coin_{x}_{y}");
                coin.Tags.Add("Coin");
                
                var coinTransform = coin.AddComponent<TransformComponent>();
                coinTransform.Position = new Vector2(
                    100 + x * 150,
                    100 + y * 120
                );
                
                var coinComponent = coin.AddComponent<CoinComponent>();
                coinComponent.Value = 10;
            }
        }
        
        Logger.LogInformation("Created 20 coins");
    }
    
    protected override void OnUpdate(GameTime gameTime)
    {
        // Update the ECS world (calls OnUpdate on all components)
        _world.Update(gameTime);
        
        // Check for quit
        if (_input.IsKeyPressed(Keys.Escape))
        {
            _gameContext.RequestExit();
        }
    }
    
    protected override void OnRender(GameTime gameTime)
    {
        _renderer.Clear(new Color(20, 20, 40));
        _renderer.BeginFrame();
        
        // Render player
        if (_player != null)
        {
            var transform = _player.GetComponent<TransformComponent>();
            if (transform != null)
            {
                _renderer.DrawCircle(
                    transform.Position.X,
                    transform.Position.Y,
                    16,
                    Color.Green
                );
            }
        }
        
        // Render coins
        var coins = _world.GetEntitiesWithComponent<CoinComponent>();
        foreach (var coin in coins)
        {
            var transform = coin.GetComponent<TransformComponent>();
            if (transform != null)
            {
                _renderer.DrawCircle(
                    transform.Position.X,
                    transform.Position.Y,
                    8,
                    Color.Yellow
                );
            }
        }
        
        // Draw score
        var score = _player?.GetComponent<ScoreComponent>();
        if (score != null)
        {
            _renderer.DrawText($"Score: {score.Current}", 10, 10, Color.White);
            _renderer.DrawText("WASD to move, ESC to quit", 10, 30, Color.White);
        }
        
        _renderer.EndFrame();
    }
}
```

---

## Step 5: Register ECS and Run

Update your `Program.cs`:

```csharp
using Brine2D.ECS;
using Brine2D.Hosting;
using Brine2D.Input.SDL;
using Brine2D.Rendering.SDL;

var builder = GameApplication.CreateBuilder(args);

// Configure rendering
builder.Services.AddSDL3Rendering(options =>
{
    options.WindowTitle = "ECS Game - Coin Collector";
    options.WindowWidth = 800;
    options.WindowHeight = 600;
    options.VSync = true;
});

// Add input
builder.Services.AddSDL3Input();

// Add ECS
builder.Services.AddObjectECS();

// Register the ECS scene
builder.Services.AddScene<ECSGameScene>();

var game = builder.Build();

// Run the ECS scene
await game.RunAsync<ECSGameScene>();
```

---

## Step 6: Run Your Game

```bash
dotnet run
```

**What you should see:**
- A green circle (player) in the center
- 20 yellow circles (coins) in a grid
- Score counter at top-left
- Player moves with WASD
- Coins disappear when collected
- Score increases by 10 per coin

Congratulations! You just built your first hybrid ECS game!

---

## Understanding What You Built

### Entity Creation

```csharp
var player = _world.CreateEntity("Player");
player.Tags.Add("Player");

var transform = player.AddComponent<TransformComponent>();
transform.Position = new Vector2(400, 300);

player.AddComponent<SimplePlayerController>();
```

**What happens:**
1. `CreateEntity()` - Creates a new entity object
2. `.Tags.Add()` - Tag for querying/identification
3. `.AddComponent<T>()` - Adds components to the entity
4. Components automatically update every frame

### Component Lifecycle

```csharp
public class MyComponent : Component
{
    protected internal override void OnAdded()
    {
        // Initialize when added
    }
    
    protected internal override void OnUpdate(GameTime gameTime)
    {
        // Update every frame
    }
    
    protected internal override void OnRemoved()
    {
        // Clean up when removed
    }
}
```

### Querying Entities

```csharp
// Get all entities with a specific component
var coins = _world.GetEntitiesWithComponent<CoinComponent>();

// Get entities with multiple components
var moving = _world.GetEntitiesWithComponents<TransformComponent, VelocityComponent>();

// Find entity by tag
var player = _world.GetEntitiesByTag("Player").FirstOrDefault();

// Find entity by name
var boss = _world.GetEntityByName("Boss");
```

---

## Using Prefabs (Reusable Templates)

For cleaner code, use prefabs:

```csharp
protected override void OnInitialize()
{
    // Create coin prefab
    var coinPrefab = new EntityPrefab("Coin");
    coinPrefab.Tags.Add("Collectible");
    
    coinPrefab.AddComponent<TransformComponent>();
    coinPrefab.AddComponent<CoinComponent>(c => c.Value = 10);
    
    // Register prefab
    var prefabLibrary = _gameContext.Services.GetService<PrefabLibrary>();
    prefabLibrary?.Register(coinPrefab);
    
    // Instantiate multiple coins from prefab
    for (int i = 0; i < 20; i++)
    {
        var position = new Vector2(
            Random.Shared.Next(100, 700),
            Random.Shared.Next(100, 500)
        );
        
        coinPrefab.Instantiate(_world, position);
    }
}
```

---

## Adding Systems for Performance

When you have many entities (50+), use systems:

```csharp
// 1. Register systems in Program.cs
builder.Services.ConfigureSystemPipelines(pipelines =>
{
    pipelines.AddSystem<PlayerControllerSystem>();
    pipelines.AddSystem<VelocitySystem>();
});

// 2. Inject and use in scene
public class ECSGameScene : Scene
{
    private readonly UpdatePipeline _updatePipeline;
    
    public ECSGameScene(
        UpdatePipeline updatePipeline,
        // ... other services
    ) : base(logger)
    {
        _updatePipeline = updatePipeline;
    }
    
    protected override void OnUpdate(GameTime gameTime)
    {
        // Execute all systems in order (optimized!)
        _updatePipeline.Execute(gameTime);
        
        // Then update entity components
        _world.Update(gameTime);
    }
}
```

See the [Systems Guide](systems.md) for more details.

---

## Troubleshooting

### "Component logic isn't running"

**Problem:** Component's `OnUpdate()` not being called.

**Solution:** Make sure the component is enabled:

```csharp
component.IsEnabled = true;
```

And that the world is being updated:

```csharp
protected override void OnUpdate(GameTime gameTime)
{
    _world.Update(gameTime); // ← Don't forget this!
}
```

---

### "Can't access other components"

**Problem:** `Entity` property is null.

**Solution:** Only access `Entity` after `OnAdded()` is called:

```csharp
public class MyComponent : Component
{
    protected internal override void OnAdded()
    {
        // ✅ Safe - Entity is set
        var other = Entity?.GetComponent<OtherComponent>();
    }
    
    // ❌ Unsafe - Entity might be null here
    public MyComponent()
    {
        var other = Entity?.GetComponent<OtherComponent>();
    }
}
```

---

### "NullReferenceException when querying"

**Problem:** Component not found on entity.

**Solution:** Always null-check:

```csharp
var transform = entity.GetComponent<TransformComponent>();
if (transform != null)
{
    // ✅ Safe to use
}
```

---

## What You Learned

✅ **Components** - Classes that inherit from `Component` and can contain logic  
✅ **Entities** - Objects that hold components  
✅ **Component Lifecycle** - `OnAdded()`, `OnUpdate()`, `OnRemoved()`  
✅ **Queries** - Finding entities by component or tag  
✅ **Prefabs** - Reusable entity templates  
✅ **Systems** - Optional performance optimization  

---

## Next Steps

Ready to dive deeper into ECS?

<div class="grid cards" markdown>

-   **Components Guide**

    ---

    Learn component design patterns and best practices

    [:octicons-arrow-right-24: Components Guide](components.md)

-   **Systems Guide**

    ---

    Write efficient systems for performance-critical logic

    [:octicons-arrow-right-24: Systems Guide](systems.md)

-   **Entities Guide**

    ---

    Master entity creation and management

    [:octicons-arrow-right-24: Entities Guide](entities.md)

-   **ECS Concepts**

    ---

    Deep dive into ECS architecture

    [:octicons-arrow-right-24: ECS Concepts](../../concepts/entity-component-system.md)

</div>

---

## Challenge: Expand the Game

Try adding these features to practice ECS:

1. **Enemies** - Entities that chase the player (use `FollowComponent`)
2. **Shooting** - Spawn bullet entities with `LifetimeComponent`
3. **Health** - Create `HealthComponent` with damage/death logic
4. **Power-ups** - Special coins that boost speed temporarily
5. **Particles** - Spawn visual effects on coin collection

See the [ECS Tutorial](../../tutorials/ecs-game.md) for complete examples!

---

**You're now ready to build games with Brine2D's hybrid ECS!** Use component logic for simplicity, systems for performance. Choose what fits your needs!