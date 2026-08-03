# Tutorial media slot

Reserved for the interactive film-game demo. Production currently ships **without** the video.

## Files to drop here

- `interactive-film-game-demo.mp4`
- `interactive-film-game-demo-poster.jpg`

## Restore on the tutorial page

In `templates/pages/tutorials-interactive-film-game.html`, replace the one-line demo-video comment under the standfirst with:

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
