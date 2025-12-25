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

<pre style="font-family:Cascadia Mono;font-size:13px;color:gainsboro;background:#1e1e1e;"><span style="color:#569cd6;">using</span>&nbsp;Brine2D<span style="color:#b4b4b4;">.</span>Core;
<span style="color:#569cd6;">using</span>&nbsp;Brine2D<span style="color:#b4b4b4;">.</span>Engine;
<span style="color:#569cd6;">using</span>&nbsp;Brine2D<span style="color:#b4b4b4;">.</span>Hosting;
<span style="color:#569cd6;">using</span>&nbsp;Brine2D<span style="color:#b4b4b4;">.</span>Input;
<span style="color:#569cd6;">using</span>&nbsp;Brine2D<span style="color:#b4b4b4;">.</span>Input<span style="color:#b4b4b4;">.</span>SDL;
<span style="color:#569cd6;">using</span>&nbsp;Brine2D<span style="color:#b4b4b4;">.</span>Rendering;
<span style="color:#569cd6;">using</span>&nbsp;Brine2D<span style="color:#b4b4b4;">.</span>Rendering<span style="color:#b4b4b4;">.</span>SDL;
<span style="color:#569cd6;">using</span>&nbsp;Microsoft<span style="color:#b4b4b4;">.</span>Extensions<span style="color:#b4b4b4;">.</span>Logging;
 
<span style="color:#57a64a;">//&nbsp;Create&nbsp;builder&nbsp;(like&nbsp;ASP.NET&#39;s&nbsp;WebApplication.CreateBuilder)</span>
<span style="color:#569cd6;">var</span>&nbsp;<span style="color:#9cdcfe;">builder</span>&nbsp;<span style="color:#b4b4b4;">=</span>&nbsp;<span style="color:#4ec9b0;">GameApplication</span><span style="color:#b4b4b4;">.</span><span style="color:#dcdcaa;">CreateBuilder</span>(<span style="color:#569cd6;">args</span>);
 
<span style="color:#57a64a;">//&nbsp;Configure&nbsp;services</span>
<span style="color:#9cdcfe;">builder</span><span style="color:#b4b4b4;">.</span>Services<span style="color:#b4b4b4;">.</span><span style="color:#dcdcaa;">AddSDL3Rendering</span>(<span style="color:#9cdcfe;">options</span>&nbsp;<span style="color:#b4b4b4;">=&gt;</span>
{
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#9cdcfe;">options</span><span style="color:#b4b4b4;">.</span>WindowTitle&nbsp;<span style="color:#b4b4b4;">=</span>&nbsp;<span style="color:#d69d85;">&quot;My&nbsp;Game&quot;</span>;
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#9cdcfe;">options</span><span style="color:#b4b4b4;">.</span>WindowWidth&nbsp;<span style="color:#b4b4b4;">=</span>&nbsp;<span style="color:#b5cea8;">1280</span>;
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#9cdcfe;">options</span><span style="color:#b4b4b4;">.</span>WindowHeight&nbsp;<span style="color:#b4b4b4;">=</span>&nbsp;<span style="color:#b5cea8;">720</span>;
});
 
<span style="color:#9cdcfe;">builder</span><span style="color:#b4b4b4;">.</span>Services<span style="color:#b4b4b4;">.</span><span style="color:#dcdcaa;">AddSDL3Input</span>();
<span style="color:#9cdcfe;">builder</span><span style="color:#b4b4b4;">.</span>Services<span style="color:#b4b4b4;">.</span><span style="color:#dcdcaa;">AddScene</span>&lt;<span style="color:#4ec9b0;">GameScene</span>&gt;();
 
<span style="color:#57a64a;">//&nbsp;Build&nbsp;and&nbsp;run</span>
<span style="color:#569cd6;">var</span>&nbsp;<span style="color:#9cdcfe;">game</span>&nbsp;<span style="color:#b4b4b4;">=</span>&nbsp;<span style="color:#9cdcfe;">builder</span><span style="color:#b4b4b4;">.</span><span style="color:#dcdcaa;">Build</span>();
 
<span style="color:#d8a0df;">await</span>&nbsp;<span style="color:#9cdcfe;">game</span><span style="color:#b4b4b4;">.</span><span style="color:#dcdcaa;">RunAsync</span>&lt;<span style="color:#4ec9b0;">GameScene</span>&gt;();
 
<span style="color:#57a64a;">//&nbsp;Define&nbsp;your&nbsp;scene&nbsp;(like&nbsp;an&nbsp;ASP.NET&nbsp;controller)</span>
<span style="color:#569cd6;">public</span>&nbsp;<span style="color:#569cd6;">class</span>&nbsp;<span style="color:#4ec9b0;">GameScene</span>&nbsp;:&nbsp;<span style="color:#4ec9b0;">Scene</span>
{
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#569cd6;">private</span>&nbsp;<span style="color:#569cd6;">readonly</span>&nbsp;<span style="color:#b8d7a3;">IInputService</span>&nbsp;_input;
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#569cd6;">private</span>&nbsp;<span style="color:#569cd6;">readonly</span>&nbsp;<span style="color:#b8d7a3;">IRenderer</span>&nbsp;_renderer;
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#569cd6;">private</span>&nbsp;<span style="color:#569cd6;">readonly</span>&nbsp;<span style="color:#b8d7a3;">IGameContext</span>&nbsp;_gameContext;
 
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#569cd6;">public</span>&nbsp;<span style="color:#4ec9b0;">GameScene</span>
&nbsp;&nbsp;&nbsp;&nbsp;(
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#b8d7a3;">IRenderer</span>&nbsp;<span style="color:#9cdcfe;">renderer</span>,
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#b8d7a3;">IInputService</span>&nbsp;<span style="color:#9cdcfe;">input</span>,
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#b8d7a3;">IGameContext</span>&nbsp;<span style="color:#9cdcfe;">gameContext</span>,
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#b8d7a3;">ILogger</span>&lt;<span style="color:#4ec9b0;">GameScene</span>&gt;&nbsp;<span style="color:#9cdcfe;">logger</span>
&nbsp;&nbsp;&nbsp;&nbsp;)&nbsp;:&nbsp;<span style="color:#569cd6;">base</span>(<span style="color:#9cdcfe;">logger</span>)
&nbsp;&nbsp;&nbsp;&nbsp;{
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;_renderer&nbsp;<span style="color:#b4b4b4;">=</span>&nbsp;<span style="color:#9cdcfe;">renderer</span>;
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;_input&nbsp;<span style="color:#b4b4b4;">=</span>&nbsp;<span style="color:#9cdcfe;">input</span>;
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;_gameContext&nbsp;<span style="color:#b4b4b4;">=</span>&nbsp;<span style="color:#9cdcfe;">gameContext</span>;
&nbsp;&nbsp;&nbsp;&nbsp;}
 
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#569cd6;">protected</span>&nbsp;<span style="color:#569cd6;">override</span>&nbsp;<span style="color:#569cd6;">void</span>&nbsp;<span style="color:#dcdcaa;">OnRender</span>(<span style="color:#86c691;">GameTime</span>&nbsp;<span style="color:#9cdcfe;">gameTime</span>)
&nbsp;&nbsp;&nbsp;&nbsp;{
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;_renderer<span style="color:#b4b4b4;">.</span><span style="color:#dcdcaa;">Clear</span>(<span style="color:#86c691;">Color</span><span style="color:#b4b4b4;">.</span>CornflowerBlue);
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;_renderer<span style="color:#b4b4b4;">.</span><span style="color:#dcdcaa;">BeginFrame</span>();
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;_renderer<span style="color:#b4b4b4;">.</span><span style="color:#dcdcaa;">DrawText</span>(<span style="color:#d69d85;">&quot;Hello,&nbsp;Brine2D!&quot;</span>,&nbsp;<span style="color:#b5cea8;">100</span>,&nbsp;<span style="color:#b5cea8;">100</span>,&nbsp;<span style="color:#86c691;">Color</span><span style="color:#b4b4b4;">.</span>White);
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;_renderer<span style="color:#b4b4b4;">.</span><span style="color:#dcdcaa;">EndFrame</span>();
&nbsp;&nbsp;&nbsp;&nbsp;}
 
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#569cd6;">protected</span>&nbsp;<span style="color:#569cd6;">override</span>&nbsp;<span style="color:#569cd6;">void</span>&nbsp;<span style="color:#dcdcaa;">OnUpdate</span>(<span style="color:#86c691;">GameTime</span>&nbsp;<span style="color:#9cdcfe;">gameTime</span>)
&nbsp;&nbsp;&nbsp;&nbsp;{
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#d8a0df;">if</span>&nbsp;(_input<span style="color:#b4b4b4;">.</span><span style="color:#dcdcaa;">IsKeyPressed</span>(<span style="color:#b8d7a3;">Keys</span><span style="color:#b4b4b4;">.</span>Escape))
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;_gameContext<span style="color:#b4b4b4;">.</span><span style="color:#dcdcaa;">RequestExit</span>();
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}
&nbsp;&nbsp;&nbsp;&nbsp;}
}</pre>

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
