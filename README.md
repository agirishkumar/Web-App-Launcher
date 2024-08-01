# Web App Launcher
A web-based application launcher with user authentication.

# Web App Launcher

A web-based application launcher with user authentication.

## Features

- User Registration and Login
- Application Launching
- Application Status Tracking

## Known Issues

1. **Application Termination**: Currently, the "Stop" functionality does not reliably terminate launched applications. The application status is updated in the database, but the actual process may continue running on the system. This issue is slated for future investigation and resolution.

## TODO

- [ ] Investigate and implement a more robust method for terminating launched applications.
- [ ] Add error handling and validation for application launch inputs.
- [ ] Implement user session management and logout functionality.
- [ ] Improve UI/UX with better styling and real-time updates.


## Usage

navigate to backend folder:
`cd backend`
`npm run dev`

navigate to frontend folder:
`cd frontend`
`npm start`

## Contributing

(Add contribution guidelines here)

## License

MIT License
