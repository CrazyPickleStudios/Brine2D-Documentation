---
title: Scene Transitions
description: Smooth visual effects and loading screens when transitioning between scenes
---

# Scene Transitions

Scene transitions provide **visual feedback** during scene changes, making your game feel polished and professional. Brine2D supports **fade transitions** and **custom loading screens**.

## Overview

**What are scene transitions?**

| Feature | Purpose | Use For |
|---------|---------|---------|
| **ISceneTransition** | Visual effect during transition | Fade in/out, wipes, crossfades |
| **LoadingScene** | Progress indication | Long loads, asset loading |
| **Combined** | Transition + loading screen | Best user experience |

**Why use transitions?**
- ✅ **Professional feel** - smooth scene changes
- ✅ **Hide loading** - mask asset loading time
- ✅ **User feedback** - show progress during long loads
- ✅ **Customizable** - create unique transition effects

---

## Basic Scene Transitions

### Without Transition (Instant)

~~~csharp
// Instant scene change (no transition)
await sceneManager.LoadSceneAsync<GameScene>();
~~~

**Use when:**
- Scene loads instantly (< 100ms)
- Testing/debugging
- Menu navigation without assets

---

### With Fade Transition

~~~csharp
using Brine2D.Engine.Transitions;

// Fade to black and back (1 second)
await sceneManager.LoadSceneAsync<GameScene>(
    transition: new FadeTransition(duration: 1f)
);

// Fade to white (2 seconds)
await sceneManager.LoadSceneAsync<GameScene>(
    transition: new FadeTransition(duration: 2f, color: Color.White)
);
~~~

**Pattern:** Scene fades out → loads → fades in (duration split 50/50).

---

## The ISceneTransition Interface

~~~csharp
public interface ISceneTransition
{
    /// <summary>
    /// Gets the duration of the transition in seconds.
    /// </summary>
    float Duration { get; }
    
    /// <summary>
    /// Gets whether the transition is complete.
    /// </summary>
    bool IsComplete { get; }
    
    /// <summary>
    /// Gets the current progress (0.0 to 1.0).
    /// </summary>
    float Progress { get; }
    
    /// <summary>
    /// Called when the transition starts.
    /// </summary>
    void Begin();
    
    /// <summary>
    /// Updates the transition.
    /// </summary>
    void Update(float deltaTime);
    
    /// <summary>
    /// Renders the transition effect.
    /// </summary>
    void Render(IRenderer? renderer);
}
~~~

---

## Built-in Transitions

### FadeTransition

The built-in fade transition:

~~~csharp
public class FadeTransition : ISceneTransition
{
    public FadeTransition(float duration = 1f, Color? color = null)
    {
        Duration = duration;
        _color = color ?? Color.Black;
    }
    
    // Fade out: 0.0 -> 0.5 (alpha 0 -> 255)
    // Fade in:  0.5 -> 1.0 (alpha 255 -> 0)
}
~~~

**Usage examples:**

~~~csharp
// Fast fade to black (0.5 seconds)
new FadeTransition(duration: 0.5f)

// Slow fade to white (2 seconds)
new FadeTransition(duration: 2f, color: Color.White)

// Fade to red (horror game effect)
new FadeTransition(duration: 1.5f, color: Color.Red)

// Fade to blue (underwater scene)
new FadeTransition(duration: 1f, color: Color.FromArgb(20, 100, 200))
~~~

---

## Loading Screens

### The LoadingScene Class

~~~csharp
public abstract class LoadingScene : Scene
{
    protected float LoadingProgress { get; private set; }
    protected string LoadingMessage { get; private set; } = "Loading...";
    
    /// <summary>
    /// Updates the loading progress (0.0 to 1.0).
    /// </summary>
    public void UpdateProgress(float progress, string? message = null)
    {
        LoadingProgress = Math.Clamp(progress, 0f, 1f);
        if (message != null)
        {
            LoadingMessage = message;
        }
    }
    
    /// <summary>
    /// Override this to customize the loading screen appearance.
    /// </summary>
    protected virtual void OnRenderLoading(GameTime gameTime)
    {
        // Default: progress bar + percentage
    }
}
~~~

**Key features:**
- ✅ **Progress tracking** - 0.0 to 1.0
- ✅ **Status messages** - "Loading assets...", "Initializing...", etc.
- ✅ **Automatic rendering** - called by SceneManager
- ✅ **No EntityWorld** - loading screens are visual-only (between scene scopes)

---

## Using Loading Screens

### Generic Loading Screen API (NEW!)

The **generic API** makes loading screens type-safe and automatic:

~~~csharp
// Load with custom loading screen
await sceneManager.LoadSceneAsync<GameScene, MyLoadingScreen>();

// With transition AND loading screen
await sceneManager.LoadSceneAsync<GameScene, MyLoadingScreen>(
    transition: new FadeTransition(1f)
);
~~~

**Pattern:** `LoadSceneAsync<TScene, TLoadingScene>()` automatically creates and displays the loading screen.

---

### Basic Loading Screen

~~~csharp
using Brine2D.Core;
using Brine2D.Engine;
using System.Drawing;

public class SimpleLoadingScreen : LoadingScene
{
    // Default implementation shows:
    // - "Loading..." text
    // - Progress bar
    // - Percentage
    
    // No need to override anything!
}

// Usage
await sceneManager.LoadSceneAsync<GameScene, SimpleLoadingScreen>();
~~~

---

### Custom Loading Screen

~~~csharp
using Brine2D.Core;
using Brine2D.Engine;
using Brine2D.Rendering;
using System.Drawing;

public class CustomLoadingScreen : LoadingScene
{
    private float _spinnerRotation;
    
    protected override void OnUpdate(GameTime gameTime)
    {
        base.OnUpdate(gameTime);
        
        // Animate spinner
        _spinnerRotation += (float)gameTime.DeltaTime * 360f; // 1 rotation/sec
        if (_spinnerRotation >= 360f)
        {
            _spinnerRotation -= 360f;
        }
    }
    
    protected override void OnRenderLoading(GameTime gameTime)
    {
        var centerX = Renderer.Width / 2f;
        var centerY = Renderer.Height / 2f;
        
        // Title
        Renderer.DrawText(
            "Loading Game...", 
            centerX - 80, 
            centerY - 100, 
            Color.Cyan);
        
        // Animated spinner
        DrawSpinner(centerX, centerY - 50, 30f, _spinnerRotation);
        
        // Progress bar
        var barWidth = 400f;
        var barHeight = 30f;
        var barX = centerX - barWidth / 2f;
        var barY = centerY + 20;
        
        // Background (dark)
        Renderer.DrawRectangleFilled(
            barX, barY, 
            barWidth, barHeight, 
            Color.FromArgb(40, 40, 40));
        
        // Progress fill (bright blue)
        Renderer.DrawRectangleFilled(
            barX, barY, 
            barWidth * LoadingProgress, 
            barHeight,
            Color.FromArgb(50, 150, 255));
        
        // Border
        Renderer.DrawRectangleOutline(
            barX, barY, 
            barWidth, barHeight, 
            Color.White, 
            2f);
        
        // Status message
        Renderer.DrawText(
            LoadingMessage, 
            centerX - 60, 
            centerY + 70, 
            Color.FromArgb(200, 200, 200));
        
        // Percentage
        var percentText = $"{(int)(LoadingProgress * 100)}%";
        Renderer.DrawText(
            percentText, 
            centerX - 20, 
            centerY - 10, 
            Color.White);
    }
    
    private void DrawSpinner(float centerX, float centerY, float radius, float rotation)
    {
        // Draw 8 circles in a spinner pattern
        for (int i = 0; i < 8; i++)
        {
            var angle = (rotation + i * 45f) * MathF.PI / 180f;
            var x = centerX + MathF.Cos(angle) * radius;
            var y = centerY + MathF.Sin(angle) * radius;
            
            // Fade based on position
            var alpha = (byte)(255 - i * 30);
            var color = Color.FromArgb(alpha, 100, 200, 255);
            
            Renderer.DrawCircleFilled(x, y, 5f, color);
        }
    }
}

// Usage
await sceneManager.LoadSceneAsync<GameScene, CustomLoadingScreen>(
    transition: new FadeTransition(1f)
);
~~~

---

## Transition Timeline

### With Transition Only

~~~mermaid
sequenceDiagram
    participant SM as SceneManager
    participant T as FadeTransition
    participant Old as Old Scene
    participant New as New Scene
    
    SM->>T: Begin()
    Note over T: Progress 0.0
    
    loop Fade Out (0.0 -> 0.5)
        SM->>T: Update(deltaTime)
        SM->>T: Render()
        Note over T: Increasing alpha
    end
    
    Note over SM: Progress reaches 0.5
    
    SM->>Old: UnloadAsync()
    SM->>New: CreateEntity()
    SM->>New: InitializeAsync()
    SM->>New: LoadAsync()
    
    loop Fade In (0.5 -> 1.0)
        SM->>T: Update(deltaTime)
        SM->>T: Render()
        Note over T: Decreasing alpha
    end
    
    Note over T: Progress reaches 1.0
    Note over SM: Transition complete
~~~

---

### With Loading Screen

~~~mermaid
sequenceDiagram
    participant SM as SceneManager
    participant T as FadeTransition
    participant LS as LoadingScreen
    participant Old as Old Scene
    participant New as New Scene
    
    SM->>T: Begin()
    
    loop Fade Out
        SM->>T: Update()
        SM->>T: Render()
    end
    
    SM->>LS: InitializeAsync()
    SM->>LS: LoadAsync()
    Note over LS: Loading screen visible
    
    SM->>Old: UnloadAsync()
    SM->>LS: UpdateProgress(0.3, "Unloading...")
    
    SM->>New: CreateEntity()
    SM->>LS: UpdateProgress(0.5, "Creating scene...")
    
    SM->>New: InitializeAsync()
    SM->>LS: UpdateProgress(0.7, "Initializing...")
    
    SM->>New: LoadAsync()
    SM->>LS: UpdateProgress(1.0, "Ready!")
    
    SM->>LS: UnloadAsync()
    
    loop Fade In
        SM->>T: Update()
        SM->>T: Render()
    end
    
    Note over SM: Scene fully loaded
~~~

---

## Complete Examples

### Example 1: Menu to Game

~~~csharp
using Brine2D.Engine;
using Brine2D.Engine.Transitions;

public class MenuScene : Scene
{
    private readonly ISceneManager _sceneManager;
    
    public MenuScene(ISceneManager sceneManager)
    {
        _sceneManager = sceneManager;
    }
    
    protected override void OnUpdate(GameTime gameTime)
    {
        // When player clicks "Start Game" button
        if (PlayerClickedStartButton())
        {
            // Simple fade transition (no loading screen needed)
            await _sceneManager.LoadSceneAsync<GameScene>(
                transition: new FadeTransition(0.5f)
            );
        }
    }
}
~~~

---

### Example 2: Level with Loading Screen

~~~csharp
public class LevelSelectScene : Scene
{
    private readonly ISceneManager _sceneManager;
    
    public LevelSelectScene(ISceneManager sceneManager)
    {
        _sceneManager = sceneManager;
    }
    
    protected override void OnUpdate(GameTime gameTime)
    {
        if (PlayerSelectedLevel())
        {
            // Load heavy level with loading screen
            await _sceneManager.LoadSceneAsync<Level1Scene, GameLoadingScreen>(
                transition: new FadeTransition(1f)
            );
        }
    }
}

public class GameLoadingScreen : LoadingScene
{
    protected override void OnRenderLoading(GameTime gameTime)
    {
        // Custom loading screen with game-specific branding
        var centerX = Renderer.Width / 2f;
        var centerY = Renderer.Height / 2f;
        
        // Game logo (if you have a texture loaded)
        // Renderer.DrawTexture(_logo, centerX - 100, centerY - 150);
        
        // Loading text
        Renderer.DrawText(
            "Loading Level...", 
            centerX - 70, 
            centerY, 
            Color.White);
        
        // Progress bar
        var barWidth = 300f;
        var barHeight = 20f;
        var barX = centerX - barWidth / 2f;
        var barY = centerY + 40;
        
        Renderer.DrawRectangleFilled(
            barX, barY, 
            barWidth, barHeight, 
            Color.FromArgb(50, 50, 50));
        
        Renderer.DrawRectangleFilled(
            barX, barY, 
            barWidth * LoadingProgress, 
            barHeight,
            Color.FromArgb(100, 200, 100));
        
        // Tips while loading
        var tips = new[]
        {
            "Tip: Collect power-ups for extra points!",
            "Tip: Watch out for red enemies!",
            "Tip: Press SPACE to jump!"
        };
        
        var tipIndex = (int)(LoadingProgress * tips.Length);
        if (tipIndex < tips.Length)
        {
            Renderer.DrawText(
                tips[tipIndex], 
                centerX - 150, 
                centerY + 80, 
                Color.FromArgb(150, 150, 150));
        }
    }
}
~~~

---

### Example 3: Asset-Heavy Scene

~~~csharp
public class Level1Scene : Scene
{
    private ITexture? _background;
    private ITexture? _tileset;
    private ITexture? _playerSprite;
    private ISoundEffect? _backgroundMusic;
    
    protected override async Task OnLoadAsync(CancellationToken ct)
    {
        // SceneManager automatically updates loading progress!
        
        // Progress: 0.3 - "Creating scene..."
        
        // Progress: 0.5 - "Initializing..."
        
        // Progress: 0.7 - "Loading assets..."
        
        // Load assets
        _background = await Renderer.LoadTextureAsync("backgrounds/level1.png", ct);
        _tileset = await Renderer.LoadTextureAsync("tilesets/grass.png", ct);
        _playerSprite = await Renderer.LoadTextureAsync("characters/player.png", ct);
        _backgroundMusic = await LoadSoundAsync("music/level1.ogg", ct);
        
        // Create entities
        CreatePlayer();
        CreateEnemies();
        CreatePickups();
        
        // Progress: 1.0 - "Ready!"
    }
}
~~~

**Pattern:** SceneManager automatically updates loading progress at key points.

---

## Creating Custom Transitions

### Custom Wipe Transition

~~~csharp
using Brine2D.Rendering;
using System.Drawing;

public class WipeTransition : ISceneTransition
{
    private float _elapsed;
    
    public float Duration { get; }
    public bool IsComplete => _elapsed >= Duration;
    public float Progress => Math.Clamp(_elapsed / Duration, 0f, 1f);
    
    public WipeTransition(float duration = 1f)
    {
        Duration = duration;
    }
    
    public void Begin()
    {
        _elapsed = 0f;
    }
    
    public void Update(float deltaTime)
    {
        _elapsed += deltaTime;
    }
    
    public void Render(IRenderer? renderer)
    {
        if (renderer == null || IsComplete) return;
        
        var viewportWidth = renderer.Camera?.ViewportWidth ?? 1280;
        var viewportHeight = renderer.Camera?.ViewportHeight ?? 720;
        
        float wipeProgress = Progress;
        float wipeX;
        
        if (wipeProgress < 0.5f)
        {
            // Wipe left to right (cover screen)
            wipeX = viewportWidth * (wipeProgress * 2f);
            renderer.DrawRectangleFilled(0, 0, wipeX, viewportHeight, Color.Black);
        }
        else
        {
            // Wipe left to right (uncover screen)
            wipeX = viewportWidth * ((wipeProgress - 0.5f) * 2f);
            renderer.DrawRectangleFilled(wipeX, 0, viewportWidth - wipeX, viewportHeight, Color.Black);
        }
    }
}

// Usage
await sceneManager.LoadSceneAsync<GameScene>(
    transition: new WipeTransition(1.5f)
);
~~~

---

### Custom Circle Transition

~~~csharp
public class CircleTransition : ISceneTransition
{
    private float _elapsed;
    
    public float Duration { get; }
    public bool IsComplete => _elapsed >= Duration;
    public float Progress => Math.Clamp(_elapsed / Duration, 0f, 1f);
    
    public CircleTransition(float duration = 1f)
    {
        Duration = duration;
    }
    
    public void Begin()
    {
        _elapsed = 0f;
    }
    
    public void Update(float deltaTime)
    {
        _elapsed += deltaTime;
    }
    
    public void Render(IRenderer? renderer)
    {
        if (renderer == null || IsComplete) return;
        
        var centerX = renderer.Width / 2f;
        var centerY = renderer.Height / 2f;
        var maxRadius = MathF.Sqrt(centerX * centerX + centerY * centerY);
        
        float circleProgress = Progress;
        float radius;
        
        if (circleProgress < 0.5f)
        {
            // Circle closes (radius decreases)
            radius = maxRadius * (1f - circleProgress * 2f);
        }
        else
        {
            // Circle opens (radius increases)
            radius = maxRadius * ((circleProgress - 0.5f) * 2f);
        }
        
        // Draw black overlay with circular cutout
        // (This requires stencil buffer or clever rendering)
        // Simplified: just draw black circle that grows/shrinks
        
        if (circleProgress < 0.5f)
        {
            // Cover everything except shrinking circle
            // In practice, you'd use a shader or stencil buffer
        }
    }
}
~~~

**Note:** Complex transitions may require shader support or render targets.

---

## Best Practices

### ✅ DO

**1. Use appropriate transition duration**

~~~csharp
// ✅ Good - quick transitions
new FadeTransition(0.5f)  // Fast menu navigation
new FadeTransition(1f)    // Standard scene change
new FadeTransition(2f)    // Dramatic effect

// ❌ Bad - too slow
new FadeTransition(5f)    // Player will get impatient!
~~~

**2. Show loading screens for heavy scenes**

~~~csharp
// ✅ Good - loading screen for asset-heavy scene
await sceneManager.LoadSceneAsync<Level1Scene, GameLoadingScreen>();

// ❌ Bad - no feedback during 5-second load
await sceneManager.LoadSceneAsync<Level1Scene>(); // Looks frozen!
~~~

**3. Update loading progress**

~~~csharp
// ✅ Good - progress automatically updated by SceneManager
// SceneManager calls UpdateProgress at key points:
// - 0.3: After old scene unload
// - 0.5: After scene creation
// - 0.7: During initialization
// - 1.0: After loading complete
~~~

**4. Use transitions consistently**

~~~csharp
// ✅ Good - consistent style
// All scenes use FadeTransition(0.5f)
await sceneManager.LoadSceneAsync<MenuScene>(new FadeTransition(0.5f));
await sceneManager.LoadSceneAsync<GameScene>(new FadeTransition(0.5f));
await sceneManager.LoadSceneAsync<GameOverScene>(new FadeTransition(0.5f));
~~~

---

### ❌ DON'T

**1. Don't make transitions too long**

~~~csharp
// ❌ Bad - 10 seconds is way too long
await sceneManager.LoadSceneAsync<GameScene>(
    transition: new FadeTransition(10f)
);

// ✅ Good - under 2 seconds
await sceneManager.LoadSceneAsync<GameScene>(
    transition: new FadeTransition(1f)
);
~~~

**2. Don't use EntityWorld in LoadingScene**

~~~csharp
// ❌ Bad - LoadingScene doesn't have World
public class MyLoadingScreen : LoadingScene
{
    protected override Task OnLoadAsync(CancellationToken ct)
    {
        World.CreateEntity("Spinner"); // ❌ World is null!
        return Task.CompletedTask;
    }
}

// ✅ Good - use fields/properties for state
public class MyLoadingScreen : LoadingScene
{
    private float _spinnerRotation;
    
    protected override void OnUpdate(GameTime gameTime)
    {
        _spinnerRotation += (float)gameTime.DeltaTime * 360f; // ✅
    }
}
~~~

**3. Don't block in transitions**

~~~csharp
// ❌ Bad - blocking transition
public void Render(IRenderer? renderer)
{
    Thread.Sleep(1000); // Freezes game!
    DownloadTexture().Wait(); // Blocks!
}

// ✅ Good - async loading happens in OnLoadAsync
protected override async Task OnLoadAsync(CancellationToken ct)
{
    await DownloadTextureAsync(ct); // Proper async
}
~~~

**4. Don't skip transitions on instant loads**

~~~csharp
// ❌ Bad - jarring for user
await sceneManager.LoadSceneAsync<MenuScene>(); // Instant

// ✅ Good - always use fade for polish
await sceneManager.LoadSceneAsync<MenuScene>(
    transition: new FadeTransition(0.3f)
);
~~~

---

## Troubleshooting

### Problem: Loading screen not showing

**Symptom:** Scene loads without loading screen.

**Solutions:**

1. **Check generic API:**
   ~~~csharp
   // ✅ Correct - generic API
   await sceneManager.LoadSceneAsync<GameScene, MyLoadingScreen>();
   
   // ❌ Wrong - missing loading screen type
   await sceneManager.LoadSceneAsync<GameScene>();
   ~~~

2. **Verify LoadingScene registration** (optional):
   ~~~csharp
   // Optional: register in DI
   builder.Services.AddTransient<MyLoadingScreen>();
   ~~~

---

### Problem: Transition stuck at halfway

**Symptom:** Screen stays black/faded.

**Solution:**

Check transition duration - SceneManager waits for `IsComplete`:

~~~csharp
public bool IsComplete => _elapsed >= Duration; // ✅ Must return true eventually
~~~

---

### Problem: Loading progress not updating

**Symptom:** Progress bar stays at 0%.

**Solution:**

SceneManager updates progress automatically at these points:
- 0.3: After old scene unload
- 0.5: After scene creation
- 0.7: During initialization
- 1.0: After loading

Make sure your scene completes these phases.

---

## Summary

**Scene transitions:**

| Feature | Purpose | When to Use |
|---------|---------|-------------|
| **FadeTransition** | Smooth visual effect | All scene changes |
| **LoadingScene** | Progress feedback | Asset-heavy scenes |
| **Custom transitions** | Unique effects | Special transitions |
| **Combined** | Best UX | Production games |

**Key patterns:**

| Pattern | Implementation |
|---------|----------------|
| **Generic API** | `LoadSceneAsync<TScene, TLoadingScene>()` |
| **Fade out → load → fade in** | FadeTransition duration split 50/50 |
| **Progress tracking** | SceneManager updates at key points |
| **No EntityWorld** | LoadingScene is visual-only |

**Recommended setup:**

~~~csharp
// Fast transitions: 0.5s
await sceneManager.LoadSceneAsync<MenuScene>(
    transition: new FadeTransition(0.5f)
);

// Heavy scenes: transition + loading screen
await sceneManager.LoadSceneAsync<Level1Scene, GameLoadingScreen>(
    transition: new FadeTransition(1f)
);
~~~

---

## Next Steps

- **[Scene Lifecycle](../../concepts/scenes.md)** - Understanding scene phases
- **[Lifecycle Hooks](lifecycle-hooks.md)** - Inject behavior during transitions
- **[Asset Loading](../rendering/sprites.md)** - Optimize texture loading
- **[Custom Renderers](../rendering/gpu-renderer.md)** - Advanced rendering effects

---

**Remember:** Transitions make your game feel professional - always use at least a quick fade (0.3-0.5s) for polish! 🎮