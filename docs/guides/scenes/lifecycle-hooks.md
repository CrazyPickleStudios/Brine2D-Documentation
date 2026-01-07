---
title: Lifecycle Hooks
description: Advanced manual control for power users
---

# Lifecycle Hooks

Lifecycle hooks provide fine-grained control over when and how your game logic executes. This guide covers advanced usage for power users who need manual control.

!!! info "Advanced Feature"
    Most games should use automatic execution. Only opt-out if you have a specific need for manual control.

---

## What Are Lifecycle Hooks?

Lifecycle hooks are integration points where Brine2D automatically executes systems (like ECS pipelines) at specific points in the game loop:

~~~mermaid
graph LR
    A[Input] --> B[PreUpdate Hooks]
    B --> C[Scene.Update]
    C --> D[PostUpdate Hooks]
    D --> E[PreRender Hooks]
    E --> F[Scene.Render]
    F --> G[PostRender Hooks]
    
    style A fill:#264f78,stroke:#4fc1ff,stroke-width:2px,color:#fff
    style B fill:#2d5016,stroke:#4ec9b0,stroke-width:2px,color:#fff
    style C fill:#1e3a5f,stroke:#569cd6,stroke-width:2px,color:#fff
    style D fill:#2d5016,stroke:#4ec9b0,stroke-width:2px,color:#fff
    style E fill:#2d5016,stroke:#4ec9b0,stroke-width:2px,color:#fff
    style F fill:#1e3a5f,stroke:#569cd6,stroke-width:2px,color:#fff
    style G fill:#2d5016,stroke:#4ec9b0,stroke-width:2px,color:#fff
~~~

**Default behavior (automatic execution):**

- ✅ Input layers process input automatically
- ✅ ECS systems run automatically at correct times
- ✅ Frame management handled automatically (`Clear`/`BeginFrame`/`EndFrame`)
- ✅ Components update automatically

---

## Automatic vs Manual Execution

### Automatic Execution (Default)

This is what most games should use:

~~~csharp
public class GameScene : Scene
{
    private readonly IEntityWorld _world;
    
    protected override void OnUpdate(GameTime gameTime)
    {
        // Just write your game logic
        CheckWinCondition();
        
        // Systems run automatically!
        // Components update automatically!
    }
    
    protected override void OnRender(GameTime gameTime)
    {
        // Frame management automatic!
        // ECS rendering automatic!
        
        _renderer.DrawText($"Score: {_score}", 10, 10, Color.White);
    }
}
~~~

**Benefits:**

- Simple and straightforward
- Less boilerplate code
- Hard to mess up
- ASP.NET-like developer experience

### Manual Execution (Power Users)

Disable automatic behavior when you need fine control:

~~~csharp
public class ManualControlScene : Scene
{
    private readonly UpdatePipeline _updatePipeline;
    
    // Disable automatic system execution
    public override bool EnableLifecycleHooks => false;
    
    protected override void OnUpdate(GameTime gameTime)
    {
        // Manually execute systems
        _updatePipeline.Execute(gameTime);
        _world.Update(gameTime);
    }
}
~~~

**Use manual control when:**

- You need custom execution order
- You want conditional system execution
- You're implementing fixed timestep logic
- You need to skip systems based on game state

---

## Disabling Automatic Behavior

### Option 1: Disable Lifecycle Hooks Only

Keep automatic frame management but control systems manually:

~~~csharp
public class ManualSystemsScene : Scene
{
    private readonly UpdatePipeline _updatePipeline;
    private readonly RenderPipeline _renderPipeline;
    
    public override bool EnableLifecycleHooks => false;
    
    public ManualSystemsScene(
        UpdatePipeline updatePipeline,
        RenderPipeline renderPipeline,
        ILogger<ManualSystemsScene> logger) : base(logger)
    {
        _updatePipeline = updatePipeline;
        _renderPipeline = renderPipeline;
    }
    
    protected override void OnUpdate(GameTime gameTime)
    {
        _updatePipeline.Execute(gameTime);
    }
    
    protected override void OnRender(GameTime gameTime)
    {
        // Frame management still automatic
        _renderPipeline.Execute(_renderer);
    }
}
~~~

### Option 2: Full Manual Control

Disable both system execution and frame management:

~~~csharp
public class FullManualControlScene : Scene
{
    private readonly IRenderer _renderer;
    private readonly UpdatePipeline _updatePipeline;
    private readonly RenderPipeline _renderPipeline;
    
    public override bool EnableLifecycleHooks => false;
    public override bool EnableAutomaticFrameManagement => false;
    
    protected override void OnUpdate(GameTime gameTime)
    {
        _updatePipeline.Execute(gameTime);
    }
    
    protected override void OnRender(GameTime gameTime)
    {
        _renderer.Clear(Color.Black);
        _renderer.BeginFrame();
        
        _renderPipeline.Execute(_renderer);
        
        _renderer.EndFrame();
    }
}
~~~

---

## Understanding Hook Execution Order

~~~mermaid
sequenceDiagram
    participant GL as Game Loop
    participant SM as SceneManager
    participant H as Lifecycle Hooks
    participant S as Scene
    
    GL->>SM: Update()
    
    SM->>H: PreUpdate Hooks
    Note over H: Input layers, etc.
    
    SM->>S: OnUpdate()
    Note over S: Your game logic
    
    SM->>H: PostUpdate Hooks
    Note over H: ECS systems, physics
    
    GL->>SM: Render()
    
    SM->>H: PreRender Hooks
    Note over H: ECS rendering
    
    SM->>S: OnRender()
    Note over S: Your UI/debug
    
    SM->>H: PostRender Hooks
    Note over H: Debug overlays
~~~

**Built-in hooks:**

| Hook | Order | Phase | Purpose |
|------|-------|-------|---------|
| InputLayerHook | 0 | PreUpdate | Process input layers |
| ECSUpdateHook | 100 | PostUpdate | Run ECS update systems |
| ECSRenderHook | 0 | PreRender | Run ECS render systems |

---

## Practical Examples

### Pausable Game

Run systems only when game is not paused:

~~~csharp
public class PausableGameScene : Scene
{
    private readonly UpdatePipeline _updatePipeline;
    private readonly IEntityWorld _world;
    private readonly IInputService _input;
    private bool _isPaused;
    
    public override bool EnableLifecycleHooks => false;
    
    protected override void OnUpdate(GameTime gameTime)
    {
        // Always handle input
        if (_input.IsKeyPressed(Keys.P))
        {
            _isPaused = !_isPaused;
            Logger.LogInformation("Game {State}", _isPaused ? "PAUSED" : "RESUMED");
        }
        
        // Only run systems when not paused
        if (!_isPaused)
        {
            _updatePipeline.Execute(gameTime);
            _world.Update(gameTime);
        }
    }
}
~~~

### Fixed Timestep

Implement frame-rate independent physics:

~~~csharp
public class FixedTimestepScene : Scene
{
    private readonly UpdatePipeline _updatePipeline;
    private const float FixedDeltaTime = 1f / 60f;
    private float _accumulator;
    
    public override bool EnableLifecycleHooks => false;
    
    protected override void OnUpdate(GameTime gameTime)
    {
        var deltaTime = (float)gameTime.DeltaTime;
        _accumulator += deltaTime;
        
        while (_accumulator >= FixedDeltaTime)
        {
            var fixedGameTime = new GameTime(
                gameTime.TotalTime,
                FixedDeltaTime,
                gameTime.FrameCount
            );
            
            _updatePipeline.Execute(fixedGameTime);
            _accumulator -= FixedDeltaTime;
        }
    }
}
~~~

### Selective System Execution

Run only specific systems:

~~~csharp
public class CustomPipelineScene : Scene
{
    private readonly PlayerControllerSystem _playerController;
    private readonly PhysicsSystem _physics;
    private readonly SpriteRenderingSystem _spriteRenderer;
    
    public override bool EnableLifecycleHooks => false;
    public override bool EnableAutomaticFrameManagement => false;
    
    protected override void OnUpdate(GameTime gameTime)
    {
        _playerController.Update(gameTime);
        _physics.Update(gameTime);
        // Skip AI, audio, etc.
    }
    
    protected override void OnRender(GameTime gameTime)
    {
        _renderer.Clear(Color.Black);
        _renderer.BeginFrame();
        
        _spriteRenderer.Render(_renderer);
        // Skip particles, debug rendering
        
        _renderer.EndFrame();
    }
}
~~~

---

## Best Practices

!!! success "Do This"
    ✅ Use automatic execution by default  
    ✅ Document why you disabled hooks  
    ✅ Keep manual logic simple  
    ✅ Test thoroughly  

!!! failure "Avoid This"
    ❌ Disabling hooks without a reason  
    ❌ Forgetting to call systems  
    ❌ Mixing automatic and manual in same scene  
    ❌ Skipping frame management calls  

---

## Performance Considerations

**Automatic execution overhead:**

The overhead of automatic hooks is negligible (~0.01ms). Don't disable for performance unless profiling proves it's necessary.

**Manual control CAN help when:**

- Skipping entire systems based on game state
- Batching expensive operations
- Running systems at different intervals
- Implementing custom scheduling

~~~csharp
public class OptimizedScene : Scene
{
    private readonly AISystem _aiSystem;
    private int _frameCount;
    
    public override bool EnableLifecycleHooks => false;
    
    protected override void OnUpdate(GameTime gameTime)
    {
        _frameCount++;
        
        // Run AI every 3 frames instead of every frame
        if (_frameCount % 3 == 0)
        {
            _aiSystem.Update(gameTime);
        }
    }
}
~~~

---

## Debugging Manual Execution

### Check Hook Status at Startup

~~~csharp
protected override void OnInitialize()
{
    if (!EnableLifecycleHooks)
    {
        Logger.LogWarning("Lifecycle hooks DISABLED - manual control active");
    }
    
    if (!EnableAutomaticFrameManagement)
    {
        Logger.LogWarning("Frame management DISABLED - you must call Clear/BeginFrame/EndFrame");
    }
}
~~~

### Common Issues

**Problem:** Systems not running

~~~csharp
// Check if hooks are enabled
public override bool EnableLifecycleHooks => true; // ← Make sure this is true

// Or call systems manually
_updatePipeline.Execute(gameTime);
~~~

**Problem:** Black screen

~~~csharp
// Enable automatic frame management
public override bool EnableAutomaticFrameManagement => true;

// Or call manually
_renderer.Clear(Color.Black);
_renderer.BeginFrame();
// ... rendering ...
_renderer.EndFrame();
~~~

---

## Migration Guide

### From Automatic to Manual

**Before:**

~~~csharp
public class GameScene : Scene
{
    protected override void OnUpdate(GameTime gameTime)
    {
        // Game logic
    }
}
~~~

**After:**

~~~csharp
public class GameScene : Scene
{
    private readonly UpdatePipeline _updatePipeline;
    private readonly IEntityWorld _world;
    
    public override bool EnableLifecycleHooks => false; // Add this
    
    public GameScene(
        UpdatePipeline updatePipeline,
        IEntityWorld world,
        ILogger<GameScene> logger) : base(logger)
    {
        _updatePipeline = updatePipeline;
        _world = world;
    }
    
    protected override void OnUpdate(GameTime gameTime)
    {
        // Game logic
        
        _updatePipeline.Execute(gameTime); // Add this
        _world.Update(gameTime);           // Add this
    }
}
~~~

### From Manual to Automatic

Remove the overrides and manual calls:

~~~csharp
public class GameScene : Scene
{
    // Remove: public override bool EnableLifecycleHooks => false;
    // Remove: _updatePipeline.Execute(gameTime);
    
    protected override void OnUpdate(GameTime gameTime)
    {
        // Just your game logic
    }
}
~~~

---

## Summary

| Feature | Automatic | Manual |
|---------|-----------|--------|
| Complexity | Low | High |
| Flexibility | Medium | Maximum |
| Error-prone | Low | High |
| Performance | Excellent | Excellent |
| Recommended | Most games | Advanced needs |

**Key takeaway:** Start with automatic execution. Only switch to manual control when you hit a specific limitation.

---

## See Also

- [Scene Lifecycle](lifecycle.md) - Understanding scene phases
- [Scene Transitions](transitions.md) - Loading screens and fades
- [ECS Systems](../ecs/systems.md) - Creating custom systems
- [Game Loop](../../concepts/game-loop.md) - How the game loop works

---

## Next Steps

- Learn about [Scene Transitions](transitions.md) for smooth scene changes
- Explore [ECS Systems](../ecs/systems.md) to create custom game logic
- Check out the [Manual Control Sample](../../samples/advanced.md) for complete examples