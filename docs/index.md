---
title: Home
---

# Brine2D Game Engine

**The ASP.NET of game engines** - Enterprise-grade 2D game development with .NET elegance.

Brine2D is a modern .NET 10 game engine built on SDL3 that brings the familiar patterns and developer experience of ASP.NET to game development. If you've built web applications with ASP.NET Core, you'll feel right at home building games with Brine2D.

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

Built on Microsoft's DI container, Brine2D makes testable, maintainable code the default—not the exception.

```csharp
using Brine2D.Core;
using Brine2D.Input;
using Brine2D.Rendering;
using Microsoft.Extensions.Logging;

public class GameScene : Scene
{
    // Constructor injection - just like ASP.NET controllers
    public GameScene(IRenderer renderer, IInputService input, ILogger<GameScene> logger) : base(logger)
    {
        // Dependencies automatically injected!
    }
}
```

### Familiar Developer Experience

| **ASP.NET Core** | **Brine2D** | **What It Means** |
|------------------|-------------|-------------------|
| `WebApplicationBuilder` | `GameApplicationBuilder` | Configure your game with the same patterns |
| Controllers | Scenes | Organize game logic into manageable units |
| Middleware Pipeline | Input Layer System | Process input with composable layers |
| `appsettings.json` | `gamesettings.json` | JSON configuration with hot reload |
| `ILogger<T>` | `ILogger<T>` | Structured logging everywhere |
| Entity Framework | Scene Management | High-level abstractions over complex systems |

### Production-Ready Architecture

- **Modular by design** - Mix and match only what you need
- **Clean separation of concerns** - Abstractions over implementations
- **Testable** - Mock any service, test any component
- **Cross-platform** - Windows, macOS, Linux support via SDL3

## See It In Action

Here's a complete game in ~30 lines of code:

<pre class="vs-code"><code><span class="keyword">using</span> <span class="namespace name;Semantic - namespace name;Semantic - (TRANSIENT)">Brine2D</span><span class="operator">.</span><span class="namespace name;Semantic - namespace name;Semantic - (TRANSIENT)">Core</span><span class="punctuation">;</span>
<span class="keyword">using</span> <span class="namespace name;Semantic - namespace name;Semantic - (TRANSIENT)">Brine2D</span><span class="operator">.</span><span class="namespace name;Semantic - namespace name;Semantic - (TRANSIENT)">Engine</span><span class="punctuation">;</span>
<span class="keyword">using</span> <span class="namespace name;Semantic - namespace name;Semantic - (TRANSIENT)">Brine2D</span><span class="operator">.</span><span class="namespace name;Semantic - namespace name;Semantic - (TRANSIENT)">Hosting</span><span class="punctuation">;</span>
<span class="keyword">using</span> <span class="namespace name;Semantic - namespace name;Semantic - (TRANSIENT)">Brine2D</span><span class="operator">.</span><span class="namespace name;Semantic - namespace name;Semantic - (TRANSIENT)">Input</span><span class="punctuation">;</span>
<span class="keyword">using</span> <span class="namespace name;Semantic - namespace name;Semantic - (TRANSIENT)">Brine2D</span><span class="operator">.</span><span class="namespace name;Semantic - namespace name;Semantic - (TRANSIENT)">Input</span><span class="operator">.</span><span class="namespace name;Semantic - namespace name;Semantic - (TRANSIENT)">SDL</span><span class="punctuation">;</span>
<span class="keyword">using</span> <span class="namespace name;Semantic - namespace name;Semantic - (TRANSIENT)">Brine2D</span><span class="operator">.</span><span class="namespace name;Semantic - namespace name;Semantic - (TRANSIENT)">Rendering</span><span class="punctuation">;</span>
<span class="keyword">using</span> <span class="namespace name;Semantic - namespace name;Semantic - (TRANSIENT)">Brine2D</span><span class="operator">.</span><span class="namespace name;Semantic - namespace name;Semantic - (TRANSIENT)">Rendering</span><span class="operator">.</span><span class="namespace name;Semantic - namespace name;Semantic - (TRANSIENT)">SDL</span><span class="punctuation">;</span>
<span class="keyword">using</span> <span class="namespace name;Semantic - namespace name;Semantic - (TRANSIENT)">Microsoft</span><span class="operator">.</span><span class="namespace name;Semantic - namespace name;Semantic - (TRANSIENT)">Extensions</span><span class="operator">.</span><span class="namespace name;Semantic - namespace name;Semantic - (TRANSIENT)">Logging</span><span class="punctuation">;</span>
 
<span class="comment">// Create builder (like ASP.NET&#39;s WebApplication.CreateBuilder)</span>
<span class="keyword">var</span> <span class="local name">builder</span> <span class="operator">=</span> <span class="class name">GameApplication</span><span class="operator">.</span><span class="method name;Semantic - static symbol;Semantic - (TRANSIENT)">CreateBuilder</span><span class="punctuation">(</span><span class="identifier;Semantic - keyword;Semantic - (TRANSIENT)">args</span><span class="punctuation">)</span><span class="punctuation">;</span>
 
<span class="comment">// Configure services</span>
<span class="local name">builder</span><span class="operator">.</span><span class="property name">Services</span><span class="operator">.</span><span class="extension method name">AddSDL3Rendering</span><span class="punctuation">(</span><span class="parameter name">options</span> <span class="operator">=&gt;</span>
<span class="punctuation">{</span>
    <span class="parameter name">options</span><span class="operator">.</span><span class="property name">WindowTitle</span> <span class="operator">=</span> <span class="string">&quot;My First Game&quot;</span><span class="punctuation">;</span>
    <span class="parameter name">options</span><span class="operator">.</span><span class="property name">WindowWidth</span> <span class="operator">=</span> <span class="number">1280</span><span class="punctuation">;</span>
    <span class="parameter name">options</span><span class="operator">.</span><span class="property name">WindowHeight</span> <span class="operator">=</span> <span class="number">720</span><span class="punctuation">;</span>
<span class="punctuation">}</span><span class="punctuation">)</span><span class="punctuation">;</span>
 
<span class="local name">builder</span><span class="operator">.</span><span class="property name">Services</span><span class="operator">.</span><span class="extension method name">AddSDL3Input</span><span class="punctuation">(</span><span class="punctuation">)</span><span class="punctuation">;</span>
<span class="local name">builder</span><span class="operator">.</span><span class="property name">Services</span><span class="operator">.</span><span class="extension method name">AddScene</span><span class="punctuation">&lt;</span><span class="class name">GameScene</span><span class="punctuation">&gt;</span><span class="punctuation">(</span><span class="punctuation">)</span><span class="punctuation">;</span>
 
<span class="comment">// Build and run</span>
<span class="keyword">var</span> <span class="local name">game</span> <span class="operator">=</span> <span class="local name">builder</span><span class="operator">.</span><span class="method name">Build</span><span class="punctuation">(</span><span class="punctuation">)</span><span class="punctuation">;</span>
 
<span class="keyword - control">await</span> <span class="local name">game</span><span class="operator">.</span><span class="method name">RunAsync</span><span class="punctuation">&lt;</span><span class="class name">GameScene</span><span class="punctuation">&gt;</span><span class="punctuation">(</span><span class="punctuation">)</span><span class="punctuation">;</span>
 
<span class="comment">// Define your scene (like an ASP.NET controller)</span>
<span class="keyword">public</span> <span class="keyword">class</span> <span class="class name">GameScene</span> <span class="punctuation">:</span> <span class="class name">Scene</span>
<span class="punctuation">{</span>
    <span class="keyword">private</span> <span class="keyword">readonly</span> <span class="interface name">IGameContext</span> <span class="field name">_gameContext</span><span class="punctuation">;</span>
    <span class="keyword">private</span> <span class="keyword">readonly</span> <span class="interface name">IInputService</span> <span class="field name">_input</span><span class="punctuation">;</span>
    <span class="keyword">private</span> <span class="keyword">readonly</span> <span class="interface name">IRenderer</span> <span class="field name">_renderer</span><span class="punctuation">;</span>
 
    <span class="keyword">public</span> <span class="class name">GameScene</span>
    <span class="punctuation">(</span>
        <span class="interface name">IRenderer</span> <span class="parameter name">renderer</span><span class="punctuation">,</span>
        <span class="interface name">IInputService</span> <span class="parameter name">input</span><span class="punctuation">,</span>
        <span class="interface name">IGameContext</span> <span class="parameter name">gameContext</span><span class="punctuation">,</span>
        <span class="interface name">ILogger</span><span class="punctuation">&lt;</span><span class="class name">GameScene</span><span class="punctuation">&gt;</span> <span class="parameter name">logger</span>
    <span class="punctuation">)</span> <span class="punctuation">:</span> <span class="keyword">base</span><span class="punctuation">(</span><span class="parameter name">logger</span><span class="punctuation">)</span>
    <span class="punctuation">{</span>
        <span class="field name">_renderer</span> <span class="operator">=</span> <span class="parameter name">renderer</span><span class="punctuation">;</span>
        <span class="field name">_input</span> <span class="operator">=</span> <span class="parameter name">input</span><span class="punctuation">;</span>
        <span class="field name">_gameContext</span> <span class="operator">=</span> <span class="parameter name">gameContext</span><span class="punctuation">;</span>
    <span class="punctuation">}</span>
 
    <span class="keyword">protected</span> <span class="keyword">override</span> <span class="keyword">void</span> <span class="method name">OnRender</span><span class="punctuation">(</span><span class="struct name">GameTime</span> <span class="parameter name">gameTime</span><span class="punctuation">)</span>
    <span class="punctuation">{</span>
        <span class="field name">_renderer</span><span class="operator">.</span><span class="method name">Clear</span><span class="punctuation">(</span><span class="struct name">Color</span><span class="operator">.</span><span class="property name;Semantic - static symbol;Semantic - (TRANSIENT)">CornflowerBlue</span><span class="punctuation">)</span><span class="punctuation">;</span>
 
        <span class="field name">_renderer</span><span class="operator">.</span><span class="method name">BeginFrame</span><span class="punctuation">(</span><span class="punctuation">)</span><span class="punctuation">;</span>
 
        <span class="field name">_renderer</span><span class="operator">.</span><span class="method name">DrawText</span><span class="punctuation">(</span><span class="string">&quot;Hello, Brine2D!&quot;</span><span class="punctuation">,</span> <span class="number">100</span><span class="punctuation">,</span> <span class="number">100</span><span class="punctuation">,</span> <span class="struct name">Color</span><span class="operator">.</span><span class="property name;Semantic - static symbol;Semantic - (TRANSIENT)">White</span><span class="punctuation">)</span><span class="punctuation">;</span>
 
        <span class="field name">_renderer</span><span class="operator">.</span><span class="method name">EndFrame</span><span class="punctuation">(</span><span class="punctuation">)</span><span class="punctuation">;</span>
    <span class="punctuation">}</span>
 
    <span class="keyword">protected</span> <span class="keyword">override</span> <span class="keyword">void</span> <span class="method name">OnUpdate</span><span class="punctuation">(</span><span class="struct name">GameTime</span> <span class="parameter name">gameTime</span><span class="punctuation">)</span>
    <span class="punctuation">{</span>
        <span class="keyword - control">if</span> <span class="punctuation">(</span><span class="field name">_input</span><span class="operator">.</span><span class="method name">IsKeyPressed</span><span class="punctuation">(</span><span class="enum name">Keys</span><span class="operator">.</span><span class="enum member name">Escape</span><span class="punctuation">)</span><span class="punctuation">)</span>
        <span class="punctuation">{</span>
            <span class="field name">_gameContext</span><span class="operator">.</span><span class="method name">RequestExit</span><span class="punctuation">(</span><span class="punctuation">)</span><span class="punctuation">;</span>
        <span class="punctuation">}</span>
    <span class="punctuation">}</span>
<span class="punctuation">}</span></code></pre>

That's it! A complete game window with input handling and rendering.

## Core Features

### :video_game: **Complete 2D Rendering**
- Hardware-accelerated rendering via SDL3
- Sprite sheets and animations
- Camera system with zoom and rotation
- Multiple render backends (GPU/Legacy)

### :space_invader: **Flexible Input System**
- Keyboard, mouse, and gamepad support
- Input layers (like middleware for input)
- Event-driven and polling APIs

### :speaker: **Audio System**
- Sound effects and music playback
- SDL3_mixer integration
- Simple, async-friendly API

### :jigsaw: **Scene Management**
- Organize games into scenes (like pages/views)
- Async loading with cancellation support
- Scene transitions

### :wrench: **Collision Detection**
- Box and circle colliders
- Spatial partitioning for performance
- Collision response helpers

### :world_map: **Tilemap Support**
- Tiled (.tmj) file format
- Automatic collision generation
- Layer rendering

### :art: **UI Framework**
- Immediate-mode style UI
- Buttons, sliders, text inputs, dialogs
- Tooltip system
- Customizable themes

## Project Structure

Brine2D follows a clean, modular architecture:

```
Brine2D/ 
├── Brine2D.Core          # Core abstractions (IScene, ITexture, etc.)
├── Brine2D.Engine        # Game loop and scene management 
├── Brine2D.Hosting       # ASP.NET-style hosting model 
├── Brine2D.Rendering     # Rendering abstractions 
├── Brine2D.Rendering.SDL # SDL3 rendering implementation 
├── Brine2D.Input         # Input abstractions 
├── Brine2D.Input.SDL     # SDL3 input implementation 
├── Brine2D.Audio         # Audio abstractions 
├── Brine2D.Audio.SDL     # SDL3 audio implementation 
└── Brine2D.UI            # UI framework
```

Each package is focused, testable, and can be swapped with custom implementations.

## Who Is This For?

### :man_technologist: **ASP.NET Developers**
You already know the patterns. Now build games with them.

### :video_game: **Game Developers**
Get enterprise-grade architecture without the boilerplate.

### :mortar_board: **Students & Educators**
Learn game development with familiar .NET patterns.

### :office: **Enterprise Teams**
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

-   :material-file-document: **Concepts**

    ---

    Deep dive into Brine2D's architecture

    [:octicons-arrow-right-24: Read Docs](concepts/index.md)

-   :material-code-tags: **Samples**

    ---

    Working examples you can run today

    [:octicons-arrow-right-24: Browse Samples](samples/index.md)

</div>

## Community & Support

- **GitHub**: [CrazyPickleStudios/Brine2D](https://github.com/CrazyPickleStudios/Brine2D)
- **Issues**: Report bugs or request features
- **Discussions**: Ask questions and share ideas
- **License**: MIT - Use it anywhere, even commercially

---

<div class="centered-text" markdown>
**Ready to build games the ASP.NET way?**

[Get Started :material-arrow-right:](getting-started/quickstart.md){ .md-button .md-button--primary }
[View Examples :material-github:](samples/index.md){ .md-button }
</div>
