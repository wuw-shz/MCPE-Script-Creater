export {};

declare global {
   interface Info {
      template: 'Typescript' | 'Javascript',
      targetPath: string,
      minecraftNPMVersions: {
         "@minecraft/server-ui": string;
         "@minecraft/server": string;
      },
      name: string,
      description: string,
      minecraftVersion: [number, number, number],
      minecraftModuleVersions: {
         "@minecraft/server-ui": string;
         "@minecraft/server": string;
      }
   }
}