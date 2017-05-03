# cms-test
Playground environment for creating a content management system in EmberJS.

## Requirements
- You must have a working [NodeJS](https://nodejs.org) environment using LTS or later.

## Project Structure
- After cloning the repository, you will have two folders at the root:
  - `server/` Containing the NodeJS backend application.
  - `admin/` Containing the EmberJS frontend application.

## Development

Both frontend and backend applications support a live-reloading mechanism, whereby changes to the source code are immediately available on page reload. You can see the status of the build in the output of the respective commands (below). To stop serving an application, press `CTRL+C`.

### NodeJS Application

Install dependencies within the project directory (`server/`):
```
npm install
```

To start the node backend, execute `npm run serve`. Your node application is now running and accessible via `http://locahost:8888`.

### EmberJS Application

Install dependencies within the project directory (`admin/`):
```
npm install
bower install
```

To start the ember frontend, execute `ember build --watch`. Your ember application is now running and accessible via `http://localhost:4200`.

## Contributing

Submit modifications to this project using the Pull Request functionality within Github. Review the available [issues](https://github.com/cygnusb2b/cms-test/issues) for tasks and requirements.
