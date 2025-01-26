export async function create(info: Info
): Promise<void> {
   try {
      await Promise.all(
         [
            await import("./package.ts"),
            await import("./manifest.ts"),
            await import("./scripts/index.ts"),
         ].map(
            (module, index) => {
               if (typeof module.create !== "function") {
                  throw new Error(`The module at index '${index}' does not export a default function.`);
               }

               return module.create(info);
            }
         )
      );
   } catch (error) {
      console.error("An error occurred while creating files:", error);
      throw error;
   }
}
