# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Troubleshooting

- Expo start path error (package.json not found): Ensure you start in the workspace root `MyCity/` (the folder containing `package.json`). If using commands from another location, `cd "/Applications/MyCity /MyCity"` first.
- iOS Simulator “No iOS devices available in Simulator.app”: Open Xcode > Settings > Platforms and install at least one iOS simulator runtime, then launch Simulator.app once. Alternatively, connect a physical iOS device or use the Android emulator.
- Metro stuck or stale cache: Start with a clear cache.
   - Tunnel: `npx expo start --tunnel --clear`
   - LAN: `npx expo start --clear`
- Port 8081 in use: Identify and stop the process.
   - macOS: `lsof -i :8081 | grep LISTEN` then `kill -9 <PID>`

## Tests

- Run unit tests: `npx vitest run`
- What’s covered: EONET URL building and event fetching pagination/abort handling.
