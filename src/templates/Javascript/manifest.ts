export async function create(info: Info): Promise<void> {
   const data = {
      "format_version": 2,
      "header": {
         "name": info.name,
         "description": info.description,
         "min_engine_version": info.minecraftVersion,
         "uuid": crypto.randomUUID(),
         "version": [
            1,
            0,
            0
         ]
      },
      "modules": [
         {
            "type": "data",
            "uuid": crypto.randomUUID(),
            "version": [
               1,
               0,
               0
            ]
         },
         {
            "type": "script",
            "language": "javascript",
            "uuid": crypto.randomUUID(),
            "entry": "scripts/index.js",
            "version": [
               1,
               0,
               0
            ]
         }
      ],
      "dependencies": [
         {
            "module_name": "@minecraft/server",
            "version": info.minecraftModuleVersions["@minecraft/server"]
         },
         {
            "module_name": "@minecraft/server-ui",
            "version": info.minecraftModuleVersions["@minecraft/server-ui"]
         }
      ]
   }

   await Bun.write(info.targetPath + "/manifest.json", JSON.stringify(data, null, 3));
}