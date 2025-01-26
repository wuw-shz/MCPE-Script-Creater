export async function create(info: Info): Promise<void> {
   const data = {
      "scripts": {
         "dev": "bun tsc -w"
      },
      "dependencies": {
         "@minecraft/server-ui": info.minecraftNPMVersions["@minecraft/server-ui"],
         "@minecraft/server": info.minecraftNPMVersions["@minecraft/server"],
         "typescript": "latest"
      }
   }

   await Bun.write(info.targetPath + "/package.json", JSON.stringify(data, null, 3));
}