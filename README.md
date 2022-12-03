# BelgianTrain Liveboard Web Component

_A web component simulating the **liveboards** in the **NMBS/SNCB** train stations._

[![GitHub Release][releases-shield]][releases]
[![License][license-shield]](LICENSE)

This webcomponent follows the [open-wc](https://github.com/open-wc/open-wc) recommendation.

## Installation

### Install with npm

```sh
npm install github:jonatcln/belgiantrain-liveboard-wc#semver:^0.1
```

```html
<script type="module">
    import 'belgiantrain-liveboard-wc/belgiantrain-liveboard.js';
</script>
```

### Use directly via cdn

```html
<script
    type="module"
    src="https://cdn.jsdelivr.net/gh/jonatcln/belgiantrain-liveboard-wc@0.1/dist/belgiantrain-liveboard.min.js"
></script>
```

## Usage

Basic usage example:

```html
<belgiantrain-liveboard id="liveboard" lang="en"></belgiantrain-liveboard>

<script>
    fetch(
        'http://api.irail.be/liveboard/?station=Gent-Sint-Pieters&format=json&lang=en',
        {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        }
    )
        .then((response) => response.json())
        .then((data) => {
            document.getElementById('liveboard').data = data;
        });
</script>
```

Check out [`demo/index.html`](demo/index.html) for a complete example.

## License

Licensed under the [MIT license](LICENSE).

<!-- LINKS -->

[releases]: https://github.com/jonatcln/belgiantrain-liveboard-wc/releases

<!-- SHIELDS -->

[releases-shield]: https://img.shields.io/github/release/jonatcln/belgiantrain-liveboard-wc.svg?style=for-the-badge
[license-shield]: https://img.shields.io/github/license/jonatcln/belgiantrain-liveboard-wc.svg?style=for-the-badge
