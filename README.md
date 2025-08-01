# @tscircuit/kicad-viewer

[View online](https://tscircuit.github.io/kicad-viewer) &middot; [Official Kicad Footprint Repo](https://gitlab.com/kicad/libraries/kicad-footprints) &middot; [tscircuit Github](https//github.com/tscircuit/tscircuit) &middot; [Discord](https://tscircuit.com/join)

This is a simple online viewer for the official KiCad footprints.

[![image](https://github.com/tscircuit/kicad-viewer/assets/1910070/36a2c07c-504d-4242-a875-bd614ab2844e)](https://tscircuit.github.io/kicad-viewer)

## Running Locally

You should be able to run it with `npm i` and `npm run start`.

Before building the static site the footprint library is preconverted to
Circuit JSON files with `npm run prebuild-footprints`. This step is automatically
invoked during `npm run build` and outputs files under `public/circuit-json/`.
