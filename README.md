# Recursive documentation generator

You need an API Key to make requests to [Open AI API](https://platform.openai.com/)

## How it works

<img src="https://downloader.disk.yandex.ru/preview/229881ab1c37ddf5445be8a5707a399927aaeea356d96dc6515bf71a4c591983/642f52e6/o9MKawjFgPPvRfzAVQpJfhQ6bN0oY-R_wTW09y-x8NXCiMrAQXNGbjBXg8GpY2ZiF6znJWGi8APcxVjlfgHG5g%3D%3D?uid=0&filename=2023-04-06_22-16-17.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=0&tknv=v2&size=2048x2048" width="500">


## Project setup
```
npm install
```

## Run Electron app
```
npm run serve
```
<img src="https://downloader.disk.yandex.ru/preview/fda469575eb3353d46e81343e351ef1be7481d91fb33ffff945fefda5e8e933d/642f5412/8LnlQia5tTBvOgM3wL_HNhboq677O_K9fky8ZGymyrX9CUGHDnIIPqTiWBPBUaBzn97BU5VIHLjCZcGVeWs8pw%3D%3D?uid=0&filename=2023-04-06_22-21-20.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=0&tknv=v2&size=2048x2048" width="500">

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
