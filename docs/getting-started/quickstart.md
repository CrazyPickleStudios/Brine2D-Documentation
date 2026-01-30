---
title: Quick Start
description: Create your first Brine2D game in 5 minutes - from zero to a running window
---

# Quick Start

Get a Brine2D game running in 5 minutes. This guide takes you from zero to a window with a moving sprite.

## Prerequisites

Before starting:

- ✅ [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0) installed
- ✅ IDE ready (Visual Studio 2022, VS Code, or Rider)
- ✅ 5 minutes

**New to Brine2D?** Perfect! This guide assumes no prior knowledge.

**Already have a project?** Skip to [Add to Existing Project](#add-to-existing-project).

---

## Step 1: Create Project

Open your terminal and create a new console application:

~~~sh
dotnet new console -n MyFirstGame
cd MyFirstGame
~~~

**What this does:**
- Creates a new .NET 10 console application
- Names it `MyFirstGame`
- Changes to the project directory

---

## Step 2: Install Brine2D

Add the Brine2D packages:

~~~sh
dotnet add package Brine2D --version 0.9.0-beta
dotnet add package Brine2D.SDL --version 0.9.0-beta
~~~

**What this does:**
- Installs **Brine2D** (core engine)
- Installs **Brine2D.SDL** (rendering, input, audio)

**Verify installation:**

~~~sh
dotnet list package
~~~

You should see:

~~~
Top-level Package                Requested  Resolved
> Brine2D                        0.9.0-beta 0.9.0-beta
> Brine2D.SDL                    0.9.0-beta 0.9.0-beta
~~~

---

## Step 3: Create Your First Scene

Replace the contents of `Program.cs` with:

~~~csharp
using Brine2D.Core;
using Brine2D.Engine;
using Brine2D.Hosting;
using Brine2D.Input;
using Brine2D.SDL;
using System.Numerics;

// Create application
var builder = GameApplication.CreateBuilder(args);

// Add Brine2D with sensible defaults
builder.Services.AddBrine2D(options =>
{
    options.WindowTitle = "My First Game";
    options.WindowWidth = 800;
    options.WindowHeight = 600;
});

// Register scene
builder.Services.AddScene<GameScene>();

// Build and run
var game = builder.Build();
await game.RunAsync<GameScene>();

// Game scene
public class GameScene : Scene
{
    private readonly IInputContext _input;
    
    private Vector2 _playerPosition = new(400, 300);
    private readonly float _speed = 200f;

    // ✅ Clean! Only inject YOUR dependencies
    public GameScene(IInputContext input)
    {
        _input = input;
    }

    protected override void OnUpdate(GameTime gameTime)
    {
        // Exit on Escape
        if (_input.IsKeyPressed(Key.Escape))
        {
            // Request exit
            return;
        }

        // Move with WASD
        var deltaTime = (float)gameTime.DeltaTime;
        
        if (_input.IsKeyDown(Key.W)) _playerPosition.Y -= _speed * deltaTime;
        if (_input.IsKeyDown(Key.S)) _playerPosition.Y += _speed * deltaTime;
        if (_input.IsKeyDown(Key.A)) _playerPosition.X -= _speed * deltaTime;
        if (_input.IsKeyDown(Key.D)) _playerPosition.X += _speed * deltaTime;
    }

    protected override void OnRender(GameTime gameTime)
    {
        // Renderer available from base class!
        Renderer.ClearColor = Color.FromArgb(20, 20, 30);
        
        // Draw player (simple rectangle)
        Renderer.DrawRectangleFilled(
            _playerPosition.X - 25,
            _playerPosition.Y - 25,
            50, 50,
            Color.Blue);
        
        // Draw instructions
        Renderer.DrawText("WASD: Move | ESC: Quit", 10, 10, Color.White);
    }
}
~~~

**✨ Notice the new pattern:**
- Constructor only has **YOUR dependencies** (`IInputContext`)
- `Logger`, `World`, `Renderer` available automatically in lifecycle methods
- No more passing framework services through constructor!

---

## Step 4: Run Your Game

Start your game:

~~~sh
dotnet run
~~~

**You should see:**
- A window titled "My First Game"
- A blue square in the center
- Instructions at the top
- The square moves with WASD keys
- Escape quits the game

**Success!** You've created your first Brine2D game.

---

## Understanding the Code

Let's break down what each part does:

### Application Setup

~~~csharp
var builder = GameApplication.CreateBuilder(args);

builder.Services.AddBrine2D(options =>
{
    options.WindowTitle = "My First Game";
    options.WindowWidth = 800;
    options.WindowHeight = 600;
});

builder.Services.AddScene<GameScene>();

var game = builder.Build();
await game.RunAsync<GameScene>();
~~~

**What this does:**
1. Creates a game application builder (like ASP.NET Core)
2. Configures Brine2D with sensible defaults (rendering, input, audio, ECS)
3. Registers your game scene
4. Builds and runs the game

**Pattern:** This is dependency injection - Brine2D uses ASP.NET Core patterns.

---

### Scene Class (NEW Pattern!)

~~~csharp
public class GameScene : Scene
{
    private readonly IInputContext _input;
    
    // ✅ Only inject YOUR dependencies!
    public GameScene(IInputContext input)
    {
        _input = input;
    }
    
    protected override void OnRender(GameTime gameTime)
    {
        // ✅ Framework properties available automatically!
        Logger.LogDebug("Rendering frame");
        var player = World.CreateEntity("Player");
        Renderer.DrawText("Hello", 10, 10, Color.White);
    }
}
~~~

**What's different:**
- ✅ **Constructor**: Only YOUR services (`IInputContext`, `IAudioService`, etc.)
- ✅ **Framework properties**: `Logger`, `World`, `Renderer` set automatically by framework
- ✅ **Clean**: No more `ILogger<T>`, `IEntityWorld`, `IRenderer` in constructor

**Pattern:** ASP.NET-style property injection for framework concerns.

---

### Framework Properties

These are **available in all lifecycle methods** (after constructor):

| Property | Type | Purpose |
|----------|------|---------|
| `Logger` | `ILogger` | Logging for this scene (typed automatically) |
| `World` | `IEntityWorld` | Entity world (scoped per scene, auto-cleanup!) |
| `Renderer` | `IRenderer` | Drawing + render state (clear color, camera, etc.) |

**You never inject these** - they're set by SceneManager before any lifecycle methods run.

---

### Update Loop

~~~csharp
protected override void OnUpdate(GameTime gameTime)
{
    if (_input.IsKeyPressed(Key.Escape))
    {
        // Exit game
        return;
    }

    var deltaTime = (float)gameTime.DeltaTime;
    
    if (_input.IsKeyDown(Key.W)) _playerPosition.Y -= _speed * deltaTime;
    if (_input.IsKeyDown(Key.S)) _playerPosition.Y += _speed * deltaTime;
    if (_input.IsKeyDown(Key.A)) _playerPosition.X -= _speed * deltaTime;
    if (_input.IsKeyDown(Key.D)) _playerPosition.X += _speed * deltaTime;
}
~~~

**What this does:**
- Called every frame (~60 times per second)
- Handles input (keyboard, mouse, gamepad)
- Updates game state (position, physics, AI)
- Uses `deltaTime` for frame-rate independent movement

**Pattern:** Game loop - update game state before rendering.

---

### Render Loop

~~~csharp
protected override void OnRender(GameTime gameTime)
{
    // Use Renderer property (set by framework)
    Renderer.ClearColor = Color.FromArgb(20, 20, 30);
    
    Renderer.DrawRectangleFilled(
        _playerPosition.X - 25,
        _playerPosition.Y - 25,
        50, 50,
        Color.Blue);
    
    Renderer.DrawText("WASD: Move | ESC: Quit", 10, 10, Color.White);
}
~~~

**What this does:**
- Called every frame after update
- Clears the screen (via `ClearColor`)
- Draws game objects (sprites, shapes, text)
- Presents the frame to the screen

**Pattern:** Immediate mode rendering - draw what you see each frame.

---

## Game Loop Diagram

~~~mermaid
sequenceDiagram
    participant Game as Game Loop
    participant Scene as GameScene
    participant Input as IInputContext
    participant Renderer as IRenderer
    
    loop Every Frame (~60 FPS)
        Game->>Input: Poll input events
        Game->>Scene: OnUpdate(gameTime)
        Scene->>Input: IsKeyDown(Key.W)?
        Input-->>Scene: true/false
        Scene->>Scene: Update position
        
        Game->>Scene: OnRender(gameTime)
        Scene->>Renderer: Set ClearColor
        Scene->>Renderer: DrawRectangleFilled(...)
        Scene->>Renderer: DrawText(...)
        Renderer->>Renderer: Present frame
    end
~~~

**Key concepts:**
- **Update** runs first (game logic)
- **Render** runs second (drawing)
- Loop runs ~60 times per second
- `deltaTime` ensures consistent speed regardless of FPS

---

## Scoped EntityWorld (NEW!)

**Each scene gets its own isolated `EntityWorld`** - this is huge!

~~~csharp
protected override Task OnLoadAsync(CancellationToken ct)
{
    // World is already available (scoped per scene!)
    var player = World.CreateEntity("Player");
    player.AddComponent<TransformComponent>();
    
    Logger.LogInformation("Created {Count} entities", World.Entities.Count);
    
    return Task.CompletedTask;
}

protected override Task OnUnloadAsync(CancellationToken ct)
{
    // ✅ No cleanup needed - World disposed automatically!
    // All entities destroyed when scene ends
    
    return Task.CompletedTask;
}
~~~

**Benefits:**
- ✅ **Automatic cleanup** - entities destroyed when scene unloads
- ✅ **No leaks** - impossible to forget cleanup
- ✅ **Isolation** - scenes can't interfere with each other
- ✅ **Fresh slate** - each scene starts with empty world

**This matches ASP.NET's request scope pattern!**

---

## Next Steps

### Add a Sprite

Replace the rectangle with a texture:

~~~csharp
public class GameScene : Scene
{
    private ITexture? _playerTexture;

    protected override async Task OnLoadAsync(CancellationToken ct)
    {
        // Renderer available here!
        _playerTexture = await LoadTextureAsync("assets/player.png", ct);
    }

    protected override void OnRender(GameTime gameTime)
    {
        if (_playerTexture != null)
        {
            Renderer.DrawTexture(
                _playerTexture,
                _playerPosition.X - 25,
                _playerPosition.Y - 25,
                50, 50);
        }
    }
}
~~~

**Don't forget:** Create `assets/` folder and add `player.png`.

---

### Add Sound Effects

~~~csharp
using Brine2D.Audio;

public class GameScene : Scene
{
    private readonly IInputContext _input;
    private readonly IAudioService _audio;
    private ISoundEffect? _jumpSound;

    // ✅ Inject YOUR services
    public GameScene(IInputContext input, IAudioService audio)
    {
        _input = input;
        _audio = audio;
    }

    protected override async Task OnLoadAsync(CancellationToken ct)
    {
        _jumpSound = await _audio.LoadSoundAsync("assets/jump.wav", ct);
    }

    protected override void OnUpdate(GameTime gameTime)
    {
        if (_input.IsKeyPressed(Key.Space))
        {
            _audio.PlaySound(_jumpSound);
        }
    }
}
~~~

---

### Add Multiple Scenes

Create a menu scene:

~~~csharp
public class MenuScene : Scene
{
    private readonly IInputContext _input;
    private readonly ISceneManager _sceneManager;

    // ✅ Only YOUR dependencies
    public MenuScene(IInputContext input, ISceneManager sceneManager)
    {
        _input = input;
        _sceneManager = sceneManager;
    }

    protected override void OnUpdate(GameTime gameTime)
    {
        if (_input.IsKeyPressed(Key.Enter))
        {
            await _sceneManager.LoadSceneAsync<GameScene>();
        }
    }

    protected override void OnRender(GameTime gameTime)
    {
        // Renderer available!
        Renderer.ClearColor = Color.Black;
        Renderer.DrawText("Press ENTER to Start", 300, 280, Color.White);
    }
}
~~~

Register both scenes:

~~~csharp
builder.Services.AddScene<MenuScene>();
builder.Services.AddScene<GameScene>();

var game = builder.Build();
await game.RunAsync<MenuScene>(); // Start with menu
~~~

---

## Add to Existing Project

Already have a .NET 10 project? Add Brine2D to it:

~~~sh
cd YourExistingProject

# Add packages
dotnet add package Brine2D --version 0.9.0-beta
dotnet add package Brine2D.SDL --version 0.9.0-beta
~~~

**Update your `Program.cs`:**

~~~csharp
using Brine2D.Hosting;
using Brine2D.SDL;

var builder = GameApplication.CreateBuilder(args);

builder.Services.AddBrine2D(options =>
{
    options.WindowTitle = "My Game";
    options.WindowWidth = 800;
    options.WindowHeight = 600;
});

builder.Services.AddScene<GameScene>();

var game = builder.Build();
await game.RunAsync<GameScene>();
~~~

**Create your scene** in a separate file (`GameScene.cs`).

---

## Troubleshooting

### Problem: NullReferenceException on Renderer/Logger/World

**Symptom:**

~~~
NullReferenceException: Object reference not set to an instance of an object
at GameScene..ctor()
~~~

**Cause:** Trying to use framework properties in constructor.

**Solution:**

~~~csharp
// ❌ Wrong - framework properties not set yet!
public GameScene()
{
    Logger.LogInfo("Created"); // NullReferenceException!
    var player = World.CreateEntity("Player"); // NullReferenceException!
}

// ✅ Correct - use in lifecycle methods
protected override Task OnInitializeAsync(CancellationToken ct)
{
    Logger.LogInfo("Initializing"); // Works!
    var player = World.CreateEntity("Player"); // Works!
    return Task.CompletedTask;
}
~~~

---

### Problem: Window doesn't appear

**Symptom:** Console shows but no window opens.

**Solutions:**

1. **Check Brine2D registration:**
   ~~~csharp
   // ✅ Correct - includes everything
   builder.Services.AddBrine2D(options => 
   {
       options.WindowTitle = "My Game";
       options.WindowWidth = 800;
       options.WindowHeight = 600;
   });
   ~~~

2. **Verify scene is registered:**
   ~~~csharp
   builder.Services.AddScene<GameScene>();
   ~~~

3. **Check scene is loaded:**
   ~~~csharp
   await game.RunAsync<GameScene>();
   ~~~

---

### Problem: Nothing renders

**Symptom:** Window opens but is black/empty.

**Solutions:**

1. **Check OnRender is called:**
   ~~~csharp
   protected override void OnRender(GameTime gameTime)
   {
       Logger.LogInformation("Rendering!"); // Add debug log
       Renderer.ClearColor = Color.Red; // Should show red
   }
   ~~~

2. **Check coordinates are visible:**
   ~~~csharp
   // Draw at 0,0 to test
   Renderer.DrawRectangleFilled(0, 0, 100, 100, Color.Red);
   ~~~

---

### Problem: Input doesn't work

**Symptom:** Keys don't respond.

**Solutions:**

1. **Verify input is injected:**
   ~~~csharp
   public GameScene(IInputContext input)
   {
       _input = input; // Don't forget to store it!
   }
   ~~~

2. **Test in OnUpdate, not OnRender:**
   ~~~csharp
   // ✅ Correct
   protected override void OnUpdate(GameTime gameTime)
   {
       if (_input.IsKeyDown(Key.W)) { ... }
   }
   
   // ❌ Wrong
   protected override void OnRender(GameTime gameTime)
   {
       if (_input.IsKeyDown(Key.W)) { ... } // Won't work!
   }
   ~~~

---

### Problem: Movement is too fast/slow

**Symptom:** Player zooms around or moves very slowly.

**Solution:** Always use `deltaTime`:

~~~csharp
// ❌ Wrong - speed depends on FPS
if (_input.IsKeyDown(Key.W))
{
    _playerPosition.Y -= _speed; // Too fast at 60 FPS!
}

// ✅ Correct - consistent speed
if (_input.IsKeyDown(Key.W))
{
    _playerPosition.Y -= _speed * deltaTime; // Frame-rate independent
}
~~~

**Why?**
- Update runs ~60 times per second
- Without `deltaTime`, movement depends on FPS
- With `deltaTime`, movement is consistent (pixels per second)

---

### Problem: Package not found

**Symptom:**

~~~
error NU1101: Unable to find package Brine2D
~~~

**Solutions:**

1. **Check NuGet source:**
   ~~~sh
   dotnet nuget list source
   ~~~
   
   Should include `nuget.org`:
   ~~~
   https://api.nuget.org/v3/index.json
   ~~~

2. **Clear cache and restore:**
   ~~~sh
   dotnet nuget locals all --clear
   dotnet restore
   ~~~

3. **Verify package name (no typos):**
   ~~~sh
   # ❌ Wrong
   dotnet add package Brine2D-Engine
   
   # ✅ Correct
   dotnet add package Brine2D
   ~~~

---

## Best Practices

### ✅ DO

1. **Only inject YOUR dependencies in constructor**
   ~~~csharp
   public GameScene(IInputContext input, IAudioService audio) { }
   ~~~

2. **Use framework properties in lifecycle methods**
   ~~~csharp
   protected override Task OnInitializeAsync(CancellationToken ct)
   {
       Logger.LogInfo("Scene starting");
       var player = World.CreateEntity("Player");
       Renderer.ClearColor = Color.Navy;
   }
   ~~~

3. **Always use deltaTime for movement**
   ~~~csharp
   _position += _velocity * (float)gameTime.DeltaTime;
   ~~~

4. **Use OnLoadAsync for loading assets**
   ~~~csharp
   protected override async Task OnLoadAsync(CancellationToken ct)
   {
       _texture = await LoadTextureAsync("player.png", ct);
   }
   ~~~

5. **Let World cleanup happen automatically**
   ~~~csharp
   protected override Task OnUnloadAsync(CancellationToken ct)
   {
       // ✅ No cleanup needed - automatic!
       return Task.CompletedTask;
   }
   ~~~

---

### ❌ DON'T

1. **Don't access framework properties in constructor**
   ~~~csharp
   // ❌ Wrong - Logger/World/Renderer are null!
   public GameScene()
   {
       Logger.LogInfo("Created"); // NullReferenceException!
   }
   ~~~

2. **Don't inject Logger/World/Renderer**
   ~~~csharp
   // ❌ Wrong - framework provides these!
   public GameScene(ILogger<GameScene> logger, IEntityWorld world)
   {
       // These are set automatically - don't inject them!
   }
   
   // ✅ Correct - parameterless or YOUR services only
   public GameScene() { }
   public GameScene(IInputContext input) { }
   ~~~

3. **Don't manually cleanup World**
   ~~~csharp
   // ❌ Wrong - automatic!
   protected override Task OnUnloadAsync(CancellationToken ct)
   {
       World.Clear(); // Not needed!
       foreach (var entity in World.Entities)
           World.DestroyEntity(entity); // Not needed!
   }
   ~~~

4. **Don't poll input in OnRender**
   ~~~csharp
   // ❌ Wrong
   protected override void OnRender(GameTime gameTime)
   {
       if (_input.IsKeyDown(Key.W)) { ... } // Input in update only!
   }
   ~~~

5. **Don't load assets in OnUpdate**
   ~~~csharp
   // ❌ Wrong - causes lag every frame!
   protected override void OnUpdate(GameTime gameTime)
   {
       var texture = await LoadTextureAsync(...); // NO!
   }
   ~~~

---

## Summary

**What you learned:**

| Concept | Description |
|---------|-------------|
| **GameApplication** | Entry point, similar to ASP.NET Core |
| **Scene** | Container for game logic (update + render) |
| **Property Injection** | Framework properties (Logger, World, Renderer) set automatically |
| **Scoped World** | Each scene has isolated EntityWorld - automatic cleanup! |
| **Dependency Injection** | YOUR services injected via constructor |
| **Game Loop** | Update (logic) → Render (drawing) |
| **deltaTime** | Frame-rate independent movement |

**Key patterns:**

~~~csharp
// 1. Setup
var builder = GameApplication.CreateBuilder(args);
builder.Services.AddBrine2D(options =>
{
    options.WindowTitle = "My Game";
    options.WindowWidth = 1280;
    options.WindowHeight = 720;
});
builder.Services.AddScene<GameScene>();

// 2. Scene (NEW pattern!)
public class GameScene : Scene
{
    // ✅ Only YOUR dependencies
    public GameScene(IInputContext input) { }
    
    // ✅ Framework properties available in lifecycle methods
    protected override void OnUpdate(GameTime gameTime)
    {
        Logger.LogDebug("Updating");
        var player = World.GetEntityByName("Player");
    }
    
    protected override void OnRender(GameTime gameTime)
    {
        Renderer.DrawText("Hello", 10, 10, Color.White);
    }
}

// 3. Run
await game.RunAsync<GameScene>();
~~~

---

## Next Steps

Now that you have a working game, explore more features:

- **[Scenes Concept](../concepts/scenes.md)** - Deep dive into property injection and scoped World
- **[Your First Game](first-game.md)** - Build a complete game with sprites, audio, and collision
- **[Project Structure](project-structure.md)** - Organize your code
- **[Configuration](configuration.md)** - Configure game settings
- **[Input Guide](../guides/input/keyboard.md)** - Master keyboard, mouse, and gamepad input
- **[Rendering Guide](../guides/rendering/sprites.md)** - Work with sprites and textures
- **[ECS Guide](../guides/ecs/getting-started.md)** - Use the Entity Component System

---

## Quick Reference

~~~csharp
// Minimal Program.cs
using Brine2D.Hosting;
using Brine2D.SDL;

var builder = GameApplication.CreateBuilder(args);

builder.Services.AddBrine2D(options =>
{
    options.WindowTitle = "My Game";
    options.WindowWidth = 800;
    options.WindowHeight = 600;
});

builder.Services.AddScene<GameScene>();

var game = builder.Build();
await game.RunAsync<GameScene>();
~~~

~~~csharp
// Minimal Scene (NEW pattern!)
using Brine2D.Core;
using Brine2D.Engine;
using Brine2D.Input;

public class GameScene : Scene
{
    private readonly IInputContext _input;

    // ✅ Only YOUR dependencies
    public GameScene(IInputContext input)
    {
        _input = input;
    }

    protected override void OnUpdate(GameTime gameTime)
    {
        if (_input.IsKeyPressed(Key.Escape))
        {
            // Exit
        }
    }

    protected override void OnRender(GameTime gameTime)
    {
        // ✅ Framework properties available!
        Renderer.ClearColor = Color.Black;
        Renderer.DrawText("Hello, Brine2D!", 10, 10, Color.White);
        
        Logger.LogDebug("Rendered frame");
    }
}
~~~

---

Ready to build your first complete game? Head to [Your First Game](first-game.md)!