# Art Deco toolkit

[Open the Art Deco style page](https://visiontrail.github.io/codex-film-studio/styles/art-deco/showcase/index.html?lang=en) · [中文独立风格页](https://visiontrail.github.io/codex-film-studio/styles/art-deco/showcase/index.html?lang=zh)

Explore a 16-second interactive material study, palette, drawing and motion rules,
and project-creation steps. The original study uses the reusable toolkit; it is
not a published production film.

The [style guide](STYLE.md) explains the drawing, motion and review rules. The [blank starter](starter/) contains deterministic Canvas 2D materials, a projective camera and an articulated figure. It has no story, narration, finished scene sequence or production media.

Create a separate production with:

```sh
python scripts/new_film.py my-film --style art-deco
```

The default output is outside this library. Author a new storyboard and renderer there; do not copy a prior film's cast, claims, script or scene content. Status: toolkit-ready. The two local experimental productions are not published demos and do not establish exact style equivalence.
