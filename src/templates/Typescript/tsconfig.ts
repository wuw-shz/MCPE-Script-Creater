export async function create(info: Info): Promise<void> {
   const data = {
      "compilerOptions": {
         "module": "ES2020",
         "target": "ES2021",
         "moduleResolution": "node",
         "allowSyntheticDefaultImports": true,
         "baseUrl": "./src",
         "rootDir": "./src",
         "outDir": "./scripts",
         "forceConsistentCasingInFileNames": true,
      },
      "exclude": ["./node_modules"],
      "include": ["./src"]
   }

   await Bun.write(info.targetPath + "/tsconfig.json", JSON.stringify(data, null, 3));
}