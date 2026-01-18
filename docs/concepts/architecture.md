---
title: Architecture
description: Deep dive into Brine2D's modular architecture and design patterns
---

# Architecture

Brine2D follows a **layered, modular architecture** inspired by ASP.NET Core. This design promotes separation of concerns, testability, and extensibility.

## Architectural Overview

```mermaid
graph TB
    subgraph "Application Layer"
        APP["GameApplication"]
        BUILDER["GameApplicationBuilder"]
    end
    
    subgraph "Engine Layer"
        ENGINE["GameEngine"]
        LOOP["GameLoop"]
        SCENEMGR["SceneManager"]
        CONTEXT["GameContext"]
    end
    
    subgraph "Core Abstractions"
        ISCENE["IScene"]
        IRENDERER["IRenderer"]
        IINPUT["IInputService"]
        IAUDIO["IAudioService"]
    end
    
    subgraph "SDL3 Implementations"
        SDL_RENDER["SDL3Renderer / SDL3GPURenderer"]
        SDL_INPUT["SDL3InputService"]
        SDL_AUDIO["SDL3AudioService"]
    end
    
    subgraph "ECS Layer"
        ECS["EntityWorld"]
        SYSTEMS["Systems (Rendering, Audio, etc.)"]
    end
    
    subgraph "Game Systems"
        COLLISION["CollisionSystem"]
        ANIMATION["SpriteAnimator"]
        TILEMAP["TilemapRenderer"]
        UI["UICanvas"]
    end
    
    subgraph "Your Game"
        SCENES["MenuScene, GameScene, etc."]
    end
    
    APP --> ENGINE
    BUILDER --> APP
    ENGINE --> LOOP
    ENGINE --> SCENEMGR
    ENGINE --> CONTEXT
    
    SCENEMGR --> ISCENE
    ISCENE --> SCENES
    
    ENGINE --> IRENDERER
    ENGINE --> IINPUT
    ENGINE --> IAUDIO
    
    IRENDERER --> SDL_RENDER
    IINPUT --> SDL_INPUT
    IAUDIO --> SDL_AUDIO
    
    SCENES --> ECS
    ECS --> SYSTEMS
    
    SCENES --> COLLISION
    SCENES --> ANIMATION
    SCENES --> TILEMAP
    SCENES --> UI

    style APP fill:#1e3a5f,stroke:#569cd6,stroke-width:2px,color:#fff
    style BUILDER fill:#1e3a5f,stroke:#569cd6,stroke-width:2px,color:#fff
    style ENGINE fill:#2d5016,stroke:#4ec9b0,stroke-width:2px,color:#fff
    style LOOP fill:#2d5016,stroke:#4ec9b0,stroke-width:2px,color:#fff
    style SCENEMGR fill:#2d5016,stroke:#4ec9b0,stroke-width:2px,color:#fff
    style CONTEXT fill:#2d5016,stroke:#4ec9b0,stroke-width:2px,color:#fff
    style ISCENE fill:#3d3d2a,stroke:#dcdcaa,stroke-width:2px,color:#fff
    style IRENDERER fill:#3d3d2a,stroke:#dcdcaa,stroke-width:2px,color:#fff
    style IINPUT fill:#3d3d2a,stroke:#dcdcaa,stroke-width:2px,color:#fff
    style IAUDIO fill:#3d3d2a,stroke:#dcdcaa,stroke-width:2px,color:#fff
    style SDL_RENDER fill:#4a2d4a,stroke:#c586c0,stroke-width:2px,color:#fff
    style SDL_INPUT fill:#4a2d4a,stroke:#c586c0,stroke-width:2px,color:#fff
    style SDL_AUDIO fill:#4a2d4a,stroke:#c586c0,stroke-width:2px,color:#fff
    style ECS fill:#3d4a1f,stroke:#b5ce78,stroke-width:2px,color:#fff
    style SYSTEMS fill:#3d4a1f,stroke:#b5ce78,stroke-width:2px,color:#fff
    style COLLISION fill:#4a3d1f,stroke:#ce9178,stroke-width:2px,color:#fff
    style ANIMATION fill:#4a3d1f,stroke:#ce9178,stroke-width:2px,color:#fff
    style TILEMAP fill:#4a3d1f,stroke:#ce9178,stroke-width:2px,color:#fff
    style UI fill:#4a3d1f,stroke:#ce9178,stroke-width:2px,color:#fff
    style SCENES fill:#264f78,stroke:#4fc1ff,stroke-width:2px,color:#fff
```

---

## Module Structure

Brine2D is organized into distinct modules, each with a specific responsibility:

### Core Modules

| Module | Purpose | Key Types |
|--------|---------|-----------|
| **Brine2D.Core** | Core abstractions and interfaces | `IScene`, `GameTime`, `EventBus` |
| **Brine2D.Engine** | Game loop and scene management | `GameEngine`, `GameLoop`, `SceneManager` |
| **Brine2D.Hosting** | Application hosting (ASP.NET-like) | `GameApplication`, `GameApplicationBuilder` |

### ECS Modules

| Module | Purpose | Key Types |
|--------|---------|-----------|
| **Brine2D.ECS** | Entity Component System | `EntityWorld`, `Entity`, `Component`, `ISystem` |
| **Brine2D.Rendering.ECS** | ECS rendering systems | `SpriteRenderingSystem`, `ParticleSystem`, `CameraSystem` |
| **Brine2D.Input.ECS** | ECS input systems | `PlayerControllerSystem` |
| **Brine2D.Audio.ECS** | ECS audio systems | `AudioSystem`, `AudioSourceComponent`, `AudioListenerComponent` |

### Rendering Modules

| Module | Purpose | Key Types |
|--------|---------|-----------|
| **Brine2D.Rendering** | Rendering abstractions and utilities | `IRenderer`, `ICamera`, `Color`, `TextureAtlas`, `AtlasBuilder` |
| **Brine2D.Rendering.SDL** | SDL3 rendering implementation | `SDL3Renderer`, `SDL3GPURenderer`, `SDL3TextureLoader`, `SpriteBatcher` |
| **Brine2D.Rendering.ECS** | ECS rendering systems | `SpriteRenderingSystem`, `ParticleSystem` |

### Input Modules

| Module | Purpose | Key Types |
|--------|---------|-----------|
| **Brine2D.Input** | Input abstractions | `IInputService`, `Keys`, `MouseButton`, `InputLayerManager` |
| **Brine2D.Input.SDL** | SDL3 input implementation | `SDL3InputService` |

### Audio Modules

| Module | Purpose | Key Types |
|--------|---------|-----------|
| **Brine2D.Audio** | Audio abstractions | `IAudioService`, `ISoundEffect`, `IMusic` |
| **Brine2D.Audio.SDL** | SDL3_mixer implementation | `SDL3AudioService` |
| **Brine2D.Audio.ECS** | ECS audio systems | `AudioSystem`, `AudioSourceComponent`, `AudioListenerComponent` |

### Game Systems Modules

| Module | Purpose | Key Types |
|--------|---------|-----------|
| **Brine2D.Core.Collision** | Collision detection system | `CollisionSystem`, `BoxCollider`, `CircleCollider` |
| **Brine2D.Core.Animation** | Animation system | `SpriteAnimator`, `AnimationClip` |
| **Brine2D.Core.Tilemap** | Tilemap rendering | `Tilemap`, `TilemapRenderer`, `TmjLoader` |
| **Brine2D.UI** | UI framework | `UICanvas`, `UIButton`, `UISlider`, `UITextInput` |

---

## Dependency Flow

```mermaid
graph LR
    subgraph "Abstractions (Interfaces)"
        CORE["Brine2D.Core"]
        RENDERING["Brine2D.Rendering"]
        INPUT["Brine2D.Input"]
        AUDIO["Brine2D.Audio"]
        ECS["Brine2D.ECS"]
    end
    
    subgraph "Implementations"
        SDL_RENDER["Brine2D.Rendering.SDL"]
        SDL_INPUT["Brine2D.Input.SDL"]
        SDL_AUDIO["Brine2D.Audio.SDL"]
    end
    
    subgraph "ECS Bridges"
        RENDER_ECS["Brine2D.Rendering.ECS"]
        INPUT_ECS["Brine2D.Input.ECS"]
        AUDIO_ECS["Brine2D.Audio.ECS"]
    end
    
    subgraph "Application"
        HOSTING["Brine2D.Hosting"]
        ENGINE["Brine2D.Engine"]
        GAME["Your Game"]
    end
    
    SDL_RENDER --> RENDERING
    SDL_INPUT --> INPUT
    SDL_AUDIO --> AUDIO
    
    RENDER_ECS --> RENDERING
    RENDER_ECS --> ECS
    INPUT_ECS --> INPUT
    INPUT_ECS --> ECS
    AUDIO_ECS --> AUDIO
    AUDIO_ECS --> ECS
    
    ENGINE --> CORE
    HOSTING --> ENGINE
    HOSTING --> RENDERING
    HOSTING --> INPUT
    HOSTING --> AUDIO
    
    GAME --> HOSTING
    GAME --> CORE
    GAME --> RENDERING
    GAME --> INPUT
    GAME --> AUDIO
    GAME --> ECS

    style CORE fill:#3d3d2a,stroke:#dcdcaa,stroke-width:2px,color:#fff
    style RENDERING fill:#3d3d2a,stroke:#dcdcaa,stroke-width:2px,color:#fff
    style INPUT fill:#3d3d2a,stroke:#dcdcaa,stroke-width:2px,color:#fff
    style AUDIO fill:#3d3d2a,stroke:#dcdcaa,stroke-width:2px,color:#fff
    style ECS fill:#3d3d2a,stroke:#dcdcaa,stroke-width:2px,color:#fff
    style SDL_RENDER fill:#4a2d4a,stroke:#c586c0,stroke-width:2px,color:#fff
    style SDL_INPUT fill:#4a2d4a,stroke:#c586c0,stroke-width:2px,color:#fff
    style SDL_AUDIO fill:#4a2d4a,stroke:#c586c0,stroke-width:2px,color:#fff
    style RENDER_ECS fill:#3d4a1f,stroke:#b5ce78,stroke-width:2px,color:#fff
    style INPUT_ECS fill:#3d4a1f,stroke:#b5ce78,stroke-width:2px,color:#fff
    style AUDIO_ECS fill:#3d4a1f,stroke:#b5ce78,stroke-width:2px,color:#fff
    style HOSTING fill:#1e3a5f,stroke:#569cd6,stroke-width:2px,color:#fff
    style ENGINE fill:#2d5016,stroke:#4ec9b0,stroke-width:2px,color:#fff
    style GAME fill:#264f78,stroke:#4fc1ff,stroke-width:2px,color:#fff
```

**Key Principle:** Abstractions (interfaces) never depend on implementations. Implementations depend on abstractions. This enables **pluggable backends** (SDL3, MonoGame, custom implementations).

---

## Layer Responsibilities

### 1. Application Layer (`Brine2D.Hosting`)

**Responsibility:** Bootstrap and host the game application

**Key Classes:**
- `GameApplication` - Main application host
- `GameApplicationBuilder` - Fluent API for configuration

**Pattern:** Builder Pattern (like ASP.NET's `WebApplicationBuilder`)

```csharp
var builder = GameApplication.CreateBuilder(args);

// Configure services
builder.Services.AddSDL3Rendering();
builder.Services.AddSDL3Input();
builder.Services.AddScene<GameScene>();

// Build and run
var game = builder.Build();
await game.RunAsync<GameScene>();
```

---

### 2. Engine Layer (`Brine2D.Engine`)

**Responsibility:** Coordinate game systems and manage the game loop

**Key Classes:**
- `GameEngine` - Initializes and coordinates subsystems
- `GameLoop` - Manages update/render cycles
- `SceneManager` - Loads and manages scenes
- `GameContext` - Shared game state

**Pattern:** Mediator Pattern (coordinates subsystems)

```csharp
public class GameEngine : IGameEngine
{
    public async Task InitializeAsync(CancellationToken cancellationToken)
    {
        // Initialize renderer
        var renderer = _serviceProvider.GetService<IRenderer>();
        await renderer?.InitializeAsync(cancellationToken);
        
        // Initialize other subsystems...
    }
}
```

---

### 3. Core Layer (`Brine2D.Core`)

**Responsibility:** Define core abstractions and shared types

**Key Interfaces:**
- `IScene` - Game scene abstraction
- `IGameLoop` - Game loop contract
- `IGameContext` - Shared game state
- `ISceneManager` - Scene management

**Key Types:**
- `EventBus` - Global event system (moved from ECS in v0.7.0)

**Pattern:** Interface Segregation (small, focused interfaces)

```csharp
public interface IScene
{
    void Initialize();
    Task LoadAsync(CancellationToken cancellationToken);
    void Update(GameTime gameTime);
    void Render(GameTime gameTime);
    Task UnloadAsync(CancellationToken cancellationToken);
}
```

---

### 4. Rendering Layer

#### Abstractions (`Brine2D.Rendering`)

**Key Interfaces:**
- `IRenderer` - Rendering operations
- `ITextureLoader` - Texture management
- `ICamera` - Camera abstraction
- `IFontLoader` - Font loading

**Key Types (Data & Utilities):**
- `Color` - RGBA color struct
- `Camera2D` - 2D camera with zoom/rotation
- `RenderingOptions` - Configuration options
- `TextureAtlas` - Runtime sprite packing utility **(NEW in v0.8.0)**
- `AtlasBuilder` - Intelligent bin packing algorithm **(NEW in v0.8.0)**

#### Implementation (`Brine2D.Rendering.SDL`)

**Key Classes:**
- `SDL3Renderer` - Legacy SDL3 renderer
- `SDL3GPURenderer` - Modern GPU renderer
- `SDL3TextureLoader` - SDL3 texture loading
- `SDL3FontLoader` - SDL3_ttf font loading
- `SpriteBatcher` - Sprite batching utility with rotation support **(Enhanced in v0.8.0)**

**Pattern:** Strategy Pattern (swappable renderers)

```csharp
// Choose renderer at startup
builder.Services.AddSDL3Rendering(options =>
{
    options.Backend = GraphicsBackend.GPU; // or LegacyRenderer
});
```

**Rendering Utilities:**

The rendering layer includes utilities that optimize rendering performance:

- **SpriteBatcher** - Groups sprites by texture to reduce draw calls
- **TextureAtlas** - Packs multiple textures into one to eliminate texture switching
- **AtlasBuilder** - Intelligently arranges sprites using bin packing algorithm

```csharp
// Using texture atlas for performance
var atlas = await AtlasBuilder.BuildAtlasAsync(
    _renderer,
    _textureLoader,
    textures,
    padding: 2,
    maxSize: 2048
);

// Result: 100 sprites → 1 draw call (90-99% reduction)
```

#### ECS Bridge (`Brine2D.Rendering.ECS`)

**Key Systems:**
- `SpriteRenderingSystem` - Renders sprite components
- `ParticleSystem` - Advanced particle effects **(Enhanced in v0.8.0)**
- `CameraSystem` - Camera follow behavior

**New in v0.8.0:**
- Particle textures with custom sprites
- Rotation (start, end, rotation speed)
- Trail effects with configurable length
- Blend modes (additive, alpha, none)
- 7 emitter shapes (point, circle, ring, box, cone, line, burst)

---

### 5. Input Layer

#### Abstractions (`Brine2D.Input`)

**Key Interfaces:**
- `IInputService` - Input polling
- `IInputLayer` - Layer-based input routing

**Key Types:**
- `Keys` - Keyboard key enum
- `MouseButton` - Mouse button enum
- `GamepadButton` - Gamepad button enum
- `InputLayerManager` - Prioritized input processing

#### Implementation (`Brine2D.Input.SDL`)

**Key Classes:**
- `SDL3InputService` - SDL3 input polling

**Pattern:** Observer Pattern (input events) + Priority Chain (input layers)

```csharp
// Input layers (like middleware)
_inputLayerManager.RegisterLayer(_uiCanvas);    // Priority 1000 (high)
_inputLayerManager.RegisterLayer(_gameLayer);   // Priority 0 (low)

// UI consumes input first, game gets remainder
_inputLayerManager.ProcessInput();
```

---

### 6. Audio Layer

#### Abstractions (`Brine2D.Audio`)

**Key Interfaces:**
- `IAudioService` - Audio playback
- `ISoundEffect` - Short sounds
- `IMusic` - Background music

#### Implementation (`Brine2D.Audio.SDL`)

**Key Classes:**
- `SDL3AudioService` - SDL3_mixer implementation with track callbacks **(Enhanced in v0.8.0)**

**Pattern:** Facade Pattern (simplifies SDL3_mixer)

```csharp
// Simple API for audio
await _audio.LoadSoundAsync("jump.wav");
_audio.PlaySound(jumpSound);

await _audio.LoadMusicAsync("background.mp3");
_audio.PlayMusic(music, loops: -1);
```

#### ECS Bridge (`Brine2D.Audio.ECS`) **(NEW in v0.8.0)**

**Key Components:**
- `AudioListenerComponent` - Spatial audio listener (player/camera)
- `AudioSourceComponent` - Positioned audio sources

**Key Systems:**
- `AudioSystem` - Updates spatial audio every frame

**Features:**
- Distance-based volume attenuation
- Stereo panning based on position
- Configurable falloff curves (linear, quadratic, custom)
- Real-time spatial audio updates

```csharp
// Create audio listener (player)
var player = _world.CreateEntity("Player");
var listener = player.AddComponent<AudioListenerComponent>();
listener.GlobalSpatialVolume = 1.0f;

// Create spatial audio source
var enemy = _world.CreateEntity("Enemy");
var audioSource = enemy.AddComponent<AudioSourceComponent>();
audioSource.SoundEffect = enemySound;
audioSource.EnableSpatialAudio = true;
audioSource.MinDistance = 100f;
audioSource.MaxDistance = 500f;
audioSource.RolloffFactor = 1.0f;
audioSource.SpatialBlend = 1.0f;
audioSource.PlayOnEnable = true;
```

---

### 7. Game Systems Layer

Game systems manage game logic and state. Unlike rendering utilities (which optimize performance), game systems implement gameplay features.

**UI System** (`Brine2D.UI`):
- `UICanvas` - Container for UI components
- `UIButton`, `UISlider`, `UITextInput`, etc. - Interactive components
- Input layer integration for event handling

**Collision System** (`Brine2D.Core.Collision`):
- `CollisionSystem` - Manages collision shapes and detection
- `BoxCollider`, `CircleCollider` - Collision shapes
- Optional spatial partitioning for performance

**Animation System** (`Brine2D.Core.Animation`):
- `SpriteAnimator` - Plays frame-based animations
- `AnimationClip` - Frame sequences
- `SpriteFrame` - Individual animation frames

**Tilemap System** (`Brine2D.Core.Tilemap`):
- `Tilemap` - Tile-based level data
- `TilemapRenderer` - Renders tilemaps efficiently
- `TmjLoader` - Loads Tiled JSON format

---

## Design Patterns Used

| Pattern | Where Used | Purpose |
|---------|------------|---------|
| **Builder** | `GameApplicationBuilder` | Fluent API for configuration |
| **Dependency Injection** | Everywhere | Loose coupling, testability |
| **Strategy** | `IRenderer` implementations | Swappable rendering backends |
| **Facade** | Audio, Input services | Simplify complex SDL3 APIs |
| **Observer** | Input events, animations, EventBus | Event-driven behavior |
| **Component** | UI system, ECS | Composable elements |
| **Mediator** | `GameEngine` | Coordinate subsystems |
| **Template Method** | `Scene` base class | Lifecycle hooks |
| **Chain of Responsibility** | Input layers | Prioritized input handling |
| **Object Pool** | Particle system | Zero-allocation particle reuse |
| **Bin Packing** | `AtlasBuilder` | Optimal texture packing **(NEW)** |

---

## Data Flow

### Initialization Flow

```mermaid
sequenceDiagram
    participant U as User Code
    participant B as GameApplicationBuilder
    participant G as GameApplication
    participant E as GameEngine
    participant R as IRenderer
    participant S as SceneManager
    
    U->>B: CreateBuilder(args)
    U->>B: Services.AddSDL3Rendering()
    U->>B: Services.AddScene<GameScene>()
    U->>B: Build()
    B->>G: new GameApplication(host)
    
    U->>G: RunAsync<GameScene>()
    G->>E: InitializeAsync()
    E->>R: InitializeAsync()
    R->>E: Initialized
    
    G->>S: LoadSceneAsync<GameScene>()
    S->>S: Resolve GameScene from DI
    S->>S: scene.Initialize()
    S->>S: scene.LoadAsync()
    
    G->>G: Start Game Loop
```

### Game Loop Flow

```mermaid
sequenceDiagram
    participant GL as GameLoop
    participant IN as InputService
    participant ILM as InputLayerManager
    participant SM as SceneManager
    participant SC as Scene
    participant ECS as EntityWorld
    participant AS as AudioSystem
    participant R as IRenderer
    
    loop Every Frame
        GL->>IN: Update()
        IN->>GL: Input Polled
        
        GL->>ILM: ProcessInput()
        ILM->>ILM: UI layer consumes?
        ILM->>GL: Input ready
        
        GL->>SM: Update(gameTime)
        SM->>SC: OnUpdate(gameTime)
        SC->>ECS: Update systems
        ECS->>AS: Update spatial audio
        AS->>ECS: Audio updated
        SC->>SC: Game logic
        SC->>SM: Done
        
        GL->>SM: Render(gameTime)
        SM->>SC: OnRender(gameTime)
        SC->>R: Draw calls
        R->>R: Present frame
        R->>SC: Rendered
        
        GL->>GL: Frame limiting
    end
```

---

## Extension Points

Brine2D is designed to be extended in several ways:

### 1. Custom Scenes

```csharp
public class MyScene : Scene
{
    // Override lifecycle methods
    protected override void OnInitialize() { }
    protected override Task OnLoadAsync(CancellationToken ct) { }
    protected override void OnUpdate(GameTime gt) { }
    protected override void OnRender(GameTime gt) { }
}
```

### 2. Custom Systems

```csharp
// Create your own game system
public class WeatherSystem
{
    private float _rainIntensity;
    
    public void Update(float deltaTime)
    {
        // Weather logic
    }
    
    public void Render(IRenderer renderer)
    {
        // Render rain particles
    }
}

// Register with DI
builder.Services.AddSingleton<WeatherSystem>();

// Inject into scene
public class GameScene : Scene
{
    private readonly WeatherSystem _weather;
    
    public GameScene(WeatherSystem weather, ...) 
    {
        _weather = weather;
    }
}
```

### 3. Custom Renderers

```csharp
// Implement IRenderer
public class CustomRenderer : IRenderer
{
    // Implement all methods...
}

// Register
builder.Services.AddSingleton<IRenderer, CustomRenderer>();
```

### 4. Custom Input Layers

```csharp
// Implement IInputLayer
public class DebugInputLayer : IInputLayer
{
    public int Priority => 500; // Between UI and game
    
    public bool ProcessKeyboardInput(IInputService input)
    {
        if (input.IsKeyPressed(Keys.F1))
        {
            ToggleDebugMode();
            return true; // Consume input
        }
        return false;
    }
}

// Register
_inputLayerManager.RegisterLayer(debugLayer);
```

### 5. Custom Audio Components **(NEW in v0.8.0)**

```csharp
// Extend AudioSourceComponent for custom behavior
public class DynamicAudioComponent : Component
{
    private AudioSourceComponent? _audioSource;
    
    protected internal override void OnInitialize()
    {
        _audioSource = Entity?.GetComponent<AudioSourceComponent>();
    }
    
    protected internal override void OnUpdate(GameTime gameTime)
    {
        // Custom audio behavior (e.g., adjust volume based on health)
        if (_audioSource != null)
        {
            var health = Entity?.GetComponent<HealthComponent>();
            _audioSource.Volume = health != null ? health.Percentage : 1.0f;
        }
    }
}
```

---

## Performance Considerations

### Memory Management

- **Object pooling** - Particle system reuses particles (zero allocation)
- **Scoped lifetimes** - `CollisionSystem`, `UICanvas` are scoped per scene
- **Singleton services** - `IRenderer`, `IInputService` are singletons
- **Struct types** - `Color`, `GameTime`, `Vector2` are value types
- **Texture atlasing** - Combines textures to reduce memory and draw calls **(NEW in v0.8.0)**

### Frame Budget

At 60 FPS, each frame has ~16.67ms:

| Phase | Typical Budget |
|-------|----------------|
| Input | <1ms |
| Update (Game Logic) | ~8ms |
| Update (ECS Systems) | ~2ms |
| Render | ~5ms |
| Frame limiting | ~1-2ms |

### Optimization Techniques

**Rendering Optimizations:**
- **Texture atlasing** - `AtlasBuilder` combines textures (90-99% draw call reduction) **(NEW)**
- **Sprite batching** - `SpriteBatcher` groups draw calls by texture
- **Culling** - Only render visible objects (camera frustum)

**Game Systems Optimizations:**
- **Spatial partitioning** - `CollisionSystem` supports grid partitioning
- **Object pooling** - Particle system uses `ObjectPool<T>`
- **Cached queries** - ECS queries with zero allocation

**General:**
- **Async loading** - Load assets without blocking the game loop

---

## Configuration

Configuration flows through `IOptions<T>` pattern (ASP.NET style):

```csharp
// gamesettings.json
{
  "Rendering": {
    "WindowTitle": "My Game",
    "WindowWidth": 1280,
    "WindowHeight": 720,
    "VSync": true,
    "Backend": "GPU"
  }
}

// Bind to options
builder.Services.AddSDL3Rendering(options =>
{
    builder.Configuration.GetSection("Rendering").Bind(options);
});

// Access in code
public class MyScene : Scene
{
    private readonly RenderingOptions _options;
    
    public MyScene(IOptions<RenderingOptions> options, ...)
    {
        _options = options.Value;
    }
}
```

---

## Thread Safety

- **Main thread only** - SDL3 requires all operations on the main thread
- **Async loading** - Use `Task.Run()` for CPU-bound work, return to main thread for SDL calls
- **No parallelism** - Game loop is single-threaded by design
- **Audio callbacks** - SDL3_mixer callbacks are thread-safe **(Enhanced in v0.8.0)**

```csharp
protected override async Task OnLoadAsync(CancellationToken ct)
{
    // CPU-bound work (parsing JSON)
    var data = await Task.Run(() => LoadHeavyData(), ct);
    
    // SDL work (texture creation) - back on main thread
    _texture = await _textureLoader.LoadTextureAsync("sprite.png", ct);
}
```

---

## What's New in v0.8.0

### Rendering Utilities
- **TextureAtlas** - Runtime sprite packing for massive draw call reduction
- **AtlasBuilder** - Intelligent bin packing algorithm (90-99% fewer draw calls)
- **SpriteBatcher enhancements** - Rotation support and better batching

### Spatial Audio (ECS)
- **AudioListenerComponent** - Spatial audio listener
- **AudioSourceComponent** - Positioned audio sources with distance attenuation
- **AudioSystem** - Real-time spatial audio updates with stereo panning

### Enhanced Particle System (ECS)
- **Particle textures** - Custom sprite textures instead of circles
- **Rotation** - Start, end, and rotation speed properties
- **Trails** - Motion trails with configurable length
- **Blend modes** - Additive, alpha, and none
- **7 emitter shapes** - Point, circle, ring, box, cone, line, burst

### Audio Improvements
- **Track callbacks** - SDL3_mixer callbacks for proper lifecycle
- **Thread-safe** - Improved callback handling

---

## Conceptual Distinctions

Understanding the difference between **rendering utilities** and **game systems** helps clarify Brine2D's architecture:

### Rendering Utilities (Performance)
- **Purpose**: Optimize rendering performance
- **Examples**: `SpriteBatcher`, `TextureAtlas`, `AtlasBuilder`
- **Location**: `Brine2D.Rendering` / `Brine2D.Rendering.SDL`
- **Focus**: Draw call reduction, batching, memory optimization

### Game Systems (Logic & State)
- **Purpose**: Implement gameplay features and manage state
- **Examples**: `CollisionSystem`, `UICanvas`, `SpriteAnimator`, `TilemapRenderer`
- **Location**: `Brine2D.Core.*` / `Brine2D.UI`
- **Focus**: Game logic, user interaction, entity management

---

## Next Steps

- **[Dependency Injection](dependency-injection.md)** - Master the DI container
- **[Builder Pattern](builder-pattern.md)** - Learn `GameApplicationBuilder`
- **[Scene Management](scenes.md)** - Organize your game
- **[Game Loop](game-loop.md)** - Understand frame processing
- **[Entity Component System](entity-component-system.md)** - ECS architecture

---

## Summary

Brine2D's architecture is:
- ✅ **Modular** - Clear separation of concerns
- ✅ **Extensible** - Plugin your own implementations
- ✅ **Testable** - Dependency injection everywhere
- ✅ **Familiar** - ASP.NET patterns throughout
- ✅ **Performant** - Designed for real-time games with modern optimizations
- ✅ **Production-Ready** - Texture atlasing, spatial audio, advanced particles **(v0.8.0)**

Ready to dive deeper? Explore [Dependency Injection](dependency-injection.md) next!