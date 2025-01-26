export async function create(info: Info): Promise<void> {
   const data = `
import { world } from "@minecraft/server";

world.afterEvents.worldInitialize.subscribe(() => {
   world.sendMessage("Hello World!")
})
`.trim();

   await Bun.write(info.targetPath + "/scripts/index.js", data);
}