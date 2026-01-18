---
title: Getting Started with Audio
description: Introduction to audio in Brine2D - setup, loading, and playback
---

# Getting Started with Audio

Learn the basics of audio in Brine2D, from setup to playing your first sound effects and music.

## Overview

Brine2D provides a complete audio system powered by SDL3_mixer with support for:

- **Sound Effects** - Short audio clips (explosions, jumps, UI sounds)
- **Music** - Long-form audio tracks (background music, ambience)
- **Spatial Audio** - 2D positional audio with distance and panning
- **Volume Control** - Master, music, and sound effect volume
- **Multiple Formats** - WAV, MP3, OGG, FLAC support

## Setup

### Register Audio Service

Add SDL3 audio to your game:

```csharp
using Brine2D.Audio.SDL;

var builder = GameApplication.CreateBuilder(args);

// Add SDL3 audio service
builder.Services.AddSDL3Audio();

// Other services...
builder.Services.AddSDL3Rendering();
builder.Services.AddSDL3Input();

var game = builder.Build();
await game.RunAsync<GameScene>();
```

### Inject IAudioService

Access audio in your scenes:

```csharp
using Brine2D.Audio;
using Brine2D.Core;

public class GameScene : Scene
{
    private readonly IAudioService _audio;
    
    public GameScene(
        IAudioService audio,
        ILogger<GameScene> logger) : base(logger)
    {
        _audio = audio;
    }
}
```

## Audio Assets

### Supported Formats

| Format | Use Case | Notes |
|--------|----------|-------|
| **WAV** | Sound effects | Uncompressed, instant playback |
| **MP3** | Music | Compressed, smaller files |
| **OGG** | Music, sounds | Open format, good compression |
| **FLAC** | High-quality music | Lossless compression |

### File Organization

Organize audio files in your project:

```
MyGame/
├── assets/
│   ├── sounds/
│   │   ├── jump.wav
│   │   ├── explosion.wav
│   │   ├── coin.wav
│   │   └── hit.wav
│   └── music/
│       ├── menu.mp3
│       ├── level1.mp3
│       └── boss.mp3
├── Program.cs
└── MyGame.csproj
```

**Best Practices:**
- Use WAV for short sound effects (< 2 seconds)
- Use MP3/OGG for music (> 30 seconds)
- Keep sound effects under 100KB each
- Use consistent sample rates (44.1 kHz recommended)

## Loading Audio

### Sound Effects

Load sound effects during scene initialization:

```csharp
public class GameScene : Scene
{
    private ISoundEffect? _jumpSound;
    private ISoundEffect? _coinSound;
    
    protected override async Task OnLoadAsync(CancellationToken cancellationToken)
    {
        // Load sound effects
        _jumpSound = await _audio.LoadSoundAsync(
            "assets/sounds/jump.wav", 
            cancellationToken);
        
        _coinSound = await _audio.LoadSoundAsync(
            "assets/sounds/coin.wav", 
            cancellationToken);
        
        Logger.LogInformation("Sound effects loaded");
    }
}
```

### Music

Load music files:

```csharp
public class GameScene : Scene
{
    private IMusic? _backgroundMusic;
    
    protected override async Task OnLoadAsync(CancellationToken cancellationToken)
    {
        // Load background music
        _backgroundMusic = await _audio.LoadMusicAsync(
            "assets/music/level1.mp3", 
            cancellationToken);
        
        Logger.LogInformation("Music loaded");
    }
}
```

### Loading Multiple Files

Load all audio at once:

```csharp
protected override async Task OnLoadAsync(CancellationToken cancellationToken)
{
    // Load all sound effects
    var soundPaths = new[]
    {
        "assets/sounds/jump.wav",
        "assets/sounds/coin.wav",
        "assets/sounds/explosion.wav",
        "assets/sounds/hit.wav"
    };
    
    var soundTasks = soundPaths.Select(path => 
        _audio.LoadSoundAsync(path, cancellationToken));
    
    var sounds = await Task.WhenAll(soundTasks);
    
    _jumpSound = sounds[0];
    _coinSound = sounds[1];
    _explosionSound = sounds[2];
    _hitSound = sounds[3];
    
    // Load music
    _backgroundMusic = await _audio.LoadMusicAsync(
        "assets/music/level1.mp3", 
        cancellationToken);
    
    Logger.LogInformation("All audio loaded");
}
```

## Playing Audio

### Sound Effects

Play sound effects in response to events:

```csharp
protected override void OnUpdate(GameTime gameTime)
{
    // Play jump sound when spacebar pressed
    if (_input.IsKeyPressed(Keys.Space) && _jumpSound != null)
    {
        _audio.PlaySound(_jumpSound);
    }
    
    // Play coin sound when collecting coins
    if (CollectedCoin() && _coinSound != null)
    {
        _audio.PlaySound(_coinSound);
    }
}
```

### Music

Play background music:

```csharp
protected override async Task OnLoadAsync(CancellationToken cancellationToken)
{
    _backgroundMusic = await _audio.LoadMusicAsync(
        "assets/music/level1.mp3", 
        cancellationToken);
    
    // Start playing music (loops by default)
    _audio.PlayMusic(_backgroundMusic);
}
```

### With Volume

Control playback volume:

```csharp
// Play at 50% volume
_audio.PlaySound(_explosionSound, volume: 0.5f);

// Play at full volume
_audio.PlaySound(_coinSound, volume: 1.0f);

// Play quietly
_audio.PlaySound(_footstepSound, volume: 0.2f);
```

### Looping Sounds

Play sounds repeatedly:

```csharp
// Loop 3 times
_audio.PlaySound(_engineSound, loops: 3);

// Loop infinitely (-1)
_audio.PlaySound(_ambientSound, loops: -1);
```

## Volume Control

### Master Volume

Control overall audio volume:

```csharp
// Set master volume (0.0 to 1.0)
_audio.MasterVolume = 0.8f;

// Get current master volume
var currentVolume = _audio.MasterVolume;

// Mute all audio
_audio.MasterVolume = 0f;
```

### Sound Effects Volume

Control all sound effects:

```csharp
// Set sound effects volume (0.0 to 1.0)
_audio.SoundVolume = 0.7f;

// Individual sounds are multiplied by this
// PlaySound(sound, volume: 0.5f) with SoundVolume = 0.7f
// Results in: 0.5 × 0.7 = 0.35 final volume
```

### Music Volume

Control background music:

```csharp
// Set music volume (0.0 to 1.0)
_audio.MusicVolume = 0.5f;

// Fade music down
for (float t = 1f; t >= 0f; t -= 0.01f)
{
    _audio.MusicVolume = t;
    await Task.Delay(50);
}
```

### Settings Integration

Save volume preferences:

```csharp
public class SettingsScene : Scene
{
    private float _masterVolume = 0.8f;
    private float _musicVolume = 0.6f;
    private float _soundVolume = 0.7f;
    
    private void ApplySettings()
    {
        _audio.MasterVolume = _masterVolume;
        _audio.MusicVolume = _musicVolume;
        _audio.SoundVolume = _soundVolume;
        
        // Save to config file
        SaveSettings();
    }
    
    private void LoadSettings()
    {
        // Load from config file
        var settings = LoadFromFile();
        _masterVolume = settings.MasterVolume;
        _musicVolume = settings.MusicVolume;
        _soundVolume = settings.SoundVolume;
        
        ApplySettings();
    }
}
```

## Music Playback Control

### Play and Stop

```csharp
// Start music
_audio.PlayMusic(_backgroundMusic);

// Stop music
_audio.StopMusic();

// Check if music is playing
if (_audio.IsMusicPlaying)
{
    Logger.LogInfo("Music is playing");
}
```

### Pause and Resume

```csharp
// Pause music
_audio.PauseMusic();

// Resume music
_audio.ResumeMusic();

// Check if paused
if (_audio.IsMusicPaused)
{
    Logger.LogInfo("Music is paused");
}
```

### Music Loops

```csharp
// Play once (stops after finish)
_audio.PlayMusic(_bossMusic, loops: 0);

// Play 3 times
_audio.PlayMusic(_victoryMusic, loops: 3);

// Loop forever (default)
_audio.PlayMusic(_backgroundMusic, loops: -1);
```

## Complete Example

Here's a full scene with audio:

```csharp
using Brine2D.Audio;
using Brine2D.Core;
using Brine2D.Input;

public class GameScene : Scene
{
    private readonly IAudioService _audio;
    private readonly IInputService _input;
    
    private ISoundEffect? _jumpSound;
    private ISoundEffect? _coinSound;
    private ISoundEffect? _explosionSound;
    private IMusic? _backgroundMusic;
    
    public GameScene(
        IAudioService audio,
        IInputService input,
        ILogger<GameScene> logger) : base(logger)
    {
        _audio = audio;
        _input = input;
    }
    
    protected override async Task OnInitializeAsync(CancellationToken cancellationToken)
    {
        // Set initial volumes
        _audio.MasterVolume = 0.8f;
        _audio.MusicVolume = 0.6f;
        _audio.SoundVolume = 0.7f;
    }
    
    protected override async Task OnLoadAsync(CancellationToken cancellationToken)
    {
        // Load sound effects
        _jumpSound = await _audio.LoadSoundAsync(
            "assets/sounds/jump.wav", cancellationToken);
        _coinSound = await _audio.LoadSoundAsync(
            "assets/sounds/coin.wav", cancellationToken);
        _explosionSound = await _audio.LoadSoundAsync(
            "assets/sounds/explosion.wav", cancellationToken);
        
        // Load and play music
        _backgroundMusic = await _audio.LoadMusicAsync(
            "assets/music/level1.mp3", cancellationToken);
        _audio.PlayMusic(_backgroundMusic);
        
        Logger.LogInformation("Audio loaded and music started");
    }
    
    protected override void OnUpdate(GameTime gameTime)
    {
        // Play jump sound
        if (_input.IsKeyPressed(Keys.Space))
        {
            _audio.PlaySound(_jumpSound);
        }
        
        // Play coin sound at 80% volume
        if (_input.IsKeyPressed(Keys.C))
        {
            _audio.PlaySound(_coinSound, volume: 0.8f);
        }
        
        // Play explosion sound
        if (_input.IsKeyPressed(Keys.E))
        {
            _audio.PlaySound(_explosionSound, volume: 1.0f);
        }
        
        // Pause/resume music
        if (_input.IsKeyPressed(Keys.M))
        {
            if (_audio.IsMusicPaused)
            {
                _audio.ResumeMusic();
                Logger.LogInfo("Music resumed");
            }
            else if (_audio.IsMusicPlaying)
            {
                _audio.PauseMusic();
                Logger.LogInfo("Music paused");
            }
        }
    }
    
    protected override void OnDispose()
    {
        // Stop music when scene ends
        _audio.StopMusic();
        
        // Optionally unload audio (will be cleaned up automatically)
        if (_jumpSound != null) _audio.UnloadSound(_jumpSound);
        if (_coinSound != null) _audio.UnloadSound(_coinSound);
        if (_explosionSound != null) _audio.UnloadSound(_explosionSound);
        if (_backgroundMusic != null) _audio.UnloadMusic(_backgroundMusic);
    }
}
```

## Common Patterns

### Loading Screen Audio

Load audio during a loading screen:

```csharp
public class LoadingScene : Scene
{
    protected override async Task OnLoadAsync(CancellationToken cancellationToken)
    {
        // Load all audio for next scene
        var audioFiles = new[]
        {
            ("jump", "assets/sounds/jump.wav"),
            ("coin", "assets/sounds/coin.wav"),
            ("music", "assets/music/level1.mp3")
        };
        
        int loaded = 0;
        foreach (var (name, path) in audioFiles)
        {
            if (path.EndsWith(".mp3") || path.EndsWith(".ogg"))
            {
                await _audio.LoadMusicAsync(path, cancellationToken);
            }
            else
            {
                await _audio.LoadSoundAsync(path, cancellationToken);
            }
            
            loaded++;
            UpdateProgress(loaded / (float)audioFiles.Length);
        }
        
        // Transition to game scene
        await _sceneManager.LoadSceneAsync<GameScene>();
    }
}
```

### Audio Manager

Create a centralized audio manager:

```csharp
public class AudioManager
{
    private readonly IAudioService _audio;
    private readonly Dictionary<string, ISoundEffect> _sounds = new();
    private readonly Dictionary<string, IMusic> _music = new();
    
    public AudioManager(IAudioService audio)
    {
        _audio = audio;
    }
    
    public async Task LoadSoundAsync(string name, string path, CancellationToken ct = default)
    {
        var sound = await _audio.LoadSoundAsync(path, ct);
        _sounds[name] = sound;
    }
    
    public void PlaySound(string name, float volume = 1.0f)
    {
        if (_sounds.TryGetValue(name, out var sound))
        {
            _audio.PlaySound(sound, volume);
        }
    }
    
    public async Task LoadMusicAsync(string name, string path, CancellationToken ct = default)
    {
        var music = await _audio.LoadMusicAsync(path, ct);
        _music[name] = music;
    }
    
    public void PlayMusic(string name)
    {
        if (_music.TryGetValue(name, out var music))
        {
            _audio.PlayMusic(music);
        }
    }
}
```

### Scene-Based Music

Change music per scene:

```csharp
public class MenuScene : Scene
{
    protected override async Task OnLoadAsync(CancellationToken cancellationToken)
    {
        var menuMusic = await _audio.LoadMusicAsync(
            "assets/music/menu.mp3", cancellationToken);
        _audio.PlayMusic(menuMusic);
    }
}

public class GameScene : Scene
{
    protected override async Task OnLoadAsync(CancellationToken cancellationToken)
    {
        // Stop menu music, start game music
        _audio.StopMusic();
        
        var gameMusic = await _audio.LoadMusicAsync(
            "assets/music/level1.mp3", cancellationToken);
        _audio.PlayMusic(gameMusic);
    }
}
```

## Best Practices

### Do

- **Load audio during scene initialization** - Not during gameplay
- **Use appropriate formats** - WAV for sounds, MP3/OGG for music
- **Respect volume levels** - Honor user settings
- **Stop music when changing scenes** - Avoid overlapping tracks
- **Unload audio when done** - Free memory (or rely on scene cleanup)

### Don't

- **Load audio synchronously in Update()** - Causes frame drops
- **Play too many sounds at once** - Causes audio mud
- **Use uncompressed formats for music** - Wastes disk space
- **Forget to handle null sounds** - Check if loading succeeded
- **Play music without volume control** - Always respect settings

### Volume Guidelines

```csharp
// Master volume: Overall control
_audio.MasterVolume = 0.8f;  // 80% - reasonable default

// Music volume: Background audio
_audio.MusicVolume = 0.6f;   // 60% - quieter than effects

// Sound effects volume: Gameplay sounds
_audio.SoundVolume = 0.7f;   // 70% - clear but not overwhelming

// Individual sounds
_audio.PlaySound(uiClick, volume: 0.5f);       // UI - subtle
_audio.PlaySound(footstep, volume: 0.3f);      // Ambient - quiet
_audio.PlaySound(explosion, volume: 1.0f);     // Important - full volume
_audio.PlaySound(playerJump, volume: 0.8f);    // Player action - clear
```

## Troubleshooting

### No Sound Playing

**Problem:** Audio doesn't play.

**Solutions:**

```csharp
// 1. Verify audio service is registered
builder.Services.AddSDL3Audio();

// 2. Check file exists
if (!File.Exists("assets/sounds/jump.wav"))
{
    Logger.LogError("Sound file not found!");
}

// 3. Verify sound loaded successfully
var sound = await _audio.LoadSoundAsync("assets/sounds/jump.wav");
if (sound == null)
{
    Logger.LogError("Failed to load sound!");
}

// 4. Check volume levels
Logger.LogInfo($"Master: {_audio.MasterVolume}, Sound: {_audio.SoundVolume}");
```

### Playback Lag

**Problem:** Delay between input and sound.

**Solution:** Use WAV files for immediate response:

```csharp
// Good: WAV loads instantly
var jumpSound = await _audio.LoadSoundAsync("assets/sounds/jump.wav");

// Bad: MP3 has decode overhead for short sounds
var jumpSound = await _audio.LoadSoundAsync("assets/sounds/jump.mp3");
```

### Music Won't Loop

**Problem:** Music plays once and stops.

**Solution:** Set loops to -1 (default):

```csharp
// Music loops by default
_audio.PlayMusic(backgroundMusic);

// Or explicitly set infinite loop
_audio.PlayMusic(backgroundMusic, loops: -1);
```

### Sounds Too Quiet

**Problem:** Can barely hear audio.

**Solution:** Check volume multipliers:

```csharp
// Sound effects are multiplied:
// Final Volume = SoundVolume × PlaySound volume

_audio.SoundVolume = 0.7f;  // Sound effects at 70%
_audio.PlaySound(sound, volume: 0.5f);  // 50% of sound effects
// Result: 0.7 × 0.5 = 0.35 (35% final volume)

// Fix: Increase base volumes
_audio.SoundVolume = 1.0f;
_audio.PlaySound(sound, volume: 0.8f);
```

## Next Steps

Now that you understand the basics, explore advanced audio features:

- **[Sound Effects](sound-effects.md)** - Advanced sound playback techniques
- **[Music Playback](music.md)** - Music control and transitions
- **[Spatial Audio](spatial-audio.md)** - 2D positional audio with distance and panning
- **[ECS Audio](../ecs/systems.md#audiosystem)** - Component-based audio sources

---

**Quick Reference:**

```csharp
// Setup
builder.Services.AddSDL3Audio();

// Loading
var sound = await _audio.LoadSoundAsync("path/to/sound.wav");
var music = await _audio.LoadMusicAsync("path/to/music.mp3");

// Playing
_audio.PlaySound(sound, volume: 0.8f, loops: 0);
_audio.PlayMusic(music, loops: -1);

// Control
_audio.MasterVolume = 0.8f;
_audio.MusicVolume = 0.6f;
_audio.SoundVolume = 0.7f;

// Music
_audio.PauseMusic();
_audio.ResumeMusic();
_audio.StopMusic();

// Cleanup
_audio.UnloadSound(sound);
_audio.UnloadMusic(music);
```