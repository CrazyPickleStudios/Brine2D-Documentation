---
title: Home
---

# Brine2D Game Engine

## Modern 2D game development with .NET elegance

Brine2D is a modern .NET 10 engine built on SDL3, inspired by the architecture and developer experience of ASP.NET. If you've built ASP.NET Core applications, the development model will feel immediately familiar.

<div class="grid cards" markdown>

-   :rocket: **Get Started in Minutes**

    ---

    Familiar patterns mean minimal learning curve for .NET developers

    [:octicons-arrow-right-24: Quick Start](getting-started/quickstart.md)

-   :books: **Learn the Basics**

    ---

    Comprehensive guides covering every aspect of Brine2D

    [:octicons-arrow-right-24: Tutorials](tutorials/index.md)

-   :material-code-braces: **API Reference**

    ---

    Complete API documentation for all Brine2D packages

    [:octicons-arrow-right-24: API Docs](api/index.md)

-   :material-github: **View on GitHub**

    ---

    Open source and MIT licensed

    [:octicons-arrow-right-24: GitHub Repository](https://github.com/CrazyPickleStudios/Brine2D)

</div>

## Why Brine2D?

### Convention Over Configuration

Just like ASP.NET, Brine2D provides sensible defaults that just work. Focus on building your game, not fighting with configuration.

### First-Class Dependency Injection

Built on Microsoft's DI container, Brine2D makes testable, maintainable code the default — not the exception.

```csharp
using Brine2D.Core;
using Brine2D.Engine;

public class GameScene : Scene
{
    // Only inject YOUR services — framework properties are set automatically
    public GameScene(IGameContext gameContext) { }

    protected override void OnUpdate(GameTime gameTime)
    {
        // Logger, World, Renderer, Input, Audio, Game — all available as properties!
        Logger.LogDebug("Updating");
    }
}
```

### Familiar Developer Experience

| **ASP.NET Core** | **Brine2D** | **What It Means** |
|------------------|-------------|-------------------|
| `WebApplicationBuilder` | `GameApplicationBuilder` | Configure your game with the same patterns |
| Controllers | Scenes | Organize game logic into manageable units |
| Middleware Pipeline | **ECS Systems** | Automatic execution via scene world |
| `ILogger<T>` | `Logger` property | Structured logging everywhere |
| Entity Framework | **Scene Management** | Transitions, loading screens |

### Production-Ready Architecture

- **Modular by design** — Mix and match only what you need
- **Clean separation of concerns** — Abstractions over implementations
- **Testable** — Mock any service, test any component
- **Cross-platform** — Windows, macOS, Linux support via SDL3

## See It In Action

Here's a complete game in ~30 lines of code:

```csharp
using Brine2D.Core;
using Brine2D.Engine;
using Brine2D.Hosting;
using Brine2D.Input;

var builder = GameApplication.CreateBuilder(args);

builder.Configure(options =>
{
    options.Window.Title = "My Game";
    options.Window.Width = 1280;
    options.Window.Height = 720;
});

builder.AddScene<GameScene>();

await using var game = builder.Build();
await game.RunAsync<GameScene>();

public class GameScene : Scene
{
    private readonly IGameContext _gameContext;

    public GameScene(IGameContext gameContext)
    {
        _gameContext = gameContext;
    }

    protected override void OnRender(GameTime gameTime)
    {
        Renderer.DrawText("Hello, Brine2D!", 100, 100, Color.White);
    }

    protected override void OnUpdate(GameTime gameTime)
    {
        if (Input.IsKeyPressed(Key.Escape))
        {
            _gameContext.RequestExit();
        }
    }
}
```

That's it! A complete game window with input handling and rendering.

## Core Features

### **Modern GPU Rendering**
- Hardware-accelerated via SDL3 GPU (Vulkan/Metal/D3D12)
- Texture atlasing with runtime sprite packing
- Sprite sheets and animations
- Camera system with zoom and rotation
- Line drawing with configurable thickness

### **Hybrid Entity Component System**
- Components as data containers
- EntityBehaviors for per-entity logic with DI support
- Optional systems for batch processing optimization
- Composition over inheritance for flexible entities
- Scoped EntityWorld per scene with automatic cleanup

### **Advanced Query System**
- Fluent API for complex entity searches
- Cached queries for zero-allocation performance
- Spatial queries (within radius/bounds)
- Multiple filter conditions

### **Scene Transitions**
- Smooth fade transitions between scenes
- Custom loading screens with progress bars
- Async scene loading
- Scene chaining support

### **Flexible Input System**
- Keyboard, mouse, and gamepad support
- Input layers (like middleware for input)
- Event-driven and polling APIs

### **2D Spatial Audio System**
- Distance-based volume attenuation
- Stereo panning based on position
- Configurable falloff curves (linear, quadratic, custom)
- ECS integration with audio sources and listeners

### **Advanced Particle System**
- GPU-accelerated particle rendering
- Configurable emitters and particle lifetime
- Integration with ECS

### **Asset Pipeline**
- Unified `IAssetLoader` with caching and ref-counting
- Typed `AssetManifest` for parallel preloading
- Scoped lifetime — assets released automatically on scene unload
- Optional `Brine2D.Build` package for compile-time asset constants

### **Complete UI Framework**
- Production-ready components
- Buttons, sliders, text inputs, dialogs, tabs
- Scroll views, tooltips, dropdowns
- Input layer management

## Project Structure

Brine2D is a single NuGet package with a clean internal architecture:

```
Brine2D/
    ├── Assets            # Asset loading, caching, manifests
    ├── Audio             # Audio abstractions and SDL3 implementation
    ├── Core              # Core types (GameTime, Color, etc.)
    ├── ECS               # Entity Component System
    ├── Engine            # Game loop, scenes, transitions
    ├── Hosting           # ASP.NET-style hosting model
    ├── Input             # Input abstractions and SDL3 implementation
    ├── Rendering         # Rendering abstractions and SDL3 GPU implementation
    └── UI                # UI framework
```

## Who Is This For?

### **ASP.NET Developers**
You already know the patterns. Now build games with them.

### **Game Developers**
Build games on a modern, maintainable .NET architecture.

### **Students & Educators**
Learn game development with familiar .NET patterns.

### **Enterprise Teams**
Build internal tools and games with maintainable code.

## Requirements

- **.NET 10 SDK** or later
- **SDL3** (included via SDL3-CS NuGet)
- **Windows, macOS, or Linux**

## Next Steps

<div class="grid cards" markdown>

-   :material-clock-fast: **5-Minute Quickstart**

    ---

    Create your first game in minutes

    [:octicons-arrow-right-24: Get Started](getting-started/quickstart.md)

-   :material-school: **Tutorials**

    ---

    Step-by-step guides for common scenarios

    [:octicons-arrow-right-24: Learn More](tutorials/index.md)

-   :material-file-document: **Fundamentals**

    ---

    Deep dive into Brine2D's architecture

    [:octicons-arrow-right-24: Read Docs](fundamentals/scenes.md)

-   :material-code-tags: **Feature Demos**

    ---

    Interactive demos showcasing all major features

    [:octicons-arrow-right-24: Browse Demos](samples/feature-demos.md)

</div>

## Community & Support

- **GitHub**: [CrazyPickleStudios/Brine2D](https://github.com/CrazyPickleStudios/Brine2D)
- **Issues**: Report bugs or request features
- **Discussions**: Ask questions and share ideas
- **License**: MIT — Use it anywhere, even commercially

---

<div class="centered-text" markdown>
**Ready to build games the ASP.NET way?**

[Get Started :material-arrow-right:](getting-started/quickstart.md){ .md-button .md-button--primary }
[View Demos :material-github:](samples/feature-demos.md){ .md-button }
</div>
