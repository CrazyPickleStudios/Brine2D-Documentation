---
title: Quick Start
description: Get your first Brine2D game running in 5 minutes
---

# Quick Start Guide

Get your first Brine2D game running in less than 5 minutes. If you're familiar with ASP.NET Core, you'll feel right at home.

## Prerequisites

Before you begin, make sure you have:

- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0) or later
- A code editor (Visual Studio 2022, VS Code, or Rider recommended)
- Basic C# knowledge

## Step 1: Create Your Game Project

Create a new console application:

```bash
dotnet new console -n MyFirstGame
cd MyFirstGame
```

This creates a basic .NET 10 console application with a `Program.cs` file.

## Step 2: Add Brine2D Package

Add the Brine2D.Desktop NuGet package, which includes everything you need:

```bash
dotnet add package Brine2D.Desktop
```

!!! info "What's Included?"
    `Brine2D.Desktop` is a meta-package that includes:
    
    - **Brine2D.Core** - Core abstractions and types
    - **Brine2D.Engine** - Game loop, scene management, and transitions
    - **Brine2D.Hosting** - ASP.NET-style hosting and DI
    - **Brine2D.ECS** - Entity Component System
    - **Brine2D.Rendering.SDL** - SDL3-based rendering
    - **Brine2D.Input.SDL** - SDL3-based input handling
    - **Brine2D.Audio.SDL** - SDL3-based audio system
    - **Brine2D.UI** - Complete UI component library
    
    Everything needed for a complete desktop game!

## Step 3: Write Your First Game

Replace the contents of `Program.cs` with this code:

```csharp
using Brine2D.Core;
using Brine2D.Hosting;
using Brine2D.Input;
using Brine2D.Input.SDL;
using Brine2D.Rendering;
using Brine2D.Rendering.SDL;
using Microsoft.Extensions.Logging;

// Create builder (like ASP.NET's WebApplication.CreateBuilder)
var builder = GameApplication.CreateBuilder(args);

// Configure services
builder.Services.AddSDL3Rendering(options =>
{
    options.WindowTitle = "My First Game";
    options.WindowWidth = 1280;
    options.WindowHeight = 720;
});

builder.Services.AddSDL3Input();
builder.Services.AddScene<GameScene>();

// Build and run
var game = builder.Build();

await game.RunAsync<GameScene>();

// Define your scene (like an ASP.NET controller)
public class GameScene : Scene
{
    private readonly IGameContext _gameContext;
    private readonly IInputService _input;
    private readonly IRenderer _renderer;

    public GameScene(
        IRenderer renderer,
        IInputService input,
        IGameContext gameContext,
        ILogger<GameScene> logger
    ) : base(logger)
    {
        _renderer = renderer;
        _input = input;
        _gameContext = gameContext;
    }

    protected override void OnRender(GameTime gameTime)
    {
        // Frame management happens automatically!
        _renderer.DrawText("Hello, Brine2D!", 100, 100, Color.White);
    }

    protected override void OnUpdate(GameTime gameTime)
    {
        if (_input.IsKeyPressed(Keys.Escape))
        {
            _gameContext.RequestExit();
        }
    }
}
```

!!! tip Automatic Frame Management"
    Notice we don't call `Clear()`, `BeginFrame()`, or `EndFrame()` - the framework handles this automatically via lifecycle hooks! Just focus on your game logic.

## Step 4: Run Your Game

Build and run your game:

```bash
dotnet run
```

You should see a window with "Hello, Brine2D!" displayed. Press **Escape** to exit.

**Congratulations!** You've created your first Brine2D game!

---

## Understanding What You Just Built

Let's break down the key concepts:

### The Builder Pattern

```csharp
var builder = GameApplication.CreateBuilder(args);
```

Just like ASP.NET's `WebApplication.CreateBuilder()`, this sets up your game with sensible defaults. It:

- Configures dependency injection
- Sets up logging
- Loads configuration from `gamesettings.json` (if present)
- Registers core engine services
- **NEW:** Configures automatic system execution via lifecycle hooks

### Service Registration

```csharp
builder.Services.AddSDL3Rendering(options => { ... });
builder.Services.AddSDL3Input();
builder.Services.AddScene<GameScene>();
```

This should look familiar if you've used ASP.NET:

- `AddSDL3Rendering()` - Registers the rendering system (like `AddControllers()`)
- `AddSDL3Input()` - Registers input handling
- `AddScene<T>()` - Registers your scene (like registering a controller)

### Scenes Are Like Controllers

```csharp
public class GameScene : Scene
{
    public GameScene(IRenderer renderer, IInputService input, ILogger<GameScene> logger) 
        : base(logger)
    {
        // Constructor injection!
    }
}
```

Scenes organize your game logic just like controllers organize your web endpoints. They:

- Get dependencies injected via constructor
- Have lifecycle methods (`OnInitialize`, `OnLoad`, `OnUpdate`, `OnRender`, `OnUnload`)
- Can be swapped at runtime with scene transitions
- **NEW:** Automatically execute systems and manage rendering

### Lifecycle Methods

Your scene has these key methods:

- **`OnUpdate(GameTime)`** - Called every frame for game logic
- **`OnRender(GameTime)`** - Called every frame for drawing
- **`OnLoadAsync()`** - Called once when the scene loads (for async loading)
- **`OnUnloadAsync()`** - Called when the scene unloads

Frame management (`Clear`, `BeginFrame`, `EndFrame`) happens automatically unless you opt-out!

---

## Next Steps

Now that you have a working game, here's what to explore next:

### Add Some Movement

Modify your `GameScene` to move text with arrow keys:

```csharp
public class GameScene : Scene
{
    private readonly IGameContext _gameContext;
    private readonly IInputService _input;
    private readonly IRenderer _renderer;
    private readonly float _speed = 200f; // pixels per second

    private float _x = 100;
    private float _y = 100;

    protected override void OnRender(GameTime gameTime)
    {
        // Just draw - frame management is automatic!
        _renderer.DrawText("Hello, Brine2D!", _x, _y, Color.White);
    }

    // ... constructor ...

    protected override void OnUpdate(GameTime gameTime)
    {
        var deltaTime = (float)gameTime.DeltaTime;

        // Move with arrow keys
        if (_input.IsKeyDown(Keys.Left))
            _x -= _speed * deltaTime;

        if (_input.IsKeyDown(Keys.Right))
            _x += _speed * deltaTime;

        if (_input.IsKeyDown(Keys.Up))
            _y -= _speed * deltaTime;

        if (_input.IsKeyDown(Keys.Down))
            _y += _speed * deltaTime;

        if (_input.IsKeyPressed(Keys.Escape))
            _gameContext.RequestExit();
    }
}
```

Run it again and use the arrow keys to move the text!

### Add Shapes and Lines

Draw simple shapes:

```csharp
protected override void OnRender(GameTime gameTime)
{
    // Draw a white rectangle
    _renderer.DrawRectangleFilled(200, 200, 100, 100, Color.White);
    
    // Draw a circle
    _renderer.DrawCircleFilled(400, 300, 50, Color.Red);
    
    // Draw a line
    _renderer.DrawLine(100, 100, 300, 200, Color.Yellow, 2f);

    _renderer.DrawText("Hello, Brine2D!", _x, _y, Color.White);
}
```

### Add Scene Transitions

Create multiple scenes and transition between them:

```csharp
using Brine2D.Engine;
using Brine2D.Engine.Transitions;

public class MenuScene : Scene
{
    private readonly ISceneManager _sceneManager;
    
    protected override async void OnUpdate(GameTime gameTime)
    {
        if (_input.IsKeyPressed(Keys.Enter))
        {
            // Fade to game scene
            await _sceneManager.LoadSceneAsync<GameScene>(
                new FadeTransition(duration: 0.5f, color: Color.Black)
            );
        }
    }
}
```

### Optional: Add Configuration

Create a `gamesettings.json` file in your project:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Brine2D": "Debug"
    }
  },
  "Rendering": {
    "WindowTitle": "My First Game",
    "WindowWidth": 1280,
    "WindowHeight": 720,
    "VSync": true,
    "Fullscreen": false,
    "Backend": "GPU",
    "PreferredGPUDriver": "Vulkan"
  }
}
```

Then simplify your rendering configuration:

```csharp
builder.Services.AddSDL3Rendering(options =>
{
    builder.Configuration.GetSection("Rendering").Bind(options);
});
```

Make sure to set the file to copy to the output directory in your `.csproj`:

```xml
<ItemGroup>
  <None Update="gamesettings.json">
    <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
  </None>
</ItemGroup>
```

---

## Common Issues

### SDL3 Native Library Not Found

If you get an error about SDL3 libraries not being found, make sure:

1. The SDL3-CS NuGet package is properly restored (`dotnet restore`)
2. You're running on a supported platform (Windows, macOS, Linux)
3. Try cleaning and rebuilding: `dotnet clean && dotnet build`

### Window Doesn't Appear

If the window doesn't show up:

1. Check that `RunAsync<GameScene>()` is being called
2. Make sure you're calling `await` on `RunAsync`
3. Check the console for error messages

### Text Doesn't Render

The text rendering uses an embedded font by default. If text doesn't appear:

1. Check that SDL3_ttf is loaded (should be automatic)
2. Try using a custom font (see the Text Rendering guide)
3. Check console logs for font loading errors

---

## Development from Source

If you want to contribute to Brine2D or use the latest development version, you can reference the projects directly instead:

```bash
git clone https://github.com/CrazyPickleStudios/Brine2D.git
cd Brine2D
dotnet build
```

Then in your game project, replace the NuGet package with project references:

```bash
dotnet remove package Brine2D.Desktop
dotnet add reference ../Brine2D/src/Brine2D.Core/Brine2D.Core.csproj
dotnet add reference ../Brine2D/src/Brine2D.Engine/Brine2D.Engine.csproj
dotnet add reference ../Brine2D/src/Brine2D.Hosting/Brine2D.Hosting.csproj
dotnet add reference ../Brine2D/src/Brine2D.Rendering/Brine2D.Rendering.csproj
dotnet add reference ../Brine2D/src/Brine2D.Rendering.SDL/Brine2D.Rendering.SDL.csproj
dotnet add reference ../Brine2D/src/Brine2D.Input/Brine2D.Input.csproj
dotnet add reference ../Brine2D/src/Brine2D.Input.SDL/Brine2D.Input.SDL.csproj
dotnet add reference ../Brine2D/src/Brine2D.ECS/Brine2D.ECS.csproj
```

---

## Learn More

<div class="grid cards" markdown>

-   :material-school: **Core Concepts**

    ---

    Deep dive into Brine2D's architecture

    [:octicons-arrow-right-24: Read Concepts](../concepts/index.md)

-   :material-image: **Sprites & Textures**

    ---

    Learn to load and render images

    [:octicons-arrow-right-24: Sprite Guide](../guides/rendering/sprites.md)

-   :material-swap-horizontal: **Scene Transitions**

    ---

    Smooth transitions between scenes

    [:octicons-arrow-right-24: Transitions Guide](../guides/scenes/transitions.md)

-   :material-controller: **Input Handling**

    ---

    Complete guide to keyboard, mouse, and gamepad

    [:octicons-arrow-right-24: Input Guide](../guides/input/keyboard.md)

</div>

---

## What You've Learned

✅ How to set up a Brine2D project with NuGet  
✅ The builder pattern and service registration  
✅ Creating scenes with dependency injection  
✅ The basic game loop (update and render)  
✅ Handling input with `IInputService`  
✅ Drawing shapes, lines, and text  
✅ **NEW:** Automatic frame management via lifecycle hooks  
✅ **NEW:** Scene transitions  

You're ready to build real games! Check out the [FeatureDemos](../samples/index.md) to see advanced examples, or dive into the [guides](../guides/index.md) to learn about sprites, animations, collision detection, ECS, and more.