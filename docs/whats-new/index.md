---
title: What's New in Brine2D
description: Release history, changelogs, and version information for Brine2D
---

# What's New in Brine2D

Track Brine2D's evolution from early beta to stable release. See what's changed, what's new, and what's coming next.

---

## Latest Release

### [v0.9.0-beta](v0.9.0-beta.md) - January 2026

**Major architectural release** with package separation, .NET 10 support, and comprehensive improvements.

**Highlights:**

- 📦 **Package Separation** - Brine2D + Brine2D.SDL for better modularity
- 🎵 **Track-Based Audio** - Precise audio control with track handles
- 📊 **Performance Monitoring** - Built-in FPS, frame time, and memory stats
- 🎨 **GPU Renderer Improvements** - Now the default with automatic batching
- 🔢 **.NET 10 Support** - Built on the latest .NET

[:octicons-arrow-right-24: See Full Changelog](v0.9.0-beta.md)

---

## Release History

### Beta Releases

| Version | Release Date | Highlights |
|---------|--------------|------------|
| **[v0.9.0-beta](v0.9.0-beta.md)** | Jan 2026 | Package separation, track-based audio, .NET 10 |
| **[v0.8.0-beta](v0.8.0-beta.md)** | Dec 2025 | Particle textures, spatial audio, texture atlasing |
| **[v0.7.0-beta](v0.7.0-beta.md)** | Nov 2025 | GPU renderer, post-processing, EventBus |
| **[v0.6.0-beta](v0.6.0-beta.md)** | Oct 2025 | Scene transitions, UI framework, collision system |

---

## Version Support

### Currently Supported

| Version | Status | Support Until | .NET Version |
|---------|--------|---------------|--------------|
| **v0.9.0-beta** | ✅ Latest | - | .NET 10 |
| **v0.8.0-beta** | ⚠️ Maintenance | Mar 2026 | .NET 10 |
| **v0.7.0-beta** | ❌ End of life | - | .NET 9 |

!!! warning "v0.7.0 End of Life"
    v0.7.0 and earlier are no longer supported. Please upgrade to v0.9.0.

---

## Migration Guides

### Upgrading from v0.8.0 to v0.9.0

**Breaking changes:**

1. **Package names changed**

```xml
<!-- Old (v0.8.0) -->
<PackageReference Include="Brine2D" Version="0.8.0-beta" />

<!-- New (v0.9.0) -->
<PackageReference Include="Brine2D" Version="0.9.0-beta" />
<PackageReference Include="Brine2D.SDL" Version="0.9.0-beta" />
```

2. **Audio API updated**

```csharp
// Old (v0.8.0)
int channel = _audio.PlaySound(_shootSound);
_audio.StopChannel(channel);

// New (v0.9.0)
nint track = _audio.PlaySoundWithTrack(_shootSound);
_audio.StopTrack(track);
```

3. **Namespace changes**

```csharp
// Old
using Brine2D.Rendering;

// New
using Brine2D.SDL;  // For SDL implementations
```

[:octicons-arrow-right-24: Full Migration Guide](v0.9.0-beta.md#migration-guide)

---

### Upgrading from v0.7.0 to v0.9.0

**Major changes:**

1. **.NET 10 required**

```bash
# Download .NET 10 SDK
https://dotnet.microsoft.com/download/dotnet/10.0
```

2. **Property injection pattern** (v0.8.0+)

```csharp
// Old (v0.7.0)
public class GameScene : Scene
{
    private readonly IRenderer _renderer;
    
    public GameScene(IRenderer renderer, ILogger<GameScene> logger)
        : base(logger)
    {
        _renderer = renderer;
    }
}

// New (v0.9.0)
public class GameScene : Scene
{
    public GameScene(IInputContext input)
    {
        // Only inject YOUR services
    }
    
    protected override void OnRender(GameTime gameTime)
    {
        Renderer.DrawText(...);  // Framework property!
    }
}
```

[:octicons-arrow-right-24: See v0.8.0 Changelog](v0.8.0-beta.md)

---

## Roadmap

### Planned for v0.10.0 (Q2 2026)

- 🧪 **Testing framework** - Built-in testing utilities for scenes/entities
- 🔊 **Audio effects** - Reverb, echo, filters
- 📱 **Mobile support** - Android and iOS via .NET MAUI
- 🎬 **Timeline system** - Cutscenes and scripted events
- 📦 **Asset pipeline** - Asset preprocessing and optimization

### Planned for v1.0.0 Stable (Q3 2026)

- 🔒 **API stability** - No more breaking changes
- 📚 **Complete documentation** - Every feature documented
- 🎓 **Video tutorials** - YouTube series
- 🏆 **Production ready** - Battle-tested in real games
- 🌐 **Community site** - Showcase, tutorials, forums

[:octicons-arrow-right-24: View Full Roadmap](https://github.com/CrazyPickleStudios/Brine2D/issues?q=is%3Aissue+is%3Aopen+label%3Aroadmap)

---

## Feature Comparison

### v0.9.5 vs v0.9.0

| Feature | v0.9.0 | v0.9.5 | Change |
|---------|--------|--------|--------|
| **Package Model** | Brine2D + Brine2D.SDL | Single Brine2D | :white_check_mark: Simplified |
| **Builder API** | `AddSDL3Rendering` | `builder.Configure` | :white_check_mark: Breaking |
| **Options** | Flat | Nested (Window, Rendering) | :white_check_mark: Breaking |
| **Scene Constructor** | Manual injection + `base(logger)` | Framework properties | :white_check_mark: Breaking |
| **Scene Lifecycle** | Had OnInitializeAsync | Removed | :white_check_mark: Breaking |
| **Input Enum** | `Keys` | `Key` | :white_check_mark: Breaking |
| **Component** | Had OnUpdate | Only OnAdded/OnRemoved | :white_check_mark: Breaking |
| **Entity.Id** | Guid | long | :white_check_mark: Breaking |
| **LoadScene** | Async | Void (fire-and-forget) | :white_check_mark: Breaking |

---

### v0.9.0 vs v0.8.0

| Feature | v0.8.0 | v0.9.0 | Change |
|---------|--------|--------|--------|
| **Package Structure** | Monolithic | Modular (Core + SDL) | ✅ Improved |
| **Audio API** | Channel-based | Track-based | ✅ Breaking |
| **.NET Version** | .NET 10 | .NET 10 | No change |
| **Performance Monitoring** | ❌ None | ✅ Built-in | ✅ New |
| **GPU Renderer** | Optional | Default | ✅ Improved |
| **Particle Textures** | ✅ Yes | ✅ Yes | No change |
| **Spatial Audio** | ✅ Yes | ✅ Enhanced | ✅ Improved |

---

## Breaking Changes Log

### v0.9.0

- **Audio:** `PlaySound()` returns `nint` instead of `int`
- **Audio:** `StopChannel()` replaced with `StopTrack()`
- **Packages:** Split into `Brine2D` and `Brine2D.SDL`
- **Namespaces:** `Brine2D.Rendering` → `Brine2D.SDL` (implementations)

### v0.8.0

- **Scenes:** Constructor injection changed (Logger/World/Renderer now properties)
- **Scenes:** `base(logger)` constructor call removed
- **ECS:** `World` is now a framework property, not injected

### v0.7.0

- **Rendering:** `SDL3GPURenderer` introduced as separate backend
- **EventBus:** Moved from `Brine2D.ECS` to `Brine2D.Core`

---

## Deprecation Notices

### Deprecated in v0.9.0

| API | Replacement | Removal Date |
|-----|-------------|--------------|
| `IAudioService.StopChannel(int)` | `IAudioService.StopTrack(nint)` | v0.10.0 |
| `IAudioService.PauseChannel(int)` | `IAudioService.PauseTrack(nint)` | v0.10.0 |
| `IAudioService.IsChannelPlaying(int)` | Check track stopped event | v0.10.0 |

!!! warning "Update Your Code"
    Deprecated APIs will be removed in v0.10.0 (Q2 2026). Migrate now to avoid issues.

---

## Release Philosophy

Brine2D follows **Semantic Versioning**:

- **Major (1.0, 2.0)** - Breaking changes
- **Minor (0.9, 0.10)** - New features, may include breaking changes in beta
- **Patch (0.9.1, 0.9.2)** - Bug fixes only, no breaking changes

### Beta Phase (Current)

- APIs **may change** between releases
- Major features still being added
- Performance improvements ongoing
- Community feedback shapes direction

### Stable Phase (v1.0+)

- **No breaking changes** without major version bump
- Long-term support for each major version
- Predictable release schedule
- Production-ready stability

---

## Get Notified

Stay up to date with Brine2D releases:

- 🔔 **Watch on GitHub** - [Star the repo](https://github.com/CrazyPickleStudios/Brine2D) for notifications
- 📝 **Read the blog** - Dev blog (coming soon)
- 🐦 **Follow on Twitter** - @Brine2D (coming soon)
- 📧 **Mailing list** - Subscribe (coming soon)

---

## Contributing

Help shape Brine2D's future:

- 💡 **Request features** - [Open an issue](https://github.com/CrazyPickleStudios/Brine2D/issues/new)
- 🐛 **Report bugs** - [Bug report template](https://github.com/CrazyPickleStudios/Brine2D/issues/new?template=bug_report.md)
- 🤝 **Submit PRs** - [Contributing guide](../contributing/index.md)
- 💬 **Join discussions** - [GitHub Discussions](https://github.com/CrazyPickleStudios/Brine2D/discussions)

---

**See a specific version:** [v0.9.5](v0.9.5-beta.md) | [v0.9.0](v0.9.0-beta.md) | [v0.8.0](v0.8.0-beta.md) | [v0.7.0](v0.7.0-beta.md) | [v0.6.0](v0.6.0-beta.md)