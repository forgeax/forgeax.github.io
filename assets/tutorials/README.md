# Tutorial media

Demo videos used on tutorial pages.

## Interactive film-game

Used on `/tutorials/interactive-film-game.html`.

- `interactive-film-game-demo.mp4` — 1080p H.264 web encode (`+faststart`)
- `interactive-film-game-demo-poster.jpg` — poster frame

## 3D generation workbench

Used at the end of `/tutorials/workbenches.html`, captioned as the 3D character-generation plugin demo.

- `gen3d-demo.mp4` — H.264 web encode (`+faststart`)
- `gen3d-demo-poster.jpg` — poster frame

## Page markup

```html
<figure class="media-figure">
  <div class="media-embed">
    <video
      controls
      playsinline
      preload="metadata"
      poster="/assets/tutorials/gen3d-demo-poster.jpg"
      aria-label="{{wb.demo.caption}}"
      src="/assets/tutorials/gen3d-demo.mp4"
    ></video>
  </div>
  <figcaption>{{wb.demo.caption}}</figcaption>
</figure>
```

`.media-embed` / `.media-figure` styles and `wb.demo.caption` / `film.demo.aria` i18n keys are already in place.
