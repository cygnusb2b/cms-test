# cms-test
Playground environment for creating a simple content management system in EmberJS.

## Requirements
- You must have a working [NodeJS](https://nodejs.org) environment using [LTS](https://github.com/nodejs/LTS#lts-schedule1) or later.

## Project Structure
- After cloning the repository, you will have two folders at the root:
  - `server/` Containing the NodeJS backend application. 
    - This app simulates a REST backened, whereby database objects are stored using [NeDB](https://github.com/louischatriot/nedb), an on-disk/in-memory DB similar to MongoDB, but does not require you to setup the database. It'll "just work."
    - It is not expected that you modify any code in this app, though you're more than welcome to! 🙂
  - `admin/` Containing the [EmberJS](https://emberjs.com) frontend application.
    - This is where you'll be modyifing existing code and adding your own.
    - See the README in the `admin` folder for more information.

## Development

Both frontend and backend applications support a live-reloading mechanism, whereby changes to the source code are immediately available on page reload. You can see the status of the build in the output of the respective commands (below). To stop serving an application, press `CTRL+C`.

### Setup the NodeJS Application

Install dependencies within the project directory (`server/`):
```
cd server
npm install
```

To start the node backend, execute `npm run serve`. Your node application is now running and accessible via `http://locahost:8888`. See the README in the `server` folder for more information.

### Setup the EmberJS Application

Install dependencies within the project directory (`admin/`):
```
cd admin
npm install
bower install
```

To start the ember frontend, execute `ember serve --proxy=http://localhost:8888`. Your ember application is now running and accessible via `http://localhost:4200`. Note: you must have the NodeJS backend application running on `localhost:8888` (see above) before you start the Ember app. This ensures that any backened API requests from Ember will be fullfilled.

## Contributing

Submit modifications to this project using the Pull Request functionality within Github.

Review the [project requirements](https://github.com/cygnusb2b/cms-test/projects/1) for tasks to complete.
