# Recursive documentation generator
* [Project setup](#project-setup)
* [Run Electron app](#run-electron-app)
* [Generate using CLI](#generate-using-cli)
* [Config and Settings](#config-and-options)

This project generates documentation recursively using the OpenAI API. To use this application, you need to have an API Key for the [Open AI API](https://platform.openai.com/)

## How it works

<img src="https://downloader.disk.yandex.ru/preview/229881ab1c37ddf5445be8a5707a399927aaeea356d96dc6515bf71a4c591983/642f52e6/o9MKawjFgPPvRfzAVQpJfhQ6bN0oY-R_wTW09y-x8NXCiMrAQXNGbjBXg8GpY2ZiF6znJWGi8APcxVjlfgHG5g%3D%3D?uid=0&filename=2023-04-06_22-16-17.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=0&tknv=v2&size=2048x2048" width="500">


## Project setup
```
npm install
```

## Run Electron app
```
npm run electron:serve
```

<img src="https://i.ibb.co/MZ2hgcw/localhost-8083.png" width="500">

## Generate using CLI

### npx

```
npx tsx .\engine\cli.ts YOUR_API_KEY C:/directory/
```

### help
```
npx tsx .\engine\cli.ts --help
```

### Build the engine and run

```
tsc ./engine/cli.ts --outDir ./out_engine
```
```
node .\out_engine\engine\cli.js YOUR_API_KEY C:/directory/
```

### help
```
node .\out_engine\engine\cli.js --help
```

## Config and options
### Config:
You can load config from CLI using --config option

Config loads automatically from file "SELECTED_DIR/docs.ai.config.json" in the electron app
### Options:
*  --maxTokens <maxTokens>          the maximum number of tokens that the model can accept
*  --bytesPerToken <bytesPerToken>  approximate number of bytes in 
one token
*  --maxQueries <maxQueries>        Maximum number of requests simultaneously
*  --outFile <outFile>              The file to write the result   
*  --config <config>                The file to read the config from
*  --maxTokensFile <maxTokensFile>  The max tokens values for files  --maxTokensDir <maxTokensDir>    The max tokens values for directories
*  --bytesPerToken <bytesPerToken>  approximate number of bytes in 
one token
*  --temperature <temperature>      The temperature of the model   
*  --excludes <excludes>            The pattern to exclude files. Example: dir1,dir2,file3,*.png
*  --model <model>                  The model to use
*  -h, --help                       display help for command
  
  

  
