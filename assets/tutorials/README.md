# Tutorial media

Interactive film-game demo used on `/tutorials/interactive-film-game.html`.

## Files

- `interactive-film-game-demo.mp4` — 1080p H.264 web encode (`+faststart`)
- `interactive-film-game-demo-poster.jpg` — poster frame

## Page markup

```html
<figure class="media-embed">
  <video
    controls
    playsinline
    preload="metadata"
    poster="/assets/tutorials/interactive-film-game-demo-poster.jpg"
    aria-label="{{film.demo.aria}}"
    src="/assets/tutorials/interactive-film-game-demo.mp4"
  ></video>
</figure>
```

`.media-embed` styles and `film.demo.aria` i18n keys are already in place.
