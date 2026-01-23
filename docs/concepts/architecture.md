---
title: Architecture
description: Understanding Brine2D's architecture - packages, layers, and design patterns
---

# Architecture

Learn how Brine2D is structured, from its package system to its core design patterns.

## Overview

Brine2D follows modern .NET architecture principles:

- **2-package system** - Separation of concerns
- **Dependency injection** - ASP.NET Core patterns
- **Entity Component System** - Composition over inheritance
- **Scene-based** - Clear game state separation
- **Service layer** - Abstract platform dependencies

**Core principles:**
- Loose coupling through interfaces
- Dependency injection everywhere
- Testable code by design
- Platform agnostic core

---

## High-Level Architecture

~~~mermaid
graph TB
    A[Your Game] --> B[Brine2D Core]
    A --> C[Brine2D.SDL]
    
    B --> B1[ECS Framework]
    B --> B2[Scene Management]
    B --> B3[Game Loop]
    B --> B4[Abstractions]
    
    C --> C1[SDL3GPURenderer]
    C --> C2[SDL3Renderer]
    C --> C3[Input Service]
    C --> C4[Audio Service]
    
    C1 --> D[SDL3 GPU API]
    C2 --> D
    C3 --> D
    C4 --> D
    
    D --> E[Platform]
    E --> E1[Windows]
    E --> E2[Linux]
    E --> E3[macOS]
    
    style B fill:#2d5016,stroke:#4ec9b0,stroke-width:3px,color:#fff
    style C fill:#4a2d4a,stroke:#c586c0,stroke-width:2px,color:#fff
    style D fill:#4a3d1f,stroke:#ce9178,stroke-width:2px,color:#fff
    style E fill:#1e3a5f,stroke:#569cd6,stroke-width:2px,color:#fff
    style A fill:#264f78,stroke:#4fc1ff,stroke-width:2px,color:#fff
~~~

**Three layers:**

1. **Your Game** - Game-specific logic
2. **Brine2D** - Engine framework
3. **Platform** - SDL3 implementation

---

## Package Structure

### Brine2D (Core Engine)

The core package provides engine framework:

**What's included:**

~~~
Brine2D/
├── Core/               # Core types (GameTime, Color, etc.)
├── Engine/             # Scene, GameLoop, GameContext
├── ECS/                # Entity Component System
│   ├── World.cs
│   ├── Entity.cs
│   ├── Component.cs
│   └── System.cs
├── Hosting/            # GameApplication builder
├── Rendering/          # IRenderer abstraction
├── Input/              # IInputService abstraction
├── Audio/              # IAudioService abstraction
└── Events/             # Event system
~~~

**Key abstractions:**

~~~csharp
// Rendering abstraction
public interface IRenderer
{
    void Clear(Color color);
    void DrawTexture(ITexture texture, float x, float y);
    Task<ITexture> LoadTextureAsync(string path, CancellationToken ct);
}

// Input abstraction
public interface IInputService
{
    bool IsKeyDown(Keys key);
    bool IsKeyPressed(Keys key);
    Vector2 GetMousePosition();
}

// Audio abstraction
public interface IAudioService
{
    Task<ISoundEffect> LoadSoundAsync(string path, CancellationToken ct);
    void PlaySound(ISoundEffect sound, float volume = 1.0f);
}
~~~

**Why?** Abstractions allow platform independence. Your game doesn't depend on SDL3 directly.

---

### Brine2D.SDL (Platform Layer)

The SDL package implements abstractions:

**What's included:**

~~~
Brine2D.SDL/
├── Rendering/
│   ├── SDL3GPURenderer.cs      # Modern GPU renderer
│   ├── SDL3Renderer.cs         # Legacy renderer
│   ├── SDL3Texture.cs
│   └── SDL3Font.cs
├── Input/
│   ├── SDL3InputService.cs
│   └── InputLayerManager.cs
├── Audio/
│   ├── SDL3AudioService.cs
│   ├── SDL3SoundEffect.cs
│   └── SDL3Music.cs
├── Extensions/
│   └── ServiceCollectionExtensions.cs
└── SDL3/                       # Native SDL3 bindings
~~~

**Service registration:**

~~~csharp
// In Brine2D.SDL
public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddSDL3Rendering(
        this IServiceCollection services,
        Action<RenderingOptions>? configureOptions = null)
    {
        services.Configure(configureOptions ?? (_ => { }));
        
        services.TryAddSingleton<IRenderer>(provider =>
        {
            var options = provider.GetRequiredService<IOptions<RenderingOptions>>();
            return options.Value.Backend switch
            {
                GraphicsBackend.GPU => new SDL3GPURenderer(...),
                GraphicsBackend.LegacyRenderer => new SDL3Renderer(...),
                _ => new SDL3GPURenderer(...)
            };
        });
        
        return services;
    }
    
    public static IServiceCollection AddSDL3Input(
        this IServiceCollection services)
    {
        services.TryAddSingleton<IInputService, SDL3InputService>();
        return services;
    }
    
    public static IServiceCollection AddSDL3Audio(
        this IServiceCollection services)
    {
        services.TryAddSingleton<IAudioService, SDL3AudioService>();
        return services;
    }
}
~~~

**Why?** Extension methods provide clean, discoverable API (ASP.NET Core style).

---

## Dependency Injection

### Service Lifetime

Brine2D uses three service lifetimes:

| Lifetime | Description | Example |
|----------|-------------|---------|
| **Singleton** | One instance per application | `IRenderer`, `IInputService`, `IAudioService` |
| **Scoped** | One instance per scene | `CollisionSystem`, `UICanvas` |
| **Transient** | New instance every time | Scenes, temporary objects |

**Lifecycle diagram:**

~~~mermaid
sequenceDiagram
    participant App as Application
    participant Builder as GameApplicationBuilder
    participant Container as DI Container
    participant Scene1 as Scene 1
    participant Scene2 as Scene 2
    
    App->>Builder: CreateBuilder(args)
    Builder->>Container: Register Singletons
    Builder->>Container: Register Scoped
    Builder->>Container: Register Transients
    
    App->>Container: Build()
    Container->>Container: Create Singletons
    
    App->>Scene1: LoadScene<Scene1>()
    Container->>Container: Create Scope
    Container->>Scene1: Inject dependencies
    Note over Scene1: Scene 1 running<br/>Scoped services exist
    
    App->>Scene2: LoadScene<Scene2>()
    Container->>Container: Dispose Scope
    Note over Scene1: Scene 1 scoped<br/>services disposed
    Container->>Container: Create new Scope
    Container->>Scene2: Inject dependencies
    Note over Scene2: Scene 2 running<br/>New scoped services
    
    box rgba(30, 58, 95, 0.3) Application Layer
    participant App
    end
    box rgba(45, 80, 22, 0.3) Builder/DI Layer
    participant Builder
    participant Container
    end
    box rgba(74, 45, 74, 0.3) Scene Layer
    participant Scene1
    participant Scene2
    end
~~~

---

### Registration Pattern

**In Program.cs:**

~~~csharp
using Brine2D.Hosting;
using Brine2D.SDL;
using Microsoft.Extensions.DependencyInjection;

var builder = GameApplication.CreateBuilder(args);

// Singleton services (one per application)
builder.Services.AddSDL3Rendering(options => { ... });
builder.Services.AddSDL3Input();
builder.Services.AddSDL3Audio();

// Scoped services (one per scene)
builder.Services.AddCollisionSystem();
builder.Services.AddUICanvas();

// Transient services (scenes)
builder.Services.AddScene<MenuScene>();
builder.Services.AddScene<GameScene>();

var game = builder.Build();
await game.RunAsync<MenuScene>();
~~~

**In your scene:**

~~~csharp
public class GameScene : Scene
{
    private readonly IRenderer _renderer;        // Singleton
    private readonly IInputService _input;       // Singleton
    private readonly CollisionSystem _collision;  // Scoped
    
    public GameScene(
        IRenderer renderer,
        IInputService input,
        CollisionSystem collision,
        ILogger<GameScene> logger) : base(logger)
    {
        _renderer = renderer;
        _input = input;
        _collision = collision;
    }
}
~~~

**Pattern:** Constructor injection - services provided automatically.

---

## Scene Management

### Scene Lifecycle

~~~mermaid
stateDiagram-v2
    [*] --> Created: new Scene()
    Created --> Initializing: OnInitialize()
    Initializing --> Loading: OnLoadAsync()
    Loading --> Running: Scene ready
    
    Running --> Updating: Every frame
    Updating --> Rendering: After update
    Rendering --> Running: Frame complete
    
    Running --> Paused: PauseScene()
    Paused --> Running: ResumeScene()
    
    Running --> Unloading: LoadScene<Other>()
    Paused --> Unloading: LoadScene<Other>()
    Unloading --> Disposing: OnUnloadAsync()
    Disposing --> Disposed: OnDispose()
    Disposed --> [*]
~~~

**Scene methods:**

~~~csharp
public abstract class Scene : IScene
{
    // Lifecycle hooks
    protected virtual void OnInitialize() { }
    protected virtual Task OnInitializeAsync(CancellationToken ct) => Task.CompletedTask;
    
    protected virtual void OnLoad() { }
    protected virtual Task OnLoadAsync(CancellationToken ct) => Task.CompletedTask;
    
    protected virtual void OnUpdate(GameTime gameTime) { }
    protected virtual void OnRender(GameTime gameTime) { }
    
    protected virtual void OnUnload() { }
    protected virtual Task OnUnloadAsync(CancellationToken ct) => Task.CompletedTask;
    
    protected virtual void OnDispose() { }
}
~~~

---

### Scene Manager

The scene manager handles transitions:

~~~csharp
public interface ISceneManager
{
    IScene? CurrentScene { get; }
    
    void LoadScene<TScene>() where TScene : IScene;
    Task LoadSceneAsync<TScene>(CancellationToken ct) where TScene : IScene;
    
    void PauseScene();
    void ResumeScene();
}
~~~

**Implementation:**

~~~csharp
public class SceneManager : ISceneManager
{
    private readonly IServiceProvider _serviceProvider;
    private IScene? _currentScene;
    
    public IScene? CurrentScene => _currentScene;
    
    public async Task LoadSceneAsync<TScene>(CancellationToken ct) 
        where TScene : IScene
    {
        // Unload current scene
        if (_currentScene != null)
        {
            await _currentScene.UnloadAsync(ct);
            _currentScene.Dispose();
        }
        
        // Create new scene (creates new scoped services)
        _currentScene = _serviceProvider.GetRequiredService<TScene>();
        
        // Initialize and load
        _currentScene.Initialize();
        await _currentScene.LoadAsync(ct);
    }
}
~~~

**Pattern:** Each scene gets its own scope, scoped services are recreated.

---

## Entity Component System

### ECS Architecture

~~~mermaid
graph LR
    A[World] --> B[Entity 1]
    A --> C[Entity 2]
    A --> D[Entity 3]
    
    B --> B1[Transform]
    B --> B2[Sprite]
    B --> B3[Velocity]
    
    C --> C1[Transform]
    C --> C2[Sprite]
    C --> C3[Health]
    
    D --> D1[Transform]
    D --> D2[Collider]
    
    E[MovementSystem] -.-> B
    E -.-> D
    F[RenderSystem] -.-> B
    F -.-> C
    G[HealthSystem] -.-> C
    
    style A fill:#2d5016,stroke:#4ec9b0,stroke-width:3px,color:#fff
    style E fill:#4a2d4a,stroke:#c586c0,stroke-width:2px,color:#fff
    style F fill:#4a2d4a,stroke:#c586c0,stroke-width:2px,color:#fff
    style G fill:#4a2d4a,stroke:#c586c0,stroke-width:2px,color:#fff
~~~

**Components:**

~~~csharp
// Pure data, no logic
public class TransformComponent : Component
{
    public Vector2 Position { get; set; }
    public float Rotation { get; set; }
    public Vector2 Scale { get; set; } = Vector2.One;
}

public class VelocityComponent : Component
{
    public Vector2 Velocity { get; set; }
}

public class SpriteComponent : Component
{
    public ITexture? Texture { get; set; }
    public Color Tint { get; set; } = Color.White;
}
~~~

**Systems:**

~~~csharp
// Logic, no data
public class MovementSystem : IUpdateSystem
{
    public string Name => "MovementSystem";
    public int UpdateOrder => 100;
    
    public void Update(GameTime gameTime)
    {
        var query = World.QueryEntities()
            .With<TransformComponent>()
            .With<VelocityComponent>();
        
        foreach (var entity in query)
        {
            var transform = entity.Get<TransformComponent>();
            var velocity = entity.Get<VelocityComponent>();
            
            transform.Position += velocity.Velocity * (float)gameTime.DeltaTime;
        }
    }
}
~~~

**Pattern:** Systems iterate entities with specific components.

---

## Game Loop

### Main Game Loop

~~~mermaid
flowchart TD
    Start([Game Start]) --> Init[Initialize Scene]
    Init --> Load[Load Assets]
    Load --> Loop{Game Running?}
    
    Loop -->|Yes| Delta[Calculate deltaTime]
    Delta --> Update[Update Scene]
    Update --> Systems[Update ECS Systems]
    Systems --> Render[Render Scene]
    Render --> Draw[Clear & Draw]
    Draw --> Present[Present Frame]
    Present --> VSync[VSync / Frame Limit]
    VSync --> Loop
    
    Loop -->|No| Dispose[Dispose Scene]
    Dispose --> End([Exit])
    
    style Start fill:#2d5016,stroke:#4ec9b0,stroke-width:2px,color:#fff
    style Loop fill:#4a2d4a,stroke:#c586c0,stroke-width:2px,color:#fff
    style Update fill:#1e3a5f,stroke:#569cd6,stroke-width:2px,color:#fff
    style Render fill:#4a3d1f,stroke:#ce9178,stroke-width:2px,color:#fff
    style End fill:#2d5016,stroke:#4ec9b0,stroke-width:2px,color:#fff
~~~

**Implementation:**

~~~csharp
public class GameLoop : IGameLoop
{
    private readonly ISceneManager _sceneManager;
    private readonly IGameContext _gameContext;
    private bool _isRunning;
    
    public async Task RunAsync(CancellationToken cancellationToken)
    {
        _isRunning = true;
        var lastTime = DateTime.UtcNow;
        
        while (_isRunning && !cancellationToken.IsCancellationRequested)
        {
            var currentTime = DateTime.UtcNow;
            var deltaTime = (currentTime - lastTime).TotalSeconds;
            lastTime = currentTime;
            
            var gameTime = new GameTime(
                totalTime: currentTime.TimeOfDay.TotalSeconds,
                deltaTime: deltaTime);
            
            // Update
            _sceneManager.CurrentScene?.Update(gameTime);
            
            // Render
            _sceneManager.CurrentScene?.Render(gameTime);
            
            // Check exit
            if (_gameContext.IsExitRequested)
            {
                _isRunning = false;
            }
            
            // Frame limiter (if no VSync)
            await Task.Delay(1, cancellationToken);
        }
    }
}
~~~

---

## Service Layers

### Rendering Service

~~~csharp
// Abstraction (in Brine2D)
public interface IRenderer : IDisposable
{
    // Clear
    void Clear(Color color);
    
    // Texture loading
    Task<ITexture> LoadTextureAsync(string path, CancellationToken ct);
    void UnloadTexture(ITexture texture);
    
    // Drawing
    void DrawTexture(ITexture texture, float x, float y, float width, float height);
    void DrawRectangle(float x, float y, float width, float height, Color color);
    void DrawText(string text, float x, float y, Color color);
    
    // Render targets
    Task<ITexture> CreateRenderTargetAsync(int width, int height, CancellationToken ct);
    void SetRenderTarget(ITexture? target);
}

// Implementation (in Brine2D.SDL)
public class SDL3GPURenderer : IRenderer
{
    private readonly IntPtr _device;
    private readonly IntPtr _window;
    
    public void Clear(Color color)
    {
        SDL3.GPU_BeginRenderPass(_device, ...);
        // Platform-specific clear
        SDL3.GPU_EndRenderPass(_device);
    }
    
    public void DrawTexture(ITexture texture, float x, float y, float w, float h)
    {
        var sdlTexture = (SDL3Texture)texture;
        // Platform-specific drawing
    }
}
~~~

---

### Input Service

~~~csharp
// Abstraction (in Brine2D)
public interface IInputService
{
    // Keyboard
    bool IsKeyDown(Keys key);
    bool IsKeyPressed(Keys key);
    bool IsKeyReleased(Keys key);
    
    // Mouse
    bool IsMouseButtonDown(MouseButton button);
    bool IsMouseButtonPressed(MouseButton button);
    Vector2 GetMousePosition();
    Vector2 GetMouseDelta();
    
    // Gamepad
    bool IsGamepadConnected(int index);
    bool IsGamepadButtonDown(int index, GamepadButton button);
    float GetGamepadAxis(int index, GamepadAxis axis);
}

// Implementation (in Brine2D.SDL)
public class SDL3InputService : IInputService
{
    private readonly HashSet<Keys> _currentKeys = new();
    private readonly HashSet<Keys> _previousKeys = new();
    
    public bool IsKeyDown(Keys key)
    {
        return _currentKeys.Contains(key);
    }
    
    public bool IsKeyPressed(Keys key)
    {
        return _currentKeys.Contains(key) && !_previousKeys.Contains(key);
    }
    
    public void Update()
    {
        _previousKeys.Clear();
        _previousKeys.UnionWith(_currentKeys);
        
        // Poll SDL events
        while (SDL3.PollEvent(out var evt))
        {
            // Update key states
        }
    }
}
~~~

---

### Audio Service

~~~csharp
// Abstraction (in Brine2D)
public interface IAudioService
{
    // Sound effects
    Task<ISoundEffect> LoadSoundAsync(string path, CancellationToken ct);
    void PlaySound(ISoundEffect sound, float volume = 1.0f, int loops = 0);
    void UnloadSound(ISoundEffect sound);
    
    // Music
    Task<IMusic> LoadMusicAsync(string path, CancellationToken ct);
    void PlayMusic(IMusic music, int loops = -1);
    void StopMusic();
    void PauseMusic();
    void ResumeMusic();
    
    // Volume
    float MasterVolume { get; set; }
    float MusicVolume { get; set; }
    float SoundVolume { get; set; }
}

// Implementation (in Brine2D.SDL)
public class SDL3AudioService : IAudioService
{
    public async Task<ISoundEffect> LoadSoundAsync(string path, CancellationToken ct)
    {
        var chunk = SDL3_mixer.LoadWAV(path);
        return new SDL3SoundEffect(chunk);
    }
    
    public void PlaySound(ISoundEffect sound, float volume, int loops)
    {
        var sdlSound = (SDL3SoundEffect)sound;
        SDL3_mixer.VolumeChunk(sdlSound.Chunk, (int)(volume * 128));
        SDL3_mixer.PlayChannel(-1, sdlSound.Chunk, loops);
    }
}
~~~

---

## Design Patterns

### Builder Pattern

~~~csharp
// GameApplication uses builder pattern (like ASP.NET Core)
public class GameApplication
{
    public static GameApplicationBuilder CreateBuilder(string[] args)
    {
        var builder = new GameApplicationBuilder();
        builder.Configuration.AddCommandLine(args);
        
        // Register core services
        builder.Services.TryAddSingleton<IGameEngine, GameEngine>();
        builder.Services.TryAddSingleton<IGameLoop, GameLoop>();
        builder.Services.TryAddSingleton<IGameContext, GameContext>();
        builder.Services.TryAddSingleton<ISceneManager, SceneManager>();
        
        return builder;
    }
}

// Usage
var builder = GameApplication.CreateBuilder(args);
builder.Services.AddSDL3Rendering(options => { ... });
var game = builder.Build();
await game.RunAsync<MenuScene>();
~~~

---

### Factory Pattern

~~~csharp
// Texture factory in renderer
public class TextureFactory
{
    private readonly IntPtr _device;
    
    public ITexture CreateTexture(int width, int height, PixelFormat format)
    {
        var texture = SDL3.CreateTexture(_device, (uint)format, width, height);
        return new SDL3Texture(texture);
    }
    
    public ITexture LoadTexture(string path)
    {
        var surface = SDL3_image.Load(path);
        var texture = SDL3.CreateTextureFromSurface(_device, surface);
        return new SDL3Texture(texture);
    }
}
~~~

---

### Observer Pattern

~~~csharp
// Event system
public class EventBus
{
    private readonly Dictionary<Type, List<Delegate>> _handlers = new();
    
    public void Subscribe<T>(Action<T> handler)
    {
        var type = typeof(T);
        if (!_handlers.ContainsKey(type))
        {
            _handlers[type] = new List<Delegate>();
        }
        _handlers[type].Add(handler);
    }
    
    public void Publish<T>(T evt)
    {
        var type = typeof(T);
        if (_handlers.TryGetValue(type, out var handlers))
        {
            foreach (var handler in handlers)
            {
                ((Action<T>)handler)(evt);
            }
        }
    }
}

// Usage
eventBus.Subscribe<PlayerDiedEvent>(evt =>
{
    Logger.LogInformation("Player died!");
    ShowGameOver();
});

eventBus.Publish(new PlayerDiedEvent { Score = 1000 });
~~~

---

## Complete Architecture Diagram

~~~mermaid
graph TB
    subgraph "Your Game"
        A1[Program.cs]
        A2[Scenes]
        A3[Entities]
        A4[Systems]
    end
    
    subgraph "Brine2D Core"
        B1[GameApplication]
        B2[Scene Management]
        B3[ECS Framework]
        B4[Game Loop]
        B5[Abstractions]
    end
    
    subgraph "Brine2D.SDL"
        C1[SDL3GPURenderer]
        C2[SDL3Renderer]
        C3[SDL3InputService]
        C4[SDL3AudioService]
    end
    
    subgraph "SDL3"
        D1[SDL3 GPU API]
        D2[SDL_Renderer]
        D3[SDL_Events]
        D4[SDL_mixer]
    end
    
    A1 --> B1
    A2 --> B2
    A3 --> B3
    A4 --> B4
    
    B1 --> B5
    B2 --> B5
    B3 --> B5
    B4 --> B5
    
    B5 --> C1
    B5 --> C2
    B5 --> C3
    B5 --> C4
    
    C1 --> D1
    C2 --> D2
    C3 --> D3
    C4 --> D4
    
    D1 --> E[Platform<br/>Windows/Linux/macOS]
    D2 --> E
    D3 --> E
    D4 --> E
    
    style B1 fill:#2d5016,stroke:#4ec9b0,stroke-width:2px,color:#fff
    style B5 fill:#2d5016,stroke:#4ec9b0,stroke-width:2px,color:#fff
    style C1 fill:#4a2d4a,stroke:#c586c0,stroke-width:2px,color:#fff
    style C2 fill:#4a2d4a,stroke:#c586c0,stroke-width:2px,color:#fff
    style C3 fill:#4a2d4a,stroke:#c586c0,stroke-width:2px,color:#fff
    style C4 fill:#4a2d4a,stroke:#c586c0,stroke-width:2px,color:#fff
~~~

---

## Best Practices

### DO

1. **Depend on abstractions, not implementations**
   ~~~csharp
   // ✅ Good
   public GameScene(IRenderer renderer) { }
   
   // ❌ Bad
   public GameScene(SDL3GPURenderer renderer) { }
   ~~~

2. **Use dependency injection**
   ~~~csharp
   // ✅ Good - injected
   public GameScene(IInputService input) { }
   
   // ❌ Bad - manual creation
   var input = new SDL3InputService();
   ~~~

3. **Keep components data-only**
   ~~~csharp
   // ✅ Good - pure data
   public class HealthComponent : Component
   {
       public int Current { get; set; }
       public int Max { get; set; }
   }
   
   // ❌ Bad - has logic
   public class HealthComponent : Component
   {
       public void TakeDamage(int amount) { ... }
   }
   ~~~

4. **Put logic in systems**
   ~~~csharp
   // ✅ Good - system has logic
   public class HealthSystem : IUpdateSystem
   {
       public void Update(GameTime gameTime)
       {
           foreach (var entity in World.QueryWith<HealthComponent>())
           {
               // Process health logic
           }
       }
   }
   ~~~

5. **Use scenes for game states**
   ~~~csharp
   // ✅ Good - clear separation
   MenuScene, GameScene, PauseScene, GameOverScene
   ~~~

### DON'T

1. **Don't couple to platform**
   ~~~csharp
   // ❌ Bad - SDL3 dependency
   using SDL3;
   SDL3.Init();
   
   // ✅ Good - use abstraction
   using Brine2D.Rendering;
   IRenderer renderer = ...;
   ~~~

2. **Don't create singletons manually**
   ~~~csharp
   // ❌ Bad
   public class GameManager
   {
       public static GameManager Instance { get; } = new();
   }
   
   // ✅ Good - register as singleton
   builder.Services.AddSingleton<GameManager>();
   ~~~

3. **Don't store state in systems**
   ~~~csharp
   // ❌ Bad - system has state
   public class MovementSystem : IUpdateSystem
   {
       private float _speed = 200f; // Wrong!
   }
   
   // ✅ Good - state in component
   public class VelocityComponent : Component
   {
       public float Speed { get; set; } = 200f;
   }
   ~~~

---

## Summary

**Architecture layers:**

| Layer | Purpose | Examples |
|-------|---------|----------|
| **Your Game** | Game-specific code | Scenes, entities, game logic |
| **Brine2D Core** | Engine framework | ECS, scenes, abstractions |
| **Brine2D.SDL** | Platform implementation | Renderers, input, audio |
| **SDL3** | Native library | Graphics, input, audio APIs |

**Key patterns:**

| Pattern | Usage |
|---------|-------|
| **Dependency Injection** | Service registration and resolution |
| **Builder Pattern** | GameApplication configuration |
| **Factory Pattern** | Texture and resource creation |
| **Observer Pattern** | Event system |
| **ECS** | Entity composition and systems |

**Core principles:**

| Principle | Description |
|-----------|-------------|
| **Loose Coupling** | Depend on abstractions |
| **Separation of Concerns** | 2-package structure |
| **Testability** | DI enables easy testing |
| **Platform Independence** | Abstract platform via interfaces |

---

## Next Steps

- **[Dependency Injection](dependency-injection.md)** - Deep dive into DI
- **[Builder Pattern](builder-pattern.md)** - GameApplicationBuilder details
- **[Scene Management](scenes.md)** - Scene lifecycle and transitions
- **[Entity Component System](entity-component-system.md)** - ECS architecture
- **[Game Loop](game-loop.md)** - Understanding the game loop

---

## Quick Reference

~~~csharp
// Package structure
Brine2D              // Core engine (abstractions)
Brine2D.SDL          // Platform implementation

// Service registration
builder.Services.AddSDL3Rendering(options => { ... });  // Singleton
builder.Services.AddSDL3Input();                        // Singleton
builder.Services.AddCollisionSystem();                   // Scoped
builder.Services.AddScene<GameScene>();                  // Transient

// Scene structure
public class GameScene : Scene
{
    private readonly IRenderer _renderer;  // Singleton
    
    public GameScene(IRenderer renderer, ...) : base(logger)
    {
        _renderer = renderer;
    }
    
    protected override void OnUpdate(GameTime gameTime) { }
    protected override void OnRender(GameTime gameTime) { }
}

// ECS structure
public class HealthComponent : Component { /* Data */ }
public class HealthSystem : IUpdateSystem { /* Logic */ }
~~~

---

Ready to learn about dependency injection? Check out [Dependency Injection](dependency-injection.md)!