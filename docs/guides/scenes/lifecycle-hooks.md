---
title: Lifecycle Hooks
description: Inject custom behavior into scene lifecycle with hooks - similar to ASP.NET middleware
---

# Scene Lifecycle Hooks

Lifecycle hooks allow you to **inject behavior automatically** into the scene update and render loops. Think of them as **ASP.NET middleware for games** - registered once, executed automatically.

## Overview

**What are lifecycle hooks?**

Hooks run **before and after** scene update/render methods:

| Hook | When It Runs | Use For |
|------|--------------|---------|
| `PreUpdate` | Before `OnUpdate()` | Input layers, camera setup |
| `PostUpdate` | After `OnUpdate()` | ECS systems, physics, AI |
| `PreRender` | Before `OnRender()` | ECS rendering, sprite batching |
| `PostRender` | After `OnRender()` | Debug overlays, UI chrome |

**Why use hooks?**
- ✅ **Automatic** - registered once, runs for every scene
- ✅ **Ordered** - control execution order
- ✅ **Composable** - multiple hooks work together
- ✅ **Opt-out** - scenes can disable hooks if needed

---

## The ISceneLifecycleHook Interface

~~~csharp
public interface ISceneLifecycleHook
{
    /// <summary>
    /// Execution order (lower runs first).
    /// Recommended ranges:
    /// - 0-50: Pre-processing (input layers, camera setup)
    /// - 100-200: ECS systems
    /// - 500+: Post-processing (debug overlays, UI)
    /// </summary>
    int Order { get; }
    
    /// <summary>
    /// Called before scene.Update().
    /// Use for input processing, camera setup, etc.
    /// </summary>
    void PreUpdate(GameTime gameTime);
    
    /// <summary>
    /// Called after scene.Update().
    /// Use for ECS systems, physics, AI, etc.
    /// </summary>
    void PostUpdate(GameTime gameTime);
    
    /// <summary>
    /// Called before scene.Render().
    /// Use for ECS rendering, sprite batching, etc.
    /// </summary>
    void PreRender(GameTime gameTime);
    
    /// <summary>
    /// Called after scene.Render().
    /// Use for debug overlays, UI chrome, etc.
    /// </summary>
    void PostRender(GameTime gameTime);
}
~~~

---

## Execution Flow

### Update Loop with Hooks

~~~mermaid
sequenceDiagram
    participant SM as SceneManager
    participant H1 as Hook 1 (Order: 10)
    participant H2 as Hook 2 (Order: 100)
    participant S as Scene
    participant EW as EntityWorld
    participant H3 as Hook 3 (Order: 500)
    
    SM->>H1: PreUpdate(gameTime)
    SM->>H2: PreUpdate(gameTime)
    SM->>H3: PreUpdate(gameTime)
    
    SM->>S: OnUpdate(gameTime)
    Note over S: Scene game logic
    
    SM->>EW: Update(gameTime)
    Note over EW: Components updated
    
    SM->>H1: PostUpdate(gameTime)
    SM->>H2: PostUpdate(gameTime)
    Note over H2: ECS systems run here
    SM->>H3: PostUpdate(gameTime)
~~~

### Render Loop with Hooks

~~~mermaid
sequenceDiagram
    participant SM as SceneManager
    participant R as Renderer
    participant H1 as Hook 1 (Order: 10)
    participant H2 as Hook 2 (Order: 100)
    participant S as Scene
    participant H3 as Hook 3 (Order: 500)
    
    SM->>R: BeginFrame()
    
    SM->>H1: PreRender(gameTime)
    SM->>H2: PreRender(gameTime)
    Note over H2: ECS rendering
    SM->>H3: PreRender(gameTime)
    
    SM->>S: OnRender(gameTime)
    Note over S: Scene rendering
    
    SM->>H1: PostRender(gameTime)
    SM->>H2: PostRender(gameTime)
    SM->>H3: PostRender(gameTime)
    Note over H3: Debug overlays, UI
    
    SM->>R: EndFrame()
~~~

---

## Built-in Hooks

### ECSLifecycleHook

Brine2D includes a built-in hook for **ECS systems**:

~~~csharp
internal class ECSLifecycleHook : ISceneLifecycleHook
{
    private readonly UpdatePipeline _updatePipeline;
    
    public int Order => 100; // Runs in middle range
    
    public ECSLifecycleHook(UpdatePipeline updatePipeline)
    {
        _updatePipeline = updatePipeline;
    }
    
    public void PreUpdate(GameTime gameTime) { }
    
    public void PostUpdate(GameTime gameTime)
    {
        // Execute all ECS update systems
        _updatePipeline.Execute(gameTime);
    }
    
    public void PreRender(GameTime gameTime) { }
    public void PostRender(GameTime gameTime) { }
}
~~~

**Registered automatically** when you call `AddBrine2D()` or `AddObjectECS()`.

---

## Creating Custom Hooks

### Example: Debug Overlay Hook

~~~csharp
using Brine2D.Core;
using Brine2D.Engine;
using Brine2D.Rendering;

public class DebugOverlayHook : ISceneLifecycleHook
{
    private readonly IRenderer _renderer;
    private readonly IGameContext _gameContext;
    
    public int Order => 500; // Run after everything else
    
    public DebugOverlayHook(IRenderer renderer, IGameContext gameContext)
    {
        _renderer = renderer;
        _gameContext = gameContext;
    }
    
    public void PreUpdate(GameTime gameTime) { }
    public void PostUpdate(GameTime gameTime) { }
    public void PreRender(GameTime gameTime) { }
    
    public void PostRender(GameTime gameTime)
    {
        // Draw FPS counter
        var fps = 1.0 / gameTime.DeltaTime;
        _renderer.DrawText(
            $"FPS: {fps:F0}", 
            10, 10, 
            Color.Yellow);
        
        // Draw memory usage
        var memory = GC.GetTotalMemory(false) / 1024 / 1024;
        _renderer.DrawText(
            $"Memory: {memory} MB", 
            10, 30, 
            Color.Yellow);
    }
}

// Register in Program.cs
builder.Services.AddSingleton<ISceneLifecycleHook, DebugOverlayHook>();
~~~

---

### Example: Input Layer Hook

~~~csharp
using Brine2D.Core;
using Brine2D.Engine;
using Brine2D.Input;

public class InputLayerHook : ISceneLifecycleHook
{
    private readonly InputLayerManager _inputManager;
    
    public int Order => 10; // Run first
    
    public InputLayerHook(InputLayerManager inputManager)
    {
        _inputManager = inputManager;
    }
    
    public void PreUpdate(GameTime gameTime)
    {
        // Process input layers before scene update
        _inputManager.Update();
    }
    
    public void PostUpdate(GameTime gameTime) { }
    public void PreRender(GameTime gameTime) { }
    public void PostRender(GameTime gameTime) { }
}

// Register
builder.Services.AddSingleton<ISceneLifecycleHook, InputLayerHook>();
~~~

---

### Example: Camera Setup Hook

~~~csharp
using Brine2D.Core;
using Brine2D.Engine;
using Brine2D.Rendering;

public class CameraSetupHook : ISceneLifecycleHook
{
    private readonly IRenderer _renderer;
    private readonly Camera _camera;
    
    public int Order => 20; // After input, before scene update
    
    public CameraSetupHook(IRenderer renderer, Camera camera)
    {
        _renderer = renderer;
        _camera = camera;
    }
    
    public void PreUpdate(GameTime gameTime)
    {
        // Update camera before scene logic
        _camera.Update(gameTime);
    }
    
    public void PostUpdate(GameTime gameTime) { }
    
    public void PreRender(GameTime gameTime)
    {
        // Apply camera transform before rendering
        _renderer.SetCamera(_camera);
    }
    
    public void PostRender(GameTime gameTime)
    {
        // Reset camera after rendering
        _renderer.ResetCamera();
    }
}

// Register
builder.Services.AddSingleton<ISceneLifecycleHook, CameraSetupHook>();
~~~

---

## Hook Ordering

### Recommended Order Ranges

| Order Range | Purpose | Examples |
|-------------|---------|----------|
| **0-50** | Pre-processing | Input layers, camera setup, state validation |
| **100-200** | Core systems | ECS update systems, physics, AI |
| **300-400** | Effects & animations | Particle systems, animation controllers |
| **500+** | Post-processing | Debug overlays, UI chrome, profilers |

**Pattern:** Lower order = runs first. Use gaps (10, 20, 30) to allow insertion between hooks.

---

### Multiple Hooks Example

~~~csharp
var builder = GameApplication.CreateBuilder(args);

// Order: 10 - Input processing
builder.Services.AddSingleton<ISceneLifecycleHook, InputLayerHook>();

// Order: 20 - Camera setup
builder.Services.AddSingleton<ISceneLifecycleHook, CameraSetupHook>();

// Order: 100 - ECS systems (registered automatically)
builder.Services.AddBrine2D(options => { ... });

// Order: 300 - Particle effects
builder.Services.AddSingleton<ISceneLifecycleHook, ParticleSystemHook>();

// Order: 500 - Debug overlay
builder.Services.AddSingleton<ISceneLifecycleHook, DebugOverlayHook>();

var game = builder.Build();
~~~

**Execution order:**
1. InputLayerHook (10)
2. CameraSetupHook (20)
3. ECSLifecycleHook (100)
4. ParticleSystemHook (300)
5. DebugOverlayHook (500)

---

## Disabling Hooks Per Scene

Scenes can **opt-out** of hooks if they need manual control:

~~~csharp
public class CustomScene : Scene
{
    // Disable automatic lifecycle hooks
    public override bool EnableLifecycleHooks { get; set; } = false;
    
    protected override void OnUpdate(GameTime gameTime)
    {
        // ✅ Full manual control
        // No hooks run - you handle everything
    }
}
~~~

**Use cases:**
- Loading screens
- Cutscenes with custom update logic
- Performance-critical scenes
- Testing/debugging

---

## Advanced Patterns

### Conditional Hook Execution

~~~csharp
public class ConditionalDebugHook : ISceneLifecycleHook
{
    private readonly IRenderer _renderer;
    private readonly IConfiguration _config;
    
    public int Order => 500;
    
    public ConditionalDebugHook(IRenderer renderer, IConfiguration config)
    {
        _renderer = renderer;
        _config = config;
    }
    
    public void PreUpdate(GameTime gameTime) { }
    public void PostUpdate(GameTime gameTime) { }
    public void PreRender(GameTime gameTime) { }
    
    public void PostRender(GameTime gameTime)
    {
        // Only run in debug builds or when enabled
        if (!_config.GetValue<bool>("Debug:ShowOverlay"))
        {
            return;
        }
        
        // Draw debug info
        _renderer.DrawText("Debug Mode", 10, 10, Color.Red);
    }
}
~~~

---

### Hook with Scene Access

~~~csharp
public class SceneInfoHook : ISceneLifecycleHook
{
    private readonly ISceneManager _sceneManager;
    private readonly IRenderer _renderer;
    
    public int Order => 510;
    
    public SceneInfoHook(ISceneManager sceneManager, IRenderer renderer)
    {
        _sceneManager = sceneManager;
        _renderer = renderer;
    }
    
    public void PreUpdate(GameTime gameTime) { }
    public void PostUpdate(GameTime gameTime) { }
    public void PreRender(GameTime gameTime) { }
    
    public void PostRender(GameTime gameTime)
    {
        // Access current scene
        var scene = _sceneManager.CurrentScene;
        if (scene != null)
        {
            _renderer.DrawText(
                $"Scene: {scene.Name}", 
                10, 50, 
                Color.Cyan);
        }
    }
}
~~~

---

### Hook with Error Handling

Hooks run inside **try-catch blocks** - errors are logged but don't crash the game:

~~~csharp
public class RiskyHook : ISceneLifecycleHook
{
    private readonly ILogger<RiskyHook> _logger;
    
    public int Order => 100;
    
    public RiskyHook(ILogger<RiskyHook> logger)
    {
        _logger = logger;
    }
    
    public void PreUpdate(GameTime gameTime) { }
    
    public void PostUpdate(GameTime gameTime)
    {
        try
        {
            // Risky operation
            PerformComplexCalculation();
        }
        catch (Exception ex)
        {
            // ✅ SceneManager catches and logs this
            // Other hooks still run
            _logger.LogError(ex, "Complex calculation failed");
        }
    }
    
    public void PreRender(GameTime gameTime) { }
    public void PostRender(GameTime gameTime) { }
}
~~~

**Pattern:** SceneManager wraps hook calls in try-catch, logs errors, continues execution.

---

## Complete Example

### Game with Multiple Hooks

~~~csharp
using Brine2D.Hosting;
using Brine2D.SDL;
using Microsoft.Extensions.DependencyInjection;

var builder = GameApplication.CreateBuilder(args);

// Configure Brine2D (includes ECSLifecycleHook at order 100)
builder.Services.AddBrine2D(options =>
{
    options.WindowTitle = "Hook Demo";
    options.WindowWidth = 1280;
    options.WindowHeight = 720;
});

// Register custom hooks
builder.Services.AddSingleton<ISceneLifecycleHook, InputLayerHook>();     // Order: 10
builder.Services.AddSingleton<ISceneLifecycleHook, CameraSetupHook>();    // Order: 20
builder.Services.AddSingleton<ISceneLifecycleHook, ParticleSystemHook>(); // Order: 300
builder.Services.AddSingleton<ISceneLifecycleHook, DebugOverlayHook>();   // Order: 500

// Register scenes
builder.Services.AddScene<GameScene>();

var game = builder.Build();
await game.RunAsync<GameScene>();
~~~

### Hook Implementations

~~~csharp
// 1. Input Layer Hook (Order: 10)
public class InputLayerHook : ISceneLifecycleHook
{
    private readonly InputLayerManager _inputManager;
    public int Order => 10;
    
    public InputLayerHook(InputLayerManager inputManager) 
        => _inputManager = inputManager;
    
    public void PreUpdate(GameTime gameTime) 
        => _inputManager.Update();
    
    public void PostUpdate(GameTime gameTime) { }
    public void PreRender(GameTime gameTime) { }
    public void PostRender(GameTime gameTime) { }
}

// 2. Camera Setup Hook (Order: 20)
public class CameraSetupHook : ISceneLifecycleHook
{
    private readonly IRenderer _renderer;
    private readonly Camera _camera;
    public int Order => 20;
    
    public CameraSetupHook(IRenderer renderer, Camera camera)
    {
        _renderer = renderer;
        _camera = camera;
    }
    
    public void PreUpdate(GameTime gameTime) 
        => _camera.Update(gameTime);
    
    public void PostUpdate(GameTime gameTime) { }
    
    public void PreRender(GameTime gameTime) 
        => _renderer.SetCamera(_camera);
    
    public void PostRender(GameTime gameTime) 
        => _renderer.ResetCamera();
}

// 3. ECS Hook (Order: 100) - registered automatically

// 4. Particle System Hook (Order: 300)
public class ParticleSystemHook : ISceneLifecycleHook
{
    private readonly ParticleManager _particles;
    public int Order => 300;
    
    public ParticleSystemHook(ParticleManager particles) 
        => _particles = particles;
    
    public void PreUpdate(GameTime gameTime) { }
    public void PostUpdate(GameTime gameTime) 
        => _particles.Update(gameTime);
    
    public void PreRender(GameTime gameTime) 
        => _particles.Render();
    
    public void PostRender(GameTime gameTime) { }
}

// 5. Debug Overlay Hook (Order: 500)
public class DebugOverlayHook : ISceneLifecycleHook
{
    private readonly IRenderer _renderer;
    public int Order => 500;
    
    public DebugOverlayHook(IRenderer renderer) 
        => _renderer = renderer;
    
    public void PreUpdate(GameTime gameTime) { }
    public void PostUpdate(GameTime gameTime) { }
    public void PreRender(GameTime gameTime) { }
    
    public void PostRender(GameTime gameTime)
    {
        var fps = 1.0 / gameTime.DeltaTime;
        _renderer.DrawText($"FPS: {fps:F0}", 10, 10, Color.Yellow);
    }
}
~~~

---

## Best Practices

### ✅ DO

**1. Use appropriate order ranges**

~~~csharp
// ✅ Good - clear separation
public class InputHook : ISceneLifecycleHook 
{
    public int Order => 10; // Pre-processing
}

public class PhysicsHook : ISceneLifecycleHook 
{
    public int Order => 150; // Core systems
}

public class DebugHook : ISceneLifecycleHook 
{
    public int Order => 500; // Post-processing
}
~~~

**2. Keep hooks focused**

~~~csharp
// ✅ Good - single responsibility
public class InputLayerHook : ISceneLifecycleHook
{
    public void PreUpdate(GameTime gameTime)
    {
        // Only handle input layers
        _inputManager.Update();
    }
}
~~~

**3. Use constructor injection**

~~~csharp
// ✅ Good - DI services
public class MyHook : ISceneLifecycleHook
{
    private readonly IRenderer _renderer;
    private readonly ILogger<MyHook> _logger;
    
    public MyHook(IRenderer renderer, ILogger<MyHook> logger)
    {
        _renderer = renderer;
        _logger = logger;
    }
}
~~~

**4. Handle errors gracefully**

~~~csharp
// ✅ Good - defensive programming
public void PostUpdate(GameTime gameTime)
{
    try
    {
        PerformComplexOperation();
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Operation failed");
        // Don't throw - let other hooks run
    }
}
~~~

---

### ❌ DON'T

**1. Don't use conflicting orders**

~~~csharp
// ❌ Bad - same order as ECS hook
public class MyHook : ISceneLifecycleHook
{
    public int Order => 100; // Conflicts with ECSLifecycleHook!
}

// ✅ Good - use gap between ranges
public class MyHook : ISceneLifecycleHook
{
    public int Order => 150; // Clear gap
}
~~~

**2. Don't do heavy work in wrong phase**

~~~csharp
// ❌ Bad - rendering in update
public void PostUpdate(GameTime gameTime)
{
    _renderer.DrawText("Hello", 10, 10, Color.White); // Wrong phase!
}

// ✅ Good - render in render phase
public void PostRender(GameTime gameTime)
{
    _renderer.DrawText("Hello", 10, 10, Color.White); // Correct!
}
~~~

**3. Don't store scene references**

~~~csharp
// ❌ Bad - scene reference can become stale
private IScene? _currentScene;

public void PreUpdate(GameTime gameTime)
{
    _currentScene?.Update(gameTime); // Stale!
}

// ✅ Good - get scene from SceneManager
public void PreUpdate(GameTime gameTime)
{
    var scene = _sceneManager.CurrentScene; // Fresh!
}
~~~

**4. Don't block the hook**

~~~csharp
// ❌ Bad - blocking operation
public void PostUpdate(GameTime gameTime)
{
    Thread.Sleep(1000); // Freezes entire game!
    var data = DownloadData().Result; // Blocks!
}

// ✅ Good - async operations off-thread
public void PostUpdate(GameTime gameTime)
{
    // Queue async work for later
    _asyncQueue.Enqueue(async () => await DownloadData());
}
~~~

---

## Troubleshooting

### Problem: Hook not executing

**Symptom:** Your hook's methods never run.

**Solutions:**

1. **Check registration:**
   ~~~csharp
   // ✅ Correct
   builder.Services.AddSingleton<ISceneLifecycleHook, MyHook>();
   ~~~

2. **Verify scene has hooks enabled:**
   ~~~csharp
   public class MyScene : Scene
   {
       public override bool EnableLifecycleHooks { get; set; } = true; // ✅
   }
   ~~~

3. **Check hook is resolved:**
   ~~~csharp
   // Debug in startup
   var hooks = serviceProvider.GetServices<ISceneLifecycleHook>();
   Console.WriteLine($"Registered hooks: {hooks.Count()}");
   ~~~

---

### Problem: Hooks running in wrong order

**Symptom:** Hook A runs after Hook B, but should run before.

**Solution:**

~~~csharp
// Check Order properties
public class HookA : ISceneLifecycleHook
{
    public int Order => 10; // Should run first
}

public class HookB : ISceneLifecycleHook
{
    public int Order => 100; // Should run second
}
~~~

---

### Problem: Hook errors crash game

**Symptom:** Exception in hook stops entire game.

**Solution:**

Hooks are wrapped in try-catch by SceneManager:

~~~csharp
// This is handled automatically - errors are logged
public void PostUpdate(GameTime gameTime)
{
    throw new Exception("Oops!"); // Logged, other hooks continue
}

// But you should still handle your own errors
public void PostUpdate(GameTime gameTime)
{
    try
    {
        RiskyOperation();
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Operation failed");
    }
}
~~~

---

## Summary

**Lifecycle hooks:**

| Hook | Phase | Use For |
|------|-------|---------|
| `PreUpdate` | Before scene update | Input processing, state setup |
| `PostUpdate` | After scene update | ECS systems, physics, AI |
| `PreRender` | Before scene render | ECS rendering, sprite batching |
| `PostRender` | After scene render | Debug overlays, UI chrome |

**Key benefits:**

| Benefit | Description |
|---------|-------------|
| **Automatic** | Registered once, runs for all scenes |
| **Ordered** | Control execution order with `Order` property |
| **Composable** | Multiple hooks work together seamlessly |
| **Flexible** | Scenes can opt-out with `EnableLifecycleHooks = false` |

**Common patterns:**

| Pattern | Usage |
|---------|-------|
| **Pre-processing hooks** | Order 0-50 (input, camera) |
| **Core system hooks** | Order 100-200 (ECS, physics) |
| **Post-processing hooks** | Order 500+ (debug, UI) |
| **Conditional execution** | Check config/flags before running |

---

## Next Steps

- **[Scene Transitions](transitions.md)** - Smooth scene changes
- **[ECS Systems](../ecs/systems.md)** - Build custom ECS systems
- **[Scene Management](../../concepts/scenes.md)** - Complete scene lifecycle
- **[Dependency Injection](../../concepts/dependency-injection.md)** - Service registration patterns

---

**Remember:** Lifecycle hooks run automatically for every scene (unless disabled). Use them to inject cross-cutting behavior like input processing, ECS systems, or debug overlays! 🎮