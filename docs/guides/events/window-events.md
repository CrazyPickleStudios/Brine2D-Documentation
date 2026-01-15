---
title: Window Events
description: Handle window resize, minimize, and lifecycle events in Brine2D
---

# Window Events

Learn how to respond to window state changes like resizing, minimizing, and focus events using Brine2D's event system.

## Overview

Window events allow your game to respond to changes in the window state, enabling responsive UI, dynamic resolution, and better user experience.

**What you'll learn:**

- Subscribing to window events
- Handling window resize
- Responsive UI and camera adjustment
- Window lifecycle management
- Best practices for window event handling

**New in v0.7.0:**
- `EventBus` moved to `Brine2D.Core` for global accessibility
- Built-in window event support
- Automatic viewport updates in renderers

---

## Prerequisites

- Understanding of [Dependency Injection](../../concepts/dependency-injection.md)
- Familiarity with [Scenes](../../concepts/scenes.md)
- Basic knowledge of [EventBus](../ecs/events.md) (optional)

---

## Quick Example

### Responding to Window Resize

```csharp
using Brine2D.Core;
using Brine2D.SDL.Common.Events;
using Microsoft.Extensions.Logging;

public class ResponsiveScene : Scene
{
    private readonly EventBus? _eventBus;
    private readonly IRenderer _renderer;
    
    private int _windowWidth = 1280;
    private int _windowHeight = 720;
    
    public ResponsiveScene(
        EventBus? eventBus,
        IRenderer renderer,
        ILogger<ResponsiveScene> logger) : base(logger)
    {
        _eventBus = eventBus;
        _renderer = renderer;
    }
    
    protected override void OnInitialize()
    {
        // Subscribe to window resize events
        _eventBus?.Subscribe<WindowResizedEvent>(OnWindowResized);
    }
    
    private void OnWindowResized(WindowResizedEvent evt)
    {
        Logger.LogInformation("Window resized to {Width}x{Height}", 
            evt.Width, evt.Height);
        
        _windowWidth = evt.Width;
        _windowHeight = evt.Height;
        
        // Update UI layout
        UpdateUILayout();
    }
    
    private void UpdateUILayout()
    {
        // Reposition UI elements based on new window size
        // e.g., center menu, scale HUD, etc.
    }
    
    protected override void OnDispose()
    {
        // Always unsubscribe!
        _eventBus?.Unsubscribe<WindowResizedEvent>(OnWindowResized);
    }
}
```

---

## Available Window Events

### WindowResizedEvent

Raised when the window dimensions change.

**Event Definition:**

```csharp
// In Brine2D.SDL.Common.Events namespace
public record WindowResizedEvent(int Width, int Height);
```

**When triggered:**
- User manually resizes window
- Window maximized/restored
- Fullscreen toggled
- Display resolution changed

**Example:**

```csharp
_eventBus?.Subscribe<WindowResizedEvent>(evt =>
{
    Logger.LogInformation("New size: {Width}x{Height}", evt.Width, evt.Height);
    
    // Renderer viewport is automatically updated
    // Your code handles UI/camera adjustments
});
```

---

## Setup and Registration

### Register EventBus

```csharp Program.cs
using Brine2D.Core;
using Brine2D.Hosting;
using Brine2D.Rendering.SDL;

var builder = GameApplication.CreateBuilder(args);

// Register EventBus (optional, but needed for custom events)
builder.Services.AddSingleton<EventBus>();

// Renderer automatically receives EventBus
builder.Services.AddSDL3Rendering(options =>
{
    builder.Configuration.GetSection("Rendering").Bind(options);
    options.Resizable = true;  // Enable window resizing
});

builder.Services.AddScene<GameScene>();

var game = builder.Build();
await game.RunAsync<GameScene>();
```

**Note:** If you don't register `EventBus`, the renderer still works but you won't receive window events in your scenes.

---

## Subscribing to Events

### Method 1: In OnInitialize (Recommended)

```csharp
public class GameScene : Scene
{
    private readonly EventBus? _eventBus;
    
    public GameScene(EventBus? eventBus, ILogger<GameScene> logger) : base(logger)
    {
        _eventBus = eventBus;
    }
    
    protected override void OnInitialize()
    {
        // Subscribe during initialization
        _eventBus?.Subscribe<WindowResizedEvent>(OnWindowResized);
    }
    
    private void OnWindowResized(WindowResizedEvent evt)
    {
        // Handle resize
    }
    
    protected override void OnDispose()
    {
        // IMPORTANT: Always unsubscribe!
        _eventBus?.Unsubscribe<WindowResizedEvent>(OnWindowResized);
    }
}
```

---

### Method 2: Lambda Expression

```csharp
protected override void OnInitialize()
{
    _eventBus?.Subscribe<WindowResizedEvent>(evt =>
    {
        Logger.LogInformation("Resized to {Width}x{Height}", evt.Width, evt.Height);
        UpdateLayout(evt.Width, evt.Height);
    });
}
```

**⚠️ Warning:** Lambda expressions are harder to unsubscribe from. Use named methods when possible.

---

## Common Use Cases

### 1. Responsive UI Layout

```csharp
public class MenuScene : Scene
{
    private readonly EventBus? _eventBus;
    private readonly UICanvas _uiCanvas;
    
    private UIButton _playButton;
    private UIButton _settingsButton;
    private UIButton _exitButton;
    
    protected override void OnInitialize()
    {
        _eventBus?.Subscribe<WindowResizedEvent>(OnWindowResized);
        
        // Initial layout
        LayoutUI(_windowWidth, _windowHeight);
    }
    
    private void OnWindowResized(WindowResizedEvent evt)
    {
        LayoutUI(evt.Width, evt.Height);
    }
    
    private void LayoutUI(int width, int height)
    {
        // Center menu vertically and horizontally
        var centerX = width / 2f;
        var centerY = height / 2f;
        
        var buttonWidth = 200f;
        var buttonHeight = 50f;
        var buttonSpacing = 60f;
        
        _playButton.Position = new Vector2(
            centerX - buttonWidth / 2,
            centerY - buttonSpacing);
        
        _settingsButton.Position = new Vector2(
            centerX - buttonWidth / 2,
            centerY);
        
        _exitButton.Position = new Vector2(
            centerX - buttonWidth / 2,
            centerY + buttonSpacing);
    }
    
    protected override void OnDispose()
    {
        _eventBus?.Unsubscribe<WindowResizedEvent>(OnWindowResized);
    }
}
```

---

### 2. Camera Viewport Adjustment

```csharp
using Brine2D.Rendering;

public class GameScene : Scene
{
    private readonly EventBus? _eventBus;
    private readonly IRenderer _renderer;
    
    private Camera2D? _camera;
    
    protected override void OnInitialize()
    {
        // Create camera
        _camera = new Camera2D(1280, 720)
        {
            Position = new Vector2(0, 0),
            Zoom = 1.0f
        };
        
        _renderer.Camera = _camera;
        
        // Subscribe to resize
        _eventBus?.Subscribe<WindowResizedEvent>(OnWindowResized);
    }
    
    private void OnWindowResized(WindowResizedEvent evt)
    {
        if (_camera != null)
        {
            // Update camera viewport
            _camera.ViewportWidth = evt.Width;
            _camera.ViewportHeight = evt.Height;
            
            Logger.LogInformation("Camera viewport updated to {Width}x{Height}",
                evt.Width, evt.Height);
        }
    }
    
    protected override void OnDispose()
    {
        _eventBus?.Unsubscribe<WindowResizedEvent>(OnWindowResized);
    }
}
```

---

### 3. Dynamic Resolution Scaling

```csharp
public class PerformanceScene : Scene
{
    private readonly EventBus? _eventBus;
    
    private float _renderScale = 1.0f;
    private int _targetWidth = 1280;
    private int _targetHeight = 720;
    
    protected override void OnInitialize()
    {
        _eventBus?.Subscribe<WindowResizedEvent>(OnWindowResized);
    }
    
    private void OnWindowResized(WindowResizedEvent evt)
    {
        // Calculate scale factor
        var widthScale = evt.Width / (float)_targetWidth;
        var heightScale = evt.Height / (float)_targetHeight;
        
        // Use smallest scale to maintain aspect ratio
        _renderScale = Math.Min(widthScale, heightScale);
        
        Logger.LogInformation("Render scale adjusted to {Scale:F2}", _renderScale);
        
        // Adjust rendering resolution
        AdjustRenderResolution(_renderScale);
    }
    
    private void AdjustRenderResolution(float scale)
    {
        // Scale sprite sizes, font sizes, etc.
        // Useful for maintaining performance on lower-end hardware
    }
    
    protected override void OnDispose()
    {
        _eventBus?.Unsubscribe<WindowResizedEvent>(OnWindowResized);
    }
}
```

---

### 4. HUD Repositioning

```csharp
public class GameplayScene : Scene
{
    private readonly EventBus? _eventBus;
    private readonly UICanvas _uiCanvas;
    
    private UILabel _scoreLabel;
    private UILabel _healthLabel;
    private UILabel _fpsLabel;
    
    protected override void OnInitialize()
    {
        _eventBus?.Subscribe<WindowResizedEvent>(OnWindowResized);
        
        // Initial HUD layout
        PositionHUD(_windowWidth, _windowHeight);
    }
    
    private void OnWindowResized(WindowResizedEvent evt)
    {
        PositionHUD(evt.Width, evt.Height);
    }
    
    private void PositionHUD(int width, int height)
    {
        // Top-left: Score
        _scoreLabel.Position = new Vector2(10, 10);
        
        // Top-right: FPS
        _fpsLabel.Position = new Vector2(width - 100, 10);
        
        // Bottom-left: Health
        _healthLabel.Position = new Vector2(10, height - 40);
    }
    
    protected override void OnDispose()
    {
        _eventBus?.Unsubscribe<WindowResizedEvent>(OnWindowResized);
    }
}
```

---

### 5. Aspect Ratio Maintenance

```csharp
public class AspectRatioScene : Scene
{
    private readonly EventBus? _eventBus;
    private readonly IRenderer _renderer;
    
    private const float TargetAspectRatio = 16f / 9f;  // 16:9
    
    private Rectangle _renderArea;
    
    protected override void OnInitialize()
    {
        _eventBus?.Subscribe<WindowResizedEvent>(OnWindowResized);
        
        // Calculate initial render area
        CalculateRenderArea(_windowWidth, _windowHeight);
    }
    
    private void OnWindowResized(WindowResizedEvent evt)
    {
        CalculateRenderArea(evt.Width, evt.Height);
    }
    
    private void CalculateRenderArea(int windowWidth, int windowHeight)
    {
        var windowAspect = windowWidth / (float)windowHeight;
        
        if (windowAspect > TargetAspectRatio)
        {
            // Window is wider than target - letterbox sides
            var renderWidth = (int)(windowHeight * TargetAspectRatio);
            var offsetX = (windowWidth - renderWidth) / 2;
            
            _renderArea = new Rectangle(offsetX, 0, renderWidth, windowHeight);
        }
        else
        {
            // Window is taller than target - letterbox top/bottom
            var renderHeight = (int)(windowWidth / TargetAspectRatio);
            var offsetY = (windowHeight - renderHeight) / 2;
            
            _renderArea = new Rectangle(0, offsetY, windowWidth, renderHeight);
        }
        
        Logger.LogInformation("Render area: {X}, {Y}, {Width}x{Height}",
            _renderArea.X, _renderArea.Y, _renderArea.Width, _renderArea.Height);
    }
    
    protected override void OnRender(GameTime gameTime)
    {
        _renderer.Clear(Color.Black);
        _renderer.BeginFrame();
        
        // Draw letterbox bars (black)
        // Your game renders within _renderArea
        
        _renderer.EndFrame();
    }
    
    protected override void OnDispose()
    {
        _eventBus?.Unsubscribe<WindowResizedEvent>(OnWindowResized);
    }
}
```

---

## Best Practices

### DO

1. **Always unsubscribe in OnDispose**

   ```csharp
   protected override void OnDispose()
   {
       _eventBus?.Unsubscribe<WindowResizedEvent>(OnWindowResized);
   }
   ```

2. **Use named methods for event handlers**

   ```csharp
   // ✅ Good - easy to unsubscribe
   _eventBus?.Subscribe<WindowResizedEvent>(OnWindowResized);
   
   private void OnWindowResized(WindowResizedEvent evt)
   {
       // Handle event
   }
   ```

3. **Check for null EventBus**

   ```csharp
   // ✅ Good - EventBus is optional
   _eventBus?.Subscribe<WindowResizedEvent>(OnWindowResized);
   ```

4. **Subscribe in OnInitialize**

   ```csharp
   // ✅ Good - consistent lifecycle
   protected override void OnInitialize()
   {
       _eventBus?.Subscribe<WindowResizedEvent>(OnWindowResized);
   }
   ```

5. **Enable window resizing if needed**

   ```csharp
   // ✅ In configuration
   options.Resizable = true;
   ```

---

### DON'T

1. **Don't forget to unsubscribe**

   ```csharp
   // ❌ Bad - memory leak!
   protected override void OnDispose()
   {
       // Forgot to unsubscribe!
   }
   ```

2. **Don't use lambdas without storing reference**

   ```csharp
   // ❌ Bad - can't unsubscribe
   _eventBus?.Subscribe<WindowResizedEvent>(evt =>
   {
       // Can't unsubscribe this!
   });
   ```

3. **Don't subscribe multiple times**

   ```csharp
   // ❌ Bad - duplicate subscriptions
   protected override void OnInitialize()
   {
       _eventBus?.Subscribe<WindowResizedEvent>(OnWindowResized);
       _eventBus?.Subscribe<WindowResizedEvent>(OnWindowResized);  // Duplicate!
   }
   ```

4. **Don't assume EventBus exists**

   ```csharp
   // ❌ Bad - might be null
   _eventBus.Subscribe<WindowResizedEvent>(OnWindowResized);
   
   // ✅ Good - null-conditional
   _eventBus?.Subscribe<WindowResizedEvent>(OnWindowResized);
   ```

---

## Advanced Patterns

### Debouncing Resize Events

Handle resize events after user finishes resizing:

```csharp
public class DebouncedResizeScene : Scene
{
    private readonly EventBus? _eventBus;
    
    private DateTime _lastResizeTime;
    private int _pendingWidth;
    private int _pendingHeight;
    private bool _resizePending;
    
    private const double DebounceMs = 500;  // Wait 500ms after last resize
    
    protected override void OnInitialize()
    {
        _eventBus?.Subscribe<WindowResizedEvent>(OnWindowResized);
    }
    
    private void OnWindowResized(WindowResizedEvent evt)
    {
        // Store resize event
        _lastResizeTime = DateTime.UtcNow;
        _pendingWidth = evt.Width;
        _pendingHeight = evt.Height;
        _resizePending = true;
    }
    
    protected override void OnUpdate(GameTime gameTime)
    {
        if (_resizePending)
        {
            var elapsed = (DateTime.UtcNow - _lastResizeTime).TotalMilliseconds;
            
            if (elapsed >= DebounceMs)
            {
                // User stopped resizing - apply changes
                ApplyResize(_pendingWidth, _pendingHeight);
                _resizePending = false;
            }
        }
    }
    
    private void ApplyResize(int width, int height)
    {
        Logger.LogInformation("Applying resize to {Width}x{Height}", width, height);
        
        // Expensive operations here (e.g., regenerate UI, reload assets)
    }
    
    protected override void OnDispose()
    {
        _eventBus?.Unsubscribe<WindowResizedEvent>(OnWindowResized);
    }
}
```

---

### Multi-Scene Event Handling

Share window state across scenes:

```csharp
// Shared service
public class WindowStateService
{
    public int Width { get; private set; } = 1280;
    public int Height { get; private set; } = 720;
    
    public event Action<int, int>? SizeChanged;
    
    public void UpdateSize(int width, int height)
    {
        Width = width;
        Height = height;
        SizeChanged?.Invoke(width, height);
    }
}
```

```csharp Program.cs
// Register as singleton
builder.Services.AddSingleton<WindowStateService>();

// Initialize with EventBus
builder.Services.AddSingleton(provider =>
{
    var windowState = new WindowStateService();
    var eventBus = provider.GetService<EventBus>();
    
    eventBus?.Subscribe<WindowResizedEvent>(evt =>
    {
        windowState.UpdateSize(evt.Width, evt.Height);
    });
    
    return windowState;
});
```

```csharp
// Use in scenes
public class GameScene : Scene
{
    private readonly WindowStateService _windowState;
    
    public GameScene(WindowStateService windowState, ILogger<GameScene> logger) 
        : base(logger)
    {
        _windowState = windowState;
        _windowState.SizeChanged += OnSizeChanged;
    }
    
    private void OnSizeChanged(int width, int height)
    {
        // Handle resize
    }
    
    protected override void OnDispose()
    {
        _windowState.SizeChanged -= OnSizeChanged;
    }
}
```

---

## Renderer Integration

Both GPU and Legacy renderers automatically handle window events:

```csharp
// In SDL3GPURenderer / SDL3Renderer
public SDL3Renderer(
    ILogger<SDL3Renderer> logger,
    ILoggerFactory loggerFactory,
    IOptions<RenderingOptions> options,
    IFontLoader? fontLoader = null,
    EventBus? eventBus = null)  // EventBus injected
{
    _eventBus = eventBus;
    
    // Renderer subscribes to window events
    _eventBus?.Subscribe<WindowResizedEvent>(OnWindowResized);
}

private void OnWindowResized(WindowResizedEvent evt)
{
    // Renderer updates viewport automatically
    _viewport.Update(evt.Width, evt.Height);
    UpdateProjectionMatrix(_viewport.Width, _viewport.Height);
}
```

**What this means:**
- Renderer viewport updates automatically
- You don't need to update renderer manually
- Focus on UI/camera adjustments in your scenes

---

## Troubleshooting

### Problem: Not Receiving Events

**Symptom:** Window resize handler never called

**Solutions:**

1. **Check EventBus registration**
   ```csharp
   // Make sure EventBus is registered
   builder.Services.AddSingleton<EventBus>();
   ```

2. **Verify subscription**
   ```csharp
   protected override void OnInitialize()
   {
       _eventBus?.Subscribe<WindowResizedEvent>(OnWindowResized);
       Logger.LogInformation("Subscribed to WindowResizedEvent");
   }
   ```

3. **Check window is resizable**
   ```json
   {
     "Rendering": {
       "Resizable": true  // Must be true!
     }
   }
   ```

---

### Problem: Memory Leak

**Symptom:** Memory usage increases over time

**Cause:** Not unsubscribing from events

**Solution:**

```csharp
// ✅ Always unsubscribe
protected override void OnDispose()
{
    _eventBus?.Unsubscribe<WindowResizedEvent>(OnWindowResized);
    base.OnDispose();
}
```

---

### Problem: Event Fired Multiple Times

**Symptom:** Handler called multiple times for single resize

**Cause:** Multiple subscriptions

**Solution:**

```csharp
// ✅ Subscribe only once
protected override void OnInitialize()
{
    // Unsubscribe first (if reinitializing)
    _eventBus?.Unsubscribe<WindowResizedEvent>(OnWindowResized);
    
    // Then subscribe
    _eventBus?.Subscribe<WindowResizedEvent>(OnWindowResized);
}
```

---

## Complete Example

Here's a full responsive game scene:

```csharp ResponsiveGameScene.cs
using Brine2D.Core;
using Brine2D.Input;
using Brine2D.Rendering;
using Brine2D.SDL.Common.Events;
using Brine2D.UI;
using Microsoft.Extensions.Logging;
using System.Numerics;

public class ResponsiveGameScene : Scene
{
    private readonly IRenderer _renderer;
    private readonly IInputService _input;
    private readonly IGameContext _gameContext;
    private readonly EventBus? _eventBus;
    private readonly UICanvas _uiCanvas;
    
    private Camera2D? _camera;
    private int _windowWidth = 1280;
    private int _windowHeight = 720;
    
    // UI elements
    private UILabel? _scoreLabel;
    private UILabel? _fpsLabel;
    private UIButton? _pauseButton;
    
    public ResponsiveGameScene(
        IRenderer renderer,
        IInputService input,
        IGameContext gameContext,
        EventBus? eventBus,
        UICanvas uiCanvas,
        ILogger<ResponsiveGameScene> logger) : base(logger)
    {
        _renderer = renderer;
        _input = input;
        _gameContext = gameContext;
        _eventBus = eventBus;
        _uiCanvas = uiCanvas;
    }
    
    protected override void OnInitialize()
    {
        // Create camera
        _camera = new Camera2D(_windowWidth, _windowHeight);
        _renderer.Camera = _camera;
        
        // Create UI
        CreateUI();
        
        // Subscribe to window events
        _eventBus?.Subscribe<WindowResizedEvent>(OnWindowResized);
        
        Logger.LogInformation("ResponsiveGameScene initialized");
    }
    
    private void CreateUI()
    {
        // Score (top-left)
        _scoreLabel = new UILabel("Score: 0", new Vector2(10, 10))
        {
            FontSize = 24,
            Color = Color.White
        };
        _uiCanvas.Add(_scoreLabel);
        
        // FPS (top-right)
        _fpsLabel = new UILabel("FPS: 60", new Vector2(_windowWidth - 100, 10))
        {
            FontSize = 18,
            Color = Color.Yellow
        };
        _uiCanvas.Add(_fpsLabel);
        
        // Pause button (center-top)
        _pauseButton = new UIButton("Pause", new Vector2(0, 10), new Vector2(100, 40));
        _pauseButton.OnClick += OnPauseClicked;
        _uiCanvas.Add(_pauseButton);
        
        // Position pause button
        PositionPauseButton(_windowWidth);
    }
    
    private void OnWindowResized(WindowResizedEvent evt)
    {
        Logger.LogInformation("Window resized to {Width}x{Height}", 
            evt.Width, evt.Height);
        
        _windowWidth = evt.Width;
        _windowHeight = evt.Height;
        
        // Update camera viewport
        if (_camera != null)
        {
            _camera.ViewportWidth = evt.Width;
            _camera.ViewportHeight = evt.Height;
        }
        
        // Update UI layout
        UpdateUILayout();
    }
    
    private void UpdateUILayout()
    {
        if (_fpsLabel != null)
        {
            // Keep FPS in top-right
            _fpsLabel.Position = new Vector2(_windowWidth - 100, 10);
        }
        
        if (_pauseButton != null)
        {
            // Keep pause button centered horizontally
            PositionPauseButton(_windowWidth);
        }
    }
    
    private void PositionPauseButton(int width)
    {
        if (_pauseButton != null)
        {
            var buttonWidth = 100f;
            _pauseButton.Position = new Vector2(
                (width - buttonWidth) / 2,
                10);
        }
    }
    
    private void OnPauseClicked()
    {
        Logger.LogInformation("Pause clicked");
        // Handle pause
    }
    
    protected override void OnUpdate(GameTime gameTime)
    {
        // Exit
        if (_input.IsKeyPressed(Keys.Escape))
        {
            _gameContext.RequestExit();
        }
        
        // Update FPS display
        if (_fpsLabel != null)
        {
            var fps = (int)(1.0 / gameTime.DeltaTime);
            _fpsLabel.Text = $"FPS: {fps}";
        }
    }
    
    protected override void OnRender(GameTime gameTime)
    {
        _renderer.Clear(Color.CornflowerBlue);
        _renderer.BeginFrame();
        
        // Game rendering here...
        
        _renderer.EndFrame();
    }
    
    protected override void OnDispose()
    {
        // IMPORTANT: Unsubscribe from events
        _eventBus?.Unsubscribe<WindowResizedEvent>(OnWindowResized);
        
        // Cleanup UI
        if (_pauseButton != null)
        {
            _pauseButton.OnClick -= OnPauseClicked;
        }
        
        Logger.LogInformation("ResponsiveGameScene disposed");
        
        base.OnDispose();
    }
}
```

---

## Summary

| Task | Code | Notes |
|------|------|-------|
| **Register EventBus** | `builder.Services.AddSingleton<EventBus>()` | Optional, in Program.cs |
| **Subscribe** | `_eventBus?.Subscribe<WindowResizedEvent>(handler)` | In OnInitialize |
| **Unsubscribe** | `_eventBus?.Unsubscribe<WindowResizedEvent>(handler)` | In OnDispose |
| **Event data** | `evt.Width`, `evt.Height` | Window dimensions |
| **Enable resize** | `options.Resizable = true` | In config |
| **Namespace** | `using Brine2D.SDL.Common.Events;` | For WindowResizedEvent |

---

## Next Steps

- **[UI Components](../ui/components.md)** - Build responsive UI
- **[Cameras](../rendering/cameras.md)** - Camera viewport management
- **[Event System](../ecs/events.md)** - Custom events with EventBus
- **[GPU Renderer](../rendering/gpu-renderer.md)** - Modern rendering

---

**Ready to build responsive games?** Try [UI Components](../ui/components.md) next!