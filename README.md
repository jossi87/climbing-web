<!-- Prerequisites -->
### :bangbang: Prerequisites

This project uses Yarn as package manager

```bash
 npm install --global yarn
```

<!-- Run Locally -->
### :arrow_forward: Run Locally

Clone the project

```bash
  git clone https://josteinoygarden@bitbucket.org/josteinoygarden/buldreinfo-web.git
```

Go to the project directory

```bash
  cd buldreinfo-web
```

Install dependencies

```bash
  yarn
```

Start the server

```bash
  yarn dev
```

<!-- Deployment -->
### :triangular_flag_on_post: Deployment

To deploy this project run

```bash
  yarn build
```

Check if code is ES6 compliant

```bash
  yarn es6-check
```

<!-- Project specific -->
### :bomb: Project specific
:bomb:
* While installing new dependecies, it is necessary to use "yarn add -D" if its a dev dependency or just "yarn add" if its not. Do not use npm install, this will create a new package-lock.json which will interfere with the yarn.lock.
* Don't update from "leaflet.fullscreen": "^1.6.0", newer versions crashes on Safari: [https://github.com/Leaflet/Leaflet/issues/7255]https://github.com/Leaflet/Leaflet/issues/7255

<!-- License -->
## :warning: License

Distributed under the GNU GENERAL PUBLIC LICENSE (Version 3): https://brattelinjer.no/gpl-3.0.txt

<!-- Links -->
## :link: Links
* Bouldering: [https://buldreinfo.com/]buldreinfo.com
* Route climbing: [https://brattelinjer.no/]brattelinjer.no
* Ice climbing: [https://is.brattelinjer.no/]is.brattelinjer.no

<!-- Contact -->
## :handshake: Contact
Jostein Oeygarden - jostein.oygarden@gmail.com
Project Link: [https://bitbucket.org/josteinoygarden/buldreinfo-web/src/master/](https://bitbucket.org/josteinoygarden/buldreinfo-web/src/master/)