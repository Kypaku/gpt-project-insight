# Recursive documentation generator

You need an API Key to make requests to (Open AI API)[https://platform.openai.com/]

## How it works

<img src="https://disk.yandex.ru/i/HwqBj2ExbvFdDQ
https://downloader.disk.yandex.ru/preview/229881ab1c37ddf5445be8a5707a399927aaeea356d96dc6515bf71a4c591983/642f52e6/o9MKawjFgPPvRfzAVQpJfhQ6bN0oY-R_wTW09y-x8NXCiMrAQXNGbjBXg8GpY2ZiF6znJWGi8APcxVjlfgHG5g%3D%3D?uid=0&filename=2023-04-06_22-16-17.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=0&tknv=v2&size=2048x2048" width="400">


## Project setup
```
npm install
```

## Run Electron app
```
npm run server
```

<img src="https://downloader.disk.yandex.ru/preview/b15a11b5944c111c6a906fbeb2383e9544a296bf34fc357bfb2e930cd56b95c9/642f3efd/gtm-bTcd0-SDIk3UVD9sMjZTZJYcc9TlUBcdDijpD6-cT5Q5JWYEwJDZZ1KFilMMXyQUKdbELjxX6hDFF3tHEg%3D%3D?uid=0&filename=2023-04-06_20-51-05.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=0&tknv=v2&size=2048x2048" width="400">

## Generate using CLI

### npx

```
npx tsx .\engine\cli.ts YOUR_API_KEY C:/directory/
```

### Build the engine and run

```
tsc ./engine/cli.ts --outDir ./out_engine
```
```
 node .\out_engine\engine\cli.js YOUR_API_KEY C:/directory/
 ```
