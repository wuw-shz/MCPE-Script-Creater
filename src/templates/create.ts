export async function createTemplate(info: Info): Promise<void> {
   switch (info.template) {
      case 'Typescript': {
         await import('./Typescript/create').then(async (module) => {
            await module.create(info)
         })
         break
      }
      case 'Javascript': {
         await import('./Javascript/create').then(async (module) => {
            await module.create(info)
         })
         break
      }
   }
}