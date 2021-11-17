# about

Personal three.js based gltf viewer.

# development

## npm

`npm init`

## three.js

`npm install three --save-dev`

## typescript

`npm install typescript --save-dev`
`npm install @types/three --save-dev`

`./tsconfig.json`

```json
{
  "compilerOptions": {
    "allowSyntheticDefaultImports": true,
    "outDir": "./dist/",
    "noImplicitAny": true,
    "module": "es6",
    "moduleResolution": "node",
    "sourceMap": true,
    "target": "es6",
    "typeRoots": [
      "node_modules/@types"
    ],
    "lib": [
      "es2017",
      "dom"
    ]
  }
}
```

## webpack

`npm install webpack webpack-cli webpack-dev-server --save-dev`
`npm install ts-loader --save-dev`
